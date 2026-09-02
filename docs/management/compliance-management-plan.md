# SALIS AUTO -- Compliance Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-009                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan defines the compliance framework for the SALIS AUTO multi-tenant automotive
workshop management platform operating in Saudi Arabia. It covers all regulatory
obligations applicable to the platform's 13 domains, 191+ screens, and the workshops
using the service, with primary focus on ZATCA Phase 2 e-invoicing, Saudi PDPL data
protection, Saudi Labor Law, and AML/CFT regulations.

**Applicability:** All platform operations, all tenant organizations, all 14 RBAC roles,
and all third-party integrations processing Saudi-regulated data.

---

## 2. Regulatory Landscape

### 2.1 Applicable Regulations

| Regulation                         | Authority           | Effective Date | Impact on SALIS AUTO                        | Penalty Range              |
|------------------------------------|---------------------|----------------|---------------------------------------------|----------------------------|
| ZATCA Phase 2 E-Invoicing          | ZATCA               | 2024 (phased)  | Mandatory API integration for all invoices  | SAR 10,000 - 50,000/violation |
| Saudi PDPL                         | SDAIA / NDMO        | Sept 2023      | PII handling, consent, data subject rights  | Up to SAR 5M + imprisonment |
| Saudi Labor Law                    | MHRSD               | Ongoing        | Saudization, GOSI, WPS, working hours       | Fines + license suspension |
| AML/CFT Regulations                | SAMA / SAFIU        | Ongoing        | Transaction monitoring, KYC for suppliers   | Criminal penalties          |
| Commercial Registration Law        | MoC                 | Ongoing        | Business registration, licensing            | License revocation          |
| VAT Law (15%)                      | ZATCA               | 2020           | VAT calculation, reporting, filing          | 5% - 25% of unpaid tax     |
| Cloud Computing Regulations        | CST / NCA           | 2023           | Data residency, cloud security standards    | Service suspension          |
| Electronic Transactions Law        | CITC                | 2007 (amended) | Digital signatures, electronic records      | Fines + invalidation       |

### 2.2 Regulatory Change Monitoring

| Activity                         | Frequency   | Owner             | Output                          |
|----------------------------------|-------------|-------------------|---------------------------------|
| ZATCA circular monitoring        | Weekly      | Compliance Lead   | Regulatory change log           |
| PDPL guidance review             | Monthly     | Legal Counsel     | Compliance impact assessment    |
| Labor law update tracking        | Monthly     | HR Manager        | Policy update recommendations   |
| Industry peer review             | Quarterly   | CTO               | Competitive compliance status   |
| Legal counsel briefing           | Quarterly   | Legal Counsel     | Compliance risk update          |

---

## 3. ZATCA Phase 2 E-Invoicing Compliance

### 3.1 Integration Requirements

| Requirement                      | Implementation                                    | Status         |
|----------------------------------|---------------------------------------------------|----------------|
| API integration with ZATCA portal| REST API with OAuth 2.0 client credentials        | Implemented    |
| Real-time invoice clearance      | Synchronous submission for B2B (>SAR 1,000)       | Implemented    |
| Near-real-time reporting         | Asynchronous submission for B2C within 24 hours   | Implemented    |
| Cryptographic stamp              | ZATCA-issued CSID for digital signing             | Implemented    |
| UUID generation                  | RFC 4122 v4 for each invoice                      | Implemented    |
| Sequential invoice counter       | Per-organization monotonic counter                | Implemented    |
| Previous invoice hash            | SHA-256 hash chain linking consecutive invoices   | Implemented    |

### 3.2 QR Code Requirements

| Field                | Source                     | Validation                           |
|----------------------|----------------------------|--------------------------------------|
| Seller name (AR)     | Organization profile       | Non-empty Arabic string              |
| Seller VAT number    | Organization tax settings  | 15-digit format validated            |
| Invoice timestamp    | System UTC -> AST          | ISO 8601 format                      |
| Invoice total (SAR)  | Calculated line items      | Matches XML total to 2 decimal places|
| VAT amount (15%)     | Calculated at line level   | Sum matches total VAT               |
| XML hash             | SHA-256 of canonical XML   | Matches ZATCA-computed hash          |
| Digital signature    | CSID private key           | Valid ECDSA signature                |
| Public key           | CSID certificate           | Matches registered certificate       |

### 3.3 XML Format Compliance (UBL 2.1)

| Element                    | Requirement                                     | Validation Rule                    |
|----------------------------|--------------------------------------------------|------------------------------------|
| Invoice type code          | 388 (standard), 381 (credit), 383 (debit)      | Must match transaction type        |
| Tax category               | S (standard 15%), Z (zero-rated), E (exempt)    | Valid ZATCA tax code               |
| Line item details          | Description, quantity, unit price, tax per line  | All required fields present        |
| Allowance/charge           | Discount and surcharge at document/line level    | Correctly reduces/increases total  |
| Payment means              | Cash (10), bank transfer (42), card (48)        | Valid ZATCA payment code           |
| Buyer identification       | VAT number or national ID for B2B               | Validated format per buyer type    |

