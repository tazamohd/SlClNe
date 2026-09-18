/** Cross-register staleness and contradiction detection.
 *
 *  Each registry under `project-control/` is generated at its own time by its
 *  own tooling, and nothing makes them agree. So one can quote another's
 *  numbers from a week earlier and read as authoritative while contradicting
 *  the register it is quoting — which is worse than a stale document on its
 *  own, because the contradiction carries the authority of two sources.
 *
 *  This compares the generation dates and the claims that reference across
 *  registers. It reports rather than resolves: picking a winner would hide the
 *  fact that the registers disagree, which is the fact a reader most needs.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { P } from './paths.mjs'

const REGISTERS = [
  'MASTER_REGISTRY.json',
  'STATUS.json',
  'GOLDEN_PATHS.json',
  'BLOCKERS.json',
  'RELEASE_GATES.json',
  'RISK_REGISTER.json',
  'FINDINGS.json',
  'BASELINE.json',
  'DEPENDENCIES.json',
]

/** `generatedAt` and `updatedAt` are both used, in both full-ISO and
 *  date-only form. Normalising to a date means a six-day gap reads as six
 *  days and not as an unparseable string. */
function stampOf(value) {
  for (const key of ['generatedAt', 'updatedAt']) {
    const raw = value?.[key]
    if (typeof raw !== 'string') continue
    const date = new Date(raw.length === 10 ? `${raw}T00:00:00Z` : raw)
    if (!Number.isNaN(date.getTime())) return { key, raw, date }
  }
  return null
}

const STALE_DAYS = 3

export function detectStaleness() {
  const loaded = []
  for (const name of REGISTERS) {
    let parsed
    try {
      parsed = JSON.parse(readFileSync(join(P.control, name), 'utf8'))
    } catch {
      continue
    }
    const stamp = stampOf(parsed)
    loaded.push({ name, value: parsed, stamp })
  }

  const stamped = loaded.filter((r) => r.stamp)
  const newest = stamped.reduce((a, b) => (a.stamp.date > b.stamp.date ? a : b), stamped[0])
  const day = 24 * 60 * 60 * 1000

  const stale = stamped
    .map((r) => ({
      register: r.name,
      stamp: r.stamp.raw.slice(0, 10),
      daysBehind: Math.round((newest.stamp.date - r.stamp.date) / day),
    }))
    .filter((r) => r.daysBehind >= STALE_DAYS)
    .sort((a, b) => b.daysBehind - a.daysBehind)

  // Claims one register makes about another's contents.
  const contradictions = []
  const gates = loaded.find((r) => r.name === 'RELEASE_GATES.json')?.value
  const blockers = loaded.find((r) => r.name === 'BLOCKERS.json')?.value
  const golden = loaded.find((r) => r.name === 'GOLDEN_PATHS.json')?.value

  if (gates && blockers) {
    const openNow = blockers.blockers?.length ?? blockers.open ?? 0
    for (const gate of gates.gates ?? []) {
      const quoted = /BLOCKERS\.json \((\d+) open/.exec(gate.evidence ?? '')
      if (quoted && Number(quoted[1]) !== openNow) {
        contradictions.push({
          claim: `RELEASE_GATES.json gate ${gate.id} quotes ${quoted[1]} open blockers`,
          reality: `BLOCKERS.json currently holds ${openNow}`,
          registers: ['RELEASE_GATES.json', 'BLOCKERS.json'],
        })
      }
    }
  }

  if (gates && golden) {
    const passing = golden.totals?.passing
    const total = golden.totals?.paths
    for (const gate of gates.gates ?? []) {
      const quoted = /(\d+) of (\d+) [^.]{0,60}golden path\(?s?\)? fail/i.exec(gate.evidence ?? '')
      if (quoted && golden.totals?.failing === 0) {
        contradictions.push({
          claim: `RELEASE_GATES.json gate ${gate.id} reports ${quoted[1]} failing golden paths`,
          reality: `GOLDEN_PATHS.json records ${passing} of ${total} passing and 0 failing`,
          registers: ['RELEASE_GATES.json', 'GOLDEN_PATHS.json'],
        })
      }
    }
  }

  return {
    newest: newest ? { register: newest.name, stamp: newest.stamp.raw.slice(0, 10) } : null,
    registers: stamped.map((r) => ({ register: r.name, stamp: r.stamp.raw.slice(0, 10) })),
    unstamped: loaded.filter((r) => !r.stamp).map((r) => r.name),
    stale,
    contradictions,
    staleThresholdDays: STALE_DAYS,
  }
}
