use parking_lot::Mutex;
use std::sync::Arc;
use wgpu::WasmNotSend;
use winit::{
    application::ApplicationHandler,
    dpi::{PhysicalPosition, PhysicalSize},
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
    fn new(window: Arc<Window>) -> impl core::future::Future<Output = Self> + WasmNotSend;

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

    fn cursor_move(&mut self, _position: PhysicalPosition<f64>) -> bool {
        false
    }

    /// 鼠标移动/触摸事件
    fn device_input(&mut self, _event: &DeviceEvent) -> bool {
        false
    }

    /// 更新渲染数据
    fn update(&mut self, _dt: instant::Duration) {}

    /// 提交渲染
    fn render(&mut self) -> Result<(), wgpu::SurfaceError>;
}

struct WgpuAppHandler<A: WgpuAppAction> {
    window: Option<Arc<Window>>,
    title: &'static str,
    app: Arc<Mutex<Option<A>>>,
    /// 错失的窗口大小变化
    ///
    /// # NOTE：
    /// 在 web 端，app 的初始化是异步的，当收到 resized 事件时，初始化可能还没有完成从而错过窗口 resized 事件，
    /// 当 app 初始化完成后会调用 `set_window_resized` 方法来补上错失的窗口大小变化事件。
    #[allow(dead_code)]
    missed_resize: Arc<Mutex<Option<PhysicalSize<u32>>>>,

    /// 上次执行渲染的时间
    last_render_time: instant::Instant,
}

impl<A: WgpuAppAction> WgpuAppHandler<A> {
    fn new(title: &'static str) -> Self {
        Self {
            title,
            window: None,
            app: Arc::new(Mutex::new(None)),
            missed_resize: Arc::new(Mutex::new(None)),
            last_render_time: instant::Instant::now(),
        }
    }
    /// 配置窗口
    fn config_window(&mut self) {
        let window = self.window.as_mut().unwrap();
        window.set_title(self.title);
        if cfg!(not(target_arch = "wasm32")) {
            // 计算一个默认显示高度
            let height = 600 * window.scale_factor() as u32;
            let width = height;
            let _ = window.request_inner_size(PhysicalSize::new(width, height));
        }

        #[cfg(target_arch = "wasm32")]
        {
            let canvas = window.canvas().unwrap();

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
                .expect("无法将 canvas 添加到当前网页中");

            // 确保画布可以获得焦点
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
            canvas.set_tab_index(0);

            // 设置画布获得焦点时不显示高亮轮廓
            let style = canvas.style();
            style.set_property("outline", "none").unwrap();
            canvas.focus().expect("画布无法获取焦点");
        }
    }

    /// 在提交渲染之前通知窗口系统。
    fn pre_present_notify(&self) {
        if let Some(window) = self.window.as_ref() {
            window.pre_present_notify();
        }
    }

    /// 请求重绘    
    fn request_redraw(&self) {
        if let Some(window) = self.window.as_ref() {
            window.request_redraw();
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

        self.window = Some(window.clone());
        self.config_window();

        cfg_if::cfg_if! {
            if #[cfg(target_arch = "wasm32")] {
                let app = self.app.clone();
                let missed_resize = self.missed_resize.clone();

                wasm_bindgen_futures::spawn_local(async move {
                     let window_cloned = window.clone();

                    let wgpu_app = A::new(window).await;
                    let mut app = app.lock();
                    *app = Some(wgpu_app);

                    if let Some(resize) = *missed_resize.lock() {
                        app.as_mut().unwrap().set_window_resized(resize);
                        window_cloned.request_redraw();
                    }
                });
            } else {
                let wgpu_app = pollster::block_on(A::new(window));
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
        let mut app = self.app.lock();
        if app.as_ref().is_none() {
            // 如果 app 还没有初始化完成，则记录错失的窗口事件
            if let WindowEvent::Resized(physical_size) = event
                && physical_size.width > 0
                && physical_size.height > 0
            {
                let mut missed_resize = self.missed_resize.lock();
                *missed_resize = Some(physical_size);
            }
            return;
        }

        let app = app.as_mut().unwrap();

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

                    app.set_window_resized(physical_size);
                }
            }
            WindowEvent::KeyboardInput { event, .. } => {
                // 键盘事件
                let _ = app.keyboard_input(&event);
            }
            WindowEvent::MouseWheel { delta, phase, .. } => {
                // 鼠标滚轮事件
                let _ = app.mouse_wheel(delta, phase);
            }
            WindowEvent::MouseInput { button, state, .. } => {
                // 鼠标点击事件
                let _ = app.mouse_click(state, button);
            }
            WindowEvent::CursorMoved { position, .. } => {
                // 鼠标移动事件
                let _ = app.cursor_move(position);
            }
            WindowEvent::RedrawRequested => {
                // surface 重绘事件
                let now = instant::Instant::now();
                let dt = now - self.last_render_time;
                self.last_render_time = now;

                app.update(dt);

                self.pre_present_notify();

                match app.render() {
                    Ok(_) => {}
                    // 当展示平面的上下文丢失，就需重新配置
                    Err(wgpu::SurfaceError::Lost) => eprintln!("Surface is lost"),
                    // 所有其他错误（过期、超时等）应在下一帧解决
                    Err(e) => eprintln!("{e:?}"),
                }

                // 除非我们手动请求，RedrawRequested 将只会触发一次。
                self.request_redraw();
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

pub fn run<A: WgpuAppAction + 'static>(title: &'static str) -> Result<(), impl std::error::Error> {
    crate::init_logger();

    let events_loop = EventLoop::new().unwrap();
    let mut app = WgpuAppHandler::<A>::new(title);
    events_loop.run_app(&mut app)
}
