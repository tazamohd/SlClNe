# SALIS AUTO -- Risk Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan establishes the risk governance framework for the SALIS AUTO multi-tenant
automotive workshop management platform. It covers all risks across the 13 operational
domains, 191+ screens, 14 RBAC roles, and 28 permission modules, with particular focus
on ZATCA Phase 2 compliance obligations and PDPL data protection requirements in Saudi
Arabia. The plan applies from project inception through ongoing operations.

**Scope boundaries:** Technical, financial, compliance, operational, and market risks
for the SALIS AUTO SaaS platform. Out-of-scope: individual workshop physical safety
risks (customer responsibility).

---

## 2. Risk Governance Structure

### 2.1 Risk Committee

| Role                    | Member / Title         | Responsibility                                 |
|-------------------------|------------------------|-------------------------------------------------|
| Risk Committee Chair    | CEO / Owner            | Final risk acceptance authority                 |
| Risk Manager            | CTO                    | Maintains risk register, chairs monthly reviews |
| Finance Risk Lead       | Accountant (Lead)      | Financial and fraud risk assessment             |
| Compliance Risk Lead    | Legal Counsel          | ZATCA, PDPL, labor law compliance risks         |
| Technical Risk Lead     | Lead Developer         | Architecture, security, and integration risks   |
| Operations Risk Lead    | Branch Manager (Lead)  | Operational and service continuity risks        |
| External Advisor        | Audit Firm Partner     | Independent quarterly risk review               |

### 2.2 Risk Owners by Domain

| Domain                 | Risk Owner              | Escalation Path                |
|------------------------|-------------------------|--------------------------------|
| Workshop Operations    | Branch Manager          | CTO -> CEO                     |
| Registry               | Service Advisor (Lead)  | Branch Manager -> CTO          |
| Finance                | Lead Accountant         | CFO -> CEO                     |
| Accounting             | Lead Accountant         | CFO -> CEO                     |
| Inventory              | Storekeeper (Lead)      | Branch Manager -> CTO          |
| Procurement            | Procurement Agent (Lead)| Branch Manager -> CFO          |
| HR & Team              | HR Manager              | CEO                            |
| CRM & Marketing        | Call Center Lead        | Branch Manager -> CEO          |
| AI Platform            | CTO                     | CEO                            |
| Admin & Settings       | Super Admin             | CTO -> CEO                     |
| Portals (Customer)     | Service Advisor (Lead)  | Branch Manager -> CEO          |
| Portals (Supplier)     | Procurement Agent (Lead)| CFO -> CEO                     |
| Reports & Analytics    | CTO                     | CEO                            |

---

## 3. Risk Appetite Statement

| Risk Category   | Appetite Level | Statement                                                                         |
|-----------------|----------------|-----------------------------------------------------------------------------------|
| Operational     | Moderate       | Accept managed disruptions; target 99.9% uptime; MTTR < 4 hours for P1           |
| Financial       | Low            | Zero tolerance for SAR revenue leakage > 5%; fraud loss < 0.1% of GMV            |
| Compliance      | Very Low       | Zero tolerance for ZATCA penalties (SAR 10K-50K/violation); full PDPL adherence   |
| Technology      | Moderate       | Accept controlled technical debt; zero tolerance for data loss or cross-tenant leak|
| Reputational    | Low            | NPS must remain > 40; no public data breach; Arabic-first experience maintained   |

---

## 4. Risk Categories

### 4.1 Technical Risks
- System downtime exceeding SLA thresholds
- Data loss or corruption across multi-tenant PostgreSQL with RLS
- Integration failures (ZATCA API, payment gateways, SMS/WhatsApp)
- Cross-tenant data leakage through RLS misconfiguration
- Performance degradation under peak load (100+ concurrent workshops)
- Security vulnerabilities (OWASP Top 10)

### 4.2 Financial Risks
- Revenue shortfall against SAR 1.2M Year 1 ARR target
- SAR currency fluctuation impacting vendor costs
- Payment fraud through the platform
- Customer churn exceeding 10% monthly threshold
- Unexpected infrastructure cost escalation

