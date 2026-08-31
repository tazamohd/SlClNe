# Data Flow

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-004                               |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

Data in SALIS AUTO flows through a layered architecture: the React frontend consumes data through a repository abstraction that switches between mock fixtures and a live HTTP client, while the Fastify backend enforces a uniform six-step CRUD pipeline on every mutation. This document traces data through both layers.

## 2. Repository Seam Pattern

The frontend never imports HTTP clients or mock tables directly. Instead, all data access passes through the `RepositoryProvider`, which selects the active implementation based on the `VITE_API_URL` environment variable:

| `VITE_API_URL` | Repository        | Backing Store                    |
|----------------|-------------------|----------------------------------|
| Unset          | `mockRepository`  | Generated fixture tables in memory |
| Set            | `httpRepository`  | REST API with Bearer token auth    |

The `RepositoryProvider` exposes 46 collection keys through a uniform interface, each supporting `list`, `get`, `create`, `update`, and `delete` operations. Screens consume this through TanStack Query hooks (`useCollection`, `useEntity`, `useCreate`, `useUpdate`, `useDelete`).

## 3. Frontend Data Flow

### 3.1 Read Path

```
Screen Component
  -> useCollection(key) or useEntity(key, id)
    -> TanStack Query (staleTime: 60s, refetchOnWindowFocus: false)
      -> Cache hit? Return cached data
      -> Cache miss? Call repository.list() or repository.get()
        -> [Mock] Read from fixture table, apply search/sort/filter in memory
        -> [HTTP] GET /api/v1/{path}?page=&sort=&filter[x]= with Bearer token
          -> Parse response, return to cache
```

### 3.2 Write Path

```
Screen Component
  -> useCreate(key) / useUpdate(key) / useDelete(key)
    -> Optimistic update: patch TanStack Query cache immediately
    -> Call repository.create() / .update() / .delete()
      -> [Mock] Mutate fixture table in memory
      -> [HTTP] POST/PATCH/DELETE /api/v1/{path} with:
          - Authorization: Bearer <accessToken>
          - Idempotency-Key: <uuid> (on POST)
          - If-Match-Version: <version> (on PATCH)
    -> Success: invalidate [collectionKey] prefix to refresh lists
    -> Failure: rollback optimistic update, show error toast
```

### 3.3 Cache Key Scheme

| Pattern                        | Usage                                    |
|--------------------------------|------------------------------------------|
| `[collectionKey]`              | List queries                             |
| `[collectionKey, query]`       | List with search/sort/filter params      |
| `[collectionKey, 'entity', id]`| Single record by ULID or code            |

Invalidation uses the `[collectionKey]` prefix, so creating a new record invalidates all list views for that collection without touching entity caches for other collections.

### 3.4 Version Conflict Handling

When `useUpdate` detects a cached row, it sends the row's `version` as an `If-Match-Version` header. If the server returns 409 (`version_conflict`), the hook surfaces a `RepositoryError` with code `version_conflict`, and the screen prompts the user to reload.

## 4. HTTP Client

The `httpRepository` constructs requests through a centralized HTTP client that:

1. Sets `Authorization: Bearer <token>` from the registered access token provider
2. Sets `Content-Type: application/json` on mutation requests
3. Adds `Idempotency-Key` header on POST requests for safe retry
4. Maps HTTP error responses to typed `RepositoryError` instances:
   - 401 -> `unauthenticated` (triggers logout)
   - 403 -> `forbidden`
   - 404 -> `not_found`
   - 409 -> `version_conflict` or `conflict`
   - 422 -> `approval_required` or `rule_violated`
   - 5xx -> `network`

### 4.1 Endpoint Mapping

The `ENDPOINTS` object maps 46 collection keys to URL path segments, matching the server's `CollectionDef` registry:

```
customers     -> /customers
vehicles      -> /vehicles
jobCards      -> /job-cards
invoices      -> /invoices
parts         -> /parts
purchaseOrders-> /purchase-orders
... (46 entries total)
```

## 5. Backend Data Flow

### 5.1 Request Pipeline

Every authenticated request passes through the middleware chain before reaching a handler:

```
HTTP Request
  -> Helmet (security headers)
    -> CORS (origin validation against CORS_ORIGINS)
      -> Rate Limiter (orgId:IP budget, RATE_LIMIT_MAX per minute)
        -> onRequest hook (JWT verification -> Principal)
          -> Route Handler (6-step CRUD or bespoke)
            -> onSend hook (x-request-id header)
              -> HTTP Response
```

### 5.2 Six-Step CRUD Pipeline

