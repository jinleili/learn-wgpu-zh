use crate::vertex::PosTex;

pub struct Plane {
    width: f32,
    height: f32,
    x_offset: f32,
    y_offset: f32,
    h_segments: u32,
    v_segments: u32,
}

impl Plane {
    pub fn new(h_segments: u32, v_segments: u32) -> Self {
        Plane {
            width: 2.0,
            height: 2.0,
            x_offset: 0.0,
            y_offset: 0.0,
            h_segments,
            v_segments,
        }
    }

    // 支持指定纹理区域
    pub fn generate_vertices(&self) -> (Vec<PosTex>, Vec<u32>) {
        // z，w 表示宽高
        let tex_rect = glam::Vec4::new(0.0, 0.0, 1.0, 1.0);
        let segment_width = self.width / self.h_segments as f32;
        let segment_height = self.height / self.v_segments as f32;
        let h_gap = tex_rect.z / (self.h_segments as f32);
        let v_gap = tex_rect.w / (self.v_segments as f32);

        let mut vertices: Vec<PosTex> = Vec::new();

        // 从左下角开始，按列遍历
        // 下边的写法等同于 for (let h=0; h<(h_segments + 1); h++) {}
        for h in 0..=self.h_segments {
            let x: f32 = self.most_left_x() + segment_width * (h as f32);
            let tex_coord_u: f32 = tex_rect.x + h_gap * (h as f32);

            for v in 0..=self.v_segments {
                let y: f32 = self.most_bottom_y() + segment_height * (v as f32);
                let tex_coord_v: f32 = tex_rect.y + tex_rect.w - v_gap * (v as f32);
                // println!("tex_coord: {}, {} ", tex_coord_u, tex_coord_v);
                vertices.push(PosTex::vertex_f32([x, y, 0.0], [tex_coord_u, tex_coord_v]));
            }
        }

        (vertices, self.get_element_indices())
    }

    //  最左边的 x 坐标
    fn most_left_x(&self) -> f32 {
        if self.x_offset != 0.0 {
            self.x_offset
        } else {
            -self.half_width()
        }
    }
    // 最下边的 y 坐标
    fn most_bottom_y(&self) -> f32 {
        if self.y_offset != 0.0 {
            self.y_offset
        } else {
            -self.half_height()
        }
    }

    // 返回的是 triangle list，而不是 triangle strip
    pub fn get_element_indices(&self) -> Vec<u32> {
        let mut indices: Vec<u32> = Vec::new();
        // 2 个线段有 3 个结点，所以需要 (self.v_segments + 1) * h
        let v_point_num = self.v_segments + 1;
        // 按列遍历
        for h in 1..=self.h_segments {
            let num: u32 = v_point_num * h;
            for v in 1..(self.v_segments + 1) {
                let current: u32 = num + v;
                // 找到上一列同一行位置的索引
                let left: u32 = current - v_point_num;
                let mut lines: Vec<u32> =
                    vec![current, left, left - 1, current, left - 1, current - 1];
                indices.append(&mut lines);
            }
        }

        indices
    }

    fn half_width(&self) -> f32 {
        self.width / 2.0
    }

    fn half_height(&self) -> f32 {
        self.height / 2.0
    }
}
