# How To: Configure Branches

Diagrams for setting up branch locations, assigning users to them, and the branch-scoped operations that follow: cross-branch inventory transfers and branch deactivation.

Source: [`docs/knowledge-base/how-to/configure-branches.md`](../../knowledge-base/how-to/configure-branches.md)

---

## Branch Setup and User Assignment

```mermaid
flowchart TD
    A["Admin navigates to Administration &gt; Branches"] --> B["Click Add Branch"]
    B --> C["Enter name, name (Arabic), city, isMain"]
    C --> D["Save — system generates ULID id, sets org_id"]
    D --> E["Branch available for assignment"]
    E --> F["Navigate to Admin &gt; Users, open a user"]
    F --> G{"Is the user's role branch-scoped?<br/>(Manager, Advisor, Technician, QC,<br/>Storekeeper, Frontdesk, Call Center)"}
    G -->|"Yes"| H["Branch selection required — select from dropdown"]
    G -->|"No — Owner, Super Admin, Accountant,<br/>HR Manager, Procurement Agent"| I["Branch not required — org/platform scope"]
    H --> J["Save — user sees only records<br/>matching their assigned branch_id"]
    I --> K["Save — user sees records<br/>across all branches"]
```

---

## Inter-Branch Transfer and Branch Deactivation

```mermaid
flowchart TD
    A2["Storekeeper selects Transfer on a part"] --> B2["Choose destination branch + quantity"]
    B2 --> C2{"Destination branch in<br/>the same organization?"}
    C2 -->|"No"| D2["422 rule_violated — rejected"]
    C2 -->|"Yes"| E2["Create paired inventory_movements:<br/>debit at source, credit at destination,<br/>shared transfer_id"]
    E2 --> F2["on_hand updated at both branches"]

    G2(["Decision: deactivate a branch"]) --> H2["Reassign all active users to other branches"]
    H2 --> I2["Complete or transfer all open job cards"]
    I2 --> J2["Transfer remaining inventory to other branches"]
    J2 --> K2["Set branch status = inactive"]
    K2 --> L2(["Historical records remain linked —<br/>not deleted, still visible in reports"])
```
