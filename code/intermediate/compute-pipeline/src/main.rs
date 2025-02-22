use app_surface::{AppSurface, SurfaceFrame};
use std::sync::Arc;
use utils::framework::{WgpuAppAction, run};
use wgpu::{TextureUsages, TextureView};
use winit::dpi::PhysicalSize;

mod blur_node;
mod image_node;
mod resource;
use blur_node::BlurNode;
use image_node::ImageNode;

const SWAP_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Rgba8Unorm;

struct WgpuApp {
    app: AppSurface,
    size: PhysicalSize<u32>,
    size_changed: bool,
    blur_x: BlurNode,
    blur_y: BlurNode,
    blur_xy_tv: TextureView,
    reset_node: ImageNode,
    display_node: ImageNode,
    frame_count: u64,
}

impl WgpuApp {
    /// 必要的时候调整 surface 大小
    fn resize_surface_if_needed(&mut self) {
        if self.size_changed {
            self.app
                .resize_surface_by_size((self.size.width, self.size.height));

            self.size_changed = false;
        }
    }
}

impl WgpuAppAction for WgpuApp {
    async fn new(window: Arc<winit::window::Window>) -> Self {
        // 创建 wgpu 应用
        let app = AppSurface::new(window).await;

        let (tex, size) = resource::load_a_texture(&app);
        let original_tv = tex.create_view(&wgpu::TextureViewDescriptor {
            format: Some(SWAP_FORMAT),
            ..Default::default()
        });

        // 使用缩小的纹理来实现模糊，不但能降低 GPU 负载，还能让模糊的效果更好。
        let swap_size = wgpu::Extent3d {
            width: size.width / 2,
            height: size.height / 2,
            depth_or_array_layers: 1,
        };
        let usage = TextureUsages::STORAGE_BINDING | TextureUsages::TEXTURE_BINDING;

        let get_a_tv = |usage: wgpu::TextureUsages| {
            let tex = app.device.create_texture(&wgpu::TextureDescriptor {
                label: None,
                size: swap_size,
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: SWAP_FORMAT,
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
            "fs_main", //"fs_srgb_to_linear",
            SWAP_FORMAT,
        );
        let display_node = ImageNode::new(
            &app,
            &blur_xy_tv,
            &sampler,
            &render_shader,
            "fs_main",
            app.config.format.remove_srgb_suffix(),
        );

        let size = PhysicalSize::new(app.config.width, app.config.height);

        Self {
            app,
            size,
            size_changed: false,
            blur_x,
            blur_y,
            blur_xy_tv,
            reset_node,
            display_node,
            frame_count: 0,
        }
    }

    fn set_window_resized(&mut self, new_size: PhysicalSize<u32>) {
        if self.app.config.width == new_size.width && self.app.config.height == new_size.height {
            return;
        }
        self.size = new_size;
        self.size_changed = true;
    }

    fn get_size(&self) -> PhysicalSize<u32> {
        PhysicalSize::new(self.app.config.width, self.app.config.height)
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        self.resize_surface_if_needed();

        // 此处与其它示例不同，主动使用了非 sRGB 格式的纹理视图
        // 使用 remove_srgb_suffix 之后的线性纹理格式，避免手动做 gamma 运算
        let (output, view) = self
            .app
            .get_current_frame_view(Some(self.app.config.format.remove_srgb_suffix()));

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

        self.app.queue.submit(Some(encoder.finish()));
        output.present();

        self.frame_count += 1;
        Ok(())
    }
}

pub fn main() -> Result<(), impl std::error::Error> {
    run::<WgpuApp>("compute-pipeline")
}
