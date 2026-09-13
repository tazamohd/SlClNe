/** The document-control layer: index, registry, status, gap report,
 *  certification and the diagram index.
 *
 *  These are the documents that make the rest of the set trustworthy. The gap
 *  report in particular is the one that has to be honest: a documentation
 *  system that reports itself complete is indistinguishable from one that has
 *  not been checked, and the difference only shows up when somebody relies on
 *  it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { P } from '../lib/paths.mjs'
import { REQUIRED, SECTIONS } from '../lib/structure.mjs'
import { banner, table, write, writeJson } from '../lib/write.mjs'

/** Pre-existing material that belongs to a numbered section but has not been
 *  moved into it yet. Pointing at it is the honest interim state: the reader
 *  gets to the document, and the fact that it is not yet migrated stays
 *  visible rather than being quietly resolved by a bulk move nobody reviewed. */
const LEGACY_POINTERS = {
  '01_EXECUTIVE_STRATEGY': [
    { path: 'management/strategic-plan.md', covers: 'Strategic plan' },
    { path: 'management/business-plan.md', covers: 'Business plan' },
    { path: 'management/financial-plan.md', covers: 'Financial plan' },
  ],
  '02_MARKET_BUSINESS_RESEARCH': [
    { path: 'marketing/market-analysis.md', covers: 'Market analysis' },
    { path: 'marketing/competitive-analysis.md', covers: 'Competitive analysis' },
    { path: 'knowledge-base/library/saudi-automotive-market-guide.md', covers: 'Saudi market guide' },
  ],
  '03_PRINCE2_GOVERNANCE': [
    { path: 'project-management/prince2/', covers: 'Business case, PID, product descriptions, stage plans, quality register' },
  ],
  '04_PROJECT_MANAGEMENT': [
    { path: 'project-management/pmp/', covers: 'Charter, scope, schedule, stakeholders, communication, risk register' },
    { path: 'project-management/governance-framework.md', covers: 'Governance framework' },
    { path: 'project-management/change-management.md', covers: 'Change management' },
  ],
  '05_PLANNING': [
    { path: 'project-management/planning/', covers: 'Release, deployment, migration, training and go-to-market plans' },
    { path: 'project-management/pmp/wbs.md', covers: 'Work breakdown structure' },
  ],
  '06_AGILE_DELIVERY': [
    { path: 'project-management/agile/', covers: 'Backlog, epics, user stories, definition of done, sprint template' },
  ],
  '08_PRODUCT': [
    { path: 'requirements/prd.md', covers: 'Product requirements document' },
    { path: 'marketing/product-overview.md', covers: 'Product overview' },
  ],
  '09_SYSTEM_ANALYSIS': [
    { path: 'requirements/srs.md', covers: 'Software requirements specification' },
    { path: 'MASTER_SRS.md', covers: 'Master SRS — the largest inherited document; needs review before it is treated as current' },
    { path: 'requirements/functional/', covers: 'Eight functional domain narratives' },
    { path: 'requirements/non-functional/', covers: 'Eight non-functional areas' },
  ],
  '16_SYSTEM_DESIGN': [
    { path: 'system/architecture/', covers: 'Frontend, backend, auth, data-flow and database design' },
    { path: 'system/coding-standards.md', covers: 'Coding standards' },
  ],
  '17_API_INTEGRATION': [
    { path: 'system/integration/', covers: 'ZATCA, payment gateway and third-party integrations' },
    { path: 'system/api-versioning.md', covers: 'API versioning' },
  ],
  '19_SECURITY': [
    { path: 'system/security/', covers: 'Authentication guide, authorization matrix, data protection, security architecture' },
  ],
  '20_UI_UX_EXPERIENCE': [
    { path: 'knowledge-base/reference/design-system.md', covers: 'Design system' },
    { path: 'A11Y_AUDIT.md', covers: 'Accessibility audit' },
  ],
  '22_PORTALS_CHANNELS': [
    { path: 'user-documentation/portals/', covers: 'Customer app, supplier portal and technician portal guides' },
  ],
  '23_BUSINESS_OPERATIONS': [
    { path: 'departments/', covers: 'Six departmental operating documents' },
    { path: 'training/', covers: 'Fourteen role-based training courses' },
    { path: 'knowledge-base/library/standard-operating-procedures.md', covers: 'Standard operating procedures' },
  ],
  '24_COMMERCIAL_FINANCIAL': [
    { path: 'marketing/pricing-guide.md', covers: 'Pricing' },
    { path: 'marketing/roi-calculator.md', covers: 'ROI model' },
    { path: 'management/financial-plan.md', covers: 'Financial plan' },
  ],
  '25_SALES_MARKETING_CUSTOMER_SUCCESS': [
    { path: 'marketing/', covers: 'Sales playbook, demo script, press kit, partnership programme, case study template' },
    { path: 'project-management/planning/customer-success-plan.md', covers: 'Customer success plan' },
  ],
  '26_LEGAL_COMPLIANCE': [
    { path: 'legal/', covers: 'Terms, privacy policy, DPA, EULA, acceptable use, cookie policy' },
    { path: 'knowledge-base/library/zatca-compliance-checklist.md', covers: 'ZATCA checklist' },
    { path: 'management/compliance-management-plan.md', covers: 'Compliance management plan' },
  ],
  '27_TESTING_VALIDATION': [
    { path: 'testing/', covers: 'Load, security, regression and UAT test plans' },
    { path: 'system/testing-strategy.md', covers: 'Testing strategy' },
    { path: 'MASTER_TEST_STRATEGY.md', covers: 'Master test strategy' },
  ],
  '28_ITIL_SERVICE_MANAGEMENT': [
    { path: 'system/sla-document.md', covers: 'Service level agreement' },
    { path: 'system/incident-response.md', covers: 'Incident response' },
    { path: 'system/business-continuity.md', covers: 'Business continuity' },
  ],
  '29_OPERATIONS_DEVOPS': [
    { path: 'system/runbooks/', covers: 'Six operational runbooks' },
    { path: 'system/operations/', covers: 'Environment setup, DevOps guide, monitoring, backup and recovery' },
  ],
  '31_ARCHITECTURE_DECISIONS': [
    { path: 'system/adr/', covers: 'Eight ADRs — immutable by convention; indexed, never rewritten' },
  ],
  '33_MASTER_DIAGRAM_LIBRARY': [
    { path: 'mermaid/', covers: 'Forty-six authored Mermaid diagrams: project, user flows, journeys, experience maps' },
    { path: 'visualizations/', covers: 'Twenty-seven authored HTML visualizations — image-equivalent, not diffable' },
  ],
}

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

