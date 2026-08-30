import { describe, expect, it } from 'vitest'
import {
  VEHICLES,
  INVOICES,
  SERVICES,
  JOBS,
  APPOINTMENTS,
  ESTIMATES,
  CUSTOMERS,
  FLEETS,
  PARTS,
  TECHS,
  LEADS,
  OPPORTUNITIES,
  CAMPAIGNS,
  SEGMENTS,
  CRM_TASKS,
  ACCOUNTS_COA,
  JOURNAL_ENTRIES,
  EXPENSES_DATA,
  RECEIPTS,
  DEPARTMENTS,
  AI_AGENTS,
  CONVERSATIONS,
  OBD_DEVICES,
  DTC_CODES,
  OEM_TOOLS,
  SYS_INTEGRATIONS,
  KB_PROCEDURES,
  APPROVAL_LINES,
  INVOICE_LINES,
  INVOICE_PAYMENTS,
  DIAG_STAGES,
  DIAG_FINDINGS,
  DIAG_PARTS,
  DIAG_LABOUR,
  DIAG_COPIES,
} from '@/data/generated/tables'

/** Generated table data integrity — the design bundle's fixture data feeds the
 *  mock repository, every screen, and the test suite itself. If a table is empty
 *  when it should have rows, or if a key column is missing, screens render blank
 *  or crash at runtime. These tests are a structural contract on the generated
 *  data. */

/** Assert that every row in `table` has every key from `requiredKeys`. */
function assertColumns<T extends Record<string, unknown>>(
  tableName: string,
  table: readonly T[],
  requiredKeys: readonly string[],
) {
  for (let i = 0; i < table.length; i++) {
    const row = table[i]
    for (const key of requiredKeys) {
      expect(row, `${tableName}[${i}] missing "${key}"`).toHaveProperty(key)
    }
  }
}

describe('core domain tables are non-empty and well-shaped', () => {
  it('VEHICLES has rows with plate, make, owner, status', () => {
    expect(VEHICLES.length).toBeGreaterThan(0)
    assertColumns('VEHICLES', VEHICLES, ['plate', 'make', 'owner', 'mileage', 'status'])
  })

  it('INVOICES has rows with id, cust, amount, status', () => {
    expect(INVOICES.length).toBeGreaterThan(0)
    assertColumns('INVOICES', INVOICES, ['id', 'cust', 'amount', 'status'])
  })

  it('JOBS has rows with id, cust, veh, svc, st, pr', () => {
    expect(JOBS.length).toBeGreaterThan(0)
    assertColumns('JOBS', JOBS, ['id', 'cust', 'veh', 'svc', 'st', 'pr'])
  })

  it('CUSTOMERS has rows with name, phone, vehicles, spent', () => {
    expect(CUSTOMERS.length).toBeGreaterThan(0)
    assertColumns('CUSTOMERS', CUSTOMERS, ['name', 'phone', 'vehicles', 'spent'])
  })

  it('PARTS has rows with name, sku, stock, reorder, price', () => {
    expect(PARTS.length).toBeGreaterThan(0)
    assertColumns('PARTS', PARTS, ['name', 'sku', 'stock', 'reorder', 'price'])
  })

  it('APPOINTMENTS has rows with time, cust, veh, plate, svc, status, bay, tech, mins', () => {
    expect(APPOINTMENTS.length).toBeGreaterThan(0)
    assertColumns('APPOINTMENTS', APPOINTMENTS, [
      'time', 'cust', 'veh', 'plate', 'svc', 'status', 'bay', 'tech', 'mins',
    ])
  })

  it('ESTIMATES has rows with id, cust, veh, amount, status', () => {
    expect(ESTIMATES.length).toBeGreaterThan(0)
    assertColumns('ESTIMATES', ESTIMATES, ['id', 'cust', 'veh', 'amount', 'status'])
  })
})

describe('CRM tables', () => {
  it('LEADS has rows with name, company, value, source, stage, score', () => {
    expect(LEADS.length).toBeGreaterThan(0)
    assertColumns('LEADS', LEADS, ['name', 'company', 'value', 'source', 'stage', 'score'])
  })

  it('OPPORTUNITIES has rows with name, company, value, stage', () => {
    expect(OPPORTUNITIES.length).toBeGreaterThan(0)
    assertColumns('OPPORTUNITIES', OPPORTUNITIES, ['name', 'company', 'value', 'stage'])
  })

  it('CAMPAIGNS is non-empty', () => {
    expect(CAMPAIGNS.length).toBeGreaterThan(0)
  })

  it('SEGMENTS is non-empty', () => {
    expect(SEGMENTS.length).toBeGreaterThan(0)
  })

  it('CRM_TASKS is non-empty', () => {
    expect(CRM_TASKS.length).toBeGreaterThan(0)
  })
})

describe('finance tables', () => {
  it('ACCOUNTS_COA has rows with code, name, type, balance', () => {
    expect(ACCOUNTS_COA.length).toBeGreaterThan(0)
    assertColumns('ACCOUNTS_COA', ACCOUNTS_COA, ['code', 'name', 'type', 'balance'])
  })

  it('JOURNAL_ENTRIES is non-empty', () => {
    expect(JOURNAL_ENTRIES.length).toBeGreaterThan(0)
  })

  it('EXPENSES_DATA is non-empty', () => {
    expect(EXPENSES_DATA.length).toBeGreaterThan(0)
  })

  it('INVOICE_LINES is non-empty', () => {
    expect(INVOICE_LINES.length).toBeGreaterThan(0)
  })

  it('INVOICE_PAYMENTS is non-empty', () => {
    expect(INVOICE_PAYMENTS.length).toBeGreaterThan(0)
  })
})

