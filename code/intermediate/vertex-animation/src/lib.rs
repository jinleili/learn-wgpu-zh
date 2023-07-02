use app_surface::AppSurface;
use bytemuck::{Pod, Zeroable};

mod resource;
mod vertex_ani_app;
pub use vertex_ani_app::VertexAnimationApp;

mod particle_ink;

// mod hilbert_curve;
// use hilbert_curve::HilbertCurve;

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
struct TurningDynamicUniform {
    radius: f32,
    angle: f32,
    np: [f32; 2],
    n: [f32; 2],
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct ParticleUniform {
    // 粒子数
    pub particle_num: [u32; 2],
    // 画布像素尺寸
    pub canvas_size: [f32; 2],
    // NDC 坐标空间中，一个像素对应的大小
    pub pixel_distance: [f32; 2],
}

#[repr(C)]
#[derive(Copy, Clone, Pod, Zeroable)]
pub struct MoveParticle {
    // 当前位置
    pub pos: [f32; 2],
    // 初始的随机位置
    pub init_pos: [f32; 2],
    // 对应的纹理采样位置，确定后不会再变
    pub uv_pos: [f32; 2],
    // 目标位置
    pub target_pos: [f32; 2],
    // 移动速度
    pub speed_factor: [f32; 2],
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct ParticleFrameUniform {
    pub frame_alpha: f32,
}

fn create_depth_tex(app: &AppSurface) -> wgpu::TextureView {
    let depth_texture = app.device.create_texture(&wgpu::TextureDescriptor {
        size: wgpu::Extent3d {
            width: app.config.width,
            height: app.config.height,
            depth_or_array_layers: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Depth32Float,
        usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
        label: None,
        view_formats: &[],
    });
    depth_texture.create_view(&wgpu::TextureViewDescriptor::default())
}
