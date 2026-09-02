# SALIS AUTO -- User Stories

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-AGI-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document provides user story templates and representative stories for each of the 13 SALIS AUTO domains. Stories follow the standard format with acceptance criteria, and are estimated using a Fibonacci-based story point scale.

---

## 2. Story Format

### 2.1 Template

```
**Story ID:** [DOMAIN-NNN]
**Epic:** [Epic ID -- Epic Title]
**As a** [role from the 14 SALIS AUTO roles],
**I want to** [action],
**So that** [business value].

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [result]
- [ ] ...

**Story Points:** [estimate]
**Priority:** [Must / Should / Could]
**Notes:** [technical notes, Saudi-specific requirements, RTL considerations]
```

### 2.2 Story Point Scale (Modified Fibonacci)

| Points | Effort Benchmark                                                  |
|--------|-------------------------------------------------------------------|
| 1      | Trivial change; config update, copy fix                           |
| 2      | Small task; single component, no API changes                      |
| 3      | Straightforward feature; one API endpoint + one UI screen          |
| 5      | Medium feature; multiple components, validation logic, i18n        |
| 8      | Large feature; multi-screen, API + DB schema, complex business logic|
| 13     | Very large; cross-domain integration, state machine, ZATCA work    |
| 21     | Epic-sized; should be decomposed further before sprint planning    |

---

## 3. Authentication Domain Stories

### AUTH-001: User Login

**Story ID:** AUTH-001
**Epic:** E-01 -- User Authentication & Session Management
**As a** Service Advisor,
**I want to** log in with my phone number (+966) and password,
**So that** I can access the workshop management system securely.

**Acceptance Criteria:**
- [ ] Given a valid +966 phone number and correct password, when I submit the login form, then I receive a JWT access token and am redirected to my role dashboard.
- [ ] Given an invalid phone number format, when I attempt to submit, then the form shows a validation error in the current language (EN or AR).
- [ ] Given incorrect credentials, when I submit, then I see a generic error message (not revealing which field is wrong) and the attempt is logged.
- [ ] Given the login page, when I toggle language, then all labels, placeholders, and errors switch between English and Arabic with correct RTL layout.

**Story Points:** 5
**Priority:** Must

### AUTH-003: Refresh Token Rotation

**Story ID:** AUTH-003
**Epic:** E-01 -- User Authentication & Session Management
**As a** Super Admin,
**I want** my session to automatically refresh without re-entering credentials,
**So that** I maintain a seamless experience during long configuration sessions.

**Acceptance Criteria:**
- [ ] Given an expired access token, when the frontend makes an API call, then TanStack React Query automatically uses the refresh token to obtain a new access token.
- [ ] Given a used refresh token, when it is exchanged, then the old token is revoked and a new refresh token is issued (rotation).
- [ ] Given a revoked refresh token being reused (replay attack), when it is submitted, then all sessions for the user are invalidated and the user must re-authenticate.

**Story Points:** 8
**Priority:** Must

---

## 4. Workshop Domain Stories

### WRK-002: Job Lifecycle State Machine

**Story ID:** WRK-002
**Epic:** E-03 -- Workshop Lifecycle Management
**As a** Branch Manager,
**I want** jobs to follow a defined lifecycle (Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery),
**So that** I can track every job's progress and ensure no step is skipped.

**Acceptance Criteria:**
- [ ] Given a job in "Check-In" state, when the Service Advisor completes intake, then the job transitions to "Inspection" and the assigned Technician is notified.
- [ ] Given a job in "Inspection" state, when the Technician submits findings, then the job transitions to "Estimate" and the Service Advisor is notified.
- [ ] Given a job in "Estimate" state, when the customer approves the estimate (via portal or in-person), then the job transitions to "Repair".
- [ ] Given a job in "Repair" state, when the Technician marks repair complete, then the job transitions to "QC" and the QC Inspector is notified.
- [ ] Given a job in "QC" state, when the inspector passes the job, then it transitions to "Delivery"; if failed, it returns to "Repair" with rejection notes.
- [ ] Given any state transition, then the transition is recorded in the job audit log with timestamp, user, and previous state.
- [ ] Given an invalid transition attempt (e.g., Check-In directly to Repair), then the API returns a 422 error with the allowed transitions.

**Story Points:** 13
**Priority:** Must

### WRK-005: Estimate Builder

**Story ID:** WRK-005
**Epic:** E-03 -- Workshop Lifecycle Management
**As a** Service Advisor,
**I want to** build an estimate with labor and parts line items (priced in SAR),
**So that** I can present the customer with a clear cost breakdown before repair begins.

**Acceptance Criteria:**
- [ ] Given the estimate builder, when I add a line item, then I can specify type (labor/parts), description, quantity, and unit price in SAR (displayed as SAR but stored as halalas).
- [ ] Given multiple line items, when I view the total, then VAT at 15% is calculated and displayed separately.
- [ ] Given my approval limit is SAR 5,000, when the estimate exceeds SAR 5,000, then the system routes the estimate for Branch Manager approval.
- [ ] Given the estimate is complete, when I send it to the customer, then the customer receives a notification (SMS/WhatsApp/email) with a link to the Customer Portal.

