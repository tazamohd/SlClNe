# SALIS AUTO -- Workshop Efficiency Best Practices

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-001                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document outlines best practices for maximizing workshop efficiency within the SALIS AUTO platform. It covers bay utilization, technician scheduling, bottleneck identification, and KPI targets calibrated for the Saudi Arabian automotive service market. Workshop managers and branch supervisors should use this guide alongside the operational workflows defined in [Job Lifecycle](../../user-documentation/workflows/job-lifecycle.md).

---

## 2. Bay Utilization Optimization

### 2.1 Bay Classification

Organize bays by service type to minimize changeover time and tool relocation:

| Bay Type           | Primary Use                  | Target Utilization | Avg. Job Duration |
|--------------------|------------------------------|--------------------|-------------------|
| General Service    | Oil change, filters, fluids  | 85%                | 45 min            |
| Mechanical Repair  | Engine, transmission, brakes | 75%                | 2-4 hours         |
| Electrical / Diag  | ECU, wiring, sensor work     | 70%                | 1-3 hours         |
| Body & Paint       | Dent repair, paint, polish   | 65%                | 4-8 hours         |
| Tire & Alignment   | Tire swap, balancing, align  | 80%                | 30-60 min         |
| AC Service         | AC recharge, compressor      | 75% (90% summer)   | 1-2 hours         |

### 2.2 Staggered Scheduling

Avoid bay congestion by staggering appointment start times in 15-minute increments rather than scheduling all jobs at the top of the hour. In SALIS AUTO, advisors should use the Appointment Calendar to distribute arrivals across the morning window (07:00-10:00) and afternoon window (14:00-16:00).

### 2.3 Buffer Slots

Reserve 10-15% of daily bay capacity for walk-in and emergency jobs. For a 10-bay workshop, this means keeping 1-2 bays flexible throughout the day. Mark these as "Float" in the Bay Management screen.

### 2.4 Overnight Hold Policy

Jobs awaiting parts should be moved to a designated holding area rather than occupying an active bay. The system tracks hold status via the "Awaiting Parts" stage, which should trigger a bay release notification to the workshop controller.

---

## 3. Technician Scheduling Strategies

### 3.1 Skill-Based Assignment

SALIS AUTO supports technician skill tagging. Assign jobs based on skill match to reduce rework:

| Skill Level   | Job Complexity          | Supervision Required |
|---------------|------------------------|----------------------|
| Junior (1-2y) | Oil changes, tire swap | Direct oversight     |
| Mid (3-5y)    | Brakes, suspension     | Periodic check-in    |
| Senior (5+y)  | Engine, transmission   | Self-directed        |
| Master        | Diagnostics, ECU, hybrid| Autonomous          |

### 3.2 Pair Programming Model

For complex repairs exceeding 4 hours estimated labor, assign a primary and secondary technician. The primary leads the repair; the secondary handles parts retrieval, tool setup, and documentation. This reduces total cycle time by 25-30% compared to single-tech assignment.

### 3.3 Shift Overlap

Schedule a 30-minute overlap between morning and afternoon shifts. Use this window for handoff briefings on in-progress jobs. The job card notes in SALIS AUTO should be updated before shift end to ensure continuity.

### 3.4 Daily Stand-Up

Conduct a 10-minute morning huddle to review the day's job board. The Workshop Controller screen provides a real-time view of all scheduled, in-progress, and pending jobs. Prioritize jobs by customer promise time.

---

## 4. Stage Bottleneck Identification

### 4.1 Workshop Lifecycle Stages

The standard flow is: Check-In, Inspection, Estimate, Repair, QC, Delivery. Each stage has target durations:

| Stage       | Target Duration | Warning Threshold | Critical Threshold |
|-------------|----------------|-------------------|--------------------|
| Check-In    | 15 min         | 30 min            | 60 min             |
| Inspection  | 30 min         | 60 min            | 120 min            |
| Estimate    | 45 min         | 90 min            | 180 min            |
| Repair      | Per estimate   | +25% over est.    | +50% over est.     |
| QC          | 20 min         | 40 min            | 60 min             |
| Delivery    | 15 min         | 30 min            | 60 min             |

### 4.2 Common Bottlenecks and Remediation

**Estimate Stage Delays**: Often caused by waiting for customer approval. Implement SMS/WhatsApp notification via the system to push estimates for digital approval. Target: customer response within 2 hours.

**Parts Procurement Delays**: If more than 20% of jobs are stalled at "Awaiting Parts," review procurement lead times and safety stock levels. See [Parts Inventory Optimization](./parts-inventory-optimization.md) for detailed strategies.

**QC Rejection Loop**: Track QC first-pass rate. If below 85%, investigate root causes by technician and repair type. Common issues include incomplete torque verification and missing fluid level checks.

### 4.3 Bottleneck Dashboard

Use the Workshop Analytics screen to monitor stage dwell times. Set up alerts for jobs exceeding critical thresholds. The system color-codes jobs: green (on-track), amber (warning), red (critical).

---

## 5. Parallel Repair Strategies

### 5.1 Job Splitting

For vehicles requiring multiple service types (e.g., brake repair + AC service + oil change), split into parallel sub-jobs assigned to different bays and technicians. SALIS AUTO supports sub-job creation within a parent job card.

### 5.2 Parts Pre-Staging

