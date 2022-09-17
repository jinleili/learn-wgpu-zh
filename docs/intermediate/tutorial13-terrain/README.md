# 程序地形

到目前为止，我们一直在一个空旷的场景里渲染模型。如果只是想测试着色代码，这是非常好的，但大多数应用程序会想让屏幕上填充更多有趣的元素。
你可以用各种方法来处理此问题，比如，在 Blender 中创建一堆模型，然后把它们加载到场景中。如果你有一些像样的艺术技巧和一些耐心，这是很有效的方法。我在这两个方面都很欠缺，所以让我们通过代码来制作一些看起来不错的东西。

正如本文的名字所示，我们将创建一个**地形**（Terrain）。现在，创建地形网格的经典方法是使用预先生成的**噪声纹理**（Noise Texture），并对其进行采样，以获得网格中每个点的高度值。这是一个相当有效的方法，但我选择了直接使用计算着色器来生成噪声。让我们开始吧!

## 计算着色器

**计算着色器**（Compute Shader）允许你利用 GPU 的并行计算能力完成任意任务。虽然它也可以用于渲染任务，但通常用于与绘制三角形和像素没有直接关系的任务，比如，物理模拟、图像滤镜、创建程序纹理、运行神经网络等等。我稍后会详细介绍它们的工作原理，但现在只需用它们来为我们的地形创建顶点和索引缓冲区。

## 噪声函数

让我们从计算着色器的代码开始，创建一个名为 `terrain.wgsl` 的新文件，在文件内先实现一个**噪声函数**（Noise Function），然后再创建着色器的入口函数。具体代码如下：

```wgsl
// ============================
// 地形生成
// ============================

// https://gist.github.com/munrocket/236ed5ba7e409b8bdf1ff6eca5dcdc39
//  MIT License. © Ian McEwan, Stefan Gustavson, Munrocket
// - Less condensed glsl implementation with comments can be found at https://weber.itn.liu.se/~stegu/jgt2012/article.pdf

fn permute3(x: vec3<f32>) -> vec3<f32> { return (((x * 34.) + 1.) * x) % vec3<f32>(289.); }

fn snoise2(v: vec2<f32>) -> f32 {
  let C = vec4<f32>(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  var i: vec2<f32> = floor(v + dot(v, C.yy));
  let x0 = v - i + dot(i, C.xx);
  // I flipped the condition here from > to < as it fixed some artifacting I was observing
  var i1: vec2<f32> = select(vec2<f32>(1., 0.), vec2<f32>(0., 1.), (x0.x < x0.y));
  var x12: vec4<f32> = x0.xyxy + C.xxzz - vec4<f32>(i1, 0., 0.);
  i = i % vec2<f32>(289.);
  let p = permute3(permute3(i.y + vec3<f32>(0., i1.y, 1.)) + i.x + vec3<f32>(0., i1.x, 1.));
  var m: vec3<f32> = max(0.5 -
      vec3<f32>(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), vec3<f32>(0.));
  m = m * m;
  m = m * m;
  let x = 2. * fract(p * C.www) - 1.;
  let h = abs(x) - 0.5;
  let ox = floor(x + 0.5);
  let a0 = x - ox;
  m = m * (1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h));
  let g = vec3<f32>(a0.x * x0.x + h.x * x0.y, a0.yz * x12.xz + h.yz * x12.yw);
  return 130. * dot(m, g);
}

```

