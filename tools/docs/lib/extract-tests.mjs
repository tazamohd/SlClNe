/** The test catalogue, read from the spec files themselves.
 *
 *  Coverage claims are the easiest thing in a documentation set to fabricate
 *  and the hardest to notice when fabricated, so nothing here is asserted
 *  without a file and a test title behind it. The catalogue records what the
 *  suites contain; it does not record that they pass. Whether they pass is a
 *  separate, dated, evidence-backed statement in the certification document,
 *  and it is only made when a run has actually happened.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { P } from './paths.mjs'

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const abs = join(dir, name)
    if (statSync(abs).isDirectory()) walk(abs, out)
    else out.push(abs)
  }
  return out
}

const SUITE_KIND = [
  [/authz|rbac|security|isolation|sod/i, 'SECURITY'],
  [/money|estimate-money|finance|invoice|payment/i, 'FINANCIAL_INTEGRITY'],
  [/inventory|procurement/i, 'INVENTORY_INTEGRITY'],
  [/seed|fidelity|coherence/i, 'DATA_FIDELITY'],
  [/a11y|axe/i, 'ACCESSIBILITY'],
  [/\.spec\.ts$/, 'E2E'],
  [/rules|contract/i, 'CONTRACT'],
]

function kindOf(file) {
  for (const [re, kind] of SUITE_KIND) if (re.test(file)) return kind
  return file.includes('/e2e/') ? 'E2E' : 'UNIT_OR_API'
}

/** Test titles, matched non-greedily so a title containing a quote of the
 *  other kind still reads correctly. */
function titlesIn(source) {
  const titles = []
  for (const m of source.matchAll(/\b(it|test)(?:\.\w+)?\(\s*(['"`])((?:[^\\]|\\.)*?)\2/g)) {
    titles.push(m[3])
  }
  return titles
}

function describesIn(source) {
  return [...source.matchAll(/\bdescribe(?:\.\w+)?\(\s*(['"`])((?:[^\\]|\\.)*?)\1/g)].map((m) => m[2])
}

export function extractTests() {
  const files = [
    ...walk(P.serverTests),
    ...walk(P.appE2e),
    ...walk(P.appTests),
    ...walk(P.appSrc).filter((f) => /\.test\.tsx?$/.test(f)),
  ].filter((f) => /\.(test|spec)\.[tj]sx?$/.test(f))

  const suites = []
  for (const abs of files) {
    const rel = relative(P.root, abs).replace(/\\/g, '/')
    const source = readFileSync(abs, 'utf8')
    const titles = titlesIn(source)
    suites.push({
      id: `TS-${rel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`.toUpperCase(),
      file: rel,
      kind: kindOf(rel),
      surface: rel.startsWith('server/') ? 'server' : rel.includes('/e2e/') ? 'browser' : 'app',
      describes: describesIn(source),
      cases: titles,
      caseCount: titles.length,
      // Which modules/paths the suite touches, used to link a test back to the
      // endpoint and permission it exercises.
      touchesPaths: [...new Set([...source.matchAll(/['"`](\/(?:api\/v1\/)?[a-z0-9/:-]{3,})['"`]/g)].map((m) => m[1]))].slice(0, 40),
      touchesRoles: [...new Set([...source.matchAll(/'(owner|superadmin|manager|advisor|technician|qc|parts|accountant|hr|frontdesk|callcenter|procurement|supplier|customer|test)'/g)].map((m) => m[1]))],
    })
  }

  return suites.sort((a, b) => a.file.localeCompare(b.file))
}
