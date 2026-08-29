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

  // ─── HR & Payroll ────────────────────────────────────────────────────────
  employees: '/hr/employees',
  payrollRuns: '/hr/payroll-runs',
  payrollLines: '/hr/payroll-lines',
  leaveRequests: '/hr/leave-requests',
  timesheets: '/hr/timesheets',

  // ─── Insurance & Loans ──────────────────────────────────────────────────
  insuranceClaims: '/insurance/claims',
  insurancePolicies: '/insurance/policies',
  loanContracts: '/loans/contracts',
  loanRepayments: '/loans/repayments',

  // ─── Procurement ────────────────────────────────────────────────────────
  suppliers: '/procurement/suppliers',
  requisitions: '/procurement/requisitions',
  purchaseOrders: '/procurement/purchase-orders',

  // ─── Other ──────────────────────────────────────────────────────────────
  branches: '/branches',
  feedback: '/feedback',
  bankStatements: '/accounting/bank-statements',
  savedReports: '/accounting/saved-reports',
  obdReadings: null,

  // ─── Not in the contract ─────────────────────────────────────────────────
  invoiceLines: null,
  invoicePayments: null,
  diagStages: null,
  diagFindings: null,
  diagParts: null,
  diagLabour: null,
  diagCopies: null,
  approvalLines: null,
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
