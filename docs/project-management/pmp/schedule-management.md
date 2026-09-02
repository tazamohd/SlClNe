# SALIS AUTO -- Schedule Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the schedule baseline for the SALIS AUTO platform, including milestones, dependencies, the critical path, and Gantt overview. It provides the framework for tracking progress and managing schedule changes.

---

## 2. Schedule Methodology

The project follows a hybrid approach:

- **Milestones and phases** are managed via a traditional waterfall schedule (this document).
- **Work within each phase** is executed in 2-week Scrum sprints (see [Sprint Template](../agile/sprint-template.md)).
- **Velocity baseline:** 40 story points per sprint (2-week iteration, team of 6 developers).
- **Total estimated effort:** 892 story points across 126 work packages (see [WBS](wbs.md)).
- **Estimated sprints:** 23 sprints (892 SP / 40 SP per sprint, rounded up).
- **Calendar duration:** 46 weeks of sprints + 6 weeks buffer = **52 weeks total**.

---

## 3. Milestone Plan

| Milestone ID | Milestone                              | Target Date   | Phase         | Gate Criteria                                    |
|--------------|----------------------------------------|---------------|---------------|--------------------------------------------------|
| M1           | Project Kickoff                        | Week 1        | Initiation    | Charter signed, team onboarded                   |
| M2           | Planning Complete                      | Week 6        | Planning      | WBS, backlog, schedule, risk register baselined   |
| M3           | Foundation Ready                       | Week 12       | Foundation    | Auth, RBAC, i18n, CI/CD, DB schema operational    |
| M4           | Workshop Domain Live                   | Week 18       | Core          | Job lifecycle state machine E2E passing            |
| M5           | Registry Domain Live                   | Week 20       | Core          | Customer/vehicle CRUD + Saudi validations          |
| M6           | Finance + ZATCA Sandbox                | Week 26       | Core          | ZATCA sandbox integration tests passing            |
| M7           | Accounting Domain Live                 | Week 28       | Core          | Double-entry journal + trial balance functional    |
| M8           | Parts & Inventory Live                 | Week 30       | Core          | PO lifecycle + approval chain functional           |
| M9           | Extended Domains Complete              | Week 40       | Extended      | CRM, HR, Call Center, AI, Portals functional       |
| M10          | ZATCA Production Certified             | Week 44       | Integration   | ZATCA production certificate obtained              |
| M11          | Integration Complete                   | Week 46       | Integration   | Notifications, approvals, events wired end-to-end  |
| M12          | Testing Complete                       | Week 50       | Testing       | All coverage targets met, zero P1 bugs             |
| M13          | UAT Sign-Off                           | Week 51       | Deployment    | >= 85% UAT pass rate, stakeholder approval          |
| M14          | Production Go-Live                     | Week 52       | Deployment    | Cutover complete, monitoring active                 |

---

## 4. Phase Schedule Detail

### Phase 1: Initiation (Weeks 1--2)

| Activity                                | Duration | Dependencies | Owner          |
|-----------------------------------------|----------|--------------|----------------|
| Finalize project charter                | 3 days   | None         | PM             |
| Identify and engage stakeholders        | 3 days   | None         | PM             |
| Set up project management tools         | 2 days   | None         | PM             |
| Conduct kickoff meeting                 | 1 day    | Charter      | PM + Sponsor   |

### Phase 2: Planning (Weeks 3--6)

| Activity                                | Duration | Dependencies   | Owner        |
|-----------------------------------------|----------|----------------|--------------|
| Create WBS                              | 1 week   | Charter        | PM + TL      |
| Build schedule baseline                 | 1 week   | WBS            | PM           |
| Develop risk register                   | 3 days   | WBS            | PM + TL      |
| Write product backlog (epics + stories) | 2 weeks  | WBS            | PO + TL      |
| Sprint 0: environment setup, tooling    | 2 weeks  | Parallel       | Dev Team     |
| Define communication plan               | 2 days   | Stakeholders   | PM           |

### Phase 3: Foundation (Weeks 7--12)

| Sprint | Focus                                          | Story Points |
|--------|-------------------------------------------------|-------------|
| S1     | DB schema, Drizzle migrations, PGlite dev env  | 40          |
| S2     | Auth: JWT, refresh rotation, login UI           | 40          |
| S3     | RBAC: roles, permissions, can() hook, middleware | 40          |

### Phase 4: Core Domains (Weeks 13--30)

| Sprint | Focus                                              | Story Points |
|--------|----------------------------------------------------|-------------|
| S4     | Workshop: job card schema, state machine            | 40          |
| S5     | Workshop: check-in, inspection, estimate builder    | 40          |
| S6     | Workshop: repair, QC, delivery + bay management     | 40          |
| S7     | Registry: customer + vehicle CRUD, Saudi validation  | 40          |
| S8     | Finance: invoice schema, halala math, payment recording | 40      |
| S9     | Finance: ZATCA XML, QR code, hash chain              | 40          |
| S10    | Finance: ZATCA API integration, credit notes          | 40          |
| S11    | Accounting: CoA, journals, trial balance              | 40          |
| S12    | Parts: stock, PO lifecycle, approval chain            | 40          |

