# SALIS AUTO -- Test Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the testing strategy for the SALIS AUTO platform, covering test types, tools, coverage targets, environments, and the test execution schedule. It ensures that all 13 domains, 14 roles, and 191+ screens are validated for correctness, performance, security, accessibility, and regulatory compliance.

---

## 2. Testing Strategy Overview

### 2.1 Test Pyramid

```
           /  E2E Tests  \           Playwright (critical paths)
          / (Playwright)   \
         /------------------\
        / Integration Tests  \       Supertest (API routes)
       / (Supertest)          \
      /------------------------\
     /     Unit Tests           \    Vitest (logic, hooks, utils)
    / (Vitest)                   \
   /------------------------------\
```

| Layer        | Tool       | Scope                                    | Coverage Target |
|--------------|------------|------------------------------------------|-----------------|
| Unit         | Vitest     | Functions, hooks, utils, business logic  | >= 80%          |
| Integration  | Supertest  | API endpoints, middleware, DB queries    | >= 70%          |
| E2E          | Playwright | Critical user flows, cross-domain paths  | 100% critical   |

### 2.2 Additional Test Types

| Type              | Tool / Method        | Scope                                      |
|-------------------|----------------------|--------------------------------------------|
| Visual regression | Playwright screenshots| RTL layout, component rendering            |
| Performance       | Lighthouse + k6      | Page load, API throughput                  |
| Security          | OWASP ZAP + manual   | OWASP Top 10, RBAC, tenant isolation       |
| Accessibility     | axe-core + manual    | WCAG 2.1 AA compliance                    |
| ZATCA compliance  | ZATCA sandbox API    | Invoice XML, QR, hash chain validation     |
| Load              | k6                   | Concurrent users, sustained throughput     |
| UAT               | Manual (role-based)  | Business acceptance per role               |

---

## 3. Unit Testing (Vitest)

### 3.1 Scope

Unit tests cover isolated functions, React hooks, utility modules, and business logic without external dependencies.

### 3.2 Key Test Areas

| Area                               | Examples                                                |
|------------------------------------|---------------------------------------------------------|
| Authentication logic               | JWT validation, token expiry, refresh rotation          |
| RBAC engine                        | `can()` hook, role permission checks, scope filtering   |
| Workshop state machine             | Valid/invalid transitions, guard conditions              |
| Financial arithmetic               | Halala integer operations, VAT 15% calculation, rounding|
| ZATCA encoding                     | TLV encoding, QR data generation, hash chain linking    |
| Approval chain routing             | SAR limit boundary checks (5K, 10K, 20K, 25K, 50K)     |
| Validation functions               | +966 phone, Saudi plates, email, Saudi ID               |
| i18n utilities                     | Key lookup, locale formatting, RTL direction detection  |
| Date/time utilities                | Saudi timezone (AST UTC+3), Hijri date conversion       |

### 3.3 Configuration

```typescript
// vitest.config.ts (key settings)
{
  test: {
    globals: true,
    environment: 'jsdom',          // React components
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
}
```

### 3.4 Naming Convention

```
[module].test.ts          // Unit tests for module
[Component].test.tsx      // Unit tests for React component
```

---

## 4. Integration Testing (Supertest)

### 4.1 Scope

Integration tests validate API endpoints with the full middleware stack (auth, RBAC, validation) against a test database.

### 4.2 Key Test Areas

| Area                               | Test Focus                                              |
|------------------------------------|---------------------------------------------------------|
| Auth endpoints                     | Login, token refresh, MFA, password reset               |
| CRUD endpoints (all domains)       | Create, read, update, delete with valid/invalid payloads|
| RBAC enforcement                   | Each of 14 roles: authorized access + unauthorized rejection |
| Tenant isolation                   | Cross-org and cross-branch data access prevention       |
| Separation of duties               | 6 SoD pairs: conflicting actions by same user blocked   |
| Field-level redaction              | 7 rules: sensitive fields masked for unauthorized roles |
| Approval chain                     | PO routing at each SAR boundary value                   |
| ZATCA integration                  | Invoice submission to sandbox, clearance response       |
| Data scopes                        | 8 scopes return correct data per role/context           |
| Input validation                   | Malformed payloads, boundary values, injection attempts |

### 4.3 Test Database

