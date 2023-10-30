
struct SceneUniform {
    mvp: mat4x4<f32>,
    viewport_pixels: vec2f,
};

struct HilbertUniform {
    // 接近目标的比例
    near_target_ratio: f32,
};

@group(0) @binding(0) var<uniform> scene: SceneUniform;
@group(1) @binding(0) var<uniform> hilbert: HilbertUniform;

@vertex
fn vs_main(@location(0) pos0: vec3f, 
            @location(1) pos1: vec3f,
            @location(2) target_pos0: vec3f, 
            @location(3) target_pos1: vec3f,
             @builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
    
    var positions = array<vec3f, 6>(
        vec3(0., -0.5, 0.),
        vec3(0., -0.5, 1.),
        vec3(0., 0.5, 1.),
        vec3(0., -0.5, 0.),
        vec3(0., 0.5, 1.),
        vec3(0., 0.5, 0.)
    );
    let position = positions[vertex_index];
            
    let position_a = pos0 + (target_pos0 - pos0) * hilbert.near_target_ratio;
    let position_b = pos1 + (target_pos1 - pos1) * hilbert.near_target_ratio;

    // algorithm based on https://wwwtyro.net/2019/11/18/instanced-lines.html
    let clip_a = scene.mvp * vec4(position_a, 1.);
    let clip_b = scene.mvp * vec4(position_b, 1.);
    let clip = mix(clip_a, clip_b, position.z);

    let resolution = scene.viewport_pixels;
    let screen_a = resolution * (0.5 * clip_a.xy / clip_a.w + 0.5);
    let screen_b = resolution * (0.5 * clip_b.xy / clip_b.w + 0.5);

    let x_basis = normalize(screen_b - screen_a);
    let y_basis = vec2(-x_basis.y, x_basis.x);

    var line_width = 2.;
    var alpha = 1.;

    // Line thinness fade from https://acegikmo.com/shapes/docs/#anti-aliasing
    if line_width > 0.0 && line_width < 1. {
        line_width = 1.;
    }

    let offset = line_width * (position.x * x_basis + position.y * y_basis);
    let screen = mix(screen_a, screen_b, position.z) + offset;

    return vec4(clip.w * ((2. * screen) / resolution - 1.), 0., clip.w);
}

@fragment
fn fs_main() -> @location(0) vec4f {
    return vec4f(vec3f(0.0), 1.0);
}
