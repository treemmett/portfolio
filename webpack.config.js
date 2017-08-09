var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var isProd = process.env.NODE_ENV.trim() == 'production';

var cssDev = ['style-loader', 'css-loader', 'sass-loader'];
var cssProd = ExtractTextPlugin.extract(['css-loader', 'sass-loader']);

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: isProd ? cssProd : cssDev
      }
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    hot: true,
    stats: 'errors-only'
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: 'assets',
      toType: 'dir',
    }]),

    new ExtractTextPlugin({
      filename: 'style.css',
      disable: !isProd,
      allChunks: true
    }),

    new HtmlWebpackPlugin({
      title: 'Website Template',
      minify: {
        collapseWhitespace: isProd,
        removeComments: isProd,
      },
      template: './src/index.html'
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),

  ]
}
