# SALIS AUTO -- Communication Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-007                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the communication framework for the SALIS AUTO project, including channels, frequency, audience, and escalation paths. It ensures all stakeholders receive timely, relevant information in the appropriate format.

---

## 2. Communication Objectives

1. Keep all 14 stakeholder roles informed of project progress relevant to their interest level.
2. Surface blockers and risks within 24 hours of identification.
3. Provide bilingual (EN/AR) communication for end-user-facing materials.
4. Maintain a single source of truth for project status.
5. Enable rapid decision-making through clear escalation paths.

---

## 3. Communication Matrix

### 3.1 Recurring Communications

| Communication              | Audience                     | Channel        | Frequency     | Owner      | Format                    |
|----------------------------|------------------------------|----------------|---------------|------------|---------------------------|
| Daily Standup              | Dev team, QA                 | Video call     | Daily (15 min)| Scrum Master | Verbal (recorded notes)  |
| Sprint Planning            | Scrum team, PO               | Video call     | Biweekly      | Scrum Master | Meeting + backlog update |
| Sprint Review/Demo         | All internal stakeholders    | Video call     | Biweekly      | PO         | Live demo + recording     |
| Sprint Retrospective       | Scrum team                   | Video call     | Biweekly      | Scrum Master | Action items document    |
| Weekly Status Report       | PM, Sponsor, Tech Lead       | Email          | Weekly        | PM         | Status report template    |
| Monthly Steering Committee | Sponsor, PM, TL, PO          | Video call     | Monthly       | PM         | Slide deck + minutes      |
| Risk Review                | PM, TL, PO, QA Lead         | Video call     | Monthly       | PM         | Risk register update      |
| Stakeholder Newsletter     | All stakeholders             | Email          | Monthly       | PM         | Newsletter (EN/AR)        |

### 3.2 Event-Driven Communications

| Trigger                           | Audience                    | Channel           | Response Time | Owner      |
|-----------------------------------|-----------------------------|--------------------|---------------|------------|
| Critical bug (P1)                 | Dev team, PM, TL            | Slack + call       | Immediate     | QA Lead    |
| Risk score >= High (10+)          | PM, Sponsor                 | Email + call       | Within 4 hrs  | PM         |
| Scope change request              | CCB members                 | Email + meeting    | Within 2 days | PM         |
| ZATCA specification update        | Finance Lead, TL, PM        | Email + Slack      | Within 1 day  | TL         |
| Sprint velocity drop > 20%        | PM, PO, Scrum Master        | Standup + email    | Next standup  | Scrum Master|
| Milestone achieved                | All stakeholders            | Email + Slack      | Within 1 day  | PM         |
| Security vulnerability discovered | TL, PM, Sponsor             | Encrypted email    | Immediate     | Security Lead|
| Go-live readiness                 | All stakeholders            | Email + meeting    | 1 week prior  | PM         |

---

## 4. Communication Channels

### 4.1 Channel Definitions

| Channel          | Tool                | Purpose                                | Retention    |
|------------------|---------------------|----------------------------------------|--------------|
| Instant messaging | Slack               | Day-to-day team communication          | 90 days      |
| Video conferencing | Google Meet / Zoom | Ceremonies, demos, meetings            | Recording archived |
| Email             | Corporate email     | Formal communications, status reports  | Permanent    |
| Project management | Jira / Linear      | Backlog, sprint tracking, issue logging | Permanent   |
| Documentation     | Confluence / Notion | Meeting notes, decisions, architecture | Permanent    |
| Code review       | GitHub PRs          | Technical review and discussion         | Permanent    |
| Escalation        | Phone + email       | Urgent issues requiring immediate action| As needed   |

### 4.2 Slack Channel Structure

| Channel                     | Members                      | Purpose                          |
|-----------------------------|------------------------------|----------------------------------|
| `#salis-general`            | All team members             | General announcements            |
| `#salis-dev`                | Development team             | Technical discussions             |
| `#salis-frontend`           | Frontend engineers           | React, TypeScript, RTL, i18n     |
| `#salis-backend`            | Backend engineers            | Express, Drizzle, PostgreSQL     |
| `#salis-qa`                 | QA team                      | Testing, bugs, coverage          |
| `#salis-zatca`              | Finance lead, TL, PM         | ZATCA integration updates        |
| `#salis-incidents`          | TL, PM, DevOps               | Production incidents              |
| `#salis-releases`           | All team members             | Release announcements             |

---

## 5. Status Report Template

The weekly status report follows this structure:

### Header
- Report date and sprint number
- Overall RAG status (Red / Amber / Green)

### Sections

| Section               | Content                                                |
|-----------------------|--------------------------------------------------------|
| Accomplishments       | Stories completed, milestones reached                  |
| In Progress           | Active stories, percent complete                       |
| Blockers              | Issues blocking progress, owner, expected resolution   |
| Risks                 | New/changed risks from the [Risk Register](risk-register.md) |
| Upcoming              | Next sprint focus, upcoming milestones                 |
| Metrics               | Velocity, burndown, test coverage, bug count           |
| Decisions Needed      | Items requiring stakeholder decision                   |

