# SALIS AUTO -- Product Overview

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MKT-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Executive Summary

SALIS AUTO is a comprehensive, multi-tenant automotive workshop management SaaS platform purpose-built for the Kingdom of Saudi Arabia. The platform addresses the unique requirements of the Saudi automotive aftermarket, including full ZATCA Phase 2 e-invoicing compliance, bilingual Arabic/English operation with complete RTL support, and SAR-native financial processing with halala-precision arithmetic.

The platform spans 191+ screens across 13 integrated domains, supporting 14 distinct organizational roles through a granular 28-module RBAC framework. From single-bay independent workshops to multi-branch enterprise operations, SALIS AUTO delivers a unified digital backbone that replaces fragmented paper processes, disconnected spreadsheets, and legacy desktop software with a modern, cloud-native solution.

Key outcomes demonstrated across deployments include:

- Estimate approval cycle reduced from 48 hours to 4 hours
- Invoice processing time reduced from 15 minutes to 2 minutes
- Workshop throughput increased by 25%
- Procurement cycle time reduced by 40%
- Fleet utilization improved by 30%

---

## 2. Value Propositions

### 2.1 ZATCA Phase 2 Compliance

SALIS AUTO provides turnkey compliance with Saudi Arabia's ZATCA Phase 2 e-invoicing mandate. The platform handles the complete compliance lifecycle:

| Capability              | Description                                              |
|-------------------------|----------------------------------------------------------|
| E-Invoice Generation    | Automated XML generation conforming to ZATCA UBL 2.1     |
| QR Code Embedding       | TLV-encoded QR codes on every invoice                    |
| Hash Chain Integrity    | Sequential hash chaining across all fiscal documents     |
| VAT Calculation         | Automatic 15% VAT computation on all taxable line items  |
| 7-Year Retention        | Immutable document archive meeting regulatory retention  |
| ZATCA Portal Integration| Direct API integration with ZATCA's Fatoora platform     |

For full technical details, see `../system/integration/zatca-integration.md`.

### 2.2 Operational Efficiency

The platform digitizes the complete workshop lifecycle:

1. **Check-In**: Digital vehicle reception with photo capture and customer details
2. **Inspection**: Multi-point inspection checklists with technician annotations
3. **Estimate**: Itemized parts and labor estimates with approval workflows
4. **Repair**: Job card management, technician assignment, and progress tracking
5. **Quality Control**: Post-repair inspection and sign-off procedures
6. **Delivery**: Final billing, e-signature capture, and vehicle release

Each stage is connected through automated status transitions, real-time notifications, and role-based task queues that eliminate manual handoffs and reduce cycle time.

### 2.3 AI-Powered Insights

The integrated AI Platform transforms workshop data into actionable intelligence:

| AI Module          | Function                                                    |
|--------------------|-------------------------------------------------------------|
| AI Assistant       | Natural language query interface for operational data       |
| Knowledge Base     | Searchable repository of repair procedures and guides       |
| AI Agents          | Automated task execution for routine administrative work    |
| Smart Scheduling   | Predictive bay allocation and technician scheduling         |

### 2.4 Customer Portal

The Customer App provides a mobile-optimized (430px frame) self-service experience:

- Real-time repair status tracking
- Digital estimate review and approval
- E-signature workflow (SMS OTP verification + canvas signature)
- Service history and upcoming maintenance reminders
- Direct messaging with service advisors
- Invoice download and payment status

---

## 3. Platform Highlights

### 3.1 Scale and Coverage

| Metric              | Value                                        |
|----------------------|----------------------------------------------|
| Total Screens        | 191+                                         |
| Functional Domains   | 13                                           |
| Supported Roles      | 14                                           |
| RBAC Modules         | 28                                           |
| Languages            | English, Arabic (full RTL)                   |
| Currency Precision   | Integer halalas (displayed as SAR)           |

### 3.2 Domain Coverage

The 13 integrated domains provide end-to-end workshop management:

| #  | Domain                | Key Capabilities                                       |
|----|-----------------------|--------------------------------------------------------|
| 1  | Workshop              | Job cards, bay management, workflow orchestration      |
| 2  | Registry              | Vehicle and customer master data management            |
| 3  | Finance               | Invoicing, payments, receivables, ZATCA compliance     |
| 4  | Accounting            | Chart of accounts, journal entries, financial reports  |
| 5  | CRM & Marketing       | Customer engagement, campaigns, loyalty programs       |
| 6  | Administration        | System configuration, branch setup, user management   |
| 7  | Authentication        | Login, SSO, session management, password policies      |
| 8  | AI Platform           | AI Assistant, Knowledge Base, Agents, Smart Scheduling |
| 9  | Parts & Inventory     | Stock management, procurement, supplier catalogs       |
| 10 | Call Center           | Inbound/outbound call logging, appointment booking     |
| 11 | Reports & Analytics   | Operational dashboards, KPI tracking, custom reports   |
| 12 | Team & HR             | Employee records, attendance, performance tracking     |
| 13 | Portals               | Customer App, supplier portal, fleet manager portal    |

