# SALIS AUTO -- Data Governance Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-012                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan establishes the data governance framework for the SALIS AUTO multi-tenant
automotive workshop management platform. It covers data classification, ownership,
quality, lifecycle management, PII handling, multi-tenant isolation, and PDPL compliance
across all 13 operational domains, 191+ screens, and the PostgreSQL database layer
secured by Row-Level Security (RLS) and Drizzle ORM.

**Scope:** All data created, stored, processed, or transmitted by the SALIS AUTO
platform, including data from all 14 RBAC roles across tenant organizations, branches,
and external portals (customer, supplier, technician).

---

## 2. Data Governance Framework

### 2.1 Organizational Structure

| Role                    | Person / Title       | Responsibilities                                          |
|-------------------------|----------------------|-----------------------------------------------------------|
| Data Owner              | CTO                  | Overall data strategy, policy approval, escalation point  |
| Data Protection Officer | DPO (appointed)      | PDPL compliance, DSAR management, breach notification     |
| Domain Data Stewards    | Domain leads (x13)   | Data quality within their domain, schema change approval  |
| Data Custodians         | DevOps Lead + team   | Infrastructure, backup, encryption, access provisioning   |
| Data Architects         | Lead Developer       | Schema design, migration strategy, RLS policy design      |
| Data Users              | All 14 RBAC roles    | Comply with classification, report quality issues         |

### 2.2 Decision Authority Matrix

| Decision                              | Recommends        | Approves        | Informed         |
|---------------------------------------|-------------------|-----------------|------------------|
| Data classification change            | Domain Steward    | CTO (Data Owner)| DPO              |
| Schema migration                      | Lead Developer    | CTO             | Domain Stewards  |
| RLS policy change                     | Lead Developer    | CTO             | All Stewards     |
| Data retention period change          | DPO               | CTO + Legal     | Domain Stewards  |
| Cross-border data transfer            | DPO               | CEO + Legal     | CTO              |
| New PII field introduction            | Domain Steward    | DPO + CTO       | Lead Developer   |
| Data deletion request (DSAR)          | DPO               | CTO             | Domain Steward   |
| Backup/recovery execution             | DevOps Lead       | CTO             | Domain Stewards  |

---

## 3. Data Classification

### 3.1 Classification Levels

| Level        | Label        | Definition                                               | Handling Requirements                         |
|--------------|-------------|----------------------------------------------------------|-----------------------------------------------|
| Level 1      | Public       | Information intended for public disclosure                | No restrictions; standard integrity controls  |
| Level 2      | Internal     | Business information for internal use only               | Access controlled; no external sharing        |
| Level 3      | Confidential | Sensitive business data; disclosure causes harm          | Encrypted at rest and in transit; RBAC-gated  |
| Level 4      | Restricted   | Highly sensitive; legal/regulatory protection required   | AES-256 encryption; field-level access logging; DPO approval for access |

### 3.2 SALIS AUTO Classification Examples

| Data Category                    | Classification | Examples                                           | Domain             |
|----------------------------------|---------------|----------------------------------------------------|--------------------|
| Workshop service types           | Public        | Service menu, pricing tiers (published)            | Workshop           |
| Job card details                 | Internal      | Job status, assigned technician, bay number        | Workshop           |
| Customer contact information     | Confidential  | Name, phone, email, address                        | Registry           |
| Customer national ID             | Restricted    | Saudi national ID, Iqama number                    | Registry           |
| Vehicle plate and VIN            | Confidential  | License plate, VIN, registration details           | Registry           |
| Invoice line items               | Internal      | Service descriptions, part quantities              | Finance            |
| VAT and financial totals         | Confidential  | Invoice amounts, VAT calculations (15% SAR)        | Finance            |
| Bank account details             | Restricted    | IBAN, payment card tokens                          | Finance            |
| ZATCA XML and hash chain         | Confidential  | Signed XML, hash chain, CSID credentials           | Finance            |
| Employee salary data             | Restricted    | Salary, GOSI number, bank details                  | HR & Team          |
| Employee attendance              | Internal      | Clock-in/out times, leave balances                 | HR & Team          |
| Inventory stock levels           | Internal      | Part counts, reorder points                        | Inventory          |
| Supplier pricing agreements      | Confidential  | Contract terms, discount schedules                 | Procurement        |
| Supplier bank details            | Restricted    | Payment information for supplier accounts          | Procurement        |
| Platform audit logs              | Confidential  | User actions, IP addresses, timestamps             | Admin              |
| AI model training data           | Confidential  | Aggregated service patterns, predictions           | AI Platform        |
| Customer portal credentials      | Restricted    | Password hashes, refresh tokens                    | Portals            |
| CRM interaction history          | Internal      | Call logs, follow-up notes, campaign responses     | CRM & Marketing    |

