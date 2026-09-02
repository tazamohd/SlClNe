# SALIS AUTO -- Pre-Launch Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-010                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan defines the criteria, procedures, and runbook for launching
SALIS AUTO into production. It covers the complete path from launch
readiness assessment through pilot customer onboarding to general
availability, ensuring the platform's 13 domains, 191+ screens, 14 roles,
and 28 RBAC modules are production-ready with full ZATCA Phase 2
e-invoicing compliance.

### 1.1 Launch Definition

"Launch" means the first external tenant (pilot customer) begins using
SALIS AUTO for real workshop operations -- Check-In, Inspection, Estimate,
Repair, QC, and Delivery -- with live ZATCA invoice submission and live
Stripe payment processing in SAR.

---

## 2. Launch Criteria

All criteria in the following table must pass before the launch decision
gate. The CTO and Product Owner jointly sign off.

### 2.1 Technical Criteria

| ID    | Criterion                                    | Target            | Verified By    |
|-------|----------------------------------------------|--------------------|----------------|
| TC-01 | All P1 bugs resolved                         | 0 open P1          | QA Lead        |
| TC-02 | All P2 bugs resolved                         | 0 open P2          | QA Lead        |
| TC-03 | Test coverage (unit + integration)           | >80%               | CI pipeline    |
| TC-04 | Lighthouse performance score                 | >90 (mobile + desktop)| DevOps       |
| TC-05 | Load test passed                             | 100 concurrent users| QA Lead        |
| TC-06 | API response time p95                        | <500ms             | Load test report|
| TC-07 | Page load time (LCP)                         | <3 seconds         | Lighthouse     |
| TC-08 | Zero critical security vulnerabilities       | 0 critical/high    | Security audit |
| TC-09 | RTL/bilingual rendering verified             | All 191+ screens   | QA Lead        |
| TC-10 | Database migration scripts tested            | Pass on clean DB   | DBA            |

### 2.2 ZATCA Compliance Criteria

| ID    | Criterion                                    | Target             | Verified By    |
|-------|----------------------------------------------|--------------------|----------------|
| ZC-01 | Production certificate obtained (PCSID)      | Certificate active | DevOps         |
| ZC-02 | Test invoices validated in simulation         | 100 invoices, 0 errors | QA Lead    |
| ZC-03 | Hash chain integrity verified                | Full chain valid   | Automated check|
| ZC-04 | QR code TLV encoding verified                | Scanner-readable   | Manual test    |
| ZC-05 | Credit/debit notes validated                 | 20 notes, 0 errors | QA Lead        |
| ZC-06 | Offline queue tested (ZATCA downtime sim)    | Queue + retry works| QA Lead        |

### 2.3 Security Criteria

| ID    | Criterion                                    | Target             | Verified By    |
|-------|----------------------------------------------|--------------------|----------------|
| SC-01 | Penetration test completed                   | 0 critical/high findings | Security firm|
| SC-02 | OWASP ZAP automated scan                     | Clean (0 high alerts)    | DevOps       |
| SC-03 | SSL/TLS configured                           | A+ rating (SSL Labs)     | DevOps       |
| SC-04 | RBAC verified (14 roles, 28 modules)         | No privilege escalation  | QA Lead      |
| SC-05 | Rate limiting active                         | Configured per endpoint  | DevOps       |
| SC-06 | Secrets audit                                | No hardcoded secrets     | Code scan    |

### 2.4 Data Criteria

| ID    | Criterion                                    | Target             | Verified By    |
|-------|----------------------------------------------|--------------------|----------------|
| DC-01 | Migration scripts tested on production-like data | Pass           | DBA            |
| DC-02 | Rollback procedure verified                  | Successful rollback| DBA            |
| DC-03 | Backup/restore validated                     | RPO <1h achieved   | DevOps         |
| DC-04 | Seed data prepared (parts catalog, service types) | Complete      | Product Owner  |
| DC-05 | Multi-tenant isolation verified              | Tenant A cannot see Tenant B | QA Lead |

### 2.5 Documentation Criteria

| ID    | Criterion                                    | Target             | Verified By    |
|-------|----------------------------------------------|--------------------|----------------|
| DO-01 | User guides published (AR + EN)              | All 13 domains     | Technical Writer|
| DO-02 | Training completed for pilot users           | All pilot staff    | Training Lead  |
| DO-03 | API documentation current                    | OpenAPI spec synced| Dev Lead       |
| DO-04 | Runbooks published                           | Incident, deploy, rollback | DevOps  |
| DO-05 | Support knowledge base seeded                | Top 50 FAQ articles| Support Lead   |

