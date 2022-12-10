use winit::{
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::{WindowBuilder, WindowId},
};

pub trait Action {
    fn new(app: app_surface::AppSurface) -> Self;
    fn get_adapter_info(&self) -> wgpu::AdapterInfo;
    fn current_window_id(&self) -> WindowId;
    fn resize(&mut self);
    fn request_redraw(&mut self);
    fn input(&mut self, _event: &WindowEvent) -> bool {
        false
    }
    fn update(&mut self) {}
    fn render(&mut self) -> Result<(), wgpu::SurfaceError>;
}

#[cfg(not(target_arch = "wasm32"))]
pub fn run<A: Action + 'static>(wh_ratio: Option<f32>) {
    env_logger::init();

    let (event_loop, instance) = pollster::block_on(create_action_instance::<A>(wh_ratio));
    start_event_loop::<A>(event_loop, instance);
}

#[cfg(target_arch = "wasm32")]
pub fn run<A: Action + 'static>(wh_ratio: Option<f32>) {
    use wasm_bindgen::{prelude::*, JsCast};

    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(log::Level::Warn).expect("无法初始化日志库");

    wasm_bindgen_futures::spawn_local(async move {
        let (event_loop, instance) = create_action_instance::<A>(wh_ratio).await;
        let run_closure =
            Closure::once_into_js(move || start_event_loop::<A>(event_loop, instance));

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

async fn create_action_instance<A: Action + 'static>(wh_ratio: Option<f32>) -> (EventLoop<()>, A) {
    use winit::dpi::PhysicalSize;

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
        window.set_inner_size(PhysicalSize::new(width, height));
    }
    
    #[cfg(target_arch = "wasm32")]
    {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| {
                match doc.get_element_by_id("wasm-example") {
                    Some(dst) => {
                        let height = 500;
                        let width = (height as f32
                            * if let Some(ratio) = wh_ratio {
                                ratio
                            } else {
                                1.1
                            }) as u32;
                        window.set_inner_size(PhysicalSize::new(width, height));
                        let _ = dst.append_child(&web_sys::Element::from(window.canvas()));
                    }
                    None => {
                        window.set_inner_size(PhysicalSize::new(width, height));
                        let canvas = window.canvas();
                        canvas.style().set_css_text(
                            &(canvas.style().css_text()
                                + "background-color: black; display: block; margin: 20px auto;"),
                        );
                        doc.body().and_then(|body| {
                            Some(body.append_child(&web_sys::Element::from(canvas)))
                        });
                    }
                };
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    };

    let app = app_surface::AppSurface::new(window).await;
    let instance = A::new(app);

    let adapter_info = instance.get_adapter_info();
    let gpu_info = format!(
        "正在使用 {}, 后端图形接口为 {:?}。",
        adapter_info.name, adapter_info.backend
    );
    #[cfg(not(target_arch = "wasm32"))]
    println!("{}", gpu_info);
    #[cfg(target_arch = "wasm32")]
    log::warn!(
        "{}\n这不是一条警告，仅仅是为了在控制台能默认打印出来而不需要开启烦人的 info 日志等级。",
        gpu_info
    );

    (event_loop, instance)
}

fn start_event_loop<A: Action + 'static>(event_loop: EventLoop<()>, instance: A) {
    let mut state = instance;
    event_loop.run(move |event, _, control_flow| {
        match event {
            Event::WindowEvent {
                ref event,
                window_id,
            } if window_id == state.current_window_id() => {
                if !state.input(event) {
                    match event {
                        WindowEvent::CloseRequested
                        | WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Escape),
                                    ..
                                },
                            ..
                        } => *control_flow = ControlFlow::Exit,
                        WindowEvent::Resized(_physical_size) => {
                            state.resize();
                        }
                        WindowEvent::ScaleFactorChanged { .. } => {
                            // new_inner_size is &mut so w have to dereference it twice
                            state.resize();
                        }
                        _ => {}
                    }
                }
            }
            Event::RedrawRequested(window_id) if window_id == state.current_window_id() => {
                state.update();
                match state.render() {
                    Ok(_) => {}
                    // 当展示平面的上下文丢失，就需重新配置
                    Err(wgpu::SurfaceError::Lost) => state.resize(),
                    // 系统内存不足时，程序应该退出。
                    Err(wgpu::SurfaceError::OutOfMemory) => *control_flow = ControlFlow::Exit,
                    // 所有其他错误（过期、超时等）应在下一帧解决
                    Err(e) => eprintln!("{:?}", e),
                }
            }
            Event::MainEventsCleared => {
                // 除非我们手动请求，RedrawRequested 将只会触发一次。
                state.request_redraw();
            }
            _ => {}
        }
    });
}
