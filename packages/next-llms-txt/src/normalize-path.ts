export default function normalizePath(path: string): string {
  let normalized = path.endsWith('/index')
    ? path.slice(0, -5)
    || '/'
    : path

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}
