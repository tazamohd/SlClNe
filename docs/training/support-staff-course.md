# SALIS AUTO -- Support Staff Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-008                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                                |
|------------------|-------------------------------------------------------|
| Target Roles     | Receptionist, Call Center Agent, HR Manager            |
| Duration         | 8 hours (5 modules)                                   |
| Track            | Back-Office (P2 -- week 2-4)                          |
| Prerequisites    | Platform Fundamentals module (30 min)                 |
| Delivery         | Blended (ILT for core modules, self-paced for labs)   |

### 1.1 Role Matrix

| Role         | Demo Account                              | Scope  | SAR Limit  |
|--------------|-------------------------------------------|--------|------------|
| Receptionist | Lama Al-Shehri (frontdesk@salisauto.sa)   | Branch | 0 SAR      |
| Call Center  | Turki Al-Anazi (calls@salisauto.sa)       | All    | 0 SAR      |
| HR Manager   | Reem Al-Dossari (hr@salisauto.sa)         | All    | 15,000 SAR |

All demo accounts use password: `Demo@1234`

### 1.2 Learning Objectives

Upon completing this course, participants will be able to:

1. Manage front desk operations including walk-in reception and appointment handling
2. Handle call center operations including inbound inquiries and outbound follow-ups
3. Administer HR functions including staff management, leave, and attendance
4. Manage CRM workflows including leads, opportunities, and campaigns
5. Use internal communication tools effectively

---

## 2. Module 1 -- Front Desk Operations (120 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Receptionist dashboard               | 20 min   |
| 2 | Walk-in customer handling            | 25 min   |
| 3 | Appointment verification             | 20 min   |
| 4 | Customer check-in assistance         | 25 min   |
| 5 | Visitor management and security      | 15 min   |
| 6 | Bilingual customer interaction       | 15 min   |

### 2.2 Key Concepts

- **Receptionist RBAC**: customers (v,c), vehicles (v), appointments (v,c,e), checkin (v,c), feedback (v)
- **Branch Scope**: Receptionist operates within the assigned branch only
- **No Financial Access**: 0 SAR approval limit -- no access to invoices, payments, or accounting
- **Walk-In Flow**: Greet -> Identify (new/returning) -> Register/Look up -> Direct to advisor or schedule
- **Bilingual**: Front desk interface and customer-facing forms available in EN/AR with RTL support

### 2.3 Hands-On Lab

**Lab 1.1: Handling a Walk-In Customer**

1. Log in as receptionist (`frontdesk@salisauto.sa` / `Demo@1234`)
2. Navigate to the Front Desk dashboard
3. A walk-in customer arrives -- search by phone number or name
4. If new customer: create a quick registration (name, phone, preferred language)
5. If returning customer: pull up their profile and vehicle history
6. Check advisor availability and schedule an immediate or future appointment
7. Print or send a digital queue ticket to the customer

**Lab 1.2: Managing Appointments**

1. Navigate to Appointments > Today's Schedule
2. Review the day's appointments with arrival status (confirmed, arrived, no-show)
3. Mark a customer as "Arrived" when they check in
4. Handle a no-show: send a follow-up notification and reschedule option
5. View the weekly appointment calendar for capacity planning

### 2.4 Quiz -- Module 1

**Q1.** What permission actions does the receptionist have on the appointments module?

- A) View only
- B) View and create
- C) View, create, and edit
- D) Full access including delete

**Correct Answer**: C -- The receptionist has v (view), c (create), and e (edit) on appointments.

**Q2.** What is the receptionist's SAR approval limit?

- A) 1,000 SAR
- B) 5,000 SAR
- C) 10,000 SAR
- D) 0 SAR

**Correct Answer**: D -- The receptionist has no financial approval authority.

**Q3.** What is the first step when a walk-in customer arrives?

- A) Create an invoice
- B) Search for existing customer record by phone or name
- C) Assign a technician
- D) Generate a QC checklist

**Correct Answer**: B -- The first step is identifying whether the customer is new or returning.

