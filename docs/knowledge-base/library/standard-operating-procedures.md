# SALIS AUTO -- Standard Operating Procedures

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-013                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document provides the master Standard Operating Procedures (SOP) reference for workshops using SALIS AUTO. SOPs ensure consistent operations across shifts, branches, and staff changes. Each procedure is designed to work with the platform's workflow engine and can be customized to match specific workshop requirements.

All SOPs are mandatory unless explicitly marked as optional. Compliance is tracked through the platform's audit logging and management dashboards. Deviations from SOPs must be documented with a justification and approved by the Branch Manager.

---

## 2. Daily Branch Opening Checklist

### 2.1 Pre-Opening Procedures (30 minutes before opening)

| Step | Task                                        | Responsible Role    | System Action                          |
|------|---------------------------------------------|---------------------|----------------------------------------|
| 1    | Arrive and unlock premises                  | Opening Manager     | None (physical)                        |
| 2    | Disarm security system                      | Opening Manager     | None (physical)                        |
| 3    | Power on all workshop systems               | Opening Manager     | None (physical)                        |
| 4    | Log into SALIS AUTO                         | Opening Manager     | System login recorded                  |
| 5    | Review overnight notifications              | Opening Manager     | Check notification center              |
| 6    | Review today's appointment calendar         | Service Advisor     | Dashboard > Today's Appointments       |
| 7    | Verify bay readiness                        | Workshop Supervisor | Bay status check (clean, equipped)     |
| 8    | Check parts pending for today's jobs        | Parts Specialist    | Inventory > Pending Parts Report       |
| 9    | Verify POS terminal operation               | Cashier             | Process test transaction               |
| 10   | Review yesterday's carryover jobs           | Workshop Supervisor | Dashboard > In-Progress Jobs           |
| 11   | Assign technicians to bays                  | Workshop Supervisor | Scheduling > Bay Assignment            |
| 12   | Brief morning team (5-minute standup)       | Opening Manager     | None (verbal)                          |
| 13   | Confirm branch status as "Open"             | Opening Manager     | Branch Settings > Status = Open        |

### 2.2 Bay Readiness Verification

Each service bay must be verified before the first job of the day:

| Check Item                        | Standard                                     | Fail Action                    |
|-----------------------------------|-----------------------------------------------|-------------------------------|
| Floor cleanliness                 | Clean, no oil spills, no tripping hazards    | Clean before first job         |
| Lift/hoist operation              | Tested up/down cycle, safety locks engaged    | Tag out, report maintenance    |
| Air compressor pressure           | Operating pressure within range               | Wait for pressurization       |
| Tool inventory                    | All assigned tools present and functional     | Report missing, substitute     |
| Lighting                          | All bay lights operational                    | Report and request replacement |
| Waste oil container               | Not full, drain accessible                    | Arrange disposal if full       |
| Fire extinguisher                 | Present, seal intact, in-date                 | Replace immediately            |
| PPE availability                  | Gloves, safety glasses, ear protection        | Restock from supplies          |

### 2.3 Appointment Review

The Service Advisor reviews today's appointments and prepares:

1. Print or display job cards for scheduled appointments
2. Confirm customer contact information is current
3. Pre-check parts availability for known service requirements
4. Identify VIP or fleet customers requiring special attention
5. Note any special instructions from previous visits
6. Estimate bay requirements and flag potential capacity issues

---

## 3. Shift Handover Procedures

### 3.1 Handover Timing

| Shift Configuration    | Handover Time      | Duration    | Overlap Required |
|------------------------|--------------------|-------------|------------------|
| Single Shift           | Not applicable     | N/A         | N/A              |
| Split Shift (Ramadan)  | Between sessions   | 15 minutes  | No overlap       |
| Dual Shift             | At shift change    | 30 minutes  | 30-minute overlap |
| Extended Hours         | At each rotation   | 20 minutes  | 15-minute overlap |

### 3.2 Handover Checklist

