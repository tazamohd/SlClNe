# SALIS AUTO -- Competitive Analysis

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MKT-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document analyzes the competitive landscape for automotive workshop management solutions in Saudi Arabia. It positions SALIS AUTO against incumbent solutions, imported DMS platforms, general-purpose ERPs, and the prevailing paper-based processes that still dominate the market.

The Saudi automotive aftermarket presents a unique competitive environment shaped by ZATCA Phase 2 mandates, Vision 2030 digitization goals, Arabic language requirements, and SAR currency conventions that most international solutions do not natively support.

---

## 2. Competitive Landscape

### 2.1 Competitor Categories

| Category                  | Examples                        | Market Share (est.) |
|---------------------------|---------------------------------|---------------------|
| International DMS         | CDK Global, Reynolds & Reynolds | 5-8%                |
| General-Purpose ERP       | Odoo, SAP Business One          | 8-12%               |
| Regional Workshop Systems | Local point solutions           | 10-15%              |
| Paper / Spreadsheet       | Manual processes                | 60-70%              |
| SALIS AUTO                | Multi-tenant SaaS               | Emerging            |

### 2.2 CDK Global

**Profile**: Global DMS leader with presence in Saudi market through dealer partnerships.

| Dimension          | Assessment                                                      |
|--------------------|-----------------------------------------------------------------|
| Strengths          | Brand recognition, OEM integrations, large install base globally |
| Weaknesses         | Limited Arabic RTL support, on-premise focus, high total cost    |
| ZATCA Compliance   | Requires third-party add-ons for Phase 2 compliance             |
| Arabic Support     | Partial -- UI translated but not RTL-native                     |
| Pricing            | Enterprise-only pricing, typically SAR 15,000+/month            |
| Target Segment     | Large franchise dealerships only                                |
| Deployment         | Primarily on-premise with managed hosting options               |

### 2.3 Reynolds & Reynolds

**Profile**: North American DMS provider with limited Middle East footprint.

| Dimension          | Assessment                                                      |
|--------------------|-----------------------------------------------------------------|
| Strengths          | Deep dealer workflow expertise, comprehensive parts integration |
| Weaknesses         | No Saudi market presence, no Arabic support, USD-centric        |
| ZATCA Compliance   | Not available                                                   |
| Arabic Support     | None                                                            |
| Pricing            | Not applicable to Saudi market                                  |
| Target Segment     | North American dealerships                                      |
| Deployment         | On-premise / private cloud                                      |

### 2.4 Odoo

**Profile**: Open-source ERP with automotive vertical modules available through community.

| Dimension          | Assessment                                                      |
|--------------------|-----------------------------------------------------------------|
| Strengths          | Modular, affordable, large community, customizable              |
| Weaknesses         | Generic -- not automotive-specific, requires heavy customization |
| ZATCA Compliance   | Community modules available but not officially certified         |
| Arabic Support     | Basic RTL via community localization, inconsistent quality       |
| Pricing            | SAR 500-3,000/month depending on modules and hosting            |
| Target Segment     | SMBs willing to invest in customization                         |
| Deployment         | Cloud and self-hosted                                           |

### 2.5 Paper / Spreadsheet Processes

**Profile**: The dominant "competitor" -- manual processes using paper job cards, Excel spreadsheets, and WhatsApp communication.

| Dimension          | Assessment                                                      |
|--------------------|-----------------------------------------------------------------|
| Strengths          | Zero software cost, no training needed, familiar                |
| Weaknesses         | No ZATCA compliance, data loss risk, no analytics, not scalable |
| ZATCA Compliance   | Non-compliant -- major regulatory risk                          |
| Arabic Support     | Native (handwritten)                                            |
| Pricing            | Free (hidden costs in inefficiency and compliance risk)         |
| Target Segment     | Small independent workshops                                    |
| Deployment         | N/A                                                             |

---

## 3. Feature Comparison Matrix

### 3.1 Core Capabilities

| Capability                    | SALIS AUTO | CDK Global | Odoo    | Paper     |
|-------------------------------|------------|------------|---------|-----------|
| ZATCA Phase 2 E-Invoicing     | Native     | Add-on     | Community| None     |
| Arabic RTL Support            | Full       | Partial    | Basic   | N/A       |
| SAR Halala Precision          | Native     | Configurable| Plugin | N/A      |
| Multi-Tenant SaaS             | Yes        | No         | Yes     | No        |
| Customer Portal               | Yes        | Limited    | Add-on  | No        |
| AI Platform                   | Integrated | No         | No      | No        |
| Mobile-Optimized              | Yes (430px)| No         | Partial | No        |
| Workshop Lifecycle Mgmt       | Native     | Native     | Custom  | Manual    |
| E-Signature Workflow          | SMS+OTP    | No         | No      | Paper     |
| Smart Scheduling              | AI-driven  | Basic      | No      | Manual    |

