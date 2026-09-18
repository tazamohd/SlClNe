/** The documentation architecture: the numbered sections and, for each, the
 *  documents the system requires.
 *
 *  `required: true` means `docs:check` fails when the file is absent. The list
 *  is deliberately not "every document a large enterprise could have" — a
 *  required-document list padded with documents nobody will write produces a
 *  permanently red check that everyone learns to ignore, which is worse than
 *  no check. What is here is what a reader actually needs to answer the
 *  traceability question in both directions.
 */
export const SECTIONS = [
  { dir: '00_DOCUMENT_CONTROL', title: 'Document control', purpose: 'The index, the registry, the standards and the traceability model. Start here.' },
  { dir: '01_EXECUTIVE_STRATEGY', title: 'Executive and strategy', purpose: 'Why SALIS AUTO exists, what it is for, and what success is.' },
  { dir: '02_MARKET_BUSINESS_RESEARCH', title: 'Market and business research', purpose: 'Market, segments, personas and competitors — with claims marked by evidence level.' },
  { dir: '03_PRINCE2_GOVERNANCE', title: 'PRINCE2 governance', purpose: 'Project governance in PRINCE2 form, as views over the canonical registers.' },
  { dir: '04_PROJECT_MANAGEMENT', title: 'Project management', purpose: 'The live control centre: dashboard, plan, risks, blockers, decisions.' },
  { dir: '05_PLANNING', title: 'Planning', purpose: 'Roadmap, work breakdown, milestones, dependencies, release plan.' },
  { dir: '06_AGILE_DELIVERY', title: 'Agile delivery', purpose: 'Epics, features, stories, acceptance criteria, definition of done.' },
  { dir: '07_BUSINESS_ANALYSIS', title: 'Business analysis', purpose: 'Capability map, stakeholders, business requirements, business rules.' },
  { dir: '08_PRODUCT', title: 'Product', purpose: 'Product requirements, personas, journeys, product capability model.' },
  { dir: '09_SYSTEM_ANALYSIS', title: 'System analysis', purpose: 'Requirements catalogue with IDs, and the traceability matrix.' },
  { dir: '10_SCENARIOS_USE_CASES', title: 'Scenarios and use cases', purpose: 'Business, user and system scenarios; use cases; golden paths.' },
  { dir: '11_PROCESS_FLOW_MODELS', title: 'Process and flow models', purpose: 'Process catalogue, user flows, system flows, data flows.' },
  { dir: '12_UML_BPMN_MODELS', title: 'UML and BPMN models', purpose: 'Use case, sequence, activity, state and component models.' },
  { dir: '13_DATA_MODELING', title: 'Data modelling', purpose: 'Entity catalogue, data dictionary, relationships, lineage, ownership.' },
  { dir: '14_SOLUTION_ARCHITECTURE', title: 'Solution architecture', purpose: 'Master architecture, principles, constraints, risks — current versus target.' },
  { dir: '15_C4_ARCHITECTURE_DIAGRAMS', title: 'C4 architecture diagrams', purpose: 'Context, container and component views, and dynamic views.' },
  { dir: '16_SYSTEM_DESIGN', title: 'System design', purpose: 'High- and low-level design of each cross-cutting mechanism.' },
  { dir: '17_API_INTEGRATION', title: 'API and integration', purpose: 'The API surface, per domain, generated from the routers.' },
  { dir: '18_DATABASE', title: 'Database', purpose: 'Physical model, migrations, RLS, backup, retention.' },
  { dir: '19_SECURITY', title: 'Security', purpose: 'Authentication, authorization, isolation, audit, threat model.' },
  { dir: '20_UI_UX_EXPERIENCE', title: 'UI and UX', purpose: 'Information architecture, screen registry, states, accessibility, Arabic and RTL.' },
  { dir: '21_DOMAIN_DOCUMENTATION', title: 'Domain documentation', purpose: 'One document per business domain, to a single standard.' },
  { dir: '22_PORTALS_CHANNELS', title: 'Portals and channels', purpose: 'Customer, technician, supplier, procurement, kiosk, call centre, website, mobile.' },
  { dir: '23_BUSINESS_OPERATIONS', title: 'Business operations', purpose: 'Operating model, SOPs, support and escalation.' },
  { dir: '24_COMMERCIAL_FINANCIAL', title: 'Commercial and financial', purpose: 'Pricing, revenue and cost model — projections labelled as projections.' },
  { dir: '25_SALES_MARKETING_CUSTOMER_SUCCESS', title: 'Sales, marketing and customer success', purpose: 'Go-to-market, onboarding, retention.' },
  { dir: '26_LEGAL_COMPLIANCE', title: 'Legal and compliance', purpose: 'ZATCA, VAT, privacy, retention — system requirements, not legal advice.' },
  { dir: '27_TESTING_VALIDATION', title: 'Testing and validation', purpose: 'Strategy, catalogue, coverage and the requirement-to-test trace.' },
  { dir: '28_ITIL_SERVICE_MANAGEMENT', title: 'ITIL service management', purpose: 'Service catalogue, SLAs, incident, problem, change, release.' },
  { dir: '29_OPERATIONS_DEVOPS', title: 'Operations and DevOps', purpose: 'Environments, deployment, observability, backup, runbooks.' },
  { dir: '30_RELEASE_CERTIFICATION', title: 'Release and certification', purpose: 'Release plan, readiness, known limitations, certification against evidence.' },
  { dir: '31_ARCHITECTURE_DECISIONS', title: 'Architecture decisions', purpose: 'ADRs for the decisions the code actually reflects.' },
  { dir: '32_METRICS_KPI_REPORTING', title: 'Metrics, KPI and reporting', purpose: 'What is measured, where the number comes from, and what it is for.' },
  { dir: '33_MASTER_DIAGRAM_LIBRARY', title: 'Master diagram library', purpose: 'Every diagram, in version-controlled source form.' },
  { dir: '99_ARCHIVE', title: 'Archive', purpose: 'Superseded material, retained for history. Never current truth.' },
]

