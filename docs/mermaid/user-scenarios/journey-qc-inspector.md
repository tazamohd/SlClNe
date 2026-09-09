# QC Inspector Journey

The QC Inspector is the quality gate between Repair and Delivery -- an independent, branch-scoped role with a SAR 0 approval ceiling (they approve quality, not money). Their defining constraint is a server-enforced segregation-of-duties (SOD) rule: whoever performed the repair on a job can never be the one to pass its QC, even if they hold a more senior role.

## Primary Scenario: Quality Check Gate

```mermaid
flowchart TD
    Login["Login"] --> Queue["QC Queue\n(jobs awaiting quality check)"]
    Queue --> Select["Select Job"]
    Select --> Review["Review Details\n(completed work vs. estimate)"]
    Review --> Checklist["Complete QC Checklist\nRepair verified | Fluids | Test drive | Cleaned | Docs ready"]

    Checklist --> Decision{"All checks pass?"}
    Decision -->|PASS| SignOff["Sign Off / Pass QC"]
    SignOff --> Delivery["Job advances to Delivery"]

    Decision -->|FAIL| Return["Return to Repair\n+ notes on what to correct"]
    Return --> TechFix["Technician addresses issues"]
    TechFix --> Queue
```

## Sub-Scenario: Segregation-of-Duties Check

```mermaid
flowchart TD
    Attempt["Inspector attempts to Pass QC"] --> ServerCheck{"Server checks audit trail:\nsame person who did the Repair?"}
    ServerCheck -->|"Different person"| Allowed["QC action allowed"]
    ServerCheck -->|"Same person\n(SOD Zone violation)"| Blocked["403 error\n'Must differ from technician'"]
    Blocked --> Reassign["A different QC Inspector\nmust perform the check"]
```

This control checks the actual individual, not just the role -- even a Branch Manager who personally performed a repair cannot pass QC on that same job.
