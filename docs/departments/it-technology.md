# SALIS AUTO -- IT & Technology Department Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-DPT-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Department Overview

The IT & Technology department owns the development, deployment, and operational support of the SALIS AUTO platform. The platform is a multi-tenant automotive workshop management SaaS serving the Saudi Arabian market, built with React 18 + Express + Drizzle ORM. The department manages 191+ screens across 13 domains, 28 RBAC modules supporting 14 roles, and bilingual EN/AR with full RTL support.

The department is responsible for the entire technology lifecycle: product development, infrastructure management, quality assurance, security operations, and tiered technical support for all platform tenants.

**Primary Responsibilities:**
- Platform development and feature delivery
- Infrastructure provisioning and management
- Application and data security
- Technical support (L1/L2/L3)
- DevOps and CI/CD pipeline management
- Performance monitoring and optimization
- ZATCA Phase 2 integration maintenance
- Bilingual (EN/AR) and RTL rendering quality

---

## 2. Team Structure

### 2.1 Current Team

```
                        +-------------------+
                        |       CTO         |
                        |    (1 - Head)     |
                        +---------+---------+
                                  |
            +----------+----------+----------+----------+
            |          |          |          |          |
     +------+---+ +---+------+ +-+--------+ +---+-----+
     | Backend  | | Frontend | |  DevOps  | |   QA    |
     |   Lead   | |   Lead   | | Engineer | |  Lead   |
     |   (1)    | |   (1)    | |   (1)    | |   (1)   |
     +----+-----+ +----+-----+ +----------+ +----+----+
          |             |                         |
     +----+-----+ +----+-----+              +----+----+
     | Backend  | | Frontend |              |   QA    |
     |  Devs    | |  Devs    |              | Engineers|
     |  (2-3)   | |  (2-3)   |              |  (1-2)  |
     +----------+ +----------+              +---------+
```

### 2.2 Planned Growth (by Year 2)

| Role                      | Current | Year 2 Target | Justification                    |
|---------------------------|---------|---------------|----------------------------------|
| Backend Developers        | 2-3     | 4             | API scaling, integrations        |
| Frontend Developers       | 2-3     | 4             | Screen coverage, mobile          |
| DevOps Engineers          | 1       | 2             | HA, monitoring, multi-region     |
| QA Engineers              | 1-2     | 3             | Automated test coverage          |
| Security Engineer         | 0       | 1             | Dedicated security ops           |
| Technical Writer          | 0       | 1             | API docs, user guides            |

### 2.3 RBAC Role Mapping (from 14 platform roles)

| Platform Role       | IT Function                    | Module Access                       |
|---------------------|--------------------------------|-------------------------------------|
| Owner               | Technology oversight           | System configuration, all reports   |
| System Admin        | Platform administration        | User mgmt, tenant config, settings |
| Developer           | Code development               | Dev environment, staging            |
| Support Agent       | L1/L2 support                  | Ticket system, user lookup          |

---

## 3. Development Methodology

### 3.1 Agile/Scrum Framework

| Element            | Configuration                                    |
|--------------------|--------------------------------------------------|
| Methodology        | Scrum with Kanban elements                       |
| Sprint duration    | 2 weeks (Sunday to Thursday)                     |
| Team size          | 5-8 per squad                                    |
| Backlog tool       | GitHub Projects                                  |
| Communication      | Daily standups (async-friendly)                  |
| Documentation      | In-repo markdown, ADRs for architectural changes |

### 3.2 Definition of Done

A story is "Done" when all of the following are met:

1. Code complete and self-reviewed
2. Unit tests written and passing (minimum 80% coverage for new code)
3. Integration tests passing
4. PR created with description and screenshots (if UI change)
5. Code review approved by 2 reviewers
6. All CI checks green (lint, type-check, tests, build)
7. Bilingual strings added (EN + AR) for any new UI text
8. RTL layout verified for any new UI components
9. RBAC permissions configured for any new module/screen
10. Deployed to staging and smoke-tested
11. Product Owner acceptance (for user-facing changes)

---

## 4. Sprint Cycle

### 4.1 Weekly Cadence (Saudi Work Week: Sunday - Thursday)

```
THURSDAY (End of Sprint N / Start of Sprint N+1)
  |
  09:00  Sprint N Review (45 min)
         - Demo completed stories
         - Stakeholder feedback
  |
  10:00  Sprint N Retrospective (30 min)
         - What went well / what to improve
         - Action items for next sprint
  |
  11:00  Backlog Grooming (60 min)
         - Refine upcoming stories
         - Estimate (story points)
         - Identify dependencies
  |
SUNDAY
  09:00  Sprint N+1 Planning (90 min)
         - Sprint goal definition
         - Story selection and commitment
         - Task breakdown
  |
DAILY (Sunday - Thursday)
  09:30  Daily Standup (15 min, async option available)
         - What I did yesterday
         - What I'll do today
         - Blockers
```