---

## 4. Data Ownership Matrix

| Domain                 | Data Steward            | Key Data Assets                                    | Classification Range |
|------------------------|-------------------------|----------------------------------------------------|---------------------|
| Workshop Operations    | Branch Manager          | Job cards, inspections, QC records, appointments   | Internal - Conf.    |
| Registry               | Service Advisor (Lead)  | Customer profiles, vehicle records, fleet data     | Conf. - Restricted  |
| Finance                | Lead Accountant         | Invoices, payments, VAT, ZATCA submissions         | Conf. - Restricted  |
| Accounting             | Lead Accountant         | Journal entries, ledgers, financial reports        | Confidential        |
| Inventory              | Storekeeper (Lead)      | Stock levels, part catalog, warehouse locations    | Internal            |
| Procurement            | Procurement Agent (Lead)| Purchase orders, supplier contracts, pricing       | Conf. - Restricted  |
| HR & Team              | HR Manager              | Employee records, payroll, attendance, leave       | Conf. - Restricted  |
| CRM & Marketing        | Call Center Lead        | Customer interactions, campaigns, feedback         | Internal - Conf.    |
| AI Platform            | CTO                     | Training data, model outputs, predictions          | Confidential        |
| Admin & Settings       | Super Admin             | Tenant configuration, role assignments, audit logs | Conf. - Restricted  |
| Customer Portal        | Service Advisor (Lead)  | Customer-facing data, appointment requests         | Conf. - Restricted  |
| Supplier Portal        | Procurement Agent (Lead)| Supplier-facing orders, delivery confirmations     | Internal - Conf.    |
| Reports & Analytics    | CTO                     | Aggregated metrics, dashboards, KPI data           | Internal - Conf.    |

---

## 5. Data Quality Standards

### 5.1 Quality Dimensions

| Dimension     | Definition                                    | Measurement                                | Target      |
|---------------|-----------------------------------------------|---------------------------------------------|-------------|
| Completeness  | All required fields populated                 | % of records with all mandatory fields     | >= 98%      |
| Accuracy      | Data correctly represents real-world entity   | Validated against source (Zod schemas)     | >= 99%      |
| Timeliness    | Data available when needed                    | Lag between event and record creation      | < 5 seconds |
| Consistency   | Same data represented uniformly across system | Cross-domain reconciliation checks         | >= 99.5%    |
| Uniqueness    | No unintended duplicate records               | Duplicate detection rate                   | >= 99.9%    |
| Validity      | Data conforms to defined formats and rules    | Schema validation pass rate (Zod + DB)     | 100%        |

### 5.2 Quality Rules by Domain

| Domain         | Quality Rule                                          | Enforcement                          |
|----------------|-------------------------------------------------------|--------------------------------------|
| Registry       | Customer phone: valid Saudi format (+966XXXXXXXXX)    | Zod regex validation                 |
| Registry       | Vehicle plate: valid Saudi format (3 letters + 4 digits)| Frontend + API validation          |
| Finance        | Invoice total = sum(line items) + VAT (15%)           | Calculated field, not user-entered   |
| Finance        | ZATCA XML hash matches recalculated hash              | Pre-submission integrity check       |
| HR & Team      | Employee national ID: valid Iqama/NID format          | Zod validation + uniqueness check    |
| Inventory      | Stock count >= 0 (no negative inventory)              | Database CHECK constraint            |
| Procurement    | PO amount <= approval ceiling for role                | RBAC approval ceiling enforcement    |
| Workshop       | Job card must reference valid customer + vehicle      | Foreign key + API validation         |
| Accounting     | Journal entries must balance (debits = credits)       | Pre-post balance validation          |

### 5.3 Quality Monitoring

