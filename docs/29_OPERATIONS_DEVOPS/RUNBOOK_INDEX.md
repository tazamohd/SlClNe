**Status:** NORMATIVE · **Owner:** Operations architect

# Runbook index

An index of the operational procedures that exist in this repository today, and an explicit statement of the ones that do not. This is a map, not a procedure: nothing here restates or replaces the documents it points to, and the existing runbooks are not modified by it.

Every runbook listed below is **written but unexecuted**. This workspace has no production deployment, so no procedure here has been run against a live system, no timing in them has been observed, and the trigger thresholds several of them fire on cannot currently be detected by anything — see `docs/29_OPERATIONS_DEVOPS/OBSERVABILITY.md`. Several also reference monitoring and paging tools (an APM dashboard, an error tracker, an uptime monitor, a paging service) that are **not present in this repository in any form**. Treat those references as intended tooling.

---

## 1. Incident runbooks — `docs/system/runbooks/`

All six carry a document id, version 1.0, date 2026-09-02 and status Approved, and follow the same structure: trigger conditions, prerequisites, procedure, verification, rollback, escalation, related documents.

| ID | Runbook | What it covers |
| --- | --- | --- |
| SA-RUN-001 | [database-failover.md](../system/runbooks/database-failover.md) | Promoting a standby when the primary is unresponsive, replication lag exceeds the stated threshold, `/ready` fails repeatedly, or the connection pool is exhausted; verification and fallback. |
| SA-RUN-002 | [certificate-renewal.md](../system/runbooks/certificate-renewal.md) | Renewing the ZATCA X.509 invoice-signing certificate and the TLS certificate, including post-compromise re-issue; two separate procedures with their own verification and rollback. |
| SA-RUN-003 | [data-export-deletion.md](../system/runbooks/data-export-deletion.md) | PDPL data-subject export (Art. 8), erasure (Art. 9), portability, regulatory inquiry and tenant offboarding; the only genuine service-request procedure written down anywhere in this repository. |
| SA-RUN-004 | [performance-degradation.md](../system/runbooks/performance-degradation.md) | Diagnosis and response when API latency, page load, error rate, query time, pool utilisation or resource usage breaches its stated threshold. |
| SA-RUN-005 | [security-breach-response.md](../system/runbooks/security-breach-response.md) | Containment, eradication and recovery for unauthorised access, data exfiltration, credential compromise, cross-tenant access, audit-log tampering attempts and third-party breach notification; includes a post-incident section. |
| SA-RUN-006 | [deployment-rollback.md](../system/runbooks/deployment-rollback.md) | Reverting a deployment after post-deployment errors, failed health checks, compliance or authentication breakage, data-integrity issues or a performance regression; includes post-rollback actions. |

## 2. Operations references — `docs/system/operations/`

These are reference documents rather than step-by-step runbooks; they describe how a subsystem works and what commands exist, not what to do when a pager fires.

| ID | Document | What it covers |
| --- | --- | --- |
| SYS-OPS-001 | [devops-guide.md](../system/operations/devops-guide.md) | Repository layout, the frontend and backend build, the CI/CD pipeline, database operations, the two health probes and their orchestrator mapping, rate limiting, logging and security headers. |
| SYS-OPS-002 | [monitoring-logging.md](../system/operations/monitoring-logging.md) | Logger configuration and redaction, request logging, error classification, the audit trail as a monitoring surface, health monitoring and segregation-of-duties monitoring. |
| SYS-OPS-003 | [backup-recovery.md](../system/operations/backup-recovery.md) | Data tiers and recovery sources, PostgreSQL backup methods with a recommended schedule and retention, multi-tenant backup constraints, backup verification, disaster-recovery scenarios, secret recovery and development-environment recovery. |
| SYS-OPS-004 | [environment-setup.md](../system/operations/environment-setup.md) | The complete environment-variable reference for server and frontend, env-file management, development setup, production configuration and an environment comparison. |

## 3. Plan-level documents — `docs/system/`

Not runbooks; they are the policy layer the runbooks execute under.

| Document | What it covers |
| --- | --- |
| [incident-response.md](../system/incident-response.md) | Incident classification and severity, response playbooks, on-call rotation design, incident commander role, post-mortem process, recovery procedures, communication plan, incident metrics definitions. |
| [business-continuity.md](../system/business-continuity.md) | Recovery objectives, risk scenarios and recovery strategies, backup policy, geographic redundancy, minimum viable service, outage communication, a DR testing schedule and plan maintenance. |
| [sla-document.md](../system/sla-document.md) | Availability commitment, performance targets, support tiers, incident response times, maintenance windows, data retention, breach and credit terms, exclusions and review cadence. The only place quantified targets are stated. |

---

## 4. Required but missing

Assessed against the ten procedures an operations function needs before it can run this system. "Partially covered" means a document explains the mechanism but no procedure exists that an operator could follow under pressure at 3am.

