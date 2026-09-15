/** The relationship catalogue, and the honest caveat that comes with it.
 *
 *  `server/src/db/schema.ts` declares almost no foreign keys — two
 *  `.references()` calls across sixty-eight tables. Every other association is
 *  carried by a `*_id` column with no constraint behind it, and by the
 *  `relations()` helpers Drizzle uses for joins. Referential integrity is
 *  therefore enforced by application code and by row-level security, not by
 *  the database.
 *
 *  That is a fact about the system, not a defect in this parser, so the
 *  catalogue records it: every relationship carries `enforcement`, which is
 *  `DECLARED` only when a real constraint exists and `INFERRED` when the link
 *  is a naming convention. `docs:check` counts the inferred ones, and the gap
 *  report names them. Documenting them as if they were constraints would be
 *  the kind of fabrication this whole system exists to prevent.
 */
import { readFileSync } from 'node:fs'
import { P } from './paths.mjs'

/** `customer_id` on a table is taken to point at `customers` when a table of
 *  that name exists. Singular/plural and a handful of irregulars are handled;
 *  anything left unmatched is reported as an orphan reference rather than
 *  guessed at. */
const IRREGULAR = {
  org: 'organizations',
  branch: 'branches',
  user: 'users',
  created_by: 'users',
  updated_by: 'users',
  assigned_tech: 'technicians',
  qc_passed_by: 'users',
  approved_by: 'users',
  rejected_by: 'users',
  requested_by: 'users',
  reviewed_by: 'users',
  parent: null,
  entity: null,
  external: null,
  idempotency: null,
  device: 'obd_devices',
  tech: 'technicians',
  employee: 'employees',
  supplier: 'suppliers',
  policy: 'insurance_policies',
  claim: 'insurance_claims',
  contract: 'loan_contracts',
  po: 'purchase_orders',
  requisition: 'requisitions',
  job_card: 'job_cards',
  job: 'job_cards',
  estimate: 'estimates',
  invoice: 'invoices',
  payment: 'payments',
  part: 'parts',
  vehicle: 'vehicles',
  customer: 'customers',
  fleet: 'fleets',
  lead: 'leads',
  opportunity: 'opportunities',
  campaign: 'campaigns',
  segment: 'segments',
  account: 'chart_of_accounts',
  payroll_run: 'payroll_runs',
  agent: 'ai_agents',
  conversation: 'conversations',
}

function candidateTables(stem, tableNames) {
  const tries = []
  if (Object.prototype.hasOwnProperty.call(IRREGULAR, stem)) {
    const mapped = IRREGULAR[stem]
    if (mapped === null) return []
    tries.push(mapped)
  }
  tries.push(`${stem}s`, stem, `${stem}es`, stem.replace(/y$/, 'ies'))
  return tries.filter((t) => tableNames.has(t))
}

/** Drizzle's `relations()` blocks state the intended cardinality explicitly —
 *  `many(invoiceLines)` versus `one(customers)` — which is better evidence
 *  than inferring it from a column name. */
function parseRelations(source) {
  const declared = []
  for (const block of source.matchAll(
    /export const (\w+) = relations\((\w+),\s*\(\{\s*([\w,\s]+)\s*\}\)\s*=>\s*\(\{([\s\S]*?)\n\}\)\)/g,
  )) {
    const [, , fromProperty, , body] = block
    for (const m of body.matchAll(/(\w+):\s*(one|many)\((\w+)/g)) {
      declared.push({ fromProperty, field: m[1], kind: m[2], toProperty: m[3] })
    }
  }
  return declared
}

export function extractRelationships(entities) {
  const source = readFileSync(P.schema, 'utf8')
  const byTable = new Map(entities.map((e) => [e.table, e]))
  const byProperty = new Map(entities.map((e) => [e.property, e]))
  const tableNames = new Set(byTable.keys())

  const relationHints = new Map()
  for (const rel of parseRelations(source)) {
    const from = byProperty.get(rel.fromProperty)
    const to = byProperty.get(rel.toProperty)
    if (!from || !to) continue
    relationHints.set(`${from.table}->${to.table}`, rel.kind)
  }

  const relationships = []
  const orphanReferences = []

  for (const entity of entities) {
    for (const column of entity.columns) {
      if (!/_id$/.test(column.column) || column.primaryKey) continue
      const stem = column.column.replace(/_id$/, '')
      const [target] = candidateTables(stem, tableNames)
      const declaredFk = entity.foreignKeys.find((fk) => fk.column === column.column)
      if (!target) {
        if (!declaredFk) {
          orphanReferences.push({ table: entity.table, column: column.column })
          continue
        }
      }
      const to = target ?? declaredFk?.referencesTable
      if (!to || !tableNames.has(to)) continue
      relationships.push({
        id: `REL-${entity.table}-${column.column}`.toUpperCase().replace(/_/g, '-'),
        from: entity.table,
        fromColumn: column.column,
        to,
        toColumn: byTable.get(to)?.primaryKey[0] ?? 'id',
        cardinality: relationHints.get(`${to}->${entity.table}`) === 'many' ? 'one-to-many' : 'many-to-one',
        optionality: column.notNull ? 'mandatory' : 'optional',
        enforcement: declaredFk ? 'DECLARED' : 'INFERRED',
        onDelete: declaredFk ? 'database default (no action)' : 'application-enforced; no database cascade',
        tenantScope: entity.tenantScoped ? 'org_id' : 'global',
        branchScope: entity.branchScoped ? 'branch_id' : 'not branch-scoped',
        indexed: entity.indexes.some((i) => i.columns.includes(column.property)),
        evidence: 'server/src/db/schema.ts',
      })
    }
  }

  return {
    relationships,
    orphanReferences,
    declaredCount: relationships.filter((r) => r.enforcement === 'DECLARED').length,
    inferredCount: relationships.filter((r) => r.enforcement === 'INFERRED').length,
  }
}
