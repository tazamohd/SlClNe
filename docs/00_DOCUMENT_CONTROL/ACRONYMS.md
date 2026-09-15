# Acronyms

**Status:** NORMATIVE · **Owner:** Documentation architect

Every entry below is in use somewhere in this repository — in the code, the
schema, the project-control registries or the documentation tree. An acronym
that is standard but unused here is not listed. Fuller definitions of the
concepts live in `MASTER_GLOSSARY.md`.

| Acronym | Expansion | Where it applies in SALIS AUTO |
| --- | --- | --- |
| ADR | Architecture Decision Record | `docs/system/adr/` — one file per decision, e.g. `adr-001-react-spa.md`, `adr-003-repository-seam.md`, `adr-004-drizzle-orm.md`, `adr-008-zatca-xml-generation.md`. |
| API | Application Programming Interface | The Fastify service under `/api/v1` — 303 endpoints, 172 of them generated from `server/src/registry.ts`. Documented in `docs/17_API_INTEGRATION/API_OVERVIEW.md`. |
| BPMN | Business Process Model and Notation | The process-model documentation area, `docs/12_UML_BPMN_MODELS/` (currently holding the Mermaid state machines for the job-card and document workflows). |
| bps | Basis points | The unit `VAT_RATE_BPS = 1500` is stored in, so the tax rate is exact rather than a decimal fraction (`packages/contract/src/rules/money.ts`). |
| C4 | Context, Containers, Components, Code | The architecture diagram model, `docs/15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md` — levels 1–3 plus dynamic views, generated as Mermaid source. |
| CR | Commercial Registration | The Saudi company registration number. `organizations.cr_number` in `server/src/db/schema.ts`; printed on invoices and official documents alongside the VAT number. |
| CRM | Customer Relationship Management | A permission module (`crm`) and a screen domain, backed by `leads`, `opportunities`, `campaigns`, `segments` and `crm_tasks`. |
| DoD | Definition of Done | The completion standard for a screen or work item — `docs/MASTER_DEFINITION_OF_DONE.md`, audited per sprint in the PRINCE2 quality register. (The corresponding "Definition of Ready" is written out in full in the agile docs and has no acronym form here.) |
| DTC | Diagnostic Trouble Code | Vehicle fault codes. The `dtc_codes` catalogue and `obd_dtc_readings`; `obd_devices.dtc_count` is the live count per connected reader. |
| E2E | End-to-end | The Playwright suite under `app/e2e/`. Every registered capability carries an end-to-end assertion on its content, not merely on its route; golden-path and axe runs are ratcheted in `project-control/BASELINE.json`. |
| ERD | Entity Relationship Diagram | `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/` — Mermaid `erDiagram` sources generated from `server/src/db/schema.ts`, plus the caveat in `docs/18_DATABASE/DATABASE_DESIGN.md`. |
| FK | Foreign key | Referential links between tables, e.g. `org_id → organizations.id` on every tenant-owned table and `purchase_orders.requisition_id`. Catalogued in `docs/13_DATA_MODELING/RELATIONSHIP_CATALOG.md`. |
| HR | Human Resources | A permission module (`hr`), a role (`hr`), and a screen domain. Employee salary is one of the seven redacted fields in `FIELD_RULES`. |
| ITIL | Information Technology Infrastructure Library | The service-management framework the runbook and service-catalogue material in `docs/system/` is organised against. Described as the intended model, not an operating record — there is no production telemetry to document. |
| JWT | JSON Web Token | Both tokens issued by `server/src/auth/tokens.ts`: a 15-minute access token carrying the authorization claims, and a 30-day refresh token naming a `user_sessions` row. Signed HS256 with `jose`. |
| KPI | Key Performance Indicator | The measures rendered by the dashboard and executive-report screens (`execreports` module; the role-adaptive KPI home and board/CEO KPI screens in the screen registry). |
| OBD | On-Board Diagnostics | The vehicle diagnostic interface. `obd_devices` (reader, bay, VIN, live rpm/coolant/voltage/load) and `obd_dtc_readings`; routes in `server/src/routes/obd.ts`. |
| OEM | Original Equipment Manufacturer | Manufacturer-specific diagnostic tooling, catalogued per brand in `oem_tools` and surfaced by the OEM integrations screen. |
| OTP | One-Time Password | The six-digit code used for customer portal registration and verification. `otp_challenges.code_hash` stores a SHA-256 of the code, never the code; issuing, throttling and verification live in `server/src/auth/otp.ts`. |
| PK | Primary key | The `id` column of every table: `varchar(26)` holding a ULID. Documented per table in `docs/13_DATA_MODELING/DATA_DICTIONARY.md`. |
| PO | Purchase Order | The committed supplier order in procurement — `purchase_orders` + `purchase_order_lines`, the middle step of the `requisition → PO → receiving` golden path. (In the agile planning documents `PO` is also used for Product Owner; the procurement meaning is the one the code carries.) |
| PRINCE2 | PRojects IN Controlled Environments, version 2 | The project-governance method used in `docs/project-management/prince2/` — business case, stage gates, quality register. |
| QC | Quality Control / quality check | The gate between `repair` and `delivery` on a job card, and the `qc` role. Passing QC is an approval (`jobcards:a`), the passer is recorded in `job_cards.qc_passed_by`, and "perform repair / pass quality check" is a high-risk SOD pair. |
| RBAC | Role-Based Access Control | The 28-module × 15-role permission matrix in `packages/contract/src/rbac.ts`, enforced server-side by `server/src/security/permissions.ts` and published as `docs/19_SECURITY/RBAC_MATRIX.md`. |
| RLS | Row-Level Security | PostgreSQL policies carrying tenant, branch and ownership isolation — `server/drizzle/0001_rls.sql`, keyed on the request context set per transaction by `server/src/db/tenant.ts`. Enabled and FORCEd on 64 tables. |
| RTL | Right-to-left | The Arabic layout direction. RTL hazards are held at zero as a ratcheted measure, and Arabic/RTL verification is tracked per screen in `project-control/STATUS.json`. |
| SAR | Saudi Riyal | The display currency and the unit the approval ceilings are declared in (`ROLE_META[role].limitSar`). Rendered by `sarString` / `sarNumber` in `server/src/present.ts`; stored values are always halalas. |
| SLA | Service Level Agreement | The uptime commitment per subscription plan, documented in `docs/customer/system-status-guide.md`. No attainment record exists — there is no production deployment to measure. |
| SOD | Segregation of Duties | Six pairs of responsibilities one person must not hold, declared in `SOD` (`packages/contract/src/rbac.ts`) and enforced in the handlers — the procurement approval route refuses the raiser of a purchase order. |
| SPA | Single-Page Application | The React frontend in `app/`, client-side rendered with no SSR (the basis of `adr-001-react-spa.md` and of the risk assessment in `docs/security-report.md`). |
| SRS | Software Requirements Specification | `docs/MASTER_SRS.md` and `docs/requirements/srs.md` — the functional and non-functional requirement set, each requirement tied to the gate, ratchet or contract test that measures it. |
| UAT | User Acceptance Testing | The acceptance stage in the release process — `docs/developer/release-process.md`, `docs/management/quality-management-plan.md`, and the release plan. |
| ULID | Universally Unique Lexicographically Sortable Identifier | Every primary key. 26 characters, stored as `varchar(26)` rather than `char` so that no blank padding can make an identifier compare unequal to the value written. |
| VAT | Value Added Tax | `VAT_RATE_BPS = 1500` (15%), computed on the discounted net and rounded half-up once. `organizations.vat_number` is printed on invoices. |
| VIN | Vehicle Identification Number | `vehicles.vin`, `varchar(17)`; also carried on `obd_devices` and searchable through the `vehicles` collection's `?q=`. |
| WBS | Work Breakdown Structure | The project decomposition in `docs/project-management/pmp/wbs.md`, referenced by the schedule-management plan. |
| ZATCA | Zakat, Tax and Customs Authority | The Saudi tax authority. Its standard rate is `VAT_RATE_BPS`; `server/src/routes/invoices.ts` builds the phase-2 TLV QR payload and the invoice hash chain, and `adr-008-zatca-xml-generation.md` records the approach. |
