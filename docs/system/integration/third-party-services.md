# Third-Party Services

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-INT-003                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO integrates with external services for OBD vehicle diagnostics, OTP delivery (SMS/email), and cloud infrastructure. All external dependencies follow a strict design principle: unconfigured integrations refuse explicitly rather than faking results, and every integration reports its own status.

## 2. Integration Architecture Principles

### 2.1 No Silent Fakes

Every external integration follows this contract:

1. **Unconfigured**: The default state. Commands refuse with 503 and name the missing credentials.
2. **Mock**: Development/test transport. Returns deterministic responses flagged `mock: true`. Talks to no external service and says so.
3. **Live**: Production transport with real credentials. Not shipped until the adapter exists.

This prevents a workshop app from reaching production telling a technician a car is clear when nothing read it, or sending OTPs to real phone numbers during testing.

### 2.2 Status Reporting

Every integration exposes a status structure:

```typescript
interface IntegrationStatus {
  id: string            // Integration identifier
  configured: boolean   // Whether credentials are present and valid
  requires: string[]    // Environment variables needed for configuration
  state: string         // Human-readable description of current state
  dependency: string    // External service name
}
```

This makes "is the integration live?" a question with an answer, discoverable through the API and the diagnostics screen.

## 3. OBD Vehicle Diagnostics

### 3.1 Purpose

On-Board Diagnostics (OBD) integration allows technicians to:

- **Rescan** a vehicle: Read diagnostic trouble codes (DTCs) from the vehicle's ECU
- **Clear codes**: Clear DTCs after repairs are verified

### 3.2 Architecture

```
Frontend (Diagnostics Screen)
  -> POST /api/v1/obd/:deviceId/rescan (or /clear-codes)
    -> Route Handler (routes/obd.ts)
      -> ObdBridge adapter
        -> [unconfigured] Refuses with 503
        -> [mock] Returns deterministic results flagged mock
        -> [live] Would POST to on-prem bridge (adapter not shipped)
      -> Record reading in obd_dtc_readings table
      -> Update device status in obd_devices table
```

### 3.3 Bridge Interface

```typescript
interface ObdBridge {
  readonly name: string        // 'unconfigured', 'mock', or future adapter name
  readonly configured: boolean // True only when a real bridge is wired
  rescan(command: ObdCommand): Promise<ObdResult>
  clearCodes(command: ObdCommand): Promise<ObdResult>
}
```

### 3.4 Command Structure

```typescript
interface ObdCommand {
  deviceId: string      // OBD device ULID
  deviceCode: string    // Human-readable device code
  knownDtcs: {          // DTCs currently on the device
    code: string        // e.g., "P0300"
    description: string // e.g., "Random/Multiple Cylinder Misfire Detected"
    severity: string    // "critical", "moderate", "minor"
  }[]
}
```

### 3.5 Result Structure

```typescript
interface ObdResult {
  deviceId: string    // Device that was commanded
  status: string      // 'ready', 'scanning', 'faults_found', 'clear'
  dtcs: {             // DTCs found (empty after successful clear)
    code: string
    description: string
    severity: string
  }[]
  readAt: string      // ISO timestamp of the reading
  mock: boolean       // True when result came from mock, never a real device
}
```

### 3.6 Transport Configuration

| Variable          | Values              | Purpose                          |
|-------------------|---------------------|----------------------------------|
| `OBD_TRANSPORT`   | `unconfigured`, `mock` | Active transport                |
| `OBD_BRIDGE_URL`  | URL string          | On-prem bridge endpoint          |
| `OBD_BRIDGE_TOKEN`| Secret string       | Bridge authentication token      |

### 3.7 Transport Behavior

| Transport      | Rescan Behavior                          | Clear Behavior             |
|----------------|------------------------------------------|----------------------------|
| `unconfigured` | 503: names OBD_BRIDGE_URL, OBD_BRIDGE_TOKEN as required | Same |
| `mock`         | Echoes known DTCs, flags `mock: true`   | Returns empty DTCs, `mock: true` |
| `live`         | Would POST to bridge (not shipped)       | Would POST to bridge       |

### 3.8 Data Persistence

Regardless of the transport, OBD readings are persisted in the database:

**`obd_devices` table**: Device status, bay assignment, vehicle info, live sensor data (RPM, coolant temp, voltage, load), DTC count.

**`obd_dtc_readings` table**: Per-device DTC readings with:
- Device reference and code
- DTC code, description, severity
- Source (`rescan`, `clear`, `manual`)
- `cleared` flag
- `mock` flag (true when from mock bridge)
- `read_at` timestamp

**`dtc_codes` table**: Reference table of known DTC codes with descriptions (EN/AR), severity, system, and freeze-frame indicator.

**`oem_tools` table**: OEM diagnostic tool inventory with brand, status, vehicle count, protocol, licence, and expiry.

### 3.9 Audit Trail

OBD commands are audited with action `command`:

```json
{
  "action": "command",
  "entity": "obd_device",
  "entityId": "<deviceId>",
  "after": {
    "command": "rescan",
    "dtcs": [...],
    "mock": true
  }
}
```

## 4. OTP Delivery

### 4.1 Purpose

One-Time Passwords are used for:

- Estimate approval by customers (out-of-band verification)
- Future: password reset, two-factor authentication

### 4.2 Architecture

