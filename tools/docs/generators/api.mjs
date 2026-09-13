/** API, database-operations and security documentation.
 *
 *  The API surface here is the routers' own account of themselves. Where a
 *  guard is stated in the handler it is recorded; where it is not, the field
 *  is blank and the gap report counts it — rather than filling it with the
 *  guard the endpoint probably has.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, table, write } from '../lib/write.mjs'

const SOURCES = ['server/src/registry.ts', 'server/src/routes/*.ts', 'server/src/auth/routes.ts', 'server/src/app.ts']

export function generateApi(model) {
  const dir = join(P.docs, '17_API_INTEGRATION')

  const byDomain = {}
  for (const endpoint of model.api) (byDomain[endpoint.domain] ??= []).push(endpoint)

  const overview = [
    banner('api.mjs', SOURCES),
    '# API overview',
    '',
    `**Status:** GENERATED · **Source of truth:** the route files · **Generated:** ${model.generatedAt}`,
    '',
    `${model.api.length} endpoints under \`/api/v1\`, plus the two unauthenticated probes.`,
    '',
    '## How the surface is built',
    '',
    `**${model.api.filter((e) => e.kind === 'GENERATED').length} of them are generated.** \`server/src/registry.ts\` describes each of the ${model.collections.length} collections once — its table, the permission module that gates it, the columns \`?q=\` searches and \`?sort=\`/\`?filter[]=\` accept, and how a row is presented — and \`server/src/routes/collections.ts\` produces the uniform routes from that description. The alternative, ${model.collections.length} hand-written routers, guarantees that one of them forgets the soft-delete filter or the permission check.`,
    '',
    `**${model.api.filter((e) => e.kind === 'EXPLICIT').length} are written out.** Anything with behaviour of its own: estimates and invoices carry line items, derived money and idempotency; procurement carries approval ceilings; authentication is its own surface.`,
    '',
    '## Cross-cutting contract',
    '',
    table(
      ['Concern', 'How it works', 'Where'],
      [
        ['Authentication', 'Bearer access token, applied as an `onRequest` hook to everything except a named public list. A route added later is authenticated by default and must be named explicitly to be public.', '`server/src/app.ts`'],
        ['Authorization', 'Module + action grant checked server-side on every request. The frontend copy hides and disables only.', '`server/src/security/permissions.ts`'],
        ['Tenant isolation', 'Postgres row-level security keyed on `app.org_id`, set per transaction. A connection with no context set sees nothing.', '`server/drizzle/0001_rls.sql`'],
        ['Concurrency', 'Optimistic, on `version`. The database trigger bumps it, so a stale write is refused rather than silently applied.', '`server/drizzle/0001_rls.sql`'],
        ['Idempotency', 'An `Idempotency-Key` replay returns the stored response and creates no second business effect. A different body under the same key is refused, not replayed.', '`server/src/http/idempotency.ts`'],
        ['Audit', 'Append-only. The table rejects `UPDATE` and `DELETE` for everyone including the owner.', '`server/drizzle/0011_audit_log_statement_immutability.sql`'],
        ['Money', 'Integer halalas end to end. Totals are computed server-side; a client-sent total is never trusted.', '`packages/contract/src/rules/money.ts`'],
      ],
    ),
    '',
    '## Unauthenticated surface',
    '',
    'Everything reachable without a token, in full. This list is short on purpose and every addition to it is a security decision.',
    '',
    table(
      ['Method', 'Path', 'Declared in'],
      model.api.filter((e) => e.authentication.startsWith('None')).map((e) => [e.method, `\`${e.path}\``, `\`${e.source}\``]),
    ),
    '',
    '## Endpoints by domain',
    '',
    table(
      ['Domain', 'Endpoints', 'Generated', 'Explicit', 'With a stated permission guard'],
      Object.entries(byDomain)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, list]) => [
          domain,
          list.length,
          list.filter((e) => e.kind === 'GENERATED').length,
          list.filter((e) => e.kind === 'EXPLICIT').length,
          list.filter((e) => e.permissionModule && !String(e.permissionModule).startsWith('(')).length,
        ]),
    ),
    '',
  ]
  write(join(dir, 'API_OVERVIEW.md'), overview.join('\n'))

  // Per-domain endpoint reference.
  for (const [domain, list] of Object.entries(byDomain)) {
    write(
      join(dir, 'endpoints', `${domain.replace(/[^a-z0-9]+/gi, '-')}.md`),
      [
        banner('api.mjs', SOURCES),
        `# API — ${domain}`,
        '',
        `**Status:** GENERATED · **Generated:** ${model.generatedAt} · ${list.length} endpoints`,
        '',
        table(
          ['Method', 'Path', 'Permission', 'Auth', 'Entity', 'Idempotent', 'Tests', 'Declared in'],
          list.map((e) => [
            e.method,
            `\`${e.path}\``,
            e.permissionModule ? `${e.permissionModule}:${e.permissionAction ?? '?'}` : '—',
            e.authentication.startsWith('None') ? 'public' : 'token',
            e.table ? `\`${e.table}\`` : '—',
            e.idempotent ? 'yes' : '',
            (e.tests ?? []).length || '',
            `\`${e.source}\``,
          ]),
        ),
        '',
        '## Query contract for generated collection routes',
        '',
        list.some((e) => e.kind === 'GENERATED')
          ? table(
              ['Collection', 'Path', 'Searchable (`?q=`)', 'Sortable (`?sort=`)', 'Filterable (`?filter[x]=`)', 'Default sort', 'Writable'],
              model.collections
                .filter((c) => c.module === domain)
                .map((c) => [
                  c.key,
                  `\`/${c.path}\``,
                  c.search.map((x) => `\`${x}\``).join(', '),
                  c.sortable.map((x) => `\`${x}\``).join(', '),
                  c.filterable.map((x) => `\`${x}\``).join(', '),
                  c.defaultSort ? `${c.defaultSort.column} ${c.defaultSort.dir}` : '—',
                  c.writable ? 'yes' : 'read-only',
                ]),
            )
          : '_No generated collection routes in this domain._',
        '',
        'An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.',
        '',
      ].join('\n'),
    )
  }

  // ── Security ────────────────────────────────────────────────────────────
  const sec = join(P.docs, '19_SECURITY')
  const s = model.security

  write(
    join(sec, 'RBAC_MATRIX.md'),
    [
      banner('api.mjs', ['packages/contract/src/rbac.ts']),
      '# RBAC matrix',
      '',
      `**Status:** GENERATED · **Source of truth:** \`packages/contract/src/rbac.ts\` · **Generated:** ${model.generatedAt}`,
      '',
      `${model.rbac.totals.modules} modules × ${model.rbac.totals.roles} roles = ${model.rbac.totals.cells} cells, of which ${model.rbac.totals.granted} carry at least one grant.`,
      '',
      '## Grant alphabet',
      '',
      '**Six letters, and `x` is export — not delete.**',
      '',
      table(['Letter', 'Action'], Object.entries(model.rbac.actions).map(([k, v]) => [`\`${k}\``, v])),
      '',
      'This is not a naming quibble. A router that checked `x` on `DELETE` under the five-letter reading granted delete to every role holding view-plus-export — accountant on the audit log, job cards, estimates and inventory; technician and customer on their portals. Roughly twenty cells, live until it was caught.',
      '',
      '## Matrix',
      '',
      table(
        ['Module', ...model.rbac.roles],
        model.rbac.modules.map((m) => [m, ...model.rbac.roles.map((r) => model.rbac.matrix[m]?.[r] || '·')]),
      ),
      '',
      '## Roles: data scope and approval ceiling',
      '',
      'The grant says *which module*. The scope says *which rows*, and it is enforced by row-level security rather than by this table.',
      '',
      table(
        ['Role', 'Data scope', 'Approval ceiling'],
        model.rbac.roles.map((r) => {
          const meta = model.rbac.roleMeta[r] ?? {}
          return [
            r,
            meta.scope ?? '—',
            meta.unlimited ? 'unlimited' : meta.approvalLimitSar === 0 ? 'may not approve' : meta.approvalLimitSar != null ? `SAR ${meta.approvalLimitSar.toLocaleString('en-US')} (${meta.approvalCeilingHalalas.toLocaleString('en-US')} halalas)` : '—',
          ]
        }),
      ),
      '',
      '## Segregation of duties',
      '',
      table(['Duty A', 'Duty B', 'Risk'], model.rbac.sod.map((p) => [p.a, p.b, p.risk])),
      '',
      '## Field-level redaction',
      '',
      table(
        ['Field', 'Arabic', 'Hidden from'],
        model.rbac.hiddenFields.map((f) => [f.field, f.fieldAr, f.hiddenFrom.join(', ')]),
      ),
      '',
    ].join('\n'),
  )

  write(
    join(sec, 'TENANT_ISOLATION.md'),
    [
      banner('api.mjs', ['server/drizzle/*.sql', 'server/src/db/tenant.ts']),
      '# Tenant and branch isolation',
      '',
      `**Status:** GENERATED · **Source of truth:** the migrations · **Generated:** ${model.generatedAt}`,
      '',
      '## Position',
      '',
      'Isolation is a database policy, not a `WHERE` clause. A `WHERE` clause is something a developer has to remember; a policy is something the database applies whether they remembered or not.',
      '',
      `**${s.coverage.rlsEnabled} tables have row-level security enabled**, all of them with \`FORCE\` so the migration role that owns the table is subject to the same policies — without \`FORCE\` the owner silently bypasses isolation. Of ${s.coverage.tenantScopedTables} tenant-scoped tables, **${s.coverage.tenantScopedWithoutRls.length} lack a policy**${s.coverage.tenantScopedWithoutRls.length ? `: ${s.coverage.tenantScopedWithoutRls.map((t) => `\`${t}\``).join(', ')}` : '.'}`,
      '',
      '## Request context',
      '',
      'Set per transaction by the API with `SET LOCAL`. Each reader returns `NULL` when unset, and every policy compares against it — so a connection with no context set sees nothing at all. Failing closed is the only safe default for an isolation primitive.',
      '',
      table(['Function', 'Reads'], s.contextFunctions.map((f) => [`\`${f}\``, `\`app.${f.replace(/^app_|\(\)$/g, '')}_id\` / \`app.scope\``])),
      '',
      '## Why the narrowing policies are RESTRICTIVE',
      '',
      'Multiple PERMISSIVE policies are OR-ed. A "branch scope" permissive policy beside a "tenant scope" one would **widen** access rather than narrow it — a branch-scoped user would read the whole organization. The narrowing policies are therefore RESTRICTIVE, which is AND-ed.',
      '',
      '## Policies',
      '',
      table(
        ['Policy', 'Applies to', 'Type', 'Command', 'Predicate'],
        s.policies.map((p) => [`\`${p.name}\``, p.appliesTo === 'every table in the tenant_tables array' ? p.appliesTo : `\`${p.appliesTo}\``, p.type, p.command, p.predicate ? `\`${p.predicate}\`` : '—']),
      ),
      '',
      '## Triggers',
      '',
      table(['Trigger', 'Table', 'Function', 'Migration'], s.triggers.map((t) => [`\`${t.name}\``, `\`${t.table}\``, `\`${t.function}\``, `\`${t.file}\``])),
      '',
      '## Sequence: a request that reads tenant data',
      '',
      mermaid(`sequenceDiagram
  participant C as Client
  participant A as Fastify app
  participant Z as Authn hook
  participant P as Permission check
  participant T as Transaction
  participant D as Postgres (RLS)
  C->>A: GET /api/v1/job-cards (Bearer token)
  A->>Z: onRequest — public path?
  Z-->>A: no; verify token, build principal
  A->>P: requirePermission(principal, 'jobcards', 'v')
  P-->>A: granted (or 403 before any query runs)
  A->>T: BEGIN
  T->>D: SET LOCAL app.org_id, app.branch_id, app.user_id, app.scope
  A->>D: SELECT ... FROM job_cards
  D-->>A: rows the policies allow — no WHERE org_id needed
  A->>T: COMMIT
  A-->>C: 200 with the presented rows`),
      '',
    ].join('\n'),
  )

  return { endpoints: model.api.length, domains: Object.keys(byDomain).length }
}
