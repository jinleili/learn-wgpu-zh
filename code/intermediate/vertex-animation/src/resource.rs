use utils::load_texture::AnyTexture;

pub fn load_a_texture(app: &app_surface::AppSurface, img_data: &[u8]) -> AnyTexture {
    let decoder = png::Decoder::new(std::io::Cursor::new(img_data));

    let mut reader = decoder.read_info().unwrap();
    let mut buf = vec![0; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).unwrap();

    let size = wgpu::Extent3d {
        width: info.width,
        height: info.height,
        depth_or_array_layers: 1,
    };
    let format = wgpu::TextureFormat::Rgba8UnormSrgb;
    let texture = app.device.create_texture(&wgpu::TextureDescriptor {
        label: None,
        size,
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format,
        usage: wgpu::TextureUsages::COPY_DST | wgpu::TextureUsages::TEXTURE_BINDING,
        view_formats: &[format.remove_srgb_suffix()],
    });
    app.queue.write_texture(
        texture.as_image_copy(),
        &buf,
        wgpu::TexelCopyBufferLayout {
            offset: 0,
            bytes_per_row: Some(info.width * 4),
            rows_per_image: None,
        },
        size,
    );
    let tex_view = texture.create_view(&wgpu::TextureViewDescriptor {
        format: Some(format.remove_srgb_suffix()),
        ..Default::default()
    });
    AnyTexture {
        size,
        tex: texture,
        tex_view,
        format,
        view_dimension: wgpu::TextureViewDimension::D2,
    }
}
