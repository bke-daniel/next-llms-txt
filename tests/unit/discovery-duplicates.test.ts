import type { PageInfo } from '../../src/discovery'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import {
  ALL_ROUTES,
  AUTO_DISCOVERY,
} from '../constants.js'

describe.skip('discovery duplicate prevention', () => {
  const discovery = new LLMsTxtAutoDiscovery(AUTO_DISCOVERY)
  let pages: PageInfo[] = []

  beforeEach(async () => {
    pages = await discovery.discoverPages()
  })

  it('should generate all page entries as expected', async () => {
    // plus one for the index.html.md
    expect(pages.length).toBe(ALL_ROUTES.length + 1)
  })

  describe('test generate page infos', () => {
    // expect(pages.length).toBe(7)

    it('should properly generate page info for /all-exports', () => {
      // expect(pages).toContain([])
      const allExportsPageInfo = pages.find(p => p.route === '/all-exports')
      expect(allExportsPageInfo).toBeDefined()
      expect(allExportsPageInfo?.hasLLMsTxtExport).toBe(true)
    })
  })

  describe('.html.md files', () => {
    it('should not create duplicate entries for .html.md files', async () => {
      // Count how many times each route appears
      const routeCounts = pages.reduce((acc, page) => {
        acc[page.route] = (acc[page.route] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // No route should appear more than once
      Object.entries(routeCounts).forEach(([route, count]) => {
        expect(count).toBe(1)
        if (count > 1) {
          console.error(`Route ${route} appears ${count} times`)
        }
      })
    })

    it('should only discover page.tsx files, not .html.md files', async () => {
      // All discovered pages should be from page.tsx files
      pages.forEach((page) => {
        expect(page.filePath).toMatch(/page\.tsx?$/)
        expect(page.filePath).not.toMatch(/\.html\.md$/)
      })
    })
  })

  describe('route uniqueness', () => {
    it('should discover unique routes only', async () => {
      const routes = pages.map(p => p.route)
      const uniqueRoutes = [...new Set(routes)]

      expect(routes.length).toBe(uniqueRoutes.length)
    })

    it('should map each page.tsx to exactly one route', async () => {
      const pages = await discovery.discoverPages()

      // Build a map of routes to file paths
      const routeToFile: Record<string, string[]> = {}
      pages.forEach((page) => {
        if (!routeToFile[page.route]) {
          routeToFile[page.route] = []
        }
        routeToFile[page.route].push(page.filePath)
      })

      // Each route should have exactly one file
      Object.entries(routeToFile).forEach(([route, files]) => {
        expect(files.length).toBe(1)
        if (files.length > 1) {
          console.error(`Route ${route} maps to multiple files:`, files)
        }
      })
    })
  })

  describe('special folders', () => {
    it('should skip route groups (folders starting with parentheses)', async () => {
      // No routes should contain (group) syntax
      pages.forEach((page) => {
        expect(page.route).not.toMatch(/\([^)]+\)/)
      })
    })

    it('should skip private folders (folders starting with _)', async () => {
      // No routes should contain _ prefix
      pages.forEach((page) => {
        expect(page.route).not.toMatch(/\/_/)
        expect(page.filePath).not.toMatch(/\/_[^/]+\/page\.tsx/)
      })
    })
  })
})
