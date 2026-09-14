<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# ADMIN ERD

**Status:** GENERATED · **Sources as of:** 2026-09-14 · 7 tables

### ADMIN

```mermaid
erDiagram
  ai_agents {
    varchar id PK
    varchar name
    varchar role
    varchar model
    varchar status
    integer tasks
    varchar success_rate_label
    varchar icon
  }
  conversations {
    varchar id PK
    varchar title
    varchar user_name
    integer message_count
    date conversation_date
    varchar tokens_label
  }
  garage_applications {
    varchar id PK
    varchar legal_name
    varchar cr_number
    varchar vat_number
    varchar contact_name
    varchar phone
    varchar email
    varchar city
    varchar plan_requested
    text notes
    varchar status
    varchar reviewed_by
    timestamptz reviewed_at
    text rejection_reason
  }
  supplier_applications {
    varchar id PK
    varchar company
    varchar cr_number
    varchar vat_number
    varchar contact_name
    varchar phone
    varchar email
    jsonb categories
    jsonb regions
    varchar status
    varchar reviewed_by
    timestamptz reviewed_at
  }
  subscription_requests {
    varchar id PK
    varchar from_plan
    varchar to_plan
    varchar direction
    text reason
    varchar status
    varchar requested_by
    varchar reviewed_by
    timestamptz reviewed_at
    timestamptz effective_at
  }
  support_tickets {
    varchar id PK
    varchar subject
    text body
    varchar priority
    varchar status
    varchar assigned_to
    jsonb thread
  }
  system_health {
    varchar id PK
    timestamptz ts
    double_precision uptime_pct
    integer queue_depth
    double_precision error_rate_pct
    double_precision db_size_gb
    integer active_sessions
    text notes
  }
```


| Table | Purpose |
| --- | --- |
| `ai_agents` | — |
| `conversations` | — |
| `garage_applications` | — |
| `supplier_applications` | — |
| `subscription_requests` | — |
| `support_tickets` | — |
| `system_health` | — |
