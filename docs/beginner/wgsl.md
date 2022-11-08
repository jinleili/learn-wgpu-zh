---
head:
  - - meta
    - name: description
      content: WebGPU 着色器语言 WGSL 介绍及与 GLSL 的语法对比
  - - meta
    - name: keywords
      content: WGSL GLSL Shader WebGPU wgpu
---
# WGSL 着色器语言

## WGSL 的来由
WebGPU 的目标是要在各个现代底层图形 API 之上抽象出一套统一的图形 API，而每个底层图形 API 后端都有自己的着色语言：
- DirectX 使用 **HLSL**（High Level Shading Language）
- Metal 使用 **MSL**（Metal Shading Language）
- OpenGL使用 **GLSL**（OpenGL Shading Language）
- Vulkan 使用的着色语言又跟之前的图形 API 都不同，它的着色器必须以 SPIR-V 这种二进制字节码的格式提供（有一些库能提供将其它语言编写的着色器编译为 SPIR-V 的能力，比如 [shaderc](https://github.com/google/shaderc) ）。

在 **WGSL** 出现之前，很多开发者或团队是通过宏及各种转译工具来将自己的着色器编译到不同目标平台的，他们自然是希望有一个标准化的统一语言。

WebGPU 成员花了 2 年半的时间来争论 WebGPU 是否应该有自己的着色语言。kvark 将这场争论中的核心论点组成了[一张流图](https://kvark.github.io/webgpu-debate/SPIR-V.component.html)，它是 SVG 格式的，支持在网页中无损放大查看。

**WGSL** 的目标不是要与 **GLSL** 兼容，它是对现代着色器语言的全新重新设计。

2020 年 4 月 27 日，WGSL 标准有了第一次提交。自此开始，wgpu 和 dawn 都摆脱了对 shaderc 之类复杂繁重的着色器转译工具的依赖。wgpu 里使用的 WGSL 转译工具叫 [naga](https://github.com/gfx-rs/naga), kvark 有一篇博客（[Shader translation benchmark](http://kvark.github.io/naga/shader/2022/02/17/shader-translation-benchmark.html)）对比了 naga 相比于其它转译工具的性能优化，总体来说，有 10 倍以上的性能优势。

目前学习 WGSL 的资源着实很少 —— 唯一好的参考是 [WGSL 规范](https://www.w3.org/TR/WGSL/)，但它是对语言实现细节的规范，对普通用户来说有点难以理解。我从 2018 年开始使用 wgpu (那时还是 使用 GLSL 做为着色器语言)，2021 年底完成了个人作品 [字习 Pro](https://apps.apple.com/cn/app/字习-pro/id1507339788) 及其他几个练手作品从 GLSL 到 WGSL 的 100 多个着色器的移植工作，在这个过程中对这两个着色器语言有了比较深入的了解。这个增补章节旨在介绍 WGSL 的一些基础知识，希望这对从 OpenGL / WebGL 迁移到 WebGPU 的朋友带来一点有益的经验（下边的所有 GLSL 代码均是按照 **GLSL450** 标准编写的）。

## 一个简单的绘制着色器：对比 GLSL
GLSL 的绘制着色器：
```rust
// 顶点着色器文件
layout(location = 0) in vec3 position;
layout(location = 1) in vec2 texcoord;
layout(location = 0) out vec2 uv;

layout(set = 0, binding = 0) uniform UniformParams {
    mat4 mvp_matrix;
    vec3 tint_color;
};

void main() {
    gl_Position = mvp_matrix * vec4(position, 1.0);
    uv = texcoord;
}

// 片元着色器文件
layout(location = 0) in vec2 uv;
layout(location = 0) out vec4 frag_color;

layout(set = 0, binding = 0) uniform UniformParams {
    mat4 mvp_matrix;
    vec3 tint_color;
};
layout(set = 0, binding = 1) uniform texture2D textureFront;
layout(set = 0, binding = 2) uniform sampler samplerFront;

void main(void) {
  vec4 front = texture(sampler2D(textureFront, samplerFront), uv);
  frag_color = front * vec4(tint_color.rgb, 1.0);;
}
```

下边是使用 WGSL 的等价实现，在 WGSL 中，我们通常将顶点着色器与片元着色器写在同一个文件中:
```rust
struct VertexOutput {
    @location(0) uv: vec2<f32>,
    @builtin(position) position: vec4<f32>,
};

struct UniformParams {
    mvp: mat4x4<f32>,
	tint_color: vec3<f32>,
};

@group(0) @binding(0) var<uniform> params: UniformParams;

@vertex
fn vs_main(@location(0) pos: vec3<f32>, @location(1) uv: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = params.mvp * vec4<f32>(pos, 1.0);
    out.uv = uv;
    return out;
}

@group(0) @binding(1) var texture_front: texture_2d<f32>;
@group(0) @binding(2) var sampler_front: sampler;

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    let front = textureSample(texture_front, sampler_front, input.uv);
    return front * vec4<f32>(params.tintColor, 1.0);
}
```

## 一个简单的计算着色器：继续对比 GLSL
GLSL 的计算着色器, 实现在 x 轴上的高斯模糊：
```rust
layout(local_size_x = 16, local_size_y = 16) in;

layout(set = 0, binding = 0) uniform InfoParams {
  ivec2 img_size;
};
layout(set = 0, binding = 1) uniform readonly image2D src_pic;
layout(set = 0, binding = 2, rgba32f) uniform image2D swap_pic;

const float WEIGHT[5] = float[](0.2, 0.1, 0.10, 0.1, 0.1);

void main() {
  ivec2 uv = ivec2(gl_GlobalInvocationID.xy);
  if (uv.x > info.x || uv.y > info.y) {
    return;
  }
  
  vec4 temp = imageLoad(src_pic, uv) * WEIGHT[0];
  ivec2 uvMax: vec2<i32> = img_size - 1;
  for (int i = 1; i < 5; i += 1) {
    ivec2 offset_uv = ivec2(1.0, 0) * i;
    temp += imageLoad(src_pic, clamp(uv + offset_uv, ivec2(0), uvMax)) * WEIGHT[i];
    temp += imageLoad(src_pic, clamp(uv - offset_uv, ivec2(0), uvMax)) * WEIGHT[i];
  }
  imageStore(swap_pic, uv, temp);
}
```
<div class="warning">
WebGL 2.0 并不支持计算着色器，所以上面的 GLSL 计算着色器只能在 Native 端使用。
</div>

WGSL 版本的对等实现：
```rust
struct InfoParams {
  img_size: vec2<i32>,
};

@group(0) @binding(0) var<uniform> params: InfoParams;
@group(0) @binding(1) var src_pic: texture_2d<f32>;
@group(0) @binding(2) var swap_pic: texture_storage_2d<rgba32float, write>;

let WEIGHT: array<f32, 5> = array<f32, 5>(0.2, 0.1, 0.10, 0.1, 0.1);

@compute @workgroup_size(16, 16)
fn cs_main(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
    @builtin(local_invocation_id) local_invocation_id: vec3<u32>,
) {
  let uv = vec2<i32>(global_invocation_id.xy);
  if (uv.x >= params.img_size.x || uv.y >= params.img_size.y) {
    return;
  }

  var temp = textureLoad(src_pic, uv, 0) * WEIGHT[0];
  let uvMax: vec2<i32> = img_size - 1;
  for (var i: i32 = 1; i <= 4; i += 1) {
    var uvOffset = vec2<i32>(3, 0) * i;
    temp += textureLoad(src_pic, clamp(uv + uvOffset, vec2<i32>(0), uvMax), 0) * WEIGHT[i];
    temp += textureLoad(src_pic, clamp(uv - uvOffset, vec2<i32>(0), uvMax), 0) * WEIGHT[i];
  }
  textureStore(swap_pic, uv, temp);
}
```

你应该注意到了很多差异，比如：
- 顶点、片元、计算着色器的**入口函数**（WebGPU 中叫**入口点** `Entry Point`）声明方式差异;
- 计算着色器**工作组**（Workgroup）大小的声明方式差异;
- 有很多语法差异;
- 许多细节必须硬编码，例如输入和输出的特定位置;
- 结构体的使用差异;

总体上 WGSL 代码要比 GLSL 明晰得多。这是 WGSL 的一大优点，几乎所有内容都明确说明。
下边我们来深入了解一些关键区别。

## 入口点
WGSL 没有强制使用固定的 `main()` 函数作为**入口点**（`Entry Point`），它通过 `@vertex`、`@fragment`、`@compute` 三个**着色器阶段**（Shader State）标记提供了足够的灵活性让开发人员能更好的组织着色器代码。你可以给入口点取任意函数名，只要不重名，还能将所有阶段（甚至是不同着色器的同一个阶段）的代码组织同一个文件中：
```rust
// 顶点着色器入口点
@vertex
fn vs_main() {}

// 片无着色器入口点
@fragment
fn fs_main() -> @location(X) vec4<f32>{}

// 计算着色器入口点
@compute 
fn cs_main() {}
```

## 工作组
计算着色器中，一个**工作组**（Workgroup）就是一组调用，它们同时执行一个计算着色器阶段**入口点**，并共享对工作组地址空间中着色器变量的访问。可以将**工作组**理解为一个三维网格，我们通过（x, y, z）三个维度来声明当前计算着色器的工作组大小，每个维度上的默认值都是 1。

WGSL 声明工作组大小的语法相比 GLSL 简洁又明晰：

```rust
// GLSL
layout(local_size_x = 16, local_size_y = 16) in;

// WGSL
@workgroup_size(16, 16) // x = 16, y = 16, z = 1
@workgroup_size(16)     // x = 16, y = 1, z = 1
```

## Group 与 Binding 属性
WGSL 中每个资源都使用了 `@group(X)` 和 `@binding(X)` 属性标记，例如 `@group(0) @binding(0) var<uniform> params: UniformParams` 它表示的是 Uniform buffer 对应于哪个绑定组中的哪个绑定槽（对应于 wgpu API 调用）。这与 GLSL 中的 `layout(set = X, binding = X)` 布局标记类似。WGSL 的属性非常明晰，描述了着色器阶段到结构的精确二进制布局的所有内容。


## 变量声明
WGSL 对于基于显式类型的 var 的变量声明有不同的语法。
```rust
// GLSL:
lowp vec4 color;
// 或者，也可以不使用精度说明符
vec4 color;

// WGSL:
var color: vec4<f32>;
```

WGSL 没有像 `lowp` 这样的精度说明符, 而是显式指定具体类型，例如 `f32`（32 位浮点数）。如果要使用 `f16` 类型，需要在你的 WebGPU 程序中开启 `shader-f16` 扩展（wgpu 中目前已经加入了此扩展，但是 naga 中还没有完全实现对 `f16` 的支持）。

WGSL 支持自动类型推断。因此，如果在声明变量的同时进行赋值，就不必指定类型：
```rust
// 显式指定变量类型声明
var color: vec4<f32> = vec4<f32>(1.0, 0.0, 0.0, 1.0);

// 省略类型声明，变量类型将在编译时自动推断得出
var color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
```
WGSL 中的 `var` `let` 关键字与 Swift 语言一样：
- `var` 表示变量可变或可被重新赋值（与 Rust 中的 `let mut` 一样）;
- `let` 表示变量不可变，不能重新赋值;

## 结构体
在 WGSL 中，**结构体**（struct）用于表示 Unoform 及 Storage **缓冲区**以及着色器的输入和输出。Unoform 缓冲区与 GLSL 类似，Storage 缓冲区虽然也在 GLSL 中存在等价物，但是 WebGL 2.0 并不支持。

WGSL 结构体字段对齐规则也与 GLSL 几乎一致，想要了解更多细节，可查看 [WGSL 规范中的结构对齐规则](https://www.w3.org/TR/WGSL/#alignment-and-size)：
```rust
// GLSL
layout(set = 0, binding = 0) uniform UniformParams {
    mat4 mvp_matrix;
    vec3 tint_color;
};
// ...
gl_Position = mvp_matrix * vec4(position, 1.0);


// WGSL
struct UniformParams {
    mvp: mat4x4<f32>,
	tint_color: vec3<f32>,
};
@group(0) @binding(0) var<uniform> params: UniformParams;
// ...
out.position = params.mvp * vec4<f32>(pos, 1.0);
```
注意到上面 Unoform 缓冲区在声明及使用上的两个区别了吗？
1. WGSL 需要先定义结构体然后才能声明绑定，而 GLSL 可以在声明绑定的同时定义（当然也支持先定义）;
2. WGSL 里需要用声明的变量来访问结构体字段，而 GLSL 里是直接使用结构体中的字段;

WGSL 的**输入和输出结构体**比较独特，在 GLSL 中没有对应物。**入口函数**接受输入结构，返回输出结构，并且结构体的所有字段都有 `location(X)` 属性注释。
如果只有单个输入或输出，那使用结构体就是可选的。

这种明确定义输入和输出的方式，使得 WGSL 的代码逻辑更加清晰，明显优于在 GLSL 中给魔法变量赋值的方式。

下边是一个顶点着色器的输出结构体（同时它也是对应的片元着色器的输入结构体）：

```rust
struct VertexOutput {
    @location(0) uv: vec2<f32>,
    @builtin(position) position: vec4<f32>,
};
```
- `@builtin(position)` **内建属性**标记的字段对应着 GLSL 顶点着色器中的 `gl_Position` 内建字段。
- `@location(X)` 属性标记的字段对应着 GLSL 顶点着色器中的 `layout(location = X) out ...` 以及片元着色中的 `layout(location = X) in ...`;

WGSL 不再需要像 GLSL 一样，在顶点着色器中定义完输出字段后，再到片元着色器中定义相应的输入字段。

## 函数语法
WGSL 函数语法与 Rust 一致, 而 GLSL 是类 C 语法。一个简单的 `add` 函数如下：
```rust
// GLSL
float add(float a, float b) {
    return a + b;
}

// WGSL
fn add(a: f32, b: f32) -> f32 {
	return a + b;
}
```

## 纹理
### 采样纹理
WGSL 中**采样纹理**总是要指定**纹素**（Texel)的数据类型 `texture_2d<T>`、`texture_3d<T>`、`texture_cube<T>`、`texture_cube_array<T>`（T 必须是 f32、i32、u32 这三种类型之一），而 GLSL 中是没有纹素类型信息的，只有查看使用此着色器的程序源码才能知道：

```rust
// GLSL
layout(set = 0, binding = 1) uniform texture2D texture_front;

// WGSL
@group(0) @binding(1) var texture_front: texture_2d<f32>;
```

### Storage 纹理
WGSL 中**存储纹理**的数据类型为 `texture_storage_XX<T, access>`, 而 GLSL 中没有明确的存储纹理类型，如果需要当做存储纹理使用，就需要在 `layout(...)` 中标记出**纹素**格式:
```rust
// GLSL
layout(set = 0, binding = 2, rgba32f) uniform image2D swap_pic;

// WGSL
@group(0) @binding(2) var swap_pic: texture_storage_2d<rgba32float, write>;
```
<div class="warning">

在目前的 WebGPU 标准中, 存储纹理的 `access` 只能为 `write`(只写), wgpu 能在 native 中支持 `read_write`(可读可写)。

</div>

## 更多 WGSL 语法细节

### 三元运算符
GLSL 支持三元运算符 `? :` , WGSL 并不直接支持，但提供了内置函数 `select(falseValue，trueValue，condition)`：
```rust
// GLSL
int n = isTrue ? 1 : 0;

// WGSL
let n: i32 = select(0, 1, isTrue);
```

### 花括号
WGSL 中的 if else 语法不能省略大括号（与 Rust 及 Swift 语言一样）：
```rust
// GLSL
if (gray > 0.2) n = 65600;

// WGSL
if (gray > 0.2) { n = 65600; } 
```

### 求模运算
GLSL 中我们使用 `mod` 函数做求模运算，WGSL 中有一个长得类似的函数 [`modf`](https://www.w3.org/TR/WGSL/#modf-builtin), 但它的功能是将传入参数分割为小数与整数两部分。在 WGSL 中需要使用 `%` 运算符来求模, 且 `mod` 与 `%` 的工作方式还略有不同，
 `mod` 内部使用的是 floor (`x - y * floor(x / y)`), 而 `%` 内部使用的是 trunc (`x - y * trunc(x / y)`):
```rust
// GLSL
float n = mod(x, y);

// WGSL
let n = x % y; 
```

## 着色器预处理
听到过很多人抱怨 WGSL 不提供预处理器，但其实所有的着色器语言都不自己提供预处理，只是我们可能已经习惯了使用已经封装好预处理逻辑的框架。

其实自己写一个预处理逻辑也是非常简单的事，有两种实现预处理的机制：
1. 着色器被调用时实时预处理（对运行时性能会产生负影响）;
2. 利用 `build.rs` 在程序编译阶段预处理，并磁盘上生成预处理后的文件;

这两种实现方式的代码逻辑其实是一样的，仅仅是预处理的时机不同。

下边是一个需要预处理的实现了边缘检测的片元着色器：
```rust
///#include "common/group0+vs.wgsl"

///#include "func/edge_detection.wgsl"

@fragment
fn fs_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    let color = textureSample(tex, tex_sampler, vertex.uv);
    return vec4<f32>(edge_detection(length(color.rgb), 0.125));
}
```

`///#include` 后面的路径分指向的是 `common` 及 `func` 目录下已经实现好的通用顶点着色器与边缘检测函数，我们现在按第 2 种机制实现一个简单的预处理来自动将顶点着色器及边缘检测函数包含进来:

```rust
const WGSL_FOLDER: &'static str = "../wgsl_preprocessed";
const INCLUDE: &tatic str = "///#include ";

fn main() -> Result<(), Box<dyn Error>> {
    // 这一行告诉 cargo 如果 /wgsl/ 目录中的内容发生了变化，就重新运行脚本
    println!("cargo:rerun-if-changed=/../wgsl/*");

    // 需要预处理的着色器数组（当然，更好的方式是读取并遍历待处理文件夹）
    let shader_files = vec!["edge_detection"];

    // 创建预处理后着色器的存放目录
    std::fs::create_dir_all(WGSL_FOLDER)?;
    for name in shader_files {
        let _ = regenerate_shader(name);
    }
    Ok(())
}

fn regenerate_shader(shader_name: &str) -> Result<(), Box<dyn Error>> {
    let base_dir = env!("CARGO_MANIFEST_DIR");
    let path = PathBuf::from(&base_dir)
        .join("../wgsl")
        .join(format!("{}.wgsl", shader_name));
    let mut out_path = WGSL_FOLDER.to_string();
    out_path += &format!("/{}.wgsl", shader_name.replace("/", "_"));

    let code = match read_to_string(&path) {
        Ok(code) => code,
        Err(e) => {
            panic!("无法读取 {:?}: {:?}", path, e)
        }
    };

    let mut shader_source = String::new();
    parse_shader_source(&code, &mut shader_source, &base_dir);

    let mut f = std::fs::File::create(&std::path::Path::new(&base_dir).join(&out_path))?;
    f.write_all(shader_source.as_bytes())?;

    Ok(())
}

fn parse_shader_source(source: &str, output: &mut String, base_path: &str) {
    for line in source.lines() {
        if line.starts_with(INCLUDE) {
            // 支持一次 include 多个外部着色器文件，文件路径之间用 , 号分割
            let imports = line[INCLUDE.len()..].split(',');
            // 遍历所有待导入的文件，递归处理导入的代码里还包括导入的情况
            for import in imports {
                if let Some(include) = get_include_code(import, base_path) {
                    parse_shader_source(&include, output, base_path);
                } else {
                    println!("无法找到要导入的着色器文件: {}", import);
                }
            }
        } 
    }
}

fn get_include_code(key: &str, base_path: &str) -> Option<String> {
    let path = PathBuf::from(base_path)
        .join("../wgsl")
        .join(key.replace('"', ""));
    let shader = match read_to_string(&path) {
        Ok(code) => code,
        Err(e) => panic!("无法读取 {:?}: {:?}", path, e),
    };
    Some(shader)
}
```

上面的几十行代码就是一套完整的预处理逻辑，它在每次程序编译时自动检查 `wgsl/` 目录下的待处理着色器有没有发生变化，如果有变化，就重新处理并在 `wgsl_preprocessed/` 目录下写入一个同名的处理后的着色器。
