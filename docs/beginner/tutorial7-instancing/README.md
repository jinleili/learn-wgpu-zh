# 实例化绘制

我们目前的场景非常简单：仅有一个以坐标 (0,0,0) 为中心的**对象**。如果想要绘制更多的对象呢？
这，就是**实例化绘制**（Instancing）的用武之地了。

**实例化绘制**允许我们以不同的属性（位置、方向、大小、颜色等）多次绘制同一个对象。有多种方式可以实现实例化绘制。其中一种方式是修改 Uniform 缓冲区以加入这些属性，并在绘制每个对象实例之前更新它。

出于性能原因，我们不推荐这种方式。因为逐**实例**更新时，uniform **缓冲区**需要为每一帧复制多个缓冲区而消耗 GPU 内存带宽, 且随实例数增加的绘制命令更是会消耗 GPU 的执行时间。

如果查阅 [wgpu 文档](https://docs.rs/wgpu/latest/wgpu/struct.RenderPass.html#method.draw_indexed) 中 `draw_indexed` 函数的参数 ，我们可以看到解决这一问题的方式：

```rust=
pub fn draw_indexed(
    &mut self,
    indices: Range<u32>,
    base_vertex: i32,
    instances: Range<u32> // <-- 在这里
)
```

`instances` 参数是**范围**（`Range<u32>`）类型的值。它命令 GPU 绘制指定对象的多少个实例。目前我们指定的是`0..1`，它命令 GPU 绘制 1 个实例后停止。如果使用 `0..5`，我们的代码就绘制 5 个实例。

`instances` 的**范围**类型可能看起来很奇怪，因为使用 `1..2` 仍然是绘制 1 个实例。似乎直接使用 `u32` 类型会更简单，对吧？这里是**范围**类型的原因是：有时我们不想绘制出*所有*对象; 有时因为其他实例可能不该出现在这一**帧**中而只想绘制指定部分的实例; 又或者我们正在调试某组特定的实例。

好了，现在我们知道了如何绘制 1 个对象的多个实例，那么如何告诉 wgpu 要绘制哪些指定的实例呢？我们将要用到**实例缓冲区**（Instance Buffer）的概念。

## 实例缓冲区 

我们将以类似于创建 Uniform 缓冲区的方式创建一个**实例缓冲区**。首先，声明一个名为 `Instance` 的结构体：

```rust
// lib.rs
// ...

// 新增!
struct Instance {
    position: cgmath::Vector3<f32>,
    rotation: cgmath::Quaternion<f32>,
}
```

<div class="note">

**四元数**（Quaternion） 是一种通常用来表示旋转的数学结构。这里不会介绍它背后的数学原理（涉及**虚数**和 4 维空间）。如果你想深入了解四元数，这里有一篇 [Wolfram Alpha](https://mathworld.wolfram.com/Quaternion.html) 的文章。

</div>

在**着色器**中直接使用这些值会有麻烦，因为 WGSL 里没有**四元数**的数据类型。我不想在着色器中做四元数运算，所以把 `Instance` 数据转换成了**矩阵**，并将其存储在一个名为 `InstanceRaw` 的结构体中：

```rust
// 新增!
#[repr(C)]
#[derive(Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct InstanceRaw {
    model: [[f32; 4]; 4],
}
```

这就是将要写入**缓冲区**的数据。我们拆分出 `InstanceRaw` 之后，就可以自由地更新 `Instance` 而无需涉及矩阵，因为 raw 数据只需要在绘制之前更新。

让我们在 `Instance` 上创建一个函数来计算并返回 `InstanceRaw`：

```rust
// 新增!
impl Instance {
    fn to_raw(&self) -> InstanceRaw {
        InstanceRaw {
            model: (cgmath::Matrix4::from_translation(self.position) * cgmath::Matrix4::from(self.rotation)).into(),
        }
    }
}
```

现在需要给 `State` 添加两个字段：`instances` 和 `instance_buffer`：

```rust
struct State {
    instances: Vec<Instance>,
    instance_buffer: wgpu::Buffer,
}
```

`cgmath` **包**使用 trait 来为 `Vector3` 等类型提供通用的数学函数，这些 trait 必须在相关函数被调用之前导入。为了方便起见，包内的 `prelude` 模块在导入时就会提供一些常用的扩展 trait。

要导入 prelude 模块，只需把下边这行代码放在 `lib.rs` 的顶部：

```rust
use cgmath::prelude::*;
```

接下来在 `new()` 函数中创建实例数据，先定义几个**常量**用于简化代码：

```rust
const NUM_INSTANCES_PER_ROW: u32 = 10;
const INSTANCE_DISPLACEMENT: cgmath::Vector3<f32> = cgmath::Vector3::new(NUM_INSTANCES_PER_ROW as f32 * 0.5, 0.0, NUM_INSTANCES_PER_ROW as f32 * 0.5);
```

我们将创建一组 10 行 10 列空间排列均匀的实例数据，下边是具体代码：

```rust
impl State {
    async fn new(window: &Window) -> Self {
        // ...
        let instances = (0..NUM_INSTANCES_PER_ROW).flat_map(|z| {
            (0..NUM_INSTANCES_PER_ROW).map(move |x| {
                let position = cgmath::Vector3 { x: x as f32, y: 0.0, z: z as f32 } - INSTANCE_DISPLACEMENT;

                let rotation = if position.is_zero() {
                    // 这一行特殊确保在坐标 (0, 0, 0) 处的对象不会被缩放到 0
                    // 因为错误的四元数会影响到缩放
                    cgmath::Quaternion::from_axis_angle(cgmath::Vector3::unit_z(), cgmath::Deg(0.0))
                } else {
                    cgmath::Quaternion::from_axis_angle(position.normalize(), cgmath::Deg(45.0))
                };

                Instance {
                    position, rotation,
                }
            })
        }).collect::<Vec<_>>();
        // ...
    }
}
```

现在数据已经有了，我们来创建实际的**实例缓冲区**：

```rust
let instance_data = instances.iter().map(Instance::to_raw).collect::<Vec<_>>();
let instance_buffer = device.create_buffer_init(
    &wgpu::util::BufferInitDescriptor {
        label: Some("Instance Buffer"),
        contents: bytemuck::cast_slice(&instance_data),
        usage: wgpu::BufferUsages::VERTEX,
    }
);
```

需要为 `InstanceRaw` 创建一个新的**顶点缓冲区布局**：

```rust
impl InstanceRaw {
    fn desc<'a>() -> wgpu::VertexBufferLayout<'a> {
        use std::mem;
        wgpu::VertexBufferLayout {
            array_stride: mem::size_of::<InstanceRaw>() as wgpu::BufferAddress,
            // step_mode 的值需要从 Vertex 改为 Instance
            // 这意味着只有着色器开始处理一次新实例化绘制时，才会使用下一个实例数据
            step_mode: wgpu::VertexStepMode::Instance,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    // 虽然顶点着色器现在只使用了插槽 0 和 1，但在后面的教程中将会使用 2、3 和 4
                    // 此处从插槽 5 开始，确保与后面的教程不会有冲突
                    shader_location: 5,
                    format: wgpu::VertexFormat::Float32x4,
                },
                // mat4 从技术的角度来看是由 4 个 vec4 构成，占用 4 个插槽。
                // 我们需要为每个 vec4 定义一个插槽，然后在着色器中重新组装出 mat4。
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 4]>() as wgpu::BufferAddress,
                    shader_location: 6,
                    format: wgpu::VertexFormat::Float32x4,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 8]>() as wgpu::BufferAddress,
                    shader_location: 7,
                    format: wgpu::VertexFormat::Float32x4,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 12]>() as wgpu::BufferAddress,
                    shader_location: 8,
                    format: wgpu::VertexFormat::Float32x4,
                },
            ],
        }
    }
}
```

我们需要将此**布局**添加到渲染**管线**中，以便在渲染时可以使用它：

```rust
let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
    // ...
    vertex: wgpu::VertexState {
        // ...
        // 更新!
        buffers: &[Vertex::desc(), InstanceRaw::desc()],
    },
    // ...
});
```

别忘了要返回新增的变量：

```rust
Self {
    // ...
    // 新添加!
    instances,
    instance_buffer,
}
```

最后，在 `render()` 函数中绑定 `instance_buffer`，并修改 `draw_indexed()` 绘制命令以使用我们实际的实例数：

```rust
render_pass.set_pipeline(&self.render_pipeline);
render_pass.set_bind_group(0, &self.diffuse_bind_group, &[]);
render_pass.set_bind_group(1, &self.camera_bind_group, &[]);
render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
// 新添加!
render_pass.set_vertex_buffer(1, self.instance_buffer.slice(..));
render_pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint16);

// 更新!
render_pass.draw_indexed(0..self.num_indices, 0, 0..self.instances.len() as _);
```

<div class="warning">

当你向**数组**添加新的实例时，请确保重新创建了 `instance_buffer` 和 `camera_bind_group`，否则新实例不会正确显示。

</div>

`shader.wgsl` 中需要引入我们新增的**矩阵**，这样才能在实例中使用它。请在 `shader.wgsl` 文件的顶部添加以下代码：

```wgsl
struct InstanceInput {
    @location(5) model_matrix_0: vec4<f32>,
    @location(6) model_matrix_1: vec4<f32>,
    @location(7) model_matrix_2: vec4<f32>,
    @location(8) model_matrix_3: vec4<f32>,
};
```

在使用之前，我们需要将**矩阵**重新组装出来：

```wgsl
@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    let model_matrix = mat4x4<f32>(
        instance.model_matrix_0,
        instance.model_matrix_1,
        instance.model_matrix_2,
        instance.model_matrix_3,
    );
    // Continued...
}
```

我们得在应用 `camera_uniform.view_proj` 之前先应用 `model_matrix`。因为 `view_proj` 将坐标系从**世界空间**（World Space）变换为**相机空间**（Camera Space），而 `model_matrix` 是一个**世界空间**的变换，所以在使用它时不希望处于**相机空间**。

```wgsl
@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    // ...
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;
    out.clip_position = camera.view_proj * model_matrix * vec4<f32>(model.position, 1.0);
    return out;
}
```

完成后，应该就能看到一片树林了！

![./forest.png](./forest.png)

## 挑战

逐帧变更实例的位置 和/或 旋转弧度。

<WasmExample example="tutorial7_instancing"></WasmExample>

<AutoGithubLink/>
