import type { CollectionKey } from '../repository'

/** Where each collection lives in the REST contract.
 *
 *  `null` is deliberate, not an oversight: `API_ENDPOINTS.md` has no list
 *  endpoint for that collection. Some are expansions of a parent (an invoice's
 *  lines arrive inside `GET /invoices/:id`), some belong to a diagnostic
 *  session, and a few the contract simply doesn't cover yet.
 *
 *  Typing this as a total `Record<CollectionKey, …>` means adding a collection
 *  to the repository fails the typecheck until someone decides where it comes
 *  from — the gap can't be forgotten, and it can't be papered over with a
 *  guessed URL that would 404 in production. */
export const ENDPOINTS: Record<CollectionKey, string | null> = {
  // ─── Workshop core ───────────────────────────────────────────────────────
  jobs: '/jobs',
  appointments: '/appointments',
  estimates: '/estimates',
  invoices: '/invoices',
  receipts: '/receipts',

  // ─── Customers, vehicles, fleets ─────────────────────────────────────────
  customers: '/customers',
  vehicles: '/vehicles',
  fleets: '/fleets',

  // ─── Inventory and team ──────────────────────────────────────────────────
  parts: '/inventory',
  technicians: '/technicians',

  // ─── CRM ─────────────────────────────────────────────────────────────────
  leads: '/crm/leads',
  opportunities: '/crm/opportunities',
  crmTasks: '/crm/tasks',
  segments: '/crm/segments',
  campaigns: '/crm/campaigns',

  // ─── Accounting ──────────────────────────────────────────────────────────
  chartOfAccounts: '/accounting/coa',
  journalEntries: '/accounting/journal-entries',
  expenses: '/accounting/expenses',

  // ─── AI platform and knowledge base ──────────────────────────────────────
  aiAgents: '/ai/agents',
  conversations: '/ai/conversations',
  kbProcedures: '/kb/procedures',

  // ─── Not in the contract ─────────────────────────────────────────────────
  // Expansions of their parent resource, returned by the detail endpoint:
  invoiceLines: null,
  invoicePayments: null,
  // A diagnostic session's sub-resources (`/diagnostics/sessions/:id/…`);
  // there is no tenant-wide list of them.
  diagStages: null,
  diagFindings: null,
  diagParts: null,
  diagLabour: null,
  diagCopies: null,
  approvalLines: null,
  // Reference data the contract has no endpoint for yet. `GET /kb/dtc/:code`
  // exists, but only per code — there is no list.
  dtcCodes: null,
  obdDevices: null,
  oemTools: null,
  services: null,
  departments: null,
  integrations: null,
}

/** Collections the API can actually serve today. */
export function servedByApi(key: CollectionKey): boolean {
  return ENDPOINTS[key] !== null
}
