# 万能动画公式

要实现不同形态/形状之间的动态变换，核心算法很简单，就是通过**构造同等数量的顶点/控制点**来实现。

在进行动态变换时，通常不同形态或形状之间的顶点数量会不相等。为了使两边的顶点能够一一对应起来，我们可以通过随机或插值的方式来补充顶点。这种方式不会破坏顶点数较少一边的造型，相当于某些点有了分身。通过对对应顶点的插值计算，就能够实现形态的变换。

此万能动画公式的优点在于它足够简单且通用。无论是对于简单的形状变换还是复杂的动态效果，都可以通过构造同等数量的顶点来实现。而且，运用不同的插值算法，还能灵活地控制形态变换的程度和速度。

## 示例：Hilbert 曲线

<WebGPUExample example="hilbert_curve" autoLoad="{true}"></WebGPUExample>

## 代码实现

Hilbert 曲线是一种连续、自避免且自相似的空间填充曲线。

每升一个维度，曲线的顶点数就多 4 倍，基于这个规律，我们用上面的万能动画公式来完成升维/降维变换动画：

```rust
pub struct HilbertCurveApp {
    // 当前曲线与目标曲线的顶点缓冲区
    vertex_buffers: Vec<wgpu::Buffer>,
    // 当前曲线的顶点总数
    curve_vertex_count: usize,
    // 当前动画帧的索引，用于设置缓冲区的动态偏移
    animate_index: u32,
    // 每一个动画阶段的总帧数
    draw_count: u32,
    // 目标曲线维度
    curve_dimention: u32,
    // 是否为升维动画
    is_animation_up: bool,
}
```

创建两个 ping-pong 顶点缓冲区，它们的大小一样:

```rust
let mut vertex_buffers: Vec<wgpu::Buffer> = Vec::with_capacity(2);
for _ in 0..2 {
    let buf = app.device.create_buffer(&wgpu::BufferDescriptor {
        size,
        usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
        label: None,
        mapped_at_creation: false,
    });
    vertex_buffers.push(buf);
}
```

在 `render()` 函数中基于动画迭代情况填充/更新顶点缓冲区：

```rust
let mut target = HilbertCurve::new(self.curve_dimention);
let start = if self.is_animation_up {
    let mut start = HilbertCurve::new(self.curve_dimention - 1);
    // 把顶点数翻 4 倍来对应目标维度曲线
    start.four_times_vertices();
    start
} else {
    target.four_times_vertices();
    HilbertCurve::new(self.curve_dimention + 1)
};
// 更新顶点数
self.curve_vertex_count = target.vertices.len();
// 填充顶点 buffer
for (buf, curve) in self.vertex_buffers.iter().zip(vec![start, target].iter()) {
    self.app
        .queue
        .write_buffer(buf, 0, bytemuck::cast_slice(&curve.vertices));
}
```

着色器中完成顶点位置的插值计算：

```wgsl
struct HilbertUniform {
    // 接近目标的比例
    near_target_ratio: f32,
};
@group(0) @binding(0) var<uniform> mvp_mat: MVPMatUniform;
@group(1) @binding(0) var<uniform> hilbert: HilbertUniform;

@vertex
fn vs_main(@location(0) pos: vec3f, @location(1) target_pos: vec3f) -> @builtin(position) vec4f {
   let new_pos = pos + (target_pos - pos) * hilbert.near_target_ratio;
   return mvp_mat.mvp * vec4<f32>(new_pos, 1.0);
}
```

## 查看完整源码

<AutoGithubLink customCodePath="intermediate/hilbert-curve"/>
