# SALIS AUTO -- Super Admin Training Course

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-011                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Course Overview

| Field            | Detail                                    |
|------------------|-------------------------------------------|
| Target Role      | Super Admin                               |
| Demo Account     | Platform Admin (admin@salisauto.com)      |
| Password         | Demo@1234                                 |
| Approval Scope   | Platform                                  |
| SAR Limit        | Unlimited                                 |
| Duration         | 6 hours (4 modules)                       |
| Track            | Executive (P0 -- go-live)                 |
| Prerequisites    | Platform Fundamentals module (30 min)     |
| Delivery         | Instructor-led                            |

### 1.1 Learning Objectives

Upon completing this course, the Super Admin will be able to:

1. Administer platform-wide settings and configurations
2. Configure and manage the RBAC system including roles, modules, and permissions
3. Manage system configuration including integrations, templates, and workflows
4. Monitor security, audit trails, and compliance

---

## 2. Module 1 -- Platform Administration (90 minutes)

### 2.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Admin dashboard overview             | 15 min   |
| 2 | Organization and branch management   | 20 min   |
| 3 | User account management              | 20 min   |
| 4 | System health monitoring             | 15 min   |
| 5 | Backup and recovery overview         | 20 min   |

### 2.2 Key Concepts

- **Platform Scope**: Super Admin operates at platform scope -- full access across all branches and system settings
- **RBAC Access**: All 28 modules with full permissions (v,c,e,d,a,x): dashboard, jobcards, appointments, estimates, checkin, inspection, qc, delivery, customers, vehicles, feedback, invoices, payments, accounting, leads, opportunities, campaigns, admin, settings, auth, reports, analytics, parts, suppliers, hr, staff, fleet, ai
- **Unlimited SAR**: No financial ceiling -- can approve any transaction amount
- **Organization Structure**: Multi-branch hierarchy with centralized administration
- **User Management**: Create, modify, disable, and delete user accounts across all roles

### 2.3 Hands-On Lab

**Lab 1.1: Navigating the Admin Dashboard**

1. Log in as Super Admin (`admin@salisauto.com` / `Demo@1234`)
2. Navigate to Admin > Dashboard
3. Review system health indicators: uptime, active users, pending actions
4. View the branch list and their current operational status
5. Check the system notification center for alerts

**Lab 1.2: Managing Users**

1. Navigate to Admin > Users
2. View the list of all platform users across all branches
3. Create a new user account:
   - Assign name, email, role, and branch
   - Set initial password and force-change flag
4. Modify an existing user's role (e.g., promote a receptionist to advisor)
5. Disable a user account (e.g., employee departure)
6. Review the user activity log for a specific account

**Lab 1.3: Branch Management**

1. Navigate to Admin > Branches
2. Review the list of branches with their configurations
3. Create a new branch:
   - Name, address, contact information
   - Operating hours and capacity
   - Assign a branch manager
4. Update an existing branch's settings
5. View the branch-level KPI summary

### 2.4 Quiz -- Module 1

**Q1.** What scope does the Super Admin role operate at?

- A) Branch
- B) All
- C) Platform (full system access)
- D) External

**Correct Answer**: C -- The Super Admin operates at platform scope with full system access.

**Q2.** How many RBAC modules does the Super Admin have access to?

- A) 14
- B) 21
- C) 28
- D) 35

**Correct Answer**: C -- The Super Admin has access to all 28 RBAC modules.

**Q3.** What permission actions does the Super Admin have?

- A) View and edit only
- B) View, create, edit, delete, approve, export (v,c,e,d,a,x)
- C) View, create, edit only
- D) Approve only

**Correct Answer**: B -- The Super Admin has all permission actions: v, c, e, d, a, x.

---

## 3. Module 2 -- RBAC Configuration (120 minutes)

### 3.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Understanding the RBAC model         | 20 min   |
| 2 | Role definitions and hierarchy       | 25 min   |
| 3 | Module-level permissions             | 25 min   |
| 4 | Scope and approval limits            | 20 min   |
| 5 | SOD rule configuration               | 15 min   |
| 6 | Custom role creation                 | 15 min   |

### 3.2 Key Concepts

