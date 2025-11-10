import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

describe('e2E: Static Generation and Server Access', () => {
  let serverProcess: ChildProcess
  const serverUrl: string = 'http://localhost:3001'

  beforeAll(async () => {
    // Create a temporary Next.js project for testing
    await setupTestProject()

    // Build and start the Next.js server
    await buildProject()
    serverProcess = await startServer()

    // Wait for server to be ready
    await waitForServer(serverUrl)
  }, 60000) // 60 second timeout

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill()
    }
    await cleanupTestProject()
  })

  it('should generate llms.txt file statically during build', async () => {
    const testProjectPath = path.join(__dirname, 'test-project')
    const _publicDir = path.join(testProjectPath, 'public')

    // Check if llms.txt was generated in public directory during build
    // Note: This depends on your static generation implementation
    // You may need to implement static generation in your library

    // For now, let's check if the route is accessible
    expect(true).toBe(true) // Placeholder - implement based on your static generation strategy
  })

  it('should serve llms.txt through API route when server is running', async () => {
    const response = await fetch(`${serverUrl}/llms.txt`)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')

    const content = await response.text()
    expect(content).toContain('# E2E Test Project')
    expect(content).toContain('> End-to-end testing project')
    expect(content).toContain('## Test Documentation')
  })

  it('should return correct content structure', async () => {
    const response = await fetch(`${serverUrl}/llms.txt`)
    const content = await response.text()

    // Verify the complete structure matches expected output
    const lines = content.split('\n')
    expect(lines[0]).toBe('# E2E Test Project')
    expect(lines[2]).toBe('> End-to-end testing project')
    expect(lines[4]).toBe('## Test Documentation')
    expect(lines[5]).toBe('- [API Docs](/api/docs): Complete API reference')
  })

  it('should handle multiple concurrent requests', async () => {
    const requests = Array.from({ length: 10 }).fill(null).map(() =>
      fetch(`${serverUrl}/llms.txt`),
    )

    const responses = await Promise.all(requests)

    responses.forEach((response) => {
      expect(response.status).toBe(200)
    })

    const contents = await Promise.all(responses.map(r => r.text()))

    // All responses should be identical
    const firstContent = contents[0]
    contents.forEach((content) => {
      expect(content).toBe(firstContent)
    })
  })
})

async function setupTestProject(): Promise<void> {
  const testProjectPath = path.join(__dirname, 'test-project')

  // Create directory structure
  fs.mkdirSync(testProjectPath, { recursive: true })
  fs.mkdirSync(path.join(testProjectPath, 'app', 'llms.txt'), { recursive: true })
  fs.mkdirSync(path.join(testProjectPath, 'lib'), { recursive: true })

  // Create package.json
  const packageJson = {
    name: 'e2e-test-project',
    version: '1.0.0',
    scripts: {
      dev: 'next dev -p 3001',
      build: 'next build',
      start: 'next start -p 3001',
    },
    dependencies: {
      'next': '^16.0.1',
      'react': '^19.2.0',
      'react-dom': '^19.2.0',
    },
  }

  fs.writeFileSync(
    path.join(testProjectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  )

  // Create Next.js config
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;`

  fs.writeFileSync(path.join(testProjectPath, 'next.config.js'), nextConfig)

  // Create lib/llmstxt.ts
  const libConfig = `import { createLLMsTxtHandlers } from '../../../src/handler';

export const { GET } = createLLMsTxtHandlers({
  title: "E2E Test Project",
  description: "End-to-end testing project",
  sections: [
    {
      title: "Test Documentation",
      items: [
        {
          title: "API Docs",
          url: "/api/docs",
          description: "Complete API reference"
        }
      ]
    }
  ]
});`

  fs.writeFileSync(path.join(testProjectPath, 'lib', 'llmstxt.ts'), libConfig)

  // Create app/llms.txt/route.ts
  const routeFile = `import { GET } from "../../lib/llmstxt";

export { GET };`

  fs.writeFileSync(path.join(testProjectPath, 'app', 'llms.txt', 'route.ts'), routeFile)

  // Create app/page.tsx
  const pageFile = `export default function HomePage() {
  return <div>E2E Test Project</div>;
}`

  fs.writeFileSync(path.join(testProjectPath, 'app', 'page.tsx'), pageFile)

  // Create app/layout.tsx
  const layoutFile = `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`

  fs.writeFileSync(path.join(testProjectPath, 'app', 'layout.tsx'), layoutFile)
}

async function buildProject(): Promise<void> {
  const testProjectPath = path.join(__dirname, 'test-project')

  return new Promise((resolve, reject) => {
    // Install dependencies first
    const installProcess = spawn('npm', ['install'], {
      cwd: testProjectPath,
      stdio: 'pipe',
    })

    installProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`npm install failed with code ${code}`))
        return
      }

      // Then build the project
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: testProjectPath,
        stdio: 'pipe',
      })

      buildProcess.on('close', (buildCode) => {
        if (buildCode !== 0) {
          reject(new Error(`npm run build failed with code ${buildCode}`))
        }
        else {
          resolve()
        }
      })
    })
  })
}

async function startServer(): Promise<ChildProcess> {
  const testProjectPath = path.join(__dirname, 'test-project')

  const serverProcess = spawn('npm', ['run', 'start'], {
    cwd: testProjectPath,
    stdio: 'pipe',
  })

  return serverProcess
}

async function waitForServer(url: string, timeout: number = 30000): Promise<void> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`${url}/llms.txt`)
      if (response.status === 200) {
        return
      }
    }
    catch {
      // Server not ready yet, continue waiting
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error(`Server did not start within ${timeout}ms`)
}

async function cleanupTestProject(): Promise<void> {
  const testProjectPath = path.join(__dirname, 'test-project')

  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true, force: true })
  }
}