**Story Points:** 8
**Priority:** Must

---

## 5. Finance Domain Stories

### FIN-003: ZATCA Phase 2 XML Builder

**Story ID:** FIN-003
**Epic:** E-05 -- Invoicing, Payments & ZATCA Compliance
**As an** Accountant,
**I want** invoices to be automatically formatted as ZATCA Phase 2 compliant XML,
**So that** we pass regulatory certification and avoid penalties.

**Acceptance Criteria:**
- [ ] Given a finalized invoice, when the system generates the XML, then it conforms to ZATCA UBL 2.1 schema with all mandatory fields.
- [ ] Given the XML, when a QR code is generated, then it encodes the TLV (Tag-Length-Value) data: seller name, VAT number, timestamp, total (with VAT), VAT amount.
- [ ] Given an invoice sequence, when each invoice is generated, then its hash is chained to the previous invoice hash, creating a tamper-evident sequence.
- [ ] Given the generated XML, when it is submitted to the ZATCA sandbox API, then it receives a clearance or reporting response without validation errors.

**Story Points:** 13
**Priority:** Must

---

## 6. Registry Domain Stories

### REG-003: Vehicle Registration with Saudi Plates

**Story ID:** REG-003
**Epic:** E-04 -- Customer & Vehicle Registry
**As a** Receptionist,
**I want to** register a vehicle with its Saudi license plate format,
**So that** I can quickly look up vehicles during check-in.

**Acceptance Criteria:**
- [ ] Given the vehicle form, when I enter a Saudi plate number, then the system validates the format (Arabic/English characters + digits per Saudi standards).
- [ ] Given a valid plate, when I search, then matching vehicles and their service history appear.
- [ ] Given vehicle details, when I save, then make, model, year, VIN, and plate are stored and linked to the customer.
- [ ] Given the form in Arabic mode, then plate input supports Arabic character entry with correct RTL display.

**Story Points:** 5
**Priority:** Must

---

## 7. Parts & Inventory Domain Stories

### INV-003: Purchase Order Approval Chain

**Story ID:** INV-003
**Epic:** E-07 -- Inventory Management & Procurement
**As a** Storekeeper,
**I want to** create a purchase order that routes through the approval chain based on amount,
**So that** spending is controlled per our authorization limits.

**Acceptance Criteria:**
- [ ] Given a PO of SAR 8,000, when I submit it, then it is auto-approved (within my SAR 10,000 limit) and sent to the supplier.
- [ ] Given a PO of SAR 15,000, when I submit it, then it routes to the Procurement Agent (SAR 20,000 limit) for approval.
- [ ] Given a PO of SAR 35,000, when I submit it, then it routes to the Branch Manager (SAR 50,000 limit) after Procurement approval.
- [ ] Given a PO exceeding SAR 50,000, when it reaches the Manager, then it routes to the Owner/CEO for final approval.
- [ ] Given an approval step, when the approver rejects, then the PO returns to the requester with rejection notes and the status changes to "Rejected".
- [ ] Given any approval action, then the action is logged with timestamp, approver, and decision.

**Story Points:** 13
**Priority:** Must

---

## 8. Portals Domain Stories

### PTL-002: Customer Estimate Approval with E-Signature

**Story ID:** PTL-002
**Epic:** E-08 -- Customer & Supplier Self-Service Portals
**As a** Customer,
**I want to** review and approve a repair estimate online with my electronic signature,
**So that** I don't have to visit the workshop in person to authorize repairs.

**Acceptance Criteria:**
- [ ] **Step 1 -- Review:** Given a notification link, when I open it, then I see the full estimate with line items, subtotal, VAT (15%), and total in SAR.
- [ ] **Step 2 -- Accept Terms:** Given the estimate, when I click "Accept", then I see the terms and conditions in my preferred language (EN or AR).
- [ ] **Step 3 -- OTP:** Given terms acceptance, when the system sends an OTP to my +966 phone, then I enter the code within 5 minutes.
- [ ] **Step 4 -- Canvas Signature:** Given valid OTP, when I see the signature pad, then I can draw my signature on a touch-enabled canvas.
- [ ] **Step 5 -- Confirm:** Given my signature, when I click "Confirm", then a summary of estimate + signature is shown for final review.
- [ ] **Step 6 -- Download:** Given confirmation, when the approval is recorded, then I can download a PDF of the signed estimate and the job transitions to "Repair" state.

**Story Points:** 13
**Priority:** Must

---

## 9. CRM & Marketing Domain Stories

### CRM-002: Campaign Builder

**Story ID:** CRM-002
**Epic:** E-11 -- Customer Engagement & Campaigns
**As a** Branch Manager,
**I want to** create a marketing campaign targeting customers whose vehicles are due for service,
**So that** I can increase repeat business.

**Acceptance Criteria:**
- [ ] Given the campaign builder, when I select a customer segment (e.g., "last service > 6 months"), then the system shows the audience count.
- [ ] Given a campaign, when I choose SMS as the channel, then the message is sent to +966 numbers via the notification gateway.
- [ ] Given a bilingual campaign, when I compose the message, then I can write separate EN and AR versions and the system sends the version matching the customer's language preference.
- [ ] Given a sent campaign, when I view analytics, then I see delivery rate, open rate (email), and response actions.

