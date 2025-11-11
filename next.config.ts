import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: true,
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
}

export default nextConfig