---

## 3. Environment Readiness Checklist

### 3.1 Production Infrastructure

| Item                        | Status | Owner    | Notes                          |
|-----------------------------|--------|----------|--------------------------------|
| Application servers provisioned | [ ] | DevOps  | 2x app servers, auto-scaling   |
| PostgreSQL database setup   | [ ]    | DBA      | Primary + read replica         |
| Redis cache configured      | [ ]    | DevOps   | Session store + job queue      |
| CDN configured              | [ ]    | DevOps   | Static assets, AR/EN bundles   |
| DNS records created         | [ ]    | DevOps   | A, CNAME, MX, TXT (SPF/DKIM)  |
| SSL certificates installed  | [ ]    | DevOps   | Let's Encrypt, auto-renewal   |
| Environment variables set   | [ ]    | DevOps   | Production secrets loaded      |
| File storage configured     | [ ]    | DevOps   | S3-compatible, tenant-scoped   |

### 3.2 Monitoring

| Item                        | Status | Owner    | Notes                          |
|-----------------------------|--------|----------|--------------------------------|
| Error tracking (Sentry)     | [ ]    | DevOps   | Source maps uploaded            |
| APM configured              | [ ]    | DevOps   | Traces for all API routes      |
| Uptime monitoring           | [ ]    | DevOps   | 1-minute intervals, 3 regions  |
| Log aggregation             | [ ]    | DevOps   | Structured JSON, 30-day retain |
| Alerting rules configured   | [ ]    | DevOps   | P1→PagerDuty, P2→Slack         |
| ZATCA submission dashboard  | [ ]    | DevOps   | Success/failure/queue depth    |

### 3.3 Security

| Item                        | Status | Owner    | Notes                          |
|-----------------------------|--------|----------|--------------------------------|
| WAF rules configured        | [ ]    | DevOps   | OWASP Core Rule Set            |
| Rate limiting active        | [ ]    | DevOps   | Per-IP and per-tenant          |
| DDoS protection enabled     | [ ]    | DevOps   | Cloud provider L3/L4 + L7     |
| Certificate rotation        | [ ]    | DevOps   | Automated via certbot          |
| CORS policy locked          | [ ]    | Dev Lead | Allowed origins whitelist      |

### 3.4 Backup

| Item                        | Status | Owner    | Notes                          |
|-----------------------------|--------|----------|--------------------------------|
| Automated daily backups     | [ ]    | DBA      | PostgreSQL pg_dump, 04:00 AST  |
| Point-in-time recovery      | [ ]    | DBA      | WAL archiving, RPO <1h        |
| Restore procedure tested    | [ ]    | DBA      | Documented, timed (<30 min)    |
| Off-site replication        | [ ]    | DevOps   | Cross-region, encrypted        |
| Backup monitoring           | [ ]    | DevOps   | Alert on missed backup         |

---

## 4. Pilot Customer Program

### 4.1 Pilot Selection Criteria

Target: 2-3 workshops in Riyadh for the initial pilot.

| Criterion                   | Requirement                               |
|-----------------------------|-------------------------------------------|
| Location                    | Riyadh (for in-person support)            |
| Workshop size               | 3-10 service bays                         |
| Tech readiness              | Staff comfortable with tablets/computers  |
| Current system              | Paper-based or basic Excel (easy migration)|
| Feedback willingness        | Committed to daily feedback sessions      |
| ZATCA registration          | Active VAT registration (15% VAT)        |
| Services offered            | General repair + maintenance (broad test) |

### 4.2 Pilot Agreement Terms

- Duration: 2 weeks (extendable to 4 weeks if needed)
- Pricing: free during pilot period
- Support: dedicated SALIS AUTO engineer on-site for Week 1
- Data: pilot data is production data (not discarded after pilot)
- Feedback: structured daily feedback form + weekly interview
- Exit clause: workshop may exit pilot at any time with data export

### 4.3 Pilot Program Schedule

**Week 1: Supervised Onboarding**

