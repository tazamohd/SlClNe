# SALIS AUTO -- Finance & Accounting Department Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-DPT-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Department Overview

The Finance & Accounting department is responsible for all financial management, regulatory compliance, and fiscal reporting across the SALIS AUTO platform. The department ensures accurate revenue recognition, tax compliance with ZATCA (Zakat, Tax and Customs Authority) Phase 2 e-invoicing requirements, and provides financial visibility to all stakeholders through the platform's reporting modules.

Operating within Saudi Arabia's regulatory framework, the department handles VAT at 15%, zakat calculations, and full electronic invoicing integration. All financial data flows through the platform's 28 RBAC modules, with strict segregation of duties enforced at the system level.

**Primary Responsibilities:**
- General ledger management and journal entries
- Accounts receivable and accounts payable
- ZATCA Phase 2 e-invoicing compliance and submission
- Monthly, quarterly, and annual financial reporting
- Budgeting, forecasting, and cost control
- Internal controls and audit support
- Multi-tenant financial isolation and reporting

---

## 2. Team Structure

```
                    +-----------------------+
                    |   Finance Manager     |
                    |   (1 per org)         |
                    +-----------+-----------+
                                |
          +---------------------+---------------------+
          |                     |                     |
+---------+---------+ +---------+---------+ +---------+---------+
|    Accountant     | |   Billing Clerk   | | ZATCA Compliance  |
|    (1-2)          | |   (1-2)           | |    Officer (1)    |
+-------------------+ +-------------------+ +-------------------+
| - Journal entries | | - Invoice creation| | - E-invoice setup |
| - Reconciliation  | | - Payment receipt | | - VAT returns     |
| - Month-end close | | - AR follow-up    | | - Zakat filing    |
| - Financial rpts  | | - Refund process  | | - Audit liaison   |
+-------------------+ +-------------------+ +-------------------+
```

**RBAC Role Mapping (from 14 platform roles):**

| Platform Role       | Finance Function               | Module Access                      |
|---------------------|--------------------------------|------------------------------------|
| Owner               | Financial oversight            | Full financial reports, approvals  |
| Finance Manager     | Department head                | All finance modules                |
| Accountant          | Transaction processing         | GL, journals, reconciliation       |
| Billing Clerk       | Invoice and payment management | Invoicing, payments, receipts      |
| ZATCA Officer       | Regulatory compliance          | ZATCA portal, VAT, e-invoicing     |

---

## 3. Month-End Close Process

The month-end close follows a 10-step checklist that must be completed within 5 business days of month end. Each step has a responsible party and system checkpoint.

### 3.1 Close Checklist

| Step | Task                          | Responsible       | Deadline    | System Check              |
|------|-------------------------------|-------------------|-------------|---------------------------|
| 1    | Revenue Recognition           | Accountant        | Day 1       | All job cards invoiced     |
| 2    | Expense Accruals              | Accountant        | Day 1       | Accrual journal posted     |
| 3    | Bank Reconciliation           | Accountant        | Day 2       | All accounts reconciled    |
| 4    | Depreciation Run              | Accountant        | Day 2       | Auto-calculated, reviewed  |
| 5    | Intercompany Settlement       | Finance Manager   | Day 3       | Multi-tenant balances zero |
| 6    | Tax Provision (VAT 15%)       | ZATCA Officer     | Day 3       | VAT liability calculated   |
| 7    | Journal Entry Review          | Finance Manager   | Day 4       | All journals approved      |
| 8    | Trial Balance                 | Accountant        | Day 4       | Debits = Credits           |
| 9    | Profit & Loss Statement       | Finance Manager   | Day 5       | Variance analysis complete |
| 10   | Balance Sheet                 | Finance Manager   | Day 5       | Final sign-off             |

### 3.2 Close Calendar

