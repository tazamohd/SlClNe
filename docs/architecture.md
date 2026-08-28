# SALIS AUTO — Architecture Overview

SALIS AUTO is a multi-tenant automotive workshop management system. It covers the full lifecycle of a vehicle service — from customer check-in and diagnostics through job execution, invoicing, and delivery — plus CRM, accounting, inventory, a B2B parts network, an AI platform, and several external portals.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI framework | React | 18.3 |
| Language | TypeScript | 5.7 |
| Build tool | Vite | 5.4 |
| Styling | Tailwind CSS | 3.4 |
| State / cache | TanStack React Query | 5.62 |
| Client state | Zustand | 5.0 |
| Routing | React Router | 6.28 |
| Icons | Lucide React | 0.462 |
| Server | Express | 4.21 |
| ORM | Drizzle ORM | 0.36 |
| Database | PostgreSQL (PGlite for dev) | — |
| Auth | JSON Web Tokens (jsonwebtoken) | 9.0 |
| Validation | Zod | 3.24 |
| Testing | Vitest | 2.1 |
| E2E | Playwright | 1.62 |

## Repository Layout

```
├── app/                        # Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Primitives: Button, Card, DataTable, Icon, …
│   │   │   └── shell/          # Layout shells: AppShell, ListPage, Sidebar, …
│   │   ├── data/
│   │   │   ├── generated/      # Auto-generated from design bundle (screens, nav, tables, rbac, ar)
│   │   │   ├── http/           # API client, endpoints map, HTTP repository
│   │   │   ├── repository.ts   # Repository seam (mock ↔ HTTP)
│   │   │   ├── useCollection.ts# React Query hook over the repository
│   │   │   ├── rbac.ts         # Client-side RBAC helpers
│   │   │   └── types.ts        # Domain types (RoleId, ModuleId, ScreenMeta, …)
│   │   ├── lib/                # Utilities: storage, cn(), useMediaQuery
│   │   ├── providers/          # React context providers (Session, Preferences, Repository)
│   │   ├── routes/             # Route definitions + RequireAccess guard
│   │   ├── screens/            # All screen components, grouped by domain
│   │   │   ├── workshop/       # Job cards, check-in, inspection, QC, delivery, …
│   │   │   ├── finance/        # Invoices, payments, invoice create/detail
│   │   │   ├── accounting/     # Chart of accounts, journal entries, reports, …
│   │   │   ├── admin/          # Users, roles, branches, settings, audit, …
│   │   │   ├── auth/           # Login, register, OTP, SSO, password screens, …
│   │   │   ├── crm/            # Leads, opportunities, campaigns, calendar, …
│   │   │   ├── registry/       # Customers, vehicles, appointments, fleets
│   │   │   ├── ai/             # AI assistant, knowledge base, model settings, …
│   │   │   ├── network/        # Parts network, procurement, purchase orders
│   │   │   ├── callcenter/     # Call center queue + logs
│   │   │   ├── website/        # Public portal pages (landing, about, blog, …)
│   │   │   ├── ui/             # Internal UI pattern reference galleries
│   │   │   ├── meta/           # Spec index, native shell mockups
│   │   │   ├── feature/        # Feature-map screens with spec definitions
│   │   │   ├── portals/        # Customer, supplier, technician portals
│   │   │   ├── customer-app/   # Mobile customer app screens
│   │   │   ├── Dashboard.tsx   # Role-adaptive KPI home
│   │   │   └── PendingScreen.tsx  # Placeholder for not-yet-built screens
│   │   ├── App.tsx             # Provider tree + router
│   │   └── main.tsx            # Entry point
│   ├── scripts/                # Build-time scripts (port-design-data, smoke, lint)
│   └── package.json
├── server/                     # Backend API
│   ├── src/
│   │   ├── routes/             # Express route modules (auth, collections)
│   │   ├── auth/               # JWT, RBAC, middleware
│   │   ├── db/                 # Drizzle schema, seed, migrations
│   │   ├── app.ts              # Express app factory
│   │   ├── http.ts             # Error envelope helpers
│   │   ├── env.ts              # Config via Zod-validated env vars
│   │   └── index.ts            # Server entry point
│   ├── drizzle/                # Generated migration files
│   ├── tests/                  # API tests (supertest + vitest)
│   └── package.json
├── project/                    # Design bundle (HTML/CSS/JS prototypes, specs, assets)
│   ├── *.dc.html               # Design canvas files for each screen
│   ├── spec/                   # Product specification documents
│   ├── spec-shots/             # Reference screenshots
│   ├── _ds/                    # Design system (tokens, styles)
│   └── gms-data.js             # Source of truth for generated data
├── chats/                      # Design conversation transcripts
├── .github/workflows/          # CI/CD (GitHub Pages deploy)
├── vercel.json                 # Vercel deployment config
├── netlify.toml                # Netlify deployment config
└── README.md                   # Handoff bundle description
```

