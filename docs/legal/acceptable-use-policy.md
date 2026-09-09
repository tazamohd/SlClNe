# SALIS AUTO -- Acceptable Use Policy

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-LGL-004                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Purpose

This Acceptable Use Policy ("AUP") defines the permitted and prohibited uses of the SALIS AUTO multi-tenant automotive workshop management platform ("Service"). This AUP is incorporated by reference into the [Terms of Service](./terms-of-service.md) and applies to all Users across all 14 RBAC roles and all 28 modules.

All Users are required to comply with this AUP. Violation may result in enforcement actions up to and including termination of access to the Service.

---

## 2. Permitted Use

2.1. The Service is designed and licensed exclusively for legitimate automotive workshop management operations, including but not limited to:

- Management of workshop operations, job cards, service bays, and quality control processes;
- Vehicle and customer registry management;
- Financial operations including invoicing, payments, ZATCA Phase 2 e-invoicing, and VAT compliance;
- Accounting and general ledger management;
- Parts inventory, procurement, and supplier management;
- Human resources, employee management, payroll, and attendance tracking;
- Customer relationship management, marketing campaigns, and lead management;
- Call center operations and appointment scheduling;
- Business reporting and analytics;
- Customer-facing services through the CustomerAppShell mobile application;
- API integrations as permitted by the Organization's Subscription tier.

2.2. The Organization shall use the Service only in accordance with its Subscription plan and applicable laws and regulations of the Kingdom of Saudi Arabia.

---

## 3. Prohibited Activities

The following activities are strictly prohibited:

### 3.1 Unauthorized Access

- Accessing or attempting to access the Service using another User's credentials;
- Bypassing or attempting to bypass authentication, authorization, or role-based access controls;
- Escalating privileges beyond those assigned to the User's RBAC role;
- Accessing or attempting to access administrative functions without the appropriate role;
- Using shared or generic credentials except where explicitly permitted by the Organization's Owner.

### 3.2 Multi-Tenant Isolation Violations

- Accessing, attempting to access, or probing for data belonging to another Organization (tenant);
- Exploiting Row-Level Security (RLS) policies or any other data isolation mechanism;
- Attempting to identify, enumerate, or confirm the existence of other tenants;
- Sharing tenant-specific data, credentials, or access tokens across Organization boundaries.

### 3.3 Reverse Engineering and Exploitation

- Reverse engineering, decompiling, disassembling, or otherwise attempting to derive the source code of the Service;
- Modifying, adapting, translating, or creating derivative works based on the Service;
- Circumventing or attempting to circumvent any technical protection measures, including encryption, hash chains, or audit trail immutability;
- Exploiting vulnerabilities, bugs, or errors in the Service for any purpose, including data access, privilege escalation, or service disruption;
- Conducting unauthorized security testing, penetration testing, or vulnerability scanning without prior written consent from SALIS AUTO.

### 3.4 Data Scraping and Extraction

- Automated scraping, crawling, or harvesting of data from the Service by any means not authorized by the API;
- Bulk extraction of data exceeding the export limits (50,000 rows per export) through repeated or automated requests;
- Using the API to systematically download or replicate the Service's database or any substantial portion thereof;
- Circumventing export controls or CSV formula injection protections.

### 3.5 Malware and Harmful Activities

- Uploading, distributing, or executing malicious software, viruses, worms, trojans, ransomware, or other harmful code;
- Introducing code designed to disrupt, damage, or interfere with the Service or its infrastructure;
- Conducting denial-of-service attacks or any action intended to degrade Service availability;
- Attempting to access, modify, or delete backup or disaster recovery systems.

---

## 4. API Usage Limits

4.1. API access is subject to the following rate limits based on Subscription tier:

