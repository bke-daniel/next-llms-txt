import type { NextRequest } from 'next/server'

export default function createMockRequest(pathname: string): NextRequest {
  const url = `http://localhost:3000${pathname}`
  return {
    url,
    nextUrl: {
      pathname,
    },
  } as NextRequest
}
