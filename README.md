# 《学习 wgpu》中文版
*为了便于读者的理解，译者选择性的添加了一些内容，并对原文中有歧义或错误的（比如：第八章、第十一章 Srgb 部分等等）地方进行重新表述。所有的添加与修改均不会做单独标记。*

*翻译时采用了第一人称视角，故，除了带 🆕 标记的章节，教程中的 **我** 主要指的是原作者 [@sorth](https://github.com/sotrh)。*

*另外，专有名词在一个段落中第一次出现时做了**加粗**处理，同一段落里反复出现时就不再加粗。*

## wgpu 是什么？
[wgpu](https://github.com/gfx-rs/wgpu) 是基于 [WebGPU API 规范](https://gpuweb.github.io/gpuweb/) 的、跨平台的、安全的、纯 Rust 图形 API。它是 Firefox、Servo 和 Deno 中 WebGPU 整合的核心。

**wgpu** 不仅可以在 Web 环境运行，还可以在 macOS / iOS、Android、Window 和 Linux 等系统上原生运行。

**WebGPU** 是由 W3C [GPU for the Web](https://www.w3.org/community/gpu/) 社区组所发布的规范，目标是允许网页代码以高性能且安全可靠的方式访问 GPU 功能。它通过借鉴 Vulkan API，并将其转换为宿主硬件上使用的各式 API（如 DirectX、Metal、Vulkan）来实现这一目标。

*WebGPU 规范及 wgpu 都仍在完善阶段，本教程中的部分内容可能会发生变化。如果有错过一些重要的细节，或者解释得不够好，欢迎提出建设性的反馈。*

## 关于译者
我是一名移动端（iOS，Android）工程师, 同时也擅长 HTML5，有多年使用 OpenGL ES / WebGL, Metal 的实践经验。2018 年开始接触 WebGPU，目前正积极地参与到 [wgpu 开源项目的开发与完善](https://github.com/gfx-rs/wgpu/commits?author=jinleili)之中，并且已于两年前在 AppStore 上架了基于 wgpu 实现的毛笔书法模拟 App [字习 Pro](https://apps.apple.com/cn/app/字习-pro/id1507339788)。

## 加入 wgpu 微信学习群交流群

<div style="text-align: center">
    <img src="docs/public/res/wx.jpg" style="width: 312px; margin-top: 24px;">
</div>

