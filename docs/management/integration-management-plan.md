# SALIS AUTO -- Integration Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-007                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose and Scope

This plan governs all system-to-system integrations for the SALIS AUTO
platform. It defines the architecture, protocols, testing strategy, and
operational monitoring for every external system that connects to the
platform's 13 operational domains, 191+ screens, and 28 RBAC modules.

### 1.1 Objectives

- Establish a repeatable integration pattern for all external systems
- Ensure ZATCA Phase 2 e-invoicing compliance from day one
- Secure all payment flows to PCI DSS standards
- Provide reliable communication channels (SMS, WhatsApp, email)
- Prepare the architecture for future OBD/telematics integration

### 1.2 Integration Inventory

| ID    | System                | Priority | Sprint  | Status      |
|-------|-----------------------|----------|---------|-------------|
| INT-1 | ZATCA e-Invoicing     | P1       | S8-S20  | Mandatory   |
| INT-2 | Stripe Payment Gateway| P2       | S10-S14 | Required    |
| INT-3 | SMS Gateway           | P3       | S12-S13 | Required    |
| INT-4 | WhatsApp Business API | P3       | S14-S16 | Required    |
| INT-5 | Email (SMTP/SendGrid) | P3       | S10-S11 | Required    |
| INT-6 | OBD-II / Telematics   | P4       | Future  | Planned     |

---

## 2. Integration Architecture

### 2.1 Hub-and-Spoke Model

SALIS AUTO operates as the central hub. All external systems connect as
spokes through a unified integration layer.

```
                          ┌──────────────┐
                          │   ZATCA API  │
                          └──────┬───────┘
                                 │
┌──────────────┐          ┌──────┴───────┐          ┌──────────────┐
│ Stripe API   ├──────────┤  SALIS AUTO  ├──────────┤ SMS Gateway  │
└──────────────┘          │  Integration │          └──────────────┘
                          │    Layer     │
┌──────────────┐          └──┬───────┬───┘          ┌──────────────┐
│ WhatsApp API ├─────────────┘       └──────────────┤ Email SMTP   │
└──────────────┘                                    └──────────────┘
```

### 2.2 Integration Layer Components

| Component            | Technology          | Purpose                        |
|----------------------|---------------------|--------------------------------|
| API Gateway          | Express middleware  | Rate limiting, auth, routing   |
| Message Queue        | Redis / Bull        | Async processing, retry logic  |
| Circuit Breaker      | Custom middleware   | Failure isolation              |
| Event Bus            | Internal pub/sub    | Decoupled integration events   |
| Integration Registry | PostgreSQL table    | Configuration, credentials     |

### 2.3 Design Principles

1. **Asynchronous by default** -- webhook and queue-based communication
   wherever the external API supports it
2. **Idempotent operations** -- every outbound call carries an idempotency
   key; every inbound webhook is deduplicated
3. **Fail-safe degradation** -- if an integration is down, core workshop
   operations (Check-In, Inspection, Estimate, Repair, QC, Delivery)
   continue; the integration catches up when restored
4. **Tenant isolation** -- each tenant's integration credentials and
   configuration are stored separately; one tenant's API quota exhaustion
   does not affect another

---

## 3. ZATCA Integration (Priority 1 -- Mandatory)

### 3.1 Scope

ZATCA Phase 2 (Integration Phase) requires all tax invoices, simplified
tax invoices, and associated credit/debit notes to be reported to the
ZATCA platform in near-real-time. This is a legal obligation for every
tenant operating in Saudi Arabia with 15% VAT.

### 3.2 Document Types

| Document               | UBL Type Code | Direction     | Trigger                        |
|------------------------|---------------|---------------|--------------------------------|
| Standard Tax Invoice   | 388           | B2B           | Invoice finalized, amount ≥1000 SAR |
| Simplified Tax Invoice | 388           | B2C           | Invoice finalized, amount <1000 SAR |
| Credit Note            | 381           | B2B / B2C     | Full or partial refund issued  |
| Debit Note             | 383           | B2B / B2C     | Additional charges applied     |

### 3.3 Technical Implementation

**UBL 2.1 XML Generation**

- All invoices are generated in UBL 2.1 XML format per ZATCA schema v2.3
- Fields include seller/buyer TIN, invoice line items, VAT breakdown by
  category (standard 15%, zero-rated, exempt), and payment means
- Arabic and English descriptions are embedded for bilingual compliance

**QR Code (TLV Encoding)**

The QR code on simplified invoices contains TLV-encoded fields per ZATCA
specification:

| Tag | Field                  | Type   | Example                      |
|-----|------------------------|--------|------------------------------|
| 1   | Seller Name            | UTF-8  | "ورشة سالس للسيارات"           |
| 2   | VAT Registration Number| UTF-8  | "300000000000003"            |
| 3   | Invoice Timestamp      | UTF-8  | "2026-09-15T14:30:00Z"       |
| 4   | Invoice Total (with VAT)| UTF-8 | "1150.00"                    |
| 5   | VAT Amount             | UTF-8  | "150.00"                     |
| 6   | Hash (SHA-256)         | Hex    | Invoice XML hash             |
| 7   | Signature              | Base64 | ECDSA digital signature      |
| 8   | Public Key             | Base64 | X.509 certificate public key |

**Hash Chain (SHA-256)**

Every invoice includes a hash of the previous invoice, forming a
tamper-evident chain:

1. First invoice in chain: previous hash = SHA-256 of `"0"`
2. Subsequent invoices: previous hash = SHA-256 of the prior invoice XML
3. The hash chain is per-tenant, per-device (EGS unit)
4. Chain verification is part of the nightly integrity check

**Digital Signing (X.509 Certificate)**

- Signing algorithm: ECDSA with SHA-256 (secp256k1 curve)
- Certificate issued by ZATCA during the certification process
- Signing occurs server-side; private key stored in secure vault
- Certificate renewal is monitored 30 days before expiry

### 3.4 ZATCA Environments

| Environment | Purpose           | Endpoint                              | Timeline  |
|-------------|-------------------|---------------------------------------|-----------|
| Sandbox     | Development/test  | `https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal` | Sprint S8  |
| Simulation  | Pre-production    | `https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation`       | Sprint S18 |
| Production  | Live invoicing    | `https://gw-fatoora.zatca.gov.sa/e-invoicing/core`             | Sprint S20 |

### 3.5 Certification Process

1. **CSR Generation** -- generate Certificate Signing Request on the EGS
   device with OID fields (serial number, tax ID, solution name)
2. **CCSID** -- submit CSR to ZATCA Compliance API; receive Compliance
   Certificate Security Identifier (CCSID)
3. **Compliance Checks** -- submit 6 sample invoices (standard, simplified,
   credit note, debit note for each) signed with CCSID
4. **PCSID** -- upon passing compliance, receive Production Certificate
   Security Identifier (PCSID)
5. **Production Certificate** -- use PCSID for all live invoice reporting

### 3.6 Error Handling

| Error Code  | Meaning                    | Action                          |
|-------------|----------------------------|---------------------------------|
| 400         | Validation error           | Parse error details, fix, retry |
| 401/403     | Authentication failure     | Refresh certificate, alert ops  |
| 429         | Rate limit exceeded        | Exponential backoff, queue      |
| 500/503     | ZATCA service unavailable  | Queue for retry, alert if >30m  |

**Offline Queue**: If ZATCA is unreachable, invoices are queued in the
database with status `PENDING_SUBMISSION`. A background worker retries
every 5 minutes with exponential backoff (max 1 hour). Invoices older
than 24 hours without submission trigger a P2 alert.

### 3.7 Timeline

| Milestone                    | Sprint | Date Target     |
|------------------------------|--------|-----------------|
| Sandbox integration complete | S8     | 2026-11-15      |
| Invoice generation tested    | S12    | 2027-01-15      |
| Simulation environment live  | S18    | 2027-04-15      |
| Compliance checks passed     | S19    | 2027-05-01      |
| Production certificate       | S20    | 2027-05-15      |

> Cross-reference: [ZATCA Integration Technical Spec](../technical/zatca-integration.md)

---

## 4. Stripe Payment Gateway (Priority 2)

### 4.1 Payment Flow

```
Customer Invoice → Checkout Initiated → Stripe Session Created
    → Customer Pays (Stripe Hosted) → Stripe Webhook (payment_intent.succeeded)
    → Payment Confirmed in SALIS → Journal Entry Created
    → Receipt Issued → ZATCA Invoice Submitted
```

### 4.2 Supported Payment Methods

| Method              | Provider         | Region Support    |
|---------------------|------------------|-------------------|
| Visa / Mastercard   | Stripe           | Global            |
| mada (debit)        | Stripe + mada    | Saudi Arabia      |
| Apple Pay           | Stripe           | iOS / Safari      |
| Google Pay          | Stripe           | Android / Chrome  |

### 4.3 Refund Handling

1. Workshop initiates full or partial refund in SALIS AUTO
2. SALIS calls Stripe Refund API with original `payment_intent_id`
3. Stripe processes refund (3-10 business days to customer)
4. SALIS creates a Credit Note linked to original invoice
5. Reverse journal entry posted to accounting module
6. Credit Note submitted to ZATCA (document type 381)

### 4.4 Webhook Security

- **Signature verification**: every webhook payload is verified against
  the Stripe signing secret using HMAC-SHA256