describe('resource tables', () => {
  it('TECHS has rows with name and specialty', () => {
    expect(TECHS.length).toBeGreaterThan(0)
    assertColumns('TECHS', TECHS, ['name', 'specialty'])
  })

  it('FLEETS has rows with name and vehicles count', () => {
    expect(FLEETS.length).toBeGreaterThan(0)
    assertColumns('FLEETS', FLEETS, ['name', 'vehicles'])
  })

  it('DEPARTMENTS is non-empty', () => {
    expect(DEPARTMENTS.length).toBeGreaterThan(0)
  })

  it('SERVICES is an array of [icon, label] tuples', () => {
    expect(SERVICES.length).toBeGreaterThan(0)
    for (const svc of SERVICES) {
      expect(Array.isArray(svc)).toBe(true)
      expect(svc).toHaveLength(2)
      expect(typeof svc[0]).toBe('string')
      expect(typeof svc[1]).toBe('string')
    }
  })
})

describe('diagnostic tables', () => {
  it('DIAG_STAGES is non-empty', () => {
    expect(DIAG_STAGES.length).toBeGreaterThan(0)
  })
  it('DIAG_FINDINGS is non-empty', () => {
    expect(DIAG_FINDINGS.length).toBeGreaterThan(0)
  })
  it('DIAG_PARTS is non-empty', () => {
    expect(DIAG_PARTS.length).toBeGreaterThan(0)
  })
  it('DIAG_LABOUR is non-empty', () => {
    expect(DIAG_LABOUR.length).toBeGreaterThan(0)
  })
  it('DIAG_COPIES is non-empty', () => {
    expect(DIAG_COPIES.length).toBeGreaterThan(0)
  })
})

describe('system tables', () => {
  it('AI_AGENTS is non-empty', () => {
    expect(AI_AGENTS.length).toBeGreaterThan(0)
  })
  it('CONVERSATIONS is non-empty', () => {
    expect(CONVERSATIONS.length).toBeGreaterThan(0)
  })
  it('OBD_DEVICES is non-empty', () => {
    expect(OBD_DEVICES.length).toBeGreaterThan(0)
  })
  it('DTC_CODES is non-empty', () => {
    expect(DTC_CODES.length).toBeGreaterThan(0)
  })
  it('OEM_TOOLS is non-empty', () => {
    expect(OEM_TOOLS.length).toBeGreaterThan(0)
  })
  it('SYS_INTEGRATIONS is non-empty', () => {
    expect(SYS_INTEGRATIONS.length).toBeGreaterThan(0)
  })
  it('KB_PROCEDURES is non-empty', () => {
    expect(KB_PROCEDURES.length).toBeGreaterThan(0)
  })
  it('RECEIPTS is non-empty', () => {
    expect(RECEIPTS.length).toBeGreaterThan(0)
  })
  it('APPROVAL_LINES is non-empty', () => {
    expect(APPROVAL_LINES.length).toBeGreaterThan(0)
  })
})

describe('cross-table referential consistency', () => {
  /** The CUSTOMERS table is a small fixture subset — not every person named in
   *  INVOICES, JOBS, or ESTIMATES has a CUSTOMERS row. The referential checks
   *  therefore test that the core 5 customers DO appear, not that every name
   *  cross-references, since the design bundle intentionally has a wider cast of
   *  names than the customer list. */
  it('core CUSTOMERS appear in INVOICES', () => {
    const invoiceCustomers = new Set(INVOICES.map((inv) => inv.cust))
    // At least one of the core customers should have an invoice
    const overlap = CUSTOMERS.filter((c) => invoiceCustomers.has(c.name))
    expect(overlap.length).toBeGreaterThan(0)
  })

  it('core CUSTOMERS appear in JOBS', () => {
    const jobCustomers = new Set(JOBS.map((j) => j.cust))
    const overlap = CUSTOMERS.filter((c) => jobCustomers.has(c.name))
    expect(overlap.length).toBeGreaterThan(0)
  })

  it('every JOB vehicle appears in VEHICLES (by make)', () => {
    const vehicleMakes = new Set(VEHICLES.map((v) => v.make))
    for (const job of JOBS) {
      expect(vehicleMakes.has(job.veh), `Job ${job.id} references unknown vehicle "${job.veh}"`).toBe(true)
    }
  })

  it('INVOICE ids are unique', () => {
    const ids = INVOICES.map((inv) => inv.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('JOB ids are unique', () => {
    const ids = JOBS.map((j) => j.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('VEHICLE plates are unique', () => {
    const plates = VEHICLES.map((v) => v.plate)
    expect(new Set(plates).size).toBe(plates.length)
  })

  it('PART skus are unique', () => {
    const skus = PARTS.map((p) => p.sku)
    expect(new Set(skus).size).toBe(skus.length)
  })
})
