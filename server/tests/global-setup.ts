/** Refuses to start a run that cannot prove anything.
 *
 *  Every suite here needs a real PostgreSQL. When there isn't one, each file's
 *  `beforeAll` throws and vitest reports the tests it never reached as
 *  *skipped* — so a run with the database stopped printed **29 passed, 196
 *  skipped**. That happened once during W1 and read, at a glance, like a pass
 *  with some suites turned off. It was a suite that proved almost nothing.
 *
 *  The exit code was right and the summary was misleading, which is the worst
 *  combination: CI would have caught it, a person watching the terminal would
 *  not. One connection check up front turns 196 skips into a single sentence
 *  naming the cause.
 *
 *  This is deliberately not a `beforeAll` in a helper — it has to run before
 *  the first suite is collected, or the skips have already happened. */
import postgres from 'postgres'
import { loadDotEnvFile, loadEnv } from '../src/env'

export async function setup() {
  loadDotEnvFile()
  const env = loadEnv()
  const url = env.DATABASE_ADMIN_URL ?? env.DATABASE_URL
  const sql = postgres(url, { max: 1, connect_timeout: 5, onnotice: () => {} })
  try {
    await sql`select 1`
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    throw new Error(
      `The server suite needs PostgreSQL and could not reach it: ${reason}\n` +
        `  tried: ${url.replace(/:[^:@/]*@/, ':***@')}\n` +
        `  start it with: pg_ctlcluster 16 main start\n` +
        `Refusing to run — without a database these suites report skips, not failures, ` +
        `and a mostly-skipped run looks far too much like a passing one.`
    )
  } finally {
    await sql.end({ timeout: 5 })
  }
}
