# SALIS AUTO -- Vendor Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-013                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Executive Summary

This plan defines the vendor selection, onboarding, performance management,
risk mitigation, and exit procedures for all third-party vendors supporting
the SALIS AUTO platform. As a multi-tenant SaaS platform handling sensitive
workshop data, ZATCA-compliant invoices, and financial transactions in SAR,
vendor management is critical to platform reliability, security, and
regulatory compliance. The plan covers six vendor categories spanning
infrastructure, payments, communications, compliance, development tools,
and security services.

Total annual vendor spend (Year 1 estimate): SAR 480,000.
Active vendor relationships: 12-15 vendors across 6 categories.

---

## 2. Vendor Categories

### 2.1 Category Overview

| Category         | Criticality | Vendor Count | Annual Spend (SAR) | Contract Type     |
|------------------|-------------|--------------|---------------------|-------------------|
| Infrastructure   | Critical    | 3            | 180,000             | SaaS subscription |
| Payment          | Critical    | 1            | Usage-based          | API usage-based   |
| Communication    | High        | 3            | 72,000              | API usage-based   |
| Compliance       | Critical    | 2            | 48,000              | Professional svc  |
| Development Tools| Medium      | 3            | 36,000              | SaaS subscription |
| Security         | High        | 2            | 60,000              | Professional svc  |

### 2.2 Infrastructure Vendors

| Service         | Primary Vendor     | Alternative          | Monthly Cost (SAR) |
|-----------------|--------------------|----------------------|---------------------|
| Cloud hosting   | AWS (me-south-1)   | Azure (UAE North)    | 10,000-15,000       |
| CDN             | CloudFront         | Cloudflare           | 1,500               |
| DNS             | Route 53           | Cloudflare DNS       | 200                 |
| Database (managed)| AWS RDS           | Azure SQL            | 3,000               |
| Object storage  | AWS S3             | MinIO (self-hosted)  | 800                 |
| Redis cache     | AWS ElastiCache    | Upstash              | 1,200               |

### 2.3 Payment Vendors

| Service              | Primary Vendor | Alternative    | Fee Structure         |
|----------------------|----------------|----------------|-----------------------|
| Payment gateway      | Stripe         | Moyasar        | 2.5% + SAR 1.00/txn  |
| SADAD integration    | Stripe SADAD   | HyperPay       | SAR 2.00/txn          |
| Mada card processing | Stripe Mada    | PayTabs        | 1.75% per transaction |

### 2.4 Communication Vendors

| Service              | Primary Vendor     | Alternative       | Cost Model           |
|----------------------|--------------------|-------------------|----------------------|
| SMS (OTP, alerts)    | Unifonic           | Twilio            | SAR 0.08/SMS         |
| WhatsApp Business API| Meta (via 360dialog)| Twilio WhatsApp  | SAR 0.15/message     |
| Email (transactional)| AWS SES            | SendGrid          | SAR 0.0004/email     |
| Push notifications   | Firebase FCM       | OneSignal         | Free tier / usage    |

### 2.5 Compliance Vendors

| Service                    | Vendor               | Purpose                          |
|----------------------------|----------------------|----------------------------------|
| ZATCA certification        | Authorized ZATCA CSP | E-invoicing certificate issuance |
| Tax advisory               | Licensed Saudi firm  | VAT compliance, ZATCA guidance   |
| Data privacy consulting    | PDPL specialist firm | PDPL compliance assessment       |

### 2.6 Development Tools

| Service           | Vendor       | Purpose                    | Monthly Cost (SAR) |
|-------------------|--------------|----------------------------|---------------------|
| Source control     | GitHub       | Code repository, CI/CD     | 1,500               |
| CI/CD             | GitHub Actions| Build, test, deploy        | Usage-based         |
| Error tracking     | Sentry       | Runtime error monitoring   | 500                 |
| APM               | Datadog      | Performance monitoring     | 1,500               |
| Feature flags      | LaunchDarkly | Progressive rollouts       | 800                 |

### 2.7 Security Vendors

| Service                | Vendor            | Frequency   | Annual Cost (SAR) |
|------------------------|-------------------|-------------|---------------------|
| Penetration testing    | Licensed Saudi firm| Semi-annual | 30,000              |
| SSL/TLS certificates  | AWS ACM / Let's Encrypt | Auto-renew | Included       |
| WAF                    | AWS WAF           | Continuous  | 6,000               |
| Vulnerability scanning | Snyk             | Continuous  | 12,000              |
| DDoS protection        | AWS Shield Standard| Continuous | Included             |

---

