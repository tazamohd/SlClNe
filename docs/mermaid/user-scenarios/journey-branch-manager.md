# Branch Manager Journey

The Branch Manager runs day-to-day operations for a single branch: assigning technicians, approving estimates and purchase orders up to SAR 50,000, scheduling staff, and monitoring branch KPIs. Their scope is strictly limited to their own branch -- other branches' data is hidden entirely, not just read-only. Anything above their SAR 50,000 ceiling escalates to the Owner.

## Primary Scenario: Daily Branch Operations

```mermaid
flowchart TD
    Login["Login\nmanager@salisauto.sa"] --> Dash["Operations Dashboard\nBranch scope: own branch only"]
    Dash --> Jobs["Job Cards\nAssign technicians"]
    Dash --> ApprovalQ["Approval Queue"]
    Dash --> Staff["Staff Scheduling\nRoster | Bays | Shifts"]
    Dash --> Reports["Branch Reports\nKPIs | Tech perf | Revenue"]
    Dash --> InvAlerts["Inventory Alerts\nLow stock | Pending POs"]

    Jobs --> AssignTech["Select technician\nby availability / specialization"]

    ApprovalQ --> AmtCheck{"Estimate / PO\namount vs SAR 50,000?"}
    AmtCheck -->|"SAR 0 - 50,000"| MgrApprove["Manager Approves"]
    AmtCheck -->|"Above SAR 50,000"| Escalate["Escalate to Owner"]
    MgrApprove --> Proceed["Proceeds to customer\napproval / repair"]
    Escalate --> OwnerReview["Owner reviews and decides"]

    Staff --> TechPerf["Technician Performance\n& Leaderboards"]
```

## Sub-Scenario: Approval Decision Examples

```mermaid
flowchart TD
    E1["Estimate SAR 12,000"] --> A1["Approved by Manager"]
    P1["PO SAR 35,000"] --> A2["Approved by Manager"]
    R1["Refund SAR 8,500"] --> A3["Approved by Manager"]
    E2["Estimate SAR 72,000"] --> A4["Escalated to Owner\n(exceeds SAR 50,000 ceiling)"]
```

**Segregation of duties**: the Manager cannot approve an estimate they created themselves -- it is checked server-side and must go to the Owner or another authorized approver instead.

**Branch scoping**: the Manager's dashboard shows full detail for their own branch (active jobs, technicians, revenue, pending approvals, bay occupancy, inventory alerts) while every other branch is completely hidden from view.
