import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'

import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { searchPlugin } from '@vuepress/plugin-search'

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
        searchPlugin({
            locales: {
                '/': {
                    placeholder: '搜索',
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