| Day   | Activity                                              |
|-------|-------------------------------------------------------|
| Day 1 | Workshop setup: tenant creation, user accounts (all 14 roles as applicable), branding |
| Day 1 | Data entry: parts catalog, service types, pricing     |
| Day 2 | Training: Check-In and Inspection modules             |
| Day 2 | Live Check-In of 2-3 vehicles with SALIS engineer     |
| Day 3 | Training: Estimate and Repair modules                 |
| Day 3 | First estimate created and sent to customer            |
| Day 4 | Training: QC, Delivery, and Invoicing modules         |
| Day 4 | First ZATCA-compliant invoice submitted (live)        |
| Day 5 | Training: Inventory, reporting, and admin modules     |
| Day 5 | Full cycle: Check-In → Delivery completed independently|
| Daily | 15-minute check-in call at end of day                 |

**Week 2: Independent Operation**

| Day    | Activity                                             |
|--------|------------------------------------------------------|
| Day 6-10 | Workshop operates independently with SALIS AUTO   |
| Day 6-10 | SALIS engineer available remotely (not on-site)    |
| Day 8  | Mid-week feedback interview (30 min)                 |
| Day 10 | Final feedback interview + satisfaction survey        |
| Day 10 | Bug triage: all reported issues classified P1-P4     |
| Daily  | Performance monitoring review (response times, errors)|

### 4.4 Pilot Success Criteria

| Metric                          | Target                       |
|---------------------------------|------------------------------|
| User satisfaction score         | ≥90% (survey average)        |
| P3 or higher bugs discovered    | <5                           |
| Data integrity issues           | 0                            |
| ZATCA submission success rate   | 100%                         |
| Average page load time          | <3 seconds                   |
| Complete workshop cycles        | ≥50 (Check-In → Delivery)   |
| Payment processing success      | 100% of attempted payments   |

---

## 5. Launch Day Runbook

### 5.1 T-7 Days: Final Validation

| Task                                    | Owner     | Duration  |
|-----------------------------------------|-----------|-----------|
| Full regression test suite              | QA Lead   | 2 days    |
| Load test (100 concurrent users)        | QA Lead   | 4 hours   |
| ZATCA production validation (10 invoices)| Dev Lead | 2 hours   |
| Security scan (OWASP ZAP)              | DevOps    | 1 hour    |
| Launch criteria checklist review        | CTO       | 1 hour    |
| Go/no-go decision meeting              | All leads | 1 hour    |

### 5.2 T-3 Days: Production Deployment

| Task                                    | Owner     | Duration  |
|-----------------------------------------|-----------|-----------|
| Production deployment (blue-green)      | DevOps    | 2 hours   |
| Smoke tests on production               | QA Lead   | 2 hours   |
| Monitoring verification                 | DevOps    | 1 hour    |
| ZATCA production certificate verified   | Dev Lead  | 30 min    |
| Stripe production mode activated        | Dev Lead  | 30 min    |
| Backup verification                     | DBA       | 1 hour    |

### 5.3 T-1 Day: Team Preparation

| Task                                    | Owner     | Duration  |
|-----------------------------------------|-----------|-----------|
| Team briefing (all hands)               | PM        | 1 hour    |
| War room setup (virtual + physical)     | PM        | 30 min    |
| Escalation contacts confirmed           | PM        | 15 min    |
| On-call schedule confirmed              | DevOps    | 15 min    |
| Customer communication drafted          | Marketing | 1 hour    |
| Rollback procedure walkthrough          | DevOps    | 30 min    |

### 5.4 T-0: Go-Live

| Time (AST) | Task                                     | Owner     |
|------------|------------------------------------------|-----------|
| 06:00      | Final production health check            | DevOps    |
| 07:00      | DNS switch (if applicable)               | DevOps    |
| 07:30      | Smoke test on live URL                   | QA Lead   |
| 08:00      | Go-live announcement to pilot customers  | PM        |
| 08:00      | L1 support team on standby              | Support   |
| 08:00-20:00| Real-time monitoring (war room active)   | All leads |
| 12:00      | Mid-day status check                     | PM        |
| 20:00      | End-of-day review                        | PM + CTO  |

### 5.5 T+1 Day: Post-Launch Review

| Task                                    | Owner     |
|-----------------------------------------|-----------|
| Post-launch review meeting              | PM        |
| Hot-fix triage (if any issues found)    | Dev Lead  |
| Customer feedback collection call       | PM        |
| Performance metrics review              | DevOps    |
| ZATCA submission audit                  | Dev Lead  |

### 5.6 T+7 Days: Stability Assessment

| Task                                    | Owner     |
|-----------------------------------------|-----------|
| 7-day stability report                  | DevOps    |
| Customer satisfaction survey results    | PM        |
| Bug backlog review                      | QA Lead   |
| Pilot expansion decision               | CTO + PM  |
| Capacity utilization review             | DevOps    |