- **Idempotency**: webhook events are deduplicated by `event.id` stored
  in a processed-events table with a 7-day TTL
- **Retry handling**: Stripe retries failed webhooks for up to 72 hours;
  SALIS returns HTTP 200 immediately, processes asynchronously
- **Event types monitored**: `payment_intent.succeeded`,
  `payment_intent.payment_failed`, `charge.refunded`,
  `charge.dispute.created`, `customer.subscription.updated`

### 4.5 PCI DSS Compliance

- **SAQ-A level**: Stripe Checkout (hosted payment page) handles all
  card data; no card numbers touch SALIS AUTO servers
- **No card storage**: SALIS stores only Stripe Customer IDs and
  Payment Intent IDs -- never raw card numbers or CVVs
- **Tokenization**: recurring payments use Stripe Payment Methods (tokens)
- **Annual self-assessment**: SAQ-A questionnaire completed annually

> Cross-reference: [Payment Gateway Spec](../technical/payment-gateway.md)

---

## 5. Communication Integrations (Priority 3)

### 5.1 SMS Gateway

| Feature                | Details                                 |
|------------------------|-----------------------------------------|
| Provider               | Twilio / Unifonic (Saudi-focused)       |
| Use cases              | Appointment reminders, OTP, delivery    |
| Language               | Bilingual (AR/EN per customer pref)     |
| Rate limit             | 10 SMS/sec per tenant                   |
| Opt-out                | STOP keyword support, preference stored |

**Message Templates**:
- Appointment reminder: sent 24h and 1h before scheduled service
- OTP verification: 6-digit code, 5-minute expiry, max 3 attempts
- Delivery notification: vehicle ready for pickup
- Estimate approval request: link to digital estimate for approval

### 5.2 WhatsApp Business API

| Feature                | Details                                      |
|------------------------|----------------------------------------------|
| Provider               | Meta WhatsApp Business Platform              |
| Template messages      | Pre-approved by Meta, bilingual AR/EN        |
| Session messages        | Free-form within 24h customer-initiated window|
| Rich media             | PDF invoices, estimate images, location pins |

**Integration Points in Workshop Lifecycle**:
1. **Check-In** -- confirmation message with job card number
2. **Inspection** -- photo/video of findings sent to customer
3. **Estimate** -- interactive estimate with approve/reject buttons
4. **Repair** -- progress updates with estimated completion time
5. **QC** -- quality check completed notification
6. **Delivery** -- vehicle ready, invoice PDF, payment link

### 5.3 Email (Transactional and Marketing)

| Category        | Provider   | Use Cases                             |
|-----------------|------------|---------------------------------------|
| Transactional   | SendGrid   | Invoices, receipts, password reset    |
| Marketing       | SendGrid   | Campaigns, promotions, newsletters    |

- All transactional emails include both AR and EN content blocks
- Invoice PDFs are attached with ZATCA-compliant QR codes
- Marketing emails comply with Saudi anti-spam regulations
- Unsubscribe links are mandatory on all marketing emails

> Cross-reference: [Third-Party Services Spec](../technical/third-party-services.md)

---

## 6. OBD/Telematics Integration (Priority 4 -- Future)

### 6.1 OBD-II Device Integration

Planned for post-launch phases, OBD-II integration will allow workshops
to read diagnostic trouble codes (DTCs) directly from connected vehicles.

| Feature                   | Details                              |
|---------------------------|--------------------------------------|
| Protocol                  | OBD-II (ISO 15765-4 / CAN)          |
| Device type               | Bluetooth ELM327-compatible dongles  |
| Data captured             | DTCs, live sensor data, freeze frame |
| Integration method        | Mobile app BLE → API upload          |

### 6.2 Telematics for Fleet Customers

| Feature                   | Details                              |
|---------------------------|--------------------------------------|
| Tracking                  | GPS location, mileage, fuel level    |
| Predictive maintenance    | Oil life, brake wear, tire pressure  |
| Alerts                    | Geofencing, speed, engine warning    |
| API                       | REST webhook from telematics provider|

### 6.3 Roadmap

| Phase     | Capability                        | Target      |
|-----------|-----------------------------------|-------------|
| Phase 1   | Manual DTC code entry             | Launch      |
| Phase 2   | OBD-II device pairing + auto-read | Q3 2027     |
| Phase 3   | Telematics fleet dashboard        | Q1 2028     |
| Phase 4   | Predictive maintenance alerts     | Q3 2028     |

---

## 7. Integration Testing Strategy

### 7.1 Testing Layers