### 3.4 Record Retention and Audit Trail

| Record Type                | Retention Period | Storage                    | Access Control               |
|----------------------------|------------------|----------------------------|------------------------------|
| E-invoice XML              | 7 years          | Encrypted object storage   | Accountant, Owner, Auditor   |
| ZATCA API responses        | 7 years          | Append-only audit log      | CTO, Accountant              |
| Hash chain records         | 7 years          | Immutable database table   | System-only (read: Auditor)  |
| Credit/debit notes         | 7 years          | Same as parent invoice     | Accountant, Owner            |
| VAT return data            | 7 years          | Encrypted, backed up       | Accountant, Owner            |

### 3.5 Certification Process

| Phase                      | Activities                                       | Duration    | Owner           |
|----------------------------|--------------------------------------------------|-------------|-----------------|
| Sandbox integration        | Connect to ZATCA sandbox; submit test invoices   | 2 weeks     | Lead Developer  |
| Sandbox validation         | Validate all invoice types; fix rejection reasons| 1 week      | QA Lead         |
| Compliance self-assessment | Complete ZATCA checklist; internal audit          | 1 week      | Compliance Lead |
| Production onboarding      | Request production CSID; configure endpoints     | 3 days      | DevOps Lead     |
| Go-live monitoring         | Monitor first 100 production submissions         | 1 week      | Lead Developer  |
| Ongoing certification      | Annual compliance review with ZATCA updates      | Annual      | Compliance Lead |

### 3.6 Penalty Avoidance

| Violation                               | Penalty (SAR)     | Prevention Measure                         |
|-----------------------------------------|-------------------|--------------------------------------------|
| Failure to issue e-invoice              | 10,000 - 50,000   | Automated invoice generation on delivery   |
| Non-compliant invoice format            | 10,000            | Pre-submission XML schema validation       |
| Missing QR code                         | 10,000            | QR generation as mandatory pipeline step   |
| Late submission (B2B > 24h)             | 10,000            | Offline queue with retry + alert at 12h    |
| Incorrect VAT calculation               | 5% - 25% of tax   | Automated 15% VAT at line-item level       |
| Failure to maintain records (7 years)   | 10,000 - 50,000   | Automated archival with retention policies |

---

## 4. Saudi PDPL Compliance

### 4.1 Data Classification for PDPL

| Classification | Definition                                           | SALIS AUTO Examples                            |
|----------------|------------------------------------------------------|------------------------------------------------|
| Sensitive PII  | Data revealing racial, health, genetic information   | Medical conditions noted in vehicle repair     |
| Personal Data  | Any data identifying or identifiable to a person     | Name, phone, email, national ID, address       |
| Financial Data | Payment and transaction information                  | Bank details, payment history, credit terms    |
| Operational    | Business data without personal identifiers           | Job card status, part numbers, service types   |

### 4.2 Consent Management

| Consent Type              | Collection Point                  | Mechanism                    | Revocation            |
|---------------------------|-----------------------------------|------------------------------|-----------------------|
| Service consent           | Customer registration             | Explicit checkbox (EN/AR)    | Account deletion      |
| Marketing consent         | Profile settings                  | Opt-in toggle                | Self-service toggle   |
| Data processing consent   | First login (each role)           | Terms acceptance with version| Written request       |
| Third-party sharing       | Before supplier data share        | Per-instance approval        | Withdraw per instance |
| Analytics consent         | Cookie/tracking notice            | Accept/reject banner         | Self-service toggle   |

### 4.3 Data Subject Rights

| Right                  | PDPL Article | Implementation                               | SLA           |
|------------------------|-------------|-----------------------------------------------|---------------|
| Right to access        | Art. 4      | Self-service data export (JSON/PDF)           | Immediate     |
| Right to correction    | Art. 5      | Profile edit + support ticket                 | 5 business days|
| Right to erasure       | Art. 8      | Automated PII purge with financial exemption  | 30 days       |
| Right to restrict      | Art. 7      | Processing pause flag on account              | 3 business days|
| Right to portability   | Art. 6      | Machine-readable export (JSON)                | 10 business days|
| Right to object        | Art. 9      | Marketing opt-out; processing objection form  | 3 business days|

### 4.4 Cross-Border Data Transfers

| Scenario                        | Allowed?  | Condition                                     |
|---------------------------------|-----------|-----------------------------------------------|
| Backup to GCC data center       | Yes       | Adequate protection per SDAIA assessment      |
| Analytics to non-GCC cloud      | No        | Data must remain in KSA/GCC                   |
| Supplier portal access (foreign)| Conditional| Anonymized/pseudonymized data only           |
| Support team access (remote)    | Conditional| VPN + audit logging + DPA signed             |

