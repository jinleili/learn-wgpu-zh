import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
    base: '/learn-wgpu-zh/',
    description: 'Just playing around',
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
        locales: {
            '/': {
                selectLanguageName: '简体中文',
                selectLanguageText: "选择语言",
                lastUpdatedText: '上次更新',
                contributorsText: '贡献者',
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
                        ],
                    },
                    {
                        text: '进阶',
                        children: [
                        ],
                    },
                    {
                        text: '案例展示',
                        children: [
                            '/showcase/',
                            '/showcase/gifs/',
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