### 4.3 Compliance Risks
- ZATCA Phase 2 e-invoicing validation failures
- PDPL personal data handling violations (72-hour breach notification)
- Saudi Labor Law non-compliance (Saudization quotas, GOSI, WPS)
- AML/CFT regulatory findings
- Failure to maintain 7-year financial record retention

### 4.4 Operational Risks
- Key staff turnover (developers, domain experts)
- Service disruption during deployment or migration
- Third-party vendor failure or discontinuation
- Inadequate Arabic/RTL localization causing user errors
- Training gaps across 14 user roles

### 4.5 Market Risks
- Competitor entry by international workshop management platforms
- Demand shift (EV transition reducing traditional workshop services)
- Regulatory changes beyond current ZATCA/PDPL scope
- Customer adoption resistance in paper-heavy micro workshops

---

## 5. Risk Register

### 5.1 Technical Risks

| ID      | Category  | Description                                           | Prob | Impact | Score | Strategy | Owner          | Status     |
|---------|-----------|-------------------------------------------------------|------|--------|-------|----------|----------------|------------|
| RSK-001 | Technical | Multi-tenant RLS bypass leads to cross-tenant data leak| 2   | 5      | 10    | Mitigate | CTO            | Active     |
| RSK-002 | Technical | ZATCA API integration downtime during invoice submission| 3  | 5      | 15    | Mitigate | Lead Developer | Active     |
| RSK-003 | Technical | PostgreSQL database corruption or unrecoverable failure| 1   | 5      | 5     | Transfer | DevOps Lead    | Active     |
| RSK-004 | Technical | JWT token theft enabling unauthorized platform access  | 2   | 4      | 8     | Mitigate | CTO            | Active     |
| RSK-005 | Technical | Performance degradation under 500+ concurrent sessions | 3   | 3      | 9     | Mitigate | Lead Developer | Active     |
| RSK-006 | Technical | Third-party SMS/WhatsApp gateway failure               | 3   | 2      | 6     | Transfer | DevOps Lead    | Active     |

### 5.2 Financial Risks

| ID      | Category  | Description                                           | Prob | Impact | Score | Strategy | Owner          | Status     |
|---------|-----------|-------------------------------------------------------|------|--------|-------|----------|----------------|------------|
| RSK-007 | Financial | Year 1 ARR falls below SAR 900K (75% of target)      | 3    | 4      | 12    | Mitigate | CEO            | Active     |
| RSK-008 | Financial | Payment fraud via platform payment processing         | 2    | 4      | 8     | Transfer | Lead Accountant| Active     |
| RSK-009 | Financial | Customer churn exceeds 10% monthly                    | 3    | 3      | 9     | Mitigate | Branch Manager | Active     |
| RSK-010 | Financial | Infrastructure costs exceed budget by > 30%           | 2    | 3      | 6     | Mitigate | CTO            | Active     |

### 5.3 Compliance Risks

| ID      | Category   | Description                                          | Prob | Impact | Score | Strategy | Owner           | Status     |
|---------|------------|------------------------------------------------------|------|--------|-------|----------|-----------------|------------|
| RSK-011 | Compliance | ZATCA Phase 2 invoice rejection rate > 1%            | 3    | 5      | 15    | Avoid    | Lead Developer  | Active     |
| RSK-012 | Compliance | PDPL data breach with 72-hour notification failure   | 2    | 5      | 10    | Mitigate | CTO             | Active     |
| RSK-013 | Compliance | Saudization quota shortfall triggers GOSI penalty    | 2    | 3      | 6     | Mitigate | HR Manager      | Active     |
| RSK-014 | Compliance | Financial records retention failure (< 7 years)      | 1    | 5      | 5     | Avoid    | Lead Accountant | Active     |
| RSK-015 | Compliance | VAT calculation error (15% SAR) on invoices          | 2    | 4      | 8     | Avoid    | Lead Accountant | Active     |

### 5.4 Operational Risks

