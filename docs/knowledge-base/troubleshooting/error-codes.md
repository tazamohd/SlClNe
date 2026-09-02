# API Error Code Reference

Complete reference for all API error codes returned by the SALIS AUTO server. Every error follows the standard envelope format. This document provides resolution steps for each code.

---

## Error Envelope Format

All API errors return this JSON structure:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "field": "string (optional)"
  }
}
```

- `code` — Machine-readable error identifier (see tables below).
- `message` — Human-readable description of the error.
- `field` — Present when a specific request field caused the error. Included on both `400` and `422` responses where one field is to blame.

---

## HTTP 400 — Bad Request

**Code:** `bad_request`

The request body does not match the expected schema. The server could not even form a domain question from the request.

### Common Causes

| Cause | Example | Resolution |
|-------|---------|------------|
| Missing required field | `POST /jobs` without `customerName` | Add the missing field. Check the `field` value in the response. |
| Unknown field present | Sending `customername` instead of `customerName` | Fix the field name to match the API schema (camelCase). |
| Wrong value type | Sending `"qty": "five"` instead of `"qty": 5` | Use the correct JSON type (string, number, boolean). |
| Value outside enum | `"status": "open"` when valid values are `draft`, `pending`, `approved` | Check the allowed enum values for the field. |
| Malformed JSON | Unquoted keys, trailing commas | Validate JSON syntax before sending. |
| Missing `Idempotency-Key` header | Write operations that require idempotency | Add the `Idempotency-Key` header with a unique value (up to 128 characters). |
| Invalid query parameter | `pageSize=500` (max is 200) | Use `pageSize` between 1 and 200. |
| `q` parameter too long | Search string exceeds 200 characters | Shorten the search query. |

### Example Response

```json
{
  "error": {
    "code": "bad_request",
    "message": "Missing required field",
    "field": "customerName"
  }
}
```

### Resolution Steps

1. Read the `field` value to identify which field caused the error.
2. Check the request body against the API schema for that endpoint.
3. Verify all required fields are present with correct types.
4. Validate JSON syntax.

---

## HTTP 401 — Unauthorized

### Code: `unauthorized`

The request lacks valid authentication credentials.

| Cause | Resolution |
|-------|------------|
| No `Authorization` header | Add `Authorization: Bearer <accessToken>` to the request. |
| Malformed header | Ensure format is exactly `Bearer <token>` with a single space. |
| Expired access token | Call `POST /auth/refresh` with the refresh token to obtain a new access token. Default TTL is 900 seconds (15 minutes). |
| Invalid/corrupted token | Log out and log back in to obtain fresh tokens. |
| Token signed with wrong secret | Verify `JWT_SECRET` matches between the token issuer and the server. |

### Code: `invalid_credentials`

Authentication failed during login.

| Cause | Resolution |
|-------|------------|
| Wrong password | Verify the password. For demo accounts, the default is `salis1234`. |
| Unknown email | Verify the email address exists in the system. |
| Account inactive | Contact an admin to check the user's `status` in `/admin/users`. |

**Important:** The response is identical for unknown email and wrong password. This is by design to prevent account enumeration attacks. The message is always: "Email or password is incorrect."

### Example Response

```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Email or password is incorrect"
  }
}
```

### Resolution Steps

1. Verify the email address and password.
2. Try the demo password if using a seeded account.
3. If the user cannot remember their password, use the forgot-password flow at `/forgot-password`.
4. If the user's account may be deactivated, ask an admin to verify status.

---

## HTTP 403 — Forbidden

**Code:** `forbidden`

The authenticated user's role does not have the required permission for this operation.

| Cause | Resolution |
|-------|------------|
| Role lacks module access | Check [RBAC Matrix](../reference/rbac-matrix.md). The user's role may not have the required action (`v`, `c`, `e`, `x`, or `a`) on the module. |
| Insufficient data scope | A branch-scoped user cannot access records from another branch. An `own`-scoped user sees only records assigned to them. |
| Approval ceiling exceeded | The amount exceeds the user's SAR approval limit. Escalate to a higher-authority role. |
| Segregation of duties violation | The same user cannot both submit and approve. A different user must approve. |

### Example Response

```json
{
  "error": {
    "code": "forbidden",
    "message": "Your role does not have permission to approve estimates"
  }
}
```

### Resolution Steps

1. Identify the module and action from the error context.
2. Look up the user's role in the RBAC permission matrix.
3. If the user needs access, an admin can change their role.
4. For approval issues, check the user's ceiling and segregation of duties constraints.

---

## HTTP 404 — Not Found

**Code:** `not_found`

The requested resource does not exist or is not accessible to this user.

| Cause | Resolution |
|-------|------------|
| Wrong resource ID | Verify the ULID (26-character string) is correct. |
| Resource soft-deleted | The record has a non-null `deleted_at` timestamp and is excluded from queries. |
| Wrong organization | The resource belongs to a different `org_id`. Cross-tenant reads return 404 (never 403, to avoid confirming existence). |
| Wrong branch scope | A branch-scoped user may get 404 for records belonging to another branch. |

### Example Response

```json
{
  "error": {
    "code": "not_found",
    "message": "Resource not found"
  }
}
```

### Resolution Steps

1. Verify the resource ID is correct.
2. Check if the resource was recently deleted.
3. Ensure the requesting user belongs to the same organization as the resource.
4. For branch-scoped users, verify the resource belongs to their branch.

---

## HTTP 409 — Conflict

**Code:** `conflict`

The resource is in a state that refuses the requested operation.

| Cause | Resolution |
|-------|------------|
| Stale version (optimistic concurrency) | Re-read the resource to get the current `version`, then retry with the updated version. |
| Invalid state transition | E.g., issuing an already-issued invoice, or reopening a posted payroll period. |
| Duplicate idempotency key with different body | The same `Idempotency-Key` was sent with a different request body. Use a new key for different requests. |

### Example Response

```json
{
  "error": {
    "code": "conflict",
    "message": "Invoice is already issued"
  }
}
```

### Resolution Steps

1. Re-read the resource to see its current state.
2. Verify the state transition is valid for the resource's current status.
3. If using idempotency keys, ensure the same key is only reused with the identical request body.

---

## HTTP 422 — Validation / Rule Violated

### Code: `rule_violated`

The request was syntactically valid (passed schema validation) but was refused by a domain rule.

| Cause | Example | Resolution |
|-------|---------|------------|
| Cross-org transfer | Transfer to a branch outside the user's organization | Verify the `toBranchId` belongs to the same `org_id`. |
| Negative stock | Issue more stock than available for a non-backorderable part | Check `on_hand` before issuing. |
| Invalid stage transition | Advancing a job card from check-in directly to repair (skipping inspection) | Follow the stage sequence: Check-In, Inspection, Estimate, Repair, QC, Delivery. |
| Self-approval | Submitter attempting to approve their own estimate | A different user must approve (segregation of duties). |

### Code: `validation_failed`

Same class as `rule_violated`. Used where a domain refusal is better described as a validation failure.

### Example Response

```json
{
  "error": {
    "code": "rule_violated",
    "message": "Transfer target branch does not belong to this organization",
    "field": "toBranchId"
  }
}
```

### Resolution Steps

1. Read the `message` and `field` for specifics.
2. Review the domain rules in the [Business Rules documentation](../../MASTER_BUSINESS_RULES.md).
3. Adjust the request to comply with the rule.

### Distinguishing 400 vs 422

The line between 400 and 422 is whether the server could form a domain question:

```
POST /parts/:id/movements
{ "type": "transfer", "qty": 2 }
  --> 400 bad_request, field: toBranchId  (missing required field)

