# SALIS AUTO -- Customer Success Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-008                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the customer success strategy for SALIS AUTO, covering the complete post-sale lifecycle from onboarding through retention and expansion. It establishes the health score model, intervention playbooks, support tiers, QBR framework, and churn prevention mechanisms to maximize customer lifetime value across all workshop segments in Saudi Arabia.

---

## 2. Customer Success Organization

### 2.1 Team Structure

| Role                        | Count | Scope                                    |
|-----------------------------|-------|-------------------------------------------|
| VP of Customer Success      | 1     | Strategy, executive relationships          |
| Customer Success Manager    | 3     | Named accounts (Enterprise + top SMB)      |
| Onboarding Specialist       | 2     | New customer implementation                |
| Support Engineer            | 4     | Tier 1-2 technical support                 |
| Support Lead                | 1     | Escalation management, quality assurance   |
| Training Coordinator        | 1     | Ongoing enablement, LMS management         |

### 2.2 Account Segmentation

| Segment     | Criteria              | CSM Ratio | Touch Model       |
|-------------|-----------------------|-----------|---------------------|
| Enterprise  | 15+ bays, Annual      | 1:15      | High-touch (named)  |
| Pro         | 10-15 bays, Annual    | 1:30      | Mid-touch (named)   |
| Standard    | 4-10 bays             | 1:80      | Low-touch (pooled)  |
| Starter     | 1-3 bays              | 1:200     | Tech-touch (automated) |

---

## 3. Onboarding Playbook

### 3.1 Day 1 -- Welcome and Provisioning

| Step | Activity                                   | Owner                | Duration |
|------|--------------------------------------------|----------------------|----------|
| 1    | Welcome email with login credentials       | System (automated)   | Instant  |
| 2    | Welcome call from CSM or onboarding bot    | CSM / Automation     | 15 min   |
| 3    | Tenant provisioning and configuration      | Onboarding Specialist| 1 hour   |
| 4    | Admin account setup (owner role)           | Onboarding Specialist| 30 min   |
| 5    | Branch and bay configuration               | Onboarding Specialist| 30 min   |
| 6    | ZATCA e-invoicing configuration (VAT 15%)  | Onboarding Specialist| 30 min   |
| 7    | Send Day 1 checklist completion email      | System (automated)   | Instant  |

### 3.2 Week 1 -- Core Setup and First Value

| Day  | Activity                                    | Owner                | Success Criteria           |
|------|---------------------------------------------|----------------------|----------------------------|
| 2    | User account creation (14 roles)            | Customer Admin       | All active roles created   |
| 2    | SAR limit configuration per role            | Customer Admin       | Limits match org policy    |
| 3    | Parts catalog initial import                | Onboarding Specialist| Min. 100 SKUs loaded       |
| 3    | Customer database import                    | Onboarding Specialist| Existing customers loaded  |
| 4    | First vehicle check-in (guided)             | Service Advisor      | 1 job card created         |
| 4    | First estimate created and approved         | Service Advisor + Mgr| Estimate workflow tested   |
| 5    | First ZATCA-compliant invoice generated     | Accountant           | e-Invoice submitted        |
| 5    | Week 1 review call with CSM                 | CSM                  | 7 checklist items complete |

### 3.3 Month 1 -- Full Workflow Adoption

| Week | Milestone                                   | Target                              |
|------|---------------------------------------------|--------------------------------------|
| 2    | Complete workshop lifecycle executed         | Check-In through Delivery (1 job)   |
| 2    | All 6 lifecycle stages used at least once   | 100% stage coverage                  |
| 3    | 5 estimates created and approved            | Estimate approval < 4h average       |
| 3    | Procurement workflow activated              | First PO raised and received         |
| 4    | Reporting dashboards reviewed               | Owner + Manager accessed dashboards  |
| 4    | Month 1 success review (call or QBR)        | Go/No-Go for standard support model  |

### 3.4 Onboarding Completion Criteria

