/** Standalone migrate + seed runner (`npm run db:migrate`). Applies the Drizzle
 *  migrations and seeds. Useful against a real Postgres named by DATABASE_URL. */
import { createDb } from './index.js'
import { seed } from './seed.js'

async function main(): Promise<void> {
  const { db, close } = await createDb()
  await seed(db)
  await close()
  // eslint-disable-next-line no-console
  console.log('Migrations applied and database seeded.')
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
