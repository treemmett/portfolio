const withBundleAnalyzer = require('@next/bundle-analyzer');
const { withAxiom } = require('next-axiom');
const { i18n } = require('./next-i18next.config');

const IS_VERCEL = typeof process.env.VERCEL !== 'undefined';

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: [
      !IS_VERCEL && '127.0.0.1',
      process.env.CDN_URL && new URL(process.env.CDN_URL).host,
    ].filter(Boolean),
    remotePatterns: [
      !IS_VERCEL && {
        hostname: '127.0.0.1',
        port: '9000',
      },
    ].filter(Boolean),
  },
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  rewrites: async () => [
    {
      destination: '/api/rss',
      source: '/rss',
    },
  ],
  serverRuntimeConfig: {
    root: __dirname,
  },
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
            svgo: false,
          },
        },
      ],
    });
    return config;
  },
};

module.exports = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(
  withAxiom(nextConfig)
);