## Provider Architecture

The app wraps the component tree in four nested providers, each responsible for a distinct concern:

```
QueryClientProvider          ← React Query cache (staleTime: 60s)
  └─ PreferencesProvider     ← Theme (dark/light), language (en/ar), notifications
       └─ SessionProvider    ← Auth state, RBAC helpers, role-filtered nav
            └─ RepositoryProvider  ← Data source seam (mock ↔ HTTP)
                 └─ ToastProvider  ← Toast notification queue
                      └─ BrowserRouter
                           └─ AppRoutes
```

### PreferencesProvider

Manages UI preferences persisted to `localStorage`:

- **Theme**: `dark` (default) or `light`. Toggles the `dark` class on `<html>`.
- **Language**: `en` or `ar`. Sets `<html lang>` and `<html dir>` (RTL for Arabic).
- **Translation**: `t(source)` looks up Arabic translations from the generated dictionary (`AR`) with manual overrides (`AR_OVERRIDES`), falling back to the English source string.

### SessionProvider

Holds the current user's role and exposes RBAC queries:

- `can(module, action)` — checks the permission matrix
- `canScreen(screen)` — checks if the role can access a screen
- `canApprove(amountSar?)` — checks the role's approval ceiling
- `fieldHidden(field)` — checks field-level visibility rules
- `nav` — sidebar navigation filtered to the role's permissions

Currently reads the role from `localStorage` (demo login). In production, reads JWT claims (`sub`, `role`, `org_id`, `branch_id`, `scope`).

### RepositoryProvider

The seam between screens and data. Screens call `useCollection('jobs')` and never know whether data comes from in-memory fixtures or an HTTP API.

- **Default**: `mockRepository` — static fixture data from the design bundle
- **HTTP mode**: Set `VITE_API_BASE_URL` to point at the server; the provider dynamically imports `ApiClient` and `createHttpRepository`

## Data Layer

### Repository Seam

```
Screen → useCollection(key) → RepositoryProvider → Repository.collection.list()
                                                          │
                                          ┌───────────────┼───────────────┐
                                          │                               │
                                   mockRepository                  httpRepository
                                   (fixture data)              (ApiClient → server)
```

The `Repository` interface defines 31 collections (vehicles, invoices, jobs, customers, etc.). Each collection exposes a `list()` method returning `Promise<readonly TRow[]>`.

`useCollection` is a thin React Query wrapper that caches results with a key derived from the collection name and a stable repository identity, so the cache invalidates cleanly when the backing implementation changes.

### HTTP Client

`ApiClient` follows the server's REST conventions:

- Bearer token authentication via `Authorization` header
- Query parameters: `?page&pageSize&sort=field:dir&q=text&filter[field]=value`
- Error envelope: `{error: {code, message, field?}}`
- `ApiError` class with `isAuthFailure` for 401/403 handling

### Endpoint Map

`ENDPOINTS` in `app/src/data/http/endpoints.ts` maps every `CollectionKey` to its REST path or `null` when the API doesn't serve that collection yet. Collections without endpoints (e.g. `invoiceLines`, diagnostic sub-resources) throw `MissingEndpointError` at runtime — loud by design, so demo data never leaks to production.

## Authentication & Authorization

### JWT Flow

1. `POST /auth/login` — validates email + password, returns `{accessToken, refreshToken, user}`
2. Access token embeds claims: `{sub, role, org_id, branch_id, scope}`
3. Access token TTL: 15 minutes (configurable via `ACCESS_TOKEN_TTL`)
4. `POST /auth/refresh` — rotates the refresh token (revoke-old, issue-new pattern)
5. Refresh token TTL: 14 days (configurable via `REFRESH_TOKEN_TTL`)
6. `POST /auth/logout` — revokes the refresh token
7. `GET /auth/me` — returns the current user (requires valid access token)

### RBAC

The system defines **14 roles** and **28 permission modules**:

**Roles**: Owner, Super Admin, Manager, Service Advisor, Technician, QC Inspector, Parts Manager, Accountant, HR Manager, Front Desk, Call Center Agent, Procurement Officer, Supplier, Customer

**Actions**: `v` (view), `c` (create), `e` (edit), `x` (delete), `a` (approve)

**Data scopes**: `platform`, `all`, `org`, `branch`, `own`, `self`, `assigned`, `external`

The permission matrix maps each module × role to a string of allowed actions (e.g. `"vcex"` means view, create, edit, delete). An empty string means the module is hidden from that role.

On the server, every data endpoint runs `requireAuth` then `requireModule(module, action)`. On the client, `canScreen()` drives route guards and `navFor(role)` filters the sidebar.

