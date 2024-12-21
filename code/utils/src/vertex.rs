#![allow(dead_code)]
use bytemuck::{Pod, Zeroable};
pub trait Vertex {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute>;
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct VertexEmpty {}
impl Vertex for VertexEmpty {
    fn vertex_attributes(_offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![]
    }
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct PosOnly {
    pub pos: [f32; 3],
}

impl Vertex for PosOnly {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![wgpu::VertexAttribute {
            shader_location: offset,
            format: wgpu::VertexFormat::Float32x3,
            offset: 0,
        }]
    }
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct PosTex {
    pub pos: [f32; 3],
    pub tex_coord: [f32; 2],
}

impl PosTex {
    pub fn vertex_f32(pos: [f32; 3], tex_coord: [f32; 2]) -> PosTex {
        PosTex { pos, tex_coord }
    }
}

impl Vertex for PosTex {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![
            wgpu::VertexAttribute {
                shader_location: offset,
                format: wgpu::VertexFormat::Float32x3,
                offset: 0,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 1,
                format: wgpu::VertexFormat::Float32x2,
                offset: 4 * 3,
            },
        ]
    }
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct PosColor {
    pub pos: [f32; 3],
    pub color: [f32; 4],
}

impl Vertex for PosColor {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![
            wgpu::VertexAttribute {
                shader_location: offset,
                format: wgpu::VertexFormat::Float32x3,
                offset: 0,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 1,
                format: wgpu::VertexFormat::Float32x4,
                offset: 4 * 3,
            },
        ]
    }
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct PosNormalUv {
    pub pos: [f32; 3],
    pub normal: [f32; 3],
    pub uv: [f32; 2],
}

impl Vertex for PosNormalUv {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![
            wgpu::VertexAttribute {
                shader_location: offset,
                format: wgpu::VertexFormat::Float32x3,
                offset: 0,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 1,
                format: wgpu::VertexFormat::Float32x3,
                offset: 4 * 3,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 2,
                format: wgpu::VertexFormat::Float32x2,
                offset: 4 * 6,
            },
        ]
    }
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct PosNormalUvIndex {
    pub pos: [f32; 3],
    pub normal: [f32; 3],
    pub uv: [f32; 2],
    pub index: u32,
}

impl Vertex for PosNormalUvIndex {
    fn vertex_attributes(offset: u32) -> Vec<wgpu::VertexAttribute> {
        vec![
            wgpu::VertexAttribute {
                shader_location: offset,
                format: wgpu::VertexFormat::Float32x3,
                offset: 0,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 1,
                format: wgpu::VertexFormat::Float32x3,
                offset: 4 * 3,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 2,
                format: wgpu::VertexFormat::Float32x2,
                offset: 4 * 6,
            },
            wgpu::VertexAttribute {
                shader_location: offset + 3,
                format: wgpu::VertexFormat::Uint32,
                offset: 4 * 8,
            },
        ]
    }
}
