# SALIS AUTO -- Operations Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-011                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan defines the operational procedures, service level agreements,
and support processes for SALIS AUTO once the platform is live. It covers
all 13 operational domains, 191+ screens, and 28 RBAC modules across the
multi-tenant environment, ensuring reliable service for workshops
operating the full lifecycle: Check-In, Inspection, Estimate, Repair, QC,
and Delivery.

### 1.1 Operational Principles

1. **Availability first** -- workshop operations cannot pause; downtime
   during business hours (8:00-22:00 AST) is a P1 incident
2. **Tenant isolation** -- one tenant's issue must never impact another
3. **Compliance continuity** -- ZATCA e-invoicing (15% VAT) must remain
   operational at all times; invoice queue must drain within 24 hours
4. **Bilingual operations** -- all customer-facing communications,
   dashboards, and alerts support both Arabic and English

---

## 2. Service Level Agreements (SLAs)

### 2.1 Availability

| Metric                  | Target       | Measurement                    |
|-------------------------|--------------|--------------------------------|
| Monthly uptime          | 99.9%        | ~43 min max downtime/month     |
| Planned maintenance     | Excluded     | Scheduled windows only         |
| ZATCA integration uptime| 99.5%        | Dependent on ZATCA availability|
| Stripe integration uptime| 99.9%       | Stripe SLA passthrough         |

**Uptime calculation**: `(total_minutes - unplanned_downtime) / total_minutes × 100`.
Planned maintenance excluded. Partial degradation counts as available
unless the core workflow (Check-In through Delivery) is impacted.

### 2.2 Performance SLAs

| Metric                       | p50    | p95    | p99    |
|------------------------------|--------|--------|--------|
| API response time            | <200ms | <500ms | <1s    |
| Page load (Largest Contentful Paint) | <1.5s | <2.5s | <3s |
| Database query time          | <50ms  | <200ms | <500ms |
| Search results returned      | <300ms | <800ms | <1.5s  |
| PDF generation (invoice)     | <2s    | <5s    | <8s    |
| ZATCA invoice submission     | <3s    | <8s    | <15s   |

### 2.3 Support Response SLAs

| Priority | Description                  | Response Time | Resolution Time | Escalation     |
|----------|------------------------------|---------------|-----------------|----------------|
| P1       | System down / data breach    | 15 minutes    | 4 hours         | Immediate to CTO|
| P2       | Major feature broken         | 1 hour        | 24 hours        | 4h to Team Lead|
| P3       | Minor feature issue          | 4 hours       | 1 sprint        | Next standup   |
| P4       | Cosmetic / enhancement       | 24 hours      | Backlog         | Sprint planning|

**P1 examples**: platform unreachable, ZATCA failing, data corruption,
payment processing down. **P2**: single module down, ZATCA errors for
specific types, single tenant locked out. **P3**: report calculation
error, minor UI issue. **P4**: typo, feature request, spacing fix.

---

## 3. Incident Management

### 3.1 Severity Classification Matrix

| Factor          | P1 Critical         | P2 Major            | P3 Minor           | P4 Low             |
|-----------------|----------------------|---------------------|---------------------|---------------------|
| User impact     | All tenants          | Multiple tenants    | Single tenant       | Cosmetic            |
| Revenue impact  | Invoicing blocked    | Feature degraded    | Workaround exists   | None                |
| Data impact     | Loss or corruption   | Incorrect display   | Edge case error     | None                |
| Compliance      | ZATCA non-compliant  | Delayed compliance  | No impact           | No impact           |
| Security        | Active breach        | Vulnerability found | Low-risk finding    | Informational       |

### 3.2 Incident Response Workflow

**Detection** → **Triage** → **Investigation** → **Resolution** → **Post-Mortem**

1. **Detection**: automated monitoring alerts (Sentry, APM, uptime checks),
   customer reports, or ZATCA submission failure alerts
2. **Triage** (within response SLA): classify P1-P4, assign incident
   commander (P1/P2: on-call; P3/P4: sprint backlog), open Slack thread
3. **Investigation**: review logs/traces/metrics, identify blast radius
   (tenants, modules, roles), determine root cause or mitigate
4. **Resolution**: deploy fix (hot-fix for P1/P2, next sprint for P3/P4),
   verify with reporter, update status page, close ticket
5. **Post-Mortem** (required P1, recommended P2): blameless review within
   48 hours, action items tracked in backlog with due dates

