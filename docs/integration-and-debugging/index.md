# 楔子

<img src="/res/tools.png" alt="调试工具集">

教程的开篇我们就已提到：wgpu 是基于 WebGPU 规范的**跨平台**图形 API。也就是说，wgpu 不光能运行在 Web 及桌面环境里，更是能运行在 iOS、Android 两大移动操作系统上。

wgpu 的运行并不依赖于任何窗口程序，所以也不提供窗口的创建及管理功能，只有在创建基于窗口的**绘制表面**（Surface）时，才可能需要一个实现了 [raw-window-handle](https://github.com/rust-windowing/raw-window-handle) 抽象接口的实参（之所以说是*可能需要*，是因为在 iOS/macOS 上，使用 `CAMetalLayer` 也能创建绘制表面的实例）。
[winit](https://github.com/rust-windowing/winit) 是一个实现了 `raw-window-handle` 抽象接口的、跨平台的窗口创建及管理**包**（crate）。
在桌面端（macOS、Windows、Linux）及移动端（iOS、Android），winit 会接管整个 **App** （应用程序）的窗口管理（包括**事件循环**（Events loop））。

毫无疑问，对于游戏类 App, 使用 wgpu + winit 的组合是非常合适的。但是，大量非游戏类 App 也经常有使用图形 API 的需求（比如，图表、图片滤镜等），这些 App 需要用到大量的系统 UI 组件及交互，winit 这种接管整个 App 窗口的方式是不合适的。所以，将 wgpu 集成到现有的 iOS、Android App 且不使用 winit 将非常有用。

我们都知道，调试和分析是优化程序性能的必备技能。

虽然 wgpu 会在运行时验证 API 调用及参数设置来保证只有有效的工作负载才能提交给 GPU 执行，但是，这并不能保证**渲染**或**计算着色**（Compute Shading）的正确性。本章中我们还会学习到如何利用调试工具来分析 wgpu 程序的性能及查找难以发现的错误！

### 加入 wgpu 微信学习群交流群

<JoinWeiChatGroup />

