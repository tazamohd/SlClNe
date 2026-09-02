# SALIS AUTO -- ROI Calculator

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MKT-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document provides a Return on Investment (ROI) and Total Cost of Ownership (TCO) model for SALIS AUTO, denominated in Saudi Riyals (SAR). The model enables sales teams to quantify the financial impact of adopting SALIS AUTO for prospects across three customer scenarios: small, medium, and enterprise operations.

All monetary values are presented in SAR. Internal calculations use halala precision (integer halalas) consistent with the platform's financial architecture.

---

## 2. ROI Model Framework

### 2.1 Value Drivers

The ROI model quantifies savings across five categories:

| #  | Value Driver               | Metric                         | Source Data                     |
|----|----------------------------|--------------------------------|---------------------------------|
| V1 | Operational Efficiency     | Throughput increase             | +25% job completion rate        |
| V2 | Administrative Savings     | Invoice processing reduction    | 15 min → 2 min per invoice     |
| V3 | Approval Acceleration      | Estimate cycle reduction        | 48 hours → 4 hours             |
| V4 | Procurement Optimization   | Procurement cycle reduction     | -40% cycle time                 |
| V5 | Fleet Utilization          | Fleet utilization improvement   | +30% utilization rate           |

### 2.2 Cost Components

| Component                  | Description                                          |
|----------------------------|------------------------------------------------------|
| Subscription Fee           | Monthly platform fee per pricing tier                |
| Implementation Fee         | One-time setup, configuration, and data migration    |
| Training Cost              | Initial and ongoing user training                    |
| Change Management          | Internal costs of process transition                 |

---

## 3. Input Variables

### 3.1 Workshop Profile Inputs

| Variable                       | Unit          | Small      | Medium     | Enterprise |
|--------------------------------|---------------|------------|------------|------------|
| Number of Branches             | Count         | 1          | 3          | 10+        |
| Technicians per Branch         | Count         | 5          | 5          | 8          |
| Total Technicians              | Count         | 5          | 15         | 80+        |
| Service Advisors per Branch    | Count         | 2          | 3          | 4          |
| Admin / Finance Staff          | Count         | 1          | 3          | 10         |
| Average Jobs per Day (branch)  | Count         | 8          | 12         | 15         |
| Average Job Revenue            | SAR           | 1,200      | 1,500      | 1,800      |
| Average Parts Margin           | Percentage    | 25%        | 28%        | 30%        |
| Monthly Invoices               | Count         | 160        | 720        | 3,000+     |

### 3.2 Operational Metrics

| Variable                       | Unit          | Industry Avg | With SALIS |
|--------------------------------|---------------|--------------|------------|
| Estimate Approval Time         | Hours         | 48           | 4          |
| Invoice Processing Time        | Minutes       | 15           | 2          |
| Jobs per Tech per Day          | Count         | 2.5          | 3.1        |
| Parts Procurement Cycle        | Days          | 5            | 3          |
| Bay Utilization Rate           | Percentage    | 60%          | 78%        |
| Customer Return Rate           | Percentage    | 45%          | 62%        |

---

## 4. Scenario 1: Small Workshop

### 4.1 Profile

| Parameter                 | Value                                             |
|---------------------------|---------------------------------------------------|
| Description               | Independent workshop, single location             |
| Branches                  | 1                                                 |
| Bays                      | 3-4                                               |
| Technicians               | 5                                                 |
| Service Advisors          | 2                                                 |
| Admin Staff               | 1                                                 |
| Total Users               | 8-10                                              |
| SALIS AUTO Tier           | Starter (SAR 999/month)                           |

### 4.2 Annual Cost (TCO)

| Cost Item                       | Year 1 (SAR)  | Year 2+ (SAR) |
|---------------------------------|---------------|----------------|
| Subscription (12 months)        | 11,988        | 11,988         |
| Implementation Fee              | 5,000         | 0              |
| Training (8 users x 2 days)     | 3,000         | 500            |
| Change Management (internal)    | 2,000         | 0              |
| **Total Annual Cost**           | **21,988**    | **12,488**     |

### 4.3 Annual Savings

| Saving Category                 | Calculation                                      | Annual (SAR) |
|---------------------------------|--------------------------------------------------|--------------|
| Throughput Increase             | 8 jobs/day x 25% more x SAR 1,200 x 250 days   | 600,000      |
| Invoice Processing              | 160 invoices x 13 min saved x SAR 40/hr         | 13,867       |
| Estimate Acceleration           | Faster approvals reducing idle bay time          | 36,000       |
| Procurement Savings             | 40% cycle reduction on SAR 30,000/mo parts      | 14,400       |
| ZATCA Penalty Avoidance         | Avoided fines (SAR 5,000+ per violation)         | 25,000       |
| Paper and Print Savings         | Eliminated paper job cards, invoices             | 6,000        |
| **Total Annual Savings**        |                                                  | **695,267**  |

