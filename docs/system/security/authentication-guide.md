# Authentication Guide

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-SEC-002                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

This guide documents every authentication flow in SALIS AUTO: login, token refresh, session management, OTP verification, password handling, and logout. The system uses a dual-token JWT architecture with HS256 signing, backed by a database session table for revocation and theft detection.

## 2. Login Flow

### 2.1 Request

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "..."
}
```

### 2.2 Server-Side Steps

1. Look up user by `(org_id, email)` in the `users` table
2. Verify password against stored bcrypt hash (`bcrypt.compare`)
3. Check user status is `active`
4. Create a new `user_sessions` row:
   - Generate a new `family_id` (ULID)
   - Generate a random 32-byte secret
   - Store `SHA-256(secret)` as `refresh_token_hash`
   - Record `user_agent` and `ip`
   - Set `expires_at` to current time + 30 days
5. Sign an access token (15-minute HS256 JWT):
   - Claims: `sub` (userId), `role`, `org_id`, `branch_id`, `scope`, `name`
   - Issuer: `JWT_ISSUER` (default: `salis-auto`)
   - Audience: `JWT_AUDIENCE` (default: `salis-auto-api`)
6. Sign a refresh token (30-day HS256 JWT):
   - Claims: `sub` (userId), `sid` (sessionId), `fid` (familyId), `org_id`, `branch_id`, `secret`
   - Audience: `JWT_AUDIENCE` + `-refresh` (prevents use as access token)
7. Return both tokens and user profile

### 2.3 Response

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "manager",
    "orgId": "...",
    "branchId": "..."
  }
}
```

### 2.4 Client-Side Handling

1. Store access token in `salis-token` localStorage key
2. Register the token provider with `setAccessTokenProvider()`
3. All subsequent API requests include `Authorization: Bearer <accessToken>`

## 3. Token Refresh Flow

### 3.1 Request

