struct MVPMatUniform {  
    mvp: mat4x4f,
};

@group(0) @binding(0) var<uniform> mat_uniform: MVPMatUniform;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vs_main(
    @location(0) p_pos: vec2f,
    @location(1) p_init_pos: vec2f,
    @location(2) p_uv: vec2f,
    @location(3) p_target: vec2f,
    @location(4) p_speed: vec2f,
    @location(5) pos: vec3f,
    @location(6) uv_offset: vec2f,
) -> VertexOutput {
    var out: VertexOutput;
    out.position = mat_uniform.mvp * vec4f(p_pos + pos.xy, 0.0, 1.0);
    out.uv = p_uv + uv_offset;
    return out;
}

@group(0) @binding(1) var animate_texture: texture_2d<f32>;
@group(0) @binding(2) var tex_sampler: sampler;


struct ParticleFrameUniform {
   frame_alpha: f32,
};
@group(1) @binding(0) var<uniform> particleFrame: ParticleFrameUniform;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    var out_color: vec4f = textureSample(animate_texture, tex_sampler, in.uv);
    if (out_color.r > 0.55) {
        out_color.a = 0.0;
    } else {
        out_color.a *= particleFrame.frame_alpha;
    }
    return out_color;
}