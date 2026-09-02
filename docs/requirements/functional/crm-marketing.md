# CRM & Marketing — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-CRM-004                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | CRM & Marketing                          |
| Modules     | crm                                      |

## 1. Overview

The CRM and Marketing domain manages the sales pipeline from lead acquisition through opportunity conversion, campaign execution across multiple channels, customer segmentation, and task management. The domain integrates with the Registry for customer data and the Workshop for service-driven marketing.

## 2. Lead Pipeline

### 2.1 Data Model

The `leads` table:

| Field                     | Type          | Description                                    |
|---------------------------|---------------|------------------------------------------------|
| id                        | varchar(26)   | ULID primary key                               |
| org_id                    | varchar(26)   | Tenant isolation                               |
| name                      | varchar(200)  | Lead name (required)                           |
| company                   | varchar(200)  | Company name                                   |
| value_halalas             | bigint        | Estimated deal value in halalas                |
| source                    | varchar(64)   | Lead source (walk-in, referral, website, etc.) |
| stage                     | varchar(32)   | Pipeline stage (default: `new`)                |
| lead_date                 | date          | Date lead was captured                         |
| score                     | integer       | Lead score (0-100)                             |
| converted_opportunity_id  | varchar(26)   | Set on conversion; makes it idempotent         |

### 2.2 Pipeline Stages

```
new → qualified → proposal → negotiation → closed_won
                                          → closed_lost
```

The `leads_stage_idx` index on `(org_id, stage)` supports efficient pipeline views.

### 2.3 Lead Scoring

- Score range: 0 to 100
- Higher scores indicate higher conversion likelihood
- Scoring criteria include engagement frequency, deal value, and source quality

### 2.4 Lead Conversion

When a lead is converted to an opportunity:

1. A new opportunity record is created with the lead's data
2. `converted_opportunity_id` is set on the lead, linking it to the new opportunity
3. The conversion is idempotent: replaying the action returns the existing opportunity rather than creating a duplicate

### 2.5 Public Lead Intake

The `public_leads` table handles unauthenticated web submissions:

| Field    | Type          | Description                                |
|----------|---------------|--------------------------------------------|
| name     | varchar(200)  | Submitter name                             |
| email    | varchar(254)  | Contact email                              |
| phone    | varchar(32)   | Contact phone                              |
| company  | varchar(200)  | Company name                               |
| message  | text          | Inquiry message                            |
| source   | varchar(64)   | Submission source                          |
| status   | varchar(16)   | `new` (default), accepted, rejected        |

- Submissions land in a configured organization (`PUBLIC_LEAD_ORG_ID`)
- No authentication required; the caller never chooses tenancy
- Accepted leads are promoted into the qualified CRM `leads` pipeline

## 3. Opportunities

### 3.1 Data Model

The `opportunities` table:

| Field            | Type          | Description                              |
|------------------|---------------|------------------------------------------|
| id               | varchar(26)   | ULID primary key                         |
| org_id           | varchar(26)   | Tenant isolation                         |
| name             | varchar(200)  | Opportunity name (required)              |
| company          | varchar(200)  | Associated company                       |
| value_halalas    | bigint        | Deal value in halalas                    |
| stage            | varchar(32)   | Pipeline stage                           |
| probability_pct  | integer       | Win probability percentage (0-100)       |
| close_date       | date          | Expected close date                      |
| owner_name       | varchar(200)  | Assigned owner (denormalized)            |

### 3.2 Weighted Pipeline

Expected revenue is calculated as `value_halalas * probability_pct / 100`, enabling weighted pipeline forecasting.

### 3.3 Owner Assignment

Each opportunity has an assigned owner (`owner_name`). Pipeline views can be filtered by owner for territory management.

## 4. Campaigns

### 4.1 Data Model

The `campaigns` table:

| Field          | Type          | Description                             |
|----------------|---------------|-----------------------------------------|
| id             | varchar(26)   | ULID primary key                        |
| org_id         | varchar(26)   | Tenant isolation                        |
| name           | varchar(200)  | Campaign name (required)                |
| type           | varchar(24)   | Channel: email, sms, social, whatsapp   |
| status         | varchar(24)   | draft, active, paused, completed        |
| reach          | integer       | Total audience size                     |
| opens          | integer       | Open count                              |
| clicks         | integer       | Click count                             |
| conversions    | integer       | Conversion count                        |
| budget_halalas | bigint        | Campaign budget in halalas              |
| spent_halalas  | bigint        | Amount spent in halalas                 |

