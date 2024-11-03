use app_surface::{AppSurface, SurfaceFrame};
use std::{iter, sync::Arc};
use utils::{run, WgpuAppAction};
use wgpu::{util::DeviceExt, WasmNotSend};
use winit::{dpi::PhysicalSize, event::*};

mod camera;
mod hdr;
mod model;
mod resources;
mod texture;

use model::{DrawLight, DrawModel, Vertex};

const NUM_INSTANCES_PER_ROW: u32 = 10;

#[repr(C)]
#[derive(Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct CameraUniform {
    view_position: [f32; 4],
    view: [[f32; 4]; 4], // NEW!
    view_proj: [[f32; 4]; 4],
    inv_proj: [[f32; 4]; 4], // NEW!
    inv_view: [[f32; 4]; 4], // NEW!
}

impl CameraUniform {
    fn new() -> Self {
        Self {
            view_position: [0.0; 4],
            view: glam::Mat4::IDENTITY.to_cols_array_2d(), // NEW!
            view_proj: glam::Mat4::IDENTITY.to_cols_array_2d(),
            inv_proj: glam::Mat4::IDENTITY.to_cols_array_2d(), // NEW!
            inv_view: glam::Mat4::IDENTITY.to_cols_array_2d(), // NEW!
        }
    }

    // UPDATED!
    fn update_view_proj(&mut self, camera: &camera::Camera, projection: &camera::Projection) {
        self.view_position = camera.position.extend(1.0).into();
        let proj = projection.calc_matrix();
        let view = camera.calc_matrix();
        let view_proj = proj * view;
        self.view = view.to_cols_array_2d();
        self.view_proj = view_proj.to_cols_array_2d();
        self.inv_proj = proj.inverse().to_cols_array_2d();
        self.inv_view = view.transpose().to_cols_array_2d();
    }
}

struct Instance {
    position: glam::Vec3,
    rotation: glam::Quat,
}

impl Instance {
    fn to_raw(&self) -> InstanceRaw {
        InstanceRaw {
            model: (glam::Mat4::from_translation(self.position)
                * glam::Mat4::from_quat(self.rotation))
            .to_cols_array_2d(),
            normal: glam::Mat3::from_mat4(glam::Mat4::from_quat(self.rotation)).to_cols_array_2d(),
        }
    }
}

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
#[allow(dead_code)]
struct InstanceRaw {
    model: [[f32; 4]; 4],
    normal: [[f32; 3]; 3],
}

impl model::Vertex for InstanceRaw {
    fn desc() -> wgpu::VertexBufferLayout<'static> {
        use std::mem;
        wgpu::VertexBufferLayout {
            array_stride: mem::size_of::<InstanceRaw>() as wgpu::BufferAddress,
            // We need to switch from using a step mode of Vertex to Instance
            // This means that our shaders will only change to use the next
            // instance when the shader starts processing a new instance
            step_mode: wgpu::VertexStepMode::Instance,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    // While our vertex shader only uses locations 0, and 1 now, in later tutorials we'll
                    // be using 2, 3, and 4, for Vertex. We'll start at slot 5 not conflict with them later
                    shader_location: 5,
                    format: wgpu::VertexFormat::Float32x4,
                },
                // A mat4 takes up 4 vertex slots as it is technically 4 vec4s. We need to define a slot
                // for each vec4. We don't have to do this in code though.
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 4]>() as wgpu::BufferAddress,
                    shader_location: 6,
                    format: wgpu::VertexFormat::Float32x4,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 8]>() as wgpu::BufferAddress,
                    shader_location: 7,
                    format: wgpu::VertexFormat::Float32x4,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 12]>() as wgpu::BufferAddress,
                    shader_location: 8,
                    format: wgpu::VertexFormat::Float32x4,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 16]>() as wgpu::BufferAddress,
                    shader_location: 9,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 19]>() as wgpu::BufferAddress,
                    shader_location: 10,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 22]>() as wgpu::BufferAddress,
                    shader_location: 11,
                    format: wgpu::VertexFormat::Float32x3,
                },
            ],
        }
    }
}

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct LightUniform {
    position: [f32; 3],
    // Due to uniforms requiring 16 byte (4 float) spacing, we need to use a padding field here
    _padding: u32,
    color: [f32; 3],
    _padding2: u32,
}

