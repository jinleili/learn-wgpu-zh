use app_surface::{AppSurface, SurfaceFrame};
use std::sync::Arc;
use utils::framework::{WgpuAppAction, run};
use winit::dpi::PhysicalSize;

struct WgpuApp {
    app: AppSurface,
    size: PhysicalSize<u32>,
    size_changed: bool,
    // NEW!
    render_pipeline: wgpu::RenderPipeline,
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

        // 创建着色器
        let shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: Some("Shader"),
                source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
            });

        let render_pipeline_layout =
            app.device
                .create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                    label: Some("Render Pipeline Layout"),
                    bind_group_layouts: &[],
                    push_constant_ranges: &[],
                });

        let render_pipeline = app
            .device
            .create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some("Render Pipeline"),
                layout: Some(&render_pipeline_layout),
                vertex: wgpu::VertexState {
                    module: &shader,
                    entry_point: Some("vs_main"),
                    compilation_options: Default::default(),
                    buffers: &[],
                },
                fragment: Some(wgpu::FragmentState {
                    module: &shader,
                    entry_point: Some("fs_main"),
                    compilation_options: Default::default(),
                    targets: &[Some(wgpu::ColorTargetState {
                        format: app.config.format.add_srgb_suffix(),
                        blend: Some(wgpu::BlendState {
                            color: wgpu::BlendComponent::REPLACE,
                            alpha: wgpu::BlendComponent::REPLACE,
                        }),
                        write_mask: wgpu::ColorWrites::ALL,
                    })],
                }),
                primitive: wgpu::PrimitiveState {
                    topology: wgpu::PrimitiveTopology::TriangleList,
                    strip_index_format: None,
                    front_face: wgpu::FrontFace::Ccw,
                    cull_mode: Some(wgpu::Face::Back),
                    polygon_mode: wgpu::PolygonMode::Fill,
                    // Requires Features::DEPTH_CLIP_CONTROL
                    unclipped_depth: false,
                    // Requires Features::CONSERVATIVE_RASTERIZATION
                    conservative: false,
                },
                depth_stencil: None,
                multisample: wgpu::MultisampleState {
                    count: 1,
                    mask: !0,
                    alpha_to_coverage_enabled: false,
                },
                // If the pipeline will be used with a multiview render pass, this
                // indicates how many array layers the attachments will have.
                multiview: None,
                cache: None,
            });

        let size = PhysicalSize {
            width: app.config.width,
            height: app.config.height,
        };

        Self {
            app,
            size,
            size_changed: false,
            render_pipeline,
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

        let (output, view) = self.app.get_current_frame_view(None);
        let mut encoder = self
            .app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.1,
                            g: 0.2,
                            b: 0.3,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                ..Default::default()
            });

            render_pass.set_pipeline(&self.render_pipeline);
            render_pass.draw(0..3, 0..1);
        }

        self.app.queue.submit(Some(encoder.finish()));
        output.present();

        Ok(())
    }
}

pub fn main() -> Result<(), impl std::error::Error> {
    run::<WgpuApp>("tutorial3-pipeline")
}
