import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  tsconfig: './tsconfig.build.json',
  // tsup injects `baseUrl` into its dts build, which TypeScript 6 reports as
  // deprecated (TS5101). The override lives here instead of tsconfig.build.json
  // because TypeScript 5.9 rejects the value (TS5103) and that tsconfig is
  // shared by the TypeScript version matrix in CI.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  splitting: false,
  external: ['react', 'react-dom', 'next', '@babel/parser', '@babel/traverse', '@babel/types', 'debug'],
  noExternal: [],
  // No sourcemaps: the published `files` whitelist intentionally ships only
  // `dist/**/*.mjs` + `dist/**/*.d.ts` (minimal ESM surface). Emitting a
  // `.mjs.map` that isn't packaged would leave a dangling `sourceMappingURL`
  // reference in the published artifact (also audit P1 #21:
  // information-disclosure + tarball-size hygiene).
  sourcemap: false,
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
