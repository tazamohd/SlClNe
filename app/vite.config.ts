import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { SECURITY_HEADERS } from './security-headers.mjs'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@contract': fileURLToPath(new URL('../packages/contract/src/index', import.meta.url)),
      zod: fileURLToPath(new URL('./node_modules/zod', import.meta.url)),
    },
  },
  build: {
    // Modern browsers only — enables smaller output (no async/await transforms,
    // native optional chaining, nullish coalescing, etc.).
    target: 'es2022',
    // Screens are route-split via React.lazy, so the remaining large modules are
    // the shared vendor deps. Split them into stable, cache-friendly chunks so a
    // screen change never re-downloads React et al.
    rollupOptions: {
      output: {
        // Path-matched so transitive deps (e.g. react-dom pulled in by
        // react-router) land in the right vendor chunk instead of leaking into
        // the entry. Order matters: react is checked before react-router so the
        // shared react runtime stays in react-vendor.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return 'react-vendor'
          if (/[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run[\\/]router)[\\/]/.test(id))
            return 'router-vendor'
          if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return 'query-vendor'
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons-vendor'
          if (/[\\/]node_modules[\\/]zustand[\\/]/.test(id)) return 'state-vendor'
          return 'vendor'
        },
      },
    },
    // Route + vendor splitting keeps chunks small; nudge the warning threshold
    // down so a future oversized chunk still surfaces.
    chunkSizeWarningLimit: 600,
  },
  /** `preview` serves the built app, and the E2E suite runs against it — so
   *  applying the production headers here means the Playwright specs exercise
   *  the real Content-Security-Policy on every run. A directive tight enough to
   *  break the app fails a test instead of reaching a user. `dev` is left
   *  unrestricted: Vite's HMR client injects inline script, so a production CSP
   *  there would block the dev server and teach everyone to disable it. */
  preview: { port: 4173, headers: SECURITY_HEADERS },
  server: { port: 5173, host: true },
})
