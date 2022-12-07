use app_surface::AppSurface;
use wgpu::{util::DeviceExt, ShaderModule, TextureView};

pub struct BlurNode {
    pipeline: wgpu::ComputePipeline,
    bind_group: wgpu::BindGroup,
    workgroups: (u32, u32),
}

impl BlurNode {
    pub fn new(
        app: &AppSurface,
        uniform_data: [[i32; 2]; 2],
        tv_from: &TextureView,
        tv_to: &TextureView,
        shader: &ShaderModule,
        workgroups: (u32, u32),
    ) -> Self {
        let pipeline = app
            .device
            .create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
                layout: None,
                module: shader,
                entry_point: "cs_main",
                label: None,
            });

        let uniform_buf = app
            .device
            .create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: None,
                contents: bytemuck::cast_slice(&uniform_data),
                usage: wgpu::BufferUsages::UNIFORM,
            });

        let bind_group = app.device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &pipeline.get_bind_group_layout(0),
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
            workgroups,
        }
    }

    pub fn dispatch<'a, 'b: 'a>(&'b self, cpass: &mut wgpu::ComputePass<'a>) {
        cpass.set_pipeline(&self.pipeline);
        cpass.set_bind_group(0, &self.bind_group, &[]);
        cpass.dispatch_workgroups(self.workgroups.0, self.workgroups.1, 1);
    }
}
