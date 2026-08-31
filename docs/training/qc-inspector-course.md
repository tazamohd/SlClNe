# SALIS AUTO -- QC Inspector Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-006                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | QC Inspector                              |
| Demo Account     | Majed Al-Otaibi (qc@salisauto.sa)        |
| Password         | Demo@1234                                 |
| Approval Scope   | Branch                                    |
| SAR Limit        | 0 SAR (no financial approval)             |
| Duration         | 4 hours (3 modules)                       |
| Track            | Operations (P1 -- week 1-2)              |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led                            |

### 1.1 Learning Objectives

Upon completing this course, the QC Inspector will be able to:

1. Navigate and execute the QC checklist for all service types
2. Apply pass/fail decisions with documented rationale
3. Understand and comply with the SOD rule (perform repair != pass QC)
4. Generate QC reports for branch management

---

## 2. Module 1 -- QC Checklist (90 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | QC Inspector dashboard               | 15 min   |
| 2 | Understanding the QC checklist       | 20 min   |
| 3 | Checklist categories and items       | 20 min   |
| 4 | Inspection techniques and standards  | 20 min   |
| 5 | Documentation requirements           | 15 min   |

### 2.2 Key Concepts

- **QC Module Access**: QC Inspector has access to qc (v,c,e), inspection (v), jobcards (v), delivery (v,c) modules
- **Branch Scope**: QC Inspector reviews all jobs within the branch that reach "Pending QC" status
- **Checklist Structure**: Checklists are organized by service type (mechanical, electrical, body, general)
- **Standards**: Each checklist item has defined acceptance criteria
- **Photo Comparison**: QC can compare before/after photos uploaded by the technician
- **Bilingual Checklists**: Available in EN/AR for documentation consistency

### 2.3 Hands-On Lab

**Lab 1.1: Navigating the QC Dashboard**

1. Log in as QC Inspector (`qc@salisauto.sa` / `Demo@1234`)
2. Review the QC dashboard -- note the "Pending QC" queue
3. See the count of jobs awaiting QC review
4. Sort the queue by priority (urgent first)
5. Click on a job card to view the repair details and technician documentation
6. Review the before/during/after photos submitted by the technician

**Lab 1.2: Executing a QC Checklist**

1. Open a job card with status "Pending QC"
2. Navigate to the QC Checklist tab
3. The system auto-loads the checklist based on the service type performed
4. Go through each checklist category:
   - **Safety Items**: Brakes, steering, lights, tire condition
   - **Repair Quality**: Component fit, finish, alignment
   - **Functionality**: System operation, no leaks, no unusual noises
   - **Cleanliness**: Vehicle interior and exterior condition
5. For each item, mark as:
   - Pass: Meets acceptance criteria
   - Fail: Does not meet criteria -- add note and photo
   - N/A: Not applicable to this repair
6. Add inspector notes for items requiring attention
7. Upload verification photos for completed checks

**Lab 1.3: Comparing Technician Documentation**

1. While reviewing the QC checklist, open the "Repair Documentation" panel
2. Compare the technician's reported work with the actual condition
3. Verify that all reported parts were installed (cross-reference parts issued)
4. Check labor hours recorded against expected time for the repair type
5. Note any discrepancies for the QC report

### 2.4 Quiz -- Module 1

**Q1.** Which checklist categories are included in a standard QC review?

- A) Safety and functionality only
- B) Safety, repair quality, functionality, and cleanliness
- C) Repair quality only
- D) Customer satisfaction only

**Correct Answer**: B -- Standard QC covers safety, repair quality, functionality, and cleanliness.

**Q2.** What are the possible outcomes for each checklist item?

- A) Good or Bad
- B) 1-5 rating scale
- C) Pass, Fail, or N/A
- D) Approved or Rejected

**Correct Answer**: C -- Each item can be marked as Pass, Fail, or N/A.

**Q3.** What must accompany a "Fail" marking on a checklist item?

- A) Nothing additional is needed
- B) A note and photo documenting the failure
- C) Manager approval
- D) Customer consent

**Correct Answer**: B -- Failed items require a note and photo documenting the specific issue.

---

## 3. Module 2 -- Pass/Fail Workflow (90 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Making pass/fail decisions           | 20 min   |
| 2 | SOD enforcement: repair vs. QC       | 25 min   |
| 3 | Handling failed QC -- rework flow    | 25 min   |
| 4 | Passing QC -- delivery handoff       | 20 min   |

### 3.2 Key Concepts

- **SOD Rule -- Perform Repair / Pass QC**: The technician who performed the repair CANNOT be the same person who passes QC. The system enforces this automatically.
- **Pass Decision**: All checklist items pass -> QC Inspector approves -> Job moves to "QC Passed -- Ready for Delivery"
- **Fail Decision**: One or more items fail -> Job returns to "Rework Required" -> Assigned back to a technician
- **Rework Assignment**: The failed job can be assigned to the original or a different technician
- **Re-inspection**: After rework, the job returns to QC for re-inspection
- **Escalation**: Persistent failures escalate to the Branch Manager

### 3.3 Hands-On Lab

**Lab 2.1: Passing a QC Review**

1. Complete a QC checklist where all items pass
2. Add overall QC notes (e.g., "All repairs verified, vehicle ready for delivery")
3. Click "Pass QC" -- verify the status changes to "QC Passed -- Ready for Delivery"
4. Confirm that the Service Advisor receives a delivery notification
5. Check the audit trail to see the QC pass event logged

