use crate::{MoveParticle, ParticleFrameUniform, ParticleUniform};
use app_surface::AppSurface;
use rand::Rng;
use utils::{
    AnyTexture, BufferObj,
    matrix_helper::FullscreenFactor,
    node::{BindGroupData, ComputeNode, ViewNode, ViewNodeBuilder},
    vertex::PosTex,
};

// 粒子墨水
pub struct ParticleInk {
    particle_count: usize,
    particle_buffer: BufferObj,
    // 重置粒子状态的节点
    reset_node: ComputeNode,
    // 移动粒子的节点
    move_node: ComputeNode,
    display_node: ViewNode,

    animate_index: u32,
    frame_count: u32,
}

impl ParticleInk {
    pub fn new(
        app: &AppSurface,
        mvp_buf: &BufferObj,
        texture_view: &AnyTexture,
        sampler: &wgpu::Sampler,
    ) -> Self {
        let frame_count = 180;

        let w = app.config.width;
        let h = app.config.height;
        // 粒子像素尺寸
        let particle_point_size = app.scale_factor * 1.0;
        let particle_num = wgpu::Extent3d {
            width: w / particle_point_size as u32,
            height: h / particle_point_size as u32,
            depth_or_array_layers: 0,
        };
        let fovy: f32 = 45.0_f32.to_radians();
        let factor = utils::matrix_helper::fullscreen_factor(
            glam::Vec2 {
                x: app.config.width as f32,
                y: app.config.height as f32,
            },
            fovy,
        );

        // 粒子的顶点数据
        let half_x = particle_point_size / 2.0 * (2.0 / w as f32 * factor.sx);
        let half_y = particle_point_size / 2.0 * (2.0 / h as f32 * factor.sy);
        let uv_x = (1.0 / particle_num.width as f32) * particle_point_size / 2.0 / w as f32;
        let uv_y = (1.0 / particle_num.height as f32) * particle_point_size / 2.0 / h as f32;
        let vertex_buffer_data = vec![
            PosTex {
                pos: [half_x, half_y, 0.0],
                tex_coord: [uv_x, -uv_y],
            },
            PosTex {
                pos: [-half_x, half_y, 0.0],
                tex_coord: [-uv_x, -uv_y],
            },
            PosTex {
                pos: [-half_x, -half_y, 0.0],
                tex_coord: [-uv_x, uv_y],
            },
            PosTex {
                pos: [half_x, -half_y, 0.0],
                tex_coord: [uv_x, uv_y],
            },
        ];
        let index_data = vec![0, 1, 2, 0, 2, 3];

        // 粒子数据的存储缓冲区
        let particle_data = init_particles(particle_num, factor);
        let particle_buffer = BufferObj::create_buffer(
            &app.device,
            Some(&particle_data),
            None,
            wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::STORAGE,
            Some("粒子缓冲区"),
        );

        let particle_uniform_buf = BufferObj::create_uniform_buffer(
            &app.device,
            &ParticleUniform {
                particle_num: [particle_num.width, particle_num.height],
                canvas_size: [w as f32, app.config.height as f32],
                pixel_distance: [2.0 * factor.sx / w as f32, 2.0 * factor.sy / h as f32],
            },
            None,
        );
        // 注意，layout 与 MoveParticle 的字段需要一致
        let particle_attributes = wgpu::vertex_attr_array![0 => Float32x2, 1 => Float32x2, 2 => Float32x2, 3 => Float32x2, 4 => Float32x2];
        let vertex_attributes = wgpu::vertex_attr_array![5 => Float32x3, 6 => Float32x2];
        let vertex_buffer_layouts = vec![
            wgpu::VertexBufferLayout {
                array_stride: 4 * 10,
                step_mode: wgpu::VertexStepMode::Instance,
                attributes: &particle_attributes,
            },
            wgpu::VertexBufferLayout {
                array_stride: 4 * 5,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &vertex_attributes,
            },
        ];

        let frame_buf = BufferObj::create_empty_uniform_buffer(
            &app.device,
            (frame_count * 256) as wgpu::BufferAddress,
            256,
            true,
            Some("粒子动画的动态偏移缓冲区"),
        );
        // 按动态偏移量填充 uniform 缓冲区
        let uniforms = init_frame_uniforms(frame_count);
        for step in 0..frame_count {
            app.queue.write_buffer(
                &frame_buf.buffer,
                256 * step as u64,
                bytemuck::bytes_of(&uniforms[step as usize]),
            );
        }

        // 着色器
        let (ink_shader, move_shader, reset_shader) = {
            let create_shader = |wgsl: &'static str| -> wgpu::ShaderModule {
                app.device
                    .create_shader_module(wgpu::ShaderModuleDescriptor {
                        label: None,
                        source: wgpu::ShaderSource::Wgsl(wgsl.into()),
                    })
            };
            (
                create_shader(include_str!("../assets/particle_ink.wgsl")),
                create_shader(include_str!("../assets/particle_move.wgsl")),
                create_shader(include_str!("../assets/reset_particle.wgsl")),
            )
        };

