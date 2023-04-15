# [《学习 wgpu》中文版](https://jinleili.github.io/learn-wgpu-zh/)

![Minimum Rust Version](https://img.shields.io/badge/min%20rust-1.64-green.svg)
[![Build Status](https://github.com/jinleili/learn-wgpu-zh/workflows/Build/badge.svg?branch=master)](https://github.com/jinleili/learn-wgpu-zh/actions)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jinleili/learn-wgpu-zh/blob/master/LICENSE.MIT)


*为了便于读者的理解，译者选择性的添加了一些内容，并对原文中有歧义或错误的（比如：第八章、第十一章 Srgb 部分等等）地方进行重新表述。所有的添加与修改均不会做单独标记。*

*翻译时采用了第一人称视角，故，除了带 🆕 标记的章节，教程中的**我**主要指的是原作者 [@sotrh](https://github.com/sotrh)。*

*另外，专有名词在一个段落中第一次出现时做了**加粗**处理，同一段落里反复出现时就不再加粗。*

## WebGPU 是啥？
**WebGPU** 是由 W3C [GPU for the Web](https://www.w3.org/community/gpu/) 社区组所发布的规范，目标是允许网页代码以高性能且安全可靠的方式访问 GPU 功能。它通过借鉴 Vulkan API，并将其转换为宿主硬件上使用的各式 API（如 DirectX、Metal、Vulkan）来实现这一目标。

## wgpu 又是啥？
[wgpu](https://github.com/gfx-rs/wgpu) 是基于 [WebGPU API 规范](https://gpuweb.github.io/gpuweb/)的、跨平台的、安全的、纯 Rust 图形 API。它是 Firefox、Servo 和 Deno 中 WebGPU 整合的核心。

**wgpu** 不仅可以在 Web 环境运行，还可以在 macOS / iOS、Android、Window 和 Linux 等系统上原生运行。

## 为什么要使用 Rust？

wgpu 实际上提供了 C 语言绑定 ([wgpu-native](https://github.com/gfx-rs/wgpu-native))，你可以写 C/C++ 或其他能与 C 互通的语言来使用它。尽管如此，wgpu 本身是用 Rust 实现的，它便利的 Rust 绑定能减少你使用中的阻碍。更重要的是，Rust 是一门高性能，内存和线程安全且极具生产力的现代底层语言。

在学习本教程之前你需要先熟悉 Rust，因为这里不会详细介绍 Rust 的语法知识。如果对 Rust 还不太熟悉，可以回顾一下 [Rust 教程](https://www.rust-lang.org/zh-CN/learn)或 [Rust 语言圣经](https://course.rs/about-book.html)。另外还需要熟悉 Rust 包管理工具 [Cargo](https://rustwiki.org/zh-CN/cargo/getting-started/index.html)。

## 为什么要学习 wgpu，直接用 JS/TS 搞 WebGPU 开发不香吗？

从 wgpu 及 dawn 这两个主要的 WebGPU 标准的实现库的开发动向可以看出，大量的扩展特性目前只有在 Native 端（Windows、macOS、Linux、iOS、Android）原生运行才能支持。wgpu 更是将 Native 端运行做为首要目标，WebGPU 是做为最低支持的特性集而存在。

使用 wgpu 在桌面及移动端做跨平台原生应用开发的体验极好，甚至我偏向于认为：**WebGPU 更容易在 Native 端得到普及**。因为不用受限于 1.0 标准啥时候发布，用户的浏览器是否支持等问题，现在就可以发布采用了 wgpu 的商业应用。

学习 wgpu 还有另一个重要的优势，那就是可以利用各种强大的桌面端 GPU 调试工具。在开发大型 2D/3D 应用时，通过使用命令记录/回放、帧捕捉、Buffer 视图等功能，可以快速定位 GPU 层代码/数据的性能瓶颈和程序缺陷。相较于仅依靠浏览器提供的有限调试能力，这些工具能够事半功倍，帮助开发者更快地解决问题。

## wgpu/WebGPU 的学习资料是不是很少？

其实不用纠结于 WebGPU 方面的直接学习资料的多少。

WebGPU 就是一套图形接口，绝大部分概念都是各图形接口里通用的，任何一本经典图形学书籍都是我们的学习资料。
要利用好这些经典资料，前提仅仅就是要先学习一套图形接口。因为图形学的书不是使用统一的特定图形接口所写，先学会一个图形接口及常见的概念，然后再去深入学习某个方面的资料就会事半功倍。

## 现在学习 wgpu 是不是为时尚早？
虽然 WebGPU 1.0 要到 2023 年年中才会正式发布，但 API 目前已经趋于稳定了，后面的修订更多是内部实现层的完善。

## 如何运行示例代码
本教程的示例代码大部分放在 [`code/`](https://github.com/jinleili/learn-wgpu-zh/tree/master/code) 目录下，且示例程序的名称与程序目录同名。
比如，第一章 **依赖与窗口** 所有在的目录是 **code/beginner/`tutorial1-window`**, 此示例程序的名称也叫 `tutorial1-window`:

```sh
# 在桌面环境本地运行
cargo run --bin tutorial1-window

# 在浏览器中运行
# 需要先安装 Rust WebAssembly target
rustup target add wasm32-unknown-unknown
# 使用 WebGPU（需要使用 FireFox Nightly 或 Chrome Canary 并开启 WebGPU 试验功能）
cargo run-wasm --bin tutorial1-window
# 使用 WebGL 2.0
cargo run-wasm --bin tutorial1-window --features webgl
```
**调试与集成** 部分的代码是一个独立的项目：
[wgpu-in-app](https://github.com/jinleili/wgpu-in-app) 和 [bevy-in-app](https://github.com/jinleili/bevy-in-app)

[**simuverse**](https://github.com/jinleili/simuverse) 是基于 wgpu + [egui](https://github.com/emilk/egui) 的扩展示例，提供了粒子矢量场，流体场及 GPU 程序化纹理的实现。

## 如何开启浏览器 WebGPU 试验功能

### FireFox  
安装 Nightly 版本，在地址栏中输入 `about:config` , 将 `dom.webgpu.enabled` 设置为 `true`:
<img src="docs/public/res/firefox.png" alt="FireFox Nightly">

### Chrome  
安装 110.0 以上正式版或 Canary 版，在地址栏中输入 `chrome://flags` , 将 `Unsafe WebGPU` 设置为 `Enabled`:
<img src="docs/public/res/chrome.png" alt="Chrome Canary">

## 关于译者
我是一名移动端架构师, 有多年使用 OpenGL ES / WebGL, Metal 的实践经验。2018 年开始接触 WebGPU，目前正积极地参与到 [wgpu 开源项目的开发与完善](https://github.com/gfx-rs/wgpu/commits?author=jinleili)之中，并且已于两年前在 AppStore 上架了基于 wgpu 实现的毛笔书法模拟 App [字习 Pro](https://apps.apple.com/cn/app/字习-pro/id1507339788)。


