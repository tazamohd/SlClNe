# Administration & Portals — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-ADM-008                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Administration, Authentication, Portals, Call Center |
| Modules     | admin, settings, audit, kiosk, portaltech, portalcustomer, portalsupplier, portalprocure, callcenter |

## 1. Overview

This document covers system administration (user, role, and branch management), the authentication system (JWT-based with refresh token rotation), the audit log, self-service portals for different user roles, and the call center module. These functions form the platform's operational backbone.

## 2. User Management

### 2.1 User Data Model

The `users` table:

| Field          | Type          | Description                             |
|----------------|---------------|-----------------------------------------|
| id             | varchar(26)   | ULID primary key                        |
| org_id         | varchar(26)   | Tenant isolation                        |
| email          | varchar(254)  | Email (required); unique per org        |
| name           | varchar(200)  | Full name (required)                    |
| name_ar        | varchar(200)  | Arabic name                             |
| role           | varchar(32)   | One of the 14 defined roles             |
| password_hash  | text          | Argon2id hashed password                |
| status         | varchar(20)   | active (default), inactive, locked      |
| last_login_at  | timestamptz   | Last successful login timestamp         |

### 2.2 Role Assignment

Each user is assigned exactly one of the 14 platform roles:

| Role ID      | Label               | Scope     | Approval Limit (SAR) |
|--------------|---------------------|-----------|----------------------|
| owner        | Owner / CEO         | all       | Unlimited            |
| superadmin   | Super Admin         | platform  | Unlimited            |
| manager      | Branch Manager      | branch    | 50,000               |
| advisor      | Service Advisor     | branch    | 5,000                |
| technician   | Technician          | own       | 0                    |
| qc           | QC Inspector        | branch    | 0                    |
| parts        | Storekeeper         | branch    | 10,000               |
| accountant   | Accountant          | all       | 25,000               |
| hr           | HR Manager          | all       | 15,000               |
| frontdesk    | Receptionist        | branch    | 0                    |
| callcenter   | Call Center Agent   | all       | 0                    |
| procurement  | Procurement Agent   | all       | 20,000               |
| supplier     | Supplier            | external  | 0                    |
| customer     | Customer            | self      | 0                    |

### 2.3 Email Uniqueness

The `users_org_email_idx` unique index on `(org_id, email)` ensures one email per organization. The same email may exist across different organizations (multi-tenancy).

### 2.4 Admin Permissions

| Role         | admin Grants | settings Grants | Notes                    |
|--------------|--------------|-----------------|--------------------------|
| Owner        | vcedax       | vcedax          | Full administration      |
| Manager      | v            | ve              | View admin, edit settings |
| Super Admin  | vcedax       | vcedax          | Full administration      |

## 3. Role Definition and Permission Matrix

### 3.1 Grant Alphabet

The RBAC system uses a six-letter grant alphabet:

| Letter | Action   | Description                           |
|--------|----------|---------------------------------------|
| v      | view     | See the data and navigate to the module |
| c      | create   | Add new records                       |
| e      | edit     | Modify existing records               |
| d      | delete   | Soft-delete records                   |
| a      | approve  | Approve/reject records (with ceiling check) |
| x      | export   | Export data to CSV                    |

### 3.2 Permission Enforcement

Permissions are enforced at three layers:

1. **Navigation** — Modules with empty grant strings are hidden from the sidebar
2. **Screen** — The `SCREEN_MODULE` map gates each screen on its module
3. **API** — `requirePermission()` checks grants before any data operation

### 3.3 Module Count

The platform has 28 RBAC modules: dashboard, jobcards, appointments, estimates, customers, vehicles, inventory, procurement, invoices, payments, accounting, hr, technicians, crm, callcenter, reports, approvals, kiosk, execreports, portaltech, portalcustomer, portalsupplier, portalprocure, ai, admin, settings, audit, network.

## 4. Branch Management

### 4.1 Data Model

The `branches` table:

| Field    | Type          | Description                       |
|----------|---------------|-----------------------------------|
| id       | varchar(26)   | ULID primary key                  |
| org_id   | varchar(26)   | Tenant isolation                  |
| name     | varchar(200)  | Branch name (required)            |
| name_ar  | varchar(200)  | Arabic name                       |
| city     | varchar(120)  | City location                     |
| is_main  | boolean       | Whether this is the main branch   |

