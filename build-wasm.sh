export RES_PATH=learn-wgpu-zh
#
cargo build --no-default-features --profile wasm-release --target wasm32-unknown-unknown --features webgl \
--bin tutorial1-window \
--bin tutorial2-surface \
--bin tutorial3-pipeline \
--bin tutorial4-buffer \
--bin tutorial5-textures \
--bin tutorial6-uniforms \
--bin tutorial7-instancing \
--bin tutorial8-depth \
--bin tutorial9-models \
--bin tutorial10-lighting \
--bin tutorial11-normals \
--bin tutorial12-camera

# 只能使用 WebGPU 的示例程序
cargo build --no-default-features --profile wasm-release --target wasm32-unknown-unknown \
--bin compute-pipeline \
--bin vertex-animation \
--bin hilbert-curve \
--bin hdr 

# Generate bindings
for i in target/wasm32-unknown-unknown/wasm-release/*.wasm;
do
    wasm-bindgen --no-typescript --out-dir wasm --web "$i";
    # 优化 wasm 包大小
    filename=$(basename "$i");
    # Remove the .wasm extension from filename
    name_no_extension="${filename%.wasm}"
    wasm-opt -Oz wasm/"$name_no_extension"_bg.wasm --output docs/public/wasm/"$name_no_extension"_bg.wasm;

    cp wasm/"$name_no_extension".js docs/public/wasm/"$name_no_extension".js
done


