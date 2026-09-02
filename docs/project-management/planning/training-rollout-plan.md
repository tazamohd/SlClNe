# SALIS AUTO -- Training Rollout Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-006                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the training deployment strategy for SALIS AUTO, covering five rollout phases from pre-launch preparation through external user enablement. It establishes schedules, resource requirements, success metrics, risk mitigations, and budget allocations for training all 14 platform roles across the four training tracks (Executive P0, Operations P1, Back-Office P2, External P3).

---

## 2. Training Tracks Overview

| Track       | Priority | Target Roles                                         | Total Hours | Delivery Mode        |
|-------------|----------|------------------------------------------------------|-------------|----------------------|
| Executive   | P0       | Owner/CEO, Branch Manager, Super Admin               | 18          | Instructor-led (ILT) |
| Operations  | P1       | Service Advisor, Technician, QC Inspector            | 18          | ILT + Hands-on Lab   |
| Back-Office | P2       | Accountant, Storekeeper, Procurement, HR, Receptionist, Call Center | 18 | ILT + eLearning |
| External    | P3       | Customer (portal), Supplier (portal)                 | 5           | Self-paced + Guided  |

### 2.1 Role-to-Track Mapping

| Role                | Track       | Demo Account               | SAR Limit   |
|---------------------|-------------|----------------------------|-------------|
| Owner/CEO           | Executive   | owner@salisauto.sa         | Unlimited   |
| Super Admin         | Executive   | admin@salisauto.com        | Unlimited   |
| Branch Manager      | Executive   | manager@salisauto.sa       | 50,000      |
| Service Advisor     | Operations  | advisor@salisauto.sa       | 5,000       |
| Technician          | Operations  | tech@salisauto.sa          | 0           |
| QC Inspector        | Operations  | qc@salisauto.sa            | 0           |
| Accountant          | Back-Office | finance@salisauto.sa       | 25,000      |
| Storekeeper (Parts) | Back-Office | parts@salisauto.sa         | 10,000      |
| Procurement Officer | Back-Office | procurement@salisauto.sa   | 20,000      |
| HR Manager          | Back-Office | hr@salisauto.sa            | 15,000      |
| Receptionist        | Back-Office | frontdesk@salisauto.sa     | 0           |
| Call Center Agent   | Back-Office | calls@salisauto.sa         | 0           |
| Customer            | External    | khalid@example.sa          | 0           |
| Supplier            | External    | supplier@aljazira.sa       | 0           |

All demo accounts use the standard password: `Demo@1234`.

---

## 3. Phase 1 -- Pre-Launch Preparation (Weeks 48-50)

### 3.1 Objectives

- Certify internal trainers on all 13 SALIS AUTO domains (191+ screens)
- Provision and validate training lab environments
- Complete bilingual (EN/AR) material localization
- Configure the Learning Management System (LMS)

### 3.2 Train-the-Trainer Program

| Activity                           | Duration | Participants              | Week |
|------------------------------------|----------|---------------------------|------|
| Platform deep-dive (all domains)   | 16h      | 4 Lead Trainers           | 48   |
| Workshop lifecycle walkthrough     | 8h       | 4 Lead Trainers           | 48   |
| ZATCA Phase 2 e-invoicing module   | 4h       | 2 Finance Trainers        | 49   |
| RTL/bilingual UI navigation        | 4h       | All Trainers              | 49   |
| Dry-run delivery (mock sessions)   | 8h       | All Trainers + 2 Observers| 50   |
| Certification assessment           | 2h       | All Trainers              | 50   |

Workshop lifecycle covered: Check-In, Inspection, Estimate, Repair, QC, Delivery.

### 3.3 Lab Environment Setup

| Task                                | Owner              | Deadline  |
|-------------------------------------|--------------------|-----------|
| Provision 3 sandbox tenants         | DevOps             | Week 48   |
| Load sample data (50 vehicles, 200 parts, 30 customers) | QA | Week 48 |
| Configure demo accounts (14 roles)  | Platform Admin     | Week 49   |
| Validate ZATCA sandbox integration  | Finance + DevOps   | Week 49   |
| RTL layout verification             | QA + L10n          | Week 49   |
| Network/VPN access for trainers     | IT Infrastructure  | Week 50   |

