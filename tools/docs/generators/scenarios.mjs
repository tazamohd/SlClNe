/** Scenario catalogue, use cases and the golden paths.
 *
 *  A scenario catalogue is the part of a documentation set most likely to be
 *  fabricated, because scenarios read plausibly whether or not anything
 *  implements them. Everything here is anchored to something real: a golden
 *  path that is measured and runs, a rule guard that produces a named failure,
 *  or an endpoint that exists.
 *
 *  Exception and failure scenarios are derived from the rule guards rather
 *  than imagined, which is the useful direction: every guard in the contract
 *  produces a user-visible refusal, and that refusal is a scenario somebody
 *  has to design a screen for.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, table, write } from '../lib/write.mjs'

const SOURCES = [
  'project-control/GOLDEN_PATHS.json',
  'project-control/BUSINESS_RULES.json',
  'project-control/API_REGISTRY.json',
  'project-control/PERMISSION_REGISTRY.json',
  'app/e2e/**',
]

export function generateScenarios(model) {
  const dir = join(P.docs, '10_SCENARIOS_USE_CASES')
  const paths = model.goldenPaths?.paths ?? []

  // ── Golden paths ────────────────────────────────────────────────────────
  write(
    join(dir, 'GOLDEN_PATHS.md'),
    [
      banner('scenarios.mjs', ['project-control/GOLDEN_PATHS.json', 'app/e2e/**']),
      '# Golden paths',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      `${paths.length} end-to-end journeys, each a browser test that walks the whole path and asserts the content at every step. Status below is the **last recorded run**, from \`project-control/GOLDEN_PATHS.json\` — it is a measurement, not a claim this documentation makes.`,
      '',
      table(
        ['#', 'Journey', 'Spec', 'Last recorded status'],
        paths.map((p, i) => [i + 1, p.path, `\`app/${p.id}\``, p.status === 'PASSING' ? 'passing' : `**${p.status}**${p.error ? ` — ${p.error}` : ''}`]),
      ),
      '',
      '## Why these and not others',
      '',
      'A golden path is a journey whose failure means the product is unusable for somebody, not merely degraded. They are the paths that get run before a release and the ones an incident is measured against. A journey that is nice to have is a test; a journey a garage cannot operate without is a golden path.',
      '',
    ].join('\n'),
  )

  // ── Exception scenarios from the rule guards ────────────────────────────
  const guards = model.rules.filter((r) => r.kind === 'GUARD')
  write(
    join(dir, 'EXCEPTION_SCENARIOS.md'),
    [
      banner('scenarios.mjs', ['packages/contract/src/rules/*.ts']),
      '# Exception scenarios',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      'Every refusal the system can produce from a business rule, derived from the guard functions rather than imagined. Each is a scenario somebody has to design a screen for: a user who hits it needs to know what happened and what to do next.',
      '',
      `${guards.length} guards, each returning a named failure with a message intended for the user.`,
      '',
      table(
        ['Scenario', 'Trigger', 'What the user is told', 'Enforced in'],
        guards.map((g) => [
          `SCN-${g.id.replace('BR-', '')}`,
          g.statement ?? `\`${g.name}\``,
          g.messages?.length ? g.messages.map((m) => `"${m}"`).join(' / ') : '_no message string found in the guard_',
          `\`${g.enforcedIn}\``,
        ]),
      ),
      '',
      '## Authorization refusals',
      '',
      'Distinct from rule refusals, and the distinction matters to the user. A rule refusal says *this cannot be done*. An authorization refusal says *you cannot do this* — and one of those has a third form that a screen must not collapse into the other two.',
      '',
      table(
        ['Scenario', 'Condition', 'Response', 'What the screen must say'],
        [
          ['SCN-AUTHZ-DENIED', 'The role holds no grant for the module and action', '403', '"The <role> role may not <action> <module>." Offering a retry is wrong; the answer will not change.'],
          ['SCN-AUTHZ-ESCALATE', 'The role holds the approve grant but the amount is above its ceiling', 'approval-required', 'The amount, the ceiling, and that it **must be escalated**. Showing "forbidden" here sends the user to ask an administrator for a permission that would not help.'],
          ['SCN-AUTHZ-SOD', 'The actor is the submitter, or the technician who did the work', '403', 'Which duty conflicts, and who can do it instead.'],
          ['SCN-AUTHZ-SCOPE', 'The row exists but falls outside the principal’s data scope', '404, not 403', 'Not found. A 403 would confirm the row exists, which leaks across the tenant or branch boundary.'],
          ['SCN-CONFLICT-VERSION', 'The submitted `version` is stale', '409', 'That someone else changed this, and offer to reload — not a generic failure.'],
          ['SCN-IDEMPOTENT-REPLAY', 'Same `Idempotency-Key`, same body', 'the stored response', 'Nothing. The replay is invisible by design, and no second effect occurs.'],
          ['SCN-IDEMPOTENT-CONFLICT', 'Same `Idempotency-Key`, **different** body', 'refused', 'That the key was reused with different content — a bug on the caller’s side.'],
        ],
      ),
      '',
    ].join('\n'),
  )

  // ── Use cases ───────────────────────────────────────────────────────────
  const writeEndpoints = model.api.filter((e) => ['POST', 'PATCH', 'DELETE'].includes(e.method) && e.kind === 'EXPLICIT')
  write(
    join(dir, 'USE_CASE_CATALOG.md'),
    [
      banner('scenarios.mjs', SOURCES),
      '# Use case catalogue',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      'One use case per write endpoint that has behaviour of its own. The generated collection routes — create, update, delete on a described collection — are uniform and are covered by a single pattern rather than 172 near-identical entries; that pattern is stated at the end.',
      '',
      `${writeEndpoints.length} behavioural use cases.`,
      '',
      table(
        ['UC', 'Goal', 'Primary actor', 'Permission', 'Approval', 'Idempotent', 'Transactional', 'Validates', 'Implemented in'],
        writeEndpoints.map((e) => {
          const roles = e.permissionModule && model.rbac.matrix[e.permissionModule]
            ? model.rbac.roles.filter((r) => (model.rbac.matrix[e.permissionModule][r] ?? '').includes(e.permissionAction ?? 'c'))
            : []
          return [
            `UC-${e.id.replace('API-', '')}`,
            `${e.method} ${e.path.replace('/api/v1', '')}`,
            roles.length ? roles.slice(0, 5).join(', ') + (roles.length > 5 ? ` +${roles.length - 5}` : '') : '—',
            e.permissionModule ? `${e.permissionModule}:${e.permissionAction ?? '?'}` : 'public / auth',
            e.requiresApproval ? 'yes' : '',
            e.idempotent ? 'yes' : '',
            e.transactional ? 'yes' : '',
            e.validates ? 'yes' : '',
            `\`${e.source}\``,
          ]
        }),
      ),
      '',
      '## The generated-collection pattern',
      '',
      'Every writable collection gets the same five write use cases, so they are documented once:',
      '',
      table(
        ['Use case', 'Route', 'Grant', 'Behaviour'],
        [
          ['Create one row', '`POST /<collection>`', '`c`', 'Validated, tenant-stamped, audited'],
          ['Update one row', '`PATCH /<collection>/:id`', '`e`', 'Optimistic concurrency on `version`; a stale write is a 409'],
          ['Soft-delete one row', '`DELETE /<collection>/:id`', '`d`', 'Sets `deleted_at`; the row stays and is filtered out'],
          ['Bulk update', '`POST /<collection>/bulk-update`', '`e`', 'One patch applied to many rows'],
          ['Bulk delete', '`POST /<collection>/bulk-delete`', '`d`', 'Soft-deletes many rows'],
        ],
      ),
      '',
      'All five run under row-level security, so a row outside the principal\'s scope is not merely refused — it is not visible to the statement at all.',
      '',
    ].join('\n'),
  )

  return { goldenPaths: paths.length, exceptions: guards.length, useCases: writeEndpoints.length }
}
