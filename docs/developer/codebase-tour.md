# SALIS AUTO -- Codebase Tour

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Project Root Structure

The repository is a monorepo with three top-level directories:

```
salis-auto/
  app/                  # Frontend -- React 18 SPA (Vite + TypeScript + TailwindCSS)
  server/               # Backend -- Fastify REST API (Drizzle ORM + PostgreSQL/PGlite)
  project/              # Design bundle -- .dc.html prototypes and gms-data.js source of truth
  docs/                 # Documentation -- architecture, system, developer guides
  .github/              # CI/CD workflows (GitHub Actions)
  vercel.json           # Vercel deployment config
  netlify.toml          # Netlify deployment config
```

- **`app/`** is the primary workspace for frontend developers. This is where screens, components, hooks, and the data layer live.
- **`server/`** is the backend workspace. Routes, middleware, Drizzle schema, and migrations live here.
- **`project/`** contains the design data pipeline. The `gms-data.js` file is the single source of truth for screen definitions, RBAC, navigation, fixture data, and Arabic translations. Changes here flow into `app/src/data/generated/` via `npm run port-design`.

---

## 2. Frontend Structure (`app/src/`)

```
app/src/
  components/
    ui/                 # 35+ reusable primitives (Button, DataTable, Modal, Badge, KpiCard, etc.)
    shell/              # Layout containers (AppShell, ListPage, DetailPage, FeatureScreen, etc.)
  screens/              # Screen components organized by domain (13 directories)
    workshop/           # Workshop Operations (Job Cards, Check-In, QC Gate, etc.)
    registry/           # Customers & Vehicles
    finance/            # Invoices, Payments
    accounting/         # Chart of Accounts, Journal Entries, Expenses
    crm/                # Lead Pipeline, Opportunities, Campaigns
    admin/              # Users, Roles, Branches, Settings, Audit Log
    auth/               # Login, Register, OTP, 2FA
    ai/                 # AI Assistant, Knowledge Base, AI Agents
    network/            # Parts & Inventory, Supply Network (listed as "parts" in nav)
    callcenter/         # Call Center Queue, Call Logs
    reports/            # Reports & Analytics (feature screens only)
    hr/                 # Technicians, HR (feature screens only)
    portals/            # Portal screens
    customer-app/       # Customer-facing mobile app screens
    website/            # Public marketing pages
    feature/            # Shared FeatureScreen renderer and definitions
    ui/                 # UI pattern galleries (design reference)
    meta/               # Spec viewers (design reference)
  data/
    generated/          # Auto-generated files (DO NOT EDIT DIRECTLY)
    http/               # HTTP client and endpoint mapping
  providers/            # React context providers
  hooks/                # Shared custom hooks
  routes/               # Route definitions and guards
  lib/                  # Utilities (cn(), useMediaQuery, storage)
```

---

## 3. Key File Deep-Dives

### 3.1 RBAC Definitions (`app/src/data/generated/rbac.ts`)

This is the authorization backbone of the frontend. It defines:

- **14 Roles**: Owner, General Manager, Branch Manager, Service Manager, Service Advisor, Lead Technician, Technician, Parts Manager, Accountant, Finance Manager, HR Manager, Marketing Manager, Call Center Agent, Customer
- **28 Permission Modules**: Each module maps to a functional area (e.g., `jobcards`, `invoices`, `customers`, `accounting`, `hr`, `ai`)
- **PERMS Matrix**: A role-by-module grid where each cell contains permission flags: `v` (view), `c` (create), `e` (edit), `d` (delete), `x` (export), `a` (approve)
- **SCREEN_MODULE**: Maps 95+ screen identifiers to their permission module
- **RBAC_UNGATED**: Lists 16 screens that bypass permission checks (Login, Error404, PrivacyPolicy, etc.)
- **FIELD_RULES**: Defines field-level visibility per role (e.g., Technicians cannot see financial fields)
- **Separation of Duties (SOD)**: Rules preventing the same person from both creating and approving (e.g., estimate creator cannot be the approver)

### 3.2 Route Definitions (`app/src/routes/index.tsx`)

Contains three route maps:

| Map | Purpose | Auth Guard |
|-----|---------|------------|
| `APP_SCREENS` | Main workshop app (~130 routes) | `RequireAccess` (RBAC-gated) |
| `PUBLIC_SCREENS` | Auth, errors, legal pages (~35 routes) | None |
| `CUSTOMER_APP_SCREENS` | Customer portal (11 routes) | `RequireAccess` |

