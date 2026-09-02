# SALIS AUTO — ADR-001: React 18 Single-Page Application over Next.js/SSR

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-001                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal — Confidential      |

## Status

Accepted

## Context

SALIS AUTO is a multi-tenant automotive workshop management SaaS platform targeting the Saudi Arabian market. The frontend must render 191+ screens across 13 business domains (workshop, CRM, accounting, HR, inventory, procurement, insurance, fleet, diagnostics, and more), support 14 RBAC roles with fine-grained permission matrices spanning 28 modules, and provide bilingual EN/AR interfaces with full RTL layout support.

The application is authentication-gated — every screen except login, error pages, and public legal pages requires a valid session. There is no public-facing content that benefits from search engine indexing. The platform serves B2B workshop operators, not end consumers discovering the product through organic search.

Several architectural forces shaped this decision:

1. **PGlite compatibility**: The development workflow relies on PGlite (PostgreSQL compiled to WASM) running in the browser for zero-install local development. This requires a client-side JavaScript runtime capable of hosting an in-process database, which is fundamentally incompatible with server-side rendering approaches.

2. **Real-time dashboard interactions**: Workshop dashboards, job card Kanban boards, appointment calendars, and financial KPI cards demand rich client-side interactivity with optimistic updates, drag-and-drop, and complex filter/sort/search state management.

3. **Repository seam pattern**: The data layer uses a repository abstraction that switches between `mockRepository` (in-memory fixtures or PGlite) and `httpRepository` (REST API) based on the `VITE_API_URL` environment variable. This seam operates entirely on the client side.

4. **Deployment simplicity**: The platform targets multiple deployment targets — GitHub Pages, Vercel, Netlify — all of which serve static files. A static SPA build (`vite build` producing hashed chunks) deploys identically across all targets with no server runtime dependency.

5. **Team composition**: The development team has deep React and TypeScript expertise. The component library (35+ UI primitives, 8+ shell components) is built on React patterns — hooks, context providers, lazy loading, and Suspense boundaries.

## Decision

Adopt React 18.3.1 as a client-rendered single-page application, bundled by Vite 5.4, with the following technology stack:

| Package              | Version | Role                                       |
|----------------------|---------|---------------------------------------------|
| react                | 18.3.1  | UI framework                                |
| typescript           | 5.7     | Type safety across all frontend code        |
| vite                 | 5.4     | Build tool and development server with HMR  |
| tailwindcss          | 3.4     | Utility-first styling with RTL via `rtl:` prefix |
| react-router-dom     | 7.x     | Client-side routing                         |
| @tanstack/react-query| Latest  | Server state management (60s stale time)    |
| clsx + tailwind-merge| Latest  | `cn()` utility for class name composition   |

The application bootstraps through a strict provider chain in `App.tsx`. Each layer depends on the one above it and must not be reordered:

```
QueryClientProvider          -- server-state cache (60s stale time)
  PreferencesProvider        -- i18n locale, theme, RTL direction
    SessionProvider          -- auth state, role, demo accounts
      RepositoryProvider     -- mock/HTTP data seam
        ToastProvider        -- notification queue
          ModalProvider      -- shared modal state
            BrowserRouter    -- SPA routing (basename from VITE_BASE_PATH)
              AppRoutes      -- lazy-loaded route tree
```

### Routing Architecture

Three distinct route maps serve different user contexts:

| Map                    | Purpose              | Guard            |
|------------------------|----------------------|------------------|
| `APP_SCREENS`          | Main workshop app    | `RequireAccess`  |
| `PUBLIC_SCREENS`       | Auth, errors, legal  | None             |
| `CUSTOMER_APP_SCREENS` | Customer portal      | `RequireAccess`  |

The `RequireAccess` guard checks the user's role against the `SCREEN_MODULE` mapping (95+ screen-to-module mappings) and the `PERMS` matrix (28 modules x 14 roles). Screens listed in `RBAC_UNGATED` (16 screens including Login, Error404, PrivacyPolicy) bypass the guard. Every screen is loaded via `React.lazy()` with dynamic imports, and the `RouteLoader` component wraps each with a `Suspense` boundary rendering skeleton shimmers during chunk loading.

