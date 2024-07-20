use std::iter;
use std::sync::Arc;
use winit::{
    event::*,
    event_loop::{EventLoop, EventLoopWindowTarget},
    keyboard::{Key, NamedKey},
    window::{Window, WindowBuilder},
};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

struct State {
    window: Arc<Window>,
    surface: wgpu::Surface<'static>,
    _adapter: wgpu::Adapter,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
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

        let mut size = window.inner_size();
        size.width = size.width.max(1);
        size.height = size.height.max(1);
        let config = surface
            .get_default_config(&adapter, size.width, size.height)
            .unwrap();
        surface.configure(&device, &config);
        Self {
            window,
            surface,
            _adapter: adapter,
            device,
            queue,
            config,
            size,
        }
    }

    pub fn start(&mut self) {
        //  只有在进入事件循环之后，才有可能真正获取到窗口大小。
        let size = self.window.inner_size();
        self.resize(size);
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
        }
    }

    fn update(&mut self) {}

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
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.1,
                            g: 0.2,
                            b: 0.3,
                            a: 1.0,
                        }),
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

fn start_event_loop(state: State, window: Arc<Window>, event_loop: EventLoop<()>) {
    let mut state = state;
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
                        if physical_size.width == 0 || physical_size.height == 0 {
                            // 处理最小化窗口的事件
                            println!("Window minimized!");
                        } else {
                            state.resize(physical_size);
                            window.request_redraw();
                        }
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
        },
    );
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(start))]
pub async fn run() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
            console_log::init_with_level(log::Level::Warn).expect("Could't initialize logger");
        } else {
            env_logger::init();
        }
    }

    let event_loop = EventLoop::new().unwrap();
    let builder = WindowBuilder::new();
    let window = Arc::new(builder.build(&event_loop).unwrap());

    #[cfg(target_arch = "wasm32")]
    {
        // 在网页中，需要先添加 canvas 再初始化 State
        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .map(|doc| {
                let canvas = window.canvas().unwrap();
                let mut web_width = 800.0f32;
                let ratio = 1.0;
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
                let web_height = web_width / ratio;
                let scale_factor = window.scale_factor() as f32;
                canvas.set_width((web_width * scale_factor) as u32);
                canvas.set_height((web_height * scale_factor) as u32);
                canvas.style().set_css_text(
                    &(canvas.style().css_text()
                        + &format!("width: {}px; height: {}px", web_width, web_height)),
                );
            })
            .expect("Couldn't append canvas to document body.");

        // 创建 State 实例
        let state = State::new(window.clone()).await;

        wasm_bindgen_futures::spawn_local(async move {
            let run_closure =
                Closure::once_into_js(move || start_event_loop(state, window.clone(), event_loop));

            // 处理运行过程中抛出的 JS 异常。
            // 否则 wasm_bindgen_futures 队列将中断，且不再处理任何任务。
            if let Err(error) = call_catch(&run_closure) {
                let is_control_flow_exception =
                    error.dyn_ref::<js_sys::Error>().map_or(false, |e| {
                        e.message().includes("Using exceptions for control flow", 0)
                    });

                if !is_control_flow_exception {
                    web_sys::console::error_1(&error);
                }
            }

            #[wasm_bindgen]
            extern "C" {
                #[wasm_bindgen(catch, js_namespace = Function, js_name = "prototype.call.call")]
                fn call_catch(this: &JsValue) -> Result<(), JsValue>;
            }
        });
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        // 创建 State 实例
        let state = State::new(window.clone()).await;
        start_event_loop(state, window.clone(), event_loop);
    }
}

fn main() {
    pollster::block_on(run());
}
