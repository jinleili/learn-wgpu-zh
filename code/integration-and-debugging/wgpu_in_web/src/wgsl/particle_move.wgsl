struct FrameUniform {
  // 鼠标/触摸位置
  cursor_pos: vec2f,
  // 影响范围
  influence_radius: f32,
};

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

@group(0) @binding(0) var<uniform> params: FrameUniform;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

const PI: f32 = 3.141592653589793238;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&particles);
  let index = global_invocation_id.x;
  if (index > total) {
    return;
  }
  // 0，找出对应编号的粒子
  var particle: Particle = particles[index];
  
  // 检查粒子是否在鼠标影响范围内
  let distance_to_cursor = distance(particle.target_pos.xy, params.cursor_pos);
  let in_influence_range = distance_to_cursor <= params.influence_radius;
  
    // 检查当前位置是否接近目标位置（允许一定误差）
  let distance_to_target = distance(particle.pos, particle.target_pos);
  let at_target_pos = distance_to_target < 1.5; 
  
  // 如果在影响范围内且已经到达目标位置，则保持在目标位置
  if (in_influence_range && at_target_pos) {
      particle.pos = particle.target_pos;
      particles[index] = particle;
      return;
  }

  // 更新粒子的位置

  // 1. 获取并归一化旋转轴
  var rotation_axis = normalize(particle.axis_and_angular_speed.xyz);
  
  // 2. 更新旋转角度
  particle.angle += particle.axis_and_angular_speed.w;
  if (particle.angle > PI * 2.0) {
      particle.angle -= PI * 2.0;
      // 如果完成一次完整旋转且在影响范围内，则停止在目标位置
      if (in_influence_range) {
          particle.pos = particle.target_pos;
          particles[index] = particle;
          return;
      }
  }
  
  // 3. 构建一个垂直于旋转轴的基准向量
  let world_up = vec3f(0.0, 1.0, 0.0);
  var right = normalize(cross(world_up, rotation_axis));
  if (length(right) < 0.001) {
      // 如果旋转轴接近世界上方向，使用世界右方向
      right = normalize(cross(vec3f(1.0, 0.0, 0.0), rotation_axis));
  }
  
  // 4. 计算旋转矩阵的参数
  let cos_theta = cos(particle.angle);
  let sin_theta = sin(particle.angle);
  let one_minus_cos = 1.0 - cos_theta;
  
  // 5. 构建旋转矩阵（Rodrigues旋转公式）
  let rx = rotation_axis.x;
  let ry = rotation_axis.y;
  let rz = rotation_axis.z;
  
  let rotation_matrix = mat3x3f(
      vec3f(
          cos_theta + rx * rx * one_minus_cos,
          rx * ry * one_minus_cos - rz * sin_theta,
          rx * rz * one_minus_cos + ry * sin_theta
      ),
      vec3f(
          ry * rx * one_minus_cos + rz * sin_theta,
          cos_theta + ry * ry * one_minus_cos,
          ry * rz * one_minus_cos - rx * sin_theta
      ),
      vec3f(
          rz * rx * one_minus_cos - ry * sin_theta,
          rz * ry * one_minus_cos + rx * sin_theta,
          cos_theta + rz * rz * one_minus_cos
      )
  );
  
  // 6. 计算旋转后的位置
  let initial_offset = right * particle.radius;
  let rotated_offset = rotation_matrix * initial_offset;
  
  // 7. 更新粒子位置
  particle.pos = vec4f(particle.target_pos.xyz + rotated_offset.xyz, 1.0);
  
  // 8. 保存更新后的粒子状态
  particles[index] = particle;
}