# SALIS AUTO -- Service Level Agreement

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-003                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the Service Level Agreements (SLAs) for the SALIS AUTO platform, including availability commitments, performance targets, support tiers, incident response times, maintenance windows, data retention, and backup guarantees. It applies to all tenants (organizations) using the platform. Recovery procedures are detailed in the [Business Continuity Plan](business-continuity.md); incident handling is in the [Incident Response Plan](incident-response.md).

---

## 2. Platform Availability

### 2.1 Uptime Target

| Metric                        | Target    | Measurement Period | Calculation                          |
|-------------------------------|-----------|--------------------|-----------------------------------------|
| Platform availability         | 99.9%     | Monthly            | (Total minutes - Downtime) / Total minutes |
| Maximum monthly downtime      | 43.8 min  | Monthly            | 30 days x 24h x 60min x 0.001          |

### 2.2 Availability Scope

| Component                     | Covered by 99.9% SLA | Notes                                    |
|-------------------------------|----------------------|------------------------------------------|
| Frontend SPA (Vercel/Netlify) | Yes                  | CDN-backed, multi-region                 |
| Backend API (`/api/v1/*`)     | Yes                  | All 21 collection endpoints              |
| Authentication service        | Yes                  | Login, refresh, OTP                      |
| Database (PostgreSQL)         | Yes                  | Primary instance                         |
| ZATCA integration             | Partial              | Depends on ZATCA government API uptime   |
| Third-party services          | No                   | HyperPay, Unifonic, AWS SES             |
| Scheduled maintenance windows | No                   | Excluded from downtime calculation       |

### 2.3 Availability Monitoring

- **Synthetic monitoring:** UptimeRobot checks `/health` endpoint every 60 seconds
- **Real user monitoring:** Sentry performance tracking on frontend
- **Database monitoring:** PostgreSQL connection pool and query latency metrics
- **Monthly report:** Availability report published to all tenants by the 5th of each month

---

## 3. Performance SLAs

### 3.1 API Response Times

| Metric                        | Target    | Measurement          |
|-------------------------------|-----------|----------------------|
| API response time (p50)       | < 100ms   | Median response time |
| API response time (p95)       | < 200ms   | 95th percentile      |
| API response time (p99)       | < 500ms   | 99th percentile      |

**Scope:** All authenticated API endpoints under `/api/v1/`. Measured server-side from request receipt to response send, excluding network latency.

### 3.2 Page Load Times

| Metric                        | Target    | Conditions                     |
|-------------------------------|-----------|--------------------------------|
| Initial page load (cold)      | < 3s      | 4G connection (10 Mbps)        |
| Subsequent navigation (SPA)   | < 1s      | Client-side route change       |
| Time to Interactive (TTI)     | < 4s      | 4G connection, first visit     |

### 3.3 Feature-Specific Performance

| Feature                       | Target    | Notes                          |
|-------------------------------|-----------|--------------------------------|
| Search across collections     | < 500ms   | Any of the 21 collection endpoints with `?search=` |
| Report generation             | < 5s      | Standard reports (daily, weekly)|
| ZATCA invoice generation      | < 3s      | XML + QR code + hash chain     |
| Dashboard rendering           | < 2s      | Owner/Manager dashboard with KPIs |
| File upload (estimate photos) | < 10s     | Up to 5 MB per image           |

### 3.4 Lighthouse Scores

| Metric                        | Target    |
|-------------------------------|-----------|
| Performance                   | >= 80     |
| Accessibility                 | >= 90     |
| Best Practices                | >= 90     |
| SEO                           | >= 80     |

---

## 4. Support Tiers

### 4.1 Tier Definitions

