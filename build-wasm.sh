export RES_PATH=learn-wgpu-zh

RUSTFLAGS=--cfg=web_sys_unstable_apis cargo build --no-default-features --release --target wasm32-unknown-unknown --features webgl \
--example tutorial1-window \
--example tutorial2-surface \
--example tutorial3-pipeline \
--example tutorial4-buffer \
--example tutorial5-textures \
--example tutorial6-uniforms \
--example tutorial7-instancing \
--example tutorial8-depth \
--example tutorial9-models \
--example tutorial10-lighting \
--example tutorial11-normals \
--example tutorial12-camera

# 只能使用 WebGPU 的示例程序
RUSTFLAGS=--cfg=web_sys_unstable_apis cargo build --no-default-features --release --target wasm32-unknown-unknown \
--example compute-pipeline

# Generate bindings
for i in target/wasm32-unknown-unknown/release/examples/*.wasm;
do
    wasm-bindgen --no-typescript --out-dir docs/.vitepress/components/wasm --web "$i";
done
