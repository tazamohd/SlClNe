# SALIS AUTO -- Security Breach Response

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-005                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following events are detected:

1. **Unauthorized access** -- login from unrecognized location/device, privilege escalation, or access to resources outside assigned RBAC scope
2. **Data exfiltration alert** -- abnormal data export volume, bulk API reads exceeding normal patterns, or CSV export requests outside business hours
3. **Credential compromise** -- leaked JWT secret, exposed `DATABASE_URL`, compromised user credentials, or stolen refresh tokens
4. **Vulnerability exploitation** -- evidence of SQL injection attempts, XSS payloads reaching the server, or RLS bypass attempts
5. **Malware or ransomware** -- suspicious processes on application or database servers
6. **Cross-tenant data access** -- any evidence that one tenant's data was accessible to another tenant (RLS failure)
7. **ZATCA certificate compromise** -- private signing key exposure
8. **Audit log tampering attempt** -- any attempt to UPDATE or DELETE rows in the `audit_log` table (trigger-blocked but logged)
9. **Third-party breach notification** -- ZATCA, Stripe, SMS provider, or hosting provider reports a breach affecting our integration

---

## Prerequisites

| Requirement                  | Details                                                         |
|------------------------------|-----------------------------------------------------------------|
| Security team access         | Tech Lead (mandatory Incident Commander for security incidents) |
| Forensics tools              | Log aggregation access, database audit queries, network capture |
| PDPL breach notification     | Template for SDAIA notification (72-hour deadline)              |
| Legal counsel contact        | Available for breach assessment and regulatory obligations      |
| Backup verification          | Latest clean backup confirmed (per [Backup and Recovery](../operations/backup-recovery.md)) |
| Communication templates      | Customer notification templates in Arabic and English           |
| Evidence storage             | Secure, write-once storage for forensic evidence                |
| On-call roster               | Current on-call engineer, DBA, and CTO contact information      |

---

## Procedure

### Phase 1: Contain

The goal of containment is to stop the breach from spreading. Act within the first 15 minutes.

**Step 1.** Assign the Tech Lead as Incident Commander (mandatory for all security incidents, per [Incident Response Plan](../incident-response.md)).

