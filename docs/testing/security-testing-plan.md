# SALIS AUTO -- Security Testing Plan

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-TST-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Purpose

This document defines the penetration testing and security validation plan for SALIS AUTO. It covers OWASP Top 10 mapping, authentication and authorization testing, API security, ZATCA-specific attack vectors, and data protection validation. The platform handles sensitive financial data (invoices, payroll, bank accounts) and personally identifiable information (customer contacts, employee salaries) within a multi-tenant architecture, demanding rigorous security controls.

**Related documents:**
- [Security Requirements](../requirements/non-functional/security.md)
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Load Testing Plan](load-testing-plan.md)

---

## 2. Scope and Approach

### 2.1 In-Scope Systems

| Component | Technology | Testing Focus |
|-----------|------------|---------------|
| Frontend SPA | React 18 + TypeScript + Vite | XSS, CSP, client-side storage, DOM manipulation |
| Backend API | Express/Fastify + Drizzle ORM | Injection, authn/authz, IDOR, business logic |
| Database | PostgreSQL | SQL injection, RLS bypass, tenant isolation |
| External integrations | ZATCA API, HyperPay, Unifonic SMS | Certificate handling, callback validation |
| Customer App | React (430px mobile frame) | Mobile-specific attack surface |
| Supplier/Technician portals | React portal shells | External role privilege boundaries |

### 2.2 Testing Methodology

| Phase | Activities | Duration |
|-------|-----------|----------|
| Reconnaissance | API endpoint enumeration, schema discovery, role mapping | 2 days |
| Automated scanning | OWASP ZAP full scan, dependency vulnerability scan | 1 day |
| Manual testing | Authentication, authorization, business logic, ZATCA | 5 days |
| Reporting | Findings documentation, severity classification, remediation guidance | 2 days |

### 2.3 Tools

| Tool | Purpose |
|------|---------|
| OWASP ZAP | Automated web application security scanner |
| Burp Suite Professional | Manual interception, request manipulation |
| Supertest | Programmatic API security test scripts |
| k6 | Rate limiting and brute force validation |
| Custom scripts | JWT manipulation, hash chain validation, SoD bypass |
| npm audit / Snyk | Dependency vulnerability scanning |
| SQLMap (targeted) | SQL injection confirmation (if Drizzle bypass suspected) |

---

## 3. OWASP Top 10 Checklist -- SALIS AUTO Mapping

### 3.1 A01:2021 -- Broken Access Control

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| RBAC bypass via direct URL | SEC-AC-001 | Access `/admin/users` as Technician role | Supertest |
| Horizontal privilege escalation | SEC-AC-002 | User A reads User B's records within same role | Supertest |
| Vertical privilege escalation | SEC-AC-003 | Technician attempts to create invoice (Accountant action) | Supertest |
| IDOR on entity endpoints | SEC-AC-004 | Substitute entity ULID in URL to access another org's data | Burp Suite |
| API parameter tampering | SEC-AC-005 | Modify `orgId` or `branchId` in request body | Supertest |
| Data scope bypass | SEC-AC-006 | Manager attempts to query data outside assigned branch | Supertest |
| Customer "own" scope bypass | SEC-AC-007 | Customer reads another customer's invoices | Supertest |
| Missing function-level access | SEC-AC-008 | Unauthenticated access to protected endpoints | ZAP |

### 3.2 A02:2021 -- Cryptographic Failures

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| JWT secret strength | SEC-CR-001 | Attempt JWT forgery with weak/guessable secrets | Custom script |
| Password hash verification | SEC-CR-002 | Confirm Argon2id with OWASP parameters (m=19MiB, t=2, p=1) | Code review |
| Sensitive data in transit | SEC-CR-003 | Verify TLS on all external API calls (ZATCA, HyperPay, SMS) | Burp Suite |
| OTP plaintext exposure | SEC-CR-004 | Verify OTP is stored as hash, never logged or returned | API + log review |
| Refresh token hash storage | SEC-CR-005 | Verify `user_sessions.refresh_token_hash` is hashed, not plain | DB review |

