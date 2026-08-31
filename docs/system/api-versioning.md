# SALIS AUTO -- API Versioning Strategy

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-API-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the API versioning strategy for the SALIS AUTO platform. It covers the versioning approach for the 21 collection endpoints and all future additions, backward compatibility policy, deprecation lifecycle, and migration guidance. The current API architecture is documented in [Backend Architecture](architecture/backend-architecture.md).

---

## 2. Current Version

| Property              | Value                                                |
|-----------------------|------------------------------------------------------|
| Current version       | v1                                                   |
| Base URL pattern      | `/api/v1/<resource>`                                 |
| Version format        | Major version integer (v1, v2, v3)                   |
| First release         | v1.0.0 (initial platform launch)                     |

All 21 collection endpoints and their associated CRUD operations are served under the `/api/v1/` prefix. Authentication endpoints (`/api/v1/auth/*`) and public endpoints (`/api/v1/public/*`) follow the same prefix convention.

---

## 3. Versioning Approach

### 3.1 Strategy: URL Path Prefix

SALIS AUTO uses **URL path prefix versioning** (`/api/v1/`, `/api/v2/`). This was chosen over header-based versioning (`Accept: application/vnd.salis.v1+json`) for the following reasons:

| Criterion               | URL Path Prefix        | Header-Based             | Decision |
|--------------------------|------------------------|--------------------------|----------|
| Developer discoverability| High -- visible in URL | Low -- hidden in headers | URL wins |
| Browser testability      | Direct URL access      | Requires tooling         | URL wins |
| Caching (CDN/proxy)      | URL-based cache keys   | Vary header complexity   | URL wins |
| Client library simplicity| Base URL change        | Custom header injection  | URL wins |
| API gateway routing      | Path-based routing     | Header inspection        | URL wins |
| Granularity              | Major version only     | Fine-grained negotiation | Header wins |

**Decision:** URL path prefix provides the best developer experience for the SALIS AUTO audience (workshop operators, integrators, and internal frontend).

### 3.2 URL Structure

```
https://api.salisauto.com/api/v{major}/{resource}
                              ~~~~~~
                              Version prefix

Examples:
  GET    /api/v1/vehicles
  POST   /api/v1/work-orders
  GET    /api/v1/invoices/:id
  PATCH  /api/v1/customers/:id
  GET    /api/v2/vehicles          (future version)
```

### 3.3 Version Negotiation

While URL path is the primary mechanism, the API also supports an informational `Accept` header for forward compatibility:

```
Accept: application/json                     -- defaults to latest stable
Accept: application/vnd.salis.v1+json        -- explicit v1 request
```

If the `Accept` header specifies a version that conflicts with the URL path, the URL path takes precedence. The response always includes the version in a header:

```
X-API-Version: 1.0.0
```

---

## 4. Versioned Endpoint Catalog (v1)

### 4.1 Collection Endpoints

| #  | Endpoint                       | Methods         | Domain              |
|----|--------------------------------|-----------------|---------------------|
| 1  | `/api/v1/vehicles`             | GET, POST       | Registry            |
| 2  | `/api/v1/customers`            | GET, POST       | CRM & Marketing     |
| 3  | `/api/v1/work-orders`          | GET, POST       | Workshop            |
| 4  | `/api/v1/inspections`          | GET, POST       | Workshop            |
| 5  | `/api/v1/estimates`            | GET, POST       | Workshop            |
| 6  | `/api/v1/invoices`             | GET, POST       | Finance             |
| 7  | `/api/v1/payments`             | GET, POST       | Finance             |
| 8  | `/api/v1/parts`                | GET, POST       | Parts & Inventory   |
| 9  | `/api/v1/purchase-orders`      | GET, POST       | Parts & Inventory   |
| 10 | `/api/v1/employees`            | GET, POST       | Team & HR           |
| 11 | `/api/v1/branches`             | GET, POST       | Administration      |
| 12 | `/api/v1/users`                | GET, POST       | Authentication      |
| 13 | `/api/v1/roles`                | GET             | Authentication      |
| 14 | `/api/v1/leads`                | GET, POST       | CRM & Marketing     |
| 15 | `/api/v1/campaigns`            | GET, POST       | CRM & Marketing     |
| 16 | `/api/v1/suppliers`            | GET, POST       | Parts & Inventory   |
| 17 | `/api/v1/appointments`         | GET, POST       | Call Center         |
| 18 | `/api/v1/reports`              | GET             | Reports & Analytics |
| 19 | `/api/v1/notifications`        | GET, POST       | Administration      |
| 20 | `/api/v1/audit-logs`           | GET             | Administration      |
| 21 | `/api/v1/settings`             | GET, PUT        | Administration      |

