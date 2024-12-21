use std::sync::Arc;

use crate::wgpu_app::WgpuApp;
use app_surface::AppSurface;
use glam::{uvec2, vec2};
use utils::WgpuAppAction;
use winit::{
    dpi::{PhysicalPosition, PhysicalSize},
    window::Window,
};

/// 包装成可本地使用运行的 wgpu + winit App
pub struct WgpuAppNativeWrapper {
    app: WgpuApp,
}

impl WgpuAppAction for WgpuAppNativeWrapper {
    async fn new(window: Arc<Window>) -> Self {
        // 创建 wgpu 应用
        let app_surface = AppSurface::new(window).await;

        let app = WgpuApp::new(app_surface).await;

        Self { app }
    }

    fn set_window_resized(&mut self, new_size: PhysicalSize<u32>) {
        self.app
            .set_window_resized(uvec2(new_size.width, new_size.height));
    }

    fn get_size(&self) -> PhysicalSize<u32> {
        let size = self.app.get_size();
        PhysicalSize::new(size.x, size.y)
    }

    fn cursor_move(&mut self, position: PhysicalPosition<f64>) -> bool {
        self.app
            .cursor_moved(vec2(position.x as f32, position.y as f32));
        true
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        self.app.render()
    }
}