| Metric                              | Source                 | Frequency   | Alert Threshold    |
|-------------------------------------|------------------------|-------------|---------------------|
| Schema validation failure rate       | API error logs        | Real-time   | > 1% of requests    |
| Duplicate customer detection         | Nightly dedupe job    | Daily       | > 0.5% rate         |
| Invoice reconciliation              | Finance module        | Daily       | Any mismatch        |
| Orphaned records (missing FK)        | Database integrity job| Weekly      | Any occurrence      |
| Cross-tenant data leak detection     | RLS audit query       | Daily       | Any occurrence      |

---

## 6. Data Lifecycle Management

### 6.1 Lifecycle Stages

```
Creation -> Storage -> Usage -> Archival -> Deletion
    |          |         |         |           |
  Validate   Encrypt   Control   Compress    Certify
  Classify   Backup    Audit     Retain      Purge PII
  Tag org    RLS       Log       Read-only   Verify
```

### 6.2 Retention Schedule

| Data Category              | Retention Period | Legal Basis                  | Archival Method              | Deletion Method          |
|----------------------------|------------------|------------------------------|------------------------------|--------------------------|
| Financial records          | 7 years          | ZATCA VAT regulations        | Encrypted cold storage       | Certified destruction    |
| ZATCA e-invoices (XML)     | 7 years          | ZATCA Phase 2 mandate        | Immutable object storage     | Certified destruction    |
| Tax returns and VAT data   | 7 years          | Saudi VAT Law                | Encrypted archive            | Certified destruction    |
| Audit trail logs           | 7 years          | Financial compliance         | Append-only, compressed      | Automated purge          |
| Customer PII               | 3 years post-last-activity | PDPL proportionality | Encrypted database           | PII field purge          |
| Employee records           | 5 years post-termination   | Saudi Labor Law      | HR archive                   | Certified destruction    |
| Application logs           | 1 year           | Operational need             | Log aggregation service      | Automated rotation       |
| Performance metrics        | 1 year           | Operational need             | Time-series database         | Automated rollup         |
| Database backups           | 90 days          | BCP requirement              | Encrypted off-site storage   | Automated deletion       |
| Session data               | 24 hours         | Security policy              | In-memory/Redis              | TTL expiration           |
| Temporary upload files     | 7 days           | Processing need              | Encrypted temp storage       | Automated cleanup        |

### 6.3 Archival Process

| Step                     | Action                                             | Owner          |
|--------------------------|-----------------------------------------------------|----------------|
| Eligibility check        | Identify records past active retention threshold    | Automated job   |
| Classification review    | Verify no active legal hold or DSAR pending         | DPO            |
| Archive migration        | Move to compressed, encrypted cold storage          | DevOps Lead    |
| Access restriction       | Set read-only; restrict to Auditor + Owner roles    | DevOps Lead    |
| Index update             | Update search indices to include archive location   | Lead Developer |
| Verification             | Confirm data integrity post-migration (checksum)    | DevOps Lead    |

---

## 7. PII Handling

### 7.1 PII Field Inventory

| Field                    | Table(s)                  | Classification | Encryption     | Masking Rule          |
|--------------------------|---------------------------|---------------|----------------|------------------------|
| Customer name            | customers                 | Confidential  | AES-256 at rest| Last name: M***        |
| Customer phone           | customers                 | Confidential  | AES-256 at rest| +966***XXXX            |
| Customer email           | customers                 | Confidential  | AES-256 at rest| a***@domain.com        |
| National ID / Iqama      | customers, employees      | Restricted    | AES-256 + HSM  | **********X            |
| Home address             | customers, employees      | Confidential  | AES-256 at rest| City only              |
| Bank account (IBAN)      | suppliers, employees      | Restricted    | AES-256 + HSM  | SA**************XXXX   |
| Password hash            | users                     | Restricted    | bcrypt (hashed)| Never displayed        |
| Refresh token            | sessions                  | Restricted    | AES-256        | Never displayed        |
| Vehicle plate number     | vehicles                  | Confidential  | AES-256 at rest| ***-XXXX               |
| Employee salary          | payroll                   | Restricted    | AES-256 + HSM  | Not displayed in lists |
| GOSI number              | employees                 | Restricted    | AES-256 + HSM  | **********X            |
| IP address (audit log)   | audit_logs                | Confidential  | AES-256 at rest| XXX.XXX.***.***        |

### 7.2 Encryption Standards