struct WgpuApp {
    app: AppSurface,
    size: PhysicalSize<u32>,
    size_changed: bool,
    render_pipeline: wgpu::RenderPipeline,
    obj_model: model::Model,
    camera: camera::Camera,
    projection: camera::Projection,
    camera_controller: camera::CameraController,
    camera_uniform: CameraUniform,
    camera_buffer: wgpu::Buffer,
    camera_bind_group: wgpu::BindGroup,
    instances: Vec<Instance>,
    #[allow(dead_code)]
    instance_buffer: wgpu::Buffer,
    depth_texture: texture::Texture,
    light_uniform: LightUniform,
    light_buffer: wgpu::Buffer,
    light_bind_group: wgpu::BindGroup,
    light_render_pipeline: wgpu::RenderPipeline,
    #[allow(dead_code)]
    debug_material: model::Material,
    mouse_pressed: bool,
    // NEW!
    hdr: hdr::HdrPipeline,
    environment_bind_group: wgpu::BindGroup,
    sky_pipeline: wgpu::RenderPipeline,
}

impl WgpuApp {
    /// 必要的时候调整 surface 大小
    fn resize_surface_if_needed(&mut self) {
        if self.size_changed {
            //  需先 resize surface
            self.app
                .resize_surface_by_size((self.size.width, self.size.height));

            // 再更新 projection, hdr, depth_texture
            self.projection.resize(self.size.width, self.size.height);
            self.hdr
                .resize(self.app.device.as_ref(), self.size.width, self.size.height);
            self.depth_texture = texture::Texture::create_depth_texture(
                self.app.device.as_ref(),
                &self.app.config,
                "depth_texture",
            );

            self.size_changed = false;
        }
    }
}

