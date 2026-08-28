/** Server entrypoint. Initialises the DB (migrations + seed), then listens. */
import { createApp } from './app.js'
import { initDb } from './db/index.js'
import { seed } from './db/seed.js'
import { env, usesPostgres } from './env.js'

async function main(): Promise<void> {
  const db = await initDb()
  await seed(db)

  const app = createApp()
  app.listen(env.PORT, () => {
    const driver = usesPostgres ? 'Postgres (DATABASE_URL)' : 'PGlite (in-memory, zero-setup)'
    // eslint-disable-next-line no-console
    console.log(`SALIS AUTO server on http://localhost:${env.PORT}  ·  driver: ${driver}`)
    // eslint-disable-next-line no-console
    console.log(`Frontend: set VITE_API_BASE_URL=http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err instanceof Error ? err.message : err)
  process.exit(1)
})
