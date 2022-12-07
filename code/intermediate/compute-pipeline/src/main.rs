use app_surface::{AppSurface, SurfaceFrame};
use std::iter;
use winit::window::WindowId;

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
    reset_node: ImageNode,
    display_node: ImageNode,
    swap_view: Vec<wgpu::TextureView>,
    frame_count: u64,
}

impl Action for State {
    fn new(app: AppSurface) -> Self {
        let _format = wgpu::TextureFormat::Rgba8UnormSrgb;
        let (tex, size) = resource::load_a_texture(&app);
        let tv = tex.create_view(&wgpu::TextureViewDescriptor::default());

        // 使用缩小的纹理来实现模糊，不但能降低 GPU 负载，还能让模糊的效果更好。
        let swap_size = wgpu::Extent3d {
            width: size.width / 2,
            height: size.height / 2,
            depth_or_array_layers: 1,
        };
        let swap_format = wgpu::TextureFormat::Rgba8Unorm;

        let mut swap_view = vec![];
        let usage = wgpu::TextureUsages::STORAGE_BINDING | wgpu::TextureUsages::TEXTURE_BINDING;
        for i in 0..2 {
            let tex = app.device.create_texture(&wgpu::TextureDescriptor {
                label: None,
                size: swap_size,
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: swap_format,
                usage: if i == 0 {
                    usage | wgpu::TextureUsages::RENDER_ATTACHMENT
                } else {
                    usage
                },
            });
            swap_view.push(tex.create_view(&wgpu::TextureViewDescriptor::default()));
        }

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
        let workgroups = ((swap_size.width + 15) / 16, (swap_size.height + 15) / 16);

        let blur_x = BlurNode::new(
            &app,
            [img_size, [1, 0]],
            &swap_view[0],
            &swap_view[1],
            &blur_shader,
            workgroups,
        );
        let blur_y = BlurNode::new(
            &app,
            [img_size, [0, 1]],
            &swap_view[1],
            &swap_view[0],
            &blur_shader,
            workgroups,
        );
        let reset_node = ImageNode::new(&app, &tv, &sampler, &render_shader, swap_format);
        let display_node = ImageNode::new(
            &app,
            &swap_view[0],
            &sampler,
            &render_shader,
            app.config.format,
        );

        Self {
            app,
            blur_x,
            blur_y,
            reset_node,
            display_node,
            swap_view,
            frame_count: 0,
        }
    }

    fn get_adapter_info(&self) -> wgpu::AdapterInfo {
        self.app.adapter.get_info()
    }
    fn current_window_id(&self) -> WindowId {
        self.app.view.id()
    }
    fn resize(&mut self) {
        self.app.resize_surface();
    }
    fn request_redraw(&mut self) {
        self.app.view.request_redraw();
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let (output, view) = self.app.get_current_frame_view();
        let mut encoder = self
            .app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        // 每 600 帧重置为初始状态
        if self.frame_count % 600 == 0 {
            self.reset_node.draw(&mut encoder, &self.swap_view[0]);
            log::warn!("self.frame_count: {}", self.frame_count);
        }

        // 减慢模糊的迭代速度
        if self.frame_count % 15 == 0 {
            // 执行模糊运算
            let mut cpass =
                encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: None });
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
    run::<State>();
}
