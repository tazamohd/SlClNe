# Executive summary

**Status:** NORMATIVE · **Owner:** Product owner · **Audience:** executives, sponsors, incoming team members, agents

If you read one document about SALIS AUTO, read this one. It answers what the product is, what state it is in, and what would have to be true before it ships.

## What SALIS AUTO is

A multi-tenant workshop management system for the Saudi automotive aftermarket. One deployment serves many garages; each garage is an organization, and organizations run branches.

It covers the operation end to end: booking and check-in, diagnosis and estimating, customer approval, the job card through the workshop, quality control, parts and procurement, invoicing under ZATCA VAT rules, payment and accounting, plus CRM, HR and payroll, insurance and loan workflows. Four portals face outward — customer, technician, supplier and procurement — alongside a kiosk, a call-centre console, a customer mobile app and a public website.

## Why it exists

Independent Saudi workshops run on paper job cards, a spreadsheet for parts, and WhatsApp for customer approval. The costs of that are specific: a job card that cannot be found, a part reserved twice, an estimate approved verbally and disputed at collection, a VAT return assembled by hand.

Seven objectives follow from that, and every capability in the product traces to one of them:

| Objective | Benefit |
|---|---|
| Increase workshop throughput | More jobs completed per bay per day |
| Protect parts and labour margin | Cost visibility and controlled procurement |
| Shorten the cash cycle | Faster invoicing, fewer unpaid balances |
| Retain customers | Repeat service revenue |
| Use technician capacity well | Utilisation and scheduling |
| Give owners operational visibility | Decisions made on current numbers |
| Keep financial control auditable | Approvals, segregation of duties, an audit trail |

The full mapping of objectives to capabilities to endpoints, screens and tests is in the [business capability map](../07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md).

## What exists today

Measured from source, not estimated — and deliberately not repeated as a list of numbers here, because a count written into prose goes stale the next time a route or a table is added.

The live figures are in [the documentation status](../00_DOCUMENT_CONTROL/DOCUMENTATION_STATUS.md), which is regenerated from the schema, the routers, the permission matrix and the spec files on every run of `npm run docs:generate`. In shape: tens of tables, hundreds of endpoints, a permission matrix of 28 modules against 15 roles, several hundred screens, and a test suite in the thousands of cases.

## What is genuinely strong

**The security model is enforced by the database and the server, not by convention.** Tenant isolation is a row-level-security policy that fails closed — a connection with no request context reads nothing — and it is `FORCE`d, so even the table owner is subject to it. The permission matrix exists once and both sides read it; a test asserts the two copies are identical rather than similar. Segregation of duties is enforced, not advisory: the person who raised a document cannot approve it, and a technician cannot pass quality control on their own repair. The audit log rejects `UPDATE` and `DELETE` at the database level, for everyone.

**Money is structurally protected.** Every money value is an integer count of halalas in a `bigint` column. Totals are computed server-side; a client-supplied total is never trusted. Rounding happens once, not per line.

**The product surface is complete and asserted.** Every registered screen renders, and every one has an end-to-end test asserting its *content* rather than merely that its route resolves. Twenty-three golden paths pass. RTL hazards are at zero.

## What is not done

**About two thirds of the screens still read design fixtures rather than the API.** This is the headline, and the exact figure is in [the project dashboard](../04_PROJECT_MANAGEMENT/PROJECT_DASHBOARD.md), which is generated. Those screens render correctly and are tested, and they have never exchanged a byte with the server under real latency, real errors or real permissions. Connecting them is the bulk of the remaining product work, and no release decision should be taken without it in view.

Three other gaps matter:

- **Referential integrity is not in the database.** 103 of 164 relationships are naming-convention links with no constraint behind them. Orphaned references are possible and nothing cascades. This may be the right trade — deletes are soft, tenancy is enforced by policy — but it is not written down as a decision anywhere, and it should be.
- **One lifecycle in eighteen declares its legal transitions.** Job cards have a transition table a single guard enforces. Invoices, purchase orders, requisitions, claims and the rest have a state enum and whatever the route handlers happen to check. For documents that move money, that is a financial-control gap.
- **Only four screens are tablet-verified.** A tablet is the primary device on a workshop floor.

The full list, with evidence for each, is in [production readiness](../30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md): **8 of 15 criteria are met.**

## What this documentation set can and cannot tell you

Every factual document here is generated from the implementation and diffed on every check, so it cannot drift from the code without breaking the build. That makes it reliable about *what the system does*.

It cannot tell you whether the system does what the business asked for. There is no elicited requirements baseline in this workspace — the requirements catalogue is reverse-engineered from the implementation and says so on every row. Establishing that baseline is the largest structural gap in the documentation, and it needs a business analyst and a stakeholder rather than a generator.

Market sizing, pricing and financial projections are likewise absent rather than estimated. Anything of that kind is marked `RESEARCH_REQUIRED`; nothing in this set fabricates a figure to fill the space.

## What would have to be true to ship

1. The fixture-backed screens connected to the API and exercised against it.
2. The financial lifecycles — invoice, purchase order, requisition — with declared, guarded transitions.
3. The foreign-key position settled: constraints added, or an ADR recording why not.
4. Tablet layouts verified, because that is the device the workshop floor uses.
5. A requirements baseline, so that "does it do what was asked" becomes an answerable question.

## Where to go next

| You are | Read |
|---|---|
| An executive | This document, then [production readiness](../30_RELEASE_CERTIFICATION/PRODUCTION_READINESS.md) |
| A product owner | The [business capability map](../07_BUSINESS_ANALYSIS/BUSINESS_CAPABILITY_MAP.md) |
| An architect | [Master architecture](../14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md), then the [C4 model](../15_C4_ARCHITECTURE_DIAGRAMS/C4_MODEL.md) |
| An engineer | The [API overview](../17_API_INTEGRATION/API_OVERVIEW.md) and the [entity catalogue](../13_DATA_MODELING/ENTITY_CATALOG.md) |
| An auditor | The [RBAC matrix](../19_SECURITY/RBAC_MATRIX.md) and [tenant isolation](../19_SECURITY/TENANT_ISOLATION.md) |
| Anyone about to rely on these documents | The [gap report](../00_DOCUMENT_CONTROL/DOCUMENTATION_GAP_REPORT.md) |
