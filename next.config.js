/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    appDir: true
  },
  distDir: '.next',
  dir: '.'
}

module.exports = nextConfig