Once the estimate is approved, the parts team should pre-pick and stage all required parts at the assigned bay before the technician begins work. This eliminates mid-repair parts runs, saving 15-20 minutes per job.

### 5.3 Inspection-While-You-Wait

For quick-service vehicles (oil change, tire rotation), conduct the multi-point inspection concurrently rather than sequentially. The mobile inspection checklist in SALIS AUTO supports parallel completion by different team members.

---

## 6. KPI Targets for Saudi Automotive Workshops

### 6.1 Core KPIs

| KPI                        | Target (Small)  | Target (Medium) | Target (Large)  |
|----------------------------|-----------------|-----------------|-----------------|
| Jobs completed per day     | 8-12            | 20-35           | 50-80           |
| Average cycle time (hours) | 4-6             | 3-5             | 3-4             |
| First-time fix rate        | 88%+            | 90%+            | 92%+            |
| Bay utilization rate       | 75%+            | 80%+            | 82%+            |
| Technician productivity    | 75%+            | 80%+            | 85%+            |
| Customer satisfaction (NPS)| 60+             | 65+             | 70+             |
| QC first-pass rate         | 85%+            | 88%+            | 90%+            |
| Parts availability rate    | 90%+            | 93%+            | 95%+            |

Workshop size: Small (1-4 bays), Medium (5-10 bays), Large (11+ bays).

### 6.2 Revenue KPIs

| KPI                          | Target          |
|------------------------------|-----------------|
| Revenue per bay per month    | SAR 25,000+     |
| Average invoice value        | SAR 800-1,500   |
| Labor revenue ratio          | 40-50%          |
| Parts margin                 | 25-35%          |
| Upsell conversion rate       | 15-25%          |

### 6.3 Measurement in SALIS AUTO

All KPIs are calculated from job card data. The Reports module provides daily, weekly, and monthly dashboards. Branch managers can compare performance against organizational averages. See [Financial Reporting Guide](./financial-reporting-guide.md) for revenue KPI interpretation.

---

## 7. Seasonal Demand Patterns

### 7.1 Summer AC Surge (May -- September)

Ambient temperatures regularly exceed 45C across Saudi Arabia. AC-related service requests increase by 60-80% during this period.

**Preparation Strategies:**
- Pre-order AC refrigerant (R134a / R1234yf) in bulk by March
- Train 2-3 additional technicians on AC diagnostics by April
- Dedicate 1-2 bays exclusively to AC service during peak months
- Offer proactive AC health check packages in April marketing campaigns
- Stock common AC components: compressors, condensers, evaporators, expansion valves

### 7.2 Ramadan Operating Hours

During Ramadan, workshops typically operate on reduced hours (e.g., 10:00-15:00 and 21:00-01:00). Adjust SALIS AUTO scheduling accordingly:

- Reduce daily appointment slots by 30-40%
- Shift heavy repair jobs to evening hours when technician energy is higher
- Pre-schedule preventive maintenance campaigns for the pre-Ramadan period
- Expect a surge in the final week before Eid al-Fitr as customers prepare vehicles for travel

### 7.3 Hajj Season Traffic (Dhul Hijjah)

Workshops in Makkah, Madinah, and along pilgrimage routes experience 40-60% demand increases:

- Prioritize quick-service jobs (oil, tires, brakes) for pilgrim vehicles
- Extend operating hours with split shifts
- Coordinate with parts suppliers for expedited delivery
- Cross-deploy technicians from lower-demand branches (see [Multi-Branch Management](./multi-branch-management.md))

### 7.4 Back-to-School (August -- September)

Family vehicle servicing peaks as schools resume. Focus on:

- Safety inspection packages (brakes, tires, lights, AC)
- Bundled service offers for family vehicles
- School bus fleet maintenance contracts

---

## 8. Continuous Improvement

### 8.1 Weekly Review Cadence

| Day       | Activity                                  | Responsible         |
|-----------|-------------------------------------------|---------------------|
| Sunday    | Weekly KPI review meeting                 | Branch Manager      |
| Monday    | Technician performance one-on-ones        | Workshop Controller |
| Tuesday   | Parts availability and procurement review | Parts Manager       |
| Wednesday | Customer feedback review                  | Service Advisor     |
| Thursday  | End-of-week planning for next week        | Branch Manager      |

### 8.2 Root Cause Analysis

For any KPI falling below target for two consecutive weeks, conduct a structured root cause analysis:

1. Define the problem with specific data (e.g., "Bay utilization dropped from 82% to 71%")
2. Gather data from SALIS AUTO reports for the affected period
3. Identify contributing factors using the 5-Whys technique
4. Implement corrective action with a defined owner and deadline
5. Monitor the KPI for the following two weeks to verify improvement

### 8.3 Role-Based Access

Efficiency dashboards are accessible based on role permissions defined in the [RBAC Matrix](../reference/rbac-matrix.md). Workshop controllers and branch managers have full analytics access. Service advisors see job-level metrics only.

---

## 9. Related Documents

- [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../../user-documentation/workflows/job-lifecycle.md)
- [Parts Inventory Optimization](./parts-inventory-optimization.md)
- [Multi-Branch Management](./multi-branch-management.md)
- [Technician Productivity Tips](./technician-productivity-tips.md)
- [Financial Reporting Guide](./financial-reporting-guide.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-001*
