/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // Memory optimization
    largePageDataBytes: 128 * 1000, // 128KB
    workerThreads: false
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable caching in development to prevent memory issues
      config.cache = false;
      // Reduce memory usage
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig