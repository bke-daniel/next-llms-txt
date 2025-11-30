/**
 * Returns true if the given pathname matches llms.txt or .html.md endpoints.
 */
export function isLLMsTxtPath(pathname: string): boolean {
  return pathname === '/llms.txt' || pathname.endsWith('.html.md')
}