| Tier           | API Access     | Rate Limit               | Burst Limit              |
|----------------|----------------|--------------------------|--------------------------|
| Starter        | Not included   | N/A                      | N/A                      |
| Starter + Add-on | Read-only    | 60 requests/minute       | 100 requests/minute      |
| Professional   | Read-only      | 120 requests/minute      | 200 requests/minute      |
| Professional + Add-on | Full (R/W) | 120 requests/minute  | 200 requests/minute      |
| Enterprise     | Full (R/W)     | 300 requests/minute      | 500 requests/minute      |

4.2. Requests exceeding rate limits shall receive HTTP 429 (Too Many Requests) responses. The Organization shall implement appropriate backoff logic.

4.3. API usage shall comply with all RBAC and field-level redaction rules. API requests are subject to the same authorization and audit trail logging as interactive use.

4.4. API credentials shall be treated as confidential. The Organization is responsible for securing API keys and tokens and shall rotate them at least every ninety (90) days.

---

## 5. Data Integrity Requirements

5.1. Organizations are solely responsible for the accuracy and completeness of all data entered into the Service.

5.2. **ZATCA Compliance**: All financial records, invoices, and VAT calculations must be accurate and compliant with ZATCA Phase 2 requirements. The Organization acknowledges that:
- Invoices form part of a cryptographic hash chain (SHA-256) and cannot be retroactively modified;
- Invoice XML must conform to UBL 2.1 format for ZATCA submission;
- QR codes are generated from the TLV-encoded invoice data and must reflect accurate totals;
- VAT at 15% must be correctly calculated and reflected in all tax invoices;
- All monetary values are stored as integer halalas (bigint) to ensure precision.

5.3. The Organization shall not enter false, misleading, or fraudulent data into the Service, particularly in financial modules subject to ZATCA reporting.

5.4. The Organization shall maintain accurate employee records as required by Saudi Labor Law, including hire dates, salary data, leave records, and working hours.

---

## 6. Multi-Tenant Isolation

6.1. The Service operates on a multi-tenant architecture with strict data isolation enforced by Row-Level Security (RLS) across all 53 tenant-owned tables.

6.2. Users shall not:
- Attempt to query, access, or infer data belonging to other tenants;
- Share credentials or sessions that could facilitate cross-tenant access;
- Report receiving data that appears to belong to another tenant (this must be reported immediately per Section 8).

6.3. Cross-tenant data access attempts are logged, monitored, and may trigger automated security responses.

6.4. Cross-tenant requests return HTTP 404 (not 403) to prevent confirming the existence of records in other tenants.

---

## 7. Content Restrictions

7.1. Users shall not upload, store, or transmit through the Service any content that:
- Is illegal under the laws of the Kingdom of Saudi Arabia;
- Is fraudulent, deceptive, or misleading;
- Infringes on the intellectual property rights of any third party;
- Contains hate speech, discriminatory content, or incitement to violence;
- Contains sexually explicit or pornographic material;
- Violates the privacy rights of any individual;
- Constitutes harassment, defamation, or threats against any person;
- Violates Saudi public morals, Islamic values, or societal norms.

7.2. SALIS AUTO reserves the right to remove content that violates this section without prior notice.

---

## 8. Security Responsibilities

### 8.1 Password Management

- Users shall create strong passwords and shall not reuse passwords across services;
- Passwords shall not be shared with other Users;
- Users shall change passwords immediately if compromise is suspected;
- The Organization's Owner shall enforce appropriate password policies within the platform settings.

### 8.2 Shared Device Policies

- Users accessing the Service from shared devices (workshop terminals, service desks) shall log out after each session;
- Users shall not save credentials in browser password managers on shared devices;
- The Organization shall configure appropriate session timeout settings;
- Users shall lock or log out of devices when leaving them unattended.

### 8.3 OTP and Two-Factor Authentication

- OTP codes shall not be shared with other individuals;
- Users shall report any unsolicited OTP messages immediately;
- The Organization should enable two-factor authentication where available.

### 8.4 Incident Reporting

- Users shall report any suspected security incidents, data breaches, or unauthorized access to the Organization's Owner or SALIS AUTO support immediately;
- Contact: security@salisauto.com.

