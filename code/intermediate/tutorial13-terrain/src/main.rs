use utils::run;

pub fn main() -> Result<(), impl std::error::Error> {
    run::<tutorial13_terrain::WgpuApp>("tutorial13-terrain")
}