### Data Access

All data access flows through TanStack Query hooks defined in `useCollection.ts`:

| Hook                 | Purpose                           |
|----------------------|-----------------------------------|
| `useCollection(key)` | List rows with search/sort/filter |
| `usePagedCollection` | List with pagination envelope     |
| `useEntity(key, id)` | Single record by ULID or code     |
| `useCreate(key)`     | Optimistic create with rollback   |
| `useUpdate(key)`     | Optimistic update + version check |
| `useDelete(key)`     | Optimistic delete with rollback   |
| `useBulk(key)`       | Bulk update/delete                |

Screens consume the repository through these hooks — never by importing HTTP clients or mock tables directly. Cache keys follow the pattern `[collectionKey]` for lists and `[collectionKey, 'entity', id]` for entities. Mutation hooks invalidate the `[collectionKey]` prefix to refresh all list views for the affected collection.

## Consequences

### Positive

- **PGlite runs natively**: The SPA architecture allows PGlite (PostgreSQL WASM) to run in the browser process, enabling a zero-install development experience where frontend developers need only Node.js and npm.
- **Static deployment**: The production build produces hashed static files deployable to any CDN or static hosting service (GitHub Pages, Vercel, Netlify) without a server runtime. The `VITE_BASE_PATH` environment variable adapts the base URL per target.
- **Full client-side control**: Complex interactions — Kanban drag-and-drop on job cards, calendar views for appointments, multi-step workflow steppers, optimistic CRUD with rollback — are implemented without SSR hydration mismatches or serialization boundaries.
- **Code splitting at route level**: Each of the 191+ screens loads on demand via `React.lazy()`, keeping the initial bundle size manageable. The `RouteLoader` component wraps each lazy import with a Suspense boundary displaying skeleton shimmers during chunk loading.
- **Simplified error handling**: The `ErrorBoundary` component catches render errors at the route level. `RepositoryError` with typed codes (`version_conflict`, `approval_required`, `forbidden`, `network`, `not_found`) enables precise error recovery in each screen.
- **Mature ecosystem**: React 18's concurrent features, the TanStack Query caching layer, and the TailwindCSS utility framework have broad community support, extensive documentation, and proven production stability.

### Negative

- **No server-side rendering for SEO**: Search engines cannot index the application content. This is acceptable because the entire application is behind authentication — there is no public content to index. The public marketing site, if needed, would be a separate static site.
- **Larger initial JavaScript payload**: The client must download React, the routing library, TanStack Query, and the base application shell before rendering the first screen. This is mitigated by Vite's code splitting (route-level chunks) and hashed asset caching.
- **Client bears rendering cost**: All HTML generation happens in the browser. On low-powered devices, initial render may be slower than a pre-rendered SSR response. TanStack Query's 60-second stale time and disabled `refetchOnWindowFocus` reduce unnecessary re-renders.
- **Deep linking requires SPA fallback**: All deployment targets must configure URL rewriting (e.g., `/* -> /index.html` on Netlify, `rewrites` in `vercel.json`) so that direct navigation to nested routes works correctly.

### Neutral

- **Authentication flow is client-managed**: The `SessionProvider` reads JWT tokens from localStorage (`salis-token`) and registers an access token provider for the HTTP repository. Token refresh (`POST /auth/refresh`) and logout (`POST /auth/logout`) are handled entirely on the client. This is neither an advantage nor disadvantage — it is a natural fit for SPA architecture.
- **Bilingual support is client-side**: The `PreferencesProvider` manages language switching between EN/AR, setting `document.dir` to `rtl` for Arabic. The approximately 2,122 Arabic translation keys in `ar.ts` plus manual overrides in `ar-overrides.ts` are bundled into the client. A server-rendered approach would not meaningfully change this pattern.

## Alternatives Considered

