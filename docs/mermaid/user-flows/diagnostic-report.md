# Diagnostic Report Workflow

Diagrams for the OBD diagnostic chain: connecting the scanner, generating a report, fanning that report out to five recipients in parallel, and assembling their contributions into a finalized, customer-facing estimate.

Source: [`docs/user-documentation/workflows/diagnostic-report.md`](../../user-documentation/workflows/diagnostic-report.md)

---

## Process Flow: OBD Scan to Customer Presentation

```mermaid
flowchart TD
    A["Technician connects OBD-II scanner to vehicle port"] --> B["Live sensor data streams:<br/>RPM, coolant temp, voltage, fuel pressure, etc."]
    B --> C["Retrieve DTC codes (P / B / C / U prefixes)"]
    C --> D["Click Generate Report"]
    D --> E["System compiles findings, severity, photos, notes"]
    E --> F["Technician selects shareWith recipients"]
    F --> G["Click Submit Report"]

    G --> H{{"Fan-out to 5 recipients"}}
    H --> I["Reception: notified, 'Discuss with Customer' CTA"]
    H --> J["Customer: SMS/email link to view report"]
    H --> K["Vehicle History: report permanently attached"]
    H --> L["Storekeeper: parts-list task"]
    H --> M["Supervisor / Branch Manager: full report"]

    L --> N{"Parts in stock?"}
    N -->|"No"| O["Initiate purchase requisition"]
    N -->|"Yes"| P["Submit priced parts list"]
    O --> P

    M --> Q["Add labour hours, handling fee, ETA"]
    Q --> R["Submit cost build-up"]

    P --> S["System assembles finalized estimate<br/>(findings + priced parts + labour + fee + VAT)"]
    R --> S
    S --> T["Service Advisor reviews for accuracy"]
    T --> U["Reception presents finalized estimate to customer"]
    U --> V["Triggers Estimate Approval Workflow"]

    J --> W["Customer previews findings<br/>before formal estimate arrives"]
```

---

## Actor Interaction: Fan-Out Distribution

```mermaid
sequenceDiagram
    actor Tech as Technician
    participant Sys as System
    actor Reception
    actor Customer
    actor Storekeeper
    actor Supervisor as Workshop Supervisor
    actor Advisor as Service Advisor

    Tech->>Sys: Connect OBD device, scan sensors and DTCs
    Tech->>Sys: Generate Report
    Sys->>Sys: Compile findings / parts / labour sections
    Tech->>Sys: Submit Report (select recipients)

    par Fan-out distribution
        Sys->>Reception: Notification + "Discuss with Customer"
        Sys->>Customer: SMS / email link to report
        Sys->>Sys: Attach report to vehicle history
        Sys->>Storekeeper: Parts-list task
        Sys->>Supervisor: Full report for labour and ETA
    end

    Storekeeper->>Sys: Price parts (requisition if not in stock)
    Supervisor->>Sys: Add labour hours, handling fee, ETA
    Sys->>Sys: Assemble finalized estimate (server computes VAT + total)
    Sys->>Advisor: Estimate ready for review
    Advisor->>Reception: Hand off finalized estimate
    Reception->>Customer: Present estimate
    Note over Customer,Sys: Continues into Estimate Approval Workflow
```
