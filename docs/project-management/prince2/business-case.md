# SALIS AUTO -- Business Case

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PR2-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Executive Summary

SALIS AUTO addresses a critical gap in Saudi Arabia's automotive aftermarket: the absence of a unified, ZATCA-compliant, bilingual workshop management platform. The project delivers a multi-tenant SaaS solution covering 13 operational domains, serving 14 user roles through 191+ screens, with full Arabic RTL support. This business case demonstrates that the investment is justified by regulatory compliance necessity, operational efficiency gains, and a growing addressable market.

---

## 2. Reasons for the Project

### 2.1 Regulatory Driver

ZATCA Phase 2 e-invoicing is mandatory for businesses above the revenue threshold. Workshops that do not issue compliant e-invoices (XML with QR codes, hash chains, real-time clearance) face penalties including fines and business license suspension. No existing Saudi workshop management system provides integrated ZATCA Phase 2 compliance with workshop-specific workflows.

### 2.2 Market Gap

| Current State                           | SALIS AUTO Solution                              |
|-----------------------------------------|--------------------------------------------------|
| Paper job cards and WhatsApp coordination | Digital job lifecycle (Check-In through Delivery) |
| Manual estimate approvals (in-person)   | Customer portal with 6-step e-signature approval |
| Disconnected accounting software        | Integrated finance, accounting, and ZATCA module |
| No cross-branch visibility              | Multi-tenant dashboards with 8 data scopes      |
| No parts tracking                       | Inventory management with approval chains        |
| No customer self-service                | Customer and supplier portals                     |

### 2.3 Competitive Advantage

- **First-mover:** No competitor offers integrated ZATCA Phase 2 + workshop lifecycle + customer e-signature in a single platform.
- **Localization depth:** Full Arabic RTL (not just translated labels), Saudi license plates, +966 phone validation, SAR halala-precision arithmetic.
- **Role coverage:** 14 roles from Owner/CEO down to Customer, each with tailored screens and data scopes.

---

## 3. Business Options Considered

### Option A: Do Nothing

- **Outcome:** Workshops continue with manual processes and risk ZATCA non-compliance.
- **Pros:** No investment required.
- **Cons:** Regulatory penalties; competitive disadvantage; operational inefficiency grows.
- **Recommendation:** Rejected.

### Option B: Adopt Existing International Software

- **Outcome:** Deploy an international workshop management system (e.g., Mitchell, Automaster).
- **Pros:** Faster time-to-market for basic features.
- **Cons:** No ZATCA Phase 2 integration; no Arabic RTL; no Saudi-specific validations (+966, license plates, SAR halalas); customization costs exceed building from scratch; ongoing license fees.
- **Recommendation:** Rejected.

### Option C: Build SALIS AUTO (Recommended)

- **Outcome:** Purpose-built platform with all Saudi-specific requirements native.
- **Pros:** Full ZATCA compliance; deep localization; complete domain coverage; multi-tenant SaaS scalability; no license dependencies.
- **Cons:** Higher upfront investment; 52-week delivery timeline.
- **Recommendation:** Approved.

---

## 4. Expected Benefits

### 4.1 Quantifiable Benefits

| Benefit                              | Metric                        | Target              | Timeline      |
|--------------------------------------|-------------------------------|---------------------|---------------|
| ZATCA compliance                     | Certification status          | 100% compliant      | Go-live       |
| Estimate approval time               | Hours from send to approval   | < 4 hours (from 48) | Month 3       |
| Job throughput per technician         | Jobs completed / week         | +25% improvement    | Month 6       |
| Parts procurement cycle time          | Days from request to receipt  | -40% reduction      | Month 6       |
| Invoice processing time              | Minutes per invoice           | < 2 min (from 15)   | Go-live       |
| Customer no-show rate                 | % of scheduled appointments   | -30% reduction      | Month 12      |
| Cross-branch reporting               | Time to generate reports      | Real-time (from days)| Go-live      |

### 4.2 Non-Quantifiable Benefits

- **Regulatory confidence:** Eliminates risk of ZATCA penalties.
- **Customer trust:** Transparent repair tracking and digital approvals.
- **Data-driven decisions:** Real-time KPIs for owners and managers.
- **Employee satisfaction:** Modern tooling replacing manual processes.
- **Brand differentiation:** First Saudi-native comprehensive workshop platform.
- **Audit readiness:** Complete audit trails with separation-of-duties enforcement.

---

## 5. Expected Dis-Benefits

| Dis-Benefit                                     | Mitigation                                    |
|-------------------------------------------------|-----------------------------------------------|
| Change resistance from workshop staff            | Phased rollout, role-based training, champions |
| Initial productivity dip during adoption         | 2-week parallel run; gradual feature enabling  |
| Dependency on internet connectivity              | Offline mode planned for Phase 2               |
| Ongoing platform maintenance costs               | Automated CI/CD reduces operational overhead   |

---

## 6. Cost Summary

### 6.1 Development Costs

