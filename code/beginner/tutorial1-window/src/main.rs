use winit::{
    event::*,
    event_loop::{EventLoop, EventLoopWindowTarget},
    keyboard::{Key, NamedKey},
    window::WindowBuilder,
};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

fn start_event_loop() {
    let event_loop = EventLoop::new().unwrap();
    let _window = WindowBuilder::new().build(&event_loop).unwrap();

    #[cfg(target_arch = "wasm32")]
    {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::platform::web::WindowExtWebSys;

        web_sys::window()
            .and_then(|win| win.document())
            .map(|doc| {
                let canvas = _window.canvas().unwrap();
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
                let canvas = _window.canvas().unwrap();
                let web_height = web_width;
                let scale_factor = _window.scale_factor() as f32;
                canvas.set_width((web_width * scale_factor) as u32);
                canvas.set_height((web_height * scale_factor) as u32);
                canvas.style().set_css_text(
                    &(canvas.style().css_text()
                        + &format!("width: {}px; height: {}px", web_width, web_height)),
                );
            })
            .expect("Couldn't append canvas to document body.");
    }

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
            if event == Event::NewEvents(StartCause::Init) { //事件启动阶段
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
                    _ => {}
                }
            }
        },
    );
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(start))]
pub fn run() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
            console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");
        } else {
            env_logger::init();
        }
    }

    #[cfg(target_arch = "wasm32")]
    {
        wasm_bindgen_futures::spawn_local(async {
            let run_closure = Closure::once_into_js(start_event_loop);

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
    start_event_loop();
}

fn main() {
    run();
}
