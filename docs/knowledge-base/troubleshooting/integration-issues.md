# Integration Issues

Troubleshooting guide for external service integrations in SALIS AUTO: ZATCA e-invoicing, payment gateways, SMS/WhatsApp, email delivery, OBD devices, and browser compatibility.

---

## ZATCA E-Invoicing (Phase 2)

SALIS AUTO implements ZATCA Phase 2 e-invoicing compliance. The invoice table carries the following ZATCA-specific fields:

| Field | Purpose |
|-------|---------|
| `sellerVatNumber` | Seller's VAT registration number (up to 20 chars) |
| `buyerVatNumber` | Buyer's VAT registration number (B2B invoices) |
| `qrCode` | ZATCA-compliant QR code (Base64 encoded TLV) |
| `hashPrev` | SHA-256 hash of the previous invoice (64 hex chars) |
| `hashSelf` | SHA-256 hash of this invoice (64 hex chars) |

### QR Code Generation Failures

**Symptom:** Invoice QR code is blank or not generated.

**Root Cause:** Missing required fields for QR code generation.

**Resolution:**
1. Verify the organization's `vatNumber` is configured in the `organizations` table.
2. Ensure `sellerVatNumber` is populated on the invoice (should be copied from the organization).
3. Check that `issuedAt` timestamp is set (the QR code includes the invoice date).
4. Verify `totalHalalas` is a positive integer (the QR code includes the total with VAT).
5. The QR code uses TLV (Tag-Length-Value) encoding per ZATCA specification:
   - Tag 1: Seller name
   - Tag 2: VAT registration number
   - Tag 3: Timestamp (ISO 8601)
   - Tag 4: Invoice total (including VAT)
   - Tag 5: VAT amount

### Hash Chain Broken

**Symptom:** `hashPrev` does not match the previous invoice's `hashSelf`, breaking the cryptographic chain.

**Root Cause:** An invoice was deleted or modified after issuance, or invoices were issued out of order.

**Resolution:**
1. Identify the break point by querying invoices ordered by `issuedAt` and verifying each `hashPrev` matches the preceding invoice's `hashSelf`.
2. The first invoice in a chain has `hashPrev` set to a genesis value (64 zeros or a configured seed).
3. Do not manually edit `hashSelf` or `hashPrev` — they are computed by the server.
4. If the chain is broken, a re-computation of hashes from the break point may be necessary. Contact the development team.
5. Soft-deleted invoices (`deleted_at` not null) should still be included in hash chain verification.

### Missing VAT Numbers

**Symptom:** ZATCA validation rejects the invoice due to missing VAT number.

**Resolution:**
1. For **seller VAT**: Configure the organization's `vatNumber` in `/admin/settings` or directly in the `organizations` table.
2. For **buyer VAT**: Required for B2B (tax) invoices. Collect the buyer's VAT number during customer registration.
3. Saudi VAT numbers follow the format: 3XXXXXXXXXX003 (15 digits starting with 3 and ending with 3).
4. Verify the number with ZATCA's official lookup service before storing.

### XML Validation Errors

**Symptom:** ZATCA submission returns XML schema validation errors.

**Resolution:**
1. Verify all mandatory UBL 2.1 elements are present.
2. Check date formats are ISO 8601 (YYYY-MM-DD for dates, full ISO for timestamps).
3. Money amounts must be in SAR with 2 decimal places (divide halalas by 100).
4. Ensure VAT rate is 15% (the current Saudi standard rate).
5. Check that the invoice type code is correct (388 for tax invoice, 381 for credit note).

---

## Payment Gateway (Stripe)

### Webhook Delivery Failures

**Symptom:** Payments succeed on Stripe's side but the `payments` table is not updated.

**Resolution:**
1. Verify the webhook URL is correctly configured in the Stripe dashboard.
2. Check that the webhook secret matches the server configuration.
3. Inspect the Stripe dashboard Events section for failed webhook deliveries.
4. Verify the server is reachable from the internet (for production) or use Stripe CLI for local testing.
5. Check server logs for webhook signature verification failures.

### Payment Intent Errors

**Symptom:** Customer payment fails during checkout.

**Resolution:**
1. Verify API keys are correct (use test keys for development, live keys for production).
2. Check the amount is in the smallest currency unit (halalas for SAR). Stripe expects integer amounts.
3. Verify the currency code is `sar` (lowercase).
4. Check for card decline reasons in the Stripe dashboard.
5. Ensure 3D Secure (SCA) is configured for cards that require it.

### Refund Failures

**Symptom:** Refund request fails or does not reflect in the system.

**Root Cause:** The refund amount may exceed the original charge, or the charge may be too old.

**Resolution:**
1. Verify `refund amount <= original payment amount`.
2. Check that the original payment was successfully captured (not just authorized).
3. Stripe allows refunds up to 180 days after the original charge.
4. Verify the refund amount is in halalas (integer).

