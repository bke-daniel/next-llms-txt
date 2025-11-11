import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createLLmsTxt } from '@/code-version'

const { GET: handleLLmsTxt } = createLLmsTxt({
  baseUrl: 'http://localhost:3000',
  autoDiscovery: {
    baseUrl: 'http://localhost:3000',
    appDir: 'app', // must be set in our case because there's no src dir
  },
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/llms.txt' || pathname.endsWith('.html.md')) {
    return await handleLLmsTxt(request)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
}
