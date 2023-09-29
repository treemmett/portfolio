const withBundleAnalyzer = require('@next/bundle-analyzer');
const { withAxiom } = require('next-axiom');

const IS_VERCEL = typeof process.env.VERCEL !== 'undefined';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
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
  rewrites: async () => [
    {
      destination: '/_vercel/insights/:*rest',
      source: '/va/:*rest',
    },
  ],
  serverRuntimeConfig: {
    root: __dirname,
  },
};

module.exports = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(
  withAxiom(nextConfig),
);
