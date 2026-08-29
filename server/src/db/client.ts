/** The database connection.
 *
 *  The API connects as a **non-superuser** role. Row-level security is bypassed
 *  by superusers, so a superuser DSN would silently switch tenant isolation off
 *  while every test still passed. `assertNotSuperuser` refuses to start on one.
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import * as schema from './schema'

export type Database = PostgresJsDatabase<typeof schema>

export interface DbHandle {
  db: Database
  client: postgres.Sql
  close(): Promise<void>
}

export function createDb(url: string, poolMax = 10): DbHandle {
  const client = postgres(url, {
    max: poolMax,
    /** Prepared statements are per-connection; `SET LOCAL` context plus a
     *  pooled prepared plan is a footgun not worth the microseconds. */
    prepare: false,
    onnotice: () => {},
  })
  return {
    db: drizzle(client, { schema }),
    client,
    async close() {
      await client.end({ timeout: 5 })
    },
  }
}

/** Fails the boot rather than serving requests with isolation disabled. */
export async function assertNotSuperuser(db: Database): Promise<void> {
  const rows = (await db.execute(
    sql`select rolsuper, rolbypassrls, current_user as who from pg_roles where rolname = current_user`,
  )) as unknown as { rolsuper: boolean; rolbypassrls: boolean; who: string }[]
  const row = rows[0]
  if (!row) throw new Error('cannot determine the connected role')
  if (row.rolsuper || row.rolbypassrls) {
    throw new Error(
      `the API must not connect as "${row.who}": it is a superuser or has BYPASSRLS, ` +
        'which disables tenant isolation. Use the application role from DATABASE_URL.',
    )
  }
}

export { schema }
