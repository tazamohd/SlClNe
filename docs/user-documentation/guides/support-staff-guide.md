# Support & Administrative Staff Guide

This guide covers the daily workflows for three roles that handle front-line customer interaction and organizational administration: **Receptionist**, **Call Center Agent**, and **HR Manager**.

> **Prerequisites**: Complete the [Getting Started](getting-started.md) guide first.

---

## Role Comparison

| Detail | Receptionist | Call Center Agent | HR Manager |
|---|---|---|---|
| Scope | Branch | All (organization-wide) | All (organization-wide) |
| Approval ceiling | SAR 0 | SAR 0 | SAR 15,000 |
| Landing page | Dashboard | Call Center | Dashboard |
| Primary modules | Appointments, customers, job cards, kiosk | Call center, appointments, customers, CRM | HR, technicians, reports |

---

## Receptionist Workflow

As Receptionist, you are the first point of contact for walk-in customers. You manage the front desk, create initial job cards, handle appointments, and operate the self-service kiosk.

### Front Desk Check-In

When a customer arrives at the branch:

1. **Greet the customer** and ask for their name or phone number.
2. Navigate to **CRM > Customers** (`/customers`) and search for the customer.
   - If found, click their name to view their profile, registered vehicles, and service history.
   - If new, click **Add Customer** and enter their details (name, phone, email).
3. Confirm which vehicle is being brought in. If the vehicle is not registered, add it to the customer's record.
4. Navigate to **Workshop > Job Cards** and click **Create** to open a new job card.
5. Fill in:
   - **Customer**: Select the customer from the lookup.
   - **Vehicle**: Select or add the vehicle.
   - **Service Type**: What the customer is requesting.
   - **Complaint / Notes**: Record what the customer describes.
6. Click **Save**. The job card is created at the Check-In stage.
7. Direct the customer to the waiting area and notify the Service Advisor.

### Appointment Management

Navigate to **Workshop > Appointments** (`/appointments`).

**Checking today's schedule**:
- The appointment list shows all bookings for today, including customer name, vehicle, service type, scheduled time, and assigned bay.
- Appointments with a green status are confirmed; yellow indicates pending confirmation.

**Creating a walk-in appointment**:
1. Click **New Appointment**.
2. Select the customer and vehicle.
3. Choose the service type, date (today), and an available time slot.
4. Assign a bay if available.
5. Click **Schedule**.

**Managing cancellations and reschedules**:
1. Find the appointment in the list.
2. Click to open details.
3. Choose **Reschedule** (pick a new date/time) or **Cancel** (provide a reason).

### Kiosk Management

Navigate to **Portals > Kiosk Check-In** (`/kiosk-check-in`).

The self-service kiosk allows customers to check in without front desk assistance:

- Customers can scan a QR code or enter their phone number.
- The kiosk displays their appointments and allows confirmation.
- You monitor the kiosk queue from the dashboard to assist customers who need help.

> **Tip**: Keep the kiosk screen visible from the front desk so you can spot customers who are struggling with the self-service flow.

### Invoice Handling

You have `vc` (view and create) access to invoices. When a customer is ready to pay at the front desk:

1. Navigate to **Finance > Invoices** (`/invoices`).
2. Find the customer's invoice (search by name or job card ID).
3. Confirm the total with the customer.
4. Click **Record Payment** if you are authorized to accept payment at the front desk.

For more complex payment scenarios, direct the customer to the Accountant.

---

## Call Center Agent Workflow

As Call Center Agent, you handle incoming customer calls across all branches, schedule appointments by phone, and log interactions for follow-up.

### Call Center Dashboard

After login, you land on the **Call Center** screen (`/call-center`).

The dashboard provides:

- **Active calls**: Current calls in progress (if VoIP integration is configured).
- **Call queue**: Waiting calls with wait time.
- **Today's statistics**: Calls handled, average call duration, calls missed.
- **Recent call log**: History of today's calls with outcomes.

### Handling an Incoming Call

1. Accept the call from the queue.
2. **Customer lookup**: Search by name, phone number, or vehicle plate in the search bar.
   - If the customer exists, their full profile loads with vehicle list, active jobs, and history.
   - If new, create a customer record during the call.
3. Listen to the customer's request and take action:

| Customer Request | Action |
|---|---|
| Book an appointment | Create a new appointment (see below) |
| Check on repair status | Look up their active job card and relay the current stage |
| Ask about pricing | Provide general service pricing or transfer to the branch |
| Make a complaint | Log in the CRM as a customer interaction |
| General inquiry | Provide information and log the call |

### Scheduling by Phone

1. While on the call, navigate to **Workshop > Appointments**.
2. Click **New Appointment**.
3. Select the customer's record.
4. Choose the service type they are requesting.
5. Check available slots across branches (you have organization-wide scope).
6. Offer the customer available dates and times.
7. Once agreed, click **Schedule**.
8. Confirm the booking details with the customer before ending the call.

> **Note**: You have `vced` access to appointments, meaning you can view, create, edit, and delete appointments. This allows you to reschedule or cancel on behalf of customers.

### Call Logging

Navigate to **Call Center > Logs** (`/call-center/logs`).

After each call:

1. The call log is created automatically (if VoIP integration is active) or manually.
2. Add notes about the call content and outcome.
3. Set the call disposition: Resolved, Follow-up Required, Transferred, Missed.
4. If follow-up is needed, create a CRM task with a due date.

