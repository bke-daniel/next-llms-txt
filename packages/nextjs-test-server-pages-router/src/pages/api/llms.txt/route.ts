import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server'
import { createLLmsTxt } from 'next-llms-txt'
import llmsTxtConfig from '../../../llms-txt-config'

const { GET } = createLLmsTxt(llmsTxtConfig)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Convert Next.js API route request to Next.js App Router request format
  const url = `http://${req.headers.host}${req.url}`
  const nextRequest = new NextRequest(url, {
    method: req.method,
  })

  const response = await GET(nextRequest)

  // Convert App Router response to API route response
  const body = await response.text()
  res.status(response.status).setHeader('Content-Type', response.headers.get('Content-Type') || 'text/plain')
  res.send(body)
}
