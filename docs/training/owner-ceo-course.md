# SALIS AUTO -- Owner/CEO Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Owner/CEO                                 |
| Demo Account     | Abdullah Al-Salis (owner@salisauto.sa)    |
| Password         | Demo@1234                                 |
| Approval Scope   | All                                       |
| SAR Limit        | Unlimited                                 |
| Duration         | 4 hours (3 modules)                       |
| Track            | Executive (P0 -- go-live)                 |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led                            |

### 1.1 Learning Objectives

Upon completing this course, the Owner/CEO will be able to:

1. Navigate the executive dashboard and interpret real-time KPIs
2. Configure and act on financial approvals with no SAR ceiling
3. Generate and analyze strategic reports across all branches
4. Understand the full workshop lifecycle at a supervisory level
5. Manage top-level user permissions and organizational settings

---

## 2. Module 1 -- Dashboard & KPIs (90 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Executive dashboard layout           | 15 min   |
| 2 | Real-time KPI widgets                | 20 min   |
| 3 | Branch performance comparison        | 20 min   |
| 4 | Revenue & expense trend analysis     | 20 min   |
| 5 | Customizing dashboard views          | 15 min   |

### 2.2 Key Concepts

- **Dashboard Modules**: The owner role has access to all 28 RBAC modules (dashboard, jobcards, appointments, estimates, checkin, inspection, qc, delivery, customers, vehicles, feedback, invoices, payments, accounting, leads, opportunities, campaigns, admin, settings, auth, reports, analytics, parts, suppliers, hr, staff, fleet, ai)
- **KPI Categories**: Revenue, job throughput, customer satisfaction, technician utilization, parts turnover
- **Branch Comparison**: Side-by-side metrics across all branches with drill-down capability
- **Currency Display**: All monetary values stored as integer halalas, displayed as SAR with two decimal places
- **Bilingual Support**: Dashboard supports EN/AR toggle with full RTL layout

### 2.3 Hands-On Lab

**Lab 1.1: Navigating the Executive Dashboard**

1. Log in with `owner@salisauto.sa` / `Demo@1234`
2. Verify the dashboard loads with the full widget set
3. Switch language from English to Arabic -- confirm RTL layout renders correctly
4. Identify the following KPIs on the main dashboard:
   - Total revenue (current month)
   - Open job cards count
   - Average job completion time
   - Customer satisfaction score
5. Click on a revenue widget to drill down into branch-level detail
6. Use the date range picker to compare this month vs. last month
7. Export the dashboard view as PDF

**Lab 1.2: Branch Performance Comparison**

1. Navigate to Reports > Branch Comparison
2. Select two or more branches from the filter
3. Compare metrics: revenue, job count, average ticket value
4. Sort by highest revenue and note the ranking
5. Save the comparison as a custom report

### 2.4 Quiz -- Module 1

**Q1.** What is the default currency display format in SALIS AUTO?

- A) USD with two decimal places
- B) SAR with two decimal places (halalas stored as integers)
- C) SAR with no decimal places
- D) Riyal with three decimal places

**Correct Answer**: B -- Money is stored as integer halalas and displayed as SAR with two decimal places.

**Q2.** How many RBAC modules does the owner role have access to?

- A) 14
- B) 21
- C) 28
- D) 35

**Correct Answer**: C -- The owner role has access to all 28 RBAC modules.

**Q3.** Which of the following is NOT a standard KPI on the executive dashboard?

- A) Total revenue
- B) Customer satisfaction score
- C) Supplier credit rating
- D) Average job completion time

**Correct Answer**: C -- Supplier credit rating is not a standard dashboard KPI.

---

## 3. Module 2 -- Approvals & Financial Controls (90 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Approval workflow overview           | 15 min   |
| 2 | SAR ceiling and approval hierarchy   | 20 min   |
| 3 | Segregation of Duties (SOD) rules    | 20 min   |
| 4 | ZATCA compliance essentials          | 20 min   |
| 5 | Audit trail and approval history     | 15 min   |

### 3.2 Key Concepts

- **Unlimited Approval**: The owner role has no SAR ceiling, enabling approval of any financial transaction
- **Approval Hierarchy**: Customer -> Advisor (5K) -> Manager (50K) -> Owner (unlimited)
- **SOD Pairs**: Five critical segregation rules enforced by the platform:
  1. Raise PO / Approve PO
  2. Create Supplier / Approve Supplier Payment
  3. Post Journal / Approve Journal
  4. Perform Repair / Pass QC
  5. Issue Stock / Adjust Stock Count
- **ZATCA Phase 2**: VAT at 15%, QR codes on invoices, hash chain integrity, 7-year document retention
- **Audit Trail**: Every approval is logged with user ID, timestamp, amount, and action

### 3.3 Hands-On Lab

**Lab 2.1: Approving a High-Value Estimate**

