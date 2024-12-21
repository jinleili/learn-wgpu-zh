struct ParticleUniform {
  // 粒子数
  particle_num: vec2u,
  // 画布像素尺寸
  canvas_size: vec2f,
  // NDC 坐标空间中，一个像素对应的大小
  pixel_distance: vec2f,
};

struct Particle {
  // 当前位置
  pos: vec2f,
  // 初始的随机位置
  init_pos: vec2f,
  // 对应的纹理采样位置，确定后不会再变
  uv_pos: vec2f,
  // 目标位置
  target_pos: vec2f,
  // 移动速度
  speed_factor: vec2f,
};


@group(0) @binding(0) var<uniform> params: ParticleUniform;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&particles);
  let index = global_invocation_id.x;
  if (index > total) {
    return;
  }
  // 1，找出对应编号的粒子
  // 2，更新粒子的位置
  var particle: Particle = particles[index];
  var move_dis = (particle.target_pos - particle.pos) * particle.speed_factor.x;
  // var move_dis = (particle.target_pos - particle.pos) * 0.045;

  particle.pos += move_dis;

  particles[index] = particle;
}