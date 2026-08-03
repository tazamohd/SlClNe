# SALIS AUTO — Claude Code Handoff

Complete UI/UX design ready to be turned into a production app. **304 screens** (191 desktop + 113 mobile), 14 roles, 28 permission modules, Arabic/English bilingual with full RTL, dark/light themes.

Design source: HTML/CSS/JS Design Components (`.dc.html`) — visually finished, functionally scaffolded. Your job in Claude Code: rebuild in your stack, connect a real database, wire routing, wire the backend endpoints listed below.

---

## 1. What you're getting

- **`design/`** — every `.dc.html` screen, the shared data module (`gms-data.js`), the icon library (`salis-icon.js`), and the bound design system tokens (`_ds/`). Open any file in a browser to see it render fully — no build step.
- **`SCREEN_MAP.md`** — every screen with its suggested route, desktop/mobile files, and a one-line purpose.
- **`FLOW_SPEC.md`** — the cross-screen workflows (approvals, diagnostic report chain, customer signup).
- **`DATA_MODEL.md`** — every entity referenced by the UI with fields, relationships, and which screen(s) consume it.
- **`RBAC.md`** — role roster, permission matrix (14 × 28), data scope rules, approval ceilings.
- **`API_ENDPOINTS.md`** — the endpoints the UI expects, grouped by module.
- **`I18N.md`** — how translation works, key list, RTL guidance.
- **`GLOSSARY.md`** — the domain terms (job card, RFQ, ZATCA, etc.) so you and Claude Code agree on meaning.

Everything below is context. The four documents to read first, in this order, are: **SCREEN_MAP → RBAC → DATA_MODEL → API_ENDPOINTS**.

---

## 2. Recommended stack

The design was drawn against React 18 + Vite + Tailwind + shadcn/ui (Radix) — the same stack the original SalisAuto GMS codebase uses. Recreating on that stack is the shortest path because the design tokens map directly.

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind + the design-system tokens under `_ds/salis-auto-design-system-f22df384-eb3b-4838-99e5-e987504e70f0/tokens/`
- **UI primitives**: shadcn/ui — the design system's classes and radii were tuned to those primitives
- **State**: TanStack Query for server state; Zustand or Redux Toolkit for session/role/tenant state
- **Icons**: `lucide-react` (the design uses lucide exclusively via `salis-icon.js`)
- **Routing**: React Router 6 with role guards (see RBAC)
- **i18n**: react-i18next; strings live in the design's `gms-data.js` under `AR` — port them 1:1
- **Backend**: your choice — the API contract in `API_ENDPOINTS.md` is REST/JSON, framework-agnostic
- **DB**: PostgreSQL recommended (RLS lets you enforce data scope per row); Prisma or Drizzle for the ORM
- **Auth**: JWT with rotating refresh tokens; add `role` and `tenant_id` claims

If you want to move fast, keep the sidebar shell exactly as it is (`NAV` in `gms-data.js` describes it). It's already role-gated and RTL-safe.

---

## 3. Roles & permissions (canonical)

The RBAC engine is real code in `design/gms-data.js`. Study `ROLES`, `PERMS`, `SCREEN_MODULE` and the helper functions `currentRole()`, `roleMeta()`, `can(mod, action)`, `navFor()`. Port them directly — the design and the backend must share the same truth.

**14 roles:**

| ID | Label | AR | Demo email | Data scope | Approval limit (SAR) |
|---|---|---|---|---|---|
| `owner` | Owner / CEO | المالك / الرئيس التنفيذي | `owner@salisauto.sa` | all | ∞ |
| `superadmin` | Super Admin | المشرف العام | `admin@salisauto.com` | platform | ∞ |
| `manager` | Branch Manager | مدير الفرع | `manager@salisauto.sa` | branch | 50,000 |
| `advisor` | Service Advisor | مستشار الخدمة | `advisor@salisauto.sa` | branch | 5,000 |
| `technician` | Technician | فني | `tech@salisauto.sa` | own | — |
| `qc` | QC Inspector | مفتش الجودة | `qc@salisauto.sa` | branch | — |
| `parts` | Storekeeper | أمين المستودع | `parts@salisauto.sa` | branch | 10,000 |
| `accountant` | Accountant | محاسب | `finance@salisauto.sa` | all | 25,000 |
| `hr` | HR Manager | مدير الموارد البشرية | `hr@salisauto.sa` | all | 15,000 |
| `frontdesk` | Receptionist | موظف الاستقبال | `frontdesk@salisauto.sa` | branch | — |
| `callcenter` | Call Center Agent | موظف مركز الاتصال | `calls@salisauto.sa` | all | — |
| `procurement` | Procurement Agent | وكيل المشتريات | `procurement@salisauto.sa` | all | 20,000 |
| `supplier` | Supplier | مورّد | `supplier@aljazira.sa` | external | — |
| `customer` | Customer | عميل | `khalid@example.sa` | self | — |


