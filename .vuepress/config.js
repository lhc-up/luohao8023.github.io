const headConfig = require('./config/head.js');
const themeConfig = require('./config/theme.js');
const pluginsConfig = require('./config/plugins.js');
const markdownConfig = require('./config/markdown.js');
const webpackConfig = require('./config/markdown.js');

module.exports = {
    title: 'FE-Max',
    description: 'FE-Max',
    dest: 'public',
    head: headConfig,
    theme: 'reco',
    themeConfig,
    markdown: markdownConfig,
    plugins: pluginsConfig,
    // configureWebpack: webpackConfig
}