/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['zustand'],
  experimental: {
    // Add case-sensitive paths handling
    caseSensitiveRoutes: true,
    // Improve module resolution
    esmExternals: 'loose'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint checking during build
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Optimizations for Windows paths
    config.resolve.symlinks = false;
    
    // Client-side optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
