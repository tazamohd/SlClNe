# Performance Issues

Diagnosis and resolution guide for performance problems in SALIS AUTO across frontend, backend, database, and mobile layers.

---

## Frontend Performance

### Slow Page Loads

**Symptom:** Initial page load takes more than 3 seconds; users see a blank screen or loading spinner.

**Diagnosis:**
1. Open browser DevTools > Network tab. Check the total transfer size and number of requests.
2. Look at the Performance tab for long tasks blocking the main thread.
3. Check the bundle size in the Vite build output.

**Resolution:**
1. **Enable code splitting and lazy routes.** Each screen should be loaded on demand via React Router's lazy loading. The routes in `app/src/routes/index.tsx` should use `React.lazy()`:
   ```ts
   const JobCards = React.lazy(() => import('../screens/workshop/JobCards'))
   ```
2. **Tree-shake unused icons.** The icon registry contains 260 lucide-react icons. Ensure only imported icons are bundled.
3. **Verify Vite configuration.** In `vite.config.ts`:
   - `build.rollupOptions.output.manualChunks` should separate vendor libraries.
   - `build.target` should be `es2020` or higher for modern browsers.
4. **Check for unnecessary re-renders.** Use React DevTools Profiler to identify components rendering too frequently.
5. **Optimize TailwindCSS.** Ensure `content` paths in `tailwind.config` are precise to avoid scanning unnecessary files, which increases build time.

### Slow Client-Side Navigation

**Symptom:** Switching between screens within the app feels sluggish.

**Diagnosis:**
1. Check React Query cache hits vs. fresh fetches in the DevTools.
2. Profile the component tree for unnecessary re-renders.

**Resolution:**
1. **Configure React Query staleTime.** Setting `staleTime` to 30-60 seconds prevents refetching on every navigation:
   ```ts
   useQuery({ queryKey: ['jobs'], queryFn: fetchJobs, staleTime: 30_000 })
   ```
2. **Prefetch on hover.** For frequently navigated links, prefetch data when the user hovers over the link.
3. **Avoid re-mounting shells.** The `AppShell` (sidebar + topbar) should remain mounted across route changes. Only the content area should swap.
4. **Memoize expensive computations.** Use `useMemo` for derived data like filtered lists or aggregated stats.

### React Query Cache Management

**Symptom:** Memory usage grows over time; the browser tab becomes unresponsive after extended use.

**Root Cause:** React Query retains cached data indefinitely by default.

**Resolution:**
1. Set `gcTime` (garbage collection time) to a reasonable value (default is 5 minutes):
   ```ts
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: { staleTime: 30_000, gcTime: 300_000 }
     }
   })
   ```
2. Invalidate caches when the user switches branches or roles (these change data scope).
3. For large collections (parts, customers, vehicles), limit cached pages to the most recent 3-5 pages.

---

## API / Backend Performance

### Slow API Responses

**Symptom:** API calls take more than 500ms. Visible in the browser Network tab or server access logs.

**Diagnosis:**
1. Check the server response time in the `X-Response-Time` header (if configured).
2. Look at database query execution time with `EXPLAIN ANALYZE`.
3. Check if the slow endpoint is a list with a large dataset.

**Resolution:**
1. **Ensure database indexes exist.** Every tenant-owned table must have an index on `org_id`. The schema defines these:
   ```
   branches_org_idx          ON (org_id)
   users_org_email_idx       ON (org_id, email)           UNIQUE
   job_cards_org_idx         ON (org_id, branch_id, status)
   customers_org_idx         ON (org_id, branch_id)
   parts_org_idx             ON (org_id, branch_id)
   invoices_org_idx          ON (org_id, branch_id, status)
   ```
2. **Enforce pagination.** Never return unbounded result sets. The API defaults to `pageSize=50` with a maximum of 200.
3. **Add composite indexes** for frequently filtered queries (e.g., `org_id + status`, `org_id + branch_id + created_at`).
4. **Optimize `ILIKE` searches.** The `q` parameter uses `ILIKE %term%` which cannot use a B-tree index. For high-volume tables, consider:
   - A trigram index (`pg_trgm` extension): `CREATE INDEX idx_trgm ON customers USING gin (name gin_trgm_ops)`
   - Limiting searchable columns to those listed in the API reference.

### Connection Pooling

**Symptom:** Database connections are exhausted; new requests queue or time out.

**Resolution:**
1. Configure the connection pool size based on expected concurrency. A typical starting point is `max: 20` connections per server instance.
2. Set connection idle timeout to release unused connections.
3. Monitor active connections with `SELECT count(*) FROM pg_stat_activity`.
4. For PGlite (local development), connection pooling is not applicable — PGlite runs in-process.

### Large Dataset Queries

**Symptom:** Endpoints serving tables with tens of thousands of rows respond slowly.

**Resolution:**
1. Always paginate: `?page=1&pageSize=50`.
2. Use filters to narrow results: `?filter[status]=active&filter[branch_id]=<id>`.
3. Use sorting to bring relevant results first: `?sort=created_at:desc`.
4. For aggregate reports, pre-compute totals into summary tables or materialized views rather than scanning full tables.

