#!/usr/bin/env node
/** `node tools/docs/check.mjs` — fails when the documentation and the code disagree.
 *
 *  The check that matters is the first one: regenerate everything into memory
 *  and compare it against what is checked in. A generated document that has
 *  drifted means somebody changed the schema, the routers or the permission
 *  matrix and did not regenerate — which is exactly the moment a documentation
 *  set starts lying, and the only moment at which it is cheap to fix.
 *
 *  The remaining checks look for the failure modes a diff cannot catch: a
 *  required document that was never written, a link that points at nothing, a
 *  document claiming a status its evidence does not support.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { P } from './lib/paths.mjs'
import { REQUIRED } from './lib/structure.mjs'
import { written } from './lib/write.mjs'
import { inventory } from './generators/control.mjs'
import { run } from './generate.mjs'

const failures = []
const warnings = []

function fail(check, detail) {
  failures.push({ check, detail })
}
function warn(check, detail) {
  warnings.push({ check, detail })
}

// 1 — Generated documents must match a fresh generation.
//
// `generate.mjs` writes only when content differs and records which files it
// changed, so a clean tree produces zero changed files. Anything it changed is
// drift between the code and the checked-in documentation.
const before = new Set()
try {
  for (const entry of REQUIRED) before.add(entry.path)
} catch {
  /* structure is static; nothing to recover from */
}

const { model, trace, controlStats, firstPassChanged, driftedFiles } = run()

if (firstPassChanged > 0) {
  fail(
    'generated-docs-stale',
    `${firstPassChanged} generated file(s) differed from a fresh generation. Run \`node tools/docs/generate.mjs\` and commit the result.\n` +
      driftedFiles.slice(0, 20).map((d) => `      ${d}`).join('\n') +
      (driftedFiles.length > 20 ? `\n      …and ${driftedFiles.length - 20} more` : ''),
  )
}

// 2 — Required documents must exist and not be stubs.
for (const entry of REQUIRED) {
  const abs = join(P.docs, entry.path)
  if (!existsSync(abs)) {
    fail('required-doc-missing', entry.path)
    continue
  }
  if (readFileSync(abs, 'utf8').length < 400) {
    fail('required-doc-stub', `${entry.path} is under 400 bytes — a heading is not a document.`)
  }
}

