use app_surface::{
    web::{app_surface_from_canvas, AppSurface},
    SurfaceFrame,
};
use utils::init_logger;
use wasm_bindgen::prelude::*;
use wgpu_app::WgpuApp;

mod wgpu_app;

// 创建 wgpu app 窗口
#[wasm_bindgen]
pub async fn create_wgpu_app(canvas_id: &str, handle: u32) -> u64 {
    init_logger();

    let app_surface = app_surface_from_canvas(canvas_id, handle).await;
    let app = WgpuApp::new(app_surface);

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
