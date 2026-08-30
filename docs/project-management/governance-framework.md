# SALIS AUTO -- Governance Framework

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PM-GV-001                               |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the decision-making structure, authority levels, escalation paths, and reporting framework for the SALIS AUTO project. It ensures that decisions regarding 13 domains, 191+ screens, 14 RBAC roles, ZATCA compliance, and multi-tenant architecture follow clear ownership and accountability lines. This framework is referenced by the [Change Management Plan](change-management.md) and [Closure Report](closure-report.md).

---

## 2. Project Governance Structure

### 2.1 Governance Hierarchy

```
Steering Committee
    |
    |-- Project Sponsor
    |
    |-- Product Owner
    |       |
    |       |-- Project Manager
    |               |
    |               |-- Tech Lead
    |               |       |-- Development Team
    |               |       |-- DevOps Engineer
    |               |
    |               |-- QA Lead
    |               |       |-- QA Engineers
    |               |
    |               |-- UI/UX Designer
    |               |-- Arabic Linguist
```

### 2.2 Role Definitions

| Role                  | Responsibilities                                                        | Authority Level |
|-----------------------|-------------------------------------------------------------------------|-----------------|
| Steering Committee    | Strategic direction, major investment decisions, go/no-go gates         | Final           |
| Project Sponsor       | Budget authority, executive escalation, organizational roadblocks       | Executive       |
| Product Owner         | Feature prioritization, acceptance criteria, business rule decisions    | Business        |
| Project Manager       | Schedule, resource allocation, risk management, stakeholder reporting   | Operational     |
| Tech Lead             | Architecture decisions, code standards, technical debt prioritization   | Technical       |
| QA Lead               | Quality standards, test strategy, release readiness                     | Quality         |

---

## 3. RACI Matrix

### 3.1 Key Decisions

R = Responsible, A = Accountable, C = Consulted, I = Informed

| Decision                            | Steering Committee | Sponsor | Product Owner | PM  | Tech Lead | QA Lead |
|-------------------------------------|-------------------|---------|---------------|-----|-----------|---------|
| Feature prioritization              | I                 | I       | A             | R   | C         | C       |
| Architecture choices                | I                 | I       | C             | I   | A/R       | C       |
| Technology selection                | C                 | I       | C             | C   | A/R       | I       |
| Security policies                   | A                 | C       | I             | C   | R         | C       |
| RBAC role/permission changes        | I                 | I       | A             | C   | R         | C       |
| ZATCA compliance approach           | C                 | A       | C             | C   | R         | C       |
| Sprint scope commitment             | I                 | I       | A             | R   | C         | C       |
| Release go/no-go                    | A                 | C       | C             | R   | C         | R       |
| Budget allocation                   | A                 | R       | C             | C   | I         | I       |
| Vendor selection                    | A                 | C       | C             | R   | C         | I       |
| Deployment strategy                 | I                 | I       | I             | C   | A/R       | C       |
| Data model changes (Drizzle schema) | I                 | I       | C             | I   | A/R       | C       |
| UI/UX design decisions              | I                 | I       | A             | C   | C         | I       |
| Arabic/RTL content sign-off         | I                 | I       | A             | C   | I         | C       |
| Incident response activation        | I                 | I       | I             | C   | A/R       | C       |
| Project closure                     | A                 | R       | C             | R   | C         | C       |

### 3.2 Domain-Specific Decisions

| Domain Decision                      | Primary Authority | Consulted           |
|--------------------------------------|-------------------|---------------------|
| Workshop lifecycle flow changes      | Product Owner     | Tech Lead, domain dev |
| Finance/ZATCA invoice format         | Tech Lead         | Product Owner, ZATCA contractor |
| RBAC matrix modifications            | Product Owner     | Tech Lead, QA Lead  |
| Database schema migrations           | Tech Lead         | Sr. Backend Dev, PM |
| Third-party API integration design   | Tech Lead         | PM (vendor), domain dev |
| Customer portal UX decisions         | Product Owner     | UI/UX Designer, Arabic Linguist |
| Performance optimization priorities  | Tech Lead         | QA Lead, DevOps     |
| Multi-tenant isolation policy        | Tech Lead         | Security auditor    |

---

## 4. Escalation Matrix

### 4.1 Escalation Levels

| Level | Escalation Point       | Triggered When                                                  | Response Time |
|-------|------------------------|----------------------------------------------------------------|---------------|
| L1    | Team Lead (Tech Lead)  | Technical disagreement between developers                      | Same day      |
| L2    | Project Manager        | Cross-team conflict, resource contention, schedule risk         | 1 business day|
| L3    | Product Owner          | Feature scope dispute, business rule ambiguity, priority clash | 2 business days|
| L4    | Steering Committee     | Budget overrun, strategic direction change, go/no-go decision  | 1 week        |

