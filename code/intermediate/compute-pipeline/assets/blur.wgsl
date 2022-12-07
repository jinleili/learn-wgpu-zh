
// https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms

struct UniformParams {
  img_size: vec2<i32>,
  uv_offset: vec2<i32>,
};

@group(0) @binding(0) var<uniform> params: UniformParams;
@group(0) @binding(1) var from_tex: texture_2d<f32>;
@group(0) @binding(2) var to_tex: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn cs_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let uv = vec2<i32>(global_id.xy);
  if (uv.x >= params.img_size.x || uv.y >= params.img_size.y) {
    return;
  }

  var weight: array<f32, 5> = array<f32, 5>(0.2, 0.1, 0.10, 0.1, 0.1);
  let uv_max: vec2<i32> = params.img_size - 1;

  var texel = textureLoad(from_tex, uv, 0) * weight[0];
  for (var i: i32 = 1; i <= 4; i += 1) {
    var uv_offset = params.uv_offset * i;
    texel += textureLoad(from_tex, clamp(uv + uv_offset, vec2<i32>(0, 0), uv_max), 0) * weight[i];
    texel += textureLoad(from_tex, clamp(uv - uv_offset, vec2<i32>(0, 0), uv_max), 0) * weight[i];
  }
  textureStore(to_tex, uv, texel);
}
