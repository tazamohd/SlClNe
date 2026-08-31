# SALIS AUTO -- Service Advisor Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Service Advisor                           |
| Demo Account     | Noura Al-Qahtani (advisor@salisauto.sa)   |
| Password         | Demo@1234                                 |
| Approval Scope   | Branch                                    |
| SAR Limit        | 5,000 SAR                                 |
| Duration         | 8 hours (5 modules)                       |
| Track            | Operations (P1 -- week 1-2)              |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led                            |

### 1.1 Learning Objectives

Upon completing this course, the Service Advisor will be able to:

1. Register new customers and vehicles in the system
2. Perform vehicle check-in with full documentation
3. Coordinate inspections and diagnostics with technicians
4. Create and manage estimates within the 5,000 SAR approval limit
5. Manage job cards, appointments, and customer communications

---

## 2. Module 1 -- Customer Reception & Check-In (120 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Customer registration and lookup     | 25 min   |
| 2 | Vehicle registration and history     | 25 min   |
| 3 | Check-in process and documentation   | 25 min   |
| 4 | Walk-around inspection recording     | 25 min   |
| 5 | Customer communication preferences   | 20 min   |

### 2.2 Key Concepts

- **Registry Domain**: The advisor manages customer and vehicle records within the branch scope
- **RBAC Access**: customers (v,c,e), vehicles (v,c,e), checkin (v,c,e), feedback (v)
- **Check-In Documentation**: Photos of vehicle condition, mileage recording, customer concern notes
- **Customer History**: Full service history accessible for returning customers
- **Bilingual Forms**: Check-in forms available in EN/AR; customer selects preferred language

### 2.3 Hands-On Lab

**Lab 1.1: Registering a New Customer and Vehicle**

1. Log in as advisor (`advisor@salisauto.sa` / `Demo@1234`)
2. Navigate to Customers > New Customer
3. Fill in the customer details (name, phone, email, preferred language)
4. Navigate to Vehicles > New Vehicle
5. Enter VIN, make, model, year, plate number, and mileage
6. Link the vehicle to the customer record
7. Verify the customer appears in the branch customer list

**Lab 1.2: Performing Vehicle Check-In**

1. Navigate to Workshop > Check-In
2. Search for the customer or vehicle by name, phone, or plate
3. Select the vehicle and start a new check-in
4. Record the customer's stated concerns in both EN and AR
5. Upload walk-around photos (front, back, left, right, interior)
6. Record current mileage and fuel level
7. Generate the check-in receipt and confirm with the customer
8. Verify the job card is created with status "Checked In"

### 2.4 Quiz -- Module 1

**Q1.** Which information is required during vehicle check-in?

- A) VIN only
- B) Customer concerns, mileage, fuel level, and walk-around photos
- C) Plate number only
- D) Customer phone number only

**Correct Answer**: B -- Check-in requires concerns, mileage, fuel level, and condition photos.

**Q2.** What permission actions does the advisor have on the customers module?

- A) View only
- B) View, create, edit
- C) View, create, edit, delete
- D) Full access including approve

**Correct Answer**: B -- The advisor has v (view), c (create), and e (edit) on customers.

**Q3.** What status does a job card receive after check-in?

- A) Pending
- B) Checked In
- C) Inspected
- D) Estimated

**Correct Answer**: B -- After check-in, the job card status is "Checked In."

---

## 3. Module 2 -- Inspection & Diagnostics (90 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Assigning inspection to technicians  | 20 min   |
| 2 | Digital inspection forms             | 25 min   |
| 3 | Photo and video documentation        | 20 min   |
| 4 | Diagnostic code integration          | 25 min   |

### 3.2 Key Concepts

- **Inspection Workflow**: Advisor assigns the job to a technician for initial inspection
- **Digital Forms**: Standardized inspection checklists with pass/fail/needs-attention options
- **Media Capture**: Technicians upload photos/videos; advisor reviews and shares with customer
- **Diagnostics**: OBD-II code integration for automated fault detection
- **Status Transition**: Job moves from "Checked In" to "Under Inspection"

### 3.3 Hands-On Lab

**Lab 2.1: Managing Inspections**

1. Navigate to Workshop > Job Board
2. Select a job card with status "Checked In"
3. Assign the job to technician Saeed Al-Zahrani for inspection
4. Switch to the technician view (open a second browser tab with `tech@salisauto.sa`)
5. Complete the inspection checklist as the technician
6. Return to the advisor view and review the inspection results
7. Share inspection photos with the customer via the notification system

### 3.4 Quiz -- Module 2

**Q1.** Who performs the initial inspection?

- A) Service Advisor
- B) Technician
- C) QC Inspector
- D) Branch Manager

**Correct Answer**: B -- The technician performs the inspection; the advisor assigns and reviews.

**Q2.** What status does a job card have during inspection?

- A) Checked In
- B) Under Inspection
- C) Estimated
- D) In Repair

**Correct Answer**: B -- During inspection, the job card status is "Under Inspection."

---

## 4. Module 3 -- Estimates & Approvals (90 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Creating estimates from inspections  | 25 min   |
| 2 | Parts lookup and pricing             | 20 min   |
| 3 | Labor time and cost calculation      | 20 min   |
| 4 | Approval workflow and SAR limits     | 25 min   |

### 4.2 Key Concepts

