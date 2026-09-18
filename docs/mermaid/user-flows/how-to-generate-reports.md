# How To: Generate Reports

Diagrams for navigating to and filtering a report, the CSV export path with its 50,000-row limit, and the Custom Reports Builder flow.

Source: [`docs/knowledge-base/how-to/generate-reports.md`](../../knowledge-base/how-to/generate-reports.md)

---

## View, Filter, and Export a Report

```mermaid
flowchart TD
    A["User opens Reports &amp; Analytics"] --> B{"Has reports:v<br/>(or execreports:v) permission?"}
    B -->|"No"| C(["No access to this report"])
    B -->|"Yes"| D["Select report — opens in FeatureScreen"]
    D --> E["Apply date range filter (or preset)"]
    E --> F{"Branch-scoped user?"}
    F -->|"Yes"| G["Branch filter pre-set and read-only"]
    F -->|"No — org-scoped"| H["Select a branch or All Branches"]
    G --> I["Apply additional filters:<br/>technician, service type, status, customer type"]
    H --> I
    I --> J["View KPI stat cards, tables, charts"]
    J --> K{"Export needed?"}
    K -->|"No"| L(["Done — view only"])
    K -->|"Yes"| M["Click Export / Download CSV"]
    M --> N{"Filtered rows &gt; 50,000?"}
    N -->|"Yes"| O["Narrow scope: date range,<br/>branch, or status filter"]
    O --> M
    N -->|"No"| P(["CSV downloaded —<br/>formula-injection safe, UTF-8 with BOM"])
```

---

## Custom Reports Builder

```mermaid
flowchart TD
    A2["Navigate to Custom Reports"] --> B2["Select source: invoices, journal, expenses, jobs, ..."]
    B2 --> C2["Choose columns to include"]
    C2 --> D2["Set filters to narrow the data"]
    D2 --> E2["Preview the report"]
    E2 --> F2{"Looks correct?"}
    F2 -->|"No — adjust"| C2
    F2 -->|"Yes"| G2["Save — stored in saved_reports<br/>(name, source, definition JSON)"]
    G2 --> H2(["Re-run later with updated data"])
```
