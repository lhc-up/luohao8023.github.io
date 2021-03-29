module.exports = {
    title: 'FE-Max',
    description: 'FE-Max',
    dest: 'public',
    head: [
        [
            'link',
            {
                rel: 'icon',
                href: '/favicon.icon'
            }
        ],
        [
            'meta',
            {
                name: 'viewport',
                content: 'width=device-width,initial-scale=1,user-scalable=no'
            }
        ]
    ],
    theme: 'reco',
    themeConfig: {
        nav: [
            {
                text: '首页',
                link: '/',
                icon: 'reco-home'
            },
            {
                text: '时间轴',
                link: '/timeline/',
                icon: 'reco-date'
            },
            // {
            //     text: 'Docs',
            //     icon: 'reco-message',
            //     items: [
            //         {
            //             text: 'vuepress-reco',
            //             link: '/docs/theme-reco/'
            //         }
            //     ]
            // },
            {
                text: '关于我',
                icon: 'reco-message',
                items: [
                    {
                        text: 'GitHub',
                        link: 'https://github.com/luohao8023',
                        icon: 'reco-github'
                    }
                ]
            },
        ],
        sidebar: {
            '/docs/theme-reco/': [
                '', 'theme', 'plugin', 'api'
            ]
        },
        type: 'blog',
        fullscreen: true,
        mode: 'light',
        blogConfig: {
            category: {
                location: 2,
                text: '分类'
            },
            tag: {
                location: 3,
                text: '标签'
            }
        },
        friendLink: [
            {
                title: '罗知晏的博客园',
                desc: '正当海晏河清日，便是修文偃武时。',
                email: '--',
                link: 'https://www.cnblogs.com/kakayang/'
            }
        ],
        logo: '/logo.png',
        search: true,
        searchMaxSuggestions: 10,
        lastUpdated: 'Last Updated',
        author: '罗知晏',
        authorAvatar: '/avatar.png',
        record: '京ICP备18037662号',
        startYear: '2018'
    },
    markdown: {
        lineNumbers: true
    },
    plugins: [
        '@vuepress/medium-zoom',
        'flowchart',
        '@vuepress-reco/vuepress-plugin-loading-page',
        '@vuepress/last-updated',
        [
            'cursor-effects',
            {
                size: 2,                    // size of the particle, default: 2
                shape: ['star'],  // shape of the particle, default: 'star'， 可选'circle'
                zIndex: 1314           // z-index property of the canvas, default: 999999999
            }
        ],
        // 动态标题
        [
            'dynamic-title',
            {
                showIcon: '/favicon.ico',
                showText: '天亮请睁眼',
                hideIcon: '/failure.ico',
                hideText: '天黑请闭眼(●—●)',
                recoverTime: 2000
            }
        ],
        ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
            // width: '300px', // 默认 260px
            title: '扫码加我微信',
            body: [
              {
                type: 'image',
                src: '/wechat.jpeg'
              }
            ]
        }]
    ]
}