# SALIS AUTO -- Data-Driven Decisions

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-010                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

SALIS AUTO provides comprehensive analytics capabilities that enable workshop owners, branch managers, and operational staff to make informed decisions based on real-time and historical data. This document covers dashboard KPI interpretation, report customization, alert threshold configuration, trend analysis techniques, and executive report generation.

Effective use of analytics transforms reactive workshop management into proactive, data-informed decision-making. Every module in SALIS AUTO generates data that feeds into the analytics engine, from job card creation through invoicing and customer feedback.

---

## 2. Dashboard KPI Interpretation

### 2.1 Revenue KPIs

| KPI                         | Definition                                              | Healthy Range         | Warning Threshold     |
|-----------------------------|----------------------------------------------------------|----------------------|----------------------|
| Daily Revenue               | Total invoiced amount for current day                    | Varies by workshop   | < 60% of daily target |
| Monthly Revenue             | Cumulative invoiced amount for current month             | On target trajectory | < 80% of monthly target at proportional date |
| Revenue per Bay per Day     | Total daily revenue / Number of active bays              | SAR 800-2,000        | < SAR 500            |
| Revenue per Technician      | Total monthly revenue / Number of active technicians     | SAR 15,000-40,000    | < SAR 10,000         |
| Parts Revenue Ratio         | Parts revenue / Total revenue                            | 35-55%               | < 25% or > 70%       |
| Labor Revenue Ratio         | Labor revenue / Total revenue                            | 40-60%               | < 30% or > 75%       |

### 2.2 Operational KPIs

| KPI                         | Definition                                              | Healthy Range         | Warning Threshold     |
|-----------------------------|----------------------------------------------------------|----------------------|----------------------|
| Jobs Completed (Daily)      | Number of job cards moved to Delivered status today       | Varies by capacity   | < 50% of capacity    |
| Average Ticket Value        | Total revenue / Number of completed jobs                  | SAR 400-1,500        | < SAR 200            |
| Average Job Duration        | Mean time from Check-In to Delivery                      | 2-8 hours            | > 24 hours           |
| Bay Utilization Rate        | Active bay hours / Available bay hours                    | 70-85%               | < 50% or > 95%       |
| First-Time Fix Rate         | Jobs completed without rework / Total jobs               | > 92%                | < 85%                |
| Estimate Conversion Rate    | Approved estimates / Total estimates issued               | > 75%                | < 60%                |

### 2.3 Customer KPIs

| KPI                         | Definition                                              | Healthy Range         | Warning Threshold     |
|-----------------------------|----------------------------------------------------------|----------------------|----------------------|
| Customer Satisfaction (CSAT)| Average rating from post-service surveys                 | 4.2-5.0 / 5.0       | < 3.5                |
| Net Promoter Score (NPS)    | Promoters (%) - Detractors (%)                           | > 40                 | < 20                 |
| Repeat Customer Rate        | Returning customers / Total customers (monthly)          | > 40%                | < 25%                |
| Customer Wait Time          | Average time from appointment to service start           | < 30 minutes         | > 60 minutes         |
| Complaint Rate              | Complaints / Total completed jobs                        | < 3%                 | > 5%                 |

### 2.4 Financial KPIs

| KPI                         | Definition                                              | Healthy Range         | Warning Threshold     |
|-----------------------------|----------------------------------------------------------|----------------------|----------------------|
| Gross Margin                | (Revenue - Direct Costs) / Revenue                       | 45-65%               | < 35%                |
| Parts Markup Achieved       | Actual markup vs standard markup                         | 90-110% of target    | < 80% of target      |
| Outstanding Receivables     | Unpaid invoices > 30 days                                | < 10% of monthly rev | > 20% of monthly rev |
| Collection Rate             | Payments received / Invoices issued (monthly)            | > 95%                | < 85%                |
| Inventory Turnover          | Cost of parts sold / Average inventory value             | 6-12x per year       | < 4x per year        |

---

## 3. Report Customization

### 3.1 Available Report Types

| Report Category     | Reports Available                                           | Access Level          |
|---------------------|------------------------------------------------------------|-----------------------|
| Revenue             | Daily summary, Monthly breakdown, Service type analysis    | Manager+              |
| Operations          | Job card status, Bay utilization, Technician productivity  | Supervisor+           |
| Inventory           | Stock levels, Reorder alerts, Consumption analysis         | Parts Manager+        |
| Customer            | Satisfaction trends, Retention analysis, Complaint log     | Manager+              |
| Financial           | P&L summary, AR aging, Cash flow                           | Owner/Finance         |
| Compliance          | ZATCA submission status, SOD audit log, QC pass rates      | Manager+              |
| HR/Workforce        | Attendance, Technician certifications, Saudization status  | Owner/HR              |

