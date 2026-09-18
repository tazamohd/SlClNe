# User Scenario Diagrams

Mermaid flowcharts for SALIS AUTO's 8 documented role journeys, converted from the hand-drawn SVGs in [`docs/visualizations/`](../../visualizations/) and cross-referenced against the user guides, portal guides, training courses, and the [job lifecycle workflow](../../user-documentation/workflows/job-lifecycle.md).

## Internal Staff Roles

| Role | Scenario | File |
|---|---|---|
| Owner / CEO | Unlimited-authority daily oversight: executive dashboard, BI reports, org-wide approval inbox, tenant configuration | [journey-owner-ceo.md](journey-owner-ceo.md) |
| Branch Manager | Branch-scoped operations: job/technician assignment, approvals up to SAR 50,000, staff scheduling, branch reports | [journey-branch-manager.md](journey-branch-manager.md) |
| Service Advisor | Customer-facing hub: check-in, estimate building (SAR 5,000 ceiling), e-signature coordination, delivery | [journey-service-advisor.md](journey-service-advisor.md) |
| Technician | Shop-floor repair work: job queue, inspection, parts requests, repair, SOD-gated handoff to QC | [journey-technician.md](journey-technician.md) |
| QC Inspector | Independent quality gate between Repair and Delivery, with server-enforced segregation of duties | [journey-qc-inspector.md](journey-qc-inspector.md) |
| Accountant | Org-wide finance: invoicing, ZATCA e-invoicing, payments, journal entries (SOD: post != approve), reporting | [journey-accountant.md](journey-accountant.md) |

## External Portal Roles

| Role | Scenario | File |
|---|---|---|
| Customer | Mobile app: booking, live 6-stage repair tracking, e-signature estimate approval, payment & review | [journey-customer.md](journey-customer.md) |
| Supplier | External portal scoped to own POs and payments only: order confirmation, shipment, invoicing, payment tracking | [journey-supplier.md](journey-supplier.md) |

## Sources

- Extracted SVG labels: `docs/visualizations/journey-*.html`
- Role guides: `docs/user-documentation/guides/` (owner-superadmin, manager, workshop-staff, finance-staff)
- Portal guides: `docs/user-documentation/portals/` (customer-app, supplier-portal, technician-portal)
- Shared workflows: `docs/user-documentation/workflows/job-lifecycle.md`, `estimate-approval.md`, `invoice-payment.md`
