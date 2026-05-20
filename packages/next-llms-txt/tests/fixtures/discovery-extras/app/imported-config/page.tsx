// Page that re-exports an `llmstxt` config imported from a sibling file.
// Exercises the cross-file resolution path in discovery.ts that follows
// imports through `resolveImportedBinding`.
export { sharedLLmsTxt as llmstxt } from '../../shared/config'

export default function ImportedConfigPage() {
  return null
}
