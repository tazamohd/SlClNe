# SALIS AUTO -- UAT Test Scripts

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-TST-001                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Purpose

This document provides User Acceptance Test (UAT) scripts organized by the 13 functional domains of SALIS AUTO. Each domain contains 3-5 test cases covering critical business paths, with preconditions, step-by-step procedures, expected results, and pass/fail criteria. These scripts are executed by business stakeholders prior to go-live to validate that the system meets operational requirements for Saudi automotive workshops.

**Related documents:**
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Regression Test Suite](regression-test-suite.md)

---

## 2. General Instructions

- All monetary values are stored in halalas internally and displayed as SAR with 2 decimal places.
- All tests must pass in both English (LTR) and Arabic (RTL) unless noted otherwise.
- Timestamps display in AST (UTC+3) regardless of the tester's local timezone.
- Each tester must log in with the role specified in the preconditions.
- Record actual results, screenshots, and any deviations in the Results column.

---

## 3. Domain 1 -- Workshop (Operations)

### UAT-WRK-001: Full Job Lifecycle (Check-In to Delivery)

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Receptionist, Service Advisor, Technician, QC Inspector |
| Preconditions | Customer "Mohammed Al-Rashid" and vehicle "ABC 1234" exist in the registry. Tester has accounts for all four roles. |

**Steps:**

1. Log in as Receptionist. Navigate to `/checkin`. Search for customer "Mohammed Al-Rashid".
2. Select vehicle "ABC 1234". Fill service description: "Oil change and brake inspection". Upload one photo. Submit check-in.
3. Verify job card appears at `/jobcards` with status "Checked In" and `WorkflowStepper` shows stage 1.
4. Log in as Service Advisor. Open the job card. Transition to "Inspection" stage.
5. Complete inspection checklist with 2 findings. Attach photos. Transition to "Estimate" stage.
6. Create estimate with 3 line items totalling SAR 1,500.00. Submit for customer approval.
7. Simulate customer approval (via Customer Portal or test endpoint).
8. Log in as Technician. Open job card. Transition to "Repair" stage. Mark all service items complete.
9. Log in as QC Inspector. Open job card. Transition to "QC" stage. Complete QC checklist (all pass). Approve.
10. Log in as Service Advisor. Transition to "Delivery". Complete delivery checklist. Confirm handover.

**Expected Results:**
- Job card progresses through all 6 stages: Check-In, Inspection, Estimate, Repair, QC, Delivery.
- `WorkflowStepper` reflects the current stage at each transition.
- Technician who performed the repair cannot perform the QC (SoD enforcement).
- Audit trail records every transition with timestamp, user, and role.
- Notifications are sent to the Advisor at each stage change.

**Pass Criteria:** All 6 stages complete without error. SoD enforced. Audit trail complete.

### UAT-WRK-002: Appointment Booking and Calendar View

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Call Center Agent, Service Advisor |
| Preconditions | At least one service bay configured for the branch. |

**Steps:**

1. Log in as Call Center Agent. Navigate to `/appointments`. Click "New Appointment".
2. Select customer, vehicle, service type "Full Service", preferred date (tomorrow), time slot 09:00.
3. Submit appointment. Verify it appears in the appointment list.
4. Log in as Service Advisor. Navigate to appointments. Verify the appointment appears on the correct date.
5. Verify calendar view loads within 3 seconds with all appointments for the week.

**Expected Results:**
- Appointment created with correct date/time in AST.
- Calendar view renders all appointments without layout issues.
- Appointment details match the submitted data.

**Pass Criteria:** Appointment visible to both roles. Date/time correct in AST.

### UAT-WRK-003: Estimate Approval by Customer

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Service Advisor, Customer |
| Preconditions | Active job card in "Estimate" stage with estimate totalling SAR 2,500.00. |

**Steps:**

