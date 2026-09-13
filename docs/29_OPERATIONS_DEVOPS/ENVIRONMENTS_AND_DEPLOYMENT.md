**Status:** NORMATIVE · **Owner:** Operations architect

# Environments and deployment

What this repository actually configures, and what it only assumes. There is no production deployment of SALIS AUTO in this workspace and no deployment history, so this document describes **configuration that exists**, not environments that are running. Where a document elsewhere names an environment that no configuration in this repository defines, that is recorded as assumed rather than repeated as fact.

Secrets appear here by **name only**. No value is copied from any file, and none should be added.

---

## 1. What is configured, at a glance

| Artefact | Path | Deploys | State |
| --- | --- | --- | --- |
| Container image | `Dockerfile` | The built SPA, served by nginx | CURRENT |
| Compose file | `docker-compose.yml` | That one image, port 3000 to 80 | CURRENT — single service, no database |
| nginx site config | `nginx.conf` | SPA fallback routing plus the security headers | CURRENT |
| Netlify config | `netlify.toml` | Builds `app/`, publishes `app/dist`, SPA redirect, headers | CURRENT — no site is known to be linked |
| Vercel config | `vercel.json` | Builds `app/`, output `app/dist`, SPA rewrite, headers | CURRENT — no project is known to be linked |
| CI | `.github/workflows/ci.yml` | Nothing — it verifies | CURRENT |
| GitHub Pages deploy | `.github/workflows/deploy-pages.yml` | The SPA, on every push to `main` | CURRENT |
| Hostinger deploy | `.github/workflows/deploy-hostinger.yml` | The SPA and the separate marketing site, by FTPS or SFTP | CURRENT |
| PR report | `.github/workflows/pr-report.yml` | Nothing — it reports check outcomes onto the pull request | CURRENT |
| API deployment | — | **Nothing. No mechanism exists.** | ABSENT |
| Database provisioning or migration deployment | — | **Nothing. No mechanism exists.** | ABSENT |

---

## 2. The container image

`Dockerfile` is a two-stage build:

1. `node:20-alpine` — copies `app/package.json` and `app/package-lock.json`, runs `npm ci`, copies `app/`, runs `npm run build`.
2. `nginx:alpine` — copies `/app/dist` to `/usr/share/nginx/html`, copies `nginx.conf` to `/etc/nginx/conf.d/default.conf`, exposes 80.

**The image contains the frontend only.** `.dockerignore` excludes `server`, `packages`, `docs`, `project-control`, `.github` and `.git`. There is no API image, no API Dockerfile anywhere in the repository, and no multi-service compose file. Any statement that the platform is containerised applies to the SPA and to nothing else.

`docker-compose.yml` is four lines: one service built from the root `Dockerfile`, `3000:80`, `restart: unless-stopped`. No PostgreSQL service, no volume, no network, no environment block, no healthcheck directive.

## 3. nginx

`nginx.conf` serves `/usr/share/nginx/html` with `try_files $uri $uri/ /index.html` so client-side routes resolve, and a one-year immutable cache on static asset extensions.

The security headers are emitted twice on purpose — once at server level and once inside the asset `location` block — because nginx discards inherited `add_header` directives as soon as a nested block declares one of its own. Without the repetition, the `Cache-Control` header in the asset block would silently strip all eight security headers from exactly the scripts, stylesheets and fonts a CSP exists to govern. The file carries that reasoning in a comment; do not "de-duplicate" it.

## 4. Security headers

Defined once in `app/security-headers.mjs` and propagated to four places that cannot import from one another: `app/vite.config.ts` (so `npm run preview`, and therefore the whole Playwright suite, runs under the real policy), `nginx.conf`, `netlify.toml` and `vercel.json`.

| Script | Effect |
| --- | --- |
| `npm run gen:headers` (in `app/`) | Rewrites the three deploy files from the module |
| `npm run check-headers` | Fails when any of them has drifted; runs inside `npm run gates` |

The eight headers are Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy, Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy.

Two CSP facts an operator needs:

- `script-src` is `'self'` plus `https://cdnjs.cloudflare.com`, the single exception being three.js loaded at runtime for the WebGL scenes behind the public landing page. That is the directive that stops an injected script, so it is the one to keep narrow.
- `connect-src` is `'self'` **only**. In any deployment where `VITE_API_BASE_URL` points at a different origin and nginx does not proxy the API, that origin must be added to `connect-src` in `app/security-headers.mjs` and the deploy files regenerated, or every API call the app makes is blocked by the browser. This is the most likely first-deployment failure in the repository.

