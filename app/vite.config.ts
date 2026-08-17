import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5173, host: true },
  build: {
    rollupOptions: {
      output: {
        // Split the two things that otherwise dominate the entry chunk: the
        // framework vendors (loaded once, cached across every route) and the
        // screen code. `routes/index.tsx` reaches every screen through a lazy
        // import, so each `screens-<area>` here is a chunk that loads on the
        // navigation that first needs it — the first paint carries none of it.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // The whole router runtime rides with react: react-router-dom pulls
            // @remix-run/router, and splitting them leaves the two vendor chunks
            // importing each other in a circle.
            if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run\/router)\//.test(id)) {
              return 'react-vendor'
            }
            // ~230 lucide glyphs behind the name-keyed <Icon>; big enough to
            // keep out of the entry and stable enough to cache on its own.
            if (id.includes('/node_modules/lucide-react/')) return 'icons-vendor'
            return 'vendor'
          }
          // App code is left to Rollup's per-dynamic-import splitting: every
          // screen is reached through a lazy import in `routes/index.tsx`, so
          // each lands in its own chunk with shared code hoisted automatically —
          // no hand-drawn folder buckets that cross-import into circular chunks.
          return undefined
        },
      },
    },
  },
})