| Category                    | Estimate (SAR)     | Notes                                      |
|-----------------------------|--------------------|--------------------------------------------|
| Development team (52 weeks) | 1,200,000          | 6 devs + 1 QA + 1 SM + 1 PM (avg rates)   |
| ZATCA specialist            | 120,000            | Part-time consultant for 6 months          |
| Arabic translation/review   | 45,000             | Native speaker review of all 191+ screens  |
| UX/UI design                | 150,000            | Design system, prototypes, RTL adaptation  |
| Security audit              | 60,000             | Penetration test + OWASP assessment        |
| ZATCA certification         | 30,000             | Sandbox + production certification fees    |
| Infrastructure (dev/staging)| 36,000             | Cloud hosting during development           |
| Contingency (15%)           | 249,150            | Risk reserve                               |
| **Total Development**       | **1,890,150**      |                                            |

### 6.2 Ongoing Annual Costs

| Category                    | Annual (SAR)       | Notes                                      |
|-----------------------------|--------------------|--------------------------------------------|
| Production hosting          | 72,000             | Cloud infrastructure + CDN                 |
| SMS/WhatsApp gateway        | 48,000             | OTP + notifications (est. volume)          |
| Maintenance team            | 360,000            | 2 devs + 0.5 QA for patches and updates   |
| ZATCA compliance updates    | 30,000             | Spec changes, re-certification             |
| **Total Annual**            | **510,000**        |                                            |

---

## 7. Investment Appraisal

### 7.1 Revenue Projections (SaaS Model)

| Year | Workshops Onboarded | Monthly ARPU (SAR) | Annual Revenue (SAR) |
|------|---------------------|--------------------|----------------------|
| 1    | 50                  | 2,000              | 1,200,000            |
| 2    | 150                 | 2,200              | 3,960,000            |
| 3    | 300                 | 2,400              | 8,640,000            |

ARPU = Average Revenue Per User (per workshop tenant per month).

### 7.2 Return on Investment

| Metric                          | Value                                          |
|---------------------------------|------------------------------------------------|
| Total investment (Year 0)       | SAR 1,890,150                                  |
| Annual operating cost           | SAR 510,000                                    |
| Year 1 net                      | SAR 1,200,000 - 510,000 = SAR 690,000          |
| Year 1 cumulative              | -SAR 1,200,150 (still negative)                |
| Year 2 net                      | SAR 3,960,000 - 510,000 = SAR 3,450,000        |
| Year 2 cumulative              | +SAR 2,249,850                                  |
| **Payback period**              | **~18 months from go-live**                    |
| **3-year ROI**                  | **~350%**                                      |

### 7.3 Sensitivity Analysis

| Scenario                        | Payback Period | 3-Year ROI |
|---------------------------------|----------------|------------|
| Base case (above)               | 18 months      | 350%       |
| Pessimistic (50% fewer clients) | 30 months      | 140%       |
| Optimistic (50% more clients)   | 12 months      | 560%       |

---

## 8. Timescale

| Phase                  | Duration  | Cumulative |
|------------------------|-----------|------------|
| Initiation + Planning  | 6 weeks   | Week 6     |
| Foundation             | 6 weeks   | Week 12    |
| Core Domains           | 18 weeks  | Week 30    |
| Extended Domains       | 10 weeks  | Week 40    |
| Integration + ZATCA    | 6 weeks   | Week 46    |
| Testing + Hardening    | 4 weeks   | Week 50    |
| Deployment + Launch    | 2 weeks   | Week 52    |

See [Schedule Management Plan](../pmp/schedule-management.md) for detailed milestones.

---

## 9. Major Risks

| Risk                                 | Impact    | Mitigation                                      |
|--------------------------------------|-----------|-------------------------------------------------|
| ZATCA spec changes during dev        | Critical  | Adapter pattern; nightly sandbox tests           |
| Key developer attrition              | High      | Cross-training; documentation                    |
| Slow workshop adoption               | High      | Pilot program; champion incentives               |
| Production migration failure         | High      | 3x rehearsals; automated rollback                |
| Competitive entrant                  | Medium    | First-mover advantage; deep localization moat    |

Full risk analysis in the [Risk Register](../pmp/risk-register.md).

---

## 10. Recommendation

Proceed with Option C (Build SALIS AUTO). The combination of regulatory necessity (ZATCA Phase 2), market gap, and favorable ROI projections (payback in 18 months, 350% 3-year ROI) justify the SAR 1.89M investment. The platform's deep Saudi localization and comprehensive domain coverage create a durable competitive advantage that licensed international software cannot match.

---

## 11. Approval

| Name | Role              | Decision         | Date |
|------|-------------------|------------------|------|
|      | Executive Sponsor | Approve / Reject |      |
|      | Senior Supplier   | Approve / Reject |      |
|      | Senior User       | Approve / Reject |      |

---

## 12. References

- [Project Charter](../pmp/project-charter.md)
- [Risk Register](../pmp/risk-register.md)
- [Schedule Management Plan](../pmp/schedule-management.md)
- [Project Initiation Document](project-initiation-document.md)
- [Product Descriptions](product-descriptions.md)
