# Frontend Architecture

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-001                               |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

The SALIS AUTO frontend is a single-page React 18.3.1 application built with TypeScript 5.7, bundled by Vite 5.4, and styled with TailwindCSS 3.4. It renders 191+ screens across 13 business domains, supports bilingual EN/AR with full RTL layout, and enforces 14-role RBAC entirely on the client with server-verified parity.

## 2. Provider Chain

The `App.tsx` root composes providers in a strict order. Each layer depends on the one above it and must not be reordered.

```
<QueryClientProvider>          -- server-state cache (60s stale time)
  <PreferencesProvider>        -- i18n locale, theme, RTL direction
    <SessionProvider>          -- auth state, role, demo accounts
      <RepositoryProvider>     -- mock/HTTP data seam
        <ToastProvider>        -- notification queue
          <ModalProvider>      -- shared modal state
            <BrowserRouter>    -- SPA routing (basename from VITE_BASE_PATH)
              <AppRoutes />    -- lazy-loaded route tree
```

### 2.1 QueryClientProvider

Wraps the entire tree. The `QueryClient` is instantiated once with:

- `staleTime: 60_000` -- data considered fresh for 60 seconds
- `refetchOnWindowFocus: false` -- no background refetch on tab focus

### 2.2 PreferencesProvider

Manages UI preferences persisted to `localStorage`:

- **Language**: `en` or `ar`, toggled via the topbar
- **Theme**: light/dark mode
- **RTL**: Automatically derived from the selected language; `ar` sets `dir="rtl"` on the document root

### 2.3 SessionProvider

Holds the authenticated user context:

- Reads `salis-token` and `salis-role` from `localStorage` (mock mode)
- In live mode, stores the JWT access token from `POST /auth/login`
- Exposes `user`, `role`, `isAuthenticated`, and `logout()`
- Registers the access token provider for the repository layer via `setAccessTokenProvider()`

### 2.4 RepositoryProvider

Provides the data layer to all screens. The active repository is selected by `VITE_API_URL`:

- **Unset**: `mockRepository` backed by generated fixture tables
- **Set**: `httpRepository` backed by the REST API with Bearer token auth

Screens consume the repository through `useCollection`, `useEntity`, and mutation hooks -- never by direct import.

### 2.5 ToastProvider and ModalProvider

Thin context providers for notifications and shared modal state. Both render their containers at the provider level so overlays mount above the route tree.

## 3. Routing Architecture

### 3.1 Route Maps

Three distinct route maps serve different user contexts:

| Map                    | Purpose                  | Guard           |
|------------------------|--------------------------|-----------------|
| `APP_SCREENS`          | Main workshop app        | `RequireAccess`  |
| `PUBLIC_SCREENS`       | Auth, errors, legal      | None            |
| `CUSTOMER_APP_SCREENS` | Customer portal          | `RequireAccess`  |

### 3.2 Lazy Loading

Every screen is loaded via `React.lazy()` with dynamic imports:

```typescript
const Dashboard = lazy(() => import('@/screens/Dashboard'))
```

The `RouteLoader` component wraps each lazy import with a `Suspense` boundary that renders a skeleton shimmer during chunk loading.

### 3.3 RequireAccess Guard

The `RequireAccess` component checks the user's role against the `SCREEN_MODULE` mapping (95+ screen-to-module mappings) and the `PERMS` matrix (28 modules x 14 roles). If the user's role lacks `v` (view) permission on the screen's module, they are redirected to `/unauthorized`.

Screens listed in `RBAC_UNGATED` (16 screens including Login, Error404, PrivacyPolicy) bypass the guard entirely.

### 3.4 Generated Navigation

The `nav.ts` generated file defines 15 navigation groups. The sidebar reads these groups and filters them by the active role's permissions, hiding entire sections when a role has no access to any screen in the group.

## 4. State Management

### 4.1 Server State (React Query / TanStack Query)

All server data flows through TanStack Query hooks defined in `useCollection.ts`:

| Hook                  | Purpose                           |
|-----------------------|-----------------------------------|
| `useCollection(key)`  | List rows with search/sort/filter |
| `usePagedCollection`  | Same, keeping pagination envelope |
| `useEntity(key, id)`  | Single record by ULID or code     |
| `useCreate(key)`      | Optimistic create with rollback   |
| `useUpdate(key)`      | Optimistic update + version check |
| `useDelete(key)`      | Optimistic delete with rollback   |
| `useBulk(key)`        | Bulk update/delete                |

Cache keys follow a consistent scheme:

- List: `[collectionKey]` or `[collectionKey, query]`
- Entity: `[collectionKey, 'entity', id]`
- Invalidation: `[collectionKey]` prefix invalidates all views

### 4.2 UI State (React Context)

