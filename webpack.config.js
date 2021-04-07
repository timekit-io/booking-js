'use strict';

var webpack = require('webpack');
var packageJson = require('./package.json');

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: './src/main.js',
	output: {
		libraryTarget: 'umd',
		filename: 'booking.js',
		library: 'TimekitBooking',
		path: __dirname + '/dist',
	},
	externals: {
		jquery: {
			root: 'jQuery',
			commonjs: 'jquery',
			commonjs2: 'jquery',
			amd: 'jquery',
		},
	},
	module: {
		rules: [
			{ test: /\.html$/, loader: 'mustache-loader?noShortcut' },
			{
				test: /\.css$/,
				loaders: [
					{
						loader: 'style-loader',
						options: { injectType: 'singletonStyleTag' },
					},
					'css-loader',
					'postcss-loader',
				],
			},
			{
				test: /\.scss$/,
				loaders: [
					{
						loader: 'style-loader',
						options: { injectType: 'singletonStyleTag' },
					},
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
			{ test: /\.svg$/, loader: 'svg-inline-loader' },
		],
	},
	plugins: [
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(packageJson.version),
		}),
		new webpack.ProvidePlugin({
			Promise: 'es6-promise-promise',
		}),
	],
};