1. Log in as owner (`owner@salisauto.sa` / `Demo@1234`)
2. Navigate to Approvals > Pending
3. Locate an estimate exceeding 50,000 SAR (beyond manager ceiling)
4. Review the estimate line items and attached inspection report
5. Approve the estimate -- note the audit trail entry created
6. Verify the job card status updates to "Estimate Approved"

**Lab 2.2: Reviewing SOD Compliance**

1. Navigate to Admin > Security > SOD Report
2. Review the five SOD pairs and their enforcement status
3. Attempt to approve a PO that the owner account also raised -- observe the SOD block
4. Document the error message displayed
5. Reassign the PO to another user for approval

**Lab 2.3: ZATCA Invoice Verification**

1. Navigate to Finance > Invoices
2. Open a completed invoice
3. Verify the QR code is present and scannable
4. Confirm VAT is calculated at 15%
5. Check the hash chain reference in the invoice metadata

### 3.4 Quiz -- Module 2

**Q1.** What is the Owner/CEO SAR approval limit?

- A) 100,000 SAR
- B) 500,000 SAR
- C) 1,000,000 SAR
- D) Unlimited

**Correct Answer**: D -- The owner role has unlimited SAR approval authority.

**Q2.** Which SOD pair prevents the same user from both performing a repair and passing QC?

- A) Raise PO / Approve PO
- B) Perform Repair / Pass QC
- C) Post Journal / Approve Journal
- D) Issue Stock / Adjust Stock Count

**Correct Answer**: B -- The Perform Repair / Pass QC SOD pair ensures independent quality verification.

**Q3.** What VAT rate does ZATCA Phase 2 require?

- A) 5%
- B) 10%
- C) 15%
- D) 20%

**Correct Answer**: C -- ZATCA Phase 2 mandates 15% VAT.

**Q4.** How long must invoices be retained under ZATCA compliance?

- A) 3 years
- B) 5 years
- C) 7 years
- D) 10 years

**Correct Answer**: C -- ZATCA requires 7-year document retention.

---

## 4. Module 3 -- Reports & Strategic Analytics (60 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Report categories and navigation     | 10 min   |
| 2 | Financial reports                    | 15 min   |
| 3 | Operational reports                  | 15 min   |
| 4 | Custom report builder                | 10 min   |
| 5 | Scheduled reports and distribution   | 10 min   |

### 4.2 Key Concepts

- **Report Access**: Owner has `v` (view), `x` (export) permissions on all report and analytics modules
- **Financial Reports**: Profit & Loss, Balance Sheet, Cash Flow, Aging Reports, ZATCA Submissions
- **Operational Reports**: Job throughput, technician utilization, parts consumption, customer trends
- **Custom Reports**: Drag-and-drop report builder with filter, grouping, and charting options
- **Scheduled Reports**: Automated delivery via email (daily, weekly, monthly)

### 4.3 Hands-On Lab

**Lab 3.1: Generating a Monthly P&L Report**

1. Navigate to Reports > Financial > Profit & Loss
2. Set the date range to the current month
3. Select "All Branches" from the branch filter
4. Generate the report and review the summary
5. Drill down into expense categories
6. Export the report as PDF and Excel
7. Schedule the report for monthly auto-delivery to owner@salisauto.sa

**Lab 3.2: Building a Custom Analytics Report**

1. Navigate to Analytics > Custom Reports > New
2. Select data source: Job Cards
3. Add dimensions: Branch, Service Type, Month
4. Add measures: Revenue, Job Count, Avg Completion Time
5. Apply a filter: Current quarter only
6. Choose chart type: Bar chart with trend line
7. Save the report as "Q3 Performance Overview"

### 4.4 Quiz -- Module 3

**Q1.** Which permission action enables exporting reports to PDF or Excel?

- A) v (view)
- B) c (create)
- C) e (edit)
- D) x (export)

**Correct Answer**: D -- The `x` (export) permission action controls report export capability.

**Q2.** Which of the following is a standard financial report?

- A) Technician Utilization
- B) Parts Consumption
- C) Profit & Loss
- D) Customer Satisfaction Trend

**Correct Answer**: C -- Profit & Loss is a standard financial report; the others are operational reports.

**Q3.** How frequently can scheduled reports be distributed?

- A) Hourly only
- B) Daily, weekly, or monthly
- C) Weekly only
- D) On-demand only

**Correct Answer**: B -- Scheduled reports support daily, weekly, and monthly distribution.

---

## 5. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Dashboard & KPIs                | 90 min   | Real-time visibility across all branches|
| 2      | Approvals & Financial Controls  | 90 min   | Unlimited SAR ceiling with SOD controls |
| 3      | Reports & Strategic Analytics   | 60 min   | Data-driven decision making             |

### 5.1 Certification Path

Upon completing all three modules and passing the assessments with a minimum score of 70%, the Owner/CEO receives the SALIS AUTO Executive Certification (Bronze tier). See [Certification Framework](certification-framework.md) (SA-TRN-014) for tier details.

---

## 6. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Owner & Super Admin Guide](../user-documentation/guides/owner-superadmin-guide.md)
- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)

---

## 7. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