### 3.3 Role-Based Access

The platform supports 14 distinct roles with granular RBAC permissions across 28 modules. Demo accounts are available for all roles with password `Demo@1234`:

| Role               | Demo Account                  | Primary Access                  |
|--------------------|-------------------------------|---------------------------------|
| Owner              | owner@salisauto.sa            | Full platform access            |
| Branch Manager     | manager@salisauto.sa          | Branch operations and approvals |
| Service Advisor    | advisor@salisauto.sa          | Customer-facing workflows       |
| Technician         | tech@salisauto.sa             | Job execution and reporting     |
| Finance Officer    | finance@salisauto.sa          | Financial operations and ZATCA  |

For the complete RBAC matrix, see `../knowledge-base/reference/rbac-matrix.md`.

---

## 4. Target Market

### 4.1 Primary Segments

| Segment                     | Size Range                   | Key Needs                          |
|-----------------------------|------------------------------|------------------------------------|
| Independent Workshops       | 1-2 bays, 3-10 staff        | Digitization, ZATCA compliance     |
| Multi-Branch Operators      | 3-10 branches, 50-200 staff | Centralized management, analytics  |
| Franchise Dealership Groups | 10+ locations, 200+ staff   | Enterprise controls, fleet mgmt   |
| Fleet Maintenance Providers | Dedicated fleet operations   | Utilization tracking, SLA mgmt    |

### 4.2 Geographic Focus

- **Primary**: Riyadh, Jeddah, Dammam (Eastern Province)
- **Secondary**: Makkah, Madinah, Tabuk, Abha
- **Expansion**: GCC markets (UAE, Bahrain, Kuwait, Oman, Qatar)

### 4.3 Buyer Personas

| Persona            | Title                    | Primary Motivation                      |
|--------------------|--------------------------|-----------------------------------------|
| Abdullah (Owner)   | Workshop Owner/CEO       | Revenue growth, compliance, visibility  |
| Faisal (Ops)       | Operations Manager       | Efficiency, throughput, staff mgmt      |
| Hessa (Finance)    | Finance Manager/CFO      | ZATCA compliance, cash flow, reporting  |
| Noura (Service)    | Service Manager          | Customer satisfaction, turnaround time  |

---

## 5. Deployment Options

### 5.1 Cloud SaaS (Primary)

| Feature                | Detail                                              |
|------------------------|------------------------------------------------------|
| Hosting                | Multi-tenant cloud infrastructure                   |
| Data Residency         | Saudi Arabia (KSA data centers)                     |
| Availability           | 99.9% SLA                                           |
| Updates                | Automatic, zero-downtime deployments                |
| Backup                 | Daily automated backups with 30-day retention       |
| Scaling                | Automatic horizontal scaling                        |

### 5.2 Technology Stack

| Layer       | Technology                                            |
|-------------|-------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite                            |
| Backend     | Express.js, Drizzle ORM                               |
| Database    | PostgreSQL with Row-Level Security (RLS)              |
| Tenancy     | Organization → Branch → User hierarchy with RLS       |
| API         | RESTful with JWT authentication                       |

### 5.3 Security and Compliance

- Multi-tenant data isolation via PostgreSQL Row-Level Security
- Organization → Branch → User hierarchy enforcement
- JWT-based authentication with role-based authorization
- Audit logging across all data mutations
- ZATCA-compliant document integrity (hash chain, digital signatures)

---

## 6. Implementation

### 6.1 Onboarding Timeline

| Phase                | Duration    | Activities                                         |
|----------------------|-------------|----------------------------------------------------|
| Discovery            | 1-2 weeks   | Requirements gathering, data audit                 |
| Configuration        | 1-2 weeks   | Branch setup, role assignment, module activation   |
| Data Migration       | 1-3 weeks   | Customer, vehicle, and financial data import       |
| Training             | 1-2 weeks   | Role-based training sessions                       |
| Go-Live              | 1 week       | Parallel run, cutover, post-go-live support       |

### 6.2 Support Model

| Channel       | Availability                                          |
|---------------|-------------------------------------------------------|
| In-App Chat   | 24/7 AI-assisted, business hours human escalation     |
| Phone         | Sunday-Thursday, 8 AM - 6 PM AST                     |
| Email         | 24-hour response SLA                                  |
| On-Site       | Available for Enterprise tier                         |

---

## 7. Cross-References

| Document                                           | Relevance                      |
|----------------------------------------------------|--------------------------------|
| `../project-management/prince2/business-case.md`   | Financial justification        |
| `../system/integration/zatca-integration.md`        | ZATCA technical specification  |
| `../knowledge-base/reference/rbac-matrix.md`        | Role and permission details    |
| `../requirements/functional/`                       | Detailed functional specs      |
| `../user-documentation/guides/`                     | End-user training materials    |

---

*This document is intended for internal sales and marketing use. All figures represent demonstrated platform capabilities. Actual results may vary based on implementation scope and customer operations.*
