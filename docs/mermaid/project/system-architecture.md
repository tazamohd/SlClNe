# System Architecture

Full-stack view of SALIS AUTO: the React SPA talks to the API through a repository seam (mock fixtures or live HTTP), the API enforces auth/RBAC/tenant isolation before reaching Drizzle ORM and PostgreSQL, and a handful of external services are integrated at the edges. Source: `docs/architecture.md`, `docs/system/architecture/*.md`.

```mermaid
flowchart TB
    subgraph CLIENT["Browser — React 18.3 SPA (Vite 5.4, TypeScript 5.7, Tailwind 3.4)"]
        UI["191+ Screens\nby domain (workshop, finance, crm, ...)"]
        RQ["TanStack React Query\nstaleTime 60s, cache + optimistic updates"]
        REPO{"Repository Seam\nVITE_API_URL set?"}
        MOCK["mockRepository\nfixture data in memory"]
        HTTP["httpRepository\nApiClient + Bearer token"]
        UI --> RQ --> REPO
        REPO -- "unset" --> MOCK
        REPO -- "set" --> HTTP
    end

    subgraph API["API Layer — /api/v1 (Express per architecture.md / Fastify per backend-architecture.md), Node 20"]
        MW["Middleware pipeline:\nHelmet -> CORS -> Rate limiter (orgId:IP) -> JWT verify -> Principal"]
        RBAC["requirePermission()\nPERMS matrix: 28 modules x 14 roles"]
        CRUD["6-step CRUD pipeline:\nAuthorize -> Tenant Tx -> Validate (Zod) -> Apply -> Audit -> Present"]
        BESPOKE["Bespoke routers:\ninvoices, estimates, workshop, procurement,\npayroll, insurance-claims, obd, approvals ..."]
        MW --> RBAC --> CRUD
        CRUD --> BESPOKE
    end

    subgraph DATA["Data Layer"]
        DRIZZLE["Drizzle ORM 0.36\nschema-as-code, migrations"]
        TENANT["withTenant()\nSET LOCAL app.org_id / branch_id / user_id / scope"]
        PG[("PostgreSQL\n50+ tables, RLS FORCE on 53 tenant tables")]
        PGLITE[("PGlite (dev)\nPostgres-in-WASM, no install needed")]
        AUDIT[("audit_log\nappend-only, trigger blocks UPDATE/DELETE")]
        DRIZZLE --> TENANT --> PG
        CRUD -.dev mode.-> PGLITE
        CRUD --> AUDIT
    end

    subgraph EXT["External Integrations (see integration-architecture.md)"]
        ZATCA["ZATCA Phase 2\ne-invoicing XML + QR + hash chain"]
        SMS["SMS / Email OTP\ntransport: unconfigured|mock|live"]
        OBD["OBD Bridge\nvehicle diagnostics, mock/live"]
        STRIPE["Payment gateway\n(card/bank/mada/STC Pay methods)"]
    end

    HTTP -- "Bearer JWT, Idempotency-Key" --> MW
    BESPOKE --> DRIZZLE
    BESPOKE -. "invoice issue" .-> ZATCA
    BESPOKE -. "OTP challenge" .-> SMS
    BESPOKE -. "rescan / clear-codes" .-> OBD
    BESPOKE -. "payment record" .-> STRIPE

    classDef store fill:#eef6ee,stroke:#5a9,stroke-width:1px;
    class PG,PGLITE,AUDIT store;
```

## Notes

- **No cache/session store**: the architecture is request-response only — no Redis, no WebSocket/SSE layer (see `docs/system/architecture/data-flow.md` §9). React Query's 60s `staleTime` is the only caching layer.
- **Repository seam** (ADR-003): screens never import mock tables or HTTP clients directly; swapping `VITE_API_URL` swaps the entire data layer without touching any of the 191+ screens.
- **PGlite** (ADR-002) stands in for PostgreSQL in local development only — production always runs real PostgreSQL.
- The two architecture docs disagree on the framework name (`docs/architecture.md` says Express 4.21; `docs/system/architecture/backend-architecture.md` and `data-flow.md` say Fastify) — both are reproduced here rather than silently resolved.
