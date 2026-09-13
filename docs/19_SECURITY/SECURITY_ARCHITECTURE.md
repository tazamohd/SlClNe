# Security architecture

**Status:** NORMATIVE · **Owner:** Security architect · **Scope:** CURRENT

What protects this system today, which layer each control lives in, and what is not protected. Generated companions to this document — the [RBAC matrix](RBAC_MATRIX.md) and [tenant isolation](TENANT_ISOLATION.md) — carry the data; this one carries the reasoning.

**No secret value appears in this documentation set.** Secret *names* are documented where a reader needs to know what must be configured; values never are.

## 1. The controls, by layer

| Layer | Control | Mechanism | Fails how |
|---|---|---|---|
| Edge | Security headers | `@fastify/helmet`, plus generated headers checked by `app/scripts/gen-headers.mjs --check` | Closed — the check fails the build |
| Edge | Rate limiting | `@fastify/rate-limit` | Closed — request refused |
| Edge | CORS | `@fastify/cors` | Closed |
| Authentication | Bearer access token | `onRequest` hook in `server/src/app.ts`, applied to everything except a named public list | **Closed by default** — a new route is authenticated unless explicitly named public |
| Authentication | Token storage | JWT in an httpOnly cookie, unreachable from JavaScript (ADR-005) | — |
| Authentication | Sessions and revocation | `user_sessions`, with list, revoke-one and revoke-all endpoints | — |
| Authentication | Second factor and OTP | `server/src/auth/otp.ts`, `otp_challenges` | Closed |
| Authorization | Module × action grant | `server/src/security/permissions.ts`, reading `packages/contract/src/rbac.ts` | Closed — 403 before any query runs |
| Authorization | Approval authority and ceiling | `server/src/security/approvals.ts` | Closed, and distinguishes *escalate* from *deny* |
| Authorization | Segregation of duties | `server/src/security/sod.ts` | Closed |
| Authorization | Field redaction | `FIELD_RULES` in the contract | Closed |
| Data | Tenant isolation | Postgres RLS policy `p_tenant` on `org_id` | **Closed** — no context set means no rows |
| Data | Branch and ownership narrowing | RESTRICTIVE policies `r_branch` and `r_own` | Closed |
| Data | Owner cannot bypass | `FORCE ROW LEVEL SECURITY` | Closed |
| Data | Concurrency | `version`, bumped by a database trigger | Closed — stale write refused |
| Data | Idempotency | Stored response keyed on `(org_id, key, endpoint)` | Closed — a different body under the same key is refused |
| Data | Audit immutability | Trigger raising `insufficient_privilege` on `UPDATE`/`DELETE` | Closed, for every role |

## 2. The three decisions that carry the model

### 2.1 The client's permission check is not a security control

The SPA holds a copy of the permission matrix. It hides menu items and disables buttons — it decides what a screen *shows*. It decides nothing about what *happens*. Every request is re-checked server-side before any query runs.

This is stated explicitly because the failure mode is silent: a system where the client check looks thorough invites the assumption that the server check is redundant, and the first endpoint added without one is undetectable from the outside. `server/tests/rbac-parity.test.ts` asserts the two copies of the matrix are identical, so a drift between what the sidebar shows and what the API allows is a failing test rather than a privilege escalation.

### 2.2 Isolation is enforced by the database, and it fails closed

Tenant isolation could have been a `WHERE org_id = ?` in every query. It is not, because that is a control a developer has to remember on every query forever, and the first one they forget is a cross-tenant data leak that no test is looking for.

Instead: `SET LOCAL app.org_id` per transaction, and an RLS policy on every tenant-owned table that compares against it. Three properties make it hold, and all three are load-bearing:

1. **`app_org()` returns `NULL` when unset**, and every policy compares against it — so a connection with no context set reads *nothing*. A bug that forgets to set the context produces an empty result, not another tenant's data.
2. **`FORCE ROW LEVEL SECURITY`** subjects the table owner to the policies. Without it, the migration role bypasses isolation entirely and the protection is theatre.
3. **Narrowing policies are RESTRICTIVE.** Multiple PERMISSIVE policies are OR-ed together, so a permissive branch-scope policy beside a permissive tenant-scope one would *widen* access — a branch-scoped user would read the whole organization. This is a genuinely easy mistake to make and the source records that an illustrative snippet elsewhere in the project made it.

### 2.3 The grant alphabet has six letters and `x` is export

`v c e d a x` — view, create, edit, delete, approve, **export**. Not five letters, and `x` is not delete.

