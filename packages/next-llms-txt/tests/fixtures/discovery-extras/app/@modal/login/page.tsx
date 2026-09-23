// Parallel route slot: `@modal` is not a URL segment and the page renders
// inside a layout slot. Must NOT be discovered.
export const llmstxt = {
  title: 'Login modal',
  description: 'Should never appear in llms.txt',
}

export default function LoginModalPage() {
  return null
}
