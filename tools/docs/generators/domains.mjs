/** One document per business domain, to a single standard, and the scenario
 *  catalogue.
 *
 *  A domain document is the page an engineer opens when they are asked to
 *  change something in an area they have not worked in. It has to answer, in
 *  one place: what lives here, who may touch it, what rules bind it, what the
 *  API surface is, and what is not finished. Writing nineteen of those by hand
 *  guarantees the nineteenth is a stub; deriving them guarantees all nineteen
 *  stay true.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, mid, table, write } from '../lib/write.mjs'
import { DOMAIN_TABLES } from './data.mjs'

const SOURCES = [
  'project-control/CAPABILITY_REGISTRY.json',
  'project-control/API_REGISTRY.json',
  'project-control/ENTITY_REGISTRY.json',
  'project-control/PERMISSION_REGISTRY.json',
  'project-control/BUSINESS_RULES.json',
  'project-control/MASTER_REGISTRY.json',
]

export function generateDomains(model) {
  const dir = join(P.docs, '21_DOMAIN_DOCUMENTATION')
  const written = []

  for (const capability of model.capabilities) {
    const endpoints = model.api.filter((e) => capability.endpoints.includes(e.id))
    const screens = model.screens.filter((s) => capability.screens.includes(s.screenId))
    const tables = [...new Set(endpoints.map((e) => e.table).filter(Boolean))]
    const entities = model.entities.filter((e) => tables.includes(e.table))
    const rules = model.rules.filter((r) => capability.rules.includes(r.id))
    const machines = model.stateMachines.filter((m) => tables.some((t) => t.replace(/_/g, '').startsWith(m.entity.toLowerCase().slice(0, 6))))
    const relationships = model.relationships.relationships.filter((r) => tables.includes(r.from))

    const grants = model.rbac.roles
      .map((role) => ({
        role,
        grants: capability.modules
          .map((m) => ({ module: m, grant: model.rbac.matrix[m]?.[role] ?? '' }))
          .filter((g) => g.grant),
      }))
      .filter((r) => r.grants.length)

    const file = `${capability.id.replace('CAP-', '')}.md`
    const body = [
      banner('domains.mjs', SOURCES),
      `# Domain — ${capability.name}`,
      '',
      `**Status:** GENERATED · **Capability:** ${capability.id} · **Sources as of:** ${model.generatedAt}`,
      '',
      '## Purpose and scope',
      '',
      `This domain serves the objective **${capability.objective}** (${capability.objectiveName ?? '—'}). It comprises ${screens.length} screens, ${endpoints.length} API endpoints and ${entities.length} entities, gated by the ${capability.modules.length ? capability.modules.map((m) => `\`${m}\``).join(', ') + ` permission module${capability.modules.length === 1 ? '' : 's'}` : `\`${(capability.domains ?? []).join('`, `')}\` screen domain`}.`,
      '',
      capability.modules.length
        ? null
        : '**This domain has no permission module of its own.** Its screens are grouped by their registry `domain` instead — the registry files them that way because they are pre-authorization, unauthenticated, or reference material rather than a gated business surface.',
      '',
      '## Actors',
      '',
      grants.length
        ? table(
            ['Role', 'Data scope', 'Approval ceiling', 'Grants in this domain'],
            grants.map((g) => {
              const meta = model.rbac.roleMeta[g.role] ?? {}
              return [
                g.role,
                meta.scope ?? '—',
                meta.unlimited ? 'unlimited' : meta.approvalLimitSar === 0 ? 'may not approve' : meta.approvalLimitSar != null ? `SAR ${meta.approvalLimitSar.toLocaleString('en-US')}` : '—',
                g.grants.map((x) => `\`${x.module}:${x.grant}\``).join(' '),
              ]
            }),
          )
        : '_No permission module gates this domain, so no grants apply. Access is controlled at the route level or the surface is unauthenticated._',
      '',
      'The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.',
      '',
      '## Entities',
      '',
      entities.length
        ? table(
            ['Table', 'Columns', 'Tenant', 'Branch', 'Soft delete', 'RLS', 'Money columns'],
            entities.map((e) => [`\`${e.table}\``, e.columns.length, e.tenantScoped ? 'yes' : 'no', e.branchScoped ? 'yes' : 'no', e.softDelete ? 'yes' : 'no', e.rlsEnabled ? 'yes' : '**no**', e.moneyColumns.length ? e.moneyColumns.map((c) => `\`${c}\``).join(', ') : '—']),
          )
        : '_No entity is owned exclusively by this domain._',
      '',
      entities.length && relationships.length ? '### Relationships' : null,
      '',
      relationships.length
        ? table(
            ['From', 'Column', 'To', 'Optionality', 'Enforcement'],
            relationships.map((r) => [`\`${r.from}\``, `\`${r.fromColumn}\``, `\`${r.to}\``, r.optionality, r.enforcement === 'DECLARED' ? 'FK' : '**convention only**']),
          ) + '\n\nRelationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.'
        : null,
      '',
      '## API surface',
      '',
      endpoints.length
        ? table(
            ['Method', 'Path', 'Permission', 'Kind', 'Idempotent', 'Tests'],
            endpoints.map((e) => [e.method, `\`${e.path}\``, e.permissionModule ? `${e.permissionModule}:${e.permissionAction ?? '?'}` : '—', e.kind === 'GENERATED' ? 'generated' : 'explicit', e.idempotent ? 'yes' : '', (e.tests ?? []).length || '**0**']),
          )
        : '_No API endpoints. This domain is presentation-only._',
      '',
      '## Business rules',
      '',
      rules.length
        ? table(['ID', 'Rule', 'Kind', 'Enforced in'], rules.map((r) => [r.id, r.statement ?? `\`${r.name}\``, r.kind, `\`${r.enforcedIn}\``]))
        : '_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._',
      '',
      '## Lifecycles',
      '',
      machines.length
        ? machines
            .map((m) =>
              [
                `### \`${m.name}\` (${m.entity})`,
                '',
                m.transitionsDeclared
                  ? `**Declared transition table** — ${m.states.length} states, ${m.transitions.length} legal transitions, enforced for every caller.\n\n` +
                    mermaid(['stateDiagram-v2', ...m.transitions.filter((t) => t.to).map((t) => `  ${mid(t.from)} --> ${mid(t.to)}`)].join('\n'))
                  : `**State set only** — states: ${m.states.map((s) => `\`${s}\``).join(', ')}. No transition table is declared; legal moves are whatever the route handlers check.`,
                '',
              ].join('\n'),
            )
            .join('\n')
        : '_No lifecycle in the contract belongs to this domain._',
      '',
      '## Screens',
      '',
      screens.length
        ? table(
            ['Screen', 'Route', 'Surface', 'Data-backed', 'Loading', 'Error', 'Empty', 'Arabic', 'e2e'],
            screens.map((s) => [
              s.screenId,
              `\`${s.route}\``,
              s.surface,
              s.dataBacked ? 'yes' : '**mock**',
              s.loadingState === 'MISSING' ? '' : 'yes',
              s.errorState === 'MISSING' ? '' : 'yes',
              s.emptyState === 'MISSING' ? '' : 'yes',
              s.arabic === 'VERIFIED' ? 'verified' : s.arabic ?? '',
              s.tests?.e2e ? 'yes' : '',
            ]),
          )
        : '_No screens._',
      '',
      '## Known gaps in this domain',
      '',
      gapsFor(capability, { endpoints, screens, entities, rules, machines, relationships }),
      '',
      '## Evidence',
      '',
      table(
        ['Fact', 'Source'],
        [
          ['Entities and columns', '`server/src/db/schema.ts`'],
          ['Endpoints and guards', endpoints.length ? [...new Set(endpoints.map((e) => `\`${e.source}\``))].slice(0, 4).join(', ') : '—'],
          ['Permissions', '`packages/contract/src/rbac.ts`'],
          ['Rules', rules.length ? [...new Set(rules.map((r) => `\`${r.enforcedIn}\``))].join(', ') : '—'],
          ['Screens', '`project-control/MASTER_REGISTRY.json`'],
        ],
      ),
      '',
    ]
      // Only `null` means "omit this section". An empty string is a blank
      // line, and Markdown needs those: a table with no blank line before it
      // renders as a paragraph of pipes.
      .filter((l) => l !== null)
      .join('\n')

    write(join(dir, file), body)
    written.push(file)
  }

  // Named DOMAIN_INDEX, not README: `control.mjs` owns the README of every
  // numbered section. Two generators writing the same path overwrote each
  // other on every pass, and the run never settled.
  write(
    join(dir, 'DOMAIN_INDEX.md'),
    [
      banner('domains.mjs', SOURCES),
      '# Domain documentation',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt} · ${model.capabilities.length} domains`,
      '',
      'One document per domain, all to the same standard: purpose, actors and their data scopes, entities and relationships, API surface, business rules, lifecycles, screens, and the gaps. Derived from the registries, so a domain document cannot quietly fall behind the code it describes.',
      '',
      table(
        ['Domain', 'Document', 'Screens', 'Endpoints', 'Entities', 'Data-backed screens'],
        model.capabilities.map((c) => [c.name, `[${c.id}](${c.id.replace('CAP-', '')}.md)`, c.screenCount, c.endpointCount, c.entities.length, `${c.dataBackedScreens} of ${c.screenCount}`]),
      ),
      '',
    ].join('\n'),
  )

  return { domains: written.length }
}

function gapsFor(capability, { endpoints, screens, entities, rules, machines, relationships }) {
  const gaps = []
  const mock = screens.filter((s) => !s.dataBacked).length
  if (mock) gaps.push(`- **${mock} of ${screens.length} screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.`)
  const untested = endpoints.filter((e) => !(e.tests ?? []).length).length
  if (untested) gaps.push(`- **${untested} of ${endpoints.length} endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.`)
  const undeclared = machines.filter((m) => !m.transitionsDeclared)
  if (undeclared.length) gaps.push(`- **${undeclared.length} lifecycle${undeclared.length === 1 ? '' : 's'} (${undeclared.map((m) => `\`${m.name}\``).join(', ')}) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.`)
  const inferred = relationships.filter((r) => r.enforcement !== 'DECLARED').length
  if (inferred) gaps.push(`- **${inferred} of ${relationships.length} relationships have no foreign key.** Integrity depends on application code; nothing cascades.`)
  if (!rules.length && endpoints.length) gaps.push('- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.')
  const noStates = screens.filter((s) => s.loadingState === 'MISSING' && s.errorState === 'MISSING').length
  if (noStates) gaps.push(`- **${noStates} screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.`)
  const noRls = entities.filter((e) => e.tenantScoped && !e.rlsEnabled)
  if (noRls.length) gaps.push(`- **${noRls.length} tenant-scoped table(s) have no row-level-security policy**: ${noRls.map((e) => `\`${e.table}\``).join(', ')}. This is a tenant-isolation gap.`)
  return gaps.length ? gaps.join('\n') : '_None identified by the generated checks. That is not the same as none existing — the checks look for absent tests, absent states, unguarded lifecycles and unenforced integrity, and cannot see a rule that was never written down._'
}
