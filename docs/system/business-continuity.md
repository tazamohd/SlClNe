# SALIS AUTO -- Business Continuity Plan

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-002                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

---

## 1. Purpose

This document defines the business continuity and disaster recovery strategy for the SALIS AUTO platform. It covers risk scenarios, recovery strategies, failover procedures, backup policies, and the minimum viable service definition. Recovery objectives and SLA commitments are defined in the [SLA Document](sla-document.md); incident response procedures are in the [Incident Response Plan](incident-response.md).

---

## 2. Recovery Objectives

| Objective                        | Target      | Definition                                              |
|----------------------------------|-------------|---------------------------------------------------------|
| Recovery Point Objective (RPO)   | 1 hour      | Maximum acceptable data loss                            |
| Recovery Time Objective (RTO)    | 4 hours     | Maximum time to restore service                         |
| Maximum Tolerable Downtime (MTD) | 8 hours     | Business impact becomes unacceptable beyond this        |

---

## 3. Risk Scenarios and Recovery Strategies

### 3.1 Database Failure

| Aspect              | Detail                                                         |
|----------------------|----------------------------------------------------------------|
| **Scenario**         | Primary PostgreSQL instance becomes unavailable or corrupt     |
| **Impact**           | All 13 domains inaccessible, no read or write operations       |
| **Probability**      | Low                                                            |
| **Business impact**  | Critical -- all workshop operations halt                       |

**Recovery strategy:**

| Step | Action                                                         | Time     | Owner        |
|------|----------------------------------------------------------------|----------|--------------|
| 1    | Automated monitoring detects database health check failure     | 0-2 min  | UptimeRobot  |
| 2    | On-call engineer alerted, confirms database is unreachable     | 2-5 min  | On-call      |
| 3    | Attempt database restart on current instance                   | 5-15 min | On-call      |
| 4    | If restart fails: promote read replica to primary              | 15-30 min| DBA          |
| 5    | If no replica: restore from latest backup (pg_dump or PITR)   | 30 min-4h| DBA          |
| 6    | Update connection strings, verify application connectivity     | 15 min   | DevOps       |
| 7    | Run data integrity checks (tenant isolation, hash chains)      | 30 min   | DBA          |
| 8    | Confirm ZATCA invoice hash chain continuity                    | 15 min   | ZATCA lead   |

### 3.2 Hosting Provider Outage

| Aspect              | Detail                                                         |
|----------------------|----------------------------------------------------------------|
| **Scenario**         | Vercel (primary frontend host) experiences extended outage     |
| **Impact**           | Frontend SPA inaccessible, API may still be reachable          |
| **Probability**      | Low                                                            |
| **Business impact**  | High -- users cannot access the platform                       |

**Recovery strategy:**

| Step | Action                                                         | Time     | Owner        |
|------|----------------------------------------------------------------|----------|--------------|
| 1    | Vercel status page confirms outage                              | 0-5 min  | Monitoring   |
| 2    | Activate Netlify deployment (pre-built, always current)         | 5-10 min | DevOps       |
| 3    | Update DNS to point to Netlify domain                           | 10-30 min| DevOps       |
| 4    | Verify application loads from Netlify                           | 5 min    | QA           |
| 5    | Notify users of temporary URL if DNS propagation is slow        | 15 min   | PM           |
| 6    | Monitor Vercel recovery, plan switch-back                       | Ongoing  | DevOps       |

**Failover readiness:** Both `vercel.json` and `netlify.toml` are maintained in the repository. The CI/CD pipeline deploys to both targets on every merge to `main`. GitHub Pages serves as a third option via GitHub Actions.

### 3.3 Payment Gateway Down (HyperPay)

| Aspect              | Detail                                                         |
|----------------------|----------------------------------------------------------------|
| **Scenario**         | HyperPay payment processing unavailable                        |
| **Impact**           | Cannot collect payments, invoices stuck in "pending payment"   |
| **Probability**      | Medium                                                         |
| **Business impact**  | Medium -- workshops can still operate, payments are deferred   |

**Recovery strategy:**

| Step | Action                                                         | Time     | Owner        |
|------|----------------------------------------------------------------|----------|--------------|
| 1    | Payment attempts return errors, monitoring alerts triggered    | 0-5 min  | Monitoring   |
| 2    | Enable "payment deferred" mode in platform settings            | 5-10 min | On-call      |
| 3    | Invoices marked as "payment pending -- gateway offline"        | Automatic| System       |
| 4    | Workshop operations continue without payment blocking          | Ongoing  | All users    |
| 5    | When HyperPay recovers: process queued payments in batch       | 30 min   | Accountant   |
| 6    | Verify all deferred payments are settled                       | 1 hour   | Finance lead |

