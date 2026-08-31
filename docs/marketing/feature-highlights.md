# SALIS AUTO -- Feature Highlights

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MKT-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document provides a domain-by-domain feature overview of the SALIS AUTO platform, highlighting the headline capabilities that differentiate the product in the Saudi automotive aftermarket. Each domain lists 3-5 key features with descriptions, followed by measurable KPI impacts and platform differentiators.

---

## 2. Domain Feature Sheets

### 2.1 Workshop

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Digital Job Cards          | End-to-end job card lifecycle from creation through QC and delivery. Automated status transitions with real-time notifications to advisors, technicians, and managers. |
| Bay Management             | Visual bay allocation board with drag-and-drop scheduling. Real-time occupancy tracking and utilization metrics per bay and per branch. |
| Workflow Orchestration     | Configurable workflow engine enforcing the Check-In → Inspection → Estimate → Repair → QC → Delivery lifecycle. Stage gates prevent skipping mandatory steps. |
| Multi-Point Inspection     | Digital inspection checklists with photo annotations, severity grading, and automatic estimate line-item generation from flagged issues. |
| Technician Assignment      | Skill-based technician routing with workload balancing. Time tracking per job card with estimated vs. actual labor analysis. |

### 2.2 Registry

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Vehicle Master Data        | Comprehensive vehicle profiles with VIN decoding, make/model/year, mileage history, and photo gallery. Supports Saudi plate formats. |
| Customer Database          | Unified customer records with contact details, communication preferences, service history, and lifetime value tracking. |
| Fleet Management           | Fleet owner accounts with vehicle grouping, contract terms, SLA tracking, and bulk operations across fleet vehicles. |
| Service History            | Complete chronological service record per vehicle including parts used, labor performed, and advisor notes. Searchable and exportable. |

### 2.3 Finance

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| ZATCA Phase 2 E-Invoicing  | Fully compliant e-invoice generation with UBL 2.1 XML, TLV QR codes, sequential hash chaining, and Fatoora portal integration. |
| VAT Automation             | Automatic 15% VAT calculation on taxable items with proper line-item and document-level tax summaries conforming to ZATCA requirements. |
| Payment Processing         | Multi-method payment recording (cash, card, bank transfer, Mada). Split payment support and partial payment tracking. |
| Accounts Receivable        | Aging reports, automated payment reminders, and statement generation. Customer balance tracking with credit limit enforcement. |
| 7-Year Document Retention  | Immutable invoice archive with tamper-proof hash chain integrity verification meeting ZATCA regulatory retention requirements. |

### 2.4 Accounting

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Chart of Accounts          | Configurable multi-level chart of accounts aligned with Saudi accounting standards. Pre-built templates for automotive workshops. |
| Journal Entries            | Automated journal entry creation from invoices, payments, and adjustments. Manual entry support with approval workflows. |
| Financial Statements       | Auto-generated balance sheet, income statement, and cash flow statement. Period comparison and branch consolidation. |
| Bank Reconciliation        | Statement import and matching with automated reconciliation suggestions. Exception handling and audit trail. |

### 2.5 CRM & Marketing

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Customer Engagement        | Automated service reminders, follow-up campaigns, and satisfaction surveys triggered by workflow events. |
| Campaign Management        | Multi-channel campaign creation (SMS, email, WhatsApp) with audience segmentation, scheduling, and performance tracking. |
| Loyalty Programs           | Points-based loyalty system with configurable earn/burn rules, tier management, and redemption tracking. |
| Lead Management            | Inbound lead capture from website, phone, and walk-in channels with assignment rules and conversion tracking. |

### 2.6 Administration

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Multi-Tenant Configuration | Organization → Branch → User hierarchy with tenant-specific branding, settings, and data isolation via PostgreSQL RLS. |
| Role & Permission Mgmt    | 14 pre-built roles across 28 RBAC modules. Custom role creation with granular permission assignment per module and action. |
| System Settings            | Branch-level configuration for working hours, bay count, labor rates, tax settings, and notification preferences. |
| Audit Logging              | Comprehensive audit trail of all data changes with user, timestamp, before/after values, and IP address. |

### 2.7 Authentication

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Secure Login               | JWT-based authentication with configurable password policies, account lockout, and session management. |
| Multi-Factor Auth          | SMS OTP-based second factor for sensitive operations and administrative access. |
| Session Management         | Concurrent session control, automatic timeout, and forced logout capabilities for administrators. |

### 2.8 AI Platform

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| AI Assistant               | Natural language interface for querying operational data. Ask questions like "What is today's revenue?" or "Which technician has the most open jobs?" |
| Knowledge Base             | Searchable AI-powered repository of repair procedures, manufacturer bulletins, and best practices. |
| AI Agents                  | Automated task execution for routine operations such as appointment confirmations, follow-up scheduling, and report generation. |
| Smart Scheduling           | Predictive bay and technician scheduling using historical job duration data, technician skills, and current workload. |
| Predictive Analytics       | AI-driven insights for demand forecasting, parts reorder suggestions, and customer churn prediction. |

### 2.9 Parts & Inventory

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Stock Management           | Real-time inventory tracking with minimum/maximum levels, automatic reorder point alerts, and multi-location support. |
| Procurement                | Purchase order creation, supplier management, and receiving workflows. Price comparison across suppliers. |
| Supplier Catalogs          | Digital supplier catalogs with part number cross-referencing, pricing tiers, and lead time tracking. |
| Parts Reservation          | Automatic parts reservation against job cards with availability checking and back-order management. |
| Inventory Valuation        | FIFO and weighted average costing methods with real-time valuation reports and cost-of-goods tracking. |

