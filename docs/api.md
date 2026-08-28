# SALIS AUTO — API Reference

## Base URL

The server listens on `PORT` (default `4000`). The frontend connects via `VITE_API_BASE_URL` (e.g. `http://localhost:4000`).

CORS is configured via the `CORS_ORIGIN` environment variable. A comma-separated list of origins or `*` for open access.

## Health Check

```
GET /health
```

Returns `200 OK` with `{ status: "ok" }`. No authentication required.

---

## Authentication

All auth endpoints are prefixed with `/auth`. Passwords are hashed with bcrypt. Tokens use HMAC-SHA256 (HS256) via the `jsonwebtoken` library.

### POST /auth/login

Authenticate a user and receive token pair.

**Request body:**

```json
{
  "email": "string (valid email)",
  "password": "string (min 1 char)"
}
```

**Response `200`:**

```json
{
  "accessToken": "JWT string",
  "refreshToken": "opaque hex string (48 bytes)",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "ar": "string (Arabic name)",
    "role": "RoleId",
    "scope": "DataScope",
    "orgId": "string",
    "branchId": "string",
    "roleLabel": "string",
    "approvalLimit": "number | null",
    "destination": "string (default route for role)"
  }
}
```

**Error `401`:** `{ error: { code: "invalid_credentials", message: "Email or password is incorrect" } }`

The error is identical for unknown email and wrong password — no account enumeration.

### POST /auth/refresh

Rotate a refresh token pair. The used refresh token is revoked and a new pair is issued.

**Request body:**

```json
{
  "refreshToken": "string"
}
```

**Response `200`:** Same shape as login response (`accessToken`, `refreshToken`, `user`).

**Error `401`:** Token invalid, expired, or already revoked.

### POST /auth/logout

Revoke a refresh token.

**Request body:**

```json
{
  "refreshToken": "string"
}
```

**Response:** `204 No Content`

### GET /auth/me

Return the current authenticated user.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**

```json
{
  "user": { /* same user shape as login */ }
}
```

**Error `401`:** Missing or invalid access token.

---

## Access Token Claims

The JWT access token embeds these claims:

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string | User ID |
| `role` | RoleId | One of 14 role identifiers |
| `org_id` | string | Organization (tenant) ID |
| `branch_id` | string | Branch within the organization |
| `scope` | DataScope | Row-level data visibility scope |

**Token TTLs:**

| Token | Default | Env Variable |
|-------|---------|-------------|
| Access token | 15 minutes (900s) | `ACCESS_TOKEN_TTL` |
| Refresh token | 14 days | `REFRESH_TOKEN_TTL` |

---

## RBAC Middleware

Every data endpoint runs two middleware functions in sequence:

1. **`requireAuth`** — Extracts the Bearer token from the `Authorization` header, verifies the JWT, and attaches `req.user` (the decoded claims).
2. **`requireModule(module, action)`** — Checks the RBAC permission matrix for the user's role against the specified module and action. Returns `403 Forbidden` if the role lacks the action.

### Roles (14)

| ID | Label | Default Scope |
|----|-------|---------------|
| `owner` | Owner | `platform` |
| `superadmin` | Super Admin | `all` |
| `manager` | Manager | `branch` |
| `advisor` | Service Advisor | `branch` |
| `technician` | Technician | `assigned` |
| `qc` | QC Inspector | `branch` |
| `parts` | Parts Manager | `branch` |
| `accountant` | Accountant | `org` |
| `hr` | HR Manager | `org` |
| `frontdesk` | Front Desk | `branch` |
| `callcenter` | Call Center Agent | `branch` |
| `procurement` | Procurement Officer | `org` |
| `supplier` | Supplier | `external` |
| `customer` | Customer | `self` |

### Permission Actions

| Code | Meaning |
|------|---------|
| `v` | View |
| `c` | Create |
| `e` | Edit |
| `x` | Delete |
| `a` | Approve |

