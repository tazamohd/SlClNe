# Service Advisor Journey

The Service Advisor is the customer-facing hub of the workshop: they check vehicles in, hand off to the technician for inspection, build the cost estimate, coordinate customer e-signature approval, monitor repair progress, and deliver the vehicle. They can approve estimates up to SAR 5,000 directly (with customer e-signature); anything higher escalates up the approval chain.

## Primary Scenario: End-to-End Job Handling (Stages 1-6)

```mermaid
flowchart TD
    Login["Login\nadvisor@salisauto.sa"] --> CheckIn["Stage 1: Check-In\nCustomer | Vehicle | Services | Photos"]
    CheckIn --> Inspection["Stage 2: Inspection Handoff\nAssign to technician (internal only)"]
    Inspection --> Estimate["Stage 3: Estimate\nParts + Labour + 15% VAT"]

    Estimate --> CeilingCheck{"Estimate total\nvs approval ceilings"}
    CeilingCheck -->|"SAR 0 - 5,000"| AdvApprove["Advisor Approves\n+ customer e-signature"]
    CeilingCheck -->|"SAR 5,001 - 50,000"| MgrEsc["Escalate to Manager"]
    CeilingCheck -->|"Above SAR 50,000"| OwnerEsc["Escalate to Owner"]

    AdvApprove --> Communication["Customer Communication\nSend estimate | e-Signature (SMS/Email)"]
    MgrEsc --> Communication
    OwnerEsc --> Communication

    Communication --> Monitor["Stages 4-5: Monitor\nTrack repair progress, notify customer"]
    Monitor --> Delivery["Stage 6: Delivery\nChecklist | Notify customer"]
    Delivery --> HandOver["Vehicle handover\n(customer present)"]
```

## Sub-Scenario: Approval Ceiling Examples

```mermaid
flowchart TD
    W1["Oil change SAR 350"] --> R1["Advisor approves + e-sign"]
    W2["Brake overhaul SAR 4,800"] --> R2["Advisor approves + e-sign"]
    W3["Engine rebuild SAR 18,000"] --> R3["Escalated to Manager"]
    W4["Full respray SAR 65,000"] --> R4["Escalated to Owner"]
```

## Sub-Scenario: Customer Contact Touchpoints

Not every stage involves the customer directly -- this matters for how the Advisor coordinates communication.

```mermaid
flowchart TD
    S1["Check-In\nDirect customer contact"] --> S2["Inspection\nInternal only (no customer contact)"]
    S2 --> S3["Estimate\nDigital updates: SMS / Email"]
    S3 --> S4["Repair\nDigital updates: progress notifications"]
    S4 --> S5["QC\nInternal only (no customer contact)"]
    S5 --> S6["Delivery\nDirect customer contact"]
```

All estimates include an automatic 15% VAT calculation per Saudi ZATCA requirements.
