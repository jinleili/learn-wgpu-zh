module.exports = {
    base: '/learn-wgpu-zh/',
    title: '学习 wgpu',
    selectText: '切换语言',
    theme: 'thindark',
    plugins: {
        'vuepress-plugin-code-copy': true,
        '@vuepress/back-to-top': true,
        'seo': {
        },
    },
    locales: {
        '/': {
            lang: '简体中文',
        },
        'https://sotrh.github.io/learn-wgpu': {
            lang: 'English',
        },
    },
    themeConfig: {
        author: {
            name: 'Benjamin Hansen',
            twitter: 'https://twitter.com/sotrh760',
        },
        displayAllHeaders: false,
        // lastUpdated: true,
        // lastUpdated: 'Last Updated',
        selectText: '切换语言',
        lastUpdatedText: '最后更新',
        sidebar: [
            '/',
            {
                title: '基础',
                collapsable: false,
                children: [
                    '/zh/beginner/tutorial1-window/',
                    '/zh/beginner/tutorial2-surface/',
                    '/zh/beginner/tutorial3-pipeline/',
                    '/zh/beginner/tutorial4-buffer/',
                    '/zh/beginner/tutorial5-textures/',
                    '/zh/beginner/tutorial6-uniforms/',
                ],
            },
            {
                title: '案例展示',
                collapsable: true,
                children: [
                    '/showcase/',
                    '/showcase/gifs/',
                ]
            },
            '/GLOSSARY_OF_TERMS',
        ]
    }
}