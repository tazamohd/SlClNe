# Registry — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-REG-002                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Registry                                 |
| Modules     | customers, vehicles                      |

## 1. Overview

The Registry domain manages customer records, vehicle records, fleet contracts, and customer feedback. It serves as the foundational data layer referenced by Workshop, Finance, CRM, and other domains. All records are tenant-scoped via `org_id` with soft deletes and optimistic concurrency.

## 2. Customers

### 2.1 Data Model

The `customers` table holds customer records with the following key fields:

| Field                | Type           | Constraint                                    |
|----------------------|----------------|-----------------------------------------------|
| id                   | varchar(26)    | ULID primary key                              |
| org_id               | varchar(26)    | Tenant isolation, FK to organizations          |
| name                 | varchar(200)   | Customer full name (required)                 |
| phone                | varchar(32)    | Phone number (required); unique per org       |
| email                | varchar(254)   | Email address (optional)                      |
| type                 | varchar(16)    | `individual` (default) or `corporate`         |
| fleet_id             | varchar(26)    | FK to fleets (for fleet customers)            |
| vehicle_count        | integer        | Server-derived from vehicles table            |
| total_spent_halalas  | bigint         | Server-derived from paid invoices             |
| last_visit_at        | timestamptz    | Last service visit timestamp                  |
| last_visit_label     | varchar(64)    | Display label (e.g., "2 weeks ago")           |
| notes                | text           | Free-text notes                               |
| deleted_at           | timestamptz    | Soft delete marker                            |
| version              | integer        | Optimistic concurrency (default 1)            |

### 2.2 Phone-Based Lookup

- The `customers_org_phone_idx` unique index on `(org_id, phone)` enables fast phone-based customer lookup
- Phone numbers follow Saudi format (`+966...`)
- During workshop check-in, advisors search by phone to find or create customers inline

### 2.3 Derived Fields

Two fields are never accepted from clients — they are maintained by the server:

- **vehicle_count** — Derived from the count of vehicles linked to this customer
- **total_spent_halalas** — Derived from the sum of paid invoice amounts

### 2.4 Spend Tracking

Customer lifetime spend is tracked via `total_spent_halalas` (bigint, integer halalas). This enables:

- Customer value segmentation in the CRM module
- Loyalty program tier determination
- Fleet contract profitability analysis

### 2.5 Fleet Association

Customers can be associated with a fleet via `fleet_id`. Corporate customers typically belong to a fleet, which carries its own contract terms and renewal tracking.

### 2.6 Permissions (RBAC)

| Role         | Grants   | Notes                                |
|--------------|----------|--------------------------------------|
| Owner        | vcedax   | Full access                          |
| Manager      | vcedx    | All except approve and delete        |
| Advisor      | vce      | View, create, edit                   |
| Technician   | v        | View only                            |
| Accountant   | vx       | View and export                      |
| Receptionist | vce      | View, create, edit                   |
| Call Center  | vce      | View, create, edit                   |
| Super Admin  | v        | View only (platform administration)  |

### 2.7 Field-Level Redaction

The "Customer contact details" field rule hides contact information from: Technician, QC, Supplier.

## 3. Vehicles

### 3.1 Data Model

The `vehicles` table:

| Field              | Type           | Constraint                               |
|--------------------|----------------|------------------------------------------|
| id                 | varchar(26)    | ULID primary key                         |
| org_id             | varchar(26)    | Tenant isolation                         |
| plate              | varchar(16)    | License plate (required); unique per org |
| make_model         | varchar(160)   | Make and model string (required)         |
| customer_id        | varchar(26)    | FK to customers                          |
| owner_name         | varchar(200)   | Denormalized owner name                  |
| vin                | varchar(17)    | Vehicle Identification Number            |
| mileage_km         | integer        | Current mileage in kilometres            |
| last_service_at    | timestamptz    | Last service completion timestamp        |
| last_service_label | varchar(64)    | Display label for last service           |
| status             | varchar(16)    | `active` (default), `inactive`, `sold`   |
| deleted_at         | timestamptz    | Soft delete marker                       |
| version            | integer        | Optimistic concurrency                   |

### 3.2 Unique Constraints

Two unique indexes enforce per-tenant uniqueness:

- `vehicles_org_plate_idx` on `(org_id, plate)` — No duplicate plates within one organization
- `vehicles_org_vin_idx` on `(org_id, vin)` — No duplicate VINs within one organization

### 3.3 Mileage Tracking

- Mileage is stored as `mileage_km` (integer, kilometres)
- Updated at each service visit during check-in
- Historical mileage can be derived from job card history

### 3.4 Service History

Vehicle service history is composed by querying job cards where `vehicle_id` matches. The `VehicleDetail` screen aggregates:

- Completed job cards with service dates
- Estimates and invoices linked to the vehicle
- Inspection findings history

### 3.5 Permissions (RBAC)

