var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

process.env.NODE_ENV = 'development';

module.exports = {
  entry: {
    app: './src/index.js',
    hotReload: './config/hot.js'
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: false,
    hot: true,
    proxy:{
      '/api': {
        target: 'https://tregan.me',
        secure: true,
        changeOrigin: true
      }
    },
    stats: 'errors-only'
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: 'assets',
      toType: 'dir',
    }]),

    new HtmlWebpackPlugin({
      title: 'Website Template',
      minify: {
        collapseWhitespace: false,
        removeComments: false,
      },
      template: './src/index.html'
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),

  ]
}