### 3.3 A03:2021 -- Injection

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| SQL injection via search | SEC-IN-001 | Inject SQL in search/filter parameters | ZAP + manual |
| SQL injection via ILIKE | SEC-IN-002 | Test `ILIKE` search patterns for escaping issues | Supertest |
| NoSQL injection | SEC-IN-003 | Not applicable (PostgreSQL only) | N/A |
| XSS in user input fields | SEC-IN-004 | Inject `<script>` tags in customer name, notes, feedback | ZAP |
| XSS in bilingual fields | SEC-IN-005 | Inject scripts in Arabic text fields | Manual |
| CSV formula injection | SEC-IN-006 | Verify export prefixes cells starting with `=+\-@` with tab | Supertest |
| Command injection | SEC-IN-007 | Test any file upload or processing endpoints | Manual |

### 3.4 A04:2021 -- Insecure Design

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| Business logic bypass | SEC-ID-001 | Skip workflow stages (check-in directly to delivery) | Supertest |
| Approval ceiling bypass | SEC-ID-002 | Submit PO just below ceiling, then modify amount after approval | Supertest |
| SoD circumvention | SEC-ID-003 | Create and approve same PO via API race condition | Custom script |
| Estimate tampering | SEC-ID-004 | Modify estimate after customer approval | Supertest |

### 3.5 A05:2021 -- Security Misconfiguration

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| Default credentials | SEC-MC-001 | Attempt login with common defaults (admin/admin) | Manual |
| Verbose error messages | SEC-MC-002 | Trigger errors and check for stack traces or internal paths | ZAP |
| CORS misconfiguration | SEC-MC-003 | Send requests from unauthorized origin | Burp Suite |
| CSP header validation | SEC-MC-004 | Verify Content-Security-Policy prevents inline scripts | Browser dev tools |
| Exposed debug endpoints | SEC-MC-005 | Scan for `/debug`, `/metrics`, `/health` without auth | ZAP |
| SSO/WebAuthn misconfiguration | SEC-MC-006 | Verify 503 response when unconfigured (not fabricated success) | Supertest |

### 3.6 A06:2021 -- Vulnerable Components

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| Known CVEs in dependencies | SEC-VC-001 | Run `npm audit` and Snyk scan | CLI |
| Outdated packages | SEC-VC-002 | Check for packages > 1 major version behind | CLI |
| License compliance | SEC-VC-003 | Verify no copyleft licenses in production bundle | CLI |

### 3.7 A07:2021 -- Authentication Failures

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| Brute force login | SEC-AF-001 | Attempt > 8 logins to trigger lockout | k6 + Supertest |
| Lockout bypass | SEC-AF-002 | Attempt to circumvent lockout via IP rotation | Manual |
| Token expiry enforcement | SEC-AF-003 | Use expired JWT access token | Supertest |
| Refresh token reuse | SEC-AF-004 | Reuse a rotated refresh token to trigger family revocation | Supertest |
| Refresh token theft detection | SEC-AF-005 | Simulate concurrent use of stolen refresh token | Custom script |
| Session fixation | SEC-AF-006 | Attempt to set session identifiers pre-authentication | Burp Suite |
| OTP brute force | SEC-AF-007 | Attempt > 5 OTP verifications per challenge | Supertest |
| OTP resend flood | SEC-AF-008 | Attempt rapid OTP resends (< 60s cooldown) | Supertest |

### 3.8 A08:2021 -- Software and Data Integrity

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| JWT algorithm confusion | SEC-DI-001 | Submit JWT with `alg: none` or `alg: RS256` | Custom script |
| JWT payload tampering | SEC-DI-002 | Modify claims (role, orgId) and re-sign with guessed key | Custom script |
| Audit trail immutability | SEC-DI-003 | Attempt to UPDATE or DELETE audit_log rows | Direct DB test |
| Server-owned field injection | SEC-DI-004 | Submit `orgId`, `createdBy`, `version` in request body | Supertest |