```
- PGlite for CI (fast, no external dependency)
- PostgreSQL for staging integration tests
- Each test suite uses transactions that rollback (no test data pollution)
- Seed data includes: 2 orgs, 3 branches, 14 users (one per role), sample vehicles/jobs
```

### 4.4 Example Test Structure

```typescript
describe('POST /api/invoices', () => {
  it('stores amount as integer halalas', async () => {
    // SAR 1,234.56 -> 123456 halalas
  });

  it('rejects when Advisor exceeds SAR 5,000 approval limit', async () => {
    // 422 with approval routing info
  });

  it('blocks Technician from creating invoices (RBAC)', async () => {
    // 403 Forbidden
  });

  it('prevents cross-branch invoice access (tenant isolation)', async () => {
    // Branch A user cannot read Branch B invoice
  });
});
```

---

## 5. End-to-End Testing (Playwright)

### 5.1 Scope

E2E tests validate complete user flows across the frontend and backend, simulating real user interactions in a browser.

### 5.2 Critical Path Test Suite

| Test ID  | Critical Path                                          | Roles Involved          |
|----------|-------------------------------------------------------|-------------------------|
| E2E-001  | Login (EN) -> Dashboard -> Logout                     | Service Advisor         |
| E2E-002  | Login (AR/RTL) -> Dashboard -> Logout                 | Service Advisor         |
| E2E-003  | Job lifecycle: Check-In -> Inspect -> Estimate -> Repair -> QC -> Delivery | Advisor, Tech, QC |
| E2E-004  | Invoice generation from job estimate                   | Advisor, Accountant     |
| E2E-005  | ZATCA invoice: create -> XML generate -> sandbox submit | Accountant             |
| E2E-006  | Customer estimate approval (6-step e-signature)        | Customer                |
| E2E-007  | PO approval chain (SAR 10K -> 20K -> 50K escalation)  | Storekeeper, Proc, Mgr  |
| E2E-008  | Customer registration + vehicle + check-in             | Receptionist, Advisor   |
| E2E-009  | Refresh token rotation (session continuity)            | Any authenticated role  |
| E2E-010  | Role switching: Manager sees branch data only          | Manager, Owner          |
| E2E-011  | Multi-tenant isolation: Org A cannot see Org B data    | Super Admin (2 orgs)    |
| E2E-012  | Notification delivery (in-app) on job state change     | Advisor, Technician     |
| E2E-013  | Report export (PDF) with correct data scope            | Owner, Manager          |
| E2E-014  | Leave request -> Manager approval -> Balance update    | Employee, Manager       |
| E2E-015  | Language toggle mid-session (all screens preserve state)| Any role               |

### 5.3 Visual Regression Tests

| Test Area                          | Verification                                  |
|------------------------------------|-----------------------------------------------|
| Dashboard (Owner, Manager)         | EN and AR screenshots match baseline          |
| Job card form                      | RTL field alignment, label positioning        |
| Invoice print preview              | Bilingual layout, QR code placement           |
| Data tables (all domains)          | Column order, scroll behavior in RTL          |
| Navigation menu                    | RTL drawer, icon mirroring                    |
| Customer portal (estimate view)    | Mobile + desktop, EN + AR                     |

### 5.4 Configuration

```typescript
// playwright.config.ts (key settings)
{
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'npm run preview',
    port: 4173
  }
}
```

---

## 6. Specialized Testing

### 6.1 ZATCA Compliance Testing

| Test Case                          | Expected Result                               |
|------------------------------------|-----------------------------------------------|
| Standard invoice XML generation    | Validates against ZATCA UBL 2.1 XSD           |
| Credit note XML generation         | Correct reference to original invoice         |
| QR code TLV encoding              | Decodes to correct seller, VAT #, amounts     |
| Hash chain continuity              | Each invoice hash chains to previous           |
| Sandbox clearance API              | Clearance response with no validation errors   |
| Sandbox reporting API              | Reporting acknowledgment received              |
| Invoice counter sequence           | No gaps, no duplicates across branches         |

Testing frequency: Nightly automated run against ZATCA sandbox.

### 6.2 Security Testing