```
Month End (Day 0)
  |
  Day 1: Revenue recognition + Expense accruals
  Day 2: Bank reconciliation + Depreciation
  Day 3: Intercompany + Tax provision
  Day 4: Journal review + Trial balance
  Day 5: P&L + Balance sheet → CLOSE COMPLETE
  |
  Day 7: Management reporting package distributed
  Day 10: Board financial summary (if applicable)
```

---

## 4. ZATCA Reporting and Compliance

### 4.1 E-Invoicing (Phase 2 -- Integration Phase)

SALIS AUTO implements ZATCA Phase 2 (Fatoora) e-invoicing with full system integration:

| Requirement                  | Implementation                                    | Frequency    |
|------------------------------|---------------------------------------------------|--------------|
| Tax Invoice Generation       | Auto-generated from job card completion            | Per invoice  |
| QR Code Embedding            | TLV-encoded QR on all invoices                     | Per invoice  |
| XML Submission to ZATCA      | Real-time API submission via platform integration  | Per invoice  |
| Credit/Debit Notes           | Linked to original invoice, auto-submitted         | As needed    |
| Invoice UUID                 | System-generated, immutable                        | Per invoice  |
| Digital Signature            | Cryptographic stamp per ZATCA specification        | Per invoice  |

### 4.2 VAT Management

| Category                     | Rate  | Application                                |
|------------------------------|-------|--------------------------------------------|
| Standard VAT                 | 15%   | All services and parts                     |
| Zero-rated                   | 0%    | Exports (if applicable)                    |
| Exempt                       | 0%    | Specified financial services               |
| Input VAT Recovery           | 15%   | Eligible business expenses                 |

### 4.3 Filing Schedule

| Filing Type          | Frequency  | Deadline                    | Responsible        |
|----------------------|------------|-----------------------------|--------------------|
| E-Invoice Submission | Daily      | Within 24 hours of issuance | Automated/system   |
| VAT Return           | Monthly    | End of following month      | ZATCA Officer      |
| Zakat Declaration    | Annual     | 120 days after fiscal year  | Finance Manager    |
| Withholding Tax      | Monthly    | 10th of following month     | Accountant         |

### 4.4 Document Retention

All financial documents must be retained for 7 years per ZATCA regulations. The platform stores documents digitally with the following structure:

- Tax invoices: 7 years from date of issue
- VAT returns: 7 years from filing date
- Journals and ledgers: 7 years from fiscal year end
- Supporting documents: 7 years from transaction date
- Contracts: 7 years from expiration date

---

## 5. Accounts Receivable Management

### 5.1 Invoice Aging Categories

| Category       | Age Range    | Collection Action                              | Responsible     |
|----------------|-------------|------------------------------------------------|-----------------|
| Current        | 0-30 days   | Standard payment terms, no action              | Billing Clerk   |
| 30 Days        | 31-60 days  | Friendly reminder email/SMS                    | Billing Clerk   |
| 60 Days        | 61-90 days  | Phone call, formal demand letter               | Billing Clerk   |
| 90 Days        | 91-120 days | Account hold, Finance Manager escalation       | Finance Manager |
| 120+ Days      | > 120 days  | Legal review, potential write-off              | Finance Manager |

### 5.2 Collection Procedures

```
Invoice Issued (Day 0)
  |
  Day 30: Automated reminder email (system-generated)
  Day 45: SMS reminder + second email
  Day 60: Billing Clerk phone call, documented in CRM
  Day 75: Formal demand letter (Arabic/English)
  Day 90: Account placed on hold (no new services without payment)
  Day 100: Finance Manager review, escalation decision
  Day 120+: Write-off assessment or legal referral
```

### 5.3 Write-Off Approval Authority

| Amount (SAR)        | Approver              | Documentation Required              |
|---------------------|-----------------------|-------------------------------------|
| < 1,000             | Finance Manager       | Write-off memo                      |
| 1,000 - 5,000       | Finance Manager       | Write-off memo + collection history |
| 5,001 - 25,000      | Owner                 | Formal write-off request + evidence |
| > 25,000             | Owner + Board         | Legal opinion + full documentation  |

