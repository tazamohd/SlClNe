/** The requirements catalogue and the traceability matrix.
 *
 *  An honest word about what these requirements are. SALIS AUTO was built from
 *  a design bundle and a set of domain documents, not from an elicited,
 *  numbered requirements catalogue — the eight documents under
 *  `docs/requirements/functional/` are domain narratives with a document ID
 *  each, not itemised requirements. So this catalogue is **requirements as
 *  built**: each entry is derived from something the implementation actually
 *  does, and carries `derivation: IMPLEMENTATION_DERIVED` saying so.
 *
 *  That is worth having and it is not the same thing as an elicited catalogue.
 *  It answers "what does this system guarantee, and what proves it" — which is
 *  the question an auditor, a new engineer and a release gate all ask. It does
 *  not answer "what did the business ask for and did we build it", because the
 *  evidence for the first half of that question is not in this workspace. The
 *  gap report says so rather than papering over it.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, table, write } from '../lib/write.mjs'

const SOURCES = [
  'server/src/registry.ts + server/src/routes/*.ts (functional behaviour)',
  'packages/contract/src/rules/*.ts (business rules)',
  'packages/contract/src/rbac.ts (security requirements)',
  'server/src/db/schema.ts (data requirements)',
  'server/drizzle/*.sql (isolation requirements)',
  'project-control/MASTER_REGISTRY.json (interface requirements)',
]

/** Non-functional requirements, each tied to the gate or baseline that
 *  measures it. An NFR with no measurement is an aspiration; those are marked
 *  UNMEASURED rather than listed as though they were verified. */
function nonFunctional(model) {
  const baseline = model.releaseGates ?? {}
  const totals = model.statusTotals ?? {}
  return [
    { id: 'NFR-SEC-001', statement: 'Every authenticated endpoint re-checks the permission grant server-side; the frontend matrix hides and disables only.', measuredBy: 'server/tests/authz-matrix.test.ts, server/tests/rbac-parity.test.ts', evidence: 'CONTRACT_TEST' },
    { id: 'NFR-SEC-002', statement: 'A tenant can read no row belonging to another tenant, and a connection with no request context set reads nothing.', measuredBy: 'server/tests/isolation.test.ts + Postgres RLS with FORCE', evidence: 'CONTRACT_TEST' },
    { id: 'NFR-SEC-003', statement: 'The audit log is append-only for every role including the table owner.', measuredBy: 'server/drizzle/0011_audit_log_statement_immutability.sql', evidence: 'DATABASE_CONSTRAINT' },
    { id: 'NFR-SEC-004', statement: 'Segregation of duties is enforced, not advisory: the submitter of a document cannot approve it, and a technician cannot pass QC on their own repair.', measuredBy: 'server/tests/authz-sod.test.ts', evidence: 'CONTRACT_TEST' },
    { id: 'NFR-FIN-001', statement: 'Money is an integer count of halalas end to end; no floating-point or numeric money value reaches a ledger.', measuredBy: 'schema convention (*_halalas bigint) + server/tests/estimate-money.test.ts', evidence: 'SCHEMA_AND_TEST' },
    { id: 'NFR-FIN-002', statement: 'Totals are computed server-side; a client-supplied total is never trusted.', measuredBy: 'packages/contract/src/rules/money.ts called from the handlers', evidence: 'CODE' },
    { id: 'NFR-REL-001', statement: 'A replayed Idempotency-Key returns the stored response and creates no second business effect; the same key with a different body is refused.', measuredBy: 'server/src/http/idempotency.ts + idempotency_keys unique index', evidence: 'CODE_AND_SCHEMA' },
    { id: 'NFR-REL-002', statement: 'Concurrent updates are resolved optimistically on a database-maintained version column; a stale write is refused, not silently applied.', measuredBy: 'bump_version trigger on every tenant table', evidence: 'DATABASE_CONSTRAINT' },
    { id: 'NFR-A11Y-001', statement: 'Colour-contrast violations do not increase. The axe sweep is ratcheted per route and per viewport.', measuredBy: 'project-control/BASELINE.json axeColourContrastNodes + app/e2e/a11y.spec.ts', evidence: 'RATCHETED_BASELINE' },
    { id: 'NFR-I18N-001', statement: 'Arabic and RTL are verified per screen, and RTL hazards are held at zero.', measuredBy: `project-control/STATUS.json — arabicVerified ${totals.arabicVerified ?? '?'} of ${totals.capabilities ?? '?'}, rtlHazards ${totals.rtlHazards ?? '?'}`, evidence: 'MEASURED_REGISTRY' },
    { id: 'NFR-UX-001', statement: 'Every registered capability renders and has an end-to-end assertion on its content, not merely on its route.', measuredBy: `project-control/STATUS.json — contentAsserted ${totals.contentAsserted ?? '?'} of ${totals.capabilities ?? '?'}`, evidence: 'MEASURED_REGISTRY' },
    { id: 'NFR-PERF-001', statement: 'Bundle size and golden-path timings stay within the recorded ratchet.', measuredBy: 'app/scripts/check-bundle.mjs, app/scripts/golden-paths.mjs', evidence: baseline ? 'RATCHETED_BASELINE' : 'UNMEASURED' },
    { id: 'NFR-OPS-001', statement: 'The service exposes liveness and readiness probes that are reachable without a token.', measuredBy: 'GET /health, GET /ready (server/src/routes/health.ts)', evidence: 'CODE' },
  ]
}

