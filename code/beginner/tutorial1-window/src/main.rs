use parking_lot::Mutex;
use std::rc::Rc;
use winit::dpi::PhysicalSize;
use winit::{
    application::ApplicationHandler,
    event::WindowEvent,
    event_loop::{ActiveEventLoop, EventLoop},
    window::{Window, WindowId},
};

struct WgpuApp {
    /// 避免窗口被释放
    #[allow(unused)]
    window: Window,
}

impl WgpuApp {
    async fn new(window: Window) -> Self {
        if cfg!(not(target_arch = "wasm32")) {
            // 计算一个默认显示高度
            let height = 700 * window.scale_factor() as u32;
            let width = (height as f32 * 1.6) as u32;
            let _ = window.request_inner_size(PhysicalSize::new(width, height));
        }

        #[cfg(target_arch = "wasm32")]
        {
            use winit::platform::web::WindowExtWebSys;

            let canvas = window.canvas().unwrap();

            // 将 canvas 添加到当前网页中
            web_sys::window()
                .and_then(|win| win.document())
                .map(|doc| {
                    let _ = canvas.set_attribute("id", "winit-canvas");
                    match doc.get_element_by_id("wasm-example") {
                        Some(dst) => {
                            let _ = dst.append_child(canvas.as_ref());
                        }
                        None => {
                            doc.body().map(|body| body.append_child(canvas.as_ref()));
                        }
                    };
                })
                .expect("Couldn't append canvas to document body.");

            // 确保画布可以获得焦点
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
            canvas.set_tab_index(0);

            let style = canvas.style();
            // 当画布获得焦点时不显示高亮轮廓
            style.set_property("outline", "none").unwrap();
            canvas.focus().expect("画布无法获取焦点");
        }
        Self { window }
    }
}

#[derive(Default)]
struct WgpuAppHandler {
    app: Rc<Mutex<Option<WgpuApp>>>,
}

impl ApplicationHandler for WgpuAppHandler {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        // 恢复事件
        if self.app.as_ref().lock().is_some() {
            return;
        }

        let window_attributes = Window::default_attributes().with_title("tutorial1-window");
        let window = event_loop.create_window(window_attributes).unwrap();

        cfg_if::cfg_if! {
            if #[cfg(target_arch = "wasm32")] {
                let app = self.app.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    let wgpu_app = WgpuApp::new(window).await;

                    let mut app = app.lock();
                    *app = Some(wgpu_app);
                });
            } else {
                let wgpu_app = pollster::block_on(WgpuApp::new(window));
                self.app.lock().replace(wgpu_app);
            }
        }
    }

    fn suspended(&mut self, _event_loop: &ActiveEventLoop) {
        // 暂停事件
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        event: WindowEvent,
    ) {
        // 窗口事件
        match event {
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }
            WindowEvent::Resized(_size) => {
                // 窗口大小改变
            }
            WindowEvent::KeyboardInput { .. } => {
                // 键盘事件
            }
            WindowEvent::RedrawRequested => {
                // surface重绘事件
            }
            _ => (),
        }
    }
}

fn main() -> Result<(), impl std::error::Error> {
    utils::init_logger();

    let events_loop = EventLoop::new().unwrap();
    let mut app = WgpuAppHandler::default();
    events_loop.run_app(&mut app)
}
