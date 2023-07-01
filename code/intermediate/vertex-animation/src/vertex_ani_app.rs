use crate::{resource, TurningDynamicUniform};
use app_surface::{AppSurface, SurfaceFrame};
use std::f32::consts::FRAC_PI_2;
use std::iter;
use winit::{dpi::PhysicalSize, window::WindowId};

use utils::{
    framework::Action,
    node::{BindGroupData, ViewNode, ViewNodeBuilder},
    vertex::PosTex,
    BufferObj, MVPMatUniform, Plane,
};

pub struct VertexAnimationApp {
    app: AppSurface,
    turning_node: ViewNode,
    depth_tex_view: wgpu::TextureView,
    animate_index: u32,
    pub draw_count: u32,
}

impl Action for VertexAnimationApp {
    fn new(app: AppSurface) -> Self {
        let (p_matrix, mv_matrix) =
            utils::matrix_helper::perspective_fullscreen_mvp((&app.config).into());
        let mvp_buffer = BufferObj::create_uniform_buffer(
            &app.device,
            &MVPMatUniform {
                mvp: (p_matrix * mv_matrix).to_cols_array_2d(),
            },
            Some("MVPMatUniform"),
        );
        // 翻页动作总帧总
        let draw_count = 60 * 3;
        let offset_buffer_size = 256;
        let turning_buf = BufferObj::create_empty_uniform_buffer(
            &app.device,
            (draw_count * offset_buffer_size) as wgpu::BufferAddress,
            offset_buffer_size,
            true,
            Some("dynamic turning buffer"),
        );

        let start_pos = glam::Vec2::new(1.0, 0.0);
        //  从右往左下角翻页
        let target_pos = glam::Vec2::new(-5.8, 2.5);
        let gap_pos = target_pos - start_pos;

        // 填充 uniform 动态缓冲区
        for step in 1..=draw_count {
            let radius = 1.0 / 8.0;
            let data = Self::step_turning_data(radius, step as u32, draw_count as u32, gap_pos);
            app.queue.write_buffer(
                &turning_buf.buffer,
                offset_buffer_size * (step - 1),
                bytemuck::bytes_of(&data),
            );
        }

        // 平面网格
        let w = app.config.width as f32;
        let h = app.config.height as f32;
        let (vertices, indices) = Plane::new(
            (w / (app.scale_factor * 2.0)) as u32,
            (h / (app.scale_factor * 2.0)) as u32,
        )
        .generate_vertices();

        // 加载纸张纹理
        let paper_tex = resource::load_a_texture(&app);
        let sampler = app
            .device
            .create_sampler(&wgpu::SamplerDescriptor::default());

        let bg_data = BindGroupData {
            uniforms: vec![&mvp_buffer],
            inout_tv: vec![(&paper_tex, None)],
            samplers: vec![&sampler],
            visibilitys: vec![
                wgpu::ShaderStages::VERTEX,
                wgpu::ShaderStages::FRAGMENT,
                wgpu::ShaderStages::FRAGMENT,
            ],
            // 配置动态缓冲区
            dynamic_uniforms: vec![&turning_buf],
            dynamic_uniform_visibilitys: vec![
                wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
            ],
            ..Default::default()
        };
        let turning_shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: None,
                source: wgpu::ShaderSource::Wgsl(
                    include_str!("../assets/page_turning.wgsl").into(),
                ),
            });
        let builder = ViewNodeBuilder::<PosTex>::new(bg_data, &turning_shader)
            .with_vertices_and_indices((vertices, indices))
            .with_use_depth_stencil(true)
            .with_cull_mode(None);

        let turning_node = builder.build(&app.device);
        let depth_tex_view = crate::create_depth_tex(&app);

        Self {
            app,
            turning_node,
            depth_tex_view,
            animate_index: 0,
            draw_count: draw_count as u32,
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
        self.depth_tex_view = crate::create_depth_tex(&self.app);
    }

    fn request_redraw(&mut self) {
        self.app.view.request_redraw();
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        // instance 0 只绘制 paper, instance 1 计算 turning
        let instance_count: u32 = 2;

        let output = self.app.surface.get_current_texture().unwrap();
        let frame_view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());
        let mut encoder = self
            .app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });
        {
            let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: None,
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &frame_view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(utils::unpack_u32_to_color(0xf2eaddff)),
                        store: true,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: &self.depth_tex_view,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: true,
                    }),
                    stencil_ops: None,
                }),
            });
            self.turning_node
                .draw_rpass_by_offset(&mut rpass, self.animate_index, instance_count);
        }
        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

        // 循环播放
        self.animate_index += 1;
        if self.animate_index == self.draw_count {
            self.animate_index = 0;
        }

        Ok(())
    }
}

impl VertexAnimationApp {
    fn step_turning_data(
        radius: f32,
        step: u32,
        draw_count: u32,
        gap_pos: glam::Vec2,
    ) -> TurningDynamicUniform {
        // 由慢到快的缓动效果
        let step = 1.0 - (FRAC_PI_2 * (step as f32 / draw_count as f32)).cos();
        let step_pos = gap_pos * step;
        let (dx, dy) = (-step_pos.x, -step_pos.y);

        let distance = (dx * dx + dy * dy).sqrt();
        let half_circle = std::f32::consts::PI * radius;
        let pi_2 = FRAC_PI_2;

        let angle = -dy.atan2(dx);
        let sin_a = angle.sin();
        let cos_a = angle.cos();
        // 最大可卷起距离
        let mut max_roll = 0.0;
        if angle < pi_2 && angle > (-pi_2) {
            max_roll = (cos_a * (2.0 * 2.0)).abs();
        }

        // 实际的卷起距离
        let mut roll_length = distance;
        if distance > half_circle {
            roll_length = (distance - half_circle) / 2.0 + half_circle;
        }
        if roll_length > max_roll {
            roll_length = max_roll;
        }
        let np = [
            0.5 - (cos_a * roll_length).abs(),
            0.5 * (if angle > 0.0 { 1.0 } else { -1.0 }) - sin_a * roll_length,
        ];
        TurningDynamicUniform {
            radius,
            angle,
            np,
            n: [cos_a, sin_a],
        }
    }
}