All collection endpoints support standard query parameters: `page`, `limit`, `sort`, `order`, `search`, and domain-specific filters.

---

## 5. Breaking vs. Non-Breaking Changes

### 5.1 Non-Breaking Changes (No Version Bump)

These changes are safe to deploy within the current version:

| Change Type                          | Example                                        |
|--------------------------------------|-------------------------------------------------|
| Adding a new optional field          | Add `middleName` to customer response           |
| Adding a new endpoint                | New `/api/v1/analytics` endpoint                |
| Adding a new query parameter         | Add `?status=active` filter                     |
| Relaxing a validation constraint     | Field was required, now optional                |
| Adding a new enum value              | Add `warranty` to work order types              |
| Increasing a rate limit              | 100/min to 200/min                              |
| Adding a new response header         | New `X-Total-Count` header                      |
| Performance improvements             | Faster query execution                          |

### 5.2 Breaking Changes (Require Version Bump)

These changes require a new API version:

| Change Type                          | Example                                        |
|--------------------------------------|-------------------------------------------------|
| Removing a field                     | Remove `legacyId` from response                 |
| Renaming a field                     | `phoneNumber` -> `phone`                        |
| Changing a field's type              | `amount: string` -> `amount: number`            |
| Tightening a validation constraint   | Optional field becomes required                  |
| Removing an endpoint                 | Dropping `/api/v1/legacy-reports`                |
| Changing error response format       | Restructuring the error envelope                 |
| Changing authentication mechanism    | JWT HS256 -> RS256                               |
| Modifying pagination structure       | Offset-based to cursor-based                     |
| Changing the meaning of a status code| 200 -> 201 for creation                          |
| Removing an enum value               | Removing `draft` from invoice statuses           |

### 5.3 ZATCA-Related Changes

ZATCA regulatory updates receive special treatment:

- **ZATCA XML namespace changes:** Breaking -- requires new version
- **ZATCA field additions (additive):** Non-breaking if the field is optional in the response
- **VAT rate changes (e.g., 15% to a new rate):** Non-breaking -- configured via `settings`, not code
- **Hash chain algorithm changes:** Breaking -- requires new version with migration

---

## 6. Deprecation Timeline

### 6.1 Deprecation Lifecycle

```
Active (v1) -----> Deprecated (v1) -----> Sunset (v1 removed)
     |                  |                       |
     v                  v                       v
  New version        Grace period            v1 offline
  (v2) released      (6 months)             (v2 only)
```

| Phase          | Duration    | Actions                                                    |
|----------------|-------------|------------------------------------------------------------|
| Announcement   | Day 0       | Blog post, API changelog, email to API consumers           |
| Deprecation    | Day 0       | `Sunset` header added to deprecated version responses      |
| Grace period   | 6 months    | Both versions operational, migration support available      |
| Sunset warning | Month 5     | Final notification, usage report to remaining consumers    |
| Sunset         | Month 6     | Old version returns `410 Gone` with migration URL          |

### 6.2 Deprecation Headers

Deprecated version responses include:

```http
Sunset: Sat, 28 Feb 2027 23:59:59 GMT
Deprecation: true
Link: </api/v2/vehicles>; rel="successor-version"
```

