// Vertex shader

struct Camera {
    view_pos: vec4f,
    view_proj: mat4x4f,
}
@group(0) @binding(0)
var<uniform> camera: Camera;

struct Light {
    position: vec3f,
    color: vec3f,
}
@group(1) @binding(0)
var<uniform> light: Light;

struct VertexInput {
    @location(0) position: vec3f,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4f,
    @location(0) color: vec3f,
};

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    let scale = 0.25;
    var out: VertexOutput;
    out.clip_position = camera.view_proj * vec4f(model.position * scale + light.position, 1.0);
    out.color = light.color;
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    return vec4f(in.color, 1.0);
}