set -e 

cargo build --no-default-features \
--target wasm32-unknown-unknown 

# Generate bindings
for i in ../../../target/wasm32-unknown-unknown/debug/*.wasm;
do
    wasm-bindgen --no-typescript --out-dir wasm --web "$i";
done

cp wasm/wgpu_in_web.js public/wgpu_in_web.js
cp wasm/wgpu_in_web_bg.wasm public/wgpu_in_web_bg.wasm

basic-http-server public
