#![allow(dead_code)]

use glam::{Mat3, Vec2};

use utils::vertex::PosOnly;
// 希尔伯特曲线
// https://mp.weixin.qq.com/s?__biz=MzA5OTgyMDk3Mg==&mid=2651226513&idx=1&sn=d0a7ca19c2472fdf84066d50806d97af&chksm=8b0e5552bc79dc44b9b1e661c8a65f475cc12d814decd0c920dee8eee4f1122e19203f86258d&mpshare=1&scene=23&srcid=04087uUnkEMZacAS8Om9fkcY#rd
pub struct HilbertCurve {
    pub dimension: u32,
    pub vertices: Vec<PosOnly>,
    pub mesh_indices: Vec<u32>,
}

impl HilbertCurve {
    pub fn new(dimension: u32) -> Self {
        let mut instance = HilbertCurve {
            dimension,
            vertices: vec![],
            mesh_indices: vec![],
        };
        instance.generate_mesh();
        instance
    }

    fn generate_mesh(&mut self) {
        if self.dimension == 0 {
            return;
        }

        let pi_2 = std::f32::consts::FRAC_PI_2;

        let mut base = vec![
            Vec2::new(-0.5, -0.5),
            Vec2::new(-0.5, 0.5),
            Vec2::new(0.5, 0.5),
            Vec2::new(0.5, -0.5),
        ];

        // 大于 1 维的希尔博特曲线，点的变换添加由左下角 -> 左上角 -> 右上角 -> 右下角
        for _ in 1..self.dimension {
            let mut new_points: Vec<Vec2> = vec![];
            for i in 0..=3 {
                // 变换矩阵每个方位不一样
                // 点的顺序在 左下角 及 右下角 时都需要反转
                // 点序的反转通过遍历 base 的顺序来实现
                let mut need_flip = false;
                let mat = match i {
                    0 => {
                        need_flip = true;
                        Similarity2::new(Vec2::new(-0.5, -0.5), -pi_2, 0.5)
                    }
                    1 => Similarity2::new(Vec2::new(-0.5, 0.5), 0., 0.5),
                    2 => Similarity2::new(Vec2::new(0.5, 0.5), 0., 0.5),
                    _ => {
                        need_flip = true;
                        Similarity2::new(Vec2::new(0.5, -0.5), pi_2, 0.5)
                    }
                };
                // 这种遍历无法倒序进行
                for k in 0..base.len() {
                    let mut p: Vec2 = if need_flip {
                        base[(base.len() - 1) - k]
                    } else {
                        base[k]
                    };
                    p = mat.matrix.transform_point2(p);
                    new_points.push(p);
                }
            }
            base = new_points;
        }

        // 输出最终顶点
        let mut vertices: Vec<PosOnly> = vec![];
        for p in &base {
            vertices.push(PosOnly {
                pos: [p[0], p[1], 0.],
            });
        }
        self.vertices = vertices;
    }

    /// 把顶点数翻 4 倍
    pub fn four_times_vertices(&mut self) {
        let mut vertices: Vec<PosOnly> = vec![];
        for p in self.vertices.iter() {
            for _ in 0..4 {
                vertices.push(*p);
            }
        }
        self.vertices = vertices;
    }
}

struct Similarity2 {
    matrix: Mat3,
}

impl Similarity2 {
    fn new(translation: Vec2, rotation: f32, scale: f32) -> Self {
        let rotation = glam::Quat::from_rotation_z(rotation);
        let scale_matrix = Mat3::from_scale(Vec2 { x: scale, y: scale });
        let rotation_matrix = Mat3::from_quat(rotation);
        let translation_matrix = Mat3::from_translation(translation);
        let matrix = translation_matrix * rotation_matrix * scale_matrix;
        Similarity2 { matrix }
    }
}
