# 在 iOS Adroid App 中集成 Bevy 游戏引擎

## 认识 Bevy

**Bevy** 是一个开源、跨平台的 Rust 游戏引擎，旨在提供一个简单、高效和易于使用的游戏开发框架。它具有以下特点：

- 模块化设计：Bevy 将游戏引擎的各个组件分解为单独的模块，使您可以选择需要的组件并方便地扩展它们。
- 灵活的插件系统：Bevy 支持自定义插件，您可以根据需要创建自己的插件并集成到游戏中。
- 易于使用的 API：Bevy 提供了简单、易于理解的 API，使您可以快速开始游戏开发。
- 强大的渲染系统：Bevy 使用 wgpu 作为渲染后端，以提供强大的图形渲染能力。
- 跨平台：Bevy 不仅支持在 Windows、MacOS 和 Linux 桌面系统上运行，还支持在 iOS 和 Android 移动设备上运行。

总的来说，Bevy 是一个非常适合新手的游戏引擎，它的简单性和灵活性使您可以轻松地开始游戏开发，并且随着您的经验增加，它也能满足更高级的需求。

## 需求场景

如果需要给已有的 App 添加一个开屏小游戏，或者实现一些动态 UI 组件、图表...，又或者只是想充分利用手机上的 Motion Sensors 来实现令人惊艳的游戏体验，那么就不能使用 Bevy 默认的 `WinitPlugin` 了。因为 `winit` 会完全控制 App 的初始化过程和窗口，而我们需要的是在已有的 App 实例中创建 bevy::App， 并且我们可能还希望 bevy::App 能在任意大小的 `iOS UIView` 或 `Android SurfaceView` 中运行。

本章我们将逐步实现一个此类场景，并且利用手机的 Motion Sensor 来玩 breakout 小游戏。

## 窗口插件


<div style="display: flex;">
    <div>
        <img src="./bevy_in_android.png" alt="Bevy in Android App">
    </div>
    <div style="width: 20px;"></div>
    <div>
        <img src="./bevy_in_ios.png" alt="Bevy in iOS App" />
    </div>
</div>

<div class="github-link">
    <a href="https://github.com/jinleili/bevy-in-app" target="_blank" rel="noopener noreferrer">
        查看 bevy-in-app 完整项目源码！
    </a>
</div>
