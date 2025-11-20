import type { LLMsTxtHandlerConfig } from 'next-llms-txt'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig: {
    title: 'next-llms-txt test-server',
    description: 'This is a test server for next-llms-txt\'s e2e tests',
  },
  baseUrl: 'http://localhost:3000',
  autoDiscovery: {
    appDir: 'src/app',
  },
}
export default llmsTxtConfig
