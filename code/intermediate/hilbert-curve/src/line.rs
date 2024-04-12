use app_surface::AppSurface;
use utils::{
    node::{BindGroupData, BindGroupSetting, DynamicUniformBindGroup},
    BufferObj,
};
use wgpu::{MultisampleState, RenderPipeline, ShaderStages, VertexFormat};

pub struct Line {
    pub bg_setting: BindGroupSetting,
    pub dy_bg: DynamicUniformBindGroup,
    pub pipeline: RenderPipeline,
}

impl Line {
    pub fn new(app: &AppSurface, mvp_buffer: &BufferObj, hilbert_buf: &BufferObj) -> Self {
        // 准备绑定组需要的数据
        let bind_group_data = BindGroupData {
            uniforms: vec![mvp_buffer],
            visibilitys: vec![ShaderStages::VERTEX],
            // 配置动态偏移缓冲区
            dynamic_uniforms: vec![hilbert_buf],
            dynamic_uniform_visibilitys: vec![ShaderStages::VERTEX],
            ..Default::default()
        };
        let bg_setting = BindGroupSetting::new(&app.device, &bind_group_data);

        let dy_bg =
            DynamicUniformBindGroup::new(&app.device, vec![(hilbert_buf, ShaderStages::VERTEX)]);
        let pipeline_layout = app
            .device
            .create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: None,
                bind_group_layouts: &[&bg_setting.bind_group_layout, &dy_bg.bind_group_layout],
                push_constant_ranges: &[],
            });
        // 着色器
        let shader = app
            .device
            .create_shader_module(wgpu::ShaderModuleDescriptor {
                label: Some("hilbert shader"),
                source: wgpu::ShaderSource::Wgsl(include_str!("../assets/hilbert.wgsl").into()),
            });

        let pipeline = app
            .device
            .create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some("line pipeline"),
                layout: Some(&pipeline_layout),
                vertex: wgpu::VertexState {
                    module: &shader,
                    entry_point: "vs_main",
                    buffers: &[
                        wgpu::VertexBufferLayout {
                            array_stride: VertexFormat::Float32x3.size(),
                            step_mode: wgpu::VertexStepMode::Instance,
                            attributes: &[
                                wgpu::VertexAttribute {
                                    shader_location: 0,
                                    format: VertexFormat::Float32x3,
                                    offset: 0,
                                },
                                wgpu::VertexAttribute {
                                    shader_location: 1,
                                    format: VertexFormat::Float32x3,
                                    offset: VertexFormat::Float32x3.size(),
                                },
                            ],
                        },
                        wgpu::VertexBufferLayout {
                            array_stride: VertexFormat::Float32x3.size(),
                            step_mode: wgpu::VertexStepMode::Instance,
                            attributes: &[
                                wgpu::VertexAttribute {
                                    shader_location: 2,
                                    format: VertexFormat::Float32x3,
                                    offset: 0,
                                },
                                wgpu::VertexAttribute {
                                    shader_location: 3,
                                    format: VertexFormat::Float32x3,
                                    offset: VertexFormat::Float32x3.size(),
                                },
                            ],
                        },
                    ],
                },
                fragment: Some(wgpu::FragmentState {
                    module: &shader,
                    entry_point: "fs_main",
                    targets: &[Some(wgpu::ColorTargetState {
                        format: app.config.format,
                        blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                        write_mask: wgpu::ColorWrites::ALL,
                    })],
                }),
                primitive: wgpu::PrimitiveState::default(),
                depth_stencil: None,
                multisample: MultisampleState::default(),
                multiview: None,
            });

        Self {
            bg_setting,
            dy_bg,
            pipeline,
        }
    }
}
