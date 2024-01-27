use crate::{particle_ink::ParticleInk, resource, TurningDynamicUniform};
use app_surface::{AppSurface, SurfaceFrame};
use std::f32::consts::FRAC_PI_2;
use std::iter;
use wgpu::Sampler;
use winit::{dpi::PhysicalSize, window::WindowId};

use utils::{
    framework::Action,
    node::{BindGroupData, BufferlessFullscreenNode, ViewNode, ViewNodeBuilder},
    vertex::PosTex,
    AnyTexture, BufferObj, MVPMatUniform, Plane,
};

pub struct VertexAnimationApp {
    app: AppSurface,
    // 背景图节点
    bg_node: BufferlessFullscreenNode,
    // 翻页动画节点
    turning_node: ViewNode,
    // 粒子动画节点
    particle_ink: ParticleInk,
    mvp_buffer: BufferObj,
    paper_tex: AnyTexture,
    sampler: Sampler,
    // 深度纹理（视图）
    depth_tex_view: wgpu::TextureView,
    // 当前是否为粒子动画阶段
    is_particle_ink_phase: bool,
    // 当前动画帧的索引，用于设置缓冲区的动态偏移
    animate_index: u32,
    draw_count: u32,
}

impl Action for VertexAnimationApp {
    fn new(app: AppSurface) -> Self {
        let mut app = app;
        // 兼容 web
        let format = app.config.format.remove_srgb_suffix();
        app.sdq.update_config_format(format);

        let (p_matrix, mv_matrix) = utils::matrix_helper::perspective_fullscreen_mvp(glam::Vec2 {
            x: app.config.width as f32,
            y: app.config.height as f32,
        });
        let mvp_buffer = BufferObj::create_uniform_buffer(
            &app.device,
            &MVPMatUniform {
                mvp: (p_matrix * mv_matrix).to_cols_array_2d(),
            },
            Some("MVPMatUniform"),
        );

        // 加载纸张纹理
        let bg_data = include_bytes!("../assets/bg.png");
        let bg_tex = resource::load_a_texture(&app, bg_data);
        let paper_data = include_bytes!("../assets/fu.png");
        let paper_tex = resource::load_a_texture(&app, paper_data);

        let sampler = utils::bilinear_sampler(&app.device);
        // 着色器
        let (turning_shader, bg_shader) = {
            let create_shader = |wgsl: &'static str| -> wgpu::ShaderModule {
                app.device
                    .create_shader_module(wgpu::ShaderModuleDescriptor {
                        label: None,
                        source: wgpu::ShaderSource::Wgsl(wgsl.into()),
                    })
            };
            (
                create_shader(include_str!("../assets/page_turning.wgsl")),
                create_shader(include_str!("../assets/bg_draw.wgsl")),
            )
        };

        // 翻页动作总帧总
        let draw_count = 60 * 3;
        let offset_buffer_size = 256;
        let turning_buf = BufferObj::create_empty_uniform_buffer(
            &app.device,
            (draw_count * offset_buffer_size) as wgpu::BufferAddress,
            offset_buffer_size,
            true,
            Some("翻页动画的动态偏移缓冲区"),
        );

        let start_pos = glam::Vec2::new(1.0, 0.0);
        //  从右往左下角翻页
        let target_pos = glam::Vec2::new(-5.8, 2.5);
        let gap_pos = target_pos - start_pos;

        // 按动态偏移量填充 uniform 缓冲区
        for step in 0..draw_count {
            let radius = 1.0 / 8.0;
            let data = Self::step_turning_data(radius, step as u32, draw_count as u32, gap_pos);
            app.queue.write_buffer(
                &turning_buf.buffer,
                offset_buffer_size * (step),
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

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![&mvp_buffer],
            inout_tv: vec![(&paper_tex, None)],
            samplers: vec![&sampler],
            visibilitys: vec![
                wgpu::ShaderStages::VERTEX,
                wgpu::ShaderStages::FRAGMENT,
                wgpu::ShaderStages::FRAGMENT,
            ],
            // 配置动态偏移缓冲区
            dynamic_uniforms: vec![&turning_buf],
            dynamic_uniform_visibilitys: vec![
                wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
            ],
            ..Default::default()
        };

        let builder = ViewNodeBuilder::<PosTex>::new(bind_group_data, &turning_shader)
            .with_vertices_and_indices((vertices, indices))
            .with_use_depth_stencil(true)
            .with_cull_mode(None)
            .with_color_format(format);
        let turning_node = builder.build(&app.device);

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            inout_tv: vec![(&bg_tex, None)],
            samplers: vec![&sampler],
            visibilitys: vec![wgpu::ShaderStages::FRAGMENT, wgpu::ShaderStages::FRAGMENT],
            ..Default::default()
        };
        let bg_node = BufferlessFullscreenNode::new(
            &app.device,
            format,
            &bind_group_data,
            &bg_shader,
            None,
            1,
        );

        let particle_ink = ParticleInk::new(&app, &mvp_buffer, &paper_tex, &sampler);
        let depth_tex_view = crate::create_depth_tex(&app);

        Self {
            app,
            bg_node,
            turning_node,
            particle_ink,
            mvp_buffer,
            paper_tex,
            sampler,
            depth_tex_view,
            is_particle_ink_phase: true,
            animate_index: 0,
            draw_count: draw_count as u32,
        }
    }

    fn start(&mut self) {
        //  只有在进入事件循环之后，才有可能真正获取到窗口大小。
        let size = self.app.get_view().inner_size();
        self.resize(&size);
    }

    fn get_adapter_info(&self) -> wgpu::AdapterInfo {
        self.app.adapter.get_info()
    }

    fn current_window_id(&self) -> WindowId {
        self.app.get_view().id()
    }

    fn resize(&mut self, size: &PhysicalSize<u32>) {
        if self.app.config.width == size.width && self.app.config.height == size.height {
            return;
        }
        self.app.resize_surface();
        self.depth_tex_view = crate::create_depth_tex(&self.app);
        self.particle_ink =
            ParticleInk::new(&self.app, &self.mvp_buffer, &self.paper_tex, &self.sampler);
        self.is_particle_ink_phase = true;
    }

    fn request_redraw(&mut self) {
        self.app.get_view().request_redraw();
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
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
        if self.is_particle_ink_phase {
            self.particle_ink.cal_particles_move(&mut encoder);
        }
        {
            let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: None,
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &frame_view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(utils::unpack_u32_to_color(0xf2eaddff)),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: &self.depth_tex_view,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: wgpu::StoreOp::Store,
                    }),
                    stencil_ops: None,
                }),
                ..Default::default()
            });
            self.bg_node.draw_by_pass(&mut rpass);

            if self.is_particle_ink_phase {
                // 执行粒子动画
                let is_completed = self.particle_ink.enter_frame(&mut rpass);
                if is_completed {
                    self.is_particle_ink_phase = false;
                }
            } else {
                // 执行翻页动画
                self.turning_node
                    .draw_rpass_by_offset(&mut rpass, self.animate_index, 1);
                // 循环执行动画
                self.animate_index += 1;
                if self.animate_index == self.draw_count {
                    // 本次翻页动画完成，重置状态
                    self.animate_index = 0;
                    self.is_particle_ink_phase = true
                }
            }
        }
        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

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
        if step == 0 {
            return TurningDynamicUniform {
                radius,
                angle: 0.0,
                np: [0.0; 2],
                n: [0.0; 2],
            };
        }
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
