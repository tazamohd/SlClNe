# SALIS AUTO -- Assessment Question Bank

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-013                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Overview

This document contains the assessment question bank for SALIS AUTO training certification. Questions are organized by domain and mapped to specific course modules. Each question includes four options (A-D), the correct answer, and an explanation.

### 1.1 Question Distribution

| Domain                | Count | Related Courses             |
|-----------------------|-------|-----------------------------|
| Workshop              | 15    | SA-TRN-004, 005, 006        |
| Finance               | 15    | SA-TRN-002, 003, 007        |
| Inventory             | 10    | SA-TRN-007                   |
| CRM                   | 8     | SA-TRN-008                   |
| HR                    | 8     | SA-TRN-008                   |
| Admin                 | 10    | SA-TRN-011                   |
| Customer              | 8     | SA-TRN-009                   |
| Supplier              | 8     | SA-TRN-010                   |
| Fundamentals          | 10    | All courses                  |
| **Total**             | **92**|                              |

### 1.2 Assessment Rules

- Passing score: 70% (Bronze), 80% (Silver), 90% (Gold)
- Time limit: 45 minutes per 30-question assessment
- Maximum 3 attempts with 48-hour cooldown
- Questions are randomized per attempt

---

## 2. Workshop Domain (15 Questions)

**W01.** What is the correct order of the workshop lifecycle?

- A) Inspection -> Check-In -> Estimate -> QC -> Repair -> Delivery
- B) Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
- C) Check-In -> Estimate -> Inspection -> Repair -> Delivery -> QC
- D) Estimate -> Check-In -> Inspection -> Repair -> QC -> Delivery

**Correct**: B | The lifecycle follows Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery.

**W02.** Which role performs the initial vehicle inspection?

- A) Service Advisor
- B) Technician
- C) QC Inspector
- D) Branch Manager

**Correct**: B | The technician performs the initial inspection; the advisor assigns and reviews.

**W03.** What is the Service Advisor's SAR approval limit for estimates?

- A) 1,000 SAR
- B) 5,000 SAR
- C) 10,000 SAR
- D) 50,000 SAR

**Correct**: B | The advisor can approve estimates up to 5,000 SAR.

**W04.** What SOD rule prevents the same person from repairing and inspecting quality?

- A) Raise PO / Approve PO
- B) Post Journal / Approve Journal
- C) Perform Repair / Pass QC
- D) Issue Stock / Adjust Stock Count

**Correct**: C | The Perform Repair / Pass QC SOD pair ensures independent quality verification.

**W05.** What status does a job card receive after the technician submits for QC?

- A) Completed
- B) Pending QC
- C) Delivered
- D) In Review

**Correct**: B | After repair is complete, the job status changes to "Pending QC."

**W06.** Who is notified when a job passes QC and is ready for delivery?

- A) The customer directly
- B) The technician
- C) The Service Advisor
- D) The Owner/CEO

**Correct**: C | The Service Advisor is notified to arrange vehicle delivery to the customer.

**W07.** What happens when a job fails QC?

- A) The job is closed and invoiced
- B) The job returns to "Rework Required" status
- C) The customer is notified of the failure
- D) The job is deleted from the system

**Correct**: B | Failed QC jobs return to "Rework Required" for technician rework.

**W08.** What documentation must a technician provide before submitting for QC?

- A) Invoice amount and payment receipt
- B) Work descriptions, photos, and time logs
- C) Customer contact information
- D) Parts pricing and supplier details

**Correct**: B | Technicians must document work descriptions, photos, and labor time logs.

**W09.** What urgency levels are available for parts requests?

- A) Low and High
- B) Normal, Urgent, Critical
- C) 1-5 scale
- D) Standard only

**Correct**: B | Parts requests can be flagged as Normal, Urgent, or Critical.

**W10.** What scope does the technician role have?

- A) Branch
- B) All
- C) Own (assigned jobs only)
- D) Platform

**Correct**: C | Technicians have "own" scope, seeing only their assigned jobs.

**W11.** What is the first step when a walk-in customer arrives at the front desk?

- A) Create an invoice
- B) Search for existing customer record
- C) Assign a technician
- D) Generate a QC checklist

**Correct**: B | The receptionist first identifies whether the customer is new or returning.

**W12.** When are automated appointment reminders sent to customers?