**Story Points:** 8
**Priority:** Should

---

## 10. AI Platform Domain Stories

### AI-002: OBD 5-Desk Diagnostic Handoff

**Story ID:** AI-002
**Epic:** E-14 -- OBD Diagnostics & Predictive Maintenance
**As a** Service Advisor,
**I want** OBD diagnostic results to follow a structured 5-desk handoff chain,
**So that** each specialist reviews the findings in sequence and the final diagnosis is comprehensive.

**Acceptance Criteria:**
- [ ] Given OBD scan results, when uploaded, then Desk 1 (Advisor) reviews and forwards to Desk 2 (Technician).
- [ ] Given Desk 2 review, when the Technician adds annotations, then it forwards to Desk 3 (QC Inspector) for validation.
- [ ] Given Desk 3 validation, when the QC Inspector confirms, then it forwards to Desk 4 (Parts) for parts availability check.
- [ ] Given Desk 4 parts check, when the Storekeeper confirms availability, then it returns to Desk 5 (Advisor) for customer communication.
- [ ] Given any desk handoff, then the handoff is logged with timestamp and each desk's notes are preserved in the chain.

**Story Points:** 13
**Priority:** Could

---

## 11. Team & HR Domain Stories

### HR-003: Leave Management

**Story ID:** HR-003
**Epic:** E-12 -- Employee Management & Payroll Prep
**As an** HR Manager,
**I want to** manage leave requests with balance tracking,
**So that** I can ensure adequate workshop staffing.

**Acceptance Criteria:**
- [ ] Given an employee, when they submit a leave request, then their remaining balance is shown and the request routes to their Branch Manager.
- [ ] Given a leave request, when the Manager approves, then the balance is decremented and the employee is notified.
- [ ] Given a leave request that would leave the branch understaffed, when submitted, then a warning is shown to the approver.
- [ ] Given the leave calendar view, then approved leaves are displayed per branch with Arabic day/month names in AR mode.

**Story Points:** 8
**Priority:** Should

---

## 12. Call Center Domain Stories

### CC-002: Ticket Queue with SLA

**Story ID:** CC-002
**Epic:** E-13 -- Support Tickets & Call Management
**As a** Call Center Agent,
**I want** incoming tickets to be prioritized with SLA timers,
**So that** I can focus on the most urgent customer issues first.

**Acceptance Criteria:**
- [ ] Given a new ticket, when created, then it is assigned a priority (P1--P4) based on rules (e.g., vehicle stranded = P1).
- [ ] Given an SLA timer, when the response time approaches the threshold, then the agent and supervisor are notified.
- [ ] Given an SLA breach, when the timer expires, then the ticket is auto-escalated to the next level per the [Communication Plan](../pmp/communication-plan.md) escalation path.
- [ ] Given the ticket queue, when viewed in AR, then all labels, priorities, and timestamps display correctly in RTL.

**Story Points:** 8
**Priority:** Should

---

## 13. Reports & Analytics Domain Stories

### RPT-001: Owner Dashboard

**Story ID:** RPT-001
**Epic:** E-10 -- Dashboards, KPIs & Export
**As an** Owner/CEO,
**I want** a cross-branch dashboard showing revenue, job throughput, and technician utilization,
**So that** I can make data-driven decisions for my workshop chain.

**Acceptance Criteria:**
- [ ] Given my role (Owner, data scope "all"), when I open the dashboard, then I see aggregated KPIs across all branches.
- [ ] Given the dashboard, when I filter by branch, then KPIs update to show that branch's data only.
- [ ] Given the dashboard, when I switch to Arabic, then all charts, labels, and numbers render correctly in RTL with Arabic numerals.
- [ ] Given the export button, when I click it, then I can download the dashboard data as PDF or Excel.

**Story Points:** 8
**Priority:** Should

---

## 14. Story Lifecycle

| Stage           | Activity                                          | Owner     |
|-----------------|---------------------------------------------------|-----------|
| Draft           | PO writes story with acceptance criteria          | PO        |
| Refinement      | Team estimates, clarifies, splits if > 13 SP      | Team      |
| Ready           | Story meets Definition of Ready (see below)        | PO + QA   |
| In Sprint       | Assigned to developer in sprint planning           | Dev       |
| Done            | Meets [Definition of Done](definition-of-done.md) | QA + PO   |

### Definition of Ready

- [ ] Story follows the template format.
- [ ] Acceptance criteria are testable.
- [ ] Story is estimated (Fibonacci scale).
- [ ] Dependencies identified and resolved or planned.
- [ ] UI/UX mockups attached (if applicable).
- [ ] i18n keys identified for EN and AR.
- [ ] RTL behavior specified for layout-sensitive stories.

---

## 15. References

- [Product Backlog](product-backlog.md)
- [Epic Breakdown](epic-breakdown.md)
- [Definition of Done](definition-of-done.md)
- [Sprint Template](sprint-template.md)
- [Scope Statement](../pmp/scope-statement.md)
