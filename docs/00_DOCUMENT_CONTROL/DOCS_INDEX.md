<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/control.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - the docs/ tree itself
       - tools/docs/lib/structure.mjs
-->

# SALIS AUTO documentation index

**Sources as of:** 2026-09-19 · 414 documents, 143 in the numbered architecture

## Start here

An executive or an agent should be able to understand the state of this project from these nine documents before opening anything else.

| Read this | To learn |
| --- | --- |
| [Executive summary](../01_EXECUTIVE_STRATEGY/EXECUTIVE_SUMMARY.md) | What SALIS AUTO is and why it exists |
| [Documentation status](DOCUMENTATION_STATUS.md) | What is documented, what is generated, what is stale |
| [Gap report](DOCUMENTATION_GAP_REPORT.md) | What is missing or unverified — read before trusting anything else |
| [Business capability map](../07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md) | What the product does, by capability |
| [Master architecture](../14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md) | How it is built, current versus target |
| [Requirements traceability](../09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md) | Objective → capability → API → test, and where the chain breaks |
| [API overview](../17_API_INTEGRATION/API_OVERVIEW.md) | The 529-endpoint surface and its cross-cutting contract |
| [RBAC matrix](../19_SECURITY/RBAC_MATRIX.md) | Who may do what, and the six-letter grant alphabet |
| [Production readiness](../30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md) | What still blocks a release |

## The architecture

| Section | Purpose | Documents |
| --- | --- | --- |
| `00_DOCUMENT_CONTROL/` | The index, the registry, the standards and the traceability model. Start here. | 12 |
| `01_EXECUTIVE_STRATEGY/` | Why SALIS AUTO exists, what it is for, and what success is. | 2 |
| `02_MARKET_BUSINESS_RESEARCH/` | Market, segments, personas and competitors — with claims marked by evidence level. | 1 |
| `03_PRINCE2_GOVERNANCE/` | Project governance in PRINCE2 form, as views over the canonical registers. | 2 |
| `04_PROJECT_MANAGEMENT/` | The live control centre: dashboard, plan, risks, blockers, decisions. | 2 |
| `05_PLANNING/` | Roadmap, work breakdown, milestones, dependencies, release plan. | 1 |
| `06_AGILE_DELIVERY/` | Epics, features, stories, acceptance criteria, definition of done. | 1 |
| `07_BUSINESS_ANALYSIS/` | Capability map, stakeholders, business requirements, business rules. | 2 |
| `08_PRODUCT/` | Product requirements, personas, journeys, product capability model. | 1 |
| `09_SYSTEM_ANALYSIS/` | Requirements catalogue with IDs, and the traceability matrix. | 3 |
| `10_SCENARIOS_USE_CASES/` | Business, user and system scenarios; use cases; golden paths. | 4 |
| `11_PROCESS_FLOW_MODELS/` | Process catalogue, user flows, system flows, data flows. | 5 |
| `12_UML_BPMN_MODELS/` | Use case, sequence, activity, state and component models. | 2 |
| `13_DATA_MODELING/` | Entity catalogue, data dictionary, relationships, lineage, ownership. | 4 |
| `14_SOLUTION_ARCHITECTURE/` | Master architecture, principles, constraints, risks — current versus target. | 2 |
| `15_C4_ARCHITECTURE_DIAGRAMS/` | Context, container and component views, and dynamic views. | 2 |
| `16_SYSTEM_DESIGN/` | High- and low-level design of each cross-cutting mechanism. | 5 |
| `17_API_INTEGRATION/` | The API surface, per domain, generated from the routers. | 26 |
| `18_DATABASE/` | Physical model, migrations, RLS, backup, retention. | 2 |
| `19_SECURITY/` | Authentication, authorization, isolation, audit, threat model. | 4 |
| `20_UI_UX_EXPERIENCE/` | Information architecture, screen registry, states, accessibility, Arabic and RTL. | 2 |
| `21_DOMAIN_DOCUMENTATION/` | One document per business domain, to a single standard. | 20 |
| `22_PORTALS_CHANNELS/` | Customer, technician, supplier, procurement, kiosk, call centre, website, mobile. | 1 |
| `23_BUSINESS_OPERATIONS/` | Operating model, SOPs, support and escalation. | 1 |
| `24_COMMERCIAL_FINANCIAL/` | Pricing, revenue and cost model — projections labelled as projections. | 1 |
| `25_SALES_MARKETING_CUSTOMER_SUCCESS/` | Go-to-market, onboarding, retention. | 1 |
| `26_LEGAL_COMPLIANCE/` | ZATCA, VAT, privacy, retention — system requirements, not legal advice. | 1 |
| `27_TESTING_VALIDATION/` | Strategy, catalogue, coverage and the requirement-to-test trace. | 2 |
| `28_ITIL_SERVICE_MANAGEMENT/` | Service catalogue, SLAs, incident, problem, change, release. | 3 |
| `29_OPERATIONS_DEVOPS/` | Environments, deployment, observability, backup, runbooks. | 4 |
| `30_RELEASE_CERTIFICATION/` | Release plan, readiness, known limitations, certification against evidence. | 5 |
| `31_ARCHITECTURE_DECISIONS/` | ADRs for the decisions the code actually reflects. | 1 |
| `32_METRICS_KPI_REPORTING/` | What is measured, where the number comes from, and what it is for. | 1 |
| `33_MASTER_DIAGRAM_LIBRARY/` | Every diagram, in version-controlled source form. | 16 |
| `99_ARCHIVE/` | Superseded material, retained for history. Never current truth. | 1 |

