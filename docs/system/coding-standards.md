# SALIS AUTO -- Coding Standards

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-DEV-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the TypeScript coding conventions, file organization, component patterns, and review criteria for the SALIS AUTO codebase. All contributors must follow these standards. The architecture context is in [Frontend Architecture](architecture/frontend-architecture.md) and [Backend Architecture](architecture/backend-architecture.md).

---

## 2. TypeScript Configuration

### 2.1 Strict Mode

TypeScript strict mode is enabled globally (`"strict": true` in `tsconfig.json`). This enforces:

- `strictNullChecks` -- no implicit `null`/`undefined`
- `noImplicitAny` -- all variables and parameters must have explicit or inferred types
- `strictFunctionTypes` -- contravariant parameter checking
- `strictPropertyInitialization` -- class properties must be initialized
- `noUncheckedIndexedAccess` -- array/object index access returns `T | undefined`

### 2.2 Additional Compiler Options

```json
{
  "target": "ES2022",
  "module": "ESNext",
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "resolveJsonModule": true,
  "isolatedModules": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true
}
```

---

## 3. File Organization

### 3.1 Directory Structure

```
app/src/
  screens/                  # Organized by domain
    workshop/               # Workshop Operations screens
    registry/               # Registry screens
    finance/                # Finance screens
    accounting/             # Accounting screens
    crm/                    # CRM & Marketing screens
    admin/                  # Administration screens
    auth/                   # Authentication screens
    ai/                     # AI Platform screens
    parts/                  # Parts & Inventory screens
    call-center/            # Call Center screens
    reports/                # Reports & Analytics screens
    hr/                     # Team & HR screens
    portals/                # Portal screens
  components/
    ui/                     # Primitives (Button, Input, Modal, Badge, etc.)
    shell/                  # Layout (Sidebar, Header, PageShell, etc.)
  data/
    generated/              # Auto-generated (screens.ts, nav.ts, rbac.ts, tables.ts, ar.ts, badges.ts)
    http/                   # API client layer
  providers/                # React context providers
  hooks/                    # Shared custom hooks

server/src/
  routes/                   # API route handlers
  db/                       # Drizzle ORM schema and migrations
  middleware/               # Express/Fastify middleware
  services/                 # Business logic layer
  utils/                    # Shared utilities
```

### 3.2 File Naming Conventions

| Category             | Convention               | Example                        |
|----------------------|--------------------------|--------------------------------|
| React components     | PascalCase               | `VehicleCheckIn.tsx`           |
| Custom hooks         | camelCase with `use-` prefix | `useWorkOrders.ts`         |
| Generated data files | lowercase                | `screens.ts`, `nav.ts`, `rbac.ts` |
| Utility files        | camelCase                | `formatCurrency.ts`            |
| Test files           | Same name + `.test`      | `VehicleCheckIn.test.tsx`      |
| Route handlers       | camelCase                | `workOrders.ts`                |
| DB schema files      | camelCase                | `workOrders.ts` (Drizzle schema) |
| Types/interfaces     | camelCase file, PascalCase type | `workOrder.types.ts` -> `WorkOrder` |
| Constants            | camelCase file, UPPER_SNAKE in code | `config.ts` -> `MAX_RETRY_COUNT` |

### 3.3 Code vs. SQL Naming

| Context        | Convention   | Example                              |
|----------------|-------------|--------------------------------------|
| TypeScript code| camelCase   | `workOrderId`, `createdAt`, `orgId`  |
| SQL columns    | snake_case  | `work_order_id`, `created_at`, `org_id` |
| SQL tables     | snake_case  | `work_orders`, `audit_logs`          |
| Drizzle schema | camelCase   | `workOrders` (table variable), maps to `work_orders` |

Drizzle ORM handles the mapping between camelCase TypeScript and snake_case SQL automatically.

---

## 4. Component Patterns

### 4.1 Functional Components Only

All React components are functional components. Class components are not used.

```typescript
// Correct
export function VehicleCard({ vehicle }: VehicleCardProps) {
  return <div>...</div>;
}

// Also correct (for non-exported or simple components)
const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  return <div>...</div>;
};

// Not allowed
class VehicleCard extends React.Component { ... }
```

