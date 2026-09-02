# SALIS AUTO -- Testing Strategy

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-QA-001                                 |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the testing approach for the SALIS AUTO platform, covering unit, integration, and end-to-end testing across 13 domains, 191+ screens, and 14 RBAC roles. It specifies tool choices, organization conventions, coverage targets, and Saudi-specific test data requirements. Coding conventions are in [Coding Standards](coding-standards.md); architecture context is in [Frontend Architecture](architecture/frontend-architecture.md) and [Backend Architecture](architecture/backend-architecture.md).

---

## 2. Testing Pyramid

```
           /  E2E (Playwright)  \         ~10% of tests
          /  Critical user paths  \       Browser automation
         /    Bilingual + RTL      \
        /__________________________ \
       /  Integration (supertest)    \    ~25% of tests
      /  API endpoints + DB + RBAC    \   Express app + PGlite
     /________________________________ \
    /     Unit (Vitest)                  \  ~65% of tests
   /  Components, hooks, utils, routes    \ Fast, isolated
  /________________________________________ \
```

---

## 3. Unit Testing (Vitest)

### 3.1 Configuration

| Setting              | Value                                      |
|----------------------|--------------------------------------------|
| Framework            | Vitest 1.x                                 |
| Environment          | `jsdom` (frontend), `node` (backend)       |
| Globals              | `true` (describe, it, expect available)    |
| Coverage provider    | `v8`                                       |
| Setup files          | `vitest.setup.ts` (test globals, mocks)    |

### 3.2 Frontend Unit Tests

#### Component Tests

```typescript
// VehicleCard.test.tsx -- co-located with component
import { render, screen } from '@testing-library/react';
import { VehicleCard } from './VehicleCard';
import { mockVehicle } from '@/data/generated/tables';

describe('VehicleCard', () => {
  it('renders vehicle plate number', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('ABC 1234')).toBeInTheDocument();
  });

  it('displays SAR amount formatted from halalas', () => {
    render(<VehicleCard vehicle={{ ...mockVehicle, estimatedCostHalalas: 150000 }} />);
    expect(screen.getByText('SAR 1,500.00')).toBeInTheDocument();
  });
});
```

#### Hook Tests

```typescript
// useWorkOrders.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkOrders } from './useWorkOrders';

describe('useWorkOrders', () => {
  it('returns work orders for the active branch', async () => {
    const { result } = renderHook(() => useWorkOrders({ status: 'active' }));
    await waitFor(() => expect(result.current.workOrders).toHaveLength(3));
  });
});
```

#### Utility Tests

```typescript
// formatCurrency.test.ts
import { formatSAR } from './formatCurrency';

describe('formatSAR', () => {
  it('formats halalas to SAR with 2 decimal places', () => {
    expect(formatSAR(150075)).toBe('SAR 1,500.75');
  });

  it('handles zero', () => {
    expect(formatSAR(0)).toBe('SAR 0.00');
  });

  it('never produces floating-point artifacts', () => {
    // 0.1 + 0.2 !== 0.3 in floating point, but integer halalas avoid this
    expect(formatSAR(30)).toBe('SAR 0.30');
  });
});
```

### 3.3 Backend Unit Tests

#### Route Handler Tests

```typescript
// workOrders.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createWorkOrder } from './workOrders';

describe('createWorkOrder handler', () => {
  it('rejects missing vehicleId with VALIDATION_ERROR', async () => {
    const result = await createWorkOrder({ body: {} });
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('enforces org_id tenant isolation', async () => {
    // Verify query includes WHERE org_id = principal.orgId
    ...
  });
});
```

---

## 4. Integration Testing (supertest)

### 4.1 Configuration

| Setting              | Value                                      |
|----------------------|--------------------------------------------|
| Framework            | supertest + Vitest                         |
| Database             | PGlite (in-process PostgreSQL)             |
| App instance         | `buildApp()` from `app.ts`                 |
| Auth                 | Test JWT tokens generated per role         |
| Isolation            | Each test file gets a fresh PGlite instance|

### 4.2 PGlite Test Harness

PGlite provides an in-process PostgreSQL instance for integration tests, eliminating external database dependencies:

```typescript
// test/setup.ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  const client = new PGlite();
  db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle' });
  // Seed test data
  await seedTestData(db);
});
```

### 4.3 API Endpoint Tests

