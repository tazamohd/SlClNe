# SALIS AUTO — ADR-003: Repository Seam Pattern for Data Access

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal — Confidential      |

## Status

Accepted

## Context

The SALIS AUTO frontend operates in two distinct runtime modes:

1. **Mock mode**: The application runs entirely in the browser with no backend dependency. Data comes from generated fixture tables (`app/src/data/generated/tables.ts`) containing Saudi-specific test data — SAR currency values stored as integer halalas, Saudi license plates, +966 phone numbers, and city names (Riyadh, Jeddah, Dammam). This mode enables zero-install development, offline work, and product demos.

2. **Live mode**: The application connects to the Fastify backend via REST API (`/api/v1/*` prefix), authenticating with JWT Bearer tokens and consuming the same data through the six-step CRUD pipeline (authorize, tenant transaction, validate, apply, audit, present).

Both modes must present identical behavior to screen components. A `JobCards` screen rendering a Kanban board must call the same hooks, receive the same data shape, handle the same error types, and trigger the same cache invalidation — regardless of whether the data comes from an in-memory fixture array or a PostgreSQL database behind a REST API.

The challenge is architectural: how to swap the entire data layer without changing any of the 191+ screen components, without conditional imports scattered through the codebase, and without breaking TanStack Query's caching and invalidation semantics.

Additional forces:

- **46 collection keys**: The data layer spans 46 distinct collection types (customers, vehicles, jobCards, invoices, parts, purchaseOrders, employees, leads, and 38 more). Each collection supports `list`, `get`, `create`, `update`, and `delete` operations. The switching mechanism must cover all 46 collections uniformly.
- **TanStack Query integration**: All server state flows through TanStack Query hooks (`useCollection`, `usePagedCollection`, `useEntity`, `useCreate`, `useUpdate`, `useDelete`, `useBulk`). Cache keys follow the pattern `[collectionKey]` for lists and `[collectionKey, 'entity', id]` for entities. The repository swap must not corrupt the cache or cause stale cross-mode data.
- **Typed error handling**: Both modes must produce `RepositoryError` instances with typed codes (`version_conflict`, `approval_required`, `forbidden`, `network`, `not_found`) so that screens handle errors identically.

## Decision

Implement a repository seam pattern — a single `Repository` interface with two concrete implementations, selected at application startup based on the `VITE_API_URL` environment variable.

### Interface Contract

The `Repository` interface defines a uniform contract for all 46 collections:

```typescript
interface Repository {
  collection(key: CollectionKey): {
    list(params?: ListParams): Promise<ListResult<T>>
    get(id: string): Promise<T>
    create(data: Partial<T>): Promise<T>
    update(id: string, data: Partial<T>): Promise<T>
    delete(id: string): Promise<void>
  }
}
```

### Two Implementations

**`mockRepository`** — Operates on in-memory fixture data from `app/src/data/generated/tables.ts`. Implements search as case-insensitive substring matching across designated columns, sort as JavaScript array sorting, filter as property equality, and pagination as array slicing. Mutations modify the fixture arrays in place. Errors are synthesized to match the `RepositoryError` type taxonomy.

**`httpRepository`** — Constructs REST API calls through a centralized HTTP client. The `ENDPOINTS` object maps 46 collection keys to URL path segments matching the server's `CollectionDef` registry (e.g., `jobCards -> /job-cards`, `purchaseOrders -> /purchase-orders`). The HTTP client sets `Authorization: Bearer <token>` from the registered access token provider, adds `Idempotency-Key` headers on POST requests, sends `If-Match-Version` headers on PATCH requests for optimistic concurrency, and maps HTTP error responses to typed `RepositoryError` instances (401 -> `unauthenticated`, 403 -> `forbidden`, 404 -> `not_found`, 409 -> `version_conflict` or `conflict`, 422 -> `approval_required` or `rule_violated`, 5xx -> `network`).

### Switching Mechanism

The `RepositoryProvider` in `App.tsx`'s provider chain reads `VITE_API_URL` at startup:

- **Unset**: Instantiates `mockRepository` with the generated fixture tables. No network calls. No authentication required (role is read from `localStorage` key `salis-role`).
- **Set**: Dynamically imports the HTTP client module and instantiates `httpRepository` pointing at the configured API base URL. The `SessionProvider` registers an access token provider via `setAccessTokenProvider()`.

