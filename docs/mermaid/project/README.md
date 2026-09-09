# Project Charts (Mermaid)

Project-level architecture and planning diagrams for SALIS AUTO, redrawn in Mermaid from the real content documented across `docs/architecture.md`, `docs/domains.md`, `docs/system/`, `docs/project-management/`, `docs/user-documentation/`, and `docs/knowledge-base/`.

| Diagram | Description |
|---|---|
| [System Architecture](./system-architecture.md) | Full stack: React SPA → repository seam → API middleware/RBAC/CRUD pipeline → Drizzle ORM → PostgreSQL, plus external integrations |
| [Domain Model](./domain-model.md) | The 13 bounded-context domains (Workshop, Registry, Finance, Accounting, CRM, Admin, Auth, AI, Network, Call Center, Website, Portals, Team & HR) and how they relate |
| [Database ER Diagram](./database-er-diagram.md) | Key entities and relationships from the 50+ table schema, including the multi-tenant `org_id` / RLS pattern |
| [Deployment Architecture](./deployment-architecture.md) | Security zones (DMZ, app tier, DB tier), external services, and observability stack |
| [CI/CD Pipeline](./ci-cd-pipeline.md) | The real GitHub Actions workflows: `ci.yml`, `deploy-pages.yml`, `pr-report.yml` |
| [Org Chart](./org-chart.md) | 14 RBAC roles grouped into 8 departments, reporting to the Owner/CEO, with SAR approval ceilings |
| [RBAC Overview](./rbac-overview.md) | Data scopes, approval ceiling ladder, 3-layer enforcement, plus the full 28-module x 14-role permission matrix |
| [Job Card State Machine](./job-card-state-machine.md) | The 8-stage job lifecycle (Check-In → Inspection → Estimate → Repair → QC → Delivery → Invoiced → Closed), QC-fail loop, and segregation of duties |
| [Purchase Order State Machine](./purchase-order-state-machine.md) | The 9-state PO lifecycle from requisition through closure, with SAR ceiling and three-way match guards |
| [Approval Escalation Ladder](./approval-escalation-ladder.md) | The SAR approval chain: Advisor 5K → Storekeeper 10K → HR Mgr 15K → Procurement 20K → Accountant 25K → Branch Mgr 50K → Owner unlimited |
| [Integration Architecture](./integration-architecture.md) | Hub-and-spoke view of ZATCA, Stripe, SMS, WhatsApp, Email, and OBD/Telematics integrations |
| [Release Roadmap](./release-roadmap.md) | 52-week, 6-phase schedule mapped to the 0.1.0-alpha → 1.0.0 release train and post-launch versions |
| [Work Breakdown Structure](./wbs.md) | 126 work packages / 892 story points across 6 phases and 13 domains |

All diagrams use GitHub-renderable Mermaid syntax (`flowchart`, `erDiagram`, `stateDiagram-v2`, `gantt`). Each file cites the source document(s) it was derived from.
