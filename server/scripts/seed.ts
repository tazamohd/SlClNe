/** Seeds the database from the app's own fixtures.
 *
 *  This file imports `app/src/data/generated/tables.ts` — the same 35 tables
 *  every screen renders today — so the seeded database serves exactly the rows
 *  the mock repository serves. That is what makes the mock → HTTP swap
 *  provably non-destructive: the smoke assertions cannot tell the two apart,
 *  and if they can, the difference is a bug rather than an accepted drift.
 *
 *  Money in the design bundle is a display string (`"SAR 1,840"`) or a bare SAR
 *  number (`420`). Both are parsed into integer halalas here, and formatted
 *  back at the API boundary — the round trip is exact for every value in the
 *  bundle, which `tests/seed-fidelity.test.ts` asserts row by row.
 *
 *      tsx scripts/seed.ts
 */
import { and, eq, sql } from 'drizzle-orm'
import { monotonicFactory } from 'ulid'
import { parseSarToHalalas, sarToHalalas, minuteOfDay } from '@salis/contract'
import {
  amortisedInstalmentHalalas,
  buildRepaymentPlan,
  payrollLineNetHalalas,
  purchaseOrderTotals,
  requisitionEstimatedTotalHalalas,
  sumPayrollLines,
} from '@salis/contract/rules'
import * as T from '../../app/src/data/generated/tables'
import { createDb } from '../src/db/client'
import * as s from '../src/db/schema'
import { loadEnv } from '../src/env'
import { parseDisplayDate, parseKilometres } from '../src/present'
import type { Tx } from '../src/db/tenant'

const ulid = monotonicFactory()

/** Fixed ids so re-seeding is idempotent and tests can address the tenants. */
export const SEED = {
  orgId: '01JAAAAAAAAAAAAAAAAAAAAAA1',
  otherOrgId: '01JBBBBBBBBBBBBBBBBBBBBBB2',
  /* 26 characters, like every other id: the contract validates branch
   * references as exactly 26, and the previous 25-character values made the
   * seeded branches unusable as a transfer destination. */
  mainBranchId: '01JAAAAAAAAAAAAAAAAAAABR01',
  secondBranchId: '01JAAAAAAAAAAAAAAAAAAABR02',
  otherBranchId: '01JBBBBBBBBBBBBBBBBBBBBBR1',
  systemUserId: '01JAAAAAAAAAAAAAAAAAAAUSR1',
  /** The demo technician user (tech@salisauto.sa, Saeed Al-Zahrani). Fixed so
   *  tests can mint a token for the one user who maps to a technician row —
   *  the mapping the own-scope RLS policy resolves through (F-015). */
  techUserId: '01JAAAAAAAAAAAAAAAAAAAUSR2',
  /** The date the design's appointment board depicts. */
  appointmentDate: '2026-07-26',
  invoiceWithDetail: 'INV-2026-0142',
  /** The job the design assigns to Saeed: his 9:00 appointment is Ahmed
   *  Al-Rashid's Toyota Camry, which is job A3F8B2C1 on the board. */
  assignedJobCode: 'A3F8B2C1',
} as const

/** Rows the seed adds beyond the design fixtures so the data is coherent
 *  rather than merely identical to the mock (F-015, F-016). The fixture rows
 *  are still served first and unchanged — `tests/seed-fidelity.test.ts` checks
 *  them row by row and then allows exactly these additions, no others. */
/** Roster names the design's TECHS list carries. */
const ROSTER_TECH_NAMES = new Set(T.TECHS.map((t) => t.name))

/** F-030: the appointment board names technicians that are not in the roster
 *  (Saeed Al-Zahrani, Majed Al-Otaibi, Yousef Al-Ghamdi). Grouping a schedule
 *  by the roster showed every technician idle because the appointments carried
 *  no `technician_id` and named people who did not exist as rows. The durable
 *  fix (agent 08's own recommendation) is to seed those names as technician
 *  rows and set a real `technician_id` on each appointment, so the schedule
 *  reconciles against the roster deterministically. Saeed is seeded separately
 *  because he also carries the demo user mapping (F-015); the rest are plain. */
const UNROSTERED_APPOINTMENT_TECHS = [...new Set(T.APPOINTMENTS.map((a) => a.tech))].filter(
  (name) => !ROSTER_TECH_NAMES.has(name),
)
const EXTRA_APPOINTMENT_TECHS = UNROSTERED_APPOINTMENT_TECHS.filter(
  (name) => name !== 'Saeed Al-Zahrani',
)

export const SEED_COHERENCE_EXTRAS: Readonly<Record<string, number>> = {
  /** The technician rows the appointment board names but the roster omits:
   *  Saeed Al-Zahrani (also the demo user's own row, F-015) plus every other
   *  unrostered name the board uses, so `technician_id` on every appointment
   *  resolves to a real roster row and the schedule groups correctly (F-030). */
  technicians: UNROSTERED_APPOINTMENT_TECHS.length,
  /** Customer feedback the design's capture form implies but never seeded —
   *  a handful of rated comments so the read-back has something coherent to
   *  return under tenant scope (F-027). */
  feedback: 3,
  /** INV-2026-0124 / -0128 / -0131 — the invoices three design receipts
   *  settle. The bundle's receipt history reaches further back than its
   *  invoice list; money must not arrive against nothing (F-016). */
  invoices: 3,
  /** The SAR 150 consumables line that reconciles INV-2026-0142's lines with
   *  its own header (F-016). */
  invoiceLines: 1,
  /** The design bundle carries no branches table at all; the two seeded
   *  branches back the read-only directory a transfer destination is picked
   *  from (F-017). */
  branches: 2,
  /** Bank statement lines the design's reconciliation screen had nothing to
   *  match against — the bank side is new (F-028). */
  bankStatements: 5,
  /** Saved report definitions CustomReports can list — no design fixture, the
   *  builder could not persist in the prototype (F-028). */
  savedReports: 2,
  /** Per-device DTC readings — the device↔dtc link is new (F-029); a couple of
   *  seeded readings give the read-back a coherent history. */
  obdReadings: 2,
  /** Insurance and loan products (vertical A) — no design fixture; each row is
   *  coherent (a claim points at a real policy, a contract's repayments amortise
   *  its principal). Three policies, two claims; two contracts whose 12- and
   *  24-month schedules make 36 repayments. */
  insurancePolicies: 3,
  insuranceClaims: 2,
  loanContracts: 2,
  loanRepayments: 36,
  /** HR (vertical B) — no design fixture; each row is coherent. Five employees
   *  in real departments; one posted payroll run whose five lines' column sums
   *  equal its frozen totals; a few timesheets; three leave requests (one
   *  approved, which is why its employee is on leave). */
  employees: 5,
  payrollRuns: 1,
  payrollLines: 5,
  timesheets: 3,
  leaveRequests: 3,
  /** Procurement (F-022) — no design fixture; the procurement server did not
   *  exist in the prototype. The golden path made concrete: two suppliers, one
   *  approved (now `ordered`) requisition, and the one purchase order raised from
   *  it — whose partial receipt leaves it in `receiving`. Lines are served under
   *  the `/lines` sub-routes, not as their own collections, so they are not
   *  counted here. */
  suppliers: 2,
  requisitions: 1,
  purchaseOrders: 1,
  /** Warehouse zones (BLK-004) — **zero extras, deliberately.** Unlike every
   *  other new BLK-004 table, the six zones are a fixture the app itself ships
   *  (`WAREHOUSE_ZONE_FIXTURE` in `app/src/data/repository.ts`), because
   *  Golden Path 7 asserts a real numeric utilisation per zone in a build with
   *  no API at all. The seed below inserts exactly those six rows, in that
   *  order, so `tests/seed-fidelity.test.ts` and
   *  `tests/repository-swap.test.ts` both compare the two copies field by
   *  field and neither can drift from the other unnoticed. */
  warehouseZones: 0,
  /** Training courses (BLK-004) — **zero extras, deliberately**, for the same
   *  reason as the warehouse zones above: the eight courses are a fixture the
   *  app itself ships (`TRAINING_COURSE_FIXTURE` in
   *  `app/src/data/repository.ts`), because Golden Path 14 asserts the catalogue
   *  contains `Workplace Safety Essentials` in a build with no API at all. The
   *  seed inserts exactly those eight rows, in that order, so
   *  `tests/seed-fidelity.test.ts` and `tests/repository-swap.test.ts` compare
   *  the two copies field by field and neither can drift unnoticed. */
  trainingCourses: 0,
  /** Training enrolments (BLK-004) — the roster every head count and completion
   *  percentage on the Training screen is counted from. No app fixture (it would
   *  have to name employees, and the app's `employees` fixture is empty by
   *  design — the prototype had no staff records), so all eighteen rows are
   *  extras: five seeded employees spread unevenly across six of the eight
   *  courses, including one withdrawal, so the derived figures differ per
   *  course. */
  trainingEnrolments: 18,
  /** Equipment warranties (BLK-004) — no design fixture; one of each status a
   *  screen needs to render (active, expired, claimed). */
  equipmentWarranties: 8,
  /** Notifications (BLK-004) — no design fixture; a handful spanning every
   *  category (job, appointment, invoice, stock) and read/unread state. */
  notifications: 8,
  /** Parts network (BLK-004) — no design fixture; the eight parts-network
   *  screens all rendered an honest GAP state. A small coherent network: the
   *  two seeded suppliers plus the `Neighbouring Garage` organization as
   *  members, four requests (three outgoing, one incoming), the three
   *  quotations that answer two of them, and the three orders. */
  partsNetworkMembers: 3,
  partsNetworkRequests: 4,
  partsNetworkQuotations: 3,
  partsNetworkOrders: 3,
}

/** Which warehouse zone each seeded part is racked in (BLK-004), by SKU.
 *
 *  Kept as data rather than an index-based rule so the assignment is plausible
 *  rather than arbitrary: filters and pads on the main floor, the smaller
 *  service items on the mezzanine. A part not listed here is simply not put
 *  away yet (`zone_code` null), which `InternalWarehouse.tsx` reports as
 *  unassigned stock rather than dropping from the zone totals.
 *
 *  Mirrored by `PART_ZONE_CODES` in `app/src/data/repository.ts`, whose fixture
 *  build must agree with this one row for row; `tests/repository-swap.test.ts`
 *  compares them. */
const PART_ZONE_CODES: Readonly<Record<string, string>> = {
  'OF-TY-118': 'A1',
  'BP-FR-220': 'A1',
  'AF-UN-002': 'A2',
  'SP-SET-04': 'A2',
}

/** The demo identities from `RBAC.md`, one per role. Passwords are **not** set here —
 *  credentials belong to the authentication module, and a seeded password hash
 *  in a repository is a credential in a repository. Exported so
 *  `scripts/set-demo-passwords.ts` — the dev-only script that actually sets
 *  one, locally, after this file has run — has one list to work from rather
 *  than a second copy of these emails that can drift from this one. */