### 3.3 On-Call Rotation

| Aspect           | Details                                        |
|------------------|------------------------------------------------|
| Rotation period  | 1 week (Sunday to Saturday, aligned with KSA)  |
| Team size        | Primary + secondary engineer                   |
| Handoff          | Saturday 10:00 AST, written handoff document   |
| Escalation timer | 15 minutes no-response → secondary paged       |
| Compensation     | On-call allowance per company policy            |

### 3.4 Communication During Incidents

| Severity | Internal Channel     | Customer Channel      | Update Frequency     |
|----------|----------------------|-----------------------|----------------------|
| P1       | Slack #incidents + PagerDuty | Status page + SMS + WhatsApp | Every 15 min |
| P2       | Slack #incidents     | Status page + email   | Every 1 hour         |
| P3       | Slack #support       | Email (if reported)   | On resolution        |
| P4       | Jira ticket          | None                  | On resolution        |

Customer notifications are bilingual (AR/EN) and include: affected area,
current status, ETA, and data safety assurance.

---

## 4. On-Call Procedures

### 4.1 Tools and Access

| Tool              | Purpose                          | Access Level        |
|-------------------|----------------------------------|---------------------|
| PagerDuty         | Alert routing and escalation     | On-call engineers   |
| Slack #incidents  | Real-time incident coordination  | Engineering team    |
| Runbook repository| Step-by-step resolution guides   | All engineers       |
| Sentry            | Error tracking and stack traces  | All engineers       |
| APM dashboard     | Performance monitoring           | All engineers       |
| Database console  | Read-only production queries     | On-call + DBA       |
| ZATCA dashboard   | Invoice submission monitoring    | On-call + compliance|

### 4.2 Escalation Matrix

| Level | Role                | Trigger                            | Authority           |
|-------|---------------------|------------------------------------|---------------------|
| L1    | On-call engineer    | Initial alert / customer report    | Investigate + mitigate |
| L2    | Team lead           | L1 unable to resolve in 30 min     | Approve hot-fix deploy |
| L3    | CTO                 | L2 unable to resolve in 2 hours    | Approve rollback     |
| L4    | Vendor support      | Integration-specific issue         | Vendor escalation    |

**Vendor Escalation Contacts**:

| Vendor   | Support Channel           | SLA              |
|----------|---------------------------|------------------|
| ZATCA    | Developer portal + email  | 2 business days  |
| Stripe   | Dashboard + API support   | 4 hours (premium)|
| SMS      | Provider dashboard + email| 1 hour           |
| WhatsApp | Meta Business support     | 24 hours         |

### 4.3 Shift Handoff

Outgoing engineer provides a written briefing covering: open incidents
(status, next steps, blockers), resolved incidents (summary), monitoring
anomalies, pending tasks (deployments, cert renewals), and any temporary
access grants that need revoking.

---

## 5. Capacity Planning

### 5.1 Current Capacity Baseline

| Resource                | Current Capacity     | Current Usage       |
|-------------------------|----------------------|---------------------|
| Concurrent users        | 100                  | ~20 (pilot phase)   |
| Active tenants          | 50                   | 3 (pilot)           |
| Daily transactions      | 10,000               | ~500 (pilot)        |
| Database storage        | 100 GB               | ~5 GB               |
| File storage            | 500 GB               | ~10 GB              |
| API requests/min        | 5,000                | ~200                |

### 5.2 Scaling Triggers

| Metric                          | Threshold        | Action                        |
|---------------------------------|------------------|-------------------------------|
| CPU utilization                 | >70% sustained (15 min) | Add app server instance  |
| Memory utilization              | >80%             | Scale up or add instance      |
| API response time               | >500ms p95       | Investigate + scale if needed |
| Database connections            | >80% pool        | Increase pool or add replica  |
| Disk usage                      | >75%             | Expand volume or archive data |
| Queue depth (background jobs)   | >1000 pending    | Add worker instances          |

### 5.3 Scaling Strategy

| Layer              | Strategy                | Method                        |
|--------------------|-------------------------|-------------------------------|
| Application servers| Horizontal scaling      | Auto-scaling group, min 2     |
| Database (write)   | Vertical scaling        | Upgrade instance class        |
| Database (read)    | Horizontal scaling      | Add read replicas             |
| Cache (Redis)      | Vertical scaling        | Upgrade instance              |
| Static assets      | CDN                     | CloudFront / equivalent       |
| Background workers | Horizontal scaling      | Add worker instances          |
| File storage       | Cloud storage           | S3-compatible, unlimited      |

