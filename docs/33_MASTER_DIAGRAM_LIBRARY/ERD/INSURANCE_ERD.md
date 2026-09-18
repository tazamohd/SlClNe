<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# INSURANCE ERD

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 2 tables

### INSURANCE

```mermaid
erDiagram
  insurance_policies {
    varchar id PK
    varchar policy_number
    varchar insurer
    varchar customer_id FK
    varchar holder_name
    varchar vehicle_id FK
    varchar vehicle_label
    varchar type
    bigint premium_halalas
    bigint coverage_halalas
    date start_date
    date end_date
    varchar status
  }
  insurance_claims {
    varchar id PK
    varchar claim_number
    varchar policy_id FK
    varchar policy_number
    varchar vehicle_id FK
    varchar vehicle_label
    varchar job_card_id FK
    bigint amount_claimed_halalas
    bigint amount_approved_halalas
    varchar status
    date incident_date
    text description
    varchar submitted_by
    varchar approved_by
  }
  insurance_policies |o--o{ insurance_claims : "policy_id"
```


| Table | Purpose |
| --- | --- |
| `insurance_policies` | Insurance policies — the cover a customer holds on a vehicle. Money is integer halalas (premium, coverage). Read-only through the generic router; gated on `acco |
| `insurance_claims` | Insurance claims — a request against a policy, which may relate to a repair. Read-only through the generic router; the lifecycle (submit, approve, reject, pay)  |
