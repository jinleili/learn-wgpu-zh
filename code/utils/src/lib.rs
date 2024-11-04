pub mod framework;
pub use framework::{run, WgpuAppAction};

pub mod load_texture;
pub use load_texture::{
    bilinear_sampler, default_sampler, mirror_repeate_sampler, repeate_sampler, AnyTexture,
};
pub mod node;

mod plane;
pub use plane::Plane;

mod buffer;
pub use buffer::BufferObj;

pub mod matrix_helper;
pub mod vertex;

mod color;
pub use color::*;

use bytemuck::{Pod, Zeroable};

pub static DEPTH_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Depth32Float;

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct MVPMatUniform {
    pub mvp: [[f32; 4]; 4],
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct SceneUniform {
    pub mvp: [[f32; 4]; 4],
    pub viewport_pixels: [f32; 2],
    pub padding: [f32; 2],
}

#[cfg(target_arch = "wasm32")]
pub(crate) fn application_root_dir() -> String {
    let location = web_sys::window().unwrap().location();
    let host = location.host().unwrap();
    if host.contains("localhost") || host.contains("127.0.0.1") {
        String::from("http://") + &host + "/"
    } else {
        if host.contains("jinleili.github.io") {
            location.href().unwrap()
        } else {
            String::from("https://cannot.access/")
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
pub(crate) fn application_root_dir() -> String {
    use std::env;
    use std::fs;

    match env::var("PROFILE") {
        Ok(_) => String::from(env!("CARGO_MANIFEST_DIR")),
        Err(_) => {
            let mut path = env::current_exe().expect("Failed to find executable path.");
            while let Ok(target) = fs::read_link(path.clone()) {
                path = target;
            }
            if cfg!(any(
                target_os = "macos",
                target_os = "windows",
                target_os = "linux"
            )) {
                path = path.join("../../../assets/").canonicalize().unwrap();
            }

            String::from(path.to_str().unwrap())
        }
    }
}

use std::path::PathBuf;
#[allow(unused)]
pub(crate) fn get_texture_file_path(name: &str) -> PathBuf {
    PathBuf::from(application_root_dir()).join(name)
}

// 根据不同平台初始化日志。
pub fn init_logger() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            // 使用查询字符串来获取日志级别。
            let query_string = web_sys::window().unwrap().location().search().unwrap();
            let query_level: Option<log::LevelFilter> = parse_url_query_string(&query_string, "RUST_LOG")
                .and_then(|x| x.parse().ok());

            // 我们将 wgpu 日志级别保持在错误级别，因为 Info 级别非常嘈杂。
            let base_level = query_level.unwrap_or(log::LevelFilter::Info);
            let wgpu_level = query_level.unwrap_or(log::LevelFilter::Error);

            // 在 web 上，我们使用 fern，因为 console_log 没有按模块级别过滤功能。
            fern::Dispatch::new()
                .level(base_level)
                .level_for("wgpu_core", wgpu_level)
                .level_for("wgpu_hal", wgpu_level)
                .level_for("naga", wgpu_level)
                .chain(fern::Output::call(console_log::log))
                .apply()
                .unwrap();
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        } else if #[cfg(target_os = "android")] {
            // 添加 Android 平台的日志初始化
            android_logger::init_once(
                android_logger::Config::default()
                    .with_max_level(log::LevelFilter::Info)
            );
            log_panics::init();
        } else {
            // parse_default_env 会读取 RUST_LOG 环境变量，并在这些默认过滤器之上应用它。
            env_logger::builder()
                .filter_level(log::LevelFilter::Info)
                .filter_module("wgpu_core", log::LevelFilter::Info)
                .filter_module("wgpu_hal", log::LevelFilter::Error)
                .filter_module("naga", log::LevelFilter::Error)
                .parse_default_env()
                .init();
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn parse_url_query_string<'a>(query: &'a str, search_key: &str) -> Option<&'a str> {
    let query_string = query.strip_prefix('?')?;

    for pair in query_string.split('&') {
        let mut pair = pair.split('=');
        let key = pair.next()?;
        let value = pair.next()?;

        if key == search_key {
            return Some(value);
        }
    }

    None
}

#[cfg(target_arch = "wasm32")]
use {
    std::sync::Arc,
    wasm_bindgen::{prelude::*, JsValue},
    winit::platform::web::WindowExtWebSys,
    winit::window::Window,
};

#[cfg(target_arch = "wasm32")]
pub fn string_from_js_value(value: &JsValue) -> String {
    value.as_string().unwrap_or_else(|| format!("{value:#?}"))
}

/// Install a `ResizeObserver` to observe changes to the size of the canvas.
///
/// This is the only way to ensure a canvas size change without an associated window `resize` event
/// actually results in a resize of the canvas.
///
/// The resize observer is called the by the browser at `observe` time, instead of just on the first actual resize.
/// We use that to trigger the first `request_animation_frame` _after_ updating the size of the canvas to the correct dimensions,
/// to avoid [#4622](https://github.com/emilk/egui/issues/4622).
#[cfg(target_arch = "wasm32")]
pub fn install_resize_observer(window: Arc<Window>) -> Result<(), JsValue> {
    let window_clone = window.clone();
    let closure = Closure::wrap(Box::new({
        move |entries: js_sys::Array| {
            let canvas = window.canvas().unwrap();
            let (width, height) = match crate::get_display_size(&entries) {
                Ok(v) => v,
                Err(err) => {
                    log::error!("{}", crate::string_from_js_value(&err));
                    return;
                }
            };
            // canvas.set_width(width);
            // canvas.set_height(height);

            // we rely on the resize observer to trigger the first `request_animation_frame`:
            log::info!(
                "resize observer 触发, 窗口大小: {:?}",
                (width, height, canvas.width(), canvas.height())
            );
            window.request_redraw();
        }
    }) as Box<dyn FnMut(js_sys::Array)>);

    let observer = web_sys::ResizeObserver::new(closure.as_ref().unchecked_ref())?;
    let options = web_sys::ResizeObserverOptions::new();
    options.set_box(web_sys::ResizeObserverBoxOptions::ContentBox);
    observer.observe_with_options(window_clone.canvas().unwrap().as_ref(), &options);
    std::mem::forget(observer);
    std::mem::forget(closure);

    Ok(())
}

#[cfg(target_arch = "wasm32")]
fn get_display_size(resize_observer_entries: &js_sys::Array) -> Result<(u32, u32), JsValue> {
    let width;
    let height;
    let mut dpr = web_sys::window().unwrap().device_pixel_ratio();

    let entry: web_sys::ResizeObserverEntry = resize_observer_entries.at(0).dyn_into()?;
    if JsValue::from_str("devicePixelContentBoxSize").js_in(entry.as_ref()) {
        // NOTE: Only this path gives the correct answer for most browsers.
        // Unfortunately this doesn't work perfectly everywhere.
        let size: web_sys::ResizeObserverSize =
            entry.device_pixel_content_box_size().at(0).dyn_into()?;
        width = size.inline_size();
        height = size.block_size();
        dpr = 1.0; // no need to apply
    } else if JsValue::from_str("contentBoxSize").js_in(entry.as_ref()) {
        let content_box_size = entry.content_box_size();
        let idx0 = content_box_size.at(0);
        if !idx0.is_undefined() {
            let size: web_sys::ResizeObserverSize = idx0.dyn_into()?;
            width = size.inline_size();
            height = size.block_size();
        } else {
            // legacy
            let size = JsValue::clone(content_box_size.as_ref());
            let size: web_sys::ResizeObserverSize = size.dyn_into()?;
            width = size.inline_size();
            height = size.block_size();
        }
    } else {
        // legacy
        let content_rect = entry.content_rect();
        width = content_rect.width();
        height = content_rect.height();
    }

    Ok(((width.round() * dpr) as u32, (height.round() * dpr) as u32))
}
