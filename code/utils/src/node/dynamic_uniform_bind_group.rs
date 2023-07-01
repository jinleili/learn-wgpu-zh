use crate::BufferObj;
use std::vec::Vec;

#[allow(dead_code)]
pub struct DynamicUniformBindGroup {
    pub bind_group_layout: wgpu::BindGroupLayout,
    pub bind_group: wgpu::BindGroup,
}

impl DynamicUniformBindGroup {
    pub fn new(device: &wgpu::Device, uniforms: Vec<(&BufferObj, wgpu::ShaderStages)>) -> Self {
        let mut layouts: Vec<wgpu::BindGroupLayoutEntry> = vec![];
        let mut entries: Vec<wgpu::BindGroupEntry> = vec![];

        for (b_index, (buffer_obj, visibility)) in uniforms.iter().enumerate() {
            layouts.push(wgpu::BindGroupLayoutEntry {
                binding: b_index as u32,
                visibility: *visibility,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: true,
                    // min_binding_size: uniform.0.min_binding_size,
                    min_binding_size: None,
                },
                count: None,
            });
            // 对于动态 uniform buffer, 必须指定 buffer slice 大小
            // make sure that in your BindingResource::Buffer, you're slicing with .slice(..size_of::<Whatever>() as BufferAddress)
            // and not .slice(..)
            // for dynamic uniform buffers, BindingResource::Buffer specifies a "window" into the buffer that is then offset by your dynamic offset value
            entries.push(wgpu::BindGroupEntry {
                binding: b_index as u32,
                resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding {
                    buffer: &buffer_obj.buffer,
                    offset: 0,
                    // size: buffer_obj.0.min_binding_size,
                    size: wgpu::BufferSize::new(
                        device.limits().min_uniform_buffer_offset_alignment as wgpu::BufferAddress,
                    ),
                }),
            });
        }
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &layouts,
            label: None,
        });

        let bind_group: wgpu::BindGroup = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &bind_group_layout,
            entries: &entries,
            label: None,
        });

        DynamicUniformBindGroup {
            bind_group_layout,
            bind_group,
        }
    }
}