The API sets its own, stricter header set separately via `@fastify/helmet` in `server/src/app.ts`.

## 5. GitHub Actions

### 5.1 `ci.yml` — verification

Runs on every push to any branch, every pull request and manual dispatch, on Node 22, with in-progress runs cancelled per ref.

| Job | Steps |
| --- | --- |
| `build` | `npm ci`, typecheck, `npm run test --if-present`, build, registry-freshness (`npm run registry` then `git diff --exit-code` over `project-control/`, `docs/` and the generated registry module), `check-no-fake`, `check-tokens`; uploads `MASTER_REGISTRY.json`, `BLOCKERS.json` and `MASTER_GAP_REPORT.md` as an artefact for 14 days |
| `e2e` | Chromium, build, `vite preview` on 4173, `npm run smoke` — routes, behaviour, mobile and brand guard |
| `golden` | `npm run golden -- --ratchet` against `project-control/BASELINE.json`; the counts may fall and never rise; uploads `GOLDEN_PATHS.json` |
| `a11y` | `npx playwright test e2e/a11y.spec.ts` — axe over one screen per shell family at both viewports; serious and critical findings other than contrast fail outright, contrast is ratcheted per screen |
| `server-typecheck` | Installs `packages/contract` then `server`, runs `tsc --noEmit` |
| `server-test` | `vitest run` against a real `postgres:16` service container, with **two roles**: `DATABASE_ADMIN_URL` as the bootstrap owner for migrations, `DATABASE_URL` as a separate non-superuser application role. A superuser bypasses row-level security even where the migrations set `FORCE`, so running the suite on a superuser DSN passes every isolation assertion vacuously. Secret names used: `DATABASE_ADMIN_URL`, `DATABASE_URL`, `JWT_SECRET` (CI test values, set inline in the workflow, not repository secrets) |
| `security` | `gitleaks/gitleaks-action@v2` over full history, then `npm audit --audit-level=high` separately for `app`, `server` and `packages/contract` so a failure names its lockfile |

The pipeline deliberately contains no job that reports success without running anything; suites not yet written are absent rather than stubbed green.

### 5.2 `deploy-pages.yml` — GitHub Pages

Push to `main` or manual dispatch. Builds `app/` on Node 20 with `VITE_BASE_PATH` set to `/<repository-name>/`, uploads `app/dist` as a Pages artefact, deploys to the `github-pages` environment. This is the **only** GitHub deployment environment declared anywhere in the repository. It has no gate: `ci.yml` and `deploy-pages.yml` both trigger on push to `main` and neither waits for the other, so a Pages deployment is not conditional on CI passing.

### 5.3 `deploy-hostinger.yml` — Hostinger (saleisco.com)

Push to `main` touching `app/**`, `packages/**`, `site/**` or the workflow itself, or manual dispatch. A `changes` job uses `dorny/paths-filter` so an `app/` edit does not redeploy `site/` and vice versa; a manual dispatch treats both as changed.

| Job | Source | Server directory |
| --- | --- | --- |
| `deploy-app` | `app/dist/` after `npm ci` and `npm run build` | `vars.HOSTINGER_SERVER_DIR`, default `/public_html/` |
| `deploy-site` | `site/` uploaded as-is, no build | `vars.HOSTINGER_SITE_SERVER_DIR`, default `/public_html/company/` |

Transfer is `SamKirkland/FTP-Deploy-Action@v4.3.5` with protocol from `vars.HOSTINGER_FTP_PROTOCOL`, default `ftps`.

Secret **names** used: `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`. Repository or organisation **variable** names: `HOSTINGER_FTP_PROTOCOL`, `HOSTINGER_SERVER_DIR`, `HOSTINGER_SITE_SERVER_DIR`.

Two things to note. The workflow carries a step labelled TEMPORARY that reports only whether each FTP secret is non-empty, never its value, added while diagnosing an upload failure; it should be removed once uploads succeed. And the upload is not atomic — `dangerous-clean-slate: false` means files are overwritten in place, so a partially completed transfer leaves a partially updated site with no rollback other than re-running a previous build.

### 5.4 `pr-report.yml`

On pull requests to `main`: runs app typecheck, app unit tests, app build, server typecheck and server unit tests with `continue-on-error`, then posts or updates a single comment with a pass/fail table and tailed logs for the failures, and fails the job if any check failed. It is a reporting surface over the same checks, not a second gate.

