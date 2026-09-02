# SALIS AUTO -- ZATCA Compliance Checklist

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-003                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document provides a comprehensive checklist for verifying ZATCA (Zakat, Tax and Customs Authority) Phase 2 e-invoicing compliance within the SALIS AUTO platform. Phase 2 ("Integration Phase") requires real-time or near-real-time invoice reporting to the ZATCA Fatoora Platform via API. Non-compliance can result in penalties ranging from SAR 5,000 to SAR 50,000 per violation. For technical integration details, see [ZATCA Integration](../../system/integration/zatca-integration.md).

---

## 2. ZATCA Phase 2 Overview

### 2.1 Key Requirements

| Requirement              | Description                                       |
|--------------------------|---------------------------------------------------|
| Real-time reporting      | Invoices submitted to ZATCA within 24 hours        |
| Cryptographic stamping   | Each invoice digitally signed with ZATCA certificate|
| QR code generation       | TLV-encoded QR on every invoice                    |
| Hash chain integrity     | Sequential hash linking of all invoices            |
| UUID assignment          | Unique identifier for every invoice                |
| XML format               | UBL 2.1 compliant XML structure                    |
| Anti-tampering           | Invoice counter and previous invoice hash          |

### 2.2 Invoice Types

| Type Code | Name                    | ZATCA Classification |
|-----------|------------------------|----------------------|
| 388       | Standard Tax Invoice   | B2B (mandatory)      |
| 383       | Debit Note             | B2B (mandatory)      |
| 381       | Credit Note            | B2B (mandatory)      |
| 388       | Simplified Tax Invoice | B2C (mandatory)      |
| 383       | Simplified Debit Note  | B2C (mandatory)      |
| 381       | Simplified Credit Note | B2C (mandatory)      |

---

## 3. QR Code Field Validation

### 3.1 Required TLV Fields

The QR code must contain the following TLV (Tag-Length-Value) encoded fields, in order:

| Tag | Field Name              | Data Type   | Example Value                  |
|-----|------------------------|-------------|--------------------------------|
| 1   | Seller Name            | UTF-8 String| "Al-Fahad Auto Service"        |
| 2   | VAT Registration Number| String      | "300012345600003"              |
| 3   | Invoice Timestamp      | ISO 8601    | "2026-08-31T14:30:00Z"         |
| 4   | Invoice Total (with VAT)| Decimal    | "1150.00"                      |
| 5   | VAT Amount             | Decimal     | "150.00"                       |
| 6   | Hash of XML            | Base64      | (SHA-256 hash of invoice XML)  |
| 7   | ECDSA Signature        | Base64      | (Digital signature)            |
| 8   | Public Key             | Base64      | (Signing certificate public key)|

### 3.2 Validation Checklist

- [ ] Tag 1 (Seller Name) matches the legal entity name registered with ZATCA
- [ ] Tag 2 (VAT Number) is exactly 15 digits, starts with "3", ends with "3"
- [ ] Tag 3 (Timestamp) is in ISO 8601 format with timezone
- [ ] Tag 4 (Total) matches the invoice grand total including VAT, in SAR
- [ ] Tag 5 (VAT Amount) matches the sum of all VAT line items
- [ ] Tag 6 (Hash) is a valid Base64-encoded SHA-256 hash
- [ ] Tag 7 (Signature) is a valid ECDSA signature using the ZATCA-issued certificate
- [ ] Tag 8 (Public Key) corresponds to the signing certificate
- [ ] QR code is scannable by ZATCA mobile app
- [ ] QR code renders at minimum 2cm x 2cm on printed invoices

### 3.3 Common QR Code Errors

| Error                         | Cause                              | Fix                              |
|-------------------------------|------------------------------------|---------------------------------|
| "Invalid seller name"         | AR/EN mismatch with CR             | Update seller name in settings  |
| "VAT number format invalid"   | Missing leading/trailing "3"       | Correct VAT number in org setup |
| "Timestamp out of range"      | Server clock drift                 | Sync NTP; check timezone config |
| "Hash mismatch"               | XML modified after signing         | Regenerate invoice from source  |
| "Signature verification fail" | Expired or revoked certificate     | Renew CSID with ZATCA portal   |

---

## 4. Hash Chain Integrity Checks

### 4.1 Hash Chain Mechanism

Every invoice includes two hash-related fields:

1. **Invoice Hash (IH)**: SHA-256 hash of the current invoice XML (canonicalized)
2. **Previous Invoice Hash (PIH)**: The hash of the immediately preceding invoice

```
Invoice #1: IH_1 = SHA-256(XML_1),           PIH_1 = SHA-256("0") [genesis]
Invoice #2: IH_2 = SHA-256(XML_2),           PIH_2 = IH_1
Invoice #3: IH_3 = SHA-256(XML_3),           PIH_3 = IH_2
...
Invoice #N: IH_N = SHA-256(XML_N),           PIH_N = IH_(N-1)
```

### 4.2 Chain Integrity Verification