- **14 Built-In Roles**: owner, superadmin, manager, advisor, technician, qc, parts, accountant, hr, frontdesk, callcenter, procurement, supplier, customer
- **28 Modules**: dashboard, jobcards, appointments, estimates, checkin, inspection, qc, delivery, customers, vehicles, feedback, invoices, payments, accounting, leads, opportunities, campaigns, admin, settings, auth, reports, analytics, parts, suppliers, hr, staff, fleet, ai
- **Permission Actions**: v=view, c=create, e=edit, d=delete, a=approve, x=export
- **Scopes**: all, platform, branch, own, external, self
- **SAR Approval Limits by Role**:

| Role         | SAR Limit    |
|--------------|--------------|
| Owner/CEO    | Unlimited    |
| Super Admin  | Unlimited    |
| Manager      | 50,000       |
| Accountant   | 25,000       |
| Procurement  | 20,000       |
| HR Manager   | 15,000       |
| Storekeeper  | 10,000       |
| Advisor      | 5,000        |
| All others   | 0            |

- **5 SOD Pairs**:
  1. Raise PO / Approve PO
  2. Create Supplier / Approve Supplier Payment
  3. Post Journal / Approve Journal
  4. Perform Repair / Pass QC
  5. Issue Stock / Adjust Stock Count

### 3.3 Hands-On Lab

**Lab 2.1: Reviewing the RBAC Matrix**

1. Navigate to Admin > Security > RBAC Matrix
2. Review the permission grid: roles (rows) vs. modules (columns) vs. actions
3. Click on a role to see its full permission profile
4. Compare two roles side-by-side (e.g., advisor vs. manager)
5. Verify the SAR approval limits for each role
6. Export the RBAC matrix as Excel for documentation

**Lab 2.2: Modifying Role Permissions**

1. Navigate to Admin > Security > Roles
2. Select the "advisor" role
3. View current permissions across all 28 modules
4. Add a new permission: grant the advisor "view" access to the "parts" module
5. Save the change and verify it takes effect
6. Revert the change to restore the default configuration

**Lab 2.3: Configuring SOD Rules**

1. Navigate to Admin > Security > SOD Configuration
2. Review the five active SOD pairs
3. Test a SOD rule: assign the same user to both sides of a pair
4. Observe the system blocking the conflicting assignment
5. Review the SOD violation log for historical entries

**Lab 2.4: Creating a Custom Role**

1. Navigate to Admin > Security > Roles > New Role
2. Name the role (e.g., "Senior Technician")
3. Select the base role to inherit from (e.g., "technician")
4. Add additional permissions (e.g., view access to QC reports)
5. Set the scope and approval limit
6. Save the custom role and assign it to a test user
7. Verify the custom role permissions work as configured

### 3.4 Quiz -- Module 2

**Q1.** How many SOD pairs are configured in the system?

- A) 3
- B) 4
- C) 5
- D) 6

**Correct Answer**: C -- There are 5 SOD pairs enforced by the platform.

**Q2.** What is the Branch Manager's SAR approval limit?

- A) 25,000 SAR
- B) 50,000 SAR
- C) 100,000 SAR
- D) Unlimited

**Correct Answer**: B -- The Branch Manager has a 50,000 SAR approval limit.

**Q3.** Which permission action controls the ability to remove records?

- A) e (edit)
- B) d (delete)
- C) a (approve)
- D) x (export)

**Correct Answer**: B -- The d (delete) permission action controls record removal.

---

## 4. Module 3 -- System Configuration (90 minutes)

### 4.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Workflow configuration               | 20 min   |
| 2 | Template management                  | 20 min   |
| 3 | Integration settings                 | 20 min   |
| 4 | ZATCA configuration                  | 15 min   |
| 5 | Localization settings (EN/AR)        | 15 min   |

### 4.2 Key Concepts

- **Workflow Engine**: Configurable workflows for job lifecycle, approvals, notifications
- **Templates**: Invoice templates, notification templates, inspection checklists (bilingual EN/AR)
- **Integrations**: Payment gateway, SMS gateway, email service, OBD-II diagnostics
- **ZATCA Settings**: VAT rate (15%), seller details, hash chain seed, reporting endpoints
- **Localization**: EN/AR language packs, RTL/LTR layout rules, date/number formatting

### 4.3 Hands-On Lab

**Lab 3.1: Configuring Workflows**

1. Navigate to Admin > Settings > Workflows
2. Open the "Job Lifecycle" workflow
3. Review the state transitions: Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
4. Add a notification trigger at the "QC Passed" transition
5. Configure the notification recipients and template
6. Save and test the workflow change

**Lab 3.2: Managing Templates**

