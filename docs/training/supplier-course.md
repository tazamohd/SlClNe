# SALIS AUTO -- Supplier Portal Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-010                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Supplier                                  |
| Demo Account     | Al-Jazira Parts Co. (supplier@aljazira.sa)|
| Password         | Demo@1234                                 |
| Approval Scope   | External                                  |
| SAR Limit        | 0 SAR (no system approval authority)      |
| Duration         | 3 hours (3 modules)                       |
| Track            | External (P3 -- week 4-6)                |
| Prerequisites    | None                                      |
| Delivery         | Self-paced (LMS video modules)            |

### 1.1 Learning Objectives

Upon completing this course, the Supplier will be able to:

1. Register and manage their supplier portal account and product catalog
2. Receive, process, and fulfill purchase orders
3. Submit invoices and track payment status

---

## 2. Module 1 -- Registration & Catalog Management (60 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Supplier portal overview             | 10 min   |
| 2 | Account registration and verification| 15 min   |
| 3 | Company profile setup                | 10 min   |
| 4 | Product catalog management           | 15 min   |
| 5 | Pricing and availability updates     | 10 min   |

### 2.2 Key Concepts

- **External Scope**: Suppliers access only their own data -- orders directed to them, their catalog, their invoices
- **Registration**: Supplier registration requires company name, commercial registration (CR) number, VAT registration, and bank details
- **Verification**: New supplier accounts are verified by the Procurement Agent before activation
- **Catalog Structure**: Products organized by category, with part number, description, unit price, and availability
- **Pricing Updates**: Suppliers can update pricing; changes take effect after procurement review
- **Bilingual Catalog**: Product names and descriptions support EN/AR

### 2.3 Hands-On Lab

**Lab 1.1: Accessing the Supplier Portal**

1. Navigate to the SALIS AUTO Supplier Portal
2. Log in with the demo account (`supplier@aljazira.sa` / `Demo@1234`)
3. Review the supplier dashboard: open orders, pending invoices, recent activity
4. Switch between English and Arabic to verify bilingual support

**Lab 1.2: Managing the Company Profile**

1. Navigate to My Company > Profile
2. Review the company details:
   - Company name (Al-Jazira Parts Co.)
   - Commercial Registration number
   - VAT registration number
   - Bank account details (for payment receipt)
   - Contact persons and their roles
3. Update a contact person's phone number
4. Verify the change is reflected in the profile

**Lab 1.3: Managing the Product Catalog**

1. Navigate to Catalog > My Products
2. Review existing products with their details (part number, description, price, stock status)
3. Add a new product to the catalog:
   - Part number
   - Name (EN and AR)
   - Category
   - Unit price in SAR (system stores as halalas)
   - Minimum order quantity
   - Lead time (days)
   - Availability status (In Stock, Limited, Out of Stock)
4. Update the price of an existing product
5. Mark a product as "Out of Stock"
6. Review the catalog summary report

**Lab 1.4: Bulk Catalog Update**

1. Navigate to Catalog > Bulk Update
2. Download the catalog template (Excel format)
3. Review the template fields and fill in sample data
4. Upload the updated template
5. Review the import preview and confirm the changes
6. Verify the catalog reflects the bulk updates

### 2.4 Quiz -- Module 1

**Q1.** What information is required for supplier registration?

- A) Company name only
- B) Company name, CR number, VAT registration, and bank details
- C) Phone number and email only
- D) Product catalog only

**Correct Answer**: B -- Registration requires company name, CR number, VAT registration, and bank details.

**Q2.** Who verifies new supplier accounts?

- A) The Owner/CEO
- B) The Procurement Agent
- C) The system auto-approves
- D) The Accountant

**Correct Answer**: B -- New supplier accounts are verified by the Procurement Agent.

**Q3.** What scope does the supplier role have?

- A) Branch
- B) All
- C) Self
- D) External (own orders and catalog only)

**Correct Answer**: D -- Suppliers have "external" scope, limited to their own data.

**Q4.** When do supplier pricing updates take effect?

