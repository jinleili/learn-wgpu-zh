use super::State;
use winit::{
    dpi::PhysicalSize,
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};

#[cfg(not(target_arch = "wasm32"))]
pub fn run(wh_ratio: Option<f32>) {
    env_logger::init();

    let (event_loop, instance) = pollster::block_on(create_action_instance(wh_ratio));
    start_event_loop(event_loop, instance);
}

#[cfg(target_arch = "wasm32")]
pub fn run(wh_ratio: Option<f32>) {
    use wasm_bindgen::prelude::*;

    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(log::Level::Warn).expect("无法初始化日志库");

    wasm_bindgen_futures::spawn_local(async move {
        let (event_loop, instance) = create_action_instance(wh_ratio).await;
        let run_closure = Closure::once_into_js(move || start_event_loop(event_loop, instance));

        // 处理运行过程中抛出的 JS 异常。
        // 否则 wasm_bindgen_futures 队列将中断，且不再处理任何任务。
        if let Err(error) = call_catch(&run_closure) {
            let is_control_flow_exception = error.dyn_ref::<js_sys::Error>().map_or(false, |e| {
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

async fn create_action_instance(wh_ratio: Option<f32>) -> (EventLoop<()>, State) {
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    // 计算一个默认显示高度
    let height = (if cfg!(target_arch = "wasm32") {
        550.0
    } else {
        600.0
    } * window.scale_factor()) as u32;

    let width = if let Some(ratio) = wh_ratio {
        (height as f32 * ratio) as u32
    } else {
        height
    };
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
                match doc.get_element_by_id("wasm-example") {
                    Some(dst) => {
                        let height = 500;
                        let width = (height as f32
                            * if let Some(ratio) = wh_ratio {
                                ratio
                            } else {
                                1.1
                            }) as u32;
                        let _ = window.request_inner_size(PhysicalSize::new(width, height));
                        let _ = dst.append_child(&web_sys::Element::from(window.canvas()));
                    }
                    None => {
                        let _ = window.request_inner_size(PhysicalSize::new(width, height));
                        let canvas = window.canvas();
                        canvas.style().set_css_text(
                            &(canvas.style().css_text()
                                + "background-color: black; display: block; margin: 20px auto;"),
                        );
                        doc.body()
                            .map(|body| body.append_child(&web_sys::Element::from(canvas)));
                    }
                };
            })
            .expect("Couldn't append canvas to document body.");
    };

    let app = app_surface::AppSurface::new(window).await;
    let instance = State::new(app).await;

    let adapter_info = instance.get_adapter_info();
    let gpu_info = format!(
        "正在使用 {}, 后端图形接口为 {:?}。",
        adapter_info.name, adapter_info.backend
    );
    #[cfg(not(target_arch = "wasm32"))]
    println!("{gpu_info}");
    #[cfg(target_arch = "wasm32")]
    log::warn!(
        "{gpu_info:?}\n这不是一条警告，仅仅是为了在控制台能默认打印出来而不必开启 info 日志等级。"
    );

    (event_loop, instance)
}

fn start_event_loop(event_loop: EventLoop<()>, state: State) {
    let mut state = state;
    let mut last_render_time = instant::Instant::now();
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
                            state.resize(&physical_size);
                        }
                    }
                    WindowEvent::RedrawRequested => {
                        let now = instant::Instant::now();
                        let dt = now - last_render_time;
                        last_render_time = now;
                        state.update(dt);

                        match state.render() {
                            Ok(_) => {}
                            // 当展示平面的上下文丢失，就需重新配置
                            Err(wgpu::SurfaceError::Lost) => eprintln!("Surface is lost"),
                            // 所有其他错误（过期、超时等）应在下一帧解决
                            Err(e) => eprintln!("{e:?}"),
                        }
                        // 除非我们手动请求，RedrawRequested 将只会触发一次。
                        state.request_redraw();
                    }
                    _ => {}
                }
            }
        },
    );
}
