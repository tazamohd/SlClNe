# SALIS AUTO -- Resource Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PM-RM-001                               |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the team structure, skill requirements, resource allocation, and capacity planning for the SALIS AUTO project. It covers staffing across 13 domains, 191+ screens, and a bilingual (EN/AR) tech stack spanning React 18, TypeScript, Express/Fastify, Drizzle ORM, and PostgreSQL. Related scheduling is detailed in the [Schedule Management Plan](pmp/schedule-management.md).

---

## 2. Development Team Structure

### 2.1 Core Roles

| Role                | Count | Responsibility                                                         |
|---------------------|-------|------------------------------------------------------------------------|
| Project Manager     | 1     | Scope, schedule, risk, stakeholder management                          |
| Product Owner       | 1     | Backlog prioritization, acceptance criteria, domain expertise          |
| Tech Lead           | 1     | Architecture decisions, code review authority, technical risk          |
| Senior Frontend Dev | 2     | React 18, TypeScript, RTL layout, design-data pipeline, i18n          |
| Mid Frontend Dev    | 2     | Screen implementation, component library, Playwright E2E              |
| Senior Backend Dev  | 2     | Fastify/Express, Drizzle ORM, RBAC middleware, ZATCA integration      |
| Mid Backend Dev     | 1     | API endpoints, PGlite test harness, data migration scripts            |
| Full-Stack Dev      | 2     | Cross-cutting features (auth, notifications, portals)                  |
| DevOps Engineer     | 1     | CI/CD (GitHub Actions), Vercel/Netlify config, monitoring              |
| QA Engineer         | 2     | Vitest unit, supertest integration, Playwright E2E, RTL/RBAC testing  |
| UI/UX Designer      | 1     | Figma screens, Arabic typography, RTL layout validation                |
| Arabic Linguist     | 1     | Translation review, AR content QA, cultural appropriateness (part-time)|

**Total headcount:** 17 (16 full-time + 1 part-time linguist)

### 2.2 Reporting Structure

```
Product Owner
  |
Project Manager
  |-- Tech Lead
  |     |-- Senior Frontend Devs (2)
  |     |-- Mid Frontend Devs (2)
  |     |-- Senior Backend Devs (2)
  |     |-- Mid Backend Dev (1)
  |     |-- Full-Stack Devs (2)
  |     |-- DevOps Engineer (1)
  |
  |-- QA Lead (Senior QA)
  |     |-- QA Engineer (1)
  |
  |-- UI/UX Designer (1)
  |-- Arabic Linguist (1, part-time)
```

---

## 3. Skill Matrix

### 3.1 Technology Competencies

| Team Member Role     | React 18 | TypeScript | Express/Fastify | PostgreSQL | Drizzle ORM | Arabic/RTL | ZATCA | Playwright | Tailwind |
|----------------------|----------|------------|-----------------|------------|-------------|------------|-------|------------|----------|
| Tech Lead            | Expert   | Expert     | Expert          | Expert     | Expert      | Working    | Lead  | Working    | Expert   |
| Sr. Frontend Dev     | Expert   | Expert     | Basic           | Basic      | Basic       | Expert     | --    | Working    | Expert   |
| Mid Frontend Dev     | Working  | Working    | Basic           | --         | --          | Working    | --    | Expert     | Working  |
| Sr. Backend Dev      | Basic    | Expert     | Expert          | Expert     | Expert      | Basic      | Expert| --         | --       |
| Mid Backend Dev      | --       | Working    | Working         | Working    | Working     | --         | Working| Working   | --       |
| Full-Stack Dev       | Working  | Working    | Working         | Working    | Working     | Working    | Working| Basic     | Working  |
| DevOps Engineer      | Basic    | Basic      | Basic           | Working    | --          | --         | --    | Working    | --       |
| QA Engineer          | Working  | Working    | Working         | Working    | --          | Working    | Working| Expert    | Basic    |
| UI/UX Designer       | --       | --         | --              | --         | --          | Expert     | --    | --         | Expert   |

**Legend:** Expert (teaches others), Working (independent delivery), Basic (assisted delivery), -- (not required)

### 3.2 Domain Competencies

