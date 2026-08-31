# SALIS AUTO -- Technician Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-005                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Technician                                |
| Demo Account     | Saeed Al-Zahrani (tech@salisauto.sa)      |
| Password         | Demo@1234                                 |
| Approval Scope   | Own                                       |
| SAR Limit        | 0 SAR (no financial approval)             |
| Duration         | 6 hours (4 modules)                       |
| Track            | Operations (P1 -- week 1-2)              |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led with tablet demonstration  |

### 1.1 Learning Objectives

Upon completing this course, the Technician will be able to:

1. Receive and manage job assignments through the platform
2. Execute the repair workflow with proper status updates
3. Submit parts requests to the storekeeper
4. Document work performed and hand off jobs for QC

---

## 2. Module 1 -- Job Assignment (90 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Technician dashboard overview        | 20 min   |
| 2 | Receiving job assignments            | 20 min   |
| 3 | Understanding job card details       | 20 min   |
| 4 | Priority and scheduling              | 15 min   |
| 5 | Accepting and starting jobs          | 15 min   |

### 2.2 Key Concepts

- **Own Scope**: The technician role sees only jobs assigned to them -- no access to other technicians' jobs or branch-wide data
- **RBAC Modules**: jobcards (v,e), inspection (v,c,e), parts (v,c -- request only)
- **No Financial Access**: The technician has 0 SAR approval limit and no access to invoices, payments, or accounting modules
- **Job Priority**: Jobs are color-coded by priority (red = urgent, yellow = normal, green = low)
- **Notifications**: Push notifications and in-app alerts for new assignments and status changes

### 2.3 Hands-On Lab

**Lab 1.1: Navigating the Technician Dashboard**

1. Log in as technician (`tech@salisauto.sa` / `Demo@1234`)
2. Review the dashboard -- note the "My Jobs" widget showing assigned jobs
3. Check the notification bell for new assignments
4. Switch language to Arabic and verify RTL layout
5. Open a job card and review the customer concern, vehicle details, and inspection checklist

**Lab 1.2: Accepting a Job Assignment**

1. Locate a newly assigned job card with status "Assigned"
2. Review the job details: customer concerns, vehicle info, priority level
3. Accept the job -- note the status changes to "In Progress"
4. Review the estimated time and any special instructions from the advisor
5. Check if any parts have been pre-allocated for this job

### 2.4 Quiz -- Module 1

**Q1.** What scope does the technician role have?

- A) Branch
- B) All
- C) Own (assigned jobs only)
- D) Platform

**Correct Answer**: C -- Technicians operate at "own" scope, seeing only their assigned jobs.

**Q2.** What is the technician's SAR approval limit?

- A) 1,000 SAR
- B) 5,000 SAR
- C) 500 SAR
- D) 0 SAR

**Correct Answer**: D -- Technicians have no financial approval authority.

**Q3.** What happens when the technician accepts a job?

- A) The job is completed
- B) The job status changes to "In Progress"
- C) An estimate is created
- D) The job is sent to QC

**Correct Answer**: B -- Accepting a job changes its status to "In Progress."

---

## 3. Module 2 -- Repair Workflow (120 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Performing initial inspection        | 25 min   |
| 2 | Updating job status and progress     | 20 min   |
| 3 | Recording work performed             | 25 min   |
| 4 | Time tracking and labor logging      | 25 min   |
| 5 | Handling unexpected findings         | 25 min   |

### 3.2 Key Concepts

- **Inspection Execution**: Technician fills out the digital inspection checklist with pass/fail/needs-attention for each item
- **Photo Documentation**: Capture before/during/after photos for each repair item
- **Status Updates**: Regular status updates visible to the advisor and manager
- **Time Tracking**: Clock in/out for each job to track actual labor hours
- **Additional Findings**: New issues discovered during repair are documented and sent to the advisor for estimate amendment
- **SOD Rule**: Technician who performs the repair CANNOT pass QC on the same job

### 3.3 Hands-On Lab

**Lab 2.1: Performing an Inspection**

1. Open an assigned job card with status "Under Inspection"
2. Navigate to the digital inspection checklist
3. Go through each inspection item:
   - Mark items as Pass, Fail, or Needs Attention
   - Upload photos for failed items
   - Add notes describing the condition
4. Complete the inspection and submit the results
5. Verify the advisor receives a notification of the completed inspection

**Lab 2.2: Executing a Repair**

1. Open a job card with status "Approved -- Ready for Repair"
2. Clock in to the job (start the time tracker)
3. Update the job status to "In Repair"
4. Record work steps as they are completed:
   - Component removed
   - Replacement part installed
   - System tested
5. Upload photos of the completed repair
6. If an unexpected issue is found, submit an "Additional Finding" to the advisor
7. Clock out when the repair is complete
8. Review the total labor hours logged

**Lab 2.3: Handling Additional Findings**

1. During a repair, navigate to "Additional Findings"
2. Describe the new issue found
3. Upload supporting photos
4. Submit the finding to the advisor
5. Wait for the advisor to amend the estimate (simulated)
6. Once approved, continue with the additional repair

### 3.4 Quiz -- Module 2

**Q1.** What must the technician do before starting a repair?

