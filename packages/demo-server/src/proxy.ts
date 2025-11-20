import type { NextRequest } from 'next/server'
import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt'
import { NextResponse } from 'next/server'
import llmsTxtConfig from './llms-txt-config'

const { GET: handleLLmsTxt } = createLLmsTxt(llmsTxtConfig)

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isLLMsTxtPath(pathname))
    return await handleLLmsTxt(request)
  return NextResponse.next()
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
}