1. Navigate to Admin > Settings > Templates
2. Open the invoice template
3. Review the bilingual layout (EN left, AR right)
4. Verify ZATCA-required fields are present (QR code placeholder, VAT details)
5. Make a cosmetic change and preview the result
6. Save and revert to the original template

**Lab 3.3: ZATCA Configuration**

1. Navigate to Admin > Settings > ZATCA
2. Review the current configuration:
   - Seller name and VAT registration number
   - VAT rate: 15%
   - Hash chain seed and current sequence
   - Reporting endpoint URL
3. Run the ZATCA compliance check
4. Review the compliance report for any issues

### 4.4 Quiz -- Module 3

**Q1.** What VAT rate is configured for ZATCA Phase 2?

- A) 5%
- B) 10%
- C) 15%
- D) 20%

**Correct Answer**: C -- ZATCA Phase 2 requires 15% VAT.

**Q2.** What is the correct workshop lifecycle sequence?

- A) Check-In -> Estimate -> Inspection -> Repair -> QC -> Delivery
- B) Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery
- C) Inspection -> Check-In -> Repair -> Estimate -> QC -> Delivery
- D) Check-In -> Inspection -> Repair -> Estimate -> QC -> Delivery

**Correct Answer**: B -- The lifecycle is Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery.

---

## 5. Module 4 -- Security & Audit (60 minutes)

### 5.1 Topics

| # | Topic                                | Duration |
|---|--------------------------------------|----------|
| 1 | Security dashboard and alerts        | 15 min   |
| 2 | Audit trail management               | 15 min   |
| 3 | Access logs and session monitoring   | 15 min   |
| 4 | Compliance reporting                 | 15 min   |

### 5.2 Key Concepts

- **Security Dashboard**: Real-time view of active sessions, failed login attempts, SOD violations
- **Audit Trail**: Immutable log of all system actions with user ID, timestamp, action, and details
- **Access Logs**: Login/logout records, IP addresses, device information
- **Session Management**: View and terminate active sessions, force password resets
- **Compliance Reports**: ZATCA compliance, SOD compliance, data retention compliance
- **Data Retention**: 7-year retention policy enforced for all financial records

### 5.3 Hands-On Lab

**Lab 4.1: Reviewing the Security Dashboard**

1. Navigate to Admin > Security > Dashboard
2. Review active sessions across all users
3. Check for failed login attempts in the last 24 hours
4. Review SOD violation alerts
5. Terminate a suspicious session (demo scenario)

**Lab 4.2: Audit Trail Analysis**

1. Navigate to Admin > Security > Audit Trail
2. Filter by date range, user, or action type
3. Search for all approval actions in the last week
4. Export the audit trail for external review
5. Identify any unusual patterns (e.g., after-hours activity)

**Lab 4.3: Compliance Reporting**

1. Navigate to Admin > Security > Compliance
2. Generate the ZATCA compliance report
3. Generate the SOD compliance report
4. Review the data retention status (7-year policy)
5. Export the compliance summary for management review

### 5.4 Quiz -- Module 4

**Q1.** How long must financial records be retained?

- A) 3 years
- B) 5 years
- C) 7 years
- D) 10 years

**Correct Answer**: C -- ZATCA requires 7-year retention for financial records.

**Q2.** What does the audit trail record?

- A) Only financial transactions
- B) All system actions with user ID, timestamp, action, and details
- C) Login attempts only
- D) Customer interactions only

**Correct Answer**: B -- The audit trail records all system actions with full context.

**Q3.** Can the Super Admin terminate active user sessions?

- A) No, sessions expire automatically only
- B) Yes, from the Security Dashboard
- C) Only the Owner can terminate sessions
- D) Sessions cannot be terminated

**Correct Answer**: B -- The Super Admin can terminate active sessions from the Security Dashboard.

---

## 6. Course Summary

| Module | Topic                           | Duration | Key Takeaway                            |
|--------|---------------------------------|----------|-----------------------------------------|
| 1      | Platform Administration         | 90 min   | Full platform and user management       |
| 2      | RBAC Configuration              | 120 min  | Role, permission, and SOD management    |
| 3      | System Configuration            | 90 min   | Workflows, templates, ZATCA, i18n       |
| 4      | Security & Audit                | 60 min   | Monitoring, audit trails, compliance    |

---

## 7. Related Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Owner & Super Admin Guide](../user-documentation/guides/owner-superadmin-guide.md)
- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)

---

## 8. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