## 3. Vendor Evaluation Criteria

### 3.1 Evaluation Scorecard

| Criterion               | Weight | Scoring (1-5)                                           |
|-------------------------|--------|---------------------------------------------------------|
| Technical capability    | 30%    | 5=Best-in-class, 4=Strong, 3=Adequate, 2=Weak, 1=Poor  |
| Cost                    | 25%    | 5=Best value, 4=Competitive, 3=Market rate, 2=Above, 1=Premium|
| Support and SLA         | 20%    | 5=24/7 with <1hr, 4=24/7, 3=Business hrs, 2=Email only, 1=Community|
| Security and compliance | 15%    | 5=SOC2+ISO27001, 4=SOC2, 3=ISO27001, 2=Basic, 1=None   |
| Saudi presence          | 10%    | 5=HQ in KSA, 4=Office in KSA, 3=Partner in KSA, 2=ME region, 1=None|

### 3.2 Minimum Qualification Requirements

| Requirement                    | Critical Vendors     | Non-Critical Vendors |
|--------------------------------|----------------------|----------------------|
| SOC 2 Type II certification    | Required             | Preferred            |
| Data residency (GCC region)    | Required             | Preferred            |
| Arabic language support        | Required             | Not required         |
| 99.9% uptime SLA              | Required             | 99.5% acceptable     |
| PDPL compliance                | Required             | Required             |
| Financial stability (3+ years) | Required             | Preferred            |
| References (Saudi clients)     | 2+ required          | 1+ preferred         |

### 3.3 Evaluation Process

| Step | Activity                            | Duration   | Owner              |
|------|-------------------------------------|------------|--------------------|
| 1    | Requirements documentation          | 1 week     | Technical Lead     |
| 2    | Vendor long-list research           | 1 week     | Procurement        |
| 3    | RFP/RFI distribution                | 2 weeks    | Procurement        |
| 4    | Technical evaluation and demo       | 1 week     | Engineering Team   |
| 5    | Security assessment                 | 1 week     | Security Lead      |
| 6    | Commercial negotiation              | 1-2 weeks  | Procurement + CFO  |
| 7    | Contract review and signing         | 1 week     | Legal + CFO        |
| 8    | Integration and validation          | 2-4 weeks  | Engineering Team   |

---

## 4. Vendor Onboarding Process

### 4.1 Onboarding Checklist

| Step | Activity                                    | Responsible      | Timeline  |
|------|---------------------------------------------|------------------|-----------|
| 1    | NDA execution                               | Legal            | Day 1     |
| 2    | Security questionnaire completion           | Vendor + Security| Day 1-5   |
| 3    | SOC 2 / ISO 27001 certificate review        | Security Lead    | Day 3-5   |
| 4    | Contract finalization and signing            | Legal + CFO      | Day 5-10  |
| 5    | Sandbox environment provisioning            | Engineering      | Day 5-10  |
| 6    | API credential issuance (production)        | DevOps           | Day 10-12 |
| 7    | Integration testing in staging              | QA Team          | Day 10-20 |
| 8    | Load testing and performance validation     | Engineering      | Day 15-22 |
| 9    | Production deployment                       | DevOps           | Day 22-25 |
| 10   | Monitoring and alerting configuration       | DevOps           | Day 25-28 |
| 11   | Documentation and runbook creation          | Engineering      | Day 25-30 |
| 12   | Post-onboarding review                      | All stakeholders | Day 30    |

### 4.2 Security Assessment Requirements

| Assessment Area            | Requirement                                    |
|----------------------------|------------------------------------------------|
| Data encryption            | AES-256 at rest, TLS 1.3 in transit            |
| Access control             | RBAC with MFA for admin access                 |
| Data residency             | Primary data in GCC region                     |
| Incident response          | Documented IRP, notification within 24 hours   |
| Business continuity        | Documented BCP/DR with RPO < 4 hours           |
| Audit logging              | Immutable logs retained 12+ months             |
| Penetration testing        | Annual third-party pentest with remediation     |
| PDPL compliance            | Saudi Personal Data Protection Law compliance  |

---

## 5. Contract Management

### 5.1 Contract Types

| Contract Type        | Usage                           | Typical Term | Renewal Type    |
|----------------------|---------------------------------|--------------|-----------------|
| SaaS subscription    | Cloud, tools, monitoring        | Annual       | Auto-renewal    |
| API usage-based      | Payment, SMS, email, WhatsApp   | Annual       | Auto-renewal    |
| Professional services| Consulting, audits, pen tests   | Per project  | Statement of Work|
| Enterprise agreement | High-spend vendors (>SAR 100K)  | Multi-year   | Negotiated      |