---

## 9. Reporting Violations

9.1. Any User who becomes aware of a violation of this AUP shall report it promptly to:
- The Organization's Owner or designated administrator; and/or
- SALIS AUTO at abuse@salisauto.com.

9.2. Reports may be submitted anonymously. SALIS AUTO shall investigate all reports in good faith and shall not retaliate against individuals reporting violations in good faith.

9.3. SALIS AUTO shall acknowledge receipt of a violation report within two (2) business days and shall provide an update on the investigation within ten (10) business days.

---

## 10. Enforcement Actions

10.1. Violations of this AUP shall be addressed through a graduated enforcement framework:

| Level     | Action                              | Trigger                                        | Duration              |
|-----------|-------------------------------------|------------------------------------------------|-----------------------|
| Warning   | Written notice to Organization Owner| First minor violation or unintentional breach  | Recorded permanently  |
| Restriction| Feature or module access limited   | Repeated minor violations or single moderate violation | Until remediation |
| Suspension| Full account access suspended       | Serious violation or failure to remediate      | Pending investigation |
| Termination| Permanent account termination      | Critical violation, illegal activity, or continued non-compliance | Permanent |

10.2. SALIS AUTO reserves the right to bypass the graduated framework and immediately suspend or terminate access in cases involving:
- Immediate threat to the security or integrity of the multi-tenant environment;
- Illegal activity or violation of Saudi law;
- Imminent harm to other Organizations, Users, or third parties;
- Court order or regulatory directive.

10.3. Upon suspension or termination, the data retention and export provisions of the [Terms of Service](./terms-of-service.md) Section 8.3 shall apply.

---

## 11. Consequences of Violation

11.1. In addition to enforcement actions, violations of this AUP may result in:
- Forfeiture of any remaining prepaid Subscription fees;
- Liability for damages caused to SALIS AUTO, other Organizations, or third parties;
- Referral to law enforcement authorities where illegal activity is suspected;
- Reporting to ZATCA or other regulatory authorities where violations involve tax fraud or financial misconduct;
- Civil or criminal liability under the laws of the Kingdom of Saudi Arabia, including PDPL penalties of up to SAR 5,000,000 and/or imprisonment for data protection violations.

11.2. The Organization shall indemnify SALIS AUTO against any losses, damages, or penalties resulting from its Users' violation of this AUP.

---

## 12. Modifications to This Policy

12.1. SALIS AUTO reserves the right to modify this AUP at any time. Changes shall be communicated via in-platform notification and email at least fifteen (15) days prior to the effective date.

12.2. Continued use of the Service after the effective date constitutes acceptance of the modified AUP.

---

## 13. Cross-References

| Document                                                       | Relevance                            |
|----------------------------------------------------------------|--------------------------------------|
| [Terms of Service](./terms-of-service.md)                      | Governing contractual terms          |
| [Privacy Policy](./privacy-policy.md)                          | Data protection and privacy          |
| [Data Processing Agreement](./data-processing-agreement.md)    | Processor obligations                |
| [Cookie Policy](./cookie-policy.md)                            | Cookie and tracking usage            |
| [EULA](./end-user-license-agreement.md)                        | Mobile application license           |
| [Data Protection](../system/security/data-protection.md)       | Technical security measures          |
| [Security Architecture](../system/security/security-architecture.md) | Security controls and RBAC    |
| [Authorization Matrix](../system/security/authorization-matrix.md) | Role permissions                 |
| [Compliance Requirements](../requirements/non-functional/compliance.md) | Regulatory requirements      |

---

## 14. Contact Information

For questions about this AUP or to report violations:

| Contact                      | Detail                                |
|------------------------------|---------------------------------------|
| Abuse Reports                | abuse@salisauto.com                   |
| Security Incidents           | security@salisauto.com                |
| General Inquiries            | legal@salisauto.com                   |

---

## 15. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-09-02 | SALIS AUTO PMO   | Initial release                |
