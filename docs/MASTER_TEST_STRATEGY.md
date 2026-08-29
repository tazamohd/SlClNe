# SALIS AUTO — Test Strategy

**Today: one Playwright script — 78 route checks and 13 behaviour checks, about
19% route coverage. No unit runner, no component tests, no integration tests, no
API tests, no accessibility, visual, mobile or RTL suites.** Everything below the
first table is the target, owned by Agent 07 in W1.

`project-control/TEST_STATUS.json` is the live version of this page; where the
two disagree, that file is right.

---

## Layers

| Layer | Runner | Covers | Owner | Wave |
|---|---|---|---|---|
| Unit | vitest | calculations, formatters, validators, every business invariant, RBAC across 14 roles × 28 modules × 5 actions | 07 | W1 |
| Component | vitest + testing-library | each primitive: modal focus trap and restore, form validation and server errors, `DataTable` both layouts, filters, charts, navigation | 04 | W1 |
| Integration | vitest + MSW | create→list refresh, edit→recompute, delete→confirm, optimistic rollback, cache invalidation, concurrency conflict, permission state | 07 | W1 |
| API | vitest + supertest + ephemeral Postgres | every endpoint × every role: 200/401/403/404/409/422; tenant and branch isolation; ceilings; SOD; idempotent replay | 05 | W1 |
| Contract | Zod diff + supertest | request/response schema, required fields, types, enums, errors, pagination, sorting, filtering — both sides import one schema | 05 | W2 |
| Route smoke | Playwright, generated from the registry | every route: renders, correct shell, correct permission, no console error | 07 | W1 |
| Golden paths | Playwright | the 23 named journeys, desktop + 390 px + Arabic | 23 | W4 |
| Financial integrity | vitest + API | Invoice → Payment → Receipt → Ledger → Reports, and every money edge case | 12 | W2 |
| Inventory integrity | vitest + API | the On Hand equation and the double-movement prohibitions | 10 | W2 |
| Concurrency | API + Playwright | simultaneous edit, reservation, approval, receiving; duplicate payment and webhook | 05 | W2 |
| Mobile | Playwright @390/430 | card layouts where designed, no horizontal scroll, ≥44 px targets, drawer nav | 18 | W3 |
| Tablet | Playwright @768/820/834/1024, both orientations | navigation, two-column, tables, forms, detail pages, modal dimensions | 18 | W3 |
| RTL | Playwright, `lang=ar` | direction, icons, chevrons, tables, charts, dates, numbers, currency, LTR-pinned Latin | 19 | W3 |
| Accessibility | axe + keyboard specs | WCAG 2.2 AA, zero serious/critical, keyboard-only golden journeys, reduced motion | 20 | W3 |
| Visual | Playwright screenshots | desktop + tablet + mobile × EN + AR, against a documented tolerance | 23 | W3 |
| Security | the persona lab | 14 personas × 13 actions × 28 modules, UI and API, reporting ALLOWED / DENIED / UNEXPECTED ACCESS | 21 | W3 |
| Chaos | fault-injecting proxy | API and DB timeouts, disconnects, provider failures, duplicate webhook, expired session, partial response | 23 | W4 |
| Recovery | Playwright + server | lost → fail → retry → success → **no duplicate**; plus a real restore drill | 05 | W5 |
| Large dataset | seeded Postgres | 10k customers, 50k vehicles, 100k appointments, 100k inventory rows | 22 | W3 |
| Performance | Lighthouse CI + k6 | LCP, INP, CLS, TTFB, chunk budgets, API latency | 22 | W3 |

---

## Principles

**Route coverage is generated, not written.** Every registry entry produces its
route check. A capability cannot exist without appearing in coverage, and nobody
maintains hundreds of checks by hand.

**Tests assert behaviour, not rendering.** "Returns 200" is not a test. The
existing 13 behaviour checks are the model: language switch flips direction, RBAC
filters the nav, estimate totals derive from line items, removing an invoice line
recomputes the summary, a technician cannot approve QC, a requisition over the
ceiling escalates.

**The brand guard walks computed styles**, not source. A forbidden colour can
arrive through a class, a variable or an inline style; only the rendered result
proves its absence.

**The mock-to-API swap is proved by the existing suite.** The database seeds from
the same fixtures the app renders today, so every current assertion must still
pass afterwards. A failure means the swap is wrong, not that the test is stale.

**A failing critical golden path blocks release** regardless of any score.

---

## Coverage gates

- ≥ 90% on the rule engine, RBAC and server authorization middleware
- ≥ 70% overall
- 0 product routes rendering a placeholder
- 0 dead CTAs
- 0 serious or critical accessibility violations
- 0 UNEXPECTED ACCESS results in the persona lab
