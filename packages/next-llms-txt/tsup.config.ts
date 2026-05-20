import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  tsconfig: './tsconfig.build.json',
  dts: true,
  splitting: false,
  external: ['react', 'react-dom', 'next', '@babel/parser', '@babel/traverse', '@babel/generator', '@babel/types', 'debug'],
  noExternal: [],
  // No sourcemaps: the published `files` whitelist intentionally ships only
  // `dist/**/*.mjs` + `dist/**/*.d.ts` (minimal ESM surface). Emitting a
  // `.mjs.map` that isn't packaged would leave a dangling `sourceMappingURL`
  // reference in the published artifact.
  sourcemap: false,
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
