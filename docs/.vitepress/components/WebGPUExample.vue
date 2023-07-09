<template>
    <div v-bind:id="example">
         <div v-if="showAlert" style="color: #353535;margin-top: 20px;">
            <div style="line-height: 40px;">此浏览器版本不支持 WebGPU</div>
            <div style="font-size: 16px;color: #999999;">请使用 Chrome/Microsoft Edge 113 及以上版本，或者 Chrome/Edge Canary, FireFox Nightly 并
                <span><a href="https://jinleili.github.io/learn-wgpu-zh/#如何开启浏览器-webgpu-试验功能" class="a">开启 WebGPU
                        实验功能</a></span>
            </div>
        </div>
        <div v-if="loading">
            正在加载 WASM 模块 ...
        </div>
        <button class="webgpu_example_button" v-if="!exampleStarted" @click="detectWebGPUThenLoad()" :disabled="loading">点击运行
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
                const module = await import(/* @vite-ignore */`./wasm/${this.example}.js`.replace('_', '-'));
                module.default().then((instance) => {
                    this.loading = false;
                    this.exampleStarted = true;
                }, (e) => {
                    if (!`${e}`.includes("don't mind me. This isn't actually an error!")) {
                        this.showErr(e);
                    } else {
                        this.exampleStarted = true;
                        this.loading = false;
                    }
                });

            } catch (e) {
                this.showErr(e);
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