1. Log in as Service Advisor. Open job card. Create estimate with labor and parts line items.
2. Send estimate to customer for approval.
3. Log in as Customer (Customer Portal). Navigate to service tracking.
4. Review estimate details. Verify line items, VAT 15% calculation, and total.
5. Approve estimate using 6-step e-signature flow.
6. Return to Service Advisor view. Verify estimate status is "Approved".

**Expected Results:**
- Customer sees bilingual estimate (EN/AR) with correct VAT calculation.
- E-signature flow completes in 6 steps.
- Estimate status updates to "Approved" in real-time.
- Advisor receives notification of approval.

**Pass Criteria:** Estimate approved. VAT correct. Status synchronized.

---

## 4. Domain 2 -- Registry (Customers & Vehicles)

### UAT-REG-001: Customer Registration with Vehicle

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Receptionist |
| Preconditions | Tester has Receptionist role. No existing customer with phone +966551234567. |

**Steps:**

1. Navigate to `/customers`. Click "New Customer".
2. Enter: Name "Fatima Al-Saud", Phone "+966551234567", Email "fatima@test.sa".
3. Save customer. Verify record appears in customer list.
4. Open customer detail. Click "Add Vehicle".
5. Enter: Plate "XYZ 5678" (Saudi format), Make "Toyota", Model "Camry", Year 2024, VIN "1HGCM82633A123456".
6. Save vehicle. Verify vehicle appears under customer's profile.

**Expected Results:**
- Customer created with ULID identifier.
- Phone number validated as Saudi format (+966).
- Vehicle linked to customer. Plate validated as Saudi format.
- Customer appears in search by name, phone, or plate number.

**Pass Criteria:** Customer and vehicle created, linked, and searchable.

### UAT-REG-002: Fleet Management

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Manager |
| Preconditions | Corporate customer with 5+ vehicles exists. |

**Steps:**

1. Navigate to `/fleet-management`. Locate the corporate customer's fleet.
2. Verify vehicle count matches expected number.
3. View fleet details: contract info, active status, vehicle list.
4. Filter vehicles by status. Verify filter works correctly.

**Expected Results:**
- Fleet displays correct vehicle count and contract information.
- Filters work across all vehicle statuses.

**Pass Criteria:** Fleet data accurate. Filters functional.

### UAT-REG-003: Customer Feedback Submission

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Customer |
| Preconditions | Customer has a completed job (status: Delivered). |

**Steps:**

1. Log in as Customer. Navigate to service history.
2. Select the completed job. Submit feedback with rating (4/5) and comment.
3. Verify feedback appears in the feedback list.

**Expected Results:**
- Feedback submitted and stored. Visible to management roles.

**Pass Criteria:** Feedback stored and visible.

---

## 5. Domain 3 -- Finance

### UAT-FIN-001: Invoice Generation and ZATCA Submission

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Accountant |
| Preconditions | Completed job card with approved estimate. ZATCA sandbox credentials configured. VAT number: 300000000000003. |

**Steps:**

1. Log in as Accountant. Navigate to `/invoices/create`.
2. Select the completed job. Verify line items auto-populate from estimate.
3. Verify VAT 15% is calculated correctly on each line item.
4. Verify total is displayed in SAR and stored internally as halalas.
5. Submit invoice. Verify invoice status is "Created".
6. Trigger ZATCA submission. Verify XML is generated (UBL 2.1 format).
7. Verify QR code is generated with TLV encoding (seller name, VAT number, timestamp, total, VAT amount).
8. Verify hash chain links to previous invoice hash.
9. Verify ZATCA sandbox returns clearance response with no validation errors.
10. Verify invoice status updates to "Cleared".

**Expected Results:**
- Invoice created with correct halalas amounts.
- ZATCA XML validates against UBL 2.1 XSD.
- QR code decodes to correct TLV data.
- Hash chain is contiguous (no gaps).
- Sandbox clearance succeeds.

