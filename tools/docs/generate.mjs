#!/usr/bin/env node
/** `npm run docs:generate` — regenerates every derived document and registry.
 *
 *  Run it after any change to the schema, the routers, the permission matrix,
 *  the rule functions or the spec files. `docs:check` runs the same code and
 *  fails when the checked-in output differs, so forgetting to run it is caught
 *  rather than discovered months later by a reader acting on a stale number.
 */
import { buildModel } from './lib/model.mjs'
import { written } from './lib/write.mjs'
import { generateRegistries } from './generators/registries.mjs'
import { generateData } from './generators/data.mjs'
import { generateApi } from './generators/api.mjs'
import { generateArchitecture } from './generators/architecture.mjs'
import { generateCapability } from './generators/capability.mjs'
import { generateDomains } from './generators/domains.mjs'
import { buildRequirements, generateRequirements, generateTraceability } from './generators/requirements.mjs'
import { generateControl } from './generators/control.mjs'
import { generateRelease } from './generators/release.mjs'

const quiet = process.argv.includes('--quiet')
const log = (...args) => {
  if (!quiet) console.log(...args)
}

/** One full generation pass. */
function pass() {
  const model = buildModel()

  generateRegistries(model)
  generateData(model)
  generateApi(model)
  generateArchitecture(model)
  generateCapability(model)
  generateDomains(model)

  const requirements = buildRequirements(model)
  generateRequirements(model, requirements)
  const trace = generateTraceability(model, requirements)

  // Control and release run last: they inventory the tree, so everything else
  // must already be on disk for their counts to be right.
  const controlStats = generateControl(model, requirements, trace)
  const release = generateRelease(model, requirements, trace, controlStats)

  return { model, requirements, trace, controlStats, release }
}

/** Generation runs to a fixpoint rather than once.
 *
 *  The control and release generators inventory the `docs/` tree — counting
 *  documents, measuring which are thin, recording byte sizes — and then write
 *  documents into that same tree. A single pass therefore reports a tree that
 *  is one write out of date, and the counts in the index disagree with the
 *  index's own existence.
 *
 *  Iterating until nothing changes settles it. Convergence is not assumed: if
 *  the output has not stabilised after `MAX_PASSES` the run fails loudly,
 *  because a generator that never settles would make `docs:check` alternate
 *  between pass and fail for reasons no reader could diagnose.
 */
const MAX_PASSES = 8

export function run() {
  let result = null
  let firstPassChanged = 0
  let driftedFiles = []
  for (let i = 0; i < MAX_PASSES; i += 1) {
    written.length = 0
    result = pass()
    const changed = written.filter((w) => w.changed)
    if (i === 0) {
      firstPassChanged = changed.length
      driftedFiles = changed.map((w) => w.path)
    }
    if (changed.length === 0) return { ...result, passes: i + 1, firstPassChanged, driftedFiles }
  }
  throw new Error(
    `Documentation generation did not stabilise after ${MAX_PASSES} passes. ` +
      'A generator is producing output that changes its own inputs without settling.',
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { model, trace, controlStats, release, passes, firstPassChanged } = run()
  log('')
  log('  SALIS AUTO — documentation generation')
  log('  ' + '─'.repeat(60))
  log(`  entities          ${String(model.entities.length).padStart(5)}   from server/src/db/schema.ts`)
  log(`  relationships     ${String(model.relationships.relationships.length).padStart(5)}   ${model.relationships.declaredCount} FK-backed, ${model.relationships.inferredCount} convention only`)
  log(`  endpoints         ${String(model.api.length).padStart(5)}   ${model.api.filter((e) => e.kind === 'GENERATED').length} generated, ${model.api.filter((e) => e.kind === 'EXPLICIT').length} explicit`)
  log(`  permission cells  ${String(model.rbac.totals.cells).padStart(5)}   ${model.rbac.totals.granted} granted`)
  log(`  business rules    ${String(model.rules.length).padStart(5)}`)
  log(`  state machines    ${String(model.stateMachines.length).padStart(5)}   ${model.stateMachines.filter((m) => m.transitionsDeclared).length} with declared transitions`)
  log(`  test suites       ${String(model.tests.length).padStart(5)}   ${model.tests.reduce((s, t) => s + t.caseCount, 0)} cases`)
  log(`  screens           ${String(model.screens.length).padStart(5)}   all mapped to a capability`)
  log('  ' + '─'.repeat(60))
  log(`  files written     ${String(written.length).padStart(5)}   ${firstPassChanged} changed on the first pass, settled after ${passes}`)
  log(`  required docs     ${String(controlStats.required - controlStats.missing).padStart(5)} / ${controlStats.required}`)
  log(`  doc certification ${String(release.score).padStart(5)} / 100`)
  log(`  readiness         ${String(release.criteriaMet).padStart(5)} / ${release.criteria} criteria`)
  log(`  untested endpoints${String(trace.untestedEndpoints).padStart(5)}`)
  log('')
}
