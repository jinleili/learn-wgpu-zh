use hilbert_curve::HilbertCurveApp;

pub fn main() -> Result<(), impl std::error::Error> {
    utils::run::<HilbertCurveApp>("hilbert-curve")
}
