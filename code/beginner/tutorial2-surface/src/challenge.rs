use std::iter;
use std::sync::Arc;
use winit::{
    event::*,
    event_loop::{EventLoop, EventLoopWindowTarget},
    keyboard::{Key, NamedKey},
    window::{Window, WindowBuilder},
};

struct State {
    window: Arc<Window>,
    #[allow(dead_code)]
    instance: wgpu::Instance,
    #[allow(dead_code)]
    adapter: wgpu::Adapter,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    clear_color: wgpu::Color,
}

impl State {
    async fn new(window: Arc<Window>) -> Self {
        // The instance is a handle to our GPU
        // BackendBit::PRIMARY => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::all(),
            ..Default::default()
        });
        let surface = instance.create_surface(window.clone()).unwrap();
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();

        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    label: None,
                    required_features: wgpu::Features::empty(),
                    // WebGL doesn't support all of wgpu's features, so if
                    // we're building for the web we'll have to disable some.
                    required_limits: if cfg!(target_arch = "wasm32") {
                        wgpu::Limits::downlevel_webgl2_defaults()
                    } else {
                        wgpu::Limits::default()
                    },
                    memory_hints: wgpu::MemoryHints::Performance,
                },
                // Some(&std::path::Path::new("trace")), // Trace path
                None,
            )
            .await
            .unwrap();

        let size = window.inner_size();
        let width = size.width.max(1);
        let height = size.height.max(1);
        let caps: wgpu::SurfaceCapabilities = surface.get_capabilities(&adapter);
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: caps.formats[0],
            width,
            height,
            present_mode: wgpu::PresentMode::Fifo,
            alpha_mode: wgpu::CompositeAlphaMode::Auto,
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };
        surface.configure(&device, &config);

        let clear_color = wgpu::Color::BLACK;

        Self {
            window,
            instance,
            adapter,
            surface,
            device,
            queue,
            config,
            clear_color,
            size,
        }
    }

    pub fn start(&mut self) {
        //  只有在进入事件循环之后，才有可能真正获取到窗口大小。
        let size = self.window.inner_size();
        self.resize(size);
    }

    fn input(&mut self, event: &WindowEvent) -> bool {
        match event {
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        state,
                        logical_key: Key::Named(NamedKey::Space),
                        ..
                    },
                ..
            } => {
                self.clear_color = if *state == ElementState::Released {
                    wgpu::Color::BLACK
                } else {
                    wgpu::Color::WHITE
                };
                true
            }
            _ => false,
        }
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config = self
                .surface
                .get_default_config(&self.adapter, new_size.width, new_size.height)
                .unwrap();
            self.surface.configure(&self.device, &self.config);
        }
    }

    fn update(&mut self) {}

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        let _render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(self.clear_color),
                    store: wgpu::StoreOp::Store,
                },
            })],
            ..Default::default()
        });
        drop(_render_pass);

        self.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

fn main() {
    pollster::block_on(run());
}

async fn run() {
    env_logger::init();
    let event_loop = EventLoop::new().unwrap();
    let window = Arc::new(WindowBuilder::new().build(&event_loop).unwrap());

    // State::new uses async code, so we're going to wait for it to finish
    let mut state = State::new(window.clone()).await;
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            use winit::platform::web::EventLoopExtWebSys;
            let event_loop_function = EventLoop::spawn;
        } else {
            let event_loop_function = EventLoop::run;
        }
    }
    let _ = (event_loop_function)(
        event_loop,
        move |event: Event<()>, elwt: &EventLoopWindowTarget<()>| {
            if event == Event::NewEvents(StartCause::Init) {
                state.start();
            }
            if let Event::WindowEvent { event, .. } = event {
                if !state.input(&event) {
                    match event {
                        WindowEvent::KeyboardInput {
                            event:
                                KeyEvent {
                                    logical_key: Key::Named(NamedKey::Escape),
                                    ..
                                },
                            ..
                        }
                        | WindowEvent::CloseRequested => elwt.exit(),
                        WindowEvent::Resized(physical_size) => {
                            state.resize(physical_size);
                            window.request_redraw();
                        }

                        WindowEvent::RedrawRequested => {
                            state.update();
                            match state.render() {
                                Ok(_) => {}
                                // 当展示平面的上下文丢失，就需重新配置
                                Err(wgpu::SurfaceError::Lost) => state.resize(state.size),
                                // 所有其他错误（过期、超时等）应在下一帧解决
                                Err(e) => eprintln!("{e:?}"),
                            }
                            // 除非我们手动请求，RedrawRequested 将只会触发一次。
                            window.request_redraw();
                        }
                        _ => {}
                    }
                }
            }
        },
    );
}
