/** The RBAC persona lab — §50.
 *
 *  A release gate and a diagnostic in one file. It boots the same ephemeral
 *  PostgreSQL the test suites use, mints a token for each of the fourteen roles,
 *  and fires one request at every permission-gated surface the server exposes.
 *  For each `(role × module × action)` cell it compares what the server actually
 *  did against `granted(module, action, role)` — the *same* oracle
 *  `requirePermission` enforces with, read live from `@salis/contract` — and
 *  labels the cell:
 *
 *    ALLOWED     the matrix grants it and the server let it through
 *    DENIED      the matrix withholds it and the server refused (403 forbidden)
 *    UNEXPECTED  the two disagree — either a hole (server granted what the
 *                matrix withholds) or a wall (server refused what it grants)
 *
 *  Plus a tenant-isolation / IDOR pass: a token scoped to the *other* org, and a
 *  stranger inside the home org, try to reach home-org records by id. A leak —
 *  any cross-boundary read or write that succeeds instead of 404-ing — is a hard
 *  failure independent of the matrix.
 *
 *  The process exits non-zero on any UNEXPECTED cell or any isolation breach, so
 *  CI can run it as a gate. It never exits zero by accident: if the database
 *  will not come up, `startHarness()` throws and `main()` turns that into a loud
 *  non-zero exit rather than an empty, green report.
 *
 *  ── How the gate is probed without mutating anything real ──────────────────
 *  `requirePermission` is always the *first* thing a handler does, and it is the
 *  only thing in the codebase that throws `forbidden`. Every other failure —
 *  a bad body (`bad_request` / `validation_failed`), a missing record
 *  (`not_found`), an over-ceiling approval (`approval_required`) — carries a
 *  different code, even when it shares the 403 status. So the permission
 *  decision can be read off the error *code* alone, and every write/approve
 *  probe is aimed at a **non-existent id** (or sent an empty body): a role that
 *  holds the grant sails past the gate and then trips on the missing record
 *  (404), which still reads as "the gate allowed it". Nothing real is deleted,
 *  approved or overwritten, and the harness database is thrown away at the end
 *  regardless.
 */
import { granted, GRANT_ACTIONS, type GrantAction } from '../src/security/actions'
import { COLLECTIONS } from '../src/registry'
import { startHarness, SEED, type Harness } from '../tests/harness'
import { MODULE_IDS, ROLE_IDS, type ModuleId, type RoleId } from '@salis/contract'

const API_PREFIX = '/api/v1'

/** A syntactically valid ULID that the seed never mints, so every write/approve
 *  probe resolves to a 404 *after* the permission gate has spoken. This is the
 *  same sentinel `tests/isolation.test.ts` pastes into URLs. */
const ABSENT_ID = '01JNOSUCHRECORDATALL000001'

/** One request aimed at one `(module, action)` gate. `body: undefined` sends no
 *  payload; a `{}` body is enough to carry a granted role past the gate and into
 *  validation, which fails closed on the empty object without writing a row. */
interface Surface {
  module: ModuleId
  action: GrantAction
  /** Human label for the report, e.g. `GET /customers`. */
  label: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  url: string
  body?: unknown
}

/** The verdict for one `(surface × role)` request. */
type Verdict = 'ALLOWED' | 'DENIED' | 'UNEXPECTED'

interface CellResult {
  surface: Surface
  role: RoleId
  expected: boolean
  /** What the gate did: `denied` iff it answered 403 `forbidden`. */
  gate: 'allowed' | 'denied'
  verdict: Verdict
  status: number
  code?: string
}

interface IsolationCheck {
  name: string
  /** True when the boundary held. */
  ok: boolean
  detail: string
}

export interface LabReport {
  cells: CellResult[]
  surfaces: Surface[]
  unexpected: CellResult[]
  isolation: IsolationCheck[]
  isolationBreaches: IsolationCheck[]
  /** `(module, action)` pairs the matrix grants to someone but no surface
   *  probes — recorded so a gap is visible rather than silently absent. */
  skipped: { module: ModuleId; action: GrantAction; reason: string }[]
  counts: { allowed: number; denied: number; unexpected: number }
}

