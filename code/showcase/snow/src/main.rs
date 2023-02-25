use anyhow::{Error, Result};

struct Snow {}

impl framework::Demo for Snow {
    fn init(_display: &framework::Display) -> Result<Self, Error> {
        Ok(Self {})
    }

    fn process_mouse(&mut self, _dx: f64, _dy: f64) {}

    fn resize(&mut self, _display: &framework::Display) {}

    fn update(&mut self, _display: &framework::Display, _dt: std::time::Duration) {}

    fn render(&mut self, _display: &mut framework::Display) {}
}

fn main() -> Result<()> {
    pollster::block_on(framework::run::<Snow>())?;
    Ok(())
}
