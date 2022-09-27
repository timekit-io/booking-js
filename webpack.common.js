const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    booking: {
      import: './src/booking/index.js',
      library: {
        type: 'umd',
        umdNamedDefine: true,
        name: 'TimekitBooking',
      },
    },
    appointments: {
      import: './src/services/index.js',
      library: {
        type: 'umd',
        umdNamedDefine: true,
        name: 'TimekitAppointments',
      },
    }
  },
  resolve: {
    extensions: ['.js']
  },  
  output: {
    clean: true,
    publicPath: '/build/',
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'public/build'),
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
      { test: /\.svg$/, loader: 'svg-inline-loader' },
      {  test: /\.(png|jpg)$/,  loader: 'file-loader' }
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