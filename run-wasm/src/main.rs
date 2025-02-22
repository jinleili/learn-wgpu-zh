use fs_extra::copy_items;
use fs_extra::dir::CopyOptions;
use std::path::PathBuf;

fn main() {
    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        if arg.as_str() == "--bin" {
            let mut copy_options = CopyOptions::new();
            copy_options.overwrite = true;

            let base_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            let mut out_dir = base_path.join("../target/wasm-examples/");
            let mut res_dir = base_path.join("../code/");
            let mut is_need_copy = false;

            let example = args.next();
            match example.as_deref() {
                Some("tutorial12-camera") => {
                    out_dir = out_dir.join("tutorial12-camera");
                    res_dir = res_dir.join("intermediate/tutorial12-camera/res");
                    is_need_copy = true;
                }
                Some("tutorial11-normals") => {
                    out_dir = out_dir.join("tutorial11-normals");
                    res_dir = res_dir.join("intermediate/tutorial11-normals/res");
                    is_need_copy = true;
                }
                Some("tutorial10-lighting") => {
                    out_dir = out_dir.join("tutorial10-lighting");
                    res_dir = res_dir.join("intermediate/tutorial10-lighting/res");
                    is_need_copy = true;
                }
                Some("tutorial9-models") => {
                    out_dir = out_dir.join("tutorial9-models");
                    res_dir = res_dir.join("beginner/tutorial9-models/res");
                    is_need_copy = true;
                }
                Some("hdr") => {
                    out_dir = out_dir.join("hdr");
                    res_dir = res_dir.join("intermediate/hdr/res");
                    is_need_copy = true;
                }
                Some("wgpu_in_web") | Some("wgpu-in-web") => {
                    panic!(
                        "wgpu_in_web 示例用到了自定义的 html 文件，\n 需要在 code/integration-and-debugging/wgpu_in_web 目录下执行\n `sh ./run-wasm.sh` \n运行"
                    );
                }
                _ => {}
            }

            if is_need_copy {
                let result = copy_items(&[&res_dir], &out_dir, &copy_options);
                if let Err(e) = result {
                    println!("copy_items error: {:?}", e);
                    println!("res_dir: {:?}", res_dir.canonicalize());
                    println!("out_dir: {:?}", out_dir.canonicalize());
                }
            }
        }
    }

    cargo_run_wasm::run_wasm_with_css(
        r#"
    body, div, canvas { margin: 0px; padding: 0px; } 
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg,
          white 0%,
          white 49%,
          black 49%,
          black 51%,
          white 51%,
          white 100%) repeat;
        background-size: 20px 20px;
        width: 100vw;
        height: 100vh;
    }
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        background-color: #454545;
    }
    #wgpu-app-container {
        width: 50vw;
        height: 50vw;
        min-width: 375px;
        min-height: 375px;
    }
    "#,
    );
}
