import type { LLMsTxtHandlerConfig } from '@/code-version'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  autoDiscovery: {
    pageTitle: 'next-llms-txt test-server',
    pageDescription: 'This is a test server for next-llms-txt\'s e2e tests',
    baseUrl: 'http://localhost:3000',
  },
}

export default llmsTxtConfig
