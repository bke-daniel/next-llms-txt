import { createLLmsTxt } from 'next-llms-txt'
import llmsTxtConfig from '../../llms-txt-config'

export const { GET } = createLLmsTxt(llmsTxtConfig)