### Multi-tenancy

Users belong to an organization (`org_id`) and branch (`branch_id`). The JWT carries both, enabling tenant isolation at the API level. Data scopes determine row-level visibility.

## Routing

### Registry-Driven Routes

Routes are generated from the `SCREENS` array (191 entries, sourced from `project/gms-data.js`). The router in `app/src/routes/index.tsx` iterates this array and assigns each screen to one of three categories:

1. **Public screens** — render without AppShell or role checks (auth chain, marketing pages, external portals)
2. **Customer app screens** — render inside `CustomerAppShell` (mobile 430px frame with bottom tab bar)
3. **App screens** — render inside `AppShell` with RBAC guard via `RequireAccess`

Screens not yet implemented fall back to `PendingScreen`, which shows the screen's name and purpose — the navigation never dead-ends.

### Code Splitting

Every screen is loaded via `React.lazy` with dynamic imports. The initial bundle contains only the shell, router, and screen map. Named exports are re-wrapped into the `{ default }` shape `React.lazy` requires.

### Route Guard

`RequireAccess` performs two checks:

1. Not signed in → redirect to `/login` (with return path in state)
2. Signed in but role lacks module access → redirect to `/unauthorized`

This is a UX convenience, not a security boundary — the API re-checks every request.

## Navigation

The sidebar is defined in `app/src/data/generated/nav.ts` as 14 groups:

| Group | Icon | Screens |
|-------|------|---------|
| Overview | Home | Dashboard |
| Operations | Wrench | Job Cards, Appointments, Calendar, Estimates, Customer Approval |
| Customers & Vehicles | Users | Customers, Vehicles, Feedback, Fleet Management |
| Inventory | Package | Inventory, Parts Supply Network, Parts Network |
| Team | HardHat | Technicians, Schedule, HR & Payroll, Knowledge Base |
| Finance | CreditCard | Invoices, Payments, Reports, Reports & Analytics |
| System | Settings | Subscription, Notifications, Search, Settings, Backup, Profile, Diagnostics, … |
| CRM & Marketing | Target | Lead Pipeline, Opportunities, Campaigns, Segments, Email/SMS/WhatsApp, Calendar |
| Accounting | Calculator | Chart of Accounts, Journal Entries, Expenses, Tax, Bank Reconciliation, … |
| Reports & Analytics | BarChart3 | Executive, Operational, Workshop, Inventory, Sales, Insurance, Loan, Custom, BI |
| Administration | Shield | Organizations, Branches, Departments, Users & Teams, Roles, Integrations, … |
| AI Platform | Sparkles | AI Assistant, Prompt Library, Knowledge Base, Workflow Builder, Agents, … |
| Portals | Building2 | Technician, Customer, Supplier, Procurement, Call Center, Kiosk, Super Admin |
| Design Reference | Boxes | Screen Index, Flow Spec, UI pattern galleries |

Each group's items are filtered by `navFor(role)` before rendering, so roles only see modules they can access.

## Deployment

Three deployment targets are configured:

### GitHub Pages
- Workflow: `.github/workflows/deploy-pages.yml`
- Triggers on push to `main` or manual dispatch
- Builds `app/` with `VITE_BASE_PATH` set to the repo name
- Deploys via `actions/deploy-pages@v4`

### Vercel
- Config: `vercel.json`
- Build: `cd app && npm install && npm run build`
- Output: `app/dist`
- SPA fallback: all routes rewrite to `/index.html`

### Netlify
- Config: `netlify.toml`
- Build base: `app/`, command: `npm run build`, publish: `dist`
- SPA fallback: `/* → /index.html` (200 redirect)

## Internationalization

The app supports English and Arabic (RTL). The `PreferencesProvider` sets `<html dir="rtl">` for Arabic and provides a `t()` function for string translation:

1. Generated dictionary: `app/src/data/generated/ar.ts` — extracted from the design bundle
2. Override dictionary: `app/src/data/ar-overrides.ts` — manual translations for rebuilt copy
3. Fallback: the English source string is returned when no Arabic translation exists

## Design System Origin

The codebase originated as a handoff from Claude Design. The `project/` directory contains HTML/CSS/JS prototypes (`.dc.html` files) for each screen, both desktop and mobile variants. A build script (`scripts/port-design-data.mjs`) extracts structured data from `project/gms-data.js` into the `app/src/data/generated/` files:

- `screens.ts` — 191 screen definitions with routes and purposes
- `nav.ts` — sidebar navigation structure
- `tables.ts` — fixture data for all collections
- `rbac.ts` — roles, permission matrix, field rules, segregation of duties
- `badges.ts` — status badge color mappings
- `ar.ts` — Arabic translation dictionary
