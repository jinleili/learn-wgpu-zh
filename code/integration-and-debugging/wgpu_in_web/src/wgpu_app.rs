use crate::{particle_gen::ParticleGen, particle_ink::ParticleInk};
use app_surface::{AppSurface, SurfaceFrame};
use glam::{uvec2, UVec2, Vec2};
use std::iter;

pub struct WgpuApp {
    app: AppSurface,
    size: UVec2,
    size_changed: bool,

    /// 粒子生成器
    gen_node: ParticleGen,
    /// 粒子效果
    particle_ink: ParticleInk,
}

impl WgpuApp {
    pub async fn new(app: AppSurface) -> Self {
        let size = uvec2(app.config.width, app.config.height);

        let gen_node = ParticleGen::new(&app, 45.0_f32.to_radians()).await;

        let particle_ink = ParticleInk::new(&app, &gen_node);

        Self {
            app,
            size,
            size_changed: false,
            gen_node,
            particle_ink,
        }
    }

    /// 必要的时候调整 surface 大小
    fn resize_surface_if_needed(&mut self) {
        if self.size_changed {
            self.app.resize_surface_by_size((self.size.x, self.size.y));

            self.particle_ink = ParticleInk::new(&self.app, &self.gen_node);

            self.size_changed = false;
        }
    }

    pub fn set_window_resized(&mut self, new_size: UVec2) {
        self.size = new_size;
        self.size_changed = true;
    }

    pub fn get_size(&self) -> UVec2 {
        uvec2(self.app.config.width, self.app.config.height)
    }

    pub fn cursor_moved(&mut self, cursor_pos: Vec2) {
        let mut cursor_pos = cursor_pos;
        // 翻转 y 坐标
        cursor_pos.y = self.app.config.height as f32 - cursor_pos.y;
        self.particle_ink.cursor_moved(&self.app, cursor_pos);
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        self.resize_surface_if_needed();

        let format = self.app.config.format;
        let (output, view) = self.app.get_current_frame_view(Some(format));
        let mut encoder = self
            .app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        self.particle_ink.cal_particles_move(&mut encoder);

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.9,
                            g: 0.9,
                            b: 0.9,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: &self.particle_ink.depth_tex,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: wgpu::StoreOp::Store,
                    }),
                    stencil_ops: None,
                }),
                ..Default::default()
            });

            self.particle_ink
                .enter_frame(&self.gen_node, &mut render_pass);
        }

        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}
