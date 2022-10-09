<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
const { page } = useData()

const GITHUB_REPO = "https://github.com/jinleili/learn-wgpu-zh/tree/master/code/"

const codePath = computed(() => {
    return GITHUB_REPO + page.value.relativePath.replace("index.md", "").replace(".md", "")
})
</script>

<template>
    <div class="auto-github-link">
        <a :href="codePath" target="_blank" rel="noopener noreferrer">
            查看源码！
        </a>
    </div>
</template>

<style>
.auto-github-link {
    margin-top: 1rem;
    line-height: 40px;
}
</style>