| ID      | Category    | Description                                         | Prob | Impact | Score | Strategy | Owner          | Status     |
|---------|-------------|-----------------------------------------------------|------|--------|-------|----------|----------------|------------|
| RSK-016 | Operational | Lead developer departure mid-sprint                 | 3    | 4      | 12    | Mitigate | CTO            | Active     |
| RSK-017 | Operational | Failed deployment causes production outage          | 2    | 4      | 8     | Mitigate | DevOps Lead    | Active     |
| RSK-018 | Operational | Arabic/RTL rendering defect in financial documents  | 3    | 3      | 9     | Mitigate | Lead Developer | Active     |

### 5.5 Market Risks

| ID      | Category | Description                                           | Prob | Impact | Score | Strategy | Owner | Status     |
|---------|----------|-------------------------------------------------------|------|--------|-------|----------|-------|------------|
| RSK-019 | Market   | International competitor launches Saudi-specific product| 2   | 4      | 8     | Mitigate | CEO   | Active     |
| RSK-020 | Market   | Micro-workshop segment resists digital adoption       | 3    | 3      | 9     | Accept   | CEO   | Active     |
| RSK-021 | Market   | EV transition reduces demand for engine service modules| 2   | 3      | 6     | Mitigate | CTO   | Monitoring |
| RSK-022 | Market   | Regulatory expansion mandates features beyond roadmap | 2    | 3      | 6     | Accept   | CEO   | Monitoring |

---

## 6. Risk Response Strategies -- Top 10 Risks

### 6.1 RSK-002: ZATCA API Integration Downtime (Score: 15)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Implement offline queue with retry mechanism     | Sprint 3     | Lead Developer |
| Store invoices locally with status "pending"     | Sprint 3     | Lead Developer |
| Set up ZATCA sandbox for pre-production testing  | Ongoing      | DevOps Lead    |
| Monitor ZATCA API response times and error rates | Continuous   | DevOps Lead    |
| Maintain 48-hour invoice submission buffer       | Operational  | Lead Accountant|

### 6.2 RSK-011: ZATCA Phase 2 Invoice Rejection Rate (Score: 15)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Validate XML (UBL 2.1) schema before submission | Sprint 2     | Lead Developer |
| Implement QR code and hash chain pre-validation  | Sprint 2     | Lead Developer |
| Run full regression on ZATCA sandbox monthly     | Monthly      | QA Lead        |
| Track rejection reasons and auto-correct patterns| Sprint 4     | Lead Developer |
| Maintain ZATCA certification documentation       | Quarterly    | Compliance Lead|

### 6.3 RSK-007: Year 1 ARR Below Target (Score: 12)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Launch SMB-focused marketing by Q1 end          | Q1 2027      | CEO            |
| Offer 3-month free trial for first 20 customers | Q1 2027      | CEO            |
| Develop Starter tier at SAR 999/mo price point   | Sprint 5     | Product Owner  |
| Build referral program with SAR 500 credits      | Sprint 8     | Marketing Lead |
| Monthly ARR tracking with corrective action at < 80% | Monthly  | CFO            |

### 6.4 RSK-016: Lead Developer Departure (Score: 12)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Document all architectural decisions in ADRs     | Ongoing      | CTO            |
| Enforce pair programming on critical modules     | Continuous   | CTO            |
| Cross-train 2 developers on every domain         | Q1 2027      | CTO            |
| Maintain 30-day knowledge transfer plan          | Ready        | HR Manager     |
| Offer retention package for key technical staff  | Reviewed Q/Q | CEO            |

### 6.5 RSK-001: Multi-tenant RLS Bypass (Score: 10)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Automated RLS policy tests on all 53 tenant tables| Sprint 1    | Lead Developer |
| Penetration testing focused on tenant isolation  | Quarterly    | External Vendor|
| organization_id enforcement at middleware layer  | Sprint 1     | Lead Developer |
| Code review gate: any query touching tenant data | Continuous   | CTO            |
| RLS bypass alert in production monitoring        | Sprint 2     | DevOps Lead    |

### 6.6 RSK-012: PDPL Data Breach (Score: 10)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Implement PII field encryption (AES-256)         | Sprint 2     | Lead Developer |
| Deploy breach detection and alerting             | Sprint 3     | DevOps Lead    |
| Maintain 72-hour breach notification SOP         | Ready        | CTO            |
| Quarterly PDPL compliance audit                  | Quarterly    | Legal Counsel  |
| Data classification labels on all PII columns    | Sprint 1     | Lead Developer |

