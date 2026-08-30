# SALIS AUTO -- Procurement Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PM-PR-001                               |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the procurement strategy for third-party tools, services, and vendor relationships required to build, deploy, and operate the SALIS AUTO platform. It covers vendor selection criteria specific to the Saudi market, make-or-buy decisions for key integrations, and ongoing cost tracking. Related budget context is in the [Project Charter](pmp/project-charter.md).

---

## 2. Development Tools

### 2.1 Source Control and CI/CD

| Tool              | Purpose                          | Contract Type   | Est. Monthly Cost (SAR) |
|-------------------|----------------------------------|-----------------|-------------------------|
| GitHub Teams      | Repository, Actions CI/CD, PRs   | SaaS / per-seat | SAR 150/seat (17 seats) |
| GitHub Actions     | Build, test, deploy pipelines   | Usage-based     | Included in Teams tier  |

### 2.2 Hosting and Deployment

| Tool              | Purpose                          | Contract Type   | Est. Monthly Cost (SAR) |
|-------------------|----------------------------------|-----------------|-------------------------|
| Vercel Pro         | Primary frontend hosting (SPA)  | SaaS / per-seat | SAR 75/seat             |
| Netlify Pro        | Failover frontend hosting       | SaaS / flat     | SAR 75/month            |
| Cloud PostgreSQL   | Production database (managed)   | Usage-based     | SAR 750--1,500/month    |

### 2.3 Monitoring and Error Tracking

| Tool              | Purpose                          | Contract Type   | Est. Monthly Cost (SAR) |
|-------------------|----------------------------------|-----------------|-------------------------|
| Sentry             | Error tracking, performance     | SaaS / event    | SAR 375/month (Team)    |
| UptimeRobot        | Uptime monitoring, alerts       | SaaS / flat     | SAR 55/month (Pro)      |
| LogTail/Axiom      | Centralized logging             | SaaS / GB       | SAR 185/month           |

### 2.4 Design and Collaboration

| Tool              | Purpose                          | Contract Type   | Est. Monthly Cost (SAR) |
|-------------------|----------------------------------|-----------------|-------------------------|
| Figma Professional | UI/UX design, prototyping       | SaaS / per-seat | SAR 55/seat (3 seats)   |
| Linear/Jira        | Issue tracking, sprint boards   | SaaS / per-seat | SAR 30/seat             |

---

## 3. Third-Party Services

### 3.1 Payment Processing

| Vendor           | Service               | Pricing Model        | Saudi Compliance     |
|------------------|-----------------------|----------------------|----------------------|
| HyperPay         | Payment gateway       | Transaction fee 2.5% | SAMA licensed, SAR   |
| Moyasar          | Payment gateway (alt) | Transaction fee 2.3% | SAMA licensed, SAR   |
| Stripe           | International fallback| Transaction fee 2.9% | No SAR settlement    |

**Selected:** HyperPay (primary) -- SAMA-licensed, SAR settlement, local support in Riyadh.

### 3.2 Communication Services

| Vendor           | Service               | Pricing Model        | Saudi Compliance     |
|------------------|-----------------------|----------------------|----------------------|
| Unifonic          | SMS + WhatsApp (SA)  | Per-message           | CITC registered      |
| Twilio            | SMS (international)  | Per-message           | Saudi number support |
| Amazon SES        | Transactional email  | Per-email (SAR 0.04) | --                   |
| Resend            | Transactional email  | Per-email + flat      | --                   |

**Selected:** Unifonic (SMS/WhatsApp) + Amazon SES (email) -- Unifonic is the preferred Saudi provider for OTP delivery and WhatsApp Business API; SES provides cost-effective transactional email.

### 3.3 Cloud and Infrastructure

| Vendor           | Service               | Pricing Model        | Saudi Data Residency |
|------------------|-----------------------|----------------------|----------------------|
| AWS ME (Bahrain)  | Compute, storage, DB | Usage-based           | GCC region           |
| Alibaba Cloud SA  | Compute, storage     | Usage-based           | Riyadh region        |
| STC Cloud          | Managed hosting      | Flat + usage          | Saudi data center    |

**Selected:** AWS ME (Bahrain) -- closest compliant region with full PostgreSQL RDS support. Evaluate STC Cloud for data residency requirements if regulatory mandates change.

---

## 4. Vendor Selection Criteria

All vendors are evaluated against the following weighted criteria:

| Criterion                    | Weight | Description                                                    |
|------------------------------|--------|----------------------------------------------------------------|
| Saudi data residency         | 25%    | Data stored within Saudi Arabia or GCC (mandatory for PII)     |
| Arabic language support      | 15%    | Admin console, documentation, and support available in Arabic  |
| SLA and uptime guarantee     | 20%    | Minimum 99.9% uptime, documented incident response             |
| SAR currency support         | 10%    | Native SAR billing, invoicing, and settlement                  |
| Integration complexity       | 15%    | REST API availability, SDK quality, documentation completeness |
| Cost efficiency              | 10%    | Total cost of ownership over 24 months                         |
| Vendor stability             | 5%     | Company size, funding, Saudi market presence                   |

### 4.1 Evaluation Process

1. **Requirements gathering** -- PM and Tech Lead define integration requirements
2. **Vendor shortlist** -- 2-3 vendors per category, scored against criteria above
3. **POC/sandbox testing** -- 1-week proof of concept for critical integrations (payment, ZATCA)
4. **Contract negotiation** -- Legal review for data residency and SLA terms
5. **Approval** -- Steering committee sign-off for contracts exceeding SAR 10,000/month

---

## 5. Licensing Requirements

