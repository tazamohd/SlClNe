# How To: Setup Integrations

Guide for configuring external service integrations in SALIS AUTO: ZATCA e-invoicing, payment gateways, SMS providers, email services, OBD devices, and social media connections.

---

## Prerequisites

- Integration configuration requires the `settings` or `admin` RBAC module.
- **Owner/CEO** and **Super Admin** have full `settings` access (`vcedax`).
- **Branch Manager** has `settings:ve` (View and Edit only).
- Integration records are stored in the `integrations` table with `name`, `category`, `icon`, `status`, and `detail` fields.

---

## ZATCA E-Invoicing Integration

SALIS AUTO supports ZATCA Phase 2 e-invoicing for Saudi Arabian tax compliance.

### Step 1: Configure Organization VAT Number

1. Navigate to `/admin/settings` or the organization settings.
2. Enter the organization's **VAT Registration Number** in the `vatNumber` field.
3. Saudi VAT numbers follow the format: 15 digits starting and ending with `3` (e.g., `300012345600003`).
4. This value is stored in `organizations.vatNumber` (varchar 20).

### Step 2: Enable Phase 2 Compliance

1. In the ZATCA settings section, enable Phase 2 mode.
2. Configure the following:

| Setting | Description |
|---------|-------------|
| Seller VAT Number | Auto-populated from organization settings |
| ZATCA Environment | `sandbox` for testing, `production` for live |
| Certificate | Upload the ZATCA-issued digital certificate |
| Private Key | Upload the associated private key |
| Hash Algorithm | SHA-256 (default, per ZATCA specification) |

### Step 3: Test with Sandbox

1. Set the ZATCA environment to `sandbox`.
2. Create a test invoice and issue it.
3. Verify the following fields are populated:
   - `sellerVatNumber` — From organization settings
   - `buyerVatNumber` — From the customer record (required for B2B tax invoices)
   - `qrCode` — Base64-encoded TLV QR code
   - `hashSelf` — SHA-256 hash of this invoice
   - `hashPrev` — Hash of the previous invoice in the chain
4. Submit to ZATCA sandbox and verify acceptance.
5. Once validated, switch to `production`.

### ZATCA Invoice Requirements

| Field | Required For | Source |
|-------|-------------|--------|
| Seller name | All invoices | `organizations.name` |
| Seller VAT | All invoices | `organizations.vatNumber` |
| Buyer VAT | B2B tax invoices | `customers` record |
| Invoice date | All invoices | `invoices.issuedAt` |
| Total with VAT | All invoices | `invoices.totalHalalas` (includes 15% VAT) |
| VAT amount | All invoices | `invoices.taxHalalas` |
| QR code | All invoices | Auto-generated TLV encoding |
| Hash chain | All invoices | SHA-256 sequential linking |

### VAT Calculation

- Saudi VAT rate: **15%**
- Tax is calculated on the subtotal: `taxHalalas = subtotalHalalas * 0.15`
- Total: `totalHalalas = subtotalHalalas + taxHalalas - discountHalalas`
- All amounts are integer halalas (1 SAR = 100 halalas)

---

## Stripe Payment Gateway

### Step 1: Obtain API Keys