### 3.4 ZATCA Service Unavailable

| Aspect              | Detail                                                         |
|----------------------|----------------------------------------------------------------|
| **Scenario**         | ZATCA clearance/reporting API is unreachable                   |
| **Impact**           | E-invoices generated but not cleared with ZATCA                |
| **Probability**      | Medium (government API maintenance windows)                    |
| **Business impact**  | Medium -- invoices valid locally, clearance deferred            |

**Recovery strategy:**

| Step | Action                                                         | Time     | Owner        |
|------|----------------------------------------------------------------|----------|--------------|
| 1    | ZATCA API calls return timeout or 5xx errors                   | 0-5 min  | Monitoring   |
| 2    | System switches to "offline clearance" mode                    | Automatic| System       |
| 3    | Invoices generated locally with valid XML, QR, and hash chain  | Automatic| System       |
| 4    | Invoices queued for clearance submission                       | Automatic| System       |
| 5    | When ZATCA recovers: batch-submit queued invoices              | 30 min   | ZATCA lead   |
| 6    | Verify clearance responses, update invoice statuses            | 1 hour   | ZATCA lead   |
| 7    | Confirm hash chain integrity after batch submission            | 15 min   | ZATCA lead   |

**Note:** ZATCA Phase 2 allows a grace period for clearance submission. Invoices with valid XML and hash chain are legally usable during the ZATCA outage window.

### 3.5 Key Personnel Loss

| Aspect              | Detail                                                         |
|----------------------|----------------------------------------------------------------|
| **Scenario**         | Critical team member becomes unavailable (illness, departure)  |
| **Impact**           | Knowledge gap in specialized area (ZATCA, architecture, DBA)   |
| **Probability**      | Medium                                                         |
| **Business impact**  | Medium to High depending on the person                         |

**Recovery strategy:**

| Critical Role         | Bus Factor | Backup                    | Knowledge Location              |
|-----------------------|------------|---------------------------|---------------------------------|
| Tech Lead             | 2          | Sr. Backend Dev 1         | Architecture docs, decision log |
| ZATCA specialist      | 1 (risk)   | Full-Stack Dev 2 (cross-trained) | ZATCA integration docs    |
| DBA (Sr. Backend Dev 1)| 2         | Sr. Backend Dev 2         | Schema docs, migration scripts  |
| DevOps Engineer       | 1 (risk)   | Tech Lead (partial)       | CI/CD config in repo, runbooks  |
| Arabic Linguist       | 1          | External translation service | AR key file, style guide    |

**Mitigation:** All specialized knowledge is documented (see [Resource Management](../project-management/resource-management.md)). Cross-training sessions scheduled for bus-factor-1 roles.

---

## 4. Data Backup Strategy

### 4.1 Backup Schedule

| Backup Type           | Frequency    | Retention    | Method                              |
|-----------------------|-------------|--------------|-------------------------------------|
| Full database dump    | Daily (2 AM AST) | 30 days | `pg_dump` to encrypted S3 bucket   |
| Incremental WAL       | Continuous   | 7 days       | WAL archiving for PITR             |
| Point-in-time (PITR)  | Continuous   | 7 days       | WAL replay to any point            |
| Configuration backup  | On change    | 90 days      | Git-committed config files          |
| ZATCA invoice archive | Daily        | 7 years      | Separate encrypted archive          |

### 4.2 ZATCA Compliance Backup

ZATCA regulations require 7-year retention of all e-invoice data:

- Invoices, credit notes, and debit notes stored in the primary database
- Daily export to a separate long-term archive (encrypted, append-only)
- Hash chain data preserved alongside invoice data
- Archive integrity verified quarterly

### 4.3 Backup Verification

| Verification Activity       | Frequency   | Owner        |
|-----------------------------|-------------|--------------|
| Backup completion monitoring| Daily       | DevOps       |
| Test restore to staging     | Monthly     | DBA          |
| Full DR drill (restore + verify) | Quarterly | DevOps + DBA |
| ZATCA archive integrity check | Quarterly | ZATCA lead   |

---

## 5. Geographic Redundancy

### 5.1 Saudi Data Residency Constraints

Saudi regulations may require certain data categories to remain within the Kingdom or GCC:

| Data Category                | Residency Requirement      | Current Location       |
|------------------------------|----------------------------|------------------------|
| Customer PII                 | Saudi Arabia / GCC         | AWS ME (Bahrain)       |
| Financial records            | Saudi Arabia / GCC         | AWS ME (Bahrain)       |
| ZATCA e-invoice data         | Saudi Arabia / GCC         | AWS ME (Bahrain)       |
| Application code and config  | No restriction             | GitHub (US), CDN (global) |
| Analytics/aggregated data    | No restriction             | Same as primary        |

