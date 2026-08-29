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

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('verify-live-api: could not reach the API —', err.message)
  console.error('Is the backend running?  cd ../server && npm install && npm run dev')
  process.exit(1)
})
