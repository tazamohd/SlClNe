# SALIS AUTO -- Finance & Inventory Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-007                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                                |
|------------------|-------------------------------------------------------|
| Target Roles     | Accountant, Storekeeper, Procurement Agent             |
| Duration         | 10 hours (6 modules)                                  |
| Track            | Back-Office (P2 -- week 2-4)                          |
| Prerequisites    | Platform Fundamentals module (30 min)                 |
| Delivery         | Blended (ILT for core modules, self-paced for labs)   |

### 1.1 Role Matrix

| Role        | Demo Account                              | Scope  | SAR Limit  |
|-------------|-------------------------------------------|--------|------------|
| Accountant  | Hessa Al-Mutairi (finance@salisauto.sa)   | All    | 25,000 SAR |
| Storekeeper | Yousef Al-Ghamdi (parts@salisauto.sa)     | Branch | 10,000 SAR |
| Procurement | Bandar Al-Subaie (procurement@salisauto.sa)| All   | 20,000 SAR |

All demo accounts use password: `Demo@1234`

### 1.2 Learning Objectives

Upon completing this course, participants will be able to:

1. Manage the chart of accounts and post journal entries
2. Create ZATCA Phase 2 compliant invoices with QR codes and hash chains
3. Process and reconcile payments
4. Manage parts inventory including stock levels, issuance, and adjustments
5. Execute the procurement workflow with SOD compliance
6. Generate financial and inventory reports

---

## 2. Module 1 -- Chart of Accounts & Journal Entries (120 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Chart of accounts structure          | 25 min   |
| 2 | Account types and hierarchies        | 20 min   |
| 3 | Creating journal entries             | 25 min   |
| 4 | SOD: Post Journal / Approve Journal  | 25 min   |
| 5 | Period closing and reconciliation    | 25 min   |

### 2.2 Key Concepts

- **Accountant RBAC**: invoices (v,c,e,a), payments (v,c,e,a), accounting (v,c,e,a), reports (v,x)
- **Double-Entry**: All transactions follow double-entry accounting with mandatory balancing
- **Currency Handling**: All monetary values stored as integer halalas, displayed as SAR with two decimal places
- **SOD Pair**: Post Journal / Approve Journal -- the person posting cannot approve their own entry
- **Period Lock**: Closed periods cannot be modified without manager/owner override
- **Bilingual**: Chart of accounts supports EN/AR naming for labels and descriptions

### 2.3 Hands-On Lab

**Lab 1.1: Navigating the Chart of Accounts**

1. Log in as accountant (`finance@salisauto.sa` / `Demo@1234`)
2. Navigate to Accounting > Chart of Accounts
3. Review the account hierarchy: Assets, Liabilities, Equity, Revenue, Expenses
4. Drill down into sub-accounts (e.g., Cash, Accounts Receivable, Parts Inventory)
5. Create a new sub-account under Expenses (e.g., "Workshop Consumables")
6. Verify the account appears in the chart

**Lab 1.2: Posting a Journal Entry**

1. Navigate to Accounting > Journal Entries > New
2. Enter the journal date, description, and reference number
3. Add debit and credit lines -- ensure they balance
4. Post the journal entry
5. Attempt to approve the same journal entry -- observe the SOD block
6. Log in as manager (`manager@salisauto.sa`) and approve the journal entry
7. Return to the accountant view and verify the approved status

### 2.4 Quiz -- Module 1

**Q1.** What SOD rule applies to journal entries?

- A) Raise PO / Approve PO
- B) Post Journal / Approve Journal
- C) Create Supplier / Approve Payment
- D) Issue Stock / Adjust Count

**Correct Answer**: B -- The Post Journal / Approve Journal SOD pair prevents self-approval.

**Q2.** How are monetary values stored in the system?

- A) As floating-point SAR
- B) As integer halalas
- C) As rounded SAR values
- D) As string amounts

**Correct Answer**: B -- Money is stored as integer halalas for precision.

**Q3.** What happens when a closed period needs modification?

- A) The accountant can modify it directly
- B) A manager or owner override is required
- C) It is impossible to modify
- D) The period must be reopened by IT

**Correct Answer**: B -- Closed period modifications require manager or owner override.

---

## 3. Module 2 -- Invoicing & ZATCA Compliance (120 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Invoice creation workflow            | 25 min   |
| 2 | ZATCA Phase 2 requirements           | 25 min   |
| 3 | QR code generation and validation    | 20 min   |
| 4 | Hash chain integrity                 | 20 min   |
| 5 | Credit notes and corrections         | 15 min   |
| 6 | 7-year retention compliance          | 15 min   |

### 3.2 Key Concepts

- **ZATCA Phase 2**: Mandatory e-invoicing with VAT at 15%, QR codes, hash chain, 7-year retention
- **QR Code**: Each invoice includes a scannable QR code containing seller, VAT number, total, VAT amount, timestamp
- **Hash Chain**: Sequential hash linking each invoice to the previous one for tamper detection
- **Credit Notes**: Required for invoice corrections; original invoice remains in the chain
- **Retention**: All invoices and supporting documents retained for 7 years minimum
- **Invoice Types**: Standard invoice, simplified invoice, credit note, debit note