POST /parts/:id/movements
{ "type": "transfer", "qty": 2, "toBranchId": "<other org's branch>" }
  --> 422 rule_violated, field: toBranchId  (valid request, refused by rule)
```

---

## Network Errors (Client-Side)

These errors are not returned by the server but occur at the network level.

### CORS Errors

**Symptom:** `Access to fetch has been blocked by CORS policy` in the browser console.

**Resolution:**
1. Verify `CORS_ORIGIN` on the server includes the frontend's origin.
2. For local development, ensure the origins match exactly (including port).
3. A comma-separated list is supported (e.g., `http://localhost:5173,http://localhost:3000`).
4. Using `*` allows all origins but is not recommended for production.

### Timeout Errors

**Symptom:** Request hangs and eventually times out.

**Resolution:**
1. Check server health: `GET /health` should return `{ status: "ok" }`.
2. Review database connection: verify `DATABASE_URL` is correct and the database is reachable.
3. For large data exports, the 50,000-row limit may cause timeouts. Reduce the scope.
4. Check database connection pooling configuration.

### Connection Refused

**Symptom:** `ERR_CONNECTION_REFUSED` in the browser.

**Resolution:**
1. Verify the server is running on the expected port.
2. Check `VITE_API_BASE_URL` in the frontend configuration.
3. For containerized deployments, ensure the port is correctly mapped.

---

## Error Code Quick Reference

| HTTP | Code | Meaning | Common Fix |
|------|------|---------|------------|
| 400 | `bad_request` | Schema mismatch | Fix request body |
| 401 | `unauthorized` | Missing/invalid token | Re-authenticate |
| 401 | `invalid_credentials` | Wrong email/password | Verify credentials |
| 403 | `forbidden` | Insufficient permissions | Check RBAC matrix |
| 404 | `not_found` | Resource missing | Verify resource ID and org |
| 409 | `conflict` | State conflict | Re-read and retry |
| 422 | `rule_violated` | Domain rule refusal | Comply with business rule |
| 422 | `validation_failed` | Validation refusal | Fix field value |

---

## See Also

- [Common Issues](./common-issues.md) — User-facing issue resolution
- [RBAC Matrix](../reference/rbac-matrix.md) — Permission lookup
- [API Cookbook](../reference/api-cookbook.md) — Correct API usage patterns
