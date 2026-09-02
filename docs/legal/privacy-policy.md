# SALIS AUTO -- Privacy Policy

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-LGL-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Introduction

This Privacy Policy describes how SALIS AUTO ("we," "us," or "our") collects, uses, stores, shares, and protects personal data in connection with the SALIS AUTO multi-tenant automotive workshop management platform ("Service"). This policy is drafted in compliance with the Saudi Personal Data Protection Law (PDPL, Royal Decree M/19, 1443H) and its implementing regulations as issued by the Saudi Data and Artificial Intelligence Authority (SDAIA) and the National Data Management Office (NDMO).

This policy applies to all Users of the Service across all 14 RBAC roles, all 28 modules, and all access channels including web applications and the customer mobile application (CustomerAppShell).

Both English and Arabic versions of this policy are available. In the event of conflict, the Arabic version prevails.

---

## 2. Data Controller Identity

| Field                    | Detail                                          |
|--------------------------|-------------------------------------------------|
| Data Controller          | SALIS AUTO                                      |
| Registered Address       | Riyadh, Kingdom of Saudi Arabia                 |
| Contact Email            | privacy@salisauto.com                           |
| Data Protection Officer  | dpo@salisauto.com                               |
| Commercial Registration  | As registered with the Ministry of Commerce     |

SALIS AUTO acts as the Data Controller for platform-level data (User accounts, usage analytics, platform operations) and as a Data Processor for Organization-level Content on behalf of each subscribing Organization, which acts as the Data Controller for its own tenant data.

---

## 3. Types of Data Collected

### 3.1 Personal Data

| Data Category            | Data Elements                                    | Source                        |
|--------------------------|--------------------------------------------------|-------------------------------|
| Identity Data            | Name, name (Arabic), national ID reference       | Account registration          |
| Contact Data             | Email address, phone number, postal address       | Account registration, profile |
| Employment Data          | Job title, hire date, employment status, role     | HR module                     |
| Authentication Data      | Password hash (bcrypt), OTP code hash (SHA-256)  | Login and verification        |

### 3.2 Vehicle Data

| Data Category            | Data Elements                                    | Source                        |
|--------------------------|--------------------------------------------------|-------------------------------|
| Vehicle Identity         | VIN, plate number, make, model, year, color      | Vehicle registration module   |
| Service History          | Job cards, repairs, inspections, parts replaced  | Workshop operations           |
| Mileage Records          | Odometer readings at each service visit           | Service check-in              |

### 3.3 Financial Data

| Data Category            | Data Elements                                    | Source                        |
|--------------------------|--------------------------------------------------|-------------------------------|
| Billing Data             | Invoice records, payment history, credit terms   | Finance module                |
| Tax Data                 | VAT registration number, tax calculations        | ZATCA integration             |
| Payroll Data             | Salary (halalas), allowances, deductions, net pay| HR and Payroll modules        |
| Bank Data                | Bank statement records                            | Accounting module             |

### 3.4 Usage Data

| Data Category            | Data Elements                                    | Source                        |
|--------------------------|--------------------------------------------------|-------------------------------|
| Session Data             | IP address, user agent, session timestamps        | Authentication system         |
| Audit Data               | Actor ID, action performed, entity affected       | Append-only audit log         |
| Platform Analytics       | Feature usage patterns, module access frequency   | Application telemetry         |

---

## 4. Legal Basis for Processing

In accordance with the PDPL, we process personal data on the following legal bases:

| Legal Basis                     | Applicable Processing Activities                              |
|---------------------------------|---------------------------------------------------------------|
| Consent (PDPL Art. 6)          | Marketing communications, analytics cookies, optional features|
| Contractual Necessity (Art. 6) | Service delivery, account management, billing, support        |
| Legal Obligation (Art. 6)      | ZATCA e-invoicing, VAT compliance, labor law reporting, GOSI  |
| Legitimate Interest (Art. 6)   | Platform security, fraud prevention, service improvement      |
| Vital Interest                  | Emergency contact in case of workplace safety incidents       |

---

## 5. Purpose of Data Processing

### 5.1 Personal Data Purposes

- Provision and operation of the Service across all 28 modules
- User authentication, authorization, and session management
- Role-based access control enforcement across 14 RBAC roles
- Communication regarding the Service (transactional notifications, support)
- Bilingual interface delivery (English/Arabic) based on User preference

### 5.2 Vehicle Data Purposes

- Workshop operations management (job cards, service tracking)
- Vehicle history maintenance and service scheduling
- Customer-facing service tracking via the CustomerAppShell application

### 5.3 Financial Data Purposes

- Invoice generation and ZATCA Phase 2 e-invoicing compliance
- VAT calculation at the standard rate of 15%
- Payment processing and accounts receivable management
- Payroll processing in compliance with Saudi Labor Law and WPS requirements
- Financial reporting and audit trail maintenance

### 5.4 Usage Data Purposes

- Platform security monitoring and incident detection
- Audit trail completeness (append-only, immutable audit log)
- Segregation of duties enforcement
- Service performance optimization