**Pass Criteria:** Invoice cleared by ZATCA sandbox. QR valid. Hash chain intact.

### UAT-FIN-002: Credit Note with ZATCA Reference

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Accountant |
| Preconditions | A cleared invoice exists. |

**Steps:**

1. Open the cleared invoice. Click "Issue Credit Note".
2. Select reason and partial amount (SAR 500.00).
3. Verify credit note XML references the original invoice ID.
4. Submit to ZATCA sandbox. Verify clearance.

**Expected Results:**
- Credit note correctly references original invoice.
- ZATCA clearance succeeds for the credit note.

**Pass Criteria:** Credit note cleared. Original reference correct.

### UAT-FIN-003: Payment Recording

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Accountant |
| Preconditions | Unpaid invoice exists (SAR 3,000.00). |

**Steps:**

1. Navigate to `/payments`. Click "Record Payment".
2. Select invoice. Enter payment amount SAR 3,000.00. Select method: "Bank Transfer".
3. Submit. Verify invoice status changes to "Paid".
4. Verify payment appears in payment list with correct amount and method.

**Expected Results:**
- Payment recorded. Invoice status updated. Balances reconcile.

**Pass Criteria:** Payment linked to invoice. Status updated.

---

## 6. Domain 4 -- Accounting

### UAT-ACC-001: Chart of Accounts Navigation

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Accountant |
| Preconditions | Standard chart of accounts is seeded. |

**Steps:**

1. Navigate to `/accounting/coa`. Verify tree structure renders.
2. Expand/collapse account groups. Verify hierarchy is correct.
3. Search for account by code or name. Verify search results.

**Expected Results:**
- Tree structure renders with correct parent-child relationships.
- Search returns matching accounts.

**Pass Criteria:** CoA navigable. Search functional.

### UAT-ACC-002: Journal Entry Creation

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Accountant |
| Preconditions | Chart of accounts configured. |

**Steps:**

1. Navigate to `/accounting/journal-entries`. Click "New Entry".
2. Add debit line: Account "Cash", Amount SAR 5,000.00.
3. Add credit line: Account "Revenue", Amount SAR 5,000.00.
4. Verify debits equal credits before submission.
5. Submit. Verify entry appears in journal list with status "Posted".

**Expected Results:**
- Entry validates debit/credit balance.
- Imbalanced entries are rejected with clear error message.

**Pass Criteria:** Balanced entry posted. Imbalanced entry rejected.

### UAT-ACC-003: Expense Tracking

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Accountant, Manager |
| Preconditions | Expense categories configured. |

**Steps:**

1. Log in as Accountant. Navigate to `/accounting/expenses`. Create expense: Category "Utilities", Amount SAR 800.00.
2. Submit expense. Verify it appears in the expense list.
3. Log in as Manager. Verify the expense is visible within branch scope.

**Expected Results:**
- Expense created and visible to authorized roles within scope.

**Pass Criteria:** Expense recorded. Scope enforced.

---

## 7. Domain 5 -- CRM & Marketing

### UAT-CRM-001: Lead Pipeline Management

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Service Advisor |
| Preconditions | CRM module access granted. |

**Steps:**

1. Navigate to `/crm/leads`. Click "New Lead".
2. Enter: Name "Ahmed Corp", Source "Walk-in", Value SAR 10,000.00.
3. Save lead. Verify it appears in pipeline at "New" stage.
4. Move lead through stages: New, Qualified, Proposal, Won.
5. Verify stage history is recorded.

**Expected Results:**
- Lead progresses through pipeline stages.
- Stage transitions are audited.

**Pass Criteria:** Lead lifecycle complete. Audit trail intact.

### UAT-CRM-002: Campaign Creation

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Manager |
| Preconditions | Customer segments exist. |

**Steps:**

1. Navigate to `/crm/campaigns`. Click "New Campaign".
2. Enter: Name "Ramadan Service Special", Type "SMS", Target Segment "VIP Customers".
3. Save campaign. Verify it appears in the campaign list.

