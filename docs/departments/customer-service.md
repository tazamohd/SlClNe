# SALIS AUTO -- Customer Service Department Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-DPT-006                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Department Overview

The Customer Service department manages all post-sale support, customer success, and retention activities for SALIS AUTO platform tenants. The department ensures that every tenant achieves full value from the platform through proactive onboarding, responsive support, and continuous engagement.

Operating across the platform's 13 domains, 191+ screens, and 28 RBAC modules, the CS team supports all 14 user roles with tiered service levels aligned to each customer's subscription plan. The department serves as the primary feedback channel between customers and the IT/Product teams, driving platform improvements based on real usage data.

**Primary Responsibilities:**
- Technical support across all subscription tiers
- Customer onboarding and implementation
- Customer health monitoring and proactive intervention
- Feature adoption and training delivery
- Feedback collection and product input
- Retention management and churn prevention
- Account expansion and upsell identification
- SLA management and reporting

---

## 2. Team Structure

```
                    +-----------------------+
                    |     CS Manager        |
                    |    (1 - Department)   |
                    +-----------+-----------+
                                |
          +---------------------+---------------------+
          |                     |                     |
+---------+---------+ +---------+---------+ +---------+---------+
|  Support Agents   | | Customer Success  | | Implementation    |
|      (3)          | |    Manager (1)    | |  Specialist (1)   |
+-------------------+ +-------------------+ +-------------------+
| - Ticket handling | | - Health scoring  | | - Data migration  |
| - L1/L2 support   | | - QBRs (Enterprise)| | - Configuration  |
| - Bug reporting   | | - Retention       | | - Training delivery|
| - User guidance   | | - Expansion/upsell| | - Go-live support |
+-------------------+ +-------------------+ +-------------------+
```

**RBAC Role Mapping (from 14 platform roles):**

| Platform Role       | CS Function                    | Module Access                        |
|---------------------|--------------------------------|--------------------------------------|
| Support Agent       | Ticket handling and resolution | Ticket system, customer lookup, KB   |
| CS Manager          | Department oversight           | All CS modules, reporting, escalation|
| System Admin        | Technical troubleshooting      | Tenant config, user mgmt (read)      |
| Owner               | Escalation endpoint            | Full system access                    |

---

## 3. Support Channels

### 3.1 Channel Configuration

| Channel              | Availability                    | Tiers Covered          | Response Medium        |
|----------------------|---------------------------------|------------------------|------------------------|
| In-app Chat          | Sunday-Thursday 8AM-6PM AST    | Professional, Enterprise| Real-time text         |
| Email                | 24/7 (response during business)| All tiers              | support@salisauto.sa   |
| Phone                | Sunday-Thursday 8AM-6PM AST    | Enterprise only        | +966-XX-XXX-XXXX       |
| WhatsApp Business    | Sunday-Thursday 8AM-6PM AST    | Enterprise only        | Dedicated number       |
| Knowledge Base       | 24/7 self-service              | All tiers              | help.salisauto.sa      |
| In-app Help Center   | 24/7 self-service              | All tiers              | Contextual help        |

### 3.2 Channel Priority

```
Enterprise:   Phone/WhatsApp → In-app Chat → Email
Professional: In-app Chat → Email
Starter:      Email → Knowledge Base (self-service)
```

---

## 4. Support Ticket Workflow

### 4.1 Ticket Lifecycle

```
[RECEIVE] → [CATEGORIZE] → [ASSIGN] → [INVESTIGATE] → [RESOLVE] → [VERIFY] → [CLOSE]
    |            |              |             |              |           |          |
  Auto-create  Priority +    Round-robin   Root cause    Fix applied  Customer   Satisfaction
  from channel category set  or skill-based  identified   or workaround confirms  survey sent
```

### 4.2 Ticket Categories

