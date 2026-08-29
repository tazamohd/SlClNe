/** Database bootstrap with a driver strategy that runs headless with no
 *  external DB.
 *
 *  - DATABASE_URL set  → real Postgres via node-postgres (`pg`).
 *  - DATABASE_URL unset → PGlite, an in-memory Postgres (WASM). Zero setup, so
 *    `npm run dev`, tests and a reviewer's first run all work immediately.
 *
 *  Both share the single Drizzle schema in schema.ts. */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite'
import { drizzle as drizzleNodePg, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator'
import { migrate as migrateNodePg } from 'drizzle-orm/node-postgres/migrator'
import { PGlite } from '@electric-sql/pglite'
import { Pool } from 'pg'
import * as schema from './schema.js'
import { env, usesPostgres } from '../env.js'

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'drizzle')

export type Db = PgliteDatabase<typeof schema> | NodePgDatabase<typeof schema>

let dbInstance: Db | null = null
let closeFn: (() => Promise<void>) = async () => {}

/** Build a fresh database handle. `dataDir` lets callers pin PGlite to memory
 *  ('memory://', the default) or a path; tests pass unique in-memory instances. */
export async function createDb(dataDir = 'memory://'): Promise<{ db: Db; close: () => Promise<void> }> {
  if (usesPostgres) {
    const pool = new Pool({ connectionString: env.DATABASE_URL })
    const db = drizzleNodePg(pool, { schema })
    await migrateNodePg(db, { migrationsFolder })
    return { db, close: async () => { await pool.end() } }
  }
  const client = new PGlite(dataDir)
  const db = drizzlePglite(client, { schema })
  await migratePglite(db, { migrationsFolder })
  return { db, close: async () => { await client.close() } }
}

/** Process-wide singleton used by the running server. Tests build their own via
 *  createDb() for isolation. */
export async function initDb(): Promise<Db> {
  if (dbInstance) return dbInstance
  const { db, close } = await createDb()
  dbInstance = db
  closeFn = close
  return db
}

export function getDb(): Db {
  if (!dbInstance) throw new Error('Database not initialised — call initDb() first')
  return dbInstance
}

export async function closeDb(): Promise<void> {
  await closeFn()
  dbInstance = null
  closeFn = async () => {}
}

export { schema }