The switch happens once at application startup. There is no runtime toggling between modes.

### Cache Isolation

TanStack Query cache keys include a `repoId` derived from a WeakMap keyed on the active repository instance. This ensures that switching from mock to HTTP mode (by changing `VITE_API_URL` and restarting the dev server) produces different cache keys, preventing stale mock data from being served through HTTP cache entries or vice versa.

### Hook Layer

Screens consume the repository exclusively through TanStack Query hooks defined in `useCollection.ts`:

| Hook                  | Operation | Cache Key Pattern                  |
|-----------------------|-----------|------------------------------------|
| `useCollection(key)`  | List      | `[collectionKey, repoId]`          |
| `usePagedCollection`  | List      | `[collectionKey, repoId, query]`   |
| `useEntity(key, id)`  | Detail    | `[collectionKey, 'entity', id]`    |
| `useCreate(key)`      | Create    | Invalidates `[collectionKey]` prefix |
| `useUpdate(key)`      | Update    | Invalidates `[collectionKey]` prefix |
| `useDelete(key)`      | Delete    | Invalidates `[collectionKey]` prefix |
| `useBulk(key)`        | Bulk ops  | Invalidates `[collectionKey]` prefix |

Mutation hooks implement optimistic updates: the TanStack Query cache is patched immediately on mutation, and rolled back if the repository call fails. This provides instant UI feedback in both mock mode (where the "server" call is synchronous) and live mode (where the HTTP round-trip introduces latency).

## Consequences

### Positive

- **Zero component coupling to data source**: None of the 191+ screen components know whether they are reading from fixture arrays or a REST API. Adding a new screen requires only choosing the correct collection key — the data source is resolved by the provider chain.
- **Independent frontend development**: Frontend developers build and test screens using mock mode without waiting for backend API endpoints to be implemented. The fixture data in `tables.ts` serves as both a development aid and a data contract.
- **Testable in isolation**: Unit tests can instantiate `mockRepository` directly, inject it into the provider chain, and test screen rendering and mutation logic without HTTP mocking libraries or network stubs.
- **Consistent error taxonomy**: Both implementations produce the same `RepositoryError` types. A screen that handles `version_conflict` by prompting a reload works identically in both modes — the mock repository synthesizes the same error shape that the HTTP repository parses from a 409 response.
- **Smooth migration path**: As backend endpoints are implemented, the switch from mock to live mode requires only setting `VITE_API_BASE_URL=http://localhost:4000` before starting the dev server. No code changes in any screen component.

### Negative

- **Dual maintenance burden**: Every data contract change must be reflected in both `mockRepository` (fixture tables, in-memory query logic) and `httpRepository` (endpoint mapping, response parsing). Adding a new collection key requires updating `tables.ts`, `endpoints.ts`, and the `Repository` type definition. The server's `CollectionDef` registry and the frontend's `ENDPOINTS` object must stay synchronized across 46 entries.
- **Mock fidelity limits**: The mock repository's in-memory search, sort, and filter logic is a simplified approximation of the backend's `listRows()` implementation. Edge cases in PostgreSQL's `ILIKE` behavior, collation-sensitive sorting, or complex filter combinations may behave differently in mock mode. The mock repository does not enforce RLS, segregation of duties, approval ceilings, or the audit trail.
- **Optimistic update divergence**: In mock mode, mutations are effectively synchronous and always succeed (unless explicitly programmed to fail). In live mode, mutations may fail due to version conflicts, permission denials, or validation errors. Screens that are only tested in mock mode may not handle failure paths correctly.

### Neutral

- **Provider chain ordering is fixed**: The `RepositoryProvider` must appear after `SessionProvider` in the provider chain (because the HTTP repository needs the access token provider) and before route components (because screens consume the repository through hooks). This ordering is documented and enforced by the `App.tsx` composition. Reordering providers would break the dependency chain.
- **Cache key includes repoId**: The WeakMap-based `repoId` in cache keys means that TanStack Query DevTools shows repository-qualified keys. This is a minor diagnostic difference, not an advantage or disadvantage.