Every screen is lazy-loaded via `React.lazy()` with a `Suspense` boundary that renders a skeleton shimmer during chunk loading.

### 3.3 Provider Hierarchy (`app/src/App.tsx`)

Providers are composed in a strict order. Each layer depends on the one above it:

```
QueryClientProvider          -- TanStack Query cache (60s stale time)
  PreferencesProvider        -- Language (en/ar), theme, RTL direction
    SessionProvider          -- Auth state, current role, demo mode
      RepositoryProvider     -- Mock vs HTTP data seam
        ToastProvider        -- Notification queue
          ModalProvider      -- Shared modal state
            BrowserRouter    -- SPA routing
              AppRoutes      -- Lazy-loaded route tree
```

Never reorder these providers. Adding a new provider requires Tech Lead approval.

### 3.4 Generated Navigation (`app/src/data/generated/nav.ts`)

Defines 15 navigation groups that populate the sidebar. The sidebar reads these groups and filters them by the active role's permissions, hiding entire sections when a role has no access to any screen in the group.

### 3.5 Fixture Data (`app/src/data/generated/tables.ts`)

Contains fixture data for all 31 collections with Saudi-specific context: SAR currency amounts, Saudi license plates, +966 phone numbers, and Saudi city names (Riyadh, Jeddah, Dammam). This data drives the `mockRepository` and serves as demo data.

### 3.6 Arabic Translations (`app/src/data/generated/ar.ts`)

Approximately 2,122 Arabic translation keys generated from `gms-data.js`. Manual overrides live in `app/src/data/ar-overrides.ts` and take precedence. The `t()` function checks: override dictionary, then generated dictionary, then returns the English source string.

---

## 4. Data Layer: Repository Seam Pattern

The frontend never imports HTTP clients or mock tables directly. All data access passes through `RepositoryProvider`:

```
Screen Component
  -> useCollection(key) / useEntity(key, id)
    -> RepositoryProvider
      -> Repository.collection.list() / .get()
        +-- mockRepository (fixture data from generated tables)
        +-- httpRepository (ApiClient -> Fastify server -> Drizzle -> PostgreSQL)
```

The active implementation is selected by the `VITE_API_BASE_URL` environment variable:

| `VITE_API_BASE_URL` | Repository | Backing Store |
|----------------------|------------|---------------|
| Unset | `mockRepository` | In-memory fixture tables |
| Set | `httpRepository` | REST API with Bearer token auth |

### 4.1 TanStack Query Hooks

| Hook | Purpose |
|------|---------|
| `useCollection(key)` | List rows with search/sort/filter |
| `usePagedCollection` | Same, with pagination envelope |
| `useEntity(key, id)` | Single record by ULID or code |
| `useCreate(key)` | Optimistic create with rollback |
| `useUpdate(key)` | Optimistic update + version check |
| `useDelete(key)` | Optimistic delete with rollback |
| `useBulk(key)` | Bulk update/delete |

Cache configuration: `staleTime: 60_000` (60 seconds), `refetchOnWindowFocus: false`.

### 4.2 HTTP Client (`app/src/data/http/`)

The `ENDPOINTS` object maps 46 collection keys to URL path segments (e.g., `customers` -> `/customers`, `jobCards` -> `/job-cards`). The HTTP client automatically sets `Authorization: Bearer <token>`, adds `Idempotency-Key` on POST, and sends `If-Match-Version` on PATCH for optimistic concurrency.

---

## 5. The 13 Domains

Each domain maps to a directory under `app/src/screens/` and one or more RBAC modules:

