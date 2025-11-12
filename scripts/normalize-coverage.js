import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { cwd, exit } from 'node:process'

const coveragePath = join(cwd(), 'coverage', 'coverage-summary.json')

if (!existsSync(coveragePath)) {
  console.log('Coverage summary file not found, skipping normalization')
  exit(0)
}

const data = JSON.parse(readFileSync(coveragePath, 'utf8'))

const root = cwd()

const normalized = {}

for (const [key, value] of Object.entries(data)) {
  if (key === 'total') {
    normalized[key] = value
  }
  else {
    const relativePath = relative(root, key)
    normalized[relativePath] = value
  }
}

writeFileSync(coveragePath, JSON.stringify(normalized, null, 2))
console.log('Coverage summary normalized')
