#[cfg(not(target_arch = "wasm32"))]
pub fn main() -> Result<(), impl std::error::Error> {
    utils::run::<wgpu_in_web::native_wrapper::WgpuAppNativeWrapper>("wgpu_in_web native wrapper")
}

#[cfg(target_arch = "wasm32")]
pub fn main() {}
