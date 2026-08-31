# Job Lifecycle Workflow

This document describes the complete lifecycle of a job card in SALIS AUTO, from the moment a vehicle arrives at the workshop to final invoicing and closure. Each stage is a gate that must be passed in order -- no stage can be skipped.

---

## Lifecycle Overview

Every job follows this sequence of eight stages:

```
Check-In --> Inspection --> Estimate --> Repair --> QC --> Delivery --> Invoiced --> Closed
```

The first six stages are displayed on the **WorkflowStepper** -- a horizontal progress rail visible on every stage screen. "Invoiced" and "Closed" are post-delivery stages that share the final position on the rail.

| Stage | Who Acts | Screen | What Happens |
|---|---|---|---|
| Check-In | Receptionist / Service Advisor | `/workshop-checkin` | Vehicle received, initial details recorded |
| Inspection | Technician | `/workshop-inspection` | Multi-point vehicle inspection |
| Estimate | Service Advisor | `/workshop-estimate` | Cost estimate prepared for approval |
| Repair | Technician | Technician Portal | Approved work is performed |
| QC | QC Inspector | `/workshop-qc` | Quality verification before handover |
| Delivery | Service Advisor | `/workshop-delivery` | Vehicle returned to customer |
| Invoiced | Accountant | `/invoice-create` | Invoice generated from the job |
| Closed | System | Automatic | Job card marked as complete |

---

## Stage 1: Check-In

**Who**: Receptionist or Service Advisor

**Screen**: Workshop Check-In (`/workshop-checkin`)

### Steps

1. The Receptionist creates a job card from **Workshop > Job Cards > Create**:
   - **Customer lookup**: Search by name or phone. If the customer is new, create their record.
   - **Vehicle selection**: Pick from the customer's registered vehicles, or add a new one.
   - **Service type**: Select Maintenance, Repair, Inspection, or Diagnostics.
   - **Complaint / notes**: Record what the customer reports.
   - **Priority**: Normal, High, or Urgent.

2. The Service Advisor opens the Check-In screen for the new job card.

3. Fill in arrival details:
   - **Odometer reading**: Current mileage as shown on the dashboard.
   - **Fuel level**: 1/4, 1/2, 3/4, or Full.
   - **Customer belongings**: Check items found in the vehicle (Sunglasses, Phone charger, Documents, Spare key, GPS device).
   - **Reported issues**: Free-text description of symptoms or concerns.

4. Optionally upload **photos** of the vehicle's exterior condition for documentation.

5. Click **Complete Check-In**.

### What Happens Next

The system sends a `POST /jobs/:id/transition` request to move the job from `checkin` to `inspection`. The odometer reading, fuel level, belongings, and issue notes are recorded as the transition reason in the audit trail.

---

## Stage 2: Inspection

**Who**: Technician

**Screen**: Workshop Inspection (`/workshop-inspection`)

### Steps

1. The assigned Technician opens the Inspection screen. The WorkflowStepper shows "Inspection" as the current stage.

2. Complete the **multi-point inspection checklist** across six vehicle systems:

| System | Items Checked |
|---|---|
| Engine & Transmission | Oil Level, Coolant, Transmission Fluid, Engine Noise |
| Brakes & Suspension | Brake Pads, Brake Discs, Brake Fluid, Shock Absorbers |
| Tires & Wheels | Tire Tread, Tire Pressure, Wheel Alignment |
| Electrical & Lighting | Battery, Headlights, Tail Lights, Indicators |
| Fluids & Filters | Coolant, Power Steering, Air Filter |
| Body & Interior | Windshield, Paint Condition, Interior Trim, Seats |

3. For each item, select a verdict:
   - **Pass** (green checkmark): Item is acceptable.
   - **Fail** (red X): Item needs repair or replacement.
   - **N/A** (grey dash): Not applicable for this service.

4. A progress counter at the top tracks completion (e.g., "18/22").

5. Add photos and notes for any failed items to document the findings.