| Category                  | Items to Transfer                                         | Documentation Method         |
|---------------------------|-----------------------------------------------------------|------------------------------|
| Active Jobs               | Status of each in-progress job card                       | System: Job Card list filtered by "In Progress" |
| Customer Communications   | Pending customer callbacks, awaiting approvals            | System: Communication log + verbal handover |
| Parts Status              | Parts on order, expected delivery, parts received today   | System: Parts Pending report |
| Cash Reconciliation       | Current cash drawer balance, pending payments             | System: Cashier shift report |
| Bay Status                | Which bays are occupied, expected completion times        | System: Bay Dashboard        |
| Escalations               | Any issues requiring management attention                 | Verbal + System: Incident log |
| Walk-In Queue             | Customers waiting for service not yet checked in          | Verbal + Reception log       |
| Equipment Issues          | Any bay or equipment malfunctions                         | System: Maintenance request log |

### 3.3 Handover Documentation

The outgoing shift lead must complete the Shift Handover form in SALIS AUTO:

1. Navigate to Operations > Shift Management > Handover
2. Select the current shift period
3. Complete each section of the handover form
4. Add free-text notes for anything not covered by standard fields
5. Submit the form (creates timestamped record)
6. Incoming shift lead acknowledges receipt in the system

---

## 4. Emergency Procedures

### 4.1 System Outage

| Severity          | Description                                    | Response Protocol                        |
|-------------------|------------------------------------------------|------------------------------------------|
| Partial Outage    | Single module unavailable (e.g., invoicing)    | Use alternative module, log issues       |
| Major Outage      | Multiple modules unavailable                   | Switch to paper-based backup procedures  |
| Complete Outage   | Entire SALIS AUTO platform inaccessible        | Full paper-based operations              |

#### 4.1.1 Paper-Based Backup Procedures

When the system is unavailable, workshops must maintain operations using paper backup forms:

| Form                    | Purpose                                       | Location                       |
|-------------------------|-----------------------------------------------|--------------------------------|
| Paper Job Card (Form A) | Record customer, vehicle, and service details  | Reception desk drawer          |
| Parts Request (Form B)  | Request parts from inventory                   | Parts counter                  |
| Cash Receipt (Form C)   | Record cash payments                           | Cashier station                |
| Handwritten Invoice     | Issue invoice when system is down              | Reception desk drawer          |
| Vehicle Intake Log      | Track vehicles in the workshop                 | Workshop entrance              |

**Critical Rule:** All paper records must be entered into SALIS AUTO within 4 hours of system restoration. Paper forms must be retained for 30 days after data entry as a cross-reference.

### 4.2 Data Breach Response

| Step | Action                                          | Responsible          | Timeline         |
|------|------------------------------------------------|----------------------|------------------|
| 1    | Identify and confirm the breach                 | Any staff member     | Immediate        |
| 2    | Report to Branch Manager                        | Discoverer           | Within 15 min    |
| 3    | Contain: Isolate affected systems/accounts      | Branch Manager + IT  | Within 30 min    |
| 4    | Preserve evidence (screenshots, logs)           | IT / Branch Manager  | Within 1 hour    |
| 5    | Escalate to Organization Owner                  | Branch Manager       | Within 1 hour    |
| 6    | Engage incident response (IT/vendor)            | Organization Owner   | Within 2 hours   |
| 7    | Notify affected customers (if PII involved)     | Organization Owner   | Within 72 hours  |
| 8    | File regulatory notifications (PDPL, ZATCA)     | Organization Owner   | Per regulation   |
| 9    | Post-incident review and remediation            | All stakeholders     | Within 1 week    |

See [Security Architecture](../../system/security/security-architecture.md) and [Data Protection](../../system/security/data-protection.md) for technical security controls.

### 4.3 Physical Safety Emergency

| Emergency Type         | Immediate Action                              | System Action                  |
|------------------------|-----------------------------------------------|--------------------------------|
| Fire                   | Evacuate, call 998, use extinguisher if safe  | None (safety first)            |
| Medical Emergency      | Call 997 (Red Crescent), first aid            | Log incident after resolution  |
| Chemical Spill         | Evacuate area, ventilate, use spill kit       | Log incident after resolution  |
| Vehicle Incident       | Secure area, check for injuries, document     | Create incident report         |
| Power Outage           | Ensure vehicle lifts are safe (manual lower)  | Switch to paper backup         |
| Flooding               | Evacuate if necessary, protect equipment      | Log incident after resolution  |

### 4.4 Communication During Emergencies