/* ─────────────────────────────────────────────────────── surface enumeration */

/** The generic collection router (`routes/collections.ts`) gives every
 *  collection a `v` (list) surface, an `x` (export) surface — `GET
 *  /{path}/export`, the gated CSV egress — and, where the collection is
 *  `writable`, the `c`/`e`/`d` triple. Export used to be the one grant no
 *  endpoint consumed, so the lab skipped every `x` cell; the generic export
 *  route closed that hole, and the probe below now exercises it exactly like
 *  the others. `a` (approve) is still never generic — it lives on the bespoke
 *  routers enumerated further down. */
function collectionSurfaces(): Surface[] {
  const surfaces: Surface[] = []
  for (const c of COLLECTIONS) {
    surfaces.push({
      module: c.module,
      action: 'v',
      label: `GET /${c.path}`,
      method: 'GET',
      url: `/${c.path}`,
    })
    /* The export route is registered for every collection, but it is only worth
     * probing where the matrix actually grants `x` to someone on this module —
     * a module with no export grant has nothing to disagree about. Every
     * collection's module does carry `x` today, so this covers them all; the
     * guard keeps the probe honest if a future module drops the grant. */
    if (ROLE_IDS.some((role) => granted(c.module, 'x', role))) {
      surfaces.push({
        module: c.module,
        action: 'x',
        label: `GET /${c.path}/export`,
        method: 'GET',
        url: `/${c.path}/export`,
      })
    }
    if (!c.writable) continue
    surfaces.push({
      module: c.module,
      action: 'c',
      label: `POST /${c.path}`,
      method: 'POST',
      url: `/${c.path}`,
      body: {},
    })
    surfaces.push({
      module: c.module,
      action: 'e',
      label: `PATCH /${c.path}/:id`,
      method: 'PATCH',
      url: `/${c.path}/${ABSENT_ID}`,
      body: {},
    })
    surfaces.push({
      module: c.module,
      action: 'd',
      label: `DELETE /${c.path}/:id`,
      method: 'DELETE',
      url: `/${c.path}/${ABSENT_ID}`,
    })
  }
  return surfaces
}

/** Action-gated endpoints outside the generic router. Each was read out of
 *  `routes/*.ts` and confirmed to call `requirePermission` (the stated module
 *  and action) as its *first* statement, so a 403 here is the gate and nothing
 *  downstream. Approve (`a`) has no generic surface at all, so these are the
 *  only probes that cover it: procurement, hr and accounting through their
 *  approval endpoints, and jobcards through the QC → delivery transition, which
 *  the matrix (correctly) gates on `jobcards:a` rather than `:e` (F-014). */
