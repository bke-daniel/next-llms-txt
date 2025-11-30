import type { NextRequest } from 'next/server'
import { BASE_URL } from './constants'

export default function createMockRequest(pathname: string): NextRequest {
  const url = `${BASE_URL}${pathname}`
  return {
    url,
    nextUrl: {
      pathname,
    },
  } as NextRequest
}