### 4.5 Data Protection Officer (DPO)

| Aspect                  | Detail                                               |
|-------------------------|------------------------------------------------------|
| Appointment             | Mandatory for entities processing large-scale PII    |
| Reporting line          | Reports directly to CEO                              |
| Responsibilities        | PDPL compliance oversight, DSAR management, training |
| Independence            | No conflict with operational duties                  |
| Contact                 | Published on platform privacy policy page            |

### 4.6 Breach Notification

| Step                         | Timeline         | Recipient                   | Content                        |
|------------------------------|------------------|-----------------------------|--------------------------------|
| Internal detection           | Immediate        | CTO + DPO                   | Nature and scope of breach     |
| Risk assessment              | Within 4 hours   | Risk Committee              | Impact assessment, containment |
| Authority notification       | Within 72 hours  | SDAIA / NDMO                | Formal breach report           |
| Data subject notification    | Without delay    | Affected individuals        | Plain language (EN + AR)       |
| Post-incident report         | Within 30 days   | SDAIA + internal records    | Root cause, remediation        |

---

## 5. Saudi Labor Law Compliance

### 5.1 Saudization (Nitaqat) Requirements

| Band           | Saudi %   | Benefits                              | SALIS AUTO Target     |
|----------------|-----------|---------------------------------------|-----------------------|
| Platinum       | >= 40%    | Full MHRSD services, visa priority    | Year 3 target         |
| Green (high)   | 26% - 39% | Standard services                    | Year 2 target         |
| Green (low)    | 12% - 25% | Standard services                    | Year 1 target         |
| Yellow         | 5% - 11%  | Restricted services                  | Avoid                 |
| Red            | < 5%      | Severe restrictions                   | Never                 |

### 5.2 GOSI (General Organization for Social Insurance)

| Obligation                    | Requirement                                | Platform Support                |
|-------------------------------|--------------------------------------------|---------------------------------|
| Employee registration         | Register within 15 days of hiring          | HR module alert trigger         |
| Contribution payment          | Monthly by 15th of following month         | Payroll integration reminder    |
| Injury reporting              | Report within 3 days                       | HR incident form                |
| Salary reporting              | Monthly through GOSI portal                | Export from HR module           |

### 5.3 Wage Protection System (WPS)

| Requirement                   | Detail                                     | Platform Support                |
|-------------------------------|--------------------------------------------|---------------------------------|
| Salary file submission        | Monthly to MHRSD via bank                 | WPS-format export from HR       |
| Payment method                | Bank transfer only (no cash)               | Payment recording validation    |
| Compliance window             | Payment within 7 days of due date         | Automated alert system          |
| Record retention              | 5 years minimum                            | HR module data retention policy |

### 5.4 Working Hours and Leave

| Rule                          | Requirement                                | Platform Enforcement            |
|-------------------------------|--------------------------------------------|---------------------------------|
| Maximum hours                 | 8 hours/day, 48 hours/week                | Attendance module validation    |
| Ramadan hours                 | 6 hours/day for Muslim employees          | Calendar-aware scheduling       |
| Annual leave                  | 21 days (< 5 years), 30 days (>= 5 years)| Leave module calculation        |
| End-of-service benefits       | 0.5 month/year (1-5 yrs), 1 month (5+ yrs)| Automated calculation in HR   |
| Overtime                      | 150% of hourly rate                       | Payroll calculation module      |

---

## 6. Compliance Monitoring

### 6.1 Audit Schedule

| Audit Type                    | Scope                                     | Frequency   | Auditor            | Output                  |
|-------------------------------|-------------------------------------------|-------------|--------------------|--------------------------| 
| ZATCA compliance audit        | E-invoice format, submission, retention   | Quarterly   | Internal QA        | Compliance scorecard     |
| PDPL compliance review        | PII handling, consent, DSAR processing    | Quarterly   | DPO                | PDPL status report       |
| Labor law compliance check    | Saudization %, GOSI, WPS                 | Monthly     | HR Manager         | Compliance dashboard     |
| Security audit                | OWASP, penetration testing, access review | Quarterly   | External firm      | Security audit report    |
| Financial controls audit      | SOD enforcement, approval workflows       | Semi-annual | External auditor   | Controls assessment      |
| Full regulatory audit         | All applicable regulations                | Annual      | External firm      | Audit opinion letter     |

### 6.2 Compliance Dashboard