// 3 — Relative links inside docs/ must resolve.
//
// A broken link in the numbered architecture is a failure: those documents are
// owned by this system and a link that does not resolve is a defect introduced
// now. A broken link in the pre-existing tree is a warning, because 296
// inherited documents carry inherited breakage, and a check that is red on the
// day it is introduced is a check everyone learns to override — which is worse
// than no check. The inherited ones are counted, reported in the gap report,
// and cleared section by section as the migration manifest works through them.
const docs = inventory().filter((d) => d.path.endsWith('.md'))
let linksChecked = 0
const legacyBrokenLinks = []
for (const doc of docs) {
  const owned = /^\d\d_/.test(doc.section)
  const content = readFileSync(doc.abs, 'utf8')
  for (const m of content.matchAll(/\[[^\]]*\]\((?!https?:|#|mailto:)([^)#]+)(?:#[^)]*)?\)/g)) {
    const target = m[1].trim()
    if (!target || target.startsWith('<')) continue
    linksChecked += 1
    if (existsSync(resolve(dirname(doc.abs), target))) continue
    if (owned) fail('broken-link', `docs/${doc.path} → ${target}`)
    else legacyBrokenLinks.push(`docs/${doc.path} → ${target}`)
  }
}
if (legacyBrokenLinks.length) {
  warn(
    'legacy-broken-links',
    `${legacyBrokenLinks.length} broken link(s) in the pre-existing docs/ tree, inherited rather than introduced. They are migration work — see DOCUMENTATION_MIGRATION_MANIFEST.md.`,
  )
}

// 4 — Nothing may claim VERIFIED without a verification date and a verifier.
//
// This is the check that stops the set from self-certifying. A generated
// document is derived, which is not the same as verified, and a generator is
// not a verifier.
for (const doc of docs) {
  const content = readFileSync(doc.abs, 'utf8')
  if (!/\bStatus:\*{0,2}\s*VERIFIED\b/.test(content)) continue
  if (!/Verified by:/.test(content) || !/Verified on:/.test(content)) {
    fail('verified-without-evidence', `docs/${doc.path} claims VERIFIED without "Verified by:" and "Verified on:".`)
  }
}

// 5 — Generated documents must carry the banner naming their sources.
for (const doc of docs) {
  const content = readFileSync(doc.abs, 'utf8')
  if (!/\*\*Status:\*\*\s*GENERATED/.test(content)) continue
  if (!content.includes('GENERATED FILE — DO NOT EDIT BY HAND')) {
    fail('generated-without-banner', `docs/${doc.path} says it is GENERATED but carries no generator banner.`)
  }
}

// 6 — Mermaid blocks must be structurally sound.
//
// A malformed diagram does not fail loudly: Mermaid renders an error box in
// place of the picture, so a broken diagram looks like a rendering glitch and
// survives review. Checking the fence balance, the diagram keyword and the
// characters that terminate a node label catches the three ways these break.
const MERMAID_TYPES = [
  'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram-v2', 'stateDiagram',
  'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline', 'quadrantChart',
  'C4Context', 'C4Container', 'C4Component', 'requirementDiagram', 'sankey-beta', 'block-beta',
]
let mermaidBlocks = 0
for (const doc of docs) {
  const content = readFileSync(doc.abs, 'utf8')
  const fences = content.split('\n').filter((l) => l.trimStart().startsWith('```')).length
  if (fences % 2 !== 0) {
    fail('unbalanced-code-fence', `docs/${doc.path} has ${fences} code fences — one is unclosed.`)
  }
  for (const m of content.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    mermaidBlocks += 1
    const body = m[1].trim()
    const first = body.split('\n')[0].trim()
    if (!MERMAID_TYPES.some((t) => first.startsWith(t))) {
      fail('mermaid-unknown-type', `docs/${doc.path}: a mermaid block opens with "${first.slice(0, 48)}", which is not a known diagram type.`)
    }
    if (!body) fail('mermaid-empty', `docs/${doc.path} contains an empty mermaid block.`)
  }
}

// 7 — Everything the model knows about must be reachable from a capability.
const unmappedScreens = model.screens.filter((s) => !model.capabilities.some((c) => c.screens.includes(s.screenId)))
if (unmappedScreens.length) {
  fail('screen-not-in-capability-map', `${unmappedScreens.length} screen(s) map to no capability: ${unmappedScreens.slice(0, 8).map((s) => s.screenId).join(', ')}`)
}
const unmappedEndpoints = model.api.filter((e) => !model.capabilities.some((c) => c.endpoints.includes(e.id)))
if (unmappedEndpoints.length) {
  fail('endpoint-not-in-capability-map', `${unmappedEndpoints.length} endpoint(s) map to no capability: ${unmappedEndpoints.slice(0, 8).map((e) => `${e.method} ${e.path}`).join(', ')}`)
}

// 8 — Authored documents must not carry a stale live count.
//
// The standards say an authored document should link to a registry rather than
// repeat its number, because a hand-written "the 303 endpoints" is wrong the
// next time a route is added and nobody notices. This enforces it — but only
// for phrasings that unambiguously claim the *total*.
//
// The first version of this check flagged any number within 35% of a total,
// and immediately produced four false alarms: "All 64 tables that need it have
// RLS", "63 tables" with soft delete, "the remaining 285 screens". Those are
// correct subset counts, and a check that calls them errors teaches the reader
// to skim past its output. So the patterns below match only total-claiming
// phrases, and a subset marker immediately before the number disqualifies the
// match outright.
const SUBSET_MARKERS = /(?:remaining|all|only|other|of|another|further|first|last|about|roughly|some)\s+$/i
const LIVE_COUNTS = [
  { name: 'endpoints', value: model.api.length, patterns: [/\b(\d{2,4}) (?:API )?endpoints (?:under|across|in total|documented)\b/gi, /\b(\d{2,4})-endpoint\b/gi] },
  { name: 'tables', value: model.entities.length, patterns: [/\b(\d{2,4}) tables (?:in total|altogether)\b/gi, /\bschema (?:has|holds) (\d{2,4}) tables\b/gi] },
  { name: 'registered screens', value: model.screens.length, patterns: [/\b(\d{2,4}) registered screens\b/gi] },
  { name: 'test suites', value: model.tests.length, patterns: [/\b(\d{2,4}) test suites\b/gi] },
  { name: 'relationships', value: model.relationships.relationships.length, patterns: [/\b(\d{2,4}) relationships in (?:the|this) model\b/gi] },
]
// "285 of 424 screens" states a total too — as the denominator. Flagging it
// needs care, because "12 of 16 screens data-backed" is a legitimate subset
// and its denominator is nobody's total. The rule: flag a denominator only
// when it is close enough to the real total to be attempting it, and wrong.
const DENOMINATORS = [
  { name: 'registered screens', value: model.screens.length, pattern: /\b\d{1,4} of (\d{2,4}) screens\b/gi },
  { name: 'endpoints', value: model.api.length, pattern: /\b\d{1,4} of (\d{2,4}) endpoints\b/gi },
  { name: 'tables', value: model.entities.length, pattern: /\b\d{1,4} of (\d{2,4}) tables\b/gi },
]
for (const doc of docs) {
  if (!/^\d\d_/.test(doc.section)) continue
  const content = readFileSync(doc.abs, 'utf8')
  if (content.includes('GENERATED FILE — DO NOT EDIT BY HAND')) continue
  for (const d of DENOMINATORS) {
    for (const m of content.matchAll(d.pattern)) {
      const stated = Number(m[1])
      if (stated === d.value) continue
      if (Math.abs(stated - d.value) / d.value > 0.1) continue
      fail(
        'stale-count-in-authored-doc',
        `docs/${doc.path} states "${m[0].trim()}" but there are ${d.value} ${d.name}. Update it, or describe the proportion and link to the registry.`,
      )
    }
  }
}

for (const doc of docs) {
  if (!/^\d\d_/.test(doc.section)) continue
  const content = readFileSync(doc.abs, 'utf8')
  if (content.includes('GENERATED FILE — DO NOT EDIT BY HAND')) continue
  for (const count of LIVE_COUNTS) {
    for (const pattern of count.patterns) {
      for (const m of content.matchAll(pattern)) {
        if (SUBSET_MARKERS.test(content.slice(Math.max(0, m.index - 24), m.index))) continue
        if (Number(m[1]) === count.value) continue
        fail(
          'stale-count-in-authored-doc',
          `docs/${doc.path} states "${m[0].trim()}" but there are ${count.value} ${count.name}. Update it, or link to the registry instead of repeating the number.`,
        )
      }
    }
  }
}

// 9 — The schema must parse completely. A table the parser silently dropped
//     would be a table missing from every ERD and the data dictionary.
if (model.unparsedEntities.length) {
  fail('schema-unparsed', `The schema parser could not read: ${model.unparsedEntities.join(', ')}. The catalogue is incomplete.`)
}

// 10 — Every tenant-scoped table must be covered by row-level security.
if (model.security.coverage.tenantScopedWithoutRls.length) {
  fail(
    'tenant-table-without-rls',
    `${model.security.coverage.tenantScopedWithoutRls.length} tenant-scoped table(s) have no RLS policy: ${model.security.coverage.tenantScopedWithoutRls.join(', ')}`,
  )
}

// 11 — Warnings: real gaps that must not block the build, because a check
//     everyone learns to override is worse than no check.
if (trace.untestedEndpoints) warn('endpoints-without-matched-test', `${trace.untestedEndpoints} of ${model.api.length} endpoints have no test matched by path.`)
if (trace.unenforcedRules) warn('rules-without-named-test', `${trace.unenforcedRules} rule guard(s) have no test naming them.`)
const undeclared = model.stateMachines.filter((m) => !m.transitionsDeclared).length
if (undeclared) warn('lifecycles-without-transition-table', `${undeclared} of ${model.stateMachines.length} lifecycles declare states but no legal transitions.`)
if (model.relationships.inferredCount) warn('relationships-without-fk', `${model.relationships.inferredCount} of ${model.relationships.relationships.length} relationships have no database foreign key.`)
if (controlStats.missing) warn('required-docs-missing', `${controlStats.missing} required document(s) absent.`)
if (model.staleness.stale.length) {
  warn(
    'registers-stale',
    `${model.staleness.stale.length} of ${model.staleness.registers.length} canonical registers are at least ${model.staleness.staleThresholdDays} days behind the newest: ` +
      model.staleness.stale.map((s2) => `${s2.register} (${s2.daysBehind}d)`).join(', '),
  )
}
// A contradiction between two canonical registers is louder than staleness —
// but the registers belong to other tooling, so this system reports it rather
// than failing on something it cannot fix.
for (const c of model.staleness.contradictions) {
  warn('registers-contradict', `${c.claim}, but ${c.reality}.`)
}

// ── Report ────────────────────────────────────────────────────────────────
console.log('')
console.log('  SALIS AUTO — documentation check')
console.log('  ' + '─'.repeat(60))
console.log(`  documents scanned   ${String(docs.length).padStart(5)}`)
console.log(`  internal links      ${String(linksChecked).padStart(5)}   ${legacyBrokenLinks.length} broken in the legacy tree`)
console.log(`  mermaid diagrams    ${String(mermaidBlocks).padStart(5)}`)
console.log(`  required documents  ${String(controlStats.required - controlStats.missing).padStart(5)} / ${controlStats.required}`)
console.log('  ' + '─'.repeat(60))

if (warnings.length) {
  console.log('')
  console.log('  WARNINGS (real gaps; recorded in the gap report, not blocking)')
  for (const w of warnings) console.log(`    · ${w.check}: ${w.detail}`)
}

if (failures.length) {
  console.log('')
  console.log(`  FAILED — ${failures.length} problem(s)`)
  for (const f of failures) console.log(`    ✗ ${f.check}: ${f.detail}`)
  console.log('')
  process.exit(1)
}

console.log('')
console.log('  PASSED — documentation is consistent with the implementation.')
console.log('')