| Feature                       | Basic               | Professional         | Enterprise           |
|-------------------------------|----------------------|----------------------|----------------------|
| Email support                 | 48-hour response     | 24-hour response     | 4-hour response      |
| Phone support                 | --                   | Business hours (SAT-THU 9-5 AST) | 24/7       |
| Dedicated support contact     | --                   | --                   | Named account manager|
| Onboarding assistance         | Self-service docs    | Guided onboarding    | White-glove setup    |
| Training sessions             | --                   | 2 sessions/quarter   | Unlimited            |
| Custom report development     | --                   | --                   | Included (2/quarter) |
| ZATCA compliance support      | Documentation only   | Email guidance       | Direct consultation  |
| Monthly business review       | --                   | --                   | Yes                  |
| SLA breach credits            | --                   | Yes                  | Yes (enhanced)       |

### 4.2 Support Hours

| Support Type          | Hours                              | Time Zone |
|-----------------------|------------------------------------|-----------|
| Email support         | SAT-THU 9:00--17:00               | AST (UTC+3)|
| Phone support (Pro)   | SAT-THU 9:00--17:00               | AST (UTC+3)|
| Phone support (Ent)   | 24/7                               | AST (UTC+3)|
| Emergency support     | 24/7 (all tiers for P1)           | AST (UTC+3)|

**Note:** Saudi business week is Saturday through Thursday. Friday is the weekend.

---

## 5. Incident Response Times

### 5.1 Response Time by Severity

| Severity | Name     | Response Time (Basic) | Response Time (Pro) | Response Time (Enterprise) |
|----------|----------|-----------------------|---------------------|---------------------------|
| P1       | Critical | 1 hour                | 30 minutes          | 15 minutes                |
| P2       | High     | 4 hours               | 2 hours             | 1 hour                    |
| P3       | Medium   | Next business day     | 8 hours             | 4 hours                   |
| P4       | Low      | 3 business days       | 2 business days     | Next business day         |

### 5.2 Resolution Time Targets

| Severity | Target Resolution Time | Escalation Trigger          |
|----------|------------------------|-----------------------------|
| P1       | 4 hours                | If unresolved after 2 hours |
| P2       | 8 hours                | If unresolved after 4 hours |
| P3       | 5 business days        | If unresolved after 3 days  |
| P4       | Next sprint            | No escalation               |

### 5.3 Response Time Measurement

- **Start:** Ticket created or alert triggered (whichever is first)
- **Acknowledgment:** First meaningful response (not auto-reply)
- **Resolution:** Issue resolved and confirmed by reporter or monitoring

---

## 6. Maintenance Windows

### 6.1 Scheduled Maintenance

| Parameter               | Value                                              |
|-------------------------|----------------------------------------------------|
| Regular window          | Saturday 2:00--4:00 AM AST (Friday evening UTC)   |
| Frequency               | As needed, maximum 2 per month                     |
| Advance notice          | 72 hours minimum                                   |
| Notification method     | Email + in-app banner + status page                |
| Maximum duration        | 2 hours                                            |

### 6.2 Emergency Maintenance

| Parameter               | Value                                              |
|-------------------------|----------------------------------------------------|
| Trigger                 | Security vulnerability, data integrity risk, regulatory compliance |
| Advance notice          | Best effort (minimum 1 hour when possible)         |
| Notification method     | Email + status page + phone (Enterprise tier)      |
| Maximum duration        | 4 hours                                            |
| Post-maintenance        | Incident report within 24 hours                    |

### 6.3 Zero-Downtime Deployments

Standard feature deployments and bug fixes are deployed without maintenance windows:

- Frontend: Vercel/Netlify atomic deployments (zero downtime)
- Backend: Rolling restart with health check gates
- Database: Online schema migrations where possible (Drizzle ORM)
- Maintenance windows reserved for: major database migrations, infrastructure changes, security patches requiring restart

---

## 7. Data Retention

### 7.1 Retention Periods

| Data Category                    | Retention Period    | Regulatory Basis         |
|----------------------------------|---------------------|--------------------------|
| Active business data             | Indefinite          | Customer subscription    |
| ZATCA e-invoice records          | 7 years             | ZATCA e-invoicing regulations |
| ZATCA audit logs (hash chain)    | 7 years             | ZATCA compliance         |
| Platform audit logs              | 7 years             | ZATCA + Saudi commercial law |
| Soft-deleted records             | 90 days             | Recovery window, then purge consideration |
| User session data                | 30 days             | Security monitoring      |
| Temporary files (uploads)        | 30 days             | Processing buffer        |
| Backup data                      | Per Section 7.2     | Disaster recovery        |

