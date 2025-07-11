#![allow(dead_code)]

use core::mem::size_of_val;

use glam::Vec3Swizzles;

use crate::{create_render_pipeline, model};

#[repr(C)]
#[derive(Debug, Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
struct ChunkData {
    chunk_size: [u32; 2],
    chunk_corner: [i32; 2],
    min_max_height: [f32; 2],
}

pub struct Terrain {
    chunks: Vec<Chunk>,
    chunk_size: glam::UVec2,
    min_max_height: glam::Vec2,
}

impl Terrain {
    pub fn new(chunk_size: glam::UVec2, min_max_height: glam::Vec2) -> Self {
        Self {
            chunks: Vec::new(),
            chunk_size,
            min_max_height,
        }
    }

    pub fn gen_chunk(
        &mut self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        pipeline: &impl GenerateChunk,
        position: glam::Vec3,
    ) {
        let corner = position.xz().as_ivec2();
        let mut index = None;
        for (i, chunk) in self.chunks.iter().enumerate() {
            if chunk.corner == corner {
                index = Some(i);
            }
        }
        let existing_chunk = index.map(|index| self.chunks.remove(index));
        self.chunks
            .push(pipeline.gen_chunk(device, queue, corner, existing_chunk));
    }
}

pub struct Chunk {
    corner: glam::IVec2,
    mesh: model::Mesh,
}

pub trait GenerateChunk {
    fn gen_chunk(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        corner: glam::IVec2,
        existing_chunk: Option<Chunk>,
    ) -> Chunk;
}

pub struct TerrainPipeline {
    chunk_size: glam::UVec2,
    min_max_height: glam::Vec2,
    gen_layout: wgpu::BindGroupLayout,
    gen_pipeline: wgpu::ComputePipeline,
    _render_pipeline: wgpu::RenderPipeline,
}

impl TerrainPipeline {
    pub fn new(
        device: &wgpu::Device,
        chunk_size: glam::UVec2,
        min_max_height: glam::Vec2,
        camera_layout: &wgpu::BindGroupLayout,
        light_layout: &wgpu::BindGroupLayout,
        color_format: wgpu::TextureFormat,
        depth_format: Option<wgpu::TextureFormat>,
    ) -> Self {
        let gen_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("ChunkLoader::Layout"),
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 2,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
            ],
        });

        let shader = device.create_shader_module(wgpu::include_wgsl!("terrain.wgsl"));

        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("TerrainPipeline::Gen::PipelineLayout"),
            bind_group_layouts: &[&gen_layout],
            push_constant_ranges: &[],
        });
        let gen_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("TerrainPipeline::ComputePipeline"),
            layout: Some(&pipeline_layout),
            module: &shader,
            entry_point: Some("gen_terrain_compute"),
            compilation_options: Default::default(),
            cache: None,
        });

        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("TerrainPipeline::Render::PipelineLayout"),
                bind_group_layouts: &[camera_layout, light_layout],
                push_constant_ranges: &[],
            });
        let render_pipeline = create_render_pipeline(
            device,
            &render_pipeline_layout,
            color_format,
            depth_format,
            &[wgpu::VertexBufferLayout {
                array_stride: 32,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &[
                    wgpu::VertexAttribute {
                        format: wgpu::VertexFormat::Float32x3,
                        offset: 0,
                        shader_location: 0,
                    },
                    wgpu::VertexAttribute {
                        format: wgpu::VertexFormat::Float32x3,
                        offset: 16,
                        shader_location: 1,
                    },
                ],
            }],
            &shader,
        );

        Self {
            chunk_size,
            min_max_height,
            gen_layout,
            gen_pipeline,
            _render_pipeline: render_pipeline,
        }
    }

    pub fn render<'a>(
        &'a self,
        render_pass: &mut wgpu::RenderPass<'a>,
        terrain: &'a Terrain,
        camera_bind_group: &'a wgpu::BindGroup,
        light_bind_group: &'a wgpu::BindGroup,
    ) {
        render_pass.set_pipeline(&self._render_pipeline);
        render_pass.set_bind_group(0, camera_bind_group, &[]);
        render_pass.set_bind_group(1, light_bind_group, &[]);
        for chunk in &terrain.chunks {
            render_pass
                .set_index_buffer(chunk.mesh.index_buffer.slice(..), chunk.mesh.index_format);
            render_pass.set_vertex_buffer(0, chunk.mesh.vertex_buffer.slice(..));
            render_pass.draw_indexed(0..chunk.mesh.num_elements, 0, 0..1);
        }
    }
}

