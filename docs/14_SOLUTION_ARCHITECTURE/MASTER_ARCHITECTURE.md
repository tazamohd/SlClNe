# Master architecture

**Status:** NORMATIVE · **Owner:** Solution architect · **Scope:** CURRENT unless a section says `TARGET`

Everything below describes what is in the repository today. Where an intent differs from the implementation it is in the `TARGET` section at the end and labelled as such. An architecture document that describes an intended component in the present tense is worse than no document, because a reader plans against something that does not exist.

## 1. What SALIS AUTO is

A multi-tenant workshop management system for the Saudi automotive aftermarket. One deployment serves many garages; each garage is an organization, and organizations may have branches. The product spans the workshop floor (job cards, estimates, quality control), the parts and procurement chain, invoicing and accounting under ZATCA VAT rules, CRM, HR and payroll, insurance and loan workflows, and four external-facing portals.

Scale, measured rather than estimated: the current counts of tables, endpoints, permission cells, screens and test suites are in [the documentation status](../00_DOCUMENT_CONTROL/DOCUMENTATION_STATUS.md) and in the registries under `project-control/`. They are not repeated here, because a number written into prose is wrong the next time a table or a route is added and nobody notices.

## 2. Shape

Three deployable parts and one shared library.

| Part | What it is | Where |
|---|---|---|
| SPA | React 18 + Vite, React Router, TanStack Query, Zustand, Tailwind. Packaged for iOS and Android via Capacitor from the same source. | `app/` |
| API | Fastify 5 on Node, Drizzle ORM, Zod validation | `server/` |
| Database | PostgreSQL with row-level security | `server/drizzle/` |
| Shared contract | Zod entity schemas, the permission matrix, the business-rule functions | `packages/contract/` |

The shared contract is the load-bearing piece and the one architectural decision everything else leans on. Both the SPA and the API import the same permission matrix and the same rule functions. `server/tests/rbac-parity.test.ts` asserts the two copies of the matrix are **identical**, not merely similar — so a change to the design bundle's matrix that is not carried into the contract fails the build rather than quietly granting the API more than the sidebar shows.

The full C4 views — context, containers, components and a dynamic view — are in [the C4 model](../15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md), generated from the same sources as this document.

## 3. Architecture principles, as the code actually applies them

These are not aspirations. Each names the mechanism that enforces it, and each is checkable.

### 3.1 Security is a boundary, not a suggestion

Authorization happens twice and only one of them counts. The SPA's copy of the matrix hides and disables — it decides what a screen *shows*. The server's copy decides what *happens*, on every request, before any query runs. Frontend RBAC is explicitly not a security boundary, and the source says so in the places where a reader would otherwise assume otherwise.

### 3.2 Isolation is the database's job

Tenant isolation is a row-level-security policy keyed on `app.org_id`, set per transaction with `SET LOCAL`. It is not a `WHERE` clause, because a `WHERE` clause is something a developer has to remember and a policy is something the database applies whether they remembered or not.

Three properties make it hold:

- **Fail closed.** Each context reader returns `NULL` when unset and every policy compares against it, so a connection with no context set sees nothing at all.
- **`FORCE ROW LEVEL SECURITY`.** Without it, the migration role that owns the table silently bypasses every policy.
- **Narrowing policies are RESTRICTIVE.** Multiple PERMISSIVE policies are OR-ed, so a permissive "branch scope" policy beside a permissive "tenant scope" one would *widen* access — a branch-scoped user would read the whole organization. RESTRICTIVE is AND-ed, which is the behaviour intended.

All 64 tables that need it have RLS enabled and forced. Details in [tenant isolation](../19_SECURITY/TENANT_ISOLATION.md).

### 3.3 Money is an integer

Every money column is `bigint` holding a count of halalas, named `*_halalas`. No `numeric`, no float, anywhere. Totals are computed server-side by `packages/contract/src/rules/money.ts`; a client-supplied total is never trusted. VAT is held as basis points (1500) so the rate itself is exact, and half-up rounding is applied once at the subtotal and once at the tax — never per line, so a 500-line invoice does not drift by 500 halalas.

### 3.4 Describe once, generate the rest

`server/src/registry.ts` describes each of the 52 collections a single time: its table, the permission module that gates it, the columns `?q=` searches, the columns `?sort=` and `?filter[]=` accept, and how a row is presented. `server/src/routes/collections.ts` generates the majority of the API surface from those descriptions — the `GENERATED` rows in `project-control/API_REGISTRY.json`, against the `EXPLICIT` ones written out by hand.

The reasoning is a claim about people, not about elegance: fifty-two hand-written routers guarantee that the twenty-ninth forgets the soft-delete filter or the permission check. The remaining 131 endpoints are written out because they have behaviour of their own — line items, derived money, idempotency, approval ceilings, OTP.

### 3.5 Fail loudly, not quietly

An unknown `?sort=` key is a 400, not a silent fallback to the default, so a typo is visible instead of ignored. A route added to the API is authenticated by default and must be named explicitly in `PUBLIC_PATHS` to be public. A replayed `Idempotency-Key` with a *different* body is refused rather than replayed. A stale `version` is rejected rather than overwritten.

