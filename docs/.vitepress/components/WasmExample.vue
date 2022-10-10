<template>
  <div id="wasm-example">
    <div class="error" v-if="error">
      {{ error }}
    </div>
    <button v-if="!exampleStarted && !autoLoad" @click="loadExample()" :disabled="loading">点击运行
      {{exampleName}}</button>
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
      try {
        const module = await import(`./wasm/${this.example}.js`.replace('_', '-'));
        module.default();
      } catch (e) {
        // 此处无法捕捉到发生在运行时的可忽略Error：
        // Unhandled Promise Rejection: Error: Using exceptions for control flow, don't mind me. This isn't actually an error!
        if (!`${e}`.includes("don't mind me. This isn't actually an error!")) {
          this.error = `An error occurred loading "${this.example}": ${e}`;
          console.error(e);
          this.exampleStarted = false;
        } else {
          this.exampleStarted = true;
        }
      }
      this.exampleStarted = true;
      this.loading = false;
    },
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
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
}

#wasm-example button:hover {
  border-color: var(--vp-c-brand-dark);
}
</style>