export const DEMO_USERS: readonly {
  role: string
  email: string
  name: string
  /** For a portal login, the `customers` row this account *is*. Resolved to an
   *  id after `seed()` has inserted the customers and written to
   *  `users.customer_id` — the value `app_customer()` carries and every
   *  `r_self` policy in `drizzle/0014` narrows by. */
  customer?: string
}[] = [
  { role: 'owner', email: 'owner@salisauto.sa', name: 'Abdullah Al-Salis' },
  { role: 'superadmin', email: 'admin@salisauto.com', name: 'Platform Admin' },
  { role: 'manager', email: 'manager@salisauto.sa', name: 'Branch Manager' },
  { role: 'advisor', email: 'advisor@salisauto.sa', name: 'Service Advisor' },
  { role: 'technician', email: 'tech@salisauto.sa', name: 'Saeed Al-Zahrani' },
  { role: 'qc', email: 'qc@salisauto.sa', name: 'QC Inspector' },
  { role: 'parts', email: 'parts@salisauto.sa', name: 'Storekeeper' },
  { role: 'accountant', email: 'finance@salisauto.sa', name: 'Accountant' },
  { role: 'hr', email: 'hr@salisauto.sa', name: 'HR Manager' },
  { role: 'frontdesk', email: 'frontdesk@salisauto.sa', name: 'Receptionist' },
  { role: 'callcenter', email: 'calls@salisauto.sa', name: 'Call Centre Agent' },
  { role: 'procurement', email: 'procurement@salisauto.sa', name: 'Procurement Agent' },
  { role: 'supplier', email: 'supplier@aljazira.sa', name: 'Al Jazira Supplies' },
  /* The customer demo login is Ahmed Al-Rashid rather than `RBAC.md`'s Khalid.
   * Khalid matched no `customers` row, so the portal had nothing of his to show
   * even once the grants existed; Ahmed is the one fixture customer carrying a
   * vehicle, a job card, an appointment, an estimate and an invoice, and
   * `project/CustomerPortal.dc.html` greets "Hi, Ahmed" in its own copy. The
   * design bundle is what the screens and the seed are built from, so the prose
   * follows it rather than the other way round. */
  { role: 'customer', email: 'ahmed@example.sa', name: 'Ahmed Al-Rashid', customer: 'Ahmed Al-Rashid' },
  /* The all-access QA account. It is seeded exactly like the other thirteen —
   * same tenant, same branch, no password hash in the repository — and its
   * breadth comes from the matrix row for `test`, not from anything special
   * here. Everything it does is audited under this user id. It carries the same
   * customer link as the customer login, so switching into `customer` lands on
   * a portal with rows in it; the link is inert under every other role, because
   * only the `self` scope reads `app_customer()`. */
  { role: 'test', email: 'test@salisauto.sa', name: 'Test User', customer: 'Ahmed Al-Rashid' },
]

/** Back-computes the VAT split from a gross total, so `subtotal + tax` equals
 *  the figure the design shows to the halala rather than approximately. */
function splitVat(totalHalalas: number): { subtotal: number; tax: number } {
  const subtotal = Math.round(totalHalalas / 1.15)
  return { subtotal, tax: totalHalalas - subtotal }
}

/** `('2026-01-01', 3)` → `'2026-04-01'`. Used to space a loan's repayment due
 *  dates a month apart from the contract start. Clamps to the last day of the
 *  target month so a 31st never rolls into the next month. */
function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  const base = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate()
  base.setUTCDate(Math.min(d, lastDay))
  return base.toISOString().slice(0, 10)
}

const STAGE_FOR_STATUS: Record<string, string> = {
  pending: 'checkin',
  in_progress: 'repair',
  completed: 'delivery',
  delivered: 'closed',
}

type Common = { orgId: string; branchId: string | null; createdBy: string; updatedBy: string }

