use wgpu::util::{BufferInitDescriptor, DeviceExt};

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct LightData {
    pub position: glam::Vec4,
    pub color: glam::Vec4,
}

unsafe impl bytemuck::Pod for LightData {}
unsafe impl bytemuck::Zeroable for LightData {}

pub struct LightUniform {
    #[allow(dead_code)]
    data: LightData,
    #[allow(dead_code)]
    buffer: wgpu::Buffer,
}

impl LightUniform {
    pub fn new(device: &wgpu::Device, position: glam::Vec3, color: glam::Vec3) -> Self {
        let data = LightData {
            position: glam::Vec4::new(position.x, position.y, position.z, 1.0),
            color: glam::Vec4::new(color.x, color.y, color.z, 1.0),
        };
        let buffer = device.create_buffer_init(&BufferInitDescriptor {
            contents: bytemuck::cast_slice(&[data]),
            usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::UNIFORM,
            label: Some("Light Buffer"),
        });

        Self { data, buffer }
    }
}

pub struct LightBinding {
    pub layout: wgpu::BindGroupLayout,
    pub bind_group: wgpu::BindGroup,
}