---

## 6. Accounts Payable Management

### 6.1 Vendor Payment Terms

| Vendor Category        | Standard Terms  | Payment Method          | Approval Required      |
|------------------------|-----------------|-------------------------|------------------------|
| Parts suppliers        | Net 30          | Bank transfer           | Finance Manager        |
| Equipment vendors      | Net 45          | Bank transfer/LC        | Owner (> SAR 50K)      |
| Utilities              | Upon receipt    | SADAD/Direct debit      | Accountant             |
| Rent/Lease             | 1st of month    | Bank transfer           | Owner                  |
| Software/SaaS          | Annual prepaid  | Credit card/transfer    | Finance Manager        |
| Contractors/Labor      | Bi-weekly       | WPS transfer            | HR + Finance Manager   |

### 6.2 Payment Scheduling

- Weekly payment run: every Thursday (standard vendors)
- Urgent payments: same-day processing with Finance Manager approval
- Payroll: by 7th of each month via WPS
- GOSI contributions: by 15th of each month

### 6.3 Early Payment Discounts

| Discount Terms   | Effective Rate | Policy                                      |
|------------------|----------------|----------------------------------------------|
| 2/10 Net 30     | ~36% annual    | Always take if cash available                |
| 1/10 Net 45     | ~10% annual    | Take if cash position allows                 |
| Net 30           | 0%             | Standard terms, pay on Day 28                |

---

## 7. Audit Preparation

### 7.1 Quarterly Internal Audit Checklist

| # | Audit Area                    | Items to Review                              | Auditor       |
|---|-------------------------------|----------------------------------------------|---------------|
| 1 | Revenue completeness          | Job cards vs. invoices reconciliation        | Internal      |
| 2 | Cash and bank                 | Bank statements vs. GL, outstanding items    | Internal      |
| 3 | Accounts receivable           | Aging accuracy, provision adequacy           | Internal      |
| 4 | Accounts payable              | Unrecorded liabilities, vendor statements    | Internal      |
| 5 | Payroll                       | WPS compliance, GOSI reconciliation          | Internal      |
| 6 | VAT compliance                | Input/output VAT accuracy, filing timeliness | Internal      |
| 7 | Fixed assets                  | Physical verification, depreciation accuracy | Internal      |
| 8 | Segregation of duties         | SOD violation log review                     | Internal      |
| 9 | Access controls               | User access review across 28 RBAC modules   | Internal + IT |
| 10| Expense authorization         | Sample testing of expense approvals          | Internal      |

### 7.2 Annual External Audit Support

- Provide auditors with system access (read-only audit role)
- Prepare confirmation letters (bank, receivables, payables)
- Compile supporting documentation per audit request list
- Schedule management representation letter
- Coordinate with ZATCA for any regulatory queries

---

## 8. Financial Controls

### 8.1 Authorization Matrix

| Transaction Type                | Amount (SAR)    | Required Approvers                    |
|---------------------------------|-----------------|---------------------------------------|
| Petty cash disbursement         | < 500           | Finance Manager                       |
| Vendor payment                  | < 10,000        | Finance Manager                       |
| Vendor payment                  | 10,000 - 50,000 | Finance Manager + Owner              |
| Vendor payment                  | > 50,000        | Finance Manager + Owner + Board       |
| Journal entry                   | Any             | Accountant (post) + Finance Mgr (approve) |
| Customer refund                 | < 5,000         | Finance Manager                       |
| Customer refund                 | > 5,000         | Owner                                 |
| Budget reallocation             | Any             | Finance Manager + Owner               |

### 8.2 Segregation of Duties (SOD)