### 3.9 A09:2021 -- Logging and Monitoring

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| Credential leak in logs | SEC-LM-001 | Search application logs for passwords, tokens, OTPs | Log review |
| Audit trail completeness | SEC-LM-002 | Perform actions and verify corresponding audit entries | Manual |
| Request ID correlation | SEC-LM-003 | Verify `requestId` links related audit and log entries | Manual |

### 3.10 A10:2021 -- SSRF

| Test Case | ID | Description | Method |
|-----------|----|-------------|--------|
| SSRF via webhook/callback URLs | SEC-SS-001 | Submit internal URLs in any URL input fields | Burp Suite |
| SSRF via file upload | SEC-SS-002 | Upload file referencing internal resources | Manual |

---

## 4. Authentication Testing

### 4.1 JWT Security Tests

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Algorithm none attack | SEC-JWT-001 | Set JWT header `alg` to `none`, remove signature | 401 Unauthorized |
| Algorithm substitution | SEC-JWT-002 | Change `alg` from HS256 to RS256 with crafted key | 401 Unauthorized |
| Expired token usage | SEC-JWT-003 | Present token with `exp` in the past | 401 Unauthorized |
| Modified claims | SEC-JWT-004 | Change `role` claim from `technician` to `super_admin` | 401 (signature invalid) |
| Missing claims | SEC-JWT-005 | Remove `org` or `role` claim from payload | 401 or 400 |
| Token from different environment | SEC-JWT-006 | Use production token in staging | 401 Unauthorized |

### 4.2 Session Security Tests

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Concurrent session limit | SEC-SES-001 | Login from multiple devices simultaneously | Policy-dependent behavior |
| Session after password change | SEC-SES-002 | Change password, attempt API call with old token | 401 Unauthorized |
| Refresh token family revocation | SEC-SES-003 | Reuse old refresh token after rotation | All family tokens revoked |
| Logout token invalidation | SEC-SES-004 | Call API with token after logout | 401 Unauthorized |

### 4.3 Brute Force and Rate Limiting

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Login brute force | SEC-BF-001 | Send 20 login attempts in 1 minute | Rate limited after 10 (IP-based) |
| Account lockout trigger | SEC-BF-002 | Send 8 wrong passwords for one user | Account locked for 300 seconds |
| Auth endpoint flood | SEC-BF-003 | Send 30 auth requests/min from one IP | 429 after 20 |
| Lockout per identity | SEC-BF-004 | Lock user via IP1, attempt via IP2 | Account still locked (per identity) |

---

## 5. Authorization Testing (RBAC)

### 5.1 Role-Based Access Control Bypass

Test every protected endpoint against all 14 roles:

| Role | Expected Access Level | Test Focus |
|------|-----------------------|------------|
| Super Admin | Platform-wide administration | Cannot access other org's data |
| Owner/CEO | All data within organization | Cross-org isolation |
| Branch Manager | Branch-scoped data | Cannot access other branches |
| Service Advisor | Job cards, estimates, customers | Cannot access financial data |
| Technician | Assigned jobs only | Cannot access unassigned jobs |
| QC Inspector | QC checklists | Cannot approve own repairs (SoD) |
| Storekeeper | Inventory, parts requests | Cannot approve own POs (SoD) |
| Accountant | Invoices, payments, accounting | Cannot access HR/salary (redaction) |
| HR Manager | Employee, payroll, leave | Cannot access financial data |
| Receptionist | Check-in, customer lookup | Cannot access inventory or finance |
| Call Center Agent | Appointments, customer lookup | Cannot access job details |
| Procurement Manager | Purchase orders, suppliers | Cannot access HR data |
| Supplier | Own POs and deliveries only | External scope enforcement |
| Customer | Own vehicles, invoices, appointments | Self-scope enforcement |

