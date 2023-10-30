use crate::DEPTH_FORMAT;
use wgpu::{PrimitiveTopology, ShaderModule, TextureFormat};

use super::BindGroupData;

pub struct BufferlessFullscreenNode {
    bind_group: wgpu::BindGroup,
    pipeline: wgpu::RenderPipeline,
}

#[allow(dead_code)]
impl BufferlessFullscreenNode {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        device: &wgpu::Device,
        format: TextureFormat,
        bg_data: &BindGroupData,
        shader_module: &ShaderModule,
        color_blend_state: Option<wgpu::BlendState>,
        sample_count: u32,
    ) -> Self {
        let use_depth_stencil = true;
        let pipeline_vertex_buffers = [];
        let blend_state = if color_blend_state.is_some() {
            color_blend_state
        } else {
            Some(wgpu::BlendState::ALPHA_BLENDING)
        };
        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("bufferless fullscreen pipeline"),
            layout: None,
            vertex: wgpu::VertexState {
                module: shader_module,
                entry_point: "vs_main",
                buffers: &pipeline_vertex_buffers,
            },
            fragment: Some(wgpu::FragmentState {
                module: shader_module,
                entry_point: "fs_main",
                targets: &[Some(wgpu::ColorTargetState {
                    format,
                    blend: blend_state,
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            // the bufferless vertices are in clock-wise order
            primitive: wgpu::PrimitiveState {
                topology: PrimitiveTopology::TriangleList,
                front_face: wgpu::FrontFace::Cw,
                cull_mode: Some(wgpu::Face::Front),
                polygon_mode: wgpu::PolygonMode::Fill,
                ..Default::default()
            },
            depth_stencil: if use_depth_stencil {
                Some(wgpu::DepthStencilState {
                    format: DEPTH_FORMAT,
                    depth_write_enabled: true,
                    depth_compare: wgpu::CompareFunction::Less,
                    stencil: wgpu::StencilState::default(),
                    bias: wgpu::DepthBiasState::default(),
                })
            } else {
                None
            },
            multisample: wgpu::MultisampleState {
                count: sample_count,
                ..Default::default()
            },
            multiview: None,
        });

        let bind_group = create_bind_group(device, bg_data, &pipeline.get_bind_group_layout(0));

        Self {
            bind_group,
            pipeline,
        }
    }

    pub fn draw(
        &self,
        frame_view: &wgpu::TextureView,
        encoder: &mut wgpu::CommandEncoder,
        load_op: wgpu::LoadOp<wgpu::Color>,
    ) {
        let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("bufferless rpass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: frame_view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: load_op,
                    store: wgpu::StoreOp::Store,
                },
            })],
            ..Default::default()
        });
        self.draw_by_pass(&mut rpass);
    }

    pub fn draw_by_pass<'a, 'b: 'a>(&'b self, rpass: &mut wgpu::RenderPass<'b>) {
        rpass.set_pipeline(&self.pipeline);
        rpass.set_bind_group(0, &self.bind_group, &[]);
        rpass.draw(0..3, 0..1);
    }
}

pub fn create_bind_group(
    device: &wgpu::Device,
    bg_data: &BindGroupData,
    bind_group_layout: &wgpu::BindGroupLayout,
) -> wgpu::BindGroup {
    let mut entries: Vec<wgpu::BindGroupEntry> = vec![];
    let mut b_index = 0_u32;
    for uniform in bg_data.uniforms.iter() {
        entries.push(wgpu::BindGroupEntry {
            binding: b_index,
            resource: uniform.buffer.as_entire_binding(),
        });
        b_index += 1;
    }

    for storage_buf in bg_data.storage_buffers.iter() {
        entries.push(wgpu::BindGroupEntry {
            binding: b_index,
            resource: storage_buf.buffer.as_entire_binding(),
        });
        b_index += 1;
    }

    for a_tex in bg_data.inout_tv.iter() {
        entries.push(wgpu::BindGroupEntry {
            binding: b_index,
            resource: wgpu::BindingResource::TextureView(&a_tex.0.tex_view),
        });
        b_index += 1;
    }

    for sampler in &bg_data.samplers {
        entries.push(wgpu::BindGroupEntry {
            binding: b_index,
            resource: wgpu::BindingResource::Sampler(sampler),
        });
        b_index += 1;
    }

    device.create_bind_group(&wgpu::BindGroupDescriptor {
        layout: bind_group_layout,
        entries: &entries,
        label: None,
    })
}
