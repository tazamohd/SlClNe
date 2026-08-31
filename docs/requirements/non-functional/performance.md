# Performance — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-PRF-001                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Performance                              |

## 1. Overview

This document defines the performance targets, caching strategy, bundle optimization, and database query performance requirements for SALIS AUTO. The platform must deliver responsive experiences for workshop staff operating under time pressure, while supporting multi-tenant workloads across multiple branches.

## 2. Response Time Targets

### 2.1 API Response Times

| Operation Type         | Target    | Maximum  | Measurement Point         |
|------------------------|-----------|----------|---------------------------|
| Read (single record)   | < 100ms   | 200ms    | Server response time      |
| Read (list/paginated)  | < 150ms   | 300ms    | Server response time      |
| Write (create/update)  | < 200ms   | 500ms    | Server response time      |
| State transition       | < 200ms   | 500ms    | Server response time      |
| Search (ILIKE query)   | < 200ms   | 500ms    | Server response time      |
| Export (CSV generation) | < 2s     | 5s       | For up to 50,000 rows     |
| Authentication         | < 300ms   | 800ms    | Including Argon2id hash   |

### 2.2 Frontend Performance

| Metric                  | Target    | Maximum  | Context                   |
|-------------------------|-----------|----------|---------------------------|
| Initial page load (LCP) | < 2s      | 3s       | First meaningful paint    |
| Client-side navigation  | < 500ms   | 1s       | Between screens           |
| Time to Interactive     | < 3s      | 5s       | On 4G connection          |
| Input responsiveness    | < 100ms   | 200ms    | Form field interactions   |
| DataTable render        | < 200ms   | 500ms    | For 200-row page          |

### 2.3 Perceived Performance

- Skeleton states render within 100ms while data loads
- Optimistic UI updates for state transitions (show immediately, reconcile after API)
- Progressive loading of list data — table structure renders before rows populate

## 3. Load Capacity

### 3.1 Concurrent Users per Tier

| Tier       | Concurrent Users | API Requests/min | WebSocket Connections |
|------------|------------------|-------------------|-----------------------|
| Starter    | 25               | 500               | 25                    |
| Business   | 100              | 2,000             | 100                   |
| Enterprise | 500              | 10,000            | 500                   |

### 3.2 Rate Limiting

- Global rate limit keyed on `orgId:ip`
- Auth endpoints: 20 requests/minute per IP (pre-authentication, no org context)
- Login endpoint: 10 requests/minute per IP
- Export endpoints: 5 requests/minute per user (to prevent CSV flood)

## 4. React Query Caching

### 4.1 Configuration

```typescript
staleTime: 60_000  // 60 seconds
refetchOnWindowFocus: false
```

### 4.2 Caching Strategy

| Data Type          | Stale Time  | Cache Time  | Rationale                       |
|--------------------|-------------|-------------|---------------------------------|
| Collection lists   | 60s         | 5 min       | Moderate change frequency       |
| Single records     | 60s         | 5 min       | Optimistic concurrency handles conflicts |
| Reference data     | 5 min       | 30 min      | Services, branches — rarely change |
| User session       | 60s         | Token TTL   | Auth state must stay fresh      |
| Test fixtures      | Infinity    | Infinity    | Mock data never changes         |

### 4.3 Cache Invalidation

- Mutation success triggers `queryClient.invalidateQueries()` for affected collections
- Optimistic concurrency (`version` column + `If-Match` header) catches stale-cache writes
- 409 Conflict responses trigger automatic refetch of the affected record

## 5. Bundle Optimization

### 5.1 Code Splitting

- Route-based code splitting via React lazy routes
- Each domain is a separate chunk (Workshop, Finance, CRM, etc.)
- Portal shells (Customer, Technician, Supplier) load as independent entry points

### 5.2 Bundle Size Targets

| Asset Type       | Target   | Maximum  | Notes                         |
|------------------|----------|----------|-------------------------------|
| Initial bundle   | < 200KB  | 350KB    | Gzipped, critical-path only   |
| Per-route chunk  | < 100KB  | 200KB    | Gzipped, per domain           |
| Total app size   | < 2MB    | 3MB      | All chunks combined, gzipped  |
| CSS              | < 50KB   | 100KB    | Gzipped                       |

### 5.3 Tree Shaking

- Vite's Rollup-based build eliminates unused exports
- Icon registry imports only used icons (not the entire Lucide library)
- Component library uses named exports for selective imports

### 5.4 Font Loading

The font system (font-ui, font-display, font-action, font-mono JetBrains Mono) uses:

- `font-display: swap` to prevent FOIT
- Preloaded critical font weights
- System font fallback stacks

## 6. Database Query Optimization

### 6.1 Index Strategy

All tenant tables carry an index on `org_id` for RLS-driven queries. Additional indexes are placed on:

| Pattern                    | Index Columns                              | Tables                        |
|----------------------------|--------------------------------------------|-------------------------------|
| Tenant + status            | (org_id, branch_id, status)                | job_cards, invoices, suppliers, etc. |
| Tenant + date              | (org_id, scheduled_date)                   | appointments                  |
| Tenant + foreign key       | (org_id, customer_id), (org_id, part_id)   | vehicles, inventory_movements |
| Unique business code       | (org_id, code)                             | All code-bearing tables       |
| Tenant + assignee          | (org_id, assigned_tech_id)                 | job_cards                     |
| Audit trail                | (org_id, entity, entity_id), (org_id, ts)  | audit_log                     |

### 6.2 Query Patterns

