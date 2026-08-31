# SALIS AUTO -- Workshop Operations Department Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-DPT-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Department Overview

The Workshop Operations department is the core revenue-generating unit of the SALIS AUTO platform. It manages the complete vehicle service lifecycle from customer check-in through final delivery, encompassing inspection, estimation, repair execution, quality control, and handover. Every workshop tenant on the platform relies on this department's processes to deliver consistent, measurable service outcomes.

The department operates across a 6-stage service lifecycle that maps directly to the platform's job card workflow engine. All 13 domains interact with Workshop Operations, but the tightest integrations are with Inventory (parts requisition), Finance (invoicing), and CRM (customer communication).

**Primary Responsibilities:**
- Vehicle reception and initial assessment
- Diagnostic inspection and service scoping
- Cost estimation and customer approval management
- Repair and maintenance execution
- Quality assurance and inspection gating
- Vehicle delivery and post-service follow-up

---

## 2. Team Structure

```
                    +-----------------------+
                    |   Workshop Manager    |
                    |   (1 per location)    |
                    +-----------+-----------+
                                |
          +---------------------+---------------------+
          |                     |                     |
+---------+---------+ +---------+---------+ +---------+---------+
|  Service Advisors | |    Technicians    | |   QC Inspectors   |
|   (2-4 per shop)  | |  (4-10 per shop)  | |  (1-2 per shop)   |
+-------------------+ +-------------------+ +-------------------+
| - Check-in        | | - Diagnostics     | | - Quality gate    |
| - Estimates       | | - Repair work     | | - Final inspection|
| - Customer comms  | | - Parts install   | | - Checklist audit |
| - Delivery coord  | | - Road testing    | | - Sign-off        |
+-------------------+ +-------------------+ +-------------------+
                                |
                    +-----------+-----------+
                    |    Support Staff      |
                    |   (1-3 per shop)      |
                    +-----------------------+
                    | - Bay cleaning        |
                    | - Parts runner        |
                    | - Vehicle movement    |
                    +-----------------------+
```

**RBAC Role Mapping (from 14 platform roles):**

| Platform Role       | Workshop Function            | Module Access                    |
|---------------------|------------------------------|----------------------------------|
| Workshop Manager    | Department head              | Full workshop module + reports    |
| Service Advisor     | Customer-facing coordinator  | Job cards, estimates, scheduling |
| Technician          | Repair execution             | Job cards (assigned), time logs  |
| QC Inspector        | Quality assurance gate       | QC checklists, approval/reject  |
| Parts Coordinator   | Inventory liaison            | Parts requisition, stock check   |

---

## 3. Workshop Service Lifecycle

The 6-stage service lifecycle is the backbone of workshop operations. Each stage has defined entry criteria, responsible roles, system states, and exit criteria.

### 3.1 Lifecycle Flow

```
[1. CHECK-IN] → [2. INSPECTION] → [3. ESTIMATE] → [4. REPAIR] → [5. QC] → [6. DELIVERY]
     ↓               ↓                ↓               ↓             ↓            ↓
  Job Card        Diagnostic       Quote Sent      Work Order     QC Pass     Invoice &
  Created         Report           to Customer     Executed       or Fail     Handover
```

### 3.2 Stage Details

| Stage       | Owner            | System State         | SLA Target  | Exit Criteria                      |
|-------------|------------------|----------------------|-------------|------------------------------------|
| Check-In    | Service Advisor  | `CHECKED_IN`         | < 15 min    | Vehicle logged, keys tagged        |
| Inspection  | Technician       | `UNDER_INSPECTION`   | < 30 min    | Diagnostic report filed            |
| Estimate    | Service Advisor  | `ESTIMATE_PENDING`   | < 2 hours   | Customer approval received         |
| Repair      | Technician       | `IN_PROGRESS`        | Per SLA*    | All line items completed           |
| QC          | QC Inspector     | `QC_REVIEW`          | < 20 min    | QC checklist passed                |
| Delivery    | Service Advisor  | `READY_FOR_DELIVERY` | < 15 min    | Payment received, vehicle released |

