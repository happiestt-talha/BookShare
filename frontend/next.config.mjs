/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    domains: ['images.unsplash.com', 'api.bookshare.tech'],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://api.bookshare.tech/uploads/:path*',
      },
    ]
  },
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
}

export default nextConfig