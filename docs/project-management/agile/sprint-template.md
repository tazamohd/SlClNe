# SALIS AUTO -- Sprint Template

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-AGI-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document provides the reusable sprint template for the SALIS AUTO project, including planning artifacts, ceremony schedule, velocity tracking, and sprint reporting. Each 2-week sprint follows this structure.

---

## 2. Sprint Parameters

| Parameter               | Value                                          |
|-------------------------|------------------------------------------------|
| Sprint duration         | 2 weeks (10 working days)                      |
| Team size               | 6 developers + 1 QA + 1 Scrum Master           |
| Target velocity         | 40 story points                                |
| Working hours           | Sunday--Thursday, 09:00--18:00 AST (UTC+3)     |
| Time zone               | Arabia Standard Time (AST)                     |
| Sprint numbering        | S1, S2, ... S23                                |
| Tools                   | Jira/Linear for tracking, GitHub for code       |

Note: Saudi workweek is Sunday through Thursday.

---

## 3. Sprint Planning Template

### 3.1 Sprint Header

```
Sprint: S[N]
Dates: [Start Date] -- [End Date]
Sprint Goal: [One-sentence description of the sprint's primary objective]
Domain Focus: [Primary domain(s) for this sprint]
Capacity: [Available SP based on team availability]
```

### 3.2 Sprint Backlog

| Story ID   | Title                            | Points | Assignee    | Status        |
|------------|----------------------------------|--------|-------------|---------------|
|            |                                  |        |             | To Do         |
|            |                                  |        |             | To Do         |
|            |                                  |        |             | To Do         |
|            |                                  |        |             | To Do         |
|            |                                  |        |             | To Do         |

**Total committed:** [X] SP / [40] SP capacity

### 3.3 Sprint Risks and Dependencies

| Risk/Dependency                          | Impact         | Mitigation                    |
|------------------------------------------|----------------|-------------------------------|
|                                          |                |                               |

### 3.4 Carry-Over from Previous Sprint

| Story ID   | Title                    | Points | Reason for Carry-Over         |
|------------|--------------------------|--------|-------------------------------|
|            |                          |        |                               |

---

## 4. Ceremony Schedule

All times in Arabia Standard Time (AST, UTC+3).

### 4.1 Sprint Day 1 (Sunday)

| Time    | Ceremony          | Duration | Participants              | Purpose                          |
|---------|--------------------|----------|---------------------------|----------------------------------|
| 09:00   | Sprint Planning    | 2 hours  | Scrum team + PO           | Select stories, estimate, commit |

### 4.2 Daily (Sunday--Thursday)

| Time    | Ceremony          | Duration | Participants              | Purpose                          |
|---------|--------------------|----------|---------------------------|----------------------------------|
| 09:30   | Daily Standup      | 15 min   | Dev team + SM             | Yesterday, today, blockers       |

### 4.3 Sprint Day 4 (Wednesday)

| Time    | Ceremony          | Duration | Participants              | Purpose                          |
|---------|--------------------|----------|---------------------------|----------------------------------|
| 14:00   | Backlog Refinement | 1 hour   | PO, TL, Senior devs      | Groom next sprint candidates     |

### 4.4 Sprint Day 9 (Thursday, Week 2)

| Time    | Ceremony          | Duration | Participants              | Purpose                          |
|---------|--------------------|----------|---------------------------|----------------------------------|
| 14:00   | Backlog Refinement | 1 hour   | PO, TL, Senior devs      | Final grooming for next sprint   |

### 4.5 Sprint Day 10 (Last Day)

| Time    | Ceremony          | Duration | Participants              | Purpose                          |
|---------|--------------------|----------|---------------------------|----------------------------------|
| 10:00   | Sprint Review      | 1 hour   | All stakeholders          | Demo completed work              |
| 14:00   | Sprint Retrospective| 1 hour  | Scrum team                | What worked, what didn't, actions|

---

## 5. Daily Standup Format

Each team member answers three questions (time-boxed to 2 minutes per person):

1. **Yesterday:** What did I complete? (Reference story IDs)
2. **Today:** What will I work on?
3. **Blockers:** Is anything blocking my progress?

### Standup Rules

- Stand-up is synchronous (video call for remote team members).
- Discussions beyond the three questions are taken offline ("parking lot").
- Scrum Master logs blockers and follows up within 4 hours.
- If a blocker is not resolved within 24 hours, it escalates per the [Communication Plan](../pmp/communication-plan.md).

---

## 6. Sprint Board Columns

