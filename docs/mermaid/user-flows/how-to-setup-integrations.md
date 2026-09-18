# How To: Setup Integrations

Diagrams for the three integrations with genuine multi-step setup procedures: ZATCA Phase 2 e-invoicing, the Stripe payment gateway, and OBD device pairing.

Source: [`docs/knowledge-base/how-to/setup-integrations.md`](../../knowledge-base/how-to/setup-integrations.md)

---

## ZATCA E-Invoicing Setup

```mermaid
flowchart TD
    A["Configure organization VAT number<br/>(15 digits, starts and ends with 3)"] --> B["Enable Phase 2 compliance mode"]
    B --> C["Set ZATCA environment = sandbox"]
    C --> D["Upload certificate + private key,<br/>hash algorithm SHA-256"]
    D --> E["Create and issue a test invoice"]
    E --> F{"Required fields populated?<br/>seller/buyer VAT, QR, hashSelf/hashPrev"}
    F -->|"No"| D
    F -->|"Yes"| G["Submit to ZATCA sandbox"]
    G --> H{"Accepted by ZATCA?"}
    H -->|"No"| D
    H -->|"Yes"| I(["Switch environment = production"])
```

---

## Stripe Payment Gateway Setup

```mermaid
flowchart TD
    A2["Create Stripe account, obtain API keys"] --> B2["Enter Publishable Key + Secret Key<br/>in SALIS AUTO settings"]
    B2 --> C2["Set currency = sar"]
    C2 --> D2["Add webhook endpoint<br/>/api/webhooks/stripe"]
    D2 --> E2["Select events: payment_intent.succeeded,<br/>payment_intent.payment_failed,<br/>charge.refunded, charge.dispute.created"]
    E2 --> F2["Copy webhook signing secret,<br/>configure server-side"]
    F2 --> G2["Test with Stripe test card numbers"]
    G2 --> H2{"Payments and refunds recorded<br/>correctly in payments table?"}
    H2 -->|"No"| B2
    H2 -->|"Yes"| I2(["Switch to live keys"])
```

---

## OBD Device Pairing

```mermaid
flowchart TD
    A3["Register device: code, bay assignment"] --> B3["Physically connect OBD-II adapter<br/>to vehicle diagnostic port"]
    B3 --> C3["Verify Bluetooth/WiFi link to<br/>the bay's bridge system"]
    C3 --> D3{"Device status = connected?"}
    D3 -->|"No"| B3
    D3 -->|"Yes"| E3["Vehicle info auto-populates:<br/>vehicleLabel, plate, VIN"]
    E3 --> F3(["Live sensor data streams;<br/>DTC scan stored in obd_dtc_readings"])
```
