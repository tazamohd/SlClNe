# Diagnostic Report Workflow

This document describes how a Technician generates an OBD diagnostic report and how the report is distributed to multiple parties through the fan-out chain to produce a finalized estimate.

---

## Overview

The diagnostic report workflow connects the vehicle's digital health data to the workshop's decision-making process. It answers: "What does the vehicle need?" and distributes that answer to everyone who must act on it.

```
Technician connects OBD device
    --> Reads sensor data and DTC codes
        --> Generates diagnostic report
            --> Fan-out to 5 recipients
                --> Storekeeper prices parts
                --> Supervisor adds labour + ETA
                    --> Finalized estimate
                        --> Reception presents to customer
```

---

## Step 1: OBD Connection

**Who**: Technician

**Screen**: OBD Diagnostics (`/obd-diagnostics`)

### Connecting the Device

1. Navigate to **Workshop > OBD Diagnostics** from the sidebar or the Technician Portal.
2. Connect the OBD-II scanner to the vehicle's diagnostic port (typically under the dashboard on the driver's side).
3. The screen displays a connection status indicator.
4. Once connected, data begins streaming.

### Live Sensor Data

The OBD screen shows real-time readings from the vehicle's sensors:

| Sensor | Unit | What It Indicates |
|---|---|---|
| Engine RPM | rpm | Engine speed |
| Coolant Temperature | C | Engine cooling system health |
| Battery Voltage | V | Electrical system health |
| Fuel Pressure | kPa | Fuel delivery system |
| Intake Air Temperature | C | Air induction health |
| Throttle Position | % | Throttle body operation |
| O2 Sensor Voltage | V | Emissions system |
| MAF Sensor | g/s | Mass air flow rate |

Values outside normal ranges are highlighted.

### DTC Code Retrieval

The scan retrieves **Diagnostic Trouble Codes** (DTCs) stored in the vehicle's computer:

- **Code**: Standardized OBD code (e.g., P0301, P0420, B1234)
- **Description**: Human-readable explanation of the fault
- **Severity**: How critical the issue is
- **System**: Which vehicle system is affected

DTC code format:

| Prefix | System |
|---|---|
| P | Powertrain (engine, transmission) |
| B | Body (airbags, climate, interior) |
| C | Chassis (ABS, steering, suspension) |
| U | Network (communication between modules) |

---

## Step 2: Generate the Report

**Who**: Technician

**Screen**: Diagnostic Report (`/diagnostic-report`)

### Creating the Report

1. After the OBD scan, click **Generate Report**.
2. The system compiles the scan data into a structured diagnostic report.

### Report Structure

The report is organized into five sections, each backed by real data collections:

#### Diagnostic Stages

The routing chain showing the report's journey through the workshop. Each stage records who received the report and when.

#### Findings

Individual observations from the scan and physical inspection:

| Field | Description |
|---|---|
| Finding | Description of the issue |
| Severity | Critical, Due now, or Advisory |
| Photo | Attached photo evidence (if available) |
| Notes | Technician's detailed observations |

Severity levels use color-coded badges:

| Severity | Badge Color | Meaning |
|---|---|---|
| Critical | Orange | Safety risk, must be addressed |
| Due now | Blue | Should be fixed at this visit |
| Advisory | Grey | Informational, can be deferred |

The report header shows a count of critical findings to draw attention to urgent items.

#### Parts Required

Parts identified as needed for the recommended repairs:

| Field | Description |
|---|---|
| Part Number | SKU or OEM part number |
| Description | Part name (EN/AR) |
| Quantity | How many are needed |
| Unit Price (SAR) | Price per unit |
| Availability | In stock / Order required |

#### Labour Estimate

Recommended labour for each finding:

| Field | Description |
|---|---|
| Task | Description of the work |
| Hours | Estimated labour hours |
| Rate (SAR/hr) | Hourly rate for this service category |

#### Distribution Copies

A record of who receives the report (see Step 3 below).

### Submitting the Report

1. Review all sections for completeness.
2. Select the **shareWith** recipients (defaults apply, but can be adjusted).
3. Click **Submit Report**.

---

## Step 3: Fan-Out Distribution

When the report is submitted, copies are distributed to five parties. Each recipient has a specific responsibility:

### Recipient 1: Reception

**What they receive**: Notification with a link to the diagnostic report.

**Their action**: The notification includes a "Discuss with Customer" call-to-action. The Receptionist or Service Advisor uses the report to explain findings to the customer in plain language.

### Recipient 2: Customer

**What they receive**: SMS and/or email with a link to view the report.

**Their view**: A formatted version of the report showing:
- Findings with severity indicators
- Recommended parts and services
- Photos of issues found
- Available as a PDF download or web view

