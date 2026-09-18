# Approval Escalation Ladder

When a job card estimate or purchase order total exceeds the creator's own approval ceiling, it escalates up this SAR ladder until it lands within an approver's authority. Source: `docs/user-documentation/workflows/job-lifecycle.md` §Stage 3, `docs/knowledge-base/reference/rbac-matrix.md`, `docs/system/architecture/auth-architecture.md` §7.

```mermaid
flowchart TD
    START(["Estimate / PO total\ncomputed server-side"]) --> CHECK{"Within submitter's\napproval ceiling?"}

    CHECK -- "yes" --> APPROVE["Approve & Proceed\n(same actor, if not the creator)"]
    CHECK -- "no, and creator == submitter" --> SOD["Blocked by segregation of duties:\ncreator cannot approve own item"]
    CHECK -- "no" --> INBOX["Submit for Approval\n-> Approval Inbox"]

    INBOX --> L1{"<= SAR 5,000?"}
    L1 -- yes --> A1["Service Advisor approves"]
    L1 -- no --> L2{"<= SAR 10,000?"}

    L2 -- yes --> A2["Storekeeper approves"]
    L2 -- no --> L3{"<= SAR 15,000?"}

    L3 -- yes --> A3["HR Manager approves"]
    L3 -- no --> L4{"<= SAR 20,000?"}

    L4 -- yes --> A4["Procurement Agent approves"]
    L4 -- no --> L5{"<= SAR 25,000?"}

    L5 -- yes --> A5["Accountant approves"]
    L5 -- no --> L6{"<= SAR 50,000?"}

    L6 -- yes --> A6["Branch Manager approves"]
    L6 -- no --> A7["Owner / CEO approves\n(unlimited ceiling)"]

    A1 --> DONE["Approved -> proceed\n(Repair stage / Sent to Supplier)"]
    A2 --> DONE
    A3 --> DONE
    A4 --> DONE
    A5 --> DONE
    A6 --> DONE
    A7 --> DONE

    classDef ceiling fill:#fbf4e0,stroke:#d9b86b;
    class A1,A2,A3,A4,A5,A6,A7 ceiling;
```

## Ladder reference

| Step | Role | Ceiling (SAR) | Ceiling (halalas) |
|---|---|---|---|
| 1 | Service Advisor | 5,000 | 500,000 |
| 2 | Storekeeper | 10,000 | 1,000,000 |
| 3 | HR Manager | 15,000 | 1,500,000 |
| 4 | Procurement Agent | 20,000 | 2,000,000 |
| 5 | Accountant | 25,000 | 2,500,000 |
| 6 | Branch Manager | 50,000 | 5,000,000 |
| 7 | Owner / CEO (also Super Admin) | Unlimited | — |

Notes:
- Above the submitter's own ceiling, the API responds **422 `approval_required`** (an escalation), never **403 `forbidden`** (a denial) — the distinction matters because 403 means "never allowed" while 422 means "not yet, needs a higher approver."
- **Segregation of duties**: the person who submitted an estimate, requisition, purchase order, or insurance claim can never also be its approver, even if their role's ceiling would otherwise cover the amount.
- Roles with a SAR 0 ceiling (Technician, QC Inspector, Receptionist, Call Center Agent, Supplier, Customer) hold no monetary approval authority at all — QC's "approval" is the non-monetary pass/fail gate on job cards, not a SAR ceiling.
