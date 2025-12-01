import type { LLMsTxtHandlerConfig } from '@/code-version'
import path from 'node:path'
import { BASE_URL } from '../../constants.js'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig: {
    title: 'next-llms-txt test-server',
    description: 'This is a test server for next-llms-txt\'s e2e tests',
  },
  baseUrl: BASE_URL,
  autoDiscovery: {
    rootDir: path.resolve(path.dirname('')),
    appDir: '/app',
  },
}
export default llmsTxtConfig