- A) Approve the estimate
- B) Clock in to the job
- C) Contact the customer
- D) Order parts

**Correct Answer**: B -- The technician must clock in to track labor hours before starting.

**Q2.** What should the technician do when discovering an unexpected issue during repair?

- A) Fix it immediately without documentation
- B) Submit an "Additional Finding" to the advisor
- C) Skip it and complete the original repair
- D) Contact the customer directly

**Correct Answer**: B -- Additional findings must be documented and sent to the advisor for estimate amendment.

**Q3.** Can the technician who performed the repair also pass QC on the same job?

- A) Yes, always
- B) Yes, if the manager approves
- C) No, due to SOD rules (Perform Repair / Pass QC)
- D) No, technicians cannot access QC at all

**Correct Answer**: C -- SOD rules prevent the same person from performing repair and passing QC.

---

## 4. Module 3 -- Parts Requests (90 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Searching for parts                  | 20 min   |
| 2 | Creating a parts request             | 25 min   |
| 3 | Tracking request status              | 20 min   |
| 4 | Receiving and confirming parts       | 25 min   |

### 4.2 Key Concepts

- **Parts Module Access**: Technician has v (view) and c (create -- request only) permissions on the parts module
- **No Stock Adjustment**: Technicians cannot adjust stock counts (SOD: issue stock / adjust stock count)
- **Request Workflow**: Technician requests -> Storekeeper issues -> Technician confirms receipt
- **Alternative Parts**: System may suggest alternative or compatible parts
- **Urgency Levels**: Normal, Urgent, Critical -- affects processing priority

### 4.3 Hands-On Lab

**Lab 3.1: Creating a Parts Request**

1. Open an active job card
2. Navigate to "Parts Required"
3. Search for a part by name, part number, or category
4. Select the part and specify the quantity
5. Set the urgency level (Normal, Urgent, Critical)
6. Submit the request to the storekeeper
7. Verify the request appears in the "Pending Parts" list

**Lab 3.2: Tracking and Receiving Parts**

1. Navigate to "My Parts Requests"
2. View the status of pending requests (Requested, Allocated, Ready for Pickup)
3. When a request shows "Ready for Pickup," go to the parts counter
4. Confirm receipt of the parts in the system
5. Verify the parts are now linked to the job card
6. If a part is unavailable, review the alternative suggestions

### 4.4 Quiz -- Module 3

**Q1.** What permission does the technician have on the parts module?

- A) View and delete
- B) View and create (request only)
- C) Full access
- D) View only

**Correct Answer**: B -- Technicians can view parts and create requests but cannot issue or adjust stock.

**Q2.** What urgency levels are available for parts requests?

- A) Low and High
- B) Normal, Urgent, Critical
- C) 1-5 scale
- D) Standard only

**Correct Answer**: B -- Parts requests can be flagged as Normal, Urgent, or Critical.

---

## 5. Module 4 -- Documentation & Handoff (60 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Completing repair documentation      | 15 min   |
| 2 | Final photos and test results        | 15 min   |
| 3 | Handoff to QC                        | 15 min   |
| 4 | Job completion best practices        | 15 min   |

### 5.2 Key Concepts

- **Documentation**: All work performed must be documented with descriptions, photos, and time logs
- **Handoff**: When repair is complete, the technician submits the job for QC review
- **Status Transition**: Job moves from "In Repair" to "Pending QC"
- **SOD Enforcement**: The system ensures a different person (QC Inspector) reviews the work
- **Best Practices**: Clear notes for the QC inspector, organized photo documentation, accurate time logs

### 5.3 Hands-On Lab

**Lab 4.1: Completing Documentation and Handoff**

1. Open a job card with completed repair work
2. Review all documentation: work descriptions, photos, time logs
3. Add any final notes or test results
4. Upload final photos showing the completed repair
5. Click "Submit for QC" -- verify the status changes to "Pending QC"
6. Confirm that the QC Inspector (Majed Al-Otaibi) receives a notification
7. Review the job timeline to see all recorded events

### 5.4 Quiz -- Module 4

**Q1.** What status does a job receive when submitted for QC?

- A) Completed
- B) Pending QC
- C) Delivered
- D) In Review

**Correct Answer**: B -- After the technician submits, the job status is "Pending QC."

**Q2.** What must the technician include in the handoff documentation?

- A) Invoice amount
- B) Customer contact information
- C) Work descriptions, photos, and time logs
- D) Parts pricing

**Correct Answer**: C -- Documentation includes work descriptions, photos, and time logs.

**Q3.** Who reviews the job after the technician submits for QC?

- A) Service Advisor
- B) Branch Manager
- C) QC Inspector
- D) Customer

**Correct Answer**: C -- The QC Inspector reviews the job after repair.

---

## 6. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Job Assignment                  | 90 min   | Receive and manage assigned jobs        |
| 2      | Repair Workflow                 | 120 min  | Execute repairs with full documentation |
| 3      | Parts Requests                  | 90 min   | Request and track parts efficiently     |
| 4      | Documentation & Handoff         | 60 min   | Clean handoff to QC                     |

---

## 7. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Workshop Staff Guide](../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../user-documentation/workflows/job-lifecycle.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 8. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