- A) 1 hour before
- B) 24 hours before
- C) 48 hours before
- D) 1 week before

**Correct**: B | Automated reminders are sent 24 hours before the scheduled appointment.

**W13.** What happens when an estimate exceeds the manager's 50,000 SAR ceiling?

- A) It is automatically rejected
- B) It escalates to the Owner/CEO for approval
- C) The manager can override the limit
- D) It is split into multiple estimates

**Correct**: B | Estimates above 50,000 SAR escalate to the owner who has unlimited approval authority.

**W14.** What is the QC benchmark for first-pass rate?

- A) 80%
- B) 90%
- C) 95%
- D) 100%

**Correct**: C | A 95% first-pass QC rate is the standard benchmark target.

**W15.** What does the technician do when discovering an unexpected issue during repair?

- A) Fix it immediately without documentation
- B) Submit an "Additional Finding" to the advisor
- C) Skip it and complete the original repair
- D) Contact the customer directly

**Correct**: B | Additional findings must be documented and sent to the advisor for estimate amendment.

---

## 3. Finance Domain (15 Questions)

**F01.** What VAT rate does ZATCA Phase 2 mandate?

- A) 5%
- B) 10%
- C) 15%
- D) 20%

**Correct**: C | ZATCA Phase 2 requires 15% VAT on all taxable invoices.

**F02.** How long must invoices be retained under ZATCA compliance?

- A) 3 years
- B) 5 years
- C) 7 years
- D) 10 years

**Correct**: C | ZATCA mandates 7-year document retention for all financial records.

**F03.** What is the purpose of the hash chain on invoices?

- A) Encryption of customer data
- B) Tamper detection through sequential linking
- C) Payment tracking
- D) Currency conversion

**Correct**: B | The hash chain links invoices sequentially to detect tampering.

**F04.** How are monetary values stored in SALIS AUTO?

- A) As floating-point SAR values
- B) As integer halalas
- C) As string representations
- D) As rounded SAR integers

**Correct**: B | Money is stored as integer halalas (100 halalas = 1 SAR) for precision.

**F05.** What is the Accountant's SAR approval limit?

- A) 10,000 SAR
- B) 15,000 SAR
- C) 25,000 SAR
- D) 50,000 SAR

**Correct**: C | The Accountant has a 25,000 SAR approval ceiling.

**F06.** What SOD rule applies to journal entries?

- A) Raise PO / Approve PO
- B) Post Journal / Approve Journal
- C) Create Supplier / Approve Payment
- D) Issue Stock / Adjust Count

**Correct**: B | The Post Journal / Approve Journal SOD pair prevents self-approval of journals.

**F07.** What does ZATCA require on every e-invoice?

- A) Customer's national ID
- B) QR code with seller, VAT number, total, VAT amount, timestamp
- C) Handwritten signature
- D) Physical stamp

**Correct**: B | Each e-invoice must include a QR code with key transaction data.

**F08.** What is the Owner/CEO's SAR approval limit?

- A) 100,000 SAR
- B) 500,000 SAR
- C) 1,000,000 SAR
- D) Unlimited

**Correct**: D | The Owner/CEO has unlimited approval authority.

**F09.** Which report tracks outstanding receivables by age?

- A) Profit & Loss
- B) Balance Sheet
- C) Aging Report
- D) Cash Flow Statement

**Correct**: C | The Aging Report tracks receivables in 30/60/90/120+ day buckets.

**F10.** What accounting method does SALIS AUTO use for journal entries?

- A) Single-entry
- B) Double-entry with mandatory balancing
- C) Cash-basis only
- D) Modified accrual

**Correct**: B | All transactions follow double-entry accounting with mandatory balancing.

**F11.** What permission action enables exporting financial reports?

- A) v (view)
- B) c (create)
- C) e (edit)
- D) x (export)

**Correct**: D | The x (export) permission controls the ability to export reports.

**F12.** What happens to a closed accounting period?

- A) Anyone can modify it
- B) It requires manager or owner override to modify
- C) It is permanently locked with no exceptions
- D) It auto-reopens after 30 days

**Correct**: B | Closed periods need manager or owner override for modification.

**F13.** What is the Branch Manager's SAR approval limit?

- A) 25,000 SAR
- B) 50,000 SAR
- C) 75,000 SAR
- D) 100,000 SAR

**Correct**: B | The Branch Manager has a 50,000 SAR approval ceiling.