### 4.2 Sprint Metrics

| Metric                | Target           | Measurement                        |
|-----------------------|------------------|------------------------------------|
| Velocity              | Trending upward  | Story points completed per sprint  |
| Sprint Completion     | > 85%            | Committed vs. completed stories    |
| Carry-over Rate       | < 15%            | Stories pushed to next sprint      |
| Bug Escape Rate       | < 5%             | Bugs found in production post-release |

---

## 5. Technology Stack

### 5.1 Platform Architecture

| Layer          | Technology                                          | Version/Notes              |
|----------------|-----------------------------------------------------|----------------------------|
| Frontend       | React 18 + TypeScript                               | Vite build tooling         |
| State Mgmt     | TanStack Query (React Query)                        | Server state caching       |
| Styling        | Tailwind CSS                                        | RTL-aware utility classes  |
| Routing        | React Router                                        | Nested route structure     |
| Backend        | Express.js + TypeScript                             | REST API                   |
| ORM            | Drizzle ORM                                         | Type-safe SQL              |
| Database       | PostgreSQL (production)                             | Multi-tenant schema        |
| Dev Database   | PGlite                                              | Local development          |
| Authentication | Session-based                                       | Secure cookies             |
| i18n           | Custom implementation                               | EN/AR with RTL support     |
| API Docs       | OpenAPI / Swagger                                   | Auto-generated from routes |

### 5.2 Domain Coverage

The platform spans 13 domains with 191+ screens:

| Domain                | Screens | Key Modules                                |
|-----------------------|---------|--------------------------------------------|
| Workshop Management   | 25+     | Job cards, bays, scheduling                |
| Inventory             | 20+     | Stock, purchasing, receiving               |
| Finance               | 30+     | Invoicing, payments, GL, ZATCA             |
| CRM                   | 15+     | Customers, vehicles, communication         |
| HR                    | 20+     | Employees, payroll, attendance             |
| Reporting             | 15+     | Dashboards, analytics, exports             |
| Administration        | 15+     | Settings, users, roles, tenants            |
| Fleet Management      | 10+     | Fleet accounts, contracts, bulk service    |
| Insurance             | 10+     | Claims, approvals, settlements             |
| Marketing             | 8+      | Campaigns, promotions, loyalty             |
| Quality               | 8+      | QC checklists, audits, standards           |
| Notifications         | 5+      | Templates, channels, preferences           |
| Customer Portal       | 10+     | Self-service booking, history, payments    |

---

## 6. Infrastructure

### 6.1 Environment Architecture

| Environment  | Purpose                    | Data            | Access                    |
|-------------|----------------------------|-----------------|---------------------------|
| Local Dev    | Developer workstation      | PGlite + seeds  | Developer only            |
| CI           | Automated testing          | Ephemeral DB    | CI pipeline               |
| Staging      | Integration testing, QA    | Sanitized prod  | Dev team + QA             |
| UAT          | User acceptance testing    | Test scenarios  | Product + stakeholders    |
| Production   | Live platform              | Real data       | Ops team only             |

### 6.2 Infrastructure Components

| Component            | Configuration                           | Redundancy        |
|----------------------|-----------------------------------------|--------------------|
| Application servers  | Auto-scaling group (2-8 instances)      | Multi-AZ           |
| Database             | PostgreSQL (managed)                    | Read replica + daily snapshots |
| CDN                  | Static assets, media files              | Global edge cache  |
| Object storage       | Documents, images, attachments          | Cross-region replica|
| Cache                | Redis (session, query cache)            | Cluster mode       |
| Message queue        | Background jobs, notifications          | HA pair            |

### 6.3 Backup and Recovery

| Asset              | Backup Frequency | Retention   | RTO        | RPO        |
|--------------------|------------------|-------------|------------|------------|
| Database           | Daily full + WAL  | 30 days     | < 1 hour   | < 5 min    |
| Application code   | Per commit (Git) | Indefinite  | < 30 min   | 0 (Git)    |
| Documents/media    | Real-time sync   | 90 days     | < 15 min   | < 1 min    |
| Configuration      | Per change (IaC) | Indefinite  | < 30 min   | 0 (Git)    |

---

## 7. Support Model

