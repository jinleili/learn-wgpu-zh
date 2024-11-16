use crate::wgpu_app::WgpuApp;
use app_surface::AppSurface;
use glam::{uvec2, vec2};
use utils::init_logger;
use wasm_bindgen::prelude::*;

// 创建 wgpu app 窗口
#[wasm_bindgen]
pub async fn create_wgpu_app(canvas_id: &str, handle: u32) -> u64 {
    init_logger();

    let app_surface = AppSurface::from_canvas(canvas_id, handle).await;
    let app = WgpuApp::new(app_surface).await;

    log::info!("wgpu app 创建成功");

    // 包装成无生命周期的指针
    Box::into_raw(Box::new(app)) as u64
}

/// 帧绘制
#[wasm_bindgen]
pub fn enter_frame(ptr: u64) {
    // 获取到指针指代的 Rust 对象的可变借用
    let app = unsafe { &mut *(ptr as *mut WgpuApp) };
    let _ = app.render();
}

/// canvas size 改变
#[wasm_bindgen]
pub fn resize_app(ptr: u64, width: u32, height: u32) {
    log::info!("resize_app: {}, {}", width, height);

    let app = unsafe { &mut *(ptr as *mut WgpuApp) };
    app.set_window_resized(uvec2(width, height));
}

/// 鼠标移动
#[wasm_bindgen]
pub fn on_mouse_move(ptr: u64, x: f32, y: f32) {
    let app = unsafe { &mut *(ptr as *mut WgpuApp) };
    app.cursor_moved(vec2(x, y));
}

/// 销毁 WgpuApp 实例
#[wasm_bindgen]
pub fn drop_wgpu_app(ptr: u64) {
    let _obj: Box<WgpuApp> = unsafe { Box::from_raw(ptr as *mut _) };
}
