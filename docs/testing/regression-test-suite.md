# SALIS AUTO -- Regression Test Suite

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-TST-004                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Purpose

This document defines the regression test catalog for the SALIS AUTO platform, covering smoke tests, critical path tests per domain, cross-browser compatibility, RTL/bilingual validation, RBAC enforcement across 14 roles, and responsive layout tests. It establishes test naming conventions, priority levels, and automation status to ensure that new changes do not break existing functionality across the platform's 13 domains and 191+ screens.

**Related documents:**
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Domain Reference](../domains.md)
- [UAT Test Scripts](uat-test-scripts.md)

---

## 2. Test Naming Convention

### 2.1 Format

```
REG-[DOMAIN]-[TYPE]-[NUMBER]
```

| Segment | Values | Description |
|---------|--------|-------------|
| REG | Fixed | Regression test prefix |
| DOMAIN | SMK, WRK, REG, FIN, ACC, CRM, ADM, AUTH, AI, INV, CC, RPT, HR, PTL, XBR, RTL, RBAC, RSP | Domain or category abbreviation |
| TYPE | SMOKE, CRIT, FUNC, UI, SEC | Test type |
| NUMBER | 001-999 | Sequential within domain+type |

### 2.2 Examples

- `REG-SMK-SMOKE-001` -- Login and dashboard load
- `REG-WRK-CRIT-001` -- Job lifecycle check-in to delivery
- `REG-XBR-UI-001` -- Chrome 90+ dashboard rendering
- `REG-RTL-UI-001` -- Arabic sidebar position verification
- `REG-RBAC-SEC-001` -- Technician cannot access invoices

### 2.3 Priority Levels

| Priority | Definition | Execution Frequency | Automation Target |
|----------|-----------|--------------------|--------------------|
| P1 | Critical business path; failure blocks release | Every PR + nightly | 100% automated |
| P2 | Important functionality; workaround may exist | Nightly + pre-release | >= 90% automated |
| P3 | Standard functionality; moderate business impact | Pre-release | >= 70% automated |
| P4 | Low impact; cosmetic or edge case | Pre-major-release | Best effort |

---

## 3. Smoke Tests

Smoke tests are the first line of defense, run on every PR merge to verify the application is fundamentally operational.

| Test ID | Test Name | Steps | Expected Result | Priority | Automated |
|---------|-----------|-------|-----------------|----------|-----------|
| REG-SMK-SMOKE-001 | Login (EN) | Navigate to `/login`. Enter valid credentials. Submit. | Dashboard loads. JWT issued. | P1 | Yes (Playwright) |
| REG-SMK-SMOKE-002 | Login (AR/RTL) | Navigate to `/login?lang=ar`. Enter valid credentials. Submit. | Dashboard loads in RTL. `dir="rtl"` on `<html>`. | P1 | Yes (Playwright) |
| REG-SMK-SMOKE-003 | Dashboard load | After login, verify dashboard renders with KPI cards. | Dashboard renders within 3 seconds. No console errors. | P1 | Yes (Playwright) |
| REG-SMK-SMOKE-004 | Sidebar navigation | Click each top-level nav item. | Each route loads without 404 or error screen. | P1 | Yes (Playwright) |
| REG-SMK-SMOKE-005 | Logout | Click logout. Confirm. | Redirected to `/login`. Token cleared. | P1 | Yes (Playwright) |
| REG-SMK-SMOKE-006 | API health | `GET /api/health` | Returns 200 with system status. | P1 | Yes (Supertest) |
| REG-SMK-SMOKE-007 | Database connectivity | API call that queries database. | Returns data (not connection error). | P1 | Yes (Supertest) |
| REG-SMK-SMOKE-008 | Token refresh | Wait for access token expiry (or simulate). Perform action. | New token issued silently. Action succeeds. | P1 | Yes (Playwright) |

---

## 4. Critical Path Tests by Domain

