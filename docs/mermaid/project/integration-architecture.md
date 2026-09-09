# Integration Architecture

Hub-and-spoke view of SALIS AUTO's external integrations. Every integration follows the same "no silent fakes" contract: **unconfigured** (refuses with 503, names the missing credentials), **mock** (deterministic, flagged `mock: true`), or **live** (real credentials, not all shipped yet). Source: `docs/visualizations/integration-architecture.html`, `docs/system/integration/*.md`.

```mermaid
flowchart LR
    API(["SALIS AUTO API\n(the hub)"])

    ZATCA["ZATCA E-Invoicing\nREST + SOAP (XML)\nBidirectional, per-invoice real-time\nStatus: Active - Mandatory"]
    STRIPE["Stripe Payments\nREST API + Webhooks\nBidirectional, per-transaction\nStatus: Active"]
    SMS["SMS Provider\nREST API\nOutbound, event-driven (OTP, alerts)\nStatus: Active"]
    WHATSAPP["WhatsApp Business API\nREST API\nOutbound, event-driven\nStatus: Planned - Q2 2026"]
    EMAIL["Email Service\nSMTP / REST API\nOutbound, event-driven + scheduled\nStatus: Active"]
    OBD["OBD / Telematics\nOBD-II / CAN Bus / IoT Gateway\nInbound, continuous telemetry\nStatus: Future - roadmap"]

    API <-->|"Invoice XML, QR codes,\nvalidation responses, certificates"| ZATCA
    API <-->|"Payment intents, refunds,\ncustomer tokens, webhook events"| STRIPE
    API -->|"OTP codes, appointment reminders,\nservice status notifications"| SMS
    API -->|"Service completion updates,\nappointment confirmations, feedback"| WHATSAPP
    API -->|"Transactional emails, receipts,\nmarketing campaigns, alerts"| EMAIL
    OBD -->|"DTCs, engine data,\nGPS location, fleet metrics"| API

    classDef active fill:#eaf6ea,stroke:#5a9;
    classDef planned fill:#fbf4e0,stroke:#d9b86b;
    classDef future fill:#f1eaf8,stroke:#a98ee0,stroke-dasharray: 4 4;
    class ZATCA,STRIPE,SMS,EMAIL active;
    class WHATSAPP planned;
    class OBD future;
```

## Integration status

| Integration | Protocol | Direction | Frequency | Status |
|---|---|---|---|---|
| ZATCA E-Invoicing | REST + SOAP (XML) | Bidirectional | Per invoice (real-time) | Active — mandatory |
| Stripe Payments | REST API + Webhooks | Bidirectional | Per transaction + webhook callbacks | Active |
| SMS Provider | REST API | Outbound | Event-driven (OTP, alerts) | Active |
| WhatsApp Business API | REST API | Outbound | Event-driven | Planned — Q2 2026 |
| Email Service | SMTP / REST API | Outbound | Event-driven + scheduled | Active |
| OBD / Telematics | OBD-II / CAN Bus / IoT Gateway | Inbound | Continuous telemetry | Future — roadmap |

## No-silent-fakes contract (`docs/system/integration/third-party-services.md`)

```mermaid
flowchart LR
    REQ["Command / request\n(e.g. OBD rescan, OTP send)"] --> STATE{"Transport state"}
    STATE -- "unconfigured\n(default)" --> R503["Refuses with 503,\nnames the missing env vars"]
    STATE -- "mock\n(dev / test)" --> RMOCK["Deterministic response,\nflagged mock: true"]
    STATE -- "live\n(production, if adapter shipped)" --> RLIVE["Real call to the\nexternal service"]
```

Every integration exposes an `IntegrationStatus` object (`id`, `configured`, `requires[]`, `state`, `dependency`) so "is this live?" is answerable through the API and the diagnostics screen — no integration secret ever has a default literal in the codebase.