impl GenerateChunk for TerrainPipeline {
    fn gen_chunk(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        corner: glam::IVec2,
        existing_chunk: Option<Chunk>,
    ) -> Chunk {
        let chunk = if let Some(mut chunk) = existing_chunk {
            chunk.corner = corner;
            chunk
        } else {
            let chunk_name = format!("Chunk {corner:?}");
            let num_vertices = (self.chunk_size.x + 1) * (self.chunk_size.y + 1);
            let vertex_buffer = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some(&format!("{chunk_name}: Vertices")),
                size: (num_vertices * 8 * core::mem::size_of::<f32>() as u32) as _,
                usage: wgpu::BufferUsages::STORAGE
                    | wgpu::BufferUsages::VERTEX
                    | wgpu::BufferUsages::MAP_READ,
                mapped_at_creation: false,
            });
            let num_elements = self.chunk_size.x * self.chunk_size.y * 6;
            println!("num_elements: {num_elements}");
            let index_buffer = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some(&format!("{chunk_name}: Indices")),
                size: (num_elements * core::mem::size_of::<u32>() as u32) as _,
                usage: wgpu::BufferUsages::STORAGE
                    | wgpu::BufferUsages::INDEX
                    | wgpu::BufferUsages::MAP_READ,
                mapped_at_creation: false,
            });
            Chunk {
                corner,
                mesh: model::Mesh {
                    name: chunk_name,
                    vertex_buffer,
                    index_buffer,
                    num_elements,
                    material: 0,
                    index_format: wgpu::IndexFormat::Uint32,
                },
            }
        };

        let data = ChunkData {
            chunk_size: self.chunk_size.into(),
            chunk_corner: corner.into(),
            min_max_height: self.min_max_height.into(),
        };
        let gen_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("TerrainPipeline: ChunkData"),
            size: size_of_val(&data) as _,
            usage: wgpu::BufferUsages::UNIFORM
                | wgpu::BufferUsages::MAP_READ
                | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        queue.write_buffer(&gen_buffer, 0, bytemuck::bytes_of(&data));

        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("TerrainPipeline: BindGroup"),
            layout: &self.gen_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: gen_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: chunk.mesh.vertex_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: chunk.mesh.index_buffer.as_entire_binding(),
                },
            ],
        });

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("TerrainPipeline::gen_chunk"),
        });

        let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: Some("TerrainPipeline: ComputePass"),
            ..Default::default()
        });
        cpass.set_pipeline(&self.gen_pipeline);
        cpass.set_bind_group(0, &bind_group, &[]);
        cpass.dispatch_workgroups(
            dbg!((((self.chunk_size.x + 1) * (self.chunk_size.y + 1)) as f32 / 64.0).ceil()) as _,
            1,
            1,
        );
        drop(cpass);

        queue.submit(Some(encoder.finish()));
        device.poll(wgpu::PollType::Wait).unwrap();

        // resources::export_mesh_data(&format!("{}.json", chunk.mesh.name), device, &chunk.mesh);

        chunk
    }
}

pub struct TerrainHackPipeline {
    texture_size: u32,
    gen_layout: wgpu::BindGroupLayout,
    gen_pipeline: wgpu::RenderPipeline,
    render_pipeline: wgpu::RenderPipeline,
    chunk_size: glam::UVec2,
    min_max_height: glam::Vec2,
}