*Repair SLA varies by service type: Oil change 1h, Brake service 2h, Engine diagnostics 4h, Major repair 1-5 days.

---

## 4. Daily Workflow

### 4.1 Morning Standup (7:30 AM)

**Participants:** Workshop Manager, all Service Advisors, lead Technicians, QC Inspectors

**Agenda (15 minutes max):**
1. Review overnight/carry-over jobs (jobs not completed previous day)
2. Review today's appointments and walk-in capacity
3. Bay allocation for scheduled jobs
4. Parts availability confirmation for scheduled repairs
5. Safety moment (rotating daily topic)
6. Special instructions (VIP customers, warranty jobs, fleet accounts)

### 4.2 Job Card Assignment

| Priority | Criteria                            | Assignment Rule                      |
|----------|-------------------------------------|--------------------------------------|
| P1       | Safety-critical, stranded vehicle   | Assign immediately, override bay     |
| P2       | Appointment scheduled               | Assign to reserved bay per schedule  |
| P3       | Walk-in, standard service           | FIFO queue, next available bay       |
| P4       | Deferred/non-urgent items           | Batch for low-demand periods         |

### 4.3 Bay Allocation

Bays are allocated through the platform's scheduling module. The Workshop Manager performs allocation during morning standup, with real-time adjustments throughout the day.

### 4.4 Parts Requisition

1. Technician submits parts request via job card
2. Parts Coordinator checks stock availability
3. If in stock: issue from warehouse, log against job card
4. If out of stock: create purchase order, notify Service Advisor of delay
5. Service Advisor updates customer on revised timeline

### 4.5 End-of-Day Reconciliation (5:00 PM)

- Review all open job cards: update statuses, log time entries
- Confirm next-day appointments and bay pre-allocation
- Submit daily production report to Workshop Manager
- Secure all vehicles, lock bays, activate alarm system
- Workshop Manager reviews daily KPI dashboard

---

## 5. Bay Management

### 5.1 Bay Types and Configuration

| Bay Type             | Count (per location) | Equipment                        | Service Types                   |
|----------------------|----------------------|----------------------------------|---------------------------------|
| General Service      | 4-6                  | 2-post lift, basic tools         | Oil change, brakes, filters     |
| Specialized Repair   | 2-3                  | 4-post lift, diagnostic station  | Engine, transmission, electrical|
| Body & Paint         | 1-2                  | Spray booth, dent tools          | Collision repair, refinishing   |
| EV Service           | 1                    | HV-rated lift, insulated tools   | EV battery, charging systems    |
| Quick Service        | 1-2                  | Express pit/lift                 | Tire swap, battery, wipers      |

### 5.2 Bay Utilization KPI

**Target: 85% utilization during operating hours (8 AM - 6 PM)**

```
Bay Utilization % = (Total Productive Bay Hours / Total Available Bay Hours) x 100

Example (per bay per day):
  Available hours: 10h (8 AM - 6 PM)
  Productive hours: 8.5h
  Utilization: 85%
```

| Utilization Range | Status   | Action Required                              |
|-------------------|----------|----------------------------------------------|
| > 90%             | Overload | Consider expansion, manage walk-in limits    |
| 80-90%            | Optimal  | Maintain current scheduling                  |
| 60-80%            | Below    | Increase marketing, accept more walk-ins     |
| < 60%             | Critical | Review staffing, run promotions              |

---

## 6. SLA Targets

### 6.1 Stage-Level SLAs

| Stage          | SLA Target     | Measurement Start         | Measurement End              |
|----------------|----------------|---------------------------|------------------------------|
| Check-In       | < 15 minutes   | Customer arrival (ticket)  | Job card created             |
| Inspection     | < 30 minutes   | Bay assignment             | Diagnostic report submitted  |
| Estimate       | < 2 hours      | Inspection complete         | Customer approval received   |
| Repair (minor) | < 2 hours      | Parts issued               | Work marked complete         |
| Repair (major) | < 8 hours      | Parts issued               | Work marked complete         |
| QC             | < 20 minutes   | Repair complete             | QC checklist signed off      |
| Delivery       | < 15 minutes   | Payment confirmed           | Vehicle released             |

