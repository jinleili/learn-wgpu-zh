use super::{BindGroupData, BindGroupSetting};
use crate::vertex::Vertex;
use crate::BufferObj;
use crate::DEPTH_FORMAT;
use bytemuck::Pod;
use glam::{Vec2 as Size, Vec4 as Rect};
use std::ops::{Deref, DerefMut};
use wgpu::util::DeviceExt;

#[allow(dead_code)]
pub struct NodeAttributes<'a, T: Vertex + Pod> {
    pub view_size: Size,
    pub vertices_and_indices: Option<(Vec<T>, Vec<u32>)>,
    pub vertex_buffer_layouts: Option<Vec<wgpu::VertexBufferLayout<'a>>>,
    pub bg_data: BindGroupData<'a>,

    pub tex_rect: Option<Rect>,
    pub corlor_format: Option<wgpu::TextureFormat>,
    pub color_blend_state: Option<wgpu::BlendState>,
    pub primitive_topology: wgpu::PrimitiveTopology,
    pub polygon_mode: wgpu::PolygonMode,
    pub cull_mode: Option<wgpu::Face>,
    pub use_depth_stencil: bool,
    pub shader_module: &'a wgpu::ShaderModule,
}

pub struct ViewNodeBuilder<'a, T: Vertex + Pod> {
    pub attributes: NodeAttributes<'a, T>,
}

impl<'a, T: Vertex + Pod> Deref for ViewNodeBuilder<'a, T> {
    type Target = NodeAttributes<'a, T>;
    fn deref(&self) -> &NodeAttributes<'a, T> {
        &self.attributes
    }
}

impl<'a, T: Vertex + Pod> DerefMut for ViewNodeBuilder<'a, T> {
    fn deref_mut(&mut self) -> &mut NodeAttributes<'a, T> {
        &mut self.attributes
    }
}

#[allow(dead_code)]
impl<'a, T: Vertex + Pod> ViewNodeBuilder<'a, T> {
    pub fn new(bg_data: BindGroupData<'a>, shader_module: &'a wgpu::ShaderModule) -> Self {
        ViewNodeBuilder {
            attributes: NodeAttributes {
                view_size: (1.0, 1.0).into(),
                vertices_and_indices: None,
                vertex_buffer_layouts: None,
                bg_data,
                tex_rect: None,
                corlor_format: None,
                color_blend_state: Some(wgpu::BlendState::ALPHA_BLENDING),
                primitive_topology: wgpu::PrimitiveTopology::TriangleList,
                polygon_mode: wgpu::PolygonMode::Fill,
                cull_mode: Some(wgpu::Face::Back),
                use_depth_stencil: true,
                shader_module,
            },
        }
    }

    pub fn with_primitive_topology(mut self, primitive_topology: wgpu::PrimitiveTopology) -> Self {
        self.primitive_topology = primitive_topology;
        self
    }

    pub fn with_polygon_mode(mut self, polygon_mode: wgpu::PolygonMode) -> Self {
        self.polygon_mode = polygon_mode;
        self
    }

    pub fn with_cull_mode(mut self, cull_mode: Option<wgpu::Face>) -> Self {
        self.cull_mode = cull_mode;
        self
    }

    pub fn with_vertices_and_indices(mut self, vertices_and_indices: (Vec<T>, Vec<u32>)) -> Self {
        self.vertices_and_indices = Some(vertices_and_indices);
        self
    }

    pub fn with_vertex_buffer_layouts(
        mut self,
        layouts: Vec<wgpu::VertexBufferLayout<'a>>,
    ) -> Self {
        self.vertex_buffer_layouts = Some(layouts);
        self
    }

    pub fn with_view_size(mut self, size: Size) -> Self {
        self.view_size = size;
        self
    }

    pub fn with_tex_rect(mut self, rect: Rect) -> Self {
        self.tex_rect = Some(rect);
        self
    }

    pub fn with_color_format(mut self, format: wgpu::TextureFormat) -> Self {
        self.corlor_format = Some(format);
        self
    }

    pub fn with_color_blend_state(mut self, blend_state: Option<wgpu::BlendState>) -> Self {
        self.color_blend_state = blend_state;
        self
    }

    pub fn with_use_depth_stencil(mut self, bl: bool) -> Self {
        self.use_depth_stencil = bl;
        self
    }

    pub fn build(self, device: &wgpu::Device) -> ViewNode {
        debug_assert!(
            self.bg_data.visibilitys.len()
                >= self.bg_data.uniforms.len()
                    + self.bg_data.samplers.len()
                    + self.bg_data.storage_buffers.len()
                    + self.bg_data.inout_tv.len(),
            "visibilitys count less than binding resource count"
        );
        ViewNode::frome_attributes::<T>(self.attributes, device)
    }
}

#[allow(dead_code)]
pub struct ViewNode {
    pub vertex_buf: Option<BufferObj>,
    pub vertex_count: usize,
    pub index_buf: wgpu::Buffer,
    pub index_count: usize,
    pub bg_setting: BindGroupSetting,
    pub dy_uniform_bg: Option<super::DynamicUniformBindGroup>,
    pub pipeline: wgpu::RenderPipeline,
    view_width: f32,
    view_height: f32,
    pub clear_color: wgpu::Color,
}