| Role         | Grants | Notes                              |
|--------------|--------|------------------------------------|
| Owner        | vcedax | Full access                        |
| Manager      | vcedx  | All except approve                 |
| Advisor      | vce    | View, create, edit                 |
| Technician   | v      | View only                          |
| QC           | v      | View only                          |
| Accountant   | v      | View only                          |
| Receptionist | vce    | View, create, edit                 |
| Call Center  | v      | View only                          |
| Super Admin  | v      | View only                          |

## 4. Fleet Management

### 4.1 Data Model

The `fleets` table:

| Field                  | Type          | Description                            |
|------------------------|---------------|----------------------------------------|
| id                     | varchar(26)   | ULID primary key                       |
| org_id                 | varchar(26)   | Tenant isolation                       |
| name                   | varchar(200)  | Fleet name (required)                  |
| vehicle_count          | integer       | Total vehicles in fleet                |
| active_count           | integer       | Currently active vehicles              |
| contract_status        | varchar(32)   | `active` (default), `expired`, `pending` |
| contract_type          | varchar(32)   | Contract type classification           |
| contract_value_halalas | bigint        | Total contract value in halalas        |
| contract_start_date    | date          | Contract start date                    |
| contract_end_date      | date          | Contract end date                      |
| renewal_date           | date          | Next renewal date                      |
| contact_name           | varchar(200)  | Fleet contact person                   |
| contact_phone          | varchar(32)   | Contact phone number                   |
| contact_email          | varchar(254)  | Contact email address                  |

### 4.2 Contract Management

- Fleet contracts track monetary value in integer halalas (`contract_value_halalas`)
- Start/end dates define the contract period
- Renewal date tracking enables proactive renewal workflows
- The `FleetContract` screen (gated on `vehicles` module) manages contract details

### 4.3 Vehicle Counts

- `vehicle_count` tracks the total vehicles under the fleet
- `active_count` tracks currently serviceable vehicles
- Both are maintained alongside customer vehicle associations

### 4.4 Screens

- `FleetManagement` — Fleet list with vehicle counts and contract status
- `FleetContract` — Individual fleet contract details and renewal tracking
- Both are gated on the `vehicles` RBAC module

## 5. Customer Feedback

### 5.1 Data Model

The `customer_feedback` table:

| Field          | Type          | Description                          |
|----------------|---------------|--------------------------------------|
| id             | varchar(26)   | ULID primary key                     |
| org_id         | varchar(26)   | Tenant isolation                     |
| rating         | integer       | Numeric rating (required)            |
| comment        | text          | Optional text review                 |
| job_card_id    | varchar(26)   | FK to related job card               |
| customer_id    | varchar(26)   | FK to customer who left feedback     |
| customer_name  | varchar(200)  | Denormalized customer name           |

### 5.2 Feedback Collection

- Feedback is linked to specific job cards for service quality tracking
- Ratings feed into technician performance metrics (rating field on `technicians` table)
- The `CustomerFeedback` screen is gated on the `customers` module

### 5.3 Analytics

Feedback data drives:

- Technician rating calculations
- Branch-level service quality metrics
- Customer satisfaction trending in reports

## 6. API Endpoints

All registry endpoints follow the standard collection pattern:

| Method   | Path                      | Description                    |
|----------|---------------------------|--------------------------------|
| GET      | /api/v1/customers         | List with pagination/filter    |
| GET      | /api/v1/customers/:ref    | Get by ULID or phone           |
| POST     | /api/v1/customers         | Create new customer            |
| PUT      | /api/v1/customers/:id     | Update with version check      |
| DELETE   | /api/v1/customers/:id     | Soft delete                    |
| GET      | /api/v1/vehicles          | List with pagination/filter    |
| GET      | /api/v1/vehicles/:ref     | Get by ULID, plate, or VIN     |
| POST     | /api/v1/vehicles          | Create new vehicle             |
| PUT      | /api/v1/vehicles/:id      | Update with version check      |
| DELETE   | /api/v1/vehicles/:id      | Soft delete                    |
| GET      | /api/v1/fleets            | List fleets                    |
| GET      | /api/v1/feedback          | List customer feedback         |

### 6.1 Query Parameters

Standard list query parameters apply:

- `page`, `pageSize` (max 200) — Pagination
- `sort` — Field and direction (e.g., `name:asc`, `createdAt:desc`)
- `q` — ILIKE search across searchable columns
- `filter[field]` — Equality filter on filterable columns

## 7. Cross-References

- [Workshop Operations](./workshop-operations.md) — Job cards reference customers and vehicles
- [Finance & Accounting](./finance-accounting.md) — Invoices linked to customers
- [CRM & Marketing](./crm-marketing.md) — Customer segmentation and lead management
- [Localization](../non-functional/localization.md) — Arabic name fields (name_ar) on fleets
- [Security](../non-functional/security.md) — Field-level redaction of customer contact details