6. Click **Complete Inspection** when all items have a verdict.

> **Rule**: An inspection cannot be submitted half-complete. Every item must be evaluated because the estimate is built directly from the inspection findings.

### What Happens Next

The job transitions to `estimate`. The inspection results (failures, photos, notes) are available to the Service Advisor for building the cost estimate.

---

## Stage 3: Estimate

**Who**: Service Advisor

**Screen**: Workshop Estimate (`/workshop-estimate`)

### Steps

1. Open the Estimate screen. The WorkflowStepper shows "Estimate" as the current stage.

2. Build the estimate from inspection findings:

   **Parts table**:
   | Column | Description |
   |---|---|
   | Description | Part name and specification |
   | Quantity | Number of units needed |
   | Unit Price (SAR) | Cost per unit |
   | Line Total | Qty x Unit Price (calculated) |

   **Labour table**:
   | Column | Description |
   |---|---|
   | Description | Service description |
   | Hours | Estimated labour hours |
   | Rate (SAR/hr) | Hourly rate for this service type |
   | Line Total | Hours x Rate (calculated) |

3. The **Summary Panel** calculates totals automatically:
   - Parts subtotal
   - Labour subtotal
   - Combined subtotal
   - VAT at 15% (per ZATCA)
   - Grand total in SAR

4. The system checks the grand total against your role's approval ceiling:

   | Scenario | What Happens |
   |---|---|
   | Total within your ceiling (SAR 5,000 for Advisor) | **Approve & Proceed** button is active |
   | Total exceeds your ceiling | **Submit for Approval** sends it to the Approval Inbox |
   | You created the estimate | You cannot approve your own -- segregation of duties |

5. Click the appropriate button.

### Internal Approval

If the estimate goes to the Approval Inbox, the approval chain is:

- **Service Advisor**: Up to SAR 5,000
- **Storekeeper**: Up to SAR 10,000
- **HR Manager**: Up to SAR 15,000
- **Procurement Agent**: Up to SAR 20,000
- **Accountant**: Up to SAR 25,000
- **Branch Manager**: Up to SAR 50,000
- **Owner / CEO**: Unlimited

See [Estimate Approval Workflow](estimate-approval.md) for the full approval process including customer e-signature.

### What Happens Next

Once approved (internally and by the customer), the job transitions to `repair`.

---

## Stage 4: Repair

**Who**: Technician

**Screen**: Technician Portal (`/technician-portal`)

### Steps

1. The assigned Technician sees the job in their portal with the stage set to "Repair".

2. Perform the approved work:
   - Follow repair guides from the Knowledge Base if needed.
   - Request parts from the Storekeeper through the Parts Request screen.
   - Document the work with photos and notes.

3. Log time spent on the repair.

4. When all work is complete, click **Complete Repair** to transition the job to QC.

### Parts Requests

During repair, the Technician may need parts:

1. Submit a parts request specifying the job card, part, and quantity.
2. The Storekeeper receives a notification and issues the part from inventory.
3. The part consumption is recorded against both the inventory and the job card.

### What Happens Next

The job transitions to `qc`. The Technician who performed the repair is recorded in the audit trail -- this is critical for the segregation of duties check in the next stage.

---

## Stage 5: Quality Check (QC)

**Who**: QC Inspector

**Screen**: Workshop QC (`/workshop-qc`)

### Steps

1. The QC Inspector opens the QC screen. The WorkflowStepper shows "Quality Check" as the current stage.

2. Review the completed work against the estimate.

3. Complete the **QC Checklist**:

| Check | What to Verify |
|---|---|
| Repair Verified | All estimate items completed correctly |
| Fluids Topped | All fluid levels within specification |
| Test Drive | Vehicle operates correctly (if applicable) |
| Cleaned | Vehicle interior and exterior cleaned |
| Quality Check | Overall workmanship meets standards |
| Documents Ready | Service documentation complete |

4. The counter shows progress (e.g., "5/6 checks recorded").

