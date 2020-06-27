import 'dotenv/config';
import { ConfigurationFactory } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import { join } from 'path';
import sass from 'sass';

const config: ConfigurationFactory = (env, { mode }) => {
  const prod = mode === 'production';

  return {
    devServer: {
      cert: process.env.SSL_CERT,
      disableHostCheck: true,
      host: '0.0.0.0',
      historyApiFallback: true,
      https: true,
      key: process.env.SSL_KEY,
      open: true,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      proxy: {
        '/api': {
          pathRewrite: {
            '^/api': '',
          },
          target: 'http://localhost:8080',
        },
      },
    },
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          loader: 'awesome-typescript-loader',
          test: /\.tsx?$/,
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: require.resolve('css-loader'),
              options: {
                modules: {
                  localIdentName: prod
                    ? '[hash:base64:6]'
                    : '[path][name]__[local]',
                },
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [autoprefixer],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
              },
            },
          ],
        },
        {
          test: /\.(gif|png|jpe?g)$/i,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 80,
                },
              },
            },
          ],
        },
      ],
    },
    output: {
      filename: 'main.[hash:6].js',
      path: join(__dirname, '/dist'),
      publicPath: '/',
    },

    plugins: [
      new HtmlWebpackPlugin({
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
        template: './src/index.html',
      }),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
  };
};

export default config;