---

## 6. Rollback Plan

### 6.1 Rollback Decision Criteria

A rollback is initiated if any of the following occur within the first
48 hours of launch:

| Condition                                   | Decision Maker |
|---------------------------------------------|----------------|
| Data corruption or data loss detected       | CTO (immediate)|
| ZATCA invoices failing >50% of submissions  | CTO            |
| Payment processing completely down          | CTO            |
| System unavailable >30 minutes              | CTO            |
| Critical security vulnerability exploited   | CTO (immediate)|
| Pilot customer requests rollback            | PM + CTO       |

### 6.2 Rollback Procedure

**Target: 15-minute RTO (Recovery Time Objective)**

| Step | Action                                        | Duration | Owner   |
|------|-----------------------------------------------|----------|---------|
| 1    | Decision to rollback confirmed (verbal + Slack)| 1 min   | CTO     |
| 2    | DNS switch to maintenance page                | 2 min    | DevOps  |
| 3    | Database restore from pre-launch snapshot     | 5 min    | DBA     |
| 4    | Deploy previous application version           | 3 min    | DevOps  |
| 5    | Smoke test on restored environment            | 2 min    | QA Lead |
| 6    | DNS switch back to application                | 2 min    | DevOps  |
| 7    | Customer notification sent                    | 5 min    | PM      |

### 6.3 Communication Template (Rollback)

> Subject: SALIS AUTO -- Temporary Service Update
>
> Dear [Workshop Name],
>
> We have temporarily paused the SALIS AUTO platform to address a
> technical issue. Your data is safe and no action is required from you.
>
> We will notify you when the platform is back online. In the meantime,
> please use your previous process for any urgent workshop operations.
>
> We apologize for the inconvenience and appreciate your patience.
>
> -- SALIS AUTO Support Team

---

## 7. Stakeholder Communication

### 7.1 Internal Communication

| Audience          | Channel        | Timing                    | Content              |
|-------------------|----------------|---------------------------|----------------------|
| Engineering team  | Slack #launch  | T-7 through T+7          | Technical updates    |
| Leadership        | Email + Meeting| T-7, T-0, T+1, T+7      | Status reports       |
| Support team      | Training session| T-3                      | Escalation procedures|
| All staff         | All-hands      | T-0                       | Launch announcement  |

### 7.2 External Communication

| Audience          | Channel        | Timing                    | Content              |
|-------------------|----------------|---------------------------|----------------------|
| Pilot customers   | WhatsApp + Email| T-1 (reminder), T-0 (live)| Onboarding details  |
| Prospective leads | Email campaign  | T+7 (if pilot succeeds)  | Product announcement |
| Industry press    | Press release   | T+14                     | Launch announcement  |
| Social media      | LinkedIn, X     | T-0, T+7                 | Updates              |

### 7.3 Launch Announcement Template

> SALIS AUTO is live -- the intelligent workshop management platform
> built for Saudi Arabia.
>
> Purpose-built for the Kingdom's automotive workshops with ZATCA Phase 2
> e-invoicing compliance, bilingual Arabic/English interface, and
> complete workshop lifecycle management from Check-In to Delivery.
>
> Contact us at [email] to schedule a demo.

---

## 8. Post-Launch Roadmap

| Phase             | Timeline         | Focus                               |
|-------------------|------------------|--------------------------------------|
| Pilot (2-3 shops) | Weeks 1-2       | Stability, feedback, bug fixes       |
| Controlled rollout| Weeks 3-6        | 10-15 workshops, feature polish      |
| General availability| Weeks 7-12     | Open registration, marketing push    |
| Scale             | Months 4-6       | 50 tenants target, performance tuning|

---

## 9. Cross-References

| Document                                | Relevance                         |
|-----------------------------------------|-----------------------------------|
| [Deployment Plan](deployment-plan.md)   | Infrastructure and CI/CD pipeline |
| [Capacity & Rollback Plan](capacity-rollback-plan.md) | Scaling and recovery |
| [Release Plan](release-plan.md)         | Sprint cadence and release gates  |
| [Training & Rollout Plan](training-rollout-plan.md)   | User training program |
| [Integration Management Plan](integration-management-plan.md) | ZATCA + Stripe readiness |
| [Operations Management Plan](operations-management-plan.md) | Post-launch operations |

---

## 10. Revision History

| Version | Date       | Author          | Changes                          |
|---------|------------|-----------------|----------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO  | Initial release                  |