- [ ] First invoice in the chain references the genesis hash: SHA-256("0")
- [ ] Every subsequent invoice's PIH matches the IH of the previous invoice
- [ ] No gaps exist in the invoice counter sequence (ICV)
- [ ] Hash chain is maintained separately per invoice type (standard vs. simplified)
- [ ] Hash chain is maintained per EGS (E-Invoice Generation Solution) device
- [ ] Chain is not broken across system restarts or date boundaries

### 4.3 Chain Break Recovery

If a hash chain break is detected:

1. Identify the exact break point (last valid hash vs. first invalid hash)
2. Do NOT attempt to retrospectively fix old invoices
3. Contact ZATCA support to report the break
4. Resume the chain from the last valid invoice hash
5. Document the incident with timestamps and affected invoice range
6. Retain evidence of the original chain state for audit purposes

---

## 5. XML Format Requirements (UBL 2.1)

### 5.1 Mandatory XML Elements

| Element Path                              | Description                | Required |
|-------------------------------------------|---------------------------|----------|
| `cbc:ID`                                  | Invoice number             | Yes      |
| `cbc:UUID`                                | Unique identifier (UUID v4)| Yes      |
| `cbc:IssueDate`                           | Invoice date (YYYY-MM-DD) | Yes      |
| `cbc:IssueTime`                           | Invoice time (HH:MM:SS)   | Yes      |
| `cbc:InvoiceTypeCode`                     | 388, 383, or 381          | Yes      |
| `cbc:DocumentCurrencyCode`               | "SAR"                      | Yes      |
| `cac:AccountingSupplierParty`            | Seller details             | Yes      |
| `cac:AccountingCustomerParty`            | Buyer details (B2B only)   | Conditional |
| `cac:TaxTotal`                            | VAT totals                 | Yes      |
| `cac:LegalMonetaryTotal`                 | Invoice totals             | Yes      |
| `cac:InvoiceLine`                        | Line items                 | Yes (1+) |
| `cac:AdditionalDocumentReference` (ICV)  | Invoice counter            | Yes      |
| `cac:AdditionalDocumentReference` (PIH)  | Previous invoice hash      | Yes      |
| `cac:Signature`                           | Digital signature block    | Yes      |

### 5.2 Seller Information Requirements

| Field                    | Example                          | Notes                    |
|--------------------------|----------------------------------|--------------------------|
| Party Name               | "SALIS AUTO Workshop LLC"        | Must match CR            |
| VAT Registration ID      | "300012345600003"                | 15-digit TIN             |
| Commercial Registration  | "1010XXXXXX"                     | CR number                |
| Street Address            | "King Fahd Road"                 | Full address required    |
| Building Number           | "1234"                           | 4-digit building number  |
| Postal Code              | "12345"                          | 5-digit Saudi postal     |
| City                     | "Riyadh"                         | City subdivision         |
| Country Code             | "SA"                             | ISO 3166-1 alpha-2       |

### 5.3 XML Validation

- [ ] XML validates against ZATCA UBL 2.1 schema (XSD)
- [ ] All mandatory elements are present and non-empty
- [ ] Currency code is "SAR" for all monetary amounts
- [ ] Date and time formats conform to ISO standards
- [ ] UUID is a valid version 4 UUID
- [ ] Invoice counter (ICV) is a positive integer, strictly incrementing
- [ ] All amounts use maximum 2 decimal places
- [ ] Namespace declarations are correct (UBL 2.1 + ZATCA extensions)

---

## 6. VAT Calculation Rules

### 6.1 Standard VAT Rate

The standard VAT rate in Saudi Arabia is **15%**, applied to both parts and labor.

### 6.2 Calculation Method

All monetary values in SALIS AUTO are stored as integer halalas (1 SAR = 100 halalas) to avoid floating-point errors. Display conversion: divide by 100 for SAR display.

| Component         | Calculation                                    |
|-------------------|-----------------------------------------------|
| Line taxable amount| Unit price (halalas) x Quantity               |
| Line VAT          | Line taxable amount x 0.15, rounded to nearest halala |
| Invoice VAT total | Sum of all line VAT amounts                   |
| Invoice grand total| Sum of all line taxable amounts + Invoice VAT total |

### 6.3 Rounding Rules

- VAT per line item: round to nearest halala (0.5 rounds up)
- Invoice VAT total: sum of rounded line VAT amounts (do NOT recalculate from subtotal)
- Discount application: apply discount before VAT calculation

### 6.4 VAT Categories

| Category Code | Description          | Rate | Common Use in Workshop      |
|---------------|---------------------|------|-----------------------------|
| S             | Standard rated      | 15%  | Parts, labor, consumables   |
| Z             | Zero rated          | 0%   | Exports, GCC supplies       |
| E             | Exempt              | 0%   | Insurance claim settlements |
| O             | Out of scope        | 0%   | Not applicable in workshops |

### 6.5 Validation Checklist