const BESPOKE_SURFACES: readonly Surface[] = [
  /* approve (a) — the action the generic router never exposes */
  {
    module: 'procurement',
    action: 'a',
    label: 'POST /procurement/requisitions/:id/approve',
    method: 'POST',
    url: `/procurement/requisitions/${ABSENT_ID}/approve`,
    body: {},
  },
  {
    module: 'procurement',
    action: 'a',
    label: 'POST /procurement/purchase-orders/:id/approve',
    method: 'POST',
    url: `/procurement/purchase-orders/${ABSENT_ID}/approve`,
    body: {},
  },
  {
    module: 'hr',
    action: 'a',
    label: 'POST /leave-requests/:id/approve',
    method: 'POST',
    url: `/leave-requests/${ABSENT_ID}/approve`,
    body: {},
  },
  {
    module: 'accounting',
    action: 'a',
    label: 'POST /insurance-claims/:id/approve',
    method: 'POST',
    url: `/insurance-claims/${ABSENT_ID}/approve`,
    body: {},
  },
  {
    module: 'jobcards',
    action: 'a',
    label: 'POST /jobs/:id/transition (→ delivery)',
    method: 'POST',
    url: `/jobs/${ABSENT_ID}/transition`,
    body: { to: 'delivery' },
  },
  /* a handful of bespoke edit/view surfaces, to prove those gates too */
  {
    module: 'accounting',
    action: 'e',
    label: 'POST /bank-statements/:id/match',
    method: 'POST',
    url: `/bank-statements/${ABSENT_ID}/match`,
    body: {},
  },
  {
    module: 'inventory',
    action: 'e',
    label: 'POST /inventory/:id/movement',
    method: 'POST',
    url: `/inventory/${ABSENT_ID}/movement`,
    body: {},
  },
  {
    module: 'hr',
    action: 'e',
    label: 'POST /payroll/runs/:id/post',
    method: 'POST',
    url: `/payroll/runs/${ABSENT_ID}/post`,
    body: {},
  },
  {
    module: 'jobcards',
    action: 'e',
    label: 'POST /jobs/:id/assign',
    method: 'POST',
    url: `/jobs/${ABSENT_ID}/assign`,
    body: {},
  },
  {
    module: 'approvals',
    action: 'v',
    label: 'GET /approvals',
    method: 'GET',
    url: '/approvals',
  },
  /* estimates, invoices and payments carry line items and derived money, so
   * their create/edit/approve live in bespoke routers rather than the generic
   * one (the generic collection gives only their `v` surface). Each of these
   * gates on its stated module/action as the first statement. */
  {
    module: 'estimates',
    action: 'c',
    label: 'POST /estimates',
    method: 'POST',
    url: '/estimates',
    body: {},
  },
  {
    module: 'estimates',
    action: 'e',
    label: 'PATCH /estimates/:id',
    method: 'PATCH',
    url: `/estimates/${ABSENT_ID}`,
    body: {},
  },
  {
    module: 'estimates',
    action: 'a',
    label: 'POST /estimates/:id/approve',
    method: 'POST',
    url: `/estimates/${ABSENT_ID}/approve`,
    body: {},
  },
  {
    module: 'invoices',
    action: 'c',
    label: 'POST /invoices',
    method: 'POST',
    url: '/invoices',
    body: {},
  },
  {
    module: 'invoices',
    action: 'e',
    label: 'PATCH /invoices/:id',
    method: 'PATCH',
    url: `/invoices/${ABSENT_ID}`,
    body: {},
  },
  {
    module: 'payments',
    action: 'c',
    label: 'POST /receipts',
    method: 'POST',
    url: '/receipts',
    body: {},
  },
]

export function allSurfaces(): Surface[] {
  return [...collectionSurfaces(), ...BESPOKE_SURFACES]
}

/* ─────────────────────────────────────────────────────────────── the probe */

interface Injected {
  status: number
  code?: string
}

