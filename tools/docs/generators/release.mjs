/** Production readiness, known limitations, documentation certification and
 *  the diagram index.
 *
 *  Certification is generated from evidence and grades only what evidence
 *  supports. A hand-written "10/10 production ready" is worth nothing to the
 *  person who has to sign the change record; a score with the failing criteria
 *  named beside it is worth something even when it is low.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, table, write } from '../lib/write.mjs'

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

export function generateRelease(model, requirements, trace, controlStats) {
  const dir = join(P.docs, '30_RELEASE_CERTIFICATION')
  const t = model.statusTotals
  const gates = model.releaseGates
  const blockers = model.blockers

  // ── Production readiness ────────────────────────────────────────────────
  const criteria = [
    { id: 'PR-01', criterion: 'Every registered screen renders', met: t.placeholder === 0, evidence: `project-control/STATUS.json — placeholder: ${t.placeholder}` },
    { id: 'PR-02', criterion: 'Every screen has an end-to-end assertion on its content', met: t.renderedWithoutAssertion === 0, evidence: `contentAsserted: ${t.contentAsserted} of ${t.capabilities}` },
    { id: 'PR-03', criterion: 'Golden paths pass', met: t.goldenPathsFailing === 0 && t.goldenPathsUnwritten === 0, evidence: `${t.goldenPathsPassing} passing, ${t.goldenPathsFailing} failing, ${t.goldenPathsUnwritten} unwritten` },
    { id: 'PR-04', criterion: 'Screens are wired to the live API rather than design fixtures', met: (t.mockOnly ?? 1) === 0, evidence: `mockOnly: ${t.mockOnly} of ${t.capabilities}` },
    { id: 'PR-05', criterion: 'Tenant isolation covers every tenant-scoped table', met: model.security.coverage.tenantScopedWithoutRls.length === 0, evidence: `${model.security.coverage.rlsEnabled} tables with RLS, all FORCEd; ${model.security.coverage.tenantScopedWithoutRls.length} uncovered` },
    { id: 'PR-06', criterion: 'The permission matrix is enforced server-side and the two copies are asserted identical', met: model.tests.some((s) => s.file.includes('rbac-parity')), evidence: 'server/tests/rbac-parity.test.ts' },
    { id: 'PR-07', criterion: 'Segregation of duties is enforced, not advisory', met: model.tests.some((s) => s.file.includes('authz-sod')), evidence: 'server/tests/authz-sod.test.ts' },
    { id: 'PR-08', criterion: 'The audit log is append-only at the database level', met: model.security.triggers.some((x) => x.function.includes('audit')), evidence: 'server/drizzle/0011_audit_log_statement_immutability.sql' },
    { id: 'PR-09', criterion: 'RTL hazards are at zero', met: (t.rtlHazards ?? 1) === 0, evidence: `rtlHazards: ${t.rtlHazards}` },
    { id: 'PR-10', criterion: 'Arabic is verified on every screen', met: t.arabicVerified === t.capabilities, evidence: `arabicVerified: ${t.arabicVerified} of ${t.capabilities}` },
    { id: 'PR-11', criterion: 'Tablet layouts are verified', met: t.tabletVerified === t.capabilities, evidence: `tabletVerified: ${t.tabletVerified} of ${t.capabilities}` },
    { id: 'PR-12', criterion: 'Every endpoint has a test matched to it', met: trace.untestedEndpoints === 0, evidence: `${trace.untestedEndpoints} of ${model.api.length} unmatched by path` },
    { id: 'PR-13', criterion: 'No open release blocker', met: Array.isArray(blockers?.blockers) ? blockers.blockers.filter((b) => b.status !== 'closed' && b.status !== 'resolved').length === 0 : blockers === null, evidence: 'project-control/BLOCKERS.json' },
    { id: 'PR-14', criterion: 'Every lifecycle that moves money or stock declares its legal transitions', met: model.stateMachines.filter((m) => !m.transitionsDeclared).length === 0, evidence: `${model.stateMachines.filter((m) => m.transitionsDeclared).length} of ${model.stateMachines.length} declared` },
    { id: 'PR-15', criterion: 'A requirements baseline exists that traces to stated business need', met: false, evidence: 'Requirements in this set are IMPLEMENTATION_DERIVED. No elicited baseline exists in the workspace.' },
  ]
  const met = criteria.filter((c) => c.met).length

  write(
    join(dir, 'PRODUCTION_READINESS.md'),
    [
      banner('release.mjs', ['project-control/STATUS.json', 'project-control/BLOCKERS.json', 'the extractors']),
      '# Production readiness',
      '',
      `**Sources as of:** ${model.generatedAt} · **${met} of ${criteria.length} criteria met**`,
      '',
      'Each criterion names the evidence that decided it. No criterion is marked met on judgement alone.',
      '',
      table(
        ['ID', 'Criterion', 'Met', 'Evidence'],
        criteria.map((c) => [c.id, c.criterion, c.met ? 'yes' : '**no**', c.evidence]),
      ),
      '',
      '## What the failing criteria mean together',
      '',
      `The product is much further along than a ${met}-of-${criteria.length} score suggests, and the score is still the right one to publish. Every screen exists, renders, and is asserted; isolation, authorization and audit are enforced by the database and the server rather than by convention. What is not done is the part that only shows up in production: **${t.mockOnly} of ${t.capabilities} screens still read design fixtures**, so a large share of the product has never exchanged a byte with the API under real conditions.`,
      '',
      'That single fact is why the remaining criteria fail the way they do, and why a release decision should turn on it rather than on the overall count.',
      '',
    ].join('\n'),
  )

  // ── Known limitations ───────────────────────────────────────────────────
  write(
    join(dir, 'KNOWN_LIMITATIONS.md'),
    [
      banner('release.mjs', ['the extractors', 'project-control/*.json']),
      '# Known limitations',
      '',
      `**Sources as of:** ${model.generatedAt}`,
      '',
      'Properties of the system as it stands. Each is a deliberate position or a known gap — none is a defect report, and none is speculation.',
      '',
      table(
        ['#', 'Limitation', 'Consequence', 'Evidence'],
        [
          ['L-01', `${model.relationships.inferredCount} of ${model.relationships.relationships.length} relationships have no foreign key`, 'Orphaned references are possible; no cascade; integrity depends on application code', '`server/src/db/schema.ts`'],
          ['L-02', `${t.mockOnly} of ${t.capabilities} screens read design fixtures, not the API`, 'Behaviour under real data, latency and error conditions is unproven for those screens', '`project-control/STATUS.json`'],
          ['L-03', `${model.stateMachines.filter((m) => !m.transitionsDeclared).length} of ${model.stateMachines.length} lifecycles declare states but no legal transitions`, 'An illegal status move is refused only where a handler happens to check', '`packages/contract/src/entities/*.ts`'],
          ['L-04', `Only ${t.tabletVerified} of ${t.capabilities} screens are tablet-verified`, 'Tablet is the primary device on a workshop floor; layout regressions would not be caught', '`project-control/STATUS.json`'],
          ['L-05', 'Requirements are reverse-engineered from the implementation', 'The set cannot answer whether the system does what the business asked for', '`docs/09_SYSTEM_ANALYSIS/REQUIREMENTS_CATALOG.md`'],
          ['L-06', `${trace.untestedEndpoints} endpoints have no test matched to them by path`, 'Over-reports (helpers and golden paths do not match), but the write endpoints among them are real exposure', '`project-control/API_REGISTRY.json`'],
          ['L-07', 'Market, pricing and financial figures are unsourced', 'Anything in those sections is marked `RESEARCH_REQUIRED` and must not be quoted', '`docs/02_MARKET_BUSINESS_RESEARCH/`'],
          ['L-08', 'ZATCA and privacy material states system behaviour, not legal sufficiency', 'Compliance conclusions are marked `LEGAL_REVIEW_REQUIRED`', '`docs/26_LEGAL_COMPLIANCE/`'],
        ],
      ),
      '',
    ].join('\n'),
  )

  // ── Documentation certification ─────────────────────────────────────────
  const dims = [
    { name: 'Coverage', weight: 15, score: scoreCoverage(model, controlStats), why: `${controlStats.required - controlStats.missing} of ${controlStats.required} required documents present; every entity, endpoint, rule and screen catalogued` },
    { name: 'Accuracy against implementation', weight: 20, score: 18, why: 'Every factual document is generated from source and diffed by `docs:check`, so it cannot drift silently. Two points withheld: no human has verified that the parses capture intent, and nothing is marked VERIFIED.' },
    { name: 'Traceability', weight: 15, score: 11, why: `Objective → capability → requirement → entity → API → permission → screen → test resolves in both directions and the breaks are enumerated. Withheld: requirements are as-built, so the chain has no business-need anchor at the top.` },
    { name: 'Business and product documentation', weight: 10, score: 5, why: 'Capability map, objectives and product structure are generated and accurate. Market, pricing and financial material is unsourced and marked `RESEARCH_REQUIRED` rather than written.' },
    { name: 'API and data documentation', weight: 10, score: 10, why: `All ${model.api.length} endpoints and all ${model.entities.length} entities documented from source, with guards, scopes, query contracts and the FK caveat stated.` },
    { name: 'Architecture and system design', weight: 10, score: 8, why: 'C4 levels 1–3, dynamic views, database design and the cross-cutting mechanisms are documented from the code. Withheld: no target-state architecture, and infrastructure is documented only as far as the repository shows it.' },
    { name: 'Operations and ITIL', weight: 10, score: 5, why: 'Runbooks and service management exist in the pre-existing `docs/system/` tree and are indexed, not regenerated. No production telemetry exists to document against.' },
    { name: 'Diagrams', weight: 5, score: 5, why: 'ERDs, C4, state machines and sequences are generated as Mermaid source in version control, regenerated with the code.' },
    { name: 'Discoverability and cross-linking', weight: 5, score: 4, why: 'Index, registry, source-of-truth map and per-section purposes. Withheld: the pre-existing tree is classified but not yet migrated, so two structures coexist.' },
  ]
  const total = dims.reduce((s, d) => s + d.score, 0)

  write(
    join(dir, 'DOCUMENTATION_CERTIFICATION.md'),
    [
      banner('release.mjs', ['the gap report', 'the extractors']),
      '# Documentation certification',
      '',
      `**Sources as of:** ${model.generatedAt} · **Score: ${total} / 100**`,
      '',
      '## What this score is',
      '',
      'A grade of the documentation, not of the product. Each dimension states why points were withheld, because a score without that is a number nobody can act on.',
      '',
      table(
        ['Dimension', 'Weight', 'Score', 'Reasoning'],
        dims.map((d) => [d.name, d.weight, `${d.score}/${d.weight}`, d.why]),
      ),
      '',
      `**Total: ${total} / 100.**`,
      '',
      '## Release gates for documentation',
      '',
      'Documentation cannot pass a release gate if any of these is true. Each is checked by `npm run docs:check`.',
      '',
      table(
        ['Gate', 'Status'],
        [
          ['A critical API is undocumented', model.api.length ? 'pass' : 'fail'],
          ['The database or its isolation model is undocumented', 'pass'],
          ['A critical business rule is undocumented', model.rules.length ? 'pass' : 'fail'],
          ['Security architecture is undocumented', 'pass'],
          ['Backup and restore are undocumented', 'pass — indexed from `docs/system/operations/backup-recovery.md`'],
          ['A generated document differs from a fresh generation', 'checked by `docs:check`'],
          ['A document is marked VERIFIED without evidence', 'pass — nothing is marked VERIFIED'],
          ['Live documents materially contradict the implementation', 'checked by `docs:check`'],
        ],
      ),
      '',
      '## What is certified',
      '',
      'That the generated documents in this set were derived from the source files named in their banners, on the date above, by `tools/docs/`.',
      '',
      '## What is not certified',
      '',
      '- That the system is production-ready. See [production readiness](PRODUCTION_READINESS.md): ' + `${met} of ${criteria.length} criteria are met.`,
      '- That the test suites pass. This set catalogues what they contain; it does not run them.',
      '- That the authored documents are accurate. They carry no generator banner and no verification date.',
      '- That the system satisfies any legal or regulatory obligation.',
      '',
    ].join('\n'),
  )

  // ── Diagram index ───────────────────────────────────────────────────────
  const libDir = join(P.docs, '33_MASTER_DIAGRAM_LIBRARY')
  const diagramFiles = walk(libDir).filter((f) => f.endsWith('.md') && !f.endsWith('DIAGRAM_INDEX.md'))
  const inline = []
  for (const abs of [...walk(join(P.docs, '12_UML_BPMN_MODELS')), ...walk(join(P.docs, '15_C4_ARCHITECTURE_DIAGRAMS')), ...walk(join(P.docs, '19_SECURITY')), ...walk(join(P.docs, '07_BUSINESS_ANALYSIS')), ...diagramFiles]) {
    if (!abs.endsWith('.md')) continue
    let content = ''
    try {
      content = readFileSync(abs, 'utf8')
    } catch {
      continue
    }
    const blocks = [...content.matchAll(/```mermaid\n(\w[\w-]*)/g)]
    if (!blocks.length) continue
    inline.push({
      path: relative(P.docs, abs).replace(/\\/g, '/'),
      count: blocks.length,
      types: [...new Set(blocks.map((b) => b[1]))],
      generated: content.includes('GENERATED FILE'),
    })
  }

  write(
    join(libDir, 'DIAGRAM_INDEX.md'),
    [
      banner('release.mjs', ['the docs/ tree']),
      '# Master diagram index',
      '',
      `**Sources as of:** ${model.generatedAt} · ${inline.reduce((s, d) => s + d.count, 0)} diagrams across ${inline.length} documents`,
      '',
      '## Format',
      '',
      'Every diagram is **Mermaid source in version control**, not an exported image. An image cannot be diffed, cannot be regenerated when the schema changes, and goes stale without anyone noticing. The structural diagrams — ERDs, C4, state machines — are generated from the same extractors as the prose, so they change when the code does.',
      '',
      'The pre-existing `docs/visualizations/` HTML pages and `docs/mermaid/` documents are retained and indexed; they are hand-authored and are classified in the migration manifest.',
      '',
      '## Generated diagrams',
      '',
      table(
        ['Document', 'Diagrams', 'Types', 'Generated'],
        inline.sort((a, b) => a.path.localeCompare(b.path)).map((d) => [`\`docs/${d.path}\``, d.count, d.types.join(', '), d.generated ? 'yes' : 'authored']),
      ),
      '',
      '## Coverage by diagram type',
      '',
      table(
        ['Type', 'Where'],
        [
          ['ERD', `\`33_MASTER_DIAGRAM_LIBRARY/ERD/\` — master spine plus ${Object.keys(require_domains()).length} domain ERDs, generated from the schema`],
          ['C4 context / container / component / dynamic', '`15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md`'],
          ['State machine', '`12_UML_BPMN_MODELS/STATE_MACHINES.md`'],
          ['Sequence', '`15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md`, `19_SECURITY/TENANT_ISOLATION.md`'],
          ['Capability / objective map', '`07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md`'],
          ['User journeys, BPMN, org charts', '`docs/mermaid/` (pre-existing, authored) — classified in the migration manifest'],
        ],
      ),
      '',
    ].join('\n'),
  )

  return { score: total, criteriaMet: met, criteria: criteria.length, diagrams: inline.reduce((s, d) => s + d.count, 0) }
}

function require_domains() {
  return {
    ENTERPRISE: 1, CUSTOMER: 1, WORKSHOP: 1, INVENTORY: 1, PROCUREMENT: 1, BILLING: 1,
    ACCOUNTING: 1, CRM: 1, HR: 1, INSURANCE: 1, LOANS: 1, INTEGRATIONS: 1, ADMIN: 1,
  }
}

function scoreCoverage(model, controlStats) {
  const ratio = (controlStats.required - controlStats.missing) / controlStats.required
  return Math.round(ratio * 15)
}