### Permission Modules (28)

`dashboard`, `jobcards`, `appointments`, `estimates`, `checkin`, `inspection`, `qc`, `delivery`, `customers`, `vehicles`, `feedback`, `invoices`, `payments`, `inventory`, `technicians`, `hr`, `crm`, `accounting`, `reports`, `admin`, `settings`, `integrations`, `network`, `procurement`, `callcenter`, `ai`, `portals`, `kiosk`

### Separation of Duties (6 pairs)

| Actor A | Actor B |
|---------|---------|
| Raise Purchase Order | Approve Purchase Order |
| Create Supplier | Approve Payment |
| Post Journal Entry | Approve Journal Entry |
| Perform Repair | Pass Quality Check |
| Issue Stock | Adjust Stock Count |
| Create Employee | Approve Payroll |

---

## Data Collections

All collection endpoints follow the same REST conventions. Each is RBAC-gated by its permission module.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer ≥ 1 | 1 | Page number |
| `pageSize` | integer 1–200 | 50 | Rows per page |
| `sort` | string | — | Sort field and direction: `field:asc` or `field:desc` |
| `q` | string (max 200) | — | Free-text search across searchable columns (case-insensitive `ILIKE %q%`) |
| `filter[field]` | string | — | Exact-match filter on any returned column |

### Response Format

List endpoints return a bare JSON array of row objects. Detail endpoints return a single row object.

### Collection Endpoints (21)

#### Operations

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/jobs` | `jobcards` | id, cust, veh, svc, st, pr | id, cust, veh | `GET /jobs/:id` |
| GET | `/appointments` | `appointments` | time, cust, veh, plate, svc, status, bay, tech, mins | cust, veh, plate, tech | — |
| GET | `/estimates` | `estimates` | id, cust, veh, amount, status | id, cust, veh | `GET /estimates/:id` |

#### Finance

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/invoices` | `invoices` | id, cust, amount, due, status | id, cust | `GET /invoices/:id` |
| GET | `/receipts` | `payments` | id, date, customer, invoice, method, amount, status | id, customer, invoice | `GET /receipts/:id` |

#### Registry

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/customers` | `customers` | name, phone, vehicles, spent, last | name, phone | — |
| GET | `/vehicles` | `vehicles` | plate, make, owner, mileage, last, status | plate, make, owner | — |
| GET | `/fleets` | `vehicles` | name, vehicles, active, contract | name | — |

#### Inventory

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/inventory` | `inventory` | name, sku, stock, reorder, price | name, sku | — |

#### Team

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/technicians` | `technicians` | name, specialty, jobs, rating | name, specialty | — |

#### CRM

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/crm/leads` | `crm` | name, company, value, source, stage, date, score | name, company | — |
| GET | `/crm/opportunities` | `crm` | name, company, value, stage, prob, close, owner | name, company, owner | — |
| GET | `/crm/tasks` | `crm` | title, assigned, due, priority, status, type | title, assigned | — |
| GET | `/crm/segments` | `crm` | name, count, rules, lastUpdated | name, rules | — |
| GET | `/crm/campaigns` | `crm` | name, type, status, reach, opens, clicks, conversions, budget, spent | name | — |

#### Accounting

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/accounting/coa` | `accounting` | code, name, type, balance, children | code, name, type | `GET /accounting/coa/:id` |
| GET | `/accounting/journal-entries` | `accounting` | id, date, ref, narration, debit, credit, status | id, ref, narration | `GET /accounting/journal-entries/:id` |
| GET | `/accounting/expenses` | `accounting` | id, date, category, vendor, amount, status | id, category, vendor | `GET /accounting/expenses/:id` |

#### AI Platform

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/ai/agents` | `ai` | name, role, model, status, tasks, success, icon | name, role, model | — |
| GET | `/ai/conversations` | `ai` | title, user, msgs, date, tokens | title, user | — |

#### Knowledge Base