async function inject(
  harness: Harness,
  surface: Surface,
  bearer: string,
): Promise<Injected> {
  const res = await harness.app.inject({
    method: surface.method,
    url: `${API_PREFIX}${surface.url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      ...(surface.body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(surface.body === undefined ? {} : { payload: JSON.stringify(surface.body) }),
  })
  /* A 429 is never an RBAC answer — it means the rate limiter fired mid-sweep
   * and every subsequent verdict would be garbage. Fail the whole run loudly
   * rather than emit a report that reads green because denials turned into
   * `rate_limited`. `startLabHarness` lifts the ceiling so this should not
   * happen; if it does, the budget assumption is wrong and must be fixed. */
  if (res.statusCode === 429) {
    throw new Error(
      `Rate limited (429) while probing ${surface.method} ${surface.url}. ` +
        'Raise RATE_LIMIT_MAX before booting the harness (see startLabHarness).',
    )
  }
  let code: string | undefined
  try {
    code = (res.json() as { error?: { code?: string } })?.error?.code
  } catch {
    /* A 2xx list or a 204 delete carries no error envelope; that is itself the
     * signal that the gate allowed the request. */
  }
  return { status: res.statusCode, code }
}

/** The gate refused iff it answered 403 with the `forbidden` code. Everything
 *  else — a 2xx, a `not_found`, a `bad_request`, an `approval_required` (also
 *  403, but a *different* code, meaning the role had the authority and only the
 *  amount was too large) — means the permission check passed. */
function gateOutcome(injected: Injected): 'allowed' | 'denied' {
  return injected.status === 403 && injected.code === 'forbidden' ? 'denied' : 'allowed'
}

function verdictOf(expected: boolean, gate: 'allowed' | 'denied'): Verdict {
  if (expected) return gate === 'allowed' ? 'ALLOWED' : 'UNEXPECTED'
  return gate === 'denied' ? 'DENIED' : 'UNEXPECTED'
}

/* ───────────────────────────────────────────────────── isolation / IDOR pass */

async function firstId(
  harness: Harness,
  path: string,
  bearer: string,
): Promise<string | null> {
  const res = await harness.app.inject({
    method: 'GET',
    url: `${API_PREFIX}/${path}?pageSize=1`,
    headers: { authorization: `Bearer ${bearer}` },
  })
  if (res.statusCode !== 200) return null
  const rows = (res.json() as { rows?: { _id?: string }[] }).rows ?? []
  return rows[0]?._id ?? null
}

/** With a token that legitimately belongs to the *neighbour* org (and a stranger
 *  inside the home org), try to reach home-org records by their real ids. The
 *  boundary is upheld only if each attempt 404s — a 403 would itself confirm the
 *  record exists, and a 2xx would hand over data or accept a write across the
 *  tenant line. `superadmin` is excluded on purpose: it carries `scope:
 *  platform` by design and is the one role meant to cross tenants. */
async function runIsolation(harness: Harness): Promise<IsolationCheck[]> {
  const checks: IsolationCheck[] = []

  const homeOwner = await harness.token('owner')
  const homeCustomerId = await firstId(harness, 'customers', homeOwner)
  const homeInvoiceId = await firstId(harness, 'invoices', homeOwner)
  const homeJobId = await firstId(harness, 'jobs', homeOwner)

  if (!homeCustomerId || !homeInvoiceId || !homeJobId) {
    checks.push({
      name: 'seed sanity',
      ok: false,
      detail: `could not resolve seeded ids (customer=${homeCustomerId}, invoice=${homeInvoiceId}, job=${homeJobId}) — the isolation pass cannot run`,
    })
    return checks
  }

  const otherOrg = { orgId: SEED.otherOrgId, branchId: SEED.otherBranchId }
  const otherOwner = await harness.token('owner', otherOrg)
  const otherAccountant = await harness.token('accountant', otherOrg)

  const call = (
    method: 'GET' | 'PATCH' | 'DELETE' | 'POST',
    url: string,
    bearer: string,
    body?: unknown,
  ) =>
    harness.app.inject({
      method,
      url: `${API_PREFIX}${url}`,
      headers: {
        authorization: `Bearer ${bearer}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
    })

  /** A cross-boundary reach is safe only when it 404s. Any 2xx is a leak; a 403
   *  would leak existence too, so it is not treated as a pass. */
  const mustNotReach = async (
    name: string,
    method: 'GET' | 'PATCH' | 'DELETE' | 'POST',
    url: string,
    bearer: string,
    body?: unknown,
  ) => {
    const res = await call(method, url, bearer, body)
    const leaked = res.statusCode >= 200 && res.statusCode < 300
    checks.push({
      name,
      ok: res.statusCode === 404,
      detail: leaked
        ? `LEAK: ${method} ${url} returned ${res.statusCode} across the tenant boundary`
        : `${method} ${url} → ${res.statusCode} (${
            (res.json() as { error?: { code?: string } })?.error?.code ?? 'no code'
          })`,
    })
  }

  await mustNotReach(
    'neighbour owner cannot read a home customer by id',
    'GET',
    `/customers/${homeCustomerId}`,
    otherOwner,
  )
  await mustNotReach(
    'neighbour owner cannot edit a home customer by id',
    'PATCH',
    `/customers/${homeCustomerId}`,
    otherOwner,
    { name: 'Renamed across the tenant line' },
  )
  await mustNotReach(
    'neighbour owner cannot delete a home customer by id',
    'DELETE',
    `/customers/${homeCustomerId}`,
    otherOwner,
  )
  await mustNotReach(
    'neighbour owner cannot read a home invoice by id',
    'GET',
    `/invoices/${homeInvoiceId}`,
    otherOwner,
  )
  await mustNotReach(
    'neighbour accountant cannot read a home invoice by id',
    'GET',
    `/invoices/${homeInvoiceId}`,
    otherAccountant,
  )

  /* A stranger technician *inside* the home org: own-scope RLS must hide a job
   * card assigned to somebody else, by collection and by id. */
  const strangerTech = await harness.token('technician', {
    sub: '01JISOTECHNOBODYELSE00001',
  })
  await mustNotReach(
    'unassigned home technician cannot read a home job by id',
    'GET',
    `/jobs/${homeJobId}`,
    strangerTech,
  )

  /* The neighbour's list must not contain the home record, and the home list
   * must not contain the neighbour's — isolation on the collection route, not
   * only on the by-id route. */
  const neighbourList = await call('GET', '/customers?pageSize=200', otherOwner)
  const neighbourIds = ((neighbourList.json() as { rows?: { _id?: string }[] }).rows ?? []).map(
    (r) => r._id,
  )
  checks.push({
    name: 'neighbour owner list excludes the home customer',
    ok: !neighbourIds.includes(homeCustomerId),
    detail: neighbourIds.includes(homeCustomerId)
      ? `LEAK: home customer ${homeCustomerId} appeared in the neighbour's list`
      : `neighbour list carried ${neighbourIds.length} of its own rows, none of them the home record`,
  })

  /* A write that tries to plant a row into the neighbour's org must be refused
   * (400 on the server-owned `orgId`), never silently re-homed or accepted. */
  const planted = await call('POST', '/customers', homeOwner, {
    orgId: SEED.otherOrgId,
    name: 'Planted across the tenant line',
    phone: '+966 55 999 9999',
  })
  checks.push({
    name: 'home owner cannot create a row into the neighbour org',
    ok: planted.statusCode === 400,
    detail:
      planted.statusCode === 400
        ? 'POST /customers with a foreign orgId → 400 (refused)'
        : `LEAK/UNEXPECTED: POST /customers with a foreign orgId → ${planted.statusCode}`,
  })

  return checks
}

