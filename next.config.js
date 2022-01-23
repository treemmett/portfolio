/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['picsum.photos'],
  },
  reactStrictMode: true,
  webpack: (config) => ({
    ...config,
    experiments: {
      ...config.experiments,
      topLevelAwait: true,
    },
  }),
};