**F14.** What document corrects a previously issued ZATCA invoice?

- A) Revised invoice
- B) Credit note referencing the original invoice
- C) Verbal agreement
- D) Deletion of the original

**Correct**: B | Credit notes are required for invoice corrections; the original stays in the hash chain.

**F15.** How frequently can scheduled financial reports be delivered?

- A) Hourly only
- B) Daily, weekly, or monthly
- C) Weekly only
- D) On-demand only

**Correct**: B | Scheduled reports support daily, weekly, and monthly auto-delivery.

---

## 4. Inventory Domain (10 Questions)

**I01.** What inventory valuation method does SALIS AUTO use?

- A) LIFO
- B) FIFO
- C) Weighted Average
- D) Specific Identification

**Correct**: B | SALIS AUTO uses FIFO (First In, First Out) for inventory valuation.

**I02.** What SOD rule applies to inventory management?

- A) Raise PO / Approve PO
- B) Post Journal / Approve Journal
- C) Issue Stock / Adjust Stock Count
- D) Perform Repair / Pass QC

**Correct**: C | Issue Stock / Adjust Stock Count prevents the same user from doing both.

**I03.** What is the Storekeeper's SAR approval limit?

- A) 5,000 SAR
- B) 10,000 SAR
- C) 15,000 SAR
- D) 25,000 SAR

**Correct**: B | The Storekeeper has a 10,000 SAR approval limit.

**I04.** What permission does the technician have on the parts module?

- A) View and delete
- B) View and create (request only)
- C) Full access
- D) View only

**Correct**: B | Technicians can view parts and create requests but cannot issue or adjust stock.

**I05.** What documents must match in three-way matching?

- A) PO, invoice, payment
- B) PO, goods receipt, supplier invoice
- C) Estimate, invoice, payment
- D) Quote, PO, invoice

**Correct**: B | Three-way matching validates PO, goods receipt, and supplier invoice.

**I06.** What is the Procurement Agent's SAR approval limit?

- A) 10,000 SAR
- B) 15,000 SAR
- C) 20,000 SAR
- D) 50,000 SAR

**Correct**: C | The Procurement Agent has a 20,000 SAR approval ceiling.

**I07.** What SOD rule applies to purchase orders?

- A) Raise PO / Approve PO
- B) Issue Stock / Adjust Stock Count
- C) Perform Repair / Pass QC
- D) Post Journal / Approve Journal

**Correct**: A | The Raise PO / Approve PO SOD pair prevents self-approval of purchase orders.

**I08.** What scope does the Storekeeper role operate at?

- A) All
- B) Branch
- C) Own
- D) Platform

**Correct**: B | The Storekeeper has branch scope, managing inventory at their assigned branch.

**I09.** What triggers a reorder alert in the inventory system?

- A) Stock reaches zero
- B) Stock falls below the minimum threshold
- C) Monthly automatic trigger
- D) Manager request

**Correct**: B | Reorder alerts trigger when stock falls below the configured minimum threshold.

**I10.** Who verifies new supplier accounts before activation?

- A) Owner/CEO
- B) Procurement Agent
- C) Accountant
- D) System auto-approves

**Correct**: B | The Procurement Agent verifies new supplier accounts before activation.

---

## 5. CRM Domain (8 Questions)

**C01.** What is the correct lead pipeline order?

- A) Qualified -> New -> Contacted -> Converted
- B) New -> Contacted -> Qualified -> Converted or Lost
- C) Contacted -> New -> Converted -> Qualified
- D) New -> Qualified -> Contacted -> Converted

**Correct**: B | The pipeline is New -> Contacted -> Qualified -> Converted or Lost.

**C02.** What scope does the Call Center Agent have?

- A) Branch
- B) Own
- C) All (cross-branch)
- D) External

**Correct**: C | Call center agents have "all" scope for cross-branch customer assistance.

**C03.** What lead sources does the CRM track?

- A) Walk-in only
- B) Walk-in, phone, website, referral, campaign
- C) Phone only
- D) Website only

**Correct**: B | The CRM tracks leads from walk-in, phone, website, referral, and campaign sources.

**C04.** What disposition code indicates a call needs follow-up?

- A) Resolved
- B) Escalated
- C) Follow-up needed
- D) No answer

**Correct**: C | "Follow-up needed" indicates the case requires another contact.

