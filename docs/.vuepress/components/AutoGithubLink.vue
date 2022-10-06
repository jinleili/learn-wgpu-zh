<template>
    <div class="auto-github-link">
        <a :href="link" target="_blank" rel="noopener noreferrer">
            查看源码！
        </a>
        <OutboundLink />
    </div>
</template>

<script>
const GITHUB_REPO = "https://github.com/jinleili/learn-wgpu-zh/tree/master/code"
export default {
    name: "AutoGithubLink",
    computed: {
        link() {
            return GITHUB_REPO + this.$page.path;
        }
    }
}
</script>

<style>
.auto-github-link {
    margin-top: 1rem;
    line-height: 34px;
}
</style>