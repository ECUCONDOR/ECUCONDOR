// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Elimina o comenta esta línea
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