**C05.** What RBAC modules does the Call Center Agent access?

- A) Invoices and payments only
- B) Customers, vehicles, appointments, feedback, leads, opportunities
- C) All 28 modules
- D) Dashboard only

**Correct**: B | Call center agents access customers, vehicles, appointments, feedback, leads, and opportunities.

**C06.** What is the Call Center Agent's SAR approval limit?

- A) 1,000 SAR
- B) 5,000 SAR
- C) 10,000 SAR
- D) 0 SAR

**Correct**: D | Call center agents have no financial approval authority.

**C07.** What notification channels are available for customer communications?

- A) Email only
- B) Push and email only
- C) Push, email, and in-app
- D) SMS only

**Correct**: C | Notifications are available via push, email, and in-app channels.

**C08.** What happens when a lead is converted?

- A) It becomes a customer record with an appointment
- B) It is deleted from the system
- C) It moves to the "Lost" status
- D) It requires manager approval

**Correct**: A | Converted leads become customer records, typically with a booked appointment.

---

## 6. HR Domain (8 Questions)

**H01.** What is the HR Manager's SAR approval limit?

- A) 5,000 SAR
- B) 10,000 SAR
- C) 15,000 SAR
- D) 25,000 SAR

**Correct**: C | The HR Manager has a 15,000 SAR approval limit for HR-related expenditures.

**H02.** What scope does the HR Manager operate at?

- A) Branch
- B) Own
- C) All (cross-branch)
- D) External

**Correct**: C | The HR Manager has "all" scope for managing staff across all branches.

**H03.** What RBAC modules does the HR Manager access?

- A) hr and staff only
- B) hr, staff, and reports
- C) All 28 modules
- D) hr only

**Correct**: B | The HR Manager accesses hr (v,c,e,a), staff (v,c,e,a), and reports (v,x).

**H04.** Who coordinates training enrollment for internal staff?

- A) Branch Manager only
- B) HR Manager
- C) Super Admin
- D) Each employee self-enrolls

**Correct**: B | The HR Manager coordinates LMS enrollment for all internal staff.

**H05.** What leave types are supported by the system?

- A) Annual only
- B) Annual and sick only
- C) Annual, sick, emergency, and unpaid
- D) Unlimited PTO

**Correct**: C | The system supports annual, sick, emergency, and unpaid leave types.

**H06.** What is the employee lifecycle in the HR module?

- A) Hired -> Active -> Terminated
- B) Onboarding -> Active -> Performance Review -> Offboarding
- C) Active -> Review -> Active
- D) Application -> Interview -> Hired

**Correct**: B | The lifecycle is Onboarding -> Active -> Performance Review -> Offboarding.

**H07.** Can a Branch Manager modify platform-wide HR policies?

- A) Yes, for their branch only
- B) Yes, for all branches
- C) No, this requires the HR Manager or Owner role
- D) No, HR policies are fixed and cannot be changed

**Correct**: C | Platform-wide HR policies are managed by the HR Manager or Owner/CEO.

**H08.** What performance metric is tracked per technician?

- A) Revenue generated
- B) Job completion rate and quality score
- C) Customer acquisition cost
- D) Supplier lead time

**Correct**: B | Job completion rate, quality score, and customer ratings are tracked per technician.

---

## 7. Admin Domain (10 Questions)

**A01.** What scope does the Super Admin role operate at?

- A) Branch
- B) All
- C) Platform (full system access)
- D) External

**Correct**: C | The Super Admin operates at platform scope with full system access.

**A02.** How many RBAC modules are in the SALIS AUTO platform?

- A) 14
- B) 21
- C) 28
- D) 35

**Correct**: C | There are 28 RBAC modules in the platform.

**A03.** How many SOD pairs are enforced by the system?

- A) 3
- B) 4
- C) 5
- D) 6

**Correct**: C | Five SOD pairs are enforced: Raise PO/Approve PO, Create Supplier/Approve Payment, Post Journal/Approve Journal, Perform Repair/Pass QC, Issue Stock/Adjust Count.

**A04.** What permission action controls record deletion?

- A) e (edit)
- B) d (delete)
- C) a (approve)
- D) x (export)

**Correct**: B | The d (delete) permission action controls the ability to remove records.

**A05.** What does the audit trail record?