### 6.2 Service Type SLAs

| Service Type           | Target Duration | Max Duration | Price Range (SAR)   |
|------------------------|-----------------|--------------|---------------------|
| Oil & Filter Change    | 45 min          | 1.5 hours    | 150 - 350           |
| Brake Pad Replacement  | 1.5 hours       | 3 hours      | 300 - 800           |
| Full Diagnostic Scan   | 1 hour          | 2 hours      | 200 - 500           |
| AC Service & Recharge  | 1 hour          | 2 hours      | 250 - 600           |
| Transmission Service   | 3 hours         | 6 hours      | 800 - 3,000         |
| Engine Overhaul        | 2-5 days        | 7 days       | 5,000 - 25,000      |
| Body & Paint (panel)   | 1-3 days        | 5 days       | 1,500 - 8,000       |

All prices are exclusive of 15% VAT. VAT is applied at invoicing per ZATCA Phase 2 requirements.

---

## 7. Segregation of Duties (SOD) Enforcement

### 7.1 Critical SOD Rule

**The technician who performs a repair CANNOT pass the QC inspection for that same job.**

This is enforced at the platform level through RBAC module restrictions:

| Action Pair               | Conflict Type | Enforcement         |
|---------------------------|---------------|---------------------|
| Perform Repair / Pass QC  | Mandatory SOD | System-blocked      |
| Create Estimate / Approve | Recommended   | Manager override    |
| Receive Parts / Issue     | Mandatory SOD | System-blocked      |
| Create Invoice / Approve  | Mandatory SOD | System-blocked      |

### 7.2 SOD Implementation

```
Job Card #1234:
  Repair performed by: Technician A (user_id: tech_045)
  QC assignment: System automatically excludes tech_045
  QC assigned to: QC Inspector B (user_id: qc_012)
  
  If only one QC inspector available and they performed the repair:
  → Escalate to Workshop Manager for QC override with documented reason
```

### 7.3 Minimum Staff for SOD Compliance

Each shift must have at least:
- 1 Service Advisor (check-in and delivery)
- 2 Technicians (repair rotation)
- 1 QC Inspector (independent quality gate)

---

## 8. Safety Protocols

### 8.1 PPE Requirements

| Area              | Required PPE                                        |
|-------------------|-----------------------------------------------------|
| General workshop  | Safety shoes, high-vis vest, safety glasses          |
| Under-vehicle     | Hard hat, safety glasses, gloves                     |
| Body & paint      | Respirator, chemical gloves, full coveralls          |
| EV service        | HV-rated gloves (Class 0+), face shield, insulated tools |
| Welding           | Welding helmet, leather gloves, fire-resistant apron |

### 8.2 Hazardous Materials Handling

- Used oil: collect in designated drums, dispose via licensed contractor quarterly
- Brake fluid: separate containment, never mix with oil
- Refrigerant: recover using certified equipment, log quantities per GAMEP regulations
- Batteries: store upright on acid-resistant pallets, recycle through authorized channels

### 8.3 Fire Safety

- Fire extinguisher locations: every 15 meters, inspected monthly
- Spray booth: automatic suppression system, daily function check
- Evacuation plan: posted at all exits, drill conducted quarterly
- No smoking within 50 meters of fuel/chemical storage

### 8.4 Equipment Maintenance

All workshop equipment follows a preventive maintenance schedule logged in the platform:

| Equipment            | Inspection Frequency | Calibration Frequency | Responsible       |
|----------------------|----------------------|-----------------------|-------------------|
| Vehicle lifts        | Weekly               | Annual                | External vendor   |
| Diagnostic scanners  | Monthly              | Per manufacturer      | IT / vendor       |
| Alignment machine    | Monthly              | Quarterly             | External vendor   |
| Tire changer/balance | Weekly               | Semi-annual           | Workshop staff    |
| Spray booth          | Daily                | Annual                | External vendor   |
| Air compressor       | Weekly               | Annual                | Workshop staff    |

