import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.endsWith('.html.md')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/llms-md'
    url.searchParams.set('path', pathname)
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*.html.md'],
}