- [ ] VAT rate is 15% for all standard-rated items
- [ ] VAT is calculated per line item, not on the invoice subtotal
- [ ] Rounding follows halala precision (2 decimal places in SAR)
- [ ] Discounts are applied before VAT calculation
- [ ] Credit notes correctly reverse the original VAT amounts
- [ ] Total VAT matches the sum of line-level VAT amounts
- [ ] VAT registration number is displayed on every invoice

---

## 7. Common Audit Findings and Remediation

### 7.1 Frequent ZATCA Audit Issues

| Finding                              | Severity | Remediation                           |
|--------------------------------------|----------|---------------------------------------|
| Missing PIH on invoices              | Critical | Verify hash chain configuration       |
| VAT calculation rounding errors      | High     | Switch to halala-based integer math    |
| Incomplete seller address            | High     | Update all address fields in settings  |
| QR code missing required TLV tags    | High     | Update QR generation to include all 8  |
| Invoice counter gaps                 | Medium   | Investigate voided invoice handling    |
| Expired CSID certificate             | Critical | Renew via ZATCA Fatoora portal        |
| XML schema validation failures       | High     | Run pre-submission XSD validation      |
| Incorrect invoice type code          | Medium   | Map B2B vs. B2C classification rules   |
| Missing buyer VAT for B2B invoices   | High     | Enforce buyer TIN field for B2B        |
| Timestamp timezone inconsistency     | Medium   | Standardize on UTC or AST (+03:00)    |

### 7.2 Self-Audit Schedule

| Frequency  | Audit Activity                                    | Responsible        |
|------------|--------------------------------------------------|--------------------|
| Daily      | Check ZATCA submission success rate (target: 100%)| System auto-check  |
| Weekly     | Review rejected invoices and resubmit             | Accountant         |
| Monthly    | Hash chain integrity verification                 | Finance Manager    |
| Quarterly  | Full compliance checklist review (this document)  | Branch Manager     |
| Annually   | Certificate renewal and security review           | IT Administrator   |

---

## 8. Seven-Year Retention Requirements

### 8.1 What Must Be Retained

| Record Type                    | Retention Period | Format           |
|-------------------------------|-----------------|------------------|
| Tax invoices (standard)       | 7 years         | XML + PDF        |
| Simplified invoices           | 7 years         | XML + PDF        |
| Credit notes                  | 7 years         | XML + PDF        |
| Debit notes                   | 7 years         | XML + PDF        |
| ZATCA submission responses    | 7 years         | JSON / XML       |
| Digital certificates          | 7 years         | PEM / PKCS#12    |
| Hash chain records            | 7 years         | Database / export |
| VAT returns filed             | 7 years         | PDF              |

### 8.2 Retention Rules

- [ ] Retention period starts from the end of the fiscal year in which the invoice was issued
- [ ] Records must be retrievable within 24 hours of a ZATCA request
- [ ] Both Arabic and English versions must be retained where applicable
- [ ] Digital records must maintain integrity (no post-issuance modification)
- [ ] Backup copies must be stored in a geographically separate location within Saudi Arabia
- [ ] Access to archived records must be restricted to authorized personnel (accountant role and above per [RBAC Matrix](../reference/rbac-matrix.md))

### 8.3 SALIS AUTO Archival

The platform automatically archives e-invoices and ZATCA responses. Archived records are accessible via Finance > Archive > E-Invoice History. Export functionality supports bulk download in XML and PDF formats for audit preparation.

---

## 9. Pre-Go-Live Compliance Checklist

Before enabling ZATCA Phase 2 integration for a new branch or tenant:

### 9.1 Organization Setup

- [ ] Legal entity name matches Commercial Registration (CR)
- [ ] VAT registration number (TIN) is 15 digits, format 3XXXXXXXXXXXXX3
- [ ] Complete business address with building number and postal code
- [ ] ZATCA Compliance CSID (Cryptographic Stamp Identifier) is active
- [ ] Production CSID (PCSID) obtained from ZATCA Fatoora portal

### 9.2 Technical Readiness

- [ ] EGS device registered with ZATCA
- [ ] API connectivity to ZATCA Fatoora platform confirmed
- [ ] Hash chain initialized with genesis hash
- [ ] Invoice counter (ICV) initialized at 1
- [ ] QR code generation produces scannable output
- [ ] XML schema validation passes for sample invoices
- [ ] Digital signature verification succeeds

### 9.3 Operational Readiness

- [ ] Finance staff trained on e-invoice workflow
- [ ] Error handling procedures documented
- [ ] Escalation path defined for ZATCA rejections
- [ ] Monitoring alerts configured for submission failures
- [ ] Backup manual invoicing procedure documented (for system downtime)

---

## 10. Related Documents

- [ZATCA Integration Technical Reference](../../system/integration/zatca-integration.md)
- [Financial Reporting Guide](./financial-reporting-guide.md)
- [Finance Staff Guide](../../user-documentation/guides/finance-staff-guide.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-003*