### 7.2 Backup SLAs

| Backup Metric            | Target              | Details                              |
|--------------------------|---------------------|--------------------------------------|
| Recovery Point Objective | 1 hour              | Maximum data loss on recovery        |
| Recovery Time Objective  | 4 hours             | Maximum time to restore full service |
| Full backup frequency    | Daily (2 AM AST)    | pg_dump to encrypted storage         |
| Incremental backup       | Continuous           | WAL archiving for point-in-time      |
| Backup retention         | 30 days              | Daily backups                        |
| Backup encryption        | AES-256              | At-rest encryption                   |
| Backup location          | AWS S3 (Bahrain)     | GCC data residency                   |

### 7.3 Data Deletion

Upon tenant subscription cancellation:

1. **Grace period:** 30 days -- data accessible, account suspended
2. **Export window:** During grace period, tenant can request full data export
3. **Soft delete:** After grace period, tenant data soft-deleted
4. **Hard delete:** 90 days after soft delete, data permanently purged
5. **Exception:** ZATCA-regulated data retained for 7 years regardless of subscription status

---

## 8. SLA Breach and Credits

### 8.1 Service Credit Calculation

| Monthly Uptime           | Service Credit (% of monthly fee) |
|--------------------------|-----------------------------------|
| 99.0% -- 99.9%           | 10%                               |
| 95.0% -- 99.0%           | 25%                               |
| 90.0% -- 95.0%           | 50%                               |
| Below 90.0%              | 100%                              |

### 8.2 Credit Eligibility

- Available to Professional and Enterprise tiers only
- Must be requested within 30 days of the affected month
- Credits applied to the next billing cycle (not refunded)
- Maximum credit per month: 100% of that month's subscription fee

### 8.3 SLA Breach Notification

When an SLA breach is detected:

1. Internal alert to PM and Steering Committee
2. Root cause analysis initiated (per [Incident Response](incident-response.md))
3. Affected customers notified within 24 hours with explanation
4. Credit applied automatically for Enterprise tier; on request for Professional

---

## 9. Exclusions

The following are excluded from SLA calculations:

| Exclusion                              | Rationale                                    |
|----------------------------------------|----------------------------------------------|
| Force majeure                          | Natural disasters, government actions, war   |
| Scheduled maintenance windows          | Pre-announced, excluded from uptime          |
| Customer-caused issues                 | Misconfiguration, API abuse, exceeded quotas |
| Third-party service outages            | HyperPay, ZATCA API, SMS providers           |
| Beta/preview features                  | Not yet covered by production SLA            |
| Free tier / trial accounts             | No SLA commitment                            |
| Network issues outside platform        | ISP outages, DNS propagation, client network |

---

## 10. SLA Review and Reporting

| Activity                          | Frequency   | Audience              |
|-----------------------------------|-------------|----------------------|
| Uptime report                     | Monthly     | All tenants          |
| Performance metrics report        | Monthly     | Enterprise tenants   |
| SLA review with steering committee| Quarterly   | Internal             |
| SLA terms update                  | Annually    | All tenants (30-day notice) |
| Third-party SLA alignment         | Annually    | Internal (PM + DevOps) |

---

## 11. Related Documents

- [Incident Response Plan](incident-response.md) -- Severity classification and response playbooks
- [Business Continuity Plan](business-continuity.md) -- RPO/RTO procedures and failover
- [API Versioning](api-versioning.md) -- API deprecation timelines
- [Procurement Management](../project-management/procurement-management.md) -- Vendor SLA alignment
- [Governance Framework](../project-management/governance-framework.md) -- Escalation authority
- [Closure Report](../project-management/closure-report.md) -- Warranty period and handover SLAs
