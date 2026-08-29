# SALIS AUTO — Domain Reference

The application is organized into 13 functional domains plus supporting infrastructure screens. Screens fall into two categories:

- **Custom screens** (~36) — Hand-built React components with full UI designs originating from `.dc.html` prototypes.
- **Feature screens** (~155) — Data-driven screens rendered by the shared `FeatureScreen` component using definitions from `app/src/screens/feature/definitions.ts`. Each definition declares KPI stats, tab bars, and table sections.

Screens not yet implemented fall back to `PendingScreen`, which displays the screen's name and purpose so navigation never dead-ends.

---

## 1. Workshop (Operations)

**Directory:** `app/src/screens/workshop/`
**Nav Group:** Operations
**RBAC Modules:** `jobcards`, `appointments`, `estimates`, `checkin`, `inspection`, `qc`, `delivery`

The workshop domain covers the full vehicle service lifecycle through six stages:

**Check-In → Inspection → Estimate → Repair → Quality Check → Delivery**

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Job Cards | `/jobcards` | List of all job cards with `DataTable`, status/priority/service badges, search, mobile cards |
| Job Detail | `/jobcards/:id` | Full job view with `WorkflowStepper`, customer/vehicle panels, service timeline, approval gate |
| Check-In | `/checkin` | Vehicle intake form with customer lookup, vehicle info, service selection, photo upload areas |
| Inspection | `/inspection` | Multi-section inspection sheet with `Checklist` toggles, findings entry, photo grid |
| QC Gate | `/qc-gate` | Quality control checklist with pass/fail toggles, technician notes, approval actions |
| Delivery | `/delivery` | Delivery checklist, customer signature area, handover confirmation |
| Appointments | `/appointments` | Appointment list with time, service, bay, technician columns |
| Estimates | `/estimates` | Estimate list with amount, status. Links to estimate detail |

### Feature Screens

Service Bay Dashboard, Live Service Tracking, Service Templates, Computer Vision QC, Video Estimates, Video Consultations, EV Service Module, Battery Analytics, Workshop Calendar, AI Scheduling, Smart Assignment, Routing Optimizer.

---

## 2. Registry (Customers & Vehicles)

**Directory:** `app/src/screens/registry/`
**Nav Group:** Customers & Vehicles
**RBAC Modules:** `customers`, `vehicles`, `feedback`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Customers | `/customers` | Customer list with name, phone, vehicles, spend, last visit |
| Vehicles | `/vehicles` | Vehicle list with plate, make, owner, mileage, status |
| Fleet Management | `/fleet-management` | Fleet list with vehicle count, active status, contract info |
| Feedback | `/feedback` | Customer feedback/review list |

### Feature Screens

Customer Loyalty, Customer Reviews & Ratings, Referral Program, Customer LTV Analysis, Appointment Reminders, Vehicle Inspections, Vehicle History, Vehicle Health Monitoring, Vehicle Tracking, Vehicle Storage, VIN Decoder, Fleet Tracking, Tire Management, Loaner Vehicles, Towing Assistance, Telematics Integration, Digital Vehicle Walkaround, License Plate Recognition.

---

## 3. Finance

**Directory:** `app/src/screens/finance/`
**Nav Group:** Finance
**RBAC Modules:** `invoices`, `payments`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Invoices | `/invoices` | Invoice list with id, customer, amount, due date, status |
| Invoice Create | `/invoices/create` | Multi-step invoice creation with line items, tax calculation |
| Invoice Detail | `/invoices/:id` | Full invoice view with line items, payment history, print/PDF actions |
| Payments | `/payments` | Payment/receipt list with method, amount, status |

### Feature Screens

Stripe Payment Processing, Refund Management.

---

## 4. Accounting

**Directory:** `app/src/screens/accounting/`
**Nav Group:** Accounting
**RBAC Module:** `accounting`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Chart of Accounts | `/accounting/coa` | Tree-structured account list with code, name, type, balance |
| Journal Entries | `/accounting/journal-entries` | Journal entry list with debit/credit totals, status |
| Expenses | `/accounting/expenses` | Expense list with category, vendor, amount, status |

### Feature Screens

General Ledger, Trial Balance, Balance Sheet, Income Statement, Cash Flow Statement, Accounts Receivable, Accounts Payable, Bank Accounts, Budget Management, Capital Management, Assets Management, Liabilities Management, Equity Management, Retained Earnings, Cost Centers, Loss Account, Partners Current Account, Expense Tracking, Expenses Management, Sales Management, Accounting Integration, Financial Settings.

---

## 5. CRM & Marketing

