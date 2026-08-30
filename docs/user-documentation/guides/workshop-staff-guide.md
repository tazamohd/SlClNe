# Workshop Staff Guide

This guide covers the daily workflows for three workshop floor roles: **Service Advisor**, **Technician**, and **QC Inspector**. Each section explains how to use the screens and tools specific to your responsibilities.

> **Prerequisites**: Complete the [Getting Started](getting-started.md) guide first.

---

## Role Comparison

| Detail | Service Advisor | Technician | QC Inspector |
|---|---|---|---|
| Scope | Branch | Own (assigned jobs) | Branch |
| Approval ceiling | SAR 5,000 | SAR 0 | SAR 0 |
| Landing page | Dashboard | Technician Portal | Dashboard |
| Primary screens | Check-In, Estimate, Job Cards, Customers | Technician Portal, Repair, Diagnostics | QC screen, Inspection results |

---

## Service Advisor Workflow

As a Service Advisor, you are the primary contact between the customer and the workshop. You receive vehicles, create estimates, communicate approvals, and coordinate delivery.

### Customer Check-In

Navigate to **Workshop > Check-In** (`/workshop-checkin`).

1. Open the Check-In screen. The WorkflowStepper at the top shows "Check-In" as the current stage.
2. The customer and vehicle panels display existing information if the job card was pre-created.
3. Fill in the check-in details:
   - **Odometer Reading**: Current mileage on arrival.
   - **Fuel Level**: Select from 1/4, 1/2, 3/4, or Full.
   - **Customer Belongings**: Check items left in the vehicle (Sunglasses, Phone charger, Documents, Spare key, GPS device).
   - **Reported Issues**: Free-text description of the customer's complaint.
4. Click **Complete Check-In** to advance the job to the Inspection stage.

> **Tip**: The odometer and fuel level bracket the visit. Record them accurately -- customers may ask what mileage the workshop put on their vehicle.

### Service Selection

When creating a job card or during check-in, select the service type:

- **Maintenance**: Scheduled services (oil change, filter replacement, etc.)
- **Repair**: Specific fault repair
- **Inspection**: Multi-point vehicle inspection
- **Diagnostics**: OBD scan and diagnostic analysis

### Creating an Estimate

Navigate to **Workshop > Estimate** (`/workshop-estimate`).

After the technician completes inspection, you build the estimate:

1. The WorkflowStepper shows "Estimate" as the current stage.
2. **Parts Table**: Lists recommended parts with description, quantity, and unit price. Add or remove lines as needed.
3. **Labour Table**: Lists service labour with description, hours, and hourly rate.
4. The **Summary Panel** calculates automatically:
   - Parts subtotal
   - Labour subtotal
   - Combined subtotal
   - VAT at 15%
   - Grand total in SAR

5. If the total is within your SAR 5,000 ceiling, click **Approve & Proceed** to move the job to Repair.
6. If the total exceeds your ceiling, click **Submit for Approval**. The estimate routes to the Branch Manager's Approval Inbox.

> **Note**: You cannot approve estimates you created yourself -- segregation of duties is enforced. Another authorized person must approve it.

### Customer Communication

After internal approval, the customer must approve the estimate:

1. The system generates a signed short URL.
2. An SMS is sent to the customer's phone with the approval link.
3. The customer reviews line items, enters an OTP code, and signs with their finger on the canvas.
4. Once signed, the estimate status changes to "Customer Approved" and the job proceeds to Repair.

See [Estimate Approval Workflow](../workflows/estimate-approval.md) for full details.

### Delivery Coordination

Navigate to **Workshop > Delivery** (`/workshop-delivery`).

After QC passes, you coordinate the vehicle handover:

1. Complete the **Delivery Checklist**:
   - Customer Notified
   - Keys Returned
   - Documents Ready
   - Invoice Attached
   - Cleaned
   - Quality Check
2. All items must be checked before the **Complete Delivery** button becomes active.
3. The customer signs for receipt of the vehicle.
4. The job card moves to Invoiced/Closed status.

---

## Technician Workflow

As a Technician, you work on assigned jobs, perform inspections and repairs, run diagnostics, and request parts. Your primary interface is the **Technician Portal**.

### Technician Portal

After login, you land on the **Technician Portal** (`/technician-portal`).

The portal shows:

- **Greeting header**: Your name and role in a gradient hero card.
- **Statistics**: Assigned jobs, In Progress, Completed today, Today's schedule count.
- **Current Job**: The job you are actively working on, with a stage indicator.
- **Job Queue**: Remaining assigned jobs sorted by priority.
- **Today's Schedule**: Appointments scheduled for today.

### Viewing Assigned Jobs

Your job list shows only jobs assigned to you (own-scope filtering). Each job card displays:

- Job ID and customer name
- Vehicle make and model
- Current stage with the WorkflowStepper
- Priority badge (Normal / High / Urgent)
- Service type badge

Click a job to open the **Job Detail** screen with full information.

### Performing Inspection

Navigate to **Workshop > Inspection** (`/workshop-inspection`).

The multi-point inspection covers six vehicle systems:

| Category | Check Items |
|---|---|
| Engine & Transmission | Oil Level, Coolant, Transmission Fluid, Engine Noise |
| Brakes & Suspension | Brake Pads, Brake Discs, Brake Fluid, Shock Absorbers |
| Tires & Wheels | Tire Tread, Tire Pressure, Wheel Alignment |
| Electrical & Lighting | Battery, Headlights, Tail Lights, Indicators |
| Fluids & Filters | Coolant, Power Steering, Air Filter |
| Body & Interior | Windshield, Paint Condition, Interior Trim, Seats |

For each item, mark one of three verdicts:

- **Pass** (green): Item is in acceptable condition.
- **Fail** (red): Item needs attention. This feeds into the estimate.
- **N/A** (grey): Not applicable for this service.

The progress counter at the top shows checked items versus total (e.g., "15/22"). All items must be evaluated before you can submit the inspection.

Click **Complete Inspection** to advance the job to the Estimate stage.

> **Important**: An inspection cannot be submitted half-complete. Every item must have a verdict because the estimate is built directly from the findings.

### Performing Repairs

Once the estimate is approved and the job moves to Repair:

1. Open your assigned job from the Technician Portal.
2. Perform the work as described in the estimate.
3. Request parts from the Storekeeper if needed (see Parts Requests below).
4. Log your time against the job.
5. When complete, transition the job to QC.

### Requesting Parts

From the Technician Portal, use the **Parts Requests** section:

1. Select the job card the part is for.
2. Search for the part by name, SKU, or category.
3. Enter the quantity needed.
4. Submit the request. The Storekeeper receives a notification to issue the part.

### Running Diagnostics

Navigate to **Workshop > OBD Diagnostics** (`/obd-diagnostics`).

1. Connect the OBD device to the vehicle.
2. The screen reads **live sensor data** (RPM, temperature, voltage, etc.).
3. **DTC codes** (Diagnostic Trouble Codes) are retrieved and displayed with descriptions.
4. Click **Generate Report** to create a Diagnostic Report.

The report is distributed to multiple recipients. See [Diagnostic Report Workflow](../workflows/diagnostic-report.md) for the fan-out chain.

### Knowledge Base

Navigate to **Workshop > Technician KB** (`/technician-kb`).

Access repair guides and procedures organized by vehicle make and service type. Each guide includes:

- Step-by-step instructions with step counts
- Required tools
- Torque specifications where applicable
- Estimated time

---

## QC Inspector Workflow

As QC Inspector, you perform the quality gate between repair and delivery. Your job is to verify that the work was done correctly before the vehicle returns to the customer.

### Quality Check

Navigate to **Workshop > Quality Check** (`/workshop-qc`).

1. The WorkflowStepper shows "Quality Check" as the current stage.
2. The screen displays the job details, assigned technician, and completed work summary.
3. Complete the **QC Checklist**:

| Check Item | What to Verify |
|---|---|
| Repair Verified | All repair items from the estimate are completed |
| Fluids Topped | All fluid levels are correct |
| Test Drive | Vehicle drives correctly (if applicable) |
| Cleaned | Vehicle interior and exterior are clean |
| Quality Check | Overall quality meets standards |
| Documents Ready | Service documentation is complete |

4. The counter shows progress (e.g., "4/6 checks recorded").
5. When all items are checked, click **Pass QC** to advance to Delivery.

### Failing a QC Check

If the work does not meet standards:

1. Do not check the failing items.
2. Click **Return to Repair**. The job goes back to the Repair stage.
3. Add notes explaining what needs to be corrected.
4. The assigned technician is notified to address the issues.

### Segregation of Duties

The system enforces a critical control: **the technician who performed the repair cannot be the same person who passes the QC check**. This is validated server-side using the job's audit trail.

If you attempt to pass QC on a job you also repaired, the server returns a 403 error with an explanation. The screen displays this message clearly. A different QC Inspector or authorized staff member must perform the quality check.

> **Note**: This control checks the actual person, not just the role. A Branch Manager who performed the repair also cannot pass its QC.

---

## Common Tips for All Workshop Staff

- **Photo uploads**: Attach photos during check-in, inspection, and repair for documentation.
- **Mobile usage**: All workshop screens adapt to mobile. The DataTable becomes MobileCard layout for easier use on tablets in the shop.
- **Stage gates**: No stage can be skipped. The system enforces the full lifecycle: Check-In, Inspection, Estimate, Repair, QC, Delivery.
- **Customer contact visibility**: Technicians, QC Inspectors, and Suppliers cannot see customer phone numbers and email addresses. These fields appear as redacted. Only front-desk and advisory roles see full contact details.

---

## Related Guides

- [Job Lifecycle](../workflows/job-lifecycle.md) -- complete step-by-step of each stage
- [Estimate Approval](../workflows/estimate-approval.md) -- approval chain details
- [Diagnostic Report](../workflows/diagnostic-report.md) -- OBD diagnostic chain
- [Technician Portal Guide](../portals/technician-portal-guide.md) -- detailed technician portal reference
- [Branch Manager Guide](manager-guide.md) -- how your manager oversees operations
