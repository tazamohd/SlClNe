/** The business-rule catalogue, read from the functions that enforce the rules.
 *
 *  `packages/contract/src/rules/*.ts` is the enforcement point — the server
 *  handlers call these, and `packages/contract/src/entities/*.ts` carries the
 *  state machines. Every catalogued rule therefore names the function that
 *  implements it and the file it lives in, and the traceability report can
 *  ask the opposite question: which rule has no test asserting it.
 *
 *  A rule that exists only in a Markdown table is a rule nothing enforces.
 *  This catalogue deliberately cannot contain one.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { P } from './paths.mjs'

function docComment(source, index) {
  const before = source.slice(0, index)
  const close = before.lastIndexOf('*/')
  if (close === -1 || before.slice(close + 2).trim() !== '') return null
  const open = before.lastIndexOf('/*', close - 1)
  if (open === -1 || before.slice(open, open + 3) !== '/**') return null
  return before
    .slice(open + 3, close)
    .split('\n')
    .map((l) => l.replace(/^\s*\*?\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The `MASTER_BUSINESS_RULES.md` section a file cites, where it cites one. */
function citedSection(source) {
  const m = source.match(/MASTER_BUSINESS_RULES\.md`?\s*(§[^)*.]+)/)
  return m ? m[1].trim() : null
}

export function extractRules() {
  const rules = []
  for (const file of readdirSync(P.contractRules).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
    const abs = join(P.contractRules, file)
    const source = readFileSync(abs, 'utf8')
    const domain = file.replace(/\.ts$/, '')
    const section = citedSection(source)
    for (const m of source.matchAll(/export function (\w+)\s*\(/g)) {
      const name = m[1]
      // Helpers such as `overlaps` and `roundHalfUp` are building blocks, not
      // rules; the rule is the `check*`/`compute*`/`assert*` that uses them.
      const kind = /^check/.test(name)
        ? 'GUARD'
        : /^(compute|calculate|derive)/.test(name)
          ? 'CALCULATION'
          : /^(assert|require)/.test(name)
            ? 'ASSERTION'
            : 'HELPER'
      const body = source.slice(m.index, source.indexOf('\nexport ', m.index + 1) === -1 ? source.length : source.indexOf('\nexport ', m.index + 1))
      rules.push({
        id: `BR-${domain.toUpperCase()}-${name}`,
        name,
        domain,
        kind,
        statement: docComment(source, m.index),
        section,
        messages: [...body.matchAll(/message:\s*`?'?([^'`\n]{10,160})/g)].map((x) => x[1].trim()).slice(0, 4),
        enforcedIn: `packages/contract/src/rules/${file}`,
        evidence: `packages/contract/src/rules/${file}`,
      })
    }
    for (const m of source.matchAll(/export const ([A-Z_0-9]+)\s*=\s*([^\n]+)/g)) {
      rules.push({
        id: `BR-${domain.toUpperCase()}-${m[1]}`,
        name: m[1],
        domain,
        kind: 'CONSTANT',
        statement: docComment(source, m.index),
        section,
        value: m[2].replace(/\s*(\/\/.*)?$/, '').trim(),
        enforcedIn: `packages/contract/src/rules/${file}`,
        evidence: `packages/contract/src/rules/${file}`,
      })
    }
  }
  return rules.sort((a, b) => a.id.localeCompare(b.id))
}

/** State machines, read from the transition tables in the entity contracts. */
export function extractStateMachines() {
  const machines = []
  for (const file of readdirSync(P.contractEntities).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
    const abs = join(P.contractEntities, file)
    const source = readFileSync(abs, 'utf8')
    const entity = file.replace(/\.ts$/, '')

    // Two shapes appear: a `z.enum([...])` of states beside a
    // `Record<State, State[]>` transition table, and a bare exported
    // transition map. Both are matched; anything else is left out rather
    // than guessed at.
    for (const m of source.matchAll(/export const ([A-Z_0-9]+)\s*:\s*[^=]*=\s*\{([\s\S]*?)\n\}/g)) {
      const name = m[1]
      if (!/TRANSITION|STAGE|FLOW|STATUS|NEXT/.test(name)) continue
      const transitions = []
      for (const row of m[2].matchAll(/(\w+)\s*:\s*\[([^\]]*)\]/g)) {
        const targets = [...row[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
        for (const to of targets) transitions.push({ from: row[1], to })
        if (targets.length === 0) transitions.push({ from: row[1], to: null })
      }
      if (!transitions.length) continue
      const states = [...new Set(transitions.flatMap((t) => [t.from, t.to]).filter(Boolean))]
      machines.push({
        kind: 'DECLARED_TRANSITION_TABLE',
        transitionsDeclared: true,
        id: `SM-${entity.toUpperCase()}-${name}`,
        entity,
        name,
        statement: docComment(source, m.index),
        states,
        transitions,
        terminal: states.filter((s) => !transitions.some((t) => t.from === s && t.to)),
        evidence: `packages/contract/src/entities/${file}`,
      })
    }
  }
  // Status enums without a transition table. Only `jobCard` declares legal
  // transitions; every other lifecycle is a set of states whose legal moves
  // are enforced — where they are enforced at all — by a `check*` guard in
  // `rules/` or a status test in a route handler. Recording them as states
  // with `UNDECLARED` transitions is the accurate description, and the gap
  // report counts them.
  for (const file of readdirSync(P.contractEntities).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
    const abs = join(P.contractEntities, file)
    const source = readFileSync(abs, 'utf8')
    const entity = file.replace(/\.ts$/, '')
    for (const m of source.matchAll(/export const (\w*[Ss]tatus|\w*[Ss]tage)\s*=\s*z\.enum\(\[([\s\S]*?)\]\)/g)) {
      const name = m[1]
      const states = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
      if (states.length < 2) continue
      if (machines.some((mm) => mm.entity === entity && mm.states.length === states.length && states.every((s) => mm.states.includes(s)))) continue
      machines.push({
        id: `SM-${entity.toUpperCase()}-${name}`,
        kind: 'STATE_SET_ONLY',
        entity,
        name,
        statement: docComment(source, m.index),
        states,
        transitions: [],
        transitionsDeclared: false,
        terminal: [],
        note: 'No transition table is declared for this lifecycle. Legal moves are enforced, where they are enforced, by a guard in packages/contract/src/rules or a status check in the route handler.',
        evidence: `packages/contract/src/entities/${file}`,
      })
    }
  }

  return machines
}
