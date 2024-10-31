use std::rc::Rc;
use std::sync::{Arc, Mutex};
use std::thread;
use winit::dpi::PhysicalSize;
use winit::error::EventLoopError;
use winit::{
    application::ApplicationHandler,
    event::{ElementState, KeyEvent, StartCause, WindowEvent},
    event_loop::{ActiveEventLoop, ControlFlow, EventLoop},
    keyboard::PhysicalKey,
    window::{Window, WindowId},
};
#[cfg(target_arch = "wasm32")]
use {
    wasm_bindgen::{prelude::*, JsCast},
    web_time as time,
};

#[cfg(not(target_arch = "wasm32"))]
use std::time;

const WAIT_TIME: time::Duration = time::Duration::from_millis(16);
const POLL_SLEEP_TIME: time::Duration = time::Duration::from_millis(16);

struct WgpuApp {
    window: Arc<Window>,
}

#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
enum Mode {
    Wait,
    WaitUntil,
    #[default]
    Poll,
}

#[derive(Default)]
struct WgpuAppHandler {
    mode: Mode,
    wait_cancelled: bool,
    close_requested: bool,
    app: Rc<Mutex<Option<WgpuApp>>>,
}

impl WgpuAppHandler {
    fn create_app(&mut self, window: Arc<Window>) {
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

        self.app.lock().unwrap().replace(WgpuApp {
            window: window.clone(),
        });
    }
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

        self.create_app(window);
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
        // 窗口事件
        match event {
            WindowEvent::CloseRequested => {
                self.close_requested = true;
            }
            WindowEvent::Resized(_size) => {
                // 窗口大小改变
            }
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        physical_key: PhysicalKey::Code(..),
                        state: ElementState::Pressed,
                        ..
                    },
                ..
            } => {
                // 键盘事件
            }
            WindowEvent::RedrawRequested => {
                // surface重绘事件
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
            Mode::Poll => {
                thread::sleep(POLL_SLEEP_TIME);
                event_loop.set_control_flow(ControlFlow::Poll);
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
