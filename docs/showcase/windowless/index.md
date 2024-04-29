# 离屏渲染

有时我们只是想利用 gpu，也许是要并行地计算一组大的数字; 也许是正在制作一部 3D 电影，并需要用路径追踪来创建一个看起来很真实的场景; 也许正在挖掘一种加密货币。在所有这些情况下，我们可能 _不需要_ 从窗口看到正在发生的事情。

## 如何使用？

**离屏渲染**（Off-Screen Rendering, 也叫做 Windowless Rendering）其实很简单：事实上，我们不*需要*一个**窗口**（Window）来创建一个**GPU 实例**，不*需要*一个窗口来选择**适配器**，也不*需要*一个窗口来创建**逻辑设备**。我们只需要窗口来创建一个**展示平面**及**交换链**（SwapChain）。所以，只要有了**逻辑设备**，就可以开始向 GPU 发送命令。

```rust
let adapter = instance
    .request_adapter(&wgpu::RequestAdapterOptions {
        compatible_surface: Some(&surface),
        ..Default::default()
    })
    .await
    .unwrap();
let (device, queue) = adapter
    .request_device(&Default::default(), None)
    .await
    .unwrap();
```

## 离屏绘制一个三角形

虽然我们已经说过不需要看到 gpu 在做什么，但确实需要在某些时候看到结果。如果回顾一下关于 [surface](/beginner/tutorial2-surface/#render) 的讨论，会发现我们是使用 `surface.get_current_texture()` 获取一个纹理来绘制。

现在，我们跳过这一步，自己创建纹理。这里需要注意的是，需要指定 `TextureFormat::Rgba8UnormSrgb` 为纹理像素格式而不是 `surface.get_capabilities(&adapter).formats[0]`，因为 PNG 使用 RGBA 而不是 BGRA 像素格式：

```rust
let texture_size = 256u32;

let texture_desc = wgpu::TextureDescriptor {
    size: wgpu::Extent3d {
        width: texture_size,
        height: texture_size,
        depth_or_array_layers: 1,
    },
    mip_level_count: 1,
    sample_count: 1,
    dimension: wgpu::TextureDimension::D2,
    format: wgpu::TextureFormat::Rgba8UnormSrgb,
    usage: wgpu::TextureUsages::COPY_SRC
        | wgpu::TextureUsages::RENDER_ATTACHMENT,
    label: None,
    view_formats: &[],
};
let texture = device.create_texture(&texture_desc);
let texture_view = texture.create_view(&Default::default());
```

usage 字段的 `RENDER_ATTACHMENT` 位令 wgpu 可以渲染到此纹理，`COPY_SRC` 位令我们能够从纹理中提取数据，以便能够将其保存到文件中。

虽然我们可以使用这个纹理来绘制三角形，但还需要一些方法来获取它里面的像素。在[纹理](/beginner/tutorial5-textures/)教程中，我们用一个**缓冲区**从一个文件中加载颜色数据，然后复制到另一个缓冲区。

我们要做的是反过来：从纹理中把数据复制到**缓冲区**，然后保存到文件中。我们得创建一个足够大的缓冲区来容纳数据：

```rust
let u32_size = std::mem::size_of::<u32>() as u32;

let output_buffer_size = (u32_size * texture_size * texture_size) as wgpu::BufferAddress;
let output_buffer_desc = wgpu::BufferDescriptor {
    size: output_buffer_size,
    usage: wgpu::BufferUsages::COPY_DST
        // MAP_READ 告诉 wpgu 我们要在 cpu 端读取此缓冲区
        | wgpu::BufferUsages::MAP_READ,
    label: None,
    mapped_at_creation: false,
};
let output_buffer = device.create_buffer(&output_buffer_desc);
```

现在已经做好了离屏绘制的准备，让我们来绘制点东西试试。由于只是画一个三角形，可以重用[管线](/beginner/tutorial3-pipeline/#writing-the-shaders)教程中的着色器代码:

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

// 片元着色器

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    return vec4f(0.3, 0.2, 0.1, 1.0);
}
```

然后用着色器来创建一个简单的**渲染管线** `RenderPipeline`：

```rust
 let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Shader"),
            source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
        });

let render_pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
    label: Some("Render Pipeline Layout"),
    bind_group_layouts: &[],
    push_constant_ranges: &[],
});