1. Create a Stripe account at stripe.com.
2. Navigate to Developers > API Keys in the Stripe dashboard.
3. Copy the **Publishable Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`).
4. For testing, use the test mode keys (`pk_test_...`, `sk_test_...`).

### Step 2: Configure in SALIS AUTO

1. Navigate to the payment gateway settings.
2. Enter the Stripe API keys:

| Setting | Value | Notes |
|---------|-------|-------|
| Publishable Key | `pk_live_...` or `pk_test_...` | Used by the frontend |
| Secret Key | `sk_live_...` or `sk_test_...` | Used by the server (never exposed to frontend) |
| Currency | `sar` | Saudi Riyal |

### Step 3: Configure Webhooks

1. In the Stripe dashboard, go to Developers > Webhooks.
2. Add an endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy the **Webhook Signing Secret** (starts with `whsec_`).
5. Configure the signing secret in SALIS AUTO's server settings.

### Step 4: Test Mode

1. Use Stripe's test card numbers for testing:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
2. Verify payments appear in the `payments` table with correct `amountHalalas`.
3. Test refund flow and verify the refund updates `invoices.paidHalalas`.

---

## SMS Provider Setup

### Configuration for Saudi Numbers

1. Choose an SMS provider that supports Saudi Arabia (+966 numbers).
2. Configure provider credentials in the integration settings.

### Phone Number Format

Saudi phone numbers must follow the international format:

| Type | Format | Example |
|------|--------|---------|
| Mobile | `+9665XXXXXXXX` | `+966501234567` |
| Landline (Riyadh) | `+96611XXXXXXX` | `+966112345678` |
| Landline (Jeddah) | `+96612XXXXXXX` | `+966122345678` |

**Important:** Do not include the domestic leading zero. `0501234567` becomes `+966501234567`.

### OTP Configuration

OTP (One-Time Password) delivery uses the `otp_challenges` table:

| Field | Description |
|-------|-------------|
| `channel` | `sms` or `whatsapp` (varchar 8) |
| `destination` | Phone number in `+966` format (varchar 254) |
| `codeHash` | Hashed OTP code (never stored in plaintext) |
| `expiresAt` | Expiration timestamp |
| `attempts` | Number of verification attempts |
| `verifiedAt` | Set when successfully verified |

### OTP Templates

Configure SMS templates for different use cases:

| Template | Example Message |
|----------|----------------|
| Login OTP | "Your SALIS AUTO verification code is {code}. Valid for 5 minutes." |
| Password Reset | "Your password reset code is {code}. Do not share this with anyone." |
| Appointment Reminder | "Reminder: Your vehicle service appointment is tomorrow at {time}." |

---

## Email Service Configuration

### Setup

1. Configure SMTP credentials or email API provider settings.
2. Required configuration:

| Setting | Description |
|---------|-------------|
| SMTP Host | Email server hostname |
| SMTP Port | 587 (TLS) or 465 (SSL) |
| Username | SMTP authentication username |
| Password | SMTP authentication password |
| From Address | Sender email address |
| From Name | Sender display name (e.g., "SALIS AUTO") |

### DNS Records

For reliable delivery, configure these DNS records for your sending domain:

| Record | Type | Purpose |
|--------|------|---------|
| SPF | TXT | Authorize sending servers |
| DKIM | TXT | Email signature verification |
| DMARC | TXT | Policy for failed authentication |

### Email Templates

Configure templates for:

- Welcome email (new user registration)
- Password reset
- Appointment confirmation
- Invoice notification
- Estimate approval request
- Service completion notification

---

## OBD Device Pairing

### Device Registration

1. Navigate to the OBD device management section.
2. Add a new device:

| Field | Description |
|-------|-------------|
| `code` | Device identifier (varchar 32) |
| `bay` | Workshop bay assignment (varchar 32) |
| `status` | Connection status |

3. The device is stored in the `obd_devices` table.

### Connecting a Device

1. Ensure the OBD-II adapter is physically connected to the vehicle's diagnostic port.
2. Verify Bluetooth or WiFi connectivity between the device and the bay's bridge system.
3. The device status should update to `connected` or `scanning`.
4. Vehicle information auto-populates: `vehicleLabel`, `plate`, `vin`.

### Reading Diagnostics

Once connected:

- **Live data**: RPM, coolant temperature, voltage, engine load are displayed.
- **DTC scan**: Trouble codes are read and stored in `obd_dtc_readings`.
- **Clear codes**: DTCs can be cleared (recorded as `source: 'clear'`).
- The `dtc_codes` reference table provides descriptions and severity levels for standard codes.

### OEM Tool Integration

The `oem_tools` table tracks manufacturer-specific diagnostic tools:

| Field | Description |
|-------|-------------|
| `brand` | Vehicle manufacturer |
| `tool` | Diagnostic tool name |
| `status` | License/subscription status |
| `protocol` | Communication protocol |
| `licence` | License key |
| `expiresOn` | License expiration date |

---

## Google Business Profile

### Setup

1. Navigate to the integration settings.
2. Connect your Google Business Profile account.
3. Link the organization's Google listing.

### Features

- Sync customer reviews from Google to SALIS AUTO's feedback system.
- Update business hours and service offerings.
- Monitor and respond to reviews from within the platform.

---

## Social Media Integration

### Available Platforms

- Google Business Profile (review management)
- Social media monitoring (track brand mentions)

### Configuration

1. Navigate to CRM & Marketing > Social Media Integration.
2. Connect accounts using OAuth.
3. Configure monitoring keywords and response templates.

---

## Integration Status Monitoring

All integrations are tracked in the `integrations` table:

| Field | Description |
|-------|-------------|
| `name` | Integration name |
| `nameAr` | Arabic name |
| `category` | Integration category |
| `icon` | Display icon |
| `status` | `active`, `inactive`, `error`, `pending` |
| `detail` | Status details or error message |

Monitor integration health at `/admin/integrations` (requires `admin` module access).

---

## See Also

- [Integration Issues](../troubleshooting/integration-issues.md) — Troubleshooting integration problems
- [Configuration Reference](../reference/configuration-reference.md) — Environment variables
- [Error Codes](../troubleshooting/error-codes.md) — API error reference