### 3.6 The audit log cannot be edited

Append-only at the database level: a trigger raises `insufficient_privilege` on `UPDATE` and `DELETE`, for every role including the table owner. An audit log an administrator can edit is not an audit log.

## 4. Cross-cutting mechanisms

| Mechanism | How | Where |
|---|---|---|
| Authentication | Bearer access token; `onRequest` hook applied to everything except a named public list | `server/src/app.ts`, `server/src/auth/` |
| Authorization | Module × action grant, six letters (`v c e d a x`, where `x` is **export**) | `server/src/security/permissions.ts` |
| Approval | Authority *and* ceiling, not the ceiling alone. Above the ceiling the answer is *escalate*, not *deny* — and the message says so, because "forbidden" sends a user to ask for a permission that would not help. | `server/src/security/approvals.ts` |
| Segregation of duties | Six enforced pairs: the submitter cannot approve; a technician cannot pass QC on their own repair | `server/src/security/sod.ts`, `packages/contract/src/rules/approvals.ts` |
| Field redaction | Seven fields hidden from named roles — part cost and margin, labour cost rate, employee salary, supplier purchase price among them | `packages/contract/src/rbac.ts` |
| Concurrency | Optimistic on `version`, bumped by a database trigger so a hand-written `UPDATE` cannot leave a stale value | `server/drizzle/0001_rls.sql` |
| Idempotency | Stored response keyed on `(org_id, key, endpoint)`; a replay creates no second business effect | `server/src/http/idempotency.ts` |
| Validation | Zod schemas from the shared contract, at the boundary | `packages/contract/src/entities/` |
| Soft delete | `deleted_at`, filtered by the generic router | 63 tables |

## 5. Where the architecture is weakest

Stated here rather than left to be discovered.

### 5.1 Referential integrity is not in the database

**103 of 164 relationships have no foreign key.** The 61 that do are almost entirely `org_id`, the tenancy anchor. Every other association between business entities — a job card's customer, an invoice's vehicle, a payment's invoice — is a `varchar(26)` column with no constraint behind it.

The consequences are real: an orphaned reference is possible and the database will not refuse it; nothing cascades; and a join that assumes a row exists has to handle its absence. This may well be the right trade for a system where deletes are soft and tenancy is enforced by policy, but **it is not recorded as a decision anywhere**. It should be an ADR, and the gap report lists writing one as an action.

### 5.2 One lifecycle in eighteen declares its legal transitions

`jobCard.JOB_STAGE_TRANSITIONS` has a transition table that a single guard enforces for every caller. The other seventeen lifecycles — invoice, purchase order, requisition, insurance claim, loan, leave, payroll, estimate and the rest — declare a state enum and nothing more. Their legal moves are whatever the route handlers happen to check, which cannot be verified by reading one file.

For a purchase order or an invoice that is a financial-control gap, not a documentation one.

### 5.3 Most screens are not yet wired to the API

**About two thirds of the screens read the ported design fixtures rather than the live API.** Every screen renders and every screen has an end-to-end assertion on its content, which is a real achievement — and it is not the same thing as having exchanged a byte with the API under real latency, real errors and real permissions. This is the single largest piece of product work outstanding, and it is measured in `project-control/STATUS.json` rather than asserted here.

## 6. Technology and why

| Choice | Reason | ADR |
|---|---|---|
| React SPA | The product is a dense internal tool behind a login; server rendering buys little and costs a deployment tier | `docs/system/adr/adr-001-react-spa.md` |
| PGlite in development | The full schema and every RLS policy run locally with no database to install | `adr-002-pglite-dev-mode.md` |
| Repository seam | Screens call a repository, not HTTP, so the mock-to-API swap is non-destructive and reversible per collection | `adr-003-repository-seam.md` |
| Drizzle ORM | Schema in TypeScript, migrations generated from it, no runtime query builder in the hot path | `adr-004-drizzle-orm.md` |
| JWT in httpOnly cookies | The token is not reachable from JavaScript | `adr-005-jwt-httponly.md` |
| Integer halalas | A `numeric` rounding surprise must not be able to reach a ledger | `adr-006-integer-halalas.md` |
| `org_id` multi-tenancy with RLS | One deployment, many garages; isolation the application cannot forget | `adr-007-multi-tenant-orgid.md` |
| ZATCA XML generation | Saudi e-invoicing is a statutory requirement for the target market | `adr-008-zatca-xml-generation.md` |

These ADRs predate the numbered architecture and live in `docs/system/adr/`. They are indexed, not rewritten — an ADR is immutable by convention.

## 7. TARGET — intended, not built

Explicitly not present in the repository today. Nothing above depends on any of it.

| Intent | Status |
|---|---|
| Foreign-key constraints, or an ADR recording why there are none | Decision not yet made |
| Declared transition tables for the financial lifecycles | Not started |
| The fixture-backed screens connected to the API | In progress; the bulk of remaining product work |
| Metrics, tracing and alerting | Not configured in this repository |
| Horizontal scaling and a capacity model | No production deployment exists to model against |