let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
    label: Some("Render Pipeline"),
    layout: Some(&render_pipeline_layout),
    vertex: wgpu::VertexState {
        module: &shader,
        entry_point: "vs_main",
        compilation_options: Default::default(),
        buffers: &[],
    },
    fragment: Some(wgpu::FragmentState {
        module: &fs_module,
        entry_point: "main",
        compilation_options: Default::default(),
        targets: &[Some(wgpu::ColorTargetState {
            format: texture_desc.format,
            alpha_blend: wgpu::BlendState::REPLACE,
            color_blend: wgpu::BlendState::REPLACE,
            write_mask: wgpu::ColorWrites::ALL,
        })],
    }),
    primitive: wgpu::PrimitiveState {
        topology: wgpu::PrimitiveTopology::TriangleList,
        strip_index_format: None,
        front_face: wgpu::FrontFace::Ccw,
        cull_mode: Some(wgpu::Face::Back),
        polygon_mode: wgpu::PolygonMode::Fill,
    },
    depth_stencil: None,
    multisample: wgpu::MultisampleState {
        count: 1,
        mask: !0,
        alpha_to_coverage_enabled: false,
    },
});
```

接着创建一个**命令编码器** `CommandEncoder`：

```rust
let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
    label: None,
});
```

离屏渲染最关键的地方就是**渲染通道** 的设置了。一个渲染通道至少需要一个**颜色附件**，一个颜色附件需要绑定一个**纹理视图**。前面的教程我们一直使用的是**交换链**（`SwapChain`）的纹理视图，但事实上任何纹理视图都可以，包括我们自己创建的 `texture_view`：

```rust
{
    let render_pass_desc = wgpu::RenderPassDescriptor {
        label: Some("Render Pass"),
        color_attachments: &[
            wgpu::RenderPassColorAttachment {
                view: &texture_view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: 0.1,
                        g: 0.2,
                        b: 0.3,
                        a: 1.0,
                    }),
                    store: wgpu::StoreOp::Store
                },
            }
        ],
        ..Default::default()
    };
    let mut render_pass = encoder.begin_render_pass(&render_pass_desc);

    render_pass.set_pipeline(&render_pipeline);
    render_pass.draw(0..3, 0..1);
}
```

让我们把绘制在**纹理**（`Texture`）中的像素数据复制到 `output_buffer` **缓冲区**：

```rust
encoder.copy_texture_to_buffer(
    wgpu::ImageCopyTexture {
        aspect: wgpu::TextureAspect::All,
                texture: &texture,
        mip_level: 0,
        origin: wgpu::Origin3d::ZERO,
    },
    wgpu::ImageCopyBuffer {
        buffer: &output_buffer,
        layout: wgpu::ImageDataLayout {
            offset: 0,
            bytes_per_row: u32_size * texture_size,
            rows_per_image: texture_size,
        },
    },
    texture_desc.size,
);
```

上面已经**编码**（Encode）好了所有的**命令**（Command），现在把它们提交给 GPU 来执行：

```rust
queue.submit(Some(encoder.finish()));
```

## 从缓冲区中读取数据

为了从**缓冲区**中读取数据，首先需要对它进行**映射**（Map），然后执行 `get_mapped_range()` 就可以得到一个**缓冲区视图** （`BufferView`）实例，它实质上就是一个 `&[u8]` 类型数据的容器：

```rust
// 需要对映射变量设置范围，以便我们能够解除缓冲区的映射
{
    let buffer_slice = output_buffer.slice(..);

    // 注意：我们必须在 await future 之前先创建映射，然后再调用 device.poll()。
    // 否则，应用程序将停止响应。
    let (tx, rx) = futures_intrusive::channel::shared::oneshot_channel();
    buffer_slice.map_async(wgpu::MapMode::Read, move |result| {
        tx.send(result).unwrap();
    });
    device.poll(wgpu::Maintain::Wait);
    rx.receive().await.unwrap().unwrap();

    let data = buffer_slice.get_mapped_range();

    use image::{ImageBuffer, Rgba};
    let buffer =
        ImageBuffer::<Rgba<u8>, _>::from_raw(texture_size, texture_size, data).unwrap();
    buffer.save("image.png").unwrap();

}
// 解除缓冲区映射
output_buffer.unmap();
```

<div class="note">

这个程序使用了 [futures-intrusive](https://docs.rs/futures-intrusive)，那也是 [wgpu 的 demo](https://github.com/gfx-rs/wgpu/tree/master/wgpu/examples/capture) 中使用的**包**。

</div>

## Main 函数不能异步化

`main()` 做为程序的入口函数，它默认无法返回一个 **Future**（异步任务抽象单元），所以不能使用 `async` 关键字。我们将通过把代码封装到另一个函数中来解决此问题，这样就可以在 `main()` 中**阻塞**它（也就是等待函数真正执行完成）。异步函数被调用时会立即返回一个 **Future** 对象，此时函数内的任务可能还没有真正开始执行， 我们需要使用一个可以轮询 Future 的**包**，比如[pollster crate](https://docs.rs/pollster)。

<div class="note">

有一些**包**可以用来标注 `main()` 函数为异步，如 [async-std](https://docs.rs/async-std) 和 [tokio](https://docs.rs/tokio)。我选择不这样做，因为这两个包对咱们的项目来说都有点儿重了。当然，你可以使用你喜欢的任何异步包和设置。

</div>

```rust
async fn run() {
    // 离屏绘制代码...
}

fn main() {
    pollster::block_on(run());
}
```

现在运行代码，就会在项目根目录输出这样一张名为 `image.png` 的图像：

![a brown triangle](./image-output.png)

<AutoGithubLink/>
