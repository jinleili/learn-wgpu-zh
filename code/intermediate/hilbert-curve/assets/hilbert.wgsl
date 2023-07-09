
struct MVPMatUniform {
    mvp: mat4x4<f32>,
};

struct HilbertUniform {
    // 接近目标的比例
    near_target_ratio: f32,
};

@group(0) @binding(0) var<uniform> mvp_mat: MVPMatUniform;
@group(1) @binding(0) var<uniform> hilbert: HilbertUniform;

@vertex
fn vs_main(
    @location(0) pos: vec3f,
    @location(1) target_pos: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
) -> @builtin(position) vec4f {
   let new_pos = pos + (target_pos - pos) * hilbert.near_target_ratio;
   return mvp_mat.mvp * vec4<f32>(new_pos, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4f {
    return vec4f(vec3f(0.0), 1.0);
}