export function buildRequirements(model) {
  const functional = []

  // One functional requirement per capability, stating what the capability
  // guarantees, plus one per material rule guard.
  for (const capability of model.capabilities) {
    functional.push({
      id: `FR-${capability.id.replace('CAP-', '')}-001`,
      capability: capability.id,
      type: 'FUNCTIONAL',
      derivation: 'IMPLEMENTATION_DERIVED',
      statement: `The system provides ${capability.name.toLowerCase()} through ${capability.screenCount} screens and ${capability.endpointCount} API endpoints, gated by the ${capability.modules.length ? capability.modules.map((m) => `\`${m}\``).join(', ') : 'domain'} permission module${capability.modules.length === 1 ? '' : 's'}.`,
      objective: capability.objective,
      endpoints: capability.endpoints,
      screens: capability.screens,
      entities: capability.entities,
      roles: capability.roles,
      evidence: 'project-control/CAPABILITY_REGISTRY.json',
    })
  }

  for (const rule of model.rules.filter((r) => r.kind === 'GUARD' || r.kind === 'CALCULATION')) {
    functional.push({
      id: rule.id.replace(/^BR-/, 'FR-RULE-'),
      capability: null,
      type: 'FUNCTIONAL',
      derivation: 'IMPLEMENTATION_DERIVED',
      statement: rule.statement ?? `\`${rule.name}\` is enforced for ${rule.domain}.`,
      rule: rule.id,
      enforcedIn: rule.enforcedIn,
      evidence: rule.evidence,
    })
  }

  const data = model.entities.map((entity) => ({
    id: `DR-${entity.table.toUpperCase().replace(/_/g, '-')}`,
    type: 'DATA',
    derivation: 'IMPLEMENTATION_DERIVED',
    statement: `\`${entity.table}\` holds ${entity.columns.length} columns${entity.tenantScoped ? ', is tenant-scoped on `org_id`' : ', is not tenant-scoped'}${entity.rlsEnabled ? ' and is protected by row-level security' : ' and has **no row-level-security policy**'}.`,
    entity: entity.id,
    evidence: 'server/src/db/schema.ts',
  }))

  const security = [
    ...model.rbac.modules.map((moduleName) => ({
      id: `SR-RBAC-${moduleName.toUpperCase()}`,
      type: 'SECURITY',
      derivation: 'IMPLEMENTATION_DERIVED',
      statement: `Access to \`${moduleName}\` is granted to ${model.rbac.roles.filter((r) => (model.rbac.matrix[moduleName]?.[r] ?? '') !== '').length} of ${model.rbac.roles.length} roles, with the grants in the RBAC matrix.`,
      evidence: 'packages/contract/src/rbac.ts',
    })),
    ...model.rbac.sod.map((pair, i) => ({
      id: `SR-SOD-${String(i + 1).padStart(3, '0')}`,
      type: 'SECURITY',
      derivation: 'IMPLEMENTATION_DERIVED',
      statement: `"${pair.a}" and "${pair.b}" must not be performed by the same person (risk: ${pair.risk}).`,
      evidence: 'packages/contract/src/rbac.ts',
    })),
  ]

  return { functional, nonFunctional: nonFunctional(model), data, security }
}