- A) Immediately upon saving
- B) After procurement review and approval
- C) At the start of the next month
- D) They cannot be changed

**Correct Answer**: B -- Pricing changes take effect after procurement review.

---

## 3. Module 2 -- Order Management (60 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Receiving purchase orders            | 15 min   |
| 2 | Order acknowledgment                 | 10 min   |
| 3 | Fulfillment and shipping             | 15 min   |
| 4 | Delivery confirmation                | 10 min   |
| 5 | Handling backorders and returns      | 10 min   |

### 3.2 Key Concepts

- **PO Receipt**: Suppliers receive purchase orders from SALIS AUTO's Procurement Agent
- **Order Lifecycle**: PO Received -> Acknowledged -> Shipped -> Delivered -> Invoiced
- **Acknowledgment**: Supplier confirms the order and estimated delivery date
- **Fulfillment**: Supplier ships goods and updates the tracking information
- **Delivery Confirmation**: Storekeeper confirms receipt at the SALIS AUTO branch
- **Three-Way Match**: PO, goods receipt, and supplier invoice must match for payment processing
- **Backorders**: Items not available are marked as backordered with an ETA

### 3.3 Hands-On Lab

**Lab 2.1: Receiving and Acknowledging a PO**

1. Navigate to Orders > Incoming
2. Review the list of new purchase orders
3. Open a PO and review the line items:
   - Part numbers, descriptions, quantities, agreed prices
4. Click "Acknowledge" and set the estimated delivery date
5. If an item is unavailable, mark it as backordered with an ETA
6. Confirm the acknowledgment -- the buyer receives a notification

**Lab 2.2: Fulfilling an Order**

1. Navigate to Orders > In Progress
2. Select an acknowledged order ready for shipment
3. Enter shipping details:
   - Carrier name
   - Tracking number
   - Estimated arrival date
   - Packing list (items and quantities shipped)
4. Mark the order as "Shipped"
5. Verify the buyer (Procurement Agent) receives the shipment notification

**Lab 2.3: Handling a Partial Delivery**

1. Open a PO with multiple line items
2. Ship only the available items (partial fulfillment)
3. Mark the remaining items as backordered
4. Update the backorder ETA
5. Verify the system tracks the partial delivery separately

**Lab 2.4: Reviewing Delivery Confirmation**

1. Navigate to Orders > Shipped
2. Check for orders with delivery confirmation from the SALIS AUTO storekeeper
3. Review any discrepancies noted during receiving (quantity or quality issues)
4. Respond to discrepancy notes if applicable
5. Verify the order status updates to "Delivered"

### 3.4 Quiz -- Module 2

**Q1.** What is the correct order lifecycle for suppliers?

- A) Shipped -> Received -> Acknowledged -> Invoiced
- B) PO Received -> Acknowledged -> Shipped -> Delivered -> Invoiced
- C) Invoiced -> Shipped -> Delivered -> Acknowledged
- D) Acknowledged -> PO Received -> Shipped -> Invoiced

**Correct Answer**: B -- The lifecycle is PO Received -> Acknowledged -> Shipped -> Delivered -> Invoiced.

**Q2.** What must match for payment processing to proceed?

- A) PO and invoice only
- B) PO, goods receipt, and supplier invoice (three-way match)
- C) Invoice and delivery note only
- D) PO and goods receipt only

**Correct Answer**: B -- Three-way matching requires PO, goods receipt, and supplier invoice.

**Q3.** What should the supplier do when an item is unavailable?

- A) Cancel the entire order
- B) Mark the item as backordered with an ETA
- C) Ship a substitute without notification
- D) Ignore the item

**Correct Answer**: B -- Unavailable items should be marked as backordered with an estimated availability date.

**Q4.** Who confirms delivery at the SALIS AUTO branch?

- A) The Procurement Agent
- B) The Storekeeper (parts@salisauto.sa)
- C) The Branch Manager
- D) The system auto-confirms

**Correct Answer**: B -- The Storekeeper (Yousef Al-Ghamdi) confirms receipt at the branch.

