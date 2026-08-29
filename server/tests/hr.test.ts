/** Vertical B — HR (employees, payroll, time & leave).
 *
 *  Five hr-gated collections through the generic router, plus two bespoke
 *  routers: payroll posting (draft → posted, totals frozen from the lines, a
 *  posted run immutable per §5b) and the leave decision (approve/reject, gated
 *  and audited). This proves the seed coherence, the salary redaction actually
 *  firing on the wire, the payroll-posting invariant, the leave lifecycle and
 *  the tenant isolation.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { payrollLineNetHalalas, sumPayrollLines } from '@salis/contract/rules'
import { employees, leaveRequests, payrollLines } from '../src/db/schema'
import { collectionByKey } from '../src/registry'
import { presentRow } from '../src/routes/collections'
import type { Principal } from '../src/db/tenant'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const json = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

/** Runs a read under the tenant's own scope, the way seed-coherence does. */
async function query<T>(text: ReturnType<typeof sql>): Promise<T[]> {
  return harness.handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
    )
    return (await tx.execute(text)) as unknown as T[]
  })
}

/* ------------------------------------------------------ seeded collections */

describe('the seeded HR collections', () => {
  it('serves the coherent employees, payroll, timesheets and leave to hr', async () => {
    const hr = await harness.token('hr')
    const totals = async (path: string) => {
      const res = await harness.app.inject({
        method: 'GET',
        url: `/api/v1/${path}?pageSize=100`,
        ...json(hr),
      })
      expect(res.statusCode, res.body).toBe(200)
      return (res.json() as { page: { total: number } }).page.total
    }
    expect(await totals('employees')).toBe(5)
    expect(await totals('payroll/runs')).toBe(1)
    expect(await totals('payroll/lines')).toBe(5)
    expect(await totals('timesheets')).toBe(3)
    expect(await totals('leave-requests')).toBe(3)
  })

  it('gives every employee a department that exists (coherence)', async () => {
    const rows = await query<{ number: string; dept: string | null }>(sql`
      select e.employee_number as number, d.id as dept
      from employees e left join departments d on d.id = e.department_id
      where e.org_id = ${SEED.orgId}
    `)
    expect(rows.length).toBe(5)
    for (const r of rows) expect(r.dept, `employee ${r.number} has no department`).toBeTruthy()
  })

  it('freezes the posted run totals to the exact column sums of its lines', async () => {
    const [run] = await query<{
      id: string
      status: string
      gross: string
      allowances: string
      deductions: string
      net: string
    }>(sql`
      select id, status, gross_halalas::text as gross, allowances_halalas::text as allowances,
             deductions_halalas::text as deductions, net_halalas::text as net
      from payroll_runs where org_id = ${SEED.orgId}
    `)
    expect(run!.status).toBe('posted')

    const lines = await query<{ gross: string; allowances: string; deductions: string; net: string }>(sql`
      select gross_halalas::text as gross, allowances_halalas::text as allowances,
             deductions_halalas::text as deductions, net_halalas::text as net
      from payroll_lines where org_id = ${SEED.orgId} and payroll_run_id = ${run!.id}
    `)
    expect(lines.length).toBe(5)

    const summed = sumPayrollLines(
      lines.map((l) => ({
        grossHalalas: Number(l.gross),
        allowancesHalalas: Number(l.allowances),
        deductionsHalalas: Number(l.deductions),
        netHalalas: Number(l.net),
      })),
    )
    expect(Number(run!.gross)).toBe(summed.grossHalalas)
    expect(Number(run!.allowances)).toBe(summed.allowancesHalalas)
    expect(Number(run!.deductions)).toBe(summed.deductionsHalalas)
    expect(Number(run!.net)).toBe(summed.netHalalas)
    // And every line's net ties to its own three inputs.
    for (const l of lines) {
      expect(Number(l.net)).toBe(
        payrollLineNetHalalas(Number(l.gross), Number(l.allowances), Number(l.deductions)),
      )
    }
  })

  it('refuses a role without the hr view grant', async () => {
    const technician = await harness.token('technician')
    for (const path of ['employees', 'payroll/runs', 'payroll/lines', 'timesheets', 'leave-requests']) {
      const res = await harness.app.inject({ method: 'GET', url: `/api/v1/${path}`, ...json(technician) })
      expect(res.statusCode, path).toBe(403)
    }
  })
})

/* -------------------------------------------------------- salary redaction */

