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
  mainBranchId: '01JAAAAAAAAAAAAAAAAAAABR1',
  secondBranchId: '01JAAAAAAAAAAAAAAAAAAABR2',
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
export const SEED_COHERENCE_EXTRAS: Readonly<Record<string, number>> = {
  /** Saeed Al-Zahrani — the demo technician user's own technician row. The
   *  design's TECHS list omits him although its appointment board names him;
   *  without the row, `technicians.user_id` maps the demo technician user to
   *  nothing and the own-scope portal is empty for the user it is for. */
  technicians: 1,
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

  await tx.insert(s.fleets).values(
    T.FLEETS.map((f) =>
      row({
        name: f.name,
        vehicleCount: f.vehicles,
        activeCount: f.active,
        contractStatus: f.contract,
      }),
    ),
  )

  await tx.insert(s.jobCards).values(
    T.JOBS.map((j) =>
      row({
        code: j.id,
        customerName: j.cust,
        vehicleLabel: j.veh,
        service: j.svc,
        status: j.st,
        stage: STAGE_FOR_STATUS[j.st] ?? 'checkin',
        priority: j.pr,
      }),
    ),
  )

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