### 4.1 Workshop (Operations)

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-WRK-CRIT-001 | Job lifecycle | Full check-in through delivery (6 stages) | P1 | Yes (Playwright) |
| REG-WRK-CRIT-002 | Job card creation | Create job card with customer/vehicle | P1 | Yes (Playwright) |
| REG-WRK-CRIT-003 | Stage transition validation | Attempt invalid transitions (skip stages) | P1 | Yes (Supertest) |
| REG-WRK-CRIT-004 | Estimate creation | Create multi-line estimate with VAT | P2 | Yes (Playwright) |
| REG-WRK-CRIT-005 | Appointment CRUD | Create, view, edit, delete appointment | P2 | Yes (Playwright) |
| REG-WRK-CRIT-006 | SoD: repair vs QC | Technician cannot QC own repair | P1 | Yes (Supertest) |
| REG-WRK-CRIT-007 | WorkflowStepper rendering | Stepper reflects current stage accurately | P2 | Yes (Playwright) |

### 4.2 Registry (Customers & Vehicles)

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-REG-CRIT-001 | Customer CRUD | Create, read, update customer | P1 | Yes (Playwright) |
| REG-REG-CRIT-002 | Vehicle CRUD | Create, read, update vehicle | P1 | Yes (Playwright) |
| REG-REG-CRIT-003 | Customer-vehicle link | Vehicle linked to customer profile | P2 | Yes (Supertest) |
| REG-REG-CRIT-004 | Saudi phone validation | +966 format enforced | P2 | Yes (Vitest) |
| REG-REG-CRIT-005 | Saudi plate validation | Saudi plate format enforced | P2 | Yes (Vitest) |
| REG-REG-CRIT-006 | Customer search | Search by name, phone, plate number | P2 | Yes (Playwright) |

### 4.3 Finance

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-FIN-CRIT-001 | Invoice creation | Create invoice with line items and VAT 15% | P1 | Yes (Playwright) |
| REG-FIN-CRIT-002 | ZATCA XML generation | Invoice generates valid UBL 2.1 XML | P1 | Yes (Supertest) |
| REG-FIN-CRIT-003 | ZATCA sandbox submission | Invoice clears ZATCA sandbox | P1 | Yes (Supertest) |
| REG-FIN-CRIT-004 | QR code TLV | QR decodes to correct seller, VAT#, amounts | P1 | Yes (Vitest) |
| REG-FIN-CRIT-005 | Hash chain continuity | Each invoice hash chains to previous | P1 | Yes (Supertest) |
| REG-FIN-CRIT-006 | Halalas arithmetic | SAR 1,234.56 stored as 123456 halalas | P1 | Yes (Vitest) |
| REG-FIN-CRIT-007 | Payment recording | Record payment against invoice | P2 | Yes (Playwright) |
| REG-FIN-CRIT-008 | Credit note | Credit note references original invoice | P2 | Yes (Supertest) |

### 4.4 Accounting

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-ACC-CRIT-001 | Chart of accounts | CoA tree renders with correct hierarchy | P2 | Yes (Playwright) |
| REG-ACC-CRIT-002 | Journal entry balance | Debit/credit must balance before save | P2 | Yes (Supertest) |
| REG-ACC-CRIT-003 | Expense creation | Create and categorize expense | P3 | Yes (Playwright) |

### 4.5 CRM & Marketing

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-CRM-CRIT-001 | Lead pipeline | Create lead and progress through stages | P2 | Yes (Playwright) |
| REG-CRM-CRIT-002 | Campaign creation | Create campaign with target segment | P3 | Yes (Playwright) |
| REG-CRM-CRIT-003 | Task lifecycle | Create, assign, complete CRM task | P3 | Yes (Playwright) |

### 4.6 Administration

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-ADM-CRIT-001 | User creation + role assignment | Create user with specific role and branch | P1 | Yes (Playwright) |
| REG-ADM-CRIT-002 | Audit log integrity | Actions generate audit entries with correct metadata | P1 | Yes (Supertest) |
| REG-ADM-CRIT-003 | Branch management | Create and configure branch | P2 | Yes (Playwright) |
| REG-ADM-CRIT-004 | Credential scrubbing | Passwords/tokens absent from audit log | P1 | Yes (Supertest) |