### 5.2 Contract Lifecycle

| Phase                | Activity                                     | Timeline        |
|----------------------|----------------------------------------------|-----------------|
| Initiation           | Business case and budget approval             | 2 weeks         |
| Negotiation          | Terms, SLAs, pricing, data protection clauses | 2-4 weeks       |
| Execution            | Legal review, signing, countersigning         | 1 week          |
| Active management    | Performance monitoring, invoice processing    | Contract term   |
| Renewal review       | Performance assessment, market comparison     | 90 days before  |
| Renewal / Termination| Renew, renegotiate, or initiate exit          | 60 days before  |

### 5.3 Mandatory Contract Clauses

| Clause                       | Requirement                                       |
|------------------------------|---------------------------------------------------|
| Data protection              | PDPL-compliant data processing agreement (DPA)    |
| Data ownership               | SALIS AUTO retains all customer data ownership     |
| Data portability             | Export in standard formats within 30 days          |
| Termination for convenience  | 90-day notice with pro-rata refund                |
| Liability cap                | Minimum 12 months of fees                         |
| Indemnification              | Vendor indemnifies for IP infringement            |
| Audit rights                 | Annual audit of security and compliance           |
| Subcontractor notification   | 30-day notice of subcontractor changes            |
| Governing law                | Kingdom of Saudi Arabia                           |
| Dispute resolution           | Saudi Commercial Court (Riyadh)                   |

### 5.4 Renewal Tracking

| Action                    | Trigger                  | Owner         |
|---------------------------|--------------------------|---------------|
| Renewal alert             | 90 days before expiry    | Procurement   |
| Performance review        | 90-75 days before expiry | Technical Lead|
| Market comparison          | 75-60 days before expiry | Procurement   |
| Renegotiation / decision  | 60-30 days before expiry | CFO           |
| Contract execution        | 30 days before expiry    | Legal         |

---

## 6. SLA Monitoring

### 6.1 Uptime Commitments by Vendor

| Vendor Category  | Required SLA | Measurement         | Penalty Clause          |
|------------------|--------------|----------------------|-------------------------|
| Cloud hosting    | 99.95%       | Monthly availability | 10% credit per 0.1% miss|
| Payment gateway  | 99.9%        | Monthly availability | 5% credit per 0.1% miss |
| SMS provider     | 99.5%        | Monthly delivery rate| Volume credit            |
| Email service    | 99.9%        | Monthly availability | SLA credit               |
| WhatsApp API     | 99.5%        | Monthly availability | Volume credit            |
| CDN              | 99.99%       | Monthly availability | SLA credit               |

### 6.2 Response Time SLAs

| Severity | Definition                          | Response Time | Resolution Time |
|----------|-------------------------------------|---------------|-----------------|
| P1       | Service down, all tenants affected  | 15 minutes    | 2 hours         |
| P2       | Major feature degraded              | 30 minutes    | 4 hours         |
| P3       | Minor feature issue, workaround ok  | 4 hours       | 24 hours        |
| P4       | Enhancement or cosmetic issue       | 1 business day| 5 business days |

### 6.3 Escalation Procedures

| Level  | Trigger                              | Contact              | Timeline    |
|--------|--------------------------------------|----------------------|-------------|
| L1     | Initial incident report              | Vendor support desk  | Immediate   |
| L2     | SLA breach or P1 unresolved > 1hr    | Vendor account mgr   | +1 hour     |
| L3     | P1 unresolved > 4hrs or repeat issue | Vendor VP Engineering| +4 hours    |
| L4     | Major outage or contract breach      | Vendor C-level       | +8 hours    |
| L5     | Unresolved after 24 hours            | SALIS AUTO CEO → Vendor CEO | +24 hours |

---

## 7. Vendor Risk Assessment

### 7.1 Risk Categories

| Risk Category              | Description                                  | Mitigation Strategy            |
|----------------------------|----------------------------------------------|--------------------------------|
| Single-vendor dependency   | Only one vendor for critical service         | Maintain tested alternatives   |
| Geographic concentration   | All vendors in same region/country           | Multi-region vendor selection  |
| Financial instability      | Vendor at risk of insolvency                 | Annual financial review        |
| Data breach                | Vendor suffers security incident              | DPA, incident response plan    |
| Regulatory non-compliance  | Vendor fails ZATCA/PDPL requirements         | Compliance audit rights        |
| Service degradation        | Vendor quality declines over time            | Quarterly performance reviews  |
| Pricing escalation         | Vendor significantly increases pricing       | Cap clauses, multi-year locks  |

