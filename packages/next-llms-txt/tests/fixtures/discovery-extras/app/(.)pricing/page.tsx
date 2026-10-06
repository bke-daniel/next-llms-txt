// Intercepting route: renders inside another page, never at its own URL.
// Must NOT be discovered.
export const llmstxt = {
  title: 'Intercepted pricing',
  description: 'Should never appear in llms.txt',
}

export default function InterceptedPricingPage() {
  return null
}
