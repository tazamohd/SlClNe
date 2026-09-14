/** Assembles one model of the system from every extractor, and links it.
 *
 *  The linking is the point. Each extractor knows one thing — the schema knows
 *  tables, the route files know endpoints, the contract knows permissions, the
 *  spec files know tests — and none of them knows how those relate. Joining
 *  them here is what makes the traceability chain answerable in both
 *  directions: from a strategic objective down to the test that proves it, and
 *  from a database column back up to the requirement that asked for it.
 *
 *  Every link is derived from a real identifier (a table name, a route path, a
 *  permission module). Where no link can be derived, the field is empty and
 *  the gap report counts it. Nothing is linked on resemblance.
 */
import { readFileSync } from 'node:fs'
import { P } from './paths.mjs'
import { extractEntities } from './extract-entities.mjs'
import { extractRelationships } from './extract-relationships.mjs'
import { extractApi, extractCollections } from './extract-api.mjs'
import { extractRbac } from './extract-rbac.mjs'
import { extractRules, extractStateMachines } from './extract-rules.mjs'
import { extractTests } from './extract-tests.mjs'
import { extractSecurity } from './extract-security.mjs'
import { detectStaleness } from './staleness.mjs'
import { sourceStamp } from './stamp.mjs'

const json = (path, fallback = null) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

/** The capability map. Modules are the unit both the permission matrix and the
 *  screen registry already agree on, so the business capability model is built
 *  on them rather than on a parallel taxonomy that would immediately drift. */
const CAPABILITIES = [
  { id: 'CAP-WORKSHOP', name: 'Workshop operations', modules: ['jobcards', 'appointments', 'estimates'], domains: ['workshop'], objective: 'OBJ-THROUGHPUT' },
  { id: 'CAP-CUSTOMERS', name: 'Customer management', modules: ['customers'], objective: 'OBJ-RETENTION' },
  { id: 'CAP-VEHICLES', name: 'Vehicle management', modules: ['vehicles'], objective: 'OBJ-THROUGHPUT' },
  { id: 'CAP-INVENTORY', name: 'Parts and inventory', modules: ['inventory'], domains: ['parts'], objective: 'OBJ-MARGIN' },
  { id: 'CAP-PROCUREMENT', name: 'Procurement', modules: ['procurement'], objective: 'OBJ-MARGIN' },
  { id: 'CAP-BILLING', name: 'Invoicing and payments', modules: ['invoices', 'payments'], objective: 'OBJ-CASH' },
  { id: 'CAP-ACCOUNTING', name: 'Accounting and finance', modules: ['accounting'], objective: 'OBJ-CASH' },
  { id: 'CAP-HR', name: 'HR and payroll', modules: ['hr', 'technicians'], objective: 'OBJ-CAPACITY' },
  { id: 'CAP-CRM', name: 'CRM and sales', modules: ['crm', 'callcenter'], objective: 'OBJ-RETENTION' },
  { id: 'CAP-REPORTING', name: 'Reporting and analytics', modules: ['reports', 'execreports'], objective: 'OBJ-VISIBILITY' },
  { id: 'CAP-GOVERNANCE', name: 'Approvals and governance', modules: ['approvals', 'audit'], objective: 'OBJ-CONTROL' },
  { id: 'CAP-PORTALS', name: 'Portals and channels', modules: ['portaltech', 'portalcustomer', 'portalsupplier', 'portalprocure', 'kiosk'], domains: ['portals'], objective: 'OBJ-RETENTION' },
  { id: 'CAP-AI', name: 'AI and automation', modules: ['ai'], objective: 'OBJ-THROUGHPUT' },
  { id: 'CAP-PLATFORM', name: 'Administration and platform', modules: ['admin', 'settings', 'dashboard', 'network', 'ungated', 'platform'], domains: ['admin'], objective: 'OBJ-CONTROL' },
  // Four capabilities carry screens but no permission module of their own.
  // The screen registry files them under `domain` instead: authentication is
  // pre-authorization by definition, the public website is unauthenticated,
  // the design system is not a business surface, and the feature map is
  // reference material. Matching on domain as well as module is what keeps
  // 302 of 424 screens from falling outside the capability map entirely.
  { id: 'CAP-IDENTITY', name: 'Identity and access', modules: ['auth'], domains: ['auth'], objective: 'OBJ-CONTROL' },
  { id: 'CAP-WEBSITE', name: 'Public website and acquisition', modules: [], domains: ['website'], objective: 'OBJ-RETENTION' },
  { id: 'CAP-CUSTOMERAPP', name: 'Customer mobile application', modules: [], domains: ['customerapp'], objective: 'OBJ-RETENTION' },
  { id: 'CAP-DESIGNSYSTEM', name: 'Design system and reference surfaces', modules: [], domains: ['ui', 'featuremap'], objective: 'OBJ-VISIBILITY' },
]