| Metric                                | Data Source              | Update Frequency | Alert Threshold      |
|---------------------------------------|--------------------------|------------------|----------------------|
| ZATCA submission success rate          | ZATCA API response log   | Real-time        | < 99%                |
| ZATCA average submission latency       | APM monitoring           | Real-time        | > 30 seconds         |
| Open DSARs                             | DSAR tracking system     | Daily            | Any > 20 days old    |
| PII access without authorization       | Audit log                | Real-time        | Any occurrence       |
| Saudization percentage                 | HR system                | Monthly          | Below band target    |
| WPS payment timeliness                 | Payroll system           | Monthly          | Any late payment     |
| SOD violation attempts                 | RBAC audit log           | Real-time        | Any occurrence       |
| Financial record retention compliance  | Archival system          | Weekly           | Any gap > 7 years    |

### 6.3 Automated Compliance Alerts

| Alert                                  | Trigger                                | Recipient          | Action Required          |
|----------------------------------------|----------------------------------------|--------------------|--------------------------|
| ZATCA submission failure               | API error response                     | Lead Developer     | Investigate + retry      |
| ZATCA rejection                        | Validation error from ZATCA            | Accountant + Dev   | Correct + resubmit       |
| PII access anomaly                     | Unusual PII query pattern              | DPO + CTO          | Investigation            |
| DSAR SLA approaching                   | DSAR open > 20 days                    | DPO                | Expedite processing      |
| SOD violation attempt                  | Same user attempts both SOD pair roles | CTO                | Block + audit review     |
| Saudization band change risk           | Saudi % within 2% of band boundary    | HR Manager + CEO   | Recruitment action       |
| Invoice retention gap                  | Record approaching deletion threshold  | Lead Accountant    | Verify archival status   |

---

## 7. Segregation of Duties (SOD) Compliance

The following SOD pairs are enforced across the 14 RBAC roles and 28 modules to
prevent fraud and ensure compliance with financial controls:

| SOD Pair                                 | Segregated Roles                        | System Enforcement                      |
|------------------------------------------|-----------------------------------------|-----------------------------------------|
| Raise PO / Approve PO                   | Procurement Agent / Branch Manager      | Approval workflow: creator cannot approve own PO |
| Create Supplier / Approve Supplier Payment| Procurement Agent / Lead Accountant    | Separate modules: network (create) vs payments (approve) |
| Post Journal / Approve Journal           | Accountant / Branch Manager or Owner    | Accounting module: poster cannot approve own journal |
| Perform Repair / Pass QC                 | Technician / QC Inspector               | Job card workflow: repair step locks before QC step |
| Issue Stock / Adjust Stock Count         | Storekeeper / Branch Manager            | Inventory module: issuer cannot perform count adjustment |

---

## 8. Non-Compliance Response

### 8.1 Incident Classification

| Level    | Definition                                           | Examples                                    |
|----------|------------------------------------------------------|---------------------------------------------|
| Critical | Regulatory penalty imminent or active investigation  | ZATCA penalty notice, PDPL breach report    |
| Major    | Compliance gap with potential penalty exposure        | Repeated ZATCA rejections, unresolved DSAR  |
| Minor    | Process deviation without immediate regulatory risk  | Late internal audit, training gap           |
| Observation | Area for improvement identified in audit          | Documentation gap, process inefficiency     |

### 8.2 Investigation and Remediation

| Step                    | Timeline        | Owner             | Output                               |
|-------------------------|-----------------|-------------------|----------------------------------------|
| Detection and reporting | Immediate       | Any employee      | Incident ticket created                |
| Initial assessment      | Within 4 hours  | Compliance Lead   | Severity classification                |
| Root cause analysis     | Within 48 hours | Relevant owner    | RCA document                           |
| Remediation plan        | Within 5 days   | Compliance Lead   | Corrective action plan with deadlines  |
| Implementation          | Per plan         | Assigned owners   | Evidence of remediation                |
| Verification            | Within 30 days  | DPO / Auditor     | Closure confirmation                   |
| Lessons learned         | Within 45 days  | Compliance Lead   | Process improvement recommendations    |

---

## 9. Cross-References

| Document                                         | Relevance                                      |
|--------------------------------------------------|-------------------------------------------------|
| [Security Architecture](../system/security/security-architecture.md) | Security controls for compliance    |
| [Authorization Matrix](../system/security/authorization-matrix.md) | RBAC and SOD enforcement           |
| [Incident Response Plan](../system/incident-response.md) | Breach and incident procedures        |
| [Data Governance Plan](data-governance-plan.md)  | Data classification and retention               |
| [Risk Management Plan](risk-management-plan.md)  | Compliance risk register items                  |
| [Quality Management Plan](quality-management-plan.md) | ZATCA quality gates                        |
| [Database Design](../system/architecture/database-design.md) | Schema and RLS implementation        |
| [Non-Functional: Compliance](../requirements/non-functional/compliance.md) | Compliance requirements    |
| [Business Plan](business-plan.md)                | Market and regulatory context                   |

---

## 10. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release                |
