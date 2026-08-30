# Screen Catalog

Complete catalog of all 191+ screens in SALIS AUTO organized by domain. Each entry lists the route, RBAC module, shell type, and category.

---

## Screen Counts Summary

| Category | Count | Description |
|----------|-------|-------------|
| Custom screens | ~63 | Hand-built React components with full designs |
| Feature screens | ~157 | Data-driven via `FeatureScreen` component |
| Public screens | ~35 | No authentication required |
| Customer app screens | ~11 | `CustomerAppShell` |
| App screens | ~130 | `AppShell` with `RequireAccess` |
| Pending screens | Variable | Screens not yet implemented (render `PendingScreen`) |

---

## 1. Workshop (Operations)

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Job Cards | `/jobcards` | Custom | `jobcards` | AppShell |
| Job Detail | `/jobcards/:id` | Custom | `jobcards` | AppShell |
| Check-In | `/checkin` | Custom | `jobcards` | AppShell |
| Inspection | `/inspection` | Custom | `jobcards` | AppShell |
| QC Gate | `/qc-gate` | Custom | `jobcards` | AppShell |
| Delivery | `/delivery` | Custom | `jobcards` | AppShell |
| Appointments | `/appointments` | Custom | `appointments` | AppShell |
| Estimates | `/estimates` | Custom | `estimates` | AppShell |
| Service Bay Dashboard | various | Feature | `jobcards` | AppShell |
| Live Service Tracking | various | Feature | `jobcards` | AppShell |
| Service Templates | various | Feature | `jobcards` | AppShell |
| Computer Vision QC | various | Feature | `jobcards` | AppShell |
| Video Estimates | various | Feature | `estimates` | AppShell |
| Video Consultations | various | Feature | `jobcards` | AppShell |
| EV Service Module | various | Feature | `jobcards` | AppShell |
| Battery Analytics | various | Feature | `jobcards` | AppShell |
| Workshop Calendar | various | Feature | `appointments` | AppShell |
| AI Scheduling | various | Feature | `appointments` | AppShell |
| Smart Assignment | various | Feature | `jobcards` | AppShell |
| Routing Optimizer | various | Feature | `jobcards` | AppShell |

---

## 2. Registry (Customers & Vehicles)

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Customers | `/customers` | Custom | `customers` | AppShell |
| Vehicles | `/vehicles` | Custom | `vehicles` | AppShell |
| Fleet Management | `/fleet-management` | Custom | `vehicles` | AppShell |
| Feedback | `/feedback` | Custom | `customers` | AppShell |
| Customer Loyalty | various | Feature | `customers` | AppShell |
| Customer Reviews & Ratings | various | Feature | `customers` | AppShell |
| Referral Program | various | Feature | `crm` | AppShell |
| Customer LTV Analysis | various | Feature | `customers` | AppShell |
| Appointment Reminders | various | Feature | `appointments` | AppShell |
| Vehicle Inspections | various | Feature | `vehicles` | AppShell |
| Vehicle History | various | Feature | `vehicles` | AppShell |
| Vehicle Health Monitoring | various | Feature | `vehicles` | AppShell |
| Vehicle Tracking | various | Feature | `vehicles` | AppShell |
| Vehicle Storage | various | Feature | `vehicles` | AppShell |
| VIN Decoder | various | Feature | `vehicles` | AppShell |
| Fleet Tracking | various | Feature | `vehicles` | AppShell |
| Tire Management | various | Feature | `vehicles` | AppShell |
| Loaner Vehicles | various | Feature | `vehicles` | AppShell |
| Towing Assistance | various | Feature | `vehicles` | AppShell |
| Telematics Integration | various | Feature | `vehicles` | AppShell |
| Digital Vehicle Walkaround | various | Feature | `vehicles` | AppShell |
| License Plate Recognition | various | Feature | `vehicles` | AppShell |

---

## 3. Finance

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Invoices | `/invoices` | Custom | `invoices` | AppShell |
| Invoice Create | `/invoices/create` | Custom | `invoices` | AppShell |
| Invoice Detail | `/invoices/:id` | Custom | `invoices` | AppShell |
| Payments | `/payments` | Custom | `payments` | AppShell |
| Stripe Payment Processing | various | Feature | `payments` | AppShell |
| Refund Management | various | Feature | `payments` | AppShell |

---