| Layer                | Standard          | Implementation                               |
|----------------------|-------------------|----------------------------------------------|
| Data at rest         | AES-256-GCM       | PostgreSQL TDE or application-level encryption|
| Data in transit      | TLS 1.3           | Enforced on all API endpoints and DB connections|
| Field-level (PII)    | AES-256-GCM       | Application-layer encryption via crypto service|
| Restricted fields    | AES-256 + HSM     | Hardware Security Module for key management   |
| Backup encryption    | AES-256           | Encrypted before transfer to off-site storage |
| Key rotation         | 90-day cycle      | Automated key rotation with zero-downtime swap|

### 7.3 Access Logging for PII

| Event                        | Logged Data                              | Retention | Alert Trigger              |
|------------------------------|------------------------------------------|-----------|----------------------------|
| PII field read               | User ID, role, field, timestamp, org_id  | 7 years   | Bulk read (> 50 records)   |
| PII field update             | User ID, old hash, new hash, timestamp   | 7 years   | Update outside business hours|
| PII field export             | User ID, export format, record count     | 7 years   | Any export > 100 records   |
| PII field deletion           | User ID, reason, approval ref           | 7 years   | Always                     |
| Failed PII access attempt    | User ID, role, denied field, reason     | 1 year    | Always                     |

---

## 8. Multi-Tenant Data Isolation

### 8.1 Isolation Architecture

SALIS AUTO uses a shared-database, shared-schema multi-tenant model with PostgreSQL
Row-Level Security (RLS) enforced at the database level via Drizzle ORM.

| Isolation Layer          | Mechanism                                        | Enforcement Point       |
|--------------------------|--------------------------------------------------|-------------------------|
| Organization isolation   | `organization_id` column on all 53 tenant tables | PostgreSQL RLS policy   |
| Branch isolation         | `branch_id` column for branch-scoped data        | RLS + application logic |
| User isolation           | `user_id` for user-scoped data (e.g., own tasks) | RLS + RBAC role scope   |
| API isolation            | JWT claims carry org_id; middleware injects scope | Express middleware      |
| Query isolation          | Drizzle ORM wraps all queries with org_id filter | ORM query builder       |

### 8.2 RLS Policy Design

| Policy Type              | SQL Pattern                                       | Applied To              |
|--------------------------|---------------------------------------------------|-------------------------|
| Tenant read              | `org_id = current_setting('app.org_id')`          | All 53 tenant tables    |
| Tenant write             | `org_id = current_setting('app.org_id')`          | All tenant tables       |
| Branch read              | `branch_id = current_setting('app.branch_id')` OR role has `all` scope | Branch-scoped tables |
| Owner-only read          | `created_by = current_setting('app.user_id')`     | User-scoped tables      |
| Cross-tenant (admin)     | Disabled by default; requires super_admin role    | Platform admin only     |

### 8.3 Branch-Level Partitioning

| Data Category            | Partitioning Strategy                             | Purpose                 |
|--------------------------|---------------------------------------------------|-------------------------|
| Job cards                | Scoped by branch_id within organization           | Branch manager visibility|
| Inventory                | Per-branch stock with cross-branch transfer workflow | Multi-location support|
| Appointments             | Branch calendar isolation                         | Scheduling independence  |
| Employee assignment      | Primary branch + secondary access                 | Staff flexibility        |
| Financial reporting      | Branch-level P&L with organization rollup         | Management hierarchy     |

### 8.4 Isolation Testing

| Test Type                     | Frequency   | Method                                     | Pass Criteria             |
|-------------------------------|-------------|---------------------------------------------|---------------------------|
| RLS policy unit tests         | Per commit  | SQL test harness with cross-org queries     | 0 cross-tenant results    |
| Penetration testing (tenant)  | Quarterly   | Simulated tenant A accessing tenant B data  | 0 bypass findings         |
| API isolation tests           | Per PR      | Supertest with mismatched JWT org_id claims | All requests return 403   |
| Backup isolation verification | Monthly     | Restore single-tenant from shared backup    | Only target tenant data   |

---

## 9. PDPL Compliance

### 9.1 Consent Tracking

| Consent Purpose              | Collection Method        | Storage                    | Revocation Method         |
|------------------------------|--------------------------|----------------------------|---------------------------|
| Service agreement            | Registration checkbox    | `consent_records` table    | Account deletion          |
| Marketing communications     | Profile toggle           | `consent_records` table    | Self-service toggle       |
| Data analytics               | Banner acceptance        | `consent_records` table    | Self-service toggle       |
| Third-party data sharing     | Per-instance popup       | `consent_records` table    | Per-instance withdrawal   |

