# SALIS AUTO — Screen Registry Audit

**Date:** 2026-08-29
**Auditor:** W5 Certification Agent
**Branch:** `agent-w5h/certification`

---

## Summary

| Metric | Count |
|--------|-------|
| Registered design screens (`screens.ts`) | 200 |
| Spec-only screens (`spec-screens.ts`) | 235 |
| **Total registered screens** | **435** |
| Design screens with dedicated components | 166 |
| Design screens using `PendingScreen` fallback | 0 |
| Spec screens with dedicated components | 16 |
| Spec screens using `FeatureScreenView` | ~155 |
| Spec screens falling through to `PendingScreen` | ~64 |
| Routes in `index.tsx` (auto-generated from SCREENS) | 200 |
| Spec routes handled by `SpecScreenResolver` | 211 (235 − 24 with `designScreen` set) |
| Orphan screens (registered, no route) | 0 |
| Orphan routes (route exists, no screen) | 0 |

---

## Design Screen Registry (`screens.ts`)

The file declares exactly **200 `ScreenMeta` entries**. Every entry in `SCREENS` is iterated in `AppRoutes()` to generate a `<Route>`, so all 200 have a route by construction.

### Routing Categories

| Category | Count | Mechanism |
|----------|-------|-----------|
| Public screens (`PUBLIC_SCREENS`) | 47 | Rendered without `RequireAccess` wrapper |
| Customer app screens (`CUSTOMER_APP_SCREENS`) | 11 | Wrapped in `RequireAccess` with `shell="customer-app"` |
| App screens (`APP_SCREENS`) | 142 | Wrapped in `RequireAccess` with default shell |
| **Total routed** | **200** | All accounted for |

### Component Implementation Status

Every design screen maps to one of three rendering paths:

1. **`PUBLIC_SCREENS` map** — 47 screens with dedicated lazy-loaded components (auth chain, public portal, standalone portals)
2. **`APP_SCREENS` map** — 142 screens with dedicated lazy-loaded components (workshop, finance, registry, accounting, CRM, AI, admin, UI library, network, call center, meta)
3. **`PendingScreen` fallback** — 0 screens (the comment in `index.tsx` says "Everything in SCREENS not listed here gets a PendingScreen", but in practice 47 + 11 + 142 = 200, covering all entries)

**Result:** All 200 design screens have dedicated React components. None fall through to `PendingScreen`.

---

## Spec Screen Registry (`spec-screens.ts`)

The file declares **235 `SpecScreen` entries** — the full product feature map. Of these:

- **24** have a `designScreen` value linking them to a design screen already routed in `index.tsx` (e.g., `"designScreen": "Appointments"`). The `SpecScreenResolver` filters these out to avoid duplicate routes.
- **211** are spec-only routes handled by the catch-all `<Route path="*" element={<SpecScreenResolver />} />`.

### Spec Screen Implementation Tiers

Within the 211 spec-only routes, the resolver checks three tiers:

| Tier | Count | Description |
|------|-------|-------------|
| `SPEC_CUSTOM_SCREENS` (dedicated component) | 16 | HR screens (9), insurance/warranty/contracts (3), fleet/loaner/towing (4) |
| `FEATURE_DEF_BY_ROUTE` (FeatureScreenView) | ~131 | Data-driven screens with KPI stats, tabs, and table definitions |
| `PendingScreen` fallback | ~64 | Screens with only a name and screenshot, no implementation |

### Custom Spec Screens (16)

| Route | Component |
|-------|-----------|
| `/hr-management` | HRManagement |
| `/staff-directory` | StaffDirectory |
| `/staff-scheduling` | StaffScheduling |
| `/staff-performance-review` | StaffPerformanceReview |
| `/timesheet-management` | TimesheetManagement |
| `/timeclock-payroll` | TimeclockPayroll |
| `/payroll-management` | PayrollManagement |
| `/leave-requests` | LeaveRequests |
| `/training-lms` | TrainingLMS |
| `/insurance-claims` | InsuranceClaims |
| `/warranty-management` | WarrantyManagement |
| `/contract-management` | ContractManagement |
| `/fleet-tracking` | FleetTracking |
| `/loaner-vehicles` | LoanerVehicles |
| `/towing-assistance` | TowingAssistance |
| `/towing-services` | TowingServices |

---

## Route Integrity

### No Orphan Screens

Every entry in `SCREENS` (200) is iterated in the `AppRoutes` component's `.map()` call, which unconditionally produces a `<Route>`. It is structurally impossible for a screen to exist in the registry without a corresponding route.

### No Orphan Routes

The router has only four non-SCREENS routes:

1. `path="/"` — redirects to `/splash`
2. `path="/customer-app"` — redirects to `/customer-app/home`
3. `path="/logout-confirmation"` — explicit (also in SCREENS, so this is a duplicate but not an orphan)
4. `path="/support"` — redirects to `/call-center`
5. `path="*"` — catch-all to `SpecScreenResolver` (handles 211 spec routes + 404)

All four are valid redirects or catch-all handlers. No route points to a non-existent screen.

---

## RBAC Coverage

The `SCREEN_MODULE` map in `rbac-data.ts` maps **107 screen names** to one of **28 RBAC modules**. The `PERMS` object defines access for **14 roles** across these modules.

- **16 screens** are listed in `RBAC_UNGATED` (auth, error, and design-reference screens).
- Screens not in either `SCREEN_MODULE` or `RBAC_UNGATED` default to requiring authentication but have no specific module gate.

---

## Gaps & Observations

1. **~64 spec screens have no implementation** beyond a screenshot and metadata. These render as `PendingScreen` (name + purpose text), which is acceptable for a feature roadmap but means navigation to those routes shows a placeholder.

2. **`/logout-confirmation` is defined twice** — once in the `SCREENS` array and once as an explicit route in `AppRoutes`. No runtime issue (React Router uses the first match), but it's dead code.

3. **`/support` redirects to `/call-center`** — not backed by a screen entry. Acceptable as a convenience redirect.

4. **Spec screens with `designScreen` set** are routed through the main `SCREENS` loop, not through `SpecScreenResolver`. The resolver correctly filters these out via `!s.designScreen`, so there are no duplicate routes.

5. **No cross-tenant isolation gap in routing** — the `RequireAccess` component wraps all authenticated screens. Tenant scoping is handled at the data layer (API + session context), not at the route level.