- A) Only financial transactions
- B) All system actions with user ID, timestamp, action, and details
- C) Login attempts only
- D) Customer interactions only

**Correct**: B | The audit trail records all system actions with full contextual data.

**A06.** How many built-in roles does the SALIS AUTO platform have?

- A) 8
- B) 10
- C) 14
- D) 20

**Correct**: C | There are 14 built-in roles in the platform.

**A07.** What are the six permission actions in the RBAC system?

- A) read, write, delete, admin, export, import
- B) v (view), c (create), e (edit), d (delete), a (approve), x (export)
- C) view, add, modify, remove, authorize, print
- D) get, post, put, delete, patch, options

**Correct**: B | The six actions are v=view, c=create, e=edit, d=delete, a=approve, x=export.

**A08.** Can the Super Admin terminate active user sessions?

- A) No, sessions expire automatically only
- B) Yes, from the Security Dashboard
- C) Only the Owner can terminate sessions
- D) Sessions cannot be terminated manually

**Correct**: B | The Super Admin can terminate active sessions from the Security Dashboard.

**A09.** What happens when the Super Admin creates a custom role?

- A) It replaces an existing built-in role
- B) It inherits from a base role and can have additional permissions
- C) It requires Owner approval
- D) Custom roles are not supported

**Correct**: B | Custom roles inherit from a base role and can receive additional permissions.

**A10.** What compliance reports can the Super Admin generate?

- A) ZATCA compliance only
- B) ZATCA compliance, SOD compliance, data retention compliance
- C) Financial audit only
- D) No compliance reporting exists

**Correct**: B | The Super Admin can generate ZATCA, SOD, and data retention compliance reports.

---

## 8. Customer Domain (8 Questions)

**CU01.** What scope does the customer role have?

- A) Branch
- B) All
- C) Self (own records only)
- D) External

**Correct**: C | Customers have "self" scope and can only access their own records.

**CU02.** Which lifecycle stages are visible to the customer?

- A) Only Check-In and Delivery
- B) Check-In, Inspection, Estimate, Repair, QC, Delivery
- C) Only Repair and Delivery
- D) Customers cannot track service status

**Correct**: B | Customers see a simplified view of all six lifecycle stages.

**CU03.** Can customers accept or reject estimates from the portal?

- A) No, only in person
- B) Yes, they can accept or reject with a reason
- C) Only acceptance is available online
- D) Estimates are not visible to customers

**Correct**: B | Customers can accept or reject estimates with a documented reason.

**CU04.** What feedback options are available after service completion?

- A) Star rating only
- B) Text comment only
- C) Star rating (1-5) and text comment
- D) No feedback mechanism exists

**Correct**: C | Customers can submit a star rating (1-5) and a text comment.

**CU05.** What payment methods are available via the customer portal?

- A) Cash only
- B) Card and bank transfer online; cash and POS in-branch
- C) Bank transfer only
- D) Check only

**Correct**: B | Online payments (card, bank transfer) are available via the portal; cash and POS in-branch.

**CU06.** How many vehicles can a customer register?

- A) One only
- B) Up to three
- C) Up to five
- D) Multiple (no fixed limit)

**Correct**: D | Customers can register multiple vehicles with no fixed limit.

**CU07.** What languages does the customer portal support?

- A) English only
- B) Arabic only
- C) English and Arabic with RTL support
- D) English, Arabic, and French

**Correct**: C | The portal supports English and Arabic with full RTL layout switching.

**CU08.** How are status updates delivered to customers?

- A) Phone calls only
- B) Automated notifications via preferred channel (SMS, email, in-app)
- C) Postal mail
- D) Portal only, no push notifications

**Correct**: B | Automated notifications are sent via the customer's configured preferred channel.

---

## 9. Supplier Domain (8 Questions)

**S01.** What scope does the supplier role have?

- A) Branch
- B) All
- C) Self
- D) External (own orders and catalog only)

**Correct**: D | Suppliers have "external" scope limited to their own orders and catalog.

**S02.** What is the correct supplier order lifecycle?

- A) Shipped -> Received -> Acknowledged -> Invoiced
- B) PO Received -> Acknowledged -> Shipped -> Delivered -> Invoiced
- C) Invoiced -> Shipped -> Delivered
- D) Acknowledged -> PO Received -> Shipped

**Correct**: B | The lifecycle is PO Received -> Acknowledged -> Shipped -> Delivered -> Invoiced.

