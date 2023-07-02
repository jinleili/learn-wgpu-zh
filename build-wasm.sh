export RES_PATH=learn-wgpu-zh

RUSTFLAGS=--cfg=web_sys_unstable_apis cargo build --no-default-features --release --target wasm32-unknown-unknown --features webgl \
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
RUSTFLAGS=--cfg=web_sys_unstable_apis cargo build --no-default-features --release --target wasm32-unknown-unknown \
--bin compute-pipeline \
--bin vertex-animation

# Generate bindings
for i in target/wasm32-unknown-unknown/release/*.wasm;
do
    wasm-bindgen --no-typescript --out-dir docs/.vitepress/components/wasm --web "$i";
done
