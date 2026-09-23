// Imports a default export from another file and re-exports it as
// `llmstxt`. Exercises the `resolveDefaultExport` branch in discovery.ts.
import sharedDefault from '../../shared/config'

export const llmstxt = sharedDefault

export default function DefaultExportPage() {
  return null
}
