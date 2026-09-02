# SALIS AUTO -- Data Export and Deletion (PDPL Compliance)

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following requests are received:

1. **Data export request (PDPL Art. 8)** -- a data subject (customer, employee, supplier) requests a copy of their personal data
2. **Right-to-delete request (PDPL Art. 9)** -- a data subject requests erasure of their personal data
3. **Data portability request** -- a data subject requests their data in a machine-readable format for transfer to another service
4. **Regulatory inquiry** -- SDAIA (Saudi Data and Artificial Intelligence Authority) requests documentation of data handling for a specific individual
5. **Tenant offboarding** -- an organization terminates their subscription and requests full data export and deletion

---

## Prerequisites

| Requirement                     | Details                                                         |
|---------------------------------|-----------------------------------------------------------------|
| DPO authorization               | Data Protection Officer must authorize the request in writing   |
| Identity verification           | Data subject identity confirmed via government ID or account ownership |
| Request tracking                | Request logged with unique ID, received date, and 30-day deadline |
| Database read access            | Read-only production database access (on-call + DBA)            |
| Export tooling                  | `psql` client, `jq`, `csvkit` or equivalent on operations workstation |
| Secure transfer channel         | Encrypted email or secure file sharing for delivering exports   |
| Legal review (if applicable)   | Legal counsel consulted for conflicting retention obligations   |

---

## Procedure A: Data Export (PDPL Art. 8 / Data Portability)

### Phase 1: Identify Personal Data

**Step 1.** Log the request with a tracking ID, received date, and the 30-day response deadline.

```
Request ID: PDPL-EXP-YYYY-NNN
Subject: [name / identifier]
Received: YYYY-MM-DD
Deadline: YYYY-MM-DD (30 calendar days)
Type: Export / Portability
```

**Step 2.** Verify the identity of the data subject. Acceptable verification methods:
- Account login confirmation (for registered users)
- Government-issued ID matching account records
- Email verification to the registered email address

**Step 3.** Identify the subject's `org_id` and relevant record identifiers. The subject may appear in data across multiple tables within a single tenant or across tenants (if they are a customer at multiple workshops).

**Step 4.** Query all tables containing PII for the data subject. The following tables may hold personal data (per the [Data Protection](../security/data-protection.md) PII inventory):

```sql
-- Set the tenant context for RLS
SET app.org_id = 'TARGET_ORG_ID';

-- Customers table
SELECT id, name, phone, email, vat_number, created_at, updated_at
FROM customers
WHERE phone = 'SUBJECT_PHONE' OR email = 'SUBJECT_EMAIL';

-- Vehicles linked to the customer
SELECT v.id, v.plate_number, v.make, v.model, v.year, v.vin, v.color
FROM vehicles v
JOIN customers c ON v.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';

-- Job cards for the customer's vehicles
SELECT jc.id, jc.status, jc.created_at, jc.description, jc.total_halalas
FROM job_cards jc
JOIN vehicles v ON jc.vehicle_id = v.id
JOIN customers c ON v.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';

-- Invoices for the customer
SELECT i.id, i.status, i.issued_at, i.subtotal_halalas, i.tax_halalas,
       i.total_halalas, i.paid_halalas, i.buyer_vat_number
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';

-- Payments
SELECT p.id, p.amount_halalas, p.method, p.created_at
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
JOIN customers c ON i.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';

-- Feedback / satisfaction records
SELECT f.id, f.rating, f.comment, f.created_at
FROM feedback f
JOIN job_cards jc ON f.job_card_id = jc.id
JOIN vehicles v ON jc.vehicle_id = v.id
JOIN customers c ON v.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';

-- Estimates
SELECT e.id, e.status, e.total_halalas, e.created_at
FROM estimates e
JOIN customers c ON e.customer_id = c.id
WHERE c.phone = 'SUBJECT_PHONE' OR c.email = 'SUBJECT_EMAIL';
```

**Step 5.** Check the audit log for all actions related to the subject's records.

```sql
SELECT id, action, collection, record_id, created_at, actor_id
FROM audit_log
WHERE org_id = 'TARGET_ORG_ID'
  AND (record_id IN (SELECT id FROM customers WHERE phone = 'SUBJECT_PHONE')
       OR payload::text LIKE '%SUBJECT_PHONE%'
       OR payload::text LIKE '%SUBJECT_EMAIL%')
ORDER BY created_at;
```

### Phase 2: Generate Export

