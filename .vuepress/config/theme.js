// 主题配置
module.exports = {
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
                    text: '关于我',
                    link: '/blogs/me/',
                    icon: 'reco-account'
                },
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
    startYear: '2016',
    // 评论
    valineConfig: {
        appId: '8mPAMyR77Ev7Y6lLNtfunWvD-gzGzoHsz',
        appKey: 'kPTOu7ftlNJxAnoOqFitWcT0'
    }
}