| Category            | Sub-categories                                    | Typical Resolution |
|---------------------|---------------------------------------------------|--------------------|
| Access & Login      | Password reset, RBAC issues, account lockout      | L1, < 30 min       |
| Workflow            | Job card flow, scheduling, bay management         | L1/L2, < 2 hours   |
| Finance/ZATCA       | Invoice errors, VAT calculation, e-invoice submit | L2, < 4 hours      |
| Inventory           | Stock discrepancy, PO issues, receiving errors    | L2, < 4 hours      |
| Reporting           | Report errors, export failures, dashboard issues  | L2, < 4 hours      |
| Integration         | ZATCA API, payment gateway, SMS provider          | L2/L3, < 8 hours   |
| Performance         | Slow loading, timeout, search lag                 | L3, < 24 hours     |
| Bug Report          | System error, data corruption, UI/UX defect       | L3, per severity   |
| Feature Request     | Enhancement, new capability, workflow change       | Backlog, tracked   |
| Billing             | Subscription, invoice, payment dispute             | L1/L2, < 24 hours  |

### 4.3 Ticket Priority Matrix

| Priority | Impact                              | Urgency                   | Examples                          |
|----------|-------------------------------------|---------------------------|-----------------------------------|
| P1       | All users blocked, revenue impacted | Immediate                 | Platform down, data loss          |
| P2       | Major feature broken, partial workaround | Within hours         | ZATCA submission failing          |
| P3       | Minor feature issue, workaround exists | Within days             | Report formatting error           |
| P4       | Cosmetic or enhancement             | Convenience               | UI alignment, color preference    |

---

## 5. SLA by Subscription Tier

### 5.1 SLA Matrix

| SLA Metric              | Starter          | Professional      | Enterprise         |
|-------------------------|------------------|-------------------|--------------------|
| Support Channels        | Email only       | Chat + Email      | All channels + dedicated CSM |
| First Response Time     | 24 hours         | 4 hours           | 1 hour             |
| P1 Resolution Target    | 72 hours         | 24 hours          | 8 hours            |
| P2 Resolution Target    | 5 business days  | 48 hours          | 24 hours           |
| P3 Resolution Target    | 10 business days | 5 business days   | 48 hours           |
| P4 Resolution Target    | Best effort      | 10 business days  | 5 business days    |
| Uptime SLA              | 99.5%            | 99.9%             | 99.9% + credits    |
| Dedicated CSM           | No               | No                | Yes                |
| Quarterly Business Review| No              | No                | Yes                |
| Custom Training         | No               | 2 sessions/year   | Unlimited          |

### 5.2 SLA Breach Protocol

```
SLA at 75% of target time:
  → Automated warning to assigned agent
  → Ticket highlighted in dashboard

SLA at 90% of target time:
  → Automated escalation to CS Manager
  → Customer notified of status

SLA breached:
  → CS Manager takes ownership
  → Escalation to L2/L3 if unresolved
  → Root cause documented
  → Included in monthly SLA report
```

---

## 6. Escalation Matrix

### 6.1 Escalation Tiers

```
+---------------------------------------------------------------+
| L1: Support Agent                                              |
| Scope: Known issues, configuration, user guidance              |
| Timeframe: 0-30 min investigation                              |
+---------------------------+-----------------------------------+
                            | If unresolved
+---------------------------v-----------------------------------+
| L2: Senior Agent / CS Manager                                  |
| Scope: Complex workflows, multi-module issues, data fixes      |
| Timeframe: 30 min - 4 hours                                   |
+---------------------------+-----------------------------------+
                            | If code fix required
+---------------------------v-----------------------------------+
| L3: Engineering (IT Department)                                |
| Scope: Bug fixes, infrastructure, performance, integrations    |
| Timeframe: Per severity (P1: <1h, P2: <4h, P3: <24h)         |
+---------------------------+-----------------------------------+
                            | If architectural or strategic
+---------------------------v-----------------------------------+
| L4: CTO                                                       |
| Scope: Platform-wide issues, security incidents, data breach   |
| Timeframe: Immediate for P1, <2h for P2                       |
+---------------------------------------------------------------+
```

### 6.2 Escalation Triggers