| Test Area                          | Method                | Tool              |
|------------------------------------|-----------------------|--------------------|
| SQL injection                      | Automated + manual    | OWASP ZAP + Supertest |
| XSS                               | Automated             | OWASP ZAP          |
| CSRF                               | Manual                | Supertest          |
| JWT manipulation                   | Manual                | Custom scripts     |
| Tenant isolation                   | Manual pen test       | Custom scripts     |
| RBAC bypass attempts               | Automated + manual    | Supertest + manual |
| Rate limiting                      | Automated             | k6                 |
| Sensitive data exposure             | Manual                | API response audit |

### 6.3 Performance Testing

| Scenario                           | Tool       | Target                        |
|------------------------------------|------------|-------------------------------|
| API response time (CRUD)           | k6         | P95 < 500ms                  |
| API response time (reports/analytics)| k6       | P95 < 2000ms                 |
| Concurrent users (100)            | k6         | < 1% error rate              |
| Frontend page load                 | Lighthouse | Score >= 80                  |
| Frontend bundle size               | Vite build | < 500KB gzipped (initial)    |
| Database query time                | pg_stat    | P95 < 100ms                  |

### 6.4 Accessibility Testing

| Criterion                          | Tool / Method         | Target               |
|------------------------------------|-----------------------|----------------------|
| Color contrast                     | axe-core              | WCAG AA (4.5:1)      |
| Keyboard navigation                | Manual                | All interactive elements |
| Screen reader compatibility        | NVDA / VoiceOver      | Key flows readable   |
| Focus management                   | Manual                | Correct trap/return  |
| ARIA attributes                    | axe-core              | Zero violations      |
| Form labels                        | axe-core              | 100% labeled         |

---

## 7. Test Environment

| Component          | Test Environment                              |
|--------------------|-----------------------------------------------|
| Frontend           | Vite dev server or preview build              |
| Backend            | Express with test config                      |
| Database           | PGlite (CI) / PostgreSQL (staging)            |
| External services  | Mock adapters (SMS, WhatsApp, ZATCA in CI)    |
| Browsers           | Chromium, Safari, Mobile Chrome, Mobile Safari |

---

## 8. Test Execution Schedule

| Activity                    | Trigger                | Environment | Owner |
|-----------------------------|------------------------|-------------|-------|
| Unit tests (Vitest)         | Every PR               | CI          | Dev   |
| Integration tests (Supertest)| Every PR              | CI          | Dev   |
| E2E critical paths (PW)    | Nightly                | Staging     | QA    |
| Visual regression (PW)     | Pre-sprint-review      | Staging     | QA    |
| ZATCA sandbox validation    | Nightly                | CI          | Finance|
| Security scan (ZAP)        | Per stage gate         | Staging     | Security|
| Performance (Lighthouse)    | Per sprint             | Staging     | DevOps|
| Load test (k6)             | Pre-release            | Staging     | DevOps|
| Accessibility (axe-core)   | Per new screen         | CI          | QA    |
| UAT                         | Pre-go-live            | Staging     | PO+QA |
| Penetration test            | G3, G7                 | Staging     | Security|

---

## 9. Defect Management

| Priority | SLA          | Examples                                          |
|----------|-------------|---------------------------------------------------|
| P1       | 4 hours     | Auth bypass, data leak, ZATCA failure, system down|
| P2       | 24 hours    | Major feature broken, no workaround               |
| P3       | Within sprint| Partial feature break, workaround available       |
| P4       | Backlog     | Cosmetic, minor UX                                |

Defects are tracked in Jira/Linear with mandatory fields: priority, steps to reproduce, expected vs. actual result, browser/device, language (EN/AR), screenshot.

---

## 10. Test Reporting

| Report                    | Frequency    | Audience            | Content                          |
|---------------------------|-------------|---------------------|----------------------------------|
| CI test results           | Every PR    | Dev team            | Pass/fail, coverage delta        |
| Sprint test summary       | Biweekly    | Scrum team + PM     | Coverage, bug count, trends      |
| Stage gate quality report | Per gate    | Project Board       | Full quality metrics dashboard   |
| UAT report                | Pre-go-live | All stakeholders    | Pass rate, open issues, sign-off |

---

## 11. References

- [Definition of Done](../agile/definition-of-done.md)
- [Quality Register](../prince2/quality-register.md)
- [Release Plan](release-plan.md)
- [Deployment Plan](deployment-plan.md)
- [Risk Register](../pmp/risk-register.md)