This is not pedantry. Under the five-letter reading, `routes/collections.ts` checked `x` on `DELETE` — which granted delete to every role holding view-plus-export: accountant on the audit log, job cards, estimates and inventory; technician and customer on their portals. Roughly twenty cells, live until it was caught.

Any reader or agent still treating the enum as five letters is asking the wrong question of the matrix.

## 3. Approval and segregation of duties

Approval needs **authority and ceiling**, not the ceiling alone. A role without the `a` grant is refused outright. A role with the grant but below the amount is told to *escalate* — and the message says so, because a screen that only says "forbidden" sends the user to ask an administrator for a permission that would not help them.

Ceilings, from `ROLE_META`:

| Role | Data scope | Approval ceiling |
|---|---|---|
| owner | all | unlimited |
| superadmin | platform | unlimited |
| manager | branch | SAR 50,000 |
| accountant | all | SAR 25,000 |
| procurement | all | SAR 20,000 |
| hr | all | SAR 15,000 |
| parts | branch | SAR 10,000 |
| advisor | branch | SAR 5,000 |
| technician | own | may not approve |
| qc, frontdesk, callcenter | branch / all | may not approve |
| supplier | external | may not approve |
| customer | self | may not approve |

Six segregation-of-duties pairs are enforced rather than documented as guidance. The two that matter most: **the person who raised a document cannot approve it**, and **a technician cannot pass quality control on a repair they performed**. The first is the pair that lets one person move money on their own say-so; the second is the one that makes quality control meaningless if broken.

## 4. Attack surface

The unauthenticated surface is short on purpose, and every addition to it is a security decision:

| Surface | Paths | Note |
|---|---|---|
| Probes | `/health`, `/ready` | No tenant data |
| Public lead capture | `POST /api/v1/public/leads` | Rate-limited write from the website |
| Customer self-registration | `POST /api/v1/public/customers/register`, `/verify-otp`, `/resend-otp` | OTP-gated |
| Authentication | `/api/v1/auth/login`, `/refresh`, `/register`, `/request-otp`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/sso/start`, `/sso/callback`, `/social/:provider`, `/providers` | Pre-authorization by definition |

Everything else requires a token. `/auth/me`, the session list and session revocation are authenticated, despite sitting in the auth router.

## 5. The `test` role

A QA account holding every action on every module, so one login can walk the whole product end to end. Two properties keep it from being a hole:

- Its data scope is `all`, **not `platform`** — "do everything" stops at the tenant boundary. A test account that could read another organization's rows would make every isolation guarantee conditional on which demo user is signed in.
- Every request it makes is written to the audit log under its own user id. Its breadth is precisely why `audit` is enforced rather than assumed.

It is also the only role `/auth/switch-role` will act as another one from.

## 6. Threat model — abbreviated

| Threat | Control | Residual |
|---|---|---|
| Cross-tenant read | RLS, fails closed, `FORCE`d | Low. A query outside a request transaction reads nothing rather than everything. |
| Privilege escalation via the client | Server-side re-check; parity test | Low |
| Privilege escalation via a new endpoint | Authenticated by default; explicit public list | **Medium** — the gap report lists authenticated endpoints whose handler states no permission guard. Each is either guarded through a helper this parse does not follow, or genuinely open. Each needs a human to say which. |
| Self-approval of financial documents | SOD pair enforced server-side | Low |
| Approval above authority | Ceiling checked server-side | Low |
| Tampering with the audit trail | Database trigger, `UPDATE`/`DELETE` rejected for all roles | Low |
| Replayed write creating a double effect | Idempotency key with stored response and body hash | Low |
| Lost update under concurrency | Database-maintained `version` | Low |
| Orphaned or inconsistent references | **None at the database level** | **Medium** — 103 of 164 relationships have no foreign key. Integrity depends entirely on application code. |
| Illegal status transition on a financial document | Route-handler checks only, for 17 of 18 lifecycles | **Medium** |
| Secret exposure | Secrets by name in `server/.env.example`; no value in the repository or in these documents | Low |

## 7. What is not covered here

- **Penetration testing.** None has been run against this system, and none is claimed.
- **Production security monitoring.** No alerting or SIEM integration is configured in this repository.
- **Compliance sufficiency.** This document describes controls. Whether they satisfy a specific regulation is marked `LEGAL_REVIEW_REQUIRED` in `26_LEGAL_COMPLIANCE/`.
- **Infrastructure and network security.** Documented only as far as `Dockerfile`, `nginx.conf` and the deployment configs show it.
