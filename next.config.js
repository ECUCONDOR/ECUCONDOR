/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Deshabilitando typedRoutes que puede estar causando el problema
    typedRoutes: false,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Add any webpack customizations here
    return config;
  },
  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: true,
  // Strict mode for better development
  reactStrictMode: true,
  // Handle trailing slashes consistently
  trailingSlash: false,
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  // Configuración de páginas
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Configuración de rutas
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
