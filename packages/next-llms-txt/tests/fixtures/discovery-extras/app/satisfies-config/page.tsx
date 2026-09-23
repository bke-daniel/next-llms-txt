// The idiom the exported `LLMsTxtConfig` type invites.
import type { LLMsTxtConfig } from '../../../../../src/types.js'

export const llmstxt = {
  title: 'Satisfies Config',
  description: 'Declared with `satisfies`',
} satisfies LLMsTxtConfig

export default function SatisfiesConfigPage() {
  return null
}