**Expected Results:**
- Campaign created with correct segment assignment.

**Pass Criteria:** Campaign saved and listed.

### UAT-CRM-003: Task Assignment and Tracking

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Service Advisor |
| Preconditions | At least one lead exists. |

**Steps:**

1. Navigate to `/crm/tasks`. Create task: "Follow up with Ahmed Corp", Due Date tomorrow, Priority High.
2. Assign to self. Save. Verify task appears in task list.
3. Mark task as complete. Verify status updates.

**Expected Results:**
- Task created, assigned, and completable.

**Pass Criteria:** Task lifecycle functional.

---

## 8. Domain 6 -- Administration

### UAT-ADM-001: User Creation with Role Assignment

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Super Admin |
| Preconditions | At least one branch exists. |

**Steps:**

1. Navigate to `/admin/users`. Click "New User".
2. Enter: Name "Test Technician", Email "tech@test.sa", Role "Technician", Branch "Main Branch".
3. Save user. Verify user appears in user list.
4. Log in as the new Technician user. Verify sidebar shows only permitted modules.
5. Attempt to access `/invoices` directly. Verify access is denied (403).

**Expected Results:**
- User created with correct role and branch assignment.
- Navigation hides unpermitted modules (triple-layer RBAC: navigation layer).
- Direct URL access to unpermitted routes returns 403 (API layer).

**Pass Criteria:** User created. RBAC enforced at all three layers.

### UAT-ADM-002: Audit Log Review

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Super Admin |
| Preconditions | Multiple users have performed actions in the system. |

**Steps:**

1. Navigate to `/admin/audit`. Verify audit entries are listed.
2. Filter by user, action type, and date range.
3. Verify entries include: timestamp, user, role, action, entity, IP address.
4. Verify sensitive fields (passwords, tokens) are scrubbed from audit data.

**Expected Results:**
- Audit trail is comprehensive and filterable.
- No sensitive data appears in audit entries.

**Pass Criteria:** Audit log complete. Credentials scrubbed.

### UAT-ADM-003: Branch Configuration

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Owner/CEO |
| Preconditions | Platform has at least one organization. |

**Steps:**

1. Navigate to `/admin/branches`. Click "New Branch".
2. Enter: Name "Jeddah Branch", City "Jeddah", service bays: 5.
3. Save. Verify branch appears in branch list.
4. Assign a Manager to the new branch. Verify Manager can only see Jeddah Branch data.

**Expected Results:**
- Branch created. Data scope enforced per branch assignment.

**Pass Criteria:** Branch created. Scope isolation confirmed.

---

## 9. Domain 7 -- Authentication

### UAT-AUTH-001: Login and Logout Flow

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Any |
| Preconditions | Valid user account exists. |

**Steps:**

1. Navigate to `/login`. Enter valid email and password. Submit.
2. Verify redirect to role-appropriate dashboard.
3. Verify JWT access token is issued (15-minute TTL).
4. Navigate the application for 16 minutes without interaction.
5. Perform an action. Verify token refresh occurs silently (refresh token rotation).
6. Click logout. Verify redirect to `/login`. Verify tokens are invalidated.
7. Attempt to use the old refresh token. Verify it is rejected.

**Expected Results:**
- Login succeeds. Dashboard matches role.
- Token refresh is seamless. Old tokens are invalidated.
- Logout clears all session state.

**Pass Criteria:** Login, refresh, and logout all function correctly.

### UAT-AUTH-002: Account Lockout After Failed Attempts

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Any |
| Preconditions | Valid user account exists. |

**Steps:**

1. Navigate to `/login`. Enter valid email with wrong password. Submit 8 times.
2. On the 9th attempt with the correct password, verify the account is locked.
3. Wait 5 minutes. Retry login with correct password. Verify success.

