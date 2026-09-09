# Estimate Approval Workflow

Diagrams for the two-phase estimate approval process: internal approval against role-based SAR ceilings (with segregation of duties), followed by customer approval via SMS, OTP, and canvas e-signature.

Source: [`docs/user-documentation/workflows/estimate-approval.md`](../../user-documentation/workflows/estimate-approval.md)

---

## Process Flow: Internal Approval to Customer Signature

```mermaid
flowchart TD
    A["Advisor creates estimate<br/>(parts + labour, VAT at 15%)"] --> B{"Grand total &lt;= submitter's<br/>approval ceiling?"}

    B -->|"Yes"| C{"Is the submitter also<br/>the estimate creator?"}
    C -->|"Yes"| D["403 — cannot approve own estimate<br/>(segregation of duties)"]
    D --> E["Must go to another authorized approver"]
    C -->|"No, different qualified person"| F["Internally Approved"]

    B -->|"No, exceeds ceiling"| G["Routed to Approval Inbox<br/>(visible to roles with sufficient ceiling)"]
    G --> H{"Reviewer's ceiling &gt;= amount?"}
    H -->|"No"| I["Escalate button shown (disabled):<br/>'Above your approval limit'"]
    I --> H
    H -->|"Yes"| J{"Reviewer == original creator?"}
    J -->|"Yes"| D
    J -->|"No"| K{"Reviewer decision"}

    K -->|"Reject"| L["Enter required rejection reason"]
    L --> M["Advisor notified — revises and resubmits"]
    M --> A
    K -->|"Approve"| F

    F --> N["System generates signed short URL"]
    N --> O["SMS sent to customer's registered phone"]
    O --> P["Customer opens link — Customer Approval screen"]
    P --> Q["Reviews line items, checks/unchecks per item<br/>(critical items pre-checked)"]
    Q --> R["Taps Proceed to Verify — 6-digit OTP sent"]
    R --> S{"OTP entered correctly?"}
    S -->|"No"| T["Invalid code — retry"]
    T --> R
    S -->|"Yes"| U["Signature canvas appears"]
    U --> V["Customer signs, taps Approve"]
    V --> W["Estimate status = customer_approved"]
    W --> X["Job card transitions to Repair stage"]

    E -.-> G
```

---

## Actor Interaction: Approval Chain and Customer E-Signature

```mermaid
sequenceDiagram
    actor Advisor as Service Advisor
    participant Sys as System
    actor Approver as Manager / Owner
    actor Customer

    Advisor->>Sys: Create estimate
    Sys->>Sys: canApprove(role, amount): authority + ceiling check

    alt Within submitter's own ceiling, not self-approval
        Advisor->>Sys: Approve & Proceed
    else Exceeds submitter's ceiling
        Sys->>Approver: Appears in Approval Inbox
        Approver->>Sys: Open item, review line items
        alt Amount exceeds approver's ceiling too
            Sys-->>Approver: Escalate (disabled) — needs higher authority
        else Approver is also the creator
            Sys-->>Approver: 403 — segregation of duties
        else Sufficient ceiling, different person
            Approver->>Sys: Approve (or Reject with reason)
        end
    end

    Sys->>Customer: SMS with signed short URL
    Customer->>Sys: Open link, select/defer line items
    Sys->>Customer: Send 6-digit OTP
    Customer->>Sys: Enter OTP
    Sys-->>Customer: Verified — show signature canvas
    Customer->>Sys: Sign, tap Approve
    Sys->>Sys: estimate.status = customer_approved
    Sys->>Sys: job.stage = repair
    Sys-->>Advisor: Workshop notified to begin work
```
