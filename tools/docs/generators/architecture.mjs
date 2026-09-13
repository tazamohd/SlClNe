/** Architecture, C4, system design and state-machine documentation.
 *
 *  The distinction this section has to hold is current versus target.
 *  Describing an intended architecture in the present tense is the single most
 *  common way an architecture document becomes a liability: a reader plans
 *  against a component that does not exist. Everything here is CURRENT unless
 *  a line says otherwise, and where a target differs it is labelled TARGET and
 *  kept in its own section.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, mid, mlabel, table, write } from '../lib/write.mjs'

export function generateArchitecture(model) {
  const c4 = join(P.docs, '15_C4_ARCHITECTURE_DIAGRAMS')
  const uml = join(P.docs, '12_UML_BPMN_MODELS')

  const domains = [...new Set(model.api.map((e) => e.domain))].sort()

  write(
    join(c4, 'C4_MODEL.md'),
    [
      banner('architecture.mjs', ['server/src/app.ts', 'server/src/registry.ts', 'app/src/data/http/*', 'server/drizzle/*.sql']),
      '# C4 model',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt} · **Scope:** CURRENT implementation`,
      '',
      'Everything on these diagrams exists in the repository today. Nothing planned is drawn.',
      '',
      '## Level 1 — System context',
      '',
      mermaid(`flowchart TB
  subgraph people[People]
    staff["Workshop staff<br/>advisor, technician, QC,<br/>parts, accountant, HR, manager"]
    owner["Owner / branch manager"]
    customer["Customer"]
    supplier["Supplier"]
  end
  salis["<b>SALIS AUTO</b><br/>Multi-tenant workshop management<br/>React SPA + Fastify API + PostgreSQL"]
  subgraph external[External systems]
    obd["OBD / diagnostic bridge<br/>server/src/integrations/obd.ts"]
    zatca["ZATCA e-invoicing<br/>XML generation — ADR-008"]
  end
  staff --> salis
  owner --> salis
  customer --> salis
  supplier --> salis
  salis --> obd
  salis --> zatca`),
      '',
      '## Level 2 — Containers',
      '',
      mermaid(`flowchart TB
  browser["Web browser / Capacitor shell<br/>iOS + Android"]
  spa["<b>SPA</b><br/>React 18 + Vite + React Router<br/>TanStack Query, Zustand<br/>app/"]
  api["<b>API</b><br/>Fastify 5 on Node<br/>${model.api.length} endpoints under /api/v1<br/>server/"]
  contract["<b>Shared contract</b><br/>Zod entities, RBAC matrix,<br/>business rules<br/>packages/contract/"]
  db[("<b>PostgreSQL</b><br/>${model.entities.length} tables<br/>Row-level security on ${model.security.coverage.rlsEnabled}<br/>Drizzle ORM")]
  browser --> spa
  spa -->|"HTTPS, Bearer token"| api
  spa -.->|"types, RBAC, rules"| contract
  api -.->|"types, RBAC, rules"| contract
  api -->|"SQL with SET LOCAL app.*"| db`),
      '',
      'The contract package is the load-bearing piece. Both sides read the same permission matrix and the same rule functions, and `server/tests/rbac-parity.test.ts` asserts the two copies are identical rather than merely similar. Frontend RBAC hides and disables; the server decides.',
      '',
      '## Level 3 — Components inside the API',
      '',
      mermaid(`flowchart TB
  subgraph edge[Edge]
    helmet["helmet — security headers"]
    rl["rate limit"]
    authn["authn onRequest hook<br/>authenticated by default"]
  end
  subgraph routing[Routing]
    generic["collections.ts<br/>${model.api.filter((e) => e.kind === 'GENERATED').length} generated routes<br/>from registry.ts"]
    explicit["${model.api.filter((e) => e.kind === 'EXPLICIT').length} explicit routes<br/>estimates, invoices, procurement,<br/>HR, insurance, loans, OBD, auth"]
  end
  subgraph guards[Guards]
    perms["security/permissions.ts<br/>module + action"]
    approvals["security/approvals.ts<br/>authority and ceiling"]
    sod["security/sod.ts<br/>segregation of duties"]
    idem["http/idempotency.ts"]
  end
  subgraph data[Data]
    tenant["db/tenant.ts<br/>SET LOCAL app.org_id / branch_id / user_id / scope"]
    drizzle["Drizzle queries"]
    rls[("RLS policies<br/>p_tenant permissive<br/>r_branch, r_own restrictive")]
    audit["audit/audit.ts<br/>append-only"]
  end
  helmet --> rl --> authn --> generic
  authn --> explicit
  generic --> perms
  explicit --> perms --> approvals --> sod --> idem --> tenant --> drizzle --> rls
  drizzle --> audit`),
      '',
      '## Dynamic view — an estimate approved by a customer over OTP',
      '',
      mermaid(`sequenceDiagram
  participant SA as Service advisor
  participant SPA as SPA
  participant API as API
  participant R as Rules (contract)
  participant DB as PostgreSQL
  participant C as Customer
  SA->>SPA: build estimate, add lines
  SPA->>API: POST /api/v1/estimates
  API->>R: computeInvoiceTotals(lines)
  R-->>API: subtotal, VAT at 1500bps, total (halalas)
  API->>DB: INSERT estimate + lines in one transaction
  API-->>SPA: 201 with server-computed totals
  SA->>SPA: request customer approval
  SPA->>API: POST /api/v1/estimates/:id/request-approval-otp
  API->>DB: INSERT otp_challenges
  API-->>C: OTP delivered by the configured transport
  C->>API: POST /api/v1/estimates/:id/verify-approval-otp
  API->>R: checkEstimateFresh(validUntil)
  R-->>API: not expired
  API->>DB: UPDATE estimates SET status = 'approved'
  API->>DB: INSERT audit_log (append-only)
  API-->>SPA: 200`),
      '',
      '## Domains served by the API',
      '',
      table(
        ['Domain', 'Endpoints', 'Capability'],
        domains.map((d) => [d, model.api.filter((e) => e.domain === d).length, model.capabilities.find((c) => c.modules.includes(d) || (c.domains ?? []).includes(d))?.id ?? '—']),
      ),
      '',
    ].join('\n'),
  )

  // ── State machines ──────────────────────────────────────────────────────
  const declared = model.stateMachines.filter((m) => m.transitionsDeclared)
  const setOnly = model.stateMachines.filter((m) => !m.transitionsDeclared)

  const smDoc = [
    banner('architecture.mjs', ['packages/contract/src/entities/*.ts', 'packages/contract/src/rules/*.ts']),
    '# State machines',
    '',
    `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
    '',
    '## What is and is not declared',
    '',
    `${model.stateMachines.length} lifecycles exist in the contract. **${declared.length} declares a machine-readable transition table**; the other ${setOnly.length} declare a set of states with no table of legal moves.`,
    '',
    'That distinction matters more than it looks. Where a transition table exists, an illegal move is refused by a single guard that every caller goes through. Where only a state enum exists, the legal moves are whatever the route handlers happen to check — which may be complete, may be partial, and cannot be verified by reading one file. Drawing a confident diagram for those would assert a guarantee the code does not make, so this document shows their states and names what actually guards them.',
    '',
  ]

  for (const machine of declared) {
    const lines = ['stateDiagram-v2']
    for (const t of machine.transitions) if (t.to) lines.push(`  ${mid(t.from)} --> ${mid(t.to)}`)
    for (const t of machine.terminal) lines.push(`  ${mid(t)} --> [*]`)
    smDoc.push(
      `## ${machine.entity} — \`${machine.name}\``,
      '',
      `**DECLARED TRANSITION TABLE** · \`${machine.evidence}\` · ${machine.states.length} states, ${machine.transitions.length} legal transitions`,
      '',
      machine.statement ?? '',
      '',
      mermaid(lines.join('\n')),
      '',
      table(['From', 'To'], machine.transitions.map((t) => [`\`${t.from}\``, t.to ? `\`${t.to}\`` : '_terminal_'])),
      '',
      `Terminal states: ${machine.terminal.map((t) => `\`${t}\``).join(', ') || 'none'}. Enforced by \`canTransition\` via \`checkStageTransition\` in \`packages/contract/src/rules/workshop.ts\`.`,
      '',
    )
  }

  smDoc.push('## Lifecycles with states but no declared transition table', '')
  for (const machine of setOnly) {
    const guards = model.rules.filter((r) => r.domain === machine.entity || (r.statement ?? '').toLowerCase().includes(machine.entity.toLowerCase()))
    smDoc.push(
      `### ${machine.entity} — \`${machine.name}\``,
      '',
      `**STATE SET ONLY** · \`${machine.evidence}\``,
      '',
      `States: ${machine.states.map((s) => `\`${s}\``).join(' · ')}`,
      '',
      guards.length
        ? `Guarded by: ${guards.map((g) => `\`${g.name}\` (${g.enforcedIn})`).join(', ')}.`
        : 'No rule guard in `packages/contract/src/rules` names this lifecycle. Any transition constraint is in the route handler, or absent.',
      '',
    )
  }
  write(join(uml, 'STATE_MACHINES.md'), smDoc.join('\n'))

  // ── Database design ─────────────────────────────────────────────────────
  const migrations = model.security.evidence
  write(
    join(P.docs, '18_DATABASE', 'DATABASE_DESIGN.md'),
    [
      banner('architecture.mjs', ['server/src/db/schema.ts', 'server/drizzle/*.sql']),
      '# Database design',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      `PostgreSQL, accessed through Drizzle ORM. ${model.entities.length} tables, ${model.entities.reduce((s, e) => s + e.columns.length, 0)} columns, ${migrations.length} migrations.`,
      '',
      '## Migrations',
      '',
      table(['Migration', 'Adds'], migrations.map((f) => [`\`${f}\``, describeMigration(f)])),
      '',
      '## Structural guarantees',
      '',
      table(
        ['Guarantee', 'Mechanism', 'Coverage'],
        [
          ['Tenant isolation', 'RLS policy `p_tenant` on `org_id`, PERMISSIVE', `${model.security.coverage.rlsEnabled} tables`],
          ['Branch narrowing', 'RLS policy `r_branch`, RESTRICTIVE so it is AND-ed', `${model.security.coverage.rlsEnabled} tables`],
          ['Row ownership', 'RLS policy `r_own` for the own/self/assigned scopes', `${model.security.policies.filter((p) => p.name === 'r_own').length} tables`],
          ['Owner cannot bypass', '`FORCE ROW LEVEL SECURITY`', `${model.security.coverage.forced} tables`],
          ['Optimistic concurrency', '`bump_version` BEFORE UPDATE trigger', 'every table in the tenant array'],
          ['Audit immutability', 'Trigger raising `insufficient_privilege` on UPDATE/DELETE', '`audit_log`'],
          ['Idempotency', 'Unique index on `(org_id, key, endpoint)` + stored response', '`idempotency_keys`'],
          ['Soft delete', '`deleted_at`, filtered by the generic router', `${model.entities.filter((e) => e.softDelete).length} tables`],
          ['Money integrity', '`bigint` halalas, never `numeric`', `${model.entities.filter((e) => e.moneyColumns.length).length} tables carry money`],
        ],
      ),
      '',
      '## Referential integrity — read this before drawing conclusions from an ERD',
      '',
      `Only **${model.relationships.declaredCount} of ${model.relationships.relationships.length}** relationships are backed by a database foreign key, and those are almost entirely \`org_id\`. The remaining ${model.relationships.inferredCount} are \`*_id\` columns with no constraint. Integrity for those is the application's job, and there is no cascade.`,
      '',
      'The practical consequences: an orphaned reference is possible and will not be refused by the database; deleting a parent does not clean up children (though deletes are soft anyway); and a join that assumes a row exists needs to handle its absence.',
      '',
      '## Indexes',
      '',
      table(
        ['Table', 'Index', 'Unique', 'Columns'],
        model.entities.flatMap((e) => e.indexes.map((i) => [`\`${e.table}\``, `\`${i.name}\``, i.unique ? 'yes' : 'no', i.columns.join(', ')])),
      ),
      '',
    ].join('\n'),
  )

  return { c4: 4, stateMachines: model.stateMachines.length }
}

function describeMigration(file) {
  const map = {
    '0000_init': 'Initial schema',
    '0000_lonely_black_widow': 'Initial schema (drizzle-kit generated)',
    '0001_rls': 'Row-level security, version trigger, audit immutability',
    '0002_own_scope_tech': 'Own-scope policy for technicians',
    '0003_transfer_pair_branches': 'Branch pairing for inventory transfers',
    '0004_crm_fleet_feedback': 'CRM, fleet and customer feedback',
    '0005_bank_statements_saved_reports': 'Bank statements and saved reports',
    '0006_obd_dtc_readings': 'OBD diagnostic trouble code readings',
    '0007_insurance': 'Insurance policies and claims',
    '0008_loans': 'Loan contracts and repayments',
    '0009_hr': 'HR, payroll, timesheets, leave',
    '0010_procurement': 'Requisitions and purchase orders',
    '0011_audit_log_statement_immutability': 'Audit log append-only enforcement',
    '0012_snapshot_realign': 'Drizzle snapshot realignment',
    '0013_users_acting_role': 'Acting-role support for role switching',
    '0014_customer_id_link': 'Customer link giving the `self` scope something to narrow by',
  }
  const key = file.replace('server/drizzle/', '').replace('.sql', '')
  return map[key] ?? '—'
}