export function generateRequirements(model, requirements) {
  const dir = join(P.docs, '09_SYSTEM_ANALYSIS')
  const all = [...requirements.functional, ...requirements.nonFunctional, ...requirements.data, ...requirements.security]

  write(
    join(dir, 'REQUIREMENTS_CATALOG.md'),
    [
      banner('requirements.mjs', SOURCES),
      '# Requirements catalogue',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt} · ${all.length} requirements`,
      '',
      '## What these requirements are, and what they are not',
      '',
      'This is a catalogue of **requirements as built**. Every entry is derived from something the implementation actually does — an endpoint, a rule guard, a database constraint, a permission grant — and carries `IMPLEMENTATION_DERIVED` saying so.',
      '',
      'It answers: *what does this system guarantee, and what proves it.* That is the question an auditor, a new engineer and a release gate ask.',
      '',
      'It does **not** answer: *what did the business ask for, and did we build it.* The evidence for the first half of that question — elicited, numbered, stakeholder-signed requirements — is not in this workspace. The eight documents under `docs/requirements/functional/` are domain narratives with a document ID each, not itemised requirements. Closing that gap needs a business analyst and a stakeholder, not a generator, and the gap report records it as an open item rather than filling it in.',
      '',
      '## Identifier scheme',
      '',
      table(
        ['Prefix', 'Kind', 'Derived from'],
        [
          ['`FR-<CAPABILITY>-nnn`', 'Functional — capability level', 'The capability registry'],
          ['`FR-RULE-<domain>-<fn>`', 'Functional — rule level', 'A guard or calculation in `packages/contract/src/rules`'],
          ['`NFR-<area>-nnn`', 'Non-functional', 'A gate, ratchet or contract test that measures it'],
          ['`DR-<TABLE>`', 'Data', 'A table in the schema'],
          ['`SR-RBAC-<module>` / `SR-SOD-nnn`', 'Security', 'The permission matrix and the SOD pairs'],
        ],
      ),
      '',
      '## Functional requirements',
      '',
      table(
        ['ID', 'Statement', 'Capability', 'Endpoints', 'Screens', 'Evidence'],
        requirements.functional.map((r) => [r.id, r.statement, r.capability ?? '—', (r.endpoints ?? []).length || '—', (r.screens ?? []).length || '—', `\`${r.evidence}\``]),
      ),
      '',
      '## Non-functional requirements',
      '',
      'Each one names what measures it. An NFR with nothing measuring it would be an aspiration, and is marked `UNMEASURED` rather than listed as verified.',
      '',
      table(['ID', 'Statement', 'Measured by', 'Evidence class'], requirements.nonFunctional.map((r) => [r.id, r.statement, r.measuredBy, r.evidence])),
      '',
      '## Data requirements',
      '',
      table(['ID', 'Statement'], requirements.data.map((r) => [r.id, r.statement])),
      '',
      '## Security requirements',
      '',
      table(['ID', 'Statement'], requirements.security.map((r) => [r.id, r.statement])),
      '',
    ].join('\n'),
  )

  return all
}

