<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/release.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - the docs/ tree
-->

# Master diagram index

**Sources as of:** 2026-09-13 · 21 diagrams across 18 documents

## Format

Every diagram is **Mermaid source in version control**, not an exported image. An image cannot be diffed, cannot be regenerated when the schema changes, and goes stale without anyone noticing. The structural diagrams — ERDs, C4, state machines — are generated from the same extractors as the prose, so they change when the code does.

The pre-existing `docs/visualizations/` HTML pages and `docs/mermaid/` documents are retained and indexed; they are hand-authored and are classified in the migration manifest.

## Generated diagrams

| Document | Diagrams | Types | Generated |
| --- | --- | --- | --- |
| `docs/07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md` | 1 | flowchart | yes |
| `docs/12_UML_BPMN_MODELS/STATE_MACHINES.md` | 1 | stateDiagram-v2 | yes |
| `docs/15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md` | 4 | flowchart, sequenceDiagram | yes |
| `docs/19_SECURITY/TENANT_ISOLATION.md` | 1 | sequenceDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/ACCOUNTING_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/ADMIN_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/BILLING_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/CRM_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/CUSTOMER_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/ENTERPRISE_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/HR_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/INSURANCE_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/INTEGRATIONS_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/INVENTORY_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/LOANS_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/MASTER_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/PROCUREMENT_ERD.md` | 1 | erDiagram | yes |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/WORKSHOP_ERD.md` | 1 | erDiagram | yes |

## Coverage by diagram type

| Type | Where |
| --- | --- |
| ERD | `33_MASTER_DIAGRAM_LIBRARY/ERD/` — master spine plus 13 domain ERDs, generated from the schema |
| C4 context / container / component / dynamic | `15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md` |
| State machine | `12_UML_BPMN_MODELS/STATE_MACHINES.md` |
| Sequence | `15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md`, `19_SECURITY/TENANT_ISOLATION.md` |
| Capability / objective map | `07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md` |
| User journeys, BPMN, org charts | `docs/mermaid/` (pre-existing, authored) — classified in the migration manifest |
