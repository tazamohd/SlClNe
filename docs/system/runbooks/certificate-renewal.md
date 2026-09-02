# SALIS AUTO -- Certificate Renewal

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following conditions are observed:

1. **ZATCA certificate expiry within 30 days** -- automated monitoring alert on X.509 certificate validity
2. **TLS certificate expiry within 30 days** -- Let's Encrypt or hosting provider renewal reminder
3. **ZATCA portal renewal notification** -- email or portal alert requesting certificate renewal
4. **Certificate validation failure** -- invoice signing returns cryptographic errors or TLS handshake failures
5. **Scheduled renewal** -- during the bi-weekly maintenance window (Sunday 2:00-4:00 AM AST) when a certificate is within 30 days of expiry
6. **Post-incident** -- after a security breach that may have compromised private keys (see [Security Breach Response](./security-breach-response.md))

---

## Prerequisites

| Requirement                  | Details                                                        |
|------------------------------|----------------------------------------------------------------|
| ZATCA developer portal access| Login credentials for the ZATCA Fatoora portal                 |
| OpenSSL installed            | Version 1.1.1+ on the operations workstation                  |
| CSR generation capability    | Access to generate Certificate Signing Requests                |
| Server SSH access            | Root or deploy user on the backend API server                  |
| Secrets manager access       | Hosting provider dashboard to update environment variables     |
| ZATCA sandbox access         | For testing renewed certificates before production swap        |
| DNS management access        | For TLS certificate domain validation                          |
| Backup of current certs      | Current certificates and keys stored securely before rotation  |

---

## Procedure A: ZATCA X.509 Certificate Renewal

### Phase 1: Prepare Certificate Signing Request

**Step 1.** Check the current ZATCA certificate expiry date.

```bash
openssl x509 -in /etc/salis/certs/zatca-signing.crt -noout -enddate
```

Record the `notAfter` date. If more than 30 days remain and this is not an emergency renewal, schedule for a future maintenance window.

**Step 2.** Back up the current certificate and private key.

```bash
cp /etc/salis/certs/zatca-signing.crt /etc/salis/certs/zatca-signing.crt.bak.$(date +%Y%m%d)
cp /etc/salis/certs/zatca-signing.key /etc/salis/certs/zatca-signing.key.bak.$(date +%Y%m%d)
```

**Step 3.** Generate a new private key for the ZATCA certificate.

```bash
openssl ecparam -genkey -name secp256k1 -out /etc/salis/certs/zatca-signing-new.key
```

Note: ZATCA Phase 2 requires ECDSA with the `secp256k1` curve. Verify current ZATCA requirements before generating.

**Step 4.** Create the Certificate Signing Request (CSR).

```bash
openssl req -new \
  -key /etc/salis/certs/zatca-signing-new.key \
  -out /etc/salis/certs/zatca-signing-new.csr \
  -subj "/C=SA/O=SALIS AUTO/CN=SALIS AUTO E-Invoice Signing" \
  -sha256
```

**Step 5.** Verify the CSR contents.

```bash
openssl req -in /etc/salis/certs/zatca-signing-new.csr -noout -text
```

Confirm:
- Subject contains the correct organization name
- Key algorithm matches ZATCA requirements
- Signature algorithm is SHA-256

### Phase 2: Submit to ZATCA Portal

**Step 6.** Log in to the ZATCA Fatoora developer portal (`fatoora.zatca.gov.sa`).

**Step 7.** Navigate to the certificate management section and select "Renew Certificate" or "Request New Certificate".

**Step 8.** Upload the CSR file (`zatca-signing-new.csr`).

**Step 9.** Complete any required organization verification steps on the portal.

**Step 10.** Download the signed certificate once ZATCA processes the request. Save it as:

```bash
mv downloaded-cert.crt /etc/salis/certs/zatca-signing-new.crt
```

**Step 11.** Verify the downloaded certificate.

```bash
# Check the certificate details
openssl x509 -in /etc/salis/certs/zatca-signing-new.crt -noout -text

# Verify the certificate matches the private key
openssl x509 -in /etc/salis/certs/zatca-signing-new.crt -noout -modulus | openssl md5
openssl ec -in /etc/salis/certs/zatca-signing-new.key -noout | openssl md5
```

Both MD5 hashes must match.

### Phase 3: Test on Sandbox

**Step 12.** Deploy the new certificate to the staging environment.

```bash
# Update staging environment variables
ZATCA_CERT_PATH=/etc/salis/certs/zatca-signing-new.crt
ZATCA_KEY_PATH=/etc/salis/certs/zatca-signing-new.key
```

**Step 13.** Issue a test invoice on staging to verify signing works.

```bash
curl -X POST https://staging-api.salisauto.com/api/v1/invoices/TEST_INVOICE_ID/issue \
  -H "Authorization: Bearer $STAGING_TOKEN" \
  -H "Content-Type: application/json"
```

**Step 14.** Verify the test invoice has valid ZATCA fields.

```bash
curl -s https://staging-api.salisauto.com/api/v1/invoices/TEST_INVOICE_ID \
  -H "Authorization: Bearer $STAGING_TOKEN" | jq '.qrCode, .hashSelf'
```

Both `qrCode` and `hashSelf` must be populated and non-null.

**Step 15.** If ZATCA sandbox clearance is configured, verify the invoice is accepted by the ZATCA sandbox API.

### Phase 4: Deploy to Production

**Step 16.** During the maintenance window, replace the production certificate.

```bash
mv /etc/salis/certs/zatca-signing-new.crt /etc/salis/certs/zatca-signing.crt
mv /etc/salis/certs/zatca-signing-new.key /etc/salis/certs/zatca-signing.key
```

**Step 17.** Update environment variables in the production secrets manager if the certificate path or content is stored as an environment variable.

