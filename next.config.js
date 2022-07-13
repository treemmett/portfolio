const withBundleAnalyzer = require('@next/bundle-analyzer');
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    images: {
      allowFutureImage: true,
      remotePatterns: [
        {
          hostname: '127.0.0.1',
          port: '9000',
        },
      ],
    },
  },
  i18n,
  images: {
    domains: ['127.0.0.1', 'tregan.me', 'cdn.tregan.me'],
  },
  reactStrictMode: true,
  /**
   *
   * @param {import('webpack').Configuration} c
   */
  webpack: (c) => {
    const config = c;
    config.experiments.topLevelAwait = true;
    config.module.rules.push({
      issuer: { and: [/\.(js|ts)x?$/] },
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            exportType: 'named',
          },
        },
      ],
    });
    return config;
  },
};

module.exports = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