### 4.2 Hooks for Logic

Business logic lives in custom hooks, not in component bodies:

```typescript
// Hook encapsulates data fetching and state
function useWorkOrders(filters: WorkOrderFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => api.getWorkOrders(filters),
    staleTime: 60_000,
  });
  return { workOrders: data, isLoading, error };
}

// Component is thin -- rendering only
function WorkOrderList() {
  const { workOrders, isLoading } = useWorkOrders({ status: 'active' });
  if (isLoading) return <Skeleton />;
  return <DataTable rows={workOrders} columns={columns} />;
}
```

### 4.3 Context for Shared State

Cross-component state uses React Context via the providers in `providers/`:

- `SessionProvider` -- auth state, current user role, demo mode
- `PreferencesProvider` -- locale (EN/AR), theme, RTL direction
- `RepositoryProvider` -- mock vs. HTTP data source seam
- `ToastProvider` -- notification queue
- `ModalProvider` -- shared modal state

New contexts require Tech Lead approval and must be added to the provider chain in `App.tsx`.

### 4.4 Props Interface Convention

```typescript
// Props interface named [ComponentName]Props
interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect?: (id: string) => void;
  showActions?: boolean;
}

// Exported alongside the component
export function VehicleCard({ vehicle, onSelect, showActions = true }: VehicleCardProps) {
  ...
}
```

---

## 5. Error Handling

### 5.1 Zod Validation at Boundaries

All external data is validated with Zod at system boundaries:

```typescript
// API request validation (server-side)
const CreateWorkOrderSchema = z.object({
  vehicleId: z.string().ulid(),
  description: z.string().min(1).max(500),
  estimatedCostHalalas: z.number().int().nonnegative(),
  branchId: z.string().ulid(),
});

// API response validation (client-side, optional but recommended)
const WorkOrderResponseSchema = z.object({
  id: z.string().ulid(),
  status: z.enum(['draft', 'in_progress', 'completed', 'cancelled']),
  ...
});
```

### 5.2 Error Envelope Format

All API errors follow a standard envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Estimated cost must be a positive integer (halalas)",
    "field": "estimatedCostHalalas",
    "requestId": "req_01HN..."
  }
}
```

### 5.3 Error Code Catalog

| Code                  | HTTP Status | Meaning                                    |
|-----------------------|-------------|--------------------------------------------|
| `VALIDATION_ERROR`    | 400         | Request body or query params invalid       |
| `UNAUTHORIZED`        | 401         | Missing or expired JWT                     |
| `FORBIDDEN`           | 403         | Role lacks permission for this action      |
| `NOT_FOUND`           | 404         | Resource does not exist or wrong `org_id`  |
| `CONFLICT`            | 409         | Optimistic concurrency violation           |
| `RATE_LIMITED`         | 429         | Request budget exhausted for `orgId:IP`    |
| `INTERNAL_ERROR`      | 500         | Unhandled server error                     |

---

## 6. Import Organization

Imports are ordered in four groups, separated by blank lines:

```typescript
// 1. React and built-in modules
import { useState, useCallback } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal modules (components, hooks, data, providers)
import { Button } from '@/components/ui/Button';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { formatSAR } from '@/utils/formatCurrency';