| Criterion                              | Threshold                    |
|----------------------------------------|-------------------------------|
| Active users / provisioned users       | >= 80%                        |
| Core features adopted (5 of 13 domains)| >= 5 domains used             |
| First invoice generated                | Yes                           |
| ZATCA integration verified             | Yes                           |
| Admin trained on role management       | Signed off by CSM             |
| Satisfaction score (onboarding survey) | >= 4.0 / 5.0                  |

---

## 4. Health Score Model

### 4.1 Dimensions

The SALIS AUTO customer health score combines five equally weighted dimensions into a composite score on a 0-100 scale.

| Dimension          | Weight | Data Source              | Measurement Period |
|--------------------|--------|--------------------------|--------------------|
| Login Frequency    | 20%    | Platform analytics       | Rolling 30 days    |
| Feature Adoption   | 20%    | Domain usage tracking    | Rolling 30 days    |
| Support Tickets    | 20%    | Helpdesk system          | Rolling 30 days    |
| NPS Response       | 20%    | Quarterly NPS survey     | Last survey        |
| Billing Health     | 20%    | Subscription system      | Current status     |

### 4.2 Dimension Scoring Rules

#### Login Frequency (0-100)

| Score Range | Criteria                                          |
|-------------|---------------------------------------------------|
| 80-100      | DAU/MAU >= 60%, all roles active                  |
| 60-79       | DAU/MAU 40-59%, most roles active                 |
| 40-59       | DAU/MAU 20-39%, some roles inactive               |
| 20-39       | DAU/MAU 10-19%, majority of roles inactive        |
| 0-19        | DAU/MAU < 10%, near-zero activity                 |

#### Feature Adoption (0-100)

| Score Range | Criteria                                          |
|-------------|---------------------------------------------------|
| 80-100      | 10+ of 13 domains actively used                   |
| 60-79       | 7-9 domains actively used                         |
| 40-59       | 4-6 domains actively used                         |
| 20-39       | 2-3 domains actively used                         |
| 0-19        | 0-1 domains actively used                         |

#### Support Tickets (0-100, inverse)

| Score Range | Criteria                                          |
|-------------|---------------------------------------------------|
| 80-100      | 0-1 tickets/month, none critical                  |
| 60-79       | 2-3 tickets/month, none critical                  |
| 40-59       | 4-6 tickets/month or 1 critical                   |
| 20-39       | 7-10 tickets/month or 2+ critical                 |
| 0-19        | 10+ tickets/month or unresolved critical           |

#### NPS Response (0-100)

| Score Range | Criteria                                          |
|-------------|---------------------------------------------------|
| 80-100      | Promoter (NPS 9-10)                               |
| 60-79       | Passive-high (NPS 7-8)                            |
| 40-59       | Passive-low (NPS 6-7)                             |
| 20-39       | Detractor-mild (NPS 4-5)                          |
| 0-19        | Detractor-strong (NPS 0-3)                        |

#### Billing Health (0-100)

| Score Range | Criteria                                          |
|-------------|---------------------------------------------------|
| 80-100      | Current, auto-pay enabled, annual plan            |
| 60-79       | Current, manual pay, no overdue                   |
| 40-59       | 1-15 days overdue                                 |
| 20-39       | 16-30 days overdue                                |
| 0-19        | 30+ days overdue or payment disputed              |

### 4.3 Composite Score Thresholds

| Status     | Score Range | Color  | Action                                 |
|------------|-------------|--------|----------------------------------------|
| Healthy    | 71-100      | Green  | Standard touch cadence                  |
| At-Risk    | 40-70       | Yellow | Proactive intervention within 48h       |
| Critical   | 0-39        | Red    | Immediate escalation, rescue playbook   |

---

## 5. Intervention Triggers and Playbooks

### 5.1 At-Risk Triggers (Score 40-70)