**Expected Results:**
- Account locks after 8 failed attempts.
- Lockout lasts 300 seconds.
- Successful login after lockout expires.

**Pass Criteria:** Lockout enforced and time-bound.

### UAT-AUTH-003: OTP Verification

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Any |
| Preconditions | User account with MFA enabled. |

**Steps:**

1. Log in with email/password. Verify redirect to `/otp`.
2. Enter valid 6-digit OTP. Verify login completes.
3. Attempt with invalid OTP 5 times. Verify challenge is invalidated.
4. Request new OTP. Verify 60-second resend cooldown is enforced.

**Expected Results:**
- Valid OTP grants access. Invalid OTP is rejected.
- Max 5 attempts per challenge. 60-second cooldown between resends.

**Pass Criteria:** OTP flow secure and functional.

---

## 10. Domain 8 -- AI Platform

### UAT-AI-001: AI Assistant Chat

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Service Advisor |
| Preconditions | AI module access granted. AI service configured. |

**Steps:**

1. Navigate to `/aiassistant`. Verify chat interface loads with suggested prompts.
2. Enter a question about common brake pad issues. Submit.
3. Verify response is generated and displayed in message bubbles.

**Expected Results:**
- Chat interface is responsive. AI generates a relevant response.

**Pass Criteria:** AI responds to queries.

### UAT-AI-002: Knowledge Base Search

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Technician |
| Preconditions | Knowledge base has entries for at least one vehicle make. |

**Steps:**

1. Navigate to `/knowledge-base`. Search for "Toyota oil change procedure".
2. Verify results appear with categories and step counts.
3. Open a procedure. Verify steps are displayed correctly.

**Expected Results:**
- Search returns relevant procedures. Steps are readable.

**Pass Criteria:** Knowledge base searchable and readable.

---

## 11. Domain 9 -- Parts & Inventory Network

### UAT-INV-001: Purchase Order Approval with Separation of Duties

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Storekeeper, Procurement Manager, Branch Manager |
| Preconditions | Parts inventory exists. Approval ceilings configured (SAR 5K/10K/20K/50K). |

**Steps:**

1. Log in as Storekeeper. Navigate to `/inventory`. Select a part below reorder point.
2. Create Purchase Order for SAR 12,000.00 (above SAR 10K threshold). Submit.
3. Verify PO routes to Procurement Manager for approval (ceiling check).
4. Attempt to approve the PO as the same user who created it. Verify SoD rejection.
5. Log in as Procurement Manager (different user). Approve the PO.
6. Create a PO for SAR 55,000.00. Verify it escalates to Branch Manager.
7. Log in as Branch Manager. Approve the PO.

**Expected Results:**
- PO at SAR 12K routes to Procurement Manager (above SAR 10K ceiling).
- SoD prevents the PO creator from approving their own PO.
- PO at SAR 55K escalates to Branch Manager (above SAR 50K ceiling).
- Approval ceilings are enforced with "escalate" response (not "denied").

**Pass Criteria:** Approval chain enforced. SoD enforced. Escalation correct.

### UAT-INV-002: Parts Requisition and Receiving

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Storekeeper |
| Preconditions | Approved PO exists. Supplier linked. |

**Steps:**

1. Navigate to inventory. View approved PO.
2. Receive parts: enter received quantities, verify against ordered quantities.
3. Verify inventory levels update after receiving.

**Expected Results:**
- Received quantities recorded. Inventory updated.

**Pass Criteria:** Stock levels accurate after receiving.

### UAT-INV-003: Stock Adjustment with SoD

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Storekeeper |
| Preconditions | Parts with recorded stock levels exist. |

**Steps:**

1. Issue stock for a job card.
2. Attempt to adjust stock count for the same part. Verify SoD check.

**Expected Results:**
- User who issued stock cannot adjust the count (SoD: Issue Stock / Adjust Stock Count).

**Pass Criteria:** SoD enforced for stock operations.

