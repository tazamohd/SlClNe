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

describe('GAP: CRM collections are read-only server-side', () => {
  it('GAP: `leads` is not writable — POST/PATCH /crm/leads (create, edit) are missing, so LeadDetail cannot offer Edit', () => {
    expect(defineBlock('leads')).not.toMatch(/writable:\s*true/)
  })

  it('GAP: `opportunities` is not writable and there is no lead→opportunity conversion route — LeadDetail cannot offer Convert to Opportunity', () => {
    expect(defineBlock('opportunities')).not.toMatch(/writable:\s*true/)
    expect(registry).not.toMatch(/convert/i)
    expect(routeFiles).not.toMatch(/convert/i)
  })

  it('GAP: `crmTasks` is not writable — POST /crm/tasks is missing, so CRMCalendar cannot offer New Task', () => {
    expect(defineBlock('crmTasks')).not.toMatch(/writable:\s*true/)
  })

  it('GAP: there is no lead activity or lead notes collection — GET/POST /crm/leads/:id/activity and /crm/leads/:id/notes are all missing, so LeadDetail shows honest empty rails', () => {
    expect(registry).not.toMatch(/key:\s*'lead(Activity|Notes|_activity|_notes)'/i)
    expect(schema).not.toMatch(/pgTable\(\s*'lead_(activity|notes)'/)
  })
})

describe('GAP: customer feedback has no home server-side', () => {
  it('GAP: no `feedback` collection is registered — GET/POST /customer-feedback is missing, so the form cannot submit', () => {
    expect(registry).not.toMatch(/key:\s*'(customerF|f)eedback'/i)
    expect(registry).not.toMatch(/path:\s*'[^']*feedback/i)
    expect(routeFiles).not.toMatch(/feedback/i)
  })

  it('GAP: there is not even a feedback table in the schema — storage and endpoint are both owed', () => {
    expect(schema).not.toMatch(/pgTable\(\s*'(customer_)?feedback'/)
  })
})

describe('GAP: fleet contracts are minimal and unjoinable', () => {
  it('GAP: the fleets table has no contract-term columns — type, value, dates and contact are all owed, so FleetContract cannot render them', () => {
    expect(schema).not.toMatch(/contract_value|contract_type|start_date.*fleet|renewal_date/)
    // The one contract field that exists is the status, which the screen does show.
    expect(defineBlock('fleets')).toMatch(/contract:\s*row\.contractStatus/)
  })

  it('GAP: `fleets` is not writable — there is no renew-contract route, so FleetContract cannot offer Renew', () => {
    expect(defineBlock('fleets')).not.toMatch(/writable:\s*true/)
    expect(routeFiles).not.toMatch(/renew/i)
  })

  it('GAP: customers do not present `fleetId`, so a fleet cannot be joined to its vehicles client-side — FleetContract lists no assigned vehicles', () => {
    // `fleetId` exists only as a filter key, never in the presented row, so the
    // customers→vehicles hop a fleet would need is not available to the client.
    expect(registry).not.toMatch(/fleetId:\s*row\.fleetId/)
    // It appears solely in the filter list, not in any `present` body.
    expect(defineBlock('customers')).toMatch(/filterable:\s*\[[^\]]*fleetId/)
    expect(defineBlock('customers')).not.toMatch(/present[\s\S]*fleetId/)
  })
})