**Step 18.** Restart the backend API to load the new certificate.

```bash
pm2 restart salis-api
# or
kubectl rollout restart deployment salis-api
```

**Step 19.** Issue a production test invoice and verify ZATCA compliance fields.

**Step 20.** Monitor Sentry and application logs for any signing errors for the next 30 minutes.

---

## Procedure B: TLS Certificate Renewal

### Phase 1: Check Current Certificate Status

**Step 1.** Check the TLS certificate expiry for the API domain.

```bash
echo | openssl s_client -connect api.salisauto.com:443 -servername api.salisauto.com 2>/dev/null \
  | openssl x509 -noout -dates
```

**Step 2.** Check the TLS certificate for the frontend domain.

```bash
echo | openssl s_client -connect app.salisauto.com:443 -servername app.salisauto.com 2>/dev/null \
  | openssl x509 -noout -dates
```

### Phase 2: Renew via Let's Encrypt (Backend API)

**Step 3.** If using certbot, run the renewal.

```bash
sudo certbot renew --cert-name api.salisauto.com --dry-run
```

If the dry run succeeds:

```bash
sudo certbot renew --cert-name api.salisauto.com
```

**Step 4.** If using a cloud provider with automatic TLS, verify the auto-renewal is configured and functioning. Check the provider dashboard for certificate status.

**Step 5.** Reload the web server or reverse proxy to pick up the renewed certificate.

```bash
# Nginx:
sudo nginx -t && sudo systemctl reload nginx

# If the API server handles TLS directly:
pm2 restart salis-api
```

### Phase 3: Renew Frontend TLS

**Step 6.** Frontend TLS on GitHub Pages, Vercel, or Netlify is managed automatically by the hosting provider. Verify the certificate is valid:

```bash
echo | openssl s_client -connect app.salisauto.com:443 -servername app.salisauto.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

**Step 7.** If using a custom domain with GitHub Pages, verify the CNAME record is correct and GitHub has provisioned the certificate.

### Phase 4: Validate Certificate Chain

**Step 8.** Verify the full certificate chain for the API.

```bash
openssl s_client -connect api.salisauto.com:443 -servername api.salisauto.com \
  -showcerts 2>/dev/null | openssl x509 -noout -text | grep -E "(Issuer|Subject|Not)"
```

**Step 9.** Verify HSTS header is present after renewal.

```bash
curl -sI https://api.salisauto.com/health | grep -i strict-transport
```

Expected: `Strict-Transport-Security: max-age=31536000`

---

## Verification

| Check                                    | Command / Method                           | Expected Result                    |
|------------------------------------------|--------------------------------------------|------------------------------------|
| ZATCA cert not expired                   | `openssl x509 -noout -enddate`             | Date > 30 days from now            |
| ZATCA cert key match                     | MD5 comparison of cert and key             | Hashes match                       |
| Invoice signing functional               | Issue test invoice                         | `qrCode` and `hashSelf` populated  |
| ZATCA sandbox acceptance                 | Sandbox clearance API response             | Accepted / no errors               |
| TLS handshake (API)                      | `openssl s_client -connect`                | Handshake complete, no errors      |
| TLS handshake (frontend)                 | `openssl s_client -connect`                | Handshake complete, no errors      |
| Certificate chain valid                  | `openssl verify -CAfile chain.pem`         | `OK`                               |
| HSTS header present                      | `curl -sI` check                           | `max-age=31536000`                 |
| Application health                       | `GET /health`                              | `{ "status": "ok" }`              |
| No signing errors in logs                | Sentry + application log review            | Zero certificate-related errors    |

---

## Rollback

### ZATCA Certificate Rollback

If the new ZATCA certificate causes signing failures:

1. **Stop issuing invoices** immediately to prevent hash chain corruption.
2. **Restore the backed-up certificate and key.**
   ```bash
   cp /etc/salis/certs/zatca-signing.crt.bak.YYYYMMDD /etc/salis/certs/zatca-signing.crt
   cp /etc/salis/certs/zatca-signing.key.bak.YYYYMMDD /etc/salis/certs/zatca-signing.key
   ```
3. **Restart the API** to load the old certificate.
4. **Issue a test invoice** to confirm signing works with the old certificate.
5. **Investigate** the new certificate issue with ZATCA support.

### TLS Certificate Rollback

If the renewed TLS certificate causes handshake failures:

1. **Restore the previous certificate files** from backup.
2. **Reload the web server** (`nginx -t && systemctl reload nginx`).
3. **Verify** TLS handshake with `openssl s_client`.
4. **Investigate** the renewal failure (wrong domain, incomplete chain, etc.).

---

## Escalation

| Condition                                  | Escalate To               | Method          | Timeframe     |
|--------------------------------------------|---------------------------|-----------------|---------------|
| ZATCA portal unreachable or CSR rejected   | Sr. Backend Dev 2 (ZATCA) | Slack + phone   | Within 1 hour |
| Signed certificate not received within 48h | ZATCA developer support   | Portal ticket   | After 48 hours|
| Invoice signing fails after renewal        | On-call DBA + Team Lead   | PagerDuty       | Immediate     |
| TLS renewal fails (certbot error)          | DevOps Engineer           | Slack           | Within 1 hour |
| Certificate compromise suspected           | CTO + Security Team       | Phone call      | Immediate     |
| Hash chain integrity affected              | Sr. Backend Dev 2 (ZATCA) | PagerDuty       | Immediate     |

---

## Related Documents

- [ZATCA Integration](../integration/zatca-integration.md)
- [DevOps Guide](../operations/devops-guide.md)
- [Deployment Plan](../../project-management/planning/deployment-plan.md)
- [Security Breach Response](./security-breach-response.md)
- [Data Protection](../security/data-protection.md)