### 4.4 ROI Summary

| Metric                    | Value                                             |
|---------------------------|---------------------------------------------------|
| Year 1 Net Benefit        | SAR 673,279                                       |
| Year 1 ROI                | 3,062%                                            |
| Monthly Breakeven         | Month 1                                           |
| 3-Year Net Benefit        | SAR 2,060,843                                     |

---

## 5. Scenario 2: Medium Operation

### 5.1 Profile

| Parameter                 | Value                                             |
|---------------------------|---------------------------------------------------|
| Description               | Multi-branch workshop group                       |
| Branches                  | 3                                                 |
| Bays per Branch           | 5-6                                               |
| Technicians               | 15 (5 per branch)                                 |
| Service Advisors          | 9 (3 per branch)                                  |
| Admin / Finance Staff     | 3                                                 |
| Total Users               | 27-30                                             |
| SALIS AUTO Tier           | Professional (SAR 2,499/month)                    |

### 5.2 Annual Cost (TCO)

| Cost Item                       | Year 1 (SAR)  | Year 2+ (SAR) |
|---------------------------------|---------------|----------------|
| Subscription (12 months)        | 29,988        | 29,988         |
| Implementation Fee              | 15,000        | 0              |
| Training (30 users x 2 days)    | 10,000        | 2,000          |
| Data Migration (3 branches)     | 8,000         | 0              |
| Change Management (internal)    | 5,000         | 0              |
| **Total Annual Cost**           | **67,988**    | **31,988**     |

### 5.3 Annual Savings

| Saving Category                 | Calculation                                      | Annual (SAR)  |
|---------------------------------|--------------------------------------------------|---------------|
| Throughput Increase             | 36 jobs/day x 25% x SAR 1,500 x 250 days        | 3,375,000     |
| Invoice Processing              | 720 invoices x 13 min saved x SAR 40/hr          | 62,400        |
| Estimate Acceleration           | 3 branches x faster approvals                    | 108,000       |
| Procurement Savings             | 40% reduction on SAR 90,000/mo parts spend       | 43,200        |
| ZATCA Penalty Avoidance         | 3 branches x compliance risk                     | 75,000        |
| Centralized Management          | Eliminated branch-level admin duplication         | 48,000        |
| Customer Retention Uplift       | 17% improvement x revenue impact                 | 180,000       |
| Paper and Print Savings         | 3 branches                                       | 18,000        |
| **Total Annual Savings**        |                                                  | **3,909,600** |

### 5.4 ROI Summary

| Metric                    | Value                                             |
|---------------------------|---------------------------------------------------|
| Year 1 Net Benefit        | SAR 3,841,612                                     |
| Year 1 ROI                | 5,650%                                            |
| Monthly Breakeven         | Month 1                                           |
| 3-Year Net Benefit        | SAR 11,596,836                                    |

---

## 6. Scenario 3: Enterprise

### 6.1 Profile

| Parameter                 | Value                                             |
|---------------------------|---------------------------------------------------|
| Description               | Regional franchise or fleet maintenance group     |
| Branches                  | 10+                                               |
| Bays per Branch           | 8-10                                              |
| Technicians               | 80+ (8 per branch)                                |
| Service Advisors          | 40 (4 per branch)                                 |
| Admin / Finance Staff     | 10                                                |
| Total Users               | 130+                                              |
| SALIS AUTO Tier           | Enterprise (custom pricing)                       |

### 6.2 Annual Cost (TCO)

| Cost Item                       | Year 1 (SAR)    | Year 2+ (SAR)  |
|---------------------------------|-----------------|------------------|
| Subscription (12 months)        | 120,000         | 120,000          |
| Implementation Fee              | 50,000          | 0                |
| Training (130 users, phased)    | 35,000          | 8,000            |
| Data Migration (10 branches)    | 25,000          | 0                |
| Integration Services            | 20,000          | 5,000            |
| Change Management (internal)    | 15,000          | 0                |
| **Total Annual Cost**           | **265,000**     | **133,000**      |

### 6.3 Annual Savings

