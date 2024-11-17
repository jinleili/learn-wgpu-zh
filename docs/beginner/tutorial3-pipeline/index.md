# 管线 (Pipeline)

## 什么是管线?

**管线** （`ComputePipeline`、`RenderPipeline`）由一系列资源绑定、可编程阶段（**着色器**）设置及固定功能状态组成。它代表了由 GPU 硬件、驱动程序和用户代理组合而成的完整功能对象，描述了 GPU 将对一组数据执行的所有操作。在本节中，我们将具体创建一个**渲染管线**（`RenderPipeline`）。

## 什么是着色器?

**着色器**（Shader）是你发送给 GPU 的微型程序，用于对数据进行操作。有三种主要类型的着色器：**顶点**（Vertex）、**片元**（Fragment）和**计算**（Compute）着色器。另外还有其他的如几何着色器，但它们属于进阶话题。现在，我们只需要使用顶点和片元着色器。

## 什么是顶点和片元？

**顶点**（Vertex）就是三维（或二维）空间中的一个点。这些顶点会两个一组以构成线段集合，或者三个一组以构成三角形集合。

<img alt="Vertices Graphic" src="./tutorial3-pipeline-vertices.png" />

从简单的立方体到复杂的人体结构，大多数现代渲染系统都使用三角形来建模所有图形。这些三角形被存储为构成三角形角的顶点。

<!-- Todo: Find/make an image to put here -->

我们使用顶点着色器来操作顶点，以便按我们想要的样子做图形的变换。

然后顶点经过**光栅化**（rasterization）后流转到片元着色阶段，片元着色器决定了片元的颜色。渲染结果图像中的每个像素至少对应一个片元，每个片元可输出一个颜色，该颜色会被存储到其相应的像素上（准确的说，片元的输出是存储到 Color Attachment 的**纹素**上）。

## WebGPU 着色器语言: WGSL