```typescript
// routes/workOrders.integration.test.ts
import request from 'supertest';
import { buildApp } from '../app';

describe('POST /api/v1/work-orders', () => {
  it('creates a work order with valid data', async () => {
    const res = await request(app)
      .post('/api/v1/work-orders')
      .set('Authorization', `Bearer ${advisorToken}`)
      .send({
        vehicleId: testVehicle.id,
        description: 'Oil change and filter replacement',
        estimatedCostHalalas: 35000,
        branchId: testBranch.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-hjkmnp-tv-z]{26}$/); // ULID format
    expect(res.body.orgId).toBe(testOrg.id); // tenant isolation
  });

  it('rejects requests from Customer role', async () => {
    const res = await request(app)
      .post('/api/v1/work-orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ ... });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
```

---

## 5. E2E Testing (Playwright)

### 5.1 Configuration

| Setting              | Value                                      |
|----------------------|--------------------------------------------|
| Framework            | Playwright 1.x                             |
| Browsers             | Chromium (primary), Firefox (CI only)      |
| Base URL             | `http://localhost:5173` (Vite dev server)  |
| Auth state            | Stored per role, reused across tests       |
| Parallel              | Workers = 4 (CI), 1 (local)              |
| Retries               | 2 on CI, 0 locally                        |

### 5.2 Critical Path Coverage

| Path                                    | Screens Covered              | Roles Tested         |
|-----------------------------------------|------------------------------|----------------------|
| Vehicle check-in to work order creation | Check-In, Inspection, Estimate | Receptionist, Advisor |
| Estimate approval by customer           | Customer Portal, e-Signature | Customer             |
| Repair completion and QC               | Repair, QC Checklist          | Technician, QC Inspector |
| Invoice generation with ZATCA          | Invoice, Payment              | Accountant           |
| Vehicle delivery                        | Delivery, Customer Notification | Advisor            |
| Parts requisition and receiving         | Parts Request, PO, Receiving  | Storekeeper, Procurement |
| User creation and role assignment       | User Management               | Super Admin          |
| Branch creation and configuration       | Branch Settings               | Owner/CEO            |

### 5.3 Bilingual and RTL Testing

Every critical path is run twice: once in English (LTR) and once in Arabic (RTL).

