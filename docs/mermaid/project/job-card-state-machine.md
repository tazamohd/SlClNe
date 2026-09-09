# Job Card State Machine

The 8-stage job card lifecycle, from vehicle check-in through closure. Stages cannot be skipped (server returns 422 on an invalid transition), and QC can bounce work back to Repair. Source: `docs/user-documentation/workflows/job-lifecycle.md`.

```mermaid
stateDiagram-v2
    [*] --> CheckIn

    CheckIn: Check-In\n(Receptionist / Service Advisor)
    Inspection: Inspection\n(Technician)
    Estimate: Estimate\n(Service Advisor)
    Repair: Repair\n(Technician)
    QC: Quality Check\n(QC Inspector)
    Delivery: Delivery\n(Service Advisor)
    Invoiced: Invoiced\n(Accountant)
    Closed: Closed\n(System, automatic)

    CheckIn --> Inspection: Complete Check-In\n(odometer, fuel, belongings recorded)
    Inspection --> Estimate: Complete Inspection\n(all checklist items must have a verdict)
    Estimate --> Repair: Approved (internal + customer)\nwithin approval ceiling
    Repair --> QC: Complete Repair\n(technician recorded in audit trail)
    QC --> Delivery: Pass QC\n(all 6 checklist items pass)
    QC --> Repair: Return to Repair\n(fails checklist, notes required)
    Delivery --> Invoiced: Complete Delivery\n(all 6 checklist items checked)
    Invoiced --> Closed: Invoice fully paid
    Closed --> [*]

    note right of QC
        Segregation of duties:
        the technician who performed
        the Repair cannot Pass QC for
        the same job card (checked against
        the audit trail, applies to the
        specific person, not just the role).
        Violation returns 403.
    end note

    note right of Estimate
        Approval ladder if total exceeds
        the creator's ceiling:
        Advisor 5K -> Storekeeper 10K ->
        HR Mgr 15K -> Procurement 20K ->
        Accountant 25K -> Branch Mgr 50K ->
        Owner unlimited.
        Creator cannot approve their own estimate.
    end note
```

## Rules and constraints

| Rule | Enforcement |
|---|---|
| Stages cannot be skipped | Server-side; returns 422 on an invalid transition |
| Inspection must be 100% complete | All checklist items need a verdict before submission (estimate is built from findings) |
| QC must pass before Delivery | Server-side enforcement |
| Repair technician cannot pass QC on the same job | Segregation of duties, server-side, checked against the audit trail |
| Estimate above the creator's ceiling must escalate | Routed to the Approval Inbox |
| Customer contact hidden from technicians | Field-level redaction |

## Stage detail

| Stage | Who acts | Screen | What happens |
|---|---|---|---|
| Check-In | Receptionist / Service Advisor | `/workshop-checkin` | Vehicle received, odometer/fuel/belongings/issues recorded |
| Inspection | Technician | `/workshop-inspection` | Multi-point inspection across 6 vehicle systems (engine, brakes, tires, electrical, fluids, body) |
| Estimate | Service Advisor | `/workshop-estimate` | Parts + labour line items, VAT 15%, approval-ceiling check |
| Repair | Technician | Technician Portal | Approved work performed; parts requested from Storekeeper |
| QC | QC Inspector | `/workshop-qc` | 6-item QC checklist; pass or return-to-repair decision |
| Delivery | Service Advisor | `/workshop-delivery` | 6-item delivery checklist; vehicle handed to customer |
| Invoiced | Accountant | `/invoice-create` | Invoice generated from job card line items |
| Closed | System (automatic) | — | Permanent record; cannot be reopened or modified |