| Saving Category                 | Calculation                                       | Annual (SAR)   |
|---------------------------------|---------------------------------------------------|----------------|
| Throughput Increase             | 150 jobs/day x 25% x SAR 1,800 x 250 days        | 16,875,000     |
| Invoice Processing              | 3,000 invoices x 13 min saved x SAR 40/hr         | 260,000        |
| Estimate Acceleration           | 10 branches x faster approvals                    | 360,000        |
| Procurement Savings             | 40% reduction on SAR 500,000/mo parts spend       | 240,000        |
| Fleet Utilization               | 30% improvement on fleet contracts                | 450,000        |
| ZATCA Penalty Avoidance         | 10 branches x compliance risk                     | 250,000        |
| Centralized Management          | Consolidated operations team                      | 240,000        |
| Customer Retention Uplift       | 17% improvement x enterprise revenue              | 600,000        |
| Paper and Print Savings         | 10 branches                                       | 60,000         |
| **Total Annual Savings**        |                                                   | **19,335,000** |

### 6.4 ROI Summary

| Metric                    | Value                                             |
|---------------------------|---------------------------------------------------|
| Year 1 Net Benefit        | SAR 19,070,000                                    |
| Year 1 ROI                | 7,196%                                            |
| Monthly Breakeven         | Month 1                                           |
| 3-Year Net Benefit        | SAR 57,339,000                                    |

---

## 7. Payback Period Analysis

### 7.1 Payback Summary

| Scenario     | Total Year 1 Cost | Monthly Savings | Payback Period |
|--------------|--------------------|--------------------|----------------|
| Small        | SAR 21,988         | SAR 57,939         | < 1 month      |
| Medium       | SAR 67,988         | SAR 325,800        | < 1 month      |
| Enterprise   | SAR 265,000        | SAR 1,611,250      | < 1 month      |

### 7.2 Three-Year TCO Comparison

| Scenario     | 3-Year SALIS Cost | 3-Year Paper Cost (est.) | 3-Year Savings  |
|--------------|--------------------|--------------------------|-----------------|
| Small        | SAR 46,964         | SAR 2,107,807            | SAR 2,060,843   |
| Medium       | SAR 131,964        | SAR 11,728,800           | SAR 11,596,836  |
| Enterprise   | SAR 531,000        | SAR 57,870,000           | SAR 57,339,000  |

---

## 8. Sensitivity Analysis

### 8.1 Conservative Estimates (50% of stated improvements)

| Scenario     | Adjusted Annual Savings | Adjusted Year 1 ROI | Adjusted Payback |
|--------------|-------------------------|----------------------|------------------|
| Small        | SAR 347,634             | 1,481%               | < 1 month        |
| Medium       | SAR 1,954,800           | 2,775%               | < 1 month        |
| Enterprise   | SAR 9,667,500           | 3,548%               | < 1 month        |

### 8.2 Key Assumptions

| Assumption                               | Value               | Impact if Wrong              |
|------------------------------------------|----------------------|------------------------------|
| Working days per year                    | 250                  | Linear scaling               |
| Average hourly labor cost                | SAR 40               | Affects admin savings        |
| Throughput improvement                   | 25%                  | Largest value driver         |
| ZATCA penalty per violation              | SAR 5,000 minimum    | Regulatory floor             |
| Customer retention improvement           | 17 percentage points | Affects medium/enterprise    |

---

## 9. Using This Model in Sales

### 9.1 Discovery Questions for Input Gathering

1. How many branches do you currently operate?
2. How many technicians and service advisors are at each branch?
3. What is your average daily job count per branch?
4. What is your average job ticket value in SAR?
5. How long does your estimate approval process take today?
6. How do you currently handle ZATCA e-invoicing?
7. How much time does your team spend on invoice processing?
8. What is your monthly parts procurement spend?
9. Do you manage any fleet contracts?
10. What is your current bay utilization rate?

### 9.2 Presentation Tips

- Lead with ZATCA compliance for prospects unaware of penalty risk
- Lead with throughput gains for operations-focused buyers
- Lead with TCO comparison for cost-conscious small workshops
- Always present the conservative (50%) scenario alongside the standard model
- Use the prospect's actual numbers when available -- the model is more compelling with real inputs

---

## 10. Cross-References

| Document                                           | Relevance                      |
|----------------------------------------------------|--------------------------------|
| `../project-management/prince2/business-case.md`   | Detailed business case         |
| SA-MKT-008 (Pricing Guide)                         | Tier pricing details           |
| SA-MKT-001 (Product Overview)                      | Platform capabilities          |

---

*ROI projections are illustrative and based on demonstrated platform metrics. Actual results depend on implementation scope, user adoption, and workshop operations. Always use prospect-specific inputs when available.*