// 4. Types (type-only imports)
import type { WorkOrder } from '@/types/workOrder.types';
```

ESLint enforces this order via `eslint-plugin-import` with the `import/order` rule.

---

## 7. Saudi-Specific Conventions

### 7.1 Currency (SAR)

- All monetary values stored as **integer halalas** (1 SAR = 100 halalas)
- Display formatting: `formatSAR(amountHalalas)` utility
- Never use floating-point for currency arithmetic
- Zod schema: `z.number().int().nonnegative()` for money fields

### 7.2 Phone Numbers

- Saudi format: `+966XXXXXXXXX` (9 digits after country code)
- Validation: `z.string().regex(/^\+966\d{9}$/)`
- Display: `+966 5X XXX XXXX` (formatted with spaces)

### 7.3 Arabic/RTL

- All user-facing strings extracted to i18n keys
- Arabic translations in `data/generated/ar.ts`
- CSS uses logical properties (`margin-inline-start`, `padding-inline-end`)
- Layout direction set via `PreferencesProvider` (`dir="rtl"` on root)
- Test both LTR and RTL in Playwright (see [Testing Strategy](testing-strategy.md))

### 7.4 Dates and Times

- Storage: UTC ISO 8601 strings
- Display: Arabian Standard Time (AST, UTC+3) formatted per locale
- Hijri calendar support for display where required (not for storage)

---

## 8. PR Process

### 8.1 Branch Naming

```
<type>/<domain>/<short-description>

Examples:
  feat/workshop/add-qc-checklist
  fix/finance/zatca-hash-chain-order
  refactor/auth/jwt-refresh-logic
  chore/devops/ci-playwright-cache
```

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`

### 8.2 Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

feat(workshop): add QC inspection checklist screen
fix(finance): correct ZATCA hash chain sequence order
refactor(auth): extract JWT verification to middleware
test(rbac): add permission tests for all 14 roles
```

### 8.3 PR Requirements

- [ ] PR title follows commit message format
- [ ] Description explains the "why", not just the "what"
- [ ] All new/modified code has TypeScript types (no `any`)
- [ ] Zod schemas added for new API request/response shapes
- [ ] Unit tests for new utilities and hooks
- [ ] Arabic translation keys added for new user-facing strings
- [ ] RTL layout verified for new UI components
- [ ] No console.log or debugger statements
- [ ] No hardcoded SAR amounts (use halala integers)
- [ ] `org_id` filtering applied to all new queries

---

## 9. Code Review Criteria

### 9.1 Review Checklist

| Category           | Check                                                         |
|--------------------|---------------------------------------------------------------|
| Correctness        | Does the code do what the ticket describes?                   |
| Types              | Are types accurate? No `any`, `as unknown as`, or `// @ts-ignore`? |
| Security           | Is `org_id` filtering applied? RBAC checked? Input validated? |
| Performance        | Unnecessary re-renders? Missing `useMemo`/`useCallback`?     |
| i18n               | All strings in i18n keys? AR translations provided?           |
| RTL                | Logical CSS properties? No hardcoded `left`/`right`?          |
| Testing            | Adequate test coverage? Edge cases handled?                   |
| ZATCA              | Invoice changes validated against Phase 2 spec?               |
| Naming             | Follows conventions from Section 3.2?                         |
| Error handling     | Zod at boundaries? Error envelope format followed?            |

### 9.2 Review Turnaround

- **Standard PRs:** Reviewed within 1 business day
- **Hotfixes (P1/P2):** Reviewed within 2 hours
- **Minimum reviewers:** 1 (Tech Lead for architectural changes, domain owner otherwise)

---

## 10. Linting and Formatting

### 10.1 ESLint Configuration

Key rules enforced:

| Rule                              | Setting                      |
|-----------------------------------|------------------------------|
| `@typescript-eslint/no-explicit-any` | error                     |
| `@typescript-eslint/strict-boolean-expressions` | error         |
| `import/order`                    | error (enforces Section 6)   |
| `react-hooks/rules-of-hooks`     | error                        |
| `react-hooks/exhaustive-deps`    | warn                         |
| `no-console`                      | error (except `console.error`)|

### 10.2 Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 10.3 Pre-Commit Hooks

Husky + lint-staged runs on every commit:

1. `eslint --fix` on staged `.ts`/`.tsx` files
2. `prettier --write` on staged files
3. `tsc --noEmit` type check (full project)

---

## 11. Related Documents

- [Frontend Architecture](architecture/frontend-architecture.md) -- Provider chain, routing, component structure
- [Backend Architecture](architecture/backend-architecture.md) -- Middleware, routes, error handling
- [Testing Strategy](testing-strategy.md) -- Test file conventions and coverage
- [API Versioning](api-versioning.md) -- API naming and endpoint conventions
