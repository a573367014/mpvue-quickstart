var path = require('path');
var utils = require('./utils');
var config = require('../config');
var webpack = require('webpack');
var merge = require('webpack-merge');
var vueLoaderConfig = require('./vue-loader.conf');
var MpvuePlugin = require('webpack-mpvue-asset-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var WebpackAssetsManifest = require('webpack-assets-manifest');
var MpvueEntry = require('mpvue-entry');

var getPaths = require('../webpack.paths');
var {MANIFEST} = getPaths();

function resolve (dir) {
    return path.join(__dirname, '..', dir);
}

let baseWebpackConfig = {
    // 如果要自定义生成的 dist 目录里面的文件路径，
    // 可以将 entry 写成 {'toPath': 'fromPath'} 的形式，
    // toPath 为相对于 dist 的路径, 例：index/demo，则生成的文件地址为 dist/index/demo.js
    entry: MpvueEntry.getEntry(resolve('src/app.json')),
    target: require('mpvue-webpack-target'),
    output: {
        path: config.build.assetsRoot,
        jsonpFunction: 'webpackJsonpMpvue',
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue: 'mpvue',
            axios: resolve('src/services/axios'),
            '@': resolve('src')
        },
        symlinks: false,
        aliasFields: ['mpvue', 'weapp', 'browser'],
        mainFields: ['browser', 'module', 'main']
    },
    module: {
        rules: [
            {{#lint}}
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [resolve('src'), resolve('test')],
                exclude: [
                    resolve('src/services/pingpp.js'),
                    resolve('src/services/sensors'),
                    resolve('src/utils/sha1'),
                    resolve('src/utils/signature')
                ],
                options: {
                    formatter: require('eslint-friendly-formatter'),
                    fix: true
                }
            },
            {{/lint}}
            {
                test: /\.less$/,
                include: [resolve('src/views'), resolve('src/components')],
                use: [
                    'style-loader',
                    'css-loader?sourceMap&modules&localIdentName=[local]___[hash:base64:7]',
                    'less-loader'
                ]
            },
            {
                test: /\.vue$/,
                use: [{
                    loader: 'mpvue-loader',
                    options: vueLoaderConfig
                }, {
                    loader: path.resolve(__dirname, './platform-loader.js'),
                    options: {
                        keep: process.env.PLATFORM || 'wx',
                        tags: ['wx', 'my', 'tt', 'swan']
                    }
                }]
            },
            {
                test: /\.js$/,
                include: [resolve('src'), resolve('test')],
                use: [
                    'babel-loader',
                    {
                        loader: 'mpvue-loader',
                        options: Object.assign({ checkMPEntry: true }, vueLoaderConfig)
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('media/[name]].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[ext]')
                }
            }
        ]
    },
    plugins: [
        new MpvueEntry(),
        new WebpackAssetsManifest({
            publicPath: '',
            output: MANIFEST,
            merge: false,
            customize: function (key, value, originalValue, manifest) {
                // 过滤图片
                if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(value)) {
                    return {
                        key: key,
                        value: value
                    };
                }
                return false;
            }
        }),
        // api 统一桥协议方案
        new webpack.DefinePlugin({
            'mpvue': 'global.mpvue',
            'mpvuePlatform': JSON.stringify(process.env.PLATFORM || 'wx')
        }),
        new MpvuePlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(config.build.assetsRoot, './static'),
                ignore: ['.*']
            }
        ])
    ]
};

// 针对百度小程序，由于不支持通过 miniprogramRoot 进行自定义构建完的文件的根路径
// 所以需要将项目根路径下面的 project.swan.json 拷贝到构建目录
// 然后百度开发者工具将 dist/swan 作为项目根目录打
const projectConfigMap = {
    tt: '../project.config.json',
    swan: '../project.swan.json'
};

const PLATFORM = process.env.PLATFORM;
if (/^(swan)|(tt)$/.test(PLATFORM)) {
    baseWebpackConfig = merge(baseWebpackConfig, {
        plugins: [
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, projectConfigMap[PLATFORM]),
                to: path.resolve(config.build.assetsRoot)
            }])
        ]
    });
}

module.exports = baseWebpackConfig;