### Customer Lookup

You can search across all branches (organization-wide scope) for customer information:

- Navigate to **CRM > Customers** (`/customers`).
- Use the search bar to find customers by name, phone, email, or vehicle plate.
- View their service history, active jobs, and contact information.

---

## HR Manager Workflow

As HR Manager, you manage staffing, performance, payroll, leave, and training across the organization.

### Staff Directory

Navigate to **HR > Staff Directory** (`/staff-directory`).

View all employees across all branches:

- **Name** (EN/AR)
- **Role**
- **Branch**
- **Status**: Active, On Leave, Inactive
- **Contact information**

Click a staff member to view their full profile, performance history, and leave balance.

### Staff Scheduling

Navigate to **HR > Staff Scheduling** (`/staff-scheduling`).

Manage shift schedules for all branches:

1. Select the branch and week.
2. Drag and drop staff members into shift slots.
3. The system highlights conflicts (double-booked staff, understaffed shifts).
4. Publish the schedule to notify affected staff.

### Performance Reviews

Navigate to **HR > Staff Performance Review** (`/staff-performance-review`).

Conduct periodic performance evaluations:

1. Select the employee and review period.
2. Fill in performance criteria with ratings.
3. Add written comments and development goals.
4. Submit the review. The employee can view it from their profile.

### Technician-Specific Performance

Navigate to **HR > Technician Performance** (`/technician-performance`).

View workshop-specific metrics for technicians:

- Jobs completed per period
- Average repair time
- First-time QC pass rate
- Customer satisfaction scores

Also available: **Technician Leaderboards** (`/technician-leaderboards`) for ranking technicians across branches.

### Timesheets and Payroll

**Timesheets** (`/timesheet-management`):
1. View submitted timesheets from all staff.
2. Approve or reject with comments.
3. Approved timesheets feed into payroll calculation.

**Payroll** (`/payroll-management`):
1. Review calculated payroll for the current period.
2. Verify hours, overtime, deductions, and allowances.
3. Submit for processing.

> **Rule**: A payroll period cannot be reopened after posting. Verify all entries before finalizing.

### Leave Requests

Navigate to **HR > Leave Requests** (`/leave-requests`).

1. View pending leave requests from staff.
2. Check the calendar for conflicts (overlapping leave, understaffed periods).
3. **Approve** or **Reject** with a reason.
4. Approved leave updates the staff schedule automatically.

> **Rule**: Leave cannot overlap an already-approved leave for the same employee. The system prevents this automatically.

### Training & LMS

Navigate to **HR > Training LMS** (`/training-lms`).

Manage the learning management system:

- **Courses**: Create and manage training courses with modules.
- **Assignments**: Assign courses to employees by role or individually.
- **Progress tracking**: Monitor completion rates and quiz scores.
- **Certifications**: Track certifications and renewal dates.

### Productivity Tracker

Navigate to **HR > Productivity Tracker** (`/productivity-tracker`).

Monitor organization-wide productivity metrics:

- Average tasks completed per employee
- Utilization rates by department
- Trend analysis over time

---

## Approval Authority

The HR Manager has a SAR 15,000 approval ceiling. This means:

- You can approve HR-related expenses up to SAR 15,000 (e.g., training costs, equipment purchases for staff).
- Items above SAR 15,000 escalate to the Owner.
- You have `va` access to the Approvals module.

---

## Cross-Role Coordination

### Receptionist + Service Advisor

When a receptionist creates a job card, the Service Advisor takes over for the technical check-in process (odometer, fuel level, belongings, detailed issue notes). The Receptionist's job is to get the customer registered, the vehicle identified, and the initial job card created quickly.

### Call Center + Branch Staff

Call Center Agents have organization-wide scope, so they can schedule appointments at any branch. After scheduling, the branch's Receptionist and Service Advisor see the appointment on their calendar and prepare accordingly.

### HR Manager + All Staff

The HR Manager's decisions affect everyone: schedules determine who is available, leave approvals create coverage gaps to fill, and performance reviews influence technician assignments.

---

## Common Tasks Quick Reference

| Task | Role | Navigation |
|---|---|---|
| Check in a walk-in customer | Receptionist | CRM > Customers (lookup) then Workshop > Job Cards > Create |
| Schedule an appointment | Receptionist / Call Center | Workshop > Appointments > New |
| Log a phone call | Call Center | Call Center > Logs |
| Look up a customer | All three | CRM > Customers (search bar) |
| Approve a leave request | HR Manager | HR > Leave Requests |
| Review timesheets | HR Manager | HR > Timesheet Management |
| Run payroll | HR Manager | HR > Payroll Management |
| Assign training | HR Manager | HR > Training LMS |
| Monitor kiosk | Receptionist | Portals > Kiosk Check-In |

---

## Related Guides

- [Getting Started](getting-started.md) -- login and interface basics
- [Job Lifecycle](../workflows/job-lifecycle.md) -- what happens after check-in
- [Branch Manager Guide](manager-guide.md) -- how your manager oversees operations
- [Workshop Staff Guide](workshop-staff-guide.md) -- the workshop floor workflow
- [Customer App Guide](../portals/customer-app-guide.md) -- what customers see on their end