### 3.4 Material Localization

All training materials are produced in English first, then localized to Arabic with RTL formatting.

| Material Type         | EN Completion | AR Localization | Review     |
|-----------------------|---------------|-----------------|------------|
| Slide decks (12 sets) | Week 48       | Week 49         | Week 50    |
| Quick-reference cards | Week 48       | Week 49         | Week 50    |
| Video tutorials (20)  | Week 49       | Week 50         | Week 50    |
| LMS course modules    | Week 49       | Week 50         | Week 50    |
| Assessment quizzes    | Week 48       | Week 49         | Week 50    |

### 3.5 LMS Configuration

| Configuration Item            | Details                                   |
|-------------------------------|-------------------------------------------|
| Platform                      | Moodle 4.x (self-hosted, KSA region)      |
| Course structure              | 4 tracks, 12 modules, 45 lessons          |
| Enrollment rules              | Auto-enroll by role assignment             |
| Completion tracking           | SCORM 1.2 + xAPI                          |
| Certificate generation        | Auto-issue on passing (score >= 70%)       |
| Language toggle                | EN/AR per learner preference              |
| Reporting                     | Weekly completion dashboards to PMO        |

---

## 4. Phase 2 -- Executive Track Go-Live (Week 52)

### 4.1 Schedule

| Session                   | Role(s)              | Duration | Date         | Location        |
|---------------------------|----------------------|----------|--------------|-----------------|
| Strategic overview        | Owner/CEO            | 2h       | Week 52 Day 1| Riyadh HQ       |
| Dashboard & analytics     | Owner/CEO            | 2h       | Week 52 Day 1| Riyadh HQ       |
| Branch operations         | Branch Manager       | 4h       | Week 52 Day 2| Riyadh HQ       |
| Staff & permissions       | Branch Manager       | 4h       | Week 52 Day 3| Riyadh HQ       |
| System administration     | Super Admin          | 4h       | Week 52 Day 2| Riyadh HQ       |
| Tenant configuration      | Super Admin          | 2h       | Week 52 Day 3| Riyadh HQ       |

### 4.2 Executive Track Content

| Module                        | Topics Covered                                             |
|-------------------------------|------------------------------------------------------------|
| Platform Vision               | Multi-tenant architecture, ROI metrics, competitive edge   |
| Financial Dashboards          | Revenue, costs, SAR limits, approval workflows             |
| Branch Management             | Multi-branch ops, staff allocation, performance KPIs       |
| ZATCA Compliance              | Phase 2 e-invoicing overview, VAT 15%, audit readiness     |
| User & Role Administration    | 14 roles, permission matrix, SAR limit configuration       |
| Reporting & Analytics         | Custom reports, export, scheduled reports                  |

---

## 5. Phase 3 -- Operations Track (Weeks 1-2 Post-Launch)

### 5.1 Schedule

| Session                       | Role            | Duration | Week | City    |
|-------------------------------|-----------------|----------|------|---------|
| Customer check-in & intake    | Service Advisor | 4h       | 1    | Riyadh  |
| Estimate creation & approval  | Service Advisor | 4h       | 1    | Riyadh  |
| Work order management         | Technician      | 3h       | 1    | Riyadh  |
| Parts request workflow        | Technician      | 3h       | 2    | Riyadh  |
| QC inspection checklists      | QC Inspector    | 2h       | 2    | Riyadh  |
| Delivery sign-off process     | QC Inspector    | 2h       | 2    | Riyadh  |

### 5.2 Key Learning Outcomes

- Service Advisor: reduce estimate approval from 48h to 4h using digital workflows
- Technician: complete work order updates from the workshop floor via mobile
- QC Inspector: execute standardized 50-point inspection checklists digitally
- All Operations roles: navigate bilingual (EN/AR) interface with RTL support

---

## 6. Phase 4 -- Back-Office Track (Weeks 2-4 Post-Launch)