## 4. Accounting

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Chart of Accounts | `/accounting/coa` | Custom | `accounting` | AppShell |
| Journal Entries | `/accounting/journal-entries` | Custom | `accounting` | AppShell |
| Expenses | `/accounting/expenses` | Custom | `accounting` | AppShell |
| General Ledger | various | Feature | `accounting` | AppShell |
| Trial Balance | various | Feature | `accounting` | AppShell |
| Balance Sheet | various | Feature | `accounting` | AppShell |
| Income Statement | various | Feature | `accounting` | AppShell |
| Cash Flow Statement | various | Feature | `accounting` | AppShell |
| Accounts Receivable | various | Feature | `accounting` | AppShell |
| Accounts Payable | various | Feature | `accounting` | AppShell |
| Bank Accounts | various | Feature | `accounting` | AppShell |
| Budget Management | various | Feature | `accounting` | AppShell |
| Capital Management | various | Feature | `accounting` | AppShell |
| Assets Management | various | Feature | `accounting` | AppShell |
| Liabilities Management | various | Feature | `accounting` | AppShell |
| Equity Management | various | Feature | `accounting` | AppShell |
| Retained Earnings | various | Feature | `accounting` | AppShell |
| Cost Centers | various | Feature | `accounting` | AppShell |
| Loss Account | various | Feature | `accounting` | AppShell |
| Partners Current Account | various | Feature | `accounting` | AppShell |
| Expense Tracking | various | Feature | `accounting` | AppShell |
| Expenses Management | various | Feature | `accounting` | AppShell |
| Sales Management | various | Feature | `accounting` | AppShell |
| Accounting Integration | various | Feature | `accounting` | AppShell |
| Financial Settings | various | Feature | `accounting` | AppShell |

---

## 5. CRM & Marketing

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Lead Pipeline | `/crm/leads` | Custom | `crm` | AppShell |
| Opportunities | `/crm/opportunities` | Custom | `crm` | AppShell |
| Campaigns | `/crm/campaigns` | Custom | `crm` | AppShell |
| Segments | `/crm/segments` | Custom | `crm` | AppShell |
| Tasks | `/crm/tasks` | Custom | `crm` | AppShell |
| CRM Calendar | `/crm/calendar` | Custom | `crm` | AppShell |
| Marketing Hub | various | Feature | `crm` | AppShell |
| Marketing Automation | various | Feature | `crm` | AppShell |
| Email Marketing | various | Feature | `crm` | AppShell |
| Social Media Integration | various | Feature | `crm` | AppShell |
| Social Media Monitoring | various | Feature | `crm` | AppShell |
| Google Business Profile | various | Feature | `crm` | AppShell |

---

## 6. Administration

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Users & Teams | `/admin/users` | Custom | `admin` | AppShell |
| Roles | `/admin/roles` | Custom | `admin` | AppShell |
| Branches | `/admin/branches` | Custom | `admin` | AppShell |
| Settings | `/settings` | Custom | `settings` | AppShell |
| Audit Log | `/admin/audit` | Custom | `audit` | AppShell |
| Role Management | various | Feature | `admin` | AppShell |
| Security Settings | various | Feature | `settings` | AppShell |
| System Settings | various | Feature | `settings` | AppShell |
| ZATCA Settings | various | Feature | `settings` | AppShell |
| Compliance Management | various | Feature | `admin` | AppShell |
| Document Management | various | Feature | `admin` | AppShell |
| Document OCR | various | Feature | `admin` | AppShell |
| Data Import & Export | various | Feature | `admin` | AppShell |
| Data Backup | various | Feature | `admin` | AppShell |

---

## 7. Authentication

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Login | `/login` | Custom | UNGATED | AuthLayout |
| Register | `/register` | Custom | UNGATED | AuthLayout |
| Forgot Password | `/forgot-password` | Custom | UNGATED | AuthLayout |
| Reset Password | `/reset-password` | Custom | UNGATED | AuthLayout |
| OTP Verify | `/otp` | Custom | UNGATED | AuthLayout |
| SSO Login | `/sso` | Custom | UNGATED | AuthLayout |
| Two-Factor Setup | `/2fa-setup` | Custom | UNGATED | AuthLayout |
| Logout Confirmation | `/logout-confirmation` | Custom | UNGATED | AuthLayout |

---

## 8. AI Platform

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| AI Assistant | `/aiassistant` | Custom | `ai` | AppShell |
| Knowledge Base | `/knowledge-base` | Custom | `ai` | AppShell |
| AI Agents | `/ai/agents` | Custom | `ai` | AppShell |
| AI Automation | various | Feature | `ai` | AppShell |
| AI Chatbot | various | Feature | `ai` | AppShell |
| AI Service Advisor | various | Feature | `ai` | AppShell |
| Smart Damage Assessment | various | Feature | `ai` | AppShell |
| ML Fraud Detection | various | Feature | `ai` | AppShell |
| Neural Network Prediction | various | Feature | `ai` | AppShell |
| Prompt Library | various | Feature | `ai` | AppShell |
| Workflow Builder | various | Feature | `ai` | AppShell |

---

