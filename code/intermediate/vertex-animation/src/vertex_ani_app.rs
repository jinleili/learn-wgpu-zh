use crate::{TurningDynamicUniform, particle_ink::ParticleInk, resource};
use app_surface::{AppSurface, SurfaceFrame};
use core::f32::consts::FRAC_PI_2;
use std::sync::Arc;
use utils::{
    AnyTexture, BufferObj, MVPMatUniform, Plane, WgpuAppAction,
    node::{BindGroupData, BufferlessFullscreenNode, ViewNode, ViewNodeBuilder},
    vertex::PosTex,
};
use wgpu::Sampler;
use winit::dpi::PhysicalSize;

pub struct VertexAnimationApp {
    app: AppSurface,
    // 窗口大小
    size: PhysicalSize<u32>,
    size_changed: bool,
    // 背景图节点
    bg_node: BufferlessFullscreenNode,
    // 翻页动画节点
    turning_node: ViewNode,
    // 粒子动画节点
    particle_ink: Option<ParticleInk>,
    mvp_buffer: BufferObj,
    paper_tex: AnyTexture,
    sampler: Sampler,
    // 深度纹理（视图）
    depth_tex_view: Option<wgpu::TextureView>,
    // 当前是否为粒子动画阶段
    is_particle_ink_phase: bool,
    // 当前动画帧的索引，用于设置缓冲区的动态偏移
    animate_index: u32,
    draw_count: u32,
}

impl WgpuAppAction for VertexAnimationApp {
    async fn new(window: Arc<winit::window::Window>) -> Self {
        // 创建 wgpu 应用
        let mut app = AppSurface::new(window).await;

        // 兼容 web
        let format = app.config.format.remove_srgb_suffix();
        app.ctx.update_config_format(format);

        let fovy: f32 = 45.0_f32.to_radians();
        let (p_matrix, mv_matrix) = utils::matrix_helper::perspective_fullscreen_mvp(
            glam::Vec2 {
                x: app.config.width as f32,
                y: app.config.height as f32,
            },
            fovy,
        );
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
        let (vertices, indices) = Plane::new(300, 300).generate_vertices();

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

        let size = PhysicalSize::new(app.config.width, app.config.height);

        Self {
            app,
            size,
            size_changed: true,
            bg_node,
            turning_node,
            particle_ink: None,
            mvp_buffer,
            paper_tex,
            sampler,
            depth_tex_view: None,
            is_particle_ink_phase: true,
            animate_index: 0,
            draw_count: draw_count as u32,
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

        if self.depth_tex_view.is_none() {
            return Ok(());
        }
        let particle_ink = self.particle_ink.as_mut().unwrap();
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
            particle_ink.cal_particles_move(&mut encoder);
        }
        {
            let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: None,
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &frame_view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(utils::unpack_u32_to_color(0xf2eaddff)),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: self.depth_tex_view.as_ref().unwrap(),
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
                let is_completed = particle_ink.enter_frame(&mut rpass);
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
        self.app.queue.submit(Some(encoder.finish()));
        output.present();

        Ok(())
    }
}

impl VertexAnimationApp {
    /// 必要的时候调整 surface 大小
    fn resize_surface_if_needed(&mut self) {
        if self.size_changed {
            //  需先 resize surface
            self.app
                .resize_surface_by_size((self.size.width, self.size.height));

            // 更新 uniform buffer
            let (p_matrix, mv_matrix) = utils::matrix_helper::perspective_fullscreen_mvp(
                glam::Vec2 {
                    x: self.app.config.width as f32,
                    y: self.app.config.height as f32,
                },
                45.0_f32.to_radians(),
            );
            let mvp_data = (p_matrix * mv_matrix).to_cols_array_2d();
            self.app
                .queue
                .write_buffer(&self.mvp_buffer.buffer, 0, bytemuck::bytes_of(&mvp_data));

            // 重算深度纹理与粒子节点
            self.depth_tex_view = Some(crate::create_depth_tex(&self.app));
            self.particle_ink = Some(ParticleInk::new(
                &self.app,
                &self.mvp_buffer,
                &self.paper_tex,
                &self.sampler,
            ));
            self.is_particle_ink_phase = true;

            self.size_changed = false;
        }
    }

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
        let half_circle = core::f32::consts::PI * radius;
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
