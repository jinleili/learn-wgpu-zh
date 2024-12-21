pub fn pack_rgba8_to_u32(rgba: &[u8]) -> u32 {
    ((rgba[0] as u32) << 24) | ((rgba[1] as u32) << 16) | ((rgba[2] as u32) << 8) | rgba[3] as u32
}

pub fn unpack_u32_to_rgba8(value: u32) -> [u8; 4] {
    [
        ((value >> 24) & 0xff) as u8,
        ((value >> 16) & 0xff) as u8,
        ((value >> 8) & 0xff) as u8,
        (value & 0xff) as u8,
    ]
}

pub fn unpack_u32_to_rgba_f32(value: u32) -> [f32; 4] {
    let rgba8 = unpack_u32_to_rgba8(value);
    [
        rgba8[0] as f32 / 255.0,
        rgba8[1] as f32 / 255.0,
        rgba8[2] as f32 / 255.0,
        rgba8[3] as f32 / 255.0,
    ]
}

pub fn unpack_u32_to_color(value: u32) -> wgpu::Color {
    let rgba8 = unpack_u32_to_rgba8(value);
    wgpu::Color {
        r: rgba8[0] as f64 / 255.0,
        g: rgba8[1] as f64 / 255.0,
        b: rgba8[2] as f64 / 255.0,
        a: rgba8[3] as f64 / 255.0,
    }
}