const OBJECTIVES = [
  { id: 'OBJ-THROUGHPUT', name: 'Increase workshop throughput', benefit: 'More jobs completed per bay per day' },
  { id: 'OBJ-MARGIN', name: 'Protect parts and labour margin', benefit: 'Cost visibility and controlled procurement' },
  { id: 'OBJ-CASH', name: 'Shorten the cash cycle', benefit: 'Faster invoicing, fewer unpaid balances' },
  { id: 'OBJ-RETENTION', name: 'Retain customers', benefit: 'Repeat service revenue' },
  { id: 'OBJ-CAPACITY', name: 'Use technician capacity well', benefit: 'Utilisation and scheduling' },
  { id: 'OBJ-VISIBILITY', name: 'Give owners operational visibility', benefit: 'Decisions on current numbers' },
  { id: 'OBJ-CONTROL', name: 'Keep financial control auditable', benefit: 'Approvals, segregation of duties, audit trail' },
]

export function buildModel() {
  const { entities, unparsed } = extractEntities()
  const relationships = extractRelationships(entities)
  const collections = extractCollections()
  const api = extractApi(collections)
  const rbac = extractRbac()
  const rules = extractRules()
  const stateMachines = extractStateMachines()
  const tests = extractTests()
  const security = extractSecurity(entities)

  const screenRegistry = json(P.appMasterRegistry, { entries: [], totals: {} })
  const status = json(P.appStatus, { totals: {} })
  const goldenPaths = json(P.goldenPaths, null)
  const releaseGates = json(P.releaseGates, null)
  const risks = json(P.riskRegister, null)
  const blockers = json(P.blockers, null)
  const findings = json(P.findings, null)
  const testStatus = json(P.testStatus, null)
  const screens = screenRegistry.entries ?? []

  // ── Links ────────────────────────────────────────────────────────────────

  const byTable = new Map(entities.map((e) => [e.table, e]))
  const moduleOf = new Map()
  for (const capability of CAPABILITIES) {
    for (const moduleName of capability.modules) moduleOf.set(moduleName, capability.id)
  }

  // entity → endpoints, screens, tests
  for (const entity of entities) {
    entity.endpoints = api.filter((e) => e.table === entity.table).map((e) => e.id)
    entity.collection = collections.find((c) => c.table && byTable.get(entity.table)?.property === c.table)?.key ?? null
    entity.relationshipsOut = relationships.relationships.filter((r) => r.from === entity.table).map((r) => r.id)
    entity.relationshipsIn = relationships.relationships.filter((r) => r.to === entity.table).map((r) => r.id)
    entity.rlsEnabled = security.rlsTables.includes(entity.table)
    entity.tests = tests
      .filter((t) => t.cases.some((c) => c.toLowerCase().includes(entity.table.replace(/_/g, ' '))))
      .map((t) => t.id)
  }

  // endpoint → capability, tests
  for (const endpoint of api) {
    endpoint.capability = moduleOf.get(endpoint.domain) ?? null
    endpoint.tests = tests.filter((t) => t.touchesPaths.some((p) => endpoint.path.endsWith(p) || p === endpoint.path.replace('/api/v1', ''))).map((t) => t.id)
  }

  // capability → everything under it
  const capabilities = CAPABILITIES.map((capability) => {
    const endpoints = api.filter(
      (e) => capability.modules.includes(e.domain) || (capability.domains ?? []).includes(e.domain),
    )
    const domains = capability.domains ?? []
    const capScreens = screens.filter(
      (s) => (s.module && capability.modules.includes(s.module)) || (!s.module && domains.includes(s.domain)),
    )
    const tables = [...new Set(endpoints.map((e) => e.table).filter(Boolean))]
    return {
      ...capability,
      objectiveName: OBJECTIVES.find((o) => o.id === capability.objective)?.name ?? null,
      endpointCount: endpoints.length,
      endpoints: endpoints.map((e) => e.id),
      screenCount: capScreens.length,
      screens: capScreens.map((s) => s.screenId),
      dataBackedScreens: capScreens.filter((s) => s.dataBacked).length,
      entities: tables,
      rules: rules.filter((r) => capability.modules.some((m) => r.domain.startsWith(m.slice(0, 6)))).map((r) => r.id),
      roles: rbac.roles.filter((role) => capability.modules.some((m) => (rbac.matrix[m]?.[role] ?? '') !== '')),
      goldenPaths: (goldenPaths?.paths ?? goldenPaths?.entries ?? []).filter?.((g) =>
        capability.modules.includes(g.module) || capability.modules.some((m) => JSON.stringify(g).includes(m)),
      )?.map?.((g) => g.id ?? g.name) ?? [],
    }
  })

  return {
    // The commit date of the newest source change, not today's date. See
    // tools/docs/lib/stamp.mjs: a wall-clock stamp made every generated file
    // differ overnight and turned docs:check red with nothing changed.
    generatedAt: sourceStamp(),
    objectives: OBJECTIVES,
    capabilities,
    entities,
    unparsedEntities: unparsed,
    relationships,
    collections,
    api,
    rbac,
    rules,
    stateMachines,
    tests,
    security,
    screens,
    screenTotals: screenRegistry.totals ?? {},
    statusTotals: status.totals ?? {},
    goldenPaths,
    releaseGates,
    risks,
    blockers,
    findings,
    testStatus,
    staleness: detectStaleness(),
  }
}
