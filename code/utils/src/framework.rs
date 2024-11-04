use parking_lot::Mutex;
use std::{rc::Rc, sync::Arc};
use wgpu::WasmNotSend;
use winit::{
    application::ApplicationHandler,
    dpi::PhysicalSize,
    event::{
        DeviceEvent, DeviceId, ElementState, KeyEvent, MouseButton, MouseScrollDelta, TouchPhase,
        WindowEvent,
    },
    event_loop::{ActiveEventLoop, EventLoop},
    window::{Window, WindowId},
};

#[cfg(target_arch = "wasm32")]
use winit::platform::web::WindowExtWebSys;

pub trait WgpuAppAction {
    #[allow(opaque_hidden_inferred_bound)]
    fn new(window: Arc<Window>) -> impl std::future::Future<Output = Self> + WasmNotSend;

    /// 配置窗口
    fn config_window(window: Arc<Window>, title: &str) {
        window.set_title(title);
        if cfg!(not(target_arch = "wasm32")) {
            // 计算一个默认显示高度
            let height = 700 * window.scale_factor() as u32;
            let width = height;
            let _ = window.request_inner_size(PhysicalSize::new(width, height));
        }

        #[cfg(target_arch = "wasm32")]
        {
            let canvas = window.canvas().unwrap();

            // 将 canvas 添加到当前网页中
            // 将 canvas 添加到当前网页中
            web_sys::window()
                .and_then(|win| win.document())
                .map(|doc| {
                    let _ = canvas.set_attribute("id", "winit-canvas");
                    match doc.get_element_by_id("wgpu-app-container") {
                        Some(dst) => {
                            let _ = dst.append_child(canvas.as_ref());
                        }
                        None => {
                            let container = doc.create_element("div").unwrap();
                            let _ = container.set_attribute("id", "wgpu-app-container");
                            let _ = container.append_child(canvas.as_ref());

                            doc.body().map(|body| body.append_child(container.as_ref()));
                        }
                    };
                })
                .expect("Couldn't append canvas to document body.");

            // 确保画布可以获得焦点
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
            canvas.set_tab_index(0);

            // 当画布获得焦点时不显示高亮轮廓
            let style = canvas.style();
            style.set_property("outline", "none").unwrap();
            canvas.focus().expect("画布无法获取焦点");

            // 记录 winit 0.30 在 web 下的问题：
            // - 通过 css设置 canvas 的宽高不一致时，winit 有很高的概率不会触发 resized 事件, 手动 resize 浏览器窗口后恢复;
            // - 不设置高度或设置为 100% 时，canvas 的 height 会自动变为与宽度一致的（正方形）;

            // 设置 canvas 的宽高比
            // style.set_property("aspect-ratio", "auto 3/4").unwrap();

            // style.set_property("width", "100%").unwrap();
            // style.set_property("height", "auto").unwrap();

            // match Self::install_resize_observer(window.clone()) {
            //     Ok(_) => (),
            //     Err(err) => log::error!(
            //         "resize observer 监听失败: {}",
            //         crate::string_from_js_value(&err)
            //     ),
            // }
        }
    }

    /// 记录窗口大小已发生变化
    ///
    /// # NOTE:
    /// 当缩放浏览器窗口时, 窗口大小会以高于渲染帧率的频率发生变化，
    /// 如果窗口 size 发生变化就立即调整 surface 大小, 会导致缩放浏览器窗口大小时渲染画面闪烁。
    fn set_window_resized(&mut self, new_size: PhysicalSize<u32>);
    /// 获取窗口大小    
    fn get_size(&self) -> PhysicalSize<u32>;

    /// 键盘事件
    fn keyboard_input(&mut self, _event: &KeyEvent) -> bool {
        false
    }

    fn mouse_click(&mut self, _state: ElementState, _button: MouseButton) -> bool {
        false
    }

    fn mouse_wheel(&mut self, _delta: MouseScrollDelta, _phase: TouchPhase) -> bool {
        false
    }