| Domain                  | Primary Owner         | Secondary             | Minimum Coverage |
|-------------------------|-----------------------|-----------------------|------------------|
| Workshop Operations     | Sr. Backend Dev 1     | Full-Stack Dev 1      | 2 developers     |
| Registry                | Sr. Frontend Dev 1    | Mid Frontend Dev 1    | 2 developers     |
| Finance                 | Sr. Backend Dev 2     | Full-Stack Dev 2      | 2 developers     |
| Accounting              | Sr. Backend Dev 2     | Mid Backend Dev       | 2 developers     |
| CRM & Marketing         | Full-Stack Dev 1      | Mid Frontend Dev 2    | 2 developers     |
| Administration          | Sr. Frontend Dev 2    | Full-Stack Dev 2      | 2 developers     |
| Authentication          | Tech Lead             | Sr. Backend Dev 1     | 2 developers     |
| AI Platform             | Full-Stack Dev 2      | Sr. Frontend Dev 1    | 2 developers     |
| Parts & Inventory       | Sr. Backend Dev 1     | Mid Backend Dev       | 2 developers     |
| Call Center             | Full-Stack Dev 1      | Mid Frontend Dev 1    | 1 developer      |
| Reports & Analytics     | Sr. Frontend Dev 1    | Sr. Backend Dev 2     | 2 developers     |
| Team & HR               | Mid Frontend Dev 2    | Full-Stack Dev 2      | 1 developer      |
| Portals                 | Sr. Frontend Dev 2    | Mid Frontend Dev 2    | 2 developers     |

---

## 4. Resource Allocation by Phase

### 4.1 Phase Distribution (Sprints)

| Phase                      | Duration    | Frontend FTEs | Backend FTEs | QA FTEs | DevOps FTEs |
|----------------------------|-------------|---------------|--------------|---------|-------------|
| Foundation & Auth          | Sprints 1-2 | 2             | 3            | 1       | 1           |
| Core Workshop + Registry   | Sprints 3-5 | 3             | 3            | 2       | 0.5         |
| Finance & ZATCA            | Sprints 6-7 | 2             | 3            | 2       | 0.5         |
| CRM, HR, Inventory         | Sprints 8-9 | 3             | 2            | 2       | 0.5         |
| Portals & AI               | Sprint 10   | 3             | 2            | 2       | 0.5         |
| Integration & Polish       | Sprint 11   | 2             | 2            | 2       | 1           |
| Hardening & Launch         | Sprint 12   | 1             | 1            | 2       | 1           |

### 4.2 Capacity Planning

Sprint velocity assumptions (per 2-week sprint):

- **Senior developer:** 16 story points (accounts for code review, mentoring)
- **Mid developer:** 12 story points
- **QA engineer:** 10 story points (testing + automation)
- **Total team capacity per sprint:** ~164 story points

Peak demand occurs in Sprints 3-5 (Workshop + Registry) and Sprints 6-7 (ZATCA compliance), where the full team is engaged.

---

## 5. Resource Leveling

### 5.1 Conflict Resolution

When multiple domains compete for the same developer:

1. **Priority order:** Authentication > Workshop > Finance/ZATCA > other domains (see [Project Charter](pmp/project-charter.md) for business priorities)
2. **Bus factor rule:** No domain may have fewer than its minimum coverage count from Section 3.2
3. **Sprint commitment:** Developers commit to at most 2 domains per sprint
4. **Escalation:** PM resolves allocation conflicts; Product Owner arbitrates priority disputes

### 5.2 Known Bottlenecks

| Bottleneck                     | Risk                                          | Mitigation                                          |
|--------------------------------|-----------------------------------------------|-----------------------------------------------------|
| ZATCA expertise (1 expert)     | Single point of failure for e-invoicing       | Cross-train Full-Stack Dev 2 on ZATCA SDK           |
| Arabic/RTL skills (2 people)   | Blocks UI validation across 191+ screens      | Hire Arabic linguist part-time, automate RTL tests  |
| Drizzle ORM (2 experts)        | Schema changes bottleneck on Sr. Backend Devs | Pair programming sessions for mid devs              |
| Playwright E2E (1 expert)      | QA automation depends on single person         | Mid Frontend Dev 1 to shadow QA on test authoring   |

---

## 6. Onboarding Plan

### 6.1 New Team Member Onboarding (Week 1-2)