| Method | Path | Module | Columns | Searchable | Detail |
|--------|------|--------|---------|------------|--------|
| GET | `/kb/procedures` | `ai` | id, title, ar, cat, make, mins, torque, ar_torque, steps, views, tsb, media | id, title, cat, make | `GET /kb/procedures/:id` |

### Collections Without API Endpoints (10)

These `CollectionKey` values in the frontend's endpoint map return `null`. Accessing them throws `MissingEndpointError` at runtime — this is intentional so mock data never leaks to production.

`invoiceLines`, `invoicePayments`, `approvalLines`, `diagStages`, `diagFindings`, `diagParts`, `diagLabour`, `diagCopies`, `obdDevices`, `dtcCodes`

---

## Error Envelope

All API errors follow a consistent envelope format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "field": "string (optional)"
  }
}
```

### Error Codes

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `bad_request` | Malformed request |
| 401 | `unauthorized` | Missing/invalid/expired token |
| 401 | `invalid_credentials` | Wrong email or password |
| 403 | `forbidden` | Role lacks required permission |
| 404 | `not_found` | Resource does not exist |
| 422 | `validation_error` | Input fails Zod validation (includes `field`) |

---

## Database Schema

The server uses Drizzle ORM with PostgreSQL (or PGlite for local development). All tables use a surrogate `pk` (serial primary key) that is never exposed in API responses.

### Tables (23)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, email, name, ar, role, scope, orgId, branchId, passwordHash | Multi-tenant user accounts |
| `refresh_tokens` | token, userId, expiresAt, revoked | Token rotation store |
| `jobs` | id, cust, veh, svc, st, pr | Job cards / work orders |
| `appointments` | time, cust, veh, plate, svc, status, bay, tech, mins | Service appointments |
| `estimates` | id, cust, veh, amount, status | Cost estimates |
| `invoices` | id, cust, amount, due, status | Billing invoices |
| `receipts` | id, date, customer, invoice, method, amount, status | Payment receipts |
| `customers` | name, phone, vehicles, spent, last | Customer registry |
| `vehicles` | plate, make, owner, mileage, last, status | Vehicle registry |
| `fleets` | name, vehicles, active, contract | Fleet management |
| `parts` | name, sku, stock, reorder, price | Parts inventory |
| `technicians` | name, specialty, jobs, rating | Technician roster |
| `leads` | name, company, value, source, stage, date, score | CRM leads |
| `opportunities` | name, company, value, stage, prob, close, owner | CRM opportunities |
| `crm_tasks` | title, assigned, due, priority, status, type | CRM tasks |
| `segments` | name, count, rules, lastUpdated | Customer segments |
| `campaigns` | name, type, status, reach, opens, clicks, conversions, budget, spent | Marketing campaigns |
| `chart_of_accounts` | code, name, type, balance, children | Chart of accounts |
| `journal_entries` | id, date, ref, narration, debit, credit, status | Journal entries |
| `expenses` | id, date, category, vendor, amount, status | Expense tracking |
| `ai_agents` | name, role, model, status, tasks, success, icon | AI agent registry |
| `conversations` | title, user, msgs, date, tokens | AI conversations |
| `kb_procedures` | id, title, ar, cat, make, mins, torque, ar_torque, steps, views, tsb, media | Knowledge base procedures |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server listen port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed origins (comma-separated or `*`) |
| `JWT_SECRET` | **Yes** (in production) | `dev-only-change-me` | HMAC secret for JWT signing |
| `ACCESS_TOKEN_TTL` | No | `900` (15 min) | Access token lifetime in seconds |
| `REFRESH_TOKEN_TTL` | No | `1209600` (14 days) | Refresh token lifetime in seconds |
| `DEMO_PASSWORD` | No | `salis1234` | Shared password for demo/seed accounts |
| `DATABASE_URL` | No | — | PostgreSQL connection string. Omit for PGlite (zero-setup local dev) |