### 4.7 Authentication

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-AUTH-CRIT-001 | Login flow | Email + password authentication | P1 | Yes (Playwright) |
| REG-AUTH-CRIT-002 | Account lockout | 8 failed attempts triggers 5-min lockout | P1 | Yes (Supertest) |
| REG-AUTH-CRIT-003 | Token refresh rotation | Refresh issues new pair, retires old | P1 | Yes (Supertest) |
| REG-AUTH-CRIT-004 | Theft detection | Reused rotated token revokes family | P1 | Yes (Supertest) |
| REG-AUTH-CRIT-005 | OTP verification | 6-digit OTP validates correctly | P2 | Yes (Supertest) |
| REG-AUTH-CRIT-006 | Password reset flow | Forgot password, email, reset | P2 | Yes (Playwright) |

### 4.8 AI Platform

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-AI-CRIT-001 | AI chat interface | Send message and receive response | P3 | Yes (Playwright) |
| REG-AI-CRIT-002 | Knowledge base search | Search returns relevant procedures | P3 | Yes (Playwright) |

### 4.9 Parts & Inventory

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-INV-CRIT-001 | Inventory CRUD | Create, view, update parts | P2 | Yes (Playwright) |
| REG-INV-CRIT-002 | PO approval chain | PO routes based on SAR ceilings (5K/10K/20K/50K) | P1 | Yes (Supertest) |
| REG-INV-CRIT-003 | SoD: raise/approve PO | Same user cannot create and approve PO | P1 | Yes (Supertest) |
| REG-INV-CRIT-004 | Stock level update | Receiving updates inventory quantities | P2 | Yes (Supertest) |

### 4.10 Call Center

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-CC-CRIT-001 | Call queue display | Active queue renders with correct data | P2 | Yes (Playwright) |
| REG-CC-CRIT-002 | Call log recording | Completed call appears in log | P3 | Yes (Playwright) |

### 4.11 Reports & Analytics

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-RPT-CRIT-001 | Report generation | Workshop summary report generates | P2 | Yes (Playwright) |
| REG-RPT-CRIT-002 | Data scope in reports | Owner sees all branches; Manager sees own branch | P1 | Yes (Supertest) |
| REG-RPT-CRIT-003 | CSV export | Export completes with injection protection | P2 | Yes (Supertest) |

### 4.12 Team & HR

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-HR-CRIT-001 | Leave request lifecycle | Submit, approve, balance update | P2 | Yes (Playwright) |
| REG-HR-CRIT-002 | Technician list | Technician list with specialty/rating | P3 | Yes (Playwright) |

### 4.13 Portals

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-PTL-CRIT-001 | Customer app booking | Full booking flow in 430px frame | P1 | Yes (Playwright) |
| REG-PTL-CRIT-002 | Service tracking | Live service status display | P2 | Yes (Playwright) |
| REG-PTL-CRIT-003 | Supplier portal scoping | Supplier sees only own data | P2 | Yes (Supertest) |
| REG-PTL-CRIT-004 | Multi-tenant isolation | Org A cannot see Org B data | P1 | Yes (Supertest) |

---

## 5. Cross-Browser Compatibility Matrix

### 5.1 Supported Browsers

| Browser | Minimum Version | Test Device | Priority |
|---------|----------------|-------------|----------|
| Google Chrome | 90+ | Desktop (Windows/macOS) | P1 |
| Safari | 14+ | Desktop (macOS) + Mobile (iOS) | P1 |
| Microsoft Edge | 90+ | Desktop (Windows) | P2 |
| Mozilla Firefox | 90+ | Desktop (Windows/macOS) | P2 |
| Mobile Chrome | 90+ | Android (Pixel 5) | P1 |
| Mobile Safari | 14+ | iOS (iPhone 12) | P1 |

### 5.2 Cross-Browser Test Cases

| Test ID | Test Name | Browsers | Description | Priority | Automated |
|---------|-----------|----------|-------------|----------|-----------|
| REG-XBR-UI-001 | Dashboard rendering | All | KPI cards, charts render correctly | P1 | Yes (Playwright) |
| REG-XBR-UI-002 | DataTable rendering | All | Columns, sorting, pagination functional | P1 | Yes (Playwright) |
| REG-XBR-UI-003 | Form validation | Chrome, Safari, Edge | Zod-driven validation messages display | P2 | Yes (Playwright) |
| REG-XBR-UI-004 | Date/time picker | All | AST (UTC+3) dates render correctly | P2 | Yes (Playwright) |
| REG-XBR-UI-005 | PDF generation | Chrome, Safari | Invoice PDF renders correctly | P2 | Manual |
| REG-XBR-UI-006 | File upload | All | Photo upload in check-in works | P2 | Yes (Playwright) |
| REG-XBR-UI-007 | Print preview | Chrome, Safari | Invoice/estimate print layout correct | P3 | Manual |
| REG-XBR-UI-008 | WebSocket notifications | Chrome, Firefox, Edge | Real-time notifications delivered | P2 | Yes (Playwright) |