### 3.2 Filter Options

All reports support the following filter dimensions:

| Filter             | Options                                                    | Default               |
|--------------------|------------------------------------------------------------|-----------------------|
| Date Range         | Today, This Week, This Month, This Quarter, Custom Range   | This Month            |
| Branch             | All Branches, Individual Branch, Branch Group              | User's assigned branch |
| Service Type       | All Types, Specific service category                       | All Types             |
| Technician         | All Technicians, Individual, Team                          | All                   |
| Customer Segment   | All, Individual, Fleet, Insurance, Walk-in                 | All                   |
| Vehicle Category   | All, Sedan, SUV, Truck, Luxury, Commercial                | All                   |
| Payment Status     | All, Paid, Unpaid, Partial                                 | All                   |

### 3.3 Custom Report Builder

Advanced users can create custom reports by:

1. Selecting a base data source (Jobs, Customers, Inventory, Financial)
2. Choosing dimensions (fields to group by)
3. Selecting measures (fields to aggregate -- sum, count, average, min, max)
4. Applying filters from the standard filter set
5. Choosing visualization type (table, bar chart, line chart, pie chart)
6. Saving the report template for reuse
7. Scheduling automated delivery (daily, weekly, monthly) via email

---

## 4. KPI Threshold Configuration

### 4.1 Alert Configuration

SALIS AUTO allows managers to configure thresholds that trigger alerts when KPIs deviate from expected ranges.

| Configuration Element | Description                                              | Example                |
|-----------------------|----------------------------------------------------------|------------------------|
| KPI Selection         | Which metric to monitor                                  | Bay Utilization Rate   |
| Threshold Type        | Above, Below, or Outside Range                           | Below                  |
| Warning Level         | First-tier alert value                                   | 55%                    |
| Critical Level        | Second-tier alert value                                  | 40%                    |
| Evaluation Frequency  | How often the KPI is checked                             | Every 2 hours          |
| Notification Method   | In-app notification, SMS, Email                          | In-app + Email         |
| Recipients            | Who receives the alert                                   | Branch Manager         |
| Active Hours          | When alerts should be sent                               | 8:00 AM - 10:00 PM    |
| Cooldown Period       | Minimum time between repeated alerts for same KPI        | 4 hours                |

### 4.2 Recommended Alert Configuration

| KPI                        | Warning Threshold    | Critical Threshold   | Check Frequency |
|----------------------------|----------------------|----------------------|-----------------|
| Daily Revenue vs Target    | < 70% at midday      | < 50% at midday      | Every 2 hours   |
| Bay Utilization             | < 50%                | < 30%                | Hourly          |
| QC Failure Rate             | > 10%                | > 20%                | Daily           |
| Average Wait Time           | > 45 minutes         | > 90 minutes         | Every 30 min    |
| Inventory Stockout          | Any critical item    | Multiple items       | Real-time       |
| Outstanding Receivables     | > 15% of monthly rev | > 25% of monthly rev | Daily           |
| Customer Satisfaction       | < 4.0 (daily avg)    | < 3.5 (daily avg)    | Daily           |

### 4.3 Alert Escalation

Alerts follow an escalation path if not acknowledged:

1. **Level 1 (0-30 min):** Notification to assigned role (e.g., Supervisor)
2. **Level 2 (30-60 min):** Escalation to Branch Manager
3. **Level 3 (60+ min):** Escalation to Organization Owner/Operations Director

---

## 5. Trend Analysis Techniques

### 5.1 Weekly Comparison

Compare the current week's performance against:

- Previous week (week-over-week change)
- Same week last month (monthly pattern)
- Same week last year (annual pattern, seasonality)

**Use Case:** Identifying sudden drops in productivity, early detection of seasonal shifts.

### 5.2 Monthly Trend Analysis

| Analysis Type            | Method                                                | Insight Gained                       |
|--------------------------|-------------------------------------------------------|--------------------------------------|
| Month-over-Month (MoM)  | Compare each month to the previous month              | Short-term momentum                  |
| Year-over-Year (YoY)    | Compare each month to same month last year            | Seasonal patterns, growth rate       |
| Rolling Average (3-month)| Average of current and two prior months               | Smoothed trend, removes volatility   |
| Variance Analysis        | Actual vs Budget/Target                               | Performance against plan             |

### 5.3 Quarterly Business Review Metrics

Quarterly reviews should analyze:

