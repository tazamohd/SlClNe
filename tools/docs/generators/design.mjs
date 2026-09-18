/** System design: the cross-cutting mechanisms, in one document per concern
 *  group rather than one per concern.
 *
 *  A checklist of twenty-five design documents produces twenty-five stubs.
 *  What a reader needs is the mechanism explained once, with the file that
 *  implements it named, and the reasoning that is not recoverable from the
 *  code. So this is four substantial documents rather than twenty-five thin
 *  ones, and the section README says which concern is in which.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, table, write } from '../lib/write.mjs'

const SOURCES = [
  'server/src/app.ts',
  'server/src/security/*.ts',
  'server/src/http/*.ts',
  'server/src/db/tenant.ts',
  'server/src/audit/audit.ts',
  'server/src/registry.ts',
  'packages/contract/src/rules/*.ts',
  'server/drizzle/*.sql',
]

export function generateDesign(model) {
  const dir = join(P.docs, '16_SYSTEM_DESIGN')

  // ── 1. Request pipeline ─────────────────────────────────────────────────
  write(
    join(dir, 'REQUEST_PIPELINE_DESIGN.md'),
    [
      banner('design.mjs', SOURCES),
      '# Request pipeline design',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt}`,
      '',
      'Covers: authentication, authorization, approval, segregation of duties, tenancy, validation, error handling, idempotency, concurrency, audit.',
      '',
      '## The pipeline',
      '',
      'Order is load-bearing. Each stage refuses before the next one runs, so an unauthorized request never reaches a query and a failed rule never reaches a write.',
      '',
      mermaid(`flowchart TB
  A["Request"] --> B["Security headers — helmet"]
  B --> C["Rate limit"]
  C --> D{"Public path?<br/>PUBLIC_PATHS or isPublicAuthPath"}
  D -->|yes| H["Handler"]
  D -->|no| E["Verify bearer token<br/>build Principal"]
  E --> F["requirePermission<br/>module x action"]
  F --> G["requireApproval / SOD<br/>where the route needs them"]
  G --> H
  H --> I["Zod parse — refuse malformed input"]
  I --> J["Rule guards from packages/contract/src/rules"]
  J --> K["BEGIN transaction"]
  K --> L["SET LOCAL app.org_id / branch_id / user_id / scope"]
  L --> M["Drizzle query under RLS policies"]
  M --> N["Append audit row"]
  N --> O["COMMIT"]
  O --> P["Present and respond"]`),
      '',
      '## Why each stage is where it is',
      '',
      table(
        ['Stage', 'Design decision', 'What it prevents'],
        [
          ['Authentication as an `onRequest` hook', 'Applied to everything, with an explicit public allow-list', 'A route added later cannot quietly skip authentication — it is authenticated by default and must be named to be public'],
          ['Permission before any query', 'The check runs before the transaction opens', 'An unauthorized caller never reaches the database, so timing and error shape leak nothing about what exists'],
          ['Approval distinct from permission', 'Authority *and* ceiling, returning `approval_required` rather than `forbidden` above the ceiling', 'A user being told "forbidden" when the real answer is "escalate this" — which sends them to ask for a permission that would not help'],
          ['SOD after permission', 'The actor may hold the grant and still be the wrong person', 'One person raising and approving the same document'],
          ['Validation before rules', 'Zod refuses malformed input first', 'A rule function receiving a shape it was never written for'],
          ['Rules before the transaction', 'Pure functions, no I/O', 'A half-applied write that a rule would have refused'],
          ['`SET LOCAL` inside the transaction', 'Context is transaction-scoped', 'Context leaking to the next request on a pooled connection'],
          ['Audit inside the same transaction', 'The audit row commits with the change', 'A change with no audit row, or an audit row for a change that rolled back'],
        ],
      ),
      '',
      '## Error design',
      '',
      table(
        ['Condition', 'Status', 'Why that status'],
        [
          ['Malformed input', '400', 'Zod issues are returned with their paths, so a client can point at the field'],
          ['No token, or an invalid one', '401', '—'],
          ['Grant absent', '403', 'Names the role, the action and the module — a message a user can act on'],
          ['Above the approval ceiling', 'approval-required', 'Distinct from 403 on purpose: the answer is escalate, not deny'],
          ['Row outside the data scope', '**404, not 403**', 'A 403 confirms the row exists, which leaks across the tenant or branch boundary'],
          ['Stale `version`', '409', 'Someone else changed it; the screen should offer to reload rather than show a generic failure'],
          ['Unique violation (SQLSTATE 23505)', '409', 'Dug out of the driver error chain — see below'],
          ['Foreign-key violation (23503)', '409', 'As above'],
          ['Idempotency key reused with a different body', 'refused', 'A caller-side bug; replaying would produce a wrong result silently'],
        ],
      ),
      '',
      '### The driver-error unwrapping, and why it is written down',
      '',
      'drizzle-orm 0.44 began wrapping every driver failure in a `DrizzleQueryError` whose message is the generated SQL and whose `code` is undefined; the `PostgresError` carrying the SQLSTATE moved to `.cause`. Reading `error.code` directly therefore stopped seeing 23505 and 23503, and **a duplicate phone number started answering 500 instead of 409**.',
      '',
      'The failure was silent because both shapes are plain objects — neither TypeScript nor the driver complains about a property that is simply absent. `server/src/app.ts` walks the cause chain rather than importing the wrapper class, so it keeps working across driver versions and if a future one adds another layer. `code` is trusted only in SQLSTATE shape.',
      '',
      'This is the kind of thing that belongs in a design document: it is not recoverable from reading the current code, and the next person to touch error handling needs it.',
      '',
      '## Idempotency',
      '',
      table(
        ['Property', 'Design'],
        [
          ['Key scope', '`(org_id, key, endpoint)`, unique index — a key is meaningful only within its tenant and its endpoint'],
          ['Body binding', 'A digest of the request body is stored. The same key with a different body is refused, never replayed'],
          ['Replay', 'Returns the stored response and status. No second business effect occurs'],
          ['Storage', '`idempotency_keys`, holding the response body as `jsonb`'],
        ],
      ),
      '',
      '## Concurrency',
      '',
      'Optimistic, on `version`. The value is incremented by the `bump_version` trigger, not by the statement, so a hand-written `UPDATE` cannot leave a stale version behind and let the next writer overwrite a change they never saw. `updated_at` is set by the same trigger for the same reason.',
      '',
    ].join('\n'),
  )

  // ── 2. Data access design ───────────────────────────────────────────────
  const writable = model.collections.filter((c) => c.writable).length
  write(
    join(dir, 'DATA_ACCESS_DESIGN.md'),
    [
      banner('design.mjs', SOURCES),
      '# Data access design',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt}`,
      '',
      'Covers: the collection registry, the generic router, query contract, presentation, soft delete, the repository seam.',
      '',
      '## One description, many routes',
      '',
      `\`server/src/registry.ts\` describes each of the ${model.collections.length} collections once. \`server/src/routes/collections.ts\` generates ${model.api.filter((e) => e.kind === 'GENERATED').length} endpoints from those descriptions — list, export, detail, and for the ${writable} writable ones create, update, delete, bulk-update and bulk-delete.`,
      '',
      'The argument is about people rather than elegance: fifty-two hand-written routers guarantee that the twenty-ninth forgets the soft-delete filter or the permission check. One description means the filter and the check exist once.',
      '',
      '## What a collection description carries',
      '',
      table(
        ['Field', 'Decides'],
        [
          ['`key`', 'The name the frontend repository uses'],
          ['`path`', 'The URL segment under `/api/v1`'],
          ['`table`', 'The Drizzle table'],
          ['`module`', 'The permission module every generated route checks against'],
          ['`entity`', 'The name recorded in the audit log'],
          ['`search`', 'Columns `?q=` matches, as `ilike`'],
          ['`sortable`', 'Columns `?sort=` accepts. **Anything else is a 400**, not a silent fallback, so a typo is visible rather than ignored'],
          ['`filterable`', 'Columns `?filter[x]=` matches for equality'],
          ['`defaultSort`', 'The order when none is asked for'],
          ['`codeColumn`', 'The human business code (`INV-2026-0142`); detail routes accept either it or the ULID'],
          ['`present`', 'How a row is shaped for a screen'],
          ['`writable`', 'Whether the generated write routes exist at all'],
        ],
      ),
      '',
      '## Presentation, and why it exists',
      '',
      '`present` returns the exact shape the ported design fixtures carried, with entity metadata added. That is what makes the fixture-to-HTTP swap non-destructive: a screen moving from fixtures to the API does not change. Without it every screen would need editing on the day its collection was connected, and the migration would be all-or-nothing instead of one collection at a time.',
      '',
      '`services` presents as a two-element tuple rather than an object, because that is the shape the design\'s service picker destructures.',
      '',
      '## Soft delete',
      '',
      `\`DELETE\` sets \`deleted_at\`; the row stays. ${model.entities.filter((e) => e.softDelete).length} tables carry the column and the generic router filters on it. A hard delete is not exposed through the API at all.`,
      '',
      '## Collections',
      '',
      table(
        ['Collection', 'Path', 'Module', 'Writable', 'Search', 'Sortable', 'Filterable'],
        model.collections.map((c) => [
          c.key,
          `\`/${c.path}\``,
          c.module,
          c.writable ? 'yes' : 'read-only',
          c.search.length,
          c.sortable.length,
          c.filterable.length,
        ]),
      ),
      '',
    ].join('\n'),
  )

  // ── 3. Money and rules design ───────────────────────────────────────────
  const money = model.rules.filter((r) => r.domain === 'money')
  write(
    join(dir, 'MONEY_AND_RULES_DESIGN.md'),
    [
      banner('design.mjs', ['packages/contract/src/rules/*.ts', 'server/src/db/schema.ts']),
      '# Money and business-rule design',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt}`,
      '',
      '## Money is an integer count of halalas',
      '',
      `Every money column is \`bigint\` named \`*_halalas\`. ${model.entities.filter((e) => e.moneyColumns.length).length} tables carry money; ${model.entities.reduce((s, e) => s + e.moneyColumns.length, 0)} columns in total. There is no \`numeric\` money column and no floating-point money anywhere.`,
      '',
      'The reason is narrow and sufficient: a `numeric` rounding surprise must not be able to reach a ledger. An integer count of the smallest unit has no rounding behaviour to be surprised by.',
      '',
      '## The arithmetic',
      '',
      table(
        ['Property', 'Design'],
        [
          ['VAT rate', 'Basis points (`VAT_RATE_BPS = 1500`), so the rate itself is exact'],
          ['Order', '`total = subtotal + tax − discount`, with tax computed on the **discounted net**'],
          ['Rounding', 'Half-up, applied once at the subtotal and once at the tax — **never per line**, so a 500-line invoice does not drift by 500 halalas'],
          ['Discount clamping', 'Clamped to `[0, subtotal]`; a discount cannot exceed what is being discounted or go negative'],
          ['Authority', 'Computed server-side. A client-sent total is never trusted, on any endpoint'],
        ],
      ),
      '',
      '## Rules live in one place and are called from two',
      '',
      'The rule functions are in `packages/contract/src/rules/`. The **server handler** calls them — that is the enforcement point. The **form** calls them too, for the inline message — that is the courtesy.',
      '',
      'A rule that lives only in a component is a rule a second component will contradict. A rule that lives only in a handler gives the user no feedback until they submit. Both callers, one definition.',
      '',
      '## The rule catalogue',
      '',
      table(
        ['ID', 'Rule', 'Kind', 'Domain', 'Enforced in'],
        model.rules.map((r) => [r.id, r.statement ?? `\`${r.name}\``, r.kind, r.domain, `\`${r.enforcedIn.replace('packages/contract/src/rules/', '')}\``]),
      ),
      '',
      '## Money rule detail',
      '',
      table(['Function', 'Statement'], money.map((r) => [`\`${r.name}\``, r.statement ?? '—'])),
      '',
      '## Where a rule is missing',
      '',
      `${model.stateMachines.filter((m) => !m.transitionsDeclared).length} of ${model.stateMachines.length} lifecycles have no declared transition table, so the legality of a status change on an invoice, a purchase order or a claim rests on whatever the route handler checks. For documents that move money that is a control gap, and it is listed in the gap report as one.`,
      '',
    ].join('\n'),
  )

  // ── 4. Frontend design ──────────────────────────────────────────────────
  const t = model.statusTotals
  write(
    join(dir, 'FRONTEND_DESIGN.md'),
    [
      banner('design.mjs', ['app/src/**', 'project-control/MASTER_REGISTRY.json']),
      '# Frontend design',
      '',
      `**Status:** GENERATED · **Sources as of:** ${model.generatedAt}`,
      '',
      'Covers: the repository seam, screen states, navigation, Arabic and RTL, the mobile shell.',
      '',
      '## The repository seam',
      '',
      'Screens never call HTTP. They call `app/src/data/repository.ts`, which is backed either by the ported design fixtures or by the HTTP client in `app/src/data/http/`. That indirection is what makes the fixture-to-API migration **per collection and reversible** rather than a single flag day.',
      '',
      `\`app/src/data/http/endpoints.ts\` maps each collection to its URL, and it is typed as a **total** \`Record<CollectionKey, string | null>\`. Adding a collection to the repository fails the typecheck until someone decides where it comes from, so the gap cannot be forgotten and cannot be papered over with a guessed URL that would 404 in production. \`null\` is deliberate — it records that the contract has no list endpoint for that collection.`,
      '',
      '## Current state of the migration',
      '',
      table(
        ['Measure', 'Count', 'Of'],
        [
          ['Screens reading the live API', t.dataBacked, t.capabilities],
          ['Screens reading design fixtures', t.mockOnly, t.capabilities],
          ['Rendering', t.rendered, t.capabilities],
          ['Content-asserted end to end', t.contentAsserted, t.capabilities],
        ],
      ),
      '',
      '## Screen states',
      '',
      'Four states a data-backed screen needs, and the counts that have them:',
      '',
      table(
        ['State', 'Screens with it', 'Why it matters'],
        [
          ['Loading', `${t.hasLoadingState} of ${t.capabilities}`, 'A screen that renders empty while fetching reads as "no data" and is indistinguishable from a real empty result'],
          ['Error', `${t.hasErrorState} of ${t.capabilities}`, 'A failed fetch with no error state is a blank screen the user cannot act on'],
          ['Empty', `${t.hasEmptyState} of ${t.capabilities}`, 'Zero rows is a normal state and needs its own design, not a table with no rows'],
          ['Permission', 'enforced by `RequireAccess`', 'A screen a role may not see must not render and then fail; it must not be reachable'],
        ],
      ),
      '',
      'The gap is real: a fixture-backed screen has no fetch to fail, so it needs no loading or error state — which is exactly why those counts will have to rise as the remaining screens are connected.',
      '',
      '## Arabic and RTL',
      '',
      `${t.arabicVerified} of ${t.capabilities} screens are Arabic-verified and RTL hazards are held at **${t.rtlHazards}**. RTL is treated as a correctness property rather than a styling preference: logical CSS properties are linted (\`app/scripts/check-logical-css.mjs\`), because a physical \`margin-left\` is a bug in an RTL layout and will not be caught by eye.`,
      '',
      '## Mobile',
      '',
      'The same source is packaged for iOS and Android with Capacitor — not a second codebase, and not a web view of a different build. Responsive layout is a property of the screens themselves.',
      '',
      `**${t.tabletVerified} of ${t.capabilities} screens are tablet-verified**, which is the weakest number on this page. A tablet is the primary device on a workshop floor.`,
      '',
    ].join('\n'),
  )

  return { designDocs: 4 }
}
