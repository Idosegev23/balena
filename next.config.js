/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'playwright']
  },
  images: {
    // More secure image configuration for production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.k-online.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'k-online.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'balena.science',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Security headers for production
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig