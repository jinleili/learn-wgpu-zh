struct VertexOutput {
    @location(0) uv: vec2f,
    @builtin(position) position: vec4<f32>,
};

// 绘制一个大三角形覆盖在剪辑空间上（星号代表剪辑空间边界），如下所示： 
// 
//-1,1           1,1
// ---------------------------------
// |              *              .
// |              *           .
// |              *        .
// |              *      .
// |              *    . 
// |              * .
// |***************
// |            . 1,-1 
// |          .
// |       .
// |     .
// |   .
// |.
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    let uv = vec2f(f32((vertexIndex << 1u) & 2u), f32(vertexIndex & 2u));
    var out: VertexOutput;
    out.position = vec4f(uv * 2.0 - 1.0, 0.999, 1.0);
    // invert uv.y
    out.uv = vec2f(uv.x, (uv.y - 1.0) *  (-1.0));
    return out;
}

@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment 
fn fs_main(in : VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, in.uv);
}
