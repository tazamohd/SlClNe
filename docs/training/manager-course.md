# SALIS AUTO -- Branch Manager Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Branch Manager                            |
| Demo Account     | Faisal Al-Harbi (manager@salisauto.sa)    |
| Password         | Demo@1234                                 |
| Approval Scope   | Branch                                    |
| SAR Limit        | 50,000 SAR                                |
| Duration         | 8 hours (5 modules)                       |
| Track            | Executive (P0 -- go-live)                 |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led                            |

### 1.1 Learning Objectives

Upon completing this course, the Branch Manager will be able to:

1. Configure and manage branch-level settings and operations
2. Oversee the full workshop lifecycle from check-in to delivery
3. Manage branch staff assignments, schedules, and performance
4. Approve financial transactions up to 50,000 SAR
5. Generate and interpret branch-level operational and financial reports

---

## 2. Module 1 -- Branch Setup & Configuration (90 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Branch profile and settings          | 20 min   |
| 2 | Operating hours and capacity         | 15 min   |
| 3 | Service catalog configuration        | 20 min   |
| 4 | Bay and workstation setup            | 15 min   |
| 5 | Branch-level notification settings   | 20 min   |

### 2.2 Key Concepts

- **Branch Scope**: The manager role operates within branch scope -- all actions and data are limited to the assigned branch
- **RBAC Modules**: Manager has access to dashboard, jobcards, appointments, estimates, checkin, inspection, qc, delivery, customers, vehicles, feedback, invoices, payments, leads, opportunities, reports, analytics, parts, hr, staff modules
- **Permission Actions**: v (view), c (create), e (edit), a (approve), x (export) on branch-scoped modules
- **Bilingual Configuration**: Branch settings support EN/AR with RTL layout for Arabic-facing customers

### 2.3 Hands-On Lab

**Lab 1.1: Configuring Branch Settings**

1. Log in as manager (`manager@salisauto.sa` / `Demo@1234`)
2. Navigate to Admin > Branch Settings
3. Update the branch operating hours (e.g., Sun-Thu 08:00-18:00)
4. Set the branch capacity (number of bays, daily job limit)
5. Configure the service catalog -- enable/disable service types
6. Set up bay assignments for the branch
7. Configure notification preferences for branch-level alerts

### 2.4 Quiz -- Module 1

**Q1.** What is the scope of the Branch Manager role?

- A) Platform-wide
- B) Branch-level
- C) Own tasks only
- D) External

**Correct Answer**: B -- The manager role operates at branch scope.

**Q2.** Which of the following can a Branch Manager NOT do?

- A) Configure branch operating hours
- B) Modify platform-wide RBAC settings
- C) Set up bay assignments
- D) Update the service catalog

**Correct Answer**: B -- Platform-wide RBAC configuration is restricted to the Super Admin and Owner roles.

**Q3.** What is the Branch Manager's approval limit?

- A) 5,000 SAR
- B) 25,000 SAR
- C) 50,000 SAR
- D) Unlimited

**Correct Answer**: C -- The Branch Manager has a 50,000 SAR approval ceiling.

---

## 3. Module 2 -- Workshop Operations (120 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Workshop lifecycle overview          | 20 min   |
| 2 | Check-in and inspection oversight    | 25 min   |
| 3 | Estimate review and approval         | 25 min   |
| 4 | Repair monitoring and job tracking   | 25 min   |
| 5 | QC oversight and delivery sign-off   | 25 min   |

### 3.2 Key Concepts

- **Workshop Lifecycle**: Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
- **Manager Oversight**: The manager monitors all active job cards within the branch, intervening at approval checkpoints
- **Estimate Approval**: Estimates between 5,001 and 50,000 SAR require manager approval; above 50,000 SAR escalates to owner
- **SOD Enforcement**: The manager cannot both perform a repair and pass QC on the same job
- **Job Prioritization**: Manager can re-prioritize jobs based on urgency, customer tier, or parts availability

### 3.3 Hands-On Lab

**Lab 2.1: Managing the Workshop Board**

1. Navigate to Workshop > Job Board
2. Review all active job cards -- filter by status (In Progress, Waiting Parts, QC)
3. Click on a job card to view full details including inspection photos
4. Re-prioritize a job by dragging it on the board
5. Assign a technician to an unassigned job
6. Review the estimated completion time vs. actual time spent

**Lab 2.2: Approving an Estimate**

1. Navigate to Approvals > Pending Estimates
2. Select an estimate in the 5,001-50,000 SAR range
3. Review the line items, labor hours, and parts costs
4. Compare with historical pricing for similar jobs
5. Approve the estimate -- verify the job status changes to "Approved"
6. Attempt to approve an estimate exceeding 50,000 SAR -- observe the escalation prompt

**Lab 2.3: Monitoring the Full Lifecycle**

1. Follow a job card from Check-In through to Delivery
2. At each stage, note the status transitions and required actions
3. Review the QC checklist results for a completed job
4. Sign off on delivery and verify the invoice is generated
5. Check that the customer notification was sent

### 3.4 Quiz -- Module 2

**Q1.** What is the correct order of the workshop lifecycle?

- A) Inspection -> Check-In -> Estimate -> QC -> Repair -> Delivery
- B) Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
- C) Check-In -> Estimate -> Inspection -> Repair -> Delivery -> QC
- D) Estimate -> Check-In -> Inspection -> Repair -> QC -> Delivery