describe('salary and pay are redacted on the wire for a hidden role', () => {
  /** One raw employee row, read under the tenant's own scope. */
  async function anEmployee() {
    const [row] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(employees).where(eq(employees.orgId, SEED.orgId)).limit(1)
    })
    return row!
  }

  function principal(role: Principal['role']): Principal {
    return { userId: '01JHIDDENUSERXXXXXXXXXXXXX', orgId: SEED.orgId, branchId: SEED.mainBranchId, role, scope: 'all' }
  }

  it('nulls both salary and salaryHalalas for a role the Employee salary rule hides, keeping non-pay fields', async () => {
    const def = collectionByKey('employees')!
    const row = await anEmployee()

    /* `technician` is in the `Employee salary` hidden list. `presentRow` is the
     * exact object the GET route serialises, so this is the wire. */
    const hidden = presentRow(def, principal('technician'), row) as Record<string, unknown>
    expect(hidden.salaryHalalas, 'raw halalas must be nulled').toBeNull()
    expect(hidden.salary, 'formatted SAR string must be nulled too').toBeNull()
    // Non-sensitive fields survive redaction.
    expect(hidden.name).toBe(row.name)
    expect(hidden.employeeNumber).toBe(row.employeeNumber)

    /* An HR manager is not hidden: the pay figure is present and real. */
    const shown = presentRow(def, principal('hr'), row) as Record<string, unknown>
    expect(typeof shown.salaryHalalas).toBe('number')
    expect(shown.salaryHalalas).toBe(row.salaryHalalas)
    expect(typeof shown.salary).toBe('string')
  })

  it('nulls every payroll-line pay figure for a hidden role', async () => {
    const def = collectionByKey('payrollLines')!
    const [line] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(payrollLines).where(eq(payrollLines.orgId, SEED.orgId)).limit(1)
    })
    const hidden = presentRow(def, principal('advisor'), line!) as Record<string, unknown>
    for (const key of ['grossPayHalalas', 'allowancesHalalas', 'deductionsHalalas', 'netPayHalalas']) {
      expect(hidden[key], `${key} must be nulled`).toBeNull()
    }
    for (const key of ['grossPay', 'allowances', 'deductions', 'netPay']) {
      expect(hidden[key], `${key} string must be nulled`).toBeNull()
    }
    expect(hidden.employeeName).toBe(line!.employeeName)
  })

  it('serves the real pay figure to hr over HTTP (permitted role, on the wire)', async () => {
    const hr = await harness.token('hr')
    const res = await harness.app.inject({ method: 'GET', url: '/api/v1/employees?pageSize=1', ...json(hr) })
    expect(res.statusCode, res.body).toBe(200)
    const [emp] = (res.json() as { rows: Record<string, unknown>[] }).rows
    expect(typeof emp!.salaryHalalas).toBe('number')
  })
})

/* --------------------------------------------------- payroll posting (§5b) */