### 3.3 Hands-On Lab

**Lab 2.1: Creating a ZATCA-Compliant Invoice**

1. Navigate to Finance > Invoices > New
2. Link the invoice to a completed job card
3. Verify the line items, labor, parts, and VAT (15%) are calculated correctly
4. Review the generated QR code -- scan it with a mobile device to verify data
5. Check the hash chain reference linking to the previous invoice
6. Finalize and submit the invoice
7. Export the invoice as PDF and verify all ZATCA fields are present

**Lab 2.2: Processing a Credit Note**

1. Navigate to Finance > Invoices
2. Select an issued invoice that requires correction
3. Create a credit note referencing the original invoice
4. Specify the reason for correction and adjusted amounts
5. Verify the credit note receives its own QR code and hash chain entry
6. Confirm the original invoice's hash chain remains intact

### 3.4 Quiz -- Module 2

**Q1.** What VAT rate does ZATCA Phase 2 require on invoices?

- A) 5%
- B) 10%
- C) 15%
- D) 20%

**Correct Answer**: C -- ZATCA Phase 2 mandates 15% VAT.

**Q2.** What is the purpose of the hash chain on invoices?

- A) Encryption of customer data
- B) Tamper detection through sequential linking
- C) Payment tracking
- D) Currency conversion

**Correct Answer**: B -- The hash chain links invoices sequentially for tamper detection.

**Q3.** How long must invoices be retained under ZATCA compliance?

- A) 3 years
- B) 5 years
- C) 7 years
- D) 10 years

**Correct Answer**: C -- ZATCA requires 7-year document retention.

---

## 4. Module 3 -- Payments (60 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Payment methods and processing       | 15 min   |
| 2 | Payment reconciliation               | 15 min   |
| 3 | Refund processing                    | 15 min   |
| 4 | Aging reports                        | 15 min   |

### 4.2 Key Concepts

- **Accountant SAR Limit**: 25,000 SAR approval ceiling for payment transactions
- **Payment Methods**: Cash, card (POS), bank transfer, online payment
- **Reconciliation**: Daily bank reconciliation with auto-matching
- **Aging Reports**: Track outstanding receivables by 30/60/90/120+ day buckets
- **SOD**: Create Supplier / Approve Supplier Payment -- separate users required

### 4.3 Hands-On Lab

**Lab 3.1: Processing a Customer Payment**

1. Navigate to Finance > Payments > Receive Payment
2. Select the customer and outstanding invoice(s)
3. Choose the payment method and enter the amount
4. Apply the payment to the invoice -- partial or full
5. Generate the payment receipt
6. Run the daily reconciliation report

### 4.4 Quiz -- Module 3

**Q1.** What is the Accountant's SAR approval limit for payments?

- A) 10,000 SAR
- B) 15,000 SAR
- C) 25,000 SAR
- D) 50,000 SAR

**Correct Answer**: C -- The Accountant has a 25,000 SAR approval limit.

---

## 5. Module 4 -- Parts Inventory (90 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Inventory dashboard and stock levels | 20 min   |
| 2 | Receiving stock from suppliers       | 20 min   |
| 3 | Issuing parts to technicians         | 20 min   |
| 4 | Stock adjustments and cycle counts   | 15 min   |
| 5 | SOD: Issue Stock / Adjust Count      | 15 min   |

### 5.2 Key Concepts

- **Storekeeper RBAC**: parts (v,c,e), suppliers (v) -- branch scope
- **Storekeeper SAR Limit**: 10,000 SAR for parts-related approvals
- **Stock Tracking**: Real-time stock levels with min/max thresholds and reorder alerts
- **Issuance**: Parts issued to technician requests, linked to job cards
- **SOD Pair**: Issue Stock / Adjust Stock Count -- the person issuing cannot adjust the same stock count
- **Valuation**: FIFO (First In, First Out) inventory valuation method

### 5.3 Hands-On Lab

**Lab 4.1: Managing Inventory (Storekeeper)**

1. Log in as storekeeper (`parts@salisauto.sa` / `Demo@1234`)
2. Navigate to Parts > Inventory Dashboard
3. Review current stock levels and identify items below minimum threshold
4. Process a technician's parts request: allocate and issue the requested parts
5. Receive a delivery from a supplier: add stock, verify quantities
6. Attempt to both issue stock and adjust the count for the same item -- observe the SOD block

### 5.4 Quiz -- Module 4

**Q1.** What inventory valuation method does SALIS AUTO use?

- A) LIFO
- B) FIFO
- C) Weighted Average
- D) Specific Identification

**Correct Answer**: B -- SALIS AUTO uses FIFO (First In, First Out) for inventory valuation.