Each consent record stores: `user_id`, `consent_type`, `version`, `granted_at`,
`revoked_at`, `ip_address`, `user_agent`, `organization_id`.

### 9.2 DSAR (Data Subject Access Request) Workflow

```
Request Received -> Identity Verified -> Request Logged -> Data Located
       |                    |                  |                |
   (any channel)     (2-factor verify)   (DSAR tracker)   (all 13 domains)
                                                                |
                                                          Data Compiled
                                                                |
                                               Review by DPO -> Response Sent
                                                                |
                                                          (within 30 days)
```

| Step                    | SLA            | Owner          | Output                          |
|-------------------------|----------------|----------------|---------------------------------|
| Receipt and acknowledge | 2 business days| DPO            | Acknowledgment to data subject  |
| Identity verification   | 3 business days| DPO            | Verified identity record        |
| Data location           | 5 business days| Domain Stewards| Cross-domain data inventory     |
| Data compilation        | 10 business days| Lead Developer | Machine-readable export (JSON)  |
| DPO review              | 5 business days| DPO            | Redaction of third-party data   |
| Response delivery       | Within 30 days | DPO            | Secure delivery to data subject |

### 9.3 Right to Erasure

| Data Category                | Erasable? | Method                               | Exception                         |
|------------------------------|-----------|--------------------------------------|-----------------------------------|
| Customer profile (name, phone)| Yes      | PII field purge, replace with hash   | None                              |
| Transaction history           | No       | Pseudonymize (remove PII linkage)    | ZATCA 7-year retention mandate    |
| Invoice records               | No       | Pseudonymize customer reference      | ZATCA 7-year retention mandate    |
| Audit trail entries           | No       | Retained with pseudonymized user ref | Financial compliance requirement  |
| Vehicle service history       | Partial  | Remove owner linkage; retain vehicle | Workshop operational need         |
| Marketing consent records     | Yes      | Full deletion                        | None                              |
| Support ticket history        | Yes      | Full deletion after resolution       | None (unless financial dispute)   |

### 9.4 Data Portability

| Export Format  | Content                                      | Available To       | Delivery Method       |
|----------------|----------------------------------------------|--------------------|------------------------|
| JSON           | Full profile + transaction history (redacted)| Customer (portal)  | Secure download link   |
| PDF            | Formatted profile summary                    | Customer (portal)  | Email + portal download|
| CSV            | Tabular data (vehicle history, invoices)     | Customer (request) | Secure download link   |

---

## 10. Segregation of Duties in Data Governance

To protect data integrity and prevent unauthorized manipulation, the following SOD
controls apply to data governance operations:

| SOD Pair                                 | Role A             | Role B               | Data Governance Context                |
|------------------------------------------|--------------------|-----------------------|----------------------------------------|
| Raise PO / Approve PO                   | Procurement Agent  | Branch Manager         | Procurement data cannot be self-approved |
| Create Supplier / Approve Supplier Payment| Procurement Agent | Lead Accountant        | Supplier master data separated from payment |
| Post Journal / Approve Journal           | Accountant         | Branch Manager / Owner | Financial data requires independent approval |
| Perform Repair / Pass QC                 | Technician         | QC Inspector           | Service quality data independently verified |
| Issue Stock / Adjust Stock Count         | Storekeeper        | Branch Manager         | Inventory data integrity ensured by segregation |

---

## 11. Cross-References

| Document                                         | Relevance                                        |
|--------------------------------------------------|-------------------------------------------------|
| [Database Design](../system/architecture/database-design.md) | Schema, RLS policies, table inventory  |
| [Security Architecture](../system/security/security-architecture.md) | Encryption, threat model     |
| [Authorization Matrix](../system/security/authorization-matrix.md) | RBAC role-to-data mapping    |
| [Compliance Management Plan](compliance-management-plan.md) | PDPL and ZATCA requirements    |
| [Risk Management Plan](risk-management-plan.md)  | Data-related risk items                         |
| [Backup & Recovery](../system/operations/backup-recovery.md) | Backup retention and restore     |
| [Incident Response Plan](../system/incident-response.md) | Data breach response procedures    |
| [Quality Management Plan](quality-management-plan.md) | Data quality in QA process           |
| [Non-Functional: Security](../requirements/non-functional/security.md) | Security requirements    |

---

## 12. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release                |