### 5.3 Playwright Browser Configuration

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'edge', use: { channel: 'msedge' } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
]
```

---

## 6. RTL and Bilingual Tests

### 6.1 RTL Layout Tests

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-RTL-UI-001 | HTML dir attribute | `<html dir="rtl">` set when language is AR | P1 | Yes (Playwright) |
| REG-RTL-UI-002 | Sidebar position | Sidebar renders on the right side in RTL | P1 | Yes (Playwright) |
| REG-RTL-UI-003 | DataTable column order | Columns reverse in RTL (rightmost first) | P1 | Yes (Playwright) |
| REG-RTL-UI-004 | Form field alignment | Labels and inputs align correctly in RTL | P2 | Yes (Playwright) |
| REG-RTL-UI-005 | Icon mirroring | Directional icons (arrows, chevrons) flip in RTL | P2 | Yes (Playwright) |
| REG-RTL-UI-006 | Number formatting | Arabic-Indic numerals render where appropriate | P3 | Yes (Playwright) |
| REG-RTL-UI-007 | CSS logical properties | No hardcoded `left`/`right` in layout CSS | P2 | Yes (Vitest/linter) |
| REG-RTL-UI-008 | Navigation drawer | Drawer opens from right in RTL | P2 | Yes (Playwright) |

### 6.2 Bilingual Tests

| Test ID | Test Name | Description | Priority | Automated |
|---------|-----------|-------------|----------|-----------|
| REG-RTL-UI-009 | Language toggle | Switch EN to AR mid-session; state preserved | P1 | Yes (Playwright) |
| REG-RTL-UI-010 | Translation completeness | All ~2,122 translation keys render (no raw keys visible) | P2 | Yes (Vitest) |
| REG-RTL-UI-011 | Invoice bilingual layout | Invoice displays EN and AR text correctly | P1 | Yes (Playwright) |
| REG-RTL-UI-012 | Arabic translation lazy load | AR translations load within 200ms (cached after first) | P2 | Yes (Playwright) |
| REG-RTL-UI-013 | Hijri date display | Hijri date renders alongside Gregorian where configured | P3 | Yes (Playwright) |

### 6.3 Visual Regression (Screenshots)

| Test ID | Screen | Locales | Priority | Automated |
|---------|--------|---------|----------|-----------|
| REG-RTL-VR-001 | Dashboard (Owner) | EN, AR | P1 | Yes (Playwright screenshot) |
| REG-RTL-VR-002 | Job card form | EN, AR | P1 | Yes (Playwright screenshot) |
| REG-RTL-VR-003 | Invoice print preview | EN, AR | P1 | Yes (Playwright screenshot) |
| REG-RTL-VR-004 | DataTable (any domain) | EN, AR | P2 | Yes (Playwright screenshot) |
| REG-RTL-VR-005 | Navigation menu | EN, AR | P2 | Yes (Playwright screenshot) |
| REG-RTL-VR-006 | Customer portal (mobile) | EN, AR | P2 | Yes (Playwright screenshot) |

---

## 7. RBAC Enforcement Tests (14 Roles)

### 7.1 Navigation Layer (Frontend Sidebar)

Verify that each role's sidebar shows only permitted modules.

| Test ID | Role | Visible Modules | Hidden Modules | Priority | Automated |
|---------|------|-----------------|----------------|----------|-----------|
| REG-RBAC-SEC-001 | Super Admin | All | None | P1 | Yes (Playwright) |
| REG-RBAC-SEC-002 | Owner/CEO | All within org | Platform admin | P1 | Yes (Playwright) |
| REG-RBAC-SEC-003 | Branch Manager | Branch operations, reports | Platform admin, other branches | P1 | Yes (Playwright) |
| REG-RBAC-SEC-004 | Service Advisor | Workshop, customers, CRM | Finance, HR, admin | P1 | Yes (Playwright) |
| REG-RBAC-SEC-005 | Technician | Assigned jobs only | All other modules | P1 | Yes (Playwright) |
| REG-RBAC-SEC-006 | QC Inspector | QC checklists | All other modules | P2 | Yes (Playwright) |
| REG-RBAC-SEC-007 | Storekeeper | Inventory, parts | Finance, HR, CRM | P2 | Yes (Playwright) |
| REG-RBAC-SEC-008 | Accountant | Finance, accounting | HR, workshop operations | P1 | Yes (Playwright) |
| REG-RBAC-SEC-009 | HR Manager | HR, employees, payroll | Finance, workshop | P2 | Yes (Playwright) |
| REG-RBAC-SEC-010 | Receptionist | Check-in, customers | Finance, inventory, HR | P2 | Yes (Playwright) |
| REG-RBAC-SEC-011 | Call Center Agent | Appointments, customer lookup | Job details, finance | P2 | Yes (Playwright) |
| REG-RBAC-SEC-012 | Procurement Manager | POs, suppliers | HR, workshop | P2 | Yes (Playwright) |
| REG-RBAC-SEC-013 | Supplier | Own POs, deliveries | All internal modules | P2 | Yes (Playwright) |
| REG-RBAC-SEC-014 | Customer | Own vehicles, appointments, invoices | All internal modules | P1 | Yes (Playwright) |

### 7.2 API Layer (Server Middleware)

Automated test generation from `rbac.ts` matrix -- every endpoint tested against all 14 roles.

| Test ID | Test Description | Method | Priority | Automated |
|---------|-----------------|--------|----------|-----------|
| REG-RBAC-SEC-015 | All endpoints vs all roles | Supertest iterates rbacMatrix | P1 | Yes (Supertest, generated) |
| REG-RBAC-SEC-016 | Grant action enforcement | User with `v` only cannot `POST` (create) | P1 | Yes (Supertest) |
| REG-RBAC-SEC-017 | Approval ceiling enforcement | Approval rejected above role's SAR ceiling | P1 | Yes (Supertest) |
| REG-RBAC-SEC-018 | Data scope enforcement (8 scopes) | Each scope returns correct data boundary | P1 | Yes (Supertest) |

### 7.3 Screen Layer (Frontend Router)

| Test ID | Test Description | Method | Priority | Automated |
|---------|-----------------|--------|----------|-----------|
| REG-RBAC-SEC-019 | `SCREEN_MODULE` gate | Direct URL to unpermitted screen shows access denied | P1 | Yes (Playwright) |
| REG-RBAC-SEC-020 | RequireAccess wrapper | `AppShell` + `RequireAccess` blocks unauthorized routes | P1 | Yes (Playwright) |

---

## 8. Responsive Layout Tests

### 8.1 Breakpoints

| Breakpoint | Width | Layout Behavior | Target Devices |
|------------|-------|-----------------|----------------|
| Desktop | >= 1280px | Full sidebar + DataTable | Desktop monitors |
| Tablet | 860px -- 1279px | Collapsed sidebar + DataTable | iPad, tablets |
| Mobile | 431px -- 859px | Bottom nav + MobileCard list | Phones (landscape) |
| Customer App | 430px | CustomerAppShell with bottom tab bar | Customer mobile app |

### 8.2 Responsive Test Cases

| Test ID | Test Name | Viewport | Description | Priority | Automated |
|---------|-----------|----------|-------------|----------|-----------|
| REG-RSP-UI-001 | Desktop full layout | 1920x1080 | Sidebar expanded, DataTable with all columns | P1 | Yes (Playwright) |
| REG-RSP-UI-002 | Desktop minimum | 1280x720 | Sidebar and content fit without horizontal scroll | P1 | Yes (Playwright) |
| REG-RSP-UI-003 | Tablet layout | 1024x768 | Sidebar collapses, DataTable scrolls horizontally if needed | P2 | Yes (Playwright) |
| REG-RSP-UI-004 | Mobile DataTable switch | 860px | DataTable switches to MobileCard rendering | P1 | Yes (Playwright) |
| REG-RSP-UI-005 | Mobile card rendering | 375x812 | MobileCard list renders 50+ items without jank | P2 | Yes (Playwright) |
| REG-RSP-UI-006 | Customer app frame | 430px | CustomerAppShell renders with bottom tab bar | P1 | Yes (Playwright) |
| REG-RSP-UI-007 | Body no horizontal scroll | All | Page body never scrolls horizontally at any breakpoint | P1 | Yes (Playwright) |
| REG-RSP-UI-008 | Touch targets | Mobile | Interactive elements >= 44x44px on mobile | P2 | Manual |
| REG-RSP-UI-009 | Form layout mobile | 375px | Forms stack to single column, inputs full width | P2 | Yes (Playwright) |
| REG-RSP-UI-010 | Navigation mobile | 375px | Bottom navigation bar with correct icons | P2 | Yes (Playwright) |

---

## 9. Automation Status Summary

### 9.1 Coverage by Category

| Category | Total Tests | Automated | Manual | Automation Rate |
|----------|------------|-----------|--------|-----------------|
| Smoke tests | 8 | 8 | 0 | 100% |
| Critical path (all domains) | 55 | 55 | 0 | 100% |
| Cross-browser | 8 | 6 | 2 | 75% |
| RTL/bilingual | 13 | 13 | 0 | 100% |
| Visual regression | 6 | 6 | 0 | 100% |
| RBAC enforcement | 20 | 20 | 0 | 100% |
| Responsive layout | 10 | 9 | 1 | 90% |
| **Total** | **120** | **117** | **3** | **97.5%** |

### 9.2 Automation Tools by Test Type

| Tool | Test Types | Execution Context |
|------|-----------|-------------------|
| Playwright | E2E, visual regression, cross-browser, responsive | CI (nightly) + staging |
| Vitest | Unit tests (validation, arithmetic, translations) | CI (every PR) |
| Supertest | API integration, RBAC matrix, tenant isolation | CI (every PR) |
| Lighthouse CI | Performance scores | CI (per sprint) |

### 9.3 Manual Test Justification

| Test ID | Reason for Manual Execution |
|---------|---------------------------|
| REG-XBR-UI-005 | PDF rendering requires visual human verification |
| REG-XBR-UI-007 | Print layout requires physical/virtual printer verification |
| REG-RSP-UI-008 | Touch target sizing requires physical device validation |

---

## 10. Test Execution Schedule

| Suite | Trigger | Duration | Environment | Owner |
|-------|---------|----------|-------------|-------|
| Smoke tests (8) | Every PR merge | ~5 minutes | CI | Dev |
| RBAC matrix (20) | Every PR merge | ~10 minutes | CI | Dev |
| Critical path -- unit (Vitest) | Every PR | ~3 minutes | CI | Dev |
| Critical path -- API (Supertest) | Every PR | ~8 minutes | CI | Dev |
| Critical path -- E2E (Playwright) | Nightly | ~30 minutes | Staging | QA |
| Cross-browser suite | Pre-release | ~45 minutes | Staging | QA |
| RTL/bilingual suite | Nightly | ~20 minutes | Staging | QA |
| Visual regression | Pre-sprint-review | ~15 minutes | Staging | QA |
| Responsive suite | Pre-release | ~20 minutes | Staging | QA |
| Full regression (all) | Pre-major-release | ~2 hours | Staging | QA |

---

## 11. Defect Triage from Regression

When a regression test fails:

| Priority | Impact | Response SLA | Action |
|----------|--------|--------------|--------|
| P1 failure | Critical path broken | 4 hours | Block release. Immediate fix. |
| P2 failure | Important feature broken | 24 hours | Fix before next release. |
| P3 failure | Moderate impact | Within sprint | Schedule fix. |
| P4 failure | Cosmetic/edge case | Backlog | Log and prioritize. |

Defect fields (per [Test Plan](../project-management/planning/test-plan.md) Section 9): priority, steps to reproduce, expected vs. actual, browser/device, language (EN/AR), screenshot, regression test ID.

---

## 12. References

- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Domain Reference](../domains.md)
- [Security Requirements](../requirements/non-functional/security.md)
- [Performance Requirements](../requirements/non-functional/performance.md)
- [UAT Test Scripts](uat-test-scripts.md)
- [Load Testing Plan](load-testing-plan.md)
- [Security Testing Plan](security-testing-plan.md)
