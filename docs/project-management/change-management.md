# SALIS AUTO -- Change Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PM-CM-001                               |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document establishes the process for requesting, evaluating, approving, and tracking changes to the SALIS AUTO project scope, requirements, technical architecture, and schedule. All changes -- from minor UI adjustments to ZATCA regulatory updates -- follow this process. The baseline scope is defined in the [Scope Statement](pmp/scope-statement.md).

---

## 2. Change Categories

| Category            | Code | Description                                                          | Examples                                              |
|---------------------|------|----------------------------------------------------------------------|-------------------------------------------------------|
| Scope Change        | SC   | Addition, removal, or modification of features or screens            | New dashboard screen, removal of a domain             |
| Requirement Change  | RC   | Alteration to functional or non-functional requirements              | Change to approval chain logic, new validation rule   |
| Technical Change    | TC   | Modification to architecture, tech stack, or infrastructure          | Database schema change, library upgrade, API redesign |
| Regulatory Change   | RG   | Updates mandated by Saudi regulations                                | ZATCA Phase 2 spec update, VAT rate change            |
| Schedule Change     | SH   | Modification to sprint plan, milestones, or delivery dates           | Sprint scope reduction, milestone date shift          |
| Resource Change     | RS   | Team composition or allocation changes                               | Developer reassignment, contractor onboarding         |

---

## 3. Change Control Board (CCB)

### 3.1 Composition

| Role                | Member                   | Authority                                    |
|---------------------|--------------------------|----------------------------------------------|
| Chair               | Project Manager          | Convenes meetings, facilitates decisions      |
| Technical Authority | Tech Lead                | Assesses technical impact and feasibility     |
| Business Authority  | Product Owner            | Assesses business value and priority          |
| Quality Authority   | QA Lead                  | Assesses testing and quality impact           |
| Advisory            | DevOps Engineer          | Assesses deployment and infrastructure impact |
| Advisory            | Domain Expert (rotating) | Provides domain-specific context              |

### 3.2 Decision Authority

| Change Impact Level | Decision Authority     | Quorum Required |
|---------------------|------------------------|-----------------|
| Low (< 4 SP)        | Tech Lead alone        | 1               |
| Medium (4-13 SP)    | CCB majority           | 3 of 5          |
| High (13+ SP)       | CCB unanimous          | 5 of 5          |
| Regulatory          | CCB + Steering Committee | Full CCB + SC  |

**SP = Story Points.** Impact thresholds align with the sprint velocity in the [Resource Management Plan](resource-management.md).

---

## 4. Change Request Form Template

```
CHANGE REQUEST -- SA-CR-[YYYY]-[NNN]
==============================================
Requester:        [Name, Role]
Date Submitted:   [YYYY-MM-DD]
Category:         [SC | RC | TC | RG | SH | RS]
Priority:         [Critical | High | Medium | Low]
Status:           [Submitted | Under Review | Approved | Rejected | Implemented | Verified]

1. DESCRIPTION
   [Clear description of the proposed change]

2. JUSTIFICATION
   [Business or technical reason for the change]

3. AFFECTED AREAS
   - Domains:     [List affected domains from the 13]
   - Screens:     [List affected screens by ID]
   - API Routes:  [List affected endpoints]
   - DB Tables:   [List affected Drizzle schema tables]
   - RBAC:        [List affected roles from the 14]
   - i18n:        [AR translation keys impacted? Y/N]
   - Tests:       [Vitest/supertest/Playwright tests affected]

4. IMPACT ANALYSIS
   - Effort:      [Story points estimate]
   - Schedule:    [Sprint impact -- delay, replan, or absorbable]
   - Risk:        [New risks introduced]
   - Dependencies:[Other CRs or features blocked/unblocked]

5. ALTERNATIVES CONSIDERED
   [At least one alternative, including "do nothing"]

6. CCB DECISION
   - Decision:    [Approved | Rejected | Deferred | Request More Info]
   - Conditions:  [Any conditions on approval]
   - Decided By:  [Names]
   - Decision Date:[YYYY-MM-DD]
```

---

## 5. Impact Analysis Template

### 5.1 Domain Impact Assessment

For each change request, the Tech Lead completes:

| Impact Area           | Current State                  | Proposed State                | Effort (SP) |
|-----------------------|--------------------------------|-------------------------------|-------------|
| Frontend screens      | [List screens]                 | [Modified/new screens]        | [n]         |
| Backend API routes    | [List routes]                  | [Modified/new routes]         | [n]         |
| Drizzle ORM schema    | [List tables, columns]         | [Schema changes]              | [n]         |
| RBAC permissions      | [Current role access]          | [Modified permissions]        | [n]         |
| Generated data files  | [screens.ts, nav.ts, etc.]     | [Pipeline regeneration needed]| [n]         |
| Arabic translations   | [Current AR keys]              | [New/modified AR keys]        | [n]         |
| Test coverage         | [Existing tests]               | [New/modified tests]          | [n]         |
| Documentation         | [Affected docs]                | [Docs requiring updates]      | [n]         |
| **Total**             |                                |                               | **[sum]**   |

### 5.2 Ripple Effect Checklist