**Correct Answer**: B -- The correct lifecycle is Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery.

**Q2.** What happens when an estimate exceeds 50,000 SAR?

- A) It is automatically rejected
- B) It escalates to the Owner/CEO for approval
- C) The manager can still approve it
- D) It is split into multiple estimates

**Correct Answer**: B -- Estimates above 50,000 SAR exceed the manager's ceiling and escalate to the owner.

---

## 4. Module 3 -- Team Management (90 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Staff roster and shift scheduling    | 20 min   |
| 2 | Role assignment and permissions      | 20 min   |
| 3 | Performance tracking                 | 20 min   |
| 4 | Leave and attendance management      | 15 min   |
| 5 | Communication and announcements      | 15 min   |

### 4.2 Key Concepts

- **Branch Staff**: Manager oversees all branch-assigned roles (Advisor, Technician, QC, Receptionist)
- **Shift Management**: Configure shifts, assign staff, handle swaps and overtime
- **Performance Metrics**: Job completion rate, quality score, customer ratings per technician
- **HR Coordination**: Manager can view HR data for branch staff; full HR management remains with the HR role

### 4.3 Hands-On Lab

**Lab 3.1: Managing the Team Roster**

1. Navigate to HR > Staff > Branch Roster
2. View the current team members and their assigned roles
3. Update a technician's shift schedule for the upcoming week
4. Review a technician's performance metrics (jobs completed, avg time, quality score)
5. Create a branch announcement visible to all branch staff

### 4.4 Quiz -- Module 3

**Q1.** Which performance metric is tracked per technician?

- A) Revenue generated
- B) Job completion rate
- C) Customer acquisition cost
- D) Supplier lead time

**Correct Answer**: B -- Job completion rate, quality score, and customer ratings are tracked per technician.

**Q2.** Can a Branch Manager modify platform-wide HR policies?

- A) Yes, for their branch only
- B) Yes, for all branches
- C) No, this requires the HR Manager or Owner role
- D) No, HR policies are fixed

**Correct Answer**: C -- Platform-wide HR policies are managed by the HR Manager or Owner/CEO.

---

## 5. Module 4 -- Approvals & Financial Oversight (60 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Approval queue management            | 15 min   |
| 2 | Purchase order review                | 15 min   |
| 3 | Invoice oversight                    | 15 min   |
| 4 | Budget monitoring                    | 15 min   |

### 5.2 Key Concepts

- **Approval Ceiling**: 50,000 SAR -- transactions above this escalate to owner
- **SOD Rules**: Manager cannot raise and approve the same PO
- **Invoice Review**: Manager can view all branch invoices; ZATCA compliance is automatic
- **Budget Alerts**: Configurable thresholds for branch spending alerts

### 5.3 Hands-On Lab

**Lab 4.1: Processing the Approval Queue**

1. Navigate to Approvals > Pending
2. Filter by type (Estimates, POs, Payments)
3. Approve a PO within the 50,000 SAR limit
4. Reject a PO with a documented reason
5. Review the approval audit trail for the branch

### 5.4 Quiz -- Module 4

**Q1.** What happens if the manager tries to approve a PO they raised?

- A) It is approved normally
- B) The system blocks it due to SOD rules
- C) It requires a second manager's approval
- D) It is flagged but allowed

**Correct Answer**: B -- The SOD pair "Raise PO / Approve PO" prevents the same user from doing both.

---

## 6. Module 5 -- Reports & Analytics (60 minutes)

### 6.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Branch performance dashboard         | 15 min   |
| 2 | Workshop efficiency reports          | 15 min   |
| 3 | Financial summaries                  | 15 min   |
| 4 | Exporting and scheduling reports     | 15 min   |

### 6.2 Key Concepts

- **Branch-Scoped Reports**: All reports are filtered to the manager's branch by default
- **Key Reports**: Daily job summary, weekly revenue, monthly P&L, technician productivity
- **Export Formats**: PDF, Excel, CSV
- **Scheduled Reports**: Auto-delivery to manager's email

### 6.3 Hands-On Lab

**Lab 5.1: Generating Branch Reports**

1. Navigate to Reports > Branch Dashboard
2. Review the daily job summary
3. Generate a weekly revenue report
4. Export the report as Excel
5. Schedule the report for weekly auto-delivery

### 6.4 Quiz -- Module 5

**Q1.** Which export formats are available for branch reports?

- A) PDF only
- B) PDF and Excel
- C) PDF, Excel, and CSV
- D) Excel only

**Correct Answer**: C -- Reports can be exported as PDF, Excel, or CSV.

---

## 7. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Branch Setup & Configuration    | 90 min   | Complete branch configuration           |
| 2      | Workshop Operations             | 120 min  | Full lifecycle oversight                |
| 3      | Team Management                 | 90 min   | Staff scheduling and performance        |
| 4      | Approvals & Financial Oversight | 60 min   | 50K SAR ceiling with SOD controls       |
| 5      | Reports & Analytics             | 60 min   | Branch-level data-driven decisions      |

### 7.1 Certification Path

Pass all assessments with 70% minimum for Bronze certification. See [Certification Framework](certification-framework.md) (SA-TRN-014).

---

## 8. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Manager Guide](../user-documentation/guides/manager-guide.md)
- [Job Lifecycle Workflow](../user-documentation/workflows/job-lifecycle.md)
- [Estimate Approval Workflow](../user-documentation/workflows/estimate-approval.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)

---

## 9. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
