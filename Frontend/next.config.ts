import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    const api = (process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1').replace(/\/$/, '')
    return [{ source: '/api/v1/:path*', destination: `${api}/:path*` }]
  },
}

export default nextConfig
