# 介绍

## 什么是 wgpu？
[wgpu](https://github.com/gfx-rs/wgpu) 是 [WebGPU API 标准](https://gpuweb.github.io/gpuweb/)的 Rust 实现。WebGPU 是由 W3C Web GPU 社区小组所发布的规范，目标是允许网页代码以安全可靠的方式访问 GPU 功能。它通过借鉴 Vulkan API，并将其转换为宿主硬件上使用的各式 API（如DirectX、Metal、Vulkan）来实现这一目标。

wgpu 仍在开发中，所以本教程中的部分内容可能会发生变化。

## 为何要用 Rust？
wgpu 实际上提供了 C 语言绑定，你可以写 C/C++ 或其他能与 C 互通的语言来使用它。尽管如此，wgpu 本身是用 Rust 实现的，它便利的 Rust 绑定能减少你使用时的阻碍。更重要的是，我一直在享受用 Rust 编程的乐趣。

在学习本教程之前你需要先熟悉 Rust，因为我不会对 Rust 的语法进行详细介绍。如果你对 Rust 还不太熟悉，可以回顾一下 [Rust 教程](https://www.rust-lang.org/learn)。另外你还需要熟悉 [Cargo](https://doc.rust-lang.org/cargo)。

我自己正在利用这个项目学习 wgpu，所以可能会错过一些重要的细节，或者解释得不够好。我始终愿意接受建设性的反馈。

## 贡献与支持

* 我接受 PR（[GitHub repo](https://github.com/sotrh/learn-wgpu)）以修复本教程的问题，如错别字、错误信息和其他不一致之处。
* 由于 wgpu 的 API 变化很快，因此不接受任何用于展示新 demo 的 PR。
* 如果想直接支持我，请查看 [patreon](https://www.patreon.com/sotrh)！

## 特别感谢以下赞助者!

- David Laban
- Gunstein Vatnar
- Lennart
- Ian Gowen
- Aron Granberg
- Bernard Llanos
- Jan Šipr
- Zeh Fernando
- Felix 
- Youngsuk Kim
- オリトイツキ
- Andrea Postal
- charlesk


