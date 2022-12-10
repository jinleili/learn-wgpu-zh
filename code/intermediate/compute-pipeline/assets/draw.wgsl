struct VertexOutput {
    @location(0) uv: vec2<f32>,
    @builtin(position) position: vec4<f32>,
};

// 顶点着色器
@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    let uv: vec2<f32> = vec2<f32>(f32((vertex_index << 1u) & 2u), f32(vertex_index & 2u));
    var out: VertexOutput;
    out.position = vec4<f32>(uv * 2.0 - 1.0, 0.0, 1.0);
    // invert uv.y
    out.uv = vec2<f32>(uv.x, (uv.y - 1.0) *  (-1.0));
    return out;
}

// 片元着色器
@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment 
fn fs_srgb_to_linear(in : VertexOutput) -> @location(0) vec4<f32> {
    let texel = textureSample(tex, tex_sampler, in.uv);
    return vec4<f32>(pow(texel.rgb, vec3<f32>(1.0/2.2)), texel.a);
}

@fragment 
fn fs_main(in : VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, in.uv);
}