### 6.1 Schedule

| Session                            | Role(s)                       | Duration | Week |
|------------------------------------|-------------------------------|----------|------|
| Invoicing & ZATCA e-invoicing      | Accountant                    | 4h       | 2    |
| Payment processing & reconciliation| Accountant                    | 3h       | 3    |
| Accounts receivable/payable        | Accountant                    | 3h       | 3    |
| Inventory & cataloguing            | Storekeeper                   | 4h       | 2    |
| Purchase orders & receiving        | Procurement Officer           | 4h       | 3    |
| Supplier management                | Procurement Officer           | 3h       | 3    |
| Vendor evaluation & analytics      | Procurement Officer           | 3h       | 4    |
| Employee records & attendance      | HR Manager                    | 4h       | 3    |
| Payroll integration                | HR Manager                    | 4h       | 4    |
| Appointment scheduling             | Receptionist                  | 4h       | 3    |
| Customer registration              | Receptionist                  | 4h       | 4    |
| Inbound call logging               | Call Center Agent             | 4h       | 3    |
| Follow-up & escalation workflows   | Call Center Agent             | 4h       | 4    |

### 6.2 Key ROI Targets

| Process                  | Before SALIS AUTO | After SALIS AUTO | Improvement |
|--------------------------|-------------------|------------------|-------------|
| Invoice processing       | 15 min            | 2 min            | -87%        |
| Estimate approval        | 48 hours          | 4 hours          | -92%        |
| Workshop throughput      | Baseline          | +25%             | +25%        |
| Procurement cycle cost   | Baseline          | -40%             | -40%        |

---

## 7. Phase 5 -- External Track (Weeks 4-6 Post-Launch)

### 7.1 Customer Portal Training (2h Self-Paced)

| Module                           | Duration | Format           |
|----------------------------------|----------|------------------|
| Account registration & login     | 15 min   | Interactive video |
| Vehicle profile management       | 20 min   | Interactive video |
| Service request submission       | 25 min   | Guided walkthrough|
| Estimate review & approval       | 20 min   | Guided walkthrough|
| Invoice & payment history        | 15 min   | Interactive video |
| Feedback & rating submission     | 10 min   | Interactive video |
| Assessment quiz                  | 15 min   | LMS quiz         |

### 7.2 Supplier Portal Training (3h Guided)

| Module                           | Duration | Format           |
|----------------------------------|----------|------------------|
| Supplier registration & profile  | 30 min   | Live webinar     |
| PO acknowledgment workflow       | 30 min   | Live webinar     |
| Delivery scheduling & tracking   | 30 min   | Guided walkthrough|
| Invoice submission (ZATCA format)| 45 min   | Live webinar     |
| Performance dashboard            | 15 min   | Guided walkthrough|
| Assessment quiz                  | 30 min   | LMS quiz         |

---

## 8. Resource Requirements

### 8.1 Personnel

| Role                    | Count | Engagement Period | Source     |
|-------------------------|-------|-------------------|------------|
| Lead Trainer            | 4     | Weeks 48 - 6      | Internal   |
| Subject Matter Expert   | 6     | Weeks 48 - 4      | Internal   |
| LMS Administrator       | 1     | Weeks 48 - ongoing | Internal  |
| L10n Specialist (AR)    | 2     | Weeks 48 - 50     | Contractor |
| Video Producer          | 1     | Weeks 48 - 50     | Contractor |
| Lab Environment Admin   | 1     | Weeks 48 - 2      | DevOps     |

### 8.2 Infrastructure

| Resource                   | Specification                    | Quantity |
|----------------------------|----------------------------------|----------|
| Training room (Riyadh HQ)  | 20 seats, projector, Wi-Fi      | 1        |
| Training laptops           | Windows 11, Chrome latest       | 20       |
| Sandbox tenants            | Isolated multi-tenant instances  | 3        |
| LMS hosting (KSA region)  | 2 vCPU, 4GB RAM, 50GB storage   | 1        |
| Video conferencing license | Zoom Business (for remote)      | 5 seats  |

---

## 9. Success Metrics

