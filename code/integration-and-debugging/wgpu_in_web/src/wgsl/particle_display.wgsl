@group(0) @binding(0) var<uniform> mvp_uniform: mat4x4f;

struct CanvasUniform {
  // NDC 坐标空间中，一个像素对应的大小
  pixel_distance: vec2f,
};
@group(0) @binding(1) var<uniform> params:  CanvasUniform;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) uv: vec2f,
};

@vertex
fn vs_main(
    @location(0) p_pos: vec4f,
    @location(1) p_target: vec4f,
    @location(2) p_axis_and_speed: vec4f,
    @location(3) p_uv: vec2f,
    @location(4) p_radius: f32,
    @location(5) p_angle: f32,
    @location(6) pos: vec3f,
) -> VertexOutput {
    let p = p_pos.xyz * vec3f(params.pixel_distance, params.pixel_distance.y) + pos;

    var out: VertexOutput;
    out.position = mvp_uniform * vec4f(p, 1.0);

    out.uv = p_uv  ;

    return out;
}

@group(0) @binding(2) var animate_texture: texture_2d<f32>;
@group(0) @binding(3) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    var out_color: vec4f = textureSample(animate_texture, tex_sampler, in.uv);
   
    return out_color;
}