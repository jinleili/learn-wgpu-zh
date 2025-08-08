<template>
    <div ref="container" id="wgpu-container">
        <canvas ref="canvas" id="wgpu-canvas" raw-window-handle="1" style="z-index: -1;"></canvas>
        <div v-if="showAlert" style="color: #353535;margin-top: 20px;" class="loading-overlay">
            <div style="line-height: 40px;">此浏览器版本不支持 WebGPU</div>
            <div style="font-size: 16px;color: #999999;">
                请使用 Chrome / Edge 113+，Arc 或者 Safari 26
            </div>
        </div>
        <div v-if="loading" class="loading-overlay">
            正在加载 WASM 模块 ...
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const appHandle = ref(0)

const showAlert = ref(false);
const loading = ref(true);

let contentWidth = 0;
let contentHeight = 0;
let wgpuAppModule = null;

onMounted(async () => {
    // 设置 ResizeObserver
    const canvas = document.getElementById('wgpu-canvas')
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target === canvas) {
                const width = entry.contentRect.width * window.devicePixelRatio
                const height = entry.contentRect.height * window.devicePixelRatio
                if (appHandle.value !== 0) {
                    resizeApp(appHandle.value, width, height)
                } else {
                    contentWidth = width;
                    contentHeight = height;
                }
            }
        }
    })

    const resizeApp = (contentWidth, contentHeight) => {
        if (devicePixelRatio !== 1) {
            canvas.width = contentWidth;
            canvas.height = contentHeight;
        }
        wgpuAppModule.resize_app(appHandle.value, contentWidth, contentHeight);
    }

    if ('navigator' in window && 'gpu' in navigator) {
        navigator.gpu.requestAdapter().then(adapter => {
            // 浏览器支持 WebGPU
            loadWgpuApp();
        }).catch(error => {
            notSupportWebGPU();
        });
    } else {
        // 浏览器不支持 navigator.gpu
        notSupportWebGPU();
    }

    const notSupportWebGPU = () => {
        showAlert.value = true;
        loading.value = false;
    }

    const loadWgpuApp = async () => {
        // 导入 wgpu app 模块
        const url = window.location.protocol + '//' + window.location.host + '/learn-wgpu-zh'
        wgpuAppModule = await import(/* @vite-ignore */`${url}/wasm/wgpu-in-web.js`);

        // 初始化 WASM 模块
        await wgpuAppModule.default();

        resizeObserver.observe(canvas);

        // 创建 WGPU 应用
        appHandle.value = await wgpuAppModule.create_wgpu_app('wgpu-canvas', 1);
        if (contentWidth !== 0 && contentHeight !== 0) {
            resizeApp(contentWidth, contentHeight);
        }
        loading.value = false;

        // 开始动画
        requestAnimationFrame(enterFrame);

        document.body.addEventListener('mousemove', updatePosition);
        document.body.addEventListener('touchmove', updatePosition);
        document.body.addEventListener('touchmove', (e) => e.preventDefault(), {
            passive: false,
        });
    }

    // 添加动画循环
    const enterFrame = (_dt) => {
        // 当 app 准备好时，执行 app 的帧循环
        if (appHandle.value === 0) return;

        wgpuAppModule.enter_frame(appHandle.value);

        requestAnimationFrame(enterFrame);
    }


    // 添加事件监听
    const updatePosition = (event) => {
        if (!appHandle.value) return

        const rect = canvas.getBoundingClientRect()
        let clientX, clientY

        if (event.touches) {
            event.preventDefault()
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
        } else {
            clientX = event.clientX
            clientY = event.clientY
        }

        const x = (clientX - rect.left) * window.devicePixelRatio
        const y = (clientY - rect.top) * window.devicePixelRatio
        wgpuAppModule.on_mouse_move(appHandle.value, x, y)
    }

})
</script>

<style scoped>
.wgpu-container {
    display: flex;
    position: relative;
    width: 50vw;
    height: 35vw;
    min-width: 600px;
    min-height: 300px;
    margin: auto;
}

canvas {
    width: 100%;
    height: 100%;
    display: block;
    background-color: gainsboro;
}

.loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* 可选的额外样式 */
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 18px;
    color: #333;
    text-align: center;
}
</style>