### 3.2 Technical Capabilities

| Capability                    | SALIS AUTO | CDK Global | Odoo    | Paper     |
|-------------------------------|------------|------------|---------|-----------|
| Cloud-Native Architecture     | Yes        | No         | Yes     | No        |
| Row-Level Security            | PostgreSQL RLS | N/A   | No      | No        |
| Real-Time Dashboards          | Yes        | Yes        | Yes     | No        |
| API-First Design              | REST + JWT | Proprietary| XML-RPC | No       |
| Bilingual Reports             | Yes        | No         | Partial | Manual    |
| Automated Backup              | Daily      | Client resp.| Varies | No       |
| Zero-Downtime Updates         | Yes        | No         | Varies  | N/A       |

### 3.3 Compliance and Regulatory

| Capability                    | SALIS AUTO | CDK Global | Odoo    | Paper     |
|-------------------------------|------------|------------|---------|-----------|
| ZATCA UBL 2.1 XML             | Yes        | Add-on     | Community| No       |
| QR Code Generation            | TLV-encoded| Third-party| Community| No      |
| Hash Chain Integrity          | Yes        | No         | No      | No        |
| 7-Year Document Retention     | Yes        | Client resp.| No     | No        |
| VAT 15% Auto-Calculation      | Yes        | Configurable| Yes   | Manual    |
| Fatoora Portal Integration    | Direct API | Third-party| No     | Manual    |

---

## 4. SWOT Analysis

### 4.1 Strengths

| #  | Strength                                                                   |
|----|----------------------------------------------------------------------------|
| S1 | Purpose-built for Saudi automotive market with native ZATCA Phase 2        |
| S2 | Full Arabic RTL support designed from the ground up, not retrofitted       |
| S3 | SAR halala-precision arithmetic eliminating floating-point currency errors  |
| S4 | Integrated AI Platform (Assistant, Knowledge Base, Agents, Smart Scheduling)|
| S5 | Customer e-signature workflow with SMS OTP verification                    |
| S6 | 191+ screens covering 13 domains -- most comprehensive coverage available  |
| S7 | Multi-tenant SaaS with PostgreSQL RLS data isolation                       |
| S8 | Modern tech stack (React 18 + TypeScript + Vite) enabling rapid iteration  |
| S9 | Mobile-optimized Customer App with bottom tab bar                          |
| S10| 14 role-based demo accounts enabling rapid prospect qualification          |

### 4.2 Weaknesses

| #  | Weakness                                                                   |
|----|----------------------------------------------------------------------------|
| W1 | New entrant with limited brand recognition in the market                   |
| W2 | No existing OEM/manufacturer integrations or certifications                |
| W3 | Smaller implementation and support team compared to global players         |
| W4 | No offline capability -- requires internet connectivity                    |
| W5 | Limited third-party marketplace or ecosystem                               |

### 4.3 Opportunities

| #  | Opportunity                                                                |
|----|----------------------------------------------------------------------------|
| O1 | ZATCA Phase 2 mandate forcing digital transformation across all workshops  |
| O2 | Vision 2030 driving technology adoption in SMB sector                      |
| O3 | 60-70% of market still on paper -- massive addressable opportunity         |
| O4 | No dominant Saudi-specific automotive DMS solution exists                  |
| O5 | Growing fleet management sector (ride-hailing, delivery, rental)           |
| O6 | GCC expansion potential with shared regulatory and cultural context        |
| O7 | AI capabilities creating differentiation that legacy players cannot match  |

### 4.4 Threats

| #  | Threat                                                                     |
|----|----------------------------------------------------------------------------|
| T1 | Global DMS players may invest in Saudi-specific localization               |
| T2 | Odoo community may develop certified ZATCA modules                         |
| T3 | New Saudi-based competitors may emerge with similar positioning            |
| T4 | Regulatory changes may require rapid compliance updates                    |
| T5 | Customer resistance to digital transformation in traditional workshops     |

---

## 5. Competitive Positioning Strategy

### 5.1 Primary Positioning Statement

