# SALIS AUTO -- Business Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Executive Summary

SALIS AUTO is a multi-tenant SaaS platform purpose-built for automotive
workshop management in Saudi Arabia. The platform addresses a SAR 45B+
automotive aftermarket where 70% of workshops still operate on paper,
spreadsheets, or fragmented tools. With ZATCA Phase 2 e-invoicing mandates
creating a regulatory forcing function, SALIS AUTO offers the only
Arabic-first, ZATCA-native workshop management solution covering all 13
operational domains across 191+ screens.

**Key value propositions:**

- Estimate approval cycle reduced from 48 hours to 4 hours
- Invoice processing reduced from 15 minutes to 2 minutes
- Workshop throughput increased by 25%
- Procurement cycle reduced by 40%

The platform targets three market segments through tiered pricing:
Starter (SAR 999/mo), Professional (SAR 2,499/mo), and Enterprise (custom).
Year 1 target is SAR 1.2M ARR with 50 customers; Year 3 target is
SAR 12M ARR with 200+ customers across three Saudi cities.

---

## 2. Market Analysis

### 2.1 Market Size and Segmentation

| Segment       | Workshop Count | Bay Range | % of Market | Characteristics                |
|---------------|----------------|-----------|-------------|--------------------------------|
| Micro         | 12,000         | 1-4 bays  | 69%         | Owner-operated, paper-based    |
| SMB           | 4,500          | 5-20 bays | 26%         | Some digital tools, growing    |
| Enterprise    | 800            | 20+ bays  | 5%          | Dealer-affiliated or chains    |
| **Total**     | **17,300**     | --        | **100%**    |                                |

### 2.2 Total Addressable Market (TAM)

| Metric                   | Calculation                               | Value         |
|--------------------------|-------------------------------------------|---------------|
| Total workshops in KSA   | GOSI + MoC registry data                  | 17,300        |
| Average SaaS spend/yr    | Blended across segments                   | SAR 18,000    |
| **TAM**                  | 17,300 x SAR 18,000                       | **SAR 311M**  |
| Serviceable (SAM)        | SMB + Enterprise (5,300 workshops)        | SAR 159M      |
| Serviceable Obtainable   | 10% SAM penetration over 5 years          | SAR 16M       |

### 2.3 Market Dynamics

| Factor                        | Trend     | Impact on SALIS AUTO              |
|-------------------------------|-----------|-----------------------------------|
| ZATCA Phase 2 enforcement     | Mandatory | Drives urgency for digital tools   |
| Vision 2030 SME digitization  | Growing   | Government subsidies available     |
| EV adoption in KSA            | Emerging  | New service categories             |
| Insurance digitization        | Growing   | Claims integration demand          |
| Labor cost inflation          | Rising    | Automation becomes essential       |
| Consumer expectations         | Rising    | Online booking, real-time updates  |

### 2.4 Geographic Distribution

| Region            | Workshop Count | Market Priority | Entry Timeline |
|-------------------|----------------|-----------------|----------------|
| Riyadh            | 5,200          | Primary         | Q4 2026        |
| Jeddah            | 3,800          | Secondary       | Q2 2027        |
| Dammam/Khobar     | 2,400          | Tertiary        | Q4 2027        |
| Makkah/Madinah    | 2,100          | Phase 2         | Q2 2028        |
| Other Saudi       | 3,800          | Phase 3         | 2029           |

---

## 3. Product Overview

### 3.1 Platform Architecture

SALIS AUTO covers 13 operational domains through a unified multi-tenant
architecture:

| #  | Domain                   | Key Capabilities                           |
|----|-------------------------|--------------------------------------------|
| 1  | Workshop Operations      | Job cards, bay management, scheduling      |
| 2  | Inventory & Procurement  | Stock management, PO automation, min/max   |
| 3  | Finance & Accounting     | ZATCA invoicing, AR/AP, GL, bank recon     |
| 4  | CRM & Marketing          | Customer profiles, campaigns, loyalty      |
| 5  | HR & Team Management     | Attendance, payroll prep, performance      |
| 6  | Admin Portals            | Tenant config, role management, audit logs |
| 7  | AI Platform              | Estimation, predictions, NLP services      |
| 8  | Customer Portal          | Booking, status tracking, payment          |
| 9  | Technician Portal        | Mobile job view, time logging, photos      |
| 10 | Supplier Portal          | Quotes, PO acceptance, delivery tracking   |
| 11 | Reports & Analytics      | Dashboards, custom reports, exports        |
| 12 | Quality Control          | Inspection checklists, warranty tracking   |
| 13 | Insurance Integration    | Claims submission, status tracking         |

### 3.2 Role-Based Access Control

The platform supports 14 distinct roles with SAR-denominated approval limits:

