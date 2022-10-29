# [《学习 wgpu》中文版](https://jinleili.github.io/learn-wgpu-zh/)
*为了便于读者的理解，译者选择性的添加了一些内容，并对原文中有歧义或错误的（比如：第八章、第十一章 Srgb 部分等等）地方进行重新表述。所有的添加与修改均不会做单独标记。*

*翻译时采用了第一人称视角，故，除了带 🆕 标记的章节，教程中的 **我** 主要指的是原作者 [@sorth](https://github.com/sotrh)。*

*另外，专有名词在一个段落中第一次出现时做了**加粗**处理，同一段落里反复出现时就不再加粗。*

## wgpu 是啥？
[wgpu](https://github.com/gfx-rs/wgpu) 是基于 [WebGPU API 规范](https://gpuweb.github.io/gpuweb/) 的、跨平台的、安全的、纯 Rust 图形 API。它是 Firefox、Servo 和 Deno 中 WebGPU 整合的核心。

**wgpu** 不仅可以在 Web 环境运行，还可以在 macOS / iOS、Android、Window 和 Linux 等系统上原生运行。

## WebGPU 又是啥？
**WebGPU** 是由 W3C [GPU for the Web](https://www.w3.org/community/gpu/) 社区组所发布的规范，目标是允许网页代码以高性能且安全可靠的方式访问 GPU 功能。它通过借鉴 Vulkan API，并将其转换为宿主硬件上使用的各式 API（如 DirectX、Metal、Vulkan）来实现这一目标。

## 现在学习 wgpu 是不是为时尚早？
虽然 WebGPU 1.0 可能要到 2023 年才能正式发布，但 API 目前已经趋于稳定了，后面的修订更多是内部实现层的完善。

从 wgpu 及 dawn 这两个主要的 WebGPU 标准的实现库的开发动向可以看出，大量的扩展特性目前只有 PC、Mac、iOS、Android 等系统上本地运行才能支持。wgpu 更是将本地运行做为首要目标，WebGPU 是做为最低支持的特性集而存在。

使用 wgpu 在移动端做跨平台开发的体验极好，甚至我偏向于认为：**WebGPU 更容易在 iOS、Android 上得到普及**。因为不用受限于 1.0 标准啥时候发布，用户的浏览器是否支持等问题。

## 如何运行示例代码
本教程的示例代码大部分放在 [`code/`](https://github.com/jinleili/learn-wgpu-zh/tree/master/code) 目录下，且示例程序的名称与程序目录同名。
比如，第一章 **依赖与窗口** 所有在的目录是 **code/beginner/`tutorial1-window`**, 此示例程序的名称也叫 `tutorial1-window`:

```sh
# 在桌面环境本地运行
cargo run --example tutorial1-window

# 在浏览器中运行
# 需要先安装 Rust WebAssembly target
rustup target add wasm32-unknown-unknown
# 使用 WebGPU（需要使用 FireFox Nightly 或 Chrome Canary 并开启 WebGPU 试验功能）
cargo run-wasm --example tutorial1-window
# 使用 WebGL 2.0
cargo run-wasm --example tutorial1-window --features webgl
```
**调试与集成** 部分的代码是一个独立的项目：[wgpu-on-app](https://github.com/jinleili/wgpu-on-app)


## 关于译者
我是一名移动端（iOS，Android）工程师, 同时也擅长 HTML5，有多年使用 OpenGL ES / WebGL, Metal 的实践经验。2018 年开始接触 WebGPU，目前正积极地参与到 [wgpu 开源项目的开发与完善](https://github.com/gfx-rs/wgpu/commits?author=jinleili)之中，并且已于两年前在 AppStore 上架了基于 wgpu 实现的毛笔书法模拟 App [字习 Pro](https://apps.apple.com/cn/app/字习-pro/id1507339788)。

## 加入 wgpu 微信学习群交流群

<div style="text-align: center">
    <img src="docs/public/res/wx.jpg" style="width: 312px; margin-top: 24px;">
</div>

