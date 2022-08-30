module.exports = {
    base: '/learn-wgpu/',
    title: 'Learn Wgpu',
    theme: 'thindark',
    plugins: {
        'vuepress-plugin-code-copy': true,
        '@vuepress/back-to-top': true,
        'seo': {
        },
    },
    locales: {
        '/': {
            lang: 'English',
        },
        '/zh/': {
            lang: '简体中文',
            title: '学习 Wgpu',
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
        locales: {
            '/': {
                selectText: 'Languages',
                lastUpdatedText: 'Last Updated',
                sidebar: [
                    '/',
                    {
                        title: 'Beginner',
                        collapsable: false,
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
                        title: 'Intermediate',
                        collapsable: false,
                        children: [
                            '/intermediate/tutorial10-lighting/',
                            '/intermediate/tutorial11-normals/',
                            '/intermediate/tutorial12-camera/',
                            // '/intermediate/tutorial13-threading/',
                        ],
                    },
                    {
                        title: 'Showcase',
                        collapsable: true,
                        children: [
                            '/showcase/',
                            '/showcase/windowless/',
                            '/showcase/gifs/',
                            '/showcase/pong/',
                            '/showcase/compute/',
                            '/showcase/alignment/',
                            // '/showcase/imgui-demo/',
                        ]
                    },
                    {
                        title: 'News',
                        collapsable: true,
                        children: [
                            '/news/0.13/',
                            '/news/0.12/',
                            '/news/pre-0.12/',
                        ]
                    }
                ]
            },
            '/zh/': {
                selectText: '选择语言',
                lastUpdatedText: '最后更新',
                sidebar: [
                    '/zh/',
                    {
                        title: '基础',
                        collapsable: false,
                        children: [
                            '/zh/beginner/tutorial1-window/',
                            '/zh/beginner/tutorial2-surface/',
                            '/zh/beginner/tutorial3-pipeline/',
                        ],
                    },
                ]
            },
        },
    }
}