/** Every document under `docs/`, classified. A document is GENERATED when it
 *  carries the generator banner; the banner is the only evidence used, so a
 *  file cannot claim to be generated without being generated. */
export function inventory() {
  return walk(P.docs)
    .filter((f) => /\.(md|json)$/.test(f))
    .map((abs) => {
      const path = relative(P.docs, abs).replace(/\\/g, '/')
      let content = ''
      try {
        content = readFileSync(abs, 'utf8')
      } catch {
        /* unreadable files are reported as such below */
      }
      const generated = content.includes('GENERATED FILE — DO NOT EDIT BY HAND')
      const section = path.includes('/') ? path.split('/')[0] : '(root)'
      return {
        path,
        abs,
        section,
        bytes: content.length,
        lines: content.split('\n').length,
        type: generated ? 'GENERATED' : section === '99_ARCHIVE' ? 'HISTORICAL' : 'NORMATIVE_OR_AUTHORED',
        archived: section === '99_ARCHIVE',
        // A document with almost nothing in it is a placeholder, whatever its
        // title says. Counting those as "written" is how a set reports 300
        // documents and delivers 40.
        substantive: content.length > 1200,
      }
    })
}

export function generateControl(model, requirements, trace) {
  const dir = join(P.docs, '00_DOCUMENT_CONTROL')
  const docs = inventory()
  const structured = docs.filter((d) => /^\d\d_/.test(d.section))
  const legacy = docs.filter((d) => !/^\d\d_/.test(d.section))

  const required = REQUIRED.map((r) => {
    const found = docs.find((d) => d.path === r.path)
    return { ...r, present: !!found, substantive: found?.substantive ?? false, type: found?.type ?? null }
  })
  const missing = required.filter((r) => !r.present)

  // ── DOCS_INDEX ──────────────────────────────────────────────────────────
  write(
    join(dir, 'DOCS_INDEX.md'),
    [
      banner('control.mjs', ['the docs/ tree itself', 'tools/docs/lib/structure.mjs']),
      '# SALIS AUTO documentation index',
      '',
      `**Generated:** ${model.generatedAt} · ${docs.length} documents, ${structured.length} in the numbered architecture`,
      '',
      '## Start here',
      '',
      'An executive or an agent should be able to understand the state of this project from these nine documents before opening anything else.',
      '',
      table(
        ['Read this', 'To learn'],
        [
          ['[Executive summary](../01_EXECUTIVE_STRATEGY/EXECUTIVE_SUMMARY.md)', 'What SALIS AUTO is and why it exists'],
          ['[Documentation status](DOCUMENTATION_STATUS.md)', 'What is documented, what is generated, what is stale'],
          ['[Gap report](DOCUMENTATION_GAP_REPORT.md)', 'What is missing or unverified — read before trusting anything else'],
          ['[Business capability map](../07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md)', 'What the product does, by capability'],
          ['[Master architecture](../14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md)', 'How it is built, current versus target'],
          ['[Requirements traceability](../09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md)', 'Objective → capability → API → test, and where the chain breaks'],
          ['[API overview](../17_API_INTEGRATION/API_OVERVIEW.md)', `The ${model.api.length}-endpoint surface and its cross-cutting contract`],
          ['[RBAC matrix](../19_SECURITY/RBAC_MATRIX.md)', 'Who may do what, and the six-letter grant alphabet'],
          ['[Production readiness](../30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md)', 'What still blocks a release'],
        ],
      ),
      '',
      '## The architecture',
      '',
      table(
        ['Section', 'Purpose', 'Documents'],
        SECTIONS.map((s) => [`\`${s.dir}/\``, s.purpose, docs.filter((d) => d.section === s.dir).length]),
      ),
      '',
      '## Documents outside the numbered architecture',
      '',
      `${legacy.length} documents sit in the pre-existing \`docs/\` folders (\`system/\`, \`requirements/\`, \`project-management/\`, \`knowledge-base/\`, \`mermaid/\`, \`visualizations/\` and others). They were **not** deleted or bulk-moved: many are accurate, several are the only record of a decision, and a migration that moves 300 files in one commit destroys the ability to review any of them. \`DOCUMENTATION_MIGRATION_MANIFEST.md\` classifies each one and records where it is going.`,
      '',
      table(
        ['Folder', 'Documents'],
        Object.entries(
          legacy.reduce((acc, d) => {
            acc[d.section] = (acc[d.section] ?? 0) + 1
            return acc
          }, {}),
        )
          .sort((a, b) => b[1] - a[1])
          .map(([folder, count]) => [`\`docs/${folder}/\``, count]),
      ),
      '',
      '## Machine-readable registries',
      '',
      'The Markdown is a view. These are the canonical form, and what `docs:check` and SAHEL read.',
      '',
      table(
        ['Registry', 'Holds', 'Generated from'],
        [
          ['`project-control/ENTITY_REGISTRY.json`', `${model.entities.length} tables with every column`, '`server/src/db/schema.ts`'],
          ['`project-control/RELATIONSHIP_REGISTRY.json`', `${model.relationships.relationships.length} relationships, declared versus inferred`, '`server/src/db/schema.ts`'],
          ['`project-control/API_REGISTRY.json`', `${model.api.length} endpoints with guards and scopes`, 'the route files'],
          ['`project-control/PERMISSION_REGISTRY.json`', `${model.rbac.totals.cells} permission cells, scopes, ceilings, SOD`, '`packages/contract/src/rbac.ts`'],
          ['`project-control/BUSINESS_RULES.json`', `${model.rules.length} rules, each naming its function`, '`packages/contract/src/rules/*.ts`'],
          ['`project-control/STATE_MACHINE_REGISTRY.json`', `${model.stateMachines.length} lifecycles`, '`packages/contract/src/entities/*.ts`'],
          ['`project-control/TEST_REGISTRY.json`', `${model.tests.length} suites, ${model.tests.reduce((s, t) => s + t.caseCount, 0)} cases`, 'the spec files'],
          ['`project-control/CAPABILITY_REGISTRY.json`', `${model.capabilities.length} capabilities linked to everything below them`, 'modules + screen domains'],
          ['`project-control/SECURITY_REGISTRY.json`', 'RLS policies, triggers, unauthenticated surface', '`server/drizzle/*.sql`'],
          ['`project-control/MASTER_REGISTRY.json`', `${model.screens.length} screens — **owned by \`app/scripts/build-registry.mjs\`, not by this system**`, 'the screen sources'],
        ],
      ),
      '',
    ].join('\n'),
  )

  // ── Section READMEs ─────────────────────────────────────────────────────
  //
  // A numbered section with no README is an empty directory a reader opens and
  // closes again. Each one states what belongs there, what is currently in it,
  // and — where the material exists but has not yet been migrated — where to
  // find it in the pre-existing tree.
  for (const section of SECTIONS) {
    const contents = docs.filter((d) => d.section === section.dir && !d.path.endsWith('README.md'))
    const legacyFor = LEGACY_POINTERS[section.dir] ?? []
    write(
      join(P.docs, section.dir, 'README.md'),
      [
        banner('control.mjs', ['the docs/ tree', 'tools/docs/lib/structure.mjs']),
        `# ${section.title}`,
        '',
        `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
        '',
        section.purpose,
        '',
        '## In this section',
        '',
        contents.length
          ? // No byte sizes here. A README that reports the size of its
            // neighbours changes whenever any of them changes by a single
            // character, which puts the generator into an oscillation it never
            // settles out of — and the size was never the useful part.
            table(
              ['Document', 'Kind'],
              contents
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((d) => [`[\`${d.path.slice(section.dir.length + 1)}\`](${d.path.slice(section.dir.length + 1)})`, d.type === 'GENERATED' ? 'generated' : 'authored']),
            )
          : '_Nothing yet. Material for this section is listed below, or has not been written._',
        '',
        legacyFor.length ? '## Related material not yet migrated' : null,
        legacyFor.length ? '' : null,
        legacyFor.length
          ? table(['Where it is now', 'What it covers'], legacyFor.map((l) => [`\`docs/${l.path}\``, l.covers])) +
            '\n\nThese are classified in the [migration manifest](../00_DOCUMENT_CONTROL/DOCUMENTATION_MIGRATION_MANIFEST.md) and move one section at a time so each change stays reviewable.'
          : null,
        '',
        '[← Documentation index](../00_DOCUMENT_CONTROL/DOCS_INDEX.md)',
        '',
      ]
        .filter((l) => l !== null)
        .join('\n'),
    )
  }

  // ── Registry ────────────────────────────────────────────────────────────
  writeJson(join(dir, 'DOCUMENTATION_REGISTRY.json'), {
    generatedAt: model.generatedAt,
    generator: 'tools/docs/generators/control.mjs',
    statusValues: ['MISSING', 'DRAFT', 'IMPLEMENTED_NOT_VERIFIED', 'VERIFIED', 'STALE', 'SUPERSEDED'],
    note: 'A document is GENERATED only if it carries the generator banner; nothing may claim the status without it. VERIFIED is never set by this generator — it requires a human or a test run as evidence, and self-certification is exactly what this registry exists to prevent.',
    totals: {
      documents: docs.length,
      inNumberedArchitecture: structured.length,
      legacy: legacy.length,
      generated: docs.filter((d) => d.type === 'GENERATED').length,
      authored: docs.filter((d) => d.type === 'NORMATIVE_OR_AUTHORED').length,
      archived: docs.filter((d) => d.archived).length,
      substantive: docs.filter((d) => d.substantive).length,
      thin: docs.filter((d) => !d.substantive).length,
      requiredTotal: required.length,
      requiredPresent: required.filter((r) => r.present).length,
      requiredMissing: missing.length,
    },
    required,
    documents: docs.map(({ abs, ...rest }) => ({
      ...rest,
      sourceOfTruth: rest.type === 'GENERATED' ? 'the source files named in its banner' : 'this document',
      status: rest.type === 'GENERATED' ? 'IMPLEMENTED_NOT_VERIFIED' : rest.substantive ? 'DRAFT' : 'DRAFT',
    })),
  })

  // ── Status ──────────────────────────────────────────────────────────────
  write(
    join(dir, 'DOCUMENTATION_STATUS.md'),
    [
      banner('control.mjs', ['the docs/ tree', 'project-control/*.json']),
      '# Documentation status',
      '',
      `**Generated:** ${model.generatedAt}`,
      '',
      '## Coverage',
      '',
      table(
        ['Measure', 'Value'],
        [
          ['Documents in `docs/`', docs.length],
          ['In the numbered architecture', structured.length],
          ['In the pre-existing folders (classified, not yet migrated)', legacy.length],
          ['Machine-generated from source', docs.filter((d) => d.type === 'GENERATED').length],
          ['Authored', docs.filter((d) => d.type === 'NORMATIVE_OR_AUTHORED').length],
          ['Substantive (> 1.2 kB)', docs.filter((d) => d.substantive).length],
          ['Thin — placeholder or stub', docs.filter((d) => !d.substantive).length],
          ['Required documents present', `${required.filter((r) => r.present).length} of ${required.length}`],
        ],
      ),
      '',
      '## What is generated, and therefore cannot go stale silently',
      '',
      table(
        ['Area', 'Derived from', 'Count'],
        [
          ['Entity catalogue, data dictionary, ERDs', '`server/src/db/schema.ts`', `${model.entities.length} tables`],
          ['Relationship catalogue', '`server/src/db/schema.ts`', `${model.relationships.relationships.length} relationships`],
          ['API reference', 'the route files', `${model.api.length} endpoints`],
          ['RBAC matrix, roles, SOD, field redaction', '`packages/contract/src/rbac.ts`', `${model.rbac.totals.cells} cells`],
          ['Business rules', '`packages/contract/src/rules/*.ts`', `${model.rules.length} rules`],
          ['State machines', '`packages/contract/src/entities/*.ts`', `${model.stateMachines.length} lifecycles`],
          ['Isolation and policies', '`server/drizzle/*.sql`', `${model.security.policies.length} policies`],
          ['Test catalogue', 'the spec files', `${model.tests.length} suites`],
          ['Screen registry view', '`project-control/MASTER_REGISTRY.json`', `${model.screens.length} screens`],
          ['Capability map, requirements, traceability', 'all of the above', `${requirements.functional.length + requirements.nonFunctional.length + requirements.data.length + requirements.security.length} requirements`],
        ],
      ),
      '',
      '`npm run docs:check` regenerates all of it and fails if the checked-in copy differs. A generated document cannot drift from the code without breaking the build.',
      '',
      '## Required documents',
      '',
      table(
        ['Document', 'Kind', 'Present', 'Substantive'],
        required.map((r) => [`\`${r.path}\``, r.generated ? 'generated' : 'authored', r.present ? 'yes' : '**no**', r.present ? (r.substantive ? 'yes' : 'thin') : '—']),
      ),
      '',
    ].join('\n'),
  )

  // ── Gap report ──────────────────────────────────────────────────────────
  const thin = docs.filter((d) => !d.substantive && !d.archived)
  const untestedEndpoints = model.api.filter((e) => !(e.tests ?? []).length)
  const noPermission = model.api.filter((e) => !e.authentication.startsWith('None') && (!e.permissionModule || String(e.permissionModule).startsWith('(')))
  const stateSetOnly = model.stateMachines.filter((m) => !m.transitionsDeclared)

  write(
    join(dir, 'DOCUMENTATION_GAP_REPORT.md'),
    [
      banner('control.mjs', ['every extractor', 'the docs/ tree']),
      '# Documentation gap report',
      '',
      `**Generated:** ${model.generatedAt}`,
      '',
      'This report exists to be read before anything else in the set is relied on. It is generated, so it cannot be quietly improved by editing it.',
      '',
      '## Headline',
      '',
      table(
        ['Measure', 'Value'],
        [
          ['Required documents', `${required.filter((r) => r.present).length} present of ${required.length}`],
          ['Documents generated from source', docs.filter((d) => d.type === 'GENERATED').length],
          ['Documents authored by hand', docs.filter((d) => d.type === 'NORMATIVE_OR_AUTHORED').length],
          ['Documents marked VERIFIED', '**0** — see "What is not verified" below'],
          ['Entities documented', `${model.entities.length} of ${model.entities.length}`],
          ['Relationships documented', `${model.relationships.relationships.length} (${model.relationships.declaredCount} FK-backed, ${model.relationships.inferredCount} convention only)`],
          ['Endpoints documented', `${model.api.length} of ${model.api.length}`],
          ['Endpoints with a linked test', `${model.api.length - untestedEndpoints.length} of ${model.api.length}`],
          ['Business rules documented', `${model.rules.length}, each naming its enforcing function`],
          ['Lifecycles with a declared transition table', `${model.stateMachines.length - stateSetOnly.length} of ${model.stateMachines.length}`],
          ['Screens registered and mapped to a capability', `${model.screens.length} of ${model.screens.length}`],
          ['Screens wired to the live API', `${model.statusTotals.dataBacked ?? '?'} of ${model.statusTotals.capabilities ?? model.screens.length}`],
          ['Test suites catalogued', `${model.tests.length} containing ${model.tests.reduce((s, t) => s + t.caseCount, 0)} cases`],
          ['Capabilities with no linked test suite', trace.untracedCapabilities],
          ['Canonical registers at least 3 days behind the newest', `${model.staleness.stale.length} of ${model.staleness.registers.length}`],
          ['Direct contradictions between registers', model.staleness.contradictions.length],
        ],
      ),
      '',
      '## What is not verified',
      '',
      '**No document in this set is marked VERIFIED, and that is deliberate.**',
      '',
      'VERIFIED would mean a person or a test run confirmed the document against the implementation on a stated date. This generator can confirm that a document was *derived* from source — which is why the generated ones cannot drift — but derivation is not verification. A generated document faithfully reproduces a parse of the code; whether that parse captures what the code *means* is a human judgement.',
      '',
      'Marking documents VERIFIED because a generator wrote them is precisely the self-certification this system was built to avoid.',
      '',
      '## Gaps in the implementation that the documentation records',
      '',
      '### 1. Referential integrity is not in the database',
      '',
      `${model.relationships.inferredCount} of ${model.relationships.relationships.length} relationships have no foreign key. Orphaned references are possible and the database will not refuse them. This is an architectural position, not an oversight, but it is load-bearing and undocumented elsewhere.`,
      '',
      '### 2. One lifecycle in eighteen declares its legal transitions',
      '',
      `\`jobCard.JOB_STAGE_TRANSITIONS\` has a transition table a single guard enforces. The other ${stateSetOnly.length} lifecycles declare a state enum only; their legal moves are whatever the route handlers check. Those are listed individually in \`docs/12_UML_BPMN_MODELS/STATE_MACHINES.md\`.`,
      '',
      `### 3. ${noPermission.length} authenticated endpoints state no permission guard in the handler`,
      '',
      noPermission.length
        ? table(['Method', 'Path', 'Declared in'], noPermission.slice(0, 40).map((e) => [e.method, `\`${e.path}\``, `\`${e.source}\``])) +
          '\n\nSome of these guard through a shared helper or a `preHandler` this parser does not follow, so the number over-reports. Each still needs a human to confirm which.'
        : '_None._',
      '',
      `### 4. ${untestedEndpoints.length} endpoints have no test matched to them by path`,
      '',
      'Matching is by path string, so a test that reaches an endpoint through a helper or a golden path does not match. The number over-reports and is still the right one to drive down.',
      '',
      `### 5. ${model.statusTotals.mockOnly ?? '?'} screens read design fixtures rather than the API`,
      '',
      `Measured in \`project-control/STATUS.json\`, not asserted here. Every screen renders and every screen has a content assertion — and ${model.statusTotals.mockOnly ?? '?'} of ${model.statusTotals.capabilities ?? '?'} are not yet connected to live data.`,
      '',
      '## The canonical registers disagree with each other',
      '',
      `The registries under \`project-control/\` are each generated at their own time by their own tooling, and nothing makes them agree. The newest is \`${model.staleness.newest?.register}\` at ${model.staleness.newest?.stamp}; ${model.staleness.stale.length} registers are at least ${model.staleness.staleThresholdDays} days behind it.`,
      '',
      table(
        ['Register', 'Generated', 'Days behind the newest'],
        model.staleness.stale.map((s2) => [`\`project-control/${s2.register}\``, s2.stamp, s2.daysBehind]),
      ),
      '',
      model.staleness.contradictions.length
        ? [
            'Staleness alone would be tolerable. These are direct contradictions — one register quoting another\'s numbers from an earlier state, and reading as authoritative while disagreeing with the register it cites:',
            '',
            table(['Claim', 'Current reality'], model.staleness.contradictions.map((c) => [c.claim, c.reality])),
            '',
            'A contradiction between two canonical registers is worse than a single stale document, because it carries the authority of two sources. It is reported rather than resolved here: picking a winner would hide the disagreement, which is the fact a reader most needs. Regenerating the stale registers is the fix, and it belongs to their owners rather than to the documentation toolchain.',
          ].join('\n')
        : '_No cross-register contradictions detected._',
      '',
      '## Gaps in the documentation itself',
      '',
      '### Requirements are as-built, not as-elicited',
      '',
      'The requirements catalogue is reverse-engineered from the implementation and says so on every row. There is no elicited, stakeholder-signed requirements baseline in this workspace, so the question "did we build what the business asked for" cannot be answered from these documents. Closing that needs a business analyst and a stakeholder, not a generator.',
      '',
      '### Market and financial claims need evidence',
      '',
      'Market sizing, competitor positioning, pricing and financial projections are business inputs, not properties of the code. Anything in `02_MARKET_BUSINESS_RESEARCH/` and `24_COMMERCIAL_FINANCIAL/` that is not sourced is marked `RESEARCH_REQUIRED`, and nothing in this set fabricates a figure to fill the space.',
      '',
      '### Legal conclusions need a lawyer',
      '',
      'ZATCA, VAT and privacy material states *system requirements* — what the software does and must do. Where the question is whether that satisfies a legal obligation, it is marked `LEGAL_REVIEW_REQUIRED` rather than answered.',
      '',
      `### ${thin.length} documents are thin`,
      '',
      'Under 1.2 kB: a heading and a sentence or two. Some are legitimately short (an index, an ADR with a one-line decision); others are placeholders. They are listed so the difference can be judged rather than assumed.',
      '',
      table(['Document', 'Bytes'], thin.slice(0, 50).map((d) => [`\`docs/${d.path}\``, d.bytes])),
      thin.length > 50 ? `\n_…and ${thin.length - 50} more, in \`DOCUMENTATION_REGISTRY.json\` where \`substantive\` is false._` : '',
      '',
      '## Missing required documents',
      '',
      missing.length ? table(['Document', 'Kind'], missing.map((r) => [`\`${r.path}\``, r.generated ? 'generated' : 'authored'])) : '_None — every required document is present._',
      '',
      '## Recommended next actions, in order',
      '',
      [
        '1. **Establish a requirements baseline.** Everything else in this set traces to the implementation; nothing traces to a stated business need. This is the largest structural gap.',
        `2. **Declare transition tables for the remaining ${stateSetOnly.length} lifecycles**, or document in each domain document where the transition is guarded. An invoice or a purchase order moving between states unguarded is a financial-control gap, not a documentation one.`,
        `3. **Confirm the ${noPermission.length} endpoints with no stated guard.** Each is either guarded through a helper (fix the documentation) or genuinely open (fix the code).`,
        `4. **Drive the ${untestedEndpoints.length} path-unmatched endpoints down**, starting with the write endpoints that move money or stock.`,
        '5. **Decide the foreign-key position explicitly.** Either add constraints or record an ADR saying integrity is the application\'s job and why.',
        `6. **Connect the remaining ${model.statusTotals.mockOnly ?? '?'} screens to the API**, which is the bulk of the product work still outstanding.`,
        '7. **Complete the documentation migration** in `DOCUMENTATION_MIGRATION_MANIFEST.md`, one section per change so each move is reviewable.',
      ].join('\n'),
      '',
    ].join('\n'),
  )

  return { docs: docs.length, required: required.length, missing: missing.length, thin: thin.length }
}
