# Estimate Approval Workflow

This document describes the two-phase estimate approval process in SALIS AUTO: first the internal approval by authorized staff, then the customer's electronic signature approval via SMS.

---

## Overview

An estimate goes through two approval gates before repair can begin:

```
Advisor creates estimate
    --> Internal approval (amount vs. ceiling check)
        --> Customer approval (SMS link, OTP, e-signature)
            --> Repair begins
```

---

## Phase 1: Internal Approval

### Estimate Creation

The Service Advisor creates the estimate on the **Workshop Estimate** screen (`/workshop-estimate`) after the Technician completes the inspection.

The estimate contains:

| Section | Fields |
|---|---|
| Parts | Description, quantity, unit price per part |
| Labour | Description, hours, hourly rate |
| Summary | Parts subtotal + Labour subtotal = Subtotal |
| Tax | VAT at 15% (ZATCA-mandated) |
| Total | Grand total in SAR |

### Ceiling Check

When the Advisor clicks **Approve** or **Submit**, the system checks the grand total against the Advisor's approval ceiling:

| Role's Ceiling | Estimate Total | Result |
|---|---|---|
| SAR 5,000 (Advisor) | SAR 1,546.75 | Advisor can approve directly |
| SAR 5,000 (Advisor) | SAR 12,000 | Routed to Approval Inbox |
| SAR 50,000 (Manager) | SAR 12,000 | Manager can approve |
| SAR 50,000 (Manager) | SAR 75,000 | Routed to Owner |

The check uses the `canApprove(role, amount)` function which verifies two things:

1. **Authority**: Does the role hold the `approve` (`a`) action on the `estimates` module?
2. **Ceiling**: Is the amount within the role's SAR limit?

Both must be true. A role with the approve action but a SAR 0 ceiling (like QC Inspector) can approve non-financial items (e.g., quality pass) but not estimates.

### Approval Ceilings Reference

| Role | Ceiling (SAR) | Can Approve Estimates? |
|---|---|---|
| Owner / CEO | Unlimited | Yes |
| Super Admin | Unlimited | No (not in tenant scope) |
| Branch Manager | 50,000 | Yes |
| Accountant | 25,000 | Yes |
| Procurement Agent | 20,000 | Yes |
| HR Manager | 15,000 | Yes |
| Storekeeper | 10,000 | Yes |
| Service Advisor | 5,000 | Yes |
| Technician | 0 | No |
| QC Inspector | 0 | No |
| Receptionist | 0 | No |
| Call Center Agent | 0 | No |

### Approval Inbox

Route: `/approval-inbox`

When an estimate exceeds the creator's ceiling, it appears in the **Approval Inbox** of roles with sufficient authority.

Each inbox item shows:

- **Reference number**: Estimate ID
- **Customer and vehicle**: Who the estimate is for
- **Amount (SAR)**: Total displayed in JetBrains Mono font
- **Status badge**: Pending, Approved, Rejected
- **Your authority**: Whether the amount is within your ceiling

#### Approving

1. Open the Approval Inbox.
2. Click an item to review the full estimate with line items.
3. Verify the parts and labour are reasonable for the work described.
4. Click **Approve**.
5. The estimate moves to customer approval (Phase 2).

#### Rejecting

1. Open the item in the Approval Inbox.
2. Click **Reject**.
3. A modal asks for the rejection reason (required).
4. Enter the reason and confirm.
5. The Service Advisor is notified and can revise and resubmit.

#### Escalating

If the estimate exceeds your ceiling:

- The **Approve** button is replaced with **Escalate** (disabled).
- A message explains: "Above your approval limit (SAR X). Requires higher authority."
- The item remains in the inbox for a role with sufficient ceiling.

### Segregation of Duties

The person who **created** the estimate cannot be the person who **approves** it. This is enforced server-side:

- The server reads the estimate's `submittedBy` from the audit trail.
- If the current user matches, the approve action is refused with a 403.
- The Approval Inbox displays a banner: "Segregation of duties: approval is checked server-side."

This means:
- An Advisor who created an estimate within their ceiling still cannot approve it.
- The estimate must go to another authorized person (another Advisor, the Manager, or the Owner).

---

## Phase 2: Customer Approval (E-Signature)

After internal approval, the customer must authorize the work. This is done through a secure SMS-based approval flow.

### Generating the Approval Link

1. The system generates a **signed short URL** unique to this estimate.
2. An SMS is sent to the customer's registered phone number containing the link.
3. The link opens in any mobile browser -- no app installation required.

