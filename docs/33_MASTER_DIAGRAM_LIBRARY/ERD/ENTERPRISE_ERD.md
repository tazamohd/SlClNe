<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# ENTERPRISE ERD

**Status:** GENERATED · **Sources as of:** 2026-09-16 · 8 tables

### ENTERPRISE

```mermaid
erDiagram
  organizations {
    varchar id PK
    varchar name
    varchar name_ar
    varchar slug
    varchar cr_number
    varchar vat_number
    varchar plan
    varchar status
  }
  branches {
    varchar id PK
    varchar name
    varchar name_ar
    varchar city
    boolean is_main
  }
  users {
    varchar id PK
    varchar email
    varchar name
    varchar name_ar
    varchar role
    varchar acting_role
    varchar customer_id FK
    text password_hash
    varchar status
    timestamptz last_login_at
  }
  user_sessions {
    varchar id PK
    varchar user_id FK
    text refresh_token_hash
    varchar family_id FK
    text user_agent
    varchar ip
    timestamptz expires_at
    timestamptz revoked_at
    varchar replaced_by
  }
  departments {
    varchar id PK
    varchar name
    varchar head
    integer headcount
    varchar cost_center
    varchar branch_label
    varchar icon
  }
  otp_challenges {
    varchar id PK
    varchar channel
    varchar destination
    text code_hash
    timestamptz expires_at
    integer attempts
    timestamptz verified_at
  }
  audit_log {
    varchar id PK
    varchar actor_id FK
    varchar actor_role
    varchar action
    varchar entity
    varchar entity_id FK
    jsonb before
    jsonb after
    text reason
    varchar source
    varchar request_id FK
    varchar ip
    text user_agent
    timestamptz ts
  }
  idempotency_keys {
    varchar id PK
    varchar key
    varchar endpoint
    varchar request_hash
    integer response_status
    jsonb response_body
  }
  organizations ||--o{ branches : "org_id"
  organizations ||--o{ users : "org_id"
  branches |o--o{ users : "branch_id"
  organizations ||--o{ user_sessions : "org_id"
  branches |o--o{ user_sessions : "branch_id"
  users ||--o{ user_sessions : "user_id"
  organizations ||--o{ departments : "org_id"
  branches |o--o{ departments : "branch_id"
  organizations |o--o{ audit_log : "org_id"
  branches |o--o{ audit_log : "branch_id"
  organizations ||--o{ idempotency_keys : "org_id"
```


| Table | Purpose |
| --- | --- |
| `organizations` | Organizations sit above tenancy — a row *is* the tenant. |
| `branches` | — |
| `users` | — |
| `user_sessions` | — |
| `departments` | — |
| `audit_log` | Append-only. A trigger refuses UPDATE and DELETE, so an application user cannot edit history even holding the application role. |
| `idempotency_keys` | A replayed `Idempotency-Key` returns the stored response and creates no second business effect. |
| `otp_challenges` | — |