SALIS AUTO is the only automotive workshop management platform purpose-built for Saudi Arabia, combining native ZATCA Phase 2 compliance, full Arabic RTL support, and AI-powered operations in a modern multi-tenant SaaS delivered at SMB-accessible pricing.

### 5.2 Win Themes by Competitor

| Competitor     | Primary Win Theme                                                      |
|----------------|------------------------------------------------------------------------|
| CDK Global     | 10x lower cost, native Arabic/ZATCA, no on-premise infrastructure      |
| Reynolds       | Actually available in Saudi Arabia with full localization               |
| Odoo           | Purpose-built for automotive -- no customization project required       |
| Paper/Manual   | ZATCA compliance mandate + 25% throughput increase + zero data loss    |

### 5.3 Objection Responses by Competitor

| Objection                                  | Response                                               |
|--------------------------------------------|--------------------------------------------------------|
| "CDK is the industry standard"             | CDK was built for North American dealerships. SALIS AUTO was built for Saudi workshops. Native ZATCA, native Arabic, native SAR. |
| "We already use Odoo"                      | Odoo requires months of customization to approximate what SALIS AUTO delivers out of the box. No ZATCA certification risk. |
| "Paper works fine for us"                  | ZATCA Phase 2 requires e-invoicing. Non-compliance penalties start at SAR 5,000 per invoice. |
| "We cannot afford software"               | SALIS AUTO Starter is SAR 999/month. One ZATCA penalty exceeds 5 months of subscription. |

---

## 6. Market Intelligence

### 6.1 Pricing Benchmarks

| Solution        | Monthly Cost (est.)   | Scope                                  |
|-----------------|-----------------------|----------------------------------------|
| CDK Global      | SAR 15,000-50,000     | Enterprise DMS, per-dealer             |
| Odoo Enterprise | SAR 1,500-5,000       | ERP + customization, per-user tiers    |
| Odoo Community  | SAR 500-2,000         | Hosting + modules, self-managed        |
| Local Solutions  | SAR 300-1,500         | Limited scope, often desktop-only      |
| SALIS AUTO      | SAR 999-2,499+        | Full platform, per-branch tiers        |

### 6.2 Implementation Comparison

| Factor               | SALIS AUTO   | CDK Global    | Odoo          |
|----------------------|--------------|---------------|---------------|
| Time to Go-Live      | 4-8 weeks    | 6-12 months   | 3-6 months    |
| Customization Needed | Minimal      | Moderate      | Extensive     |
| Training Required    | 1-2 weeks    | 4-8 weeks     | 2-4 weeks     |
| Data Migration       | Assisted     | Consulting    | Self-service  |
| Ongoing Maintenance  | Included     | Separate contract | Self-managed |

---

## 7. Competitive Battle Cards

### 7.1 vs. CDK Global -- Quick Reference

| Talking Point       | SALIS AUTO Advantage                                        |
|---------------------|-------------------------------------------------------------|
| Cost                | 90% lower monthly cost                                     |
| Deployment          | Cloud SaaS vs. on-premise infrastructure                   |
| Go-Live             | Weeks vs. months                                           |
| Arabic              | Native RTL vs. partial translation                         |
| ZATCA               | Built-in vs. third-party add-on                            |
| AI                  | Integrated platform vs. not available                      |
| Customer Portal     | Mobile-optimized app vs. limited web portal                |

### 7.2 vs. Odoo -- Quick Reference

| Talking Point       | SALIS AUTO Advantage                                        |
|---------------------|-------------------------------------------------------------|
| Automotive Focus    | Purpose-built vs. generic ERP requiring customization       |
| ZATCA               | Certified native vs. uncertified community module           |
| Workshop Workflow   | Complete lifecycle vs. requires configuration               |
| AI                  | Integrated platform vs. not available                      |
| Support             | Dedicated automotive support vs. generic ERP support        |
| Go-Live             | 4-8 weeks vs. 3-6 months of customization                  |

---

## 8. Cross-References

| Document                                           | Relevance                      |
|----------------------------------------------------|--------------------------------|
| `../project-management/prince2/business-case.md`   | Market opportunity analysis    |
| `../system/integration/zatca-integration.md`        | ZATCA compliance details       |
| `../requirements/functional/`                       | Feature specifications         |

---

*This analysis is based on publicly available information and market observations as of 2026-08-31. Competitor capabilities and pricing may change. Do not share competitor-specific claims externally without legal review.*
