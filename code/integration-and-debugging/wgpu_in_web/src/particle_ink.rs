use crate::particle_gen::ParticleGen;
use app_surface::AppSurface;
use bytemuck::{Pod, Zeroable};
use glam::{Vec2, Vec4, Vec4Swizzles, vec2};
use utils::{
    BufferObj,
    node::{BindGroupData, BufferlessFullscreenNode, ComputeNode, ViewNode, ViewNodeBuilder},
    vertex::PosOnly,
};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct CanvasUniform {
    // NDC 坐标空间中，一个像素对应的大小
    pixel_distance: [f32; 2],
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct FrameUniform {
    // 鼠标/触摸位置
    cursor_pos: [f32; 2],
    // 影响范围
    influence_radius: f32,
    // 用于字节对齐的字段
    _padding: f32,
}

const INFLUENCE_RADIUS: f32 = 45.0;

// 粒子墨水
pub struct ParticleInk {
    particle_count: usize,
    scale_factor: f32,
    // 交互数据
    interact_buf: BufferObj,
    // 视口位置与大小
    viewport: Vec4,
    // 移动粒子的节点
    move_node: ComputeNode,
    display_node: ViewNode,
    pub depth_tex: wgpu::TextureView,
    // 调试节点
    _debug_node: BufferlessFullscreenNode,
}

impl ParticleInk {
    pub fn new(app: &AppSurface, generator: &ParticleGen) -> Self {
        let particle_count = generator.count as usize;
        let scale_factor = app.scale_factor;

        let surface_size = vec2(app.config.width as f32, app.config.height as f32);
        let mut tex_size = vec2(
            generator.text_tex.size.width as f32,
            generator.text_tex.size.height as f32,
        );
        // 如果 tex_size 的 x 或 y 大于 surface_size，则等比缩放 tex_size
        if tex_size.x > surface_size.x || tex_size.y > surface_size.y {
            let scale_factor = (surface_size.x / tex_size.x).min(surface_size.y / tex_size.y);
            tex_size *= scale_factor;

            // 向下取整以处理边界情况
            tex_size.x = tex_size.x.floor();
            tex_size.y = tex_size.y.floor();
        }

        // 视口位置与大小
        let viewport = Vec4::new(
            ((app.config.width as f32 - tex_size.x as f32) / 2.0).max(0.0),
            ((app.config.height as f32 - tex_size.y as f32) / 2.0).max(0.0),
            tex_size.x,
            tex_size.y,
        );

        // 粒子像素尺寸
        let particle_pixel_size = scale_factor * 1.5;

        // 在 NDC 坐标空间中，一个像素对应的大小
        let pixel_in_ndc_distance = vec2(2.0 / viewport.z, 2.0 / viewport.w);
        // 粒子在视口中的坐标偏移
        let offset = -viewport.zw() / 2.0 * pixel_in_ndc_distance;

        let half_x = particle_pixel_size / 2.0 * pixel_in_ndc_distance.x;
        let half_y = particle_pixel_size / 2.0 * pixel_in_ndc_distance.y;

        // 粒子的顶点数据
        let vertex_buffer_data = vec![
            PosOnly {
                pos: [half_x + offset.x, half_y + offset.y, 0.0],
            },
            PosOnly {
                pos: [-half_x + offset.x, half_y + offset.y, 0.0],
            },
            PosOnly {
                pos: [-half_x + offset.x, -half_y + offset.y, 0.0],
            },
            PosOnly {
                pos: [half_x + offset.x, -half_y + offset.y, 0.0],
            },
        ];
        let index_data = vec![0, 1, 2, 0, 2, 3];

        let particle_uniform_buf = BufferObj::create_uniform_buffer(
            &app.device,
            &CanvasUniform {
                pixel_distance: pixel_in_ndc_distance.to_array(),
            },
            None,
        );
        // 注意，layout 与 Particle 的字段需要一致
        let particle_attributes = wgpu::vertex_attr_array![0 => Float32x4, 1 => Float32x4, 2 => Float32x4, 3 => Float32x2,4 => Float32, 5 => Float32];
        let vertex_attributes = wgpu::vertex_attr_array![6 => Float32x3];
        let vertex_buffer_layouts = vec![
            wgpu::VertexBufferLayout {
                array_stride: 4 * 16,
                step_mode: wgpu::VertexStepMode::Instance,
                attributes: &particle_attributes,
            },
            wgpu::VertexBufferLayout {
                array_stride: 4 * 3,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &vertex_attributes,
            },
        ];

        // 着色器
        let (display_shader, move_shader) = {
            let create_shader = |wgsl: &'static str| -> wgpu::ShaderModule {
                app.device
                    .create_shader_module(wgpu::ShaderModuleDescriptor {
                        label: None,
                        source: wgpu::ShaderSource::Wgsl(wgsl.into()),
                    })
            };
            (
                create_shader(include_str!("wgsl/particle_display.wgsl")),
                create_shader(include_str!("wgsl/particle_move.wgsl")),
            )
        };

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![&generator.mvp_buf, &particle_uniform_buf],
            inout_tv: vec![(&generator.text_tex, None)],
            samplers: vec![&generator.sampler],
            visibilitys: vec![
                wgpu::ShaderStages::VERTEX,
                wgpu::ShaderStages::VERTEX,
                wgpu::ShaderStages::FRAGMENT,
                wgpu::ShaderStages::FRAGMENT,
            ],
            ..Default::default()
        };

        let builder = ViewNodeBuilder::<PosOnly>::new(bind_group_data, &display_shader)
            .with_vertices_and_indices((vertex_buffer_data, index_data))
            .with_vertex_buffer_layouts(vertex_buffer_layouts)
            .with_use_depth_stencil(true)
            .with_color_format(app.config.format);
        let display_node = builder.build(&app.device);

        let interact_buf = BufferObj::create_uniform_buffer(
            &app.device,
            &FrameUniform {
                cursor_pos: [-100.0; 2],
                influence_radius: INFLUENCE_RADIUS * scale_factor,
                _padding: 0.0,
            },
            Some("FrameUniform"),
        );

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![&interact_buf],
            storage_buffers: vec![&generator.particle_buf],
            visibilitys: vec![wgpu::ShaderStages::COMPUTE],
            workgroup_count: ((generator.count as f32 / 64.0).ceil() as u32, 1, 1),
            ..Default::default()
        };
        let move_node = ComputeNode::new(&app.device, &bind_group_data, &move_shader);

        let depth_tex = create_depth_tex(app);

        // 调试节点
        let debug_shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: None,
                source: wgpu::ShaderSource::Wgsl(include_str!("wgsl/debug_draw.wgsl").into()),
            });
        let bind_group_data = BindGroupData {
            inout_tv: vec![(&generator.text_tex, None)],
            samplers: vec![&generator.sampler],
            visibilitys: vec![wgpu::ShaderStages::FRAGMENT, wgpu::ShaderStages::FRAGMENT],
            ..Default::default()
        };
        let debug_node = BufferlessFullscreenNode::new(
            &app.device,
            app.config.format,
            &bind_group_data,
            &debug_shader,
            None,
            1,
        );

        Self {
            particle_count,
            scale_factor,
            interact_buf,
            viewport,
            display_node,
            move_node,
            depth_tex,
            _debug_node: debug_node,
        }
    }

    pub fn cursor_moved(&mut self, ctx: &app_surface::IASDQContext, cursor_pos: Vec2) {
        let pos = cursor_pos - self.viewport.xy();
        let data = FrameUniform {
            cursor_pos: pos.to_array(),
            influence_radius: INFLUENCE_RADIUS * self.scale_factor,
            _padding: 0.0,
        };
        ctx.queue
            .write_buffer(&self.interact_buf.buffer, 0, bytemuck::bytes_of(&data));
    }

    // 计算粒子移动
    pub fn cal_particles_move(&mut self, encoder: &mut wgpu::CommandEncoder) {
        let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor::default());
        self.move_node.compute_by_pass(&mut cpass);
    }

    pub fn enter_frame<'a, 'b: 'a>(
        &'b mut self,
        generator: &ParticleGen,
        rpass: &mut wgpu::RenderPass<'a>,
    ) {
        rpass.set_viewport(
            self.viewport.x,
            self.viewport.y,
            self.viewport.z,
            self.viewport.w,
            0.0,
            1.0,
        );
        // self.debug_node.draw_by_pass(rpass);

        let display_node = &self.display_node;
        rpass.set_pipeline(&display_node.pipeline);
        rpass.set_bind_group(0, &display_node.bg_setting.bind_group, &[]);
        rpass.set_index_buffer(display_node.index_buf.slice(..), wgpu::IndexFormat::Uint32);

        // 将粒子数据设置为顶点缓冲区
        rpass.set_vertex_buffer(0, generator.particle_buf.buffer.slice(..));

        let vertex_buf = display_node.vertex_buf.as_ref().unwrap();
        rpass.set_vertex_buffer(1, vertex_buf.buffer.slice(..));

        rpass.draw_indexed(
            0..display_node.index_count as u32,
            0,
            0..self.particle_count as u32,
        );
    }
}

fn create_depth_tex(app: &AppSurface) -> wgpu::TextureView {
    let depth_texture = app.device.create_texture(&wgpu::TextureDescriptor {
        size: wgpu::Extent3d {
            width: app.config.width,
            height: app.config.height,
            depth_or_array_layers: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Depth32Float,
        usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
        label: None,
        view_formats: &[],
    });
    depth_texture.create_view(&wgpu::TextureViewDescriptor::default())
}
