var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var webpack = require('webpack');
var path = require('path');

process.env.NODE_ENV = 'production';

module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },{
            loader: 'sass-loader'
          }
        ])
      },
      {
        test: /\.js$/,
        exclude: '/node-modules',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            minified: true,
          }
        }
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: 'assets',
      toType: 'dir',
    }]),

    new ExtractTextPlugin({
      filename: 'style.css',
      disable: false,
      allChunks: true
    }),

    new HtmlWebpackPlugin({
      title: 'Website Template',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
      template: './src/index.html'
    }),

    new webpack.optimize.UglifyJsPlugin(),

  ]
}
