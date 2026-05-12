import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      browser: 'src/browser.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,
    clean: true,
    treeshake: true,
    target: 'es2020'
  },
  {
    entry: {
      next: 'src/next.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,
    clean: false,
    treeshake: true,
    bundle: false,
    target: 'es2020',
    external: ['inume-devtools/browser', 'react']
  }
])