**Step 6.** Export data in JSON format (for data portability) and CSV format (for human readability).

```bash
# JSON export
psql "$DATABASE_URL" -t -A \
  -c "SELECT json_agg(row_to_json(t)) FROM (SELECT ... ) t" \
  > pdpl-export-SUBJECT_ID.json

# CSV export (using the application export endpoint if available)
curl -s "https://api.salisauto.com/api/v1/customers/export?phone=SUBJECT_PHONE" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  > pdpl-export-customers.csv
```

Note: The export endpoint limits to 50,000 rows per collection (`MAX_EXPORT_ROWS`). For subjects with more records, use direct database queries.

**Step 7.** Review the export for third-party data. Remove any PII belonging to other individuals that may appear in shared records (e.g., other customers on the same invoice, employee names in job cards).

**Step 8.** Package the export with a cover letter explaining the data contents, the date range covered, and the data subject's rights.

### Phase 3: Deliver Securely

**Step 9.** Deliver the export via the secure channel agreed upon with the data subject:
- Encrypted email (PGP or S/MIME)
- Secure file sharing link with password (shared separately)
- In-person delivery on encrypted USB (if requested)

**Step 10.** Log the delivery in the request tracker.

```
Request ID: PDPL-EXP-YYYY-NNN
Delivered: YYYY-MM-DD
Method: [encrypted email / secure link / in-person]
Verified by: [DPO name]
```

---

## Procedure B: Data Deletion (PDPL Art. 9)

### Phase 1: Assess Retention Requirements

**Step 1.** Log the deletion request with a tracking ID.

```
Request ID: PDPL-DEL-YYYY-NNN
Subject: [name / identifier]
Received: YYYY-MM-DD
Deadline: YYYY-MM-DD (30 calendar days)
Type: Deletion
```

**Step 2.** Verify identity (same as Procedure A, Step 2).

**Step 3.** Check each data category against legal retention requirements before deleting.

| Data Category         | Retention Requirement                    | Can Delete?          |
|-----------------------|------------------------------------------|----------------------|
| Customer contact info | No mandatory retention (unless active)   | Yes (if no open jobs)|
| Vehicle records       | No mandatory retention                   | Yes (if no open jobs)|
| Job card history      | Business records -- recommended 5 years  | Anonymize            |
| Invoices (issued)     | ZATCA / Saudi commercial law -- 7 years  | No (anonymize only)  |
| Payment records       | Financial records -- 7 years             | No (anonymize only)  |
| Audit log entries     | Immutable, append-only                   | No (system enforced) |
| Feedback              | No mandatory retention                   | Yes                  |
| Estimates             | No mandatory retention (if not invoiced) | Yes                  |
| Employee records      | Saudi labor law -- 2 years post-departure| Conditional          |

**Step 4.** Document the retention analysis with DPO sign-off.

### Phase 2: Anonymize Where Deletion Is Blocked

**Step 5.** For issued invoices and payment records that must be retained, anonymize the PII while preserving the financial record.

```sql
-- Set tenant context
SET app.org_id = 'TARGET_ORG_ID';

-- Anonymize customer name on retained invoices (7-year financial records)
UPDATE invoices
SET buyer_vat_number = 'ANONYMIZED',
    updated_at = NOW()
WHERE customer_id = 'CUSTOMER_ID'
  AND issued_at IS NOT NULL;

-- Anonymize the customer record itself
UPDATE customers
SET name = 'ANONYMIZED',
    phone = 'ANONYMIZED',
    email = NULL,
    vat_number = NULL,
    updated_at = NOW()
WHERE id = 'CUSTOMER_ID';
```

Note: The system uses soft deletes (setting `deleted_at`) rather than physical deletion. Anonymization is preferred for records with retention obligations.

**Step 6.** For records that can be deleted, use the application's soft delete mechanism.

```sql
-- Soft delete feedback records
UPDATE feedback
SET deleted_at = NOW()
WHERE job_card_id IN (
  SELECT jc.id FROM job_cards jc
  JOIN vehicles v ON jc.vehicle_id = v.id
  WHERE v.customer_id = 'CUSTOMER_ID'
);

-- Soft delete estimates (unissued only)
UPDATE estimates
SET deleted_at = NOW()
WHERE customer_id = 'CUSTOMER_ID'
  AND id NOT IN (SELECT estimate_id FROM invoices WHERE estimate_id IS NOT NULL);

-- Soft delete the customer record (after anonymization)
UPDATE customers
SET deleted_at = NOW()
WHERE id = 'CUSTOMER_ID';

-- Soft delete vehicles
UPDATE vehicles
SET deleted_at = NOW()
WHERE customer_id = 'CUSTOMER_ID';
```