5. Decision:
   - **Pass QC**: All checks complete. Click **Pass QC** to advance to Delivery.
   - **Return to Repair**: Work does not meet standards. Click **Return to Repair** with notes explaining what needs correction. The job goes back to Repair for the Technician to address.

### Segregation of Duties

The system enforces that **the person who performed the repair cannot pass its QC**. This is checked server-side using the job's audit trail:

- The server reads who transitioned the job through the Repair stage.
- If the same person attempts to pass QC, a 403 error is returned.
- The error message is displayed on screen explaining the control.

This applies to the specific person, not just the role. A Branch Manager who performed the repair also cannot pass its QC.

### What Happens Next

The job transitions to `delivery`. The vehicle is ready for customer handover.

---

## Stage 6: Delivery

**Who**: Service Advisor

**Screen**: Workshop Delivery (`/workshop-delivery`)

### Steps

1. Open the Delivery screen. The WorkflowStepper shows "Delivery" as the current stage.

2. Review the job summary:
   - Parts cost total
   - Labour cost total
   - VAT
   - Grand total (SAR)
   - Odometer readings (in and out, showing workshop mileage)

3. Complete the **Delivery Checklist**:

| Check | Icon | Description |
|---|---|---|
| Customer Notified | Bell | Customer has been contacted about pickup |
| Keys Returned | Key | Vehicle keys are with the customer |
| Documents Ready | FileText | Service report and paperwork prepared |
| Invoice Attached | Receipt | Invoice is generated and attached |
| Cleaned | Sparkles | Vehicle has been cleaned |
| Quality Check | Eye | QC has been verified as passed |

4. All six items must be checked before the **Complete Delivery** button activates.

5. Click **Complete Delivery**.

6. A confirmation toast appears: "Delivered -- Job card closed."

### What Happens Next

The job transitions to `invoiced` (or directly to `closed` depending on configuration). An invoice is generated automatically from the job card.

---

## Stage 7: Invoiced

**Who**: Accountant

**Screen**: Invoice Create (`/invoice-create`) / Invoice Detail (`/invoice-detail`)

The invoice is created from the job card's line items. See [Invoice & Payment Workflow](invoice-payment.md) for the complete invoicing process.

### What Happens Next

When the invoice is fully paid, the job moves to `closed`.

---

## Stage 8: Closed

**Who**: System (automatic)

A closed job card is complete. It remains in the system as a permanent record visible in:

- The customer's service history
- The vehicle's history
- Workshop reports and analytics

Closed jobs cannot be reopened or modified.

---

## Job Detail View

At any point during the lifecycle, authorized staff can view the **Job Detail** screen which shows:

- **Customer panel**: Name, contact (redacted for some roles), vehicle info
- **WorkflowStepper**: Current stage position
- **Service timeline**: Chronological history of all stage transitions, notes, and actions
- **Estimate summary**: Parts and labour line items with totals
- **Assigned personnel**: Technician, advisor, QC inspector
- **Attached documents**: Photos, inspection reports, diagnostic reports

---

## Rules and Constraints

| Rule | Enforcement |
|---|---|
| Stages cannot be skipped | Server-side, returns 422 on invalid transition |
| Inspection must be complete | All items must have a verdict before submission |
| QC must pass before delivery | Server-side enforcement |
| Repair technician cannot pass QC | Segregation of duties, server-side |
| Estimate above ceiling must escalate | Approval Inbox routing |
| Customer contact hidden from technicians | Field-level redaction |

---

## Related Guides

- [Estimate Approval](estimate-approval.md) -- internal and customer approval details
- [Diagnostic Report](diagnostic-report.md) -- OBD diagnostic chain
- [Invoice & Payment](invoice-payment.md) -- invoicing and payment recording
- [Workshop Staff Guide](../guides/workshop-staff-guide.md) -- role-specific workflows
- [Branch Manager Guide](../guides/manager-guide.md) -- oversight and approval authority
