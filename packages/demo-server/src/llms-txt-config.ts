import type { LLMsTxtHandlerConfig } from 'next-llms-txt'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig: {
    title: 'next-llms-txt test-server',
    description: 'This is a test server for next-llms-txt\'s e2e tests',
  },
  autoDiscovery: true
}
export default llmsTxtConfig