### 6.7 RSK-005: Performance Degradation (Score: 9)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Load test for 500+ concurrent sessions quarterly | Quarterly    | QA Lead        |
| Implement connection pooling and query optimization| Sprint 4   | Lead Developer |
| Auto-scaling rules for compute and database      | Sprint 5     | DevOps Lead    |
| Performance budget: API p95 < 200ms              | Continuous   | Lead Developer |

### 6.8 RSK-009: Customer Churn > 10% (Score: 9)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Monthly NPS and CSAT tracking per tenant         | Monthly      | Product Owner  |
| Implement in-app onboarding for all 14 roles     | Sprint 6     | UX Lead        |
| Churn risk scoring based on usage analytics      | Sprint 8     | CTO            |
| Customer success check-ins at 30/60/90 days      | Operational  | Account Manager|

### 6.9 RSK-018: Arabic/RTL Rendering Defects (Score: 9)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Automated Playwright visual regression for RTL   | Sprint 2     | QA Lead        |
| Native Arabic reviewer for all UI strings        | Continuous   | UX Lead        |
| RTL-specific test suite covering 191+ screens    | Sprint 3     | QA Lead        |
| Bidirectional text handling in financial documents| Sprint 2     | Lead Developer |

### 6.10 RSK-020: Micro-workshop Digital Adoption Resistance (Score: 9)

| Action                                          | Timeline     | Owner          |
|-------------------------------------------------|--------------|----------------|
| Develop simplified mobile-first onboarding       | Sprint 6     | UX Lead        |
| Offer on-site setup and training packages        | Q2 2027      | Sales Lead     |
| ZATCA mandate as adoption driver in marketing    | Continuous   | Marketing Lead |
| Accept slower adoption; focus resources on SMB   | Strategic    | CEO            |

---

## 7. Key Risk Indicators (KRIs)

| KRI                                 | Threshold (Green) | Warning (Amber) | Critical (Red) | Frequency |
|-------------------------------------|-------------------|-----------------|-----------------|-----------|
| ZATCA invoice rejection rate         | < 0.5%           | 0.5% - 1%      | > 1%            | Daily     |
| Platform uptime                      | >= 99.9%         | 99.5% - 99.9%  | < 99.5%         | Real-time |
| Cross-tenant access attempts         | 0                | 1-2             | > 2             | Real-time |
| P1 incident count (monthly)          | 0                | 1               | > 1             | Monthly   |
| Customer churn rate                  | < 5%             | 5% - 10%       | > 10%           | Monthly   |
| Revenue vs forecast variance         | +/- 10%          | 10% - 25%      | > 25% below     | Monthly   |
| Failed deployment rollback count     | 0                | 1               | > 1             | Per sprint|
| PII access without authorization     | 0                | 1               | > 1             | Real-time |
| PDPL DSAR response time              | < 20 days        | 20 - 28 days   | > 28 days       | Per event |
| Open P1/P2 bugs                      | 0                | 1-2             | > 2             | Weekly    |

---

## 8. Risk Monitoring and Reporting

### 8.1 Reporting Schedule

| Report                       | Audience              | Frequency  | Content                                     |
|------------------------------|-----------------------|------------|----------------------------------------------|
| Risk Dashboard               | Risk Committee        | Real-time  | KRI status, open risk count, trend arrows    |
| Monthly Risk Review           | Risk Committee        | Monthly    | Register updates, new risks, closed risks    |
| Quarterly Board Risk Report   | CEO / Board           | Quarterly  | Top 10 risks, appetite compliance, trends    |
| Compliance Risk Report        | Legal / Compliance    | Monthly    | ZATCA pass rate, PDPL audit status           |
| Incident-Triggered Report     | Risk Committee        | Per event  | Root cause, impact, corrective actions       |

### 8.2 Escalation Thresholds

