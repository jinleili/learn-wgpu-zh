<template>
    <div class="auto-github-link">
        <a :href="codePath" target="_blank" rel="noopener noreferrer">
            查看源码！
        </a>
    </div>
</template>

<script lang="ts">
import { useData } from 'vitepress'

export default {
    name: "AutoGithubLink",
    props: {
        customCodePath: "",
    },
    data() {
        return {
            codePath: "",
        };
    },
    mounted() {
        const GITHUB_REPO = "https://github.com/jinleili/learn-wgpu-zh/tree/master/code/"
        const { page } = useData()

        if (!this.customCodePath || this.customCodePath == "") {
            this.codePath = GITHUB_REPO + page.value.relativePath.replace("index.md", "").replace(".md", "");
        } else {
            this.codePath = GITHUB_REPO + this.customCodePath;
        }
    }
};
</script>


<style>
.auto-github-link {
    margin-top: 1rem;
    line-height: 40px;
}
</style>