Every collection mutation follows these steps in order:

#### Step 1: Authorize
```typescript
requirePermission(principal, module, action)
```
Checks the PERMS matrix for the role's grant on the module. Throws 403 on failure.

#### Step 2: Open Tenant Transaction
```typescript
withTenant(db, principal, async (tx) => { ... })
```
Opens a PostgreSQL transaction and sets `app.org_id`, `app.branch_id`, `app.user_id`, and `app.scope` via `SET LOCAL`. RLS policies read these settings.

#### Step 3: Validate
```typescript
parseOr422(schema, body)
```
Parses the request body against a Zod schema. Server-owned keys (`orgId`, `version`, `createdBy`) are rejected if the client sends them.

#### Step 4: Apply
Database operation (insert, update with version predicate, or set `deleted_at`). On update, the version column increments atomically; a mismatch returns 409.

#### Step 5: Audit
```typescript
writeAudit(tx, { actor, action, entity, entityId, before, after })
```
Writes an audit row in the same transaction. Credential keys are scrubbed from payloads before insertion.

#### Step 6: Present
```typescript
presentRow(def, principal, row)
```
Applies field-level redaction based on the role's `FIELD_RULES` visibility, then transforms through the collection's `present()` function.

### 5.3 Query Flow (Read Path)

```
GET /api/v1/{path}?page=1&pageSize=20&sort=name&q=search&filter[status]=active
  -> Authorize: requirePermission(principal, module, 'v')
  -> withTenant(db, principal, async (tx) => {
       listRows(tx, table, {
         page, pageSize (max 200),
         sort: validated against def.sortable,
         filter: validated against def.filterable,
         search: ILIKE across def.search columns,
         excludeDeleted: true (unless includeDeleted=true with 'd' permission)
       })
     })
  -> presentRow() for each row (field redaction)
  -> Response: { data: [...], total, page, pageSize }
```

### 5.4 Bespoke Route Data Flow

Entities with lifecycle logic follow the same pattern but add domain-specific steps:

| Route                | Additional Steps                                            |
|----------------------|-------------------------------------------------------------|
| Invoice issuance     | Compute totals from lines, set ZATCA fields, freeze amounts |
| Estimate approval    | Check approval ceiling, SOD (different approver), set status |
| Workshop transition  | Validate stage graph, check SOD (repair vs QC), update stage |
| Procurement receive  | Validate `received <= ordered`, update PO line quantities    |
| Payroll post         | Freeze gross/net totals, mark run as posted, prevent reopen  |
| Inventory movement   | Record signed delta, update on-hand/reserved counts           |

## 6. Export Data Flow

```
GET /api/v1/{path}/export
  -> Authorize: requirePermission(principal, module, 'x')
  -> Walk all pages up to MAX_EXPORT_ROWS (50,000)
    -> Page size: 200 rows per page
    -> Each cell: formula injection protection (prefix =+-@\t\r with ')
  -> If truncated: X-Export-Truncated: true header
  -> Response: CSV stream
```

## 7. Idempotency Flow

```
POST /api/v1/{path} with Idempotency-Key header
  -> Hash request body
  -> Look up (org_id, key, endpoint) in idempotency_keys
    -> Found, same hash: return stored response (no side effects)
    -> Found, different hash: return 409 (body mismatch)
    -> Not found: execute mutation, store response, return result
```

## 8. Authentication Data Flow

```
Login:
  POST /api/v1/auth/login { email, password }
    -> bcrypt.compare(password, user.passwordHash)
    -> Create session row with familyId, refreshTokenHash
    -> Sign access token (15 min) + refresh token (30 days)
    -> Return { accessToken, refreshToken, user }

Token Refresh:
  POST /api/v1/auth/refresh { refreshToken }
    -> Verify JWT signature and audience
    -> Load session row by sessionId
    -> Constant-time compare SHA-256 digest
    -> Check familyId against session's familyId
      -> Mismatch: revoke entire family (theft detected)
    -> Issue new access token + new refresh token
    -> Update session row with new hash
```

## 9. Real-Time Considerations

The current architecture is request-response only. There is no WebSocket or Server-Sent Events layer. The frontend uses TanStack Query's 60-second `staleTime` to limit unnecessary refetches. Background refetch on window focus is disabled (`refetchOnWindowFocus: false`).

## Related Documents

- [Frontend Architecture](./frontend-architecture.md)
- [Backend Architecture](./backend-architecture.md)
- [Database Design](./database-design.md)
- [Authentication Guide](../security/authentication-guide.md)