部分读者可能已经认出这是 Simplex 噪声（特别是 OpenSimplex 噪声）的一个实现。我承认没有真正理解 OpenSimplex 噪声背后的数学原理。它的基本原理类似于 Perlin 噪声，但不是一个正方形网格，而是六边形网格，这消除了在正方形网格上产生噪声的一些伪影。我也不是这方面的专家，所以总结一下：`permute3()` 接收一个 `vec3` 并返回一个伪随机的 `vec3`，`snoise2()` 接收一个 `vec2` 并返回一个 [-1, 1] 之间的浮点数。如果你想了解更多关于噪声函数的信息，请查看[这篇文章来自 The Book of Shaders](https://thebookofshaders.com/11/)。代码是用 GLSL 编写的，但概念是一样的。

从下面的渲染结果可以看出，直接使用 `snoise` 的输出来生成地形的高度值，地表往往过于平滑。虽然这可能就是你想要的，但它看起来不像是自然界的地形。

![smooth terrain](./figure_no-fbm.png)

为了使地形更加粗糙，我们将使用一种叫做[分形布朗运动](https://thebookofshaders.com/13/)的技术。这种技术的工作原理是对噪声函数进行多次采样，每次将强度减半，同时将噪声的频率提高一倍。
这意味着地形的整体形状保持平滑，同时拥有更清晰的细节，得到的效果将是下面这样:

![more organic terrain](./figure_fbm.png)

这个函数的代码其实很简单：

```wgsl
fn fbm(p: vec2<f32>) -> f32 {
    let NUM_OCTAVES: u32 = 5u;
    var x = p * 0.01;
    var v = 0.0;
    var a = 0.5;
    let shift = vec2<f32>(100.0);
    let cs = vec2<f32>(cos(0.5), sin(0.5));
    let rot = mat2x2<f32>(cs.x, cs.y, -cs.y, cs.x);

    for (var i=0u; i<NUM_OCTAVES; i=i+1u) {
        v = v + a * snoise2(x);
        x = rot * x * 2.0 + shift;
        a = a * 0.5;
    }

    return v;
}
```

让我们稍微回顾一下：

- `NUM_OCTAVES` 常数设定噪声级别。更高的级别将给地形网格增加更多的细节，但级别越高，得到的回报将递减，我发现 5 是一个好数字。
- `p` 乘以 `0.01` 用来“放大”噪声函数。这是因为我们的网格将是 1x1 的四边形，而 simplex 噪声函数在每步进一次时类似于白噪声。我们来看到直接使用 `p` 是什么样子的：![spiky terrain](./figure_spiky.png)
- `a` 变量是在给定的噪声级别下的噪声振幅。
- `shift` 和 `rot` 用于减少生成的噪声中的失真。其中一个失真现象是，在 `0,0` 处，无论你如何缩放 `p`，`snoise` 的输出都是一样的。

## 生成网格

为了生成地形网格，需要向着色器传递一些信息：

```wgsl
struct ChunkData {
    chunk_size: vec2<u32>,
    chunk_corner: vec2<i32>,
    min_max_height: vec2<f32>,
}

struct Vertex {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct VertexBuffer {
    data: array<Vertex>, // stride: 32
}

struct IndexBuffer {
    data: array<u32>,
}

@group(0) @binding(0) var<uniform> chunk_data: ChunkData;
@group(0)@binding(1) var<storage, read_write> vertices: VertexBuffer;
@group(0)@binding(2) var<storage, read_write> indices: IndexBuffer;
```

我们传递给色器的 `uniform` 缓冲区，其中包括四边形网格的大小 `chunk_size`，噪声算法的起始点 `chunk_corner` ，以及地形的 `min_max_height`。

顶点和索引缓冲区作为 `storage` 缓冲区传入，并启用 `read_write` 访问模式来支持数据的读取与写入。我们将在 Rust 中创建这些缓冲区，并在执行计算着色器时将其绑定。

着色器的下一个部分是在网格上生成一个点，以及该点的一个顶点：

```wgsl
fn terrain_point(p: vec2<f32>) -> vec3<f32> {
    return vec3<f32>(
        p.x,
        mix(chunk_data.min_max_height.x,chunk_data.min_max_height.y, fbm(p)),
        p.y,
    );
}

fn terrain_vertex(p: vec2<f32>) -> Vertex {
    let v = terrain_point(p);

    let tpx = terrain_point(p + vec2<f32>(0.1, 0.0)) - v;
    let tpz = terrain_point(p + vec2<f32>(0.0, 0.1)) - v;
    let tnx = terrain_point(p + vec2<f32>(-0.1, 0.0)) - v;
    let tnz = terrain_point(p + vec2<f32>(0.0, -0.1)) - v;

    let pn = normalize(cross(tpz, tpx));
    let nn = normalize(cross(tnz, tnx));

    let n = (pn + nn) * 0.5;

    return Vertex(v, n);
}
```

`terrain_point` 函数接收地形上的一个 XZ 点，并返回一个 `vec3`，其中 `y` 值在最小和最大高度之间。

`terrain_vertex` 使用 `terrain_point` 来获得它的位置，同时通过对附近的 4 个点进行采样，并使用[叉积](https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/x786f2022:vectors-and-matrices/a/cross-products-mvc)来计算顶点法线。

<div class="note">

你应该注意到了 `Vertex` 结构体不包括纹理坐标字段。我们可以通过使用顶点的 XZ 坐标，并让纹理采样器在 X 和 Y 轴上镜像纹理来轻松地创建纹理坐标，但以这种方式进行纹理采样时，高度图往往会有拉伸现象。

我们将在未来的教程中介绍一种叫做三平面映射的方法来给地形贴图。但现在我们只使用一个程序纹理，它将在渲染地形的片元着色器中被创建。

</div>

现在我们可以在地形表面获得一个实际的顶点数据，并用来填充顶点和索引缓冲区了。我们将创建一个 `gen_terrain()` 函数作为计算着色器的入口：

```wgsl
@compute @workgroup_size(64)
fn gen_terrain(
    @builtin(global_invocation_id) gid: vec3<u32>
) {
    // snipped...
}
```

`@stage(compute)` 注释指定了 `gen_terrain` 是一个计算着色器入口。

[`workgroup_size()`](https://www.w3.org/TR/WGSL/#attribute-workgroup_size) 指定 GPU 可以为每个**工作组**（workgroup）分配的一组调用，这一组调用会同时执行着色器入口函数，并共享对工作组地址空间中着色器变量的访问。
我们在编写计算着色器的时候指定工作组的大小，它有 3 个维度的参数，因为工作组是一个 3D 网格，但如果不指定它们，则默认为 1。 换句话说，`workgroup_size(64)` 相当于 `workgroup_size(64, 1, 1)`。

`global_invocation_id` 是一个 3D 索引。这可能看起来很奇怪，但你可以把工作组看作是工作组的 3D 网格。这些工作组有一个内部的工作者网格。`global_invocation_id` 就是相对于所有其他工作组的当前工作者的 id。

从视觉上看，工作组的网格看起来会是这样的：

![work group grid](./figure_work-groups.jpg)

<div class="note">

把计算着色器想象成一个在一堆嵌套的 for 循环中运行的函数，但每个循环都是并行执行的，这可能会有帮助。它看起来会像这样：

```
for wgx in num_workgroups.x:
    for wgy in num_workgroups.y:
        for wgz in num_workgroups.z:
            var local_invocation_id = (wgx, wgy, wgz)
            for x in workgroup_size.x:
                for y in workgroup_size.x:
                    for z in workgroup_size.x:
                        var global_invocation_id = local_invocation_id * workgroup_size + (x, y, z);
                        gen_terrain(global_invocation_id)

```

如果想了解更多关于工作组的信息[请查看 WGSL 文档](https://www.w3.org/TR/WGSL/#compute-shader-workgroups)。

</div>



TODO: 
- Note changes to `create_render_pipeline`
- Mention `swizzle` feature for cgmath
- Compare workgroups and workgroups sizes to nested for loops
    - Maybe make a diagram in blender?
- Change to camera movement speed