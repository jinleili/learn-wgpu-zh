mod compute_node;
pub use compute_node::ComputeNode;

mod bind_group_setting;
pub use bind_group_setting::BindGroupSetting;

mod dynamic_uniform_bind_group;
pub use dynamic_uniform_bind_group::DynamicUniformBindGroup;

mod view_node;
pub use view_node::{ViewNode, ViewNodeBuilder};
mod bufferless_fullscreen_node;
pub use bufferless_fullscreen_node::BufferlessFullscreenNode;

use crate::{load_texture::AnyTexture, BufferObj};

#[derive(Default, Clone)]
pub struct BindGroupData<'a> {
    pub workgroup_count: (u32, u32, u32),
    pub uniforms: Vec<&'a BufferObj>,
    pub dynamic_uniforms: Vec<&'a BufferObj>,
    pub storage_buffers: Vec<&'a BufferObj>,
    pub inout_tv: Vec<(&'a AnyTexture, Option<wgpu::StorageTextureAccess>)>,
    pub samplers: Vec<&'a wgpu::Sampler>,
    // compute BGL doesn't need to set these fields, because visibility always equal ShaderStages::COMPUTE
    // BufferlessFullscreenNode also doesn't need to set these fields
    pub visibilitys: Vec<wgpu::ShaderStages>,
    pub dynamic_uniform_visibilitys: Vec<wgpu::ShaderStages>,
}
