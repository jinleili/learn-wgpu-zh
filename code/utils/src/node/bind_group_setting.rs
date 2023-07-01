use std::vec::Vec;
use wgpu::{BindGroupLayout, TextureFormat};

use super::BindGroupData;

#[allow(dead_code)]
pub struct BindGroupSetting {
    pub bind_group_layout: wgpu::BindGroupLayout,
    pub bind_group: wgpu::BindGroup,
}

#[allow(dead_code)]
impl BindGroupSetting {
    pub fn new(device: &wgpu::Device, bg_data: &BindGroupData) -> Self {
        let mut layouts: Vec<wgpu::BindGroupLayoutEntry> = vec![];
        let mut entries: Vec<wgpu::BindGroupEntry> = vec![];

        // 关于 min_binding_size
        // https://gpuweb.github.io/gpuweb/#dom-gpubindgrouplayoutentry-minbufferbindingsize
        let mut b_index = 0_u32;
        for buffer_obj in bg_data.uniforms.iter() {
            layouts.push(wgpu::BindGroupLayoutEntry {
                binding: b_index,
                visibility: bg_data.visibilitys[b_index as usize],
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: wgpu::BufferSize::new(0),
                },
                count: None,
            });
            entries.push(wgpu::BindGroupEntry {
                binding: b_index,
                resource: buffer_obj.buffer.as_entire_binding(),
            });
            b_index += 1;
        }

        for buffer_obj in bg_data.storage_buffers.iter() {
            layouts.push(wgpu::BindGroupLayoutEntry {
                binding: b_index,
                visibility: bg_data.visibilitys[b_index as usize],
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage {
                        read_only: buffer_obj.read_only,
                    },
                    has_dynamic_offset: buffer_obj.has_dynamic_offset,
                    min_binding_size: wgpu::BufferSize::new(0),
                },
                count: None,
            });
            entries.push(wgpu::BindGroupEntry {
                binding: b_index,
                resource: buffer_obj.buffer.as_entire_binding(),
            });
            b_index += 1;
        }

        for (any_tex, storage_access) in bg_data.inout_tv.iter() {
            let view_dimension = any_tex.view_dimension;
            layouts.push(wgpu::BindGroupLayoutEntry {
                binding: b_index,
                visibility: bg_data.visibilitys[b_index as usize],
                ty: if let Some(access) = storage_access.as_ref() {
                    wgpu::BindingType::StorageTexture {
                        view_dimension,
                        access: *access,
                        format: any_tex.format,
                    }
                } else {
                    wgpu::BindingType::Texture {
                        sample_type: wgpu::TextureSampleType::Float {
                            filterable: texture_sample_filterable(any_tex.format),
                        },
                        view_dimension,
                        multisampled: false,
                    }
                },
                count: None,
            });
            entries.push(wgpu::BindGroupEntry {
                binding: b_index,
                resource: wgpu::BindingResource::TextureView(&any_tex.tex_view),
            });
            b_index += 1;
        }

        for sampler in bg_data.samplers.iter() {
            layouts.push(wgpu::BindGroupLayoutEntry {
                binding: b_index,
                visibility: bg_data.visibilitys[b_index as usize],
                ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                count: None,
            });
            entries.push(wgpu::BindGroupEntry {
                binding: b_index,
                resource: wgpu::BindingResource::Sampler(sampler),
            });
            b_index += 1;
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

        Self {
            bind_group_layout,
            bind_group,
        }
    }

    pub fn get_layouts(&self) -> Vec<&BindGroupLayout> {
        vec![]
    }
}

fn texture_sample_filterable(format: TextureFormat) -> bool {
    match format {
        // on iOS: texture binding 1 expects sample type = Float { filterable: true }, but given a view with format = R32Float
        TextureFormat::R32Float => false,
        _ => true,
    }
}
