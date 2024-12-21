mod particle_gen;
mod particle_ink;
pub mod wgpu_app;

#[cfg(target_arch = "wasm32")]
mod web_ffi;
#[cfg(target_arch = "wasm32")]
pub use web_ffi::*;

#[cfg(not(target_arch = "wasm32"))]
pub mod native_wrapper;