- [ ] Does the change affect the design-data pipeline (`gms-data.js` -> `port-design-data.mjs` -> `data/generated/`)?
- [ ] Does it alter the RBAC matrix for any of the 14 roles across 28 modules?
- [ ] Does it impact ZATCA compliance (e-invoice XML, hash chain, QR code, VAT calculation)?
- [ ] Does it affect tenant isolation (`org_id` filtering, RLS policies)?
- [ ] Does it require a database migration (Drizzle schema push)?
- [ ] Does it modify the workshop lifecycle (Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery)?
- [ ] Does it change the approval chain (owner -> superadmin -> manager -> advisor)?
- [ ] Does it affect RTL layout or require new Arabic translation keys?
- [ ] Does it impact any of the 3 deployment targets (GitHub Pages, Vercel, Netlify)?

---

## 6. Approval Workflow

```
[Requester]
    |
    v
Submit CR Form (SA-CR-YYYY-NNN)
    |
    v
PM Reviews Completeness (1 business day)
    |
    v
Tech Lead Completes Impact Analysis (2 business days)
    |
    +--> Low impact (<4 SP): Tech Lead approves/rejects
    |
    +--> Medium/High impact: CCB Meeting
    |         |
    |         v
    |    CCB Votes (majority or unanimous per Section 3.2)
    |         |
    |         +--> Approved: Enter sprint backlog
    |         +--> Rejected: Requester notified with rationale
    |         +--> Deferred: Added to future sprint consideration
    |         +--> More Info: Returned to requester
    |
    +--> Regulatory (ZATCA): CCB + Steering Committee
              |
              v
         Steering Committee Approval (emergency session if needed)
              |
              v
         Implementation -> Verification -> CR Closed
```

### 6.1 SLA for Change Processing

| Step                    | Target Duration      |
|-------------------------|----------------------|
| PM completeness review  | 1 business day       |
| Impact analysis          | 2 business days      |
| CCB decision (standard) | Next CCB meeting (weekly) |
| CCB decision (urgent)   | 48 hours (ad-hoc meeting) |
| Regulatory escalation   | 24 hours (emergency session) |

---

## 7. Emergency Change Procedures

Emergency changes bypass the standard CCB process when:

1. **Production is down** -- Critical defect affecting platform availability
2. **Security vulnerability** -- Active exploit or data breach risk
3. **ZATCA compliance breach** -- Regulatory non-compliance discovered in production
4. **Data integrity threat** -- Risk of data loss or corruption

### 7.1 Emergency Process

1. Developer or DevOps identifies the emergency and notifies PM + Tech Lead
2. Tech Lead authorizes the fix verbally (phone/Slack)
3. Fix is implemented, tested (minimum: unit test for the fix), and deployed
4. Post-fix: CR form is completed retroactively within 24 hours
5. CCB reviews the emergency change at the next scheduled meeting
6. Post-mortem is conducted per the [Incident Response](../system/incident-response.md) process

### 7.2 Emergency Authorization

| Scenario                | Who Can Authorize         |
|-------------------------|---------------------------|
| Production outage       | Tech Lead or PM           |
| Security vulnerability  | Tech Lead (mandatory)     |
| ZATCA compliance        | Tech Lead + Product Owner |
| Data integrity          | Tech Lead + DBA (Sr. Backend Dev) |

---

## 8. Change Log Template

All approved changes are tracked in the project change log:

| CR ID           | Date       | Category | Description                           | Impact (SP) | Status      | Sprint |
|-----------------|------------|----------|---------------------------------------|-------------|-------------|--------|
| SA-CR-2026-001  | 2026-09-15 | RC       | Add VIN decode to vehicle check-in    | 5           | Implemented | S4     |
| SA-CR-2026-002  | 2026-09-20 | RG       | ZATCA updated XML namespace v2.1      | 8           | In Progress | S7     |
| SA-CR-2026-003  | 2026-10-01 | TC       | Migrate from bcrypt to argon2id       | 3           | Approved    | S8     |

---

## 9. Change Metrics

The PM tracks the following metrics monthly:

| Metric                          | Target              | Measurement                               |
|---------------------------------|---------------------|-------------------------------------------|
| Change requests per sprint      | < 5                 | Count of CRs submitted                    |
| Average CR processing time      | < 5 business days   | Submit date to decision date              |
| CR rejection rate               | < 30%               | Rejected / total submitted                |
| Emergency changes per quarter   | < 3                 | Count of emergency CRs                    |
| Scope creep index               | < 10% of total SP   | Sum of approved scope-change SP / baseline|

---

## 10. Integration with Project Governance

- **Sprint planning:** Only approved CRs enter the sprint backlog
- **Steering committee:** Monthly report on CR volume, impact, and scope creep index
- **Risk register:** High-impact CRs generate entries in the [Risk Register](pmp/risk-register.md)
- **Lessons learned:** Recurring CR patterns feed into [Lessons Learned](lessons-learned.md) sessions

---

## 11. Related Documents

- [Scope Statement](pmp/scope-statement.md) -- Baseline scope against which changes are measured
- [Project Charter](pmp/project-charter.md) -- Authority and objectives
- [Risk Register](pmp/risk-register.md) -- Risks triggered by changes
- [Schedule Management Plan](pmp/schedule-management.md) -- Sprint impact assessment
- [Governance Framework](governance-framework.md) -- CCB authority and escalation paths
- [Lessons Learned](lessons-learned.md) -- Patterns from change requests
