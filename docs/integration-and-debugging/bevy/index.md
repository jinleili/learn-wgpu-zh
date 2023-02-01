# 在 iOS Adroid App 中集成 Bevy 游戏引擎

如果要给已有的 App 添加一个开屏小游戏，或者实现一些动态 UI 组件、图表...，又或者只是想充分利用手机上的 Motion Sensors 来实现某个炫酷的玩法，那么就不能使用 Bevy 默认的 `WinitPlugin` 了。因为 `winit` 会接管整个 App 的初始化过程及窗口，而我们需要在已有的 App 实例中创建 bevy::App， 并且我们可能还希望 bevy::App 能运行在任意大小的 `iOS UIView` 或 `Android SurfaceView` 中。

本章我们将逐步实现一个此类场景，并且利用手机的 Motion Sensor 来玩 breakout 小游戏。