### 7.1 Tiered Support Structure

```
        +-------------------------------------------+
        |  L1: Helpdesk / First Response            |
        |  - Password resets, basic troubleshooting  |
        |  - Known issue lookup (KB articles)        |
        |  - Account and access questions            |
        |  Response: < 4 hours (business hours)      |
        +-------------------+-----------------------+
                            | Escalation (unresolved after 30 min)
        +-------------------v-----------------------+
        |  L2: Application Support                   |
        |  - Configuration issues                    |
        |  - Data correction (with approval)         |
        |  - Workflow and RBAC troubleshooting        |
        |  - ZATCA integration issues                |
        |  Response: < 8 hours                       |
        +-------------------+-----------------------+
                            | Escalation (code fix required)
        +-------------------v-----------------------+
        |  L3: Engineering                           |
        |  - Bug fixes and patches                   |
        |  - Infrastructure incidents                |
        |  - Performance issues                      |
        |  - Security incidents                      |
        |  Response: per severity (see Section 8)    |
        +-------------------------------------------+
```

### 7.2 Support Hours

| Tier     | Coverage                          | Channels                    |
|----------|-----------------------------------|-----------------------------|
| L1       | Sunday-Thursday 8AM-6PM AST       | In-app chat, email, phone   |
| L2       | Sunday-Thursday 8AM-6PM AST       | Internal escalation         |
| L3       | On-call 24/7 (P1/P2 only)        | PagerDuty alert             |

---

## 8. Incident Response

### 8.1 Severity Classification

| Severity | Definition                                  | Response Time | Resolution Target | Escalation       |
|----------|---------------------------------------------|---------------|-------------------|------------------|
| P1       | Platform down, all tenants affected         | 15 min        | < 1 hour          | CTO immediately  |
| P2       | Major feature broken, workaround exists     | 30 min        | < 4 hours         | CTO within 1h    |
| P3       | Minor feature issue, limited impact         | 4 hours       | < 24 hours        | Team lead        |
| P4       | Cosmetic, enhancement, low impact           | 24 hours      | Next sprint       | Backlog          |

### 8.2 On-Call Rotation

- Primary on-call: rotates weekly among Backend Lead, Frontend Lead, DevOps
- Secondary on-call: CTO (escalation only)
- On-call allowance: SAR 1,500/month
- Handoff: Thursday end-of-day, documented in #oncall channel

### 8.3 Post-Mortem Process

All P1 and P2 incidents require a post-mortem within 48 hours:

1. Timeline of events (detection to resolution)
2. Root cause analysis (5-Whys methodology)
3. Impact assessment (users affected, revenue impact, data impact)
4. Action items with owners and deadlines
5. Preventive measures and monitoring improvements
6. Post-mortem review meeting with engineering team

---

## 9. Release Process

### 9.1 Release Pipeline

```
Feature Branch
  |
  Developer commits + pushes
  |
  CI Pipeline (automated):
    [1] Lint (ESLint + Prettier)
    [2] Type Check (TypeScript)
    [3] Unit Tests (Vitest)
    [4] Integration Tests
    [5] Build verification
    [6] Security scan (dependency audit)
  |
  Pull Request created
  |
  Code Review (2 approvers required):
    - Backend Lead OR Frontend Lead (technical)
    - Any senior developer (quality)
  |
  Merge to main branch
  |
  Auto-deploy to Staging
  |
  QA Verification on Staging:
    - Smoke tests
    - Regression tests (critical paths)
    - RTL/bilingual verification (if UI change)
  |
  UAT Sign-off (for major features)
  |
  Production Deployment
  |
  Post-deploy verification:
    - Health checks
    - Smoke tests
    - Monitor error rates (30 min window)
  |
  Release tagged (semantic versioning)
```

### 9.2 Release Schedule

| Release Type     | Frequency      | Window                    | Approval           |
|------------------|----------------|---------------------------|---------------------|
| Regular release  | Weekly          | Thursday 2PM AST          | QA Lead + CTO       |
| Hotfix (P1/P2)   | As needed       | Any time                  | CTO                 |
| Major release    | Monthly/Quarterly| Thursday 2PM AST         | CTO + Product Owner |
| Database migration| With release   | Off-peak (Thursday 10PM) | CTO + DevOps        |

### 9.3 Rollback Procedure