### 4.2 Escalation Scenarios

| Scenario                                        | Starting Level | Max Level | Example                                   |
|-------------------------------------------------|----------------|-----------|-------------------------------------------|
| Two devs disagree on implementation approach     | L1             | L2        | REST vs GraphQL for a new endpoint        |
| Domain priority conflict (Workshop vs Finance)   | L2             | L3        | Both need the same Sr. Backend Dev        |
| ZATCA spec change requires major rework          | L2             | L4        | ZATCA Phase 2 spec updated mid-sprint     |
| Budget needed for new vendor/tool                | L3             | L4        | Switch from AWS to STC Cloud              |
| Security vulnerability in production             | L1             | L2        | Immediate fix, post-mortem later          |
| Feature request from steering committee member   | L3             | L3        | Follows [Change Management](change-management.md) |

### 4.3 Escalation Process

1. **Raise** -- Person identifies the issue and attempts resolution at their level
2. **Document** -- Issue logged with context, options considered, and recommendation
3. **Escalate** -- Forwarded to next level with all documentation
4. **Decide** -- Decision maker responds within the level's response time
5. **Communicate** -- Decision communicated back down the chain
6. **Track** -- Decision logged in the Decision Log (Section 5)

---

## 5. Decision Log

### 5.1 Template

| Decision ID | Date       | Description                        | Decision Maker    | Options Considered     | Decision         | Rationale                          |
|-------------|------------|------------------------------------|-------------------|------------------------|------------------|------------------------------------|
| DEC-001     | [Date]     | [What was decided]                 | [Role/Name]       | [Option A, Option B]   | [Chosen option]  | [Why this option was selected]     |

### 5.2 Mandatory Logging

The following decisions must always be logged:

- Architecture and technology choices affecting multiple domains
- ZATCA compliance decisions and interpretations
- RBAC permission changes (role additions, module access changes)
- Vendor selection and contract decisions
- Database schema changes affecting 3+ tables
- Security policy changes
- Deployment strategy changes
- Any decision made at L3 or L4 escalation level

---

## 6. Steering Committee Charter

### 6.1 Composition

| Member                   | Role                     | Voting Rights |
|--------------------------|--------------------------|---------------|
| Executive Sponsor        | Chair                    | Yes (casting) |
| Product Owner            | Business representative  | Yes           |
| Project Manager          | Project representative   | Yes           |
| Tech Lead                | Technical representative | Yes           |
| External Advisor (ZATCA) | Regulatory advisor       | Advisory only |
| Finance Representative   | Budget oversight         | Yes           |

### 6.2 Meeting Cadence

| Meeting Type             | Frequency   | Duration   | Agenda Focus                              |
|--------------------------|-------------|------------|-------------------------------------------|
| Regular steering         | Monthly     | 90 minutes | Status, risks, budget, decisions          |
| Stage-gate review        | Per stage   | 120 minutes| Deliverable review, go/no-go              |
| Emergency session        | As needed   | 60 minutes | Critical risk, regulatory change          |
| Project closure          | Once        | Half-day   | Final review, acceptance, sign-off        |

### 6.3 Authority

The Steering Committee has authority to:

- Approve or reject stage-gate transitions
- Approve budget changes exceeding SAR 50,000
- Approve scope changes exceeding 20 story points
- Authorize emergency changes to ZATCA compliance approach
- Make go/no-go decisions for production release
- Approve project closure

---

## 7. Reporting Framework

### 7.1 Reporting Cadence

| Report                   | Audience             | Frequency   | Owner          | Format           |
|--------------------------|----------------------|-------------|----------------|------------------|
| Daily standup notes      | Development team     | Daily       | Scrum Master   | Slack/Teams post |
| Sprint status report     | PM, Product Owner    | Bi-weekly   | Scrum Master   | Template below   |
| Weekly status report     | Stakeholders         | Weekly      | PM             | Email + dashboard|
| Monthly steering report  | Steering Committee   | Monthly     | PM             | Slide deck       |
| Risk report              | PM, Steering         | Bi-weekly   | PM             | Risk register    |
| Quality report           | QA Lead, PM          | Per sprint  | QA Lead        | Test dashboard   |

### 7.2 Sprint Status Report Template