### 4.2 Campaign Types

| Type      | Screen              | Description                         |
|-----------|---------------------|-------------------------------------|
| email     | EmailMarketing      | Email campaigns with templates      |
| sms       | SMSCampaigns        | SMS outreach for Saudi mobile users  |
| whatsapp  | WhatsAppCampaigns   | WhatsApp Business messaging         |
| social    | Campaigns           | Social media campaigns              |

### 4.3 Performance Metrics

Each campaign tracks a funnel:

```
Reach → Opens → Clicks → Conversions
```

- **Open rate** = opens / reach
- **Click-through rate** = clicks / opens
- **Conversion rate** = conversions / clicks

### 4.4 Budget Tracking

- `budget_halalas` — Allocated budget in halalas
- `spent_halalas` — Actual spend in halalas
- Remaining budget = budget - spent

## 5. Customer Segments

### 5.1 Data Model

The `segments` table:

| Field              | Type          | Description                         |
|--------------------|---------------|-------------------------------------|
| id                 | varchar(26)   | ULID primary key                    |
| org_id             | varchar(26)   | Tenant isolation                    |
| name               | varchar(200)  | Segment name (required)             |
| member_count       | integer       | Number of matching customers        |
| rules              | text          | Rule definition (JSON)              |
| last_updated_label | varchar(64)   | Display label for last refresh      |

### 5.2 Rule-Based Grouping

Segments use rule-based criteria stored as text/JSON to define customer groups. Possible criteria include:

- Total spend thresholds (`total_spent_halalas` ranges)
- Visit frequency (derived from `last_visit_at`)
- Vehicle make/model ownership
- Fleet membership
- Geographic location

### 5.3 Campaign Targeting

Segments serve as target audiences for campaigns, enabling personalized marketing to specific customer groups.

## 6. CRM Tasks

### 6.1 Data Model

The `crm_tasks` table:

| Field        | Type          | Description                            |
|--------------|---------------|----------------------------------------|
| id           | varchar(26)   | ULID primary key                       |
| org_id       | varchar(26)   | Tenant isolation                       |
| title        | varchar(300)  | Task title (required)                  |
| assigned_to  | varchar(200)  | Assignee name                          |
| due_date     | date          | Task due date                          |
| priority     | varchar(16)   | low, medium (default), high, urgent    |
| status       | varchar(16)   | todo (default), in_progress, done      |
| type         | varchar(24)   | call, email, meeting, follow_up        |

### 6.2 Data Scope

CRM tasks use the `own` data scope via `created_by` — users see only tasks they created unless they hold broader access.

### 6.3 Screens

- `CRMTasks` — Task list with filtering by status, priority, and assignee
- `CRMCalendar` — Calendar view of tasks by due date

## 7. CRM Permissions

| Role         | Grants | Notes                                    |
|--------------|--------|------------------------------------------|
| Owner        | vcedax | Full access                              |
| Manager      | vcedx  | All except approve                       |
| Advisor      | vce    | View, create, edit                       |
| Call Center  | vced   | View, create, edit, delete               |
| Super Admin  | v      | View only                                |

All other roles have no CRM module access (empty grant string means hidden from navigation).

## 8. CRM Screens

| Screen            | Module | Description                              |
|-------------------|--------|------------------------------------------|
| LeadPipeline      | crm    | Kanban-style lead pipeline view          |
| LeadDetail        | crm    | Individual lead details and history      |
| Opportunities     | crm    | Opportunity list and pipeline analytics  |
| Campaigns         | crm    | Campaign management dashboard            |
| EmailMarketing    | crm    | Email campaign builder and analytics     |
| SMSCampaigns      | crm    | SMS campaign management                  |
| WhatsAppCampaigns | crm    | WhatsApp messaging campaigns             |
| CustomerSegments  | crm    | Segment definition and membership        |
| CRMTasks          | crm    | Task management                          |
| CRMCalendar       | crm    | Calendar view of CRM activities          |

## 9. Cross-References

- [Registry](./registry.md) — Customer data feeds segmentation and campaign targeting
- [Workshop Operations](./workshop-operations.md) — Service history influences lead qualification
- [Finance & Accounting](./finance-accounting.md) — Deal values and revenue forecasting
- [Admin & Portals](./admin-portals.md) — Call Center agents access CRM for lead capture
- [Localization](../non-functional/localization.md) — Campaign content in EN/AR
