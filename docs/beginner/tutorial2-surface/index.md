# 展示平面 (Surface)

## 封装 State

为方便起见，我们将所有**字段**封装在一个**结构体**内，并在其上添加一些函数：

```rust
// lib.rs
use winit::window::Window;

struct State {
    surface: wgpu::Surface,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
}

impl State {
    // 创建某些 wgpu 类型需要使用异步代码
    async fn new(window: &Window) -> Self {
        todo!()
    }

    fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        todo!()
    }

    fn input(&mut self, event: &WindowEvent) -> bool {
        todo!()
    }

    fn update(&mut self) {
        todo!()
    }

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        todo!()
    }
}
```

此处省略了 `State` 的字段概述，在后续章节中解释这些函数背后的代码时，它们才会变得更有意义。

<div class="note">

`surface`、`device`、`queue`、`config` 等对象是每个 wgpu 程序都需要的，且它们的创建过程涉及到很多模板代码，所以，从第 3 章开始，我将它们统一封装到了 [AppSurface](https://github.com/jinleili/wgpu-in-app/tree/master/app-surface) 对象中。

`State` 中的这些函数在所有章节示例中都有用到，所以，在第 3 ～ 8 章，我将其抽象为了 `Action` trait:

```rust
pub trait Action {
    fn new(app: app_surface::AppSurface) -> Self;
    fn get_adapter_info(&self) -> wgpu::AdapterInfo;
    fn current_window_id(&self) -> WindowId;
    fn resize(&mut self);
    fn request_redraw(&mut self);
    fn input(&mut self, _event: &WindowEvent) -> bool {
        false
    }
    fn update(&mut self) {}
    fn render(&mut self) -> Result<(), wgpu::SurfaceError>;
}
```

</div>

## 实例化 State

这段代码很简单，但还是值得好好讲讲：

```rust
impl State {
    // ...
    async fn new(window: &Window) -> Self {
        let size = window.inner_size();

        // instance 变量是 GPU 实例
        // Backends::all 对应 Vulkan、Metal、DX12、WebGL 等所有后端图形驱动
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::all(),
            ..Default::default()
        });
        let surface = unsafe { instance.create_surface(window).unwrap() };
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                compatible_surface: Some(&surface),
                ..Default::default()
            }).await.unwrap();
```

### GPU 实例与适配器

**GPU 实例**（Instance）是使用 wgpu 时所需创建的第一个对象，其主要用途是创建**适配器**（Adapter）和**展示平面**（Surface）。

**适配器**（Adapter）是指向 WebGPU API 实现的实例，一个系统上往往存在多个 WebGPU API 实现实例。也就是说，**适配器**是固定在特定图形后端的。假如你使用的是 Windows 且有 2 个显卡（集成显卡 + 独立显卡），则至少有 4 个**适配器**可供使用，分别有 2 个固定在 Vulkan 和 DirectX 后端。我们可以用它获取关联显卡的信息，例如显卡名称与其所适配到的后端图形驱动等。稍后我们会用它来创建**逻辑设备**和**命令队列**。现在先讨论一下 `RequestAdapterOptions` 所涉及的字段。

- `power_preference` 枚举有两个可选项：`LowPower` 和 `HighPerformance`。 `LowPower` 对应偏向于高电池续航的适配器（如集成显卡上的 WebGPU 实现实例），`HighPerformance` 对应高功耗高性能的适配器（如独立显卡上的 WebGPU 实现实例）。一旦不存在符合 `HighPerformance` 选项的适配器，wgpu 就会选择 `LowPower`。
- `compatible_surface` 字段告诉 wgpu 找到与所传入的**展示平面**兼容的适配器。
- `force_fallback_adapter` 强制 wgpu 选择一个能在所有系统上工作的适配器，这通常意味着渲染后端将使用一个**软渲染**系统，而非 GPU 这样的硬件。需要注意的是：WebGPU 标准并没有要求所有系统上都必须实现 [fallback adapter](https://gpuweb.github.io/gpuweb/#fallback-adapter) 。

<div class="note">

此处传递给 `request_adapter` 的参数不能保证对所有设备都有效，但是应该对大多数设备都有效。当 wgpu 找不到符合要求的适配器，`request_adapter` 将返回 `None`。如果你想获取某个特定图形后端的所有**适配器**，可以使用 `enumerate_adapters` 函数，它会返回一个迭代器，你可以遍历检查其中是否有满足需求的适配器。

```rust
let adapter = instance
    .enumerate_adapters(wgpu::Backends::all())
    .filter(|adapter| {
        // 检查该适配器是否兼容我们的展示平面
        adapter.is_surface_supported(&surface)
    })
    .next()
    .unwrap();
```

更多可用于优化**适配器**搜索的函数，请[查看文档](https://docs.rs/wgpu/latest/wgpu/struct.Adapter.html)。

</div>

### 展示平面

**展示平面**（Surface）是我们绘制到窗口的部分，需要它来将绘制结果展示（或者说，呈现）到屏幕上。窗口程序需要实现 [raw-window-handle](https://crates.io/crates/raw-window-handle) **包**的 `HasRawWindowHandle` trait 来创建展示平面。所幸 winit 的 `Window` 符合这个要求。我们还需要展示平面来请求**适配器**。

### 逻辑设备与命令队列

让我们使用**适配器**来创建**逻辑设备** (Device) 和**命令队列** (Queue)。

```rust
let (device, queue) = adapter.request_device(
    &wgpu::DeviceDescriptor {
        features: wgpu::Features::empty(),
        // WebGL 后端并不支持 wgpu 的所有功能，
        // 所以如果要以 web 为构建目标，就必须禁用一些功能。
        limits: if cfg!(target_arch = "wasm32") {
            wgpu::Limits::downlevel_webgl2_defaults()
        } else {
            wgpu::Limits::default()
        },
        label: None,
    },
    None, // 追踪 API 调用路径
).await.unwrap();
```

`DeviceDescriptor`上的 `features` 字段允许我们指定想要的扩展功能。对于这个简单的例子，我决定不使用任何额外的功能。

<div class="note">

显卡会限制可用的扩展功能，所以如果想使用某些功能，你可能需要限制支持的设备或提供变通函数。

可以使用 `adapter.features()` 或 `device.features()` 获取设备支持的扩展功能列表。

如果有需要，请查看完整的[扩展功能列表](https://docs.rs/wgpu/latest/wgpu/struct.Features.html)。

</div>

`limits` 字段描述了创建某些类型的资源的限制。我们在本教程中使用默认值，所以可以支持大多数设备。你可以[在这里](https://docs.rs/wgpu/0.13.1/wgpu/struct.Limits.html)查看限制列表。

```rust
let caps = surface.get_capabilities(&adapter);
let config = wgpu::SurfaceConfiguration {
    usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
    format: caps.formats[0],
    width: size.width,
    height: size.height,
    present_mode: wgpu::PresentMode::Fifo,
    alpha_mode: caps.alpha_modes[0],
    view_formats: vec![],
};
surface.configure(&device, &config);
```

这里我们为**展示平面**定义了一个配置。它将定义展示平面如何创建其底层的 `SurfaceTexture`。讲 `render` 函数时我们再具体讨论 `SurfaceTexture`，现在先谈谈此配置的字段。

`usage` 字段描述了 `SurfaceTexture` 如何被使用。`RENDER_ATTACHMENT` 指定将被用来渲染到屏幕的纹理（我们将在后面讨论更多的 `TextureUsages` 枚举值）。

`format` 定义了 `SurfaceTexture` 在 GPU 内存上如何被存储。不同的显示设备偏好不同的纹理格式。我们使用`surface.get_capabilities(&adapter).formats` 来获取当前显示设备的最佳格式。

`width` 和 `height` 指定 `SurfaceTexture` 的宽度和高度（物理像素，等于逻辑像素乘以屏幕缩放因子）。这通常就是窗口的宽和高。

<div class="warning">

需要确保 `SurfaceTexture` 的宽高不能为 0，这会导致你的应用程序崩溃。

</div>

`present_mode` 指定的 `wgpu::PresentMode` 枚举值决定了**展示平面**如何与**显示设备**同步。我们选择的`PresentMode::Fifo` 指定了显示设备的刷新率做为渲染的帧速率，这本质上就是**垂直同步**（VSync），所有平台都得支持这种**呈现模式**（PresentMode）。你可以在[文档](https://docs.rs/wgpu/latest/wgpu/enum.PresentMode.html)中查看所有的模式。

<div class="note">

当你想让用户来选择他们使用的**呈现模式**时，可以使用 [surface.get_capabilities(&adapter)](https://docs.rs/wgpu/latest/wgpu/struct.Surface.html#method.get_capabilities) 获取展示平面支持的所有**呈现模式**的列表:

```rust
let modes = surface.get_capabilities(&adapter).present_modes;
```

`PresentMode::Fifo` 模式无论如何都是被支持的，`PresentMode::AutoVsync` 和 `PresentMode::AutoNoVsync` 支持回退，因此也能工作在所有平台上。

</div>

现在已经正确地配置了**展示平面**，我们在函数的末尾添加上这些新字段：

```rust
        Self {
            surface,
            device,
            queue,
            config,
            size,
        }
    }
    // ...
}
```

由于 `State::new()` 函数是异步的，因此需要把 `run()` 也改成异步的，以便可以在函数调用处等待它。

```rust
pub async fn run() {
    // 窗口设置...

    let mut state = State::new(&window).await;

    // 事件遍历...
}
```

现在 `run()` 是异步的了，`main()` 需要某种方式来等待它执行完成。我们可以使用 [tokio](https://docs.rs/tokio) 或 [async-std](https://docs.rs/async-std) 等异步**包**，但我打算使用更轻量级的 [pollster](https://docs.rs/pollster)。在 "Cargo.toml" 中添加以下依赖：

```toml
[dependencies]
# 其他依赖...
pollster = "0.2"
```

然后我们使用 pollster 提供的 `block_on` 函数来等待异步任务执行完成：

```rust
fn main() {
    pollster::block_on(run());
}
```

<div class="warning">

WASM 环境中不能在异步函数里使用 `block_on`。`Future`（异步函数的返回对象）必须使用浏览器的执行器来运行。如果你试图使用自己的执行器，一旦遇到没有立即执行的 `Future` 时代码就会崩溃。

</div>

如果现在尝试构建 WASM 将会失败，因为 `wasm-bindgen` 不支持使用异步函数作为“开始”函数。你可以改成在 javascript 中手动调用 `run`，但为了简单起见，我们将把 [wasm-bindgen-futures](https://docs.rs/wasm-bindgen-futures) **包**添加到 WASM 依赖项中，因为这不需要改变任何代码。你的依赖项应该是这样的：

```toml
[dependencies]
cfg-if = "1"
winit = "0.27.5"
env_logger = "0.9"
log = "0.4"
wgpu = "0.15"
pollster = "0.2"

[target.'cfg(target_arch = "wasm32")'.dependencies]
console_error_panic_hook = "0.1.6"
console_log = "0.2.0"
wasm-bindgen = "0.2.83"
wasm-bindgen-futures = "0.4"
web-sys = { version = "0.3.60", features = [
    "Document",
    "Window",
    "Element",
]}
```

## 调整展示平面的宽高

如果要在应用程序中支持调整**展示平面**的宽高，将需要在每次窗口的大小改变时重新配置 `surface`。这就是我们存储物理 `size` 和用于配置 `surface` 的 `config` 的原因。有了这些，实现 resize 函数就非常简单了。

```rust
// impl State
pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
    if new_size.width > 0 && new_size.height > 0 {
        self.size = new_size;
        self.config.width = new_size.width;
        self.config.height = new_size.height;
        self.surface.configure(&self.device, &self.config);
    }
}
```

这里和最初的 `surface` 配置没什么不同，所以就不再赘述。

在 `run()` 函数的事件循环中，我们在以下事件中调用 `resize()` 函数。

```rust
match event {
    // ...

    } if window_id == window.id() => if !state.input(event) {
        match event {
            // ...

            WindowEvent::Resized(physical_size) => {
                state.resize(*physical_size);
            }
            WindowEvent::ScaleFactorChanged { new_inner_size, .. } => {
                // new_inner_size 是 &&mut 类型，因此需要解引用两次
                state.resize(**new_inner_size);
            }
            // ...
}
```

## 事件输入

`input()` 函数返回一个 `bool`（布尔值），表示一个事件是否已经被处理。如果该函数返回 `true`，主循环就不再继续处理该事件。

我们现在没有任何想要捕获的事件，只需要返回 false。

```rust
// impl State
fn input(&mut self, event: &WindowEvent) -> bool {
    false
}
```

还需要在事件循环中多做一点工作，我们希望 `State` 在 `run()` 函数内的事件处理中拥有第一优先级。修改后（加上之前的修改）的代码看起来像是这样的：

```rust
// run()
event_loop.run(move |event, _, control_flow| {
    match event {
        Event::WindowEvent {
            ref event,
            window_id,
        } if window_id == window.id() => if !state.input(event) { // 更新!
            match event {
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
                WindowEvent::Resized(physical_size) => {
                    state.resize(*physical_size);
                }
                WindowEvent::ScaleFactorChanged { new_inner_size, .. } => {
                    state.resize(**new_inner_size);
                }
                _ => {}
            }
        }
        _ => {}
    }
});
```

## 更新

目前还没有任何东西需要更新，所以令这个函数为空。

```rust
fn update(&mut self) {
    // remove `todo!()`
}
```

我们稍后将在这里添加一些代码，以便让绘制对象动起来。

## 渲染

这里就是奇迹发生的地方。首先，我们需要获取一个**帧**（Frame）对象以供渲染：

```rust
// impl State

fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
    let output = self.surface.get_current_texture()?;
```

`get_current_texture` 函数会等待 `surface` 提供一个新的 `SurfaceTexture`。我们将它存储在 `output` 变量中以便后续使用。

```rust
let view = output.texture.create_view(&wgpu::TextureViewDescriptor::default());
```

这一行创建了一个默认设置的**纹理视图**（TextureView），渲染代码需要利用**纹理视图**来与**纹理**交互。

我们还需要创建一个**命令编码器**（CommandEncoder）来记录实际的**命令**发送给 GPU。大多数现代图形框架希望命令在被发送到 GPU 之前存储在一个**命令缓冲区**中。命令编码器创建了一个命令缓冲区，然后我们可以将其发送给 GPU。

```rust
let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
    label: Some("Render Encoder"),
});
```

现在可以开始执行期盼已久的**清屏**（用统一的颜色填充指定渲染区域）了。我们需要使用 `encoder` 来创建**渲染通道**（`RenderPass`）。**渲染通道**编码所有实际绘制的**命令**。创建渲染通道的代码嵌套层级有点深，所以在谈论它之前，我先把代码全部复制到这里：

```rust
    {
        let _render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: 0.1,
                        g: 0.2,
                        b: 0.3,
                        a: 1.0,
                    }),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
    }

    // submit 命令能接受任何实现了 IntoIter trait 的参数
    self.queue.submit(std::iter::once(encoder.finish()));
    output.present();

    Ok(())
}
```

首先，我们来谈谈 `encoder.begin_render_pass(...)` 周围用 `{}` 开辟出来的块空间。`begin_render_pass()` 以可变方式借用了`encoder`（又称 `&mut self`），在释放这个可变借用之前，我们不能调用 `encoder.finish()`。这个块空间告诉 rust，当代码离开这个范围时，丢弃其中的任何变量，从而释放 `encoder` 上的可变借用，并允许我们 `finish()` 它。如果你不喜欢 `{}`，也可以使用 `drop(render_pass)` 来达到同样的效果。

代码的最后几行告诉 `wgpu` 完成**命令缓冲区**，并将其提交给 gpu 的**渲染队列**。

我们需再次更新事件循环以调用 `render()` 函数，还会在它之前先调用 `update()`。

```rust
// run()
event_loop.run(move |event, _, control_flow| {
    match event {
        // ...
        Event::RedrawRequested(window_id) if window_id == window.id() => {
            state.update();
            match state.render() {
                Ok(_) => {}
                // 当展示平面的上下文丢失，就需重新配置
                Err(wgpu::SurfaceError::Lost) => state.resize(state.size),
                // 系统内存不足时，程序应该退出。
                Err(wgpu::SurfaceError::OutOfMemory) => *control_flow = ControlFlow::Exit,
                // 所有其他错误（过期、超时等）应在下一帧解决
                Err(e) => eprintln!("{:?}", e),
            }
        }
        Event::MainEventsCleared => {
            // 除非我们手动请求，RedrawRequested 将只会触发一次。
            window.request_redraw();
        }
        // ...
    }
});
```

基于以上这些，你就能获得如下渲染效果：

![蓝色背景的窗口](./cleared-window.png)

## 关于渲染通道描述符

部分读者可能光看代码就能理解，但如果我不把它介绍一遍，那就是失职。让我们再看一下代码：

```rust
&wgpu::RenderPassDescriptor {
    label: Some("Render Pass"),
    color_attachments: &[
        // ...
    ],
    depth_stencil_attachment: None,
}
```

**渲染通道描述符**（`RenderPassDescriptor`）只有三个字段: `label`, `color_attachments` 和 `depth_stencil_attachment`。`color_attachments` 描述了要将颜色绘制到哪里。我们使用之前创建的**纹理视图**来确保渲染到屏幕上。

<div class="note">

`color_attachments` 字段是一个稀疏数组。这允许你使用有多个渲染目标的**管线**，并且最终只绘制到你所关心的某个渲染目标。

</div>

我们后面会使用到 `depth_stencil_attachment`，现在先将它设置为 `None`。

```rust
Some(wgpu::RenderPassColorAttachment {
    view: &view,
    resolve_target: None,
    ops: wgpu::Operations {
        load: wgpu::LoadOp::Clear(wgpu::Color {
            r: 0.1,
            g: 0.2,
            b: 0.3,
            a: 1.0,
        }),
        store: true,
    },
})
```

`RenderPassColorAttachment` 有一个 `view` 字段，用于通知 wgpu 将颜色保存到什么**纹理**。这里我们指定使用 `surface.get_current_texture()` 创建的 `view`，这意味着向此**附件**（Attachment）上绘制的任何颜色都会被绘制到屏幕上。

`resolve_target` 是接收**多重采样**解析输出的纹理。除非启用了多重采样, 否则不需要设置它，保留为 `None` 即可。

`ops` 字段需要一个 `wpgu::Operations` 对象。它告诉 wgpu 如何处理屏幕上的颜色（由 `view` 指定）。`load` 字段告诉 wgpu 如何处理存储在前一帧的颜色。目前，我们正在用蓝色**清屏**。`store` 字段告诉 wgpu 是否要将渲染的结果存储到**纹理视图**后面的纹理上（在这个例子中是 `SurfaceTexture` ）。我们希望存储渲染结果，所以设置为 `true`。

<div class="note">

当屏幕被场景**对象**完全遮挡，那么不**清屏**是很常见的。但如果你的场景没有覆盖整个屏幕，就会出现类似下边的情况：

![./no-clear.png](./no-clear.png)

</div>

## 验证错误?

如果你的机器上运行的是 Vulkan SDK 的旧版本， wgpu 在你的机器上使用 Vulkan 后端时可能会遇到**验证错误**。至少需要使用 `1.2.182` 及以上版本，因为旧版本可能会产生一些误报。如果错误持续存在，那可能是遇到了 wgpu 的错误。你可以在 [https://github.com/gfx-rs/wgpu](https://github.com/gfx-rs/wgpu) 上提交此问题。

## 挑战

修改 `input()` 函数以捕获鼠标事件，并使用该函数来更新**清屏**的颜色。_提示：你可能需要用到 `WindowEvent::CursorMoved`_。

<WasmExample example="tutorial2_surface"></WasmExample>

<AutoGithubLink/>

## 加入 wgpu 微信学习群交流群

<JoinWeiChatGroup />