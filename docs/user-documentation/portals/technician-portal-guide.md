# Technician Portal Guide

This guide is a detailed reference for the **Technician Portal** -- the dedicated interface where technicians manage their assigned jobs, track time, request parts, document work, and access repair knowledge.

> **Prerequisites**: Complete the [Getting Started](../guides/getting-started.md) guide first. For workflow context, see the [Workshop Staff Guide](../guides/workshop-staff-guide.md).

---

## Portal Overview

After logging in as a Technician, you land on the **Technician Portal** (`/technician-portal`). This portal is separate from the main application shell -- it uses a focused layout designed for workshop floor use, often on a tablet or phone.

### Key Facts

| Detail | Value |
|---|---|
| Scope | Own (only your assigned jobs) |
| Approval ceiling | SAR 0 |
| Portal shell | PortalShell (simplified navigation) |
| Accessible modules | Job cards (ve), appointments (v), estimates (v), vehicles (v), technicians (v), portaltech (vx) |

---

## Dashboard

The portal dashboard shows a gradient hero card with your name and role, followed by four key statistics:

| Statistic | Description |
|---|---|
| Assigned | Total number of jobs currently assigned to you |
| In Progress | Jobs where you are actively working |
| Completed | Jobs you have finished |
| Today | Number of appointments on today's schedule |

Below the stats are two main sections: your **Current Job** and your **Job Queue**.

---

## My Jobs

### Current Job

The top job card shows the job you are actively working on:

- **Job ID** and customer name
- **Vehicle**: Make, model, and plate number
- **Stage**: Current position on the six-step workflow rail (Check-In through Delivery)
- **Service type**: Maintenance, Repair, Inspection, or Diagnostics badge

The WorkflowStepper shows the six stages as a horizontal rail with the current stage highlighted by the gradient.

### Job Queue

Below the current job, your remaining assigned jobs are listed as cards. Each card shows:

- Job ID and customer
- Vehicle details
- Current stage
- Priority badge (Normal / High / Urgent)

Tap any job to open its detail view.

### Job Detail

Route: `/technician-portal/job-detail`

The job detail screen (`TechnicianPortal.JobDetail`) shows the full view of a single job:

- **Customer panel**: Name and vehicle (contact details like phone and email are redacted for technicians -- this is a security rule, not a bug).
- **Service timeline**: History of all actions taken on this job, with timestamps.
- **Work instructions**: What needs to be done based on the estimate.
- **Parts list**: Parts allocated to this job.
- **Stage controls**: Buttons to advance the job to the next stage when your work is done.

### Advancing a Job Stage

When you complete your work at a stage:

1. Open the job from your portal.
2. Complete all required checklist items (if applicable).
3. Click the appropriate transition button (e.g., **Complete Inspection**, **Submit for Estimate**, **Complete Repair**).
4. The system records who performed the transition and when.
5. The job moves to the next stage.

> **Important**: You cannot skip stages. The system enforces the full sequence: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery.

---

## Time Clock

Route: `/technician-portal/time-clock` (also available as Technician-Portal-Time-Clock)

Track your working hours directly from the portal.

### Clocking In and Out

1. Navigate to **Time Clock** from the portal navigation.
2. Tap **Clock In** when you start your shift. The current time is recorded.
3. Tap **Break** when taking a break. The break duration is tracked separately.
4. Tap **Resume** to end the break.
5. Tap **Clock Out** at the end of your shift.

### Time Display

The time clock shows:

- **Today's hours**: Total hours worked so far.
- **Break time**: Total break duration.
- **Net working time**: Hours minus breaks.
- **Weekly summary**: Hours for each day of the current week.

Your time entries feed into the HR system for payroll calculation.

---

## Parts Requests

Route: `/technician-portal/parts`

Request parts from the Storekeeper without leaving the portal.

### Submitting a Request

1. Navigate to **Parts** from the portal.
2. Select the **Job Card** the part is for.
3. Search for the part by name, part number, or category.
4. Enter the **quantity** needed.
5. Add any notes (e.g., "urgent -- car waiting" or "check for compatible alternative").
6. Tap **Submit Request**.

### Request Status

Track the status of your parts requests:

| Status | Meaning |
|---|---|
| Pending | Request submitted, waiting for Storekeeper |
| Approved | Storekeeper confirmed availability |
| Issued | Part has been issued from inventory |
| Rejected | Part unavailable or request denied (see notes) |

You receive a notification when the Storekeeper processes your request.

---

## Job Documentation

Route: `/technician-portal/documentation`

Document your work with photos, notes, and findings.

### Adding Documentation