### 6.3 Internal Consumer (Frontend)

The SALIS AUTO React frontend is tightly coupled to the API version. During the grace period:

1. Frontend is migrated to the new version first
2. Old version endpoints are monitored for any remaining external consumers
3. The frontend does not need to support multiple API versions simultaneously

---

## 7. Migration Guide Template

### 7.1 Version Migration Document Structure

```
API MIGRATION GUIDE: v[N] -> v[N+1]
=====================================
Release Date:    [YYYY-MM-DD]
Sunset Date:     [YYYY-MM-DD]

SUMMARY OF CHANGES
-------------------
[High-level description of why a new version was needed]

BREAKING CHANGES
-----------------
1. [Endpoint]: [Change description]
   Before: [Example request/response]
   After:  [Example request/response]
   Migration: [Step-by-step migration instructions]

NON-BREAKING CHANGES (included in both versions)
--------------------------------------------------
1. [Change description]

MIGRATION CHECKLIST
--------------------
[ ] Update base URL from /api/v[N]/ to /api/v[N+1]/
[ ] Update request payloads for changed fields
[ ] Update response parsers for changed fields
[ ] Update Zod validation schemas
[ ] Run integration tests against new version
[ ] Remove deprecated field usage
[ ] Update API client library version

SUPPORT
-------
Migration support: [Contact email/Slack channel]
```

---

## 8. Changelog

### 8.1 Format

Each API version maintains a changelog following Keep a Changelog format:

```
# API Changelog

## [1.0.0] -- 2026-[MM]-[DD]
### Added
- Initial release of 21 collection endpoints
- ZATCA Phase 2 e-invoice generation
- Multi-tenant org_id isolation
- 14-role RBAC enforcement

### Endpoints
- GET/POST /api/v1/vehicles
- GET/POST /api/v1/customers
- GET/POST /api/v1/work-orders
[... all 21 endpoints ...]
```

### 8.2 Changelog Publishing

- **Location:** `CHANGELOG.md` in the repository root, and `/api/v1/changelog` endpoint
- **Update trigger:** Every deployment that adds or modifies API behavior
- **Review:** Tech Lead reviews changelog entries before release

---

## 9. Client Library Versioning

### 9.1 Alignment Strategy

| API Version | Frontend `data/http/` Version | External SDK Version |
|-------------|-------------------------------|----------------------|
| v1.0.0      | 1.0.x                        | @salis/api@1.0.x     |
| v1.1.0      | 1.1.x                        | @salis/api@1.1.x     |
| v2.0.0      | 2.0.x                        | @salis/api@2.0.x     |

- **Major version:** Matches API major version (breaking changes)
- **Minor version:** New non-breaking features
- **Patch version:** Bug fixes, no API changes

### 9.2 Internal HTTP Client

The frontend's `data/http/` directory contains the API client. It is versioned alongside the API:

- Base URL configured via `VITE_API_BASE_URL` (includes version prefix)
- Zod schemas in the client match the API response shapes
- Type safety enforced at compile time via TypeScript strict mode

---

## 10. Multi-Tenant Versioning Considerations

### 10.1 All Tenants on Same Version

SALIS AUTO does not support per-tenant API versioning. All organizations (`org_id`) are served the same API version at any given time. This simplifies:

- Database schema consistency (single Drizzle schema)
- ZATCA compliance (single compliant implementation)
- RBAC enforcement (single permission model)

### 10.2 Feature Flags vs. Versions

For tenant-specific feature rollout without a version bump, use feature flags in the `settings` table rather than API versions.

---

## 11. Related Documents

- [Backend Architecture](architecture/backend-architecture.md) -- API middleware and route registration
- [Frontend Architecture](architecture/frontend-architecture.md) -- HTTP client and data layer
- [Coding Standards](coding-standards.md) -- API naming and response conventions
- [SLA Document](sla-document.md) -- API response time commitments
- [Testing Strategy](testing-strategy.md) -- API integration test approach