| Trigger                                       | Escalation To        | Timeframe  |
|------------------------------------------------|----------------------|------------|
| Any KRI turns Red                              | Risk Committee Chair | 1 hour     |
| Risk score increases to >= 15                  | CEO                  | 4 hours    |
| ZATCA penalty notice received                  | CEO + Legal Counsel  | Immediate  |
| Data breach confirmed                          | CTO + Legal Counsel  | Immediate  |
| Revenue variance > 25% below forecast          | CEO + CFO            | 24 hours   |
| Two or more P1 incidents in a rolling 30 days  | CEO + CTO            | 4 hours    |

---

## 9. Risk Review Schedule

| Activity                            | Frequency   | Participants                        | Output                           |
|-------------------------------------|-------------|-------------------------------------|----------------------------------|
| Risk register review and update      | Monthly     | Risk Committee (all members)        | Updated register, action items   |
| KRI threshold review                 | Quarterly   | CTO, Lead Developer, DevOps Lead    | Adjusted thresholds if needed    |
| Risk appetite reassessment           | Bi-annual   | CEO, CTO, CFO, Legal Counsel        | Revised appetite statement       |
| Board risk report presentation       | Quarterly   | CEO presents to Board / Investors   | Board minutes, directives        |
| External risk audit                  | Annual      | External audit firm                 | Audit findings, recommendations  |
| Business continuity drill            | Bi-annual   | All technical staff                 | Drill report, lessons learned    |

---

## 10. Business Continuity Triggers

The following risk materializations trigger activation of the business continuity
and crisis management procedures documented in the
[Incident Response Plan](../system/incident-response.md) and
[Backup & Recovery Plan](../system/operations/backup-recovery.md).

| Trigger Event                              | BC Plan Section Activated       | Decision Authority |
|--------------------------------------------|---------------------------------|--------------------|
| Platform downtime > 1 hour                 | Incident Response -- P1 process | CTO                |
| Database corruption or data loss confirmed | Backup recovery + forensic hold | CTO                |
| ZATCA integration failure > 4 hours        | Manual invoice fallback         | Lead Accountant    |
| Confirmed data breach (any tenant)         | Breach response + PDPL notify   | CEO + Legal        |
| Payment processing failure > 2 hours       | Manual payment recording        | Lead Accountant    |
| Key personnel unavailable > 5 business days| Knowledge transfer activation   | HR Manager         |

---

## 11. Segregation of Duties (SOD) Risk Controls

To prevent collusion and fraud, the following SOD pairs are enforced in the RBAC
matrix across the 14 roles and 28 modules:

| SOD Pair                                 | Role A             | Role B               | Enforcement                  |
|------------------------------------------|--------------------|-----------------------|------------------------------|
| Raise PO / Approve PO                   | Procurement Agent  | Branch Manager         | Approval module route guard  |
| Create Supplier / Approve Supplier Payment| Procurement Agent | Lead Accountant        | Workflow state machine       |
| Post Journal / Approve Journal           | Accountant         | Branch Manager / Owner | Accounting module approval   |
| Perform Repair / Pass QC                 | Technician         | QC Inspector           | Job card workflow gate       |
| Issue Stock / Adjust Stock Count         | Storekeeper        | Branch Manager         | Inventory audit trail        |

---

## 12. Cross-References

| Document                                  | Relevance                                       |
|-------------------------------------------|-------------------------------------------------|
| [Incident Response Plan](../system/incident-response.md) | Crisis response procedures    |
| [Backup & Recovery](../system/operations/backup-recovery.md) | Data recovery procedures  |
| [Security Architecture](../system/security/security-architecture.md) | Threat model, controls |
| [Authorization Matrix](../system/security/authorization-matrix.md) | RBAC enforcement details |
| [Quality Management Plan](quality-management-plan.md) | Defect severity, quality gates |
| [Compliance Management Plan](compliance-management-plan.md) | Regulatory risk details  |
| [Data Governance Plan](data-governance-plan.md) | Data classification, retention  |
| [Financial Plan](financial-plan.md) | Revenue targets, cost budgets                    |
| [Business Plan](business-plan.md) | Market analysis, strategic context                |

---

## 13. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release                |
