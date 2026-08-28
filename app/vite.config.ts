import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
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
  server: { port: 5173, host: true },
})
