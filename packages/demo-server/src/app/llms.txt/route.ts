import { createLLmsTxt } from 'next-llms-txt'
import llmsTxtConfig from '../../llms-txt-config'

export const runtime = 'nodejs'

export const { GET } = createLLmsTxt(llmsTxtConfig)