## Alternatives Considered

### Feature Flags per Endpoint

Using feature flags to individually toggle each of the 46 endpoints between mock and live was considered. This would allow a gradual migration where some collections use the mock repository while others use the HTTP repository.

Rejected because:

- **Excessive granularity**: Managing 46 individual toggles adds configuration complexity without proportional benefit. In practice, developers either work in full mock mode (frontend only) or full live mode (frontend + backend). Partial mock/live combinations are rare and introduce hard-to-debug state inconsistencies.
- **Cache coherence risk**: Mixed-mode operation (some collections cached from mock, others from HTTP) creates the risk of referential integrity violations in the cache — for example, a mock job card referencing a customer that only exists in the live database.

### Mock Service Worker (MSW)

MSW intercepts HTTP requests at the service worker level, returning mock responses without modifying application code. It was evaluated as an alternative to the repository seam.

Rejected because:

- **Interception opacity**: MSW operates at the network level, making it harder to debug data flow. When a screen displays incorrect data, the developer must check whether the issue is in the MSW handler, the HTTP client, or the screen component. The repository seam makes the data source explicit — the developer knows exactly which implementation is active.
- **Handler maintenance**: MSW requires writing individual request handlers for each of the 46 endpoints, each with realistic response shapes. This is equivalent in maintenance cost to the mock repository but without the benefit of type-checked data structures.
- **No WASM database validation**: MSW returns canned responses; it does not execute SQL queries. The mock repository backed by PGlite (on the backend side) validates that Drizzle ORM queries parse correctly against a real PostgreSQL engine.
- **Service worker availability**: MSW requires service worker registration, which is not available in all browser contexts (e.g., some WebView environments, certain testing frameworks). The repository seam operates at the JavaScript module level with no browser API dependency.

### Conditional Imports with Tree Shaking

Using static conditional imports (`if (import.meta.env.VITE_API_URL)`) to import either the mock or HTTP module at build time was considered.

Rejected because:

- **Tree-shaking fragility**: Vite's tree shaking correctly eliminates dead code in production builds, but during development (where Vite serves unbundled ESM), both modules may be loaded. This adds unnecessary weight to the dev server's module graph.
- **No runtime switching**: Static imports are resolved at build time. Changing the data source requires stopping the dev server, changing the environment variable, and restarting. The dynamic import approach in `RepositoryProvider` resolves the HTTP module lazily, but the core switching is still startup-time — the practical difference is minimal, and the dynamic approach is more robust.
- **Testing complexity**: Conditional imports make it harder to inject test doubles. The repository interface pattern enables straightforward dependency injection in test harnesses.
- **Build-time lock-in**: A build configured for mock mode cannot switch to HTTP mode without a rebuild. The repository seam pattern makes the data source a runtime decision (resolved at startup from the environment), keeping a single build artifact usable in both modes.

### GraphQL Client (Apollo/urql)

Replacing the REST-based `httpRepository` with a GraphQL client was considered:

- **Over-engineering for the access pattern**: All 46 collections follow a uniform CRUD interface (`list`, `get`, `create`, `update`, `delete`). The backend's `CollectionDef` registry already produces a standardized REST API. GraphQL's flexible query shape adds no benefit when every screen fetches a single collection with standard search/sort/filter parameters.
- **Backend rewrite**: The Fastify backend would need a GraphQL schema layer (e.g., `mercurius`, `graphql-yoga`) on top of the existing `CollectionDef` registry. This adds a translation layer without reducing the number of database queries.
- **Mock complexity**: The mock repository would need to implement a GraphQL resolver layer instead of simple array operations. This significantly increases the maintenance burden for the mock data path.

## References

- [Data Flow (SYS-ARCH-004)](../architecture/data-flow.md) -- Section 2 (Repository Seam Pattern)
- [Frontend Architecture (SYS-ARCH-001)](../architecture/frontend-architecture.md) -- Section 2.4 (RepositoryProvider), Section 4.1 (Server State)
- [Development Guide](../../development.md) -- Section: Data Layer Architecture
- [Backend Architecture (SYS-ARCH-002)](../architecture/backend-architecture.md) -- Section 4.1 (CollectionDef Registry)
