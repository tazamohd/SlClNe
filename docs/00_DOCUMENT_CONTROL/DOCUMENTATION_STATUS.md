<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/control.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - the docs/ tree
       - project-control/*.json
-->

# Documentation status

**Generated:** 2026-09-13

## Coverage

| Measure | Value |
| --- | --- |
| Documents in `docs/` | 325 |
| In the numbered architecture | 56 |
| In the pre-existing folders (classified, not yet migrated) | 269 |
| Machine-generated from source | 55 |
| Authored | 270 |
| Substantive (> 1.2 kB) | 323 |
| Thin — placeholder or stub | 2 |
| Required documents present | 23 of 35 |

## What is generated, and therefore cannot go stale silently

| Area | Derived from | Count |
| --- | --- | --- |
| Entity catalogue, data dictionary, ERDs | `server/src/db/schema.ts` | 68 tables |
| Relationship catalogue | `server/src/db/schema.ts` | 164 relationships |
| API reference | the route files | 303 endpoints |
| RBAC matrix, roles, SOD, field redaction | `packages/contract/src/rbac.ts` | 420 cells |
| Business rules | `packages/contract/src/rules/*.ts` | 30 rules |
| State machines | `packages/contract/src/entities/*.ts` | 18 lifecycles |
| Isolation and policies | `server/drizzle/*.sql` | 49 policies |
| Test catalogue | the spec files | 178 suites |
| Screen registry view | `project-control/MASTER_REGISTRY.json` | 424 screens |
| Capability map, requirements, traceability | all of the above | 150 requirements |

`npm run docs:check` regenerates all of it and fails if the checked-in copy differs. A generated document cannot drift from the code without breaking the build.

## Required documents

| Document | Kind | Present | Substantive |
| --- | --- | --- | --- |
| `00_DOCUMENT_CONTROL/DOCS_INDEX.md` | generated | yes | yes |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_REGISTRY.json` | generated | yes | yes |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_STATUS.md` | generated | yes | yes |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_GAP_REPORT.md` | generated | yes | yes |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_TRACEABILITY_REPORT.md` | generated | **no** | — |
| `00_DOCUMENT_CONTROL/SOURCE_OF_TRUTH_MAP.md` | authored | **no** | — |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_STANDARDS.md` | authored | **no** | — |
| `00_DOCUMENT_CONTROL/TRACEABILITY_MODEL.md` | authored | **no** | — |
| `00_DOCUMENT_CONTROL/MASTER_GLOSSARY.md` | authored | **no** | — |
| `00_DOCUMENT_CONTROL/DOCUMENTATION_MIGRATION_MANIFEST.md` | authored | **no** | — |
| `01_EXECUTIVE_STRATEGY/EXECUTIVE_SUMMARY.md` | authored | **no** | — |
| `07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md` | generated | yes | yes |
| `09_SYSTEM_ANALYSIS/REQUIREMENTS_CATALOG.md` | generated | yes | yes |
| `09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md` | generated | yes | yes |
| `11_PROCESS_FLOW_MODELS/PROCESS_CATALOG.md` | authored | **no** | — |
| `13_DATA_MODELING/ENTITY_CATALOG.md` | generated | yes | yes |
| `13_DATA_MODELING/DATA_DICTIONARY.md` | generated | yes | yes |
| `13_DATA_MODELING/RELATIONSHIP_CATALOG.md` | generated | yes | yes |
| `14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md` | authored | **no** | — |
| `15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md` | generated | yes | yes |
| `17_API_INTEGRATION/API_OVERVIEW.md` | generated | yes | yes |
| `18_DATABASE/DATABASE_DESIGN.md` | generated | yes | yes |
| `19_SECURITY/RBAC_MATRIX.md` | generated | yes | yes |
| `19_SECURITY/TENANT_ISOLATION.md` | generated | yes | yes |
| `19_SECURITY/SECURITY_ARCHITECTURE.md` | authored | **no** | — |
| `12_UML_BPMN_MODELS/STATE_MACHINES.md` | generated | yes | yes |
| `20_UI_UX_EXPERIENCE/SCREEN_REGISTRY.md` | generated | yes | yes |
| `27_TESTING_VALIDATION/TEST_CATALOG.md` | generated | yes | yes |
| `28_ITIL_SERVICE_MANAGEMENT/SERVICE_CATALOG.md` | authored | **no** | — |
| `29_OPERATIONS_DEVOPS/RUNBOOK_INDEX.md` | authored | **no** | — |
| `30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md` | generated | yes | yes |
| `30_RELEASE_CERTIFICATION/DOCUMENTATION_CERTIFICATION.md` | generated | yes | yes |
| `30_RELEASE_CERTIFICATION/KNOWN_LIMITATIONS.md` | generated | yes | yes |
| `33_MASTER_DIAGRAM_LIBRARY/DIAGRAM_INDEX.md` | generated | yes | yes |
| `33_MASTER_DIAGRAM_LIBRARY/ERD/MASTER_ERD.md` | generated | yes | yes |