export async function seed(tx: Tx, orgId: string, branchId: string | null): Promise<void> {
  const base: Common = {
    orgId,
    branchId,
    createdBy: SEED.systemUserId,
    updatedBy: SEED.systemUserId,
  }
  const row = <T extends object>(values: T) => ({ id: ulid(), ...base, ...values })

  await tx.insert(s.services).values(
    T.SERVICES.map(([icon, label]) => row({ icon: String(icon), label: String(label) })),
  )

  const customerRows = T.CUSTOMERS.map((c) =>
    row({
      name: c.name,
      phone: c.phone,
      type: 'individual',
      vehicleCount: c.vehicles,
      totalSpentHalalas: parseSarToHalalas(c.spent),
      lastVisitLabel: c.last,
    }),
  )
  await tx.insert(s.customers).values(customerRows)
  /* Name → id, so every row that names a customer references a real one rather
   * than a free-standing string (F-016 coherence).
   *
   *  `customer_id` is also what the `self` scope narrows by: `drizzle/0014`'s
   *  `r_self` policies read `customer_id = app_customer()`, so a row left with
   *  a null link is a row its own customer cannot see. The fixtures name eight
   *  customers and carry four, so `?? null` is the honest answer for the rest —
   *  those rows stay staff-only rather than being attached to someone who is
   *  not in the bundle. */
  const customerIdByName = new Map(customerRows.map((c) => [c.name, c.id]))
  const customerIdFor = (name: string | null | undefined) =>
    (name ? customerIdByName.get(name) : undefined) ?? null

  const vehicleRows = T.VEHICLES.map((v) =>
    row({
      plate: v.plate,
      makeModel: v.make,
      ownerName: v.owner,
      customerId: customerIdFor(v.owner),
      mileageKm: parseKilometres(v.mileage),
      lastServiceLabel: v.last,
      status: v.status,
    }),
  )
  await tx.insert(s.vehicles).values(vehicleRows)
  const vehicleByPlate = new Map(vehicleRows.map((v) => [v.plate, v]))

  /* F-027: the fixtures carry only name/counts/status; coherent contract terms
   * are added here so FleetContract has type, value, dates and a contact to
   * render. Additive — seed-fidelity checks only the fixture keys, which are
   * unchanged. Values are deterministic per fleet: SAR 5,000 per vehicle a
   * year, a one-year term from the seed date, renewal 30 days before it ends. */
  const CONTRACT_TYPES = ['standard', 'premium', 'enterprise'] as const
  await tx.insert(s.fleets).values(
    T.FLEETS.map((f, index) =>
      row({
        name: f.name,
        vehicleCount: f.vehicles,
        activeCount: f.active,
        contractStatus: f.contract,
        contractType: CONTRACT_TYPES[index % CONTRACT_TYPES.length],
        contractValueHalalas: sarToHalalas(f.vehicles * 5000),
        contractStartDate: '2026-01-01',
        contractEndDate: '2026-12-31',
        renewalDate: '2026-12-01',
        contactName: `${f.name.split(' ')[0]} Fleet Manager`,
        contactPhone: `+966 55 ${String(100 + index)} ${String(1000 + index)}`,
        contactEmail: `fleet${index + 1}@example.sa`,
      }),
    ),
  )

  /* F-016: estimates and invoices must name the job they price, or every job's
   * cost summary is legitimately empty. Each design customer has exactly one
   * job on the board, so the customer name is the join key the bundle itself
   * provides. */
  const jobRows = T.JOBS.map((j) =>
    row({
      code: j.id,
      customerName: j.cust,
      customerId: customerIdFor(j.cust),
      vehicleLabel: j.veh,
      service: j.svc,
      status: j.st,
      stage: STAGE_FOR_STATUS[j.st] ?? 'checkin',
      priority: j.pr,
    }),
  )
  await tx.insert(s.jobCards).values(jobRows)
  const jobIdByCustomer = new Map(jobRows.map((j) => [j.customerName, j.id]))

  await tx.insert(s.appointments).values(
    T.APPOINTMENTS.map((a) =>
      row({
        scheduledDate: SEED.appointmentDate,
        timeLabel: a.time,
        startMinute: minuteOfDay(a.time),
        durationMins: a.mins,
        customerName: a.cust,
        customerId: customerIdFor(a.cust),
        vehicleLabel: a.veh,
        plate: a.plate,
        serviceLabel: a.svc,
        bay: a.bay,
        technicianName: a.tech,
        status: a.status,
      }),
    ),
  )

  await tx.insert(s.estimates).values(
    T.ESTIMATES.map((e) => {
      const total = parseSarToHalalas(e.amount)
      const { subtotal, tax } = splitVat(total)
      return row({
        code: e.id,
        jobCardId: jobIdByCustomer.get(e.cust) ?? null,
        customerName: e.cust,
        customerId: customerIdFor(e.cust),
        vehicleLabel: e.veh,
        subtotalHalalas: subtotal,
        taxHalalas: tax,
        totalHalalas: total,
        status: e.status,
        /* The submitter, so the SOD row check and the approvals queue have a
         * raiser to test the different-approver control against (F-029). The
         * seed user raised every fixture estimate; a real create captures the
         * acting principal. Additive — the fixture rows carry no `submittedBy`,
         * so seed-fidelity's `pickLike` never compares it. */
        submittedBy: SEED.systemUserId,
      })
    }),
  )

  /* Invoices, then the lines and payments the detail screen shows against the
   * first of them — which is the invoice the design's detail page depicts. */
  const invoiceIds = new Map<string, string>()
  await tx.insert(s.invoices).values(
    T.INVOICES.map((i) => {
      const total = parseSarToHalalas(i.amount)
      const { subtotal, tax } = splitVat(total)
      const id = ulid()
      invoiceIds.set(i.id, id)
      return {
        id,
        ...base,
        code: i.id,
        jobCardId: jobIdByCustomer.get(i.cust) ?? null,
        customerName: i.cust,
        customerId: customerIdFor(i.cust),
        dueDate: parseDisplayDate(i.due) ?? SEED.appointmentDate,
        status: i.status,
        subtotalHalalas: subtotal,
        taxHalalas: tax,
        totalHalalas: total,
        paidHalalas: i.status === 'paid' ? total : 0,
        issuedAt: new Date(),
      }
    }),
  )

  /* F-016: three of the five design receipts settle invoices the bundle's
   * invoice list no longer shows — its receipt history simply reaches further
   * back than its invoice list. Money must not arrive against nothing, so the
   * three historical invoices are seeded rather than the receipts dropped:
   * dropping them would change what the Receipts screen renders, while these
   * rows only extend the invoice history the design already implies. A cleared
   * receipt means its invoice was paid in full; RCP-2026-0309 is still
   * pending, so INV-2026-0131 stays unpaid until the money clears. No job
   * links: the design carries no jobs that far back, and inventing them would
   * be fabrication rather than coherence. Counted in SEED_COHERENCE_EXTRAS. */
  const historicalInvoices = [
    { code: 'INV-2026-0124', cust: 'Najd Fleet Services', amount: 'SAR 42,900', due: 'Jul 10, 2026', status: 'paid' },
    { code: 'INV-2026-0128', cust: 'Mohammed Hassan', amount: 'SAR 2,310', due: 'Jul 14, 2026', status: 'paid' },
    { code: 'INV-2026-0131', cust: 'Gulf Transport Co.', amount: 'SAR 18,400', due: 'Jul 19, 2026', status: 'unpaid' },
  ]
  await tx.insert(s.invoices).values(
    historicalInvoices.map((i) => {
      const total = parseSarToHalalas(i.amount)
      const { subtotal, tax } = splitVat(total)
      const id = ulid()
      invoiceIds.set(i.code, id)
      return {
        id,
        ...base,
        code: i.code,
        customerName: i.cust,
        customerId: customerIdFor(i.cust),
        dueDate: parseDisplayDate(i.due) ?? SEED.appointmentDate,
        status: i.status,
        subtotalHalalas: subtotal,
        taxHalalas: tax,
        totalHalalas: total,
        paidHalalas: i.status === 'paid' ? total : 0,
        issuedAt: new Date(),
      }
    }),
  )

  const detailInvoiceId = invoiceIds.get(SEED.invoiceWithDetail)
  if (detailInvoiceId) {
    await tx.insert(s.invoiceLines).values(
      T.INVOICE_LINES.map((l, index) =>
        row({
          invoiceId: detailInvoiceId,
          description: l.desc,
          descriptionAr: l.ar,
          kind: l.kind,
          qty: l.qty,
          unitPriceHalalas: sarToHalalas(l.unit),
          partSku: l.part,
          sort: index,
        }),
      ),
    )
    /* F-016: the header says SAR 1,840 gross — SAR 1,600 net — while the five
     * design lines total SAR 1,450 net, so the header claimed SAR 150 of net
     * revenue no line accounted for. The header wins: it appears on two design
     * surfaces (the invoice list and the receipt against it), while the detail
     * page *derives* its totals from the lines — so one added consumables line
     * of SAR 150 makes every surface agree without changing any figure the
     * design shows. Counted in SEED_COHERENCE_EXTRAS. */
    await tx.insert(s.invoiceLines).values(
      row({
        invoiceId: detailInvoiceId,
        description: 'Workshop consumables',
        descriptionAr: 'مستهلكات الورشة',
        kind: 'part',
        qty: 1,
        unitPriceHalalas: sarToHalalas(150),
        partSku: null,
        sort: T.INVOICE_LINES.length,
      }),
    )
    await tx.insert(s.payments).values(
      T.INVOICE_PAYMENTS.map((p) =>
        row({
          invoiceId: detailInvoiceId,
          paidOn: parseDisplayDate(p.date) ?? SEED.appointmentDate,
          method: p.method,
          methodAr: p.ar_method,
          reference: p.ref,
          amountHalalas: sarToHalalas(p.amount),
        }),
      ),
    )
    const paid = T.INVOICE_PAYMENTS.reduce((sum, p) => sum + sarToHalalas(p.amount), 0)
    await tx
      .update(s.invoices)
      .set({ paidHalalas: paid })
      .where(sql`${s.invoices.id} = ${detailInvoiceId}`)
  }

  await tx.insert(s.receipts).values(
    T.RECEIPTS.map((r) =>
      row({
        code: r.id,
        receiptDate: parseDisplayDate(r.date) ?? SEED.appointmentDate,
        customerName: r.customer,
        invoiceCode: r.invoice,
        method: r.method,
        amountHalalas: parseSarToHalalas(r.amount),
        status: r.status,
      }),
    ),
  )

  /* ------------------------------------------------------- warehouse zones (BLK-004)
   * The bays stock is put away in. `InternalWarehouse.tsx` rendered these six
   * zones as a hardcoded array with invented capacity, utilisation and item
   * counts; the names and capacities are ported from it (they are plausible
   * shop zones, not invented people or customers), and nothing else is.
   *
   * These rows must stay identical, and in this order, to
   * `WAREHOUSE_ZONE_FIXTURE` in `app/src/data/repository.ts` — the app ships
   * the same six zones as its no-API fixture, because Golden Path 7 asserts a
   * real per-zone utilisation in a build with no API. `tests/
   * seed-fidelity.test.ts` and `tests/repository-swap.test.ts` compare the two
   * copies field by field, so they cannot drift.
   *
   * Note what is *not* here: no item count and no utilisation. Both are
   * derived from the parts assigned to each zone below. `capacityUnits` is
   * recorded, because how many units a bay holds is a property of the bay. */
  await tx.insert(s.warehouseZones).values([
    row({ code: 'A1', name: 'Main Floor', nameAr: 'الصالة الرئيسية', kind: 'storage', capacityUnits: 500 }),
    row({ code: 'A2', name: 'Mezzanine', nameAr: 'الميزانين', kind: 'storage', capacityUnits: 200 }),
    row({
      code: 'A3',
      name: 'Cold Storage',
      nameAr: 'التخزين المبرد',
      kind: 'cold',
      capacityUnits: 80,
      /* One bay out of service, so the lifecycle the screen can drive is
       * visible in the demo data. `maintenanceSince` is set here because the
       * status is; through the API it is derived from the transition and never
       * accepted as input (`writers.ts`). */
      status: 'maintenance',
      maintenanceSince: new Date('2026-09-10T06:00:00.000Z'),
      notes: 'Compressor service; chiller offline.',
    }),
    row({ code: 'A4', name: 'Hazmat', nameAr: 'المواد الخطرة', kind: 'hazmat', capacityUnits: 50 }),
    row({ code: 'A5', name: 'Receiving', nameAr: 'الاستلام', kind: 'receiving', capacityUnits: 150 }),
    row({ code: 'A6', name: 'Shipping', nameAr: 'الشحن', kind: 'shipping', capacityUnits: 120 }),
  ])

  await tx.insert(s.parts).values(
    T.PARTS.map((p) => {
      const price = parseSarToHalalas(p.price)
      return row({
        name: p.name,
        sku: p.sku,
        priceHalalas: price,
        /* A plausible cost so the margin redaction has something to hide; the
         * design bundle carries sell price only. */
        costHalalas: Math.round(price * 0.65),
        onHand: p.stock,
        reorderLevel: p.reorder,
        /* Where this part is actually racked (BLK-004). This is what makes
         * `InternalWarehouse.tsx`'s item counts and utilisation derived rather
         * than typed in: the zone's count is these rows, counted. Mirrored by
         * `PART_ZONE_CODES` in `app/src/data/repository.ts`, which
         * `tests/repository-swap.test.ts` compares against this. */
        zoneCode: PART_ZONE_CODES[p.sku] ?? null,
      })
    }),
  )

  await tx.insert(s.technicians).values(
    T.TECHS.map((t) =>
      row({
        name: t.name,
        specialty: t.specialty,
        activeJobs: t.jobs,
        rating: Number(t.rating),
      }),
    ),
  )

  /* F-015. The demo technician user must map to a technician row, or the
   * own-scope RLS policy — which resolves `assigned_tech_id` through
   * `technicians.user_id` — shows that user nothing. Saeed Al-Zahrani is the
   * design's own choice: he is the technician on the appointment board,
   * including the 9:00 Toyota Camry slot that is job A3F8B2C1. Inserted after
   * the fixture rows so they still list first, and counted in
   * SEED_COHERENCE_EXTRAS. */
  const saeed = row({
    name: 'Saeed Al-Zahrani',
    specialty: 'General Service',
    activeJobs: 1,
    rating: null,
    userId: SEED.techUserId,
  })
  await tx.insert(s.technicians).values(saeed)
  await tx
    .update(s.jobCards)
    .set({ assignedTechId: saeed.id })
    .where(sql`${s.jobCards.code} = ${SEED.assignedJobCode} and ${s.jobCards.orgId} = ${orgId}`)

  /* F-030: seed the remaining unrostered technicians the appointment board
   * names (Majed Al-Otaibi, Yousef Al-Ghamdi), then set a real technician_id on
   * every appointment by joining on the display name — which now always
   * resolves, so grouping the schedule by the roster is correct. The join is
   * the deterministic reconciliation rule; the technician_name the fixtures
   * carry is untouched, so seed-fidelity still proves the appointment rows
   * intact. */
  if (EXTRA_APPOINTMENT_TECHS.length > 0) {
    await tx.insert(s.technicians).values(
      EXTRA_APPOINTMENT_TECHS.map((name) =>
        row({ name, specialty: 'General Service', activeJobs: 0, rating: null }),
      ),
    )
  }
  await tx.execute(sql`
    update appointments a
    set technician_id = t.id
    from technicians t
    where t.org_id = ${orgId}
      and a.org_id = ${orgId}
      and t.deleted_at is null
      and t.name = a.technician_name
  `)

  const departmentRows = T.DEPARTMENTS.map((d) =>
    row({
      name: d.name,
      head: d.head,
      headcount: d.headcount,
      costCenter: d.costCenter,
      branchLabel: d.branch,
      icon: d.icon,
    }),
  )
  await tx.insert(s.departments).values(departmentRows)
  /* Name → id, so the HR employees below belong to a real department rather
   * than a free-standing string (vertical B coherence). */
  const deptIdByName = new Map(departmentRows.map((d) => [d.name, d.id]))

  await tx.insert(s.leads).values(
    T.LEADS.map((l) =>
      row({
        name: l.name,
        company: l.company,
        valueHalalas: parseSarToHalalas(l.value),
        source: l.source,
        stage: l.stage,
        leadDate: parseDisplayDate(l.date),
        score: l.score,
      }),
    ),
  )

  await tx.insert(s.opportunities).values(
    T.OPPORTUNITIES.map((o) =>
      row({
        name: o.name,
        company: o.company,
        valueHalalas: parseSarToHalalas(o.value),
        stage: o.stage,
        probabilityPct: Number.parseInt(o.prob, 10),
        closeDate: parseDisplayDate(o.close),
        ownerName: o.owner,
      }),
    ),
  )

  await tx.insert(s.campaigns).values(
    T.CAMPAIGNS.map((c) =>
      row({
        name: c.name,
        type: c.type,
        status: c.status,
        reach: c.reach,
        opens: c.opens,
        clicks: c.clicks,
        conversions: c.conversions,
        budgetHalalas: parseSarToHalalas(c.budget),
        spentHalalas: parseSarToHalalas(c.spent),
      }),
    ),
  )

  await tx.insert(s.segments).values(
    T.SEGMENTS.map((g) =>
      row({
        name: g.name,
        memberCount: g.count,
        rules: g.rules,
        lastUpdatedLabel: g.lastUpdated,
      }),
    ),
  )

  await tx.insert(s.crmTasks).values(
    T.CRM_TASKS.map((t) =>
      row({
        title: t.title,
        assignedTo: t.assigned,
        dueDate: parseDisplayDate(t.due),
        priority: t.priority,
        status: t.status,
        type: t.type,
      }),
    ),
  )

  /* F-027: a few customer feedback rows so the read-back the capture form's
   * screen lists has coherent tenant-scoped data. Counted in
   * SEED_COHERENCE_EXTRAS (the design bundle carries no feedback fixture).
   *
   * BLK-004: each row now names the job it is feedback *about*, by the same
   * customer-name join the seeded estimates and invoices already use — each
   * design customer has exactly one job on the board. Without that link a
   * rating is a loose star with nothing behind it, and
   * `GET /reports/technician-leaderboard` — which reaches the technician
   * through `customer_feedback.job_card_id` → `job_cards.assigned_tech_id` —
   * could only ever report "no rated jobs". A customer with no job card keeps a
   * null, rather than being attached to somebody else's work. */
  await tx.insert(s.customerFeedback).values([
    row({
      rating: 5,
      comment: 'Excellent service, my car was ready ahead of schedule.',
      customerName: 'Ahmed Al-Rashid',
      jobCardId: jobIdByCustomer.get('Ahmed Al-Rashid') ?? null,
    }),
    row({
      rating: 4,
      comment: 'Friendly staff and clear pricing. Waiting area could be better.',
      customerName: 'Layla Al-Sulaiman',
      jobCardId: jobIdByCustomer.get('Layla Al-Sulaiman') ?? null,
    }),
    row({
      rating: 5,
      comment: 'Diagnostics were thorough and the estimate was honest.',
      customerName: 'Fahad Al-Qahtani',
      jobCardId: jobIdByCustomer.get('Fahad Al-Qahtani') ?? null,
    }),
  ])

  await tx.insert(s.chartOfAccounts).values(
    T.ACCOUNTS_COA.map((a) =>
      row({
        code: a.code,
        name: a.name,
        type: a.type,
        balanceHalalas: parseSarToHalalas(a.balance),
        childrenCount: a.children,
      }),
    ),
  )

  await tx.insert(s.journalEntries).values(
    T.JOURNAL_ENTRIES.map((j) =>
      row({
        code: j.id,
        entryDate: parseDisplayDate(j.date) ?? SEED.appointmentDate,
        ref: j.ref,
        narration: j.narration,
        debitHalalas: parseSarToHalalas(j.debit),
        creditHalalas: parseSarToHalalas(j.credit),
        status: j.status,
      }),
    ),
  )

  await tx.insert(s.expenses).values(
    T.EXPENSES_DATA.map((e) =>
      row({
        code: e.id,
        expenseDate: parseDisplayDate(e.date) ?? SEED.appointmentDate,
        category: e.category,
        vendor: e.vendor,
        amountHalalas: parseSarToHalalas(e.amount),
        status: e.status,
      }),
    ),
  )

  /* F-028: bank statement lines so BankReconciliation has a bank side to match
   * against. Some already reconciled, some open; credits (deposits) and debits
   * (withdrawals). The design bundle carries no bank-statement fixture — the
   * reconciliation screen was gapped in the prototype — so these are seed
   * coherence rows, counted by SEED_COHERENCE_EXTRAS. */
  await tx.insert(s.bankStatements).values([
    row({
      statementDate: '2026-07-21',
      description: 'Deposit — INV-2026-0142 settlement',
      reference: 'DEP-88213',
      bankAccount: 'SNB Current 1000',
      amountHalalas: parseSarToHalalas('SAR 2,116'),
      direction: 'credit',
      matched: true,
      matchedAt: new Date('2026-07-22T09:00:00Z'),
    }),
    row({
      statementDate: '2026-07-20',
      description: 'Card settlement batch',
      reference: 'CRD-55190',
      bankAccount: 'SNB Current 1000',
      amountHalalas: parseSarToHalalas('SAR 8,940'),
      direction: 'credit',
      matched: false,
    }),
    row({
      statementDate: '2026-07-20',
      description: 'Salary run — July 2026',
      reference: 'PAY-0034',
      bankAccount: 'SNB Current 1000',
      amountHalalas: parseSarToHalalas('SAR 45,000'),
      direction: 'debit',
      matched: true,
      matchedAt: new Date('2026-07-20T14:30:00Z'),
    }),
    row({
      statementDate: '2026-07-19',
      description: 'Supplier transfer — Al Jazira Supplies',
      reference: 'PO-0012',
      bankAccount: 'SNB Current 1000',
      amountHalalas: parseSarToHalalas('SAR 12,800'),
      direction: 'debit',
      matched: false,
    }),
    row({
      statementDate: '2026-07-18',
      description: 'Bank charges',
      reference: 'FEE-0071',
      bankAccount: 'SNB Current 1000',
      amountHalalas: parseSarToHalalas('SAR 120'),
      direction: 'debit',
      matched: false,
    }),
  ])

  /* F-028: a couple of saved report definitions so CustomReports has persisted
   * definitions to list. Also seed coherence rows — no design fixture. */
  await tx.insert(s.savedReports).values([
    row({
      name: 'Monthly revenue by status',
      source: 'invoices',
      ownerName: 'Accountant',
      definition: { groupBy: 'status', range: 'month', columns: ['status', 'invoiced', 'outstanding'] },
    }),
    row({
      name: 'Output VAT — current quarter',
      source: 'tax',
      ownerName: 'Accountant',
      definition: { range: 'quarter', columns: ['taxableSales', 'outputVat'] },
    }),
  ])

  /* --------------------------------------------------- financial products (vertical A)
   * Insurance policies + claims and loan contracts + repayment schedules. The
   * design bundle carries no fixtures for any of these — the financial-products
   * surfaces were mock in the prototype — so every row here is a declared
   * coherence extra (SEED_COHERENCE_EXTRAS), served after the (empty) fixture
   * like the branch directory and the feedback rows. Coherent, not merely
   * present: each policy names a real customer and vehicle, each claim points at
   * a real policy, and each loan's repayment schedule is the amortised schedule
   * its server-computed instalment implies. */
  const policyDefs = [
    { number: 'INS-POL-0001', insurer: 'Tawuniya', type: 'comprehensive', holder: 'Ahmed Al-Rashid', plate: 'RUH 4821', premium: 320000, coverage: 12000000, start: '2026-01-01', end: '2026-12-31', status: 'active' },
    { number: 'INS-POL-0002', insurer: 'Al Rajhi Takaful', type: 'comprehensive', holder: 'Fatima Al-Zahrani', plate: 'JED 9012', premium: 450000, coverage: 20000000, start: '2026-03-01', end: '2027-02-28', status: 'active' },
    { number: 'INS-POL-0003', insurer: 'Tawuniya', type: 'third_party', holder: 'Omar Al-Ghamdi', plate: 'DMM 3357', premium: 110000, coverage: 1000000, start: '2025-06-01', end: '2026-05-31', status: 'expired' },
  ]
  const policyRows = policyDefs.map((p) => {
    const vehicle = vehicleByPlate.get(p.plate)
    return row({
      policyNumber: p.number,
      insurer: p.insurer,
      customerId: customerIdByName.get(p.holder) ?? null,
      holderName: p.holder,
      vehicleId: vehicle?.id ?? null,
      vehicleLabel: vehicle?.makeModel ?? p.plate,
      type: p.type,
      premiumHalalas: p.premium,
      coverageHalalas: p.coverage,
      startDate: p.start,
      endDate: p.end,
      status: p.status,
    })
  })
  await tx.insert(s.insurancePolicies).values(policyRows)
  const policyByNumber = new Map(policyRows.map((p) => [p.policyNumber, p]))

  const p1 = policyByNumber.get('INS-POL-0001')!
  const p2 = policyByNumber.get('INS-POL-0002')!
  await tx.insert(s.insuranceClaims).values([
    row({
      claimNumber: 'INS-CLM-0001',
      policyId: p1.id,
      policyNumber: p1.policyNumber,
      vehicleId: p1.vehicleId,
      vehicleLabel: p1.vehicleLabel,
      /* A claim may relate to a repair: Ahmed's job on the board (A3F8B2C1). */
      jobCardId: jobIdByCustomer.get('Ahmed Al-Rashid') ?? null,
      amountClaimedHalalas: 500000,
      amountApprovedHalalas: null,
      status: 'submitted',
      incidentDate: '2026-07-10',
      description: 'Front bumper and headlamp damage from a car-park collision.',
      submittedBy: SEED.systemUserId,
    }),
    row({
      claimNumber: 'INS-CLM-0002',
      policyId: p2.id,
      policyNumber: p2.policyNumber,
      vehicleId: p2.vehicleId,
      vehicleLabel: p2.vehicleLabel,
      jobCardId: null,
      amountClaimedHalalas: 1200000,
      amountApprovedHalalas: 1000000,
      status: 'approved',
      incidentDate: '2026-06-15',
      description: 'Windscreen replacement and door panel respray after hail damage.',
      submittedBy: SEED.systemUserId,
      approvedBy: SEED.systemUserId,
      approvedAt: new Date('2026-06-20T10:00:00Z'),
    }),
  ])

  /* Loans. The monthly instalment is the real amortised figure the server
   * computes at origination (rules/loans.ts), and each contract's repayments are
   * the schedule that instalment implies — the amounts sum to principal +
   * interest. A couple of early instalments are marked paid so the outstanding
   * the Loan report shows is coherent. */
  const loanDefs = [
    { number: 'LN-2026-0001', borrower: 'Ahmed Al-Rashid', principal: 6000000, rateBps: 600, term: 12, start: '2026-01-01', paid: 2 },
    { number: 'LN-2026-0002', borrower: 'Omar Al-Ghamdi', principal: 12000000, rateBps: 720, term: 24, start: '2026-02-01', paid: 3 },
  ]
  for (const l of loanDefs) {
    const instalment = amortisedInstalmentHalalas(l.principal, l.rateBps, l.term)
    const contract = row({
      contractNumber: l.number,
      customerId: customerIdByName.get(l.borrower) ?? null,
      borrowerName: l.borrower,
      principalHalalas: l.principal,
      rateBps: l.rateBps,
      termMonths: l.term,
      startDate: l.start,
      status: 'active',
      monthlyInstalmentHalalas: instalment,
    })
    await tx.insert(s.loanContracts).values(contract)

    const plan = buildRepaymentPlan(l.principal, l.rateBps, l.term, instalment)
    await tx.insert(s.loanRepayments).values(
      plan.map((entry) => {
        const isPaid = entry.sequence <= l.paid
        const dueDate = addMonths(l.start, entry.sequence)
        return row({
          loanContractId: contract.id,
          contractNumber: l.number,
          sequence: entry.sequence,
          dueDate,
          amountDueHalalas: entry.amountDueHalalas,
          amountPaidHalalas: isPaid ? entry.amountDueHalalas : 0,
          paidDate: isPaid ? dueDate : null,
          status: isPaid ? 'paid' : 'due',
        })
      }),
    )
  }

  /* ------------------------------------------------------------------- HR (vertical B)
   * Employees, one posted payroll run with its lines, timesheets and leave
   * requests. No design fixture — the HR surfaces were mock in the prototype —
   * so every row here is a declared coherence extra (SEED_COHERENCE_EXTRAS),
   * served after the (empty) fixture. Coherent, not merely present: each
   * employee belongs to a real department; the payroll run's frozen totals are
   * the exact column sums of its lines (computed with the shared payroll rule,
   * so a wrong total would fail the coherence test); and Saeed's `on_leave`
   * status matches his approved annual-leave request. Money is integer halalas
   * and every line's net is gross + allowances − deductions. */
  const employeeDefs = [
    { name: 'Ahmed Al-Rashid', nameAr: 'أحمد الراشد', title: 'Workshop Supervisor', dept: 'Workshop Operations', hire: '2021-03-01', salary: 950000, status: 'active' },
    { name: 'Fatima Al-Zahrani', nameAr: 'فاطمة الزهراني', title: 'Service Advisor', dept: 'Front Desk & Service', hire: '2022-06-15', salary: 680000, status: 'active' },
    { name: 'Nasser Al-Dosari', nameAr: 'ناصر الدوسري', title: 'Storekeeper', dept: 'Parts & Inventory', hire: '2020-11-02', salary: 560000, status: 'active' },
    { name: 'Omar Al-Ghamdi', nameAr: 'عمر الغامدي', title: 'Accountant', dept: 'Finance & Accounting', hire: '2019-02-20', salary: 880000, status: 'active' },
    { name: 'Saeed Al-Zahrani', nameAr: 'سعيد الزهراني', title: 'Technician', dept: 'Workshop Operations', hire: '2023-09-10', salary: 610000, status: 'on_leave' },
  ]
  const employeeRows = employeeDefs.map((e, i) =>
    row({
      employeeNumber: `EMP-${String(i + 1).padStart(4, '0')}`,
      name: e.name,
      nameAr: e.nameAr,
      title: e.title,
      departmentId: deptIdByName.get(e.dept) ?? null,
      hireDate: e.hire,
      status: e.status,
      salaryHalalas: e.salary,
    }),
  )
  await tx.insert(s.employees).values(employeeRows)
  const employeeByName = new Map(employeeRows.map((e) => [e.name, e]))

  /* One posted payroll run for 2026-07. Each line: gross is the base salary, a
   * housing allowance of 25%, a GOSI deduction of 10%; the net follows from the
   * shared rule. The run's totals are the column sums of these lines, frozen —
   * exactly what posting computes, so the seed and a real post agree. */
  const runId = ulid()
  const lineRows = employeeRows.map((e) => {
    const gross = e.salaryHalalas
    const allowances = Math.round(gross * 0.25)
    const deductions = Math.round(gross * 0.1)
    return row({
      payrollRunId: runId,
      employeeId: e.id,
      employeeName: e.name,
      grossHalalas: gross,
      allowancesHalalas: allowances,
      deductionsHalalas: deductions,
      netHalalas: payrollLineNetHalalas(gross, allowances, deductions),
    })
  })
  const totals = sumPayrollLines(lineRows)
  await tx.insert(s.payrollRuns).values({
    ...row({
      period: '2026-07',
      status: 'posted',
      grossHalalas: totals.grossHalalas,
      allowancesHalalas: totals.allowancesHalalas,
      deductionsHalalas: totals.deductionsHalalas,
      netHalalas: totals.netHalalas,
      postedAt: new Date('2026-07-28T09:00:00Z'),
      postedBy: SEED.systemUserId,
    }),
    id: runId,
  })
  await tx.insert(s.payrollLines).values(lineRows)

  /* A few timesheets for the last working day of the period. Minutes are the
   * stored figure; hours are derived at the boundary. */
  const timesheetDefs = [
    { name: 'Ahmed Al-Rashid', in: '08:00', out: '16:30', minutes: 510 },
    { name: 'Fatima Al-Zahrani', in: '08:00', out: '16:00', minutes: 480 },
    { name: 'Nasser Al-Dosari', in: '09:00', out: '17:00', minutes: 480 },
  ]
  await tx.insert(s.timesheets).values(
    timesheetDefs.map((tsheet) =>
      row({
        employeeId: employeeByName.get(tsheet.name)!.id,
        employeeName: tsheet.name,
        workDate: '2026-07-27',
        clockIn: tsheet.in,
        clockOut: tsheet.out,
        minutes: tsheet.minutes,
        status: 'approved',
      }),
    ),
  )

  /* Three leave requests spanning the lifecycle: Saeed's approved annual leave
   * (why his employee status is on_leave), a submitted sick request awaiting a
   * decision, and a rejected unpaid request. Approved/rejected rows carry the
   * approver and decision time, like the leave-decision route writes. */
  await tx.insert(s.leaveRequests).values([
    row({
      employeeId: employeeByName.get('Saeed Al-Zahrani')!.id,
      employeeName: 'Saeed Al-Zahrani',
      type: 'annual',
      startDate: '2026-07-20',
      endDate: '2026-07-27',
      days: 7,
      status: 'approved',
      reason: 'Family visit',
      approverId: SEED.systemUserId,
      decidedAt: new Date('2026-07-15T10:00:00Z'),
    }),
    row({
      employeeId: employeeByName.get('Fatima Al-Zahrani')!.id,
      employeeName: 'Fatima Al-Zahrani',
      type: 'sick',
      startDate: '2026-08-03',
      endDate: '2026-08-04',
      days: 2,
      status: 'submitted',
    }),
    row({
      employeeId: employeeByName.get('Nasser Al-Dosari')!.id,
      employeeName: 'Nasser Al-Dosari',
      type: 'unpaid',
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      days: 3,
      status: 'rejected',
      reason: 'Coverage unavailable that week',
      approverId: SEED.systemUserId,
      decidedAt: new Date('2026-08-01T08:30:00Z'),
    }),
  ])

  /* ------------------------------------------------- training LMS (BLK-004)
   * The course catalogue and the roster against it. `TrainingLMS.tsx` rendered
   * these eight courses as a hardcoded array in which each `enrolled` head
   * count and each `completion` percentage was invented; the titles, categories
   * and durations are ported from it (plausible course names, not invented
   * people), and the two numbers deliberately are not — there is nowhere to
   * record them, because they are counted from the enrolments below.
   *
   * These rows must stay identical, and in this order, to
   * `TRAINING_COURSE_FIXTURE` in `app/src/data/repository.ts`: the app ships the
   * same eight courses as its no-API fixture, because Golden Path 14 asserts the
   * catalogue contains `Workplace Safety Essentials` in a build with no API.
   * `tests/seed-fidelity.test.ts` and `tests/repository-swap.test.ts` compare the
   * two copies field by field, so they cannot drift.
   *
   * One title is not ported verbatim: the mock's `Regulatory Compliance 2024` is
   * seeded as `Regulatory Compliance 2026`, so a course published in 2026 is not
   * named after a compliance year two years gone. */
  await tx.insert(s.trainingCourses).values([
    row({ code: 'TRN-0001', title: 'Workplace Safety Essentials', titleAr: 'أساسيات السلامة في مكان العمل', category: 'safety', durationMinutes: 240, status: 'active', publishedAt: new Date('2026-01-15T08:00:00.000Z') }),
    row({ code: 'TRN-0002', title: 'Advanced Engine Diagnostics', titleAr: 'تشخيص المحركات المتقدم', category: 'technical', durationMinutes: 480, status: 'active', publishedAt: new Date('2026-02-01T08:00:00.000Z') }),
    row({ code: 'TRN-0003', title: 'Customer Communication Skills', titleAr: 'مهارات التواصل مع العملاء', category: 'customer_service', durationMinutes: 180, status: 'active', publishedAt: new Date('2026-02-20T08:00:00.000Z') }),
    row({ code: 'TRN-0004', title: 'Regulatory Compliance 2026', titleAr: 'الالتزام التنظيمي 2026', category: 'compliance', durationMinutes: 120, status: 'active', publishedAt: new Date('2026-03-05T08:00:00.000Z') }),
    row({ code: 'TRN-0005', title: 'Electrical Systems Overview', titleAr: 'نظرة عامة على الأنظمة الكهربائية', category: 'technical', durationMinutes: 360, status: 'active', publishedAt: new Date('2026-03-18T08:00:00.000Z') }),
    /* Two courses still being written, so the publish move the screen can drive
     * is visible in the demo data as well as in a test. */
    row({ code: 'TRN-0006', title: 'Fire Safety Procedures', titleAr: 'إجراءات السلامة من الحرائق', category: 'safety', durationMinutes: 90, status: 'draft' }),
    row({ code: 'TRN-0007', title: 'Hybrid Vehicle Maintenance', titleAr: 'صيانة المركبات الهجينة', category: 'technical', durationMinutes: 600, status: 'draft' }),
    /* Retired from the catalogue, but its roster stays: who has done a course is
     * a fact that outlives the course. */
    row({
      code: 'TRN-0008',
      title: 'Service Desk Best Practices',
      titleAr: 'أفضل ممارسات مكتب الخدمة',
      category: 'customer_service',
      durationMinutes: 150,
      status: 'archived',
      publishedAt: new Date('2025-06-01T08:00:00.000Z'),
      archivedAt: new Date('2026-06-30T08:00:00.000Z'),
    }),
  ])

  /* The roster — one row per (employee, course), and the only place a head count
   * or a completion rate comes from. The spread is deliberately uneven so the
   * derived figures differ course by course (80%, 33%, 100%, 50%, 0%, and two
   * courses with no denominator at all) rather than all reading alike, which is
   * what a stored percentage would have let slide.
   *
   * Only the five seeded employees appear; no new people are invented. A
   * withdrawn enrolment is on the list on purpose: it is excluded from both the
   * head count and the completion denominator, so Electrical Systems Overview
   * reads one enrolled and 0%, not two enrolled and 0%. */
  const enrolmentDefs: readonly {
    course: string
    employee: string
    status: string
    completedAt?: string
  }[] = [
    { course: 'TRN-0001', employee: 'Ahmed Al-Rashid', status: 'completed', completedAt: '2026-01-28T11:00:00.000Z' },
    { course: 'TRN-0001', employee: 'Fatima Al-Zahrani', status: 'completed', completedAt: '2026-02-04T11:00:00.000Z' },
    { course: 'TRN-0001', employee: 'Nasser Al-Dosari', status: 'completed', completedAt: '2026-02-11T11:00:00.000Z' },
    { course: 'TRN-0001', employee: 'Omar Al-Ghamdi', status: 'completed', completedAt: '2026-02-18T11:00:00.000Z' },
    { course: 'TRN-0001', employee: 'Saeed Al-Zahrani', status: 'in_progress' },

    { course: 'TRN-0002', employee: 'Ahmed Al-Rashid', status: 'completed', completedAt: '2026-03-10T11:00:00.000Z' },
    { course: 'TRN-0002', employee: 'Saeed Al-Zahrani', status: 'in_progress' },
    { course: 'TRN-0002', employee: 'Nasser Al-Dosari', status: 'enrolled' },

    { course: 'TRN-0003', employee: 'Fatima Al-Zahrani', status: 'completed', completedAt: '2026-03-02T11:00:00.000Z' },
    { course: 'TRN-0003', employee: 'Omar Al-Ghamdi', status: 'completed', completedAt: '2026-03-09T11:00:00.000Z' },

    { course: 'TRN-0004', employee: 'Ahmed Al-Rashid', status: 'completed', completedAt: '2026-03-20T11:00:00.000Z' },
    { course: 'TRN-0004', employee: 'Fatima Al-Zahrani', status: 'completed', completedAt: '2026-03-24T11:00:00.000Z' },
    { course: 'TRN-0004', employee: 'Nasser Al-Dosari', status: 'enrolled' },
    { course: 'TRN-0004', employee: 'Omar Al-Ghamdi', status: 'in_progress' },

    { course: 'TRN-0005', employee: 'Saeed Al-Zahrani', status: 'enrolled' },
    { course: 'TRN-0005', employee: 'Nasser Al-Dosari', status: 'withdrawn' },

    { course: 'TRN-0008', employee: 'Fatima Al-Zahrani', status: 'completed', completedAt: '2025-07-02T11:00:00.000Z' },
    { course: 'TRN-0008', employee: 'Ahmed Al-Rashid', status: 'in_progress' },
  ]
  await tx.insert(s.trainingEnrolments).values(
    enrolmentDefs.map((e) =>
      row({
        courseCode: e.course,
        employeeId: employeeByName.get(e.employee)!.id,
        /* Read from the employee here exactly as `writers.ts` reads it through
         * the API, so the roster never carries a name nobody employs. */
        employeeName: employeeByName.get(e.employee)!.name,
        status: e.status,
        completedAt: e.completedAt ? new Date(e.completedAt) : null,
      }),
    ),
  )

  await tx.insert(s.aiAgents).values(
    T.AI_AGENTS.map((a) =>
      row({
        name: a.name,
        role: a.role,
        model: a.model,
        status: a.status,
        tasks: a.tasks,
        successRateLabel: a.success,
        icon: a.icon,
      }),
    ),
  )

  await tx.insert(s.conversations).values(
    T.CONVERSATIONS.map((c) =>
      row({
        title: c.title,
        userName: c.user,
        messageCount: c.msgs,
        conversationDate: parseDisplayDate(c.date),
        tokensLabel: c.tokens,
      }),
    ),
  )

  const obdDeviceRows = T.OBD_DEVICES.map((d) =>
    row({
      code: d.id,
      bay: d.bay,
      vehicleLabel: d.vehicle,
      plate: d.plate,
      status: d.status,
      vin: d.vin,
      rpm: d.rpm,
      coolant: d.coolant,
      voltage: d.voltage,
      load: d.load,
      dtcCount: d.dtc,
    }),
  )
  await tx.insert(s.obdDevices).values(obdDeviceRows)

  await tx.insert(s.dtcCodes).values(
    T.DTC_CODES.map((d) =>
      row({
        code: d.code,
        description: d.desc,
        descriptionAr: d.ar,
        severity: d.severity,
        system: d.system,
        freezeFrame: d.freeze,
      }),
    ),
  )

  /* F-029: a couple of per-device DTC readings so the device↔dtc link has a
   * coherent history to read back. The design bundle carries none — the link is
   * new — so these are declared coherence extras (SEED_COHERENCE_EXTRAS), served
   * after the (empty) fixture like the branch directory and the feedback rows.
   * `source: 'manual'` and `mock: false`: seeded facts, not a mock scan. */
  const firstDevice = obdDeviceRows[0]
  const readingSeeds = [
    { dtcCode: 'P0301', description: 'Cylinder 1 Misfire Detected', severity: 'high' },
    { dtcCode: 'P0420', description: 'Catalyst System Efficiency Below Threshold', severity: 'medium' },
  ]
  if (firstDevice) {
    await tx.insert(s.obdDtcReadings).values(
      readingSeeds.map((r) =>
        row({
          deviceId: firstDevice.id,
          deviceCode: firstDevice.code,
          dtcCode: r.dtcCode,
          description: r.description,
          severity: r.severity,
          source: 'manual',
          cleared: false,
          mock: false,
        }),
      ),
    )
  }

  await tx.insert(s.oemTools).values(
    T.OEM_TOOLS.map((t) =>
      row({
        brand: t.brand,
        tool: t.tool,
        status: t.status,
        vehicleCount: t.vehicles,
        protocol: t.protocol,
        licence: t.licence,
        expiresOn: parseDisplayDate(t.expires),
        expiresLabel: t.expires,
      }),
    ),
  )

  await tx.insert(s.integrations).values(
    T.SYS_INTEGRATIONS.map((i) =>
      row({
        name: i.name,
        nameAr: i.ar,
        category: i.cat,
        icon: i.icon,
        status: i.status,
        detail: i.detail,
        detailAr: i.ar_detail,
      }),
    ),
  )

  await tx.insert(s.kbProcedures).values(
    T.KB_PROCEDURES.map((k) =>
      row({
        code: k.id,
        title: k.title,
        titleAr: k.ar,
        category: k.cat,
        make: k.make,
        mins: k.mins,
        torque: k.torque,
        torqueAr: k.ar_torque,
        steps: k.steps,
        views: k.views,
        tsb: k.tsb,
        media: k.media,
      }),
    ),
  )

  await tx.insert(s.approvalLines).values(
    T.APPROVAL_LINES.map((a) =>
      row({
        seq: a.id,
        item: a.item,
        itemAr: a.ar,
        qty: a.qty,
        unitPriceHalalas: sarToHalalas(a.unit),
        kind: a.kind,
        urgency: a.urgency,
        note: a.note,
        noteAr: a.ar_note,
      }),
    ),
  )

  await tx.insert(s.diagStages).values(
    T.DIAG_STAGES.map((d) =>
      row({
        stageKey: d.id,
        role: d.role,
        label: d.label,
        labelAr: d.ar,
        ownerName: d.owner,
        ownerNameAr: d.ar_owner,
        atLabel: d.at,
        action: d.act,
        actionAr: d.ar_act,
        adds: d.adds,
        addsAr: d.ar_adds,
      }),
    ),
  )

  await tx.insert(s.diagFindings).values(
    T.DIAG_FINDINGS.map((d) =>
      row({
        dtc: d.dtc,
        finding: d.finding,
        findingAr: d.ar,
        system: d.system,
        systemAr: d.ar_system,
        severity: d.severity,
        evidence: d.evidence,
      }),
    ),
  )

  await tx.insert(s.diagParts).values(
    T.DIAG_PARTS.map((d) =>
      row({
        partSku: d.part,
        description: d.desc,
        descriptionAr: d.ar,
        qty: d.qty,
        priceHalalas: sarToHalalas(d.price),
        stock: d.stock,
        eta: d.eta,
      }),
    ),
  )

  await tx.insert(s.diagLabour).values(
    T.DIAG_LABOUR.map((d) =>
      row({ task: d.task, taskAr: d.ar, hours: d.hrs, rateHalalas: sarToHalalas(d.rate) }),
    ),
  )

  await tx.insert(s.diagCopies).values(
    T.DIAG_COPIES.map((d) =>
      row({
        recipient: d.to,
        recipientAr: d.ar,
        icon: d.icon,
        atLabel: d.at,
        state: d.state,
      }),
    ),
  )

  /* ------------------------------------------------------------ procurement (F-022)
   * The golden path made concrete: a supplier directory, an approved
   * requisition, the purchase order raised from it, and a partial receipt
   * against one of its lines. No design bundle fixture carries any of these —
   * the procurement server did not exist in the prototype — so every row here is
   * a declared coherence extra (SEED_COHERENCE_EXTRAS), served after the (empty)
   * fixture like the branch directory. Coherent, not merely present: the PO
   * references a real supplier and the approved requisition, its total is the
   * server's subtotal + VAT of its lines, and the requisition it came from is
   * marked `ordered`. */
  const supplierRows = [
    row({
      code: 'SUP-0001',
      name: 'Al Jazira Auto Parts',
      nameAr: 'الجزيرة لقطع الغيار',
      contactName: 'Faisal Al-Harbi',
      contactPhone: '+966 11 234 5678',
      contactEmail: 'sales@aljazira-parts.sa',
      status: 'active',
    }),
    row({
      code: 'SUP-0002',
      name: 'Gulf Spare Co.',
      nameAr: 'شركة الخليج لقطع الغيار',
      contactName: 'Noura Al-Qahtani',
      contactPhone: '+966 13 876 5432',
      contactEmail: 'orders@gulfspare.sa',
      status: 'active',
    }),
  ]
  await tx.insert(s.suppliers).values(supplierRows)
  const aljazira = supplierRows[0]!
  const gulfSpare = supplierRows[1]!

  /* The requisition and the lines it carries. Estimated unit prices are the
   * budget figures at request time; the PO sets the agreed price. */
  const reqLineDefs = [
    { partSku: 'BP-FR-220', description: 'Brake Pads (Front) — genuine', qty: 40, estUnitPriceHalalas: 8500 },
    { partSku: 'OF-TY-118', description: 'Oil Filter (Toyota)', qty: 60, estUnitPriceHalalas: 4500 },
  ]
  const requisition = row({
    code: 'REQ-0001',
    requesterName: 'Storekeeper',
    department: 'Workshop',
    priority: 'high',
    /* Ordered, because the purchase order below was raised from it. */
    status: 'ordered',
    neededBy: '2026-08-25',
    estimatedTotalHalalas: requisitionEstimatedTotalHalalas(reqLineDefs),
    notes: 'Front brake pads below reorder; routine oil-filter top-up.',
    submittedBy: SEED.systemUserId,
    approvedBy: SEED.systemUserId,
    approvedAt: new Date('2026-08-12T09:00:00Z'),
  })
  await tx.insert(s.requisitions).values(requisition)
  await tx.insert(s.requisitionLines).values(
    reqLineDefs.map((line, index) => row({ requisitionId: requisition.id, sort: index, ...line })),
  )

  /* The purchase order raised from the approved requisition, approved, and part
   * received: the pads have arrived in full, the filters not yet — a partial
   * receipt, so the order sits in `receiving`. The total is the server's
   * subtotal + VAT of the lines. */
  const poLineDefs = [
    { partSku: 'BP-FR-220', description: 'Brake Pads (Front) — genuine', qty: 40, unitPriceHalalas: 8500, receivedQty: 40 },
    { partSku: 'OF-TY-118', description: 'Oil Filter (Toyota)', qty: 60, unitPriceHalalas: 4200, receivedQty: 0 },
  ]
  const poTotals = purchaseOrderTotals(poLineDefs)
  const purchaseOrder = row({
    code: 'PO-0001',
    supplierId: aljazira.id,
    supplierName: aljazira.name,
    requisitionId: requisition.id,
    status: 'receiving',
    subtotalHalalas: poTotals.subtotalHalalas,
    taxHalalas: poTotals.taxHalalas,
    totalHalalas: poTotals.totalHalalas,
    notes: 'Raised from REQ-0001.',
    orderedAt: new Date('2026-08-12T10:00:00Z'),
    expectedAt: new Date('2026-08-20T00:00:00Z'),
    submittedBy: SEED.systemUserId,
    approvedBy: SEED.systemUserId,
    approvedAt: new Date('2026-08-12T11:00:00Z'),
  })
  await tx.insert(s.purchaseOrders).values(purchaseOrder)
  await tx.insert(s.purchaseOrderLines).values(
    poLineDefs.map((line, index) => row({ purchaseOrderId: purchaseOrder.id, sort: index, ...line })),
  )

  /* ------------------------------------------------------- equipment warranties (BLK-004)
   * Cover on the shop's own tools and fixed assets — a lift, a scanner, a
   * paint booth — never a customer's vehicle. No design bundle fixture
   * carries this table (BLK-004), so every row here is a declared coherence
   * extra (SEED_COHERENCE_EXTRAS), served after the (empty) fixture like the
   * supplier directory: one of each status a screen needs to render
   * (`active`, `expired`, `claimed`), with the claimed one carrying real
   * `claimedAt`/`claimNotes`, not a placeholder. */
  await tx.insert(s.equipmentWarranties).values([
    row({
      warrantyNumber: 'WRN-0001',
      itemName: 'Hydraulic Lift #1',
      provider: 'LiftMaster Co',
      coverage: 'full',
      startDate: '2024-08-01',
      endDate: '2027-07-31',
      status: 'active',
    }),
    row({
      warrantyNumber: 'WRN-0002',
      itemName: 'Diagnostic Scanner Pro',
      provider: 'AutoDiag Inc',
      coverage: 'limited',
      startDate: '2025-04-18',
      endDate: '2027-04-17',
      status: 'active',
    }),
    row({
      warrantyNumber: 'WRN-0003',
      itemName: 'AC Compressor Unit',
      provider: 'CoolTech SA',
      coverage: 'full',
      startDate: '2023-06-01',
      endDate: '2026-05-31',
      status: 'expired',
    }),
    row({
      warrantyNumber: 'WRN-0004',
      itemName: 'Paint Booth System',
      provider: 'SprayTech Ltd',
      coverage: 'extended',
      startDate: '2025-01-15',
      endDate: '2028-01-14',
      status: 'active',
    }),
    row({
      warrantyNumber: 'WRN-0005',
      itemName: 'Wheel Alignment Machine',
      provider: 'AlignPro',
      coverage: 'limited',
      startDate: '2024-03-10',
      endDate: '2026-09-09',
      status: 'active',
    }),
    row({
      warrantyNumber: 'WRN-0006',
      itemName: 'Battery Charger Pro',
      provider: 'PowerMax SA',
      coverage: 'full',
      startDate: '2023-11-20',
      endDate: '2025-11-19',
      status: 'claimed',
      claimedAt: new Date('2025-10-02T09:00:00Z'),
      claimNotes: 'Charger stopped holding voltage; provider replaced the unit under warranty.',
    }),
    row({
      warrantyNumber: 'WRN-0007',
      itemName: 'Tire Changer',
      provider: 'TireTech Inc',
      coverage: 'full',
      startDate: '2025-07-01',
      endDate: '2027-06-30',
      status: 'active',
    }),
    row({
      warrantyNumber: 'WRN-0008',
      itemName: 'Old Welder Unit',
      provider: 'WeldMaster',
      coverage: 'limited',
      startDate: '2021-02-15',
      endDate: '2024-02-14',
      status: 'expired',
    }),
  ])

  /* --------------------------------------------------------------- notifications (BLK-004)
   * A per-tenant feed of job, appointment, invoice and stock alerts.
   * `NotificationCenter.tsx` had no collection to read at all (BLK-004), so
   * every row here is a declared coherence extra (SEED_COHERENCE_EXTRAS),
   * pointed at real seeded records rather than invented ones: the job codes
   * are `T.JOBS` ids, the invoice numbers and amounts are `T.INVOICES`
   * rows (the overdue Fatima Al-Zahrani notice is the same fact the old
   * fabricated mock alluded to, now against a real invoice), and the
   * low-stock alerts are `T.PARTS` rows whose seeded `stock` already sits
   * below their `reorder` level. One of each category, a mix of read and
   * unread, and severities across info/warning/critical so the screen has
   * something to render in every state. */
  await tx.insert(s.notifications).values([
    row({
      category: 'job',
      severity: 'info',
      title: 'Job C2A9F4E3 completed',
      message: "Diagnostic completed for Omar Al-Ghamdi's Hyundai Sonata 2023.",
      link: 'C2A9F4E3',
    }),
    row({
      category: 'job',
      severity: 'info',
      title: 'Job E5D7A3B5 delivered',
      message: "Sara Al-Mutairi's Ford Explorer 2022 has been delivered.",
      link: 'E5D7A3B5',
      readAt: new Date('2026-07-20T09:15:00Z'),
    }),
    row({
      category: 'appointment',
      severity: 'warning',
      title: 'Appointment awaiting confirmation',
      message: 'Layla Al-Sulaiman — GMC Yukon 2023, 10:30 AM, Bay 3 — is still awaiting confirmation.',
    }),
    row({
      category: 'appointment',
      severity: 'info',
      title: 'Appointment confirmed',
      message: 'Ahmed Al-Rashid — Toyota Camry 2022, 9:00 AM, Bay 1 — confirmed for Maintenance.',
      readAt: new Date('2026-07-19T08:00:00Z'),
    }),
    row({
      category: 'invoice',
      severity: 'critical',
      title: 'Invoice INV-2026-0141 overdue',
      message: "Fatima Al-Zahrani's invoice for SAR 4,250 is overdue.",
      link: 'INV-2026-0141',
    }),
    row({
      category: 'invoice',
      severity: 'warning',
      title: 'Invoice INV-2026-0139 due soon',
      message: "Mohammed Hassan's invoice for SAR 2,975 is due Jul 30, 2026.",
      link: 'INV-2026-0139',
      readAt: new Date('2026-07-22T11:30:00Z'),
    }),
    row({
      category: 'stock',
      severity: 'warning',
      title: 'Brake Pads (Front) low on stock',
      message: '18 units on hand, below the reorder level of 25 (SKU BP-FR-220).',
      link: 'BP-FR-220',
    }),
    row({
      category: 'stock',
      severity: 'critical',
      title: 'Spark Plug Set critically low',
      message: '12 units on hand, below the reorder level of 20 (SKU SP-SET-04).',
      link: 'SP-SET-04',
      readAt: new Date('2026-07-23T07:45:00Z'),
    }),
  ])

  /* ------------------------------------------------------- parts network (BLK-004)
   * A small, coherent supply network: three members, four requests, three
   * quotations and three orders. No design bundle fixture carries any of these
   * tables — the eight parts-network screens all rendered an honest "no data
   * source yet" shell — so every row is a declared coherence extra
   * (SEED_COHERENCE_EXTRAS), served after the (empty) fixture like the
   * supplier directory.
   *
   * Nothing invented: the two supplier members *are* the two seeded suppliers
   * and point at their `suppliers` rows through `supplierId`, the garage member
   * is the `Neighbouring Garage` organization the seed already creates for the
   * isolation tests, every `partSku` is a `T.PARTS` row, and every request's
   * vehicle and `jobCode` are a `T.JOBS` row. Coherent, not merely present:
   * NRQ-0001 is `quoted` with exactly the two quotations that name it,
   * NRQ-0002 is `ordered` because NQT-0003 was accepted and NOR-0001 came out
   * of it, and NOR-0001's total is `qty × unitPrice`.
   *
   * These rows belong to the primary tenant and to no one else. The
   * `Neighbouring Garage` member below is *this* workshop's directory entry for
   * that garage — a name and a phone number it keeps — not a window into that
   * organization's own data, which stays invisible under RLS. See
   * `drizzle/0024_parts_network.sql`. */
  const networkMemberRows = [
    row({
      code: 'NWM-0001',
      name: aljazira.name,
      nameAr: aljazira.nameAr,
      kind: 'supplier',
      city: 'Riyadh',
      contactName: aljazira.contactName,
      contactPhone: aljazira.contactPhone,
      contactEmail: aljazira.contactEmail,
      /* Reuse over invention: the same vendor this workshop raises purchase
       * orders against, related by FK rather than duplicated. */
      supplierId: aljazira.id,
      status: 'active',
      ratingTenths: 46,
      notes: 'Primary parts vendor; also quotes on network requests.',
    }),
    row({
      code: 'NWM-0002',
      name: gulfSpare.name,
      nameAr: gulfSpare.nameAr,
      kind: 'supplier',
      city: 'Dammam',
      contactName: gulfSpare.contactName,
      contactPhone: gulfSpare.contactPhone,
      contactEmail: gulfSpare.contactEmail,
      supplierId: gulfSpare.id,
      status: 'active',
      ratingTenths: 42,
    }),
    row({
      code: 'NWM-0003',
      name: 'Neighbouring Garage',
      kind: 'garage',
      city: 'Riyadh',
      status: 'active',
      /* Unrated: this workshop has not traded enough with them to score them,
       * and the screen shows no stars rather than a fabricated default. */
      ratingTenths: null,
      notes: 'Trades spare stock both ways; sends occasional requests.',
    }),
  ]
  await tx.insert(s.partsNetworkMembers).values(networkMemberRows)
  const [memberAlJazira, memberGulfSpare, memberNeighbour] = networkMemberRows as [
    (typeof networkMemberRows)[number],
    (typeof networkMemberRows)[number],
    (typeof networkMemberRows)[number],
  ]

  const brakePadsRequest = row({
    code: 'NRQ-0001',
    direction: 'outgoing',
    partSku: 'BP-FR-220',
    partName: 'Brake Pads (Front)',
    partNumber: 'BP-FR-220',
    qty: 40,
    urgency: 'high',
    vehicleInfo: 'Toyota Camry 2022',
    jobCode: 'A3F8B2C1',
    neededBy: '2026-08-02',
    /* Two quotations arrived, neither accepted yet. */
    status: 'quoted',
    quotationCount: 2,
    quotedAt: new Date('2026-07-27T08:30:00Z'),
    notes: 'Broadcast to the network — front pads below reorder level.',
  })
  const sparkPlugRequest = row({
    code: 'NRQ-0002',
    direction: 'outgoing',
    memberId: memberAlJazira.id,
    memberName: memberAlJazira.name,
    partSku: 'SP-SET-04',
    partName: 'Spark Plug Set',
    partNumber: 'SP-SET-04',
    qty: 20,
    urgency: 'urgent',
    vehicleInfo: 'Nissan Patrol 2021',
    jobCode: 'B7E4D9A2',
    neededBy: '2026-07-30',
    /* NQT-0003 was accepted and NOR-0001 raised from it. */
    status: 'ordered',
    quotationCount: 1,
    quotedAt: new Date('2026-07-25T11:00:00Z'),
    orderedAt: new Date('2026-07-26T09:15:00Z'),
  })
  const airFilterRequest = row({
    code: 'NRQ-0003',
    direction: 'outgoing',
    partSku: 'AF-UN-002',
    partName: 'Air Filter (Universal)',
    partNumber: 'AF-UN-002',
    qty: 30,
    urgency: 'normal',
    vehicleInfo: 'Hyundai Sonata 2023',
    jobCode: 'C2A9F4E3',
    neededBy: '2026-08-10',
    /* Still waiting on the network: no quotations, so the Quotations view has
     * a genuinely empty case to render. */
    status: 'open',
  })
  const incomingRequest = row({
    code: 'NRQ-0004',
    /* An `incoming` request: one this workshop recorded as having been sent to
     * it by a member. Still its own row under its own `orgId` — the member is a
     * directory entry, not another tenant. */
    direction: 'incoming',
    memberId: memberNeighbour.id,
    memberName: memberNeighbour.name,
    partSku: 'OF-TY-118',
    partName: 'Oil Filter (Toyota)',
    partNumber: 'OF-TY-118',
    qty: 12,
    urgency: 'normal',
    neededBy: '2026-08-05',
    status: 'open',
    notes: 'Asked whether we can spare a dozen from the Riyadh shelf.',
  })
  await tx
    .insert(s.partsNetworkRequests)
    .values([brakePadsRequest, sparkPlugRequest, airFilterRequest, incomingRequest])

  const acceptedQuotationAt = new Date('2026-07-26T09:15:00Z')
  const acceptedQuotation = row({
    code: 'NQT-0003',
    requestId: sparkPlugRequest.id,
    memberId: memberAlJazira.id,
    memberName: memberAlJazira.name,
    unitPriceHalalas: 13500,
    qtyAvailable: 24,
    leadTimeDays: 3,
    condition: 'new',
    warrantyMonths: 12,
    status: 'accepted',
    acceptedAt: acceptedQuotationAt,
  })
  await tx.insert(s.partsNetworkQuotations).values([
    row({
      code: 'NQT-0001',
      requestId: brakePadsRequest.id,
      memberId: memberAlJazira.id,
      memberName: memberAlJazira.name,
      /* The same SAR 85 a pad costs on PO-0001 — the network quote and the
       * purchase order agree because they are the same vendor. */
      unitPriceHalalas: 8500,
      qtyAvailable: 40,
      leadTimeDays: 2,
      condition: 'new',
      warrantyMonths: 12,
      status: 'pending',
    }),
    row({
      code: 'NQT-0002',
      requestId: brakePadsRequest.id,
      memberId: memberGulfSpare.id,
      memberName: memberGulfSpare.name,
      unitPriceHalalas: 9100,
      qtyAvailable: 60,
      leadTimeDays: 1,
      condition: 'oem',
      warrantyMonths: 24,
      status: 'pending',
      notes: 'OEM part, next-day from Dammam.',
    }),
    acceptedQuotation,
  ])

  await tx.insert(s.partsNetworkOrders).values([
    row({
      code: 'NOR-0001',
      requestId: sparkPlugRequest.id,
      quotationId: acceptedQuotation.id,
      memberId: memberAlJazira.id,
      memberName: memberAlJazira.name,
      direction: 'outbound',
      partName: 'Spark Plug Set',
      qty: 20,
      unitPriceHalalas: 13500,
      /* `qty × unitPrice`, the figure the server computes — not a literal. */
      totalHalalas: 20 * 13500,
      status: 'shipped',
      trackingRef: 'AJ-SHP-40218',
      expectedAt: '2026-07-30',
      shippedAt: new Date('2026-07-27T06:00:00Z'),
      notes: 'Raised from NQT-0003.',
    }),
    row({
      code: 'NOR-0002',
      memberId: memberGulfSpare.id,
      memberName: memberGulfSpare.name,
      direction: 'outbound',
      partName: 'Air Filter (Universal)',
      qty: 30,
      unitPriceHalalas: 7800,
      totalHalalas: 30 * 7800,
      status: 'received',
      trackingRef: 'GS-SHP-11907',
      expectedAt: '2026-07-18',
      shippedAt: new Date('2026-07-15T07:30:00Z'),
      receivedAt: new Date('2026-07-18T10:05:00Z'),
      notes: 'Agreed directly with Gulf Spare, outside the quotation flow.',
    }),
    row({
      code: 'NOR-0003',
      memberId: memberNeighbour.id,
      memberName: memberNeighbour.name,
      /* `inbound`: this workshop is the one fulfilling. */
      direction: 'inbound',
      partName: 'Oil Filter (Toyota)',
      qty: 12,
      unitPriceHalalas: 4500,
      totalHalalas: 12 * 4500,
      status: 'placed',
      expectedAt: '2026-08-05',
    }),
  ])
}

