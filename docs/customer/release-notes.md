# SALIS AUTO -- Release Notes v1.0.0

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-CST-001                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Public                       |

---

## Release Overview

**Version:** 1.0.0 (General Availability)
**Release Date:** 2026-09-02
**Environment:** Production

We are excited to announce the general availability of SALIS AUTO, the automotive workshop management platform built for Saudi Arabia. This release delivers a complete, cloud-based solution covering every aspect of workshop operations -- from customer check-in to invoice delivery -- with full ZATCA Phase 2 e-invoicing compliance and bilingual English/Arabic support.

---

## Top 5 Highlights

1. **Complete Workshop Lifecycle** -- Manage every job from check-in through inspection, estimate, repair, quality check, and delivery with a visual 6-stage workflow tracker.
2. **ZATCA Phase 2 E-Invoicing** -- Generate fully compliant electronic invoices with QR codes, hash chains, and direct ZATCA API integration. No manual filing required.
3. **Bilingual English/Arabic Interface** -- Switch between English and Arabic with one click. Full right-to-left (RTL) layout support across all 191+ screens.
4. **Customer Mobile App** -- Your customers can book appointments, track repairs in real time, view invoices, and manage their vehicles from their phones.
5. **Role-Based Access for 14 Roles** -- From Owner to Technician to Customer, every team member sees exactly the screens and data relevant to their job.

---

## New Features by Domain

### 1. Authentication and Security

- Secure login with email and password
- Two-factor verification with one-time passwords (OTP)
- "Remember me" for returning users
- Automatic session management with secure token rotation
- Password recovery via email

### 2. Workshop Management

- 6-stage job card workflow: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery
- Service bay assignment with visual bay management
- Appointment scheduling with overlap detection
- Technician task assignment and progress tracking
- Quality control checklists for consistent service delivery

### 3. Customer and Vehicle Registry

- Customer profiles with contact details and service history
- Vehicle records with make, model, year, VIN, and plate number
- Saudi-format vehicle plate validation
- Search across customers, vehicles, and parts from one search bar
- Complete service history per vehicle

### 4. Finance and Invoicing

- Invoice creation with line items, discounts, and VAT calculation
- ZATCA Phase 2 compliant e-invoicing (see details below)
- Payment recording (cash, bank transfer, card)
- Credit and debit note support
- Automatic VAT calculation at 15%

### 5. Accounting

- Chart of accounts with hierarchical structure
- Journal entries with posting workflow
- Expense tracking by category and vendor
- Financial statements: balance sheet, income statement, trial balance
- Bank reconciliation with statement import

### 6. Parts and Inventory

- Parts catalog with stock levels and reorder alerts
- Purchase requisitions and purchase orders
- Stock movements tracking (receipt, issue, transfer, adjustment)
- Inter-branch stock transfers
- Supplier directory management

### 7. CRM and Marketing

- Lead management with pipeline tracking
- Customer segmentation for targeted outreach
- Campaign management
- Customer feedback collection linked to completed jobs
- Public lead intake form for your website

### 8. AI Platform

- AI Assistant for platform guidance and troubleshooting
- Knowledge base for technician reference
- Smart scheduling suggestions
- OBD diagnostic code lookup

### 9. Call Center

- Centralized customer communication hub
- Call logging and follow-up tracking
- Quick access to customer and vehicle records
- Appointment booking from incoming calls

### 10. Human Resources

- Employee management with profiles and roles
- Leave request and approval workflow
- Timesheet tracking with clock-in/clock-out
- Payroll management with monthly runs
- Attendance monitoring

### 11. Portals

- **Customer App**: Mobile-optimized portal for booking, tracking, and vehicle management
- **Supplier Portal**: Suppliers can view and respond to purchase orders
- **Technician Portal**: Focused view for assigned tasks and job updates

### 12. Reports and Analytics

- Financial reports: revenue, expenses, profit and loss, cash flow
- Operational reports: workshop throughput, technician productivity
- Executive dashboards with KPIs and trend analysis
- Custom report builder (Professional and Enterprise plans)
- CSV and PDF export for all reports

### 13. Administration

- Organization settings: name, logo, branches, contact details
- User management: create, edit, deactivate users across 14 roles
- Role and permission matrix with 28 modules
- Branch management with capacity configuration
- Audit log for compliance and accountability

---

## ZATCA Phase 2 Compliance

SALIS AUTO is fully certified for ZATCA Phase 2 e-invoicing:

| Capability                      | Status      |
|---------------------------------|-------------|
| API integration with ZATCA      | Certified   |
| Real-time B2B invoice clearance | Operational |
| B2C invoice reporting (24-hour) | Operational |
| QR code on all invoices         | Enabled     |
| SHA-256 hash chain              | Enabled     |
| Digital signing with CSID       | Enabled     |
| Standard invoices (388)         | Supported   |
| Credit notes (381)              | Supported   |
| Debit notes (383)               | Supported   |
| 7-year record retention         | Automatic   |

All invoices are automatically submitted to ZATCA. No manual steps are required. Your VAT number and seller details are configured once in Settings, and every invoice generated by the system is compliant.

---

## Bilingual English/Arabic Support

- Full interface available in both English and Arabic
- One-click language switching from the sidebar
- Complete right-to-left (RTL) layout for Arabic
- All labels, navigation, forms, and reports render in the selected language
- Invoices and customer-facing documents support both languages

---

## Customer App

The SALIS AUTO Customer App gives your workshop customers a modern self-service experience:

- **Home**: View active service status, wallet balance, and quick actions
- **Garage**: See all registered vehicles with full service history
- **Bookings**: Schedule appointments and view upcoming bookings
- **Tracking**: Follow repair progress in real time through each workshop stage
- **Profile**: Manage personal information and notification preferences

The Customer App is available on Professional and Enterprise plans, or as an add-on for Starter plan subscribers.

---

## Known Limitations

| Area                    | Limitation                                              | Planned Resolution     |
|-------------------------|---------------------------------------------------------|------------------------|
| Offline mode            | The platform requires an internet connection            | Planned for v2.0.0     |
| Native mobile app       | Customer App is web-based (no App Store / Play Store)   | Planned for v2.0.0     |
| Multi-currency          | All transactions are in SAR only                        | Planned for v2.0.0     |
| WhatsApp notifications  | Not yet available; SMS and email supported              | Coming in v1.1.0       |
| Report scheduling       | Scheduled report delivery coming soon                   | Coming in v1.2.0       |

---

## Upgrade Instructions

### New Customers

No action required. Sign up at [salisauto.sa](https://salisauto.sa) and your account will be provisioned on the latest version automatically.

### Beta Participants

If you participated in the SALIS AUTO beta program:

1. **Your data has been preserved.** All customer records, vehicle data, job cards, and invoices from the beta period are intact.
2. **Log in as usual.** Your existing credentials continue to work.
3. **Review your settings.** Navigate to Settings to confirm your organization details, ZATCA configuration, and notification preferences.
4. **Update your bookmarks.** The production URL is `https://app.salisauto.sa`.

---

## Breaking Changes from Beta

| Change                               | Impact                                           | Action Required                 |
|---------------------------------------|--------------------------------------------------|----------------------------------|
| Money values stored in halalas        | All financial amounts now use halalas internally | No action; display unchanged     |
| Invoice hash chain enabled            | Invoices are now cryptographically linked         | No action; automatic             |
| Refresh token rotation                | Sessions now use rotating tokens                  | Users may need to log in again   |
| RBAC expanded to 28 modules           | Some permissions may have changed                 | Review user permissions          |

---

## Support and Contact

| Channel               | Details                                           | Availability              |
|-----------------------|---------------------------------------------------|---------------------------|
| Email Support         | support@salisauto.sa                              | All plans                 |
| Phone Support         | +966 11 XXX XXXX                                  | Professional & Enterprise |
| Dedicated Account Mgr | Assigned upon onboarding                          | Enterprise only           |
| AI Assistant          | Available in-app (click the chat icon)            | All plans                 |
| Knowledge Base        | [help.salisauto.sa](https://help.salisauto.sa)    | All plans                 |

### Response Times

| Plan          | Email Response | Phone Response |
|---------------|----------------|----------------|
| Starter       | 24 hours       | --             |
| Professional  | 4 hours        | 4 hours        |
| Enterprise    | 1 hour         | 1 hour         |

---

## What Comes Next

| Version | Expected Date   | Highlights                                        |
|---------|-----------------|---------------------------------------------------|
| 1.1.0   | October 2026    | Post-launch fixes, performance tuning, UX polish  |
| 1.2.0   | November 2026   | Customer feedback improvements, report scheduling  |
| 1.3.0   | December 2026   | Additional report types, dashboard enhancements    |
| 2.0.0   | Q1 2027         | Native mobile app, offline mode, multi-currency    |

---

## Related Resources

- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [Account Management Guide](account-management-guide.md)
- [System Status Guide](system-status-guide.md)
- [Data Portability Guide](data-portability-guide.md)

---

*Thank you for choosing SALIS AUTO. We are committed to helping you run a more efficient, compliant, and customer-friendly workshop.*