### 5.2 Privilege Escalation Tests

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Vertical: Technician to Admin | SEC-PE-001 | Technician calls `POST /admin/users` | 403 Forbidden |
| Vertical: Customer to Advisor | SEC-PE-002 | Customer calls `POST /job-cards` | 403 Forbidden |
| Horizontal: Advisor A to Advisor B | SEC-PE-003 | Advisor reads another advisor's assigned jobs | Empty result (own scope) |
| Scope elevation: branch to all | SEC-PE-004 | Manager modifies query to remove branch filter | Server enforces branch scope |
| Grant action bypass | SEC-PE-005 | User with `v` (view-only) sends `POST` (create) | 403 Forbidden |
| Export without `x` grant | SEC-PE-006 | User without export permission calls CSV endpoint | 403 Forbidden |

### 5.3 Separation of Duties Circumvention

| SoD Pair | ID | Attack Vector | Expected Result |
|----------|----|---------------|-----------------|
| Raise PO / Approve PO | SEC-SOD-001 | Same user creates and approves PO via separate API calls | Blocked by `requireSodClear()` |
| Perform Repair / Pass QC | SEC-SOD-002 | Technician who did repair attempts QC approval | Blocked by `requireSodClear()` |
| Issue Stock / Adjust Stock | SEC-SOD-003 | User issues stock then adjusts count for same part | Blocked by `requireSodClear()` |
| SoD via API race condition | SEC-SOD-004 | Send create and approve requests simultaneously | Both audit-checked; second blocked |
| SoD via role switching | SEC-SOD-005 | User with dual roles attempts both actions | Blocked (audit checks user ID, not role) |