| Step | Action                                    | Time Target | Responsible |
|------|-------------------------------------------|-------------|-------------|
| 1    | Detect issue (monitoring alert or report) | Immediate   | On-call     |
| 2    | Assess severity and impact                | < 5 min     | On-call     |
| 3    | Decision to rollback (if P1/P2)           | < 10 min    | CTO/Lead    |
| 4    | Execute rollback (revert deployment)      | < 15 min    | DevOps      |
| 5    | Verify rollback success                   | < 5 min     | QA          |
| 6    | Notify stakeholders                       | < 30 min    | CTO         |

---

## 10. Security Operations

### 10.1 Security Practices

| Practice                    | Tool/Method              | Frequency      |
|-----------------------------|--------------------------|----------------|
| Dependency scanning         | npm audit + Snyk         | Every CI build |
| SAST (Static Analysis)      | ESLint security rules    | Every CI build |
| DAST (Dynamic Testing)      | OWASP ZAP                | Weekly         |
| Penetration testing         | Third-party vendor       | Annual         |
| Security training           | OWASP Top 10 workshop    | Semi-annual    |
| Access review               | RBAC audit (28 modules)  | Quarterly      |
| Secret scanning             | Git secret detection     | Every commit   |
| SSL/TLS certificate         | Auto-renewal             | Monthly check  |

### 10.2 Data Protection

| Data Category          | Classification  | Encryption at Rest | Encryption in Transit | Access Level       |
|------------------------|-----------------|--------------------|-----------------------|--------------------|
| Customer PII           | Confidential    | AES-256            | TLS 1.3               | Role-based         |
| Financial data         | Confidential    | AES-256            | TLS 1.3               | Finance roles only |
| Vehicle data           | Internal        | AES-256            | TLS 1.3               | Workshop roles     |
| System logs            | Internal        | Encrypted volumes  | TLS 1.3               | IT only            |
| Platform code          | Confidential    | Repository-level   | SSH/HTTPS              | Dev team only      |

### 10.3 Compliance Requirements

| Regulation             | Scope                    | Responsibility          |
|------------------------|--------------------------|-------------------------|
| ZATCA e-Invoicing      | Invoice data integrity   | Dev team + ZATCA Officer|
| PDPL (Data Protection) | Personal data handling   | CTO + Legal             |
| CITC                   | Hosting and connectivity | DevOps                  |
| PCI DSS (if payments)  | Payment card data        | CTO + Payment provider  |

---

## 11. Key Performance Indicators

### 11.1 KPI Dashboard

| KPI                          | Target              | Measurement    | Frequency | Owner      |
|------------------------------|---------------------|----------------|-----------|------------|
| Deployment Frequency         | Weekly (minimum)    | Count          | Weekly    | DevOps     |
| Lead Time for Changes        | < 3 business days   | Days           | Per PR    | Team Leads |
| Change Failure Rate          | < 5%                | Percentage     | Monthly   | QA Lead    |
| Mean Time to Recovery (MTTR) | < 4 hours           | Hours          | Per incident| On-call  |
| Platform Uptime              | 99.9%               | Percentage     | Monthly   | DevOps     |
| Test Coverage                | > 80%               | Percentage     | Per build | QA Lead    |
| Sprint Velocity              | Stable/increasing   | Story points   | Per sprint| Scrum Master|
| Open Bug Count               | < 20 (P3/P4)       | Count          | Weekly    | QA Lead    |
| Security Vulnerabilities     | 0 critical/high     | Count          | Daily     | DevOps     |
| L1 Resolution Rate           | > 70%               | Percentage     | Monthly   | Support    |

### 11.2 DORA Metrics Tracking

```
Deployment Frequency:  Target weekly → measure via CI/CD pipeline logs
Lead Time:            Target < 3 days → measure PR open → production deploy
Change Failure Rate:  Target < 5% → measure rollbacks / total deploys
MTTR:                 Target < 4h → measure incident open → resolved timestamp
```

---

## 12. Cross-References

| Document                                                                    | Relevance                         |
|-----------------------------------------------------------------------------|-----------------------------------|
| [DevOps Guide](../knowledge-base/devops-guide.md)                          | CI/CD pipeline configuration      |
| [Coding Standards](../development.md)                                      | Code style and conventions        |
| [Testing Strategy](../MASTER_TEST_STRATEGY.md)                             | Test framework and coverage       |
| [Incident Response](../knowledge-base/incident-response.md)                | Incident handling procedures      |
| [Architecture](../MASTER_ARCHITECTURE.md)                                  | System architecture reference     |
| [RBAC Matrix](../MASTER_RBAC_MATRIX.md)                                   | Role and permission definitions   |
| [Dependency Graph](../MASTER_DEPENDENCY_GRAPH.md)                          | Module dependencies               |

---

## 13. Revision History

| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial department plan    |