### 4.2 Branch Scoping

Users with `branch` scope see only data from their assigned branch. The `branch_id` column on tenant tables enables this filtering.

## 5. System Settings

The `Settings` and `AdvancedSettings` screens (gated on `settings` module) manage:

- Organization profile (name, VAT number, CR number)
- Notification preferences
- Default currencies and formatting
- Integration configuration
- Backup management (`Backup` screen)
- Subscription management (`Subscription` screen)
- OEM integrations (`OEMIntegrations`, `SystemIntegrations`)

## 6. Audit Log

### 6.1 Data Model

The `audit_log` table (append-only — a database trigger refuses UPDATE and DELETE):

| Field       | Type          | Description                               |
|-------------|---------------|-------------------------------------------|
| id          | varchar(26)   | ULID primary key                          |
| org_id      | varchar(26)   | Tenant context                            |
| branch_id   | varchar(26)   | Branch context                            |
| actor_id    | varchar(26)   | User who performed the action             |
| actor_role  | varchar(32)   | Role of the actor                         |
| action      | varchar(40)   | Action type (see below)                   |
| entity      | varchar(64)   | Entity type (e.g., job_card, invoice)     |
| entity_id   | varchar(64)   | Entity identifier                         |
| before      | jsonb         | State before change                       |
| after       | jsonb         | State after change                        |
| reason      | text          | Reason for the action                     |
| source      | varchar(24)   | api, seed, job, import                    |
| request_id  | varchar(64)   | Correlation ID for the request            |
| ip          | varchar(64)   | Client IP address                         |
| user_agent  | text          | Client user agent                         |
| ts          | timestamptz   | Timestamp (immutable)                     |

### 6.2 Audit Actions

Supported actions: create, update, delete, restore, bulk_update, bulk_delete, transition, assign, approve, reject, post, issue, pay, movement, receive, reserve, release, command, seed.

### 6.3 Security Properties

- **Append-only**: Database trigger prevents UPDATE and DELETE on audit rows
- **Credential scrubbing**: Sensitive fields (password_hash, tokens, OTPs) are redacted via `scrub()` before insertion
- **Same-transaction**: Audit rows are written in the same transaction as the change they record — if the change rolls back, so does the audit entry
- **SOD enforcement**: The audit log is queried by `requireSodClear()` to enforce segregation of duties

### 6.4 Audit Permissions

| Role        | Grants | Notes                              |
|-------------|--------|------------------------------------|
| Owner       | vx     | View and export                    |
| Manager     | vx     | View and export                    |
| Accountant  | vx     | View and export                    |
| Super Admin | vx     | View and export                    |

## 7. Authentication

### 7.1 Auth Endpoints

The following public (unauthenticated) endpoints are exposed:

| Endpoint                      | Description                          |
|-------------------------------|--------------------------------------|
| POST /auth/login              | Email + password authentication      |
| POST /auth/refresh            | Refresh token rotation               |
| POST /auth/logout             | Token revocation                     |
| POST /auth/forgot-password    | Password reset request               |
| POST /auth/reset-password     | Password reset with token            |
| POST /auth/request-otp        | Request OTP (email or SMS)           |
| POST /auth/verify-otp         | Verify 6-digit OTP                   |
| POST /auth/2fa/enrol          | Two-factor enrollment                |
| POST /auth/2fa/verify         | Two-factor verification              |
| POST /auth/biometric/enrol    | WebAuthn enrollment                  |
| POST /auth/biometric/challenge| WebAuthn challenge                   |
| POST /auth/sso/start          | SSO initiation                       |
| POST /auth/sso/callback       | SSO callback                         |
| GET  /auth/providers          | Available auth provider status       |

### 7.2 JWT Configuration

| Parameter                   | Default Value  | Description                    |
|-----------------------------|----------------|--------------------------------|
| ACCESS_TOKEN_TTL_MINUTES    | 15             | Access token lifetime          |
| REFRESH_TOKEN_TTL_DAYS      | 30             | Refresh token lifetime         |

### 7.3 Token Refresh and Theft Detection

The `user_sessions` table implements family-based token theft detection:

- Each refresh token belongs to a `family_id`
- When a token is rotated, the old one is marked with `replaced_by`
- Reuse of a retired token in the same family signals theft — all tokens in that family are revoked
- Sessions track `user_agent` and `ip` for forensic analysis

