use threading::WgpuApp;

pub fn main() -> Result<(), impl std::error::Error> {
    utils::run::<WgpuApp>("Threading")
}
