import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@babel/parser'
import * as t from '@babel/types'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('lLMsTxtAutoDiscovery.extractObjectExpression', () => {
  const fixturePath = path.resolve(__dirname, '../fixtures/nextjs/app/full-test/page.tsx')
  let ast: t.File
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(fixturePath, 'utf-8')
    ast = parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
  })

  it('extracts all keys from llmstxt object', () => {
    let llmstxtNode: t.Expression | null = null
    // Find the llmstxt export
    ast.program.body.forEach((node) => {
      if (
        t.isExportNamedDeclaration(node)
        && node.declaration
        && t.isVariableDeclaration(node.declaration)
      ) {
        node.declaration.declarations.forEach((decl) => {
          if (t.isIdentifier(decl.id) && decl.id.name === 'llmstxt') {
            // @ts-expect-error - Fine for test purposes
            llmstxtNode = decl.init
          }
        })
      }
    })
    expect(llmstxtNode).toBeTruthy()
    const autoDiscovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)
    const result = autoDiscovery.extractObjectExpression(llmstxtNode, ast, fixturePath)
    expect(result).toHaveProperty('title', 'Test LLMs.txt')
    expect(result).toHaveProperty('description', 'This is a test llms.txt file')
    expect(result).toHaveProperty('sections')
    expect(Array.isArray(result.sections)).toBe(true)
    expect(result.sections[0]).toHaveProperty('title', 'Main Section')
    expect(result.sections[0]).toHaveProperty('items')
    expect(result.sections[0].items[0]).toHaveProperty('title', 'Item One')
    expect(result.sections[0].items[1]).toHaveProperty('title', 'Item Two')
    expect(result).toHaveProperty('optional')
    expect(Array.isArray(result.optional)).toBe(true)
    expect(result.optional[0]).toHaveProperty('title', 'Optional Item')
  })

  it('extracts llmstxt object without type annotation', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/nextjs/app/llms-txt-only/page.tsx')
    const fileContent = fs.readFileSync(fixturePath, 'utf-8')
    const ast = parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    let llmstxtNode: t.Expression | null = null
    ast.program.body.forEach((node) => {
      if (
        t.isExportNamedDeclaration(node)
        && node.declaration
        && t.isVariableDeclaration(node.declaration)
      ) {
        node.declaration.declarations.forEach((decl) => {
          if (t.isIdentifier(decl.id) && decl.id.name === 'llmstxt') {
            // @ts-expect-error - Fine for test purposes
            llmstxtNode = decl.init
          }
        })
      }
    })
    expect(llmstxtNode).toBeTruthy()
    const autoDiscovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)
    const result = autoDiscovery.extractObjectExpression(llmstxtNode, ast, fixturePath)
    expect(result).toHaveProperty('title', 'This is the llmstxt export')
    expect(result).toHaveProperty('description', 'Is used for generation when it exists.')
    expect(result.sections).toBeUndefined()
    expect(result.optional).toBeUndefined()
  })

  it('returns undefined for page with only metadata export', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/nextjs/app/metadata-only/page.tsx')
    const fileContent = fs.readFileSync(fixturePath, 'utf-8')
    const ast = parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    let llmstxtNode: t.Expression | null = null
    ast.program.body.forEach((node) => {
      if (
        t.isExportNamedDeclaration(node)
        && node.declaration
        && t.isVariableDeclaration(node.declaration)
      ) {
        node.declaration.declarations.forEach((decl) => {
          if (t.isIdentifier(decl.id) && decl.id.name === 'llmstxt') {
            // @ts-expect-error - Fine for test purposes
            llmstxtNode = decl.init
          }
        })
      }
    })
    expect(llmstxtNode).toBeNull()
  })

  it('returns undefined for page with no exports at all', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/nextjs/app/no-exports/page.tsx')
    const fileContent = fs.readFileSync(fixturePath, 'utf-8')
    const ast = parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    let llmstxtNode: t.Expression | null = null
    ast.program.body.forEach((node) => {
      if (
        t.isExportNamedDeclaration(node)
        && node.declaration
        && t.isVariableDeclaration(node.declaration)
      ) {
        node.declaration.declarations.forEach((decl) => {
          if (t.isIdentifier(decl.id) && decl.id.name === 'llmstxt') {
            // @ts-expect-error - Fine for test purposes
            llmstxtNode = decl.init
          }
        })
      }
    })
    expect(llmstxtNode).toBeNull()
  })
})
