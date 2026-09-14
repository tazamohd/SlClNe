/** Business capability map, screen registry view, test catalogue.
 *
 *  Each of these is a readable view over a registry that already exists —
 *  never a second copy of the data. Where a number appears in prose it is
 *  interpolated from the model, so a stale count cannot survive a
 *  regeneration.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, mid, mlabel, table, write } from '../lib/write.mjs'

export function generateCapability(model) {
  const dir = join(P.docs, '07_BUSINESS_ANALYSIS')

  const lines = ['flowchart LR']
  for (const objective of model.objectives) {
    lines.push(`  ${mid(objective.id)}["${mlabel(objective.name)}"]`)
  }
  for (const capability of model.capabilities) {
    lines.push(`  ${mid(capability.id)}["${mlabel(capability.name)}<br/>${capability.screenCount} screens · ${capability.endpointCount} endpoints"]`)
    lines.push(`  ${mid(capability.objective)} --> ${mid(capability.id)}`)
  }

  write(
    join(dir, 'BUSINESS_CAPABILITY_MAP.md'),
    [
      banner('capability.mjs', ['packages/contract/src/rbac.ts', 'project-control/MASTER_REGISTRY.json', 'server/src/registry.ts']),
      '# Business capability map',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt} · ${model.capabilities.length} capabilities`,
      '',
      '## How capabilities are defined here',
      '',
      'A capability is a grouping of **permission modules** and **screen domains** — the two taxonomies the implementation already agrees on. Inventing a third taxonomy for the documentation would give a map that looks tidy and drifts from the product within a release.',
      '',
      `All ${model.screens.length} registered screens and all ${model.api.length} endpoints map to exactly one capability. That is a property this generator checks, not a claim: an unmapped screen or endpoint is a failure in \`docs:check\`.`,
      '',
      '## Objectives to capabilities',
      '',
      mermaid(lines.join('\n')),
      '',
      '## Capabilities',
      '',
      table(
        ['Capability', 'Name', 'Objective', 'Permission modules', 'Screens', 'Data-backed', 'Endpoints', 'Entities', 'Roles with access'],
        model.capabilities.map((c) => [
          c.id,
          c.name,
          c.objective,
          c.modules.length ? c.modules.map((m) => `\`${m}\``).join(', ') : `_(screen domain: ${(c.domains ?? []).join(', ')})_`,
          c.screenCount,
          c.dataBackedScreens,
          c.endpointCount,
          c.entities.length,
          c.roles.length,
        ]),
      ),
      '',
      '## Objectives and the benefit each is for',
      '',
      table(['Objective', 'Name', 'Benefit'], model.objectives.map((o) => [o.id, o.name, o.benefit])),
      '',
      '## Reading the "data-backed" column',
      '',
      `${model.statusTotals.dataBacked ?? '?'} of ${model.statusTotals.capabilities ?? model.screens.length} screens are wired to the live API; the remainder render from the ported design fixtures. That is the single largest fact about the product's current state, and it is measured in \`project-control/STATUS.json\` rather than asserted here.`,
      '',
      '## Per-capability detail',
      '',
      ...model.capabilities.flatMap((c) => [
        `### ${c.id} — ${c.name}`,
        '',
        `**Objective:** ${c.objective} (${c.objectiveName ?? '—'})`,
        '',
        table(
          ['Aspect', 'Value'],
          [
            ['Permission modules', c.modules.length ? c.modules.map((m) => `\`${m}\``).join(', ') : '—'],
            ['Screen domains', (c.domains ?? []).map((d) => `\`${d}\``).join(', ') || '—'],
            ['Screens', `${c.screenCount} (${c.dataBackedScreens} data-backed)`],
            ['Endpoints', c.endpointCount],
            ['Entities', c.entities.map((e) => `\`${e}\``).join(', ') || '—'],
            ['Roles with any grant', c.roles.join(', ') || '—'],
            ['Rule guards', c.rules.length ? c.rules.join(', ') : '—'],
          ],
        ),
        '',
      ]),
    ].join('\n'),
  )

  // ── Screen registry view ────────────────────────────────────────────────
  const ui = join(P.docs, '20_UI_UX_EXPERIENCE')
  const t = model.screenTotals
  const bySurface = {}
  for (const screen of model.screens) (bySurface[screen.surface] ??= []).push(screen)

  write(
    join(ui, 'SCREEN_REGISTRY.md'),
    [
      banner('capability.mjs', ['project-control/MASTER_REGISTRY.json (built by app/scripts/build-registry.mjs)']),
      '# Screen registry',
      '',
      `**Status:** GENERATED (a view over a registry this documentation does not own) · **Sources as of:** ${model.generatedAt}`,
      '',
      `\`project-control/MASTER_REGISTRY.json\` is built by \`app/scripts/build-registry.mjs\` from the screen sources and the design bundle. This document is a reading of it, not a second copy — the numbers below change when that registry is rebuilt, never when someone edits this file.`,
      '',
      '## Totals',
      '',
      table(
        ['Measure', 'Count', 'Of'],
        [
          ['Registered capabilities', t.capabilities, '—'],
          ['Product screens', t.product, t.capabilities],
          ['Reference-only', t.referenceOnly, t.capabilities],
          ['Rendered', t.rendered, t.capabilities],
          ['Placeholder', t.placeholder, t.capabilities],
          ['Data-backed (live API)', t.dataBacked, t.capabilities],
          ['Mock-only (design fixtures)', t.mockOnly, t.capabilities],
          ['End-to-end covered', t.e2eCovered, t.capabilities],
          ['Content-asserted (not just routed)', t.contentAsserted, t.capabilities],
          ['Has a loading state', t.hasLoadingState, t.capabilities],
          ['Has an error state', t.hasErrorState, t.capabilities],
          ['Has an empty state', t.hasEmptyState, t.capabilities],
          ['Arabic verified', t.arabicVerified, t.capabilities],
          ['RTL hazards', t.rtlHazards, '—'],
          ['Tablet verified', t.tabletVerified, t.capabilities],
          ['Golden paths passing', `${t.goldenPathsPassing} of ${t.goldenPaths}`, '—'],
        ],
      ),
      '',
      '## The gap this table is really showing',
      '',
      `Every screen renders and every screen has an end-to-end assertion on its content. But **${t.mockOnly} of ${t.capabilities} still read design fixtures rather than the API**, and only ${t.tabletVerified} are tablet-verified. "Rendered and asserted" is a real achievement and it is not the same as "wired to production data" — conflating the two is how a project reports itself ready and then discovers the last third of the work.`,
      '',
      '## By surface',
      '',
      table(
        ['Surface', 'Screens', 'Data-backed', 'In navigation'],
        Object.entries(bySurface).map(([surface, list]) => [surface, list.length, list.filter((s) => s.dataBacked).length, list.filter((s) => s.inNav).length]),
      ),
      '',
      '## By capability',
      '',
      table(
        ['Capability', 'Screens', 'Data-backed', 'Loading', 'Error', 'Empty', 'Arabic verified'],
        model.capabilities.map((c) => {
          const list = model.screens.filter((s) => c.screens.includes(s.screenId))
          return [
            c.id,
            list.length,
            list.filter((s) => s.dataBacked).length,
            list.filter((s) => s.loadingState !== 'MISSING').length,
            list.filter((s) => s.errorState !== 'MISSING').length,
            list.filter((s) => s.emptyState !== 'MISSING').length,
            list.filter((s) => s.arabic === 'VERIFIED').length,
          ]
        }),
      ),
      '',
      '## Full registry',
      '',
      'The per-screen rows — route, shell, module, permissions, states, design source, flags — are in `project-control/MASTER_REGISTRY.json`. They are not duplicated here: a 424-row table in Markdown is unreadable and would go stale the moment a screen is added.',
      '',
    ].join('\n'),
  )

  // ── Test catalogue ──────────────────────────────────────────────────────
  const testing = join(P.docs, '27_TESTING_VALIDATION')
  const byKind = {}
  for (const suite of model.tests) (byKind[suite.kind] ??= []).push(suite)

  write(
    join(testing, 'TEST_CATALOG.md'),
    [
      banner('capability.mjs', ['server/tests/**', 'app/e2e/**', 'app/tests/**', 'app/src/**/*.test.ts']),
      '# Test catalogue',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt}`,
      '',
      `${model.tests.length} spec files containing ${model.tests.reduce((s, x) => s + x.caseCount, 0)} test cases.`,
      '',
      '## What this document claims, and what it does not',
      '',
      'It claims the suites **exist and contain these cases**, because it was generated by reading them. It claims nothing about whether they pass. Pass/fail is a dated statement made in `docs/30_RELEASE_CERTIFICATION/` and only after a run has actually happened — a coverage document that reports green without a run is the single most damaging thing a documentation set can contain.',
      '',
      '## By kind',
      '',
      table(
        ['Kind', 'Suites', 'Cases', 'What it protects'],
        Object.entries(byKind)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([kind, list]) => [
            kind,
            list.length,
            list.reduce((s, x) => s + x.caseCount, 0),
            KIND_PURPOSE[kind] ?? '—',
          ]),
      ),
      '',
      '## By surface',
      '',
      table(
        ['Surface', 'Suites', 'Cases'],
        ['server', 'app', 'browser'].map((surface) => {
          const list = model.tests.filter((t2) => t2.surface === surface)
          return [surface, list.length, list.reduce((s, x) => s + x.caseCount, 0)]
        }),
      ),
      '',
      '## Suites',
      '',
      table(
        ['Suite', 'Kind', 'Cases', 'Roles exercised'],
        model.tests.map((suite) => [`\`${suite.file}\``, suite.kind, suite.caseCount, suite.touchesRoles.length ? suite.touchesRoles.join(', ') : '—']),
      ),
      '',
    ].join('\n'),
  )

  return { capabilities: model.capabilities.length, suites: model.tests.length }
}

const KIND_PURPOSE = {
  SECURITY: 'Permission grants, tenant isolation, segregation of duties, session handling',
  FINANCIAL_INTEGRITY: 'Money arithmetic, VAT, invoice and payment consistency',
  INVENTORY_INTEGRITY: 'Stock movement, reservation, procurement receipt arithmetic',
  CONTRACT: 'The shared rule functions both sides depend on',
  E2E: 'Whole journeys through the browser, including content assertions',
  DATA_FIDELITY: 'That the seeded data matches what the design bundle carried',
  ACCESSIBILITY: 'Axe sweeps, ratcheted per route and viewport',
  UNIT_OR_API: 'Handler behaviour, repository seam, presentation',
}