### 5.4 Growth Projections

| Period    | Tenants | Concurrent Users | Daily Transactions | DB Size  |
|-----------|---------|-------------------|--------------------|----------|
| Launch    | 3       | 20                | 500                | 5 GB     |
| Year 1    | 50      | 300               | 15,000             | 50 GB    |
| Year 2    | 200     | 1,200             | 60,000             | 200 GB   |
| Year 3    | 500     | 3,000             | 150,000            | 500 GB   |

Infrastructure costs scale sub-linearly due to multi-tenant architecture;
target <5 SAR per tenant per day at 200+ tenants.

---

## 6. Maintenance Windows

### 6.1 Scheduled Maintenance

| Parameter           | Value                                       |
|---------------------|---------------------------------------------|
| Window              | Sunday 2:00-4:00 AM AST                     |
| Rationale           | Lowest traffic period for KSA workshops     |
| Cadence             | Bi-weekly (every other Sunday)              |
| Duration            | 2 hours maximum                             |
| Notification        | 48 hours advance notice via email + in-app   |
| Activities          | Database maintenance, security patches, cert renewal |
| Downtime expected   | 0-15 minutes (blue-green deployments)        |

### 6.2 Emergency Maintenance

| Parameter           | Value                                       |
|---------------------|---------------------------------------------|
| Authorization       | VP-level or CTO approval required           |
| When                | Any time for P1 security or data issues     |
| Notification        | 30 minutes prior to customers (minimum)     |
| Communication       | Status page + SMS + WhatsApp to all admins   |
| Duration            | As short as possible, documented afterward   |

### 6.3 Change Management

All production changes follow the Change Advisory Board (CAB) process:

| Change Type      | Approval Required     | Lead Time    | CAB Review    |
|------------------|-----------------------|--------------|---------------|
| Standard         | Team Lead             | 48 hours     | Not required  |
| Normal           | CAB (weekly meeting)  | 1 week       | Required      |
| Emergency        | CTO                   | Immediate    | Post-hoc      |

**Standard changes** (pre-approved): dependency updates (non-breaking),
content updates, configuration changes within defined parameters.

**Normal changes**: new features, database schema changes, integration
updates, infrastructure modifications.

**Emergency changes**: P1 hot-fixes, security patches for active
vulnerabilities, ZATCA compliance fixes.

---

## 7. Vendor Management

### 7.1 Vendor SLA Monitoring

| Vendor     | Contractual SLA | Our Dependency    | Monitoring Method       |
|------------|-----------------|-------------------|-------------------------|
| ZATCA      | Best effort     | Invoice submission| Submission success rate  |
| Stripe     | 99.99% uptime   | Payment processing| Stripe status page + API|
| SMS provider| 99.9% uptime   | Notifications     | Delivery rate tracking  |
| WhatsApp   | 99.9% uptime    | Customer comms    | Message delivery status |
| SendGrid   | 99.95% uptime   | Email delivery    | Bounce rate monitoring  |
| Cloud host | 99.99% uptime   | All infrastructure| Provider status page    |

### 7.2 Vendor Escalation and Contract Review

Escalation flow: detect via health check, verify vendor-side, open vendor
ticket, track internally, escalate if vendor SLA exceeded. Contracts are
reviewed 60 days before renewal (Cloud host, SMS, SendGrid -- annual;
Stripe -- quarterly ongoing review by Finance Lead).

---

## 8. Disaster Recovery

### 8.1 Recovery Objectives

| Metric | Target  | Description                                    |
|--------|---------|------------------------------------------------|
| RPO    | <1 hour | Maximum data loss (point-in-time recovery)     |
| RTO    | <4 hours| Maximum time to restore full service           |

### 8.2 Disaster Scenarios and Response

| Scenario                    | RPO Achieved | RTO Achieved | Procedure              |
|-----------------------------|--------------|--------------|------------------------|
| Single server failure       | 0 (no loss)  | <5 min       | Auto-scaling replaces  |
| Database failure            | <1 hour      | <30 min      | Failover to replica    |
| Full region outage          | <1 hour      | <4 hours     | DR site activation     |
| Data corruption (logical)   | <1 hour      | <2 hours     | Point-in-time restore  |
| Ransomware / security breach| <1 hour      | <4 hours     | Clean restore + audit  |

