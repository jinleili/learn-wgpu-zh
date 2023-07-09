use app_surface::{AppSurface, SurfaceFrame};
use std::iter;
use wgpu::VertexBufferLayout;
use winit::{dpi::PhysicalSize, window::WindowId};

use utils::{
    framework::Action,
    node::{BindGroupData, ViewNode, ViewNodeBuilder},
    vertex::PosOnly,
    BufferObj, MVPMatUniform,
};

use crate::hilbert_curve::HilbertCurve;

pub struct HilbertCurveApp {
    app: AppSurface,
    display_node: ViewNode,
    // 当前曲线与目标曲线的顶点缓冲区
    vertex_buffers: Vec<wgpu::Buffer>,
    // 当前曲线的顶点总数
    curve_vertex_count: usize,
    // 当前动画帧的索引，用于设置缓冲区的动态偏移
    animate_index: u32,
    // 每一个动画阶段的总帧数
    draw_count: u32,
    // 目标曲线维度
    curve_dimention: u32,
    // 是否为升维动画
    is_animation_up: bool,
}

impl Action for HilbertCurveApp {
    fn new(app: AppSurface) -> Self {
        let mut app = app;
        // 兼容 web
        let format = app.config.format.remove_srgb_suffix();
        app.sdq.update_config_format(format);

        // 投影
        let (p_matrix, mv_matrix, _) = utils::matrix_helper::perspective_mvp((&app.config).into());
        let mvp_buffer = BufferObj::create_uniform_buffer(
            &app.device,
            &MVPMatUniform {
                mvp: (p_matrix * mv_matrix).to_cols_array_2d(),
            },
            Some("MVPMatUniform"),
        );

        // 着色器
        let shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: Some("hilbert shader"),
                source: wgpu::ShaderSource::Wgsl(include_str!("../assets/hilbert.wgsl").into()),
            });

        // 动作总帧总
        let draw_count = 60 * 3;
        let offset_buffer_size = 256;
        let hilbert_buf = BufferObj::create_empty_uniform_buffer(
            &app.device,
            (draw_count * offset_buffer_size) as wgpu::BufferAddress,
            offset_buffer_size,
            true,
            Some("动画的动态偏移缓冲区"),
        );
        // 按动态偏移量填充 uniform 缓冲区
        for step in 0..draw_count {
            let uniform = crate::HilbertUniform {
                near_target_ratio: step as f32 / (draw_count - 1) as f32,
            };
            app.queue.write_buffer(
                &hilbert_buf.buffer,
                offset_buffer_size * (step),
                bytemuck::bytes_of(&uniform),
            );
        }

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![&mvp_buffer],
            visibilitys: vec![wgpu::ShaderStages::VERTEX],
            // 配置动态偏移缓冲区
            dynamic_uniforms: vec![&hilbert_buf],
            dynamic_uniform_visibilitys: vec![wgpu::ShaderStages::VERTEX],
            ..Default::default()
        };

        // buffer 大小
        let size = (4 * 4 * 3) * HilbertCurve::new(5).vertices.len() as u64;
        // 创建两个 ping-pong 顶点缓冲区
        let mut vertex_buffers: Vec<wgpu::Buffer> = Vec::with_capacity(2);
        for _ in 0..2 {
            let buf = app.device.create_buffer(&wgpu::BufferDescriptor {
                size,
                usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
                label: None,
                mapped_at_creation: false,
            });
            vertex_buffers.push(buf);
        }

        let layouts: Vec<VertexBufferLayout> = vec![
            wgpu::VertexBufferLayout {
                array_stride: 4 * 3,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &wgpu::vertex_attr_array![0 => Float32x3],
            },
            wgpu::VertexBufferLayout {
                array_stride: 4 * 3,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &wgpu::vertex_attr_array![1 => Float32x3],
            },
        ];

        let builder = ViewNodeBuilder::<PosOnly>::new(bind_group_data, &shader)
            .with_vertex_buffer_layouts(layouts)
            .with_use_depth_stencil(false)
            .with_polygon_mode(wgpu::PolygonMode::Line)
            .with_primitive_topology(wgpu::PrimitiveTopology::LineStrip)
            .with_color_format(format);
        let display_node = builder.build(&app.device);

        Self {
            app,
            display_node,
            vertex_buffers,
            curve_vertex_count: 0,
            animate_index: 0,
            draw_count: draw_count as u32,
            curve_dimention: 1,
            is_animation_up: true,
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
        // 循环执行动画
        self.animate_index += 1;
        if self.animate_index == self.draw_count {
            // 本阶段动画完成，调整到下一阶段
            self.animate_index = 0;
            if self.is_animation_up {
                if self.curve_dimention == 6 {
                    self.is_animation_up = false;
                    self.curve_dimention -= 1;
                } else {
                    self.curve_dimention += 1;
                }
            } else if self.curve_dimention == 1 {
                self.is_animation_up = true;
                self.curve_dimention += 1;
            } else {
                self.curve_dimention -= 1;
            }

            let mut target = HilbertCurve::new(self.curve_dimention);
            let start = if self.is_animation_up {
                let mut start = HilbertCurve::new(self.curve_dimention - 1);
                // 把顶点数翻 4 倍来对应目标维度曲线
                start.four_times_vertices();
                start
            } else {
                target.four_times_vertices();
                HilbertCurve::new(self.curve_dimention + 1)
            };
            // 更新顶点数
            self.curve_vertex_count = target.vertices.len();
            // 填充顶点 buffer
            for (buf, curve) in self.vertex_buffers.iter().zip(vec![start, target].iter()) {
                self.app
                    .queue
                    .write_buffer(buf, 0, bytemuck::cast_slice(&curve.vertices));
            }
        }

        // 动画帧绘制
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
                depth_stencil_attachment: None,
            });
            let display_node = &self.display_node;
            rpass.set_pipeline(&display_node.pipeline);
            rpass.set_bind_group(0, &display_node.bg_setting.bind_group, &[]);
            rpass.set_vertex_buffer(0, self.vertex_buffers[0].slice(..));
            rpass.set_vertex_buffer(1, self.vertex_buffers[1].slice(..));
            let node = &display_node.dy_uniform_bg.as_ref().unwrap();
            rpass.set_bind_group(
                1,
                &node.bind_group,
                &[256 * self.animate_index as wgpu::DynamicOffset],
            );

            rpass.draw(0..self.curve_vertex_count as u32, 0..1);
        }
        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}
