/** What the application role may do to `otp_challenges`, proved as the role.
 *
 *  `otp_challenges` holds live authentication material, so the blanket
 *  `grant select, insert, update, delete on all tables` that every other table
 *  gets is too wide for it. `scripts/migrate.ts` narrows it. This file is the
 *  proof that the narrowing is real and that it did not break the flow.
 *
 *  **The database audit recommended `REVOKE UPDATE, DELETE`, and revoking
 *  UPDATE would have been a security regression.** Both OTP protections are
 *  writes to this table: the attempt counter that caps brute force, and the
 *  `verified_at` stamp that stops replay. Take UPDATE away and a six-digit code
 *  becomes unlimited guesses, and a correct code works forever. The first two
 *  tests below fail loudly if someone applies that recommendation later.
 *
 *  Every test here connects as the *application* role, not the migration owner,
 *  because a grant that only holds for `postgres` proves nothing.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import { createDb, type DbHandle } from '../src/db/client'
import { resetDatabase } from './harness'

/** Connected as `salis_app` — the role the API runs as. */
let app: DbHandle

beforeAll(async () => {
  const env = await resetDatabase()
  app = createDb(env.DATABASE_URL)
}, 120_000)

afterAll(async () => {
  if (app) await app.close()
})

/** Runs one statement as the application role. Returns the PostgreSQL error
 *  code, or null when it succeeded. `42501` is insufficient_privilege. */
async function asAppRole(statement: ReturnType<typeof sql>): Promise<string | null> {
  try {
    await app.db.execute(statement)
    return null
  } catch (error) {
    return (error as { code?: string }).code ?? 'unknown'
  }
}

/** A challenge to operate on, inserted as the application role — which is
 *  itself the assertion that INSERT survived the narrowing. */
async function seedChallenge(): Promise<string> {
  const id = ulid()
  const code = await asAppRole(sql`
    insert into otp_challenges (id, channel, destination, code_hash, expires_at)
    values (${id}, 'email', ${`${id}@example.test`}, 'not-a-real-hash', now() + interval '10 minutes')`)
  expect(code, 'the application role must be able to issue a challenge').toBeNull()
  return id
}

describe('the application role keeps exactly the OTP privileges the code uses', () => {
  it('may count a failed attempt — this is the brute-force cap', async () => {
    const id = await seedChallenge()
    expect(
      await asAppRole(sql`update otp_challenges set attempts = attempts + 1 where id = ${id}`),
    ).toBeNull()
  })

  it('may consume a challenge — this is what stops replay', async () => {
    const id = await seedChallenge()
    expect(
      await asAppRole(sql`update otp_challenges set verified_at = now() where id = ${id}`),
    ).toBeNull()
  })

  it('may read challenges, for the throttle and for verification', async () => {
    await seedChallenge()
    expect(await asAppRole(sql`select id from otp_challenges limit 1`)).toBeNull()
  })
})

describe('the application role cannot do anything else to a challenge', () => {
  /** The three writes that would turn this table into a way in. A column-level
   *  UPDATE grant is what makes these distinct from the two allowed above —
   *  `REVOKE UPDATE` would have blocked all five, and `GRANT UPDATE` allows all
   *  five. Only the column list separates them. */
  it('cannot rewrite the code hash', async () => {
    const id = await seedChallenge()
    expect(
      await asAppRole(sql`update otp_challenges set code_hash = 'attacker' where id = ${id}`),
    ).toBe('42501')
  })

  it('cannot extend an expiry', async () => {
    const id = await seedChallenge()
    expect(
      await asAppRole(
        sql`update otp_challenges set expires_at = now() + interval '100 days' where id = ${id}`,
      ),
    ).toBe('42501')
  })

  it('cannot redirect a challenge to another destination', async () => {
    const id = await seedChallenge()
    expect(
      await asAppRole(
        sql`update otp_challenges set destination = 'attacker@example.test' where id = ${id}`,
      ),
    ).toBe('42501')
  })

  /** No code path deletes a challenge — consumption is `verified_at`, and there
   *  is no retention sweep. A DELETE would let a compromised role erase the
   *  attempt history that proves an attack happened. If a cleanup job is added,
   *  it needs this grant back deliberately, and this test should change with
   *  it rather than be deleted. */
  it('cannot delete a challenge', async () => {
    const id = await seedChallenge()
    expect(await asAppRole(sql`delete from otp_challenges where id = ${id}`)).toBe('42501')
  })
})