### Customer's Experience

#### Step 1: Review Line Items

The customer opens the link and sees the **Customer Approval** screen (`/customer-approval`).

Each line item is displayed as a card showing:

| Field | Description |
|---|---|
| Item description | What part or service is included |
| Quantity | Number of units |
| Unit price (SAR) | Cost per unit, displayed in Money format |
| Urgency badge | Color-coded priority |

Urgency levels:

| Level | Color | Meaning |
|---|---|---|
| Critical | Orange | Safety-related, should not be deferred |
| Due now | Blue | Recommended for this visit |
| Advisory | Grey | Can be deferred to a future visit |

#### Step 2: Select or Defer Items

Each line item has a **checkbox**. The customer can:

- **Check** items they approve for this visit.
- **Uncheck** items they want to defer to later.
- Critical items are pre-checked and flagged with a warning if unchecked.

The **revised total** updates dynamically as items are selected or deselected.

#### Step 3: OTP Verification

1. The customer taps **Proceed to Verify**.
2. A 6-digit OTP is sent to their registered phone number.
3. The customer enters the OTP in the **CodeInput** field (six individual digit boxes).
4. The system verifies the code.

OTP states:

| State | What the Customer Sees |
|---|---|
| Idle | "Send verification code" button |
| Requesting | Loading spinner while code is being sent |
| Sent | "Code sent to +966 XXXX XXX" message |
| Verifying | Loading spinner while code is verified |
| Verified | Green checkmark, proceed to signature |
| Rejected | "Invalid code, please try again" |
| Unavailable | "SMS service not connected" (honest gap -- the system says so rather than pretending) |

#### Step 4: Canvas Signature

After OTP verification:

1. A **signature canvas** appears on screen.
2. The customer signs with their finger (on phone) or stylus (on tablet).
3. The signature is captured as a PNG image.
4. Tap **Approve** to submit.

#### Step 5: Confirmation

- The signature is stored against the estimate record.
- The estimate status changes to `customer_approved`.
- The job card transitions to the **Repair** stage.
- The workshop is notified to begin work.

### What If the Customer Does Not Respond?

If the customer does not open the link or complete the approval:

- The estimate remains in "Pending Customer Approval" status.
- The Service Advisor can see this status on the Job Detail screen.
- The Advisor may contact the customer directly by phone to discuss.
- A new SMS can be sent if the original link expired.

---

## Estimate Statuses

| Status | Meaning |
|---|---|
| Draft | Being prepared by the Advisor |
| Pending Approval | Submitted for internal approval |
| Internally Approved | Approved by authorized staff, awaiting customer |
| Pending Customer | SMS sent, waiting for customer response |
| Customer Approved | Customer signed, repair can begin |
| Rejected | Rejected by internal approver (reason provided) |
| Expired | Time limit passed without approval |
| Revised | Original rejected, new version submitted |

---

## Complete Flow Diagram

```
Advisor creates estimate
    |
    v
Amount <= Advisor ceiling (SAR 5,000)?
    |                    |
   YES                  NO
    |                    |
    v                    v
Advisor approves     Routes to Approval Inbox
(if not self-submit)     |
    |                    v
    |              Manager/Owner reviews
    |                    |
    |              Approve or Reject
    |                    |
    v                    v
Generate signed URL
    |
    v
SMS to customer phone
    |
    v
Customer opens link
    |
    v
Reviews and selects line items
    |
    v
Enters OTP code
    |
    v
Signs on canvas
    |
    v
Estimate = customer_approved
    |
    v
Job transitions to Repair
```

---

## Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| "Above your approval limit" | Estimate total exceeds your ceiling | Wait for a higher-authority approver |
| Cannot approve own estimate | Segregation of duties | Another authorized person must approve |
| Customer did not receive SMS | Phone number incorrect or SMS service down | Verify phone number; check SMS service status |
| OTP shows "unavailable" | SMS provider not configured | Contact system administrator |
| Customer cannot sign | Browser incompatibility | Try a different browser; ensure JavaScript is enabled |

---

## Related Guides

- [Job Lifecycle](job-lifecycle.md) -- where estimate approval fits in the overall flow
- [Invoice & Payment](invoice-payment.md) -- what happens after the work is complete
- [Workshop Staff Guide](../guides/workshop-staff-guide.md) -- Advisor and Technician workflows
- [Customer App Guide](../portals/customer-app-guide.md) -- the customer's perspective
- [Owner & Super Admin Guide](../guides/owner-superadmin-guide.md) -- final approval authority
