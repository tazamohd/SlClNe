/** An ephemeral database per test run.
 *
 *  The suites talk to a real PostgreSQL because the things most worth testing
 *  here — row-level security, `SELECT … FOR UPDATE`, a unique constraint under
 *  a race — do not exist in a mock. The database is dropped and rebuilt from
 *  the committed migrations, so a passing run is evidence the migrations work
 *  and not just that the schema file parses.
 */
import { sql } from 'drizzle-orm'
import { SignJWT } from 'jose'
import postgres from 'postgres'
import type { FastifyInstance } from 'fastify'
import { ROLE_META, type RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import { loadEnv, loadDotEnvFile, type Env } from '../src/env'
import { runMigrations } from '../scripts/migrate'
import { seedAll } from '../scripts/seed'
import { SEED } from '../scripts/seed'
import type { Tx } from '../src/db/tenant'

export { SEED }

const TEST_DATABASE = process.env.TEST_DATABASE ?? 'salis_auto_test'

function swapDatabase(url: string, database: string): string {
  const parsed = new URL(url)
  parsed.pathname = `/${database}`
  return parsed.toString()
}

export interface Harness {
  app: FastifyInstance
  handle: DbHandle
  env: Env
  token(role: RoleId, overrides?: Partial<TokenOverrides>): Promise<string>
  close(): Promise<void>
}

export interface TokenOverrides {
  sub: string
  orgId: string
  branchId: string | null
  name: string
}

/** Drops and recreates the test database, applies the committed migrations and
 *  seeds it from the app's fixtures. */
/** The role name out of a connection string, for the one grant the harness needs. */
function adminRoleOf(url: string): string {
  try {
    return new URL(url).username || 'postgres'
  } catch {
    return 'postgres'
  }
}

export async function resetDatabase(): Promise<Env> {
  loadDotEnvFile()
  const source = loadEnv()
  const adminUrl = source.DATABASE_ADMIN_URL ?? source.DATABASE_URL

  const maintenance = postgres(swapDatabase(adminUrl, 'postgres'), { max: 1, onnotice: () => {} })
  try {
    // The admin role is not a superuser — deliberately, so RLS applies to it
    // too — which means it cannot terminate a backend belonging to the app
    // role without `pg_signal_backend`. Without the grant this raises
    // "permission denied to terminate process" roughly one run in six: rare
    // enough to look like a bad test, frequent enough to teach people to
    // re-run. Granted here rather than in a migration because it is a property
    // of the test harness, not of the schema.
    await maintenance
      .unsafe(`grant pg_signal_backend to ${adminRoleOf(adminUrl)}`)
      .catch(() => {
        // Already granted, or the role lacks permission to grant it. The
        // terminate below then fails the way it always did, visibly.
      })
    await maintenance
      .unsafe(
        `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${TEST_DATABASE}' and pid <> pg_backend_pid()`,
      )
      .catch(() => {
        /* Best-effort, and no longer load-bearing: `with (force)` below drops
         * the database whether or not this succeeded. It used to throw
         * "permission denied to terminate process" — pg_signal_backend cannot
         * signal a backend belonging to a superuser — and because it threw
         * before the drop, the whole reset aborted and the file's tests were
         * reported as skipped. Roughly one run in three here. */
      })
    /* `with (force)` because the terminate above and the drop below are two
     * statements: a connection opening in the gap — the previous file's pool
     * still draining — makes the drop fail with "database is being accessed by
     * other users". The suite then reported that file's tests as *skipped*,
     * which reads as switched off rather than broken, and it moved around as
     * files were added. `force` terminates and drops in one statement, so
     * there is no gap to lose. PostgreSQL 13+; the terminate is kept because
     * it reports a permissions problem more clearly than force does. */
    await maintenance.unsafe(`drop database if exists ${TEST_DATABASE} with (force)`)
    await maintenance.unsafe(`create database ${TEST_DATABASE}`)
  } finally {
    await maintenance.end({ timeout: 5 })
  }

  process.env.DATABASE_URL = swapDatabase(source.DATABASE_URL, TEST_DATABASE)
  process.env.DATABASE_ADMIN_URL = swapDatabase(adminUrl, TEST_DATABASE)
  const env = loadEnv()

  await runMigrations()

  const admin = createDb(env.DATABASE_ADMIN_URL ?? env.DATABASE_URL, 1)
  try {
    await admin.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.scope', 'platform', true)`)
      await seedAll(tx as Tx)
    })
  } finally {
    await admin.close()
  }
  return env
}

export async function startHarness(): Promise<Harness> {
  const env = await resetDatabase()
  const handle = createDb(env.DATABASE_URL, 5)
  const app = await buildApp({ db: handle.db, env })
  await app.ready()

  const secret = new TextEncoder().encode(env.JWT_SECRET as string)

  return {
    app,
    handle,
    env,
    async token(role, overrides = {}) {
      return new SignJWT({
        role,
        org_id: overrides.orgId ?? SEED.orgId,
        branch_id: overrides.branchId === undefined ? SEED.mainBranchId : overrides.branchId,
        name: overrides.name ?? `${role} tester`,
        /* Deliberately claims the widest scope. The server derives scope from
         * the role instead, so this claim must have no effect — which is what
         * `tenancy.test.ts` checks. */
        scope: 'platform',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(overrides.sub ?? `01JUSER${role.toUpperCase().padEnd(18, 'X').slice(0, 18)}`)
        .setIssuer(env.JWT_ISSUER)
        .setAudience(env.JWT_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(secret)
    },
    async close() {
      await app.close()
      await handle.close()
    },
  }
}

/** Ceilings in halalas, so a test can sit exactly on the boundary. */
export function ceilingHalalas(role: RoleId): number | null {
  const sar = ROLE_META[role].limitSar
  return sar === null ? null : sar * 100
}