---

## 9. Key Performance Indicators

### 9.1 KPI Dashboard

| KPI                        | Target       | Measurement   | Frequency | Owner             |
|----------------------------|-------------|---------------|-----------|-------------------|
| Jobs Completed per Day     | 15-25       | Count         | Daily     | Workshop Manager  |
| Average Repair Time        | Per SLA     | Hours         | Daily     | Workshop Manager  |
| First-Time Fix Rate        | > 90%       | Percentage    | Weekly    | QC Inspector      |
| Customer Satisfaction      | > 4.5 / 5   | Rating        | Per job   | Service Advisor   |
| Bay Utilization            | > 85%       | Percentage    | Daily     | Workshop Manager  |
| SLA Compliance Rate        | > 95%       | Percentage    | Weekly    | Workshop Manager  |
| Comeback Rate              | < 5%        | Percentage    | Monthly   | QC Inspector      |
| Parts Requisition Time     | < 30 min    | Minutes       | Daily     | Parts Coordinator |
| Revenue per Bay per Day    | > SAR 2,500 | SAR           | Daily     | Workshop Manager  |
| Technician Productivity    | > 80%       | Percentage    | Weekly    | Workshop Manager  |

### 9.2 KPI Calculation Formulas

```
First-Time Fix Rate = (Jobs completed without comeback / Total jobs completed) x 100
Bay Utilization     = (Productive bay hours / Available bay hours) x 100
Technician Productivity = (Billed hours / Available hours) x 100
Comeback Rate       = (Jobs returned within 30 days / Total jobs) x 100
```

---

## 10. Equipment and Tools

### 10.1 Standard Bay Equipment

| Item                      | Quantity per Bay | Replacement Cycle |
|---------------------------|------------------|-------------------|
| 2-post hydraulic lift     | 1                | 10 years          |
| OBD-II diagnostic scanner | 1 per 2 bays     | 3 years           |
| Torque wrench set         | 1                | 5 years           |
| Multimeter                | 1                | 3 years           |
| Pneumatic tool set        | 1                | 5 years           |
| Creeper and stool         | 1 each           | 2 years           |
| Oil drain/collection      | 1                | 5 years           |

### 10.2 Specialized Equipment

| Item                      | Location           | Calibration     |
|---------------------------|--------------------|-----------------|
| 4-wheel alignment machine | Specialized bay    | Quarterly       |
| Tire changer              | Quick service bay  | Semi-annual     |
| Wheel balancer            | Quick service bay  | Semi-annual     |
| AC recovery/recharge unit | General bay        | Annual          |
| Brake lathe               | Specialized bay    | Semi-annual     |
| Spray booth               | Body & paint bay   | Annual          |
| HV battery test rig       | EV bay             | Per manufacturer|

### 10.3 Calibration Schedule

All calibration records are maintained in the platform's equipment management module. Calibration certificates are stored digitally and linked to the corresponding equipment asset record.

---

## 11. Cross-References

| Document                                                                                   | Relevance                        |
|--------------------------------------------------------------------------------------------|----------------------------------|
| [Job Lifecycle](../knowledge-base/job-lifecycle.md)                                        | Detailed job card state machine  |
| [Workshop Efficiency Best Practices](../knowledge-base/workshop-efficiency-best-practices.md) | Optimization guidelines       |
| [Quality Control Standards](../knowledge-base/quality-control-standards.md)                | QC checklist specifications      |
| [Inventory Management](../management/inventory-management-plan.md)                         | Parts requisition procedures     |
| [RBAC Matrix](../MASTER_RBAC_MATRIX.md)                                                   | Role-permission definitions      |
| [Business Rules](../MASTER_BUSINESS_RULES.md)                                             | SOD and workflow rules           |

---

## 12. Revision History

| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial department plan    |
