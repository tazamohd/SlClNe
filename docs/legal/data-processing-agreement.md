# SALIS AUTO -- Data Processing Agreement

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-LGL-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Definitions

For the purposes of this Data Processing Agreement ("DPA"), the following terms apply:

**"Controller"** means the Organization subscribing to the SALIS AUTO platform that determines the purposes and means of processing Personal Data within its tenant environment.

**"Processor"** means SALIS AUTO, which processes Personal Data on behalf of the Controller in the course of providing the Service.

**"Sub-processor"** means any third party engaged by SALIS AUTO to process Personal Data on behalf of the Controller.

**"Personal Data"** means any data relating to an identified or identifiable natural person, as defined under Article 2 of the Saudi Personal Data Protection Law (PDPL, Royal Decree M/19, 1443H).

**"Processing"** means any operation performed on Personal Data, including collection, recording, organization, storage, retrieval, use, disclosure, transmission, erasure, or destruction.

**"Data Breach"** means any breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data.

**"PDPL"** means the Saudi Personal Data Protection Law and its implementing regulations as issued by SDAIA and NDMO.

**"Service"** means the SALIS AUTO multi-tenant automotive workshop management platform as described in the [Terms of Service](./terms-of-service.md).

**"SDAIA"** means the Saudi Data and Artificial Intelligence Authority.

---

## 2. Scope and Purpose of Processing

2.1. This DPA governs the processing of Personal Data by the Processor on behalf of the Controller in connection with the provision of the Service.

2.2. The Processor shall process Personal Data solely for the following purposes:

| Purpose                                | Data Categories                                  |
|----------------------------------------|--------------------------------------------------|
| Service delivery and operation         | All Personal Data within the Controller's tenant |
| User authentication and authorization  | Identity data, credentials, session data         |
| ZATCA Phase 2 e-invoicing compliance   | Financial data, VAT numbers, invoice records     |
| Payment processing                     | Transaction data, billing records                |
| Customer communications (transactional)| Contact data (email, phone)                      |
| Platform security and audit            | Session data, audit logs, access records         |
| Backup and disaster recovery           | All tenant data (encrypted)                      |

2.3. The Processor shall not process Personal Data for any purpose other than those specified in this DPA and the documented instructions of the Controller, unless required to do so by the laws of the Kingdom of Saudi Arabia, in which case the Processor shall inform the Controller of such legal requirement before processing (unless prohibited by law).

2.4. The categories of data subjects whose Personal Data is processed include: workshop customers, vehicle owners, Organization employees, suppliers, and fleet contacts.

---

## 3. Processor Obligations

### 3.1 Confidentiality

3.1.1. The Processor shall ensure that all personnel authorized to process Personal Data have committed themselves to confidentiality obligations or are under an appropriate statutory obligation of confidentiality.

3.1.2. Access to Personal Data shall be restricted to personnel who require access for the performance of the Service, in accordance with the principle of least privilege.

### 3.2 Security Measures

The Processor shall implement and maintain the following technical and organizational measures:

| Category                  | Measure                                           |
|---------------------------|---------------------------------------------------|
| Encryption at Rest        | AES-256 encryption for all stored data            |
| Encryption in Transit     | TLS 1.3 for all data transmissions                |
| Access Control            | Role-based access with 14 RBAC roles              |
| Multi-Tenant Isolation    | Row-Level Security (RLS) on all 53 tenant tables  |
| Password Security         | bcrypt hashing with per-password salt             |
| Token Security            | SHA-256 hashing; randomBytes(32) for generation   |
| Audit Trail               | Append-only, same-transaction audit logging        |
| Credential Protection     | Automatic scrubbing of secrets from audit payloads|
| Log Protection            | PII redaction at serializer level                  |
| API Security              | CSP headers, X-Frame-Options: DENY, CORS controls|
| Error Handling            | No exposure of internal schema or stack traces     |
| Export Controls           | CSV formula injection prevention; 50,000 row limit|
| Data Minimization         | Only necessary PII collected; derived fields computed server-side |

A complete description of security measures is maintained in the [Data Protection](../system/security/data-protection.md) documentation.

### 3.3 Staff Training

3.3.1. The Processor shall ensure that all staff involved in the processing of Personal Data receive appropriate training on PDPL compliance, data protection principles, and the Processor's security policies.

3.3.2. Training shall be conducted upon hiring and at least annually thereafter.

3.3.3. The Processor shall maintain records of training completion and make these available to the Controller upon request.

---

## 4. Sub-processor Management

### 4.1 Current Sub-processors

The Controller authorizes the Processor to engage the following Sub-processors:

| Sub-processor            | Processing Activity                           | Data Processed                      | Location            |
|--------------------------|-----------------------------------------------|--------------------------------------|---------------------|
| Cloud hosting provider   | Infrastructure hosting, data storage, backups | All tenant data (encrypted)          | Kingdom of Saudi Arabia |
| ZATCA (Fatoora Platform) | E-invoice clearance and reporting             | Invoice data, VAT numbers, XML      | Kingdom of Saudi Arabia |
| Stripe                   | Payment processing                            | Transaction amounts, payment tokens  | Compliant jurisdiction |
| SMS provider             | OTP delivery and notifications                | Phone numbers, message content       | Kingdom of Saudi Arabia |
| Email service provider   | Transactional email delivery                  | Email addresses, notification content| Compliant jurisdiction |

### 4.2 Authorization and Notification

4.2.1. The Controller grants general written authorization for the Processor to engage Sub-processors listed in Section 4.1.

4.2.2. The Processor shall notify the Controller in writing at least thirty (30) days before engaging any new Sub-processor or replacing an existing Sub-processor, providing details of the Sub-processor's identity, location, and processing activities.

4.2.3. The Controller may object to a new Sub-processor within fifteen (15) days of notification. If the Controller objects on reasonable data protection grounds and the parties cannot reach a resolution, the Controller may terminate the affected Service component without penalty.

### 4.3 Sub-processor Obligations

4.3.1. The Processor shall impose contractual obligations on each Sub-processor that are no less protective than those set out in this DPA, including confidentiality, security measures, and data protection requirements.

4.3.2. The Processor shall remain fully liable to the Controller for the performance of each Sub-processor's data protection obligations.

---

## 5. Data Breach Notification

### 5.1 Processor to Controller Notification

| Step                           | Timeline              | Content                                        |
|--------------------------------|-----------------------|------------------------------------------------|
| Initial notification           | Within 24 hours       | Nature of breach, categories of data affected  |
| Detailed assessment            | Within 48 hours       | Estimated number of data subjects, consequences|
| Remediation update             | Within 72 hours       | Measures taken to contain and mitigate          |
| Final incident report          | Within 30 days        | Root cause analysis and preventive measures     |

5.1.1. The Processor shall notify the Controller without undue delay and in any event within twenty-four (24) hours of becoming aware of a Data Breach affecting the Controller's Personal Data.

5.1.2. The notification shall include, to the extent known:
- The nature of the Data Breach including, where possible, the categories and approximate number of data subjects concerned;
- The name and contact details of the Processor's Data Protection Officer;
- A description of the likely consequences of the Data Breach;
- A description of the measures taken or proposed to address the Data Breach.

### 5.2 Controller to Authority Notification

5.2.1. The Controller is responsible for notifying SDAIA/NDMO within seventy-two (72) hours of becoming aware of a Data Breach, as required by the PDPL.

5.2.2. The Processor shall provide the Controller with all information reasonably necessary to fulfill the Controller's notification obligations to the competent authority and to affected data subjects.

### 5.3 Cooperation

The Processor shall cooperate with the Controller in investigating, remediating, and mitigating the effects of a Data Breach, including preserving evidence, conducting forensic analysis, and implementing corrective measures.

---

## 6. Data Subject Request Assistance

6.1. The Processor shall promptly assist the Controller in responding to data subject requests exercising rights under the PDPL, including:

| Right                        | Processor Assistance                                        |
|------------------------------|-------------------------------------------------------------|
| Right to Access (Art. 4)     | Provide data export in JSON/PDF format                     |
| Right to Correction (Art. 5) | Apply corrections to Personal Data as instructed            |
| Right to Portability (Art. 6)| Generate machine-readable export (JSON)                    |
| Right to Restrict (Art. 7)   | Apply processing pause flag on account                     |
| Right to Erasure (Art. 8)    | Execute PII purge with financial data exemption            |
| Right to Object (Art. 9)     | Apply marketing opt-out and processing objection           |

6.2. The Processor shall notify the Controller within two (2) business days of receiving a data subject request directed to the Processor.

6.3. The Processor shall not respond directly to data subject requests unless authorized to do so by the Controller, except to direct the data subject to the Controller.

6.4. Financial records subject to ZATCA retention requirements (7-year retention) and immutable audit log entries are exempt from erasure requests. Such data shall be anonymized where technically feasible.

---

## 7. Audit Rights and Inspection

7.1. The Processor shall make available to the Controller all information necessary to demonstrate compliance with the obligations set out in this DPA.

7.2. The Controller or its designated auditor may conduct audits and inspections of the Processor's data processing activities, subject to:
- Thirty (30) days' advance written notice;
- Reasonable scope and duration;
- Confidentiality obligations on the auditor;
- No more than one (1) audit per twelve (12) month period, unless a Data Breach has occurred or a regulatory authority requires an audit.

7.3. The Processor shall cooperate with audits and provide reasonable access to relevant facilities, systems, documentation, and personnel.

7.4. The Controller shall bear the costs of any audit, except where the audit reveals material non-compliance by the Processor, in which case the Processor shall bear reasonable audit costs.

7.5. The Processor shall promptly remediate any material non-compliance identified during an audit and provide the Controller with evidence of remediation.

---

## 8. Data Deletion and Return Upon Termination