**Q2.** What SOD rule applies to inventory management?

- A) Raise PO / Approve PO
- B) Post Journal / Approve Journal
- C) Issue Stock / Adjust Stock Count
- D) Create Supplier / Approve Payment

**Correct Answer**: C -- Issue Stock / Adjust Stock Count prevents the same user from doing both.

---

## 6. Module 5 -- Procurement (90 minutes)

### 6.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Supplier management                  | 20 min   |
| 2 | Purchase order creation              | 20 min   |
| 3 | SOD: Raise PO / Approve PO          | 20 min   |
| 4 | SOD: Create Supplier / Approve Payment| 15 min  |
| 5 | Goods receipt and three-way matching | 15 min   |

### 6.2 Key Concepts

- **Procurement RBAC**: parts (v,c,e), suppliers (v,c,e), invoices (v,c) -- all scope
- **Procurement SAR Limit**: 20,000 SAR for PO approval
- **SOD Pairs**:
  - Raise PO / Approve PO -- cannot raise and approve the same PO
  - Create Supplier / Approve Supplier Payment -- cannot create a supplier and approve their payment
- **Three-Way Match**: PO, goods receipt, and supplier invoice must match before payment
- **Supplier Onboarding**: New suppliers require profile, tax registration, and bank details

### 6.3 Hands-On Lab

**Lab 5.1: Creating a Purchase Order (Procurement)**

1. Log in as procurement (`procurement@salisauto.sa` / `Demo@1234`)
2. Navigate to Parts > Suppliers > Select a supplier
3. Create a new purchase order with line items and quantities
4. Submit the PO for approval
5. Attempt to approve the PO raised by the same user -- observe the SOD block
6. Log in as manager to approve the PO (within 50K SAR ceiling)
7. Return to procurement and verify the approved status

**Lab 5.2: Three-Way Matching**

1. Receive goods against an approved PO
2. Record the supplier's invoice
3. Run the three-way match: PO vs. goods receipt vs. invoice
4. Resolve any discrepancies (quantity, pricing)
5. Approve the matched invoice for payment

### 6.4 Quiz -- Module 5

**Q1.** What is the Procurement Agent's SAR approval limit?

- A) 10,000 SAR
- B) 15,000 SAR
- C) 20,000 SAR
- D) 50,000 SAR

**Correct Answer**: C -- The Procurement Agent has a 20,000 SAR approval limit.

**Q2.** What documents must match in three-way matching?

- A) PO, invoice, payment
- B) PO, goods receipt, supplier invoice
- C) Estimate, invoice, payment
- D) Quote, PO, invoice

**Correct Answer**: B -- Three-way matching requires PO, goods receipt, and supplier invoice to agree.

---

## 7. Module 6 -- Financial Reporting (60 minutes)

### 7.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Standard financial reports           | 15 min   |
| 2 | Inventory reports                    | 15 min   |
| 3 | Custom report builder                | 15 min   |
| 4 | Scheduled reports and distribution   | 15 min   |

### 7.2 Key Concepts

- **Financial Reports**: Profit & Loss, Balance Sheet, Cash Flow, Trial Balance, Aging
- **Inventory Reports**: Stock valuation, movement history, reorder alerts, dead stock analysis
- **ZATCA Reports**: VAT return summaries, e-invoice submission logs
- **Export Formats**: PDF, Excel, CSV
- **Scheduled Delivery**: Auto-delivery to designated email addresses

### 7.3 Hands-On Lab

**Lab 6.1: Generating Financial Reports**

1. Navigate to Reports > Financial > Profit & Loss
2. Set the period and branch filter
3. Generate and review the P&L statement
4. Export as Excel for further analysis
5. Navigate to Reports > Inventory > Stock Valuation
6. Review the FIFO valuation report
7. Schedule a weekly stock valuation report delivery

### 7.4 Quiz -- Module 6

**Q1.** Which report shows outstanding receivables by age?

- A) Profit & Loss
- B) Balance Sheet
- C) Aging Report
- D) Cash Flow Statement

**Correct Answer**: C -- The Aging Report tracks receivables by 30/60/90/120+ day buckets.

---

## 8. Course Summary

| Module | Topic                           | Duration | Primary Role(s)          |
|--------|---------------------------------|----------|--------------------------|
| 1      | Chart of Accounts & Journals    | 120 min  | Accountant               |
| 2      | Invoicing & ZATCA               | 120 min  | Accountant               |
| 3      | Payments                        | 60 min   | Accountant               |
| 4      | Parts Inventory                 | 90 min   | Storekeeper              |
| 5      | Procurement                     | 90 min   | Procurement Agent        |
| 6      | Financial Reporting             | 60 min   | Accountant, Storekeeper  |

---

## 9. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Finance Staff Guide](../user-documentation/guides/finance-staff-guide.md)
- [Invoice Payment Workflow](../user-documentation/workflows/invoice-payment.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 10. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