| Audience                | Communication Channel                          | Responsible          |
|-------------------------|------------------------------------------------|----------------------|
| Workshop Staff          | Verbal announcement, WhatsApp group            | Branch Manager       |
| Customers in Workshop   | Personal notification, escort to safety        | Service Advisors     |
| Customers with Vehicles | Phone call or SMS via SALIS AUTO (if available)| Service Advisors     |
| Organization Management | Phone call, then email                         | Branch Manager       |
| Emergency Services      | Phone (997, 998, 999)                          | Nearest staff member |

---

## 5. End-of-Day Reconciliation

### 5.1 Invoice vs Payment Reconciliation

| Step | Task                                            | Responsible    | System Navigation               |
|------|-------------------------------------------------|----------------|----------------------------------|
| 1    | Run daily invoice report                        | Cashier        | Reports > Daily Invoices         |
| 2    | Run daily payment report                        | Cashier        | Reports > Daily Payments         |
| 3    | Compare invoice totals to payment totals        | Cashier        | Cross-reference reports          |
| 4    | Identify unpaid invoices                        | Cashier        | Filter: Payment Status = Unpaid  |
| 5    | Classify unpaid: Credit account vs outstanding  | Cashier        | Tag each unpaid invoice          |
| 6    | Reconcile payment methods                       | Cashier        | Cash + Card + Transfer = Total   |
| 7    | Document discrepancies                          | Cashier        | Reconciliation notes field       |
| 8    | Submit reconciliation for manager review        | Cashier        | Reconciliation > Submit          |
| 9    | Manager reviews and approves                    | Branch Manager | Reconciliation > Approve         |

### 5.2 Cash Drawer Reconciliation

| Item                        | Action                                          | Expected Outcome              |
|-----------------------------|-------------------------------------------------|-------------------------------|
| Opening Balance             | Record morning cash drawer count                | Matches previous day's closing |
| Cash Received               | Sum of all cash payments recorded in system     | System-generated total        |
| Cash Paid Out               | Any petty cash disbursements                    | Documented with receipts      |
| Expected Closing Balance    | Opening + Received - Paid Out                   | Calculated by system          |
| Actual Closing Balance      | Physical count of cash in drawer                | Manual count                  |
| Variance                    | Actual - Expected                               | Should be SAR 0.00           |
| Acceptable Variance         | +/- SAR 5.00                                    | Within tolerance              |
| Variance > SAR 5.00         | Requires investigation and documentation        | Manager notified              |

### 5.3 End-of-Day Vehicle Check

Before closing, verify:

1. All vehicles remaining overnight are logged in the system with overnight status
2. Customer notification sent for any vehicle not picked up as expected
3. Vehicles are locked and keys secured in the key safe
4. Key safe inventory matches vehicles on premises
5. Workshop bay doors are closed and locked
6. Security system is armed

---

## 6. Monthly Maintenance Tasks

### 6.1 System Maintenance

| Task                              | Frequency   | Responsible         | System Action                    |
|-----------------------------------|-------------|---------------------|----------------------------------|
| User account audit                | Monthly     | Branch Manager      | Admin > User Management review   |
| Deactivate departed employees     | Monthly     | Branch Manager      | Admin > Deactivate User          |
| Password expiry compliance check  | Monthly     | Branch Manager      | Admin > Security Report          |
| Role permission review            | Monthly     | Branch Manager      | Admin > Role Permissions audit   |
| Service catalog price review      | Monthly     | Service Manager     | Catalog > Price Review           |
| Parts reorder point adjustment    | Monthly     | Parts Manager       | Inventory > Reorder Settings     |
| Template review and update        | Monthly     | Service Manager     | Templates > Review all active    |
| Backup verification               | Monthly     | IT/Organization     | System > Backup Status           |

### 6.2 Operational Maintenance

| Task                              | Frequency   | Responsible         | Documentation                    |
|-----------------------------------|-------------|---------------------|----------------------------------|
| Equipment calibration check       | Monthly     | Workshop Supervisor | Calibration log                  |
| Lift/hoist inspection             | Monthly     | Workshop Supervisor | Maintenance log                  |
| Tool inventory audit              | Monthly     | Workshop Supervisor | Tool inventory sheet             |
| Safety equipment check            | Monthly     | Branch Manager      | Safety checklist                 |
| First aid kit replenishment       | Monthly     | Branch Manager      | First aid log                    |
| Waste disposal scheduling         | Monthly     | Workshop Supervisor | Disposal contractor schedule     |
| Customer feedback review          | Monthly     | Branch Manager      | CSAT report in system            |
| Staff performance review data     | Monthly     | Branch Manager      | Performance dashboard            |

