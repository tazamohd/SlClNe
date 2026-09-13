<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/control.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - the docs/ tree itself
       - tools/docs/lib/structure.mjs
-->

# SALIS AUTO documentation index

**Generated:** 2026-09-13 · 325 documents, 56 in the numbered architecture

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
| [API overview](../17_API_INTEGRATION/API_OVERVIEW.md) | The 303-endpoint surface and its cross-cutting contract |
| [RBAC matrix](../19_SECURITY/RBAC_MATRIX.md) | Who may do what, and the six-letter grant alphabet |
| [Production readiness](../30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md) | What still blocks a release |

## The architecture

| Section | Purpose | Documents |
| --- | --- | --- |
| `00_DOCUMENT_CONTROL/` | The index, the registry, the standards and the traceability model. Start here. | 4 |
| `01_EXECUTIVE_STRATEGY/` | Why SALIS AUTO exists, what it is for, and what success is. | 0 |
| `02_MARKET_BUSINESS_RESEARCH/` | Market, segments, personas and competitors — with claims marked by evidence level. | 0 |
| `03_PRINCE2_GOVERNANCE/` | Project governance in PRINCE2 form, as views over the canonical registers. | 0 |
| `04_PROJECT_MANAGEMENT/` | The live control centre: dashboard, plan, risks, blockers, decisions. | 0 |
| `05_PLANNING/` | Roadmap, work breakdown, milestones, dependencies, release plan. | 0 |
| `06_AGILE_DELIVERY/` | Epics, features, stories, acceptance criteria, definition of done. | 0 |
| `07_BUSINESS_ANALYSIS/` | Capability map, stakeholders, business requirements, business rules. | 1 |
| `08_PRODUCT/` | Product requirements, personas, journeys, product capability model. | 0 |
| `09_SYSTEM_ANALYSIS/` | Requirements catalogue with IDs, and the traceability matrix. | 2 |
| `10_SCENARIOS_USE_CASES/` | Business, user and system scenarios; use cases; golden paths. | 0 |
| `11_PROCESS_FLOW_MODELS/` | Process catalogue, user flows, system flows, data flows. | 0 |
| `12_UML_BPMN_MODELS/` | Use case, sequence, activity, state and component models. | 1 |
| `13_DATA_MODELING/` | Entity catalogue, data dictionary, relationships, lineage, ownership. | 3 |
| `14_SOLUTION_ARCHITECTURE/` | Master architecture, principles, constraints, risks — current versus target. | 0 |
| `15_C4_ARCHITECTURE_DIAGRAMS/` | Context, container and component views, and dynamic views. | 1 |
| `16_SYSTEM_DESIGN/` | High- and low-level design of each cross-cutting mechanism. | 0 |
| `17_API_INTEGRATION/` | The API surface, per domain, generated from the routers. | 21 |
| `18_DATABASE/` | Physical model, migrations, RLS, backup, retention. | 1 |
| `19_SECURITY/` | Authentication, authorization, isolation, audit, threat model. | 2 |
| `20_UI_UX_EXPERIENCE/` | Information architecture, screen registry, states, accessibility, Arabic and RTL. | 1 |
| `21_DOMAIN_DOCUMENTATION/` | One document per business domain, to a single standard. | 0 |
| `22_PORTALS_CHANNELS/` | Customer, technician, supplier, procurement, kiosk, call centre, website, mobile. | 0 |
| `23_BUSINESS_OPERATIONS/` | Operating model, SOPs, support and escalation. | 0 |
| `24_COMMERCIAL_FINANCIAL/` | Pricing, revenue and cost model — projections labelled as projections. | 0 |
| `25_SALES_MARKETING_CUSTOMER_SUCCESS/` | Go-to-market, onboarding, retention. | 0 |
| `26_LEGAL_COMPLIANCE/` | ZATCA, VAT, privacy, retention — system requirements, not legal advice. | 0 |
| `27_TESTING_VALIDATION/` | Strategy, catalogue, coverage and the requirement-to-test trace. | 1 |
| `28_ITIL_SERVICE_MANAGEMENT/` | Service catalogue, SLAs, incident, problem, change, release. | 0 |
| `29_OPERATIONS_DEVOPS/` | Environments, deployment, observability, backup, runbooks. | 0 |
| `30_RELEASE_CERTIFICATION/` | Release plan, readiness, known limitations, certification against evidence. | 3 |
| `31_ARCHITECTURE_DECISIONS/` | ADRs for the decisions the code actually reflects. | 0 |
| `32_METRICS_KPI_REPORTING/` | What is measured, where the number comes from, and what it is for. | 0 |
| `33_MASTER_DIAGRAM_LIBRARY/` | Every diagram, in version-controlled source form. | 15 |
| `99_ARCHIVE/` | Superseded material, retained for history. Never current truth. | 0 |

## Documents outside the numbered architecture

269 documents sit in the pre-existing `docs/` folders (`system/`, `requirements/`, `project-management/`, `knowledge-base/`, `mermaid/`, `visualizations/` and others). They were **not** deleted or bulk-moved: many are accurate, several are the only record of a decision, and a migration that moves 300 files in one commit destroys the ability to review any of them. `DOCUMENTATION_MIGRATION_MANIFEST.md` classifies each one and records where it is going.

| Folder | Documents |
| --- | --- |
| `docs/mermaid/` | 46 |
| `docs/system/` | 36 |
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

## Machine-readable registries

The Markdown is a view. These are the canonical form, and what `docs:check` and SAHEL read.

| Registry | Holds | Generated from |
| --- | --- | --- |
| `project-control/ENTITY_REGISTRY.json` | 68 tables with every column | `server/src/db/schema.ts` |
| `project-control/RELATIONSHIP_REGISTRY.json` | 164 relationships, declared versus inferred | `server/src/db/schema.ts` |
| `project-control/API_REGISTRY.json` | 303 endpoints with guards and scopes | the route files |
| `project-control/PERMISSION_REGISTRY.json` | 420 permission cells, scopes, ceilings, SOD | `packages/contract/src/rbac.ts` |
| `project-control/BUSINESS_RULES.json` | 30 rules, each naming its function | `packages/contract/src/rules/*.ts` |
| `project-control/STATE_MACHINE_REGISTRY.json` | 18 lifecycles | `packages/contract/src/entities/*.ts` |
| `project-control/TEST_REGISTRY.json` | 178 suites, 2088 cases | the spec files |
| `project-control/CAPABILITY_REGISTRY.json` | 18 capabilities linked to everything below them | modules + screen domains |
| `project-control/SECURITY_REGISTRY.json` | RLS policies, triggers, unauthenticated surface | `server/drizzle/*.sql` |
| `project-control/MASTER_REGISTRY.json` | 424 screens — **owned by `app/scripts/build-registry.mjs`, not by this system** | the screen sources |
