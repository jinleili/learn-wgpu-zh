import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
    base: '/learn-wgpu-zh/',
    description: '使用 Rust 学习 wgpu',
    plugins: [
        backToTopPlugin(),
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            title: '学习 wgpu',
        },
        'https://sotrh.github.io/learn-wgpu': {
            lang: 'en-US',
        },
    },
    theme: defaultTheme({
        repo: 'jinleili/learn-wgpu-zh',
        repoLabel: '《Learn wgpu》中文版',
        docsDir: 'docs',
        locales: {
            '/': {
                selectLanguageName: '简体中文',
                selectLanguageText: "选择语言",
                lastUpdatedText: '上次更新',
                contributors: false,
                editLink: false,
                backToHome: '回到首页',
                sidebar: [
                    '/README.md',
                    {
                        text: '基础',
                        children: [
                            '/beginner/tutorial1-window/',
                            '/beginner/tutorial2-surface/',
                            '/beginner/tutorial3-pipeline/',
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
                            '/intermediate/tutorial13-threading/',
                        ],
                    },
                    {
                        text: '案例展示',
                        collapsable: true,
                        children: [
                            '/showcase/',
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
            },
            'https://sotrh.github.io/learn-wgpu': {
                selectLanguageName: 'English',
            },
        },
    })
})