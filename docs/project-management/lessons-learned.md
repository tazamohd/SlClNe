# SALIS AUTO -- Lessons Learned Register

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PM-LL-001                               |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the process for capturing, categorizing, and acting on lessons learned throughout the SALIS AUTO project. It includes session templates, a categorization framework, and the retrospective schedule. Lessons feed back into the [Risk Register](pmp/risk-register.md), [Change Management](change-management.md), and team onboarding materials.

---

## 2. Retrospective Schedule

### 2.1 Session Cadence

| Trigger                        | Format                  | Duration   | Facilitator        |
|--------------------------------|-------------------------|------------|--------------------|
| End of each 2-week sprint      | Sprint retrospective    | 60 minutes | Scrum Master / PM  |
| End of each PRINCE2 stage      | Stage-gate retrospective| 90 minutes | PM + Tech Lead     |
| Major milestone delivery       | Milestone retrospective | 120 minutes| PM + Product Owner |
| Production incident (P1/P2)    | Post-mortem             | 60 minutes | Incident Commander |
| Project closure                | Final retrospective     | Half-day   | PM + full team     |

### 2.2 Sprint Retrospective Alignment

| Sprint(s) | Domain Focus                  | Key Lesson Areas                          |
|-----------|-------------------------------|-------------------------------------------|
| 1-2       | Foundation & Auth             | PGlite setup, JWT implementation, env config |
| 3-5       | Workshop + Registry           | Design-data pipeline, screen volume, RTL  |
| 6-7       | Finance & ZATCA               | ZATCA compliance, hash chain, SAR math    |
| 8-9       | CRM, HR, Inventory            | Cross-domain integration, RBAC scaling    |
| 10        | Portals & AI                  | Customer-facing UX, Arabic content        |
| 11        | Integration & Polish          | E2E testing at scale, performance tuning  |
| 12        | Hardening & Launch            | Deployment, monitoring, go-live readiness |

---

## 3. Session Format

### 3.1 Standard Retrospective Template

```
LESSONS LEARNED SESSION -- [Sprint N / Stage / Milestone]
==========================================================
Date:          [YYYY-MM-DD]
Facilitator:   [Name]
Attendees:     [List]
Duration:      [Minutes]

PART 1: WHAT WENT WELL (15 min)
-------------------------------
[Each team member contributes 1-3 items. Group and vote.]

1. [Item]
2. [Item]
...

PART 2: WHAT DIDN'T GO WELL (15 min)
-------------------------------------
[Each team member contributes 1-3 items. Group and vote.]

1. [Item]
2. [Item]
...

PART 3: ROOT CAUSE ANALYSIS (15 min)
-------------------------------------
[For the top 3 voted items from Part 2, identify root causes.]

Issue:      [Description]
Root Cause: [Why did this happen?]
Category:   [Technical | Process | Communication | Stakeholder | Quality]

PART 4: ACTION ITEMS (15 min)
------------------------------
[Concrete, assignable actions with deadlines.]

| Action                        | Owner      | Deadline     | Status    |
|-------------------------------|------------|--------------|-----------|
| [Action description]          | [Name]     | [YYYY-MM-DD] | [Open]    |
```

### 3.2 Post-Mortem Template (Incidents)

Used after P1/P2 incidents per the [Incident Response](../system/incident-response.md) process:

```
POST-MORTEM -- [Incident ID]
==============================
Incident Date:  [YYYY-MM-DD HH:MM AST]
Duration:       [Minutes/Hours]
Severity:       [P1 | P2]
Commander:      [Name]

TIMELINE
--------
[HH:MM] Event / action taken
[HH:MM] Event / action taken
...

ROOT CAUSE
----------
[Technical root cause analysis]

IMPACT
------
- Users affected:    [Number / percentage]
- Data impact:       [None | Partial | Full]
- Financial impact:  [SAR amount, if applicable]
- ZATCA compliance:  [Any compliance gap during incident]

RESOLUTION
----------
[What fixed the issue]

ACTION ITEMS
------------
| Action                        | Owner      | Deadline     | Priority |
|-------------------------------|------------|--------------|----------|
| [Preventive action]           | [Name]     | [Date]       | [H/M/L]  |
```

---

## 4. Lesson Categories

### 4.1 Category Definitions

| Category        | Code | Scope                                                          |
|-----------------|------|----------------------------------------------------------------|
| Technical       | T    | Architecture, code quality, tooling, infrastructure decisions  |
| Process         | P    | Sprint management, workflow, CI/CD, deployment procedures      |
| Communication   | C    | Team coordination, stakeholder updates, documentation          |
| Stakeholder     | S    | Requirements clarity, feedback cycles, expectation management  |
| Quality         | Q    | Testing effectiveness, bug escape rate, performance            |

### 4.2 Severity Levels

| Level    | Description                                          | Action Required                  |
|----------|------------------------------------------------------|----------------------------------|
| Critical | Lesson that, if ignored, will cause project failure  | Immediate process change         |
| Major    | Lesson that significantly impacts delivery quality   | Action item in next sprint       |
| Minor    | Lesson that improves efficiency but is not blocking  | Backlog for future improvement   |

---

## 5. Key Areas for Lesson Capture

The following areas are specific to SALIS AUTO and should be actively monitored for lessons:

### 5.1 PGlite Adoption for Development

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| Developer experience    | Is PGlite fast enough for local iteration? Any schema drift?     |
| Test reliability        | Do PGlite tests match PostgreSQL production behavior?             |
| Migration path          | Are Drizzle migrations portable between PGlite and PostgreSQL?    |
| Edge cases              | Any SQL features that PGlite handles differently?                 |

