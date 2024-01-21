mod hilbert_curve_app;
pub use hilbert_curve_app::HilbertCurveApp;

mod hilbert_curve;
mod line;

use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct HilbertUniform {
    // 接近目标的比例
    pub near_target_ratio: f32,
}
