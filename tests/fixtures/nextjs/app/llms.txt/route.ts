import { createLLmsTxt } from '@/code-version'

export const { GET } = createLLmsTxt({
  title: 'Next.js App Directory Fixture',
  // Enable auto-discovery
  autoDiscovery: {
    baseUrl: 'https://example.com', // Required for generating absolute URLs
  },
})
