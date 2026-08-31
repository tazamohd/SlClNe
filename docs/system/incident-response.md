# SALIS AUTO -- Incident Response Plan

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the incident classification, response procedures, communication protocols, and post-mortem process for the SALIS AUTO platform. It covers production incidents affecting 13 domains, ZATCA compliance, multi-tenant data integrity, and platform availability. SLA commitments referenced here are defined in the [SLA Document](sla-document.md); failover procedures are in the [Business Continuity Plan](business-continuity.md).

---

## 2. Incident Classification

### 2.1 Severity Levels

| Severity | Name     | Definition                                                        | Examples                                          |
|----------|----------|-------------------------------------------------------------------|---------------------------------------------------|
| P1       | Critical | Platform is down or data is at risk for all tenants               | Database unreachable, auth service down, data breach |
| P2       | High     | Major feature broken for all tenants or data integrity risk       | ZATCA e-invoicing failing, payment processing down, work order creation broken |
| P3       | Medium   | Minor feature issue or single-tenant impact                       | Report export failing, search slow for one branch, i18n key missing |
| P4       | Low      | Cosmetic issue or enhancement request                             | UI alignment in RTL, badge color wrong, tooltip text |

### 2.2 Severity Decision Tree

```
Is the platform accessible?
  No --> P1 (Critical)
  Yes --> Is a core workflow broken? (Workshop lifecycle, Auth, Finance)
    Yes --> Is it affecting all tenants?
      Yes --> P2 (High)
      No  --> P3 (Medium)
    No  --> Is it a visual or cosmetic issue?
      Yes --> P4 (Low)
      No  --> P3 (Medium)
```

### 2.3 ZATCA-Specific Severity

ZATCA compliance issues receive elevated classification:

| ZATCA Issue                              | Severity | Rationale                                     |
|------------------------------------------|----------|-----------------------------------------------|
| E-invoices not generating                | P1       | Regulatory non-compliance, business blocked   |
| Hash chain broken (sequence gap)         | P1       | ZATCA audit trail integrity compromised       |
| QR code generation failing               | P2       | Invoices non-compliant but generatable        |
| VAT calculation rounding error           | P2       | Financial accuracy affected                   |
| ZATCA API clearance timeout              | P3       | Invoice generated but not yet cleared         |
| ZATCA sandbox (non-production) issue     | P4       | Development/testing only                      |

---

## 3. Response Playbooks

### 3.1 P1 -- Critical Incident

**Response time:** 15 minutes (per [SLA](sla-document.md))

| Step | Time        | Action                                                    | Owner              |
|------|-------------|-----------------------------------------------------------|---------------------|
| 1    | 0-5 min     | Alert received (monitoring), Incident Commander assigned  | On-call engineer    |
| 2    | 5-15 min    | Assess scope, confirm P1, open incident channel           | Incident Commander  |
| 3    | 15-30 min   | Assemble response team, begin investigation               | Incident Commander  |
| 4    | 30 min      | First status update to stakeholders                       | Incident Commander  |
| 5    | Ongoing     | Investigation and resolution (30-min status updates)      | Response team       |
| 6    | Resolution  | Verify fix in production, confirm with monitoring         | On-call engineer    |
| 7    | +1 hour     | All-clear notification to stakeholders                    | Incident Commander  |
| 8    | +48 hours   | Post-mortem document completed                            | Incident Commander  |

### 3.2 P2 -- High Severity

**Response time:** 1 hour (per [SLA](sla-document.md))

| Step | Time        | Action                                                    | Owner              |
|------|-------------|-----------------------------------------------------------|---------------------|
| 1    | 0-15 min    | Alert received, on-call engineer begins investigation     | On-call engineer    |
| 2    | 15-60 min   | Identify root cause, assess impact scope                  | On-call engineer    |
| 3    | 60 min      | Status update to PM and affected stakeholders             | On-call engineer    |
| 4    | Ongoing     | Implement fix, test, deploy (hourly status updates)       | On-call + dev team  |
| 5    | Resolution  | Verify fix, update status page                            | On-call engineer    |
| 6    | +5 days     | Post-mortem document completed                            | On-call engineer    |

### 3.3 P3 -- Medium Severity

**Response time:** 4 hours (per [SLA](sla-document.md))

| Step | Action                                                           | Owner              |
|------|------------------------------------------------------------------|---------------------|
| 1    | Ticket created in issue tracker with P3 label                    | Reporter            |
| 2    | On-call engineer acknowledges within 4 hours                     | On-call engineer    |
| 3    | Fix scheduled for next sprint (or sooner if simple)              | PM                  |
| 4    | Fix implemented, tested, deployed                                | Assigned developer  |
| 5    | Reporter notified of resolution                                  | Assigned developer  |

