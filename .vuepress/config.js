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
                title: '午后南杂',
                desc: 'Enjoy when you can, and endure when you must.',
                email: '1156743527@qq.com',
                link: 'https://www.recoluan.com'
            }
        ],
        logo: '/logo.png',
        search: true,
        searchMaxSuggestions: 10,
        lastUpdated: 'Last Updated',
        author: '罗知晏',
        authorAvatar: '/avatar.png',
        record: 'xxx',
        startYear: '2018'
    },
    markdown: {
        lineNumbers: true
    }
}