import type { LLMsTxtHandlerConfig } from 'next-llms-txt'

const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig: {
    title: 'DEFAULT CONFIG: next-llms-txt app-router-test-server',
    description: 'DEFAULT CONFIG: This is a test server for next-llms-txt\'s app router tests',
  },
  autoDiscovery: true
}
export default llmsTxtConfig