### 3.4 P4 -- Low Severity

**Response time:** Next business day (per [SLA](sla-document.md))

| Step | Action                                                           | Owner              |
|------|------------------------------------------------------------------|---------------------|
| 1    | Ticket created in issue tracker with P4 label                    | Reporter            |
| 2    | Acknowledged at next business day standup                        | Tech Lead           |
| 3    | Prioritized in backlog against other P4 items                    | PM                  |
| 4    | Addressed when sprint capacity allows                            | Assigned developer  |

---

## 4. On-Call Rotation

### 4.1 Schedule

| Rotation       | Coverage          | Team Members                           |
|----------------|-------------------|----------------------------------------|
| Primary        | 24/7              | Rotating weekly among Sr. Backend Devs + DevOps |
| Secondary      | Business hours     | Tech Lead (escalation)                 |
| ZATCA specialist| On-call for ZATCA | Sr. Backend Dev 2 (ZATCA domain owner) |

### 4.2 On-Call Responsibilities

- Monitor alerting channels (Sentry, UptimeRobot, LogTail)
- Acknowledge alerts within SLA response times
- Triage and classify incidents per Section 2
- Escalate to Incident Commander for P1 incidents
- Document actions taken during the incident

---

## 5. Incident Commander

### 5.1 Responsibilities

The Incident Commander (IC) is activated for P1 and optionally for complex P2 incidents:

- **Coordinate** -- Direct the response team, assign tasks
- **Communicate** -- Provide regular status updates to stakeholders
- **Decide** -- Make trade-off decisions (e.g., partial service restoration vs. full fix)
- **Document** -- Ensure the incident timeline is recorded in real time
- **Post-mortem** -- Own the post-mortem process within 48 hours (P1) or 5 days (P2)

### 5.2 IC Assignment

| Scenario                     | Incident Commander       |
|------------------------------|--------------------------|
| Infrastructure/hosting issue | DevOps Engineer          |
| Application bug              | Tech Lead                |
| Database/data issue          | Sr. Backend Dev 1 (DBA)  |
| ZATCA compliance issue       | Sr. Backend Dev 2        |
| Security incident            | Tech Lead (mandatory)    |

---

## 6. Post-Mortem Process

### 6.1 Post-Mortem Template

```
POST-MORTEM: [Incident Title]
================================
Incident ID:    INC-[YYYY]-[NNN]
Severity:       [P1 | P2]
Date:           [YYYY-MM-DD]
Duration:       [Total downtime/impact duration]
Commander:      [Name]
Authors:        [Names]

1. SUMMARY
   [2-3 sentence summary of what happened]

2. TIMELINE (all times in AST, UTC+3)
   [HH:MM] Alert triggered by [monitoring tool]
   [HH:MM] On-call engineer acknowledged
   [HH:MM] Incident Commander activated (P1 only)
   [HH:MM] Root cause identified
   [HH:MM] Fix deployed
   [HH:MM] All-clear confirmed

3. ROOT CAUSE
   [Technical root cause -- no blame, focus on systems]

4. IMPACT
   Tenants affected:     [All | Specific orgs | Single org]
   Users affected:       [Estimated count]
   Domains affected:     [List from 13 domains]
   Data impact:          [None | Partial data loss | Data corruption]
   Financial impact:     [SAR amount if applicable]
   ZATCA compliance:     [Compliant | Non-compliant during window]
   SLA breach:           [Yes/No -- which SLA]

5. RESOLUTION
   [What was done to fix the issue]

6. DETECTION
   How was the incident detected?  [Monitoring | Customer report | Internal]
   Could we have detected it sooner?  [Yes/No -- how]

7. ACTION ITEMS
   | # | Action                        | Owner      | Deadline     | Priority |
   |---|-------------------------------|------------|--------------|----------|
   | 1 | [Preventive action]           | [Name]     | [Date]       | [H/M/L]  |
   | 2 | [Detective action]            | [Name]     | [Date]       | [H/M/L]  |
   | 3 | [Process improvement]         | [Name]     | [Date]       | [H/M/L]  |

8. LESSONS LEARNED
   [Key takeaways -- fed into the Lessons Learned register]
```

### 6.2 Post-Mortem Culture