---

## 6. Meeting Protocols

### 6.1 General Rules

- All meetings have a published agenda at least 4 hours in advance.
- Meeting notes are published within 24 hours.
- Action items include owner, due date, and tracking ID.
- Meetings start and end on time; no meeting exceeds 60 minutes without a break.
- Bilingual (EN/AR) materials for any meeting including end users.

### 6.2 Ceremony Schedule (Per Sprint)

| Day          | Time (AST)   | Ceremony                | Duration | Participants          |
|--------------|-------------|-------------------------|----------|-----------------------|
| Sprint Day 1 | 09:00       | Sprint Planning          | 2 hours  | Scrum team + PO       |
| Daily         | 09:30       | Daily Standup            | 15 min   | Dev team              |
| Sprint Day 9 | 14:00       | Backlog Refinement       | 1 hour   | PO, TL, Senior devs   |
| Sprint Day 10| 10:00       | Sprint Review/Demo       | 1 hour   | All stakeholders      |
| Sprint Day 10| 14:00       | Sprint Retrospective     | 1 hour   | Scrum team            |

Times are in Arabia Standard Time (UTC+3).

---

## 7. Escalation Path

### 7.1 Technical Escalation

```
Developer
  -> Team Lead (within 4 hours)
    -> Technical Lead (within 8 hours)
      -> Project Manager (within 24 hours)
        -> Executive Sponsor (within 48 hours)
```

### 7.2 Business/Scope Escalation

```
Any Stakeholder
  -> Product Owner (submits CR)
    -> Project Manager (impact analysis, within 2 days)
      -> Change Control Board (if > 3 SP or schedule impact)
        -> Executive Sponsor (if > 1 sprint delay)
```

### 7.3 Incident Escalation (Production)

| Severity  | Definition                               | Response Time | Notification         |
|-----------|------------------------------------------|---------------|----------------------|
| P1 - Critical | System down, data loss risk           | 15 minutes    | Phone + Slack all    |
| P2 - High    | Major feature broken, workaround exists | 1 hour       | Slack #incidents     |
| P3 - Medium  | Minor feature impact                    | 4 hours      | Slack #qa            |
| P4 - Low     | Cosmetic issue                          | Next sprint   | Jira ticket          |

---

## 8. Stakeholder-Specific Communication

### 8.1 Owner/CEO (S-01)

| Item                        | Detail                                     |
|-----------------------------|--------------------------------------------|
| Preferred channel           | Email summary + monthly steering committee |
| Information needs           | KPIs, budget, milestones, risks            |
| Communication style         | Executive summary; data-driven             |
| Language preference         | Arabic primary, English acceptable         |
| Frequency                   | Weekly email, monthly meeting              |

### 8.2 End Users (S-03 through S-12)

| Item                        | Detail                                     |
|-----------------------------|--------------------------------------------|
| Preferred channel           | Sprint demos, training sessions            |
| Information needs           | Feature availability, how-to guides        |
| Communication style         | Visual demos; practical examples           |
| Language preference         | Bilingual EN/AR                            |
| Frequency                   | Biweekly demos, as-needed training         |

### 8.3 External Stakeholders (S-13, S-14)

| Item                        | Detail                                      |
|-----------------------------|----------------------------------------------|
| Channel                     | Portal onboarding email, in-app notifications|
| Information needs           | How to use portal, PO/estimate status        |
| Language                    | Bilingual EN/AR                              |
| Frequency                   | Event-driven (new PO, estimate ready, etc.)  |

---

## 9. Communication Artifacts Repository

All communication artifacts are stored in the project documentation system:

| Artifact                  | Location                          | Access                |
|---------------------------|-----------------------------------|-----------------------|
| Meeting notes             | Confluence / Notion               | All team members      |
| Status reports            | Email archive + Confluence        | PM, Sponsor, TL       |
| Sprint recordings         | Google Drive / cloud storage      | All team members      |
| Risk register             | This repo: `docs/project-management/pmp/` | PM, TL, PO     |
| Decision log              | Confluence                        | All team members      |
| Incident reports          | Jira / GitHub Issues              | Dev team, PM          |

---

## 10. Plan Review

This communication plan is reviewed and updated:

- At project phase boundaries (per [Schedule Management](schedule-management.md) milestones).
- When a new stakeholder is identified.
- After any communication failure or escalation incident.
- At quarterly steering committee meetings.

---

## 11. References

- [Project Charter](project-charter.md)
- [Stakeholder Register](stakeholder-register.md)
- [Risk Register](risk-register.md)
- [Schedule Management Plan](schedule-management.md)
- [Sprint Template](../agile/sprint-template.md)