**28 permission modules:**

`dashboard`, `jobcards`, `appointments`, `estimates`, `customers`, `vehicles`, `inventory`, `procurement`, `invoices`, `payments`, `accounting`, `hr`, `technicians`, `crm`, `callcenter`, `reports`, `approvals`, `kiosk`, `execreports`, `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `ai`, `admin`, `settings`, `audit`, `network`

**Actions per cell** (encoded as a string, e.g. `"vcex"`):
- `v` — view
- `c` — create
- `e` — edit
- `x` — delete
- `a` — approve
- Empty string `""` — module is **hidden from the sidebar** for that role
- One `x` alone (`"x"`) — visible in nav but disabled with a tooltip (used for "read-only observer")

Special modules to note:
- `approvals` — auto-granted to roles whose `limit ≠ 0` (matrix and screens can't disagree)
- `kiosk` — front-desk / call-centre only
- `execreports` — split out of `reports` so a storekeeper can't see Executive/Sales/Insurance/Loan reports
- `portaltech` / `portalcustomer` / `portalsupplier` / `portalprocure` — per-portal gates

**Data scope** (row-level, enforced by DB): `platform` sees everything, `org` sees their tenant, `branch` sees their branch, `self` sees only their own records, `assigned` sees only records they're assigned to.

**Enforce on both sides.** Frontend hides / disables; the API layer must re-check on every request. `RolesPermissions.dc.html` is a working matrix editor UI you can rebuild against your DB — the shape it expects is documented in RBAC.md.

---

## 4. Login flow

The Login screen has 14 demo role cards. Clicking one **fills** the email + password (`Demo@1234`) into the form; the user then presses Sign In. On success, the app writes the resolved role id to `localStorage["salis-role"]` and redirects to the destination for that role:

- `supplier` → SupplierPortal
- `customer` → CustomerPortal
- `technician` → TechnicianPortal
- `superadmin` → SuperAdmin
- `callcenter` → CallCenter
- `procurement` → ProcurementPortal
- everyone else → Dashboard

In production, replace localStorage with a JWT that carries `role` and `tenant_id`. Every `.dc.html` screen reads the signed-in role via `D.currentRole()` (from `gms-data.js`) — swap that helper for one that reads your auth store.

---

## 5. What the sidebar shell is

Every operational screen shares the same shell: header (search, language, theme, notifications, user block) → sidebar (grouped, collapsible, role-filtered) → main content. It's implemented per-screen (no shared component yet in the design) — a single `AppShell` component in your stack should replace all of them. `NAV` in `gms-data.js` defines the group / item / href structure; `navFor(role)` filters it.

Groups (icon · items):

### Overview (Home · 1 items)
- **Dashboard** → `Dashboard.dc.html`

### Operations (Wrench · 4 items)
- **Job Cards** → `JobCards.dc.html`
- **Appointments** → `Appointments.dc.html`
- **Appointment Calendar** → `AppointmentCalendar.dc.html`
- **Estimates** → `Estimates.dc.html`

### Customers & Vehicles (Users · 4 items)
- **Customers** → `Customers.dc.html`
- **Vehicles** → `Vehicles.dc.html`
- **Customer Feedback** → `CustomerFeedback.dc.html`
- **Fleet Management** → `FleetManagement.dc.html`

### Inventory (Package · 3 items)
- **Inventory** → `Inventory.dc.html`
- **Parts Supply Network** → `PartsSupplyNetwork.dc.html`
- **Parts Network** → `PartsNetwork.dc.html`

### Team (HardHat · 3 items)
- **Technicians** → `Technicians.dc.html`
- **Technician Schedule** → `TechnicianSchedule.dc.html`
- **HR & Payroll** → `HRPayroll.dc.html`

### Finance (CreditCard · 4 items)
- **Invoices** → `Invoices.dc.html`
- **Payments** → `Payments.dc.html`
- **Reports** → `Reports.dc.html`
- **Reports & Analytics** → `ReportsAnalytics.dc.html`

### System (Settings · 7 items)
- **Subscription** → `Subscription.dc.html`
- **Notifications** → `NotificationCenter.dc.html`
- **Global Search** → `GlobalSearch.dc.html`
- **Settings** → `Settings.dc.html`
- **Advanced Settings** → `AdvancedSettings.dc.html`
- **Backup & Export** → `Backup.dc.html`
- **Profile** → `Profile.dc.html`

### CRM & Marketing (Target · 9 items)
- **Lead Pipeline** → `LeadPipeline.dc.html`
- **Opportunities** → `Opportunities.dc.html`
- **Campaigns** → `Campaigns.dc.html`
- **Customer Segments** → `CustomerSegments.dc.html`
- **CRM Tasks** → `CRMTasks.dc.html`
- **Email Marketing** → `EmailMarketing.dc.html`
- **SMS Campaigns** → `SMSCampaigns.dc.html`
- **WhatsApp Campaigns** → `WhatsAppCampaigns.dc.html`
- **CRM Calendar** → `CRMCalendar.dc.html`

### Accounting (Calculator · 8 items)
- **Chart of Accounts** → `ChartOfAccounts.dc.html`
- **Journal Entries** → `JournalEntries.dc.html`
- **Expenses** → `Expenses.dc.html`
- **Tax Management** → `TaxManagement.dc.html`
- **Bank Reconciliation** → `BankReconciliation.dc.html`
- **Receipts** → `Receipts.dc.html`
- **Financial Statements** → `FinancialStatements.dc.html`
- **Financial Reports** → `FinancialReports.dc.html`

### Reports & Analytics (BarChart3 · 9 items)
- **Executive Dashboard** → `ExecutiveReports.dc.html`
- **Operational Reports** → `OperationalReports.dc.html`
- **Workshop Reports** → `WorkshopReports.dc.html`
- **Inventory Reports** → `InventoryReports.dc.html`
- **Sales Reports** → `SalesReports.dc.html`
- **Insurance Reports** → `InsuranceReports.dc.html`
- **Loan Reports** → `LoanReports.dc.html`
- **Custom Reports** → `CustomReports.dc.html`
- **BI Dashboard** → `BIDashboard.dc.html`

### Administration (Shield · 9 items)
- **Organizations** → `Organizations.dc.html`
- **Branches** → `Branches.dc.html`
- **Departments** → `Departments.dc.html`
- **Users & Teams** → `UsersTeams.dc.html`
- **Roles & Permissions** → `RolesPermissions.dc.html`
- **Integrations** → `Integrations.dc.html`
- **Templates** → `Templates.dc.html`
- **Automation Rules** → `AutomationRules.dc.html`
- **Audit Log** → `AuditLog.dc.html`

### AI Platform (Sparkles · 9 items)
- **AI Assistant** → `AIAssistant.dc.html`
- **Prompt Library** → `PromptLibrary.dc.html`
- **Knowledge Base** → `KnowledgeBase.dc.html`
- **Workflow Builder** → `WorkflowBuilder.dc.html`
- **Agent Dashboard** → `AgentDashboard.dc.html`
- **Agent Registry** → `AgentRegistry.dc.html`
- **Conversation History** → `ConversationHistory.dc.html`
- **Model Settings** → `ModelSettings.dc.html`
- **AI Analytics** → `AIAnalytics.dc.html`

### Portals (Building2 · 8 items)
- **Technician Portal** → `TechnicianPortal.dc.html`
- **Customer Portal** → `CustomerPortal.dc.html`
- **Supplier Portal** → `SupplierPortal.dc.html`
- **Procurement Portal** → `ProcurementPortal.dc.html`
- **Call Center** → `CallCenter.dc.html`
- **Call Logs** → `CallCenter.Logs.dc.html`
- **Kiosk Check-In** → `KioskCheckIn.dc.html`
- **Super Admin** → `SuperAdmin.dc.html`

### Design Reference (Boxes · 5 items)
- **Screen Index** → `Index.dc.html`
- **Flow Spec** → `FlowSpec.dc.html`
- **Empty States** → `UI.EmptyStates.dc.html`
- **Loading States** → `UI.LoadingStates.dc.html`
- **Form Validation** → `UI.FormValidation.dc.html`



---

## 6. Backend scope you asked for

These are the platform-level features that don't exist as designed screens yet — Claude Code should design the database and endpoints, then plug them in wherever noted.

### 6a. Platform control plane

New tables that back the existing SuperAdmin/PlatformAdmin surfaces:

- **`garage_applications`** — a business applies to join the platform. Status: `pending`, `approved`, `rejected`, `suspended`. Fields: legal name, CR number, VAT number, contact person, phone, email, city, plan requested, notes. Approving creates the `organizations` row and the owner user, emails the credentials.
- **`subscription_requests`** — pending plan changes. **Paid upgrades** create a request (approval required); **downgrades and cancellations** are immediate. Fields: org id, from_plan, to_plan, reason, requested_by, status.
- **`supplier_applications`** — a spare-parts supplier applies to join a garage's network. Status: `pending`, `approved`, `rejected`. Fields: company, CR, VAT, categories they carry, coverage regions, contact.
- **`support_tickets`** — used to be mocked; wire real data behind the existing tabs. Fields: org id, subject, body, priority, status, assignee, created_by, thread.
- **`system_health`** — infra metrics (uptime, queue depth, error rate, DB size) surfaced on the existing dashboard.

**Public submission endpoints** (unauthenticated):
- `POST /public/garage-applications` — a garage owner applies
- `POST /public/supplier-applications` — a supplier applies

**Platform-admin endpoints** (superadmin only):
- `GET /platform/applications?type=garage|supplier&status=pending`
- `POST /platform/applications/:id/approve`
- `POST /platform/applications/:id/reject` (body: `reason`)
- `GET /platform/subscription-requests`
- `POST /platform/subscription-requests/:id/approve`
- `POST /platform/subscription-requests/:id/reject`
- `GET /platform/stores`, `GET /platform/support-tickets`, `GET /platform/system-health`

### 6b. Customer registration (per-garage self-signup)

Customers sign up **against a specific garage** — the URL, the QR at reception, or the app carries the `garageId`.

- `POST /public/customers/register` — body: `{ garageId, name, phone, email?, password }`. Creates a pending user with `userType='customer'` and `garageId` set; sends an OTP.
- `POST /public/customers/verify-otp` — body: `{ phone, otp }`. Marks the user active.
- `POST /public/customers/resend-otp` — throttled 60s.

Wire these into the existing `RegionSelection.dc.html` → `Register.dc.html` → `OTPVerification.dc.html` chain (all designed, all mobile-mirrored).

### 6c. Subscription flow

Wired to `Subscription.dc.html`:

- `GET /subscription` — current plan + entitlements
- `GET /subscription/plans` — plan catalog
- `POST /subscription/change` — body: `{ toPlanId, reason }`. If `toPlanId` is cheaper or free-tier → immediate. If more expensive → creates a `subscription_requests` row and returns `{ status: 'pending', requestId }`. UI shows a "Pending approval" banner.
- `POST /subscription/cancel` — immediate.
- `POST /subscription/reactivate` — immediate (reverses a pending cancellation).

**Defaults you already agreed to** (from your message):
- garage self-register → approve (both sides needed)
- per-garage customer signup + OTP (garageId scoped)
- paid subscription changes require approval

---

## 7. Global conventions the UI expects

- **Currency**: SAR everywhere, comma-thousand separator, 2 decimals for amounts, JetBrains Mono font on any numeric column. `SAR 12,450.75`.
- **Dates**: Gregorian by default. If the user has `hijri: true` in their profile, dual-render as `{{ gregorian }} · {{ hijri }}`. The mock data uses ISO dates — port them through a date-fns / dayjs formatter.
- **Phones**: `+966` format, no spaces in DB, formatted for display.
- **VAT**: 15% Saudi VAT — line items store net; invoice totals compute vat + gross. ZATCA fields (`sellerVatNumber`, `buyerVatNumber`, `qrCode`) live on the invoice.
- **IDs**: use ULIDs (sortable) not incremental integers.
- **RTL**: never use `left`/`right` in CSS — always `inset-inline-start` / `inset-inline-end`. All designed screens already comply; keep the discipline.
- **Icons**: lucide only, 24×24, 2px stroke, round caps/joins. Never SVG-drawn illustrations.
- **Never use these colors**: green, red, yellow, purple, pink, teal. Blue = success/active/progress. Orange = warnings/critical CTA only.

---

## 8. Suggested build order

1. **Auth + tenants + roles** — get sign-in working with real JWTs; port `ROLES`, `PERMS`, `SCREEN_MODULE` verbatim; add RLS on every table.
2. **AppShell** — one component that replaces the per-screen sidebar; role-filtered nav; language / theme toggles wired to user prefs.
3. **Core workshop loop** — WorkshopCheckIn → JobCards → JobDetail → WorkshopInspection → CustomerApproval → WorkshopQC → WorkshopDelivery → InvoiceCreate → InvoiceDetail → Payments. This is the money-making path — get it working before anything else.
4. **Customers, Vehicles, Appointments** — the entities the workshop loop reads from.
5. **Inventory + PurchaseOrder + PartsNetwork** — parts side.
6. **CRM + Marketing** — LeadPipeline, Opportunities, Campaigns, EmailMarketing, SMSCampaigns, WhatsAppCampaigns.
7. **Accounting** — ChartOfAccounts, JournalEntries, Expenses, TaxManagement, BankReconciliation, FinancialStatements.
8. **Reports** — start with OperationalReports and WorkshopReports; ExecReports and BI last.
9. **Platform control plane** — the new scope in §6.
10. **AI Platform** — AIAssistant, WorkflowBuilder, AutomationRules. These are the most speculative — treat as v1 features once the operational stack is live.

---

## 9. Where to look inside `design/`

- `gms-data.js` — **the single source of truth**. Read it once end-to-end before writing anything. It contains:
  - `ROLES`, `PERMS`, `SCREEN_MODULE`, `currentRole()`, `roleMeta()`, `can()`, `navFor()` — RBAC engine
  - `NAV` — sidebar structure
  - `AR` — the Arabic dictionary (~2000 keys)
  - Every mock data table: `VEHICLES`, `INVOICES`, `JOBS`, `APPOINTMENTS`, `ESTIMATES`, `CUSTOMERS`, `FLEETS`, `PARTS`, `TECHS`, `LEADS`, `OPPORTUNITIES`, etc. Their shapes are the entity shapes you should implement.
- `salis-icon.js` — the icon wrapper (lucide via CDN). Replace with `lucide-react` imports.
- `Login.dc.html`, `Dashboard.dc.html`, `Index.dc.html` — the three files to open first to feel the system.
- `_ds/` — the design-system tokens (colors, spacing, typography, effects). Port these CSS custom properties directly into your Tailwind config or a global stylesheet.
- `RBACSpec.dc.html` — human-readable reference for the permission matrix
- `FlowSpec.dc.html` — a designed page explaining the approval/notification workflows

---

## 10. What is finished vs what needs work

**Finished:**
- Every screen renders end-to-end, both desktop and mobile
- Full bilingual EN/AR with RTL
- Light/dark themes
- Design-system compliant (colours, type, spacing, radii, shadows)
- 14-role RBAC engine with correct data scope and approval limits
- All list screens link to their detail views; all sidebar entries resolve
- Static entrance animation only (no opacity fade — see §11)

**Needs your hand in Claude Code:**
- Real database + migrations + RLS
- Real authentication (JWT, refresh, session, biometric, PIN, 2FA, SSO, social)
- Real API endpoints per `API_ENDPOINTS.md`
- Real workflow orchestration (notifications, approvals, escalations — see FLOW_SPEC.md)
- File storage (uploads, signatures, diagnostic reports, OBD scan attachments)
- Print/PDF (invoice, estimate, financial statements, delivery note)
- Payment gateway (mada / Apple Pay / STC Pay / cash / cheque / bank transfer)
- OBD live protocol (see `OBDDiagnostics.dc.html` — the UI is designed, the WebBluetooth / socket bridge is not)
- Real integrations (OEM tools, insurance carriers, banks, SMS providers, WhatsApp Business API, ZATCA, credit bureaus)

---

## 11. Notes and gotchas

- **`fadeUp` keyframe animates transform only, not opacity.** Animating opacity risked content rendering invisible on throttled tabs. Preserve this in the new stack.
- **`getComputedStyle` can lie in headless / throttled environments.** The visual is the truth. If your tests flake on selection colours, screenshot rather than read computed styles.
- **Every list has a detail view.** Do not ship a list without wiring it. The design catalogues them together.
- **Approval Inbox permission is derived, not stored.** Any role with `limit !== 0` implicitly gets `approvals: "va"`. Encode this in the seeder, not by hand.
- **Portal screens are separate permission modules**, not lumped under generic `reports` / `dashboard`. Do not collapse them or a technician will see the customer portal.
- **The RBAC matrix editor (`RolesPermissions.dc.html`) writes changes to state only.** In production, back it with a `PATCH /admin/permissions` endpoint.
- **Every text string that needs Arabic exists in `AR`.** If a new string appears in code, add its Arabic before shipping — `I18N.md` shows the audit script the design used.
- **Screen files carry the layout, not the business logic.** `renderVals()` inside each `.dc.html` computes derived UI state; that computation goes into hooks / selectors in your stack, not into components.
