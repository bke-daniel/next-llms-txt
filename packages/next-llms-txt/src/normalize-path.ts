/**
 * Canonical route normaliser used by both the request dispatcher and the
 * discovery walkers. Idempotent and Windows-safe:
 *
 * - Coerces Windows backslashes to forward slashes
 * - Ensures a leading slash
 * - Strips the `/index` suffix (so `/foo/index` → `/foo`)
 * - Strips a trailing slash (except for the root `/`)
 *
 * The single owner here replaces the near-duplicate logic that previously
 * lived in `handle-page-request.ts` and `discovery.ts:normalizeRoute`.
 */
export default function normalizePath(path: string): string {
  if (!path)
    return '/'

  // Windows-safe: incoming paths may use backslashes when constructed via
  // `path.join` from `path.extname` of an `fs.Dirent`.
  let p = path.replace(/\\/g, '/')

  if (!p.startsWith('/'))
    p = `/${p}`

  if (p.endsWith('/index'))
    p = p.slice(0, -6) || '/'

  if (p.length > 1 && p.endsWith('/'))
    p = p.slice(0, -1)

  return p
}
