import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for better cache management
  webpack: (config, { dev, isServer }) => {
    // Optimize cache configuration
    if (config.cache) {
      config.cache = {
        ...config.cache,
        // Set cache size limits to prevent bloat
        maxMemoryGenerations: dev ? 3 : 1,
        // Optimize cache directory structure
        cacheDirectory: config.cache.cacheDirectory,
        // Add build dependencies for better invalidation
        buildDependencies: {
          config: [__filename],
          ...config.cache.buildDependencies,
        },
        // Optimize serialization to reduce warnings
        compression: 'gzip',
        hashAlgorithm: 'xxhash64',
      };
    }

    // Optimize module concatenation to reduce large strings
    config.optimization = {
      ...config.optimization,
      concatenateModules: !dev,
      // Reduce chunk size to prevent large string serialization
      splitChunks: {
        ...config.optimization?.splitChunks,
        maxSize: dev ? 200000 : 100000, // 200KB in dev, 100KB in prod
        chunks: 'all',
      },
    };

    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },

  // Optimize experimental features
  experimental: {
    // Enable webpack build worker for better performance
    webpackBuildWorker: true,
  },

  // Optimize output for better caching
  output: "standalone",

  // Compress static assets
  compress: true,

  // Optimize images
  images: {
    // Reduce cache TTL to prevent excessive cache growth
    minimumCacheTTL: 3600, // 1 hour instead of default 60 seconds
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
