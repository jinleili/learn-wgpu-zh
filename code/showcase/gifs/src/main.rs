use core::mem;

async fn run() {
    let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
        backends: wgpu::Backends::all(),
        ..Default::default()
    });
    let adapter = instance
        .request_adapter(&wgpu::RequestAdapterOptions::default())
        .await
        .unwrap();
    let (device, queue) = adapter
        .request_device(&wgpu::DeviceDescriptor {
            label: Some("Device"),
            required_features: wgpu::Features::empty(),
            // WebGL doesn't support all of wgpu's features, so if
            // we're building for the web we'll have to disable some.
            required_limits: if cfg!(target_arch = "wasm32") {
                wgpu::Limits::downlevel_webgl2_defaults()
            } else {
                wgpu::Limits::default()
            },
            memory_hints: wgpu::MemoryHints::Performance,
            // 追踪 API 调用路径
            trace: wgpu::Trace::Off,
        })
        .await
        .unwrap();

    let colors = [
        [0.0, 0.0, 0.0],
        [0.0, 0.0, 0.2],
        [0.0, 0.2, 0.2],
        [0.2, 0.2, 0.2],
        [0.2, 0.2, 0.2],
        [0.0, 0.2, 0.2],
        [0.0, 0.0, 0.2],
        [0.0, 0.0, 0.0],
    ];

    // create a texture to render to
    let texture_size = 256u32;
    let render_target = utils::load_texture::empty(
        &device,
        wgpu::TextureFormat::Rgba8UnormSrgb,
        wgpu::Extent3d {
            width: texture_size,
            height: texture_size,
            depth_or_array_layers: 1,
        },
        None,
        wgpu::TextureUsages::COPY_SRC | wgpu::TextureUsages::RENDER_ATTACHMENT,
        None,
    );

    // wgpu requires texture -> buffer copies to be aligned using
    // wgpu::COPY_BYTES_PER_ROW_ALIGNMENT. Because of this we'll
    // need to save both the padded_bytes_per_row as well as the
    // unpadded_bytes_per_row
    let pixel_size = mem::size_of::<[u8; 4]>() as u32;
    let align = wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
    let unpadded_bytes_per_row = pixel_size * texture_size;
    let padding = (align - unpadded_bytes_per_row % align) % align;
    let padded_bytes_per_row = unpadded_bytes_per_row + padding;

    // create a buffer to copy the texture to so we can get the data
    let buffer_size = (padded_bytes_per_row * texture_size) as wgpu::BufferAddress;
    let buffer_desc = wgpu::BufferDescriptor {
        size: buffer_size,
        usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
        label: Some("Output Buffer"),
        mapped_at_creation: false,
    };
    let output_buffer = device.create_buffer(&buffer_desc);

    // a simple render pipeline that draws a triangle
    let render_pipeline = create_render_pipeline(&device, &render_target);

    let mut frames = Vec::new();

    for c in &colors {
        let mut encoder =
            device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

        let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("GIF Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &render_target.tex_view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: c[0],
                        g: c[1],
                        b: c[2],
                        a: 1.0,
                    }),
                    store: wgpu::StoreOp::Store,
                },
            })],
            ..Default::default()
        });

        rpass.set_pipeline(&render_pipeline);
        rpass.draw(0..3, 0..1);

        drop(rpass);

        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo {
                aspect: wgpu::TextureAspect::All,
                texture: &render_target.tex,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
            },
            wgpu::TexelCopyBufferInfo {
                buffer: &output_buffer,
                layout: wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(padded_bytes_per_row),
                    rows_per_image: Some(texture_size),
                },
            },
            render_target.size,
        );

        queue.submit(Some(encoder.finish()));

        // Create the map request
        let buffer_slice = output_buffer.slice(..);
        let (tx, rx) = flume::bounded(1);
        buffer_slice.map_async(wgpu::MapMode::Read, move |result| {
            tx.send(result).unwrap();
        });
        // wait for the GPU to finish
        device.poll(wgpu::PollType::Wait).unwrap();

        if let Ok(Ok(())) = rx.recv_async().await {
            let padded_data = buffer_slice.get_mapped_range();
            let data = padded_data
                .chunks(padded_bytes_per_row as _)
                .flat_map(|chunk| &chunk[..unpadded_bytes_per_row as _])
                .copied()
                .collect::<Vec<_>>();

            frames.push(data);

            // 必须确保所有映射视图在解除缓冲区映射之前被释放
            drop(padded_data);
            // 解除缓冲区映射
            output_buffer.unmap();
        } else {
            panic!("从 gpu 读取数据失败！");
        }
    }

    save_gif("output.gif", &mut frames, 10, texture_size as u16).unwrap();
}

fn save_gif(path: &str, frames: &mut Vec<Vec<u8>>, speed: i32, size: u16) -> anyhow::Result<()> {
    use gif::{Encoder, Frame, Repeat};

    let mut image = std::fs::File::create(path)?;
    let mut encoder = Encoder::new(&mut image, size, size, &[])?;
    encoder.set_repeat(Repeat::Infinite)?;

    for frame in frames {
        encoder.write_frame(&Frame::from_rgba_speed(size, size, frame, speed))?;
    }

    println!("保存 gif 成功！");

    Ok(())
}

fn create_render_pipeline(
    device: &wgpu::Device,
    target: &utils::AnyTexture,
) -> wgpu::RenderPipeline {
    // let vs_src = wgpu::include_spirv!("shader.vert.spv");
    // let fs_src = wgpu::include_spirv!("shader.frag.spv");
    // let vs_module = device.create_shader_module(&vs_src);
    // let fs_module = device.create_shader_module(&fs_src);
    let shader = device.create_shader_module(wgpu::include_wgsl!("shader.wgsl"));

    let render_pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("Render Pipeline Layout"),
        bind_group_layouts: &[],
        push_constant_ranges: &[],
    });

    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        layout: Some(&render_pipeline_layout),
        label: Some("Render Pipeline"),
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
                format: target.format,
                blend: Some(wgpu::BlendState::REPLACE),
                write_mask: wgpu::ColorWrites::ALL,
            })],
        }),
        primitive: wgpu::PrimitiveState {
            topology: wgpu::PrimitiveTopology::TriangleList,
            strip_index_format: None,
            front_face: wgpu::FrontFace::Ccw,
            cull_mode: Some(wgpu::Face::Back),
            // Setting this to anything other than Fill requires Features::NON_FILL_POLYGON_MODE
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
    })
}

fn main() {
    pollster::block_on(run());
}