### 7.2 Single-Vendor Dependency Matrix

| Service             | Primary Vendor | Alternative Ready? | Switch Time | Risk Level |
|---------------------|----------------|---------------------|-------------|------------|
| Cloud hosting       | AWS            | Azure (tested)      | 2-4 weeks   | Medium     |
| Payment processing  | Stripe         | Moyasar (evaluated) | 4-6 weeks   | High       |
| SMS delivery        | Unifonic        | Twilio (API compat) | 1 week      | Low        |
| WhatsApp API        | 360dialog      | Twilio (tested)     | 2 weeks     | Medium     |
| Email delivery      | AWS SES        | SendGrid (tested)   | 1 week      | Low        |
| ZATCA certification | Primary CSP    | Alternate CSP       | 2-4 weeks   | High       |
| Source control      | GitHub         | GitLab (compatible) | 2-3 weeks   | Medium     |

### 7.3 Risk Scoring

| Score | Level    | Action Required                                            |
|-------|----------|-------------------------------------------------------------|
| 1-2   | Low      | Monitor quarterly, no immediate action                      |
| 3     | Medium   | Document alternative, test failover annually                |
| 4     | High     | Active alternative maintained, test failover semi-annually  |
| 5     | Critical | Dual-vendor active deployment, failover tested quarterly    |

---

## 8. Vendor Performance Scorecards

### 8.1 Scorecard Template

| Dimension   | Weight | Rating (1-5) | Weighted Score | Notes                      |
|-------------|--------|--------------|----------------|----------------------------|
| Quality     | 30%    |              |                | Uptime, defect rate, SLA   |
| Cost        | 25%    |              |                | vs. budget, vs. market     |
| Delivery    | 20%    |              |                | Timeliness, responsiveness |
| Support     | 15%    |              |                | Response time, resolution  |
| Innovation  | 10%    |              |                | Roadmap alignment, proactive|
| **Total**   | 100%   |              |                |                            |

### 8.2 Review Schedule

| Review Type         | Frequency  | Attendees                          | Deliverable          |
|---------------------|------------|------------------------------------|----------------------|
| Operational review  | Monthly    | Technical lead, vendor TAM         | Performance dashboard|
| Business review     | Quarterly  | CFO, CTO, vendor account exec     | Scorecard + action plan|
| Executive review    | Annual     | CEO, CFO, vendor leadership        | Relationship roadmap |
| Ad-hoc review       | As needed  | Triggered by P1 incident or breach | Incident retrospective|

### 8.3 Performance Thresholds

| Overall Score | Rating       | Action                                          |
|---------------|--------------|--------------------------------------------------|
| 4.0-5.0       | Excellent    | Consider multi-year extension, preferred vendor  |
| 3.0-3.9       | Satisfactory | Continue engagement, address improvement areas   |
| 2.0-2.9       | Needs Improvement | 90-day improvement plan, evaluate alternatives|
| 1.0-1.9       | Unacceptable | Initiate vendor exit process                     |

---

## 9. Cost Optimization

### 9.1 Annual Spend Review

| Category         | Year 1 (SAR)   | Year 2 Target (SAR) | Savings Strategy             |
|------------------|----------------|----------------------|------------------------------|
| Infrastructure   | 180,000        | 165,000 (-8%)        | Reserved instances, right-sizing|
| Payment          | 60,000 (est.)  | 55,000 (-8%)         | Volume tier negotiation      |
| Communication    | 72,000         | 65,000 (-10%)        | SMS optimization, batch sends|
| Compliance       | 48,000         | 48,000 (flat)        | Fixed annual engagement      |
| Development Tools| 36,000         | 33,000 (-8%)         | Consolidation, OSS migration |
| Security         | 60,000         | 55,000 (-8%)         | Multi-year contract discount |
| **Total**        | **456,000**    | **421,000 (-8%)**    |                              |

### 9.2 Cost Optimization Strategies

| Strategy                   | Potential Savings | Implementation Effort |
|----------------------------|-------------------|-----------------------|
| Reserved instance pricing  | 25-40% on compute | Low (commitment)      |
| Volume discount negotiation| 10-20% on APIs    | Medium (negotiation)  |
| Multi-year commitments     | 15-25% on SaaS    | Low (commitment)      |
| Right-sizing resources     | 10-30% on infra   | Medium (analysis)     |
| OSS alternatives           | 50-100% on tools  | High (migration)      |
| Currency hedging (USD→SAR) | 3-5% on USD costs | Medium (treasury)     |

