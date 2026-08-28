import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    // Each test file gets a fresh in-memory PGlite DB, so run serially for
    // deterministic, isolated state.
    fileParallelism: false,
  },
})