---

## 6. Data Retention Periods

| Data Category               | Retention Period                          | Legal Basis                        |
|-----------------------------|-------------------------------------------|------------------------------------|
| Financial records           | 7 years from creation                    | ZATCA regulations, Commercial Law  |
| E-invoice XML and hash chain| 7 years from issuance                    | ZATCA Phase 2 requirements         |
| ZATCA API responses         | 7 years from submission                  | ZATCA compliance                   |
| Personal identity data (PII)| 3 years after last account activity      | PDPL data minimization principle   |
| Employee records            | Duration of employment + 5 years         | Saudi Labor Law, GOSI              |
| Audit logs                  | Indefinite (append-only, immutable)      | Regulatory and forensic integrity  |
| Session and access logs     | 1 year from creation                     | Security monitoring                |
| Marketing consent records   | Duration of consent + 2 years            | PDPL consent records               |
| Backup data                 | Per Subscription tier (14-90 days)       | Service continuity                 |
| Post-termination data       | 90 days after Subscription termination   | Data portability period            |

---

## 7. Data Sharing and Third Parties

### 7.1 Third-Party Recipients

| Third Party               | Data Shared                          | Purpose                          | Legal Basis              |
|----------------------------|--------------------------------------|----------------------------------|--------------------------|
| ZATCA (Fatoora Platform)  | Invoice data, VAT numbers, XML      | E-invoicing clearance/reporting  | Legal obligation         |
| Payment processor (Stripe)| Transaction amounts, payment tokens  | Payment processing               | Contractual necessity    |
| SMS provider              | Phone numbers, message content       | OTP delivery, notifications      | Contractual necessity    |
| Email service provider    | Email addresses, notification content| Transactional emails             | Contractual necessity    |
| Cloud hosting provider    | All platform data (encrypted)        | Infrastructure hosting           | Contractual necessity    |

### 7.2 Safeguards

All third-party processors are bound by Data Processing Agreements that require:
- Processing only on documented instructions
- Appropriate technical and organizational security measures
- Confidentiality obligations for personnel
- Assistance with data subject rights requests
- Return or deletion of data upon termination

For full details, see the [Data Processing Agreement](./data-processing-agreement.md).

### 7.3 No Sale of Personal Data

SALIS AUTO does not sell, rent, or trade personal data to third parties for their marketing purposes.

---

## 8. Cross-Border Data Transfers

8.1. All primary data storage and processing occurs within the Kingdom of Saudi Arabia in compliance with PDPL data residency requirements and the Cloud Computing Regulations issued by the Communications, Space and Technology Commission (CST) and the National Cybersecurity Authority (NCA).

8.2. The following data categories are subject to strict Saudi residency requirements:

| Data Type                 | Residency Requirement    |
|---------------------------|--------------------------|
| Customer PII              | Kingdom of Saudi Arabia  |
| Financial and VAT data    | Kingdom of Saudi Arabia  |
| Employee records          | Kingdom of Saudi Arabia  |
| Invoice data              | Kingdom of Saudi Arabia  |
| Authentication credentials| Kingdom of Saudi Arabia  |
| Audit logs                | Kingdom of Saudi Arabia  |

8.3. Backups and replicas are subject to the same residency constraints as primary data.

8.4. Cross-border transfers are permitted only to jurisdictions with adequate data protection as assessed by SDAIA, under the conditions specified in the PDPL, and only with appropriate safeguards including contractual clauses and DPAs.

8.5. No personal data is transferred to jurisdictions outside the GCC without explicit data subject consent and SDAIA authorization where required.

---

## 9. Data Subject Rights Under PDPL

In accordance with the PDPL, data subjects have the following rights:

| Right                      | PDPL Article | How to Exercise                                | Response Time      |
|----------------------------|-------------|------------------------------------------------|--------------------|
| Right to Access            | Art. 4      | Self-service data export (JSON/PDF) or written request | Immediate (self-service) or 10 business days |
| Right to Correction        | Art. 5      | Profile edit in platform or support ticket     | 5 business days    |
| Right to Portability       | Art. 6      | Written request for machine-readable export (JSON) | 10 business days |
| Right to Restrict Processing| Art. 7     | Written request; processing pause flag applied | 3 business days    |
| Right to Erasure           | Art. 8      | Written request; automated PII purge with financial data exemption | 30 days |
| Right to Object            | Art. 9      | Marketing opt-out via platform settings; processing objection form | 3 business days |

9.1. **Financial Data Exemption**: Data subject erasure requests shall not extend to financial records required to be retained under ZATCA regulations (7-year retention) or audit log entries (immutable, append-only). Such data shall be anonymized rather than deleted where technically feasible.

9.2. **Request Submission**: Data subject access requests (DSARs) may be submitted via email to dpo@salisauto.com or through the platform's privacy settings.

9.3. **Identity Verification**: SALIS AUTO shall verify the identity of the requester before processing any DSAR to prevent unauthorized disclosure.

---

## 10. Children's Data