**Lab 2.2: Failing a QC Review**

1. Complete a QC checklist where one or more items fail
2. Document each failure with notes and photos
3. Click "Fail QC" and specify the required rework
4. The system returns the job to "Rework Required" status
5. Verify that the original technician or an alternative receives the rework assignment
6. Note: If the system detects a SOD violation (same user trying to pass their own repair), it blocks the action

**Lab 2.3: SOD Enforcement Demonstration**

1. In a second browser tab, log in as technician (`tech@salisauto.sa` / `Demo@1234`)
2. Identify a job card where Saeed Al-Zahrani performed the repair
3. Return to the QC tab (`qc@salisauto.sa`)
4. Attempt to pass QC on a job where the QC inspector is also listed as the repairer
5. Observe the system block with the SOD error message
6. Document the error: "SOD Violation: Perform Repair / Pass QC -- same user cannot perform both actions"
7. The job must be reassigned to a different QC reviewer or the repair to a different technician

**Lab 2.4: Re-inspection After Rework**

1. Locate a job with status "Rework Complete -- Pending Re-QC"
2. Open the rework notes submitted by the technician
3. Re-execute the failed checklist items
4. If all items now pass, approve the QC
5. If items still fail, escalate to the Branch Manager

### 3.4 Quiz -- Module 2

**Q1.** What does the SOD rule "Perform Repair / Pass QC" prevent?

- A) Two technicians working on the same job
- B) The same person performing the repair and passing QC
- C) QC inspectors from viewing repair details
- D) Managers from overriding QC decisions

**Correct Answer**: B -- The SOD rule prevents the same person from both repairing and passing QC.

**Q2.** What happens to a job that fails QC?

- A) It is closed and invoiced
- B) It returns to "Rework Required" and is reassigned to a technician
- C) The customer is notified of the failure
- D) The job is deleted

**Correct Answer**: B -- Failed QC jobs return to "Rework Required" for technician rework.

**Q3.** What status does a job receive after passing QC?

- A) Completed
- B) Invoiced
- C) QC Passed -- Ready for Delivery
- D) Delivered

**Correct Answer**: C -- After passing QC, the job status is "QC Passed -- Ready for Delivery."

**Q4.** Who is notified when a job passes QC?

- A) The customer only
- B) The technician only
- C) The Service Advisor (to arrange delivery)
- D) The Owner/CEO

**Correct Answer**: C -- The Service Advisor is notified to arrange customer vehicle delivery.

**Q5.** What happens during persistent QC failures?

- A) The job is auto-approved
- B) The issue escalates to the Branch Manager
- C) The customer is asked to accept the defect
- D) The technician's account is disabled

**Correct Answer**: B -- Persistent failures escalate to the Branch Manager for review.

---

## 4. Module 3 -- QC Reporting (60 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | QC summary reports                   | 15 min   |
| 2 | Failure trend analysis               | 15 min   |
| 3 | Technician quality scores            | 15 min   |
| 4 | Exporting QC data                    | 15 min   |

### 4.2 Key Concepts

- **QC Reports**: Daily, weekly, and monthly QC summaries for the branch
- **Failure Trends**: Identify recurring failure patterns by service type, technician, or checklist category
- **Quality Scores**: Each technician receives a quality score based on first-pass QC rate
- **Export**: QC reports can be exported as PDF, Excel, or CSV for management review
- **Benchmarks**: Branch-level QC pass rates compared against targets (e.g., 95% first-pass rate)

### 4.3 Hands-On Lab

**Lab 3.1: Generating QC Reports**

1. Navigate to Reports > QC > Summary
2. Select the date range (current week)
3. Review the QC summary: total inspections, pass rate, fail rate, rework count
4. Drill down into failure categories to identify trends
5. Review individual technician quality scores
6. Export the report as PDF

**Lab 3.2: Analyzing Failure Trends**

1. Navigate to Reports > QC > Trend Analysis
2. Select a 3-month date range
3. Identify the top 3 failure categories
4. Cross-reference failures with specific technicians
5. Prepare a summary of findings for the Branch Manager
6. Save the trend report for the monthly management review

### 4.4 Quiz -- Module 3

**Q1.** What benchmark is typically set for first-pass QC rate?

- A) 80%
- B) 90%
- C) 95%
- D) 100%

**Correct Answer**: C -- A 95% first-pass QC rate is the standard benchmark.

**Q2.** Which export formats are available for QC reports?

- A) PDF only
- B) PDF and Excel
- C) PDF, Excel, and CSV
- D) Excel only

**Correct Answer**: C -- QC reports can be exported as PDF, Excel, or CSV.

**Q3.** How is a technician's quality score calculated?

- A) Customer feedback ratings
- B) First-pass QC rate for their completed jobs
- C) Number of jobs completed per day
- D) Manager evaluation

**Correct Answer**: B -- Quality scores are based on the technician's first-pass QC rate.

---

## 5. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | QC Checklist                    | 90 min   | Thorough inspection with documentation  |
| 2      | Pass/Fail Workflow              | 90 min   | SOD enforcement and rework handling     |
| 3      | QC Reporting                    | 60 min   | Data-driven quality improvement         |

---

## 6. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Workshop Staff Guide](../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../user-documentation/workflows/job-lifecycle.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 7. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
