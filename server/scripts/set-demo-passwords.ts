/** Dev-only: sets a real password hash on every seeded demo account.
 *
 *  `scripts/seed.ts` deliberately does not set one — "a seeded password hash
 *  in a repository is a credential in a repository" — so a freshly seeded
 *  database has no account anyone can sign in to over HTTP: every login
 *  attempt gets a 401, including the exact curl command
 *  `docs/developer/local-development.md` documents. This script is the manual
 *  step that closes that gap, kept out of `seed.ts` for the same reason the
 *  hash isn't already there: nothing here is committed, and running this
 *  script is a decision made against a real, running database rather than a
 *  value baked into source control.
 *
 *  It refuses outright against anything that looks like production —
 *  `NODE_ENV=production` — because a dev convenience password is not a
 *  password anyone should be able to set on a real tenant's accounts.
 *
 *      tsx scripts/set-demo-passwords.ts                    # salis1234, every demo account
 *      tsx scripts/set-demo-passwords.ts 'a-longer-password'
 */
import { eq } from 'drizzle-orm'
import { withAuthPlane } from '../src/auth/context'
import { loadAuthConfig } from '../src/auth/config'
import { checkPasswordPolicy, hashPassword } from '../src/auth/password'
import { createDb } from '../src/db/client'
import { users } from '../src/db/schema'
import { loadEnv } from '../src/env'
import { DEMO_USERS } from './seed'

/** What every onboarding doc in this repo has long documented as "the" demo
 *  password. Kept as the default so this script matches that convention
 *  rather than adding a second one — see the policy warning below for why
 *  that convention is itself worth questioning. */
const DEFAULT_PASSWORD = 'salis1234'

async function main(): Promise<void> {
  const config = loadEnv()

  if (config.NODE_ENV === 'production') {
    throw new Error(
      'set-demo-passwords refuses to run with NODE_ENV=production. This is a dev-only ' +
        'convenience for a locally seeded database, never for a real deployment — ' +
        'set NODE_ENV=development (or leave it unset) against a database you seeded yourself.',
    )
  }

  const password = process.argv[2] ?? DEFAULT_PASSWORD
  const failure = checkPasswordPolicy(password)
  if (failure) {
    /* Loud, not silent (§ the same principle golden-paths.mjs and the OTP
     * transport both follow): `salis1234` is 10 characters, two short of
     * this app's own MIN_PASSWORD_LENGTH (12). Refusing here would make the
     * password every doc names unusable through this script; setting it
     * silently would hide that a real account could never register with it
     * through `POST /auth/register`, which does enforce the policy. Both
     * facts are true at once, so both are said. */
    process.stderr.write(
      `set-demo-passwords: warning — "${password}" fails this app's own password policy ` +
        `(${failure.message}). Setting it anyway, since it's the password this repo's own ` +
        'onboarding docs document; a real account could never register with it.\n\n',
    )
  }

  const authConfig = loadAuthConfig()
  const passwordHash = await hashPassword(password, authConfig)

  const handle = createDb(config.DATABASE_ADMIN_URL ?? config.DATABASE_URL, 1)
  try {
    const found = new Set<string>()
    await withAuthPlane(handle.db, async (tx) => {
      for (const demo of DEMO_USERS) {
        const result = await tx
          .update(users)
          .set({ passwordHash })
          .where(eq(users.email, demo.email))
          .returning({ email: users.email })
        if (result.length) found.add(demo.email)
      }
    })

    for (const demo of DEMO_USERS) {
      process.stdout.write(
        `${found.has(demo.email) ? 'set    ' : 'MISSING'}  ${demo.email}  (${demo.role})\n`,
      )
    }
    process.stdout.write(
      `\n${found.size}/${DEMO_USERS.length} demo account(s) can now sign in with that password. ` +
        (found.size < DEMO_USERS.length ? 'Run `tsx scripts/seed.ts` first for the rest.\n' : '\n'),
    )
  } finally {
    await handle.close()
  }
}

const isEntry = process.argv[1]?.endsWith('set-demo-passwords.ts')
if (isEntry) {
  main().catch((error: unknown) => {
    process.stderr.write(`${(error as Error).stack ?? String(error)}\n`)
    process.exit(1)
  })
}