| Column          | Entry Criteria                              | Exit Criteria                              |
|-----------------|---------------------------------------------|--------------------------------------------|
| Backlog         | Story meets Definition of Ready             | Pulled into sprint                         |
| To Do           | Story committed in sprint planning          | Developer starts work                      |
| In Progress     | Developer has started implementation        | Code complete, local tests pass            |
| Code Review     | PR submitted, CI green                      | Approved by peer reviewer                  |
| QA              | PR merged to dev branch                     | QA verifies acceptance criteria            |
| Done            | Meets [Definition of Done](definition-of-done.md) | N/A                               |

---

## 7. Velocity Tracking

### 7.1 Sprint Velocity Log

| Sprint | Committed (SP) | Completed (SP) | Velocity | Carry-Over (SP) | Notes                     |
|--------|-----------------|-----------------|----------|------------------|---------------------------|
| S1     |                 |                 |          |                  |                           |
| S2     |                 |                 |          |                  |                           |
| S3     |                 |                 |          |                  |                           |

### 7.2 Velocity Chart Tracking

Track the following metrics per sprint:

- **Committed velocity:** Story points committed at sprint planning.
- **Completed velocity:** Story points meeting DoD at sprint end.
- **Rolling average:** 3-sprint moving average (used for capacity planning).
- **Trend indicator:** Increasing, stable, or decreasing.

### 7.3 Velocity Alerts

| Condition                           | Action                                          |
|-------------------------------------|-------------------------------------------------|
| Completed < 80% of committed       | Scrum Master investigates root cause            |
| 3-sprint average drops > 20%       | PM reviews staffing and blockers                |
| Carry-over > 15 SP for 2 sprints   | PO and PM review scope and commitment approach  |

---

## 8. Sprint Report Template

### 8.1 Sprint Summary

```
Sprint: S[N]
Sprint Goal: [Goal statement]
Goal Achieved: [Yes / Partial / No]
Velocity: [Completed SP] / [Committed SP]
Stories Completed: [X] / [Y]
Bugs Found: [N] (P1: [n], P2: [n], P3: [n], P4: [n])
Carry-Over: [List of story IDs]
```

### 8.2 Burndown Data

| Day | Ideal Remaining (SP) | Actual Remaining (SP) |
|-----|----------------------|-----------------------|
| 1   | 40                   |                       |
| 2   | 36                   |                       |
| 3   | 32                   |                       |
| 4   | 28                   |                       |
| 5   | 24                   |                       |
| 6   | 20                   |                       |
| 7   | 16                   |                       |
| 8   | 12                   |                       |
| 9   | 8                    |                       |
| 10  | 0                    |                       |

### 8.3 Retrospective Actions

| Action Item                          | Owner     | Due Date    | Status    |
|--------------------------------------|-----------|-------------|-----------|
|                                      |           |             |           |

---

## 9. Sprint 0 (Foundation Sprint)

Sprint 0 is a special sprint focused on infrastructure setup, not feature delivery:

| Task                                          | Owner       | Points |
|-----------------------------------------------|-------------|--------|
| Vite + TypeScript + TailwindCSS scaffold      | Frontend    | 3      |
| React Router 7 routing skeleton               | Frontend    | 5      |
| TanStack React Query setup                    | Frontend    | 3      |
| i18n framework (EN/AR) scaffold               | Frontend    | 8      |
| Express API scaffold + middleware              | Backend     | 5      |
| Drizzle ORM + PostgreSQL connection            | Backend     | 5      |
| PGlite local dev environment                  | Backend     | 3      |
| CI/CD pipeline (lint, test, build, deploy)     | DevOps      | 8      |
| Multi-tenant schema design                    | Backend     | 8      |
| Development environment documentation         | All         | 3      |

Sprint 0 velocity is not counted in the rolling average.

---

## 10. Domain-Sprint Mapping

Reference mapping showing which sprints target which domains (per [Schedule Management](../pmp/schedule-management.md)):

| Sprint   | Domain Focus                                     |
|----------|--------------------------------------------------|
| S0       | Infrastructure (Sprint 0)                        |
| S1--S3   | Foundation: Auth, RBAC, i18n                     |
| S4--S6   | Workshop lifecycle                                |
| S7       | Registry (Customers & Vehicles)                  |
| S8--S10  | Finance + ZATCA                                  |
| S11      | Accounting                                       |
| S12      | Parts & Inventory                                |
| S13      | CRM & Marketing                                  |
| S14      | AI Platform                                      |
| S15--S16 | Call Center + Team & HR                          |
| S17      | Portals (Customer, Supplier, Technician)         |
| S18--S20 | Integration + Reports & Analytics                |
| S21--S22 | Testing & Hardening                              |
| S23      | UAT + Deployment                                 |

---

## 11. References

- [Definition of Done](definition-of-done.md)
- [Product Backlog](product-backlog.md)
- [User Stories](user-stories.md)
- [Schedule Management Plan](../pmp/schedule-management.md)
- [Communication Plan](../pmp/communication-plan.md)
