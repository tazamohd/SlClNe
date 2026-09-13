# Technician Journey

The Technician works the shop floor from a dedicated Technician Portal, scoped to only their own assigned jobs. Their scenario spans two of the six job-lifecycle stages -- Inspection and Repair -- plus requesting parts along the way. A hard segregation-of-duties (SOD) rule blocks them from ever passing QC on work they personally repaired.

## Primary Scenario: Job Queue to QC Handoff

```mermaid
flowchart TD
    Login["Login"] --> Queue["My Jobs Queue\n(own assigned jobs only)"]
    Queue --> Accept["Accept Job"]
    Accept --> Details["View Job Details\n(customer contact redacted)"]

    Details --> StageCheck{"Job stage?"}
    StageCheck -->|Inspection| Inspect["Perform Multi-Point Inspection\n6 systems, Pass/Fail/N-A"]
    Inspect --> CompleteInsp["Complete Inspection\n(all items must be evaluated)"]
    CompleteInsp --> ToEstimate["Job moves to Estimate stage\n(Advisor takes over)"]

    StageCheck -->|Repair| PartsNeeded{"Need parts?"}
    PartsNeeded -->|Yes| PartsRequest["Parts Request\nSAR 0 ceiling"]
    PartsRequest --> Repair["Perform Repair"]
    PartsNeeded -->|No| Repair
    Repair --> SOD["SOD Boundary\nRepairing tech is now locked out of QC on this job"]
    SOD --> Handoff["Handoff to QC"]
    Handoff --> NextJob["Next Job in Queue"]
    NextJob --> Queue
```

## Sub-Scenario: Parts Request Flow

```mermaid
flowchart TD
    Select["Select job card"] --> Search["Search part by name / SKU / category"]
    Search --> Qty["Enter quantity + notes"]
    Qty --> Submit["Submit Request"]
    Submit --> Status{"Storekeeper decision"}
    Status -->|Approved| Issued["Issued\ndeducted from inventory, assigned to job"]
    Status -->|Rejected| Rejected["Rejected\n(unavailable / see notes)"]
    Issued --> Continue["Technician continues repair"]
```

**Boundaries**: Technicians cannot see customer phone/email (redacted), cannot approve estimates (SAR 0 ceiling), cannot pass QC on their own repairs, cannot see financial figures, and can only see jobs assigned to them ("own" scope).