**Directory:** `app/src/screens/crm/`
**Nav Group:** CRM & Marketing
**RBAC Module:** `crm`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Lead Pipeline | `/crm/leads` | Lead list with name, company, value, source, stage, score |
| Opportunities | `/crm/opportunities` | Opportunity list with value, probability, close date, owner |
| Campaigns | `/crm/campaigns` | Campaign list with type, reach, opens, clicks, conversions, budget |
| Segments | `/crm/segments` | Customer segment list with rules, member count |
| Tasks | `/crm/tasks` | CRM task list with assignee, due date, priority, type |
| CRM Calendar | `/crm/calendar` | Calendar view for CRM activities |

### Feature Screens

Marketing Hub, Marketing Automation, Email Marketing, Social Media Integration, Social Media Monitoring, Google Business Profile.

---

## 6. Administration

**Directory:** `app/src/screens/admin/`
**Nav Group:** Administration
**RBAC Modules:** `admin`, `settings`, `integrations`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Users & Teams | `/admin/users` | User management with role assignment |
| Roles | `/admin/roles` | Role definition with permission matrix editor |
| Branches | `/admin/branches` | Branch/location management |
| Settings | `/settings` | System configuration panels |
| Audit Log | `/admin/audit` | Activity audit trail |

### Feature Screens

Role Management, User Profile, User Settings, Security Settings, System Settings, Franchise Management, Globalization Layer, Multi-Location Dashboard, Compliance Management, ZATCA Settings, VAT Settings, Zakat Settings, Safety Incidents, Environmental Compliance, ISO Quality Management, Equipment Calibration, Security Cameras, Mobile Device Management, Document Management, Document OCR, Data Import & Export, Data Backup.

---

## 7. Authentication

**Directory:** `app/src/screens/auth/`
**Route Category:** Public (no auth required, no AppShell)

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/login` | Email + password form with `AuthCard`, role-aware redirect |
| Register | `/register` | Account creation form |
| Forgot Password | `/forgot-password` | Email entry for password reset |
| Reset Password | `/reset-password` | New password entry |
| OTP Verify | `/otp` | 6-digit `CodeInput` verification |
| SSO Login | `/sso` | SSO provider selection |
| Two-Factor Setup | `/2fa-setup` | 2FA configuration with QR code |
| Logout Confirmation | `/logout-confirmation` | Logout confirmation page |

All auth screens use `AuthLayout` (centered frame with brand backdrop) and `AuthCard`.

---

## 8. AI Platform

**Directory:** `app/src/screens/ai/`
**Nav Group:** AI Platform
**RBAC Module:** `ai`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| AI Assistant | `/aiassistant` | Chat interface with message bubbles, suggested prompts |
| Knowledge Base | `/knowledge-base` | Procedure list with categories, makes, step counts |
| AI Agents | `/ai/agents` | Agent list with model, status, task count, success rate |

### Feature Screens

AI Automation, AI Chatbot, AI Service Advisor, Voice Commands, Voice Command Interface, Smart Damage Assessment, ML Fraud Detection, Neural Network Prediction, Prompt Library, Workflow Builder.

---

## 9. Parts & Inventory Network

**Directory:** `app/src/screens/network/`
**Nav Group:** Inventory
**RBAC Modules:** `inventory`, `network`, `procurement`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Inventory | `/inventory` | Parts list with name, SKU, stock, reorder point, price |
| Parts Supply Network | `/parts-network` | B2B parts marketplace with supplier listings |

### Feature Screens

Parts Availability, Parts Auto-Reorder, Smart Parts Recommender, Inventory Management, and the full Purchase Agent Portal suite (Dashboard, Tasks, Quotations, Payments, Deliveries, Orders, Suppliers, Inventory, Price Compare, Tracking, Reports).

---

## 10. Call Center

**Directory:** `app/src/screens/callcenter/`
**Nav Group:** Portals (Call Center sub-section)
**RBAC Module:** `callcenter`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Call Center Queue | `/callcenter` | Active call queue with status, wait time, agent assignment |
| Call Logs | `/callcenter/logs` | Historical call log with duration, disposition, recordings |

### Feature Screens

IVR management, queue analytics.

---

## 11. Reports & Analytics

**Nav Group:** Reports & Analytics
**RBAC Module:** `reports`

No custom screen directory — all screens are feature-driven.

### Feature Screens

Executive Dashboard, Operational Reports, Workshop Reports, Inventory Reports, Sales Reports, Insurance Reports, Loan Reports, Custom Reports, Business Intelligence, BI Dashboard, Business Heatmaps, Profit Analysis, KPI Dashboard, Productivity Tracker.

---

## 12. Team & HR

**Nav Group:** Team
**RBAC Modules:** `technicians`, `hr`

### Custom Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Technicians | `/technicians` | Technician list with specialty, jobs, rating |

### Feature Screens

HR Management, Staff Directory, Staff Scheduling, Performance Reviews, Timesheet Management, Timeclock & Payroll, Payroll Management, Leave Requests, Training & LMS, Wearable Integration, Technician Management, Leaderboards, Performance.

---

## 13. Portals

**Directory:** `app/src/screens/portals/`
**Nav Group:** Portals
**RBAC Module:** `portals`

External-facing interfaces for different stakeholders.

### Customer App

**Directory:** `app/src/screens/customer-app/`
**Shell:** `CustomerAppShell` (430px mobile frame with bottom tab bar)

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/customer-app/home` | Hero card, active service status, quick actions |
| Garage | `/customer-app/garage` | Customer's vehicle list |
| Appointments | `/customer-app/appointments` | Booking list and new appointment |
| Service Tracking | `/customer-app/service-tracking` | Live repair progress tracking |
| Profile | `/customer-app/profile` | Customer profile and settings |