| Layer               | Tool / Approach          | Coverage                      |
|---------------------|--------------------------|-------------------------------|
| Unit tests          | Jest + mocks             | XML generation, TLV encoding  |
| Contract tests      | Pact / schema validation | API request/response schemas  |
| Integration tests   | Sandbox environments     | End-to-end with real APIs     |
| Load tests          | k6                       | Throughput under 100 users    |
| Chaos tests         | Manual fault injection   | Circuit breaker validation    |

### 7.2 Sandbox Environments

Each integration has a dedicated sandbox or test mode:

- **ZATCA**: Sandbox portal with test certificates and sample validation
- **Stripe**: Test mode with test card numbers (4242 4242 4242 4242)
- **SMS**: Test numbers that accept but do not deliver
- **WhatsApp**: Test phone numbers provided by Meta Business Platform
- **Email**: SendGrid sandbox mode, Mailtrap for local development

### 7.3 Contract Testing

All integrations maintain a versioned contract (JSON Schema or OpenAPI)
that is validated on every CI build. If an external API changes its
schema, the contract test fails before the change reaches production.

### 7.4 Mock Services

For offline development, each integration has a mock service:

```
/src/integrations/
  ├── zatca/
  │   ├── client.ts           # Real ZATCA API client
  │   ├── mock-client.ts      # Mock for local dev
  │   └── contract.json       # Response schema
  ├── stripe/
  │   ├── client.ts
  │   ├── mock-client.ts
  │   └── contract.json
  └── comms/
      ├── sms-client.ts
      ├── whatsapp-client.ts
      ├── email-client.ts
      └── mock-comms-client.ts
```

---

## 8. Monitoring and Alerting

### 8.1 Health Checks

Every integration exposes a health check endpoint polled every 60 seconds:

| Integration   | Health Check Method         | Healthy Criteria          |
|---------------|-----------------------------|---------------------------|
| ZATCA         | GET compliance status       | 200 response, cert valid  |
| Stripe        | GET /v1/balance             | 200 response              |
| SMS           | Account balance check       | Balance > 100 SAR         |
| WhatsApp      | Template status check       | Templates approved        |
| Email         | SMTP connection test        | Connection established    |

### 8.2 Circuit Breaker Pattern

Each integration client implements a circuit breaker with three states:

| State       | Behavior                                         | Transition             |
|-------------|--------------------------------------------------|------------------------|
| Closed      | Requests pass through normally                   | 5 failures → Open      |
| Open        | Requests fail immediately, return cached/queued   | 60s timeout → Half-Open|
| Half-Open   | 1 probe request allowed                          | Success → Closed       |

### 8.3 Alerting Rules

| Condition                          | Severity | Channel          | Recipient     |
|------------------------------------|----------|------------------|---------------|
| ZATCA submission failure >10 min   | P1       | PagerDuty + SMS  | On-call + CTO |
| Stripe webhook delivery failure    | P2       | Slack + Email    | On-call       |
| SMS delivery rate <90%             | P3       | Slack            | Comms lead    |
| Circuit breaker open >5 min        | P2       | PagerDuty        | On-call       |
| Integration certificate expiry <30d| P3       | Email            | DevOps lead   |

### 8.4 Integration Dashboard Metrics

- Requests per minute (RPM) per integration
- Error rate (%) and error code distribution
- Latency p50 / p95 / p99 per integration
- Queue depth (pending items awaiting submission)
- Circuit breaker state history
- Certificate expiry countdown

---

## 9. Security Considerations

### 9.1 Credential Management

- All API keys and secrets stored in environment variables, never in code
- Production credentials rotated quarterly
- Separate credentials per environment (dev, staging, production)
- Access to credentials restricted to DevOps role (1 of 14 RBAC roles)

### 9.2 Data in Transit

- All integration traffic over TLS 1.3
- Certificate pinning for ZATCA API endpoints
- Webhook payloads validated against provider signatures

### 9.3 Tenant Data Isolation

- Each tenant's integration credentials stored in tenant-scoped config
- API calls include tenant identifier for audit trail
- Rate limiting applied per-tenant to prevent noisy-neighbor issues

---

## 10. Cross-References

| Document                          | Relevance                          |
|-----------------------------------|------------------------------------|
| [ZATCA Integration](../technical/zatca-integration.md)           | Detailed technical implementation  |
| [Payment Gateway](../technical/payment-gateway.md)               | Stripe configuration and flows     |
| [Third-Party Services](../technical/third-party-services.md)     | SMS, WhatsApp, email providers     |
| [Security Plan](security-plan.md)                                | Credential management policies     |
| [Risk Management Plan](risk-management-plan.md)                  | Integration failure risk register  |
| [Monitoring & Logging](../technical/monitoring-logging.md)       | Observability infrastructure       |

---

## 11. Revision History

| Version | Date       | Author          | Changes                          |
|---------|------------|-----------------|----------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO  | Initial release                  |
