/** The date a generated document carries.
 *
 *  This was `new Date()`, and that was wrong in a way that only showed up the
 *  next morning: every one of the 131 generated files differs by its date line
 *  alone, so `docs:check` fails at midnight with nothing changed. A check that
 *  turns red on its own overnight is a check everyone learns to override,
 *  which is the failure this toolchain is built to avoid — so the stamp has to
 *  be a function of the sources, not of the clock.
 *
 *  It is therefore the commit date of the newest change to anything the
 *  documentation is derived from. Two consequences make it right rather than
 *  merely stable: committing regenerated documentation does not move it (the
 *  documentation is not a source), and it answers the question a reader
 *  actually has — not "when was this file written" but "how current is what it
 *  describes".
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { P } from './paths.mjs'

/** Everything a generated document is derived from.
 *
 *  `docs/` is deliberately absent, and so are the registries this toolchain
 *  writes: including either would make the stamp move every time it was
 *  committed, and the next run would find it stale again. The registries owned
 *  by *other* tooling are included, because a rebuild of the screen registry
 *  genuinely does change what the documentation says.
 */
const SOURCES = [
  'server/src',
  'server/drizzle',
  'server/tests',
  'packages/contract/src',
  'app/src',
  'app/e2e',
  'app/tests',
  'app/scripts',
  'tools/docs',
  'project-control/MASTER_REGISTRY.json',
  'project-control/STATUS.json',
  'project-control/GOLDEN_PATHS.json',
  'project-control/RELEASE_GATES.json',
  'project-control/BLOCKERS.json',
  'project-control/RISK_REGISTER.json',
  'project-control/FINDINGS.json',
  'project-control/BASELINE.json',
  'project-control/DEPENDENCIES.json',
]

/** The last stamp this toolchain wrote, recovered from its own output.
 *
 *  The fallback matters more than it looks. If git is unavailable — a tarball
 *  export, a checkout so shallow that no commit touches a source path — then
 *  inventing a date would reintroduce exactly the drift this module exists to
 *  remove. Carrying the previous one forward keeps the output byte-identical,
 *  so the check still answers the question it is asked: has anything changed. */
function previousStamp() {
  for (const registry of ['ENTITY_REGISTRY.json', 'API_REGISTRY.json']) {
    try {
      const parsed = JSON.parse(readFileSync(join(P.control, registry), 'utf8'))
      if (typeof parsed.generatedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.generatedAt)) {
        return parsed.generatedAt
      }
    } catch {
      /* try the next one */
    }
  }
  return null
}

let cached = null

export function sourceStamp() {
  if (cached) return cached
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...SOURCES],
      { cwd: P.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) {
      cached = out
      return cached
    }
  } catch {
    /* fall through to the recovered stamp */
  }
  cached = previousStamp() ?? 'unknown'
  return cached
}