## 9. Parts & Inventory Network

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Inventory | `/inventory` | Custom | `inventory` | AppShell |
| Parts Supply Network | `/parts-network` | Custom | `network` | AppShell |
| Parts Availability | various | Feature | `inventory` | AppShell |
| Parts Auto-Reorder | various | Feature | `inventory` | AppShell |
| Smart Parts Recommender | various | Feature | `inventory` | AppShell |
| Inventory Management | various | Feature | `inventory` | AppShell |

---

## 10. Call Center

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Call Center Queue | `/callcenter` | Custom | `callcenter` | AppShell |
| Call Logs | `/callcenter/logs` | Custom | `callcenter` | AppShell |

---

## 11. Reports & Analytics

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Executive Dashboard | various | Feature | `execreports` | AppShell |
| Operational Reports | various | Feature | `reports` | AppShell |
| Workshop Reports | various | Feature | `reports` | AppShell |
| Inventory Reports | various | Feature | `reports` | AppShell |
| Sales Reports | various | Feature | `reports` | AppShell |
| Insurance Reports | various | Feature | `reports` | AppShell |
| Loan Reports | various | Feature | `reports` | AppShell |
| Custom Reports | various | Feature | `reports` | AppShell |
| Business Intelligence | various | Feature | `reports` | AppShell |
| BI Dashboard | various | Feature | `reports` | AppShell |
| Business Heatmaps | various | Feature | `reports` | AppShell |
| Profit Analysis | various | Feature | `reports` | AppShell |
| KPI Dashboard | various | Feature | `reports` | AppShell |
| Productivity Tracker | various | Feature | `reports` | AppShell |

---

## 12. Team & HR

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Technicians | `/technicians` | Custom | `technicians` | AppShell |
| HR Management | various | Feature | `hr` | AppShell |
| Staff Directory | various | Feature | `hr` | AppShell |
| Performance Reviews | various | Feature | `hr` | AppShell |
| Timesheet Management | various | Feature | `hr` | AppShell |
| Payroll Management | various | Feature | `hr` | AppShell |
| Leave Requests | various | Feature | `hr` | AppShell |
| Training & LMS | various | Feature | `hr` | AppShell |
| Leaderboards | various | Feature | `technicians` | AppShell |

---

## 13. Portals & Customer App

### Customer App

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Home | `/customer-app/home` | Custom | `portalcustomer` | CustomerAppShell |
| Garage | `/customer-app/garage` | Custom | `portalcustomer` | CustomerAppShell |
| Appointments | `/customer-app/appointments` | Custom | `portalcustomer` | CustomerAppShell |
| Service Tracking | `/customer-app/service-tracking` | Custom | `portalcustomer` | CustomerAppShell |
| Profile | `/customer-app/profile` | Custom | `portalcustomer` | CustomerAppShell |

### Portal Feature Screens

| Screen | Category | RBAC Module | Shell |
|--------|----------|-------------|-------|
| Technician Portal | Feature | `portaltech` | AppShell |
| Client Portal | Feature | `portalcustomer` | AppShell |
| Supplier Portal | Feature | `portalsupplier` | AppShell |
| Procurement Portal | Feature | `portalprocure` | AppShell |
| Kiosk | Feature | `kiosk` | AppShell |
| Super Admin Portal | Feature | `admin` | AppShell |

---

## 14. Public Website

| Screen | Route | Category | RBAC Module | Shell |
|--------|-------|----------|-------------|-------|
| Landing Page | `/` | Custom | UNGATED | None |
| About | `/about` | Custom | UNGATED | None |
| Services | `/services` | Custom | UNGATED | None |
| Pricing | `/pricing` | Custom | UNGATED | None |
| Blog | `/blog` | Custom | UNGATED | None |
| Contact | `/contact` | Custom | UNGATED | None |
| Privacy Policy | `/privacy` | Custom | UNGATED | None |
| Terms of Service | `/terms` | Custom | UNGATED | None |

---

## 15. Design Reference (RBAC_UNGATED)

| Screen | Route | Category | Shell |
|--------|-------|----------|-------|
| Screen Index | `/spec-index` | Custom | AppShell |
| Flow Spec | `/flow-spec` | Custom | AppShell |
| UI Galleries | various | Custom | AppShell |
| Native Shell Mockups | `/native-shell-*` | Custom | AppShell |

These screens are ungated — no RBAC check is performed. They serve as internal development reference.

---

## Route Categories Summary

| Category | Shell | Auth Required | Count |
|----------|-------|---------------|-------|
| PUBLIC_SCREENS | None / AuthLayout | No | ~35 |
| CUSTOMER_APP_SCREENS | CustomerAppShell | No | ~11 |
| APP_SCREENS | AppShell + RequireAccess | Yes | ~130 |

Unmatched screen entries render `PendingScreen` as a placeholder.

---

## See Also

- [RBAC Matrix](./rbac-matrix.md) — Permission lookup per module and role
- [Design System](./design-system.md) — Component and layout reference
- [Glossary](./glossary.md) — Term definitions