```
Route Handler
  -> Generate random OTP code
  -> Hash with SHA-256, store in otp_challenges table
  -> Deliver via OtpTransport
    -> [default] Refuses (prevents accidental sends)
    -> [test mock] Captures code for assertion
    -> [live SMS] Would send via SMS provider
    -> [live email] Would send via email provider
```

### 4.3 Transport Safety

The default OTP transport **refuses** to deliver codes. This is deliberate:

- In development: prevents accidental SMS/email sends to real numbers
- In test: the test suite provides its own mock transport
- In production: a live transport must be explicitly configured

### 4.4 OTP Storage

| Column       | Type        | Purpose                              |
|--------------|-------------|--------------------------------------|
| `channel`    | varchar(8)  | `sms` or `email`                     |
| `destination`| varchar(254)| Phone number or email address        |
| `code_hash`  | text        | SHA-256 of the OTP code (never plaintext) |
| `expires_at` | timestamptz | Expiration time                      |
| `attempts`   | integer     | Attempt counter (brute-force protection) |
| `verified_at`| timestamptz | Verification timestamp               |

### 4.5 Security Properties

- OTP codes are never stored in plaintext
- Attempt counter limits brute-force attacks
- Time-bounded expiration prevents stale codes
- Log redaction: `req.body.otp` -> `[redacted]`
- Audit scrubbing: `otp`, `codeHash` removed from payloads

## 5. Integrations Registry

### 5.1 Integrations Table

The `integrations` table stores the catalog of available third-party integrations:

| Column       | Type        | Purpose                              |
|--------------|-------------|--------------------------------------|
| `name`       | varchar(160)| Integration name (EN)                |
| `name_ar`    | varchar(160)| Integration name (AR)                |
| `category`   | varchar(64) | Category (e.g., diagnostics, payments)|
| `icon`       | varchar(64) | UI icon identifier                   |
| `status`     | varchar(24) | `active`, `inactive`, `coming_soon`  |
| `detail`     | text        | Integration description (EN)         |
| `detail_ar`  | text        | Integration description (AR)         |

This table is tenant-scoped and read-only through the generic collection router.

### 5.2 Integration Categories

| Category        | Examples                                   |
|-----------------|---------------------------------------------|
| Diagnostics     | OBD bridge, OEM tools                       |
| Communications  | SMS (OTP), email notifications              |
| Government      | ZATCA e-invoicing                           |
| Financial       | Payment processing, bank feeds              |
| Fleet           | Telematics, GPS tracking                    |

## 6. External Dependency Policy

### 6.1 Classification

External dependencies are explicitly classified:

| Dependency     | Status          | Impact if Unavailable              |
|----------------|-----------------|-------------------------------------|
| PostgreSQL     | Required        | Application cannot serve requests   |
| OBD Bridge     | Optional        | Device commands refuse (503)        |
| SMS Provider   | Optional        | OTP delivery refuses                |
| Email Provider | Optional        | OTP delivery refuses                |
| ZATCA API      | Deployment-level| Invoices can be issued locally      |

### 6.2 Graceful Degradation

The application starts and serves requests even when optional integrations are unconfigured. The health probe (`/health`) never checks external dependencies. The readiness probe (`/ready`) checks only the database.

### 6.3 No Default Secrets

No integration secret has a default literal in the codebase. Missing credentials cause the integration to report itself unconfigured, not to silently use a value an attacker could read in the repository.

## 7. Future Integration Points

### 7.1 Prepared Interfaces

The codebase defines adapter interfaces that are ready for live implementations:

| Interface      | Defined In           | Ready For                        |
|----------------|----------------------|----------------------------------|
| `ObdBridge`    | `integrations/obd.ts`| On-prem OBD bridge service       |
| `OtpTransport` | `auth/`              | SMS and email providers          |

### 7.2 Adding a New Integration

To add a live integration:

1. Implement the adapter interface (e.g., `ObdBridge`)
2. Add configuration variables to the Zod schema in `integrations/config.ts`
3. Document the variables in `.env.example`
4. Register the adapter in the factory function (e.g., `obdBridgeFor()`)
5. The existing routes, audit trail, and status reporting work unchanged

### 7.3 Fleet and Telematics

The `fleets` table supports fleet contract management with:

- Vehicle counts and contract terms
- Contract value (integer halalas)
- Contract dates (start, end, renewal)
- Contact information

The fleet management routes (`routes/fleets.ts`) provide the API surface. GPS tracking and telematics integration points are prepared at the data model level.

## 8. Knowledge Base

### 8.1 KB Procedures Table

The `kb_procedures` table stores technical repair procedures:

| Column    | Purpose                                    |
|-----------|--------------------------------------------|
| `code`    | Procedure identifier                       |
| `title`   | Procedure title (EN/AR)                    |
| `category`| Procedure category                         |
| `make`    | Vehicle make applicability                 |
| `mins`    | Estimated time (minutes)                   |
| `torque`  | Torque specifications (EN/AR)              |
| `steps`   | Number of steps                            |
| `views`   | View count                                 |
| `tsb`     | Technical Service Bulletin flag            |
| `media`   | Associated media reference                 |

This serves as an internal knowledge base for technicians, searchable and filterable through the standard collection interface.

## Related Documents

- [ZATCA Integration](./zatca-integration.md)
- [Payment Gateway](./payment-gateway.md)
- [Backend Architecture](../architecture/backend-architecture.md)
- [Environment Setup](../operations/environment-setup.md)