---

## 3. Module 2 -- Call Center Operations (90 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Call center dashboard                | 15 min   |
| 2 | Inbound call handling                | 25 min   |
| 3 | Outbound follow-up calls            | 20 min   |
| 4 | Ticket creation and routing          | 15 min   |
| 5 | Call logging and disposition codes   | 15 min   |

### 3.2 Key Concepts

- **Call Center RBAC**: customers (v,c,e), vehicles (v), appointments (v,c,e), feedback (v,c), leads (v,c,e), opportunities (v,c)
- **All Scope**: Call center agent can assist customers across all branches
- **No Financial Access**: 0 SAR approval limit
- **Call Types**: Service inquiry, appointment booking, complaint, status check, follow-up
- **Disposition Codes**: Resolved, escalated, follow-up needed, appointment booked, no answer
- **Integration**: Customer history visible during calls for personalized service

### 3.3 Hands-On Lab

**Lab 2.1: Handling an Inbound Call**

1. Log in as call center agent (`calls@salisauto.sa` / `Demo@1234`)
2. Navigate to the Call Center dashboard
3. Simulate an inbound call -- search for the customer
4. Review the customer's service history and open job cards
5. Provide a status update on an active job
6. Log the call with the appropriate disposition code
7. If needed, create a follow-up task or escalate to the branch

**Lab 2.2: Booking an Appointment via Phone**

1. Customer calls to book an appointment
2. Search for the customer or create a new registration
3. Check availability across branches (all-scope access)
4. Book the appointment at the customer's preferred branch
5. Send a confirmation via SMS or email
6. Log the call with disposition code "Appointment Booked"

### 3.4 Quiz -- Module 2

**Q1.** What scope does the Call Center Agent have?

- A) Branch
- B) Own
- C) All (cross-branch)
- D) External

**Correct Answer**: C -- The call center agent has "all" scope for cross-branch customer service.

**Q2.** Which disposition code indicates the call needs another contact?

- A) Resolved
- B) Escalated
- C) Follow-up needed
- D) No answer

**Correct Answer**: C -- "Follow-up needed" indicates the case requires another contact.

---

## 4. Module 3 -- HR Management (120 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | HR Manager dashboard                 | 20 min   |
| 2 | Employee onboarding                  | 25 min   |
| 3 | Leave and attendance management      | 25 min   |
| 4 | Performance reviews                  | 20 min   |
| 5 | Payroll coordination                 | 15 min   |
| 6 | Training enrollment management       | 15 min   |

### 4.2 Key Concepts

- **HR RBAC**: hr (v,c,e,a), staff (v,c,e,a), reports (v,x)
- **All Scope**: HR Manager manages staff across all branches
- **SAR Limit**: 15,000 SAR for HR-related approvals (e.g., training budgets, equipment)
- **Employee Lifecycle**: Onboarding -> Active -> Performance Review -> Offboarding
- **Leave Types**: Annual, sick, emergency, unpaid -- configurable per company policy
- **Attendance Tracking**: Clock-in/out, overtime calculation, absence alerts
- **Training Enrollment**: HR coordinates LMS enrollment for all staff

### 4.3 Hands-On Lab

**Lab 3.1: Onboarding a New Employee**

1. Log in as HR Manager (`hr@salisauto.sa` / `Demo@1234`)
2. Navigate to HR > Staff > New Employee
3. Enter employee details: name, role, branch assignment, start date
4. Assign the appropriate RBAC role from the available roles
5. Set up the employee's system account credentials
6. Enroll the employee in the required training course(s)
7. Verify the employee appears in the branch roster

**Lab 3.2: Managing Leave Requests**

1. Navigate to HR > Leave Management
2. Review pending leave requests
3. Check the team calendar for conflicts
4. Approve or reject the request with a note
5. View the leave balance summary for the department

**Lab 3.3: Training Enrollment**

1. Navigate to HR > Training > Enrollment
2. Select employees due for training
3. Assign them to the appropriate course and track
4. Set a deadline for course completion
5. Monitor progress on the enrollment dashboard

