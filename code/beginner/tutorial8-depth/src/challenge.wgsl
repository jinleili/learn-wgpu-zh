// 顶点着色器

struct VertexInput {
    @location(0) position: vec3f,
    @location(1) tex_coords: vec2f,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4f,
    @location(0) tex_coords: vec2f,
}

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;
    out.clip_position = vec4f(model.position, 1.0);
    return out;
}

// 片元着色器

@group(0) @binding(0)
var t_shadow: texture_depth_2d;
@group(0)@binding(1)
var s_shadow: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let near = 0.1;
    let far = 100.0;
    let depth = textureSample(t_shadow, s_shadow, in.tex_coords);
    let r = (2.0 * near) / (far + near - depth * (far - near));
    return vec4f(vec3f(r), 1.0);
}