**Step 2.** Open a secure incident channel (not the public #incidents Slack channel). Limit access to the response team only.

**Step 3.** Identify the attack vector and isolate affected systems.

| Attack Vector                | Containment Action                                          |
|------------------------------|-------------------------------------------------------------|
| Compromised user account     | Disable the user account, revoke all refresh tokens         |
| Compromised JWT_SECRET       | Rotate `JWT_SECRET` immediately (invalidates all sessions)  |
| Compromised DATABASE_URL     | Rotate database credentials, restrict network access        |
| Compromised API key (ZATCA)  | Revoke and regenerate ZATCA credentials                     |
| Compromised server           | Isolate the server from the network, do not shut down       |
| RLS bypass                   | Take the application offline immediately                    |
| SQL injection                | Block the attacking IP, take affected endpoint offline       |

**Step 4.** Revoke compromised credentials.

```bash
# Rotate JWT_SECRET (invalidates ALL active sessions -- all users must re-login)
# Update in secrets manager, then restart:
pm2 restart salis-api
# or
kubectl rollout restart deployment salis-api

# Revoke specific user's refresh tokens
psql "$DATABASE_URL" -c "
  DELETE FROM refresh_tokens
  WHERE user_id = 'COMPROMISED_USER_ID';
"

# If database credentials compromised, rotate the password
psql -U postgres -c "
  ALTER USER salis_app PASSWORD 'NEW_SECURE_PASSWORD';
"
# Then update DATABASE_URL in secrets manager and restart
```

**Step 5.** If a cross-tenant breach is suspected, verify RLS is enforced.

```sql
-- Verify RLS is enabled and forced on all tenant tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'customers', 'vehicles', 'job_cards', 'invoices',
    'payments', 'estimates', 'parts', 'employees',
    'feedback', 'audit_log'
  );
```

All must show `rowsecurity = t`. If any show `f`, this is a critical RLS failure -- take the application offline immediately.

**Step 6.** Isolate the affected tenant(s) if the breach is tenant-specific.

```sql
-- Identify which org_id(s) are affected
SELECT DISTINCT org_id FROM audit_log
WHERE actor_id = 'SUSPICIOUS_USER_ID'
  AND created_at > 'BREACH_START_TIME'
ORDER BY org_id;
```

### Phase 2: Assess

Determine the scope, affected data, and impacted tenants. This phase should begin within 30 minutes and complete within 4 hours.

**Step 7.** Collect the forensic timeline from the audit log.

```sql
-- All actions by the suspected compromised account
SELECT id, action, collection, record_id, created_at,
       payload->>'ip' AS source_ip
FROM audit_log
WHERE actor_id = 'SUSPICIOUS_USER_ID'
  AND created_at BETWEEN 'BREACH_START_TIME' AND 'BREACH_END_TIME'
ORDER BY created_at;
```

**Step 8.** Check for data export activity.

```sql
-- Audit log entries for export actions
SELECT * FROM audit_log
WHERE action = 'export'
  AND created_at > 'BREACH_START_TIME'
ORDER BY created_at;
```

Also check application access logs for export endpoint hits:

```bash
grep "GET.*export" /var/log/salis/access.log \
  | grep -v "200" | tail -50
```

**Step 9.** Assess cross-tenant data exposure.

```sql
-- Check if any queries returned data from multiple orgs
-- This should never happen due to RLS, but verify:
SELECT DISTINCT org_id, COUNT(*) AS access_count
FROM audit_log
WHERE actor_id = 'SUSPICIOUS_USER_ID'
  AND created_at > 'BREACH_START_TIME'
GROUP BY org_id;
```

If more than one `org_id` appears for a single user, there is a confirmed cross-tenant breach.

**Step 10.** Classify the breached data by sensitivity tier (per [Data Protection](../security/data-protection.md)):

| Tier         | Data Types                                   | PDPL Notification Required |
|--------------|----------------------------------------------|----------------------------|
| Critical     | Passwords, tokens, JWT secrets               | Yes -- immediate           |
| Sensitive    | Salaries, P&L figures, cost margins          | Yes                        |
| Personal     | Customer names, phones, emails, VAT numbers  | Yes                        |
| Business     | Invoices, job cards, estimates               | Depends on content         |

**Step 11.** Document the impact assessment.

```
Breach Assessment
=================
Incident ID:        SEC-YYYY-NNN
Detection time:     YYYY-MM-DD HH:MM AST
Containment time:   YYYY-MM-DD HH:MM AST
Attack vector:      [description]
Tenants affected:   [All / specific org_ids]
Users affected:     [count]
Data types exposed: [list per sensitivity tier]
Data volume:        [record count / size estimate]
Regulatory impact:  [PDPL / ZATCA / both / neither]
```

### Phase 3: Eradicate

Remove the root cause and ensure the vulnerability cannot be re-exploited.

**Step 12.** Patch the vulnerability.

| Root Cause                  | Eradication Action                                         |
|-----------------------------|------------------------------------------------------------|
| Application vulnerability   | Deploy hot-fix, update dependency, add input validation    |
| Misconfigured RLS           | Reapply RLS policies from `server/drizzle/0001_rls.sql`    |
| Weak credentials            | Force password reset for affected users, enforce complexity|
| Third-party compromise      | Rotate integration keys, update to patched version         |
| Server compromise           | Rebuild from clean image, restore from verified backup     |

**Step 13.** Rotate all credentials that may have been exposed.

```bash
# Checklist of credentials to rotate:
# [ ] JWT_SECRET (invalidates all user sessions)
# [ ] DATABASE_URL (database password)
# [ ] ZATCA API credentials
# [ ] SMS_GATEWAY_KEY
# [ ] WHATSAPP_API_KEY
# [ ] Any user accounts that were compromised
```

See the [Backup and Recovery](../operations/backup-recovery.md) secret recovery table for rotation impacts.

**Step 14.** If the server was compromised, rebuild from a clean state.

1. Provision a new server instance from a known-clean image.
2. Deploy the application from the Git repository (verified commit).
3. Restore the database from a backup taken before the breach window.
4. Apply any migrations that post-date the backup.
5. Update DNS and load balancer to point to the new instance.

### Phase 4: Recover

Restore normal operations.

**Step 15.** Restore services in order:
1. Database (from clean backup if needed)
2. Backend API
3. Frontend (redeploy if static assets were affected)
4. Third-party integrations (ZATCA, Stripe, SMS)

**Step 16.** Run the full verification checklist.

```bash
# Health check
curl -s https://api.salisauto.com/health | jq .

# Readiness check
curl -s https://api.salisauto.com/ready | jq .
```

**Step 17.** Verify data integrity post-recovery.

```sql
-- Audit log integrity (append-only trigger)
UPDATE audit_log SET action = 'test' WHERE id = 'nonexistent';
-- Should fail with trigger error

-- RLS policies active on all 53 tenant tables
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Must equal 53

-- Invoice hash chain integrity
SELECT org_id, COUNT(*) AS total,
       COUNT(hash_self) AS hashed
FROM invoices WHERE issued_at IS NOT NULL
GROUP BY org_id
HAVING COUNT(*) != COUNT(hash_self);
-- Should return zero rows

-- Money column integrity
SELECT COUNT(*) FROM invoices
WHERE total_halalas != FLOOR(total_halalas);
-- Should return 0
```

### Phase 5: PDPL Breach Notification

**Step 18.** If personal data was exposed, prepare the SDAIA notification within 72 hours.

```
PDPL BREACH NOTIFICATION TO SDAIA
===================================
Organization:     SALIS AUTO
Contact:          [DPO name and contact]
Date of breach:   YYYY-MM-DD
Date of discovery: YYYY-MM-DD

Nature of breach: [description]
Data categories:  [personal data types affected]
Data subjects:    [approximate number]
Geographic scope: [Saudi Arabia]

Measures taken:   [containment and eradication steps]
Mitigation:       [steps to reduce harm to data subjects]

Recommended actions for data subjects: [password reset, monitoring, etc.]
```

**Step 19.** Notify affected data subjects. Use bilingual (AR/EN) notification per the [Communication Plan](../incident-response.md#8-communication-plan).

```
Subject: [SALIS AUTO] Important Security Notice

We are writing to inform you of a security incident that may have
affected your personal data.

What happened: [brief description]
What data was involved: [specific data types]
What we are doing: [remediation steps]
What you should do: [recommended actions]

Contact: [DPO contact information]
```

**Step 20.** If ZATCA data was affected, notify ZATCA through the developer portal and assess the impact on invoice integrity.

### Phase 6: Evidence Preservation

**Step 21.** Preserve all evidence before any cleanup.

| Evidence Type          | Collection Method                         | Storage             |
|------------------------|-------------------------------------------|----------------------|
| Application logs       | Export from cloud logging (full time range)| Write-once storage   |
| Database audit log     | `pg_dump` of `audit_log` table            | Write-once storage   |
| Network logs           | Export from firewall / load balancer       | Write-once storage   |
| Server state           | Forensic image (if server compromised)    | Write-once storage   |
| Access logs            | Export from web server / reverse proxy    | Write-once storage   |
| Screenshots            | Portal access logs, monitoring dashboards | Write-once storage   |

**Step 22.** Maintain chain of custody documentation.

```
Evidence Chain of Custody
==========================
Evidence ID:     EVD-SEC-YYYY-NNN-001
Description:     [what was collected]
Collected by:    [name]
Collection time: YYYY-MM-DD HH:MM AST
Storage location:[path or reference]
Hash (SHA-256):  [hash of the collected file]
```

---

## Verification

| Check                              | Method                                   | Expected Result              |
|------------------------------------|------------------------------------------|------------------------------|
| Vulnerability patched              | Reproduce original attack vector         | Attack fails                 |
| Credentials rotated                | Attempt login with old credentials       | Authentication fails         |
| RLS enforced on all tenant tables  | `pg_tables` query                        | All 53 tables have RLS = true|
| Audit log immutable                | UPDATE attempt on `audit_log`            | Trigger error                |
| Application healthy                | `GET /health` + `GET /ready`             | Both return 200              |
| Error rate normal                  | Sentry dashboard                         | < 0.1%                       |
| ZATCA submission functional        | Issue test invoice                       | Hash chain and QR generated  |
| No unauthorized access continuing  | Monitor audit log for suspicious activity| Clean for 24+ hours          |
| Evidence preserved                 | Verify SHA-256 hashes of collected files | All match                    |
| PDPL notification sent (if needed) | Confirmation from SDAIA                  | Acknowledgement received     |

---

## Rollback

Security breach response does not have a traditional rollback. If recovery actions cause service disruption:

1. **Database restored from wrong backup** -- identify the correct pre-breach backup and re-restore. Assess data loss against RPO target (< 1 hour).
2. **JWT_SECRET rotation caused mass logout** -- this is expected behavior. Communicate to users that re-login is required for security purposes.
3. **Overly aggressive containment** (e.g., taking the entire platform offline for a single-tenant breach) -- restore service to unaffected tenants while keeping the affected tenant isolated.
4. **False positive** -- if investigation determines no breach occurred, document the finding, restore any disabled accounts or revoked credentials, and update detection rules to reduce false positives.

---

## Escalation

| Condition                                      | Escalate To               | Method          | Timeframe     |
|------------------------------------------------|---------------------------|-----------------|---------------|
| Any confirmed security incident                | Tech Lead (IC mandatory)  | Phone + Slack   | Immediate     |
| Confirmed data breach (personal data exposed)  | CTO + DPO + Legal Counsel | Phone           | Within 15 min |
| Cross-tenant data exposure                     | CTO (may require platform shutdown) | Phone  | Immediate     |
| PDPL notification deadline approaching (60h)   | Legal Counsel + DPO       | Email + phone   | Immediate     |
| ZATCA certificate or data compromised          | Sr. Backend Dev 2 + ZATCA | Portal + phone  | Within 1 hour |
| Ransomware or server compromise                | CTO + Cloud provider      | Phone + ticket  | Immediate     |
| Law enforcement involvement needed             | Legal Counsel + CTO       | Phone           | Within 1 hour |
| Third-party integration breach (Stripe, etc.)  | CTO + Vendor support      | Vendor channels | Within 1 hour |

---

## Post-Incident

Within 48 hours of resolution, complete the post-mortem process per the [Incident Response Plan](../incident-response.md#6-post-mortem-process):

1. **Root cause analysis** -- blameless review focusing on systemic failures
2. **Timeline documentation** -- all times in AST (UTC+3)
3. **Control improvements** -- specific actions to prevent recurrence
4. **Detection improvements** -- how to catch this faster next time
5. **Update runbooks** -- incorporate lessons learned into this and related runbooks
6. **RBAC review** -- verify permission assignments are minimal and correct
7. **Penetration test** -- schedule a targeted test of the exploited vector

---

## Related Documents

- [Incident Response Plan](../incident-response.md)
- [Data Protection](../security/data-protection.md)
- [Data Export and Deletion](./data-export-deletion.md)
- [Certificate Renewal](./certificate-renewal.md)
- [Backup and Recovery](../operations/backup-recovery.md)
- [Operations Management Plan](../../management/operations-management-plan.md)
