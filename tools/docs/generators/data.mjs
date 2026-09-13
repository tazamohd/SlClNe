/** Data-model documentation: entity catalogue, data dictionary, ERDs.
 *
 *  All of it comes out of `server/src/db/schema.ts`. A hand-written ERD is
 *  wrong the first time a column is added and nobody notices for months; this
 *  one is regenerated and diffed, so the drift is a failing check rather than
 *  a slow lie.
 */
import { join } from 'node:path'
import { P } from '../lib/paths.mjs'
import { banner, mermaid, mid, table, write } from '../lib/write.mjs'

const SOURCES = ['server/src/db/schema.ts', 'server/drizzle/*.sql']

/** Domain groupings for the per-domain ERDs. A single 68-table diagram is
 *  unreadable, so the master ERD shows the tenancy spine and the domain ERDs
 *  show what someone working in that domain actually needs. */
export const DOMAIN_TABLES = {
  ENTERPRISE: ['organizations', 'branches', 'users', 'user_sessions', 'departments', 'audit_log', 'idempotency_keys', 'otp_challenges'],
  CUSTOMER: ['customers', 'vehicles', 'fleets', 'customer_feedback', 'public_leads'],
  WORKSHOP: ['job_cards', 'appointments', 'services', 'technicians', 'estimates', 'estimate_lines', 'diag_stages', 'diag_findings', 'diag_parts', 'diag_labour', 'diag_copies', 'kb_procedures'],
  INVENTORY: ['parts', 'inventory_movements'],
  PROCUREMENT: ['suppliers', 'requisitions', 'requisition_lines', 'purchase_orders', 'purchase_order_lines', 'approval_lines'],
  BILLING: ['invoices', 'invoice_lines', 'payments', 'receipts'],
  ACCOUNTING: ['chart_of_accounts', 'journal_entries', 'expenses', 'bank_statements', 'saved_reports'],
  CRM: ['leads', 'opportunities', 'campaigns', 'segments', 'crm_tasks'],
  HR: ['employees', 'payroll_runs', 'payroll_lines', 'timesheets', 'leave_requests'],
  INSURANCE: ['insurance_policies', 'insurance_claims'],
  LOANS: ['loan_contracts', 'loan_repayments'],
  INTEGRATIONS: ['integrations', 'obd_devices', 'obd_dtc_readings', 'dtc_codes', 'oem_tools'],
  ADMIN: ['ai_agents', 'conversations', 'garage_applications', 'supplier_applications', 'subscription_requests', 'support_tickets', 'system_health'],
}

function erd(model, tables, title) {
  const set = new Set(tables)
  const entities = model.entities.filter((e) => set.has(e.table))
  const lines = [`erDiagram`]
  for (const entity of entities) {
    // Universal columns are the same on every table and would triple the
    // diagram's height while telling the reader nothing they don't know from
    // the tenancy section. The distinguishing columns are what a reader is
    // looking at an ERD for.
    const universal = new Set(['org_id', 'branch_id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at', 'version'])
    const shown = entity.columns.filter((c) => c.primaryKey || !universal.has(c.column)).slice(0, 14)
    lines.push(`  ${mid(entity.table)} {`)
    for (const column of shown) {
      const key = column.primaryKey ? 'PK' : /_id$/.test(column.column) ? 'FK' : ''
      lines.push(`    ${mid(column.type.replace(/\s+/g, '_'))} ${mid(column.column)} ${key}`.trimEnd())
    }
    lines.push('  }')
  }
  for (const rel of model.relationships.relationships) {
    if (!set.has(rel.from) || !set.has(rel.to) || rel.from === rel.to) continue
    const left = rel.optionality === 'mandatory' ? '||' : '|o'
    lines.push(`  ${mid(rel.to)} ${left}--o{ ${mid(rel.from)} : "${rel.fromColumn}"`)
  }
  return [`### ${title}`, '', mermaid(lines.join('\n')), ''].join('\n')
}

