const withBundleAnalyzer = require('@next/bundle-analyzer');
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ['picsum.photos'],
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