---

## 12. Domain 10 -- Call Center

### UAT-CC-001: Call Queue Management

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Call Center Agent |
| Preconditions | Call center module configured. |

**Steps:**

1. Navigate to `/callcenter`. Verify active call queue displays.
2. Take an incoming call. Verify call assignment to agent.
3. Complete call. Log disposition. Verify entry appears in call logs at `/callcenter/logs`.

**Expected Results:**
- Queue displays correctly. Call logging works.

**Pass Criteria:** Calls tracked with correct metadata.

---

## 13. Domain 11 -- Reports & Analytics

### UAT-RPT-001: Report Generation with Data Scope

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Owner, Manager |
| Preconditions | Multiple branches with transaction data exist. |

**Steps:**

1. Log in as Owner. Navigate to reports. Generate "Workshop Summary" report.
2. Verify report includes data from all branches (scope: "all").
3. Log in as Manager. Generate the same report.
4. Verify report includes data from the manager's assigned branch only (scope: "branch").
5. Export report as PDF. Verify export completes within 5 seconds.

**Expected Results:**
- Owner sees all-branch data. Manager sees own-branch data only.
- PDF export renders correctly with bilingual headers.

**Pass Criteria:** Data scope enforced per role. Export functional.

### UAT-RPT-002: CSV Export Performance

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Owner |
| Preconditions | At least 1,000 records exist in the target domain. |

**Steps:**

1. Navigate to a data list (e.g., invoices). Click "Export CSV".
2. Verify CSV downloads within 2 seconds for under 1,000 rows.
3. Verify formula injection protection: cells starting with `=`, `+`, `-`, `@` are prefixed with tab.

**Expected Results:**
- CSV exports within target time. Injection protection applied.

**Pass Criteria:** Export fast and safe.

---

## 14. Domain 12 -- Team & HR

### UAT-HR-001: Leave Request and Approval

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Technician (Employee), Manager |
| Preconditions | Leave balances configured for the employee. |

**Steps:**

1. Log in as Technician. Navigate to Leave Requests. Submit a leave request for 3 days.
2. Verify request status is "Pending".
3. Log in as Manager. Verify the leave request appears for approval.
4. Approve the request. Verify status changes to "Approved".
5. Return to Technician view. Verify leave balance is reduced by 3 days.

**Expected Results:**
- Leave request created. Manager notified. Balance updated on approval.

**Pass Criteria:** Leave lifecycle complete. Balance accurate.

### UAT-HR-002: Technician Performance View

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Manager |
| Preconditions | Technicians with completed jobs exist. |

**Steps:**

1. Navigate to `/technicians`. View technician list with specialty, jobs, rating.
2. Open a technician profile. Verify performance data is displayed.

**Expected Results:**
- Technician data displays correctly. Ratings reflect completed work.

**Pass Criteria:** Performance data accurate.

---

## 15. Domain 13 -- Portals

### UAT-PTL-001: Customer App Booking Flow

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Customer |
| Preconditions | Customer account exists with at least one vehicle. Customer App shell renders at 430px. |

**Steps:**

1. Open Customer App (430px mobile frame). Navigate to Home.
2. Verify hero card and quick actions display correctly.
3. Navigate to Garage. Verify vehicle list shows the customer's vehicles.
4. Navigate to Appointments. Click "Book Appointment".
5. Select vehicle, service type, preferred date/time. Submit.
6. Verify appointment confirmation. Navigate to Service Tracking.
7. Verify live service status updates are displayed.

**Expected Results:**
- Customer App renders correctly at 430px.
- Booking flow completes. Appointment confirmed.
- Service tracking shows real-time status.

**Pass Criteria:** End-to-end booking and tracking functional in mobile frame.

### UAT-PTL-002: Supplier Portal Access

| Field | Detail |
|-------|--------|
| Priority | P3 -- Medium |
| Roles | Supplier |
| Preconditions | Supplier account exists with linked purchase orders. |

