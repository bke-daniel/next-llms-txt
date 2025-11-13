import type { LLMsTxtHandlerConfig } from '@/code-version'
import path from 'node:path'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig: {
    title: 'next-llms-txt test-server',
    description: 'This is a test server for next-llms-txt\'s e2e tests',
  },
  baseUrl: 'http://localhost:3000',
  autoDiscovery: {
    rootDir: path.resolve(path.dirname('')),
    appDir: '/app',
  },
}
export default llmsTxtConfig
