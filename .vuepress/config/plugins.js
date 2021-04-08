// 插件配置
module.exports = [
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
    // ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
    //     // width: '300px', // 默认 260px
    //     title: '扫码加我微信',
    //     body: [
    //       {
    //         type: 'image',
    //         src: '/wechat.jpeg'
    //       }
    //     ]
    // }]
]