### 7.4 Password Hashing

Passwords are hashed using Argon2id with OWASP-recommended parameters:

- Memory: 19,456 KiB (19 MiB)
- Time cost: 2 iterations
- Parallelism: 1

### 7.5 OTP

- 6-digit numeric codes
- Channels: email, SMS
- TTL: 10 minutes (configurable)
- Max attempts: 5
- Resend cooldown: 60 seconds
- Code stored as hash — no plaintext at rest

### 7.6 Rate Limiting

- Auth endpoints: 20 requests/minute per IP
- Login endpoint: 10 requests/minute per IP
- Account lockout: 8 failed attempts, 300-second lockout

### 7.7 SSO and WebAuthn

Both are configuration-gated — they return 503 when not configured rather than fabricating success. SSO requires `SSO_ISSUER_URL`, `SSO_CLIENT_ID`, and `SSO_CLIENT_SECRET`. WebAuthn requires `WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGIN`.

### 7.8 Auth Screens

Ungated screens (no RBAC check): Login, Splash, Welcome, Error404, Maintenance, SessionExpired, AccountLocked, Unauthorized, PrivacyPolicy, TermsConditions.

## 8. Customer App Portal

The customer app renders in a 430px mobile frame with bottom tab navigation:

| Screen                    | Module          | Description                  |
|---------------------------|-----------------|------------------------------|
| CustomerPortal            | portalcustomer  | Home screen and service status |
| CustomerPortal.Booking    | portalcustomer  | Appointment booking          |
| CustomerPortal.History    | portalcustomer  | Service history              |
| CustomerPortal.Vehicles   | portalcustomer  | Vehicle management           |
| CustomerPortal.Profile    | portalcustomer  | Profile and settings         |

Customer role holds `vx` on `portalcustomer` — view and export.

## 9. Other Portals

### 9.1 Technician Portal

| Screen                        | Module      | Description                    |
|-------------------------------|-------------|--------------------------------|
| TechnicianPortal              | portaltech  | Job queue and assignments      |
| TechnicianPortal.JobDetail    | portaltech  | Job detail with repair actions |

Technician role holds `vx` on `portaltech`.

### 9.2 Supplier Portal

| Screen                    | Module          | Description               |
|---------------------------|-----------------|---------------------------|
| SupplierPortal            | portalsupplier  | Order dashboard           |
| SupplierPortal.Orders     | portalsupplier  | PO view and fulfillment   |

Supplier role holds `vx` on `portalsupplier`.

### 9.3 Procurement Portal

| Screen                          | Module        | Description              |
|---------------------------------|---------------|--------------------------|
| ProcurementPortal               | portalprocure | Procurement dashboard    |
| ProcurementPortal.Requisitions  | portalprocure | Requisition management   |

Procurement role holds `vx` on `portalprocure`.

### 9.4 Kiosk Check-In

The `KioskCheckIn` screen provides self-service check-in at the workshop. Receptionist role holds `vcex` on the `kiosk` module.

### 9.5 Super Admin Portal

The `SuperAdmin` screen (gated on `settings`) provides platform-level administration including garage applications, supplier applications, subscription management, support tickets, and system health monitoring.

## 10. Call Center

### 10.1 Call Queue

The `CallCenter` screen displays:

- Active call queue with status (waiting, active, on_hold), wait time, and assigned agent
- Agent availability and workload

### 10.2 Call Logs

The `CallCenter.Logs` screen provides:

- Call history with duration, disposition, and recording references
- Agent performance metrics

### 10.3 Permissions

| Role         | Grants | Notes                              |
|--------------|--------|------------------------------------|
| Owner        | vx     | View and export                    |
| Manager      | vx     | View and export                    |
| Advisor      | v      | View only                          |
| Call Center  | vcedx  | Full operational access            |
| Receptionist | v      | View only                          |
| Super Admin  | v      | View only                          |

## 11. Cross-References

- [Workshop Operations](./workshop-operations.md) — Job card lifecycle requires role-based access
- [Security](../non-functional/security.md) — JWT auth, RBAC enforcement details
- [Compliance](../non-functional/compliance.md) — Audit trail requirements
- [Accessibility](../non-functional/accessibility.md) — Portal accessibility requirements
- [Usability](../non-functional/usability.md) — Mobile portal responsive design