| Role                | Approval Limit (SAR) | Primary Domain Access               |
|---------------------|----------------------|--------------------------------------|
| Owner / CEO         | Unlimited            | All domains                          |
| Branch Manager      | 50,000               | Operations, Finance, HR              |
| Service Advisor     | 10,000               | Workshop, CRM, Estimates             |
| Workshop Foreman    | 5,000                | Workshop Operations, QC              |
| Technician          | 0                    | Technician Portal (mobile)           |
| Parts Manager       | 25,000               | Inventory & Procurement              |
| Procurement Officer | 15,000               | Procurement, Supplier Portal         |
| Finance Manager     | 100,000              | Finance & Accounting                 |
| Accountant          | 5,000                | Finance (limited)                    |
| Cashier             | 2,000                | POS, Payments                        |
| HR Manager          | 20,000               | HR & Team Management                 |
| Marketing Manager   | 10,000               | CRM & Marketing                      |
| QC Inspector        | 0                    | Quality Control                      |
| Support Staff       | 1,000                | Customer Support, CRM                |

### 3.3 Bilingual Support

- Primary interface language: Arabic (RTL-native)
- Secondary interface language: English (LTR)
- User-selectable language per session
- All reports available in both languages
- ZATCA documents in Arabic per regulatory requirement

---

## 4. Revenue Model

### 4.1 Subscription Tiers

| Feature                    | Starter       | Professional   | Enterprise      |
|----------------------------|---------------|----------------|-----------------|
| **Monthly Price**          | SAR 999       | SAR 2,499      | Custom          |
| **Annual Price**           | SAR 9,990     | SAR 24,990     | Custom          |
| **Annual Discount**        | 17%           | 17%            | Negotiated      |
| Users Included             | 5             | 15             | Unlimited       |
| Branches                   | 1             | 3              | Unlimited       |
| ZATCA Integration          | Yes           | Yes            | Yes             |
| Domains Included           | 6 core        | All 13         | All 13 + custom |
| AI Features                | Basic         | Advanced       | Full + custom   |
| API Access                 | Read-only     | Full           | Full + webhooks |
| Support                    | Email         | Email + Phone  | Dedicated CSM   |
| Data Retention             | 2 years       | 5 years        | Unlimited       |
| Custom Reports             | 5             | Unlimited      | Unlimited       |
| Training                   | Self-serve    | 2 sessions     | Unlimited       |

### 4.2 Additional Revenue Streams

| Revenue Stream            | Pricing                | Target Margin |
|---------------------------|------------------------|---------------|
| Implementation fee        | SAR 2,000 - 15,000    | 60%           |
| Training packages         | SAR 500 per session    | 70%           |
| API access (overages)     | SAR 0.01 per call      | 90%           |
| Data migration service    | SAR 3,000 - 10,000    | 50%           |
| Custom integration        | SAR 5,000 - 25,000    | 55%           |
| Parts marketplace (GMV)   | 2% transaction fee     | 95%           |
| Premium support add-on    | SAR 500/mo             | 65%           |

### 4.3 Revenue Mix Projection

| Revenue Source     | Year 1   | Year 2    | Year 3     |
|--------------------|----------|-----------|------------|
| Subscriptions      | 75%      | 70%       | 60%        |
| Implementation     | 15%      | 10%       | 8%         |
| Training           | 5%       | 5%        | 5%         |
| API / Marketplace  | 0%       | 8%        | 18%        |
| Premium Support    | 5%       | 7%        | 9%         |

---

## 5. Unit Economics

### 5.1 Key Metrics

| Metric                         | Target         | Rationale                        |
|--------------------------------|----------------|----------------------------------|
| Customer Acquisition Cost      | SAR 5,000      | Blended direct + channel         |
| Avg Revenue Per Account (ARPA) | SAR 2,000/mo   | Weighted across tiers            |
| Lifetime Value (LTV)           | SAR 120,000    | 5-year avg tenure x ARPA        |
| LTV/CAC Ratio                  | 24x            | Well above 3x viability bar     |
| Payback Period                 | 3-4 months     | CAC / monthly ARPA              |
| Gross Margin                   | 75-80%         | SaaS-typical for vertical       |
| Net Revenue Retention          | 110%           | Upsell offsets churn             |

---

## 6. Competitive Landscape

### 6.1 Competitor Analysis

| Competitor       | Type           | Strengths              | Weaknesses               |
|------------------|----------------|------------------------|--------------------------|
| CDK Global       | International  | Enterprise features    | No Arabic, expensive     |
| Odoo             | Generic ERP    | Flexible, open-source  | Not automotive-specific  |
| SAP Business One | Generic ERP    | Enterprise-grade       | Over-complex, expensive  |
| Paper/Excel      | Status quo     | No cost, familiar      | No compliance, no data   |
| Local POS tools  | Regional       | Simple, cheap          | Single-purpose, no ZATCA |