The customer can review the findings before the formal estimate arrives. This prepares them for the approval step that follows.

### Recipient 3: Vehicle History

**What happens**: The diagnostic report is permanently attached to the vehicle's record.

**Purpose**: Any future visit to the workshop can reference past diagnostics. This builds a maintenance history that helps technicians understand recurring issues and track whether deferred items were eventually addressed.

### Recipient 4: Storekeeper

**What they receive**: A parts-list task extracted from the diagnostic report.

**Their action**:
1. Review the parts list with quantities.
2. Check current inventory for each part.
3. Enter prices for each part based on current stock or supplier pricing.
4. If parts are not in stock, initiate a purchase requisition.
5. Submit the priced parts list.

### Recipient 5: Workshop Supervisor / Branch Manager

**What they receive**: The full diagnostic report with findings and parts list.

**Their action**:
1. Review the findings and confirm the recommended work.
2. Add **labour hours** for each task based on workshop standards.
3. Add a **handling fee** if applicable.
4. Set an **ETA** (estimated time of completion).
5. Submit the completed cost build-up.

---

## Step 4: Finalized Estimate

After both the Storekeeper (parts pricing) and Supervisor (labour + fees) have contributed:

### Assembly

The system combines all inputs into a finalized estimate:

| Component | Source |
|---|---|
| Findings | Technician's diagnostic report |
| Parts with prices | Storekeeper's priced list |
| Labour with hours and rates | Supervisor's labour estimate |
| Handling fee | Supervisor (if applicable) |
| VAT at 15% | System calculation (server-side per ZATCA) |
| Grand total (SAR) | System calculation |

### Review

The Service Advisor reviews the assembled estimate for accuracy and completeness before it goes to the customer.

---

## Step 5: Customer Presentation

### How the Estimate Reaches the Customer

1. The Reception team presents the finalized estimate to the customer.
2. This triggers the standard [Estimate Approval Workflow](estimate-approval.md):
   - Internal approval check (amount vs. ceiling)
   - SMS link to customer
   - Customer reviews line items
   - OTP verification
   - Canvas signature
3. Approved items proceed to Repair.

### Deferred Items

Items the customer marks as "Advisory" and defers are recorded in:

- The vehicle's history (for next visit reference)
- The customer's profile (as recommended services)

---

## Report Screen Details

The Diagnostic Report screen (`/diagnostic-report`) displays data from five collections:

| Collection | Contents |
|---|---|
| diagStages | The routing chain (who received the report at each step) |
| diagFindings | Individual findings with severity, photos, notes |
| diagParts | Parts list with descriptions, quantities, prices, availability |
| diagLabour | Labour tasks with hours and rates |
| diagCopies | Distribution records (who was sent a copy) |

All sections render from real data. On mobile, the tables switch to card layout.

> **Note**: The grand total (parts + labour + handling fee + VAT) is computed by the server, not by the browser. The report screen shows individual line figures (unit prices, quantities, hours, rates) but does not fabricate an aggregate total.

---

## Complete Flow Summary

| Step | Who | Action | Output |
|---|---|---|---|
| 1 | Technician | Connect OBD, read data | Sensor readings + DTC codes |
| 2 | Technician | Generate report, add findings | Diagnostic report |
| 3a | Reception | Receive notification | Customer discussion |
| 3b | Customer | Receive SMS/email link | Review findings |
| 3c | System | Attach to vehicle | Permanent history record |
| 3d | Storekeeper | Receive parts list | Priced parts list |
| 3e | Supervisor | Receive full report | Labour hours + ETA |
| 4 | System | Combine all inputs | Finalized estimate |
| 5 | Advisor/Reception | Present to customer | Estimate approval flow |

---

## Tips

- **Be thorough with findings**: Every finding should include a severity level. Critical items flag safety risks that the customer needs to understand.
- **Attach photos**: Visual evidence strengthens the case for repairs and protects against disputes.
- **DTC code lookup**: If a code is unfamiliar, use the DTC lookup tool on the Technician Portal to find descriptions and common causes.
- **Advisory items matter**: Even if the customer defers advisory items, recording them creates a maintenance roadmap for the vehicle.

---

## Related Guides

- [Job Lifecycle](job-lifecycle.md) -- where diagnostics fits in the overall workflow
- [Estimate Approval](estimate-approval.md) -- what happens after the estimate is finalized
- [Technician Portal Guide](../portals/technician-portal-guide.md) -- using the OBD diagnostic tools
- [Workshop Staff Guide](../guides/workshop-staff-guide.md) -- roles involved in the diagnostic chain
- [Finance Staff Guide](../guides/finance-staff-guide.md) -- Storekeeper's parts pricing role
