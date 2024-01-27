<template>
  <div id="wasm-example">
    <div class="error" v-if="error">
      {{ error }}
    </div>
    <div class="loading" v-if="loading">
      正在加载 WASM 模块 ...
    </div>
    <button v-if="!exampleStarted" @click="loadExample()" :disabled="loading">点此运行
      {{ exampleName }} 示例</button>
  </div>
</template>

<script>
// Found at https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export default {
  name: "WasmExample",
  props: {
    example: "",
    autoLoad: false,
  },
  data() {
    return {
      error: "",
      loading: false,
      exampleStarted: false,
    };
  },
  computed: {
    exampleName() {
      return toTitleCase(this.example);
    }
  },
  methods: {
    async loadExample() {
      this.loading = true;
      this.exampleStarted = true;
      try {
        const url = window.location.protocol +'//'+ window.location.host + '/learn-wgpu-zh'
        const module = await import(/* @vite-ignore */`${url}/wasm/${this.example}.js`.replace('_', '-'));
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
    }
  },
  async mounted() {
    await this.$nextTick()
    if (this.autoLoad) {
      await this.loadExample()
    }
  }
};
</script>

<style>
#wasm-example canvas {
  background-color: black;
}

#wasm-example button {
  height: 33px;
  font-size: 14px;
  padding: 0px 8px;
  border: 1px solid rgba(60, 60, 60, 0.15);
  border-radius: 8px;
}

#wasm-example button:hover {
  border-color: #059669;
}
</style>