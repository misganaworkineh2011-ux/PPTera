import "./src/env.js";

import type { NextConfig } from "next";

const config: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // External packages with native bindings (for API routes)
  serverExternalPackages: ["@resvg/resvg-js", "sharp"],
  
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@clerk/nextjs',
      'recharts',
      'react-icons',
    ],
  },
  
  // Compression for responses
  compress: true,
  
  // Permanent redirects for SEO (301 instead of 307)
  async redirects() {
    return [
      // Redirect non-www to www (permanent 301)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pptmaster.app',
          },
        ],
        destination: 'https://www.pptmaster.app/:path*',
        permanent: true,
      },
    ];
  },
  
  // Optimize images
  images: {
    domains: ["images.unsplash.com", "images.pexels.com", "img.clerk.com", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Art style preview images
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.sculpteo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "russell-collection.com",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Reduce bundle size with code splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];
              return `npm.${packageName?.replace('@', '')}`;
            },
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
};

export default config;
