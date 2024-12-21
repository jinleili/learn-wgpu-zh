#[cfg(not(target_arch = "wasm32"))]
pub fn main() -> Result<(), impl std::error::Error> {
    utils::run::<wgpu_in_web::native_wrapper::WgpuAppNativeWrapper>("wgpu_in_web native wrapper")
}

#[cfg(target_arch = "wasm32")]
pub fn main() {}

// 从 learn-wgpu-zh 根目录中运行 build-wasm.sh 编译 wgpu_in_web 时，须要在此导出 web_ffi 模块
#[cfg(target_arch = "wasm32")]
pub use wgpu_in_web::*;