describe('the payroll-posting invariant', () => {
  async function draftRunWithLine(): Promise<{ runId: string; token: string }> {
    const hr = await harness.token('hr')
    const employeeId = await firstEmployeeId(hr)
    /* A fresh draft run for a period the seed does not use. */
    const period = `2026-1${Math.floor(Math.random() * 9)}`
    const run = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/payroll/runs',
      ...json(hr, { period }),
    })
    expect(run.statusCode, run.body).toBe(201)
    const runId = (run.json() as { _id: string; status: string })._id
    expect((run.json() as { status: string }).status).toBe('draft')

    const line = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/payroll/lines',
      ...json(hr, {
        payrollRunId: runId,
        employeeId,
        grossHalalas: 800_000,
        allowancesHalalas: 200_000,
        deductionsHalalas: 100_000,
      }),
    })
    expect(line.statusCode, line.body).toBe(201)
    // Net is computed on the server, never sent.
    expect((line.json() as { netPayHalalas: number }).netPayHalalas).toBe(900_000)
    return { runId, token: hr }
  }

  it('posts a draft run, freezing totals from the lines, then refuses a second post', async () => {
    const { runId, token } = await draftRunWithLine()

    const posted = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/payroll/runs/${runId}/post`,
      ...json(token, {}),
    })
    expect(posted.statusCode, posted.body).toBe(200)
    const run = posted.json() as { status: string; grossPayHalalas: number; netPayHalalas: number }
    expect(run.status).toBe('posted')
    expect(run.grossPayHalalas).toBe(800_000)
    expect(run.netPayHalalas).toBe(900_000)

    /* The invariant: a posted run cannot be reopened. A second post conflicts. */
    const again = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/payroll/runs/${runId}/post`,
      ...json(token, {}),
    })
    expect(again.statusCode).toBe(409)

    /* And it cannot be edited: a generic patch of a posted run is refused. */
    const edit = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/payroll/runs/${runId}`,
      ...json(token, { period: '2099-01' }),
    })
    expect(edit.statusCode).toBe(409)

    /* Nor can a line be added to a posted run. */
    const employeeId = await firstEmployeeId(token)
    const lateLine = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/payroll/lines',
      ...json(token, { payrollRunId: runId, employeeId, grossHalalas: 1000 }),
    })
    expect(lateLine.statusCode).toBe(409)

    /* The posting is audited. */
    const audits = await query<{ action: string }>(sql`
      select action from audit_log
      where org_id = ${SEED.orgId} and entity = 'payroll_run' and entity_id = ${runId}
      order by ts
    `)
    expect(audits.map((a) => a.action)).toContain('post')
  })
})

/* ------------------------------------------------------- leave lifecycle */

describe('the leave-request decision', () => {
  async function submit(token: string): Promise<string> {
    const employeeId = await firstEmployeeId(token)
    const res = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/leave-requests',
      ...json(token, {
        employeeId,
        type: 'annual',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        days: 3,
      }),
    })
    expect(res.statusCode, res.body).toBe(201)
    const row = res.json() as { _id: string; status: string }
    expect(row.status).toBe('submitted')
    return row._id
  }

  it('approves a submitted request, records the approver, audits, and refuses a second decision', async () => {
    const hr = await harness.token('hr')
    const id = await submit(hr)

    const approved = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${id}/approve`,
      ...json(hr, {}),
    })
    expect(approved.statusCode, approved.body).toBe(200)
    const row = approved.json() as { status: string; approverId: string | null }
    expect(row.status).toBe('approved')
    expect(row.approverId).toBeTruthy()

    /* Already decided — a reject afterwards conflicts. */
    const reject = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${id}/reject`,
      ...json(hr, { reason: 'changed mind' }),
    })
    expect(reject.statusCode).toBe(409)

    const audits = await query<{ action: string }>(sql`
      select action from audit_log
      where org_id = ${SEED.orgId} and entity = 'leave_request' and entity_id = ${id}
    `)
    expect(audits.map((a) => a.action)).toContain('approve')
  })

  it('refuses a reason-less rejection but accepts one with a reason', async () => {
    const hr = await harness.token('hr')
    const id = await submit(hr)

    const noReason = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${id}/reject`,
      ...json(hr, {}),
    })
    expect(noReason.statusCode).toBe(400)

    const rejected = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${id}/reject`,
      ...json(hr, { reason: 'Insufficient balance' }),
    })
    expect(rejected.statusCode, rejected.body).toBe(200)
    expect((rejected.json() as { status: string }).status).toBe('rejected')
  })

  it('refuses a role without the hr approval grant', async () => {
    const hr = await harness.token('hr')
    const id = await submit(hr)
    /* The accountant may view hr but holds no `a` grant on it. */
    const accountant = await harness.token('accountant')
    const res = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${id}/approve`,
      ...json(accountant, {}),
    })
    expect(res.statusCode).toBe(403)
  })
})

/* ----------------------------------------------------------- RLS isolation */

describe('HR records never cross the tenant boundary', () => {
  it('shows a neighbour tenant none of our employees, and 404s a leave approval across the boundary', async () => {
    const neighbour = await harness.token('hr', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const listed = await harness.app.inject({ method: 'GET', url: '/api/v1/employees?pageSize=50', ...json(neighbour) })
    expect(listed.statusCode).toBe(200)
    expect((listed.json() as { page: { total: number } }).page.total).toBe(0)

    /* One of our submitted leave requests, approved by the neighbour, is a 404 —
     * RLS makes it invisible rather than forbidden. */
    const [ours] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.orgId, SEED.orgId))
        .limit(1)
    })
    const crossed = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/leave-requests/${ours!.id}/approve`,
      ...json(neighbour, {}),
    })
    expect(crossed.statusCode).toBe(404)
  })
})

async function firstEmployeeId(token: string): Promise<string> {
  const res = await harness.app.inject({ method: 'GET', url: '/api/v1/employees?pageSize=1', ...json(token) })
  return (res.json() as { rows: { _id: string }[] }).rows[0]!._id
}
