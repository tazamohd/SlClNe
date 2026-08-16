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
import { sql } from 'drizzle-orm'
import { monotonicFactory } from 'ulid'
import { parseSarToHalalas, sarToHalalas, minuteOfDay } from '@salis/contract'
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
}

/** The 14 demo identities from `RBAC.md`. Passwords are **not** set here —
 *  credentials belong to the authentication module, and a seeded password hash
 *  in a repository is a credential in a repository. */
const DEMO_USERS: readonly { role: string; email: string; name: string }[] = [
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
  { role: 'customer', email: 'khalid@example.sa', name: 'Khalid Al-Otaibi' },
]

/** Back-computes the VAT split from a gross total, so `subtotal + tax` equals
 *  the figure the design shows to the halala rather than approximately. */
function splitVat(totalHalalas: number): { subtotal: number; tax: number } {
  const subtotal = Math.round(totalHalalas / 1.15)
  return { subtotal, tax: totalHalalas - subtotal }
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

  await tx.insert(s.customers).values(
    T.CUSTOMERS.map((c) =>
      row({
        name: c.name,
        phone: c.phone,
        type: 'individual',
        vehicleCount: c.vehicles,
        totalSpentHalalas: parseSarToHalalas(c.spent),
        lastVisitLabel: c.last,
      }),
    ),
  )

  await tx.insert(s.vehicles).values(
    T.VEHICLES.map((v) =>
      row({
        plate: v.plate,
        makeModel: v.make,
        ownerName: v.owner,
        mileageKm: parseKilometres(v.mileage),
        lastServiceLabel: v.last,
        status: v.status,
      }),
    ),
  )

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
        vehicleLabel: e.veh,
        subtotalHalalas: subtotal,
        taxHalalas: tax,
        totalHalalas: total,
        status: e.status,
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

  await tx.insert(s.departments).values(
    T.DEPARTMENTS.map((d) =>
      row({
        name: d.name,
        head: d.head,
        headcount: d.headcount,
        costCenter: d.costCenter,
        branchLabel: d.branch,
        icon: d.icon,
      }),
    ),
  )

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
   * SEED_COHERENCE_EXTRAS (the design bundle carries no feedback fixture). */
  await tx.insert(s.customerFeedback).values([
    row({
      rating: 5,
      comment: 'Excellent service, my car was ready ahead of schedule.',
      customerName: 'Ahmed Al-Rashid',
    }),
    row({
      rating: 4,
      comment: 'Friendly staff and clear pricing. Waiting area could be better.',
      customerName: 'Layla Al-Sulaiman',
    }),
    row({
      rating: 5,
      comment: 'Diagnostics were thorough and the estimate was honest.',
      customerName: 'Fahad Al-Qahtani',
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

  await tx.insert(s.obdDevices).values(
    T.OBD_DEVICES.map((d) =>
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
    ),
  )

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
}

/** Creates the tenants, their branches and users, then fills the primary one
 *  from the design bundle. The second organization exists so isolation tests
 *  have a real neighbour to fail to reach — a test that crosses into an empty
 *  tenant proves nothing. */
export async function seedAll(tx: Tx): Promise<void> {
  await tx.insert(s.organizations).values([
    { id: SEED.orgId, name: 'SALIS AUTO Riyadh', slug: 'salis-riyadh', plan: 'enterprise' },
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