| Trigger                                    | Escalation Level | Action                          |
|--------------------------------------------|------------------|---------------------------------|
| Customer requests manager                  | L2               | CS Manager takes over           |
| Ticket unresolved past SLA                 | L2               | Auto-escalated                  |
| Bug confirmed (reproducible)              | L3               | Engineering ticket created      |
| Platform outage or data integrity issue    | L3 → L4          | Incident response activated     |
| Legal threat or regulatory concern         | L4 + Owner       | Immediate executive review      |
| Enterprise customer at-risk (churn signal) | CS Manager + Owner| Retention protocol activated   |

---

## 7. Customer Onboarding

### 7.1 Onboarding Timeline

| Phase         | Timeline    | Activities                                              | Owner                 |
|---------------|-------------|--------------------------------------------------------|-----------------------|
| Day 1         | Day 1       | Welcome call, account setup, admin user created        | Implementation Spec   |
| Week 1        | Days 2-7    | Data migration (customers, vehicles, inventory, parts) | Implementation Spec   |
| Week 1        | Days 2-7    | Core team training (Owner, Manager, Service Advisors)  | Implementation Spec   |
| Week 2        | Days 8-14   | Extended team training (Technicians, Finance, Parts)   | Implementation Spec   |
| Week 2        | Days 8-14   | ZATCA e-invoicing configuration and testing            | Implementation Spec   |
| Month 1       | Days 15-30  | Parallel run (old system + SALIS AUTO)                 | CSM + Impl. Spec      |
| Month 1       | Day 30      | Health check: feature adoption review, issue roundup   | CSM                   |
| Month 2       | Day 60      | Full go-live confirmation, old system sunset           | CSM                   |
| Month 3       | Day 90      | 90-day success review, expansion discussion            | CSM                   |

### 7.2 Onboarding Checklist

| # | Task                                      | Status Tracked | Responsible           |
|---|-------------------------------------------|----------------|-----------------------|
| 1 | Tenant provisioned in platform            | System auto    | IT                    |
| 2 | Admin user created and verified           | System auto    | Implementation Spec   |
| 3 | Company profile configured (logo, info)   | Manual check   | Customer + Impl. Spec |
| 4 | RBAC roles assigned for all users         | System check   | Implementation Spec   |
| 5 | Customer data imported                    | Data validated | Implementation Spec   |
| 6 | Vehicle database populated                | Data validated | Implementation Spec   |
| 7 | Inventory/parts catalog loaded            | Data validated | Implementation Spec   |
| 8 | Service pricing configured                | Manual check   | Customer + Impl. Spec |
| 9 | Bay configuration set up                  | Manual check   | Implementation Spec   |
| 10| ZATCA integration configured and tested   | API test pass  | Implementation Spec   |
| 11| Billing/payment methods set up            | System check   | Finance + Impl. Spec  |
| 12| Core team training completed              | Attendance log | Implementation Spec   |
| 13| Extended team training completed          | Attendance log | Implementation Spec   |
| 14| First real job card created successfully  | System check   | Customer              |
| 15| First invoice generated and submitted     | ZATCA confirmed| Customer              |

### 7.3 Data Migration Scope

| Data Type              | Source Formats Accepted      | Validation Rules                   |
|------------------------|-----------------------------|------------------------------------|
| Customers              | CSV, Excel, API             | Name, phone required; dedup check  |
| Vehicles               | CSV, Excel                  | VIN/plate required; customer link  |
| Inventory/Parts        | CSV, Excel                  | SKU, name, cost, quantity required  |
| Service history        | CSV (optional)              | Date, vehicle, service type        |
| Employee records       | CSV, manual entry           | ID, name, role, department         |

---

## 8. Customer Health Score Model

### 8.1 Health Score Components

| Factor                  | Weight | Data Source                     | Scoring                           |
|-------------------------|--------|---------------------------------|-----------------------------------|
| Login Frequency         | 25%    | Platform analytics              | Daily=100, Weekly=70, Monthly=30, None=0 |
| Feature Adoption        | 25%    | Module usage tracking           | % of subscribed modules actively used |
| Support Ticket Volume   | 20%    | Ticket system                   | 0-1/mo=100, 2-3=70, 4-5=40, 6+=10 |
| NPS Score               | 15%    | Survey responses                | Promoter=100, Passive=50, Detractor=0 |
| Payment Timeliness      | 15%    | Billing system                  | On-time=100, <15d late=60, >15d=20 |