- **List queries**: Always scoped by `org_id` (via RLS), with optional `branch_id` filtering. Pagination uses OFFSET/LIMIT with a total count query.
- **Detail queries**: Lookup by ULID or human business code (OR condition on id and code column)
- **Soft delete filtering**: `WHERE deleted_at IS NULL` applied by default; `includeDeleted` parameter overrides

### 6.3 Pagination Ceiling

Maximum page size is 200 rows per request (`MAX_PAGE_SIZE` in `@salis/contract`). Export operations use a separate ceiling of 50,000 rows gathered in pages of 200, with `X-Export-Truncated: true` header when truncated.

### 6.4 Connection Pooling

PostgreSQL connection pooling via the database client to prevent connection exhaustion under concurrent multi-tenant workload. Each tenant transaction runs within the same connection, with RLS set at session level.

## 7. Workshop-Specific Performance

### 7.1 State Transition Latency

Job card stage transitions (checkin, inspection, estimate, repair, qc, delivery, invoiced, closed) are the most time-sensitive operations in the workshop. Each transition involves:

1. Optimistic concurrency check (`version` column)
2. Business rule validation (stage ordering, assigned technician)
3. QC independence check via segregation of duties (`requireSodClear()`)
4. Audit row insertion (same transaction)
5. Status field derivation from stage

| Transition           | Target Latency | Notes                                      |
|----------------------|----------------|--------------------------------------------|
| checkin → inspection | < 150ms        | Simple stage advance                       |
| repair → qc         | < 200ms        | Includes SoD check against audit trail     |
| qc → delivery       | < 200ms        | Includes SoD check for QC independence     |
| delivery → invoiced  | < 300ms        | Triggers invoice creation in same request  |

### 7.2 Peak Hour Handling

Workshop peak hours (8:00-10:00 AM, service drop-off) generate 3-5x the normal write volume. The system must maintain response time targets during these peaks without degrading read performance for other users.

### 7.3 Appointment Calendar

The appointment calendar queries `appointments` indexed on `(org_id, scheduled_date)`. Calendar views spanning a month must load within 300ms for branches with up to 50 daily appointments.

## 8. CSV Export Performance

### 8.1 Export Pipeline

CSV exports follow a streaming pattern to avoid memory pressure:

1. Query rows in pages of 200 (`MAX_PAGE_SIZE`)
2. Apply formula injection protection (prefix cells starting with `=`, `+`, `-`, `@` with a tab character)
3. Stream CSV rows to the response
4. Cap at `MAX_EXPORT_ROWS` (50,000 rows) with `X-Export-Truncated: true` header when exceeded

### 8.2 Export Performance Targets

| Export Size     | Target     | Maximum    | Notes                          |
|-----------------|------------|------------|--------------------------------|
| < 1,000 rows   | < 500ms    | 1s         | Typical daily report           |
| 1,000-10,000   | < 2s       | 4s         | Monthly report                 |
| 10,000-50,000  | < 5s       | 10s        | Full data extract              |

### 8.3 Export Rate Limiting

Export endpoints are rate-limited to 5 requests per minute per user to prevent resource exhaustion from concurrent large exports.

## 9. Mobile Performance

### 9.1 Rendering at the 860px Breakpoint

Below the 860px breakpoint, the `DataTable` component switches from an HTML table to `MobileCard` rendering via `MobileList`. This dual-layout approach has specific performance considerations:

- The `useMediaQuery` hook (`MOBILE_QUERY = '(max-width: 860px)'`) must not cause layout thrashing on resize
- `MobileCard` render functions provided per-screen must execute within 5ms per card
- Card lists of 50+ items must render without visible jank (< 16ms per frame)

### 9.2 Mobile Network Targets

| Metric                  | 4G Target | 3G Target | Measurement                |
|-------------------------|-----------|-----------|----------------------------|
| Time to First Byte      | < 400ms   | < 800ms   | Server + network           |
| First Contentful Paint  | < 1.5s    | < 3s      | Initial visible content    |
| Time to Interactive     | < 3s      | < 6s      | Fully interactive          |
| Arabic translation load | < 200ms   | < 500ms   | Lazy import of ~2,122 keys |

### 9.3 Translation Loading Impact

Arabic translations are lazily loaded via dynamic import (`import('@/data/generated/ar')`). The ~2,122-entry translation map plus manual overrides from `ar-overrides.ts` are cached after first load (`arCache`), so the performance cost is incurred only once per session.

## 10. Monitoring and Measurement

### 10.1 Metrics to Track

- API response time percentiles (p50, p95, p99)
- Error rate per endpoint
- Database query duration per tenant
- React Query cache hit ratio
- Bundle size per release
- Core Web Vitals (LCP, FID, CLS)
- State transition duration (workshop-specific)
- CSV export duration and row count

### 10.2 System Health

The `system_health` table tracks:

- Uptime percentage
- Queue depth
- Error rate
- Database size (GB)
- Active session count

### 10.3 Performance Budgets

Performance budgets are enforced at build and deploy time:

| Budget Type        | Threshold  | Enforcement                          |
|--------------------|------------|--------------------------------------|
| Initial JS bundle  | 350KB gz   | Build fails if exceeded              |
| Per-route chunk    | 200KB gz   | Build warning                        |
| Total CSS          | 100KB gz   | Build warning                        |
| LCP regression     | +500ms     | Alert on deployment                  |
| API p95 regression | +100ms     | Alert on deployment                  |

## 11. Cross-References

- [Scalability](./scalability.md) — Horizontal scaling and connection pooling
- [Reliability](./reliability.md) — Error handling and degradation strategies
- [Usability](./usability.md) — Responsive design and perceived performance
- [Workshop Operations](../functional/workshop-operations.md) — Transition performance requirements
- [Finance & Accounting](../functional/finance-accounting.md) — Export performance for financial reports