### 6.2 Competitive Positioning Matrix

| Capability              | SALIS AUTO | CDK  | Odoo | Paper |
|-------------------------|------------|------|------|-------|
| Arabic RTL UX           | Full       | None | Partial | N/A |
| ZATCA Phase 2           | Native     | None | Plugin | None |
| Workshop-specific       | Yes        | Yes  | No   | N/A   |
| AI Features             | Yes        | No   | No   | No    |
| Multi-tenant SaaS       | Yes        | No   | Yes  | No    |
| Mobile-first            | Yes        | No   | Partial | No |
| Price (SAR/mo)          | 999-5K     | 15K+ | 1.5K | 0     |
| Implementation Time     | 1 week     | 3 mo | 1 mo | N/A   |
| Local Support           | Yes        | No   | Partial | N/A |

---

## 7. Team Structure

### 7.1 Organization Chart

| Department         | Head Count | Key Roles                               |
|--------------------|------------|------------------------------------------|
| Engineering        | 8          | CTO, 4 Full-stack, 1 Mobile, 1 DevOps, 1 QA |
| Product            | 3          | VP Product, Product Manager, UX Designer |
| Sales              | 5          | VP Sales, 3 AEs, 1 Sales Engineer        |
| Customer Success   | 3          | CS Lead, 2 CSMs                          |
| Operations         | 2          | COO, Office Manager                      |
| **Total**          | **21**     |                                          |

### 7.2 Hiring Roadmap

| Quarter   | Hires                                    | Team Size |
|-----------|------------------------------------------|-----------|
| Q4 2026   | Core team (above)                        | 21        |
| Q1 2027   | +2 Engineers, +1 Sales                   | 24        |
| Q2 2027   | +1 Mobile Dev, +1 CSM, +1 Marketing     | 27        |
| Q3 2027   | +2 Engineers, +1 Sales, +1 Support       | 31        |
| Q4 2027   | +1 Data Engineer, +1 Sales, +1 CSM      | 34        |
| H1 2028   | +3 Engineers, +2 Sales, +1 CS            | 40        |
| H2 2028   | +2 Engineers, +2 Sales, +2 Support       | 46        |

### 7.3 Saudization Plan

| Year    | Target Ratio | Strategy                                 |
|---------|-------------|------------------------------------------|
| Year 1  | 30%         | Saudi sales team, CS hires               |
| Year 2  | 40%         | Saudi engineering graduates, internships  |
| Year 3  | 50%         | Saudi leadership development program      |

---

## 8. Financial Projections

### 8.1 Revenue Projections

| Metric              | Year 1      | Year 2      | Year 3       | Year 5       |
|---------------------|-------------|-------------|--------------|--------------|
| Customer Count      | 50          | 200         | 500          | 1,500        |
| ARPA (SAR/mo)       | 1,500       | 1,800       | 2,000        | 2,500        |
| **ARR**             | **SAR 1.2M**| **SAR 4.8M**| **SAR 12M**  | **SAR 45M**  |
| Services Revenue    | SAR 300K    | SAR 600K    | SAR 1M       | SAR 3M       |
| **Total Revenue**   | **SAR 1.5M**| **SAR 5.4M**| **SAR 13M**  | **SAR 48M**  |

### 8.2 Cost Projections

| Cost Category        | Year 1      | Year 2      | Year 3       |
|----------------------|-------------|-------------|--------------|
| Personnel            | SAR 4.2M    | SAR 6.5M    | SAR 9.0M     |
| Infrastructure       | SAR 360K    | SAR 600K    | SAR 900K     |
| Marketing & Sales    | SAR 800K    | SAR 1.5M    | SAR 2.0M     |
| Office & Operations  | SAR 300K    | SAR 400K    | SAR 500K     |
| Legal & Compliance   | SAR 150K    | SAR 200K    | SAR 250K     |
| **Total Costs**      | **SAR 5.8M**| **SAR 9.2M**| **SAR 12.7M**|

### 8.3 Profitability Path

| Metric              | Year 1      | Year 2      | Year 3       | Year 5       |
|---------------------|-------------|-------------|--------------|--------------|
| Revenue             | SAR 1.5M    | SAR 5.4M    | SAR 13M      | SAR 48M      |
| Costs               | SAR 5.8M    | SAR 9.2M    | SAR 12.7M    | SAR 28M      |
| **Net Income**      | (SAR 4.3M)  | (SAR 3.8M)  | **SAR 0.3M** | **SAR 20M**  |
| Cumulative Burn     | (SAR 4.3M)  | (SAR 8.1M)  | (SAR 7.8M)   | SAR 12.2M    |