| Required runbook | Status | What exists | What is missing |
| --- | --- | --- | --- |
| Service startup | **Partially covered** | `operations/devops-guide.md` §4 gives the backend run commands; `operations/environment-setup.md` §5 covers development setup; `docker-compose.yml` starts the frontend container. | No production start sequence: order of database, migration and API start, readiness confirmation, or what to check before declaring the service up. |
| Service shutdown | **MISSING** | Nothing. | No graceful shutdown procedure, no drain step, no in-flight request or transaction handling, no planned-maintenance sequence. |
| Health check | **Covered as reference, not as a runbook** | `operations/devops-guide.md` §7 and `operations/monitoring-logging.md` §5 document `/health` and `/ready` precisely, including the orchestrator field each maps to. | No procedure for what to do when a probe fails — the response is split across the failover, performance and rollback runbooks with no entry point that starts from the failing probe. |
| Deployment (forward) | **Partially covered** | `operations/devops-guide.md` §5 documents the CI/CD pipeline; the workflows themselves are the executable procedure for the frontend. | No deployment runbook at all for the API or the database, because no deployment path for either exists (`.dockerignore` excludes `server/`; no workflow deploys it). No pre-deployment checklist, no cutover, no post-deployment verification other than by rollback. |
| Database migration | **Partially covered** | `server/scripts/migrate.ts` is the mechanism (`npm run db:migrate`, `db:reset`), and `operations/devops-guide.md` §6 describes it. | No production migration procedure: no pre-migration backup step, no maintenance window, no forward-only versus reversible policy, no verification, and **no rollback procedure for a migration** — the SQL migrations in `server/drizzle/` have no down scripts. |
| Backup | **Partially covered — design only** | `operations/backup-recovery.md` §3 recommends methods, schedule and retention. | Nothing is configured. No backup job, no storage target, no encryption or retention enforcement exists in this repository, and no backup has been taken. The recommendation is not a procedure. |
| Restore | **Partially covered — design only** | `operations/backup-recovery.md` §4 and `business-continuity.md` §3 give recovery scenarios at outline level. | No step-by-step restore procedure, no verification criteria beyond "run the readiness probe", and no drill has ever been performed. `project-control/RELEASE_GATES.json` records gate RB-12 (backup restore drill) as UNCHECKABLE for exactly this reason. |
| Payment failure | **MISSING and not currently actionable** | `docs/system/integration/payment-gateway.md` describes an intended integration. | No payment gateway is integrated: no client, no credential name in `server/.env.example`, no webhook route, no reconciliation job. A payment-failure runbook cannot be written against a gateway that does not exist. The prerequisite is the integration, not the document. |
| Integration failure | **MISSING** | The only integration adapter that exists is the OBD bridge (`server/src/integrations/obd.ts`), which defaults to `unconfigured` and refuses with 503 naming the missing credentials rather than fabricating a result. `GET /api/v1/diagnostics/integrations` reports live status. | No procedure for diagnosing or responding to an integration outage, no dependency-failure decision tree, no degraded-mode definition per integration. |
| Disaster recovery | **Partially covered** | `business-continuity.md` §3–§6 and `operations/backup-recovery.md` §4 define scenarios, objectives and minimum viable service; `runbooks/database-failover.md` covers the single most likely component failure. | No end-to-end DR procedure — region loss, rebuild-from-nothing, DNS cutover, order of service restoration, declaration and stand-down authority. The DR testing schedule in the continuity plan has never been executed. |

### Additional gaps worth naming

| Gap | Detail |
| --- | --- |
| Tenant onboarding and offboarding | Offboarding data handling is covered by SA-RUN-003. There is no onboarding procedure for creating an organisation, its branches, its first owner account and its seed configuration. |
| Secret rotation | `operations/backup-recovery.md` §6 covers secret recovery; no rotation procedure exists for `JWT_SECRET`, database credentials or the FTP deployment credentials, even though `project-control/RISK_REGISTER.json` R-03 records exposed credentials as a live risk and release gate RB-10 is FAIL on it. |
| On-call | `incident-response.md` §4 designs a rotation. No rotation, schedule or escalation contact exists. This document names no individuals and none should be added here; the rotation belongs in the operating organisation, not in the repository. |

---

## 5. Known drift between these documents and the code

Recorded so a reader does not follow a stale instruction. These are observations, not corrections — the referenced documents are not edited by this index.

| Where | Drift |
| --- | --- |
| `operations/devops-guide.md` §4.2 | Gives `npm run build` then `npm start` for the server. `server/package.json` has **no `build` script**; `start` is `tsx src/index.ts`, which runs TypeScript directly rather than compiled output. |
| `operations/devops-guide.md` §4.1 | States that PGlite provides the development database. `server/package.json` depends on the `postgres` driver only; there is no PGlite dependency. ADR-002 records the intent, not the current state. |
| `operations/devops-guide.md` §6.1 | Says RLS covers 53 tenant tables. The generated `docs/19_SECURITY/TENANT_ISOLATION.md` reports 64 tables with RLS, 63 of them tenant-scoped. Prefer the generated document; it is derived from the migrations. |
| Several runbooks' trigger conditions | Fire on alerts from an APM dashboard, an error tracker, an uptime monitor and a paging service. None of these exist in this repository, so those triggers cannot currently fire. |

## 6. Related documents

| Document | Relationship |
| --- | --- |
| `docs/29_OPERATIONS_DEVOPS/ENVIRONMENTS_AND_DEPLOYMENT.md` | What the repository actually configures, which bounds what a runbook can act on. |
| `docs/29_OPERATIONS_DEVOPS/OBSERVABILITY.md` | Why most trigger conditions above are not currently detectable. |
| `docs/28_ITIL_SERVICE_MANAGEMENT/SERVICE_MANAGEMENT_MODEL.md` | The practice each runbook belongs to, and its CURRENT or TARGET state. |