### 4.4 Quiz -- Module 3

**Q1.** What is the HR Manager's SAR approval limit?

- A) 5,000 SAR
- B) 10,000 SAR
- C) 15,000 SAR
- D) 25,000 SAR

**Correct Answer**: C -- The HR Manager has a 15,000 SAR approval limit.

**Q2.** What scope does the HR Manager operate at?

- A) Branch
- B) Own
- C) All (cross-branch)
- D) External

**Correct Answer**: C -- The HR Manager has "all" scope for managing staff across branches.

**Q3.** Who coordinates training enrollment for internal staff?

- A) Branch Manager only
- B) HR Manager
- C) Super Admin
- D) Each employee self-enrolls

**Correct Answer**: B -- The HR Manager coordinates LMS enrollment for all internal staff.

---

## 5. Module 4 -- CRM & Lead Management (60 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Lead capture and qualification       | 15 min   |
| 2 | Opportunity tracking                 | 15 min   |
| 3 | Campaign management                  | 15 min   |
| 4 | Customer feedback and follow-up      | 15 min   |

### 5.2 Key Concepts

- **CRM Modules**: leads (v,c,e), opportunities (v,c,e), campaigns (v), feedback (v,c)
- **Lead Sources**: Walk-in, phone, website, referral, campaign
- **Lead Pipeline**: New -> Contacted -> Qualified -> Converted or Lost
- **Campaigns**: Marketing campaigns tracked with lead attribution
- **Feedback Loop**: Customer feedback linked to completed jobs for quality tracking

### 5.3 Hands-On Lab

**Lab 4.1: Managing Leads**

1. Navigate to CRM > Leads
2. Create a new lead from a phone inquiry
3. Qualify the lead: set budget, service interest, timeline
4. Convert a qualified lead into an appointment
5. Review the lead conversion report

### 5.4 Quiz -- Module 4

**Q1.** What is the correct lead pipeline order?

- A) Qualified -> New -> Contacted -> Converted
- B) New -> Contacted -> Qualified -> Converted or Lost
- C) Contacted -> New -> Converted -> Qualified
- D) New -> Qualified -> Contacted -> Converted

**Correct Answer**: B -- The pipeline is New -> Contacted -> Qualified -> Converted or Lost.

---

## 6. Module 5 -- Communication Tools (30 minutes)

### 6.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Internal messaging system            | 10 min   |
| 2 | Notification management              | 10 min   |
| 3 | Template-based communications        | 10 min   |

### 6.2 Key Concepts

- **Internal Messaging**: Direct messages and group channels for team communication
- **Notifications**: Configurable push, email, and in-app notifications per event type
- **Templates**: Pre-built message templates for common customer communications (EN/AR)
- **Escalation Alerts**: Automatic escalation notifications for overdue tasks

### 6.3 Hands-On Lab

**Lab 5.1: Using Communication Tools**

1. Send an internal message to a colleague
2. Configure notification preferences for the role
3. Use a bilingual template to send a customer update
4. Review the notification history for audit purposes

### 6.4 Quiz -- Module 5

**Q1.** What notification channels are available?

- A) Email only
- B) Push and email only
- C) Push, email, and in-app notifications
- D) SMS only

**Correct Answer**: C -- Notifications are available via push, email, and in-app channels.

---

## 7. Course Summary

| Module | Topic                           | Duration | Primary Role(s)          |
|--------|---------------------------------|----------|--------------------------|
| 1      | Front Desk Operations           | 120 min  | Receptionist             |
| 2      | Call Center Operations          | 90 min   | Call Center Agent        |
| 3      | HR Management                   | 120 min  | HR Manager               |
| 4      | CRM & Lead Management           | 60 min   | Call Center, Receptionist|
| 5      | Communication Tools             | 30 min   | All support staff        |

---

## 8. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Support Staff Guide](../user-documentation/guides/support-staff-guide.md)
- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 9. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