impl TerrainHackPipeline {
    pub fn new(
        device: &wgpu::Device,
        chunk_size: glam::UVec2,
        min_max_height: glam::Vec2,
        camera_layout: &wgpu::BindGroupLayout,
        light_layout: &wgpu::BindGroupLayout,
        color_format: wgpu::TextureFormat,
        depth_format: Option<wgpu::TextureFormat>,
    ) -> Self {
        // Given that the vertices in the chunk are 2 vec3s, num_indices should = num_vertices
        let texture_size = 512;

        let gen_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("HackTerrainPipeline::BindGroupLayout"),
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            }],
        });

        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("HackTerrainPipeline::PipelineLayout"),
            bind_group_layouts: &[&gen_layout],
            push_constant_ranges: &[],
        });

        let shader = device.create_shader_module(wgpu::include_wgsl!("terrain.wgsl"));
        let gen_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("HackTerrainPipeline::GenPipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("gen_terrain_vertex"),
                compilation_options: Default::default(),
                buffers: &[],
            },
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                cull_mode: None,
                ..Default::default()
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("gen_terrain_fragment"),
                compilation_options: Default::default(),
                targets: &[
                    Some(wgpu::ColorTargetState {
                        format: wgpu::TextureFormat::R32Uint,
                        blend: None,
                        write_mask: wgpu::ColorWrites::ALL,
                    }),
                    Some(wgpu::ColorTargetState {
                        format: wgpu::TextureFormat::R32Uint,
                        blend: None,
                        write_mask: wgpu::ColorWrites::ALL,
                    }),
                ],
            }),
            multiview: None,
            cache: None,
        });

        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("TerrainPipeline::Render::PipelineLayout"),
                bind_group_layouts: &[camera_layout, light_layout],
                push_constant_ranges: &[],
            });
        let render_pipeline = create_render_pipeline(
            device,
            &render_pipeline_layout,
            color_format,
            depth_format,
            &[wgpu::VertexBufferLayout {
                array_stride: 24,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &[
                    wgpu::VertexAttribute {
                        format: wgpu::VertexFormat::Float32x3,
                        offset: 0,
                        shader_location: 0,
                    },
                    wgpu::VertexAttribute {
                        format: wgpu::VertexFormat::Float32x3,
                        offset: 12,
                        shader_location: 1,
                    },
                ],
            }],
            &shader,
        );

        Self {
            chunk_size,
            min_max_height,
            texture_size,
            gen_layout,
            gen_pipeline,
            render_pipeline,
        }
    }

    pub fn render<'a>(
        &'a self,
        render_pass: &mut wgpu::RenderPass<'a>,
        terrain: &'a Terrain,
        camera_bind_group: &'a wgpu::BindGroup,
        light_bind_group: &'a wgpu::BindGroup,
    ) {
        render_pass.set_pipeline(&self.render_pipeline);
        render_pass.set_bind_group(0, camera_bind_group, &[]);
        render_pass.set_bind_group(1, light_bind_group, &[]);
        for chunk in &terrain.chunks {
            render_pass
                .set_index_buffer(chunk.mesh.index_buffer.slice(..), chunk.mesh.index_format);
            render_pass.set_vertex_buffer(0, chunk.mesh.vertex_buffer.slice(..));
            render_pass.draw_indexed(0..chunk.mesh.num_elements, 0, 0..1);
        }
    }

    fn create_work_texture(&self, device: &wgpu::Device, index: bool) -> wgpu::Texture {
        device.create_texture(&wgpu::TextureDescriptor {
            label: Some(if index {
                "Index Texture"
            } else {
                "Vertex Texture"
            }),
            size: wgpu::Extent3d {
                width: self.texture_size,
                height: self.texture_size,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::R32Uint,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
            view_formats: &[],
        })
    }
}