1. Navigate to **Documentation** from the portal.
2. Select the active job.
3. **Photos**: Tap the camera icon to take a photo or upload one. Capture:
   - Before photos (damage, wear, condition on arrival)
   - During photos (work in progress)
   - After photos (completed repair)
4. **Notes**: Add text notes describing findings, actions taken, and any observations.
5. **Findings**: Record specific findings from inspection or repair that may affect the estimate or future service recommendations.

All documentation is attached to the job card's history and visible to the Service Advisor, Branch Manager, and (where applicable) the customer.

---

## Repair Guides

Route: `/technician-portal/guides` (also available as Technician-Portal-Guides)

Access the knowledge base for step-by-step repair procedures.

### Finding a Guide

1. Navigate to **Guides** from the portal.
2. Browse by category (Engine, Brakes, Electrical, etc.) or search by keyword.
3. Each guide shows:
   - **Title** and vehicle applicability
   - **Step count** (e.g., "12 steps")
   - **Estimated time** (e.g., "45 minutes")
   - **Difficulty level**

### Using a Guide

Open a guide to see:

- Numbered step-by-step instructions
- Required tools for each step
- **Torque specifications** where applicable (e.g., "Tighten to 80 Nm")
- Safety warnings
- Reference images

> **Tip**: Keep the guide open on your tablet while working. You can check off steps as you complete them.

---

## Diagnostic Software

Route: `/technician-portal/software` (also available as Technician-Portal-Software)

### OBD Integration

Connect to the vehicle's OBD-II port for digital diagnostics:

1. Navigate to **Diagnostic Software** from the portal.
2. Connect the OBD device to the vehicle.
3. The screen displays:
   - **Live sensor data**: RPM, engine temperature, battery voltage, fuel pressure.
   - **DTC codes**: Diagnostic Trouble Codes with descriptions and severity.
4. Click **Generate Report** to create a diagnostic report.

The generated report is distributed to relevant parties (Reception, Customer, Vehicle History, Storekeeper, Workshop Supervisor). See [Diagnostic Report Workflow](../workflows/diagnostic-report.md) for the full distribution chain.

### DTC Code Lookup

If you encounter an unfamiliar DTC code:

1. Enter the code in the lookup field.
2. The system returns the code description, common causes, and recommended actions.
3. Use this information to inform your inspection findings and estimate recommendations.

---

## Profile & Attendance

Route: `/technician-portal/profile` and `/technician-portal/attendance`

### Profile

View and update your basic information:

- Name and contact details
- Specializations (engine, electrical, body, etc.)
- Certifications and their expiry dates
- Assigned branch

### Attendance

View your attendance record:

- Daily clock-in/out times
- Break durations
- Total hours per day
- Monthly summary

This information matches what the HR Manager sees for payroll purposes.

---

## Mobile Technician App

For technicians working on the shop floor, a mobile-optimized version is available:

| Screen | Route | Purpose |
|---|---|---|
| Home | `/technician-app-home` | Quick overview and current job |
| Jobs | `/technician-app-jobs` | Full job list |
| Clock | `/technician-app-clock` | Time clock |
| Lookup | `/technician-app-lookup` | Part and DTC code lookup |
| Profile | `/technician-app-profile` | Personal info |

These screens use the same data as the main portal but with a layout optimized for phone-sized screens.

---

## What You Cannot Do

Understanding your role boundaries:

- **You cannot see customer contact details** (phone, email). These are redacted by field-level rules for privacy.
- **You cannot approve estimates** (SAR 0 ceiling). Estimates you submit go to the Advisor or Manager.
- **You cannot pass QC on your own repairs**. Segregation of duties requires a different person to perform the quality check.
- **You cannot see financial figures** like invoice totals, revenue, or branch P&L data.
- **You cannot access other technicians' jobs**. Your scope is "own" -- you see only what is assigned to you.

---

## Daily Workflow Summary

| Time | Action |
|---|---|
| Start of shift | Clock in on the Time Clock screen |
| Morning | Review your job queue and today's schedule on the Dashboard |
| During work | Open each assigned job, perform inspections/repairs, document with photos and notes |
| As needed | Request parts through the Parts screen |
| After each job | Advance the stage to the next step (Inspection done, Repair complete, etc.) |
| End of shift | Clock out on the Time Clock screen |

---

## Related Guides

- [Workshop Staff Guide](../guides/workshop-staff-guide.md) -- broader workshop operations context
- [Job Lifecycle](../workflows/job-lifecycle.md) -- the complete job flow
- [Diagnostic Report](../workflows/diagnostic-report.md) -- how diagnostic reports are generated and distributed
- [Getting Started](../guides/getting-started.md) -- general platform navigation