```
SPRINT STATUS -- Sprint [N] ([Start Date] -- [End Date])
=========================================================
Velocity:        [Committed SP] / [Completed SP]
Domains Active:  [List domains worked on]
Burndown:        [On track / Behind / Ahead]

COMPLETED
---------
- [Story/Task]: [Brief description]

IN PROGRESS
-----------
- [Story/Task]: [Brief description] -- [% complete]

BLOCKED
-------
- [Story/Task]: [Blocker description] -- [Escalation level]

RISKS
-----
- [Risk]: [Probability] x [Impact] = [Score] -- [Mitigation]

NEXT SPRINT PREVIEW
--------------------
- [Planned stories for next sprint]
```

### 7.3 Monthly Steering Report Contents

1. Executive summary (project health: Green/Amber/Red)
2. Scope progress (screens delivered / total, domains completed)
3. Schedule status (actual vs. planned sprint completion)
4. Budget status (spend vs. forecast, variance analysis)
5. Risk dashboard (top 5 risks with scores and mitigations)
6. Change request summary (submitted, approved, rejected, implemented)
7. Quality metrics (test coverage, bug counts, defect escape rate)
8. Decisions requiring steering committee input
9. Next month outlook

---

## 8. Gate Reviews

### 8.1 Stage-Gate Criteria

Aligned with PRINCE2 stages and the project timeline from [Schedule Management](pmp/schedule-management.md):

| Gate  | Stage                      | Entry Criteria                                          | Exit Criteria                                             |
|-------|----------------------------|---------------------------------------------------------|-----------------------------------------------------------|
| G0    | Project Initiation         | Charter approved, team assembled                        | Architecture documented, dev env operational              |
| G1    | Foundation & Auth          | Dev env working, PGlite operational                     | Auth flow complete (login, JWT, refresh, RBAC middleware) |
| G2    | Core Domains               | Auth verified, design-data pipeline running             | Workshop + Registry screens delivered, API endpoints live |
| G3    | Finance & Compliance       | Core domains accepted                                   | ZATCA Phase 2 sandbox certified, SAR math verified       |
| G4    | Extended Domains           | ZATCA certified                                         | CRM, HR, Inventory, Call Center domains delivered         |
| G5    | Portals & Integration      | All backend APIs complete                               | Customer/Supplier portals working, E2E tests passing     |
| G6    | Hardening & Launch         | All features complete, no P1/P2 bugs                    | Performance targets met, security audit passed            |
| G7    | Project Closure            | Production deployed, warranty period defined             | Closure report signed, handover complete                  |

### 8.2 Gate Review Process

1. **Preparation** (1 week before): PM compiles gate deliverables and metrics
2. **Review meeting:** Steering Committee reviews against exit criteria
3. **Decision:** Go (proceed to next stage), Conditional Go (proceed with conditions), No-Go (rework required)
4. **Documentation:** Decision logged, conditions tracked, timeline updated

### 8.3 Gate Review Attendees

| Gate | Required Attendees                                           |
|------|--------------------------------------------------------------|
| G0   | Sponsor, Product Owner, PM, Tech Lead                        |
| G1   | PM, Tech Lead, QA Lead                                       |
| G2   | Product Owner, PM, Tech Lead, QA Lead                        |
| G3   | Steering Committee (full) -- ZATCA compliance is a go-live blocker |
| G4   | Product Owner, PM, Tech Lead                                  |
| G5   | Product Owner, PM, Tech Lead, QA Lead                         |
| G6   | Steering Committee (full) -- production release decision      |
| G7   | Steering Committee (full) -- project closure                  |

---

## 9. Communication Channels

| Channel              | Purpose                                    | Participants            |
|----------------------|--------------------------------------------|-------------------------|
| Slack #salis-dev     | Day-to-day development coordination        | All development team    |
| Slack #salis-pm      | PM updates, risk alerts, schedule changes  | PM, PO, Tech Lead, QA  |
| Email (steering)     | Formal reports and decisions               | Steering Committee      |
| Weekly call          | Cross-functional sync                      | PM, Tech Lead, QA Lead |
| GitHub Issues/PRs    | Technical decisions and code review        | Development team        |
| Decision log (wiki)  | Permanent record of decisions              | All stakeholders        |

---

## 10. Related Documents

- [Project Charter](pmp/project-charter.md) -- Project authority and objectives
- [Change Management Plan](change-management.md) -- CCB composition and change process
- [Risk Register](pmp/risk-register.md) -- Risk escalation procedures
- [Schedule Management Plan](pmp/schedule-management.md) -- Sprint and stage timeline
- [Resource Management Plan](resource-management.md) -- Team structure and allocation
- [Closure Report](closure-report.md) -- Final gate review and sign-off
- [Lessons Learned](lessons-learned.md) -- Retrospective governance