**WGSL** (WebGPU Shading Language) 是 WebGPU 的着色器语言。
WGSL 的开发重点是让它轻松转换为与后端对应的着色器语言；例如，Vulkan 的 SPIR-V、Metal 的 MSL、DX12 的 HLSL 和 OpenGL 的 GLSL。
这种转换是在内部完成的，我们不需要关心这些细节。
就 wgpu 而言，它是由名为 [naga](https://github.com/gfx-rs/naga) 的**包**完成的。

在 [WGSL 着色器语言](../wgsl) 一章中，有对 WGSL 的由来及语法的更详细介绍。

<div class="note">

WGSL 规范及其在 WGPU 中的应用仍在开发中。如果在使用中遇到问题，你或许希望 [https://app.element.io/#/room/#wgpu:matrix.org](https://app.element.io/#/room/#wgpu:matrix.org) 社区的人帮忙看一下你的代码。

</div>

## 编写着色器

在 `main.rs` 所在的目录中创建一个 `shader.wgsl` 文件。在其中写入以下代码：

```rust
// 顶点着色器

struct VertexOutput {
    @builtin(position) clip_position: vec4f,
};

@vertex
fn vs_main(
    @builtin(vertex_index) in_vertex_index: u32,
) -> VertexOutput {
    var out: VertexOutput;
    let x = f32(1 - i32(in_vertex_index)) * 0.5;
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1) * 0.5;
    out.clip_position = vec4f(x, y, 0.0, 1.0);
    return out;
}
```

首先，声明一个 `struct` 来存储顶点着色器的输出。目前只有一个字段，即 `clip_position`。`@builtin(position)` 属性标记了此字段将作为顶点在[裁剪坐标系](https://en.wikipedia.org/wiki/Clip_coordinates)中的位置来使用。这类似于 GLSL 的 `gl_Position` 变量。

<div class="note">

形如 `vec4` 的向量类型是泛型。目前你必须指定向量将包含的值的类型。因此一个使用 32 位浮点数的 3 维向量写做 `vec3f`。

</div>

着色器代码的下一部分是 `vs_main` 函数。`@vertex` 属性标记了这个函数是顶点着色器的有效入口。我们预期有一个 `u32` 类型的变量 `in_vertex_index`，它的值来自 `@builtin(vertex_index)`。

然后使用 `VertexOutput` 结构体声明一个名为 `out` 的变量。我们为顶点的裁剪空间坐标创建另外两个 `x` `y` 变量。

<div class="note">

`f32()` 和 `i32()` 表示类型强制转换，将括号里的值转换为此类型。

</div>

现在我们可以把 `clip_position` 保存到 `out`。然后只需返回 `out` 就完成了顶点着色器的工作!

<div class="note">

我们也可以不使用 stuct，直接按以下代码来实现：

```rust
@vertex
fn vs_main(
    @builtin(vertex_index) in_vertex_index: u32
) -> @builtin(position) vec4f {
    // 顶点着色器 code...
}
```

</div>

接下来是片元着色器。还是在 `shader.wgsl` 中添加以下代码：

```rust
// 片元着色器

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    return vec4f(0.3, 0.2, 0.1, 1.0);
}
```

这将当前片元的颜色设置为棕色。

<div class="note">

注意，顶点和片元着色器的入口点分别被命名为 `vs_main` 和 `fs_main`。在 wgpu 的早期版本中，这两个函数有相同的名字是可以的，但较新版本的 [WGSL spec](https://www.w3.org/TR/WGSL/#declaration-and-scope) 要求这些名字必须不同。因此在整个教程中都使用（从 `wgpu` demo 中采用）上述命名方案。

</div>

`@location(0)` 属性标记了该函数返回的 `vec4` 值将存储在第一个**颜色附件**（Color Attachment）中。

## 使用着色器

终于要用到本章节标题提到的概念 **管线**（Pipeline）了。首先，我们来修改 `WgpuApp` 以包括以下代码。

```rust
// lib.rs
struct WgpuApp {
    app: AppSurface,
    size: PhysicalSize<u32>,
    size_changed: bool,
    // 新添加!
    render_pipeline: wgpu::RenderPipeline,
}
```

现在，开始在 `new()` 函数内创建**管线**。我们需要载入先前写的，渲染管线所需要的着色器。

```rust
let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
    label: Some("Shader"),
    source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
});
```

<div class="note">

也可以使用 `include_wgsl!` 宏作为创建 `ShaderModuleDescriptor` 的快捷方式。

```rust
let shader = device.create_shader_module(include_wgsl!("shader.wgsl"));
```

</div>

还需要创建一个 `PipelineLayout`。在讲完**缓冲区**（`Buffer`）之后，我们会对它有更多地了解。

```rust
let render_pipeline_layout =
    device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("Render Pipeline Layout"),
        bind_group_layouts: &[],
        push_constant_ranges: &[],
    });
```

最后，我们就获得了创建 `render_pipeline` 所需的全部资源：

```rust
let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
    label: Some("Render Pipeline"),
    layout: Some(&render_pipeline_layout),
    vertex: wgpu::VertexState {
        module: &shader,
        compilation_options: Default::default(),
        entry_point: "vs_main", // 1.
        buffers: &[], // 2.
    },
    fragment: Some(wgpu::FragmentState { // 3.
        module: &shader,
        compilation_options: Default::default(),
        entry_point: "fs_main",
        targets: &[Some(wgpu::ColorTargetState { // 4.
            format: config.format,
            blend: Some(wgpu::BlendState::REPLACE),
            write_mask: wgpu::ColorWrites::ALL,
        })],
    }),
    // ...
```

有几点需要注意：

1. 可以在这里指定着色器中的哪个函数应该是入口点（ `entry_point`）。那是我们用 `@vertex` 和 `@fragment` 标记的函数。
2. `buffers` 字段告诉 `wgpu` 要把什么类型的顶点数据传递给顶点着色器。我们会在顶点着色器中指定顶点，所以这里先留空。下一个教程中会在此加入一些数据。
3. `fragment` 字段是 Option 类型，所以必须用 `Some()` 来包装 `FragmentState` 实例。如果想把颜色数据存储到 `surface` 就需要用到它 。
4. `targets` 字段告诉 `wgpu` 应该设置哪些颜色输出目标。目前只需设置一个输出目标。格式指定为使用 `surface` 的格式，并且指定混合模式为仅用新的像素数据替换旧的。我们还告诉 `wgpu` 可写入全部 4 个颜色通道：红、蓝、绿和透明度。_在讨论纹理时会更多地介绍_ `color_state`。

```rust
primitive: wgpu::PrimitiveState {
    topology: wgpu::PrimitiveTopology::TriangleList, // 1.
    strip_index_format: None,
    front_face: wgpu::FrontFace::Ccw, // 2.
    cull_mode: Some(wgpu::Face::Back),
    // 将此设置为 Fill 以外的任何值都要需要开启 Feature::NON_FILL_POLYGON_MODE
    polygon_mode: wgpu::PolygonMode::Fill,
    // 需要开启 Features::DEPTH_CLIP_CONTROL
    unclipped_depth: false,
    // 需要开启 Features::CONSERVATIVE_RASTERIZATION
    conservative: false,
},
// continued ...
```

图元（`primitive`）字段描述了将如何解释顶点来转换为三角形。

1. `PrimitiveTopology::TriangleList` 意味着每三个顶点组成一个三角形。
2. `front_face` 字段告诉 `wgpu` 如何确定三角形的朝向。`FrontFace::Ccw` 指定顶点的**帧缓冲区坐标**（framebuffer coordinates）按逆时针顺序给出的三角形为朝前（面向屏幕外）。
3. `cull_mode` 字段告诉 `wgpu` 如何做三角形剔除。`CullMode::Back` 指定朝后（面向屏幕内）的三角形会被剔除（不被渲染）。我们会在讨论缓冲区（`Buffer`）时详细介绍剔除问题。

```rust
    depth_stencil: None, // 1.
    multisample: wgpu::MultisampleState {
        count: 1, // 2.
        mask: !0, // 3.
        alpha_to_coverage_enabled: false, // 4.
    },
    multiview: None, // 5.
    cache: None,
});
```

该函数的其余部分非常简单：

1. 我们目前没有使用深度/模板缓冲区，因此将 `depth_stencil` 保留为 `None`。_以后会用到_。
2. `count` 确定管线将使用多少个**采样**。多重采样是一个复杂的主题，因此不会在这里展开讨论。
3. `mask` 指定哪些采样应处于活动状态。目前我们使用全部采样。
4. `alpha_to_coverage_enabled` 与抗锯齿有关。在这里不介绍抗锯齿，因此将其保留为 false。
5. `multiview` 表示渲染附件可以有多少数组层。我们不会渲染到数组纹理，因此将其设置为 `None`。

<!-- https://gamedev.stackexchange.com/questions/22507/what-is-the-alphatocoverage-blend-state-useful-for -->

现在我们要做的就是把 `render_pipeline` 添加到 `WgpuApp`，然后就可以使用它了!

```rust
// new()
Self {
    app,
    size,
    size_changed: false,
    // 新添加!
    render_pipeline,
}
```

## 使用管线

如果现在运行程序，它会花更多的时间来启动，但仍然只会显示我们在上一节得到的蓝屏。因为虽然我们创建了 `render_pipeline`，但还需要修改 `render()` 函数中的代码来实际使用它:

```rust
// render()

// ...
{
    // 1.
    let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: Some("Render Pass"),
        color_attachments: &[
            // 这就是片元着色器中 @location(0) 标记指向的颜色附件
            Some(wgpu::RenderPassColorAttachment {
                view: &view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(
                        wgpu::Color {
                            r: 0.1,
                            g: 0.2,
                            b: 0.3,
                            a: 1.0,
                        }
                    ),
                    store: wgpu::StoreOp::Store
                }
            })
        ],
        ..Default::default()
    });

    // 新添加!
    render_pass.set_pipeline(&self.render_pipeline); // 2.
    render_pass.draw(0..3, 0..1); // 3.
}
// ...
```

上面代码所做的少量修改：

1. 把 `_render_pass` 声明为可变变量并重命名为 `render_pass`。
2. 在 `render_pass` 上设置刚刚创建的**管线**。
3. 告诉 `wgpu` 用 3 个顶点和 1 个实例（实例的索引就是 `@builtin(vertex_index)` 的由来）来进行绘制。

修改完代码后，运行程序应该就能看到一个可爱的棕色三角形：

![可爱的棕色三角形](./tutorial3-pipeline-triangle.png)

## 挑战

创建第二个管线，使用三角形顶点的位置数据来创建一个颜色并发送给片元着色器。当你按下空格键时让应用程序交替使用两个管线。_提示：你需要修改_ `VertexOutput`。

<WasmExample example="tutorial3_pipeline"></WasmExample>

<AutoGithubLink/>