/* ─────────────────────────────────────────────────────────────── harness */

/** Boots the shared harness, but first lifts the per-`(org, ip)` rate-limit
 *  budget out of the way.
 *
 *  The lab fires well over a thousand requests, all from one injected address
 *  under one org, in a couple of seconds. Left at its 300/min default the limiter
 *  would answer `429 rate_limited` partway through — a *non-forbidden* status the
 *  gate classifier reads as "allowed", which would silently invert every denial
 *  after the budget ran out. Raising the ceiling here keeps the limiter itself
 *  under test elsewhere (`tests/*`) while letting this exhaustive sweep through.
 *  `loadEnv` never overwrites a value already in `process.env`, so this wins. */
export async function startLabHarness(): Promise<Harness> {
  /* Raise the ceiling only for the window in which the app reads it (during
   * `buildApp`), then put it back. The value is captured into the built app's
   * limiter, so restoring `process.env` afterwards leaves no trace for a later
   * suite in the same worker — the test files run sequentially and can share a
   * process, and one of them exercises the limiter at its real budget. */
  const prior = process.env.RATE_LIMIT_MAX
  process.env.RATE_LIMIT_MAX = '1000000'
  try {
    return await startHarness()
  } finally {
    if (prior === undefined) delete process.env.RATE_LIMIT_MAX
    else process.env.RATE_LIMIT_MAX = prior
  }
}

/* ─────────────────────────────────────────────────────────────── the run */