The Service is a business-to-business (B2B) platform designed for automotive workshop management. The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected data from a minor, we shall promptly delete such data.

---

## 11. Security Measures

SALIS AUTO implements the following technical and organizational measures to protect personal data:

### 11.1 Technical Measures

| Measure                        | Implementation                                    |
|--------------------------------|---------------------------------------------------|
| Encryption at Rest             | AES-256 encryption for stored data                |
| Encryption in Transit          | TLS 1.3 for all data transmission                 |
| Password Hashing               | bcrypt with per-password salt                     |
| Token Security                 | SHA-256 hashing of refresh tokens; randomBytes(32)|
| OTP Security                   | SHA-256 hashing with attempt limits and expiry    |
| Multi-Tenant Isolation         | Row-Level Security (RLS) on all 53 tenant tables  |
| API Security                   | Content-Security-Policy, X-Frame-Options: DENY    |
| Log Protection                 | PII redaction at serializer level (Pino)          |

### 11.2 Organizational Measures

| Measure                        | Implementation                                    |
|--------------------------------|---------------------------------------------------|
| Role-Based Access Control      | 14 defined roles with field-level redaction        |
| Segregation of Duties          | Enforced SOD pairs for critical operations         |
| Audit Trail                    | Append-only, same-transaction audit logging        |
| Credential Scrubbing           | Automatic removal of secrets from audit payloads  |
| Data Minimization              | Only necessary PII collected; derived fields computed server-side |
| Export Protection               | CSV formula injection prevention; 50,000 row limit|
| Error Sanitization             | Internal errors never expose stack traces or schema|

For complete details, refer to the [Data Protection](../system/security/data-protection.md) documentation.

---

## 12. Cookie Usage

SALIS AUTO uses cookies and similar technologies to operate and improve the Service. For comprehensive information about the types of cookies used, their purposes, and how to manage cookie preferences, please refer to our [Cookie Policy](./cookie-policy.md).

---

## 13. Breach Notification

In the event of a personal data breach, SALIS AUTO shall follow the notification procedures mandated by the PDPL:

| Step                          | Timeline              | Recipient                    | Content                           |
|-------------------------------|-----------------------|------------------------------|-----------------------------------|
| Internal detection            | Immediate             | CTO and Data Protection Officer | Nature, scope, and affected data |
| Risk assessment               | Within 4 hours        | Risk Committee               | Impact assessment and containment |
| Authority notification        | Within 72 hours       | SDAIA / NDMO                 | Formal breach report per PDPL    |
| Data subject notification     | Without undue delay   | Affected individuals         | Plain language notice (EN + AR)  |
| Post-incident report          | Within 30 days        | SDAIA and internal records   | Root cause and remediation plan  |

13.1. Where SALIS AUTO acts as a Data Processor, notification to the Data Controller (the Organization) shall be provided within twenty-four (24) hours of becoming aware of the breach, in accordance with the [Data Processing Agreement](./data-processing-agreement.md).

13.2. Breach notifications to data subjects shall be provided in both English and Arabic, in clear and plain language, and shall include the nature of the breach, the categories of data affected, likely consequences, and measures taken.

---

## 14. Contact Information

For data protection inquiries, DSARs, or complaints:

| Contact                      | Detail                                |
|------------------------------|---------------------------------------|
| Data Protection Officer      | dpo@salisauto.com                     |
| General Privacy Inquiries    | privacy@salisauto.com                 |
| Postal Address               | SALIS AUTO, Riyadh, Kingdom of Saudi Arabia |
| Regulatory Authority         | SDAIA (Saudi Data and Artificial Intelligence Authority) |

---

## 15. Changes to This Policy

15.1. SALIS AUTO reserves the right to update this Privacy Policy to reflect changes in our practices, regulatory requirements, or applicable law.

15.2. Material changes shall be communicated via in-platform notification and email at least thirty (30) days prior to the effective date.

15.3. The "Date" field in the document header indicates the date of the most recent revision.

15.4. Continued use of the Service after the effective date constitutes acceptance of the updated policy. Users who do not agree may terminate their Subscription per the [Terms of Service](./terms-of-service.md).

---

## 16. Cross-References

| Document                                                       | Relevance                            |
|----------------------------------------------------------------|--------------------------------------|
| [Terms of Service](./terms-of-service.md)                      | Contractual terms governing Service  |
| [Data Processing Agreement](./data-processing-agreement.md)    | Processor obligations and safeguards |
| [Acceptable Use Policy](./acceptable-use-policy.md)            | Permitted and prohibited use         |
| [Cookie Policy](./cookie-policy.md)                            | Cookie usage details                 |
| [EULA](./end-user-license-agreement.md)                        | Mobile application license           |
| [Data Protection](../system/security/data-protection.md)       | Technical security measures          |
| [Compliance Management Plan](../management/compliance-management-plan.md) | Regulatory compliance framework |
| [Compliance Requirements](../requirements/non-functional/compliance.md) | PDPL and ZATCA requirements   |

---

## 17. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-09-02 | SALIS AUTO PMO   | Initial release                |
