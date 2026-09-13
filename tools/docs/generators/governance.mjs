/** Project, PRINCE2 and release views over the canonical registers.
 *
 *  These are views, not copies. The risk register lives in
 *  `project-control/RISK_REGISTER.json` and nowhere else; PRINCE2 governance,
 *  the project dashboard and ITIL each read it. Two copies of a risk register
 *  do not stay equal — they diverge, and then a status meeting runs off one
 *  while a release decision is made off the other.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, table, write } from '../lib/write.mjs'

const REGISTERS = [
  'project-control/RISK_REGISTER.json',
  'project-control/BLOCKERS.json',
  'project-control/FINDINGS.json',
  'project-control/RELEASE_GATES.json',
  'project-control/DEPENDENCIES.json',
  'project-control/OWNERSHIP.json',
  'project-control/STATUS.json',
]

const OPEN = (status) => !['closed', 'resolved', 'mitigated', 'done', 'RESOLVED', 'CLOSED'].includes(String(status))

export function generateGovernance(model) {
  const risks = model.risks?.risks ?? []
  const blockers = model.blockers?.blockers ?? []
  const findings = model.findings?.findings ?? []
  const gates = model.releaseGates?.gates ?? []
  const waves = model.dependencies?.waves ?? []
  const t = model.statusTotals

  const openRisks = risks.filter((r) => OPEN(r.status))
  const openFindings = findings.filter((f) => OPEN(f.severity) && f.severity !== 'RESOLVED')
  const gatesPassing = gates.filter((g) => g.status === 'PASS' || g.status === 'PASSED')
  const gatesFailing = gates.filter((g) => g.status === 'FAIL' || g.status === 'FAILED')
  const gatesUncheckable = gates.filter((g) => g.status === 'UNCHECKABLE')

  // ── Project dashboard ───────────────────────────────────────────────────
  write(
    join(P.docs, '04_PROJECT_MANAGEMENT', 'PROJECT_DASHBOARD.md'),
    [
      banner('governance.mjs', REGISTERS),
      '# Project dashboard',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      'A view over the canonical registers. Nothing here is entered by hand; if a number looks wrong, the register is wrong.',
      '',
      '## Where the project is',
      '',
      table(
        ['Measure', 'Value', 'Source'],
        [
          ['Registered capabilities', t.capabilities ?? '—', '`STATUS.json`'],
          ['Rendering', `${t.rendered ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['Wired to the API', `${t.dataBacked ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['Reading design fixtures', `${t.mockOnly ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['End-to-end covered', `${t.e2eCovered ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['Golden paths passing', `${t.goldenPathsPassing ?? '—'} of ${t.goldenPaths ?? '—'}`, '`GOLDEN_PATHS.json`'],
          ['Arabic verified', `${t.arabicVerified ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['Tablet verified', `${t.tabletVerified ?? '—'} of ${t.capabilities ?? '—'}`, '`STATUS.json`'],
          ['API endpoints', model.api.length, 'the route files'],
          ['Test cases', model.tests.reduce((s, x) => s + x.caseCount, 0), 'the spec files'],
          ['Open risks', `${openRisks.length} of ${risks.length}`, '`RISK_REGISTER.json`'],
          ['Open blockers', `${blockers.length}`, '`BLOCKERS.json`'],
          ['Unresolved findings', `${openFindings.length} of ${findings.length}`, '`FINDINGS.json`'],
          ['Release gates passing', `${gatesPassing.length} of ${gates.length}`, '`RELEASE_GATES.json`'],
        ],
      ),
      '',
      '## The one number that matters most',
      '',
      `**${t.mockOnly ?? '—'} of ${t.capabilities ?? '—'} screens still read design fixtures rather than the API.** Everything else on this dashboard looks healthier than the project is, because "renders and is asserted" is a genuine achievement that is not the same as "works against the server". Read every other row against that one.`,
      '',
      '## Open blockers',
      '',
      blockers.length
        ? table(['ID', 'Severity', 'Title', 'What to do', 'Owner'], blockers.map((b) => [b.id, b.severity, b.title, b.detail ?? '—', b.owner ?? '—']))
        : '_None open._',
      '',
      '## Open risks',
      '',
      openRisks.length
        ? table(['ID', 'Risk', 'Likelihood', 'Impact', 'Status', 'Owner'], openRisks.map((r) => [r.id, r.title, r.likelihood, r.impact, r.status, r.owner ?? '—']))
        : '_No open risks recorded._',
      '',
      '## Release gates',
      '',
      table(
        ['Gate', 'Status', 'Evidence'],
        gates.map((g) => [`${g.id} — ${g.title}`, g.status === 'PASS' || g.status === 'PASSED' ? 'pass' : g.status === 'UNCHECKABLE' ? '_uncheckable_' : `**${g.status}**`, (g.evidence ?? '—').slice(0, 220)]),
      ),
      '',
      gatesUncheckable.length
        ? `**${gatesUncheckable.length} gates are uncheckable**, which is not the same as passing. A gate with no artefact to check against cannot be evidence for a release decision, and treating it as a pass is how a gate becomes ceremony.`
        : '',
      '',
      '## Delivery waves',
      '',
      waves.length
        ? table(['Wave', 'Name', 'Requires', 'Exit criterion'], waves.map((w) => [w.id, w.name, (w.requires ?? []).join(', ') || '—', w.exit ?? '—']))
        : '_No wave plan recorded._',
      '',
    ].join('\n'),
  )

  // ── PRINCE2 view ────────────────────────────────────────────────────────
  write(
    join(P.docs, '03_PRINCE2_GOVERNANCE', 'PRINCE2_REGISTER_VIEWS.md'),
    [
      banner('governance.mjs', REGISTERS),
      '# PRINCE2 register views',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      '## How PRINCE2 is applied here',
      '',
      'PRINCE2 asks for a risk register, an issue register, a quality register and a lessons log. This project keeps **one** register of each fact, under `project-control/`, and presents PRINCE2 views over them. A second copy formatted as a PRINCE2 register would diverge from the first within a fortnight, and the governance meeting would then be run off the stale one.',
      '',
      table(
        ['PRINCE2 artefact', 'Canonical source', 'View'],
        [
          ['Risk Register', '`project-control/RISK_REGISTER.json`', 'This document, and the project dashboard'],
          ['Issue Register', '`project-control/FINDINGS.json`', 'This document'],
          ['Quality Register', '`project-control/RELEASE_GATES.json` + `TEST_REGISTRY.json`', 'This document, and the test catalogue'],
          ['Product Register', '`project-control/MASTER_REGISTRY.json`', 'The screen registry'],
          ['Daily Log / blockers', '`project-control/BLOCKERS.json`', 'The project dashboard'],
          ['Project Plan / stages', '`project-control/DEPENDENCIES.json` (waves)', 'The project dashboard'],
          ['Business Case', '`docs/project-management/prince2/business-case.md`', 'Authored, pre-existing — see the migration manifest'],
          ['Project Initiation Documentation', '`docs/project-management/prince2/project-initiation-document.md`', 'Authored, pre-existing'],
          ['Product Descriptions', '`docs/project-management/prince2/product-descriptions.md`', 'Authored, pre-existing'],
        ],
      ),
      '',
      '## Risk register (PRINCE2 view)',
      '',
      risks.length
        ? table(
            ['ID', 'Risk', 'Probability', 'Impact', 'Response status', 'Owner', 'Detail'],
            risks.map((r) => [r.id, r.title, r.likelihood, r.impact, r.status, r.owner ?? '—', (r.detail ?? '').slice(0, 200)]),
          )
        : '_Empty._',
      '',
      '## Issue register (PRINCE2 view)',
      '',
      findings.length
        ? table(
            ['ID', 'Severity', 'Issue', 'Detail'],
            findings.slice(0, 40).map((f) => [f.id, f.severity, f.title, (f.detail ?? '').slice(0, 200)]),
          ) + (findings.length > 40 ? `\n\n_${findings.length - 40} further findings in \`project-control/FINDINGS.json\`._` : '')
        : '_Empty._',
      '',
      '## Quality register (PRINCE2 view)',
      '',
      table(
        ['Quality criterion', 'Method', 'Result'],
        [
          ['Every capability renders', 'Registry build + e2e', `${t.rendered ?? '—'} of ${t.capabilities ?? '—'}`],
          ['Content asserted, not just routed', 'e2e content assertions', `${t.contentAsserted ?? '—'} of ${t.capabilities ?? '—'}`],
          ['Golden paths pass', 'Playwright', `${t.goldenPathsPassing ?? '—'} of ${t.goldenPaths ?? '—'}`],
          ['Permission matrix enforced server-side', '`server/tests/authz-matrix.test.ts`', 'suite present'],
          ['Frontend and server matrices identical', '`server/tests/rbac-parity.test.ts`', 'suite present'],
          ['Tenant isolation', '`server/tests/isolation.test.ts` + RLS', 'suite present'],
          ['Segregation of duties enforced', '`server/tests/authz-sod.test.ts`', 'suite present'],
          ['Accessibility contrast ratchet', '`app/e2e/a11y.spec.ts` + `BASELINE.json`', 'ratcheted'],
          ['Arabic and RTL', 'Registry verification', `${t.arabicVerified ?? '—'} verified, ${t.rtlHazards ?? '—'} hazards`],
        ],
      ),
      '',
      '**Present is not passing.** The rows that say "suite present" mean the suite exists and was catalogued by reading it. Whether it passes is a dated statement made only after a run — see the test catalogue.',
      '',
    ].join('\n'),
  )

  // ── Release register ────────────────────────────────────────────────────
  write(
    join(P.docs, '30_RELEASE_CERTIFICATION', 'RELEASE_GATES.md'),
    [
      banner('governance.mjs', ['project-control/RELEASE_GATES.json']),
      '# Release gates',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      `${gates.length} gates: ${gatesPassing.length} passing, ${gatesFailing.length} failing, ${gatesUncheckable.length} uncheckable.`,
      '',
      '## Uncheckable is not passing',
      '',
      `${gatesUncheckable.length} gates cannot be evaluated, because the artefact they check against does not exist in this repository — no defect tracker, no production telemetry, no signed acceptance record. A gate with nothing to check is not evidence for a release decision, and counting it as a pass is how a gate becomes ceremony. They are reported separately here for that reason.`,
      '',
      '## All gates',
      '',
      table(
        ['ID', 'Gate', 'Status', 'Evidence'],
        gates.map((g) => [g.id, g.title, g.status, (g.evidence ?? '—').slice(0, 300)]),
      ),
      '',
    ].join('\n'),
  )

  return { risks: risks.length, blockers: blockers.length, gates: gates.length }
}