---

## 4. Module 3 -- Invoicing & Payment Tracking (60 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Creating and submitting invoices     | 20 min   |
| 2 | ZATCA compliance for suppliers       | 10 min   |
| 3 | Invoice status tracking              | 10 min   |
| 4 | Payment receipt and reconciliation   | 10 min   |
| 5 | Dispute resolution                   | 10 min   |

### 4.2 Key Concepts

- **Invoice Submission**: Suppliers submit invoices against delivered POs
- **ZATCA Compliance**: Supplier invoices must include VAT at 15%, QR code, and hash chain reference
- **Three-Way Match**: Invoice is validated against PO and goods receipt before payment approval
- **SOD Relevance**: Create Supplier / Approve Supplier Payment -- SALIS AUTO enforces this internally
- **Payment Terms**: Net 30/60/90 days as per supplier agreement
- **Payment Tracking**: Suppliers track payment status (Submitted, Under Review, Approved, Paid)
- **Currency**: All amounts in SAR (stored as integer halalas)

### 4.3 Hands-On Lab

**Lab 3.1: Submitting an Invoice**

1. Navigate to Invoices > Create Invoice
2. Select a delivered PO as the reference
3. The system pre-populates line items from the PO
4. Verify quantities match the delivered amounts
5. Confirm the pricing and VAT (15%) calculation
6. Submit the invoice -- the system generates the QR code and hash chain entry
7. Download a copy of the submitted invoice as PDF

**Lab 3.2: Tracking Invoice and Payment Status**

1. Navigate to Invoices > My Invoices
2. Review the list of submitted invoices with their status:
   - Submitted: Pending review by SALIS AUTO
   - Under Review: Three-way match in progress
   - Approved: Cleared for payment
   - Paid: Payment processed
   - Disputed: Discrepancy identified
3. Open an invoice with "Approved" status and note the expected payment date
4. Open an invoice with "Paid" status and verify the payment details (amount, date, reference)

**Lab 3.3: Handling a Dispute**

1. Navigate to Invoices > My Invoices
2. Open an invoice with "Disputed" status
3. Review the discrepancy notes from the SALIS AUTO procurement team
4. Respond with clarification or submit a corrected invoice (credit note + new invoice)
5. Track the dispute resolution until the invoice is approved or adjusted

### 4.4 Quiz -- Module 3

**Q1.** What must supplier invoices include for ZATCA compliance?

- A) Company logo only
- B) VAT at 15%, QR code, and hash chain reference
- C) Customer signature
- D) Delivery photos

**Correct Answer**: B -- ZATCA requires VAT at 15%, QR code, and hash chain integrity.

**Q2.** What is the invoice lifecycle from the supplier's perspective?

- A) Created -> Paid
- B) Submitted -> Under Review -> Approved -> Paid
- C) Submitted -> Paid
- D) Approved -> Submitted -> Paid

**Correct Answer**: B -- Invoices go through Submitted -> Under Review -> Approved -> Paid.

**Q3.** What should a supplier do when an invoice is disputed?

- A) Submit a new invoice ignoring the dispute
- B) Review the discrepancy, respond with clarification, or submit a corrected invoice
- C) Contact the Owner/CEO directly
- D) Cancel the order

**Correct Answer**: B -- Suppliers should review the discrepancy, clarify, or submit a corrected invoice.

---

## 5. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Registration & Catalog          | 60 min   | Self-service catalog management         |
| 2      | Order Management                | 60 min   | Full PO lifecycle with delivery tracking|
| 3      | Invoicing & Payment Tracking    | 60 min   | ZATCA-compliant invoicing and payments  |

### 5.1 Support Resources

- **Procurement Contact**: Bandar Al-Subaie (procurement@salisauto.sa)
- **Portal Help**: Available under Help > Supplier FAQ
- **Technical Support**: support@salisauto.sa

---

## 6. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [Invoice Payment Workflow](../user-documentation/workflows/invoice-payment.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 7. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
