set -e 

cargo build --no-default-features --features web_rwh --profile wasm-release --target wasm32-unknown-unknown 

# Generate bindings
wasm-bindgen --no-typescript --out-dir wasm --web "../../../target/wasm32-unknown-unknown/debug/wgpu_in_web.wasm";

cp wasm/wgpu_in_web.js public/wgpu_in_web.js
cp wasm/wgpu_in_web_bg.wasm public/wgpu_in_web_bg.wasm

# 复制 assets 目录到 public
cp -r assets public/

basic-http-server public
