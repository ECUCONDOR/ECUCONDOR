/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['zustand'],
  experimental: {
    caseSensitiveRoutes: true,
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
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL: process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL,
  },
  // Configure dynamic routes
  async rewrites() {
    return [
      {
        source: '/auth/callback',
        destination: '/api/auth/callback',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Optimizations for Windows paths
    config.resolve.symlinks = false;
    return config;
  }
};

module.exports = nextConfig;