```typescript
// e2e/workshop-lifecycle.spec.ts
for (const locale of ['en', 'ar']) {
  test.describe(`Workshop lifecycle (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?lang=${locale}`);
      // Verify direction attribute
      const dir = locale === 'ar' ? 'rtl' : 'ltr';
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
    });

    test('complete check-in to delivery', async ({ page }) => {
      // ... steps work in both directions
    });
  });
}
```

---

## 6. Mocking Strategy

### 6.1 Frontend: Repository Seam

The `RepositoryProvider` switches between `mockRepository` (generated fixtures) and `httpRepository` (real API calls):

| Context          | Repository     | Data Source                    |
|------------------|----------------|--------------------------------|
| Unit tests       | `mockRepository` | `data/generated/tables.ts`   |
| Dev mode (local) | `mockRepository` | `data/generated/tables.ts`   |
| Integration tests| `httpRepository` | PGlite via Express app        |
| E2E tests        | `httpRepository` | PGlite via Express app        |
| Production       | `httpRepository` | PostgreSQL                     |

### 6.2 Backend: PGlite

Backend tests use PGlite instead of mocking the database layer. This ensures SQL query correctness, Drizzle ORM behavior, and tenant isolation logic are tested against a real PostgreSQL-compatible engine.

### 6.3 External Services

| Service        | Mock Method                    | Fidelity        |
|----------------|--------------------------------|-----------------|
| ZATCA API      | MSW (Mock Service Worker)      | Request/response shape |
| HyperPay       | MSW                            | Success + error paths  |
| Unifonic SMS   | MSW                            | OTP delivery mock      |
| Email (SES)    | Spy/stub                       | Verify send called     |

---

## 7. Test Data Management

### 7.1 Saudi-Specific Test Fixtures

All test data uses Saudi-appropriate values:

| Data Type          | Test Value Examples                              |
|--------------------|--------------------------------------------------|
| Currency           | `150000` (1,500.00 SAR in halalas)               |
| Phone numbers      | `+966512345678`, `+966551234567`                 |
| Names (EN)         | `Mohammed Al-Rashid`, `Fatima Al-Saud`           |
| Names (AR)         | `محمد الراشد`, `فاطمة آل سعود`                   |
| Cities             | `Riyadh`, `Jeddah`, `Dammam`, `Mecca`            |
| License plates     | `ABC 1234` (Saudi format)                        |
| VIN                | `1HGCM82633A123456`                              |
| VAT number         | `300000000000003` (15-digit ZATCA format)         |
| Org ID             | ULID: `01HN8K4Y6V...`                            |
| Dates              | ISO 8601 UTC, displayed in AST (UTC+3)           |

### 7.2 Fixture Generation

Test fixtures are derived from `data/generated/tables.ts`, ensuring consistency between the design-data pipeline output and test data:

```typescript
// test/fixtures.ts
import { vehicles, customers, workOrders } from '@/data/generated/tables';

export const testVehicle = vehicles[0];
export const testCustomer = customers[0];
export const testWorkOrder = workOrders[0];
```

---

## 8. Testing RBAC

### 8.1 Role Test Matrix

Each API endpoint is tested against all 14 roles to verify correct access:

| Endpoint                  | Owner | SuperAdmin | Manager | Advisor | Tech | QC  | Store | Acct | HR  | Recep | Call | Proc | Supplier | Customer |
|---------------------------|-------|------------|---------|---------|------|-----|-------|------|-----|-------|------|------|----------|----------|
| `POST /work-orders`       | Y     | Y          | Y       | Y       | N    | N   | N     | N    | N   | Y     | Y    | N    | N        | N        |
| `GET /invoices`           | Y     | Y          | Y       | Y       | N    | N   | N     | Y    | N   | N     | N    | N    | N        | Own      |
| `POST /parts`             | Y     | Y          | Y       | N       | N    | N   | Y     | N    | N   | N     | N    | Y    | N        | N        |

Y = Allowed, N = Forbidden (403), Own = Only own records

### 8.2 RBAC Test Generation

Tests are generated from `data/generated/rbac.ts` to ensure the test matrix matches the design-data pipeline:

```typescript
import { rbacMatrix } from '@/data/generated/rbac';

for (const [endpoint, permissions] of Object.entries(rbacMatrix)) {
  for (const [role, allowed] of Object.entries(permissions)) {
    it(`${role} ${allowed ? 'can' : 'cannot'} access ${endpoint}`, async () => {
      const token = generateTestToken(role);
      const res = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(allowed ? 200 : 403);
    });
  }
}
```

---

## 9. Testing RTL Layout

### 9.1 Visual Regression

Playwright captures screenshots in both LTR and RTL for visual comparison:

```typescript
test('sidebar renders correctly in RTL', async ({ page }) => {
  await page.goto('/?lang=ar');
  await expect(page.locator('[data-testid="sidebar"]')).toHaveScreenshot('sidebar-rtl.png');
});
```

### 9.2 RTL-Specific Assertions

| Check                                | Method                                     |
|--------------------------------------|--------------------------------------------|
| Text direction                       | `expect(html).toHaveAttribute('dir', 'rtl')` |
| Sidebar position                     | Verify sidebar is on the right side        |
| Logical properties                   | No hardcoded `left`/`right` in CSS         |
| Icon mirroring                       | Directional icons (arrows) are flipped     |
| Number formatting                    | Arabic-Indic numerals where appropriate    |

---

## 10. Coverage Targets

| Test Level       | Target    | Measurement                           |
|------------------|-----------|---------------------------------------|
| Unit tests       | >= 80%    | Line coverage via `vitest --coverage`  |
| Integration tests| >= 90%    | API endpoint coverage (routes hit)     |
| E2E tests        | 100%      | Critical path coverage (Section 5.2)   |
| RBAC tests       | 100%      | All 14 roles x all protected endpoints |
| RTL tests        | >= 80%    | Screens with RTL screenshot tests      |

---

## 11. CI Integration

### 11.1 GitHub Actions Pipeline

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm test              # Vitest unit + integration
    - run: pnpm test:coverage     # Coverage report
    - run: pnpm test:e2e          # Playwright
    - uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/
```

### 11.2 Test Gates

| Gate                  | Condition                        | Blocks        |
|-----------------------|----------------------------------|---------------|
| Unit tests pass       | All tests green                  | PR merge      |
| Coverage threshold    | >= 80% line coverage             | PR merge      |
| E2E tests pass        | All critical paths green         | Deploy to staging |
| RBAC matrix pass      | 14 roles x all endpoints         | Deploy to production |

---

## 12. Related Documents

- [Coding Standards](coding-standards.md) -- File naming, test file co-location
- [Frontend Architecture](architecture/frontend-architecture.md) -- Repository seam, provider chain
- [Backend Architecture](architecture/backend-architecture.md) -- Middleware, routes, PGlite
- [API Versioning](api-versioning.md) -- Endpoint catalog for integration tests
- [Incident Response](incident-response.md) -- Post-mortem triggers for test gaps