---

## Database Performance

### Index Optimization

Every table in the schema has indexes defined. Verify these are created and used:

| Table | Index | Columns |
|-------|-------|---------|
| `job_cards` | `job_cards_org_idx` | `(org_id, branch_id, status)` |
| `job_cards` | `job_cards_tech_idx` | `(org_id, assigned_tech_id)` |
| `customers` | `customers_org_idx` | `(org_id, branch_id)` |
| `customers` | `customers_org_phone_idx` | `(org_id, phone)` UNIQUE |
| `vehicles` | `vehicles_org_idx` | `(org_id, branch_id)` |
| `vehicles` | `vehicles_org_plate_idx` | `(org_id, plate)` UNIQUE |
| `vehicles` | `vehicles_org_vin_idx` | `(org_id, vin)` UNIQUE |
| `invoices` | `invoices_org_idx` | `(org_id, branch_id, status)` |
| `parts` | `parts_org_sku_idx` | `(org_id, sku)` UNIQUE |
| `parts` | `parts_org_idx` | `(org_id, branch_id)` |
| `estimates` | `estimates_org_idx` | `(org_id, branch_id, status)` |
| `appointments` | `appointments_date_idx` | `(org_id, branch_id, scheduled_date)` |
| `appointments` | `appointments_bay_idx` | `(org_id, scheduled_date, bay)` |
| `audit_log` | `audit_entity_idx` | `(org_id, entity, entity_id)` |
| `audit_log` | `audit_ts_idx` | `(org_id, ts)` |

### Query Analysis

To diagnose slow queries:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM job_cards
WHERE org_id = '...' AND branch_id = '...' AND status = 'in_progress'
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
```

Look for:
- **Seq Scan** on large tables (should be Index Scan)
- **High buffer reads** indicating cache misses
- **Sort operations** on unindexed columns

### Vacuum and Autovacuum

Soft-deleted rows (`deleted_at IS NOT NULL`) accumulate over time. PostgreSQL's autovacuum handles this, but for tables with high churn:

1. Monitor table bloat: `SELECT pg_size_pretty(pg_total_relation_size('job_cards'))`.
2. Adjust autovacuum thresholds for high-traffic tables if needed.
3. Consider periodic archival of old soft-deleted records.

---

## Mobile Performance

### Reducing DOM Nodes

**Symptom:** Mobile devices struggle with list screens showing many rows.

**Resolution:**
1. Use `mobileCard` renderers on `DataTable`. The mobile layout renders fewer DOM nodes than the desktop `<table>`.
2. Reduce `pageSize` on mobile (e.g., 20 instead of 50).
3. Defer loading of off-screen content.

### Touch Interaction Performance

**Resolution:**
1. Ensure `MobileCard` components use `role="button"` with proper keyboard handlers (already implemented).
2. Avoid hover-dependent interactions on touch devices.
3. Use CSS `touch-action: manipulation` to eliminate the 300ms tap delay.

### Image and Asset Optimization

**Resolution:**
1. Compress images before upload.
2. Use appropriate formats (WebP for photos, SVG for icons).
3. The icon system uses inline SVG from the registry (260 lucide-react icons) — no network requests for icons.

---

## Data Export Performance

### CSV Export Timing Out

**Symptom:** Exporting data to CSV fails or times out for large datasets.

**Root Cause:** The export attempts to serialize more than 50,000 rows.

**Resolution:**
1. The CSV export enforces a 50,000-row limit. Filter the dataset before exporting.
2. Use date range filters to reduce the export scope.
3. For larger exports, split into multiple requests by date range or branch.
4. The export uses the `Accept: text/csv` header. Formula injection protection is applied to cell values (prefixing with `'` when a value starts with `=`, `+`, `-`, `@`, `\t`, or `\r`).

---

## Search Performance

### ILIKE on Non-Indexed Columns

**Symptom:** Search queries are slow on tables with many rows.

**Root Cause:** `ILIKE %term%` cannot use standard B-tree indexes. It performs a sequential scan.

**Resolution:**
1. Only the designated searchable columns per collection are searched (see [API Reference](../../api.md) for the list).
2. For high-volume tables (customers, vehicles, parts), consider adding a `pg_trgm` GIN index:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE INDEX customers_name_trgm ON customers USING gin (name gin_trgm_ops);
   ```
3. Limit the search to the user's branch scope to reduce the scan range (already enforced by RLS).
4. Keep the `q` parameter under 200 characters.

---

## Performance Monitoring Checklist

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| API response time (p95) | < 200ms | Server logs |
| Database query time | < 50ms | `EXPLAIN ANALYZE` |
| Bundle size (gzipped) | < 500KB initial | Vite build output |
| Memory usage (browser tab) | < 150MB | Chrome Task Manager |
| CSV export (50K rows) | < 10s | Server logs |

---

## See Also

- [Common Issues](./common-issues.md) — General troubleshooting
- [Configuration Reference](../reference/configuration-reference.md) — Environment and build settings
- [Data Dictionary](../reference/data-dictionary.md) — Table indexes
