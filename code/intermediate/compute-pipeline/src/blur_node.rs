use app_surface::AppSurface;
use wgpu::{util::DeviceExt, ShaderModule, ShaderStages, TextureView, TextureViewDimension};

pub struct BlurNode {
    pipeline: wgpu::ComputePipeline,
    bind_group: wgpu::BindGroup,
    workgroup_count: (u32, u32),
}

impl BlurNode {
    pub fn new(
        app: &AppSurface,
        uniform_data: [[i32; 2]; 2],
        tv_from: &TextureView,
        tv_to: &TextureView,
        shader: &ShaderModule,
        workgroup_count: (u32, u32),
    ) -> Self {
        let bind_group_layout =
            app.device
                .create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                    entries: &[
                        wgpu::BindGroupLayoutEntry {
                            binding: 0,
                            visibility: ShaderStages::COMPUTE,
                            ty: wgpu::BindingType::Buffer {
                                ty: wgpu::BufferBindingType::Uniform,
                                has_dynamic_offset: false,
                                min_binding_size: wgpu::BufferSize::new(0),
                            },
                            count: None,
                        },
                        wgpu::BindGroupLayoutEntry {
                            binding: 1,
                            visibility: ShaderStages::COMPUTE,
                            ty: wgpu::BindingType::Texture {
                                sample_type: wgpu::TextureSampleType::Float { filterable: true },
                                view_dimension: TextureViewDimension::D2,
                                multisampled: false,
                            },
                            count: None,
                        },
                        wgpu::BindGroupLayoutEntry {
                            binding: 2,
                            visibility: ShaderStages::COMPUTE,
                            ty: wgpu::BindingType::StorageTexture {
                                view_dimension: TextureViewDimension::D2,
                                access: wgpu::StorageTextureAccess::WriteOnly,
                                format: super::SWAP_FORMAT,
                            },
                            count: None,
                        },
                    ],
                    label: None,
                });
        let pipeline_layout = app
            .device
            .create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: None,
                bind_group_layouts: &[&bind_group_layout],
                push_constant_ranges: &[],
            });

        let pipeline = app
            .device
            .create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
                layout: Some(&pipeline_layout),
                module: shader,
                entry_point: "cs_main",
                compilation_options: Default::default(),
                label: None,
                cache: None,
            });

        let uniform_buf = app
            .device
            .create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: None,
                contents: bytemuck::cast_slice(&uniform_data),
                usage: wgpu::BufferUsages::UNIFORM,
            });

        let bind_group = app.device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: uniform_buf.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::TextureView(tv_from),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: wgpu::BindingResource::TextureView(tv_to),
                },
            ],
            label: None,
        });

        Self {
            pipeline,
            bind_group,
            workgroup_count,
        }
    }

    pub fn dispatch<'a, 'b: 'a>(&'b self, cpass: &mut wgpu::ComputePass<'a>) {
        cpass.set_pipeline(&self.pipeline);
        cpass.set_bind_group(0, &self.bind_group, &[]);
        cpass.dispatch_workgroups(self.workgroup_count.0, self.workgroup_count.1, 1);
    }
}