## Documents outside the numbered architecture

271 documents sit in the pre-existing `docs/` folders (`system/`, `requirements/`, `project-management/`, `knowledge-base/`, `mermaid/`, `visualizations/` and others). They were **not** deleted or bulk-moved: many are accurate, several are the only record of a decision, and a migration that moves 300 files in one commit destroys the ability to review any of them. `DOCUMENTATION_MIGRATION_MANIFEST.md` classifies each one and records where it is going.

| Folder | Documents |
| --- | --- |
| `docs/mermaid/` | 46 |
| `docs/system/` | 37 |
| `docs/knowledge-base/` | 34 |
| `docs/project-management/` | 31 |
| `docs/(root)/` | 26 |
| `docs/requirements/` | 18 |
| `docs/training/` | 14 |
| `docs/user-documentation/` | 14 |
| `docs/management/` | 13 |
| `docs/marketing/` | 11 |
| `docs/departments/` | 6 |
| `docs/developer/` | 6 |
| `docs/legal/` | 6 |
| `docs/customer/` | 4 |
| `docs/testing/` | 4 |
| `docs/research/` | 1 |

## Machine-readable registries

The Markdown is a view. These are the canonical form, and what `docs:check` and SAHEL read.

| Registry | Holds | Generated from |
| --- | --- | --- |
| `project-control/ENTITY_REGISTRY.json` | 84 tables with every column | `server/src/db/schema.ts` |
| `project-control/RELATIONSHIP_REGISTRY.json` | 212 relationships, declared versus inferred | `server/src/db/schema.ts` |
| `project-control/API_REGISTRY.json` | 529 endpoints with guards and scopes | the route files |
| `project-control/PERMISSION_REGISTRY.json` | 495 permission cells, scopes, ceilings, SOD | `packages/contract/src/rbac.ts` |
| `project-control/BUSINESS_RULES.json` | 30 rules, each naming its function | `packages/contract/src/rules/*.ts` |
| `project-control/STATE_MACHINE_REGISTRY.json` | 28 lifecycles | `packages/contract/src/entities/*.ts` |
| `project-control/TEST_REGISTRY.json` | 233 suites, 2546 cases | the spec files |
| `project-control/CAPABILITY_REGISTRY.json` | 18 capabilities linked to everything below them | modules + screen domains |
| `project-control/SECURITY_REGISTRY.json` | RLS policies, triggers, unauthenticated surface | `server/drizzle/*.sql` |
| `project-control/MASTER_REGISTRY.json` | 436 screens — **owned by `app/scripts/build-registry.mjs`, not by this system** | the screen sources |
