use std::iter;
use std::rc::Rc;
use std::sync::{Arc, Mutex};
use winit::{
    application::ApplicationHandler,
    dpi::PhysicalSize,
    event::{ElementState, KeyEvent, StartCause, WindowEvent},
    event_loop::{ActiveEventLoop, ControlFlow, EventLoop},
    keyboard::KeyCode,
    keyboard::PhysicalKey,
    window::{Window, WindowId},
};

#[cfg(not(target_arch = "wasm32"))]
use std::time;
#[cfg(target_arch = "wasm32")]
use web_time as time;

const WAIT_TIME: time::Duration = time::Duration::from_millis(16);

struct WgpuApp {
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

impl WgpuApp {
    async fn new(window: Arc<Window>) -> Self {
        // 计算一个默认显示高度
        let height = 700 * window.scale_factor() as u32;
        let width = (height as f32 * 1.6) as u32;

        if cfg!(not(target_arch = "wasm32")) {
            let _ = window.request_inner_size(PhysicalSize::new(width, height));
        }

        #[cfg(target_arch = "wasm32")]
        {
            // Winit prevents sizing with CSS, so we have to set
            // the size manually when on web.
            use winit::platform::web::WindowExtWebSys;

            web_sys::window()
                .and_then(|win| win.document())
                .map(|doc| {
                    let canvas = window.canvas().unwrap();
                    let mut web_width = 800.0f32;
                    match doc.get_element_by_id("wasm-example") {
                        Some(dst) => {
                            web_width = dst.client_width() as f32;
                            let _ = dst.append_child(&web_sys::Element::from(canvas));
                        }
                        None => {
                            canvas.style().set_css_text(
                                "background-color: black; display: block; margin: 20px auto;",
                            );
                            doc.body()
                                .map(|body| body.append_child(&web_sys::Element::from(canvas)));
                        }
                    };
                    // winit 0.29 开始，通过 request_inner_size, canvas.set_width 都无法设置 canvas 的大小
                    let canvas = window.canvas().unwrap();
                    let web_height = web_width;
                    let scale_factor = window.scale_factor() as f32;
                    canvas.set_width((web_width * scale_factor) as u32);
                    canvas.set_height((web_height * scale_factor) as u32);
                    canvas.style().set_css_text(
                        &(canvas.style().css_text()
                            + &format!("width: {}px; height: {}px", web_width, web_height)),
                    );
                })
                .expect("Couldn't append canvas to document body.");
        }

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

        let mut size = window.inner_size();
        size.width = size.width.max(1);
        size.height = size.height.max(1);
        let config = surface
            .get_default_config(&adapter, size.width, size.height)
            .unwrap();
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

    fn input(&mut self, event: &WindowEvent) -> bool {
        match event {
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        physical_key: PhysicalKey::Code(KeyCode::Space),
                        state,
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
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
        }
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        if self.size.width == 0 || self.size.height == 0 {
            return Ok(());
        }
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        {
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
        }

        self.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
enum Mode {
    #[default]
    Wait,
    WaitUntil,
}

#[derive(Default)]
struct WgpuAppHandler {
    mode: Mode,
    wait_cancelled: bool,
    close_requested: bool,
    app: Rc<Mutex<Option<WgpuApp>>>,
}

impl ApplicationHandler for WgpuAppHandler {
    fn new_events(&mut self, _event_loop: &ActiveEventLoop, cause: StartCause) {
        self.wait_cancelled = match cause {
            StartCause::WaitCancelled { .. } => self.mode == Mode::WaitUntil,
            StartCause::Init => false,
            _ => false,
        }
    }

    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        // 恢复事件
        if self.app.as_ref().lock().unwrap().is_some() {
            return;
        }

        let window_attributes = Window::default_attributes().with_title("tutorial1-window");
        let window = Arc::new(event_loop.create_window(window_attributes).unwrap());
        cfg_if::cfg_if! {
            if #[cfg(target_arch = "wasm32")] {
                let app = self.app.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    let wgpu_app = WgpuApp::new(window).await;

                    let mut app = app.lock().unwrap();
                    *app = Some(wgpu_app);
                });
            } else {
                let wgpu_app = pollster::block_on(WgpuApp::new(window));
                self.app.lock().unwrap().replace(wgpu_app);
            }
        }
    }

    fn suspended(&mut self, _event_loop: &ActiveEventLoop) {
        // 暂停事件
    }

    fn window_event(
        &mut self,
        _event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        event: WindowEvent,
    ) {
        let mut app = self.app.lock().unwrap();
        if app.as_ref().is_none() {
            return;
        }

        // 窗口事件
        match event {
            WindowEvent::CloseRequested => {
                self.close_requested = true;
            }
            WindowEvent::Resized(physical_size) => {
                if physical_size.width == 0 || physical_size.height == 0 {
                    // 处理最小化窗口的事件
                    println!("Window minimized!");
                } else {
                    let app = app.as_mut().unwrap();
                    app.resize(physical_size);

                    // 请求重绘, Web 环境下需要手动请求
                    app.window.request_redraw();
                }
            }
            WindowEvent::KeyboardInput { .. } => {
                // 键盘事件
                app.as_mut().unwrap().input(&event);

                // 请求重绘, Web 环境下需要手动请求
                app.as_mut().unwrap().window.request_redraw();
            }
            WindowEvent::RedrawRequested => {
                // surface 重绘事件
                let app = app.as_mut().unwrap();
                match app.render() {
                    Ok(_) => {}
                    // 当展示平面的上下文丢失，就需重新配置
                    Err(wgpu::SurfaceError::Lost) => app.resize(app.size),
                    // 所有其他错误（过期、超时等）应在下一帧解决
                    Err(e) => eprintln!("{e:?}"),
                }
                // 除非我们手动请求，RedrawRequested 将只会触发一次。
                app.window.request_redraw();
            }
            _ => (),
        }
    }

    fn about_to_wait(&mut self, event_loop: &ActiveEventLoop) {
        match self.mode {
            Mode::Wait => event_loop.set_control_flow(ControlFlow::Wait),
            Mode::WaitUntil => {
                if !self.wait_cancelled {
                    event_loop
                        .set_control_flow(ControlFlow::WaitUntil(time::Instant::now() + WAIT_TIME));
                }
            }
        };

        if self.close_requested {
            event_loop.exit();
        }
    }
}

fn main() -> Result<(), impl std::error::Error> {
    utils::init_logger();

    let events_loop = EventLoop::new().unwrap();
    let mut app = WgpuAppHandler::default();
    events_loop.run_app(&mut app)
}
