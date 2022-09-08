# 介绍
*为了便于中文读者的理解，本教程的翻译会增减一些内容，并对原文有歧义的地方进行重新表述。*

*另外，翻译时采用了第一人称视角，故教程中的 **我** 主要指的是原作者 [@sorth](https://github.com/sotrh)。*

## wgpu 是什么？
[wgpu](https://github.com/gfx-rs/wgpu) 是 [WebGPU API 规范](https://gpuweb.github.io/gpuweb/) 的 Rust 实现。

WebGPU 是由 W3C [GPU for the Web](https://www.w3.org/community/gpu/) 社区组所发布的规范，目标是允许网页代码以高性能且安全可靠的方式访问 GPU 功能。它通过借鉴 Vulkan API，并将其转换为宿主硬件上使用的各式 API（如DirectX、Metal、Vulkan）来实现这一目标。

wgpu 仍在开发中，本教程中的部分内容可能会发生变化。我自己也正在利用这个项目学习 wgpu，所以可能会错过一些重要的细节，或者解释得不够好。欢迎提出建设性的反馈。


## 为何使用 Rust？
wgpu 实际上提供了 C 语言绑定 ([wgpu-native](https://github.com/gfx-rs/wgpu-native))，你可以写 C/C++ 或其他能与 C 互通的语言来使用它。尽管如此，wgpu 本身是用 Rust 实现的，它便利的 Rust 绑定能减少你使用中的阻碍。更重要的是，Rust 是一门高性能，内存和线程安全且极具生产力的现代底层语言。

在学习本教程之前你需要先熟悉 Rust，因为这里不会详细介绍 Rust 的语法知识。如果你对 Rust 还不太熟悉，可以回顾一下 [Rust 教程](https://www.rust-lang.org/zh-CN/learn)。另外你还需要熟悉 Rust 包管理工具 [Cargo](https://doc.rust-lang.org/cargo)。

## 贡献与支持

* 原作者接受 PR（[GitHub repo](https://github.com/sotrh/learn-wgpu)）以修复本教程的问题，如错别字、错误信息和其他不一致之处。
* 如果想直接支持原作者，请查看 [patreon](https://www.patreon.com/sotrh)！
* 也欢迎对此中译版本提出反馈及改进建议（[《Learn wgpu》中文版 repo](https://github.com/jinleili/learn-wgpu-zh)）

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


