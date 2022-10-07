import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'

import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
// import { searchPlugin } from '@vuepress/plugin-search'
import { docsearchPlugin } from "@vuepress/plugin-docsearch";

// import { webpackBundler } from '@vuepress/bundler-webpack'
import { webpackBundler } from 'vuepress-webpack'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
    base: '/learn-wgpu-zh/',
    description: '使用 Rust 学习 wgpu',
    plugins: [
        backToTopPlugin(),
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
        // searchPlugin({
        //     locales: {
        //         '/': {
        //             placeholder: '搜索',
        //         },
        //     },
        // }),
        docsearchPlugin({
            appId: "Q0PA0L042P",
            apiKey: "67756efd9c1a012a2c2f5edd0d26222b",
            indexName: "learn_wgpu_zh",
            locales: {
                "/": {
                    placeholder: "搜索文档",
                    translations: {
                        button: {
                            buttonText: "搜索文档",
                            buttonAriaLabel: "搜索文档",
                        },
                        modal: {
                            searchBox: {
                                resetButtonTitle: "清除查询条件",
                                resetButtonAriaLabel: "清除查询条件",
                                cancelButtonText: "取消",
                                cancelButtonAriaLabel: "取消",
                            },
                            startScreen: {
                                recentSearchesTitle: "搜索历史",
                                noRecentSearchesText: "没有搜索历史",
                                saveRecentSearchButtonTitle: "保存至搜索历史",
                                removeRecentSearchButtonTitle: "从搜索历史中移除",
                                favoriteSearchesTitle: "收藏",
                                removeFavoriteSearchButtonTitle: "从收藏中移除",
                            },
                            errorScreen: {
                                titleText: "无法获取结果",
                                helpText: "你可能需要检查你的网络连接",
                            },
                            footer: {
                                selectText: "选择",
                                navigateText: "切换",
                                closeText: "关闭",
                                searchByText: "搜索提供者",
                            },
                            noResultsScreen: {
                                noResultsText: "无法找到相关结果",
                                suggestedQueryText: "你可以尝试查询",
                                reportMissingResultsText: "你认为该查询应该有结果？",
                                reportMissingResultsLinkText: "点击反馈",
                            },
                        },
                    },
                },
            },
        }),
    ],
    // vite + vite-plugin-wasm | vite-plugin-rsw 在加载 wasm 时都会报错
    // 目前只有使用 webpack 能成功加载 wasm 模块（20220917）
    bundler: webpackBundler({
        configureWebpack: (config, isServer, isBuild) => {
            config.experiments = { syncWebAssembly: true };
        },
        sass: {}
    }),
    locales: {
        '/': {
            lang: 'zh-CN',
            title: '学习 wgpu',
        },
        'https://sotrh.github.io/learn-wgpu/': {
            lang: 'en-US',
        },
    },
    theme: defaultTheme({
        repo: 'jinleili/learn-wgpu-zh',
        repoLabel: 'GitHub',
        docsDir: 'docs',
        logo: '/res/wgpu-logo.png',
        lastUpdatedText: '上次更新',
        contributors: false,
        editLink: false,
        backToHome: '回到首页',
        selectLanguageText: "选择语言",
        locales: {
            '/': {
                selectLanguageName: '简体中文',
            },
            'https://sotrh.github.io/learn-wgpu/': {
                selectLanguageName: 'English',
            },
        },
        sidebar: [
            '/README.md',
            {
                text: '基础',
                children: [
                    '/beginner/tutorial1-window/',
                    '/beginner/tutorial2-surface/',
                    '/beginner/tutorial3-pipeline/',
                    // '/beginner/wgsl/',
                    '/beginner/tutorial4-buffer/',
                    '/beginner/tutorial5-textures/',
                    '/beginner/tutorial6-uniforms/',
                    '/beginner/tutorial7-instancing/',
                    '/beginner/tutorial8-depth/',
                    '/beginner/tutorial9-models/',
                ],
            },
            {
                text: '进阶',
                children: [
                    '/intermediate/tutorial10-lighting/',
                    '/intermediate/tutorial11-normals/',
                    '/intermediate/tutorial12-camera/',
                    // '/intermediate/tutorial13-terrain/',
                ],
            },
            {
                text: '集成与调试',
                children: [
                    '/integration-and-debugging/',
                    '/integration-and-debugging/ios/',
                    '/integration-and-debugging/android/',
                    '/integration-and-debugging/xcode/',
                    '/integration-and-debugging/snapdragon-profiler/',
                ],
            },
            {
                text: '案例展示',
                collapsible: true,
                children: [
                    '/showcase/windowless/',
                    '/showcase/gifs/',
                    '/showcase/pong/',
                    '/showcase/compute/',
                    '/showcase/alignment/',
                    '/showcase/imgui-demo/',
                ]
            },
            '/GLOSSARY_OF_TERMS.md',
        ]
    })
})