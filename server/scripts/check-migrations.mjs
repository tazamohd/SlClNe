/** Migration and snapshot integrity, as a CI gate.
 *
 *  This repository has already been bitten twice by the two failure modes below,
 *  and neither one errored at the time — that is what makes them worth a gate
 *  rather than a convention.
 *
 *  1. **Snapshot drift.** `drizzle/meta/` once held two snapshots against eleven
 *     journal entries, both byte-identical apart from `id`/`prevId`. The
 *     recorded state was frozen at `0000_init` (51 tables) while `schema.ts` had
 *     moved on to 68, so the next `generate` would have emitted seventeen
 *     `ADD COLUMN` statements for columns that already existed — and drizzle
 *     runs pending migrations in one transaction, so the first
 *     `42701 duplicate_column` would have aborted the whole run. Nothing warned.
 *
 *  2. **An orphan migration.** `0000_lonely_black_widow.sql` sat in the
 *     migrations directory with no journal entry for months. It was never
 *     applied and never would be, but it read like history to anyone opening the
 *     folder, and it shared a numeric prefix with a real migration.
 *
 *  The checks are ordered cheapest-first so a broken tree fails in milliseconds
 *  rather than after a drizzle-kit round trip.
 *
 *  Usage:  node scripts/check-migrations.mjs
 *  Exit:   0 clean, 1 drift found.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SERVER = path.dirname(fileURLToPath(new URL('.', import.meta.url)))
const DRIZZLE = path.join(SERVER, 'drizzle')
const META = path.join(DRIZZLE, 'meta')

const problems = []
const note = (msg) => problems.push(msg)

/* ------------------------------------------------------- 1. journal is sane */

const journalPath = path.join(META, '_journal.json')
if (!fs.existsSync(journalPath)) {
  console.error('check-migrations FAILED\n  no drizzle/meta/_journal.json')
  process.exit(1)
}
const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'))
const entries = journal.entries ?? []

if (!entries.length) note('the journal has no entries')

entries.forEach((entry, i) => {
  if (entry.idx !== i) note(`journal entry ${i} claims idx ${entry.idx} — indexes must be contiguous from 0`)
})

/* -------------------------------------- 2. every journal entry has its files */

for (const entry of entries) {
  const sqlFile = path.join(DRIZZLE, `${entry.tag}.sql`)
  if (!fs.existsSync(sqlFile)) note(`journal names ${entry.tag} but drizzle/${entry.tag}.sql is missing`)
}

/* ------------------------------------ 3. no .sql file outside the journal */

const tags = new Set(entries.map((e) => e.tag))
for (const file of fs.readdirSync(DRIZZLE)) {
  if (!file.endsWith('.sql')) continue
  const tag = file.slice(0, -4)
  if (!tags.has(tag)) {
    note(
      `drizzle/${file} has no journal entry — it will never be applied. ` +
        'Delete it, or add it to the journal if it is real history.',
    )
  }
}

/* ---------------------------------- 4. the newest snapshot matches the tip */

if (entries.length) {
  const tip = entries[entries.length - 1]
  const tipSnapshot = path.join(META, `${String(tip.idx).padStart(4, '0')}_snapshot.json`)
  if (!fs.existsSync(tipSnapshot)) {
    note(
      `the newest journal entry is ${tip.tag} (idx ${tip.idx}) but ` +
        `meta/${path.basename(tipSnapshot)} does not exist — ` +
        'generate would diff against a stale base',
    )
  }
}

/* ------------------------- 5. schema.ts and the recorded state still agree */

let generated = ''
try {
  generated = execFileSync('npx', ['drizzle-kit', 'generate'], {
    cwd: SERVER,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
} catch (error) {
  note(`drizzle-kit generate failed: ${error.message?.split('\n')[0] ?? error}`)
}

/* drizzle-kit says "No schema changes, nothing to migrate" when the recorded
 * state matches schema.ts. Any other outcome means it wrote a migration, which
 * in CI means someone changed the schema without committing the migration. */
if (generated && !/No schema changes/i.test(generated)) {
  const written = /migration file ➜\s*(\S+)/.exec(generated)?.[1]
  note(
    'drizzle-kit generate produced a migration, so schema.ts has changes that ' +
      `are not committed${written ? ` (wrote ${written})` : ''}. ` +
      'Run `npx drizzle-kit generate` locally and commit the result.',
  )
}

/* A generate that writes files also dirties the working tree. Check that
 * separately, because it catches a snapshot rewrite that emits no SQL. */
try {
  const dirty = execFileSync('git', ['status', '--porcelain', '--', 'drizzle'], {
    cwd: SERVER,
    encoding: 'utf8',
  }).trim()
  if (dirty) {
    note(`drizzle/ is dirty after generate:\n      ${dirty.split('\n').join('\n      ')}`)
  }
} catch {
  /* Not a git checkout (a published tarball, a container without .git). The
   * generate check above still ran, so this is a lost signal, not a failure. */
}

/* ------------------------------------------------------------------ report */

if (problems.length) {
  console.error('check-migrations FAILED')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(
  `check-migrations OK — ${entries.length} migrations, journal/snapshot in step, ` +
    'generate reports no schema changes',
)
