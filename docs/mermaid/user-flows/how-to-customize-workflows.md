# How To: Customize Workflows

Diagrams for the generic approval-ceiling check that gates estimates, purchase orders, expenses, and other approvable items across SALIS AUTO, and for the administrative steps that configure notifications, service templates, and inspection checklists.

Source: [`docs/knowledge-base/how-to/customize-workflows.md`](../../knowledge-base/how-to/customize-workflows.md)

---

## Approval Ceiling Check (canApprove)

```mermaid
flowchart TD
    A["Item submitted for approval<br/>(estimate, purchase requisition/order, expense, ...)"] --> B["canApprove(role, amount) evaluated"]
    B --> C{"Role holds the 'approve' (a)<br/>action on this module?"}
    C -->|"No"| D["Approval blocked — no authority"]
    C -->|"Yes"| E{"Amount &lt;= role's SAR ceiling?"}
    E -->|"No"| F["Blocked — must escalate to a<br/>role with a higher ceiling"]
    F --> B
    E -->|"Yes"| G{"submitted_by == approved_by?"}
    G -->|"Yes"| H["Rejected — segregation of duties"]
    G -->|"No"| I(["Approval granted"])
```

---

## Configuring Workflow Settings

```mermaid
flowchart TD
    A2["Owner / Manager navigates to Settings"] --> B2{"What to configure?"}
    B2 -->|"Notifications"| C2["Select event types + delivery channel<br/>(in-app, SMS, WhatsApp, email) per user"]
    B2 -->|"Service template"| D2["Define label, icon, standard duration,<br/>parts required, labor steps, price"]
    B2 -->|"Estimate template"| E2["Define pre-populated line items<br/>(description, kind, qty, unit price)"]
    B2 -->|"Inspection checklist"| F2["Define categories and required items,<br/>each with pass/fail + notes + photo"]

    C2 --> G2["Saved per user — applies to future events"]
    D2 --> H2["Available when creating job cards / estimates"]
    E2 --> I2["Available when building estimates"]
    F2 --> J2["Used at Inspection stage —<br/>all items required before advancing to Estimate"]
```
