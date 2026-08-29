/** Applies `drizzle/` to the database, then grants the application role.
 *
 *  Two connections on purpose: migrations run as the owner, the API runs as a
 *  non-superuser role that RLS applies to. Collapsing them into one is how a
 *  system ends up serving traffic on a superuser DSN and silently losing tenant
 *  isolation.
 *
 *      tsx scripts/migrate.ts            apply pending migrations
 *      tsx scripts/migrate.ts --reset    drop and recreate the public schema
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadEnv } from '../src/env'

const here = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = resolve(here, '..', 'drizzle')

function appRoleFrom(url: string): { role: string; password: string | null } {
  const parsed = new URL(url)
  return {
    role: decodeURIComponent(parsed.username || 'salis_app'),
    password: parsed.password ? decodeURIComponent(parsed.password) : null,
  }
}

export async function runMigrations(options: { reset?: boolean } = {}): Promise<void> {
  const config = loadEnv()
  const adminUrl = config.DATABASE_ADMIN_URL ?? config.DATABASE_URL
  const client = postgres(adminUrl, { max: 1, onnotice: () => {} })
  const db = drizzle(client)

  try {
    if (options.reset) {
      await db.execute(sql`drop schema if exists drizzle cascade`)
      await db.execute(sql`drop schema public cascade`)
      await db.execute(sql`create schema public`)
    }

    await migrate(db, { migrationsFolder })

    const { role, password } = appRoleFrom(config.DATABASE_URL)
    const isSameRole = new URL(adminUrl).username === role
    if (!isSameRole) {
      const exists = await db.execute(sql`select 1 from pg_roles where rolname = ${role}`)
      if (exists.length === 0) {
        if (!password) {
          throw new Error(
            `the application role "${role}" does not exist and DATABASE_URL carries no password to create it with`,
          )
        }
        await db.execute(
          sql.raw(`create role "${role}" login password '${password.replace(/'/g, "''")}'`),
        )
      }
      /* Deliberately no BYPASSRLS and no superuser: the whole point of the
       * separate role is that policies apply to it. */
      await db.execute(sql.raw(`grant usage on schema public to "${role}"`))
      await db.execute(
        sql.raw(`grant select, insert, update, delete on all tables in schema public to "${role}"`),
      )
      await db.execute(sql.raw(`grant usage, select on all sequences in schema public to "${role}"`))
      await db.execute(
        sql.raw(
          `alter default privileges in schema public grant select, insert, update, delete on tables to "${role}"`,
        ),
      )
      /* The audit log is append-only even for the application role. The trigger
       * enforces it too; this makes the intent visible in the grant table. */
      await db.execute(sql.raw(`revoke update, delete on audit_log from "${role}"`))
    }
  } finally {
    await client.end({ timeout: 5 })
  }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (invokedDirectly) {
  runMigrations({ reset: process.argv.includes('--reset') })
    .then(() => process.stdout.write('migrations applied\n'))
    .catch((error: unknown) => {
      process.stderr.write(`${(error as Error).stack ?? String(error)}\n`)
      process.exit(1)
    })
}