1. **Revenue Trajectory:** Is the workshop on track for annual targets?
2. **Customer Base Growth:** Net new customers vs churn rate
3. **Operational Efficiency:** Average job duration trend, bay utilization trend
4. **Workforce Productivity:** Revenue per technician trend
5. **Quality Metrics:** First-time fix rate trend, customer satisfaction trend
6. **Financial Health:** Margin trends, receivables aging trend
7. **Inventory Performance:** Turnover trend, stockout frequency

### 5.4 Cohort Analysis

Track customer cohorts over time:

- **Acquisition Cohort:** Group customers by their first visit month
- **Retention Curve:** Percentage returning at 30, 60, 90, 180, 365 days
- **Lifetime Value:** Average total spend per customer over their relationship

### 5.5 Comparative Analysis

| Comparison Type         | What to Compare                                      | Purpose                              |
|-------------------------|------------------------------------------------------|--------------------------------------|
| Branch vs Branch        | Same KPIs across different branches                  | Identify best practices              |
| Technician vs Technician| Productivity, quality, customer ratings              | Performance management               |
| Service Type Profitability | Margin by service category                        | Service mix optimization             |
| Time Period vs Period   | Same metrics across different time periods           | Trend identification                 |

---

## 6. Executive Report Generation

### 6.1 Monthly Executive Summary Template

The monthly executive summary contains:

| Section                    | Content                                                 | Data Source               |
|----------------------------|---------------------------------------------------------|---------------------------|
| Executive Overview         | 3-5 sentence performance summary                        | Auto-generated            |
| Revenue Summary            | Total, target, variance, MoM and YoY change            | Financial module          |
| Operational Highlights     | Jobs completed, bay utilization, efficiency metrics     | Operations module         |
| Customer Metrics           | CSAT, NPS, retention rate, complaint summary            | Customer module           |
| Quality Performance        | QC pass rate, rework rate, top failure categories       | QC module                 |
| Inventory Status           | Turnover, stockouts, dead stock value                   | Inventory module          |
| Financial Position         | Gross margin, AR status, cash flow summary              | Finance module            |
| Key Achievements           | Notable wins, milestones reached                        | Manual input              |
| Action Items               | Issues requiring attention, improvement plans           | Manual input              |

### 6.2 Report Export Formats

| Format   | Use Case                                               | Features                  |
|----------|--------------------------------------------------------|---------------------------|
| PDF      | Formal distribution, board presentations               | Branded header/footer     |
| Excel    | Further analysis, data manipulation                    | Pivot-ready data tables   |
| CSV      | Data integration with external tools                   | Raw data export           |
| In-App   | Interactive exploration, drill-down                    | Full filter capability    |

### 6.3 Scheduled Report Delivery

Configure automated report delivery:

1. Select report template or custom report
2. Set schedule (daily at 8 AM, weekly on Sunday, monthly on 1st)
3. Choose format (PDF recommended for executives, Excel for analysts)
4. Add recipients (email addresses)
5. Set branch scope (all branches or specific)
6. Reports are generated and delivered in both EN and AR based on recipient preference

### 6.4 Presentation-Ready Dashboards

SALIS AUTO provides read-only dashboard views optimized for display on workshop monitors:

- **Reception Dashboard:** Today's appointments, current queue, bay availability
- **Workshop Floor Dashboard:** Active jobs by bay, technician assignments, time tracking
- **Management Dashboard:** Real-time revenue, utilization, customer satisfaction

---

## 7. Data Quality and Governance

### 7.1 Data Accuracy Responsibilities

| Role                | Data Quality Responsibility                              |
|---------------------|----------------------------------------------------------|
| Service Advisor     | Accurate customer and vehicle information at check-in    |
| Technician          | Accurate time logging and service documentation          |
| Parts Specialist    | Correct parts recording and inventory counts             |
| Cashier             | Accurate payment recording and reconciliation            |
| Branch Manager      | Data quality oversight and periodic audits               |

### 7.2 Common Data Quality Issues

| Issue                      | Impact on Analytics                    | Resolution                        |
|----------------------------|----------------------------------------|-----------------------------------|
| Missing vehicle mileage    | Inaccurate service interval tracking   | Mandatory field at check-in       |
| Incorrect service categorization | Skewed service mix analysis       | Standardized service catalog      |
| Delayed job card updates   | Inaccurate real-time dashboards        | Mobile app for real-time updates  |
| Missing customer contact   | Reduced retention analysis accuracy    | Customer profile completion alerts |

---

## 8. Document References

- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Dashboard navigation and basic reporting
- [Data Dictionary](../reference/data-dictionary.md) -- Complete field definitions for all analytics entities
- [Security Architecture](../../system/security/security-architecture.md) -- Data access controls for analytics
- [Data Protection](../../system/security/data-protection.md) -- Data handling policies for reporting

---

*End of Document -- SA-KB-LIB-010*
