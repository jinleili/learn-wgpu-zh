use threading::WgpuApp;

// fn main() {
//     async_std::task::block_on();
// }

pub fn main() -> Result<(), impl std::error::Error> {
    utils::run::<WgpuApp>("Threading")
}
