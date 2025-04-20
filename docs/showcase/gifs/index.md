# 生成 GIF 动图

假如你想要展示一个自己实现的，漂亮的 WebGPU 模拟动画，当然可以录制一个视频，但如果只是想在微博或朋友圈以九宫格来展示呢？

这，就是 [GIF](https://en.wikipedia.org/wiki/GIF) 的用武之地。

另外，GIF 的发音是 GHIF，而不是 JIF，因为 JIF 不仅是[花生酱](https://en.wikipedia.org/wiki/Jif_%28peanut_butter%29)，它也是一种[不同的图像格式](https://filext.com/file-extension/JIF)。

## 如何制作 GIF？

我们使用 [gif 包](https://docs.rs/gif/)创建一个函数来对渲染的图像进行编码：

```rust
fn save_gif(path: &str, frames: &mut Vec<Vec<u8>>, speed: i32, size: u16) -> Result<(), failure::Error> {
    use gif::{Frame, Encoder, Repeat, SetParameter};

    let mut image = std::fs::File::create(path)?;
    let mut encoder = Encoder::new(&mut image, size, size, &[])?;
    encoder.set(Repeat::Infinite)?;

    for mut frame in frames {
        encoder.write_frame(&Frame::from_rgba_speed(size, size, &mut frame, speed))?;
    }

    Ok(())
}
```

上面的函数所需要的参数是 GIF 的帧数，它应该运行多快，以及 GIF 的大小。

## 如何生成帧数据？

如果看过[离屏渲染案例](../windowless/#a-triangle-without-a-window)，你就知道我们可以直接渲染到一个**纹理**。我们将创建一个用于渲染的纹理和一个用于复制纹理的**纹素**数据的**缓冲区**：

```rust
// 创建一个用于渲染的纹理
let texture_size = 256u32;
let rt_desc = wgpu::TextureDescriptor {
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
let render_target = framework::Texture::from_descriptor(&device, rt_desc);

// wgpu 需要使用 wgpu::COPY_BYTES_PER_ROW_ALIGNMENT 对齐纹理 -> 缓冲区的复制
// 因此，我们需要同时保存 padded_bytes_per_row 和 unpadded_bytes_per_row
let pixel_size = mem::size_of::<[u8;4]>() as u32;
let align = wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
let unpadded_bytes_per_row = pixel_size * texture_size;
let padding = (align - unpadded_bytes_per_row % align) % align;
let padded_bytes_per_row = unpadded_bytes_per_row + padding;

// 创建一个用于复制纹素数据的缓冲区
let buffer_size = (padded_bytes_per_row * texture_size) as wgpu::BufferAddress;
let buffer_desc = wgpu::BufferDescriptor {
    size: buffer_size,
    usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
    label: Some("Output Buffer"),
    mapped_at_creation: false,
};
let output_buffer = device.create_buffer(&buffer_desc);
```

现在，我们可以渲染一帧了，然后把这个帧缓冲区数据（也就是我们上面创建的纹理的纹素数据）复制到一个 `Vec<u8>` 数组。

```rust
let mut frames = Vec::new();

for c in &colors {
    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
        label: None,
    });

    let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: Some("GIF Pass"),
        color_attachments: &[
            wgpu::RenderPassColorAttachment {
                view: &render_target.view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(
                        wgpu::Color {
                            r: c[0],
                            g: c[1],
                            b: c[2],
                            a: 1.0,
                        }
                    ),
                    store: wgpu::StoreOp::Store
                },
            }
        ],
        ..Default::default()
    });

    rpass.set_pipeline(&render_pipeline);
    rpass.draw(0..3, 0..1);

    drop(rpass);

    encoder.copy_texture_to_buffer(
        wgpu::TexelCopyTextureInfo {
            texture: &render_target.texture,
            mip_level: 0,
            origin: wgpu::Origin3d::ZERO,
        },
        wgpu::TexelCopyBufferInfo {
            buffer: &output_buffer,
            layout: wgpu::TexelCopyBufferLayout {
                offset: 0,
                bytes_per_row: padded_bytes_per_row,
                rows_per_image: texture_size,
            }
        },
        render_target.desc.size
    );

    queue.submit(Some(encoder.finish()));

    // 创建一个缓冲区数据异步映射
    let buffer_slice = output_buffer.slice(..);
    let request = buffer_slice.map_async(wgpu::MapMode::Read);
    // 等待 GPU 完成上面的任务
    device.poll(wgpu::PollType::Wait).unwrap();
    let result = request.await;

    match result {
        Ok(()) => {
            let padded_data = buffer_slice.get_mapped_range();
            let data = padded_data
                .chunks(padded_bytes_per_row as _)
                .map(|chunk| { &chunk[..unpadded_bytes_per_row as _]})
                .flatten()
                .map(|x| { *x })
                .collect::<Vec<_>>();
            drop(padded_data);
            output_buffer.unmap();
            frames.push(data);
        }
        _ => { eprintln!("Something went wrong") }
    }

}
```

完成后，就可以将我们的帧数据传递给 `save_gif()` 函数了：

```rust
save_gif("output.gif", &mut frames, 1, texture_size as u16).unwrap();
```

我们还可以使用纹理数组来做优化，并一次发送所有绘制命令。
但上面的简单程序就是生成 GIF 动图的全部要点了，运行示例代码将得到以下 GIF 图：

![./output.gif](./output.gif)

<AutoGithubLink/>
