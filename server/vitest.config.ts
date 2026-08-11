import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@salis/contract/rules': fileURLToPath(
        new URL('../packages/contract/src/rules/index.ts', import.meta.url),
      ),
      '@salis/contract': fileURLToPath(
        new URL('../packages/contract/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    /** The integration suites share one database; running them in parallel
     *  would have them resetting the schema underneath each other. */
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
