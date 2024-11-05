<template>
    <div id="wgpu-app-container">
        <div v-if="showAlert" style="color: #353535;margin-top: 20px;">
            <div style="line-height: 40px;">此浏览器版本不支持 WebGPU</div>
            <div style="font-size: 16px;color: #999999;">
                请使用 Chrome / Edge 113+，Arc 或者 Safari 18
            </div>
        </div>
        <div v-if="loading">
            正在加载 WASM 模块 ...
        </div>
        <button class="webgpu_example_button" v-if="!exampleStarted" @click="detectWebGPUThenLoad()"
            :disabled="loading">点击运行
            {{ exampleName }}</button>
    </div>
</template>

<script>
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export default {
    name: "WebGPUExample",
    props: {
        example: "",
        autoLoad: true,
        aspectRatio: 1,
    },
    data() {
        return {
            error: "",
            loading: false,
            exampleStarted: false,
            showAlert: false,
        };
    },
    computed: {
        exampleName() {
            return toTitleCase(this.example);
        }
    },
    methods: {
        detectWebGPUThenLoad() {
            if ('navigator' in window && 'gpu' in navigator) {
                navigator.gpu.requestAdapter().then(adapter => {
                    // 浏览器支持 WebGPU
                    this.loadExample();
                }).catch(error => {
                    this.showAlert = true;
                });
            } else {
                // 浏览器不支持 navigator.gpu
                this.showAlert = true;
            }
        },
        async loadExample() {
            this.loading = true;
            this.exampleStarted = true;
            try {
                const url = window.location.protocol + '//' + window.location.host + '/learn-wgpu-zh'
                const module = await import(/* @vite-ignore */`${url}/wasm/${this.example}.js`.replace('_', '-'));
                module.default().then((instance) => {
                    this.wgpuAppLoaded();
                }, (e) => {
                    if (!`${e}`.includes("don't mind me. This isn't actually an error!")) {
                        this.showErr(e);
                    } else {
                        this.wgpuAppLoaded();
                    }
                });

            } catch (e) {
                this.showErr(e);
            }
        },

         wgpuAppLoaded() {
            this.exampleStarted = true;
            this.loading = false;
            // 在模块装载成功后调整容器高度
            const container = document.getElementById('wgpu-app-container');
            if (container) {
                let width = container.getBoundingClientRect().width;
                container.style.height = `${width * this.aspectRatio}px`;
            }
        },

        showErr(err) {
            this.error = `An error occurred loading "${this.example}": ${err}`;
            console.error(err);
            this.exampleStarted = false;
            this.loading = false;
            this.showAlert = true;
        }
    },
    async mounted() {
        if (this.autoLoad) {
            this.detectWebGPUThenLoad();
        }        
    }
};
</script>