**Steps:**

1. Log in as Supplier. Verify only supplier-scoped data is visible.
2. View linked purchase orders. Verify no access to other domains.
3. Attempt to access `/admin/users`. Verify 403 rejection.

**Expected Results:**
- Supplier sees only their own data. RBAC prevents cross-domain access.

**Pass Criteria:** External role scoping enforced.

### UAT-PTL-003: Multi-Tenant Isolation

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Super Admin (Organization A), Super Admin (Organization B) |
| Preconditions | Two organizations configured with separate data. |

**Steps:**

1. Log in as Super Admin of Org A. Note the list of customers, vehicles, invoices.
2. Log out. Log in as Super Admin of Org B.
3. Verify Org B sees entirely different data. No Org A records visible.
4. Attempt API call with Org A entity IDs using Org B's token. Verify 403 or empty response.

**Expected Results:**
- Complete data isolation between organizations.
- API enforces org_id scoping on every query.

**Pass Criteria:** Zero data leakage between tenants.

---

## 16. Cross-Domain Tests

### UAT-XD-001: Bilingual Toggle Mid-Session

| Field | Detail |
|-------|--------|
| Priority | P2 -- High |
| Roles | Any |
| Preconditions | User is logged in and has navigated to a data screen. |

**Steps:**

1. Open any data screen (e.g., Job Cards). Note displayed data.
2. Toggle language from English to Arabic.
3. Verify: page direction switches to RTL, labels translate, data values persist, layout is correct.
4. Toggle back to English. Verify state is preserved.

**Expected Results:**
- Language switches without page reload. Data and state persist.

**Pass Criteria:** Bilingual toggle preserves state.

### UAT-XD-002: Field-Level Redaction

| Field | Detail |
|-------|--------|
| Priority | P1 -- Critical |
| Roles | Technician, Service Advisor, Accountant |
| Preconditions | Parts with cost data and employee records with salary data exist. |

**Steps:**

1. Log in as Technician. View a part detail. Verify `costHalalas` is not visible (redacted).
2. Log in as Accountant. View the same part. Verify cost is visible.
3. Log in as Service Advisor. View an employee record. Verify salary fields are redacted.

**Expected Results:**
- Redaction rules enforced per the 7-rule matrix (see [Security Requirements](../requirements/non-functional/security.md)).

**Pass Criteria:** Sensitive fields hidden from unauthorized roles.

---

## 17. UAT Sign-Off Template

### Test Execution Summary

| Metric | Value |
|--------|-------|
| Total Test Cases | |
| Passed | |
| Failed | |
| Blocked | |
| Pass Rate | |
| Test Period | YYYY-MM-DD to YYYY-MM-DD |

### Defect Summary

| Priority | Open | Resolved | Deferred |
|----------|------|----------|----------|
| P1 | | | |
| P2 | | | |
| P3 | | | |
| P4 | | | |

### Sign-Off

| Role | Name | Signature | Date | Decision |
|------|------|-----------|------|----------|
| Product Owner | | | | Accept / Reject / Conditional |
| QA Lead | | | | Accept / Reject / Conditional |
| Business Stakeholder | | | | Accept / Reject / Conditional |
| Project Manager | | | | Accept / Reject / Conditional |
| IT Operations | | | | Accept / Reject / Conditional |

**Conditions for acceptance (if conditional):**

1. _[List any conditions that must be met before go-live]_

**Notes:**

_[Any additional observations, risks, or recommendations from UAT]_

---

## 18. References

- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Security Requirements](../requirements/non-functional/security.md)
- [Performance Requirements](../requirements/non-functional/performance.md)
- [Domain Reference](../domains.md)
- [Load Testing Plan](load-testing-plan.md)
- [Security Testing Plan](security-testing-plan.md)
- [Regression Test Suite](regression-test-suite.md)
