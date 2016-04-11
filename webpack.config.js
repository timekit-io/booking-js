'use strict';

var webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    devtool: 'source-map',
    output: {
        path: './dist',
        filename: 'hour-widget.js',
        libraryTarget: 'umd',
        library: 'HourWidget'
    },
    externals: {
        'jquery': 'jQuery'
    },
    module: {
        loaders: [
            { test: /\.html$/, loader: 'mustache?noShortcut' },
            { test: /\.css$/, loaders: ['style?singleton', 'css?minimize', 'autoprefixer'] },
            { test: /\.scss$/, loaders: ['style?singleton', 'css?minimize', 'autoprefixer', 'sass'] },
            { test: /\.svg$/, loader: 'svg-inline' }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/)
    ]
};