```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

### 3.2 Server-Side Steps

1. Verify JWT signature with `jose.jwtVerify`:
   - Algorithm: HS256
   - Issuer: `JWT_ISSUER`
   - Audience: `JWT_AUDIENCE-refresh` (different from access token)
2. Extract claims: `sid`, `fid`, `sub`, `org_id`, `branch_id`, `secret`
3. Load session row by `sid` (session ID)
4. Verify session is not revoked (`revoked_at IS NULL`)
5. Verify session has not expired (`expires_at > NOW()`)
6. Compute `SHA-256(secret)` and compare with stored `refresh_token_hash`:
   - Uses `timingSafeEqual` for constant-time comparison
   - Prevents timing-based digest recovery
7. Verify `fid` matches session's `family_id`

### 3.3 Theft Detection

If the `fid` (family ID) does not match the session's `family_id`:
- A retired token from a different family is being replayed
- **All sessions in the family are revoked immediately**
- This signals that a token was stolen and used by an attacker

### 3.4 Token Rotation

On successful refresh:
1. Create a new session row with the same `family_id`
2. Mark the old session: set `replaced_by` to the new session ID
3. Sign a new access token (15 minutes)
4. Sign a new refresh token (30 days, new random secret)
5. Return both new tokens

### 3.5 Security Properties

| Property                 | Mechanism                                  |
|--------------------------|--------------------------------------------|
| Token cannot be forged   | HS256 signature verification               |
| Stolen token detected    | Family-based replay detection              |
| Revocation is immediate  | Database session lookup on every refresh   |
| Digest never leaked      | SHA-256 hash stored, not the token         |
| Timing attack prevented  | `timingSafeEqual` comparison               |

## 4. Request Authentication

### 4.1 Bearer Token Extraction

Every non-public request passes through the `onRequest` hook:

1. Extract token from `Authorization: Bearer <token>` header
2. Verify JWT: algorithm (HS256), issuer, audience, expiration
3. Extract claims into a `Principal` object
4. **Derive scope from role, not from the token claim** -- a tampered scope claim cannot widen access
5. Attach `principal` to the request object

### 4.2 Principal Object

```typescript
{
  userId: string        // from JWT sub claim
  orgId: string         // from JWT org_id claim
  branchId: string|null // from JWT branch_id claim
  role: RoleId          // from JWT role claim (one of 14)
  scope: DataScope      // DERIVED from role, not from JWT
  name?: string         // from JWT name claim (optional)
}
```

### 4.3 Scope Derivation

The scope is derived server-side from the role, never trusted from the token:

| Role         | Scope      | Data Visibility                          |
|--------------|------------|------------------------------------------|
| owner        | all        | All data across all branches              |
| superadmin   | platform   | Platform-level administration             |
| manager      | branch     | Data within assigned branch               |
| advisor      | branch     | Data within assigned branch               |
| technician   | own        | Only assigned job cards and appointments  |
| qc           | branch     | Data within assigned branch               |
| parts        | branch     | Data within assigned branch               |
| accountant   | all        | All financial data                        |
| hr           | all        | All HR data                               |
| frontdesk    | branch     | Data within assigned branch               |
| callcenter   | all        | All data (read-focused)                   |
| procurement  | all        | All procurement data                      |
| supplier     | external   | Supplier portal data only                 |
| customer     | self       | Customer portal data only                 |

## 5. OTP Verification

### 5.1 Challenge Creation

1. Generate a random OTP code
2. Compute `SHA-256(code)` and store in `otp_challenges` table:
   - `channel`: `sms` or `email`
   - `destination`: phone number or email address
   - `code_hash`: SHA-256 digest (never plaintext)
   - `expires_at`: current time + configured TTL
   - `attempts`: 0
3. Deliver the plaintext code via the configured transport

### 5.2 Verification

1. Look up active challenge by destination
2. Increment `attempts` counter
3. Check attempt limit (prevent brute force)
4. Check expiration (`expires_at > NOW()`)
5. Compare `SHA-256(submitted_code)` with stored `code_hash`
6. On success: set `verified_at` timestamp

### 5.3 Transport Safety

The OTP transport defaults to **refusing** delivery in development and test environments. This prevents accidental sends to real phone numbers or email addresses. The test suite overrides it with a mock transport.

## 6. Password Security

### 6.1 Storage

Passwords are hashed with bcrypt before storage in the `password_hash` column. The plaintext password is never:
- Stored in the database
- Written to the audit log (scrubbed by `REDACTED_KEYS`)
- Written to application logs (redacted by logger configuration)
- Returned in any API response

### 6.2 Comparison

Login uses `bcrypt.compare(submittedPassword, storedHash)`. This is a constant-time operation built into bcrypt, so it does not leak password information through timing.

## 7. Session Management

### 7.1 Session Table Columns

| Column              | Purpose                                    |
|---------------------|--------------------------------------------|
| `user_id`           | Session owner                              |
| `refresh_token_hash`| SHA-256 of current refresh secret           |
| `family_id`         | Groups rotated tokens for theft detection   |
| `user_agent`        | Browser/client identifier                   |
| `ip`                | Client IP (for audit)                       |
| `expires_at`        | Hard expiration                             |
| `revoked_at`        | Revocation timestamp                        |
| `replaced_by`       | Successor session after rotation            |

### 7.2 Session Lifecycle

```
Created (login)
  -> Active (refresh rotates to new session)
    -> Replaced (old session, replaced_by set)
    -> Revoked (logout or theft detection)
  -> Expired (expires_at passed)
```

### 7.3 Data Scope

Sessions are scoped to the user through the `OWNED_TABLES` mapping: `user_sessions` uses `user_id` as the ownership column, so under the `self` scope a user can only see their own sessions.

## 8. Logout

### 8.1 Server-Side

Logout sets `revoked_at` on the user's active session. This prevents the refresh token from being used again. The access token remains valid until its 15-minute expiry (it is not revocable by design).

### 8.2 Client-Side

1. Call the logout endpoint
2. Clear `salis-token` from localStorage
3. Clear `salis-role` from localStorage
4. Redirect to the login screen

## 9. Demo and Mock Mode

When `VITE_API_URL` is unset, the frontend operates in mock mode:

- Authentication is simulated through `salis-role` in localStorage
- All 14 roles have demo credentials defined in `ROLES` data
- No JWT is issued or verified
- The `SessionProvider` reads the role directly from localStorage
- This mode is for development and demonstration only

## 10. Public Paths

These endpoints skip authentication entirely:

| Path                         | Purpose                         |
|------------------------------|---------------------------------|
| `/health`                    | Liveness probe                  |
| `/ready`                     | Readiness probe                 |
| `/api/v1/public/leads`       | Unauthenticated lead intake     |
| `/api/v1/auth/login`         | Login                           |
| `/api/v1/auth/register`      | Registration                    |
| `/api/v1/auth/refresh`       | Token refresh                   |

All other routes are authenticated by default. A new route added to the application is automatically protected unless explicitly listed as public.

## Related Documents

- [Auth Architecture](../architecture/auth-architecture.md)
- [Security Architecture](./security-architecture.md)
- [Authorization Matrix](./authorization-matrix.md)
- [Data Protection](./data-protection.md)
