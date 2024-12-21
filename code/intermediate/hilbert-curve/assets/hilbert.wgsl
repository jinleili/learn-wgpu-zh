
struct SceneUniform {
    mvp: mat4x4<f32>,
    viewport_pixels: vec2f,
};

struct HilbertUniform {
    // 接近目标的比例
    near_target_ratio: f32,
    depth_bias: f32,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) @interpolate(linear) dis: f32,
};

@group(0) @binding(0) var<uniform> scene: SceneUniform;
@group(1) @binding(0) var<uniform> hilbert: HilbertUniform;

const EPSILON: f32 = 4.88e-04;

@vertex
fn vs_main(@location(0) pos0: vec3f, 
            @location(1) pos1: vec3f,
            @location(2) target_pos0: vec3f, 
            @location(3) target_pos1: vec3f,
             @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    
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

    var line_width = 7.;
    var alpha = 1.;

    let offset = line_width * (position.x * x_basis + position.y * y_basis);
    let screen = mix(screen_a, screen_b, position.z) + offset;


    var depth: f32;
    if hilbert.depth_bias >= 0. {
        depth = clip.z * (1. - hilbert.depth_bias);
    } else {
        // depth * (clip.w / depth)^-depth_bias. So that when -depth_bias is 1.0, this is equal to clip.w
        // and when equal to 0.0, it is exactly equal to depth.
        // the epsilon is here to prevent the depth from exceeding clip.w when -depth_bias = 1.0
        // clip.w represents the near plane in homogeneous clip space in bevy, having a depth
        // of this value means nothing can be in front of this
        // The reason this uses an exponential function is that it makes it much easier for the
        // user to chose a value that is convenient for them
        depth = clip.z * exp2(-hilbert.depth_bias * log2(clip.w / clip.z - EPSILON));
    }

    var output: VertexOutput;
    output.position = vec4(clip.w * ((2. * screen) / resolution - 1.), 0., clip.w);
    output.dis = line_width * position.y;

    return output;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    var color = vec4f(vec3f(0.0), 1.0);
    let d = abs(in.dis);
    let rho = 0.15;
    if d >= rho {
        // wgpu v23 中的 smoothstep，第一个参数是 low 还是 high 都可以
        // color.a = smoothstep(1., 0., (d - rho) / 1.5);
        
        // chrome 中的 smoothstep，第一个参数必须大于第二个参数
        color.a = smoothstep(0., 1., 1.0 - (d - rho) / 1.5);
    }
    return color;
}