| Trigger                                | Threshold                    | Auto-Alert |
|----------------------------------------|-------------------------------|------------|
| Login frequency drop                   | DAU/MAU drops > 20% MoM      | Yes        |
| Feature adoption stall                 | No new domain adopted in 60d  | Yes        |
| Support ticket spike                   | > 5 tickets in 7 days         | Yes        |
| NPS decline                            | Promoter -> Passive           | Yes        |
| Payment delay                          | Invoice overdue > 7 days      | Yes        |

### 5.2 At-Risk Playbook

| Step | Action                                        | Owner   | Timeline     |
|------|-----------------------------------------------|---------|--------------|
| 1    | Review health score breakdown                 | CSM     | Within 24h   |
| 2    | Schedule proactive check-in call              | CSM     | Within 48h   |
| 3    | Identify root cause (usage, training, product)| CSM     | During call   |
| 4    | Create recovery action plan                   | CSM     | Within 72h   |
| 5    | Offer targeted training session               | Training| Within 1 week|
| 6    | Escalate product issues to engineering        | CSM     | As needed    |
| 7    | Follow-up review                              | CSM     | 2 weeks later|

### 5.3 Critical Triggers (Score < 40)

| Trigger                                | Threshold                    | Auto-Alert  |
|----------------------------------------|-------------------------------|-------------|
| Near-zero activity                     | DAU/MAU < 10% for 14+ days   | Yes + Slack |
| Multiple critical tickets              | 2+ unresolved P1 tickets     | Yes + Slack |
| Strong detractor NPS                   | NPS 0-3                      | Yes + Slack |
| Payment failure                        | 30+ days overdue             | Yes + Slack |
| Churn signal                           | Downgrade request or cancel inquiry | Yes + Slack |

### 5.4 Critical Rescue Playbook

| Step | Action                                          | Owner              | Timeline     |
|------|-------------------------------------------------|--------------------|--------------|
| 1    | VP CS notified, account flagged red              | System             | Immediate    |
| 2    | Executive sponsor outreach (VP to Owner)         | VP CS              | Within 24h   |
| 3    | On-site or video meeting with key stakeholders   | CSM + VP CS        | Within 48h   |
| 4    | Root cause analysis document                     | CSM                | Within 48h   |
| 5    | Custom recovery plan with executive sign-off     | VP CS              | Within 72h   |
| 6    | Dedicated support engineer assigned (2 weeks)    | Support Lead       | Within 72h   |
| 7    | Billing accommodation if appropriate             | Finance            | As needed    |
| 8    | Weekly check-ins until score > 50                | CSM                | Ongoing      |

---

## 6. Quarterly Business Review (QBR)

### 6.1 QBR Eligibility

| Segment     | QBR Frequency | Format              |
|-------------|---------------|----------------------|
| Enterprise  | Quarterly     | On-site or video     |
| Pro         | Quarterly     | Video call           |
| Standard    | Semi-annual   | Video call           |
| Starter     | Annual        | Email summary only   |

### 6.2 QBR Agenda Template

| Item | Topic                              | Duration | Presenter          |
|------|------------------------------------|----------|--------------------|
| 1    | Relationship recap and health score| 10 min   | CSM                |
| 2    | Usage metrics and trends           | 15 min   | CSM                |
| 3    | ROI review vs. business case       | 15 min   | CSM + Customer     |
| 4    | Feature adoption deep-dive         | 10 min   | CSM                |
| 5    | Support ticket analysis            | 10 min   | Support Lead       |
| 6    | Product roadmap preview            | 10 min   | Product Manager    |
| 7    | Expansion opportunities            | 10 min   | CSM                |
| 8    | Action items and next steps        | 10 min   | CSM + Customer     |

### 6.3 QBR Metrics Dashboard

