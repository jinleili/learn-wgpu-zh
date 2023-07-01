use app_surface::AppSurface;
use bytemuck::{Pod, Zeroable};

mod resource;
mod vertex_ani_app;
pub use vertex_ani_app::VertexAnimationApp;

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
