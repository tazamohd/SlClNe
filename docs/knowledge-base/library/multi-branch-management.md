# SALIS AUTO -- Multi-Branch Management

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-004                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

Multi-branch workshop operations introduce complexity in data governance, resource allocation, reporting, and consistency. SALIS AUTO is designed as a multi-tenant platform where each organization can operate multiple branches with centralized oversight and branch-level autonomy. This guide covers strategies for managing multi-location workshop businesses effectively. For role-based access across branches, refer to the [RBAC Matrix](../reference/rbac-matrix.md).

---

## 2. Branch Architecture in SALIS AUTO

### 2.1 Organizational Hierarchy

```
Organization (Tenant)
  |
  +-- Branch A (Riyadh - North)
  |     +-- Users (assigned to this branch)
  |     +-- Bays, Jobs, Inventory, Invoices
  |
  +-- Branch B (Riyadh - South)
  |     +-- Users (assigned to this branch)
  |     +-- Bays, Jobs, Inventory, Invoices
  |
  +-- Branch C (Jeddah)
        +-- Users (assigned to this branch)
        +-- Bays, Jobs, Inventory, Invoices
```

### 2.2 Data Scoping Rules

| Data Type               | Branch Scope        | Org Scope (HQ View)  |
|--------------------------|--------------------|-----------------------|
| Job cards                | Own branch only     | All branches          |
| Inventory levels         | Own branch only     | All branches          |
| Invoices                 | Own branch only     | All branches          |
| Customer records         | Shared across org   | All branches          |
| Vehicle records          | Shared across org   | All branches          |
| Employee records         | Own branch only     | All branches          |
| Financial reports        | Own branch only     | Consolidated + branch |
| System configuration     | Inherited from org  | Org-level settings    |

### 2.3 Branch-Level vs. Org-Level Roles

| Role          | Scope              | Approval Limit (SAR) |
|---------------|--------------------|-----------------------|
| Owner         | All branches       | Unlimited             |
| Superadmin    | All branches       | Unlimited             |
| Manager       | Assigned branch(es)| 50,000                |
| Accountant    | Assigned branch(es)| 25,000                |
| Procurement   | Assigned branch(es)| 20,000                |
| HR            | Assigned branch(es)| 15,000                |
| Parts Manager | Assigned branch    | 10,000                |
| Service Advisor| Assigned branch   | 5,000                 |

Users with org-level roles (owner, superadmin) see data across all branches. Branch-level users see only their assigned branch data. A user can be assigned to multiple branches.

---

## 3. Branch-Level KPI Monitoring

### 3.1 Core Branch KPIs

Monitor these KPIs per branch to identify performance variations:

| KPI                        | Target      | Measurement Frequency |
|----------------------------|-------------|-----------------------|
| Jobs completed per day     | Per bay plan| Daily                 |
| Average cycle time         | 3-5 hours   | Daily                 |
| Bay utilization rate       | 80%+        | Daily                 |
| First-time fix rate        | 90%+        | Weekly                |
| Revenue per bay per month  | SAR 25,000+ | Monthly               |
| Customer NPS               | 65+         | Monthly               |
| Parts availability rate    | 93%+        | Weekly                |
| Technician productivity    | 80%+        | Weekly                |
| Invoice collection rate    | 95%+        | Monthly               |
| ZATCA compliance rate      | 100%        | Daily                 |

### 3.2 Branch Comparison Dashboard

The Organization Dashboard (accessible to owner and superadmin roles) provides side-by-side branch comparison:

| Metric                  | Branch A    | Branch B    | Branch C    | Org Avg   |
|-------------------------|-------------|-------------|-------------|-----------|
| Revenue (MTD)           | SAR 185,000 | SAR 142,000 | SAR 210,000 | SAR 179,000|
| Jobs completed (MTD)    | 245         | 198         | 312         | 252       |
| Avg cycle time (hours)  | 3.8         | 4.5         | 3.2         | 3.8       |
| Bay utilization          | 82%         | 71%         | 85%         | 79%       |
| Customer NPS            | 72          | 58          | 68          | 66        |

### 3.3 Variance Analysis

When a branch KPI deviates more than 15% from the organizational average:

1. Flag the metric for investigation in the weekly management review
2. Compare against the same branch's historical trend (is it declining or consistently low?)
3. Identify branch-specific factors (staffing changes, equipment issues, local competition)
4. Create an action plan with measurable targets and a review date
5. Track progress weekly until the metric returns to acceptable range

---

## 4. Centralized vs. Decentralized Procurement

### 4.1 Strategy Comparison

| Aspect                   | Centralized                  | Decentralized                |
|--------------------------|------------------------------|------------------------------|
| Purchase orders          | HQ places for all branches   | Each branch places own POs   |
| Supplier negotiation     | Bulk discounts, fewer vendors| Local relationships, speed   |
| Inventory ownership      | Central warehouse + branches | Branch-owned stock           |
| Lead time                | Longer (distribution step)   | Shorter (direct delivery)    |
| Cost control             | Strong (volume leverage)     | Moderate (branch autonomy)   |
| Flexibility              | Lower                        | Higher                       |
| Admin overhead           | Higher at HQ                 | Distributed                  |

