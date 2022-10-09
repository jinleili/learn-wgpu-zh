import { defineConfig } from 'vitepress'

export default defineConfig({
    // https://vitepress.vuejs.org/config/app-configs
    lang: 'zh-CN',
    title: '学习 wgpu',
    description: '使用 Rust 学习 wgpu',
    base: '/learn-wgpu-zh/',
    appearance: true,
    lastUpdated: true,
    cleanUrls: 'without-subfolders',
    markdown: {
        lineNumbers: true,
        headers: {
            level: [0, 2]
        }
    },

    themeConfig: {
        logo: '/res/wgpu-logo.png',
        lastUpdatedText: '上次更新',
        backToHome: '回到首页',
        selectLanguageText: "选择语言",
        socialLinks: [
            { icon: 'github', link: 'https://github.com/jinleili/learn-wgpu-zh' }
        ],
        outline: false,
        outlineTitle: '本页大纲',
        nav: [],
        sidebar: {
            '/': sidebarConfig(),
        },

        // algolia: {
        //     appId: "Q0PA0L042P",
        //     apiKey: "67756efd9c1a012a2c2f5edd0d26222b",
        //     indexName: "learn_wgpu_zh",
        // },
    }
})


function sidebarConfig() {
    return [
        { text: '介绍', items: [] },
        {
            text: '基础',
            collapsible: true,
            items: [
                { text: 'Introduction', link: '/beginner/tutorial1-window' },
                {
                    text: '', link: '/beginner/tutorial2-surface/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial3-pipeline/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial4-buffer/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial5-textures/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial6-uniforms/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial7-instancing/'
                },
                {
                    text: 'Introduction', link: '/beginner/tutorial8-depth/'
                },
                { text: 'xx', link: '/beginner/tutorial9-models/' },
            ]
        },
        {
            text: '进阶',
            collapsible: true,
            items: [
                {
                    text: 'xx', link: '/intermediate/tutorial10-lighting/'
                },
                {
                    text: 'xx', link: '/intermediate/tutorial11-normals/'
                },
                { text: 'xx', link: '/intermediate/tutorial12-camera/' },
                // '/intermediate/tutorial13-terrain/',
            ],
        },
        {
            text: '集成与调试',
            collapsible: true,
            items: [
                {
                    text: 'xx', link: '/integration-and-debugging/'
                },
                {
                    text: 'xx', link: '/integration-and-debugging/ios/'
                },
                {
                    text: 'xx', link: '/integration-and-debugging/android/'
                },
                {
                    text: 'xx', link: '/integration-and-debugging/xcode/'
                },
                { text: 'xx', link: '/integration-and-debugging/snapdragon-profiler/' },
            ],
        },
        {
            text: '案例展示',
            collapsible: true,
            items: [
                {
                    text: 'xx', link: '/showcase/windowless/'
                },
                {
                    text: 'xx', link: '/showcase/gifs/'
                },
                {
                    text: 'xx', link: '/showcase/pong/'
                },
                {
                    text: 'xx', link: '/showcase/compute/'
                },
                {
                    text: 'xx', link: '/showcase/alignment/'
                },
                { text: 'xx', link: '/showcase/imgui-demo/' },
            ]
        },
        // { text: 'xx', link: '/GLOSSARY_OF_TERMS' },
    ]
}