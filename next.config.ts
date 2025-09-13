import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for better cache management
  webpack: (config, { dev, isServer }) => {
    // Disable cache in development to avoid serialization warnings
    if (dev) {
      config.cache = false;
    } else {
      // Optimize cache configuration for production only
      if (config.cache) {
        config.cache = {
          ...config.cache,
          maxMemoryGenerations: 1,
          cacheDirectory: config.cache.cacheDirectory,
          buildDependencies: {
            config: [__filename],
            ...config.cache.buildDependencies,
          },
        };
      }
    }

    // Optimize module handling
    config.optimization = {
      ...config.optimization,
      // Better chunk splitting to avoid large strings
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          mantine: {
            test: /[\\/]node_modules[\\/]@mantine[\\/]/,
            name: 'mantine',
            chunks: 'all',
            priority: 20,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
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

  // Production optimizations
  output: "standalone",
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    minimumCacheTTL: 3600,
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
