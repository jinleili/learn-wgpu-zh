#[derive(Clone, Copy)]
pub struct FullscreenFactor {
    pub sx: f32,
    pub sy: f32,
    pub translate_z: f32,
}

// 将[-1, 1]的矩形空间映射到刚好填充整个视口
#[allow(dead_code)]
pub fn perspective_fullscreen_mvp(viewport: glam::Vec2) -> (glam::Mat4, glam::Mat4) {
    let (p_matrix, vm_matrix, factor) = perspective_mvp(viewport);
    let scale_matrix = glam::Mat4::from_scale(glam::Vec3::new(factor.sx, factor.sy, 1.0));

    (p_matrix, vm_matrix * scale_matrix)
}

pub fn perspective_mvp(viewport: glam::Vec2) -> (glam::Mat4, glam::Mat4, FullscreenFactor) {
    let fovy: f32 = 45.0_f32.to_radians();
    let p_matrix = glam::Mat4::perspective_rh(fovy, viewport.x / viewport.y, 0.1, 100.0);
    let factor = fullscreen_factor(viewport, fovy);
    let vm_matrix = glam::Mat4::from_translation(glam::vec3(0.0, 0.0, factor.translate_z));
    // let vm_matrix = glam::Mat4::IDENTITY;

    (p_matrix, vm_matrix, factor)
}

pub fn fullscreen_factor(viewport: glam::Vec2, fovy: f32) -> FullscreenFactor {
    // 缩放到贴合屏幕
    let mut sx: f32 = 1.0;
    let mut sy = 1.0;
    let ratio = if viewport.y > viewport.x {
        let ratio = viewport.y / viewport.x;
        sy = ratio;
        ratio
    } else {
        sx = viewport.x / viewport.y;
        1.0
    };
    // 右手坐标系，z 轴朝屏幕外，所以是负数
    let translate_z = -ratio / (fovy / 2.0).tan();

    FullscreenFactor {
        sx,
        sy,
        translate_z,
    }
}

pub fn ortho_mvp(viewport_size: glam::Vec2) -> (glam::Mat4, glam::Mat4) {
    let fovy: f32 = 45.0f32.to_radians();
    let factor = fullscreen_factor(viewport_size, fovy);
    let p_matrix = glam::Mat4::orthographic_rh(
        -1.0 * factor.sx,
        1.0 * factor.sx,
        -1.0 * factor.sy,
        1.0 * factor.sy,
        -100.0,
        100.0,
    );
    (p_matrix, glam::Mat4::IDENTITY)
}