---

## 7. Quarterly Review Procedures

### 7.1 Quarterly Business Review (QBR)

| Review Area                | Key Metrics to Review                          | Action Items                     |
|----------------------------|-------------------------------------------------|----------------------------------|
| Financial Performance      | Revenue vs target, gross margin, AR aging       | Adjust pricing, collection push  |
| Operational Efficiency     | Bay utilization, avg job time, throughput        | Workflow optimization            |
| Customer Satisfaction      | CSAT trend, NPS, complaint analysis             | Service improvement plans        |
| Quality Control            | FPY rate, rework rate, common failures          | Training, process changes        |
| Inventory Management       | Turnover ratio, stockouts, dead stock           | Reorder point adjustment         |
| Workforce                  | Productivity, certifications, Saudization       | Training plans, hiring           |
| Compliance                 | ZATCA submission rate, SOD violations           | Corrective actions               |
| Technology                 | System uptime, feature adoption, user feedback  | Feature requests, training       |

### 7.2 Quarterly Compliance Audit

| Audit Area                    | Check Items                                    | Documentation Required           |
|-------------------------------|------------------------------------------------|----------------------------------|
| ZATCA e-Invoicing             | All invoices submitted, no rejections          | ZATCA submission report          |
| SOD Enforcement               | No unapproved SOD overrides                   | SOD audit log                    |
| Data Protection               | No unauthorized data exports or access         | Access audit log                 |
| Financial Controls            | All approvals within authority limits          | Approval chain report            |
| Customer Data                 | PII handling compliance                        | Data access report               |
| Inventory Accuracy            | Physical count vs system count                 | Quarterly count results          |

### 7.3 Quarterly Staff Assessment

| Assessment Area               | Method                                         | Outcome                          |
|-------------------------------|------------------------------------------------|----------------------------------|
| Technical Skills              | Practical assessment + system performance data | Training plan update             |
| System Proficiency            | Feature utilization report                     | Additional training if needed    |
| Customer Service              | CSAT by technician/advisor                     | Recognition or coaching          |
| Safety Compliance             | Incident report review                         | Safety training reinforcement    |
| Attendance and Punctuality    | System login data + HR records                 | HR action if needed              |

---

## 8. Special Period SOPs

### 8.1 Ramadan Operating Procedures

| Procedure                       | Details                                        |
|---------------------------------|------------------------------------------------|
| Operating Hours                 | 10:00 AM - 3:00 PM and 9:00 PM - 12:00 AM (adjust in system) |
| Appointment Scheduling          | Reduce available slots by 30%                  |
| Staff Scheduling                | Rotate morning/evening shifts, accommodate prayers |
| Customer Communication          | Update automated messages with Ramadan hours   |
| Pre-Eid Surge                   | Increase staffing in final 5 days, extend hours if needed |
| Iftar Break                     | 30-minute break at Iftar time, no appointments overlap |

### 8.2 Hajj Season (Makkah/Madinah Branches)

| Procedure                       | Details                                        |
|---------------------------------|------------------------------------------------|
| Extended Hours                  | Consider 24-hour or extended hour operation     |
| Express Services                | Prioritize quick-turnaround services           |
| Temporary Staff                 | Onboard temporary staff with limited system access |
| Multi-Language                  | Activate multi-language templates               |
| Cash Handling                   | Increase cash drawer limits                     |
| Inventory                       | Pre-stock high-demand items (AC, tires, oil)    |

---

## 9. Document References

- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Initial system setup and navigation
- [Security Architecture](../../system/security/security-architecture.md) -- Security controls referenced in emergency procedures
- [Data Protection](../../system/security/data-protection.md) -- Data handling procedures during incidents
- [Data Dictionary](../reference/data-dictionary.md) -- Field definitions for SOP-related system entries
- [Compliance Requirements](../../requirements/non-functional/compliance.md) -- Regulatory compliance procedures

---

*End of Document -- SA-KB-LIB-013*