### 9.3 Currency Exposure

| Currency | % of Vendor Spend | Vendors                           | Hedging Approach       |
|----------|--------------------|-----------------------------------|------------------------|
| USD      | 65%                | AWS, Stripe, GitHub, Sentry       | Quarterly forward contracts |
| SAR      | 30%                | Unifonic, compliance, security    | No hedging needed      |
| EUR      | 5%                 | 360dialog (WhatsApp API)          | Spot rate (low volume) |

---

## 10. Vendor Exit Strategy

### 10.1 Exit Triggers

| Trigger                              | Severity | Response Timeline |
|--------------------------------------|----------|-------------------|
| Vendor insolvency or acquisition     | Critical | Immediate         |
| Repeated SLA breaches (3+ in 90 days)| High     | 30 days           |
| Security breach affecting SALIS data | Critical | Immediate         |
| Price increase exceeding 20%         | Medium   | 90 days           |
| ZATCA / PDPL compliance failure      | Critical | 30 days           |
| Performance score below 2.0          | High     | 90 days           |

### 10.2 Exit Process

| Phase            | Activity                                     | Duration   |
|------------------|----------------------------------------------|------------|
| 1. Decision      | Document trigger, leadership approval        | 1 week     |
| 2. Notification  | Formal notice per contract terms             | Per contract|
| 3. Data export   | Complete data extraction in standard formats | 2-4 weeks  |
| 4. Alternative   | Activate pre-evaluated alternative vendor    | 1-2 weeks  |
| 5. Migration     | Technical migration and integration testing  | 2-6 weeks  |
| 6. Validation    | Production validation with rollback plan     | 1-2 weeks  |
| 7. Cutover       | Full traffic to new vendor, monitoring       | 1 week     |
| 8. Decommission  | Terminate old vendor access and credentials  | 1 week     |

### 10.3 Data Portability Requirements

| Data Type                | Export Format     | Retention After Exit |
|--------------------------|-------------------|-----------------------|
| Customer data            | JSON / CSV        | Vendor deletes in 30 days |
| Transaction logs         | Structured JSON   | Vendor deletes in 30 days |
| Configuration            | YAML / JSON       | N/A (rebuilt)         |
| API keys and credentials | N/A (rotated)     | Immediate revocation  |
| Invoices and receipts    | PDF + XML (ZATCA) | SALIS retains copies  |
| Audit logs               | CSV / JSON        | SALIS retains 7 years |

---

## 11. Approved Vendor List

### 11.1 Current Approved Vendors

| Vendor          | Category       | Contract Start | Contract End | Annual Value (SAR) | Status   |
|-----------------|----------------|----------------|--------------|---------------------|----------|
| AWS             | Infrastructure | 2026-07-01     | 2027-06-30   | 180,000             | Active   |
| Stripe          | Payment        | 2026-07-01     | 2027-06-30   | Usage-based         | Active   |
| Unifonic        | SMS            | 2026-08-01     | 2027-07-31   | 24,000              | Active   |
| 360dialog       | WhatsApp API   | 2026-08-01     | 2027-07-31   | 36,000              | Active   |
| GitHub          | Dev Tools      | 2026-07-01     | 2027-06-30   | 18,000              | Active   |
| Sentry          | Error Tracking | 2026-07-01     | 2027-06-30   | 6,000               | Active   |
| Datadog         | APM            | 2026-08-01     | 2027-07-31   | 18,000              | Active   |

### 11.2 Vendor Addition Process

1. Business justification document submitted to CTO/CFO.
2. Vendor evaluation scorecard completed (Section 3).
3. Security assessment passed (Section 4.2).
4. Contract review by Legal (mandatory clauses per Section 5.3).
5. Budget approval by CFO.
6. Onboarding process executed (Section 4.1).
7. Added to Approved Vendor List with quarterly review cycle.

---

## 12. Cross-References

| Document                    | Reference                                                          |
|-----------------------------|--------------------------------------------------------------------|
| Integration Management Plan | [integration-management-plan.md](./integration-management-plan.md) |
| Third-Party Services        | [third-party-services.md](../third-party-services.md)              |
| Procurement Management      | [procurement-management.md](./procurement-management.md)           |
| Security Plan               | [security-plan.md](./security-plan.md)                             |
| Financial Plan              | [financial-plan.md](./financial-plan.md)                           |
| Business Plan               | [business-plan.md](./business-plan.md)                             |

---

## 13. Revision History

| Version | Date       | Author           | Changes                          |
|---------|------------|------------------|----------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release                  |