### 8.2 Health Score Ranges

| Score Range | Status     | Color  | Action                                     |
|-------------|------------|--------|--------------------------------------------|
| 80-100      | Healthy    | Green  | Maintain relationship, identify expansion  |
| 60-79       | Moderate   | Yellow | Proactive check-in, training offer         |
| 40-59       | At Risk    | Orange | CSM intervention, executive touch          |
| 0-39        | Critical   | Red    | Immediate action plan, retention offer     |

### 8.3 Score Calculation

```
Health Score = (Login Score x 0.25) + (Adoption Score x 0.25) + 
              (Ticket Score x 0.20) + (NPS Score x 0.15) + 
              (Payment Score x 0.15)

Example:
  Login: Daily use = 100, weighted = 25.0
  Adoption: 8/10 modules = 80, weighted = 20.0
  Tickets: 2 tickets/month = 70, weighted = 14.0
  NPS: Promoter (9) = 100, weighted = 15.0
  Payment: On-time = 100, weighted = 15.0
  
  Health Score = 25 + 20 + 14 + 15 + 15 = 89 (Healthy)
```

---

## 9. Intervention Triggers

### 9.1 Automated Alerts

| Trigger                                  | Threshold                    | Action                              | Owner     |
|------------------------------------------|------------------------------|-------------------------------------|-----------|
| Health score drops below 60              | Score < 60                   | CSM outreach within 24 hours        | CSM       |
| No login for 7 consecutive days          | 7 days inactive              | Automated re-engagement email       | System    |
| No login for 14 consecutive days         | 14 days inactive             | CSM phone call                      | CSM       |
| 3+ P1/P2 tickets in 30 days             | 3 tickets                   | CS Manager review, action plan      | CS Manager|
| NPS Detractor score                      | NPS 0-6                     | CSM call within 48 hours            | CSM       |
| Payment overdue > 15 days               | 15 days past due             | CS + Finance joint outreach         | CS + Finance |
| Feature adoption < 30%                  | < 30% of modules used        | Training session offered             | CSM       |

### 9.2 Retention Protocol

When a customer signals churn risk (cancellation request, health score critical):

```
Step 1: CS Manager contacts customer within 4 hours
Step 2: Root cause analysis (survey + conversation)
Step 3: If product issue:
          → Engineering escalation (P1 priority)
          → Workaround provided immediately
Step 4: If value issue:
          → Custom training session (within 1 week)
          → Feature adoption review
Step 5: If price issue:
          → Retention offer (discount/extension)
          → Owner approval for offers > 20% discount
Step 6: Document outcome and update playbook
Step 7: 30-day follow-up regardless of outcome
```

---

## 10. Feedback Loop

### 10.1 Feedback Collection

| Method                        | Frequency      | Audience              | Owner            |
|-------------------------------|----------------|-----------------------|------------------|
| Post-ticket CSAT survey       | Per ticket     | All tiers             | System (auto)    |
| Monthly NPS survey            | Monthly        | All active customers  | CSM              |
| Quarterly Business Review     | Quarterly      | Enterprise only       | CSM              |
| In-app feedback widget        | Always-on      | All tiers             | System (auto)    |
| Annual customer advisory board| Annual         | Top 10 customers      | CS Manager + CTO |

### 10.2 Feature Request Pipeline

```
Customer submits feature request
  |
  CS Agent logs in feature request tracker
  |
  Monthly: CS Manager aggregates and prioritizes
    - Frequency (how many customers asked)
    - Revenue impact (ARR of requesting accounts)
    - Alignment with roadmap
  |
  Top requests presented to Product/CTO in monthly review
  |
  Accepted requests enter product backlog
  |
  Customer notified when:
    - Request accepted (with estimated timeline)
    - Feature shipped (with release notes link)
```

### 10.3 Bug Report to Engineering Pipeline