## 6. Environments

### 6.1 Actually defined by configuration

| Environment | Defined by | Notes |
| --- | --- | --- |
| Local development (frontend) | `app/package.json` `dev` on Vite port 5173; `app/.env.example` | Runs entirely on design-bundle fixtures unless `VITE_API_BASE_URL` is set |
| Local preview | `app/vite.config.ts` `preview` on 4173, serving the real security headers | The E2E and axe suites run here; `playwright.config.ts` owns its own `webServer` |
| Local development (API) | `server/package.json` `dev` (`tsx watch src/index.ts`); `server/.env.example`; default port 3001 | Requires `DATABASE_URL`; `JWT_SECRET` is optional in development and mandatory outside it |
| CI | `ci.yml`, including a `postgres:16` service container with a two-role setup | Ephemeral, per run |
| GitHub Pages | `deploy-pages.yml`, environment `github-pages` | Frontend only, fixtures only unless a base URL is built in |
| Hostinger | `deploy-hostinger.yml` | Frontend and marketing site only; no API |

### 6.2 Assumed, not defined

| Environment | Where it is assumed | What is missing |
| --- | --- | --- |
| Production (API and database) | `NODE_ENV=production` branch in `server/src/env.ts`; `operations/devops-guide.md` §4.2; `environment-setup.md` §6; every runbook | No host, no image, no process manager, no service definition, no database instance, no connection string source, no TLS termination, no DNS record |
| Staging | `operations/backup-recovery.md` §3.2 and `environment-setup.md` §7 | No configuration of any kind in this repository |
| Netlify and Vercel targets | `netlify.toml`, `vercel.json` | Config files are committed; nothing indicates a linked site or project, and neither appears in any workflow |

An operator should read the environment comparison in `docs/system/operations/environment-setup.md` as a design of environments, not an inventory of them.

## 7. Configuration and secret names

Names only. Values live in the environment; `server/.env` is git-ignored and only `.env.example` is committed. `server/src/env.ts` validates configuration once at boot with Zod and throws on anything invalid, and `JWT_SECRET` is mandatory when `NODE_ENV=production` — the process refuses to start rather than run on a guessable value.

### 7.1 Server — validated in `server/src/env.ts`

`NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `DATABASE_URL`, `DATABASE_ADMIN_URL`, `DATABASE_POOL_MAX`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `CORS_ORIGINS`, `RATE_LIMIT_MAX`, `PUBLIC_LEAD_ORG_ID`, `PUBLIC_LEAD_RATE_LIMIT`, `VAT_RATE_BPS`.

### 7.2 Server — module configuration (`server/src/auth/config.ts`, `src/integrations/config.ts`), documented in `server/.env.example`

`ARGON2_MEMORY_KIB`, `ARGON2_TIME_COST`, `ARGON2_PARALLELISM`, `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`, `OTP_RESEND_SECONDS`, `OTP_TTL_MINUTES`, `OTP_MAX_ATTEMPTS`, `OTP_TRANSPORT`, `PASSWORD_RESET_TTL_MINUTES`, `AUTH_RATE_LIMIT_PER_MINUTE`, `LOGIN_RATE_LIMIT_PER_MINUTE`, `LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCKOUT_SECONDS`, `SSO_ISSUER_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, `OBD_TRANSPORT`, `OBD_BRIDGE_URL`, `OBD_BRIDGE_TOKEN`.

Three of these default to refusing rather than pretending: `OTP_TRANSPORT` defaults to `unconfigured` and will not report a code as sent, `OBD_TRANSPORT` defaults to `unconfigured` and returns 503 naming the missing credentials, and the SSO and WebAuthn keys are empty by default with the routes reporting themselves unconfigured. An empty value is a deliberate, visible state, not an oversight.

### 7.3 Frontend

`VITE_API_BASE_URL` (unset means the app runs on fixtures), `VITE_BASE_PATH` (set by the Pages workflow), `VITE_API_URL`.

### 7.4 CI and deployment secret names

`GITHUB_TOKEN` (gitleaks), `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`. `project-control/RISK_REGISTER.json` R-03 and release gate RB-10 both record exposed credentials as an open issue; rotation is tracked there, not here.

## 8. Database: migration and seed

