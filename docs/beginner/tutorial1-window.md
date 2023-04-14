# 依赖与窗口
部分读者可能已经熟悉如何在 Rust 中打开窗口程序，且有自己偏好的窗口管理库。但本教程是为所有人设计的，所以不免要涉及这部分的内容。所幸你可以跳过这部分，但有一点值得了解，即无论使用什么样的窗口解决方案，都需要实现 [raw-window-handle](https://github.com/rust-windowing/raw-window-handle) 里定义的 `raw_window_handle()` 及 `raw_display_handle()` 两个抽象接口。如果有兴趣自己动手来为 wgpu 实现一个基础的窗口，可以参考 [wgpu-in-app](https://github.com/jinleili/wgpu-in-app)，[与 Android App 集成](../integration-and-debugging/android/)这一章节也有详情的介绍。

## 我们要使用哪些包?
我们将尽量保持基础部分的简单性。后续我们会逐渐添加依赖，先列出相关的 `Cargo.toml` 依赖项如下：

```toml
[dependencies]
winit = "0.27.5"
env_logger = "0.9"
log = "0.4"
wgpu = "0.15"
```

## 使用 Rust 的新版解析器
自 0.10 版本起，wgpu 需要使用 cargo 的 [新版特性解析器](https://doc.rust-lang.org/cargo/reference/resolver.html#feature-resolver-version-2)，这在 Rust 的 2021 edition（即任何基于 Rust 1.56.0 或更新版本的新项目）中是默认启用的。但如果你仍在使用 2018 edition，那么就需要在单**包**项目 `Cargo.toml` 的 `[package]` 配置中，或者在**⼯作空间**的根级 `Cargo.toml` 的 `[workspace]` 配置中添加 `resolver = "2"` 项。

## 关于 env_logger
通过 `env_logger::init()` 来启用日志是非常重要的。当 wgpu 遇到各类错误时，它都会用一条通用性的消息抛出 panic，并通过日志**包**来记录实际的错误信息。
也就是说，如果不添加 `env_logger::init()`，wgpu 将静默地退出，从而令你非常困惑！
(下面的代码中已经启用)

## 创建一个新项目
运行 `cargo new xxx`，xxx 是指你的项目名称。
(下面的例子中我使用了 `tutorial1_window`)

## 示例代码
这一部分没有什么特别之处，所以直接贴出完整的代码。只需将其粘贴到你的 `main.rs` 中即可：

```rust
use winit::{
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};

pub fn run() {
    env_logger::init();
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    event_loop.run(move |event, _, control_flow| match event {
        Event::WindowEvent {
            ref event,
            window_id,
        } if window_id == window.id() => match event {
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
            _ => {}
        },
        _ => {}
    });
}

```

上述代码所做的全部工作就是创建了一个窗口，并在用户关闭或按下 escape 键前使其保持打开。接下来，我们需要在**入口函数**中运行这些代码。很简单，只需在 `main()` 函数中调用 `run()`，然后运行!

```rust
fn main() {
    run();
}
```

(其中 `tutorial1_window` 是你之前用 cargo 创建的项目的名称)

当你只打算支持桌面环境时，上边这些就是全部所要做的！在下一个教程中，我们将真正开始使用 wgpu！

## 添加对 web 的支持
如果讲完了这个关于 WebGPU 的教程，却不提如何在 web 上使用它，那么这个教程就是不完整的。幸运的是，让一个 wgpu 程序在浏览器中运行并不难。

让我们从修改 `Cargo.toml` 开始：

```toml
[lib]
crate-type = ["cdylib", "rlib"]
```
这几行告诉 cargo 允许项目**构建**（build)一个本地的 Rust 静态库（rlib）和一个 C/C++ 兼容库（cdylib）。 我们需要 rlib 来在桌面环境中运行 wgpu，需要 cdylib 来构建在浏览器中运行的 Web Assembly。

<div class="note">

仅在需要将项目做为其他 Rust 项目的**包**（crate）提供时，`[lib]` 项的配置才是必须的。所以我们的示例程序可以省略上面这一步。

添加上述 `[lib]` 内容依赖于像原作者那样将主要代码写入一个 `lib.rs` 文件，而如果想要通过下文的 wasm-pack 方法构建，则需要进行上述步骤。

</div>

<div class="note">

## Web Assembly

Web Assembly 即 WASM，是大多数现代浏览器支持的二进制格式，它令 Rust 等底层语言能在网页上运行。这允许我们用 Rust 编写应用程序，并使用几行 Javascript 来加载它到 Web 浏览器中运行。

</div>

现在，我们仅需添加一些专门用于在 WASM 中运行的依赖项：

```toml
[dependencies]
cfg-if = "1"
# 其他常规依赖...

[target.'cfg(target_arch = "wasm32")'.dependencies]
console_error_panic_hook = "0.1.6"
console_log = "0.2.0"
wasm-bindgen = "0.2.83"
wasm-bindgen-futures = "0.4.30"
web-sys = { version = "0.3.60", features = [
    "Document",
    "Window",
    "Element",
]}
```

[cfg-if](https://docs.rs/cfg-if)提供了一个宏，使得更加容易管理特定平台的代码。

`[target.'cfg(target_arch = "wasm32")'.dependencies]` 行告诉 cargo，如果我们的目标是 wasm32 架构，则只包括这些依赖项。接下来的几个依赖项只是让我们与 javascript 的交互更容易。

* [console_error_panic_hook](https://docs.rs/console_error_panic_hook) 配置 `panic!` 宏以将错误发送到 javascript 控制台。如果没有这个，当遇到程序崩溃时，你就会对导致崩溃的原因一无所知。
* [console_log](https://docs.rs/console_log) 实现了 [log](https://docs.rs/log) API。它将所有日志发送到 javascript 控制台。它还可以配置为仅发送特定级别的日志，这非常适合用于调试。
* 当我们想在大多数当前浏览器上运行时，就需要在 wgpu 上启用 `WebGL` 功能。因为目前只在 Firefox Nightly 和 Chrome Canary 等浏览器的实验版本上才支持直接使用 WebGPU API。
  欢迎你在这些浏览器上测试这段代码（wgpu 的开发者也会很感激），但为了简单起见，我打算坚持使用 WebGL 功能，直到 WebGPU API 达到一个更稳定的状态。
  如果你想了解更多详细信息，请查看 [wgpu 源码仓库](https://github.com/gfx-rs/wgpu/wiki/Running-on-the-Web-with-WebGPU-and-WebGL) 上的 web 编译指南
* [wasm-bindgen](https://docs.rs/wasm-bindgen) 是此列表中最重要的依赖项。它负责生成样板代码，并告诉浏览器如何使用我们的项目。它还允许我们在 Rust 中公开可在 Javascript 中使用的**函数**，反之亦然。
  我不会详细介绍 wasm-bindgen，所以如果你需要入门（或者是复习），请查看[这里](https://rustwasm.github.io/wasm-bindgen/)
* [web-sys](https://docs.rs/web-sys) 是一个包含了许多在 javascript 程序中可用的**函数**和**结构体**的工具箱，如：`get_element_by_id`、`append_child`。`features = [...]` 数组里列出的是我们目前最低限度需要的功能。

## 更多示例代码

首先, 我们需要在 `main.rs` 内引入 `wasm-bindgen` :

```rust
#[cfg(target_arch="wasm32")]
use wasm_bindgen::prelude::*;
```

接下来，需要告诉 wasm-bindgen 在 WASM 被加载后执行我们的 `run()` 函数。

```rust
#[cfg_attr(target_arch="wasm32", wasm_bindgen(start))]
pub async fn run() {
    // 省略的代码...
}
```

然后需要根据是否在 WASM 环境来切换我们正在使用的日志**包**。在 `run()` 函数内添加以下代码替换 `env_logger::init()`  行。

```rust
cfg_if::cfg_if! {
    if #[cfg(target_arch = "wasm32")] {
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        console_log::init_with_level(log::Level::Warn).expect("无法初始化日志库");
    } else {
        env_logger::init();
    }
}
```

上边的代码判断了**构建**目标，在 web 构建中设置 `console_log` 和 `console_error_panic_hook`。这很重要，因为 `env_logger` 目前不支持 Web Assembly。

<div class="note">

### 另一种实现

在第 3~8 章，`run()` 函数及遍历 event_loop 的代码被统一封装到了 `framework.rs` 中, 还定义了 `Action` trait 来抽象每一章中不同的 `State` 。
然后通过调用 wasm_bindgen_futures 包的 `spawn_local` 函数来创建 `State` 实例并处理 JS 异常。

第 1～2 章的代码通过 `cargo run-wasm --bin xxx` 运行时，在浏览器的控制台中会看到的 `...Using exceptions for control flow, don't mind me. This isn't actually an error!` 错误现在被消除了：

```rust
#[cfg(target_arch = "wasm32")]
pub fn run<A: Action + 'static>() {
    // ...
    wasm_bindgen_futures::spawn_local(async move {
        let (event_loop, instance) = create_action_instance::<A>().await;
        let run_closure = Closure::once_into_js(move || start_event_loop::<A>(event_loop, instance));

        // 处理运行过程中抛出的 JS 异常。
        // 否则 wasm_bindgen_futures 队列将中断，且不再处理任何任务。
        if let Err(error) = call_catch(&run_closure) {
            // ...
        }
    }
}
```

</div>

接下来，在创建了事件循环与窗口之后，我们需要在应用程序所在的 HTML 网页中添加一个**画布**（canvas)：

```rust
#[cfg(target_arch = "wasm32")]
{
    // Winit 不允许用 CSS 调整大小，所以在 web 环境里我们必须手动设置大小。
    use winit::dpi::PhysicalSize;
    window.set_inner_size(PhysicalSize::new(450, 400));
    
    use winit::platform::web::WindowExtWebSys;
    web_sys::window()
        .and_then(|win| win.document())
        .and_then(|doc| {
            let dst = doc.get_element_by_id("wasm-example")?;
            let canvas = web_sys::Element::from(window.canvas());
            dst.append_child(&canvas).ok()?;
            Some(())
        })
        .expect("无法将画布添加到网页上");
}
```

<div class="note">

`"wasm-example"` 这个 ID 是针对我的项目（也就是本教程）的。你可以你在 HTML 中使用任何 ID 来代替，或者，你也可以直接将画布添加到 `<body>` 中，就像 wgpu 源码仓库中所做的那样，这部分最终由你决定。

</div>

上边这些就是我们现在需要的所有 web 专用代码。接下来要做的就是**构建** Web Assembly 本身。

<div class="note">

**译者注**：以下关于 `wasm-pack` 的内容来自原文。但是由于它和 WebGPU 接口都尚未稳定，译者暂时不推荐用它构建此教程中的项目。参考本教程和原作者的仓库，这里给出一个使用 `cargo build` 的简易构建过程，如有疏漏请 PR 指正。

1. 如果要支持 WebGL，那么在 `Cargo.toml` 中加入以下描述来启用 cargo 的 `--features` 参数，参考 [wgpu 的运行指南](https://github.com/gfx-rs/wgpu/wiki/Running-on-the-Web-with-WebGPU-and-WebGL)：
    
```toml
[features]
default = []
webgl = ["wgpu/webgl"]
```
    
2. 运行 `cargo build --target wasm32-unknown-unknown --features webgl`。
    
3. 安装 [`wasm-bindgen`](https://rustwasm.github.io/wasm-bindgen) 并运行：
```shell
cargo install -f wasm-bindgen-cli --version 0.2.84
wasm-bindgen --no-typescript --out-dir {你的输出目录，例如 ./tutorial1_window_output} --web {wasm 所在的目录，例如 .\target\wasm32-unknown-unknown\release\tutorial1_window.wasm}
```
    
4. 此时会得到一个包含 .wasm 和 .js 文件的文件夹。可以用下文的 html 引入该 .js 文件。如果直接在浏览器打开该 html 文件，可能遇到 [CORS 问题](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)；如果正常运行，则可能出现一个警告 `Using exceptions for control flow, don't mind me. This isn't actually an error!`，忽略即可。

</div>
    
## Wasm Pack

你可以只用 wasm-bindgen 来**构建**一个 wgpu 应用程序，但我在这样做的时候遇到了一些问题。首先，你需要在电脑上安装 wasm-bindgen，并将其作为一个依赖项。作为依赖关系的版本**需要**与你安装的版本完全一致，否则构建将会失败。

为了克服这个缺点，并使阅读这篇教程的人更容易上手，我选择在组合中加入 [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/)。wasm-pack 可以为你安装正确的 wasm-bindgen 版本，而且它还支持为不同类型的 web 目标进行**构建**：浏览器、NodeJS 和 webpack 等打包工具。

使用 wasm-pack 前，你需要先[安装](https://rustwasm.github.io/wasm-pack/installer/)。

完成安装后，就可以用它来**构建**我们的项目了。当你的项目是一个独立的**包**（crate）时，可以直接使用 `wasm-pack build`。如果是**工作区**（workspace），就必须指定你要构建的包。想象一下**包**是一个名为 `game` 的目录，你就会使用：

```bash
wasm-pack build game
```
    
<div class="note">

**译者注**：`wasm-pack build` 需要如之前所说的那样加入 `[lib]` 等来构建静态库。

</div>

一旦 wasm-pack 完成**构建**，在你的**包**目录下就会有一个 `pkg` 目录，运行 WASM 代码所需的所有 javascript 代码都在这里。然后在 javascript 中导入 WASM 模块：

```js
const init = await import('./pkg/game.js');
init().then(() => console.log("WASM Loaded"));
```

这个网站使用了 [VitePress](https://vitepress.vuejs.org)，并且是在 Vue 组件中加载 WASM。如果想看看我是怎么做的，可以查看[这里](https://github.com/jinleili/learn-wgpu-zh/blob/master/docs/.vitepress/components/WasmExample.vue)。

<div class="note">

如果打算在一个普通的 HTML 网站中使用你的 WASM 模块，只需告诉 wasm-pack 以 web 为构建目标：

```bash
wasm-pack build --target web
```

然后就可以在一个 ES6 模块中运行 WASM 代码:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pong with WASM</title>
</head>

<body>
  <script type="module">
      import init from "./pkg/pong.js";
      init().then(() => {
          console.log("WASM Loaded");
      });
  </script>
  <style>
      canvas {
          background-color: black;
      }
  </style>
    
  <canvas id="wasm-example"></canvas>
</body>

</html>
```

</div>

点击下面的按钮查看示例代码运行!

<WasmExample example="tutorial1_window"></WasmExample>

<AutoGithubLink/>