### 4.2 Recommended Hybrid Model

For most Saudi multi-branch operations, a hybrid approach works best:

**Centralize:**
- Class A parts (high-value, standardized) -- negotiate org-wide contracts
- Consumables (oil, chemicals, shop supplies) -- bulk purchasing
- Equipment and tools -- standardized across branches

**Decentralize:**
- Class C parts (low-value, quick-need) -- local procurement for speed
- Emergency parts -- branch-level authority for urgent needs
- Branch-specific vehicle mix parts -- if branches serve different customer profiles

### 4.3 Approval Workflow for Centralized POs

```
Branch Request --> Procurement Review --> Manager Approval (if > SAR 10,000)
    --> Owner/Superadmin Approval (if > SAR 50,000)
    --> PO Issued to Supplier --> Receipt at Branch
```

Approval limits per role are enforced by the system. See [RBAC Matrix](../reference/rbac-matrix.md) for the complete approval chain.

### 4.4 Preferred Supplier Lists

Maintain an org-level approved supplier list. Branches can request additions, but approval requires procurement or manager role at HQ level. This prevents unauthorized supplier relationships and ensures consistent quality.

---

## 5. Cross-Branch Technician Deployment

### 5.1 When to Deploy Cross-Branch

| Scenario                              | Action                            |
|---------------------------------------|-----------------------------------|
| Seasonal demand spike (e.g., summer AC)| Temporarily relocate AC techs    |
| Specialized repair needed             | Send specialist for specific job  |
| Branch understaffed (leave, turnover) | Short-term coverage              |
| New branch ramp-up                    | Experienced techs seed new team  |
| Training and mentoring                | Senior techs rotate for coaching |

### 5.2 Deployment Process

1. Identify need and duration at the requesting branch
2. Check technician availability at source branches (Workforce > Schedule)
3. Obtain manager approval at both source and destination branches
4. Update technician's branch assignment in SALIS AUTO (temporary assignment flag)
5. Ensure the technician's skills and certifications are visible at the new branch
6. Track labor and productivity against the destination branch during deployment
7. Revert assignment at the end of the deployment period

### 5.3 Compensation Considerations

| Component              | Policy                                   |
|------------------------|------------------------------------------|
| Base salary            | Unchanged                                |
| Transportation         | Destination branch covers commute delta  |
| Housing (if inter-city)| Per diem or company housing              |
| Overtime               | Calculated at destination branch rates   |
| Performance bonus      | Split pro-rata between branches          |

### 5.4 Cross-Branch Productivity Tracking

When a technician works at a non-home branch, their productivity metrics should be attributed to the destination branch for operational reporting but to the source branch for HR performance reviews. SALIS AUTO supports this dual attribution via the temporary assignment feature.

---

## 6. Unified Reporting Dashboards

### 6.1 Report Hierarchy

| Report Level    | Audience              | Content                             |
|-----------------|-----------------------|-------------------------------------|
| Organization    | Owner, Superadmin     | Consolidated P&L, all-branch KPIs  |
| Branch          | Manager, Accountant   | Branch-specific P&L, local KPIs    |
| Department      | Controller, Advisor   | Bay utilization, job metrics        |
| Individual      | Technician            | Personal productivity, jobs done    |

### 6.2 Standard Report Pack

Generate and distribute these reports on the following schedule:

| Report                          | Frequency | Distribution                   |
|---------------------------------|-----------|-------------------------------|
| Daily operations summary        | Daily     | Branch managers, controllers   |
| Weekly KPI dashboard            | Weekly    | All managers, owner            |
| Monthly P&L by branch           | Monthly   | Owner, superadmin, accountants |
| Quarterly business review       | Quarterly | Owner, superadmin              |
| ZATCA compliance summary        | Monthly   | Accountants, finance manager   |
| Inventory valuation             | Monthly   | Parts managers, procurement    |
| Customer satisfaction report    | Monthly   | Branch managers, advisors      |
| Technician productivity report  | Bi-weekly | Controllers, HR               |

### 6.3 Data Consolidation Rules

- Revenue and expenses consolidate by summation across branches
- Percentages (utilization, fix rates) consolidate as weighted averages
- Customer counts consolidate with de-duplication (a customer visiting two branches counts once)
- Inventory value consolidates by summation
- Inter-branch transfers are eliminated in consolidated P&L

---

## 7. Data Scoping and Security

### 7.1 Branch Data Isolation

SALIS AUTO enforces branch-level data isolation at the application layer. Every database query includes a branch filter for branch-scoped users. This ensures:

- A parts manager at Branch A cannot view Branch B inventory levels
- A service advisor at Branch B cannot access Branch A job cards
- Financial data is isolated unless the user has org-level role

### 7.2 Org-Level Data Access

| Role          | Can View All Branches | Can Modify All Branches |
|---------------|----------------------|------------------------|
| Owner         | Yes                  | Yes                    |
| Superadmin    | Yes                  | Yes                    |
| Manager       | Assigned only        | Assigned only          |
| Accountant    | Assigned only        | Assigned only          |
| All others    | Assigned only        | Assigned only          |

