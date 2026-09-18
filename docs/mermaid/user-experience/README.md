# User Experience Journey Maps

This directory documents the **experiential/emotional layer** of SALIS AUTO's 8 personas — satisfaction highs and lows across each role's end-to-end journey, using Mermaid's native `journey` diagram type. This is complementary to (not a duplicate of) separate documentation covering each role's functional steps (flowcharts) and operational workflows (process diagrams).

## Persona Journeys

| File | Persona | Description |
|---|---|---|
| [owner-ceo.md](./owner-ceo.md) | Owner / CEO | Daily oversight, approvals, and strategic control across all branches with unlimited approval authority |
| [branch-manager.md](./branch-manager.md) | Branch Manager | Running a single branch — staffing, scheduling, approvals up to SAR 50,000, and escalation |
| [service-advisor.md](./service-advisor.md) | Service Advisor | The customer-facing role spanning check-in through delivery, balancing customer expectations against internal workflow |
| [technician.md](./technician.md) | Technician | Shop-floor work through the Technician Portal — inspections, repairs, parts requests, and QC handoff |
| [qc-inspector.md](./qc-inspector.md) | QC Inspector | The independent quality gate enforcing segregation of duties between repair and sign-off |
| [accountant.md](./accountant.md) | Accountant | Financial operations — journal entries, ZATCA-compliant invoicing, payments, and month-end close |
| [customer.md](./customer.md) | Customer (external portal) | Mobile-first booking, live repair tracking, e-signature approval, and payment via the Customer App |
| [supplier.md](./supplier.md) | Supplier (external portal) | B2B order fulfillment — confirming POs, shipping, invoicing, and getting paid via the Supplier Portal |

## Cross-Functional View

| File | Description |
|---|---|
| [cross-role-touchpoints.md](./cross-role-touchpoints.md) | A Mermaid flowchart of "moments of truth" — where personas' journeys intersect and hand off to each other, from booking through payment |

## How to Read These Docs

Each persona file contains:
1. A short description of the persona's overall relationship with the product.
2. A Mermaid `journey` diagram with 3-5 phases and 3-6 satisfaction-scored (1-5) tasks per phase.
3. A touchpoint table mapping each stage to its screen, known pain points (grounded in `docs/knowledge-base/troubleshooting/common-issues.md`, `docs/requirements/non-functional/usability.md`, `docs/requirements/non-functional/accessibility.md`, and `docs/A11Y_AUDIT.md`), and a suggested opportunity or mitigation.

Grounding sources: `docs/visualizations/journey-*.html`, `docs/user-documentation/guides/*.md`, `docs/user-documentation/portals/*.md`, `docs/requirements/non-functional/usability.md`, `docs/requirements/non-functional/accessibility.md`, `docs/knowledge-base/troubleshooting/common-issues.md`, and `docs/A11Y_AUDIT.md`.
