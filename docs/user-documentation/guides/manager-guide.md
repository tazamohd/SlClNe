# Branch Manager Guide

This guide covers daily operations for the **Branch Manager** role. As Branch Manager, you oversee all workshop activity at your branch, manage staff, approve estimates up to SAR 50,000, and track branch-level performance.

> **Prerequisites**: Complete the [Getting Started](getting-started.md) guide first.

---

## Your Role at a Glance

| Detail | Value |
|---|---|
| Scope | Branch (your assigned branch only) |
| Approval ceiling | SAR 50,000 |
| Landing page | Dashboard |
| Key modules | Job cards, appointments, estimates, customers, vehicles, inventory, invoices, payments, HR, reports |

You have full create/edit/delete/approve access to most operational modules within your branch. Items above SAR 50,000 escalate to the Owner for approval.

---

## Dashboard Overview

Your Dashboard at `/dashboard` shows branch-level metrics:

- **Active Jobs**: Number of job cards currently in progress.
- **Pending Approvals**: Estimates and purchase orders waiting for your sign-off.
- **Today's Appointments**: Scheduled vehicles arriving today.
- **Revenue**: Branch revenue for the current period.
- **Technician Utilization**: How busy your team is.

Review the Dashboard first thing each morning to plan your day.

---

## Job Card Management

Navigate to **Workshop > Job Cards** (`/job-cards`).

### Viewing Job Cards

The Job Cards screen displays a DataTable with all jobs at your branch. Each row shows:

- **Job ID**: Unique reference (e.g., JC-A3F8B2C1)
- **Customer**: Name of the vehicle owner
- **Vehicle**: Make and model
- **Stage**: Current position in the workflow (Check-In through Closed)
- **Assigned Technician**: Who is working on it
- **Priority**: Badge indicating urgency

Use the search bar to filter by job ID, customer name, or vehicle. Click column headers to sort.

### Creating a Job Card

1. Click the **Create Job Card** button.
2. **Customer Lookup**: Search for an existing customer or create a new one.
3. **Vehicle Selection**: Pick from the customer's registered vehicles or add a new vehicle.
4. **Service Type**: Select the type of service (Maintenance, Repair, Inspection, etc.).
5. **Complaint / Notes**: Record what the customer reported.
6. **Priority**: Set Normal, High, or Urgent.
7. Click **Save** to create the job card at the Check-In stage.

### Assigning a Technician

1. Open a job card by clicking its row.
2. In the Job Detail view, locate the **Assignment** section.
3. Select a technician from the dropdown (shows availability and specializations).
4. Click **Assign**.

### Tracking Progress

Each job card displays the **WorkflowStepper** -- a horizontal progress rail with six stages:

```
Check-In --> Inspection --> Estimate --> Repair --> Quality Check --> Delivery
```

The current stage is highlighted with a gradient. Completed stages show a filled circle. You can see the full job history in the **Timeline** panel on the Job Detail screen.

> **Note**: Stage transitions cannot be skipped. A job must pass through each gate in order.

---

## Appointment Scheduling

Navigate to **Workshop > Appointments** (`/appointments`).

### Calendar View

The Appointment Calendar (`/appointment-calendar`) shows a weekly grid with:

- **Bay allocation**: Each service bay as a column.
- **Time slots**: Rows for each hour of the working day.
- **Color coding**: By service type or technician assignment.

### Scheduling an Appointment

1. Click an empty slot on the calendar, or use the **New Appointment** button.
2. Select the **Customer** and **Vehicle**.
3. Choose the **Service Type**.
4. Pick the **Date**, **Time**, and **Bay**.
5. Optionally assign a **Technician**.
6. Click **Schedule**.

The customer receives a confirmation notification (SMS/email if configured).

### Technician Schedule

View technician availability at `/technician-schedule`. This shows each technician's daily workload, assigned jobs, and available slots for the week.

---

## Estimate Approval

Navigate to **Workshop > Approval Inbox** (`/approval-inbox`).

### How Estimates Reach You

When a Service Advisor creates an estimate that exceeds their SAR 5,000 ceiling, it is automatically routed to your Approval Inbox. You can approve estimates up to SAR 50,000.

### Reviewing and Deciding

