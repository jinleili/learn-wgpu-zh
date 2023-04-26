<template>
    <div id="simuverse_container">
        <div id="alert" style="display: none;">
            <div style="line-height: 40px;">此浏览器版本不支持 WebGPU</div>
            <div style="font-size: 16px;color: #999999;">请使用 Chrome 113 及以上版本，或者 Chrome Canary 并
                <span><a href="https://jinleili.github.io/learn-wgpu-zh/#如何开启浏览器-webgpu-试验功能" class="a">开启 WebGPU
                        实验功能</a></span>
            </div>
        </div>
        <div id="loading" style="display: block;">
            <div style="line-height: 40px;"> WASM 加载中...</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "WasmFullScreen",
    props: {
        wasmName: "",
    },
    data() {
        return {
            timeOutFunctionId: 0,
            missedResizeCount: 0,
            can_resize_canvas: true,
        }
    },
    methods: {
        // Called by rust side
        canvas_resize_completed() {
            this.can_resize_canvas = true;
        },
        dispatch_resize_event() {
            this.can_resize_canvas = false;
            let elem = document.getElementById("simuverse_container");
            if (elem != null) {
                elem.dispatchEvent(new Event("canvas_size_need_change"));
            }
        },
        window_resized() {
            clearTimeout(this.timeOutFunctionId);
            if (this.can_resize_canvas || this.missedResizeCount > 15) {
                this.missedResizeCount = 0;
                // Currently(2022/05/19), Firefox Nightly + winit(v0.27) change canvas size frequently will cause crash
                this.timeOutFunctionId = setTimeout(this.dispatch_resize_event, 300);
            } else {
                // Wait for the rust side to complete canvas resize
                this.missedResizeCount++;
                this.timeOutFunctionId = setTimeout(this.window_resized, 100);
            }
        },
        showAlert() {
            this.hideLoading();
            let alert = document.getElementById("alert");
            if (alert != null) {
                alert.style.display = "block";
            }
        },

        hideLoading() {
            let loading = document.getElementById("loading");
            if (loading != null) {
                loading.style.display = "none";
            }
        },

        async loadSimuverse() {
            const module = await import(`../simuverse/${this.wasmName}.js`);
            module.default().then((instance) => {
                this.hideLoading();
            }, (e) => {
                if (!`${e}`.includes("don't mind me. This isn't actually an error!")) {
                } else {
                }
            });
        },
    },
    async mounted() {
        window.onresize = this.window_resized;
        window.dispatch_resize_event = this.dispatch_resize_event;
        window.canvas_resize_completed = this.canvas_resize_completed;

        if ('navigator' in window && 'gpu' in navigator) {
            navigator.gpu.requestAdapter().then(adapter => {
                // 浏览器支持 WebGPU
                this.loadSimuverse();
            }).catch(error => {
                this.showAlert();
            });
        } else {
            // 浏览器不支持 navigator.gpu
            this.showAlert();
        }
    },
    beforeDestroy() {
        delete window.onresize;
        delete window.dispatch_resize_event;
        delete window.canvas_resize_completed;
    }
}
</script>

<style>
body {
    margin: 0px;
}

.a {
    color: #55aa66
}

#simuverse_container {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #353535;
    min-width: 450px;
    min-height: 500px;
}

#alert,
#loading {
    text-align: center;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    margin-top: 64px;
}
</style>