---

## SMS / WhatsApp Delivery

### OTP Not Received

**Symptom:** User does not receive the OTP code after requesting it.

**Root Cause:** Phone number format issue, carrier blocking, or SMS provider failure.

**Resolution:**
1. Verify the phone number format is international with Saudi country code: `+966XXXXXXXXX` (9 digits after country code).
2. Do not include the leading zero used domestically (e.g., `+966501234567`, not `+9660501234567`).
3. Check the `otp_challenges` table for the record:
   - `channel`: should be `sms` or `whatsapp`
   - `destination`: the formatted phone number
   - `expiresAt`: ensure the OTP has not expired
   - `attempts`: check if max attempts were exceeded
4. Verify the SMS provider is configured and has credit.
5. Check for carrier-level blocking (some Saudi carriers block shortcode SMS).

### Wrong Phone Format

**Symptom:** SMS send call fails with a validation error.

**Resolution:**
Saudi phone number rules:
- Must start with `+966`
- Mobile numbers: `+9665XXXXXXXX` (starts with 5, 9 digits after country code)
- Landline numbers: `+9661XXXXXXXX` (varies by region)
- Total length: 13 characters including `+966`

The `customers.phone` column allows up to 32 characters. The system should validate and normalize on input.

### WhatsApp Delivery Issues

**Symptom:** WhatsApp messages fail to deliver.

**Resolution:**
1. Verify the recipient has WhatsApp installed and active on the number.
2. WhatsApp Business API requires pre-approved message templates for outbound messages.
3. Check that the WhatsApp Business account is verified and in good standing.
4. Verify the 24-hour messaging window rules are being followed.

---

## Email Delivery

### Emails Not Received

**Symptom:** Notification emails, password reset emails, or report exports are not delivered.

**Resolution:**
1. Check the recipient's spam/junk folder.
2. Verify the email address format (up to 254 characters, stored in `varchar(254)` columns).
3. Check the email service provider configuration (SMTP credentials, API keys).
4. Verify DNS records (SPF, DKIM, DMARC) are correctly configured for the sending domain.
5. Check email service provider logs for bounce or rejection reasons.

### Email Formatting Issues

**Symptom:** Email content appears broken or unstyled.

**Resolution:**
1. Ensure HTML email templates use inline CSS (many email clients strip `<style>` tags).
2. Test with multiple email clients (Gmail, Outlook, Apple Mail).
3. Verify bilingual content renders correctly (Arabic RTL sections within LTR email).

---

## OBD Device Connection

### Device Not Connecting

**Symptom:** OBD device shows as disconnected or offline in `/admin/integrations`.

**Root Cause:** The OBD device bridge is an external dependency. The system stores device data in the `obd_devices` table.

**Resolution:**
1. Check the device's `status` field in `obd_devices` (expected: `connected`, `scanning`, `idle`).
2. Verify the device is physically connected to the vehicle's OBD-II port.
3. Check Bluetooth/WiFi connectivity between the device and the bay's bridge.
4. Verify the device's firmware is up to date.
5. Check `dtcCount` — a device may appear stuck if it has uncleared DTCs.

### DTC Reading Failures

**Symptom:** Diagnostic trouble codes are not being read or cleared.

**Resolution:**
1. Check the `obd_dtc_readings` table for recent readings from the device.
2. Verify the `source` field: `rescan`, `clear`, or `manual`.
3. If readings are tagged with `mock: true`, the system is using simulated data, not a live device.
4. For real scans, ensure the vehicle's ignition is in the ON position (engine running or key in ACC for some protocols).
5. Check the `oem_tools` table for protocol compatibility with the vehicle.

---

## Browser Compatibility

### Supported Browsers

SALIS AUTO targets modern evergreen browsers:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Recommended for best experience |
| Firefox | 90+ | Full support |
| Safari | 15+ | Required for iOS devices |
| Edge | 90+ | Chromium-based versions |

### Common Browser Issues

| Issue | Resolution |
|-------|------------|
| CSS Grid/Flexbox rendering | Update browser to latest version |
| localStorage not available | Enable cookies/site data in browser settings |
| RTL rendering issues | Use Chrome or Firefox for best RTL support |
| WebSocket connection failures | Check for corporate proxy/firewall blocking |
| Font rendering (JetBrains Mono) | Ensure web fonts are not blocked by browser extensions |
| Print layout issues | Use Chrome's print dialog; Safari may omit some CSS |

### Private/Incognito Mode

- localStorage keys (`salis-theme`, `salis-lang`, `salis-role`, etc.) are cleared when the session ends.
- The user must log in again and reconfigure preferences each time.
- Some browsers restrict storage quotas in private mode.

---

## See Also

- [Error Codes](./error-codes.md) — API error reference
- [Configuration Reference](../reference/configuration-reference.md) — Environment variables
- [Common Issues](./common-issues.md) — General troubleshooting
