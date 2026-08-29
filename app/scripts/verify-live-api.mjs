// End-to-end proof that the frontend's auth + repository contract works against
// the real backend. Exercises the exact calls the app now makes:
//   POST /auth/login  →  { accessToken, refreshToken, user }
//   GET  /jobs        with Authorization: Bearer  →  seeded rows
//   GET  /jobs        with no token               →  401
//   POST /auth/refresh →  rotated token pair
//
// Usage: node scripts/verify-live-api.mjs [baseUrl]
//   baseUrl defaults to http://localhost:4000 (the server's default port).
//
// Requires the backend running:  cd ../server && npm install && npm run dev

const BASE = process.argv[2] ?? 'http://localhost:4000'
const EMAIL = 'owner@salisauto.sa'
const PASSWORD = 'salis1234'

let failures = 0
function check(label, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

async function main() {
  console.log(`Verifying live API at ${BASE}\n`)

  // 1) Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const login = await loginRes.json()
  check('POST /auth/login returns 200', loginRes.status === 200, `status ${loginRes.status}`)
  check('login yields an accessToken', typeof login.accessToken === 'string')
  check('login yields a refreshToken', typeof login.refreshToken === 'string')
  check('login user carries a role', typeof login?.user?.role === 'string', login?.user?.role)
  check('login user carries a destination', typeof login?.user?.destination === 'string', login?.user?.destination)

  // 2) Authenticated collection read — the useCollection path.
  const jobsRes = await fetch(`${BASE}/jobs`, {
    headers: { accept: 'application/json', authorization: `Bearer ${login.accessToken}` },
  })
  const jobs = await jobsRes.json()
  check('GET /jobs with Bearer returns 200', jobsRes.status === 200, `status ${jobsRes.status}`)
  check('GET /jobs returns seeded rows', Array.isArray(jobs) && jobs.length > 0, `${jobs?.length ?? 0} rows`)

  // 3) Unauthenticated request is rejected (RBAC/auth enforced server-side).
  const noAuthRes = await fetch(`${BASE}/jobs`, { headers: { accept: 'application/json' } })
  check('GET /jobs with no token is 401', noAuthRes.status === 401, `status ${noAuthRes.status}`)

  // 4) Refresh rotates the token pair (the onAuthFailure path).
  const refreshRes = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ refreshToken: login.refreshToken }),
  })
  const refreshed = await refreshRes.json()
  check('POST /auth/refresh returns 200', refreshRes.status === 200, `status ${refreshRes.status}`)
  check('refresh returns an accessToken', typeof refreshed.accessToken === 'string')
  // The refresh token rotates (old one revoked); the access token can be
  // byte-identical when re-signed within the same second with the same claims,
  // so rotation is asserted on the refresh token, not the access token.
  check('refresh rotates the refreshToken', typeof refreshed.refreshToken === 'string' && refreshed.refreshToken !== login.refreshToken)

  // The access token was rotated above; use the freshest one for the writes.
  const token = refreshed.accessToken
  const authed = (extra = {}) => ({ accept: 'application/json', authorization: `Bearer ${token}`, ...extra })
  const jsonHeaders = () => authed({ 'content-type': 'application/json' })

  // 5) WRITE round-trip: create → patch → delete an invoice (the write half of
  //    the contract the repository seam now calls through).
  const newId = `INV-VERIFY-${Date.now()}`
  const createRes = await fetch(`${BASE}/invoices`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ id: newId, cust: 'Verify Script', amount: 'SAR 2,400', due: 'Sep 30, 2026', status: 'unpaid' }),
  })
  const created = await createRes.json()
  check('POST /invoices creates and returns 201', createRes.status === 201, `status ${createRes.status}`)
  check('created invoice comes back in contract shape', created?.id === newId && created?.status === 'unpaid')
  check('created invoice does not leak the surrogate pk', created && created.pk === undefined)

  const patchRes = await fetch(`${BASE}/invoices/${newId}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ status: 'paid' }),
  })
  const patched = await patchRes.json()
  check('PATCH /invoices/:id returns 200 with the updated row', patchRes.status === 200 && patched?.status === 'paid', `status ${patchRes.status}`)

  const delRes = await fetch(`${BASE}/invoices/${newId}`, { method: 'DELETE', headers: authed() })
  check('DELETE /invoices/:id returns 204', delRes.status === 204, `status ${delRes.status}`)

  const goneRes = await fetch(`${BASE}/invoices/${newId}`, { headers: authed() })
  check('the deleted invoice is gone (404)', goneRes.status === 404, `status ${goneRes.status}`)

  // 6) Validation is enforced server-side: a bad body is a 422 envelope.
  const badRes = await fetch(`${BASE}/invoices`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ id: 'INV-BAD' }),
  })
  const bad = await badRes.json()
  check('POST /invoices with a bad body is 422', badRes.status === 422, `status ${badRes.status}`)
  check('422 carries the error envelope with a field', bad?.error?.code === 'validation_failed' && typeof bad?.error?.field === 'string')

  // 7) STATE ACTION: job transition through the server-side state machine.
  //    Create a fresh pending job so the run is deterministic, then move it on.
  const jobId = `JOB-VERIFY-${Date.now()}`
  await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ id: jobId, cust: 'Verify Script', veh: 'Toyota Camry 2022', svc: 'maintenance', st: 'pending', pr: 'medium' }),
  })
  const transRes = await fetch(`${BASE}/jobs/${jobId}/transition`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ to: 'in_progress' }),
  })
  const transitioned = await transRes.json()
  check('POST /jobs/:id/transition (pending → in_progress) returns 200', transRes.status === 200, `status ${transRes.status}`)
  check('the job is now in_progress', transitioned?.st === 'in_progress', transitioned?.st)

  // An illegal transition (in_progress → delivered) is rejected by the machine.
  const badTransRes = await fetch(`${BASE}/jobs/${jobId}/transition`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ to: 'delivered' }),
  })
  const badTrans = await badTransRes.json()
  check('an invalid transition is rejected with 409', badTransRes.status === 409, `status ${badTransRes.status}`)
  check('409 names the invalid_transition code', badTrans?.error?.code === 'invalid_transition')

  // A write the role cannot perform is refused server-side (RBAC re-check). A
  // technician has no create on invoices.
  const techLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: 'tech@salisauto.sa', password: PASSWORD }),
  })
  const techLogin = await techLoginRes.json()
  const rbacRes = await fetch(`${BASE}/invoices`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', authorization: `Bearer ${techLogin.accessToken}` },
    body: JSON.stringify({ id: 'INV-RBAC', cust: 'X', amount: 'SAR 1', due: 'now', status: 'unpaid' }),
  })
  check('a technician creating an invoice is refused (403)', rbacRes.status === 403, `status ${rbacRes.status}`)

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('verify-live-api: could not reach the API —', err.message)
  console.error('Is the backend running?  cd ../server && npm install && npm run dev')
  process.exit(1)
})