- **Blameless:** Focus on system failures, not individual mistakes
- **Mandatory for:** All P1 incidents and P2 incidents lasting > 2 hours
- **Review meeting:** Within 48 hours (P1) or 5 business days (P2)
- **Attendees:** Response team + PM + affected domain owners
- **Action tracking:** Items tracked in the [Lessons Learned](../project-management/lessons-learned.md) register

---

## 7. Recovery Procedures

### 7.1 Database Recovery

| Scenario               | Procedure                                              | RTO      |
|------------------------|--------------------------------------------------------|----------|
| Data corruption        | Restore from latest backup (see [BCP](business-continuity.md)) | 4 hours |
| Schema migration failure | Roll back migration via Drizzle rollback script      | 30 min   |
| Connection exhaustion  | Restart connection pool, investigate leaking queries   | 5 min    |
| Replica lag            | Promote replica, investigate replication health        | 15 min   |

### 7.2 Application Recovery

| Scenario               | Procedure                                              | RTO      |
|------------------------|--------------------------------------------------------|----------|
| Bad deployment         | Roll back via Vercel/Netlify instant rollback           | 2 min    |
| Memory leak            | Restart application instances                           | 5 min    |
| Infinite loop / CPU    | Kill process, deploy fix, restart                       | 10 min   |
| Rate limiter blocking  | Adjust `RATE_LIMIT_MAX`, restart                        | 5 min    |

### 7.3 Third-Party Service Recovery

| Service             | Failover                                                  | Documented In     |
|---------------------|-----------------------------------------------------------|--------------------|
| Vercel hosting      | Switch DNS to Netlify                                     | [BCP](business-continuity.md) |
| HyperPay payments   | Queue payments, retry when service recovers               | [BCP](business-continuity.md) |
| ZATCA API           | Queue invoices, submit when API recovers                  | [BCP](business-continuity.md) |
| Unifonic SMS        | Fall back to Twilio for OTP delivery                      | [BCP](business-continuity.md) |

---

## 8. Communication Plan

### 8.1 Internal Communication

| Channel              | P1            | P2            | P3          | P4          |
|----------------------|---------------|---------------|-------------|-------------|
| Slack #salis-incidents | Immediate  | Within 1 hour | --          | --          |
| Phone/call           | IC calls team | --            | --          | --          |
| Email (PM + PO)      | Within 30 min | Within 2 hours| --          | --          |
| Steering Committee   | Within 1 hour | Daily summary | --          | --          |

### 8.2 External Communication (Customers)

| Channel              | P1                    | P2                    | P3          |
|----------------------|-----------------------|-----------------------|-------------|
| Status page          | Updated every 30 min  | Updated every 2 hours | --          |
| Email notification   | Sent within 1 hour    | If > 4 hours duration | --          |
| In-app banner        | Displayed immediately | If > 2 hours duration | --          |

### 8.3 Communication Templates

**P1 Initial Notification:**
```
Subject: [SALIS AUTO] Service Disruption -- [Affected Area]

We are currently experiencing a service disruption affecting [description].
Our team is actively investigating and working to restore normal service.

Impact: [Description of impact]
Started: [Time AST]
Status: Investigating

We will provide updates every 30 minutes.
```

**Resolution Notification:**
```
Subject: [SALIS AUTO] Service Restored -- [Affected Area]

The service disruption affecting [description] has been resolved.

Duration: [Start time] -- [End time] AST
Root cause: [Brief description]
Resolution: [What was done]

We apologize for any inconvenience. A detailed post-mortem will follow.
```

---

## 9. Incident Metrics

| Metric                          | Target                | Tracking              |
|---------------------------------|-----------------------|-----------------------|
| Mean Time to Detect (MTTD)     | < 5 min (P1/P2)      | Monitoring timestamp  |
| Mean Time to Acknowledge (MTTA)| Per SLA (Section 2)   | Alert to first action |
| Mean Time to Resolve (MTTR)    | P1: < 4h, P2: < 8h   | Acknowledge to all-clear |
| Incident recurrence rate       | < 10%                 | Same root cause       |
| Post-mortem completion rate    | 100% for P1/P2       | Within deadline       |
| SLA compliance rate            | >= 99%                | Response time met     |

---

## 10. Related Documents

- [SLA Document](sla-document.md) -- Response time commitments and availability targets
- [Business Continuity Plan](business-continuity.md) -- Failover and disaster recovery
- [Lessons Learned](../project-management/lessons-learned.md) -- Post-mortem action items
- [Change Management](../project-management/change-management.md) -- Emergency change procedures
- [Governance Framework](../project-management/governance-framework.md) -- Escalation authority