- **Estimate Creation**: Advisor builds the estimate from inspection findings, adding labor and parts
- **SAR Limit**: Advisor can approve estimates up to 5,000 SAR; above this, the estimate escalates to the manager (up to 50,000 SAR) or owner (unlimited)
- **Parts Pricing**: Real-time parts pricing from inventory; alternative parts suggestions available
- **Labor Rates**: Standard labor rates per service type; adjustable by manager
- **Currency**: Amounts stored as integer halalas, displayed as SAR
- **Customer Approval**: Estimates are shared with the customer for acceptance before repair begins

### 4.3 Hands-On Lab

**Lab 3.1: Creating and Submitting an Estimate**

1. Navigate to a job card with completed inspection
2. Click "Create Estimate"
3. Add labor line items based on inspection findings
4. Search for parts in the inventory and add them to the estimate
5. Review the total -- if under 5,000 SAR, approve directly
6. For an estimate over 5,000 SAR, submit for manager approval
7. Send the estimate to the customer for acceptance
8. Verify the job card status updates to "Estimated" or "Pending Approval"

**Lab 3.2: Handling Customer Acceptance**

1. Open the customer portal in a second tab (`khalid@example.sa` / `Demo@1234`)
2. As the customer, review the estimate received
3. Accept the estimate
4. Return to the advisor view and confirm the acceptance notification
5. Verify the job card status changes to "Approved -- Ready for Repair"

### 4.4 Quiz -- Module 3

**Q1.** What is the Service Advisor's SAR approval limit for estimates?

- A) 1,000 SAR
- B) 5,000 SAR
- C) 10,000 SAR
- D) 50,000 SAR

**Correct Answer**: B -- The advisor can approve estimates up to 5,000 SAR.

**Q2.** What happens to an estimate of 8,000 SAR submitted by the advisor?

- A) It is auto-approved
- B) It escalates to the Branch Manager for approval
- C) It is rejected
- D) It requires the customer's approval only

**Correct Answer**: B -- Estimates exceeding 5,000 SAR escalate to the manager (50K ceiling).

**Q3.** How are monetary values stored in the system?

- A) As floating-point SAR values
- B) As integer halalas
- C) As string representations
- D) As rounded SAR integers

**Correct Answer**: B -- Money is stored as integer halalas for precision.

---

## 5. Module 4 -- Job Management (90 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Job card lifecycle tracking          | 20 min   |
| 2 | Technician assignment and workload   | 20 min   |
| 3 | Parts requests and status tracking   | 20 min   |
| 4 | Customer updates and notifications   | 15 min   |
| 5 | Handling delays and escalations      | 15 min   |

### 5.2 Key Concepts

- **Lifecycle Tracking**: Advisor monitors jobs through Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
- **Assignment**: Advisor assigns/reassigns technicians based on skill and availability
- **Parts Coordination**: Advisor requests parts from storekeeper; tracks availability and ETA
- **Notifications**: Automated and manual notifications to customers at each status change
- **Escalation**: Advisor escalates delayed or problematic jobs to the manager

### 5.3 Hands-On Lab

**Lab 4.1: Tracking Jobs Through the Lifecycle**

1. Open the Workshop > Job Board
2. Filter by status to see all "In Repair" jobs
3. Click on a job and review the timeline of events
4. Check the parts request status -- confirm if parts are available or pending
5. Send a customer update notification about job progress
6. Identify a delayed job and escalate it to the manager with a note

### 5.4 Quiz -- Module 4

**Q1.** At which lifecycle stages can the advisor send customer notifications?

- A) Check-In only
- B) All stages
- C) Delivery only
- D) Estimate and Delivery only

**Correct Answer**: B -- The advisor can send notifications at all stages of the lifecycle.

**Q2.** Who does the advisor escalate a delayed job to?

- A) Technician
- B) QC Inspector
- C) Branch Manager
- D) Customer

**Correct Answer**: C -- Delayed or problematic jobs escalate to the Branch Manager.

---

## 6. Module 5 -- Appointments (30 minutes)

### 6.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Appointment scheduling               | 10 min   |
| 2 | Calendar management                  | 10 min   |
| 3 | Reminders and confirmations          | 10 min   |

### 6.2 Key Concepts

- **Scheduling**: Advisor creates appointments for new and returning customers
- **Calendar View**: Daily, weekly, and monthly views with bay availability
- **Reminders**: Automated SMS/email reminders 24 hours before the appointment
- **Walk-in vs. Appointment**: System tracks both; appointments receive priority scheduling

### 6.3 Hands-On Lab

**Lab 5.1: Scheduling an Appointment**

1. Navigate to Appointments > New Appointment
2. Search for an existing customer or create a new one
3. Select the vehicle, service type, and preferred date/time
4. Check bay availability on the calendar
5. Confirm the appointment and verify the confirmation notification is sent
6. View the appointment on the daily calendar

### 6.4 Quiz -- Module 5

**Q1.** When are automated appointment reminders sent?

- A) 1 hour before
- B) 24 hours before
- C) 48 hours before
- D) 1 week before

**Correct Answer**: B -- Automated reminders are sent 24 hours before the appointment.

---

## 7. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Customer Reception & Check-In   | 120 min  | Complete customer and vehicle onboarding|
| 2      | Inspection & Diagnostics        | 90 min   | Coordinating inspections with techs     |
| 3      | Estimates & Approvals           | 90 min   | 5K SAR limit with escalation path       |
| 4      | Job Management                  | 90 min   | Full lifecycle tracking and comms       |
| 5      | Appointments                    | 30 min   | Scheduling and calendar management      |

---

## 8. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Workshop Staff Guide](../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../user-documentation/workflows/job-lifecycle.md)
- [Estimate Approval Workflow](../user-documentation/workflows/estimate-approval.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 9. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