**S03.** Who verifies new supplier accounts?

- A) Owner/CEO
- B) Procurement Agent
- C) System auto-approves
- D) Accountant

**Correct**: B | The Procurement Agent verifies new supplier accounts before activation.

**S04.** What must supplier invoices include for ZATCA compliance?

- A) Company logo only
- B) VAT at 15%, QR code, and hash chain reference
- C) Customer signature
- D) Delivery photos

**Correct**: B | ZATCA requires VAT at 15%, QR code, and hash chain integrity on all invoices.

**S05.** What should a supplier do when an item is unavailable?

- A) Cancel the entire order
- B) Mark the item as backordered with an ETA
- C) Ship a substitute without notification
- D) Ignore the item

**Correct**: B | Unavailable items should be marked as backordered with an ETA.

**S06.** Who confirms delivery at the SALIS AUTO branch?

- A) Procurement Agent
- B) Storekeeper (Yousef Al-Ghamdi)
- C) Branch Manager
- D) System auto-confirms

**Correct**: B | The Storekeeper confirms goods receipt at the branch.

**S07.** When do supplier pricing updates take effect?

- A) Immediately upon saving
- B) After procurement review and approval
- C) At the start of the next month
- D) They cannot be changed

**Correct**: B | Pricing changes require procurement review before taking effect.

**S08.** What is the invoice status lifecycle from the supplier perspective?

- A) Created -> Paid
- B) Submitted -> Under Review -> Approved -> Paid
- C) Submitted -> Paid
- D) Approved -> Submitted -> Paid

**Correct**: B | Supplier invoices go through Submitted -> Under Review -> Approved -> Paid.

---

## 10. Fundamentals Domain (10 Questions)

**FN01.** How many domains does the SALIS AUTO platform cover?

- A) 8
- B) 10
- C) 13
- D) 15

**Correct**: C | The platform covers 13 domains: Workshop, Registry, Finance, Accounting, CRM & Marketing, Administration, Authentication, AI Platform, Parts & Inventory, Call Center, Reports & Analytics, Team & HR, Portals.

**FN02.** What languages does the platform support?

- A) English only
- B) Arabic only
- C) English and Arabic with RTL support
- D) English, Arabic, and Urdu

**Correct**: C | The platform is bilingual EN/AR with full RTL layout support for Arabic.

**FN03.** What is the default password for all demo training accounts?

- A) Password123
- B) Demo@1234
- C) Admin@2026
- D) SalisAuto1

**Correct**: B | All demo accounts use the password Demo@1234.

**FN04.** How many training tracks are defined in the program?

- A) 2
- B) 3
- C) 4
- D) 5

**Correct**: C | Four tracks: Executive, Operations, Back-Office, External.

**FN05.** What is the minimum passing score for Bronze certification?

- A) 60%
- B) 70%
- C) 80%
- D) 90%

**Correct**: B | Bronze certification requires a minimum score of 70%.

**FN06.** How many built-in roles does the platform support?

- A) 8
- B) 10
- C) 14
- D) 20

**Correct**: C | The platform has 14 built-in roles.

**FN07.** What time does the demo environment reset daily?

- A) 00:00 AST
- B) 02:00 AST
- C) 06:00 AST
- D) 12:00 AST

**Correct**: B | The demo environment resets nightly at 02:00 AST.

**FN08.** Which track has the highest priority (P0 -- go-live)?

- A) Operations
- B) Back-Office
- C) Executive
- D) External

**Correct**: C | The Executive track is P0 and must be completed before go-live.

**FN09.** What is 1 SAR equivalent to in the system's internal storage?

- A) 1 unit
- B) 10 units
- C) 100 halalas
- D) 1000 halalas

**Correct**: C | 1 SAR = 100 halalas; the system stores monetary values as integer halalas.

**FN10.** How many SOD pairs are enforced across the platform?

- A) 3
- B) 4
- C) 5
- D) 7

**Correct**: C | Five SOD pairs are enforced: Raise PO/Approve PO, Create Supplier/Approve Payment, Post Journal/Approve Journal, Perform Repair/Pass QC, Issue Stock/Adjust Count.

---

## 11. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Certification Framework](certification-framework.md) (SA-TRN-014)
- [Train-the-Trainer Guide](train-the-trainer.md) (SA-TRN-012)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)

---

## 12. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