1. Open the Approval Inbox.
2. Each pending item shows the **reference number**, **customer**, **vehicle**, **amount**, and **status**.
3. Click an item to review the full estimate with line items (parts and labour).
4. Choose:
   - **Approve**: The estimate proceeds to customer approval (if required) and then to repair.
   - **Reject**: Enter a reason. The advisor is notified to revise.

> **Important**: If an estimate exceeds SAR 50,000, the "Approve" button is replaced with "Escalate", and the item routes to the Owner.

### Segregation of Duties

The system enforces that the person who submitted an estimate cannot be the same person who approves it. This is checked server-side. If you created the estimate yourself, you cannot approve it -- it must go to the Owner or another authorized approver.

See [Estimate Approval Workflow](../workflows/estimate-approval.md) for the complete flow including customer e-signature.

---

## Customer Management

Navigate to **CRM > Customers** (`/customers`).

### Customer Records

Each customer profile includes:

- Contact information (name, phone, email, address)
- Registered vehicles
- Service history across all visits
- Outstanding invoices and payment history
- Communication log

### Adding a Customer

1. Click **Add Customer**.
2. Enter name (EN/AR), phone, email, and any notes.
3. Click **Save**.
4. Optionally add vehicles to the customer's record.

---

## Vehicle Registry

Navigate to **Workshop > Vehicles** (`/vehicles`).

View all vehicles registered at your branch. Each record shows:

- **Plate number** and registration details
- **Make / Model / Year**
- **VIN** (Vehicle Identification Number)
- **Owner** (linked customer)
- **Service history** -- every job card associated with this vehicle

Click a vehicle to view its full history, inspection records, and current status.

---

## Inventory Oversight

Navigate to **Inventory > Inventory Management** (`/inventory-management`).

As Branch Manager, you have full access to inventory at your branch:

- **Stock Levels**: Current on-hand quantities for all parts.
- **Reorder Alerts**: Parts below minimum stock thresholds are flagged.
- **Purchase Orders**: View and approve orders to suppliers.
- **Consumption History**: Track which parts were used in which jobs.

See [Finance Staff Guide](finance-staff-guide.md) for the Storekeeper's detailed inventory workflow.

---

## Technician Management

### Performance Tracking

Navigate to **HR > Technician Performance** (`/technician-performance`).

Monitor each technician's metrics:

- Jobs completed per period
- Average repair time
- Quality pass rate (first-time QC pass)
- Customer satisfaction scores

### Leaderboards

View **Technician Leaderboards** (`/technician-leaderboards`) for a ranked view of your team's performance.

### Scheduling

Use **HR > Staff Scheduling** (`/staff-scheduling`) to manage shifts, days off, and workload distribution across your team.

---

## Branch-Level Reports

Navigate to **Reports** from the sidebar.

| Report | What It Shows |
|---|---|
| Workshop Reports | Job throughput, average cycle time, service type distribution |
| Financial Reports | Branch revenue, expenses, profitability |
| Operational Reports | Bay utilization, technician efficiency, appointment adherence |
| Inventory Reports | Stock turnover, consumption patterns, reorder frequency |

All reports can be filtered by date range and exported (for roles with export permission).

---

## Daily Operations Workflow

A recommended daily routine:

| Time | Action |
|---|---|
| Start of day | Review Dashboard for branch overview |
| Morning | Check Approval Inbox for pending estimates |
| Morning | Review today's appointments and bay allocations |
| Midday | Monitor active jobs on the Job Cards screen |
| Afternoon | Check inventory alerts for low-stock items |
| End of day | Review completed jobs and pending deliveries |
| Weekly | Review technician performance and reports |

---

## Common Tasks Quick Reference

| Task | Navigation |
|---|---|
| Create a job card | Workshop > Job Cards > Create |
| Approve an estimate | Workshop > Approval Inbox |
| Schedule an appointment | Workshop > Appointments > New |
| View a customer's history | CRM > Customers > select customer |
| Check inventory levels | Inventory > Inventory Management |
| Review technician performance | HR > Technician Performance |
| Run branch reports | Reports (any report section) |
| Manage staff schedules | HR > Staff Scheduling |

---

## Related Guides

- [Workshop Staff Guide](workshop-staff-guide.md) -- for understanding your team's daily workflows
- [Finance Staff Guide](finance-staff-guide.md) -- for inventory and financial details
- [Job Lifecycle](../workflows/job-lifecycle.md) -- complete step-by-step of each workshop stage
- [Estimate Approval](../workflows/estimate-approval.md) -- approval chain and customer signature