export async function runRbacLab(harness: Harness): Promise<LabReport> {
  const surfaces = allSurfaces()
  const cells: CellResult[] = []

  /* One token per role, reused across every surface. */
  const tokens = new Map<RoleId, string>()
  for (const role of ROLE_IDS) tokens.set(role, await harness.token(role))

  for (const surface of surfaces) {
    for (const role of ROLE_IDS) {
      const expected = granted(surface.module, surface.action, role)
      const injected = await inject(harness, surface, tokens.get(role) as string)
      const gate = gateOutcome(injected)
      cells.push({
        surface,
        role,
        expected,
        gate,
        verdict: verdictOf(expected, gate),
        status: injected.status,
        code: injected.code,
      })
    }
  }

  const unexpected = cells.filter((c) => c.verdict === 'UNEXPECTED')
  const isolation = await runIsolation(harness)
  const isolationBreaches = isolation.filter((c) => !c.ok)

  /* Which `(module, action)` cells does the matrix grant to *someone* that no
   * surface here probes? Recorded so the coverage gap is explicit. */
  const covered = new Set(surfaces.map((s) => `${s.module}:${s.action}`))
  const skipped: LabReport['skipped'] = []
  for (const module of MODULE_IDS) {
    for (const action of GRANT_ACTIONS) {
      const grantedToSomeone = ROLE_IDS.some((role) => granted(module, action, role))
      if (!grantedToSomeone) continue
      if (covered.has(`${module}:${action}`)) continue
      skipped.push({
        module,
        action,
        reason:
          action === 'x'
            ? 'module grants export (x) but exposes no collection to export from — the generic CSV route covers every collection, so what is left here are modules (reports, kiosk, execreports, the portals, audit, network) with no collection surface at all'
            : 'no gated server surface exists for this module/action',
      })
    }
  }

  return {
    cells,
    surfaces,
    unexpected,
    isolation,
    isolationBreaches,
    skipped,
    counts: {
      allowed: cells.filter((c) => c.verdict === 'ALLOWED').length,
      denied: cells.filter((c) => c.verdict === 'DENIED').length,
      unexpected: unexpected.length,
    },
  }
}

/* ───────────────────────────────────────────────────────────── formatting */

/** Three characters per role, in matrix order, for the grid header. */
const ROLE_ABBR: Record<RoleId, string> = {
  owner: 'own',
  superadmin: 'sup',
  manager: 'mgr',
  advisor: 'adv',
  technician: 'tec',
  qc: 'qc',
  parts: 'prt',
  accountant: 'acc',
  hr: 'hr',
  frontdesk: 'fdk',
  callcenter: 'cc',
  procurement: 'prc',
  supplier: 'spl',
  customer: 'cus',
}

const GLYPH: Record<Verdict, string> = { ALLOWED: '✓', DENIED: '·', UNEXPECTED: '✗' }