/** Documents `docs:check` requires. `generated` files must match a fresh
 *  `docs:generate`; authored ones only have to exist and be non-trivial. */
export const REQUIRED = [
  { path: '00_DOCUMENT_CONTROL/DOCS_INDEX.md', generated: true },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_REGISTRY.json', generated: true },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_STATUS.md', generated: true },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_GAP_REPORT.md', generated: true },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_TRACEABILITY_REPORT.md', generated: true },
  { path: '00_DOCUMENT_CONTROL/SOURCE_OF_TRUTH_MAP.md', generated: false },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_STANDARDS.md', generated: false },
  { path: '00_DOCUMENT_CONTROL/TRACEABILITY_MODEL.md', generated: false },
  { path: '00_DOCUMENT_CONTROL/MASTER_GLOSSARY.md', generated: false },
  { path: '00_DOCUMENT_CONTROL/DOCUMENTATION_MIGRATION_MANIFEST.md', generated: false },
  { path: '01_EXECUTIVE_STRATEGY/EXECUTIVE_SUMMARY.md', generated: false },
  { path: '07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md', generated: true },
  { path: '09_SYSTEM_ANALYSIS/REQUIREMENTS_CATALOG.md', generated: true },
  { path: '09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md', generated: true },
  { path: '11_PROCESS_FLOW_MODELS/PROCESS_CATALOG.md', generated: false },
  { path: '13_DATA_MODELING/ENTITY_CATALOG.md', generated: true },
  { path: '13_DATA_MODELING/DATA_DICTIONARY.md', generated: true },
  { path: '13_DATA_MODELING/RELATIONSHIP_CATALOG.md', generated: true },
  { path: '14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md', generated: false },
  { path: '15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md', generated: true },
  { path: '17_API_INTEGRATION/API_OVERVIEW.md', generated: true },
  { path: '18_DATABASE/DATABASE_DESIGN.md', generated: true },
  { path: '19_SECURITY/RBAC_MATRIX.md', generated: true },
  { path: '19_SECURITY/TENANT_ISOLATION.md', generated: true },
  { path: '19_SECURITY/SECURITY_ARCHITECTURE.md', generated: false },
  { path: '12_UML_BPMN_MODELS/STATE_MACHINES.md', generated: true },
  { path: '20_UI_UX_EXPERIENCE/SCREEN_REGISTRY.md', generated: true },
  { path: '27_TESTING_VALIDATION/TEST_CATALOG.md', generated: true },
  { path: '28_ITIL_SERVICE_MANAGEMENT/SERVICE_CATALOG.md', generated: false },
  { path: '29_OPERATIONS_DEVOPS/RUNBOOK_INDEX.md', generated: false },
  { path: '30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md', generated: true },
  { path: '30_RELEASE_CERTIFICATION/DOCUMENTATION_CERTIFICATION.md', generated: true },
  { path: '30_RELEASE_CERTIFICATION/KNOWN_LIMITATIONS.md', generated: true },
  { path: '33_MASTER_DIAGRAM_LIBRARY/DIAGRAM_INDEX.md', generated: true },
  { path: '33_MASTER_DIAGRAM_LIBRARY/ERD/MASTER_ERD.md', generated: true },
]