### 8.3 DR Site Activation Procedure

| Step | Action                                        | Duration | Owner   |
|------|-----------------------------------------------|----------|---------|
| 1    | Confirm primary site is unrecoverable         | 15 min   | CTO     |
| 2    | Activate DR site infrastructure               | 30 min   | DevOps  |
| 3    | Restore database from latest backup           | 1 hour   | DBA     |
| 4    | Deploy application to DR site                 | 30 min   | DevOps  |
| 5    | Update DNS to point to DR site                | 15 min   | DevOps  |
| 6    | Verify ZATCA + Stripe connectivity            | 30 min   | Dev Lead|
| 7    | Smoke test core workflow                      | 30 min   | QA Lead |
| 8    | Notify customers of service restoration       | 15 min   | PM      |

### 8.4 DR Drills

Annual full DR drill (semi-annual recommended) with a 4-hour exercise
window. All key roles participate (DevOps, DBA, Dev Lead, QA Lead, PM).
Each drill produces a report with findings and tracked improvement items.

---

## 9. Operational Metrics Dashboard

### 9.1 Key Operational Metrics

| Metric                  | Formula / Source                | Target           |
|-------------------------|---------------------------------|------------------|
| Uptime %                | (total - downtime) / total     | ≥99.9%           |
| MTTR                    | Mean time to resolve incidents | <2 hours (P1/P2) |
| MTBF                    | Mean time between failures     | >30 days         |
| Change failure rate     | Failed deploys / total deploys | <5%              |
| Deployment frequency    | Deploys per week               | 2-3 per week     |
| Lead time for changes   | Commit to production           | <2 days          |
| Incident count (P1+P2)  | Monthly count                  | <2 per month     |
| ZATCA submission success| Successful / total submitted   | >99.9%           |
| Customer satisfaction   | NPS or CSAT score              | >80              |

### 9.2 Dashboard Views

Three views serve different audiences: **Executive** (weekly -- uptime,
incidents by severity, ZATCA compliance rate, tenant growth, top issues),
**Engineering** (real-time -- API latency, error rate, queue depth,
integration health, active alerts), and **Tenant** (per-workshop uptime,
ZATCA submission status, usage against limits, ticket status).

### 9.3 Reporting Cadence

| Report              | Audience        | Frequency  | Owner        |
|---------------------|-----------------|------------|--------------|
| Daily ops summary   | Engineering     | Daily      | On-call      |
| Weekly ops review   | Leadership      | Weekly     | DevOps Lead  |
| Monthly SLA report  | All stakeholders| Monthly    | PM           |
| Quarterly capacity  | Leadership      | Quarterly  | CTO + DevOps |
| Annual DR drill     | All stakeholders| Annual     | CTO          |

---

## 10. Continuous Improvement

- **Incident post-mortems** feed into the backlog as reliability items
- **Support tickets** analyzed monthly for recurring product/doc gaps
- **Performance trends** reviewed weekly; degradation addressed pre-SLA
- **On-call retrospectives** (monthly) improve tooling and process

**Automation Goals**:

| Area                    | Current State     | Target State              |
|-------------------------|-------------------|---------------------------|
| Incident detection      | 80% automated     | 95% automated             |
| Scaling                 | Manual trigger     | Fully auto-scaled         |
| Certificate renewal     | Manual reminder    | Automated via certbot     |
| Backup verification     | Monthly manual     | Weekly automated restore  |
| Security patching       | Manual review      | Automated for non-breaking|

---

## 11. Cross-References

| Document                                | Relevance                         |
|-----------------------------------------|-----------------------------------|
| [Monitoring & Logging](../technical/monitoring-logging.md)      | Observability stack details       |
| [Backup & Recovery](../technical/backup-recovery.md)            | Backup procedures and schedules   |
| [Incident Response Plan](incident-response.md)                  | Detailed incident procedures      |
| [SLA Document](sla-document.md)                                 | Customer-facing SLA terms         |
| [Pre-Launch Plan](pre-launch-plan.md)                           | Transition from launch to ops     |
| [Integration Management Plan](integration-management-plan.md)   | Integration health monitoring     |
| [Security Plan](security-plan.md)                               | Security incident procedures      |

---

## 12. Revision History

| Version | Date       | Author          | Changes                          |
|---------|------------|-----------------|----------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO  | Initial release                  |