| Metric                           | Source                  | Benchmark              |
|----------------------------------|-------------------------|------------------------|
| Active users vs. licensed        | Platform analytics      | >= 80%                 |
| Domains in use (of 13)           | Usage tracking          | >= 7                   |
| Jobs completed per month         | Workshop module         | Trending up            |
| Estimate approval time           | Workflow analytics      | < 4 hours              |
| Invoice processing time          | Finance module          | < 2 minutes            |
| Procurement cost reduction       | Procurement module      | >= 30% vs. baseline    |
| Workshop throughput              | Operations module       | >= 20% vs. baseline    |
| Support tickets (P1/P2/P3)      | Helpdesk                | Trending down          |
| NPS score                        | Survey                  | >= 8                   |
| ZATCA compliance rate            | e-Invoice module        | 100%                   |

---

## 7. Support Tiers

### 7.1 Tier Definitions

| Attribute              | Standard          | Premium            | Enterprise          |
|------------------------|-------------------|--------------------|---------------------|
| Channels               | Email             | Chat + Email       | Chat + Email + Phone|
| Response time (P1)     | 24 hours          | 4 hours            | 1 hour              |
| Response time (P2)     | 48 hours          | 8 hours            | 4 hours             |
| Response time (P3)     | 72 hours          | 24 hours           | 8 hours             |
| Availability           | Sun-Thu 8am-6pm   | Sun-Thu 8am-10pm   | 24/7                |
| Dedicated CSM          | No                | No                 | Yes                 |
| Quarterly reviews      | No                | Yes (video)        | Yes (on-site)       |
| Custom training        | No                | 2 sessions/year    | Unlimited           |
| Priority escalation    | No                | Yes                | Yes + VP escalation |
| Language support       | EN/AR             | EN/AR              | EN/AR               |
| Onboarding type        | Self-serve + docs | Guided (remote)    | Dedicated (on-site) |

### 7.2 Ticket Priority Matrix

| Priority | Definition                                        | Example                              |
|----------|---------------------------------------------------|--------------------------------------|
| P1       | System down, no workaround, revenue impact        | Cannot generate ZATCA invoices       |
| P2       | Major feature broken, workaround available        | Estimate approval workflow stuck     |
| P3       | Minor issue, cosmetic, enhancement request        | AR text alignment issue on one screen|

### 7.3 Escalation Path

| Level   | Role                | Trigger                            | Response    |
|---------|---------------------|------------------------------------|-------------|
| L1      | Support Engineer    | Initial ticket triage              | Per SLA     |
| L2      | Senior Engineer     | L1 cannot resolve within SLA       | 2 hours     |
| L3      | Engineering Team    | Product defect confirmed           | Next sprint |
| Exec    | VP Customer Success | Customer escalation or P1 > 4h     | 1 hour      |

---

## 8. Expansion Paths

### 8.1 Upsell Opportunities

| Trigger                              | Opportunity                       | Approach              |
|--------------------------------------|------------------------------------|-----------------------|
| User count at 80%+ of tier limit     | Tier upgrade (Standard -> Pro)     | CSM proactive reach   |
| New branch opened                    | Multi-branch add-on               | CSM during QBR        |
| High procurement module usage        | Supplier portal licenses           | CSM proactive reach   |
| ZATCA audit preparation              | Compliance consulting package      | Partner referral      |
| Feature request for analytics        | Pro/Enterprise upgrade             | Product-led prompt    |

### 8.2 Cross-Sell Opportunities

| Trigger                              | Product                            | Channel              |
|--------------------------------------|------------------------------------|-----------------------|
| Customer portal not adopted          | Customer portal module             | In-app prompt         |
| Manual supplier management           | Supplier portal module             | CSM recommendation    |
| No mobile usage                      | Mobile app add-on                  | Training session      |
| High call volume                     | Call center module                 | CSM during QBR        |

Expansion revenue targets: NRR of 105% at Month 6, 110% at Month 12, and 115% at Month 18.

---

## 9. Churn Prevention

### 9.1 Early Warning Indicators