### 2.10 Call Center

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Call Logging               | Inbound and outbound call recording with customer auto-identification, call categorization, and disposition tracking. |
| Appointment Booking        | Calendar-based appointment scheduling with bay availability checking, advisor assignment, and customer confirmation. |
| Follow-Up Management       | Automated follow-up task creation from calls with escalation rules and SLA tracking. |

### 2.11 Reports & Analytics

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Operational Dashboards     | Role-specific dashboards with real-time KPIs: revenue, throughput, bay utilization, technician productivity, and customer satisfaction. |
| Custom Reports             | Drag-and-drop report builder with filters, grouping, and export to PDF/Excel. Scheduled report delivery via email. |
| KPI Tracking               | Configurable KPI definitions with target setting, trend analysis, and automated alerting on threshold breaches. |
| Branch Comparison          | Multi-branch performance comparison across revenue, efficiency, and customer metrics. |
| Financial Analytics        | Revenue analysis, cost breakdown, margin tracking, and cash flow forecasting with drill-down capability. |

### 2.12 Team & HR

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Employee Records           | Comprehensive employee profiles with Iqama/visa details, skills matrix, certifications, and training history. |
| Attendance Tracking        | Clock-in/clock-out with geolocation verification, overtime calculation, and absence management. |
| Performance Management     | KPI-based performance scoring with peer reviews, goal setting, and performance improvement plans. |
| Shift Scheduling           | Configurable shift patterns with rotation management, availability tracking, and conflict detection. |

### 2.13 Portals

| Feature                    | Description                                                          |
|----------------------------|----------------------------------------------------------------------|
| Customer App               | Mobile-optimized (430px frame) portal with bottom tab bar for status tracking, estimate approvals, e-signatures, and service history. |
| Supplier Portal            | Supplier self-service for catalog updates, PO acknowledgment, invoice submission, and payment status. |
| Fleet Manager Portal       | Fleet-level views with vehicle status overview, maintenance schedules, cost tracking, and SLA compliance reporting. |

---

## 3. KPI Impact Summary

| KPI                          | Before SALIS AUTO | After SALIS AUTO | Improvement     |
|------------------------------|--------------------|--------------------|-----------------|
| Estimate Approval Cycle      | 48 hours           | 4 hours            | 91.7% faster    |
| Invoice Processing Time      | 15 minutes         | 2 minutes          | 86.7% faster    |
| Workshop Throughput           | Baseline           | +25%               | 25% increase    |
| Procurement Cycle Time       | Baseline           | -40%               | 40% reduction   |
| Fleet Utilization             | Baseline           | +30%               | 30% increase    |
| Customer Wait Time            | 45 minutes         | 15 minutes         | 66.7% reduction |
| Data Entry Errors             | 8-12%              | <1%                | 90%+ reduction  |
| ZATCA Compliance Rate         | Manual/partial     | 100% automated     | Full compliance |

---

## 4. Platform Differentiators

### 4.1 Arabic RTL Native Support

Unlike retrofitted solutions, SALIS AUTO was built from the ground up with full Arabic RTL support. Every screen, form, report, and notification functions natively in both English and Arabic with proper RTL layout, Arabic numerals, and culturally appropriate formatting.

### 4.2 SAR Halala Precision

All monetary values are stored as integer halalas (1 SAR = 100 halalas), eliminating floating-point rounding errors that plague systems using decimal currency storage. Display formatting consistently renders values in SAR with proper Arabic/English number formatting.

### 4.3 ZATCA Phase 2 Compliance

Purpose-built ZATCA integration covering the complete Phase 2 specification including simplified and standard tax invoices, credit/debit notes, QR code generation, hash chain integrity, and direct Fatoora portal connectivity.

### 4.4 AI-First Architecture

The AI Platform is not a bolt-on addition but an integral part of the platform architecture. AI capabilities are woven into scheduling, customer communication, inventory management, and operational analytics.

### 4.5 Multi-Tenant Isolation

Every tenant's data is isolated through PostgreSQL Row-Level Security (RLS) at the database level. The organization-to-branch-to-user hierarchy ensures that queries never return data belonging to another tenant, even in shared infrastructure. This eliminates the cost and complexity of per-tenant database provisioning while maintaining enterprise-grade data separation.

### 4.6 E-Signature and Digital Authorization

The customer e-signature workflow combines three verification layers -- SMS delivery, OTP authentication, and canvas signature capture -- into a seamless mobile experience. This replaces printed estimate forms and in-person sign-off visits, enabling legally valid remote authorization that accelerates the estimate-to-repair transition.

---

## 5. Feature Roadmap Highlights

The following capabilities are planned for upcoming releases and represent areas of active development:

| Feature                         | Target Release | Domain                |
|---------------------------------|----------------|-----------------------|
| OBD-II Diagnostic Integration   | Q1 2027        | Workshop              |
| Predictive Parts Demand         | Q1 2027        | Parts & Inventory     |
| Customer Loyalty Mobile App     | Q2 2027        | CRM & Marketing       |
| WhatsApp Business API Channel   | Q2 2027        | Call Center           |
| Advanced Fleet SLA Dashboards   | Q3 2027        | Portals               |
| Warranty Claim Automation       | Q3 2027        | Finance               |

*Roadmap items are subject to change based on customer feedback and market priorities.*

---

## 6. Cross-References

| Document                                           | Relevance                           |
|----------------------------------------------------|-------------------------------------|
| `../requirements/functional/`                       | Detailed feature specifications     |
| `../knowledge-base/reference/rbac-matrix.md`        | Role-based access details           |
| `../system/integration/zatca-integration.md`        | ZATCA technical implementation      |
| `../user-documentation/guides/`                     | Feature usage guides                |

---

*Feature availability may vary by subscription tier. See SA-MKT-008 (Pricing Guide) for tier-specific module access.*