| # | Domain | Directory | RBAC Modules | Screens |
|---|--------|-----------|-------------|---------|
| 1 | Workshop (Operations) | `workshop/` | `jobcards`, `appointments`, `estimates`, `checkin`, `inspection`, `qc`, `delivery` | ~20 |
| 2 | Registry (Customers & Vehicles) | `registry/` | `customers`, `vehicles`, `feedback` | ~22 |
| 3 | Finance | `finance/` | `invoices`, `payments` | ~6 |
| 4 | Accounting | `accounting/` | `accounting` | ~25 |
| 5 | CRM & Marketing | `crm/` | `crm` | ~12 |
| 6 | Administration | `admin/` | `admin`, `settings`, `integrations` | ~27 |
| 7 | Authentication | `auth/` | (public, no RBAC) | ~8 |
| 8 | AI Platform | `ai/` | `ai` | ~13 |
| 9 | Parts & Inventory | `network/` | `inventory`, `network`, `procurement` | ~18 |
| 10 | Call Center | `callcenter/` | `callcenter` | ~4 |
| 11 | Reports & Analytics | (feature screens) | `reports` | ~14 |
| 12 | Team & HR | (feature screens) | `technicians`, `hr` | ~14 |
| 13 | Portals | `portals/`, `customer-app/` | `portals` | ~25 |

---

## 6. Component Patterns

### 6.1 Two Screen Types

**Custom Screens (~63)**: Hand-built React components with full UI designs. These import shell components (`ListPage`, `DetailPage`), read data through hooks, and compose UI primitives.

**Feature Screens (~157)**: Data-driven screens rendered by the shared `FeatureScreenView` component. Each is defined by a `FeatureDef` entry in `app/src/screens/feature/definitions.ts` that declares KPI stats, tab bars, and table sections. No custom component is needed.

Screens not yet implemented render `PendingScreen`, which displays the screen name and purpose so navigation never dead-ends.

### 6.2 Shell Components

| Component | Purpose |
|-----------|---------|
| `AppShell` | Main layout with sidebar, topbar, content area |
| `MobileShell` | Responsive mobile layout |
| `ListPage` | Standard list with search, filters, DataTable, pagination |
| `DetailPage` | Record detail with header, tabs, activity feed |
| `FeatureScreen` | Screen container with breadcrumbs and actions |
| `AuthLayout` / `AuthCard` | Authentication flow layout |
| `PortalShell` | Portal variant for supplier/customer/technician portals |
| `CustomerAppShell` | 430px mobile frame with bottom tab bar |

### 6.3 UI Primitives (`components/ui/`)

35+ reusable components: `Button`, `Card`, `DataTable`, `Modal`, `Drawer`, `Badge`, `KpiCard`, `Charts`, `CalendarView`, `KanbanView`, `Money`, `Pagination`, `AdvancedFilters`, `ExportCenter`, `ImportCenter`, `ErrorBoundary`, `Timeline`, `ActivityFeed`, `Comments`, `Attachments`, `MediaGallery`, `WorkflowStepper`, `Checklist`, `MapView`, `Toggle`, `Accordion`, `FieldGrid`.

---

## 7. State Management

| State Type | Solution | Examples |
|------------|----------|---------|
| Server state | TanStack Query | Collection lists, entity details, mutations |
| Auth state | `SessionProvider` context | Current user, role, JWT token, demo mode |
| UI preferences | `PreferencesProvider` context + localStorage | Language (en/ar), theme (light/dark), RTL |
| Data source | `RepositoryProvider` context | Mock vs HTTP repository selection |
| Ephemeral UI | Component-local `useState` | Sidebar collapsed, active tab, modal open |

---

## 8. Styling

- **TailwindCSS 3.4** -- Utility-first CSS with the `cn()` helper (combines `clsx` + `tailwind-merge`)
- **RTL support** -- CSS logical properties (`margin-inline-start`, `padding-inline-end`) and Tailwind `rtl:` prefix
- **Design tokens** -- Color palette, spacing, typography defined in Tailwind config
- **No CSS-in-JS** -- All styling is Tailwind utilities or plain CSS

---

## 9. Backend Structure (`server/src/`)

```
server/src/
  routes/               # API route handlers (collection routes + bespoke modules)
  db/                   # Drizzle ORM schema and migrations
  middleware/           # Fastify middleware (auth, rate limiting, CORS)
  services/             # Business logic layer
  utils/                # Shared utilities
  http/                 # Error factories, idempotency
  audit/                # Append-only audit system
```

### 9.1 Middleware Pipeline

Every authenticated request passes through:

```
Helmet (CSP, security headers)
  -> CORS (origin validation)
    -> Rate Limiter (orgId:IP budget)
      -> onRequest (JWT verification -> Principal)
        -> Route Handler
          -> onSend (x-request-id header)
```

### 9.2 Collection Engine

