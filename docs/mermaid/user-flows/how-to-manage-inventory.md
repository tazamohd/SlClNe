# How To: Manage Inventory

Diagrams for the four stock movement operations (issue, receive, adjust, transfer) including the issue/adjust segregation-of-duties rule and reorder alerting, and for the full purchase-requisition-to-receiving procurement cycle.

Source: [`docs/knowledge-base/how-to/manage-inventory.md`](../../knowledge-base/how-to/manage-inventory.md)

---

## Stock Movement Operations

```mermaid
flowchart TD
    A["Select a part"] --> B{"Which operation?"}

    B -->|"Issue Stock"| C["Enter quantity, job card reference, reason"]
    C --> D["Confirm — negative delta, on_hand decreases"]

    B -->|"Receive Stock"| E["Enter quantity, PO reference, reason"]
    E --> F["Confirm — positive delta, on_hand increases"]

    B -->|"Adjust Stock"| G{"Same user who issued<br/>this part's stock?"}
    G -->|"Yes"| H["Blocked — segregation of duties:<br/>Issue Stock / Adjust Stock"]
    G -->|"No"| I["Enter actual count + required reason,<br/>Confirm — delta computed automatically"]

    B -->|"Transfer"| J["Select destination branch + quantity"]
    J --> K{"Destination in same organization?"}
    K -->|"No"| L["422 rule_violated — rejected"]
    K -->|"Yes"| M["Paired debit/credit movements created,<br/>shared transfer_id"]

    D --> N{"on_hand &lt;= reorder_level?"}
    F --> N
    I --> N
    M --> N
    N -->|"Yes"| O["Storekeeper + Procurement Agent notified<br/>(reorder alert)"]
    N -->|"No"| P(["No alert"])
```

---

## Purchase Requisition to Receiving

```mermaid
sequenceDiagram
    actor Requester
    participant Sys as System
    actor Approver
    actor Storekeeper

    Requester->>Sys: Create requisition (header + line items)
    Sys->>Sys: Compute estimatedTotalHalalas
    Requester->>Sys: Submit for approval
    Sys->>Approver: Route (needs procurement:a + ceiling >= total)

    alt Approver is also the submitter
        Sys-->>Approver: Blocked — segregation of duties
    else Different, sufficiently authorized approver
        Approver->>Sys: Approve requisition
        Requester->>Sys: Convert to Purchase Order (select supplier)
        Sys->>Sys: totalHalalas = subtotalHalalas + taxHalalas
        Requester->>Sys: Submit PO for approval
        Approver->>Sys: Approve PO (same ceiling / segregation rules)
        Storekeeper->>Sys: Receive goods, record received qty per line
        Sys->>Sys: Enforce receivedQty <= qty ordered
        Sys->>Sys: Create inventory_movements (type=receive, +delta)
        Sys-->>Storekeeper: on_hand updated, audit trail complete
    end
```