### Next.js with App Router (SSR/SSG)

Next.js was evaluated as the most mature React-based SSR framework. It was rejected for several reasons:

- **SSR adds no value**: Every screen requires authentication. There is no public content benefiting from server-side pre-rendering or static generation. The SSR overhead (server runtime, hydration, serialization boundaries) adds complexity without corresponding benefit.
- **PGlite incompatibility**: PGlite runs as a WASM module in the browser. Next.js server components execute on the Node.js server, where PGlite's browser-based development mode cannot function. The repository seam pattern — switching between `mockRepository` and `httpRepository` based on `VITE_API_URL` — operates at the client level and does not map to the Next.js server/client component boundary.
- **Deployment complexity**: Next.js requires a Node.js runtime for SSR or edge functions for streaming. SALIS AUTO's deployment targets (GitHub Pages, Vercel static, Netlify static) favor a pure static build. While Vercel supports Next.js natively, tying the platform to a single hosting provider was undesirable.
- **Hydration complexity**: With 191+ screens, 35+ UI primitives, and complex state management (TanStack Query cache, context-based session/preferences/repository providers), SSR hydration mismatches would be a persistent debugging burden.

### Vue.js 3 (Composition API)

Vue 3 with the Composition API and Vite was considered. It was rejected because:

- **Smaller component ecosystem**: The breadth of production-grade React component libraries (data tables, calendars, Kanban boards, rich text editors) exceeds what is available in the Vue ecosystem, particularly for RTL-aware enterprise UI patterns. SALIS AUTO uses 35+ UI primitives (`Button`, `Card`, `DataTable`, `Modal`, `Drawer`, `Badge`, `KpiCard`, `Charts`, `CalendarView`, `KanbanView`, `Money`, `Pagination`, `AdvancedFilters`, `ExportCenter`, `ImportCenter`, `Timeline`, `ActivityFeed`, `Comments`, `Attachments`, `MediaGallery`, `WorkflowStepper`, `Checklist`, `MapView`, and more) — React's ecosystem provides the widest selection of battle-tested equivalents.
- **Team expertise**: The development team has deeper experience with React hooks, context patterns, and the TanStack ecosystem. Adopting Vue would impose a ramp-up period without compensating technical advantages for this use case.
- **TanStack integration**: TanStack Query and TanStack Router are React-first libraries. While Vue adapters exist, they lag in feature parity and community support.

### Angular 17+

Angular was considered briefly and rejected:

- **Heavier framework overhead**: Angular's module system, dependency injection, and decorator-based patterns add boilerplate that is disproportionate for a team building a greenfield SPA with a clear component architecture. The provider chain pattern used in SALIS AUTO (seven nested context providers) is more naturally expressed in React's compositional model than in Angular's hierarchical injector.
- **Slower build iteration**: Angular's compilation and ahead-of-time (AOT) pipeline is slower than Vite's esbuild-powered HMR, which provides sub-second hot module replacement during development. For a codebase with 191+ screens under active development, fast feedback loops are critical.
- **Smaller pool of Saudi-market Angular developers**: React has broader adoption in the region's developer community, easing future hiring and onboarding.

### Remix

Remix was briefly considered as a React-based framework with nested routing and data loading patterns:

- **Server-side data loading**: Remix's loader/action pattern assumes server-side data fetching. SALIS AUTO's repository seam pattern — switching between mock and HTTP repositories based on a client-side environment variable — does not align with Remix's server-first model.
- **Deployment requirements**: Remix requires a Node.js server runtime for its data loading layer, conflicting with the static deployment target (GitHub Pages, Vercel static, Netlify static).
- **Less mature than Next.js**: If an SSR framework were needed, Next.js would be the more established choice. Since SSR is not needed, neither is Remix.

## References

- [Frontend Architecture (SYS-ARCH-001)](../architecture/frontend-architecture.md)
- [Data Flow (SYS-ARCH-004)](../architecture/data-flow.md)
- [Development Guide](../../development.md)
- [React 18 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