/** Creates the tenants, their branches and users, then fills the primary one
 *  from the design bundle. The second organization exists so isolation tests
 *  have a real neighbour to fail to reach — a test that crosses into an empty
 *  tenant proves nothing. */
export async function seedAll(tx: Tx): Promise<void> {
  await tx.insert(s.organizations).values([
    /* vatNumber: issuing an invoice reads this and refuses without one
     * (routes/invoices.ts) — a real ZATCA-format registration (15 digits,
     * starting and ending with 3), not the literal the frontend used to
     * hardcode in its place. */
    {
      id: SEED.orgId,
      name: 'SALIS AUTO Riyadh',
      slug: 'salis-riyadh',
      plan: 'enterprise',
      vatNumber: '300123456700003',
    },
    { id: SEED.otherOrgId, name: 'Neighbouring Garage', slug: 'neighbour', plan: 'starter' },
  ])

  await tx.insert(s.branches).values([
    {
      id: SEED.mainBranchId,
      orgId: SEED.orgId,
      branchId: SEED.mainBranchId,
      name: 'Riyadh Main',
      city: 'Riyadh',
      isMain: true,
    },
    {
      id: SEED.secondBranchId,
      orgId: SEED.orgId,
      branchId: SEED.secondBranchId,
      name: 'Jeddah Branch',
      city: 'Jeddah',
    },
    {
      id: SEED.otherBranchId,
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
      name: 'Neighbour Main',
      city: 'Dammam',
      isMain: true,
    },
  ])

  await tx.insert(s.users).values([
    {
      id: SEED.systemUserId,
      orgId: SEED.orgId,
      branchId: SEED.mainBranchId,
      email: 'system@salisauto.sa',
      name: 'Seed',
      role: 'owner',
    },
    ...DEMO_USERS.map((u) => ({
      /* The technician's id is fixed so the seeded technician row can carry a
       * user mapping that tests and the demo login both resolve (F-015). */
      id: u.role === 'technician' ? SEED.techUserId : ulid(),
      orgId: SEED.orgId,
      branchId: SEED.mainBranchId,
      email: u.email,
      name: u.name,
      role: u.role,
      createdBy: SEED.systemUserId,
      updatedBy: SEED.systemUserId,
    })),
  ])

  await seed(tx, SEED.orgId, SEED.mainBranchId)

  /* Link the portal logins to the customer they are. This runs after `seed()`
   * because the `customers` rows do not exist until it has, and a portal login
   * with no link is not so much broken as blind: `r_self` compares
   * `customer_id` against `app_customer()`, and NULL matches nothing. */
  for (const demo of DEMO_USERS) {
    if (!demo.customer) continue
    const [customer] = await tx
      .select({ id: s.customers.id })
      .from(s.customers)
      .where(and(eq(s.customers.orgId, SEED.orgId), eq(s.customers.name, demo.customer)))
      .limit(1)
    if (!customer) {
      throw new Error(
        `demo user ${demo.email} names customer "${demo.customer}", which the seed does not create`,
      )
    }
    await tx
      .update(s.users)
      .set({ customerId: customer.id })
      .where(and(eq(s.users.orgId, SEED.orgId), eq(s.users.email, demo.email)))
  }

  /* A minimal neighbour: enough rows for a cross-tenant read to have something
   * real to be refused. */
  await tx.insert(s.customers).values({
    id: ulid(),
    orgId: SEED.otherOrgId,
    branchId: SEED.otherBranchId,
    name: 'Neighbour Customer',
    phone: '+966 55 000 0000',
    type: 'individual',
  })
  await tx.insert(s.invoices).values({
    id: ulid(),
    orgId: SEED.otherOrgId,
    branchId: SEED.otherBranchId,
    code: 'INV-NEIGHBOUR-0001',
    customerName: 'Neighbour Customer',
    dueDate: SEED.appointmentDate,
    status: 'unpaid',
    subtotalHalalas: 100000,
    taxHalalas: 15000,
    totalHalalas: 115000,
  })

  await tx.insert(s.auditLog).values({
    id: ulid(),
    orgId: SEED.orgId,
    branchId: SEED.mainBranchId,
    actorId: SEED.systemUserId,
    actorRole: 'owner',
    action: 'seed',
    entity: 'organization',
    entityId: SEED.orgId,
    after: { source: 'app/src/data/generated/tables.ts' },
    source: 'seed',
  })
}

async function main(): Promise<void> {
  const config = loadEnv()
  const handle = createDb(config.DATABASE_ADMIN_URL ?? config.DATABASE_URL, 1)
  try {
    await handle.db.transaction(async (tx) => {
      /* The seed writes across both tenants, which no ordinary principal may
       * do; `platform` is the scope that legitimately spans them. */
      await tx.execute(sql`select set_config('app.scope', 'platform', true)`)
      await seedAll(tx as Tx)
    })
    process.stdout.write('seeded from app/src/data/generated/tables.ts\n')
  } finally {
    await handle.close()
  }
}

const isEntry = process.argv[1]?.endsWith('seed.ts')
if (isEntry) {
  main().catch((error: unknown) => {
    process.stderr.write(`${(error as Error).stack ?? String(error)}\n`)
    process.exit(1)
  })
}