Every data collection is described by a `CollectionDef` in `server/src/routes/collections.ts`. The `registerCollectionRoutes()` function auto-generates CRUD endpoints (GET list, GET detail, POST create, PATCH update, DELETE, bulk operations, CSV export) for each definition.

### 9.3 Six-Step CRUD Pipeline

Every mutation follows: **Authorize** -> **Open Tenant Transaction** -> **Validate** -> **Apply** -> **Audit** -> **Present**. See [Backend Architecture](../system/architecture/backend-architecture.md) for details.

### 9.4 Bespoke Route Modules

Entities with lifecycle logic have dedicated routers: `invoices.ts`, `estimates.ts`, `workshop.ts`, `procurement.ts`, `insurance-claims.ts`, `payroll.ts`, `leave.ts`, `bank.ts`, `obd.ts`, `inventory.ts`, `crm.ts`, `approvals.ts`, `fleets.ts`, `public.ts`.

---

## 10. Generated Code (`app/src/data/generated/`)

These files are auto-generated by `npm run port-design` from `project/gms-data.js`. **Never edit them directly.**

| File | Content | Entries |
|------|---------|---------|
| `screens.ts` | Screen definitions with routes and purposes | 191 |
| `nav.ts` | Sidebar navigation groups | 15 |
| `tables.ts` | Fixture data for all collections | 31 |
| `rbac.ts` | Roles, PERMS matrix, field rules, SOD | 14 roles x 28 modules |
| `badges.ts` | Status badge color palettes | -- |
| `ar.ts` | Arabic translation entries | ~2,122 |

To regenerate: `cd app && npm run port-design`

---

## 11. Where to Find Things

### "I need to add a new screen"

1. Define the screen in `project/gms-data.js`, run `npm run port-design` to regenerate `screens.ts`, `nav.ts`, and related files
2. Create the component in the appropriate domain folder under `app/src/screens/<domain>/`
3. Register the route in `app/src/routes/index.tsx` with a lazy import and route mapping
4. Map the screen to a permission module in `SCREEN_MODULE` (in `rbac.ts`)
5. Alternatively, for data-driven screens: add a `FeatureDef` entry in `app/src/screens/feature/definitions.ts` -- no custom component needed

### "I need to modify RBAC"

1. Edit role definitions or permission matrix entries in `project/gms-data.js`
2. Run `cd app && npm run port-design` to regenerate `rbac.ts`
3. Verify the `PERMS` matrix, `SCREEN_MODULE` mappings, and `FIELD_RULES` in the generated output
4. Add seed user credentials in the server's seed data if adding a new role
5. Test with the affected roles by switching in the demo login screen

### "I need to add an API endpoint"

1. Define the Drizzle table in `server/src/db/schema.ts`
2. Generate and apply the migration: `cd server && npm run db:generate && npm run db:migrate`
3. Add a `CollectionDef` entry in `server/src/routes/collections.ts` with path, module, table, columns, and searchable fields
4. Map the frontend endpoint in `app/src/data/http/endpoints.ts`
5. Add the collection type to the `Repository` interface in `app/src/data/repository.ts`
6. Add fixture data in `app/src/data/generated/tables.ts` (via `gms-data.js` + `port-design`)

### "I need to add a translation"

1. Generated translations: edit `project/gms-data.js` and run `npm run port-design`
2. Manual overrides: add to `app/src/data/ar-overrides.ts` (takes precedence over generated)
3. Use `t('key')` in components -- never hardcode user-facing strings

### "I need to add a new bespoke route"

1. Create a new route module in `server/src/routes/<domain>.ts`
2. Follow the six-step CRUD pipeline: authorize, tenant transaction, validate, apply, audit, present
3. Register the route in `server/src/app.ts` under the `/api/v1` prefix
4. Add Zod schemas for request/response validation

---

## Related Documents

- [Onboarding Guide](./onboarding-guide.md) -- First-week checklist and setup
- [Contributing Guide](./contributing-guide.md) -- PR process and code review
- [Coding Standards](../system/coding-standards.md) -- TypeScript conventions
- [Frontend Architecture](../system/architecture/frontend-architecture.md) -- Provider chain, routing, state
- [Backend Architecture](../system/architecture/backend-architecture.md) -- Middleware, CRUD engine, tenant isolation
- [Data Flow](../system/architecture/data-flow.md) -- Repository seam, read/write paths
- [Domain Reference](../domains.md) -- All 13 domains and 220+ screens