Ephemeral UI state -- sidebar collapsed, active tab, modal open -- lives in component-local `useState` or domain-specific contexts. It is never persisted to the server.

### 4.3 Persistent Preferences (localStorage)

Keys used:

- `salis-token` -- JWT access token (live mode)
- `salis-role` -- active role identifier (mock mode)
- `salis-lang` -- language preference (`en`/`ar`)
- `salis-theme` -- theme preference (`light`/`dark`)

## 5. Component Organization

### 5.1 Directory Structure

```
app/src/
  components/
    ui/          -- 35+ primitives (Button, Card, DataTable, Modal, Toast, ...)
    shell/       -- layout (AppShell, Sidebar, Topbar, ListPage, DetailPage, ...)
  screens/       -- by domain (accounting/, admin/, crm/, ...)
  data/          -- repository seam, hooks, HTTP client, generated data
  providers/     -- context providers (Session, Preferences, Repository)
  routes/        -- route definitions and guards
  lib/           -- utilities (cn(), useMediaQuery, storage)
```

### 5.2 UI Primitives (`components/ui/`)

35+ reusable components including: `Button`, `Card`, `DataTable`, `Modal`, `Drawer`, `Badge`, `KpiCard`, `Charts`, `CalendarView`, `KanbanView`, `Money`, `Pagination`, `AdvancedFilters`, `ExportCenter`, `ImportCenter`, `ErrorBoundary`, `Timeline`, `ActivityFeed`, `Comments`, `Attachments`, `MediaGallery`, `WorkflowStepper`, `Checklist`, `MapView`, `Toggle`, `Accordion`, `FieldGrid`.

### 5.3 Shell Components (`components/shell/`)

Layout containers that compose UI primitives into standard page patterns:

- `AppShell` -- main layout with sidebar, topbar, content area
- `MobileShell` -- responsive mobile layout
- `ListPage` -- standard list with search, filters, DataTable, pagination
- `DetailPage` -- record detail with header, tabs, activity feed
- `FeatureScreen` -- screen container with breadcrumbs and actions
- `AuthLayout` / `AuthCard` -- authentication flow layout
- `PortalShell` -- portal variant for supplier/customer/technician portals
- `PublicShell` -- unauthenticated public pages

### 5.4 Screen Components (`screens/`)

Organized by business domain. Each screen imports shell components, reads data through `useCollection`/`useEntity`, and writes through mutation hooks. Screens never import mock tables or HTTP clients directly.

## 6. Build Pipeline

### 6.1 Development

```bash
cd app && npm run dev    # Vite dev server with HMR
```

### 6.2 Production Build

```bash
cd app && npm run build  # tsc -b && vite build
```

Vite produces hashed chunks with code splitting at the route level. The `VITE_BASE_PATH` env var sets the base URL for GitHub Pages deployment.

### 6.3 Key Dependencies

| Package             | Version | Purpose                        |
|---------------------|---------|--------------------------------|
| react               | 18.3.1  | UI framework                   |
| typescript           | 5.7     | Type safety                    |
| vite                | 5.4     | Build tool and dev server      |
| tailwindcss         | 3.4     | Utility-first CSS              |
| react-router-dom    | 7.x     | Client-side routing            |
| @tanstack/react-query| Latest | Server state management        |
| clsx + tailwind-merge| Latest | `cn()` utility for class names |

### 6.4 Utility: `cn()`

The `cn()` function in `lib/cn.ts` combines `clsx` (conditional class joining) with `tailwind-merge` (deduplication of conflicting Tailwind classes), providing a single entry point for all className composition.

## 7. Bilingual and RTL Support

- `PreferencesProvider` sets `document.dir` to `rtl` when the language is Arabic
- TailwindCSS RTL utilities (`rtl:` prefix) handle directional layout
- The `ar.ts` generated file carries approximately 2,122 Arabic translation keys
- The `ar-overrides.ts` file provides manual overrides for generated translations
- Every table with user-facing text includes `*_ar` columns (e.g., `nameAr`, `descriptionAr`)

## 8. Error Handling

### 8.1 ErrorBoundary

The `ErrorBoundary` component wraps route content, catching render errors and displaying a recovery UI instead of a blank screen.

### 8.2 Repository Errors

The `RepositoryError` class carries a typed `code` field enabling screens to handle specific failures:

- `version_conflict` -- prompts the user to reload
- `approval_required` -- names the ceiling
- `forbidden` -- final denial
- `network` -- server unreachable
- `not_found` -- record does not exist (or belongs to another tenant)

## Related Documents

- [Backend Architecture](./backend-architecture.md)
- [Data Flow](./data-flow.md)
- [Auth Architecture](./auth-architecture.md)
- [Authorization Matrix](../security/authorization-matrix.md)
