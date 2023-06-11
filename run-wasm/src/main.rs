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
                _ => {}
            }

            if is_need_copy {
                let _ = copy_items(&[&res_dir], out_dir, &copy_options);
            }
        }
    }

    cargo_run_wasm::run_wasm_with_css("body { margin: 0px; }");
}
