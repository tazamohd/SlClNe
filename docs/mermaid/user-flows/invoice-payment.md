# Invoice & Payment Workflow

Diagrams for invoice creation, ZATCA-compliant issuance (QR code, hash chain), and payment recording through to receipt generation. All monetary totals are computed server-side — the client only displays a provisional figure while drafting.

Source: [`docs/user-documentation/workflows/invoice-payment.md`](../../user-documentation/workflows/invoice-payment.md)

---

## Process Flow: Draft to Paid

```mermaid
flowchart TD
    A(["Create invoice: from job card or standalone"]) --> B["Add line items: parts, labour, fees"]
    B --> C{"Every line valid?<br/>description set, qty &gt; 0, price &gt;= 0"}
    C -->|"No"| D["Form Error Summary lists issues"]
    D --> B
    C -->|"Yes"| E["Provisional total shown (client-side)"]
    E --> F["Click Save Draft"]
    F --> G["Server computes authoritative<br/>subtotal, VAT (15%), grand total"]
    G --> H["Invoice status = Draft"]

    H --> I["Accountant reviews, clicks Issue Invoice"]
    I --> J["Server sets issuedAt, generates QR code,<br/>computes hashSelf / hashPrev chain"]
    J --> K["Invoice status = Issued<br/>(legal ZATCA document — no longer editable)"]

    K --> L["Customer pays: front desk or Customer App"]
    L --> M["Accountant opens Record Payment modal"]
    M --> N["Enter method, amount, reference, date"]
    N --> O{"Amount &lt;= remaining balance?"}
    O -->|"No"| P["Rejected — cannot exceed balance"]
    P --> M
    O -->|"Yes"| Q["Payment recorded, receipt auto-generated"]
    Q --> R{"paidHalalas == total?"}
    R -->|"Yes"| S(["Status = Paid"])
    R -->|"No"| T["Status = Partially Paid / Issued"]
    T --> M

    K --> U{"Due date passed and balance &gt; 0?"}
    U -->|"Yes"| V["Status = Overdue — flagged red, follow up"]
    U -->|"No"| K
```

---

## Actor Interaction: Issuance and Payment

```mermaid
sequenceDiagram
    actor Accountant
    participant Sys as System
    participant ZATCA
    actor Customer

    Accountant->>Sys: Create invoice (job card or standalone)
    Accountant->>Sys: Add / edit line items
    Sys-->>Accountant: Provisional total (display only)
    Accountant->>Sys: Save Draft
    Sys->>Sys: Compute authoritative subtotal / VAT / total
    Sys-->>Accountant: status = Draft

    Accountant->>Sys: Issue Invoice
    Sys->>Sys: Set issuedAt, compute hashSelf / hashPrev
    Sys->>ZATCA: Generate QR code (TLV) + VAT fields
    ZATCA-->>Sys: Compliant e-invoice record
    Sys-->>Accountant: status = Issued (legal document)

    Sys->>Customer: Deliver invoice
    Customer->>Sys: Pay (Card / Bank Transfer / Cash)
    Sys->>Sys: Validate amount <= balance
    Sys->>Sys: paidHalalas += amount, generate receipt

    alt Fully paid
        Sys-->>Accountant: status = Paid
        Sys-->>Customer: Receipt issued
    else Partial payment
        Sys-->>Accountant: status = Partially Paid
        Note over Accountant,Customer: Further payments repeat this exchange
    end
```