### 5.2 Geographic Distribution

| Component          | Primary Location       | Secondary Location     |
|--------------------|------------------------|------------------------|
| Frontend (SPA)     | Vercel Edge (global CDN)| Netlify CDN (global)   |
| Backend API        | AWS ME (Bahrain)       | Future: STC Cloud (KSA)|
| PostgreSQL         | AWS RDS (Bahrain)      | Read replica (same region) |
| Backups            | AWS S3 (Bahrain)       | Cross-region copy (future) |
| Monitoring         | Sentry (US/EU)         | --                     |

---

## 6. Minimum Viable Service (MVS)

If resources are constrained during a major incident, the following domains must be restored first:

### 6.1 Tier 1 -- Critical (Restore First)

| Domain           | Justification                                              |
|------------------|------------------------------------------------------------|
| Authentication   | Users cannot access any other domain without login         |
| Workshop         | Core business operation -- active repairs must not stall   |
| Finance          | ZATCA-compliant invoicing must continue, payments needed   |

### 6.2 Tier 2 -- Important (Restore Second)

| Domain           | Justification                                              |
|------------------|------------------------------------------------------------|
| Parts & Inventory| Repairs depend on parts availability                       |
| Registry         | Vehicle and customer lookup needed for new check-ins       |
| Administration   | Branch and user management for daily operations            |

### 6.3 Tier 3 -- Deferrable (Restore When Stable)

| Domain           | Justification                                              |
|------------------|------------------------------------------------------------|
| CRM & Marketing  | Can resume when core operations are stable                 |
| Reports & Analytics | Historical data is intact, reporting can be delayed     |
| Team & HR        | HR operations can wait for core service restoration        |
| Call Center      | Phone-based operations can use manual fallback             |
| Portals          | Customer self-service is a convenience, not critical       |
| AI Platform      | Enhancement layer, not operational dependency              |
| Accounting       | Can reconcile retroactively once Finance is restored       |

---

## 7. Communication Plan During Outage

### 7.1 Internal Communication

| Audience             | Channel              | Frequency During Outage |
|----------------------|----------------------|-------------------------|
| Response team        | Slack #salis-incidents | Real-time              |
| All engineering      | Slack #salis-dev     | Hourly updates          |
| PM and PO            | Phone + email        | Every 30 min (P1)       |
| Steering Committee   | Email                | Initial + hourly (P1)   |

### 7.2 External Communication

| Audience             | Channel              | Frequency During Outage |
|----------------------|----------------------|-------------------------|
| All customers        | Status page          | Updated every 30 min    |
| Enterprise customers | Direct phone/email   | Within 30 min of P1     |
| Affected customers   | In-app notification  | When service restored   |

---

## 8. DR Testing Schedule

| Test Type                    | Frequency   | Scope                                  | Duration  |
|------------------------------|-------------|----------------------------------------|-----------|
| Backup restore verification  | Monthly     | Restore latest backup to staging       | 2 hours   |
| Hosting failover drill       | Quarterly   | Switch from Vercel to Netlify and back | 1 hour    |
| Full DR simulation           | Bi-annually | Simulate database failure + recovery   | Half-day  |
| ZATCA resilience test        | Quarterly   | Simulate ZATCA API outage + recovery   | 2 hours   |
| Tabletop exercise            | Annually    | Walk through worst-case scenario       | Half-day  |

### 8.1 DR Test Acceptance Criteria

| Criterion                              | Target            |
|----------------------------------------|-------------------|
| Database restored within RTO           | < 4 hours         |
| Data loss within RPO                   | < 1 hour          |
| All Tier 1 domains operational         | Verified          |
| ZATCA hash chain integrity maintained  | Verified          |
| Tenant isolation confirmed post-restore| All org_ids tested|

---

## 9. Plan Maintenance

| Activity                          | Frequency   | Owner        |
|-----------------------------------|-------------|--------------|
| Review and update this document   | Quarterly   | DevOps + PM  |
| Update contact information        | Monthly     | PM           |
| Review vendor SLAs                | Annually    | PM           |
| Update recovery procedures        | After each DR test | DevOps  |
| Review data residency requirements| Annually    | Legal + PM   |

---

## 10. Related Documents

- [SLA Document](sla-document.md) -- RPO, RTO, and availability targets
- [Incident Response Plan](incident-response.md) -- Incident classification and playbooks
- [Procurement Management](../project-management/procurement-management.md) -- Vendor SLAs and contacts
- [Resource Management](../project-management/resource-management.md) -- Key personnel and bus factor
- [Governance Framework](../project-management/governance-framework.md) -- Escalation authority
