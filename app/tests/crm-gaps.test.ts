import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** The CRM / fleet server gaps, pinned.
 *
 *  Wave W2 tranche 3 asked for `LeadDetail`, `CRMCalendar`, `CustomerFeedback`
 *  and `FleetContract`. The screens render against the data that exists and stop
 *  where the server does — none of the writes or joins the prototypes imply are
 *  backed. Faking any of it is the §60 violation this project exists to kill, so
 *  each `GAP:` test below pins an exact missing endpoint / field / join by
 *  asserting its absence in the server source.
 *
 *  These are ratchets in reverse: **when agent 05 lands one, the matching test
 *  fails**, which is the signal to wire the write in the owning screen and delete
 *  the pin. None asserts a guarantee the code does not have.
 */

const HERE = path.dirname(fileURLToPath(new URL(import.meta.url)))
const REPO = path.resolve(HERE, '..', '..')
const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8')

const registry = read('server/src/registry.ts')
const schema = read('server/src/db/schema.ts')
const routeFiles = fs
  .readdirSync(path.join(REPO, 'server/src/routes'))
  .filter((name) => name.endsWith('.ts'))
  .map((name) => read(`server/src/routes/${name}`))
  .join('\n')

/** The body of a single `define({ … })` block, keyed by its collection. */
function defineBlock(key: string): string {
  const start = registry.indexOf(`key: '${key}'`)
  if (start < 0) return ''
  const from = registry.lastIndexOf('define({', start)
  const end = registry.indexOf('\n  }),', start)
  return registry.slice(from, end < 0 ? undefined : end)
}

describe('CRM collections are writable server-side (F-027 landed)', () => {
  it('LANDED: `leads` is writable — POST/PATCH /crm/leads back LeadDetail Edit', () => {
    expect(defineBlock('leads')).toMatch(/writable:\s*true/)
  })

  it('LANDED: `opportunities` is writable and a lead→opportunity conversion route exists — LeadDetail can offer Convert to Opportunity', () => {
    expect(defineBlock('opportunities')).toMatch(/writable:\s*true/)
    expect(routeFiles).toMatch(/convert/i)
  })

  it('LANDED: `crmTasks` is writable — POST /crm/tasks backs CRMCalendar New Task', () => {
    expect(defineBlock('crmTasks')).toMatch(/writable:\s*true/)
  })

  it('GAP: there is no lead activity or lead notes collection — GET/POST /crm/leads/:id/activity and /crm/leads/:id/notes are all missing, so LeadDetail shows honest empty rails', () => {
    expect(registry).not.toMatch(/key:\s*'lead(Activity|Notes|_activity|_notes)'/i)
    expect(schema).not.toMatch(/pgTable\(\s*'lead_(activity|notes)'/)
  })
})

describe('customer feedback has a home server-side (F-027 landed)', () => {
  it('LANDED: a `feedback` collection is registered at customer-feedback — POST /customer-feedback backs the capture form', () => {
    expect(registry).toMatch(/key:\s*'feedback'/)
    expect(registry).toMatch(/path:\s*'customer-feedback'/)
  })

  it('LANDED: the schema carries a customer_feedback table — storage and endpoint both exist', () => {
    expect(schema).toMatch(/pgTable\(\s*'customer_feedback'/)
  })
})

describe('fleet contracts carry terms and are joinable (F-027 landed)', () => {
  it('LANDED: the fleets table has contract-term columns — type, value, dates and contact, so FleetContract can render them', () => {
    expect(schema).toMatch(/contract_value_halalas/)
    expect(schema).toMatch(/contract_type/)
    expect(schema).toMatch(/renewal_date/)
    // The status field the screen already showed is still present.
    expect(defineBlock('fleets')).toMatch(/contract:\s*row\.contractStatus/)
  })

  it('LANDED: `fleets` is writable and a renew-contract route exists — FleetContract can offer Renew', () => {
    expect(defineBlock('fleets')).toMatch(/writable:\s*true/)
    expect(routeFiles).toMatch(/renew/i)
  })

  it('LANDED: customers present `fleetId`, so a fleet can be joined to its vehicles client-side — FleetContract can list assigned vehicles', () => {
    expect(registry).toMatch(/fleetId:\s*row\.fleetId/)
    // Still a filter key too, so the join can also be driven server-side.
    expect(defineBlock('customers')).toMatch(/filterable:\s*\[[^\]]*fleetId/)
    expect(defineBlock('customers')).toMatch(/present[\s\S]*fleetId/)
  })
})
