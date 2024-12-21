struct Particle {
  // 当前位置
  pos: vec4f,
  // 目标位置
  target_pos: vec4f,
  // 旋转轴 与 角速度
  axis_and_angular_speed: vec4f,
  // 对应的纹理采样位置，确定后不会再变
  uv: vec2f,
  // 运动半径
  radius: f32,
  // 当前弧度
  angle: f32,
};

@group(0) @binding(0) var<storage, read_write> counter: atomic<u32>;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(2) var input_texture: texture_2d<f32>;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&particles);
  let index = global_invocation_id.x;
  if (index > total) {
    return;
  }

  let tex_size = textureDimensions(input_texture);
  let coord_x = index % tex_size.x;
  var coord_y = modf(f32(index) / f32(tex_size.x)).whole;
  // 获取纹素
  let color = textureLoad(input_texture, vec2i(i32(coord_x), i32(coord_y)), 0);

  let brightness = (color.r + color.g + color.b) ;
  if (brightness < 1.2) {
    // 计算粒子编号
    let write_index = atomicAdd(&counter, 1u) - 1u;

    // 计算 uv 坐标
    let uv = vec2f((f32(coord_x) + 0.5) / f32(tex_size.x), (coord_y + 0.5) / f32(tex_size.y));

    var particle: Particle = particles[write_index];
    // 翻转 y 坐标
    coord_y = f32(tex_size.y) - coord_y;
    particle.target_pos = vec4f(f32(coord_x), coord_y, 0.0, 1.0);
    particle.pos = particle.target_pos;
    particle.uv = uv;

    particles[write_index] = particle;
  } 
}