### Feature Portal Screens

Technician Portal (Dashboard, My Jobs, Time Clock, Parts Requests, Job Documentation, Profile, Attendance, Repair Guides, Diagnostic Software), Client Portal (Dashboard, My Vehicles, My Appointments, My Invoices, My Profile, Service History, Live Tracking, Reminders, Reviews & Chat), Supplier Portal, Procurement Portal, Kiosk, Super Admin Portal.

---

## Public Website

**Directory:** `app/src/screens/website/`
**Route Category:** Public (no auth, no AppShell)

Marketing and informational pages:

| Screen | Route | Description |
|--------|-------|-------------|
| Landing Page | `/` | Marketing homepage |
| About | `/about` | Company information |
| Services | `/services` | Service offerings |
| Pricing | `/pricing` | Pricing tiers |
| Blog | `/blog` | Blog listing |
| Contact | `/contact` | Contact form |
| Privacy Policy | `/privacy` | Privacy policy |
| Terms of Service | `/terms` | Terms of service |

---

## Design Reference

**Directory:** `app/src/screens/ui/`, `app/src/screens/meta/`
**Nav Group:** Design Reference

Internal UI pattern galleries and spec viewers for development reference. These screens are ungated (no RBAC check).

| Screen | Route | Description |
|--------|-------|-------------|
| Screen Index | `/spec-index` | Searchable index of all 191+ screens with routes and status |
| Flow Spec | `/flow-spec` | Feature flow specifications |
| UI Galleries | Various | Pattern reference for buttons, forms, tables, cards, badges, etc. |
| Native Shell | `/native-shell-*` | Mobile app shell mockups (iOS, Android frames) |

---

## Screen Counts by Domain

| Domain | Custom Screens | Feature Screens | Total |
|--------|---------------|-----------------|-------|
| Workshop | ~8 | ~12 | ~20 |
| Registry | ~4 | ~18 | ~22 |
| Finance | ~4 | ~2 | ~6 |
| Accounting | ~3 | ~22 | ~25 |
| CRM & Marketing | ~6 | ~6 | ~12 |
| Administration | ~5 | ~22 | ~27 |
| Authentication | ~8 | 0 | ~8 |
| AI Platform | ~3 | ~10 | ~13 |
| Parts & Inventory | ~2 | ~16 | ~18 |
| Call Center | ~2 | ~2 | ~4 |
| Reports & Analytics | 0 | ~14 | ~14 |
| Team & HR | ~1 | ~13 | ~14 |
| Portals & Customer App | ~5 | ~20 | ~25 |
| Public Website | ~8 | 0 | ~8 |
| Design Reference | ~4 | 0 | ~4 |
| **Total** | **~63** | **~157** | **~220** |

---

## Route Categories

All routes are generated from the `SCREENS` array (191 entries) and matched to components in `app/src/routes/index.tsx`.

| Category | Shell | Auth Required | Count |
|----------|-------|---------------|-------|
| `PUBLIC_SCREENS` | None (or `AuthLayout`) | No | ~35 |
| `CUSTOMER_APP_SCREENS` | `CustomerAppShell` | No | 11 |
| `APP_SCREENS` | `AppShell` + `RequireAccess` | Yes | ~130 |

Unmatched `SCREENS` entries render `PendingScreen`. Additionally, ~235 `SPEC_SCREENS` entries provide spec viewer routes with `.dc.html` design prototypes when available.
