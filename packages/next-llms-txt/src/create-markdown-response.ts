import { NextResponse } from 'next/server'

export default function createMarkdownResponse(content: string): NextResponse {
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // TODO make the configurable
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
