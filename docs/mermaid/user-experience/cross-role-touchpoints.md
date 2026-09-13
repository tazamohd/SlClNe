# Cross-Role Touchpoints — Moments of Truth

No SALIS AUTO persona experiences the platform in isolation. This map shows where the 8 roles' individual journeys hand off to one another — the "moments of truth" where one person's satisfaction depends entirely on another person (or the system) doing their part well and on time. A delay or friction point at any handoff ripples forward through the chain: a slow QC pass becomes a customer's unexplained wait; a late supplier delivery becomes a technician's idle bay.

```mermaid
flowchart TD
    Customer1["Customer books<br/>appointment"] --> Advisor1["Service Advisor<br/>checks in vehicle"]
    Advisor1 --> Tech1["Technician performs<br/>multi-point inspection"]
    Tech1 -->|"findings feed"| Advisor2["Service Advisor<br/>builds estimate"]
    Advisor2 -->|"within SAR 5K"| CustApprove{"Customer<br/>e-signs estimate"}
    Advisor2 -->|"exceeds SAR 5K"| Manager1["Branch Manager<br/>reviews & approves"]
    Manager1 -->|"exceeds SAR 50K"| Owner1["Owner/CEO<br/>approves"]
    Manager1 --> CustApprove
    Owner1 --> CustApprove

    CustApprove -->|"approved"| Tech2["Technician performs<br/>repair"]
    Tech2 -->|"parts needed"| Storekeeper1(["Storekeeper issues<br/>parts (internal)"])
    Storekeeper1 -.->|"low stock"| Supplier1["Supplier confirms &<br/>ships PO"]
    Supplier1 -.-> Storekeeper1

    Tech2 --> QC1["QC Inspector reviews<br/>(different person, SOD)"]
    QC1 -->|"fail"| Tech2
    QC1 -->|"pass"| Advisor3["Service Advisor<br/>coordinates delivery"]

    Advisor3 --> Customer2["Customer picks up<br/>vehicle, signs receipt"]
    Advisor3 --> Accountant1["Accountant issues<br/>ZATCA invoice"]
    Accountant1 --> Customer3["Customer pays<br/>(Stripe: card/mada/Apple Pay)"]
    Customer3 --> Accountant2["Accountant records<br/>payment & receipt"]

    Tech1 -.->|"visible to"| Customer1b["Customer sees<br/>live tracking"]
    Tech2 -.->|"visible to"| Customer1b
    QC1 -.->|"visible to"| Customer1b

    classDef customer fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    classDef advisor fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef technician fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef qc fill:#fce7f3,stroke:#db2777,color:#831843
    classDef manager fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef owner fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef accountant fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    classDef supplier fill:#f1f5f9,stroke:#475569,color:#1e293b

    class Customer1,CustApprove,Customer2,Customer3,Customer1b customer
    class Advisor1,Advisor2,Advisor3 advisor
    class Tech1,Tech2 technician
    class QC1 qc
    class Manager1 manager
    class Owner1 owner
    class Accountant1,Accountant2 accountant
    class Storekeeper1,Supplier1 supplier
```

## Moments of Truth

| Handoff | From → To | Why It Matters | Shared Risk |
|---|---|---|---|
| Check-in | Customer → Service Advisor | First impression of the whole visit; sets expectations for timing and cost | If odometer/belongings/issue notes are rushed or wrong, disputes surface at delivery |
| Inspection handoff | Service Advisor → Technician | Advisor's promises to the customer are only as good as the technician's inspection thoroughness | An incomplete inspection (blocked at 22/22 items) delays the estimate the customer is waiting on |
| Estimate escalation | Advisor → Manager → Owner | Every SAR ceiling boundary (5K / 50K) is a potential customer-facing delay, invisible to the customer | No shared SLA visibility across the escalation chain; customer just sees "waiting" |
| Customer e-signature | Advisor ⇄ Customer | The only step where the customer actively blocks the workflow — OTP + signature friction stalls the technician who is otherwise idle | Advisor fields the "why is it taking so long" call; technician's bay sits unused |
| Parts request | Technician → Storekeeper → Supplier | A technician's repair pace is capped by inventory the technician doesn't control | Supplier delivery delays cascade invisibly to the customer's pickup date |
| QC gate (SOD) | Technician → QC Inspector | Independent verification protects the customer, but a "Return to Repair" resets the clock for everyone downstream | Advisor must re-message the customer; no structured reason code shared automatically |
| Delivery → Invoice | Advisor → Accountant → Customer | ZATCA-compliant invoice must be correct and fast, or the customer waits at the counter after already being told the car is "ready" | ZATCA validation failures (missing VAT fields, broken hash chain) block the very last step of an otherwise-complete journey |
| Live tracking | Technician / QC → Customer (passive) | The customer's entire mid-journey experience is secondhand — they never see the workshop, only status updates | Any internal delay that isn't reflected in a stage update reads to the customer as silence, the single biggest driver of anxiety in service journeys |