---

## 9. Funding Requirements

### 9.1 Capital Requirements

| Phase                | Amount (SAR) | Timeline      | Purpose                       |
|----------------------|-------------- |---------------|-------------------------------|
| Seed Round           | SAR 3M       | Q3 2026       | MVP completion, initial launch |
| Series A             | SAR 10M      | Q3 2027       | Regional expansion, team       |
| Series B (optional)  | SAR 25M      | Q4 2028       | Market leadership, GCC entry   |

### 9.2 Use of Funds (Seed Round - SAR 3M)

| Category              | Allocation | Amount (SAR) |
|-----------------------|------------|--------------|
| Engineering & Product  | 45%        | 1,350,000    |
| Sales & Marketing      | 25%        | 750,000      |
| Operations             | 15%        | 450,000      |
| Reserve                | 15%        | 450,000      |

### 9.3 Use of Funds (Series A - SAR 10M)

| Category              | Allocation | Amount (SAR) |
|-----------------------|------------|--------------|
| Engineering Scale-up   | 35%        | 3,500,000    |
| Sales & Marketing      | 30%        | 3,000,000    |
| Customer Success       | 15%        | 1,500,000    |
| Infrastructure         | 10%        | 1,000,000    |
| Reserve                | 10%        | 1,000,000    |

---

## 10. Risk Factors and Mitigation

### 10.1 Business Risks

| Risk                           | Probability | Impact | Mitigation                          |
|--------------------------------|-------------|--------|-------------------------------------|
| Slow customer adoption         | Medium      | High   | Free pilot, ROI guarantee           |
| Higher-than-expected churn     | Medium      | High   | Dedicated CS, quarterly reviews     |
| Pricing pressure               | Medium      | Medium | Value-based selling, feature depth  |
| Key employee departure         | Low         | High   | Equity vesting, competitive pay     |
| Regulatory changes             | Low         | Medium | ZATCA advisory relationship         |
| Data breach                    | Low         | High   | SOC 2, penetration testing          |
| Competitor with Saudi backing  | Medium      | High   | Speed to market, customer lock-in   |

### 10.2 Technical Risks

| Risk                           | Probability | Impact | Mitigation                          |
|--------------------------------|-------------|--------|-------------------------------------|
| Scalability bottleneck         | Medium      | Medium | Load testing, horizontal scaling    |
| ZATCA API changes              | Medium      | Medium | Abstraction layer, rapid response   |
| Mobile performance issues      | Low         | Medium | Progressive Web App, native apps    |
| Third-party API dependency     | Medium      | Low    | Circuit breakers, fallback flows    |
| Data migration failures        | Medium      | Medium | Validation pipeline, rollback plan  |

---

## 11. Success Criteria

### 11.1 Year 1 Go/No-Go Criteria

| Criterion                       | Threshold     | Measurement               |
|---------------------------------|---------------|---------------------------|
| Paying customers                | >= 30         | Active subscriptions       |
| NPS                             | >= 40         | Quarterly survey           |
| Monthly churn                   | < 8%          | Cohort analysis            |
| ZATCA compliance pass rate      | 100%          | Audit results              |
| Platform uptime                 | >= 99%        | Monitoring data            |
| Team retention                  | >= 85%        | HR records                 |

---

## 12. Cross-References

| Document                              | Relevance                                  |
|---------------------------------------|--------------------------------------------|
| [Strategic Plan](./strategic-plan.md) | Three-year strategic direction             |
| [Financial Plan](./financial-plan.md) | Detailed financial projections             |
| [Business Case](../project-management/prince2/business-case.md) | Project justification  |
| [Market Analysis](../marketing/market-analysis.md) | Detailed market data         |
| [Pricing Guide](../marketing/pricing-guide.md) | Tier pricing rationale           |
| [ROI Calculator](../marketing/roi-calculator.md) | Customer ROI methodology       |
| [Go-to-Market Plan](../project-management/planning/go-to-market-plan.md) | Launch plan |
| [Competitive Analysis](../marketing/competitive-analysis.md) | Competitor details    |

---

## 13. Approval

| Role                  | Name                  | Approval Date |
|-----------------------|-----------------------|---------------|
| CEO / Founder         | TBD                   | 2026-08-31    |
| CTO                   | TBD                   | 2026-08-31    |
| CFO / Finance Lead    | TBD                   | 2026-08-31    |
| Advisory Board Chair  | TBD                   | 2026-08-31    |

**Next Review Date:** 2026-11-30 (Quarterly)

---

*This business plan will be updated quarterly to reflect actual performance.
All financial figures are estimates based on market research and assumptions.*
