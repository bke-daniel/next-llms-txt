import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next 16.3+ `next dev` otherwise writes AGENTS.md and CLAUDE.md into this package
  agentRules: false,
  reactStrictMode: true,
  // to handle external images in the footer badges
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