/** The traceability matrix, and the chain in both directions. */
export function generateTraceability(model, requirements) {
  const dir = join(P.docs, '09_SYSTEM_ANALYSIS')
  const all = [...requirements.functional, ...requirements.nonFunctional, ...requirements.data, ...requirements.security]

  const capRows = model.capabilities.map((capability) => {
    const requirement = requirements.functional.find((r) => r.capability === capability.id)
    const tests = new Set()
    for (const endpointId of capability.endpoints) {
      const endpoint = model.api.find((e) => e.id === endpointId)
      for (const t of endpoint?.tests ?? []) tests.add(t)
    }
    return {
      objective: capability.objective,
      capability: capability.id,
      requirement: requirement?.id ?? null,
      endpoints: capability.endpointCount,
      screens: capability.screenCount,
      entities: capability.entities.length,
      rules: capability.rules.length,
      tests: tests.size,
      roles: capability.roles.length,
    }
  })

  const untracedCapabilities = capRows.filter((r) => r.tests === 0)
  const untestedEndpoints = model.api.filter((e) => !(e.tests ?? []).length)
  const unenforcedRules = model.rules.filter(
    (r) => (r.kind === 'GUARD' || r.kind === 'CALCULATION') && !model.tests.some((t) => t.cases.some((c) => c.includes(r.name)) || JSON.stringify(t.describes).includes(r.name)),
  )

  write(
    join(dir, 'REQUIREMENTS_TRACEABILITY_MATRIX.md'),
    [
      banner('requirements.mjs', SOURCES),
      '# Requirements traceability matrix',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      '## The chain',
      '',
      '```',
      'STRATEGIC OBJECTIVE → BUSINESS CAPABILITY → REQUIREMENT → ENTITY → API → PERMISSION → SCREEN → TEST',
      '```',
      '',
      'Every link below is derived from a real identifier — a permission module, a table name, a route path. Nothing is linked on resemblance, so a blank cell means *no link exists in the source*, not *the generator could not find one*.',
      '',
      '## Forward: objective down to test',
      '',
      table(
        ['Objective', 'Capability', 'Requirement', 'Entities', 'Endpoints', 'Permissioned roles', 'Screens', 'Rules', 'Linked test suites'],
        capRows.map((r) => [r.objective, r.capability, r.requirement, r.entities, r.endpoints, r.roles, r.screens, r.rules, r.tests || '**0**']),
      ),
      '',
      '## Reverse: from an artefact back to why it exists',
      '',
      'Given a table, an endpoint, a permission or a screen, the registries answer the reverse question directly:',
      '',
      table(
        ['Start from', 'Look in', 'Answers'],
        [
          ['A database table', '`project-control/ENTITY_REGISTRY.json`', 'Which endpoints read and write it, which relationships bind it, whether RLS protects it, which tests touch it'],
          ['An endpoint', '`project-control/API_REGISTRY.json`', 'Its capability, permission module and action, tenant scope, entity, and linked tests'],
          ['A permission cell', '`project-control/PERMISSION_REGISTRY.json`', 'Which role holds which action on which module, that role’s data scope and approval ceiling'],
          ['A screen', '`project-control/MASTER_REGISTRY.json`', 'Its route, module, permissions, data backing, states, and e2e coverage'],
          ['A business rule', '`project-control/BUSINESS_RULES.json`', 'The function that enforces it, the file it lives in, and the message a user sees'],
          ['A test', '`project-control/TEST_REGISTRY.json`', 'Its suite, kind, the paths and roles it exercises'],
        ],
      ),
      '',
      '## Where the chain breaks',
      '',
      'The honest part of a traceability matrix is the list of links that do not exist.',
      '',
      `### Capabilities with no linked test suite (${untracedCapabilities.length} of ${capRows.length})`,
      '',
      untracedCapabilities.length
        ? table(['Capability', 'Endpoints', 'Screens'], untracedCapabilities.map((r) => [r.capability, r.endpoints, r.screens])) +
          '\n\nA capability with endpoints but no linked suite is a real gap. A capability with **no endpoints** — the website, the design system, the feature map — is linked through the screen registry’s end-to-end coverage instead, which is the appropriate evidence for a surface with no API behind it.'
        : '_None._',
      '',
      `### Endpoints with no linked test (${untestedEndpoints.length} of ${model.api.length})`,
      '',
      'Linkage here is by path match between a spec file and a route. A test that exercises an endpoint indirectly — through a helper, or through a golden path — will not match, so this over-reports. It is still the right number to drive down.',
      '',
      table(
        ['Method', 'Path', 'Permission'],
        untestedEndpoints.slice(0, 60).map((e) => [e.method, `\`${e.path}\``, e.permissionModule ? `${e.permissionModule}:${e.permissionAction ?? '?'}` : '—']),
      ),
      untestedEndpoints.length > 60 ? `\n_…and ${untestedEndpoints.length - 60} more. The full list is in \`project-control/API_REGISTRY.json\` — every endpoint whose \`tests\` array is empty._` : '',
      '',
      `### Rule guards with no test naming them (${unenforcedRules.length} of ${model.rules.filter((r) => r.kind === 'GUARD' || r.kind === 'CALCULATION').length})`,
      '',
      table(['Rule', 'Statement', 'Enforced in'], unenforcedRules.map((r) => [r.id, r.statement ?? '—', `\`${r.enforcedIn}\``])),
      '',
    ].join('\n'),
  )

  return {
    requirements: all.length,
    capabilities: capRows.length,
    untracedCapabilities: untracedCapabilities.length,
    untestedEndpoints: untestedEndpoints.length,
    unenforcedRules: unenforcedRules.length,
  }
}