| License Type               | Components Affected                      | Obligation                              |
|----------------------------|------------------------------------------|-----------------------------------------|
| MIT                        | React, Vite, TailwindCSS, Drizzle ORM   | Include license notice in build output  |
| Apache 2.0                 | Various utility libraries                | Include license and NOTICE file         |
| ISC                        | Various npm packages                     | Include license notice                  |
| Commercial (SaaS)          | Vercel, Sentry, GitHub, Figma            | Active subscription required            |
| Proprietary (API)          | HyperPay, Unifonic, ZATCA SDK            | API agreement and key management        |

**License audit:** Run `pnpm licenses list` before each release to ensure no GPL/AGPL contamination in the production bundle.

---

## 6. Make-or-Buy Analysis

### 6.1 Decision Matrix

| Capability              | Build | Buy/Integrate | Decision  | Rationale                                                     |
|--------------------------|-------|---------------|-----------|---------------------------------------------------------------|
| ZATCA e-invoicing        | Yes   | --            | **Build** | No off-the-shelf solution fits our Drizzle ORM + hash chain model; ZATCA SDK is government-provided |
| OBD vehicle diagnostics  | --    | Yes           | **Buy**   | Hardware integration requires specialized firmware expertise  |
| Payment processing       | --    | Yes           | **Buy**   | PCI-DSS compliance is prohibitively expensive to build        |
| SMS/WhatsApp delivery    | --    | Yes           | **Buy**   | Carrier relationships and CITC registration required          |
| Email delivery           | --    | Yes           | **Buy**   | Deliverability reputation takes years to establish            |
| RBAC engine              | Yes   | --            | **Build** | 14-role, 28-module model is too specific for generic solutions|
| Bilingual i18n           | Yes   | --            | **Build** | RTL + Arabic key generation is tightly coupled to UI          |
| PDF invoice generation   | Yes   | --            | **Build** | ZATCA-mandated QR codes and format require custom layout      |
| Reporting dashboards     | Yes   | --            | **Build** | Deep integration with 30+ tables and domain-specific KPIs    |
| Push notifications       | --    | Yes           | **Buy**   | Firebase/OneSignal handles device token management            |

### 6.2 Build Justification Details

**ZATCA e-invoicing (Build):** The government-provided ZATCA SDK handles XML generation and cryptographic signing. Our build responsibility is the integration layer: hash chain maintenance across invoices, QR code generation per ZATCA Phase 2 spec, and the clearance/reporting API calls. No commercial SaaS product integrates with our Drizzle ORM schema or supports our multi-tenant `org_id` isolation model.

**RBAC engine (Build):** SALIS AUTO's 14-role hierarchy with 28 modules, triple-layer enforcement (JWT claims + UI `can()` + API middleware), and the approval chain (owner -> superadmin -> manager -> advisor -> parts/accountant/procurement) is too specific for Casbin or similar libraries. The RBAC matrix is generated from the design-data pipeline (`rbac.ts`), making it a first-class part of the build.

---

## 7. Contract Types

| Contract Type        | Used For                          | Payment Terms           | Risk Allocation       |
|----------------------|-----------------------------------|-------------------------|-----------------------|
| SaaS subscription    | GitHub, Vercel, Sentry, Figma     | Monthly/annual prepaid  | Vendor bears uptime   |
| API usage-based      | HyperPay, Unifonic, AWS SES       | Monthly in arrears      | Shared -- volume risk |
| Fixed-fee            | Security audit, ZATCA consultant  | Milestone-based         | Vendor bears delivery |
| Time & materials     | ZATCA contractor, Arabic linguist | Hourly/daily rate       | Client bears scope    |

---

## 8. Cost Tracking

### 8.1 Monthly Budget Summary

| Category                  | Estimated Monthly (SAR) | Annual (SAR)   |
|---------------------------|-------------------------|----------------|
| Hosting & infrastructure  | 2,400                   | 28,800         |
| Development tools         | 3,200                   | 38,400         |
| Third-party APIs          | 1,500 (variable)        | 18,000         |
| Monitoring & logging      | 615                     | 7,380          |
| Design tools              | 255                     | 3,060          |
| Licensing & compliance    | 500                     | 6,000          |
| **Total tools/services**  | **8,470**               | **101,640**    |

### 8.2 Cost Review Process

- **Monthly:** DevOps Engineer reviews usage dashboards, flags anomalies > 20% over baseline
- **Quarterly:** PM reviews total procurement spend against budget, renegotiates contracts if needed
- **Annually:** Steering committee reviews vendor relationships, evaluates alternatives

---

## 9. Vendor Management

### 9.1 Vendor Communication

| Vendor      | Primary Contact | Escalation Contact | Review Cadence |
|-------------|-----------------|--------------------|--------------------|
| HyperPay    | Account Manager | Regional Director  | Quarterly          |
| Unifonic    | Technical Lead  | Account Manager    | Monthly            |
| AWS         | TAM (if any)    | AWS Support        | As-needed          |
| Vercel      | Support ticket  | Enterprise support | As-needed          |

### 9.2 SLA Monitoring

All vendor SLAs are tracked in the project's monitoring dashboard. Breaches trigger:

1. Automated alert to DevOps Engineer
2. Incident logged in the [Incident Response](../system/incident-response.md) process
3. Vendor notified within 24 hours with impact assessment
4. Credit claim submitted per contract terms

---

## 10. Related Documents

- [Project Charter](pmp/project-charter.md) -- Budget authority and project objectives
- [Risk Register](pmp/risk-register.md) -- Vendor-related risks
- [Business Continuity Plan](../system/business-continuity.md) -- Failover for vendor outages
- [SLA Document](../system/sla-document.md) -- Platform SLAs linked to vendor SLAs
- [Resource Management Plan](resource-management.md) -- Contractor staffing decisions