| Metric                             | Target    | Measurement Method          |
|------------------------------------|-----------|-----------------------------|
| Training completion rate           | > 90%     | LMS completion tracking     |
| Assessment pass rate (score >= 70%)| > 85%     | LMS quiz results            |
| Trainer satisfaction (NPS)         | > 50      | Post-session survey         |
| Learner satisfaction               | >= 4.0/5  | Post-session survey         |
| Time-to-competency (Operations)    | <= 5 days | Supervisor sign-off         |
| Time-to-competency (Back-Office)   | <= 10 days| Supervisor sign-off         |
| Support ticket reduction (Month 2) | -30%      | Helpdesk analytics          |
| Knowledge retention (60-day quiz)  | > 65%     | LMS re-assessment           |

---

## 10. Risk Register

| ID   | Risk Description                                | Probability | Impact | Mitigation Strategy                                 |
|------|-------------------------------------------------|-------------|--------|------------------------------------------------------|
| TR-1 | Trainer unavailability due to illness            | Medium      | High   | Cross-train backup trainer for each track            |
| TR-2 | Sandbox environment instability                  | Medium      | High   | Provision redundant sandbox; daily health checks     |
| TR-3 | Low executive attendance                         | High        | High   | CEO sponsor mandate; flexible 1:1 makeup sessions    |
| TR-4 | Arabic localization delays                       | Medium      | Medium | Parallel translation; buffer week in schedule        |
| TR-5 | Network connectivity issues in training room     | Low         | High   | 4G backup hotspots; offline-capable materials        |
| TR-6 | Learner resistance to new platform               | Medium      | Medium | Change champions per branch; gamification incentives |
| TR-7 | ZATCA sandbox certification delay                | Low         | High   | Early engagement with ZATCA; fallback mock API       |
| TR-8 | Insufficient post-training support               | Medium      | High   | Dedicated Slack channel; office hours Week 1-4       |

---

## 11. Dependencies

| Dependency                              | Source Document                          | Status    |
|-----------------------------------------|------------------------------------------|-----------|
| Production environment ready            | [Deployment Plan](./deployment-plan.md) (SA-PLN-002) | On track |
| Release 1.0 feature-complete            | [Release Plan](./release-plan.md) (SA-PLN-001) | On track |
| UAT sign-off                            | [Test Plan](./test-plan.md) (SA-PLN-003) | Pending  |
| Training program curriculum             | [Program Overview](../../training/program-overview.md) | In progress |
| Business case approved                  | [Business Case](../prince2/business-case.md) | Approved |
| Pricing finalized for demos             | [Pricing Guide](../../marketing/pricing-guide.md) | In progress |

---

## 12. Budget

### 12.1 Summary

| Category                    | Amount (SAR) |
|-----------------------------|-------------|
| Trainer compensation        | 45,000      |
| Contractor fees (L10n + Video) | 30,000   |
| LMS licensing & hosting     | 15,000      |
| Training room & equipment   | 12,000      |
| Travel (Jeddah/Dammam)      | 18,000      |
| Printed materials           | 5,000       |
| Contingency (10%)           | 12,500      |
| **Total**                   | **137,500** |

### 12.2 Quarterly Breakdown

| Quarter   | Spend (SAR) | Activities                                     |
|-----------|-------------|-------------------------------------------------|
| Q4 2026   | 82,500      | Pre-launch prep, Executive track, Operations    |
| Q1 2027   | 42,500      | Back-Office track, External track               |
| Q2 2027   | 12,500      | Refresher sessions, contingency                 |

---

## 13. Approval

| Approver                | Role              | Date       | Signature |
|-------------------------|--------------------|------------|-----------|
| [Name]                  | CEO / Owner        | 2026-08-31 | _________ |
| [Name]                  | PMO Director       | 2026-08-31 | _________ |
| [Name]                  | Head of Training   | 2026-08-31 | _________ |
| [Name]                  | IT Director        | 2026-08-31 | _________ |

---

*This document is maintained by the SALIS AUTO PMO. For questions or change requests, contact the Training Lead.*