| Command | Script | Behaviour |
| --- | --- | --- |
| `npm run db:generate` | drizzle-kit | Generates a migration from the schema |
| `npm run db:migrate` | `server/scripts/migrate.ts` | Applies `server/drizzle/` using `DATABASE_ADMIN_URL` (falling back to `DATABASE_URL`), then provisions the application role |
| `npm run db:seed` | `server/scripts/seed.ts` | Seeds from the app's own generated fixtures, through the same RLS-enforced path the API uses; fixed ids make re-seeding idempotent |
| `npm run db:reset` | both | `migrate --reset` drops and recreates the `public` and `drizzle` schemas, then seeds |

`migrate.ts` is the only place the two-role model is enforced. When `DATABASE_URL` names a different role from the admin URL, it creates that role if absent (using the password in the URL), grants usage plus select/insert/update/delete on tables and sequences, sets matching default privileges, and **revokes UPDATE and DELETE on `audit_log`** so the audit trail is append-only at the grant level as well as by trigger. It deliberately grants neither `SUPERUSER` nor `BYPASSRLS`.

Operational consequences to plan for:

- **`--reset` is destructive** and takes no confirmation. It is a development command.
- There are **no down migrations**. `server/drizzle/` contains forward SQL only, so a bad migration is recovered from a backup, not reversed.
- **No workflow runs migrations against any environment.** Migration is a manual act today, with no pre-migration backup step and no recorded execution path.

## 9. Gate and verification scripts

These are the commands an operator or reviewer runs; all are real scripts in the repository.

| Command | Where | What it does |
| --- | --- | --- |
| `npm run gates` | `app/` | registry, expand-assertions, check-no-fake, check-tokens, check-i18n, check-a11y, check-headers |
| `npm run certify` | `app/` | registry, then check-no-fake and check-tokens in `--strict` mode |
| `npm run smoke` | `app/` | `scripts/smoke.mjs` — routes, behaviour, mobile and brand guard |
| `npm run golden` | `app/` | `scripts/golden-paths.mjs`; `--ratchet` compares against `project-control/BASELINE.json` |
| `npm run check-bundle` | `app/` | Bundle-size check |
| `npm run verify:api` | `app/` | `scripts/verify-live-api.mjs` against a running API |
| `npm run registry` | `app/` | Rebuilds the generated registers; CI fails if the committed output differs |
| `node project-control/release-gates.mjs` | repo root | Evaluates the fourteen release blockers and writes `RELEASE_GATES.json`. Needs a real PostgreSQL and the two-role setup; it re-checks `pg_roles` before and after the run and reports UNCHECKABLE rather than PASS if the role the suite connected as could bypass RLS. `--skip-server-suite` marks the six suite-backed gates UNCHECKABLE as operator-skipped |
| `npm run docs:generate` / `docs:check` | repo root | Regenerates and validates the generated documentation set |
| `npm run rbac-lab` | `server/` | `scripts/rbac-lab.ts` — the cross-tenant access lab behind gate RB-04 |

## 10. The gaps that matter most

1. **No API deployment exists.** Not partially, not manually documented — no image, no workflow, no host. Everything the runbooks say about deploying, rolling back or failing over the API presumes infrastructure this repository does not describe.
2. **No database is provisioned or migrated by any automation.** The mechanism is sound; the deployment of it is absent.
3. **Deployment is not gated on CI.** `deploy-pages.yml` and `deploy-hostinger.yml` trigger on push to `main` independently of `ci.yml`.
4. **FTP deployment is not atomic and has no rollback** beyond re-running a previous build.
5. **`connect-src 'self'`** will block every API call the moment the API is served from a different origin, unless `app/security-headers.mjs` is updated first and the deploy files regenerated.

## 11. Related documents

| Document | Relationship |
| --- | --- |
| `docs/system/operations/environment-setup.md` | The full variable-by-variable reference. Read together with section 7 above; check it against `server/src/env.ts` where the two differ. |
| `docs/system/operations/devops-guide.md` | Longer narrative of the build and run model; see `RUNBOOK_INDEX.md` §5 for its known drift. |
| `docs/29_OPERATIONS_DEVOPS/OBSERVABILITY.md` | What can and cannot be seen once something is deployed. |
| `docs/29_OPERATIONS_DEVOPS/RUNBOOK_INDEX.md` | The procedures that act on the mechanisms described here. |
| `docs/19_SECURITY/TENANT_ISOLATION.md` | Why the two-role migration model is not optional. |