    /// 鼠标移动/触摸事件
    fn device_input(&mut self, _event: &DeviceEvent) -> bool {
        false
    }

    /// 更新渲染数据
    fn update(&mut self, _dt: instant::Duration) {}

    /// 在提交渲染之前通知窗口系统。
    fn pre_present_notify(&self);
    /// 提交渲染
    fn render(&mut self) -> Result<(), wgpu::SurfaceError>;
    /// 请求重绘    
    fn request_redraw(&self);
}

struct WgpuAppHandler<A: WgpuAppAction> {
    app: Rc<Mutex<Option<A>>>,
    last_render_time: instant::Instant,
}

impl<A: WgpuAppAction> Default for WgpuAppHandler<A> {
    fn default() -> Self {
        Self {
            app: Rc::new(Mutex::new(None)),
            last_render_time: instant::Instant::now(),
        }
    }
}

impl<A: WgpuAppAction + 'static> ApplicationHandler for WgpuAppHandler<A> {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        // 恢复事件
        if self.app.as_ref().lock().is_some() {
            return;
        }

        self.last_render_time = instant::Instant::now();

        let window_attributes = Window::default_attributes();
        let window = Arc::new(event_loop.create_window(window_attributes).unwrap());
        let window_clone = window.clone();

        cfg_if::cfg_if! {
            if #[cfg(target_arch = "wasm32")] {
                let app = self.app.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    let wgpu_app = A::new(window).await;

                    let mut app = app.lock();
                    *app = Some(wgpu_app);
                });
            } else {
                let wgpu_app = pollster::block_on(A::new(window));
                self.app.lock().replace(wgpu_app);
            }
        }
        window_clone.request_redraw();
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
        let mut app = self.app.lock();
        if app.as_ref().is_none() {
            return;
        }

        // 窗口事件
        match event {
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }
            WindowEvent::Resized(physical_size) => {
                if physical_size.width == 0 || physical_size.height == 0 {
                    // 处理最小化窗口的事件
                    log::info!("Window minimized!");
                } else {
                    log::info!("Window resized: {:?}", physical_size);

                    let app = app.as_mut().unwrap();
                    app.set_window_resized(physical_size);
                }
            }
            WindowEvent::KeyboardInput { event, .. } => {
                // 键盘事件
                let _ = app.as_mut().unwrap().keyboard_input(&event);
            }
            WindowEvent::MouseWheel { delta, phase, .. } => {
                // 鼠标滚轮事件
                let _ = app.as_mut().unwrap().mouse_wheel(delta, phase);
            }
            WindowEvent::MouseInput { button, state, .. } => {
                // 鼠标点击事件
                let _ = app.as_mut().unwrap().mouse_click(state, button);
            }
            WindowEvent::RedrawRequested => {
                // surface 重绘事件
                let now = instant::Instant::now();
                let dt = now - self.last_render_time;
                self.last_render_time = now;

                let app = app.as_mut().unwrap();
                app.update(dt);

                app.pre_present_notify();

                match app.render() {
                    Ok(_) => {}
                    // 当展示平面的上下文丢失，就需重新配置
                    Err(wgpu::SurfaceError::Lost) => eprintln!("Surface is lost"),
                    // 所有其他错误（过期、超时等）应在下一帧解决
                    Err(e) => eprintln!("{e:?}"),
                }

                // 除非我们手动请求，RedrawRequested 将只会触发一次。
                app.request_redraw();
            }
            _ => (),
        }
    }

    fn device_event(
        &mut self,
        _event_loop: &ActiveEventLoop,
        _device_id: DeviceId,
        event: DeviceEvent,
    ) {
        if let Some(app) = self.app.lock().as_mut() {
            app.device_input(&event);
        }
    }
}

pub fn run<A: WgpuAppAction + 'static>() -> Result<(), impl std::error::Error> {
    crate::init_logger();

    let events_loop = EventLoop::new().unwrap();
    let mut app = WgpuAppHandler::<A>::default();
    events_loop.run_app(&mut app)
}
