export RES_PATH=learn-wgpu-zh

RUSTFLAGS='--cfg getrandom_backend="wasm_js"'
export RUSTFLAGS

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

# 使用 raw window handle 的示例程序
cargo build --no-default-features --features web_rwh --profile wasm-release --target wasm32-unknown-unknown \
--bin wgpu-in-web

# 创建 wasm 目录
mkdir -p "docs/public/wasm"

# Generate bindings
for i in target/wasm32-unknown-unknown/wasm-release/*.wasm;
do
    wasm-bindgen --no-typescript --out-dir wasm --web "$i";
    # 优化 wasm 包大小
    filename=$(basename "$i");
    # Remove the .wasm extension from filename
    name_no_extension="${filename%.wasm}";
    wasm-opt -Oz --enable-bulk-memory --enable-nontrapping-float-to-int --output docs/public/wasm/"$name_no_extension"_bg.wasm wasm/"$name_no_extension"_bg.wasm;

    cp wasm/"$name_no_extension".js docs/public/wasm/"$name_no_extension".js
done

# 创建 assets 目标目录（如果不存在）
mkdir -p docs/public/assets

# 拷贝 wgpu-in-web 的 assets 目录下的所有文件
cp -r code/integration-and-debugging/wgpu_in_web/assets/* docs/public/assets/