impl GenerateChunk for TerrainHackPipeline {
    fn gen_chunk(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        corner: glam::IVec2,
        existing_chunk: Option<Chunk>,
    ) -> Chunk {
        let chunk = if let Some(mut chunk) = existing_chunk {
            chunk.corner = corner;
            chunk
        } else {
            let chunk_name = format!("Chunk {corner:?}");
            let num_vertices = (self.chunk_size.x + 1) * (self.chunk_size.y + 1);
            let vertex_buffer = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some(&format!("{chunk_name}: Vertices")),
                size: (num_vertices * 8 * core::mem::size_of::<f32>() as u32) as _,
                usage: wgpu::BufferUsages::COPY_DST
                    | wgpu::BufferUsages::VERTEX
                    | wgpu::BufferUsages::MAP_READ,
                mapped_at_creation: false,
            });
            let num_elements = self.chunk_size.x * self.chunk_size.y * 6;
            let index_buffer = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some(&format!("{chunk_name}: Indices")),
                size: (num_elements * core::mem::size_of::<u32>() as u32) as _,
                usage: wgpu::BufferUsages::COPY_DST
                    | wgpu::BufferUsages::INDEX
                    | wgpu::BufferUsages::MAP_READ,
                mapped_at_creation: false,
            });
            Chunk {
                corner,
                mesh: model::Mesh {
                    name: chunk_name,
                    vertex_buffer,
                    index_buffer,
                    num_elements,
                    material: 0,
                    index_format: wgpu::IndexFormat::Uint32,
                },
            }
        };

        let vertex_texture = self.create_work_texture(device, false);
        let vertex_view = vertex_texture.create_view(&wgpu::TextureViewDescriptor {
            label: Some("HackTerrainPipeline: vertex_view"),
            ..Default::default()
        });
        let index_texture = self.create_work_texture(device, true);
        let index_view = index_texture.create_view(&wgpu::TextureViewDescriptor {
            label: Some("HackTerrainPipeline: index_view"),
            ..Default::default()
        });

        let data = GenData::new(
            self.texture_size,
            0,
            self.chunk_size,
            corner,
            self.min_max_height,
        );
        println!("gen data: {data:?}");
        let gen_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("HackTerrainPipeline: GenData"),
            size: size_of_val(&data) as _,
            usage: wgpu::BufferUsages::UNIFORM
                | wgpu::BufferUsages::MAP_READ
                | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        queue.write_buffer(&gen_buffer, 0, bytemuck::bytes_of(&data));
        let gen_uniforms = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("HackTerrainPipeline: gen_uniforms"),
            layout: &self.gen_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: gen_buffer.as_entire_binding(),
            }],
        });

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("HackTerrainPipeline: encoder"),
        });

        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("HackTerrainPipeline: pass"),
            color_attachments: &[
                Some(wgpu::RenderPassColorAttachment {
                    view: &vertex_view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations::default(),
                }),
                Some(wgpu::RenderPassColorAttachment {
                    view: &index_view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations::default(),
                }),
            ],
            ..Default::default()
        });
        pass.set_pipeline(&self.gen_pipeline);
        pass.set_bind_group(0, &gen_uniforms, &[]);
        pass.draw(0..6, 0..1);
        drop(pass);

        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo {
                texture: &vertex_texture,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            wgpu::TexelCopyBufferInfo {
                buffer: &chunk.mesh.vertex_buffer,
                layout: wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(core::mem::size_of::<u32>() as u32 * self.texture_size),
                    rows_per_image: Some(self.texture_size),
                },
            },
            wgpu::Extent3d {
                width: self.texture_size,
                height: self.texture_size,
                depth_or_array_layers: 1,
            },
        );
        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo {
                texture: &index_texture,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            wgpu::TexelCopyBufferInfo {
                buffer: &chunk.mesh.index_buffer,
                layout: wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(core::mem::size_of::<u32>() as u32 * self.texture_size),
                    rows_per_image: Some(self.texture_size),
                },
            },
            wgpu::Extent3d {
                width: self.texture_size,
                height: self.texture_size,
                depth_or_array_layers: 1,
            },
        );

        queue.submit(Some(encoder.finish()));
        {
            device.poll(wgpu::PollType::Wait).unwrap();
            let bs = chunk.mesh.index_buffer.slice(..);
            let (tx, rx) = std::sync::mpsc::channel();
            bs.map_async(wgpu::MapMode::Read, move |result| {
                tx.send(result).unwrap();
            });
            device.poll(wgpu::PollType::Wait).unwrap();
            rx.recv().unwrap().unwrap();
            let data = bs.get_mapped_range();

            let indices: &[u32] = bytemuck::cast_slice(&data);
            let mut f = std::fs::File::create(format!(
                "Chunk ({}, {}) Indices.txt",
                chunk.corner.x, chunk.corner.y
            ))
            .unwrap();
            use std::io::Write;
            for quad in indices.chunks(6) {
                let _ = writeln!(f, "{quad:?}");
            }
            drop(f);

            let img = image::ImageBuffer::<image::Rgba<u8>, _>::from_raw(
                self.texture_size,
                self.texture_size,
                data,
            )
            .unwrap();
            img.save(format!(
                "Chunk ({}, {}) Vertex Data.png",
                chunk.corner.x, chunk.corner.y
            ))
            .unwrap();
        }
        chunk.mesh.index_buffer.unmap();

        chunk
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
struct GenData {
    chunk_size: [u32; 2],
    chunk_corner: [i32; 2],
    min_max_height: [f32; 2],
    texture_size: u32,
    _pad0: u32,
    start_index: u32,
    _pad1: u32,
}

impl GenData {
    pub fn new(
        texture_size: u32,
        start_index: u32,
        chunk_size: glam::UVec2,
        chunk_corner: glam::IVec2,
        min_max_height: glam::Vec2,
    ) -> Self {
        Self {
            texture_size,
            _pad0: 0,
            start_index,
            _pad1: 0,
            chunk_size: chunk_size.into(),
            chunk_corner: chunk_corner.into(),
            min_max_height: min_max_height.into(),
        }
    }
}
