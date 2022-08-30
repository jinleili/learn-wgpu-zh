<template>
    <div class="auto-github-link">
        <a :href="link" target="_blank" rel="noopener noreferrer">{{ this.$lang == "English" ? "Check out the code!" :
                "查看源码！"
        }}</a>
        <OutboundLink />
    </div>
</template>

<script>
const GITHUB_REPO = "https://github.com/sotrh/learn-wgpu/tree/master/code"
export default {
    name: "AutoGithubLink",
    computed: {
        link() {
            return GITHUB_REPO + this.$page.path.replace("/zh/", "/");
        }
    }
}
</script>

<style>
.auto-github-link {
    margin-top: 1rem;
}
</style>