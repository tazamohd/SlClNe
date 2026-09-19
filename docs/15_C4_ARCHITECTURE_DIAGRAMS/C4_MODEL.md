<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/architecture.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/app.ts
       - server/src/registry.ts
       - app/src/data/http/*
       - server/drizzle/*.sql
-->

# C4 model

**Status:** GENERATED · **Sources as of:** 2026-09-19 · **Scope:** CURRENT implementation

Everything on these diagrams exists in the repository today. Nothing planned is drawn.

## Level 1 — System context

```mermaid
flowchart TB
  subgraph people[People]
    staff["Workshop staff<br/>advisor, technician, QC,<br/>parts, accountant, HR, manager"]
    owner["Owner / branch manager"]
    customer["Customer"]
    supplier["Supplier"]
  end
  salis["<b>SALIS AUTO</b><br/>Multi-tenant workshop management<br/>React SPA + Fastify API + PostgreSQL"]
  subgraph external[External systems]
    obd["OBD / diagnostic bridge<br/>server/src/integrations/obd.ts"]
    zatca["ZATCA e-invoicing<br/>XML generation — ADR-008"]
  end
  staff --> salis
  owner --> salis
  customer --> salis
  supplier --> salis
  salis --> obd
  salis --> zatca
```

## Level 2 — Containers

```mermaid
flowchart TB
  browser["Web browser / Capacitor shell<br/>iOS + Android"]
  spa["<b>SPA</b><br/>React 18 + Vite + React Router<br/>TanStack Query, Zustand<br/>app/"]
  api["<b>API</b><br/>Fastify 5 on Node<br/>506 endpoints under /api/v1<br/>server/"]
  contract["<b>Shared contract</b><br/>Zod entities, RBAC matrix,<br/>business rules<br/>packages/contract/"]
  db[("<b>PostgreSQL</b><br/>82 tables<br/>Row-level security on 78<br/>Drizzle ORM")]
  browser --> spa
  spa -->|"HTTPS, Bearer token"| api
  spa -.->|"types, RBAC, rules"| contract
  api -.->|"types, RBAC, rules"| contract
  api -->|"SQL with SET LOCAL app.*"| db
```

The contract package is the load-bearing piece. Both sides read the same permission matrix and the same rule functions, and `server/tests/rbac-parity.test.ts` asserts the two copies are identical rather than merely similar. Frontend RBAC hides and disables; the server decides.

## Level 3 — Components inside the API

```mermaid
flowchart TB
  subgraph edge[Edge]
    helmet["helmet — security headers"]
    rl["rate limit"]
    authn["authn onRequest hook<br/>authenticated by default"]
  end
  subgraph routing[Routing]
    generic["collections.ts<br/>342 generated routes<br/>from registry.ts"]
    explicit["164 explicit routes<br/>estimates, invoices, procurement,<br/>HR, insurance, loans, OBD, auth"]
  end
  subgraph guards[Guards]
    perms["security/permissions.ts<br/>module + action"]
    approvals["security/approvals.ts<br/>authority and ceiling"]
    sod["security/sod.ts<br/>segregation of duties"]
    idem["http/idempotency.ts"]
  end
  subgraph data[Data]
    tenant["db/tenant.ts<br/>SET LOCAL app.org_id / branch_id / user_id / scope"]
    drizzle["Drizzle queries"]
    rls[("RLS policies<br/>p_tenant permissive<br/>r_branch, r_own restrictive")]
    audit["audit/audit.ts<br/>append-only"]
  end
  helmet --> rl --> authn --> generic
  authn --> explicit
  generic --> perms
  explicit --> perms --> approvals --> sod --> idem --> tenant --> drizzle --> rls
  drizzle --> audit
```

## Dynamic view — an estimate approved by a customer over OTP

```mermaid
sequenceDiagram
  participant SA as Service advisor
  participant SPA as SPA
  participant API as API
  participant R as Rules (contract)
  participant DB as PostgreSQL
  participant C as Customer
  SA->>SPA: build estimate, add lines
  SPA->>API: POST /api/v1/estimates
  API->>R: computeInvoiceTotals(lines)
  R-->>API: subtotal, VAT at 1500bps, total (halalas)
  API->>DB: INSERT estimate + lines in one transaction
  API-->>SPA: 201 with server-computed totals
  SA->>SPA: request customer approval
  SPA->>API: POST /api/v1/estimates/:id/request-approval-otp
  API->>DB: INSERT otp_challenges
  API-->>C: OTP delivered by the configured transport
  C->>API: POST /api/v1/estimates/:id/verify-approval-otp
  API->>R: checkEstimateFresh(validUntil)
  R-->>API: not expired
  API->>DB: UPDATE estimates SET status = 'approved'
  API->>DB: INSERT audit_log (append-only)
  API-->>SPA: 200
```

## Domains served by the API

| Domain | Endpoints | Capability |
| --- | --- | --- |
| accounting | 37 | CAP-ACCOUNTING |
| admin | 2 | CAP-PLATFORM |
| ai | 8 | CAP-AI |
| appointments | 9 | CAP-WORKSHOP |
| approvals | 5 | CAP-GOVERNANCE |
| audit | 1 | CAP-GOVERNANCE |
| auth | 26 | CAP-IDENTITY |
| crm | 51 | CAP-CRM |
| customers | 20 | CAP-CUSTOMERS |
| dashboard | 13 | CAP-PLATFORM |
| departments | 9 | CAP-PLATFORM |
| estimates | 29 | CAP-WORKSHOP |
| hr | 48 | CAP-HR |
| insurance | 22 | CAP-ACCOUNTING |
| inventory | 22 | CAP-INVENTORY |
| invoices | 14 | CAP-BILLING |
| jobcards | 90 | CAP-WORKSHOP |
| network | 37 | CAP-PLATFORM |
| payments | 11 | CAP-BILLING |
| platform | 3 | CAP-PLATFORM |
| procurement | 28 | CAP-PROCUREMENT |
| settings | 8 | CAP-PLATFORM |
| technicians | 4 | CAP-HR |
| vehicles | 9 | CAP-VEHICLES |