fn create_render_pipeline(
    device: &wgpu::Device,
    layout: &wgpu::PipelineLayout,
    color_format: wgpu::TextureFormat,
    depth_format: Option<wgpu::TextureFormat>,
    vertex_layouts: &[wgpu::VertexBufferLayout],
    topology: wgpu::PrimitiveTopology, // NEW!
    shader: wgpu::ShaderModuleDescriptor,
) -> wgpu::RenderPipeline {
    let shader = device.create_shader_module(shader);

    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: Some(&format!("{:?}", shader)),
        layout: Some(layout),
        vertex: wgpu::VertexState {
            module: &shader,
            entry_point: Some("vs_main"),
            compilation_options: Default::default(),
            buffers: vertex_layouts,
        },
        fragment: Some(wgpu::FragmentState {
            module: &shader,
            entry_point: Some("fs_main"),
            compilation_options: Default::default(),
            targets: &[Some(wgpu::ColorTargetState {
                format: color_format,
                blend: None,
                write_mask: wgpu::ColorWrites::ALL,
            })],
        }),
        primitive: wgpu::PrimitiveState {
            topology, // NEW!
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
        depth_stencil: depth_format.map(|format| wgpu::DepthStencilState {
            format,
            depth_write_enabled: true,
            depth_compare: wgpu::CompareFunction::LessEqual, // UDPATED!
            stencil: wgpu::StencilState::default(),
            bias: wgpu::DepthBiasState::default(),
        }),
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

impl WgpuAppAction for WgpuApp {
    fn new(
        window: Arc<winit::window::Window>,
    ) -> impl std::future::Future<Output = Self> + WasmNotSend {
        async move {
            // 配置窗口
            Self::config_window(window.clone(), "tutorial7-instancing");

            // 创建 wgpu 应用
            let mut app = AppSurface::new(window).await;

            // 本教程的着色器中假定 Surface 使用 sRGB 纹理格式.
            // 但在 Web 环境只支持使用 bgra8unorm, rgba8unorm, rgba16float 三种格式
            // 所以，我们利用纹理的 view_formats 特性，在调用 surface 的 create_view 时设置 view 格式为 sRGB
            let surface_format = app.config.format.remove_srgb_suffix();
            app.ctx.update_config_format(surface_format);

            let device = app.device.as_ref();
            let queue = app.queue.as_ref();
            let config = &app.config;

            let texture_bind_group_layout =
                device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                    entries: &[
                        wgpu::BindGroupLayoutEntry {
                            binding: 0,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Texture {
                                multisampled: false,
                                sample_type: wgpu::TextureSampleType::Float { filterable: true },
                                view_dimension: wgpu::TextureViewDimension::D2,
                            },
                            count: None,
                        },
                        wgpu::BindGroupLayoutEntry {
                            binding: 1,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                            count: None,
                        },
                        // normal map
                        wgpu::BindGroupLayoutEntry {
                            binding: 2,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Texture {
                                multisampled: false,
                                sample_type: wgpu::TextureSampleType::Float { filterable: true },
                                view_dimension: wgpu::TextureViewDimension::D2,
                            },
                            count: None,
                        },
                        wgpu::BindGroupLayoutEntry {
                            binding: 3,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                            count: None,
                        },
                    ],
                    label: Some("texture_bind_group_layout"),
                });

            let camera = camera::Camera::new((0.0, 5.0, 10.0), -90.0, -20.0);
            let projection = camera::Projection::new(config.width, config.height, 45.0, 0.1, 100.0);
            let camera_controller = camera::CameraController::new(4.0, 0.4);

            let mut camera_uniform = CameraUniform::new();
            camera_uniform.update_view_proj(&camera, &projection);

            let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Camera Buffer"),
                contents: bytemuck::cast_slice(&[camera_uniform]),
                usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            });

            const SPACE_BETWEEN: f32 = 3.0;
            let instances = (0..NUM_INSTANCES_PER_ROW)
                .flat_map(|z| {
                    (0..NUM_INSTANCES_PER_ROW).map(move |x| {
                        let x = SPACE_BETWEEN * (x as f32 - NUM_INSTANCES_PER_ROW as f32 / 2.0);
                        let z = SPACE_BETWEEN * (z as f32 - NUM_INSTANCES_PER_ROW as f32 / 2.0);

                        let position = glam::Vec3 { x, y: 0.0, z };

                        let rotation = if position.length().abs() <= f32::EPSILON {
                            glam::Quat::from_axis_angle(glam::Vec3::Z, 0.0)
                        } else {
                            glam::Quat::from_axis_angle(
                                position.normalize(),
                                std::f32::consts::FRAC_PI_4,
                            )
                        };

                        Instance { position, rotation }
                    })
                })
                .collect::<Vec<_>>();

            let instance_data = instances.iter().map(Instance::to_raw).collect::<Vec<_>>();
            let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Instance Buffer"),
                contents: bytemuck::cast_slice(&instance_data),
                usage: wgpu::BufferUsages::VERTEX,
            });

            let camera_bind_group_layout =
                device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
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
                    label: Some("camera_bind_group_layout"),
                });

            let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
                layout: &camera_bind_group_layout,
                entries: &[wgpu::BindGroupEntry {
                    binding: 0,
                    resource: camera_buffer.as_entire_binding(),
                }],
                label: Some("camera_bind_group"),
            });

            let obj_model =
                resources::load_model("cube.obj", device, queue, &texture_bind_group_layout)
                    .await
                    .unwrap();

            let light_uniform = LightUniform {
                position: [2.0, 2.0, 2.0],
                _padding: 0,
                color: [1.0, 1.0, 1.0],
                _padding2: 0,
            };

            let light_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Light VB"),
                contents: bytemuck::cast_slice(&[light_uniform]),
                usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            });

            let light_bind_group_layout =
                device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
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
                    label: None,
                });

            let light_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
                layout: &light_bind_group_layout,
                entries: &[wgpu::BindGroupEntry {
                    binding: 0,
                    resource: light_buffer.as_entire_binding(),
                }],
                label: None,
            });

            let depth_texture =
                texture::Texture::create_depth_texture(device, config, "depth_texture");

            // NEW!
            let hdr = hdr::HdrPipeline::new(device, config);

            let hdr_loader = resources::HdrLoader::new(device);
            // pure-sky 是一张 .hdr 后缀的文件，网格上加载为何报如下错误？
            // Format error decoding Hdr: Radiance HDR signature not found
            let sky_bytes = resources::load_binary("pure-sky.hdr").await.unwrap();
            let sky_texture = hdr_loader
                .from_equirectangular_bytes(device, queue, &sky_bytes, 1080, Some("Sky Texture"))
                .unwrap();

            let environment_layout =
                device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                    label: Some("environment_layout"),
                    entries: &[
                        wgpu::BindGroupLayoutEntry {
                            binding: 0,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Texture {
                                sample_type: wgpu::TextureSampleType::Float { filterable: false },
                                view_dimension: wgpu::TextureViewDimension::Cube,
                                multisampled: false,
                            },
                            count: None,
                        },
                        wgpu::BindGroupLayoutEntry {
                            binding: 1,
                            visibility: wgpu::ShaderStages::FRAGMENT,
                            ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::NonFiltering),
                            count: None,
                        },
                    ],
                });

            let environment_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("environment_bind_group"),
                layout: &environment_layout,
                entries: &[
                    wgpu::BindGroupEntry {
                        binding: 0,
                        resource: wgpu::BindingResource::TextureView(sky_texture.view()),
                    },
                    wgpu::BindGroupEntry {
                        binding: 1,
                        resource: wgpu::BindingResource::Sampler(sky_texture.sampler()),
                    },
                ],
            });

            let render_pipeline_layout =
                device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                    label: Some("Render Pipeline Layout"),
                    bind_group_layouts: &[
                        &texture_bind_group_layout,
                        &camera_bind_group_layout,
                        &light_bind_group_layout,
                        &environment_layout, // UPDATED!
                    ],
                    push_constant_ranges: &[],
                });

            let render_pipeline = {
                let shader = wgpu::ShaderModuleDescriptor {
                    label: Some("Normal Shader"),
                    source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
                };
                create_render_pipeline(
                    device,
                    &render_pipeline_layout,
                    hdr.format(),
                    Some(texture::Texture::DEPTH_FORMAT),
                    &[model::ModelVertex::desc(), InstanceRaw::desc()],
                    wgpu::PrimitiveTopology::TriangleList,
                    shader,
                )
            };

            let light_render_pipeline = {
                let layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                    label: Some("Light Pipeline Layout"),
                    bind_group_layouts: &[&camera_bind_group_layout, &light_bind_group_layout],
                    push_constant_ranges: &[],
                });
                let shader = wgpu::ShaderModuleDescriptor {
                    label: Some("Light Shader"),
                    source: wgpu::ShaderSource::Wgsl(include_str!("light.wgsl").into()),
                };
                create_render_pipeline(
                    device,
                    &layout,
                    hdr.format(),
                    Some(texture::Texture::DEPTH_FORMAT),
                    &[model::ModelVertex::desc()],
                    wgpu::PrimitiveTopology::TriangleList,
                    shader,
                )
            };

            // NEW!
            let sky_pipeline = {
                let layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                    label: Some("Sky Pipeline Layout"),
                    bind_group_layouts: &[&camera_bind_group_layout, &environment_layout],
                    push_constant_ranges: &[],
                });
                let shader = wgpu::include_wgsl!("sky.wgsl");
                create_render_pipeline(
                    device,
                    &layout,
                    hdr.format(),
                    Some(texture::Texture::DEPTH_FORMAT),
                    &[],
                    wgpu::PrimitiveTopology::TriangleList,
                    shader,
                )
            };

            let debug_material = {
                let diffuse_bytes = include_bytes!("../res/cobble-diffuse.png");
                let normal_bytes = include_bytes!("../res/cobble-normal.png");

                let diffuse_texture = texture::Texture::from_bytes(
                    device,
                    queue,
                    diffuse_bytes,
                    "res/alt-diffuse.png",
                    false,
                )
                .unwrap();
                let normal_texture = texture::Texture::from_bytes(
                    device,
                    queue,
                    normal_bytes,
                    "res/alt-normal.png",
                    true,
                )
                .unwrap();

                model::Material::new(
                    device,
                    "alt-material",
                    diffuse_texture,
                    normal_texture,
                    &texture_bind_group_layout,
                )
            };

            let size = PhysicalSize::<u32>::new(config.width, config.height);

            Self {
                app,
                size,
                size_changed: false,
                render_pipeline,
                obj_model,
                camera,
                projection,
                camera_controller,
                camera_buffer,
                camera_bind_group,
                camera_uniform,
                instances,
                instance_buffer,
                depth_texture,
                light_uniform,
                light_buffer,
                light_bind_group,
                light_render_pipeline,
                #[allow(dead_code)]
                debug_material,
                mouse_pressed: false,
                // NEW!
                hdr,
                environment_bind_group,
                sky_pipeline,
            }
        }
    }

    fn set_window_resized(&mut self, new_size: PhysicalSize<u32>) {
        if self.app.config.width == new_size.width && self.app.config.height == new_size.height {
            return;
        }
        self.size = new_size;
        self.size_changed = true;
    }

    fn get_size(&self) -> PhysicalSize<u32> {
        PhysicalSize::new(self.app.config.width, self.app.config.height)
    }

    fn pre_present_notify(&self) {
        // 通知 wgpu 应用可以进行渲染了
        self.app.get_view().pre_present_notify();
    }

    fn request_redraw(&self) {
        self.app.get_view().request_redraw();
    }

    fn keyboard_input(&mut self, event: &KeyEvent) -> bool {
        self.camera_controller.process_keyboard(
            &event.physical_key,
            &event.logical_key,
            event.state,
        );

        // 返回 true 表示事件已处理
        true
    }

    fn mouse_click(&mut self, state: ElementState, button: MouseButton) -> bool {
        if button == MouseButton::Left {
            self.mouse_pressed = state == ElementState::Pressed;
            true
        } else {
            false
        }
    }

    fn mouse_wheel(&mut self, delta: MouseScrollDelta, _phase: TouchPhase) -> bool {
        self.camera_controller.process_scroll(&delta);
        true
    }

    fn device_input(&mut self, event: &DeviceEvent) -> bool {
        match event {
            DeviceEvent::MouseMotion { delta } => {
                if self.mouse_pressed {
                    self.camera_controller.process_mouse(delta.0, delta.1);
                    return true;
                }
                false
            }
            _ => false,
        }
    }

    fn update(&mut self, dt: std::time::Duration) {
        self.camera_controller.update_camera(&mut self.camera, dt);
        self.camera_uniform
            .update_view_proj(&self.camera, &self.projection);
        self.app.queue.write_buffer(
            &self.camera_buffer,
            0,
            bytemuck::cast_slice(&[self.camera_uniform]),
        );

        // Update the light
        let old_position: glam::Vec3 = self.light_uniform.position.into();
        self.light_uniform.position =
            (glam::Quat::from_axis_angle(glam::Vec3::Y, 1.0f32.to_radians()) * old_position).into();
        self.app.queue.write_buffer(
            &self.light_buffer,
            0,
            bytemuck::cast_slice(&[self.light_uniform]),
        );
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        self.resize_surface_if_needed();

        let (output, view) = self
            .app
            .get_current_frame_view(Some(self.app.config.format.add_srgb_suffix()));

        let device = self.app.device.as_ref();
        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Render Encoder"),
        });

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: self.hdr.view(), // UPDATED!
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.1,
                            g: 0.2,
                            b: 0.3,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: &self.depth_texture.view,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: wgpu::StoreOp::Store,
                    }),
                    stencil_ops: None,
                }),
                occlusion_query_set: None,
                timestamp_writes: None,
            });

            render_pass.set_vertex_buffer(1, self.instance_buffer.slice(..));
            render_pass.set_pipeline(&self.light_render_pipeline);
            render_pass.draw_light_model(
                &self.obj_model,
                &self.camera_bind_group,
                &self.light_bind_group,
            );

            render_pass.set_pipeline(&self.render_pipeline);
            render_pass.draw_model_instanced(
                &self.obj_model,
                0..self.instances.len() as u32,
                &self.camera_bind_group,
                &self.light_bind_group,
                &self.environment_bind_group,
            );

            render_pass.set_pipeline(&self.sky_pipeline);
            render_pass.set_bind_group(0, &self.camera_bind_group, &[]);
            render_pass.set_bind_group(1, &self.environment_bind_group, &[]);
            render_pass.draw(0..3, 0..1);
        }

        // NEW!
        // 应用色调映射
        self.hdr.process(&mut encoder, &view);

        self.app.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

pub fn main() -> Result<(), impl std::error::Error> {
    run::<WgpuApp>()
}