| Action Pair                           | Conflict Type    | Enforcement          |
|---------------------------------------|------------------|----------------------|
| Post Journal Entry / Approve Journal  | Mandatory SOD    | System-blocked       |
| Create Invoice / Receive Payment      | Recommended SOD  | Manager override     |
| Create Purchase Order / Approve PO    | Mandatory SOD    | System-blocked       |
| Manage Vendor Master / Process Payment| Mandatory SOD    | System-blocked       |
| Prepare Bank Reconciliation / Approve | Recommended SOD  | Dual review          |

### 8.3 Bank Signatory Requirements

| Transaction Amount (SAR) | Signatories Required | Authorized Signers        |
|--------------------------|----------------------|---------------------------|
| < 25,000                 | 1                    | Finance Manager or Owner  |
| 25,000 - 100,000         | 2                    | Finance Manager + Owner   |
| > 100,000                | 2 + Board resolution | Owner + Board member      |

---

## 9. Key Performance Indicators

### 9.1 KPI Dashboard

| KPI                          | Target              | Measurement    | Frequency | Owner            |
|------------------------------|---------------------|----------------|-----------|------------------|
| Days Sales Outstanding (DSO) | < 45 days           | Days           | Monthly   | Finance Manager  |
| Days Payable Outstanding     | 30-45 days          | Days           | Monthly   | Finance Manager  |
| Month-End Close              | < 5 business days   | Days           | Monthly   | Finance Manager  |
| ZATCA Submission Rate        | 100% on time        | Percentage     | Daily     | ZATCA Officer    |
| Audit Findings               | < 3 per quarter     | Count          | Quarterly | Finance Manager  |
| Revenue Recognition Accuracy | > 99.5%             | Percentage     | Monthly   | Accountant       |
| VAT Filing Accuracy          | 100%                | Percentage     | Monthly   | ZATCA Officer    |
| Cash Flow Forecast Accuracy  | > 90%               | Percentage     | Monthly   | Finance Manager  |
| Budget Variance              | < 5%                | Percentage     | Monthly   | Finance Manager  |
| Invoice Processing Time      | < 24 hours          | Hours          | Daily     | Billing Clerk    |

### 9.2 KPI Calculation Formulas

```
DSO = (Accounts Receivable / Total Credit Sales) x Number of Days
DPO = (Accounts Payable / Cost of Goods Sold) x Number of Days
Budget Variance = ((Actual - Budget) / Budget) x 100
Revenue Accuracy = (Verified Revenue / Reported Revenue) x 100
```

---

## 10. Multi-Tenant Financial Isolation

As a multi-tenant SaaS platform, SALIS AUTO enforces strict financial data isolation:

| Aspect                  | Implementation                                          |
|-------------------------|---------------------------------------------------------|
| Chart of Accounts       | Tenant-specific COA with shared template                |
| GL Transactions         | Tenant ID on every transaction, query-level filtering   |
| Reports                 | Scoped to tenant context, no cross-tenant data leakage  |
| VAT Registration        | Per-tenant VAT number, separate ZATCA submission        |
| Bank Accounts           | Tenant-specific bank account mapping                    |
| Audit Trail             | Immutable, per-tenant, 7-year retention                 |

---

## 11. Cross-References

| Document                                                                              | Relevance                          |
|---------------------------------------------------------------------------------------|------------------------------------|
| [Financial Reporting Guide](../knowledge-base/financial-reporting-guide.md)           | Detailed reporting procedures      |
| [ZATCA Compliance Checklist](../knowledge-base/zatca-compliance-checklist.md)         | E-invoicing implementation guide   |
| [Invoice & Payment](../knowledge-base/invoice-payment.md)                            | Invoice lifecycle and payment flow |
| [Business Rules](../MASTER_BUSINESS_RULES.md)                                        | SOD and financial business rules   |
| [RBAC Matrix](../MASTER_RBAC_MATRIX.md)                                              | Finance role permissions           |
| [Architecture](../MASTER_ARCHITECTURE.md)                                            | System integration architecture    |

---

## 12. Revision History

| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial department plan    |