export function generateData(model) {
  const dir = join(P.docs, '13_DATA_MODELING')
  const diagrams = join(P.docs, '33_MASTER_DIAGRAM_LIBRARY', 'ERD')

  // ── Entity catalogue ────────────────────────────────────────────────────
  write(
    join(dir, 'ENTITY_CATALOG.md'),
    [
      banner('data.mjs', SOURCES),
      '# Entity catalogue',
      '',
      `**Status:** GENERATED · **Source of truth:** \`server/src/db/schema.ts\` · **Generated:** ${model.generatedAt}`,
      '',
      `${model.entities.length} tables. ${model.entities.filter((e) => e.tenantScoped).length} are tenant-scoped (carry \`org_id\`) and ${model.entities.filter((e) => e.rlsEnabled).length} have row-level security enabled and forced.`,
      '',
      '## Conventions the schema holds everywhere',
      '',
      '- **Identifiers** are ULIDs in `varchar(26)`. `char` would blank-pad and make an identifier of the wrong length compare unequal — a bug that surfaces as an authorization check silently failing.',
      '- **Money is an integer count of halalas** in a `bigint` column named `*_halalas`. No `numeric`, so a rounding surprise cannot reach a ledger.',
      '- **`org_id` on every tenant-owned table**, because row-level security anchors on it. Isolation does not depend on a `WHERE` clause someone remembered to write.',
      '- **`*_label` columns** hold a presentation string the design bundle carried where it had no machine value (`"2 weeks ago"`). Where a machine value exists it sits beside them.',
      '- **`version`** is incremented by a database trigger, not by the statement, so a hand-written `UPDATE` cannot leave a stale version behind.',
      '',
      '## Catalogue',
      '',
      table(
        ['Entity', 'Table', 'Cols', 'Tenant', 'Branch', 'Soft delete', 'Versioned', 'Audited', 'RLS', 'Money columns', 'Endpoints'],
        model.entities.map((e) => [
          e.id,
          `\`${e.table}\``,
          e.columns.length,
          e.tenantScoped ? 'yes' : 'no',
          e.branchScoped ? 'yes' : 'no',
          e.softDelete ? 'yes' : 'no',
          e.versioned ? 'yes' : 'no',
          e.audited ? 'yes' : 'no',
          e.rlsEnabled ? 'yes' : '**no**',
          e.moneyColumns.length ? e.moneyColumns.length : '—',
          e.endpoints.length,
        ]),
      ),
      '',
      '## Tables without full universal-column coverage',
      '',
      'Not a defect in every case — `dtc_codes` is a reference table and has no tenant — but each one is a place where an assumption that holds elsewhere does not hold.',
      '',
      table(
        ['Table', 'Missing universal columns'],
        model.entities.filter((e) => e.missingUniversal.length).map((e) => [`\`${e.table}\``, e.missingUniversal.map((c) => `\`${c}\``).join(', ')]),
      ),
      '',
    ].join('\n'),
  )

  // ── Data dictionary ─────────────────────────────────────────────────────
  const dict = [
    banner('data.mjs', SOURCES),
    '# Data dictionary',
    '',
    `**Status:** GENERATED · **Source of truth:** \`server/src/db/schema.ts\` · **Generated:** ${model.generatedAt}`,
    '',
    `Every column of every table, ${model.entities.reduce((s, e) => s + e.columns.length, 0)} in total.`,
    '',
  ]
  for (const entity of model.entities) {
    dict.push(`## \`${entity.table}\``, '')
    if (entity.description) dict.push(entity.description, '')
    dict.push(
      table(
        ['Column', 'Type', 'Null', 'Key', 'Default', 'Notes'],
        entity.columns.map((c) => [
          `\`${c.column}\``,
          c.length ? `${c.type}(${c.length})` : c.type,
          c.notNull ? 'NOT NULL' : 'nullable',
          c.primaryKey ? 'PK' : c.references ? `FK → ${c.references.table}` : /_id$/.test(c.column) ? 'ref (no constraint)' : '',
          c.default ?? '',
          c.money ? 'money — integer halalas' : c.presentational ? 'presentation string from the design bundle' : '',
        ]),
      ),
      '',
    )
    if (entity.indexes.length) {
      dict.push(
        table(['Index', 'Unique', 'Columns'], entity.indexes.map((i) => [`\`${i.name}\``, i.unique ? 'yes' : 'no', i.columns.join(', ')])),
        '',
      )
    }
  }
  write(join(dir, 'DATA_DICTIONARY.md'), dict.join('\n'))

  // ── Relationship catalogue ──────────────────────────────────────────────
  write(
    join(dir, 'RELATIONSHIP_CATALOG.md'),
    [
      banner('data.mjs', SOURCES),
      '# Relationship catalogue',
      '',
      `**Status:** GENERATED · **Source of truth:** \`server/src/db/schema.ts\` · **Generated:** ${model.generatedAt}`,
      '',
      '## The one thing to read first',
      '',
      `Of ${model.relationships.relationships.length} relationships in the model, **${model.relationships.declaredCount} are backed by a database foreign key** and **${model.relationships.inferredCount} are not**. The declared ones are almost entirely \`org_id\` — the tenancy anchor, spread into every tenant-owned table. Every other association between business entities is a \`*_id\` column with no constraint behind it.`,
      '',
      'Referential integrity for those rests on application code and on row-level security, not on the database. That is a deliberate architectural position and it has consequences a reader needs to know about: an orphaned `customer_id` is possible, a cascade is not automatic, and a `DELETE` is a soft delete anyway. It is recorded here rather than smoothed over, because an ERD that draws all 164 lines identically implies a guarantee that 103 of them do not carry.',
      '',
      '## Catalogue',
      '',
      table(
        ['ID', 'From', 'Column', 'To', 'Cardinality', 'Optionality', 'Enforcement', 'Indexed'],
        model.relationships.relationships.map((r) => [
          r.id,
          `\`${r.from}\``,
          `\`${r.fromColumn}\``,
          `\`${r.to}\``,
          r.cardinality,
          r.optionality,
          r.enforcement === 'DECLARED' ? 'DECLARED (FK)' : '**INFERRED**',
          r.indexed ? 'yes' : 'no',
        ]),
      ),
      '',
      '## Reference columns with no resolvable target',
      '',
      'A `*_id` column whose name does not resolve to a table. Some are legitimate (`audit_log.entity_id` is polymorphic by design, `chart_of_accounts.parent_id` is a self-reference); each is listed so the reader can tell which is which rather than assume.',
      '',
      table(['Table', 'Column'], model.relationships.orphanReferences.map((o) => [`\`${o.table}\``, `\`${o.column}\``])),
      '',
    ].join('\n'),
  )

  // ── ERDs ────────────────────────────────────────────────────────────────
  const spine = ['organizations', 'branches', 'users', 'customers', 'vehicles', 'job_cards', 'estimates', 'invoices', 'payments', 'parts', 'purchase_orders', 'employees']
  write(
    join(diagrams, 'MASTER_ERD.md'),
    [
      banner('data.mjs', SOURCES),
      '# Master ERD — the tenancy spine',
      '',
      `**Status:** GENERATED · **Generated:** ${model.generatedAt}`,
      '',
      'The twelve tables a reader needs to understand how a tenant, a customer, a vehicle, a job and its money hang together. Every other table hangs off this spine; the domain ERDs show those.',
      '',
      'Solid connectors are mandatory, open ones optional. **Only `org_id` links are database foreign keys** — see the relationship catalogue.',
      '',
      erd(model, spine, 'Spine'),
    ].join('\n'),
  )

  for (const [domain, tables] of Object.entries(DOMAIN_TABLES)) {
    const present = tables.filter((t) => model.entities.some((e) => e.table === t))
    write(
      join(diagrams, `${domain}_ERD.md`),
      [
        banner('data.mjs', SOURCES),
        `# ${domain} ERD`,
        '',
        `**Status:** GENERATED · **Generated:** ${model.generatedAt} · ${present.length} tables`,
        '',
        erd(model, present, domain),
        '',
        table(
          ['Table', 'Purpose'],
          present.map((t) => {
            const e = model.entities.find((x) => x.table === t)
            return [`\`${t}\``, e?.description?.slice(0, 160) ?? '—']
          }),
        ),
        '',
      ].join('\n'),
    )
  }

  return { entities: model.entities.length, erds: Object.keys(DOMAIN_TABLES).length + 1 }
}