| Day  | Activity                                                                     |
|------|------------------------------------------------------------------------------|
| 1    | Dev environment setup: clone repo, `pnpm install`, PGlite dev database      |
| 1    | Read [Architecture](../architecture.md) and [Frontend Architecture](../system/architecture/frontend-architecture.md) |
| 2    | Walk through design-data pipeline: `gms-data.js` -> `port-design-data.mjs` -> `data/generated/` |
| 2    | Run existing test suite: `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright) |
| 3    | Shadow a senior dev on a small feature (observe PR process, code review)     |
| 3-5  | Complete assigned onboarding ticket (scoped to one screen in a low-risk domain) |
| 6-10 | Independent work on assigned domain with daily check-ins with domain owner   |

### 6.2 Knowledge Prerequisites

All team members must complete before sprint assignment:

- [ ] SALIS AUTO architecture walkthrough (2 hours, recorded)
- [ ] RBAC model briefing -- 14 roles, 28 modules, triple-layer enforcement
- [ ] ZATCA Phase 2 overview -- QR codes, hash chains, VAT 15% (backend devs only)
- [ ] RTL layout guidelines -- `dir="rtl"`, logical properties, mirroring rules
- [ ] Saudi business context -- workshop lifecycle, SAR currency, Saudi phone formats

---

## 7. Training Requirements

### 7.1 Technical Training

| Topic                            | Audience            | Duration | Delivery           |
|----------------------------------|---------------------|----------|--------------------|
| React 18 + TypeScript strict     | Mid devs            | 4 hours  | Workshop           |
| Drizzle ORM schema + migrations  | All backend devs    | 3 hours  | Pair session       |
| PGlite for local development     | All devs            | 1 hour   | Recorded demo      |
| Playwright E2E authoring         | QA + frontend devs  | 3 hours  | Workshop           |
| Fastify middleware pipeline      | Backend devs        | 2 hours  | Code walkthrough   |
| Design-data pipeline             | Frontend devs       | 2 hours  | Pair session       |

### 7.2 Domain Training

| Topic                            | Audience            | Duration | Delivery           |
|----------------------------------|---------------------|----------|--------------------|
| ZATCA Phase 2 regulations        | Backend devs, QA    | 4 hours  | External trainer   |
| Saudi business practices         | All team            | 2 hours  | PMO briefing       |
| Arabic language basics           | Non-Arabic speakers | 3 hours  | Linguist-led       |
| Workshop operations lifecycle    | All devs            | 2 hours  | Product Owner demo |
| Saudi data privacy requirements  | Tech Lead, DevOps   | 2 hours  | Legal briefing     |

---

## 8. Contractor vs. Full-Time Analysis

| Role/Skill             | Recommendation | Rationale                                                        |
|------------------------|----------------|------------------------------------------------------------------|
| Core React/TypeScript  | Full-time      | Long-term platform -- needs institutional knowledge              |
| Backend/Drizzle ORM    | Full-time      | Schema ownership requires continuity across sprints              |
| ZATCA compliance       | Contractor     | Specialized regulatory knowledge, peak demand in Sprints 6-7     |
| Arabic linguist        | Part-time      | Translation review is periodic, not full-sprint                  |
| Playwright automation  | Full-time      | Ongoing test maintenance across 191+ screens                     |
| DevOps                 | Full-time      | CI/CD pipeline requires continuous iteration                     |
| UI/UX Designer         | Full-time (80%)| Design workload is front-loaded but ongoing for RTL audits       |
| Security auditor       | Contractor     | Penetration testing and RBAC audit are milestone-gated           |

---

## 9. Resource Risk Register

| Risk                                   | Probability | Impact  | Mitigation                                                  |
|----------------------------------------|-------------|---------|-------------------------------------------------------------|
| ZATCA expert unavailability            | Medium      | High    | Document ZATCA integration thoroughly, cross-train backup   |
| Arabic linguist delay                  | Low         | Medium  | Use automated translation (DeepL) as interim, review later  |
| Developer attrition mid-project        | Medium      | High    | Ensure bus factor >= 2 per domain, maintain onboarding docs |
| Skill gap in Drizzle ORM              | Medium      | Medium  | Schedule training in Sprint 1, pair programming thereafter  |
| Sprint overcommitment                  | High        | Medium  | Enforce capacity limits, PM monitors velocity trends        |

---

## 10. Related Documents

- [Project Charter](pmp/project-charter.md) -- Business objectives and high-level scope
- [Schedule Management Plan](pmp/schedule-management.md) -- Sprint timeline and milestones
- [WBS](pmp/wbs.md) -- Work breakdown by domain
- [Risk Register](pmp/risk-register.md) -- Full risk analysis
- [Governance Framework](governance-framework.md) -- Decision authority and escalation
