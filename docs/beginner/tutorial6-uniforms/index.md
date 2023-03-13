# Uniform 缓冲区与 3D 虚拟摄像机

虽然我们之前的渲染似乎都是在 2D 空间下进行的，但实际上我们一直都是在 3D 空间下渲染的！这就是为什么 `Vertex` 结构体的 `position` 是 3 个浮点数的数组而不是 2 个。由于我们是在正面观察，所以才无法真正看到场景的立体感。下面将通过创建一个**虚拟摄像机**（`Camera`）来改变我们的观察视角。

## 透视摄像机

本教程聚焦于 wgpu 的教学，而不是**线性代数**，所以会略过很多涉及的数学知识。如果你对线性代数感兴趣，网上有大量的阅读材料。我们将使用 [glam](https://github.com/bitshifter/glam-rs) 来处理所有数学问题，在 `Cargo.toml` 中添加以下依赖：

```toml
[dependencies]
# other deps...
glam = "0.18"
```

现在让我们开始使用此数学**包**！在 `State` 结构体上方创建**摄像机**结构体：

```rust
struct Camera {
    eye: glam::Vec3,
    target: glam::Vec3,
    up: glam::Vec3,
    aspect: f32,
    fovy: f32,
    znear: f32,
    zfar: f32,
}

impl Camera {
    fn build_view_projection_matrix(&self) -> glam::Mat4 {
        // 1.
        let view = glam::Mat4::look_at_rh(self.eye, self.target, self.up);
        // 2.
        let proj = glam::Mat4::perspective_rh(self.fovy.to_radians(), self.aspect, self.znear, self.zfar);

        // 3.
        return proj * view;
    }
}
```

`build_view_projection_matrix` 函数实现了视图投影矩阵。

1. **视图**矩阵移动并旋转世界坐标到**摄像机**所观察的位置。它本质上是**摄像机**变换的逆矩阵。
2. **投影**矩阵变换场景空间，以产生景深的效果。如果没有它，近处的物**对象**将与远处的大小相同。
3. wgpu 的坐标系统是基于 DirectX 和 Metal 的坐标系，在[归一化设备坐标](https://github.com/gfx-rs/gfx/tree/master/src/backend/dx12#normalized-coordinates)中，x 轴和 y 轴的范围是 [-1.0, 1.0]，而 z 轴是 [0.0, 1.0]。 移植 OpenGL 程序时需要注意：在 OpenGL 的归一化设备坐标中 z 轴的范围是 [-1.0, 1.0]。

现在我们来给 `State` 添加上 `camera` 字段：

```rust
struct State {
    // ...
    camera: Camera,
    // ...
}

async fn new(window: &Window) -> Self {
    // let diffuse_bind_group ...

    let camera = Camera {
        // 将摄像机向上移动 1 个单位，向后移动 2 个单位
        // +z 朝向屏幕外
        eye: (0.0, 1.0, 2.0).into(),
        // 摄像机看向原点
        target: (0.0, 0.0, 0.0).into(),
        // 定义哪个方向朝上
        up: glam::Vec3::Y,
        aspect: config.width as f32 / config.height as f32,
        fovy: 45.0,
        znear: 0.1,
        zfar: 100.0,
    };

    Self {
        // ...
        camera,
        // ...
    }
}
```

有了可以提供视图投影矩阵的**摄像机**，我们还需要一些方法将其引入着色器。

## Uniform 缓冲区

到目前为止，我们已经使用**缓冲区**来存储顶点和索引数据，甚至加载**纹理**。我们将再次使用它来创建一个称之为 `uniform` 的缓冲区。Uniform 缓冲区也是一个数据块，在一组着色器的每个调用都中都可以使用，从技术的角度来看，我们已经为**纹理**和**采样器**使用了 Uniform 缓冲区。下面将再次使用它们来存储视图投影**矩阵**，我们先创建一个结构体来保存 uniform：

```rust
// 此属性标注数据的内存布局兼容 C-ABI，令其可用于着色器
#[repr(C)]
// derive 属性自动导入的这些 trait，令其可被存入缓冲区
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct CameraUniform {
    // glam 的数据类型不能直接用于 bytemuck
    // 需要先将 Matrix4 矩阵转为一个 4x4 的浮点数数组
    view_proj: [[f32; 4]; 4],
}

impl CameraUniform {
    fn new() -> Self {
        Self {
            view_proj: glam::Mat4::IDENTITY.to_cols_array_2d(),
        }
    }

    fn update_view_proj(&mut self, camera: &Camera) {
        self.view_proj = camera.build_view_projection_matrix().to_cols_array_2d();
    }
}
```

封装好了数据，接下来创建一个名为 `camera_buffer` 的 Uniform 缓冲区：

```rust
// 在 new() 函数中创建 `camera` 后

let mut camera_uniform = CameraUniform::new();
camera_uniform.update_view_proj(&camera);

let camera_buffer = device.create_buffer_init(
    &wgpu::util::BufferInitDescriptor {
        label: Some("Camera Buffer"),
        contents: bytemuck::cast_slice(&[camera_uniform]),
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    }
);
```

## Uniform 缓冲区和绑定组

现在有了一个 Uniform 缓冲区，那该如何使用呢？答案是为它创建一个**绑定组**。我们得先创建绑定组的布局：

```rust
let camera_bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
    entries: &[
        wgpu::BindGroupLayoutEntry {
            binding: 0,
            visibility: wgpu::ShaderStages::VERTEX,     // 1
            ty: wgpu::BindingType::Buffer {
                ty: wgpu::BufferBindingType::Uniform,
                has_dynamic_offset: false,              // 2
                min_binding_size: None,
            },
            count: None,
        }
    ],
    label: Some("camera_bind_group_layout"),
});
```

1. 我们只在**顶点着色器**中需要**虚拟摄像机**信息，因为要用它来操作**顶点**。
2. `has_dynamic_offset` 字段表示这个**缓冲区**是否会动态改变偏移量。如果我们想一次性在 Uniform 中存储多组数据，并实时修改偏移量来告诉**着色器**当前使用哪组数据时，这就很有用。

现在，我们可以创建实际的**绑定组**了：

```rust
let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
    layout: &camera_bind_group_layout,
    entries: &[
        wgpu::BindGroupEntry {
            binding: 0,
            resource: camera_buffer.as_entire_binding(),
        }
    ],
    label: Some("camera_bind_group"),
});
```

就像对**纹理**所做的那样，我们需要在**管线**布局描述符中注册 `camera_bind_group_layout`：

```rust
let render_pipeline_layout = device.create_pipeline_layout(
    &wgpu::PipelineLayoutDescriptor {
        label: Some("Render Pipeline Layout"),
        bind_group_layouts: &[
            &texture_bind_group_layout,
            &camera_bind_group_layout,
        ],
        push_constant_ranges: &[],
    }
);
```

现在，需要将 `camera_buffer` 和 `camera_bind_group` 添加到 `State` 中：

```rust
struct State {
    // ...
    camera: Camera,
    camera_uniform: CameraUniform,
    camera_buffer: wgpu::Buffer,
    camera_bind_group: wgpu::BindGroup,
}

async fn new(window: &Window) -> Self {
    // ...
    Self {
        // ...
        camera,
        camera_uniform,
        camera_buffer,
        camera_bind_group,
    }
}
```

在进入**着色器**之前，我们要做的最后一件事就是在 `render()` 函数中使用**绑定组**：

```rust
render_pass.set_pipeline(&self.render_pipeline);
render_pass.set_bind_group(0, &self.diffuse_bind_group, &[]);
// 新添加!
render_pass.set_bind_group(1, &self.camera_bind_group, &[]);
render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
render_pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint16);

render_pass.draw_indexed(0..self.num_indices, 0, 0..1);
```

## 在顶点着色器中使用 uniform

修改顶点着色器以加入如下代码：

```rust
// 顶点着色器
struct CameraUniform {
    view_proj: mat4x4<f32>,
};
@group(1) @binding(0) // 1.
var<uniform> camera: CameraUniform;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
}

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;
    out.clip_position = camera.view_proj * vec4<f32>(model.position, 1.0); // 2.
    return out;
}
```

1. 因为我们已经创建了一个新的**绑定组**，所以需要指定在**着色器**中使用哪一个。这个数字由我们的 `render_pipeline_layout` 决定。`texture_bind_group_layout` 被列在第一位，因此它是 `group(0)`，而 `camera_bind_group` 是第二位，因此它是 `group(1)`。
2. 当涉及到**矩阵**时，乘法的顺序很重要。向量在最右边，矩阵按重要性顺序在左边（裁剪空间坐标 **=** 投影矩阵 **x** 模型视图矩阵 **x** 位置向量）。

## 摄像机控制器

如果现在运行代码，看到的将是如下渲染效果：

![./static-tree.png](./static-tree.png)

形状的拉伸度降低了，但它仍然是静态的。你可以尝试移动**摄像机**的位置使画面动起来，就像游戏中的摄像机通常所做的那样。由于本教程聚焦于 wgpu 的使用，而非用户输入事件的处理，所以仅在此贴出**摄像机控制器**（CameraController）的代码：

```rust
struct CameraController {
    speed: f32,
    is_forward_pressed: bool,
    is_backward_pressed: bool,
    is_left_pressed: bool,
    is_right_pressed: bool,
}

impl CameraController {
    fn new(speed: f32) -> Self {
        Self {
            speed,
            is_forward_pressed: false,
            is_backward_pressed: false,
            is_left_pressed: false,
            is_right_pressed: false,
        }
    }

    fn process_events(&mut self, event: &WindowEvent) -> bool {
        match event {
            WindowEvent::KeyboardInput {
                input: KeyboardInput {
                    state,
                    virtual_keycode: Some(keycode),
                    ..
                },
                ..
            } => {
                let is_pressed = *state == ElementState::Pressed;
                match keycode {
                    VirtualKeyCode::W | VirtualKeyCode::Up => {
                        self.is_forward_pressed = is_pressed;
                        true
                    }
                    VirtualKeyCode::A | VirtualKeyCode::Left => {
                        self.is_left_pressed = is_pressed;
                        true
                    }
                    VirtualKeyCode::S | VirtualKeyCode::Down => {
                        self.is_backward_pressed = is_pressed;
                        true
                    }
                    VirtualKeyCode::D | VirtualKeyCode::Right => {
                        self.is_right_pressed = is_pressed;
                        true
                    }
                    _ => false,
                }
            }
            _ => false,
        }
    }

    fn update_camera(&self, camera: &mut Camera) {
        let forward = camera.target - camera.eye;
        let forward_norm = forward.normalize();
        let forward_mag = forward.length();

        // 防止摄像机离场景中心太近时出现问题
        if self.is_forward_pressed && forward_mag > self.speed {
            camera.eye += forward_norm * self.speed;
        }
        if self.is_backward_pressed {
            camera.eye -= forward_norm * self.speed;
        }

        let right = forward_norm.cross(camera.up);

        // 在按下前进或后退键时重做半径计算
        let forward = camera.target - camera.eye;
        let forward_mag = forward.length();

        if self.is_right_pressed {
            // 重新调整目标和眼睛之间的距离，以便其不发生变化。
            // 因此，眼睛仍然位于目标和眼睛形成的圆圈上。
            camera.eye = camera.target - (forward + right * self.speed).normalize() * forward_mag;
        }
        if self.is_left_pressed {
            camera.eye = camera.target - (forward - right * self.speed).normalize() * forward_mag;
        }
    }
}
```

这段代码并不完美。当你旋转**摄像机**时，摄像机会慢慢向后移动。虽然已达到了我们的目的，但你还是可以自由地改进它！

我们仍然需要把它插入到现有的代码中使其生效。将**控制器**添加到 `State` 中，并在 `new()` 函数中创建它的实例：

```rust
struct State {
    // ...
    camera: Camera,
    // 新添加!
    camera_controller: CameraController,
    // ...
}
// ...
impl State {
    async fn new(window: &Window) -> Self {
        // ...
        let camera_controller = CameraController::new(0.2);
        // ...

        Self {
            // ...
            camera_controller,
            // ...
        }
    }
}
```

将下边这行代码添加到 `input()` 函数中。

```rust
fn input(&mut self, event: &WindowEvent) -> bool {
    self.camera_controller.process_events(event)
}
```

到目前为止，摄像机**控制器**还没有真正工作起来。uniform **缓冲区**中的值需要被更新。有几种方式可以做到这一点：

1. 可以创建一个单独的缓冲区，并将其数据复制到 `camera_buffer`。这个新的缓冲区被称为**中继缓冲区**（Staging Buffer）。这种方法允许主缓冲区（在这里是指 `camera_buffer`）的数据只被 GPU 访问，从而令 GPU 能做一些速度上的优化。如果缓冲区能被 CPU 访问，就无法实现此类优化。
2. 可以在**缓冲区**本身调用内存映射函数 `map_read_async` 和 `map_write_async`。此方式允许我们直接访问缓冲区的数据，但是需要处理**异步**代码，也需要缓冲区使用 `BufferUsages::MAP_READ` 和/或 `BufferUsages::MAP_WRITE`。在此不再详述，如果你想了解更多，可以查看 [wgpu without a window](../../showcase/windowless/) 教程。
3. 可以在 `queue` 上使用 `write_buffer` 函数。

我们将使用第 3 种方式。

```rust
fn update(&mut self) {
    self.camera_controller.update_camera(&mut self.camera);
    self.camera_uniform.update_view_proj(&self.camera);
    self.queue.write_buffer(&self.camera_buffer, 0, bytemuck::cast_slice(&[self.camera_uniform]));
}
```

这就是要做的全部工作了。现在运行代码，将能看到一个带有树木纹理的五边形，并可以用 wasd/arrow 键来旋转和缩放。

## 挑战

让上面的五边形独立于**摄像机**进行旋转。_提示：你需要另一个**矩阵**来实现这一点_。

<WasmExample example="tutorial6_uniforms"></WasmExample>

<AutoGithubLink/>
