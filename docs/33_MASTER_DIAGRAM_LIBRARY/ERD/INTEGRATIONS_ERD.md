<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# INTEGRATIONS ERD

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 5 tables

### INTEGRATIONS

```mermaid
erDiagram
  obd_devices {
    varchar id PK
    varchar code
    varchar bay
    varchar vehicle_label
    varchar plate
    varchar status
    varchar vin
    integer rpm
    integer coolant
    double_precision voltage
    integer load
    integer dtc_count
  }
  obd_dtc_readings {
    varchar id PK
    varchar device_id FK
    varchar device_code
    varchar dtc_code
    varchar description
    varchar severity
    varchar source
    boolean cleared
    timestamptz read_at
    boolean mock
  }
  dtc_codes {
    varchar id PK
    varchar code
    varchar description
    varchar description_ar
    varchar severity
    varchar system
    boolean freeze_frame
  }
  oem_tools {
    varchar id PK
    varchar brand
    varchar tool
    varchar status
    integer vehicle_count
    varchar protocol
    varchar licence
    date expires_on
    varchar expires_label
  }
  integrations {
    varchar id PK
    varchar name
    varchar name_ar
    varchar category
    varchar icon
    varchar status
    text detail
    text detail_ar
  }
  obd_devices ||--o{ obd_dtc_readings : "device_id"
```


| Table | Purpose |
| --- | --- |
| `integrations` | — |
| `obd_devices` | — |
| `obd_dtc_readings` | Per-device DTC readings (F-029). The device↔dtc link a re-scan or a clear-codes command records: which trouble codes a specific OBD device read, when, and wheth |
| `dtc_codes` | — |
| `oem_tools` | — |