| Severity  | CS Action                          | Engineering SLA       | Customer Update        |
|-----------|------------------------------------|-----------------------|------------------------|
| P1        | Immediate L3 escalation            | Fix within 8 hours    | Hourly updates         |
| P2        | L3 escalation within 2 hours       | Fix within 48 hours   | Daily updates          |
| P3        | Batch escalation (daily)           | Next sprint           | When fix deployed      |
| P4        | Log and track                      | Backlog               | When fix deployed      |

---

## 11. Key Performance Indicators

### 11.1 KPI Dashboard

| KPI                          | Target              | Measurement    | Frequency | Owner       |
|------------------------------|---------------------|----------------|-----------|-------------|
| Customer Satisfaction (CSAT) | > 4.5 / 5           | Rating         | Per ticket| CS Manager  |
| Net Promoter Score (NPS)     | > 40                | Score (-100 to 100) | Monthly | CSM       |
| First Response Time (in SLA) | 95%                 | Percentage     | Weekly    | CS Manager  |
| Resolution Time (in SLA)     | 90%                 | Percentage     | Weekly    | CS Manager  |
| First Contact Resolution     | > 60%               | Percentage     | Monthly   | CS Manager  |
| Annual Churn Rate            | < 5%                | Percentage     | Monthly   | CSM         |
| Customer Health Score (avg)  | > 75                | Score (0-100)  | Monthly   | CSM         |
| Onboarding Completion (30d) | 100%                | Percentage     | Per customer| Impl. Spec|
| Feature Adoption Rate        | > 60%               | Percentage     | Monthly   | CSM         |
| Ticket Volume Trend          | Stable/decreasing   | Count          | Monthly   | CS Manager  |

### 11.2 KPI Calculation Formulas

```
CSAT = Sum of satisfaction ratings / Number of responses
NPS  = % Promoters (9-10) - % Detractors (0-6)
First Response SLA = Tickets responded within SLA / Total tickets x 100
Resolution SLA = Tickets resolved within SLA / Total tickets x 100
FCR  = Tickets resolved on first contact / Total tickets x 100
Churn Rate = Customers lost in period / Customers at start of period x 100
Feature Adoption = Modules actively used / Total modules subscribed x 100
```

---

## 12. Knowledge Base Management

### 12.1 Content Categories

| Category                    | Articles Target | Update Frequency | Owner             |
|-----------------------------|-----------------|------------------|-------------------|
| Getting Started             | 10              | Per major release | Implementation    |
| Workshop Management         | 25              | Monthly          | Support Agent     |
| Finance & ZATCA             | 20              | Per regulation   | Support Agent     |
| Inventory                   | 15              | Monthly          | Support Agent     |
| Administration & RBAC       | 15              | Per release      | Support Agent     |
| Troubleshooting (FAQ)       | 30              | Weekly           | Support Agent     |
| Video Tutorials             | 20              | Quarterly        | Implementation    |
| Release Notes               | Per release     | Per release      | IT + CS           |

### 12.2 Content Quality

- All articles available in bilingual EN/AR
- Screenshots updated within 2 weeks of UI changes
- Article usefulness rating tracked (thumbs up/down)
- Articles with < 50% usefulness rating reviewed monthly
- Top 10 search queries without matching articles addressed weekly

---

## 13. Cross-References

| Document                                                                                 | Relevance                         |
|------------------------------------------------------------------------------------------|-----------------------------------|
| [Customer Success Plan](../management/customer-success-plan.md)                          | Strategic CS framework            |
| [Customer Retention Strategies](../knowledge-base/customer-retention-strategies.md)      | Retention playbook                |
| [Customer App Guide](../user-documentation/customer-app-guide.md)                        | End-user documentation            |
| [Training Program Overview](../training/program-overview.md)                             | Customer training curriculum      |
| [Business Rules](../MASTER_BUSINESS_RULES.md)                                           | Support-related business rules    |
| [RBAC Matrix](../MASTER_RBAC_MATRIX.md)                                                | Role and permission definitions   |
| [Architecture](../MASTER_ARCHITECTURE.md)                                               | System architecture reference     |

---

## 14. Revision History

| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial department plan    |
