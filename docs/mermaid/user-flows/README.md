# User Flow Diagrams

Mermaid flowcharts and sequence diagrams for SALIS AUTO's detailed, step-by-step operational workflows — converted from the prose documentation under `docs/user-documentation/workflows/` and `docs/knowledge-base/how-to/`. These diagram the *process* (screens, actors, gates, decision points), not the role journeys/personas covered elsewhere, and not the raw state machine already diagrammed in `docs/mermaid/project/`.

---

## Core Workshop & Finance Flows

| File | Description |
|---|---|
| [job-lifecycle.md](./job-lifecycle.md) | The eight-stage job card lifecycle from Check-In through Closed, including the QC segregation-of-duties gate. |
| [estimate-approval.md](./estimate-approval.md) | Internal approval by SAR ceiling plus customer e-signature approval (SMS, OTP, canvas signature). |
| [invoice-payment.md](./invoice-payment.md) | Invoice creation, ZATCA issuance (QR code, hash chain), and payment recording through to receipt. |
| [diagnostic-report.md](./diagnostic-report.md) | OBD scan and diagnostic report generation, fanned out to five recipients, assembled into a finalized estimate. |
| [onboarding-flows.md](./onboarding-flows.md) | The three onboarding paths: garage owner application, customer self-signup, and supplier application. |

## Administrative How-To Flows

| File | Description |
|---|---|
| [how-to-configure-branches.md](./how-to-configure-branches.md) | Creating a branch, assigning users by scope, inter-branch inventory transfer, and branch deactivation. |
| [how-to-customize-workflows.md](./how-to-customize-workflows.md) | The generic approval-ceiling (`canApprove`) check, and configuring notifications, templates, and checklists. |
| [how-to-generate-reports.md](./how-to-generate-reports.md) | Viewing, filtering, and exporting reports (with the 50,000-row CSV limit), and the Custom Reports Builder. |
| [how-to-manage-inventory.md](./how-to-manage-inventory.md) | Stock issue/receive/adjust/transfer operations and the full purchase-requisition-to-receiving cycle. |
| [how-to-manage-users-roles.md](./how-to-manage-users-roles.md) | User account create/edit/deactivate lifecycle, and admin-initiated vs. self-service password reset. |
| [how-to-setup-integrations.md](./how-to-setup-integrations.md) | Setup procedures for ZATCA e-invoicing, the Stripe payment gateway, and OBD device pairing. |
