import type { NextRequest } from 'next/server'
import { NextRequest as NodeNextRequest } from 'next/server'
import { createLLmsTxt } from 'next-llms-txt'
import llmsTxtConfig from '../../../llms-txt-config'

export const runtime = 'nodejs'

const { GET: handleLLmsTxt } = createLLmsTxt(llmsTxtConfig)

export async function GET(request: NextRequest) {
  const originalPath = request.nextUrl.searchParams.get('path') || '/'
  const origin = request.nextUrl.origin
  const rewrittenUrl = new URL(originalPath, origin)
  const nodeReq = new NodeNextRequest(rewrittenUrl, request)
  return handleLLmsTxt(nodeReq)
}