8.1. Upon termination or expiry of the Service agreement, the Processor shall, at the Controller's election:

| Option            | Description                                              | Timeline              |
|-------------------|----------------------------------------------------------|-----------------------|
| Data Return       | Provide all Personal Data in machine-readable format (JSON) | Within 30 days     |
| Data Deletion     | Securely delete all Personal Data from active systems    | Within 90 days        |
| Certification     | Provide written certification of deletion                | Upon completion       |

8.2. The Controller shall communicate its election within thirty (30) days of termination. In the absence of instruction, the Processor shall delete Personal Data upon expiry of the ninety (90) day post-termination retention period.

8.3. **Exceptions to Deletion**: The Processor may retain Personal Data to the extent required by the laws of the Kingdom of Saudi Arabia, including:
- Financial records required by ZATCA regulations (7-year retention);
- Audit trail data required for regulatory compliance (append-only, immutable);
- Data required by ongoing legal proceedings.

8.4. Retained data shall continue to be protected in accordance with this DPA and shall be processed solely for the purpose of complying with legal obligations.

8.5. Backup copies containing Personal Data shall be deleted in accordance with the backup retention schedule (14 to 90 days depending on Subscription tier).

---

## 9. International Data Transfer Safeguards

9.1. All primary data processing occurs within the Kingdom of Saudi Arabia. The Processor hosts all data in data centers located within Saudi Arabia in compliance with PDPL and the Cloud Computing Regulations.

9.2. Where a Sub-processor is located outside the Kingdom of Saudi Arabia, the Processor shall ensure that:
- The receiving jurisdiction has been assessed as providing adequate data protection by SDAIA; or
- Appropriate contractual safeguards are in place, including standard data protection clauses approved by SDAIA; and
- The transfer is conducted in accordance with the requirements of the PDPL.

9.3. The Processor shall not transfer Personal Data outside the Kingdom of Saudi Arabia without the prior written consent of the Controller, except where required by law.

9.4. A current list of Sub-processor locations is maintained in Section 4.1.

---

## 10. Liability and Indemnification

10.1. Each party shall be liable for any damage caused by processing that infringes the PDPL to the extent attributable to its acts or omissions.

10.2. The Processor shall indemnify the Controller against any fines, penalties, damages, or costs arising from a Data Breach caused by the Processor's failure to comply with its obligations under this DPA, provided that:
- The Controller provides prompt written notice of the claim;
- The Controller allows the Processor reasonable control over the defense;
- The Controller cooperates in the defense of the claim.

10.3. The Processor's total liability under this DPA shall be subject to the limitation of liability provisions in the [Terms of Service](./terms-of-service.md), except that no limitation shall apply to liability arising from the Processor's willful misconduct or gross negligence.

10.4. The Controller shall indemnify the Processor against claims arising from the Controller's breach of its obligations as Data Controller under the PDPL.

---

## 11. Term and Termination

11.1. This DPA shall take effect upon the effective date of the Service agreement between the Controller and the Processor and shall continue for the duration of the Service agreement.

11.2. This DPA shall automatically terminate upon termination or expiry of the Service agreement, subject to the data deletion and return provisions in Section 8.

11.3. Sections 5, 7, 8, 9, and 10 shall survive termination of this DPA.

11.4. Either party may terminate this DPA immediately upon written notice if:
- The other party commits a material breach that is not remedied within thirty (30) days of written notice;
- The other party becomes insolvent or enters into bankruptcy proceedings;
- A regulatory authority orders cessation of processing.

---

## 12. General Provisions

12.1. **Governing Law**: This DPA shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.

12.2. **Conflict**: In the event of any conflict between this DPA and the [Terms of Service](./terms-of-service.md), the provisions of this DPA shall prevail with respect to data protection matters.

12.3. **Amendments**: This DPA may be amended only by written agreement signed by authorized representatives of both parties.

12.4. **Severability**: If any provision of this DPA is held to be unenforceable, the remaining provisions shall continue in full force and effect.

12.5. **Entire Agreement**: This DPA, together with the Terms of Service and Privacy Policy, constitutes the entire agreement between the parties regarding data processing.

---

## 13. Cross-References

| Document                                                       | Relevance                            |
|----------------------------------------------------------------|--------------------------------------|
| [Terms of Service](./terms-of-service.md)                      | Service agreement and liability      |
| [Privacy Policy](./privacy-policy.md)                          | Data collection and processing       |
| [Acceptable Use Policy](./acceptable-use-policy.md)            | Permitted use of the Service         |
| [Data Protection](../system/security/data-protection.md)       | Technical security measures          |
| [Security Architecture](../system/security/security-architecture.md) | Security controls                |
| [Compliance Management Plan](../management/compliance-management-plan.md) | Regulatory compliance framework |
| [Compliance Requirements](../requirements/non-functional/compliance.md) | PDPL and ZATCA requirements   |

---

## 14. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-09-02 | SALIS AUTO PMO   | Initial release                |
