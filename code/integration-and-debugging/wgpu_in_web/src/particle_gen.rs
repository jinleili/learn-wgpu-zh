use app_surface::AppSurface;
use bytemuck::{Pod, Zeroable};
use rand::Rng;
use utils::{
    AnyTexture, BufferObj, load_texture, matrix_helper,
    node::{BindGroupData, ComputeNode},
};
use wgpu::{BufferAddress, BufferUsages, TextureUsages};

#[repr(C)]
#[derive(Copy, Clone, Pod, Zeroable, Default)]
pub(crate) struct Particle {
    // 当前位置
    pos: [f32; 4],
    // 目标位置
    target_pos: [f32; 4],
    // 旋转轴 与 角速度
    axis_and_angular_speed: [f32; 4],
    // 对应的纹理采样位置，确定后不会再变
    uv: [f32; 2],
    // 运动半径
    radius: f32,
    // 当前弧度
    angle: f32,
}

/// 基于图片像素值生成粒子
pub(crate) struct ParticleGen {
    pub count: u32,
    /// 文字内容纹理
    pub text_tex: AnyTexture,
    pub sampler: wgpu::Sampler,
    pub particle_buf: BufferObj,
    /// 投影矩阵 uniform buffer
    pub mvp_buf: BufferObj,

    compute_node: ComputeNode,
    /// 粒子生成时的计数器
    counter_buf: BufferObj,
    /// 用于从 gpu 读取数据的缓冲区
    staging_buf: wgpu::Buffer,
}

impl ParticleGen {
    pub async fn new(app: &AppSurface, fovy: f32) -> Self {
        // 加载文字内容纹理
        let (text_tex, sampler) = load_texture::from_path(
            "assets/text.jpg",
            app,
            TextureUsages::TEXTURE_BINDING,
            false,
        )
        .await;

        let (p_matrix, mv_matrix) = matrix_helper::perspective_fullscreen_mvp(
            glam::Vec2 {
                x: text_tex.size.width as f32,
                y: text_tex.size.height as f32,
            },
            fovy,
        );
        let mvp_buf = BufferObj::create_uniform_buffer(
            &app.device,
            &(p_matrix * mv_matrix).to_cols_array_2d(),
            Some("MVPMatUniform"),
        );

        // 基于像素计算是否要激活一个粒子
        // 实际有效粒子数量会远小于像素数量
        let particle_count = text_tex.size.width * text_tex.size.height;
        let mut particle_data: Vec<Particle> = Vec::with_capacity(particle_count as usize);
        log::info!(
            "粒子初始内存: {:?}MB",
            particle_count as usize * core::mem::size_of::<Particle>() / 1024 / 1024
        );

        // 使用 OsRng 替代 ThreadRng, 因为 OsRng 实现了 Send trait, 可以在异步上下文中正常工作
        let mut rng = rand::rngs::OsRng;

        for _ in 0..particle_count {
            let angular_speed = rng.gen_range(0.005..0.03) * app.scale_factor;

            particle_data.push(Particle {
                radius: rng.gen_range(8.0..16.0) * app.scale_factor,
                axis_and_angular_speed: [
                    rng.gen_range(-1.0..1.0),
                    rng.gen_range(-1.0..1.0),
                    rng.gen_range(-1.0..1.0),
                    angular_speed,
                ],
                ..Default::default()
            });
        }

        // 粒子数据的存储缓冲区
        let particle_buffer = BufferObj::create_buffer(
            &app.device,
            Some(&particle_data),
            None,
            BufferUsages::VERTEX | BufferUsages::STORAGE | BufferUsages::COPY_SRC,
            Some("粒子缓冲区"),
        );

        // 计数器, 用于计算粒子填充位置
        let counter_buf = BufferObj::create_buffer(
            &app.device,
            None,
            Some(&0_u32),
            BufferUsages::STORAGE | BufferUsages::COPY_SRC | BufferUsages::COPY_DST,
            Some("计数器"),
        );

        let staging_buf = app.device.create_buffer(&wgpu::BufferDescriptor {
            size: core::mem::size_of::<u32>() as BufferAddress,
            usage: BufferUsages::COPY_DST
            // MAP_READ 告诉 wpgu 我们要在 cpu 端读取此缓冲区
            | BufferUsages::MAP_READ,
            label: None,
            mapped_at_creation: false,
        });

        // 着色器
        let gen_shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: None,
                source: wgpu::ShaderSource::Wgsl(include_str!("wgsl/gen_particle.wgsl").into()),
            });

        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            inout_tv: vec![(&text_tex, None)],
            storage_buffers: vec![&counter_buf, &particle_buffer],
            visibilitys: vec![wgpu::ShaderStages::COMPUTE; 3],
            workgroup_count: ((particle_count as f32 / 64.0).ceil() as u32, 1, 1),
            ..Default::default()
        };

        let compute_node = ComputeNode::new(&app.device, &bind_group_data, &gen_shader);

        let mut instance = Self {
            count: particle_count,
            text_tex,
            sampler,
            particle_buf: particle_buffer,
            mvp_buf,
            compute_node,
            counter_buf,
            staging_buf,
        };

        instance.generate_particles(app).await;

        instance
    }

    async fn generate_particles(&mut self, app: &AppSurface) {
        let mut encoder = app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Compute Encoder"),
            });

        // 生成有效粒子
        self.compute_node.compute(&mut encoder);

        // 将 gpu 上的计数器数据复制到 cpu 上的缓冲区
        encoder.copy_buffer_to_buffer(
            &self.counter_buf.buffer,
            0,
            &self.staging_buf,
            0,
            core::mem::size_of::<u32>() as u64,
        );

        app.queue.submit(Some(encoder.finish()));

        // 需要对映射变量设置范围，以便能够解除缓冲区的内存映射
        let buffer_slice = self.staging_buf.slice(..);

        // 注意：必须在 await future 之前先创建映射，然后再调用 device.poll()。
        // 否则，应用程序将停止响应。
        let (tx, rx) = flume::bounded(1);
        buffer_slice.map_async(wgpu::MapMode::Read, move |result| {
            tx.send(result).unwrap();
        });
        app.device.poll(wgpu::PollType::Wait).unwrap();

        if let Ok(Ok(())) = rx.recv_async().await {
            let data = buffer_slice.get_mapped_range();
            let result = *bytemuck::from_bytes::<u32>(&data);
            log::info!("从 gpu 读回的粒子数量: {:?}", result);
            self.count = result;

            // 须确保在解除缓冲区映射之前已删除所有已映射的视图
            drop(data);
            // 解除缓冲区内存映射
            self.staging_buf.unmap();

            self.gen_final_particle_buf(app);
        } else {
            panic!("从 gpu 读取数据失败！");
        }
    }

    fn gen_final_particle_buf(&mut self, app: &AppSurface) {
        let size = self.count as u64 * core::mem::size_of::<Particle>() as u64;
        // 最终的粒子缓冲区
        let final_particle_buf = utils::BufferObj::create_empty_storage_buffer(
            &app.device,
            size,
            BufferUsages::VERTEX | BufferUsages::STORAGE | BufferUsages::COPY_DST,
            None,
        );
        let mut encoder = app
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Copy Encoder"),
            });
        encoder.copy_buffer_to_buffer(
            &self.particle_buf.buffer,
            0,
            &final_particle_buf.buffer,
            0,
            size,
        );
        app.queue.submit(Some(encoder.finish()));

        self.particle_buf.buffer.destroy();
        self.particle_buf = final_particle_buf;

        log::info!("粒子最终占用内存: {:?}MB", size / 1024 / 1024);
    }
}
