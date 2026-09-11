# Release Roadmap

52-week schedule across 8 project phases (2-week sprints, 46 weeks of sprints + 6 weeks buffer), mapped to the pre-launch release train from `0.1.0-alpha` through `1.0.0` go-live, plus the planned post-launch releases. Source: `docs/project-management/pmp/schedule-management.md`, `docs/project-management/planning/release-plan.md`.

Calendar dates below are illustrative only (anchored to an arbitrary kickoff date) — the source of truth is the **week number relative to project kickoff (W1)**, as documented in `schedule-management.md`.

```mermaid
gantt
    title SALIS AUTO Release Roadmap (Week 1 = Kickoff)
    dateFormat YYYY-MM-DD
    axisFormat W%W
    excludes weekends

    section Initiation & Planning
    Initiation (W1-2)              :m1, 2026-01-05, 2w
    Planning (W3-6)                :m2, after m1, 4w

    section Phase 1 - Foundation (W7-12)
    DB schema, auth, RBAC, i18n, CI/CD   :f1, after m2, 6w
    Release 0.1.0-alpha (S3, Auth+RBAC+i18n) :milestone, rel1, after f1, 0d

    section Phase 2 - Core Domains (W13-30)
    Workshop lifecycle (S4-6)      :c1, after f1, 6w
    Release 0.2.0-alpha (Workshop) :milestone, rel2, after c1, 0d
    Registry (S7)                  :c2, after c1, 2w
    Release 0.3.0-alpha (Registry) :milestone, rel3, after c2, 0d
    Finance + ZATCA sandbox (S8-10):c3, after c2, 6w
    Release 0.4.0-alpha (Finance)  :milestone, rel4, after c3, 0d
    Accounting (S11)               :c4, after c3, 2w
    Release 0.5.0-alpha (Accounting):milestone, rel5, after c4, 0d
    Parts & PO lifecycle (S12)     :c5, after c4, 2w
    Release 0.6.0-alpha (Parts)    :milestone, rel6, after c5, 0d

    section Phase 3 - Extended Domains (W31-40)
    CRM, AI, Call Center, HR, Portals :e1, after c5, 10w
    Release 0.7.0-beta (Extended)  :milestone, rel7, after e1, 0d

    section Phase 4 - Integration (W41-46)
    ZATCA prod cert, notifications, reports :i1, after e1, 6w
    Release 0.8.0-beta (Integration) :milestone, rel8, after i1, 0d

    section Phase 5 - Testing & Hardening (W47-50)
    Unit/integration/E2E/RTL/security/a11y/load :t1, after i1, 4w
    Release 0.9.0-beta (Testing)   :milestone, rel9, after t1, 0d

    section Phase 6 - Deployment & Launch (W51-52)
    UAT, cutover prep              :d1, after t1, 1w
    Release 1.0.0-rc.1 (UAT)       :milestone, rel10, after d1, 0d
    Go-live cutover                :d2, after d1, 1w
    Release 1.0.0 - Production Go-Live :milestone, crit, rel11, after d2, 0d

    section Post-Launch
    1.1.0 - fixes, perf, UX polish (GL+4w)      :p1, after rel11, 4w
    1.2.0 - customer feedback-driven (GL+8w)    :p2, after p1, 4w
    1.3.0 - reports, dashboards (GL+12w)        :p3, after p2, 4w
    2.0.0 - mobile, offline, multi-currency (Phase 2) :p4, after p3, 8w
```

## Pre-launch release train

| Version | Stage | Sprint | Content |
|---|---|---|---|
| 0.1.0-alpha | Foundation | S3 | Auth + RBAC + i18n framework |
| 0.2.0-alpha | Core: Workshop | S6 | Workshop lifecycle (Check-In through Delivery) |
| 0.3.0-alpha | Core: Registry | S7 | Customer + Vehicle CRUD + Saudi validations |
| 0.4.0-alpha | Core: Finance | S10 | Invoicing + ZATCA sandbox integration |
| 0.5.0-alpha | Core: Accounting | S11 | Chart of accounts + journal entries |
| 0.6.0-alpha | Core: Parts | S12 | Inventory + PO lifecycle + approval chain |
| 0.7.0-beta | Extended | S17 | CRM, AI, Call Center, HR, Portals |
| 0.8.0-beta | Integration | S20 | ZATCA prod cert + notifications + reports |
| 0.9.0-beta | Testing | S22 | All tests passing, security hardened |
| 1.0.0-rc.1 | Deployment | S23 | Release candidate for UAT |
| **1.0.0** | **Go-Live** | S23 | **Production release** |

## Post-launch release train

| Version | Target | Content |
|---|---|---|
| 1.1.0 | Go-live +4w | Post-launch fixes, performance tuning, UX polish |
| 1.2.0 | Go-live +8w | Customer feedback-driven improvements |
| 1.3.0 | Go-live +12w | Additional report types, dashboard enhancements |
| 2.0.0 | Phase 2 | Native mobile app, offline mode, multi-currency |

## Rollout phases (post-1.0.0)

| Phase | Scope | Duration | Success criteria |
|---|---|---|---|
| Internal dogfooding | Development team only | 1 week | No P1/P2 bugs in daily use |
| Pilot | 2-3 selected workshops | 2 weeks | >= 90% satisfaction; < 5 P3 bugs |
| Early access | 10-15 workshops | 2 weeks | Stable performance under load |
| General availability | All onboarded workshops | Ongoing | SLA metrics met |