### Phase 5: Extended Domains (Weeks 31--40)

| Sprint | Focus                                               | Story Points |
|--------|-----------------------------------------------------|-------------|
| S13    | CRM: segmentation, campaigns, loyalty                | 40          |
| S14    | AI Platform: OBD parser, 5-desk handoff              | 40          |
| S15    | Call Center: tickets, escalation + HR: employees     | 40          |
| S16    | HR: attendance, leave, payroll prep                   | 40          |
| S17    | Portals: customer portal + estimate e-signature       | 40          |

### Phase 6: Integration (Weeks 41--46)

| Sprint | Focus                                              | Story Points |
|--------|----------------------------------------------------|-------------|
| S18    | ZATCA production cert + notification fan-out        | 40          |
| S19    | Approval orchestrator + multi-tenant onboarding     | 40          |
| S20    | Reports & Analytics dashboards + export             | 40          |

### Phase 7: Testing & Hardening (Weeks 47--50)

| Sprint | Focus                                              | Story Points |
|--------|----------------------------------------------------|-------------|
| S21    | Unit + integration test gap closure                  | 40          |
| S22    | E2E Playwright + RTL visual regression               | 40          |

### Phase 8: Deployment (Weeks 51--52)

| Sprint | Focus                                    | Story Points |
|--------|------------------------------------------|-------------|
| S23    | UAT, data migration, go-live, monitoring | 40          |

---

## 5. Critical Path

The critical path runs through the following sequence, where any delay directly impacts the go-live date:

```
M1 (Kickoff)
  -> Foundation: Auth + RBAC (S1-S3)
    -> Workshop Domain (S4-S6)
      -> Finance + ZATCA Sandbox (S8-S10)
        -> ZATCA Production Certification (S18)
          -> Integration Testing (S21-S22)
            -> UAT + Go-Live (S23)
              -> M14 (Production Go-Live)
```

### Critical Path Dependencies

| From                     | To                           | Type   | Lag   |
|--------------------------|------------------------------|--------|-------|
| Auth + RBAC              | Workshop Domain              | FS     | 0     |
| Workshop Domain          | Finance (invoices from jobs) | FS     | 0     |
| Finance (ZATCA Sandbox)  | ZATCA Production Cert        | FS     | 0     |
| ZATCA Production Cert    | Integration Testing          | FS     | 0     |
| Integration Testing      | UAT                          | FS     | 0     |
| UAT                      | Go-Live                      | FS     | 0     |

**FS** = Finish-to-Start. No lag assumed; buffer absorbed in the 6-week project reserve.

### Near-Critical Paths

- **Registry -> Workshop:** Vehicle lookup is needed for check-in; Registry development runs parallel to Workshop S4 with a cross-team dependency on the vehicle API.
- **Parts -> Workshop:** Parts requests during repair depend on inventory APIs; partially parallelizable.
- **Portals -> Finance:** Customer portal estimate approval depends on the estimate builder in Workshop and invoice viewer in Finance.

---

## 6. Schedule Change Control

| Change Impact               | Authority         | Process                                      |
|-----------------------------|-------------------|----------------------------------------------|
| Within sprint (< 3 SP swap) | Scrum Master      | Adjust sprint backlog during daily standup    |
| 1 sprint delay              | Project Manager   | Re-sequence backlog, update schedule baseline |
| > 1 sprint delay            | Change Control Board | Formal CR per [Scope Statement](scope-statement.md) |
| Milestone date change       | Executive Sponsor | CCB recommendation + sponsor approval         |

---

## 7. Schedule Tracking

| Metric               | Tool / Method                            | Frequency   |
|----------------------|------------------------------------------|-------------|
| Sprint velocity      | TanStack/Jira burndown chart             | Per sprint  |
| Milestone variance   | Earned Value Management (SPI)            | Biweekly    |
| Critical path health | Gantt chart review                       | Weekly      |
| Blocker aging        | Daily standup + impediment log           | Daily       |

---

## 8. Gantt Overview (Text Representation)

```
Week:  1    6    12   18   24   30   36   40   46   50  52
       |    |    |    |    |    |    |    |    |    |   |
Init   [==]
Plan        [====]
Foundation       [======]
Workshop              [======]
Registry                  [==]
Finance                    [========]
Accounting                       [====]
Parts/Inv                          [====]
CRM                                     [====]
AI Platform                              [====]
Call Center                                [==]
HR                                         [====]
Portals                                      [====]
Integration                                       [======]
Testing                                                 [====]
Deploy                                                      [==]
       |    |    |    |    |    |    |    |    |    |   |
       M1   M2   M3   M4        M6        M9   M10  M12 M14
```

---

## 9. References

- [Project Charter](project-charter.md)
- [Work Breakdown Structure](wbs.md)
- [Sprint Template](../agile/sprint-template.md)
- [Risk Register](risk-register.md)
- [Release Plan](../planning/release-plan.md)