export function formatReport(report: LabReport): string {
  const out: string[] = []
  const pad = (s: string, n: number) => s.padEnd(n)
  const col = 4

  out.push('══════════════════════════════════════════════════════════════════')
  out.push(' SALIS AUTO — RBAC persona lab (§50)')
  out.push('══════════════════════════════════════════════════════════════════')
  out.push('')
  out.push(' legend:  ✓ allowed (matrix grants)   · denied (matrix withholds)   ✗ UNEXPECTED')
  out.push('')

  /* Aggregate to one row per (module, action): every surface sharing a cell
   * gates through the same `granted()` call, so they agree unless a route has
   * its own bug — in which case the row shows ✗ and the detail list below names
   * the offending surface. */
  const rowKeys = [...new Set(report.surfaces.map((s) => `${s.module} ${s.action}`))].sort()
  const cellsByKey = new Map<string, CellResult[]>()
  for (const c of report.cells) {
    const key = `${c.surface.module} ${c.surface.action}`
    const list = cellsByKey.get(key) ?? []
    list.push(c)
    cellsByKey.set(key, list)
  }

  const labelWidth = 26
  const header =
    pad('module : action', labelWidth) + ROLE_IDS.map((r) => pad(ROLE_ABBR[r], col)).join('')
  out.push(header)
  out.push('─'.repeat(header.length))

  for (const key of rowKeys) {
    const [module, action] = key.split(' ')
    const row = cellsByKey.get(key) ?? []
    const label = `${module} : ${action}`
    const cellsForRole = ROLE_IDS.map((role) => {
      const forRole = row.filter((c) => c.role === role)
      const verdict: Verdict = forRole.some((c) => c.verdict === 'UNEXPECTED')
        ? 'UNEXPECTED'
        : forRole[0]?.verdict ?? 'DENIED'
      return pad(GLYPH[verdict], col)
    })
    out.push(pad(label, labelWidth) + cellsForRole.join(''))
  }

  out.push('')
  out.push('── summary ─────────────────────────────────────────────────────────')
  out.push(
    ` cells probed : ${report.cells.length}   ` +
      `(${report.surfaces.length} surfaces × ${ROLE_IDS.length} roles)`,
  )
  out.push(
    ` ✓ allowed : ${report.counts.allowed}    · denied : ${report.counts.denied}    ✗ UNEXPECTED : ${report.counts.unexpected}`,
  )
  out.push('')

  if (report.unexpected.length) {
    out.push('── UNEXPECTED cells (server disagrees with the matrix) ──────────────')
    for (const c of report.unexpected) {
      const dir = c.expected
        ? 'matrix GRANTS but server REFUSED'
        : 'matrix WITHHOLDS but server ALLOWED'
      out.push(
        ` ✗ ${pad(c.role, 12)} ${pad(`${c.surface.module}:${c.surface.action}`, 22)} ${dir}`,
      )
      out.push(
        `     ${c.surface.label}  →  HTTP ${c.status}${c.code ? ` (${c.code})` : ''}`,
      )
    }
    out.push('')
  } else {
    out.push(' No UNEXPECTED cells: every probed gate agrees with the matrix.')
    out.push('')
  }

  out.push('── tenant isolation / IDOR ──────────────────────────────────────────')
  for (const check of report.isolation) {
    out.push(` ${check.ok ? '✓' : '✗'} ${pad(check.name, 52)} ${check.detail}`)
  }
  out.push('')

  if (report.skipped.length) {
    out.push('── skipped (matrix grants it, but no gated surface exists to probe) ──')
    for (const s of report.skipped) {
      out.push(` – ${pad(`${s.module}:${s.action}`, 22)} ${s.reason}`)
    }
    out.push('')
  }

  const failed = report.unexpected.length > 0 || report.isolationBreaches.length > 0
  out.push('══════════════════════════════════════════════════════════════════')
  out.push(
    failed
      ? ` GATE: FAIL — ${report.unexpected.length} unexpected cell(s), ${report.isolationBreaches.length} isolation breach(es)`
      : ' GATE: PASS — no unexpected cells, no isolation breaches',
  )
  out.push('══════════════════════════════════════════════════════════════════')
  out.push('')
  return out.join('\n')
}

/* ─────────────────────────────────────────────────────────────── entrypoint */

async function main(): Promise<void> {
  let harness: Harness
  try {
    harness = await startLabHarness()
  } catch (error) {
    process.stderr.write(
      '\nRBAC lab could not start: the harness failed to bring up PostgreSQL.\n' +
        'This lab talks to a real database on purpose — it cannot certify RBAC\n' +
        'against a mock. Start Postgres (see server/.env DATABASE_URL) and retry.\n\n' +
        `${(error as Error).stack ?? String(error)}\n`,
    )
    process.exit(1)
    return
  }

  /* The exit code is decided inside the try, but `process.exit` is deferred to
   * after `finally` has closed the pool — calling it inside the try would
   * terminate the event loop before `harness.close()` ran. */
  let code = 0
  try {
    const report = await runRbacLab(harness)
    process.stdout.write(formatReport(report))
    code = report.unexpected.length > 0 || report.isolationBreaches.length > 0 ? 1 : 0
  } catch (error) {
    process.stderr.write(`\nRBAC lab crashed:\n${(error as Error).stack ?? String(error)}\n`)
    code = 1
  } finally {
    await harness.close()
  }
  process.exit(code)
}

const invokedDirectly = process.argv[1]?.endsWith('rbac-lab.ts')
if (invokedDirectly) {
  void main()
}
