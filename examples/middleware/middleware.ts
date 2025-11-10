import type { NextRequest } from 'next/server'
import { createLLmsTxt } from 'next-llms-txt'
import { NextResponse } from 'next/server'

const { GET: handleLLmsTxt } = createLLmsTxt({
  autoDiscovery: {
    baseUrl: 'https://example.com',
  },
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Intercept llms.txt and per-page .html.md requests
  if (pathname === '/llms.txt' || pathname.endsWith('.html.md'))
    return await handleLLmsTxt(request)

  return NextResponse.next()
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
}