### Phase 3: Update Audit Trail

**Step 7.** The audit log is append-only and cannot be modified (enforced by a PostgreSQL trigger). Record the deletion action as a new audit entry.

```sql
INSERT INTO audit_log (id, org_id, actor_id, action, collection, record_id, after, created_at)
VALUES (
  gen_random_uuid(),
  'TARGET_ORG_ID',
  'DPO_USER_ID',
  'pdpl_delete',
  'customers',
  'CUSTOMER_ID',
  '{"reason": "PDPL Art. 9 request", "request_id": "PDPL-DEL-YYYY-NNN"}'::jsonb,
  NOW()
);
```

**Step 8.** Verify the audit entry was created.

```sql
SELECT * FROM audit_log
WHERE action = 'pdpl_delete'
  AND record_id = 'CUSTOMER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Verification

### Post-Export Verification

| Check                         | Method                                        | Expected Result              |
|-------------------------------|-----------------------------------------------|------------------------------|
| Export completeness           | Cross-reference tables against PII inventory  | All PII tables covered       |
| No third-party PII in export | Manual review of exported records             | Only subject's data included |
| Delivery confirmed            | Secure channel delivery receipt               | Subject acknowledges receipt |
| Audit trail entry             | Query audit log for export action             | Entry exists with request ID |

### Post-Deletion Verification

| Check                            | Method                                     | Expected Result                 |
|----------------------------------|--------------------------------------------|---------------------------------|
| PII scan                        | Search all tables for subject's phone/email | Zero non-anonymized results     |
| Customer record anonymized       | `SELECT * FROM customers WHERE id = ...`   | Name, phone, email are null/anonymized |
| Retained invoices anonymized     | Check `buyer_vat_number` on retained invoices | Shows `ANONYMIZED`           |
| Soft deletes applied             | Check `deleted_at` on eligible records     | Non-null timestamps             |
| Audit log entry                  | Query for `pdpl_delete` action             | Entry with request ID exists    |
| Hash chain integrity             | Invoice hash verification                  | Chain unbroken (hashes unchanged)|
| Response to data subject         | Confirm written response sent              | Within 30-day window            |
| DPO sign-off                     | Request tracker updated                    | DPO approval documented         |

---

## Rollback

### Export Rollback

If an export was delivered to the wrong recipient:

1. **Notify the DPO** immediately.
2. **Contact the incorrect recipient** and request deletion of the received file.
3. **Document the incident** as a data breach per [Security Breach Response](./security-breach-response.md).
4. **Assess PDPL breach notification obligations** -- 72 hours to SDAIA if personal data was exposed.

### Deletion Rollback

If data was anonymized or deleted in error:

1. **Soft-deleted records** can be restored by setting `deleted_at = NULL` (requires `d` permission and audit action `restore`).
2. **Anonymized records** cannot be fully restored from the database. Restore from the most recent backup that contains the original data.
3. **Assess the impact** -- determine which records were affected and the time window of the error.
4. **Notify the data subject** if their deletion request was incorrectly processed.

---

## Escalation

| Condition                                    | Escalate To              | Method          | Timeframe      |
|----------------------------------------------|--------------------------|-----------------|----------------|
| Identity verification fails                  | DPO                      | Email           | Within 24 hours|
| Retention conflict (legal vs. deletion)      | Legal Counsel + DPO      | Email + meeting | Within 5 days  |
| Request deadline at risk (>20 days elapsed)  | DPO + PM                 | Slack + email   | Immediate      |
| Cross-tenant data subject (multiple orgs)    | CTO + DPO                | Meeting         | Within 3 days  |
| SDAIA inquiry about a specific subject       | Legal Counsel + CTO      | Phone + email   | Immediate      |
| Accidental deletion of wrong records         | DBA + CTO                | PagerDuty       | Immediate      |
| Export contains third-party PII              | DPO                      | Slack           | Within 24 hours|

---

## Related Documents

- [Data Protection](../security/data-protection.md)
- [Backup and Recovery](../operations/backup-recovery.md)
- [Security Breach Response](./security-breach-response.md)
- [Incident Response Plan](../incident-response.md)
- [Operations Management Plan](../../management/operations-management-plan.md)