| Signal                                | Detection Method              | Lead Time      |
|---------------------------------------|-------------------------------|----------------|
| Login decline (3 consecutive weeks)   | Automated analytics alert     | 3-6 weeks      |
| Admin password reset (multiple users) | System event log              | 2-4 weeks      |
| Data export request                   | Support ticket pattern        | 1-3 weeks      |
| Contract renewal inquiry (negative)   | CRM note from CSM             | 4-8 weeks      |
| Competitor mention in support tickets | NLP ticket analysis           | Variable       |
| Billing dispute filed                 | Finance system alert          | 1-2 weeks      |

### 9.2 Retention Tactics by Churn Reason

| Churn Reason               | Retention Tactic                                    |
|----------------------------|------------------------------------------------------|
| Low adoption / complexity  | Dedicated re-training, simplified onboarding path    |
| Product gaps               | Roadmap commitment, beta access to requested feature |
| Price sensitivity          | Annual discount, payment plan, downgrade option      |
| Poor support experience    | Dedicated engineer, exec apology, SLA upgrade        |
| Competitor switch          | Competitive win-back offer, ROI re-analysis          |
| Business closure           | Pause option (up to 6 months), data export support   |

### 9.3 Save Offer Framework

Save offers require manager or VP approval: loyalty discount (15%, annual commitment), win-back discount (25%, 6-month minimum), feature credit (1 month free), support upgrade (3 months free Premium), or extended payment terms (Net-60 for accounts active > 6 months).

---

## 10. Customer Lifecycle Communication

Key automated touchpoints: Day 0 welcome email, Day 3 in-app feature tour, Day 7 progress summary, Day 30 impact report + NPS survey, Day 60 adoption recommendations, Day 90 QBR invitation. Renewal sequence at -60, -30, and -7 days. All emails delivered in EN/AR based on tenant language preference.

CSM cadence: Enterprise receives 2 monthly calls + quarterly on-site; Pro receives 1 monthly call; Standard receives 1 monthly email; Starter is fully automated.

---

## 11. Dependencies

| Dependency                              | Source Document                          | Status    |
|-----------------------------------------|------------------------------------------|-----------|
| Platform go-live                        | [Deployment Plan](./deployment-plan.md) (SA-PLN-002) | On track |
| Training materials and LMS             | [Training Rollout Plan](./training-rollout-plan.md) (SA-PLN-006) | Approved |
| GTM launch timeline                    | [Go-to-Market Plan](./go-to-market-plan.md) (SA-PLN-007) | Approved |
| Pricing tiers finalized                | [Pricing Guide](../../marketing/pricing-guide.md) | In progress |
| Business case financial targets        | [Business Case](../prince2/business-case.md) | Approved |
| Training program curriculum            | [Program Overview](../../training/program-overview.md) | In progress |

---

## 12. Success Metrics

| Metric                              | 3-Month Target | 6-Month Target | 12-Month Target |
|--------------------------------------|----------------|----------------|-----------------|
| Onboarding completion (< 30 days)   | 85%            | 90%            | 95%             |
| Average health score                | 65             | 72             | 78              |
| Monthly churn rate                  | < 5%           | < 3%           | < 2%            |
| Net Revenue Retention               | 100%           | 105%           | 110%            |
| NPS                                 | 40             | 50             | 60              |
| CSAT (support)                      | 4.0            | 4.3            | 4.5             |
| Time to first value (days)          | 7              | 5              | 3               |
| QBR completion rate (Enterprise)    | 80%            | 90%            | 95%             |

---

## 13. Approval

| Approver                | Role                    | Date       | Signature |
|-------------------------|--------------------------|------------|-----------|
| [Name]                  | CEO / Owner              | 2026-08-31 | _________ |
| [Name]                  | PMO Director             | 2026-08-31 | _________ |
| [Name]                  | VP Customer Success      | 2026-08-31 | _________ |
| [Name]                  | Head of Sales            | 2026-08-31 | _________ |

---

*This document is maintained by the SALIS AUTO PMO. For questions or change requests, contact the VP of Customer Success.*