### 7.3 Separation of Duties

The system enforces 5 Separation of Duties (SOD) pairs. These apply within and across branches:

1. Invoice creation vs. payment approval
2. Purchase order creation vs. goods receipt
3. Customer credit limit setting vs. credit note issuance
4. Inventory adjustment vs. inventory audit
5. User role assignment vs. approval limit setting

A user must not hold both sides of any SOD pair, even across different branches within the same organization.

---

## 8. Inventory Sharing Between Branches

### 8.1 Inter-Branch Transfer Workflow

```
Request Branch --> Check Part Availability at Other Branches
  --> Transfer Request Created --> Source Branch Manager Approval
  --> Logistics Arrangement --> Part Shipped / Collected
  --> Receiving Branch Confirms Receipt
  --> Inventory Updated at Both Branches
```

### 8.2 Transfer Pricing

Inter-branch transfers should use cost-based transfer pricing:

| Method                  | Description                           | Recommended For    |
|-------------------------|---------------------------------------|--------------------|
| At cost                 | Transfer at purchase cost             | Same-city branches |
| Cost + handling fee     | Cost plus SAR 10-20 handling          | Inter-city transfers|
| Market price            | Transfer at retail price              | Not recommended    |

### 8.3 Visibility Rules

The parts team at each branch can view stock levels at other branches (read-only) through the Inventory > Cross-Branch Stock screen. Transfer requests create an audit trail visible to procurement and management roles.

### 8.4 Emergency Transfer Policy

For urgent customer-facing needs (vehicle on lift, customer waiting), an expedited transfer process bypasses standard approval:

1. Service advisor creates an urgent transfer request
2. Parts manager at source branch receives immediate notification
3. Approval is automatic if the part is in stock and not reserved
4. Physical transfer must occur within 4 hours (same city) or next business day (inter-city)
5. Manager is notified post-facto for audit purposes

---

## 9. Standardized Pricing Across Locations

### 9.1 Pricing Strategy Options

| Strategy            | Description                              | When to Use                  |
|---------------------|------------------------------------------|------------------------------|
| Uniform pricing     | Same prices at all branches              | Brand consistency priority   |
| Zone-based pricing  | Prices vary by city/region               | Cost-of-living differences   |
| Market-based pricing| Prices reflect local competition         | Highly competitive markets   |
| Cost-plus pricing   | Fixed margin above branch-specific costs | Transparent, fair approach   |

### 9.2 Recommended Approach

For most Saudi multi-branch workshops, uniform pricing with zone adjustments works best:

- Base prices set at the organization level for all standard services
- City-specific modifiers for labor rate (e.g., Riyadh +5%, Jeddah base, Dammam -3%)
- Parts pricing follows supplier cost + standard markup (25-35%)
- Premium location surcharge (e.g., a workshop inside a luxury mall) as an explicit add-on

### 9.3 Price Governance

| Action                    | Required Role  | Approval Limit |
|---------------------------|---------------|----------------|
| Set org-level base prices | Owner         | Unlimited      |
| Set branch price modifier | Manager       | +/- 10%        |
| Apply job-level discount  | Advisor       | Up to 5%       |
| Apply job-level discount  | Manager       | Up to 15%      |
| Override standard pricing | Owner         | Unlimited      |

### 9.4 Price Audit

Run the Pricing Consistency Report monthly to identify:

- Services priced below cost at any branch
- Excessive discounting patterns by advisor
- Price variance exceeding allowed modifier range
- Parts markup falling below minimum threshold

---

## 10. Branch Opening Checklist

When launching a new branch in SALIS AUTO:

### 10.1 System Setup

- [ ] Create branch record in Organization > Branches
- [ ] Configure branch address, contact details, and operating hours
- [ ] Set up ZATCA EGS device registration for the new branch
- [ ] Initialize hash chain for e-invoicing
- [ ] Configure bay definitions and service types
- [ ] Assign or create user accounts with correct branch assignment
- [ ] Import or link parts catalog and set initial inventory levels
- [ ] Configure branch-specific pricing modifiers (if applicable)

### 10.2 Operational Setup

- [ ] Recruit and onboard staff using the [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [ ] Train staff on SALIS AUTO workflows per the [Job Lifecycle](../../user-documentation/workflows/job-lifecycle.md)
- [ ] Establish supplier relationships and create PO templates
- [ ] Set KPI targets appropriate for a ramp-up period (reduce targets by 30% for first 3 months)
- [ ] Schedule cross-branch technician deployment for initial support

---

## 11. Related Documents

- [Workshop Efficiency Best Practices](./workshop-efficiency-best-practices.md)
- [Parts Inventory Optimization](./parts-inventory-optimization.md)
- [Financial Reporting Guide](./financial-reporting-guide.md)
- [Customer Retention Strategies](./customer-retention-strategies.md)
- [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../../user-documentation/workflows/job-lifecycle.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-004*