### 5.2 Repository Seam Pattern (Mock vs HTTP)

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| Seam fidelity           | Does `mockRepository` accurately represent API behavior?          |
| Data freshness          | Do generated fixtures (`tables.ts`) stay in sync with backend?    |
| Testing coverage        | Are both mock and HTTP paths tested? Any divergence bugs?         |
| Migration strategy      | When to switch from mock to HTTP per domain?                      |

### 5.3 Design-Data Pipeline

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| Pipeline reliability    | Does `gms-data.js` -> `port-design-data.mjs` -> `data/generated/` run cleanly? |
| Output correctness      | Are `screens.ts`, `nav.ts`, `rbac.ts`, `tables.ts`, `ar.ts`, `badges.ts` accurate? |
| Regeneration triggers   | When should the pipeline re-run? Manual or CI-triggered?          |
| Downstream impact       | Do downstream components handle regenerated changes gracefully?   |

### 5.4 RTL Implementation

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| CSS strategy            | Are logical properties (`margin-inline-start`) used consistently? |
| Component mirroring     | Which components need explicit RTL overrides?                     |
| Testing coverage        | Are Playwright E2E tests run in both LTR and RTL?                |
| Typography              | Does Arabic text render correctly across all screen sizes?        |

### 5.5 ZATCA Compliance

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| Spec interpretation     | Any ambiguity in ZATCA Phase 2 spec that caused rework?          |
| Hash chain integrity    | Is the sequential invoice hash chain robust under concurrency?    |
| QR code generation      | Any issues with TLV encoding or Base64 format?                   |
| Sandbox testing         | How closely does ZATCA sandbox match production?                  |
| VAT calculation         | Any rounding issues with integer halala math?                    |

### 5.6 Multi-Tenant Architecture

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| `org_id` isolation      | Any queries that accidentally leak cross-tenant data?            |
| RLS policy coverage     | Are all tables covered by row-level security?                    |
| Performance impact      | Does tenant filtering add measurable query overhead?             |
| Testing approach        | How are cross-tenant isolation tests structured?                 |

### 5.7 RBAC Complexity

| Aspect                  | Questions to Ask                                                  |
|-------------------------|-------------------------------------------------------------------|
| 14-role testing         | Are all role combinations tested for each screen?                |
| Permission drift        | Do UI `can()` checks stay in sync with API middleware?           |
| Approval chain          | Is the owner -> superadmin -> manager -> advisor chain tested E2E?|
| New role addition       | How hard is it to add role 15? What breaks?                     |

---

## 6. Lessons Learned Register

### 6.1 Register Format

| ID       | Date       | Category | Severity | Sprint | Description                              | Root Cause                    | Action Taken                         | Status |
|----------|------------|----------|----------|--------|------------------------------------------|-------------------------------|--------------------------------------|--------|
| LL-001   | [Date]     | T        | Major    | S2     | [Description]                            | [Root cause]                  | [Action]                             | [Status] |
| LL-002   | [Date]     | P        | Minor    | S3     | [Description]                            | [Root cause]                  | [Action]                             | [Status] |

### 6.2 Example Entries (Anticipated)

| ID       | Category | Description                                              | Anticipated Root Cause                  |
|----------|----------|----------------------------------------------------------|-----------------------------------------|
| LL-T01   | T        | PGlite `LIKE` behavior differs from PostgreSQL `ILIKE`   | PGlite collation settings differ        |
| LL-T02   | T        | Generated `rbac.ts` out of sync after manual edit        | Pipeline not run after `gms-data.js` update |
| LL-P01   | P        | Sprint overcommitment in ZATCA sprints (6-7)             | ZATCA spec complexity underestimated    |
| LL-C01   | C        | Arabic translation keys missing for new screens          | No checklist requiring AR keys in DoD   |
| LL-Q01   | Q        | RTL layout broken on 3 screens after Tailwind upgrade    | No automated RTL visual regression      |

---

## 7. Action Tracking

### 7.1 Action Item Lifecycle

```
Identified (Retro) -> Assigned (Owner + Deadline) -> In Progress -> Completed -> Verified
```

### 7.2 Review Process

- **Sprint level:** Open action items reviewed at each sprint retrospective
- **Monthly:** PM compiles action item completion rate for steering committee
- **Closure:** All action items must be completed or explicitly deferred before project closure (see [Closure Report](closure-report.md))

### 7.3 Completion Metrics

| Metric                            | Target     |
|-----------------------------------|------------|
| Action items closed within 2 sprints | >= 80%  |
| Recurring lessons (same root cause)  | < 10%   |
| Lessons captured per sprint          | >= 3    |

---

## 8. Knowledge Sharing

### 8.1 Distribution Channels

| Channel                    | Audience          | Frequency        |
|----------------------------|-------------------|------------------|
| Sprint retrospective notes | Full team         | Per sprint       |
| Lessons digest email       | Steering committee| Monthly          |
| Wiki/knowledge base update | Future team members| As lessons close |
| Onboarding deck update     | New hires         | Per milestone     |

### 8.2 Cross-Project Value

Lessons with applicability beyond SALIS AUTO (e.g., PGlite adoption, ZATCA integration patterns, Drizzle ORM multi-tenant patterns) are flagged for the organization's knowledge base with the tag `cross-project`.

---

## 9. Related Documents

- [Risk Register](pmp/risk-register.md) -- Lessons feed new risk identification
- [Change Management](change-management.md) -- Recurring CRs trigger lessons
- [Closure Report](closure-report.md) -- Final lessons captured at project end
- [Governance Framework](governance-framework.md) -- Retrospective authority
- [Resource Management Plan](resource-management.md) -- Onboarding material updates