#[allow(dead_code)]
impl ViewNode {
    fn frome_attributes<T: Vertex + Pod>(
        attributes: NodeAttributes<T>,
        device: &wgpu::Device,
    ) -> Self {
        let corlor_format = if let Some(format) = attributes.corlor_format {
            format
        } else {
            wgpu::TextureFormat::Bgra8UnormSrgb
        };

        let bg_setting = BindGroupSetting::new(device, &attributes.bg_data);

        // Create the vertex and index buffers
        let vi = attributes.vertices_and_indices.unwrap_or_default();
        let vertex_count = vi.0.len();
        let vertex_buf = if vertex_count > 0 {
            Some(BufferObj::create_buffer(
                device,
                Some(&vi.0),
                None,
                wgpu::BufferUsages::VERTEX,
                Some("Vertex buffer"),
            ))
        } else {
            None
        };
        let index_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("index buffer"),
            contents: bytemuck::cast_slice(&vi.1),
            usage: wgpu::BufferUsages::INDEX,
        });

        let default_layout_attributes = T::vertex_attributes(0);
        let vertex_buffer_layouts = if let Some(layouts) = attributes.vertex_buffer_layouts {
            layouts
        } else if std::mem::size_of::<T>() > 0 {
            vec![wgpu::VertexBufferLayout {
                array_stride: std::mem::size_of::<T>() as wgpu::BufferAddress,
                step_mode: wgpu::VertexStepMode::Vertex,
                attributes: &default_layout_attributes,
            }]
        } else {
            vec![]
        };
        let (dy_uniform_bg, pipeline_layout) = if !attributes.bg_data.dynamic_uniforms.is_empty() {
            let uniforms = attributes
                .bg_data
                .dynamic_uniforms
                .iter()
                .zip(attributes.bg_data.dynamic_uniform_visibilitys)
                .map(|(uniform, visi)| (*uniform, visi))
                .collect();
            let dy_bg = super::DynamicUniformBindGroup::new(device, uniforms);
            let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: None,
                bind_group_layouts: &[&bg_setting.bind_group_layout, &dy_bg.bind_group_layout],
                push_constant_ranges: &[],
            });
            (Some(dy_bg), pipeline_layout)
        } else {
            let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: None,
                bind_group_layouts: &[&bg_setting.bind_group_layout],
                push_constant_ranges: &[],
            });
            (None, pipeline_layout)
        };

        // Create the render pipeline
        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("view pipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: attributes.shader_module,
                entry_point: "vs_main",
                buffers: &vertex_buffer_layouts,
            },
            fragment: Some(wgpu::FragmentState {
                module: attributes.shader_module,
                entry_point: "fs_main",
                targets: &[Some(wgpu::ColorTargetState {
                    format: corlor_format,
                    blend: attributes.color_blend_state,
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            primitive: wgpu::PrimitiveState {
                topology: attributes.primitive_topology,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: attributes.cull_mode,
                polygon_mode: attributes.polygon_mode,
                ..Default::default()
            },
            depth_stencil: if attributes.use_depth_stencil {
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
            multisample: wgpu::MultisampleState::default(),
            multiview: None,
        });

        ViewNode {
            view_width: attributes.view_size.x,
            view_height: attributes.view_size.y,
            vertex_buf,
            vertex_count,
            index_buf,
            index_count: vi.1.len(),
            bg_setting,
            dy_uniform_bg,
            pipeline,
            clear_color: wgpu::Color::BLACK,
        }
    }

    pub fn draw(
        &self,
        frame_view: &wgpu::TextureView,
        encoder: &mut wgpu::CommandEncoder,
        load_op: wgpu::LoadOp<wgpu::Color>,
    ) {
        self.draw_by_offset(frame_view, encoder, load_op, 0);
    }

    pub fn draw_by_pass<'a, 'b: 'a>(&'b self, rpass: &mut wgpu::RenderPass<'b>) {
        self.draw_rpass_by_offset(rpass, 0, 1);
    }

    pub fn draw_by_instance_count<'a, 'b: 'a>(
        &'b self,
        rpass: &mut wgpu::RenderPass<'b>,
        instance_count: u32,
    ) {
        self.draw_rpass_by_offset(rpass, 0, instance_count);
    }

    pub fn draw_by_offset(
        &self,
        frame_view: &wgpu::TextureView,
        encoder: &mut wgpu::CommandEncoder,
        load_op: wgpu::LoadOp<wgpu::Color>,
        offset_index: u32,
    ) {
        let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: None,
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: frame_view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: load_op,
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
        self.set_rpass(&mut rpass);
        self.draw_rpass_by_offset(&mut rpass, offset_index, 1);
    }

    pub fn draw_rpass_by_offset<'a, 'b: 'a>(
        &'b self,
        rpass: &mut wgpu::RenderPass<'b>,
        offset_index: u32,
        instance_count: u32,
    ) {
        self.set_rpass(rpass);
        if let Some(node) = &self.dy_uniform_bg {
            rpass.set_bind_group(
                1,
                &node.bind_group,
                &[256 * offset_index as wgpu::DynamicOffset],
            );
        }
        if self.index_count > 0 {
            rpass.draw_indexed(0..self.index_count as u32, 0, 0..instance_count);
        } else {
            rpass.draw(0..self.vertex_count as u32, 0..instance_count)
        }
    }

    pub fn set_rpass<'a, 'b: 'a>(&'b self, rpass: &mut wgpu::RenderPass<'a>) {
        rpass.set_pipeline(&self.pipeline);
        rpass.set_bind_group(0, &self.bg_setting.bind_group, &[]);
        rpass.set_index_buffer(self.index_buf.slice(..), wgpu::IndexFormat::Uint32);
        if let Some(vertex_buf) = self.vertex_buf.as_ref() {
            rpass.set_vertex_buffer(0, vertex_buf.buffer.slice(..));
        }
    }
}
