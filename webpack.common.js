const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    booking: './src/index.js',
  },
  resolve: {
    extensions: ['.js']
  },  
  output: {
    clean: true,
    libraryTarget: 'umd',
    publicPath: '/build/',
    library: 'TimekitBooking',
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist/build'),
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      { test: /\.html$/, loader: 'mustache-loader' },
      { test: /\.svg$/, loader: 'svg-inline-loader' }
    ]
  },  
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
			VERSION: JSON.stringify(packageJson.version),
		}),
    new MiniCssExtractPlugin({
      filename: '[name].min.css'
    })
  ]
};