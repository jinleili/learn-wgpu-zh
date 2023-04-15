use app_surface::{AppSurface, SurfaceFrame};
use std::iter;
use wgpu::{TextureUsages, TextureView};
use winit::{dpi::PhysicalSize, window::WindowId};

#[path = "../../../framework.rs"]
mod framework;
use framework::{run, Action};

mod blur_node;
mod image_node;
mod resource;
use blur_node::BlurNode;
use image_node::ImageNode;

struct State {
    app: AppSurface,
    blur_x: BlurNode,
    blur_y: BlurNode,
    blur_xy_tv: TextureView,
    reset_node: ImageNode,
    display_node: ImageNode,
    frame_count: u64,
}

impl Action for State {
    fn new(app: AppSurface) -> Self {
        let mut app = app;
        // 使用线性纹理格式，避免手动做 gamma 运算
        // Bgra8Unorm 的兼容性最好，是全平台支持的格式
        app.sdq
            .update_config_format(wgpu::TextureFormat::Bgra8Unorm);

        let _format = wgpu::TextureFormat::Rgba8UnormSrgb;
        let (tex, size) = resource::load_a_texture(&app);
        let original_tv = tex.create_view(&wgpu::TextureViewDescriptor::default());

        // 使用缩小的纹理来实现模糊，不但能降低 GPU 负载，还能让模糊的效果更好。
        let swap_size = wgpu::Extent3d {
            width: size.width / 2,
            height: size.height / 2,
            depth_or_array_layers: 1,
        };
        let swap_format = wgpu::TextureFormat::Rgba8Unorm;
        let usage = TextureUsages::STORAGE_BINDING | TextureUsages::TEXTURE_BINDING;

        let get_a_tv = |usage: wgpu::TextureUsages| {
            let tex = app.device.create_texture(&wgpu::TextureDescriptor {
                label: None,
                size: swap_size,
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: swap_format,
                usage,
                view_formats: &[],
            });
            tex.create_view(&wgpu::TextureViewDescriptor::default())
        };
        let blur_xy_tv = get_a_tv(usage | TextureUsages::RENDER_ATTACHMENT);
        let swap_x_tv = get_a_tv(usage);

        // 双线性采样
        let sampler = app.device.create_sampler(&wgpu::SamplerDescriptor {
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            mipmap_filter: wgpu::FilterMode::Nearest,
            ..Default::default()
        });

        let (blur_shader, render_shader) = {
            let create_shader = |wgsl: &'static str| -> wgpu::ShaderModule {
                app.device
                    .create_shader_module(wgpu::ShaderModuleDescriptor {
                        label: None,
                        source: wgpu::ShaderSource::Wgsl(wgsl.into()),
                    })
            };
            (
                create_shader(include_str!("../assets/blur.wgsl")),
                create_shader(include_str!("../assets/draw.wgsl")),
            )
        };

        let img_size = [swap_size.width as i32, swap_size.height as i32];
        // 计算工作组大小
        let workgroup_count = ((swap_size.width + 15) / 16, (swap_size.height + 15) / 16);

        let blur_x = BlurNode::new(
            &app,
            [img_size, [1, 0]],
            &blur_xy_tv,
            &swap_x_tv,
            &blur_shader,
            workgroup_count,
        );
        let blur_y = BlurNode::new(
            &app,
            [img_size, [0, 1]],
            &swap_x_tv,
            &blur_xy_tv,
            &blur_shader,
            workgroup_count,
        );
        // 在 WebGPU 标准中，我们可以利用 viewFormats 来直接将 sRGB 格式重新解释为线性格式
        // 我已经给 wgpu 提交了相关 PR: https://github.com/gfx-rs/wgpu/pull/3237
        // 如果被接受的话，就可以移除 fs_srgb_to_linear 直接重用 fs_main 了
        let reset_node = ImageNode::new(
            &app,
            &original_tv,
            &sampler,
            &render_shader,
            "fs_srgb_to_linear",
            swap_format,
        );
        let display_node = ImageNode::new(
            &app,
            &blur_xy_tv,
            &sampler,
            &render_shader,
            "fs_main",
            app.config.format,
        );

        Self {
            app,
            blur_x,
            blur_y,
            blur_xy_tv,
            reset_node,
            display_node,
            frame_count: 0,
        }
    }

    fn get_adapter_info(&self) -> wgpu::AdapterInfo {
        self.app.adapter.get_info()
    }
    fn current_window_id(&self) -> WindowId {
        self.app.view.id()
    }
    fn resize(&mut self, size: &PhysicalSize<u32>) {
        if self.app.config.width == size.width && self.app.config.height == size.height {
            return;
        }
        self.app.resize_surface();
    }
    fn request_redraw(&mut self) {
        self.app.view.request_redraw();
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let output = self.app.surface.get_current_texture().unwrap();
        // 此处与其它示例不同，使用了非 sRGB 格式的纹理视图
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });
        // 每 600 帧重置为初始状态
        if self.frame_count % 600 == 0 {
            self.reset_node.draw(&mut encoder, &self.blur_xy_tv);
        }

        // 减慢模糊的迭代速度
        if self.frame_count % 20 == 0 {
            // 执行模糊运算
            let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor::default());
            self.blur_x.dispatch(&mut cpass);
            self.blur_y.dispatch(&mut cpass);
        }

        // 绘制到 framebuffer
        self.display_node.draw(&mut encoder, &view);

        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

        self.frame_count += 1;
        Ok(())
    }
}

pub fn main() {
    run::<State>(Some(1.6));
}