        // 准备绑定组需要的数据
        // let sampler2 = utils::default_sampler(&app.device);
        let bind_group_data = BindGroupData {
            uniforms: vec![mvp_buf],
            inout_tv: vec![(texture_view, None)],
            samplers: vec![sampler],
            visibilitys: vec![
                wgpu::ShaderStages::VERTEX,
                wgpu::ShaderStages::FRAGMENT,
                wgpu::ShaderStages::FRAGMENT,
            ],
            // 配置动态偏移缓冲区
            dynamic_uniforms: vec![&frame_buf],
            dynamic_uniform_visibilitys: vec![wgpu::ShaderStages::FRAGMENT],
            ..Default::default()
        };
        let format = app.config.format.remove_srgb_suffix();
        let builder = ViewNodeBuilder::<PosTex>::new(bind_group_data, &ink_shader)
            .with_vertices_and_indices((vertex_buffer_data, index_data))
            .with_vertex_buffer_layouts(vertex_buffer_layouts)
            .with_use_depth_stencil(true)
            .with_color_format(format);
        let display_node = builder.build(&app.device);

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![&particle_uniform_buf],
            storage_buffers: vec![&particle_buffer],
            visibilitys: vec![wgpu::ShaderStages::COMPUTE],
            workgroup_count: (
                ((particle_num.width * particle_num.height) as f32 / 64.0).ceil() as u32,
                1,
                1,
            ),
            ..Default::default()
        };
        let move_node = ComputeNode::new(&app.device, &bind_group_data, &move_shader);
        let reset_node = ComputeNode::new(&app.device, &bind_group_data, &reset_shader);

        Self {
            particle_count: (particle_num.width * particle_num.height) as usize,
            particle_buffer,
            display_node,
            move_node,
            reset_node,
            animate_index: 0,
            frame_count,
        }
    }

    // cal_particles_move 无法直接写进 enter_frame 中：
    // rpass 已经对 encoder 有可变引用了， 无法同时传递 rpass 与创建它的 encoder
    pub fn cal_particles_move(&mut self, encoder: &mut wgpu::CommandEncoder) {
        let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor::default());
        if self.animate_index == 0 {
            // 重置粒子状态
            self.reset_node.compute_by_pass(&mut cpass);
        }
        self.move_node.compute_by_pass(&mut cpass);
    }

    pub fn enter_frame<'a, 'b: 'a>(&'b mut self, rpass: &mut wgpu::RenderPass<'a>) -> bool {
        let display_node = &self.display_node;
        rpass.set_pipeline(&display_node.pipeline);
        rpass.set_bind_group(0, &display_node.bg_setting.bind_group, &[]);
        rpass.set_index_buffer(display_node.index_buf.slice(..), wgpu::IndexFormat::Uint32);
        rpass.set_vertex_buffer(0, self.particle_buffer.buffer.slice(..));
        let vertex_buf = display_node.vertex_buf.as_ref().unwrap();
        rpass.set_vertex_buffer(1, vertex_buf.buffer.slice(..));
        let node = &display_node.dy_uniform_bg.as_ref().unwrap();
        rpass.set_bind_group(
            1,
            &node.bind_group,
            &[256 * self.animate_index as wgpu::DynamicOffset],
        );

        rpass.draw_indexed(
            0..self.display_node.index_count as u32,
            0,
            0..self.particle_count as u32,
        );

        let mut is_completed = false;
        self.animate_index += 1;
        if self.animate_index == self.frame_count {
            // 当前动画完成，重置状态
            self.animate_index = 0;
            is_completed = true;
        }
        is_completed
    }
}

pub fn init_particles(particle: wgpu::Extent3d, factor: FullscreenFactor) -> Vec<MoveParticle> {
    let num = (particle.width * particle.height) as usize;
    let mut data: Vec<MoveParticle> = Vec::with_capacity(num);
    let step_x = 2.0 * factor.sx / particle.width as f32;
    let step_y = 2.0 * factor.sy / particle.height as f32;
    let uv_x_step = 1.0 / particle.width as f32;
    let uv_y_step = 1.0 / particle.height as f32;
    let mut rng = rand::thread_rng();

    for y in 0..particle.height {
        // 确保正好在像素的中心位置
        let offset = 0.5;
        // 由于 webgpu 的纹理坐标是 +y 轴向下的，与 NDC 坐标是反的
        // https://gpuweb.github.io/gpuweb/#coordinate-systems
        let pixel_y = factor.sy - step_y * (y as f32 + offset);
        let uv_y = uv_y_step * (y as f32 + offset);
        for x in 0..particle.width {
            let random_pos = [
                rng.gen_range(-factor.sx..factor.sx * 2.0),
                rng.gen_range(0.0..factor.sy * 3.0),
            ];
            let target_pos = [-factor.sx + step_x * (x as f32 + offset), pixel_y];
            data.push(MoveParticle {
                pos: random_pos,
                init_pos: random_pos,
                uv_pos: [uv_x_step * (x as f32 + offset), uv_y],
                target_pos,
                speed_factor: [rng.gen_range(0.04..0.08); 2],
            });
        }
    }

    data
}

pub fn init_frame_uniforms(frame_cunt: u32) -> Vec<ParticleFrameUniform> {
    let mut arr: Vec<ParticleFrameUniform> = Vec::with_capacity(frame_cunt as usize);
    let step = 1.0 / (frame_cunt as f32 / 4.0);
    for i in 0..frame_cunt {
        arr.push(ParticleFrameUniform {
            frame_alpha: step * i as f32,
        });
    }
    arr
}