### 5.4 Cross-Tenant Access Testing

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Direct entity access | SEC-MT-001 | Org A user requests Org B entity by ULID | 403 or 404 |
| List filtering bypass | SEC-MT-002 | Modify `orgId` filter parameter in list request | Server ignores client `orgId`, uses JWT claim |
| Bulk operation cross-tenant | SEC-MT-003 | Include Org B entity IDs in bulk delete/update | Only Org A entities affected |
| Join/relation traversal | SEC-MT-004 | Access related entity (e.g., customer's vehicle) across orgs | Blocked at relation level |
| Search result leakage | SEC-MT-005 | Search for term that exists in both orgs | Results scoped to user's org |

### 5.5 Field-Level Redaction Bypass

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Direct API field request | SEC-RD-001 | Technician requests part detail, check for `costHalalas` | Field is null in response |
| GraphQL-style field selection | SEC-RD-002 | If field selection is supported, explicitly request redacted field | Field still null |
| Bulk export includes redacted fields | SEC-RD-003 | Export CSV as Technician, check for cost columns | Columns absent or null |
| Response manipulation | SEC-RD-004 | Verify redaction happens server-side, not client-side | API response has no value |

---

## 6. API Security Testing

### 6.1 Injection Testing

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| SQL injection in filter params | SEC-API-001 | `GET /customers?search=' OR 1=1--` | Parameterized query prevents injection |
| SQL injection in ILIKE | SEC-API-002 | `GET /vehicles?search=%'; DROP TABLE--` | Drizzle ORM escapes input |
| SQL injection in sort params | SEC-API-003 | `GET /job-cards?sort=status;DROP TABLE` | Rejected or sanitized |
| JSON injection in body | SEC-API-004 | Nested/prototype-polluting JSON payloads | Zod schema rejects extra fields |
| XSS in stored fields | SEC-API-005 | Store `<img onerror=alert(1)>` in customer name | React escapes on render |

### 6.2 IDOR Testing

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Sequential ID enumeration | SEC-IDOR-001 | Attempt to guess ULIDs (26-char Crockford Base32) | Infeasible (high entropy) |
| Entity ID substitution | SEC-IDOR-002 | Replace entity ID in URL with another org's entity | 403 or 404 |
| Batch operation with mixed IDs | SEC-IDOR-003 | Include foreign entity IDs in bulk operations | Foreign IDs silently skipped or 403 |
| Nested resource access | SEC-IDOR-004 | `/customers/:foreignId/vehicles` | 403 or empty (tenant isolation) |

### 6.3 Rate Limiting Validation

| Endpoint Category | Limit | Test Method |
|-------------------|-------|-------------|
| Login | 10/min per IP | k6: 15 requests in 60s from single IP |
| Auth endpoints | 20/min per IP | k6: 25 requests in 60s |
| Authenticated API | Per tenant config | k6: exceed configured limit |
| Export CSV | 5/min per user | k6: 8 export requests in 60s |

**Expected behavior:** HTTP 429 response after limit. `Retry-After` header present. No server crash.

### 6.4 Input Validation Testing

| Test | ID | Steps | Expected Result |
|------|----|-------|-----------------|
| Missing required fields | SEC-IV-001 | Submit empty body to POST endpoints | 400 with Zod error |
| Exceed field length | SEC-IV-002 | Password > 200 chars, email > 254 chars | 400 with validation error |
| Invalid phone format | SEC-IV-003 | Submit non-Saudi phone (e.g., +1234567890) | 400 validation error |
| Server-owned field override | SEC-IV-004 | Include `id`, `orgId`, `createdAt` in POST body | Fields stripped (SERVER_OWNED_KEYS) |
| Negative currency values | SEC-IV-005 | Submit negative halalas amount | Rejected or handled per business rules |
| Invalid stage transition | SEC-IV-006 | Transition job from "checkin" to "delivery" (skipping stages) | 422 with invalid transition error |

---

## 7. ZATCA-Specific Security Testing

### 7.1 Certificate and Signing

| Test | ID | Description | Expected Result |
|------|----|-------------|-----------------|
| Expired certificate use | SEC-ZT-001 | Attempt ZATCA submission with expired signing cert | Rejected with clear error |
| Self-signed certificate | SEC-ZT-002 | Replace ZATCA cert with self-signed | Rejected; cert validation enforced |
| Certificate private key exposure | SEC-ZT-003 | Verify private key is not in API responses, logs, or client | No exposure found |
| Man-in-the-middle on ZATCA API | SEC-ZT-004 | Verify TLS certificate pinning on ZATCA endpoint | Connection refused on invalid cert |

### 7.2 Hash Chain Integrity

| Test | ID | Description | Expected Result |
|------|----|-------------|-----------------|
| Hash chain gap injection | SEC-ZT-005 | Delete an invoice and create a new one; verify chain detects gap | Hash chain validation fails |
| Hash chain manipulation | SEC-ZT-006 | Modify a previous invoice's hash and submit next | Chain validation error |
| Invoice counter manipulation | SEC-ZT-007 | Attempt to submit with duplicate or skipped counter | Rejected (no gaps, no duplicates) |
| Parallel invoice creation | SEC-ZT-008 | Create invoices simultaneously across branches | Counters remain sequential per branch |

### 7.3 Invoice Data Integrity

| Test | ID | Description | Expected Result |
|------|----|-------------|-----------------|
| Amount tampering post-generation | SEC-ZT-009 | Modify invoice amount after XML generation | Hash mismatch detected |
| QR code data tampering | SEC-ZT-010 | Verify QR TLV data matches invoice fields exactly | TLV decoding matches source |
| VAT number substitution | SEC-ZT-011 | Submit invoice with incorrect VAT number | ZATCA sandbox rejects |
| XML schema deviation | SEC-ZT-012 | Submit non-conforming UBL 2.1 XML | ZATCA sandbox returns validation errors |

---

## 8. Data Protection Testing

### 8.1 PII Exposure Assessment

| Data Category | Fields | Test Method |
|---------------|--------|-------------|
| Customer PII | Name, phone, email, address | Verify redaction rules per role (Section 5.5) |
| Employee PII | Salary, bank account, Saudi ID | Verify field-level redaction (7 rules) |
| Authentication credentials | Passwords, tokens, OTPs | Verify never in API response, logs, or audit |
| Financial data | Bank accounts, cost margins | Verify redaction per role matrix |

### 8.2 Encryption Validation

| Test | ID | Description | Expected Result |
|------|----|-------------|-----------------|
| Data at rest | SEC-DP-001 | Verify database encryption for PII columns | Encryption enabled |
| Data in transit | SEC-DP-002 | Verify all API communication uses TLS 1.2+ | No plaintext connections |
| Password storage | SEC-DP-003 | Verify Argon2id hash in `password_hash` column | Not reversible; correct parameters |
| OTP storage | SEC-DP-004 | Verify OTP stored as hash in database | No plaintext OTP at rest |
| Refresh token storage | SEC-DP-005 | Verify hash in `user_sessions.refresh_token_hash` | Not reversible |

### 8.3 Data Leakage Prevention

| Test | ID | Description | Expected Result |
|------|----|-------------|-----------------|
| Error response information | SEC-DL-001 | Trigger errors; check for stack traces, SQL, internal paths | Generic error messages only |
| API response over-exposure | SEC-DL-002 | Check all list/detail responses for unnecessary fields | Only permitted fields returned |
| Browser storage exposure | SEC-DL-003 | Check localStorage/sessionStorage for sensitive data | No PII or tokens in browser storage |
| Cache header validation | SEC-DL-004 | Verify `Cache-Control: no-store` on auth responses | Sensitive responses not cached |
| Audit log credential scrubbing | SEC-DL-005 | Verify password, token, OTP fields scrubbed before audit insert | Fields absent from audit entries |

---

## 9. Severity Classification

| Severity | Definition | SLA | Examples |
|----------|-----------|-----|---------|
| Critical | Immediate exploitation risk; data breach or full system compromise | 4 hours | Auth bypass, tenant data leakage, SQL injection |
| High | Significant security weakness; exploitation requires some effort | 24 hours | RBAC bypass, privilege escalation, SoD circumvention |
| Medium | Security issue with limited impact or exploitation complexity | Within sprint | XSS (stored), CSRF, information disclosure |
| Low | Minor issue; defense-in-depth improvement | Backlog | Missing headers, verbose errors, weak CSP |
| Informational | Best practice recommendation; no direct vulnerability | Advisory | Dependency update, configuration hardening |

---

## 10. Test Schedule

| Activity | Gate | Environment | Owner |
|----------|------|-------------|-------|
| Automated OWASP ZAP scan | Every stage gate | Staging | Security |
| Dependency vulnerability scan | Every PR | CI | DevOps |
| Manual penetration test -- Phase 1 | Gate 3 (MVP) | Staging | Security |
| Manual penetration test -- Phase 2 | Gate 7 (Pre-go-live) | Staging | Security |
| ZATCA security validation | Pre-ZATCA go-live | Staging | Security + Finance |
| RBAC matrix validation | Every sprint | CI | QA |
| Tenant isolation validation | Pre-release | Staging | Security |

---

## 11. Reporting Template

### Finding Report

| Field | Value |
|-------|-------|
| Finding ID | SEC-XXXX |
| Title | |
| Severity | Critical / High / Medium / Low / Info |
| OWASP Category | A01-A10 |
| Affected Component | |
| Description | |
| Steps to Reproduce | |
| Evidence | (screenshots, request/response) |
| Impact | |
| Remediation | |
| Status | Open / In Progress / Resolved / Accepted Risk |
| Assigned To | |
| Resolution Date | |

---

## 12. References

- [Security Requirements](../requirements/non-functional/security.md)
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Domain Reference](../domains.md)
- [UAT Test Scripts](uat-test-scripts.md)
- [Load Testing Plan](load-testing-plan.md)
- [Regression Test Suite](regression-test-suite.md)
- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP Testing Guide v4.2
- ZATCA E-Invoicing Technical Requirements
