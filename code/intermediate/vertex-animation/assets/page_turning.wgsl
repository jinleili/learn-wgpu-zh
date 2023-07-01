struct MVPMatUniform {  
    mvp: mat4x4f,
};

struct TurningDynamicUniform {
    // 开始卷动的半径
    radius: f32,
    angle: f32,
    np: vec2f,
    n: vec2f,
};

@group(0) @binding(0) var<uniform> mvp_mat: MVPMatUniform;
@group(0) @binding(1) var paper_texture: texture_2d<f32>;
@group(0) @binding(2) var paper_sampler: sampler;

// 动态缓冲区, 使用了不同的 bind group 插槽
@group(1) @binding(0) var<uniform> turning: TurningDynamicUniform;

const PI: f32 = 3.14159265358979;
const PI_2: f32 = 1.57079632675;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) paper_uv: vec2f,
    // 卷起的高度
    @location(1) roll_height: f32,
    @location(2) instance_index: u32,
};

@vertex
fn vs_main(
    @builtin(instance_index) instance_index: u32,
    @location(0) position: vec3f,
    @location(1) paper_texcoord: vec2f,
) -> VertexOutput {
    var out: VertexOutput;
    out.paper_uv = paper_texcoord;
    out.instance_index = instance_index;

    // 从 np 位置到 position 的矢量
    let v: vec2f = position.xy - turning.np;
    // v 在单位矢量 n 上的投影长度
    let l: f32 = dot(v, turning.n);
    if (instance_index == 0u) {
        out.roll_height = 0.0;
        // 将底下的 paper z-index 放低一些, 避免 z fighting
        out.position = mvp_mat.mvp * vec4f(position.xy, position.z - 0.00001, 1.0);
    } else {
        // 投影长度值为正，表示 position 是需要被卷起的点
        if (l > 0.0) {
            // 半圆周长
            let half_circle: f32 = PI * turning.radius;
            var new_position: vec3f = position.xyz;

            // position 卷起后与之前的位置差
            var d = 0.0;

            // 切点到 half_circle 之间的顶点计算卷起
            if (l <= half_circle) {
                // 被卷起的弧度
                let degress = (l / half_circle) * PI - PI_2;
                d = l - cos(degress) * turning.radius;
                // position 卷起后的高度
                new_position.z = (turning.radius + sin(degress) * turning.radius);
            } else {
                d = l + (l - half_circle);
                // half_circle 之外的顶点，z 轴是固定的圆的直径
                new_position.z = turning.radius * 2.0;
            }
            // new_position.z *= -1;
            new_position.y -= sin(turning.angle) * d;
            new_position.x -= cos(turning.angle) * d;
            out.roll_height = new_position.z;
            out.position = mvp_mat.mvp * vec4f(new_position, 1.0);
        } else {
            out.roll_height = 0.0;
            out.position = mvp_mat.mvp * vec4f(position, 1.0);
        }
    }
    return out;
}

const whiteWeight: f32 = 0.45;
const texWeight: f32 = 0.55;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    var frag_color: vec4f = textureSample(paper_texture, paper_sampler, in.paper_uv);
    if (in.instance_index == 1u) {
        var rgb_color: vec3f = frag_color.rgb;
        let diameter = turning.radius * 2.0;
        if (in.roll_height > 0.0) {
            if (in.roll_height > turning.radius) {
                rgb_color = frag_color.rgb * texWeight + whiteWeight;
                if (in.roll_height < diameter) {
                    //模拟卷起片段的背面阴影, 卷起得越高,阴影越小
                    rgb_color *= (1.0 - 0.15 * ((diameter - in.roll_height) / turning.radius));
                }
            } else {
                //模拟卷起片段的内面阴影, 卷起得越高,阴影越大
                rgb_color *= (0.5 + (0.5 - 0.5 * (in.roll_height / turning.radius)));
            }
        } 
        frag_color = vec4f(rgb_color, frag_color.a);
    }
    return frag_color;
}