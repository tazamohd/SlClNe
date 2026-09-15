**Status:** NORMATIVE · **Owner:** Process architect

# System flows

This file shows what the software actually executes for the operations that matter, as sequence diagrams naming real files and real functions. It is the internal counterpart to `PROCESS_CATALOG.md`: where that file says what the business does, this one says what happens between the click and the row. Every participant is a module that exists, every call is a function or a SQL statement the code issues, and where a stage of the standard pipeline is skipped for a particular operation, the diagram says so rather than drawing it for symmetry.

## The standard request pipeline

Every authenticated request follows the same spine. Individual diagrams below elide the steps they do not change.

| # | Stage | Where |
| --- | --- | --- |
| 1 | Screen calls a repository or screen-level API module | `app/src/data/http/repository.ts`, `app/src/screens/*/api.ts` |
| 2 | `ApiClient.send` attaches the bearer token; on a 401 it refreshes once and replays | `app/src/data/http/client.ts` |
| 3 | helmet, CORS, rate limit — keyed on `orgId:ip` | `server/src/app.ts` |
| 4 | `onRequest` hook verifies the access token unless the path is in `PUBLIC_PATHS` or `isPublicAuthPath` | `server/src/app.ts`, `server/src/security/principal.ts` |
| 5 | `principalFromClaims` builds the `Principal`; `scope` is derived from the role, never read from the token | `server/src/security/principal.ts` |
| 6 | `requirePermission` checks the module and action grant | `server/src/security/permissions.ts` |
| 7 | `requireApproval` and `requireDifferentApprover` where the operation is a decision | `server/src/security/permissions.ts`, `server/src/security/approvals.ts` |
| 8 | Zod parse of the body — **outside** the transaction in every route | the route file |
| 9 | `withTenant` opens the transaction and runs `SET LOCAL app.org_id / branch_id / user_id / scope / customer_id` via `set_config` | `server/src/db/tenant.ts` |
| 10 | Row lock where concurrency matters — `SELECT ... FOR UPDATE` | the route file |
| 11 | `requireSodClear` over the audit trail, where a declared SOD pair applies | `server/src/security/sod.ts` |
| 12 | Rule guard from `packages/contract/src/rules/*` | the rule file |
| 13 | Drizzle read or write under the RLS policies | `server/drizzle/0001_rls.sql`, `server/drizzle/0014_customer_id_link.sql` |
| 14 | `writeAudit` in the same transaction as the change | `server/src/audit/audit.ts` |
| 15 | `presentRow` then `redact` on the way out | `server/src/routes/collections.ts`, `server/src/security/permissions.ts` |
| 16 | Commit, then `onSend` stamps `x-request-id` | `server/src/app.ts` |

Two things about stage 9 are load-bearing. `set_config` is called with `is_local = true`, so the settings live for the transaction and no further. And the mutation and its audit row share that transaction, so there is no state in which a change happened and the record of it did not.

## Login

```mermaid
sequenceDiagram
    autonumber
    participant Screen as Login screen
    participant Auth as app/src/data/auth.ts
    participant Api as AuthApi client
    participant App as server app.ts
    participant Routes as auth/routes.ts
    participant Svc as auth/service.ts
    participant Throttle as login throttle
    participant Plane as withAuthPlane
    participant Sess as auth/sessions.ts
    participant DB as PostgreSQL

    Screen->>Auth: authenticate email password
    Auth->>Api: login
    Api->>App: POST /api/v1/auth/login
    App->>App: helmet, cors, rate limit keyed orgId:ip
    App->>App: onRequest hook skips, path is public auth
    App->>Routes: handler with veryStrictLimit budget
    Routes->>Svc: service.login body facts
    Svc->>Throttle: check email plus ip
    Svc->>Plane: select users by email
    Plane->>DB: cross tenant read, the one query that spans tenants
    DB-->>Svc: candidate rows
    alt more than one organization holds that address
        Svc-->>Routes: AuthFailure invalid_credentials
    end
    Svc->>Svc: verifyPassword against passwordHash
    Svc->>Svc: refuse when status is not active
    Svc->>Svc: needsRehash upgrades the hash under withTenant
    Svc->>Sess: openSession signs access and refresh pair
    Sess->>DB: insert user_sessions row with secret hash
    Svc->>DB: withTenant writeAudit create on session
    Svc-->>Routes: tokens plus user
    Routes-->>Api: 200 accessToken refreshToken expiresIn user
    Api-->>Auth: Session
    Auth->>Auth: store tokens in STORAGE_KEYS
```

The failure paths are deliberately identical in shape: a wrong password, an unknown address and a disabled account all answer `invalid_credentials` or `account_disabled` through `authFailureReply`, and the throttle is failed for each.

## Token refresh with rotation and reuse detection

```mermaid
sequenceDiagram
    autonumber
    participant Client as ApiClient
    participant Routes as auth/routes.ts
    participant Svc as auth/service.ts
    participant Signer as auth/tokens.ts
    participant Tenant as db/tenant.ts
    participant Sess as auth/sessions.ts
    participant DB as PostgreSQL

    Client->>Client: response is 401 mid session
    Client->>Routes: POST /api/v1/auth/refresh with stored refreshToken
    Routes->>Svc: service.refresh token facts
    Svc->>Signer: verifyRefreshToken
    Signer-->>Svc: claims sessionId familyId userId orgId secret
    Svc->>DB: withAuthPlane read users by id and org
    Svc->>Svc: refuse when row missing or status not active
    Svc->>Tenant: withTenant principal derived from the row
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Svc->>Sess: loadSession then judge session against secret hash
    alt verdict is reused
        Svc->>Sess: revokeFamily every session in the family
        Svc->>DB: writeAudit reject on session reason refresh_token_reuse
        Svc-->>Routes: AuthFailure reuse_detected
        Routes-->>Client: 401, sign in again
    else verdict is valid
        Svc->>Signer: signRefreshToken for a new session id in the same family
        Svc->>Sess: createSession then retire the previous one
        Svc->>DB: writeAudit update on session event refresh_rotated
        Svc-->>Routes: rotated pair
        Routes-->>Client: 200 new accessToken and refreshToken
        Client->>Client: replay the original request once with the new token
    end
```

The role on the refresh token is never used. It is re-read from the `users` row every time, so a role change takes effect on the next rotation rather than waiting out an access token's lifetime.

## A generated collection read

This is the path every generated collection endpoint takes — the `GENERATED` rows in `project-control/API_REGISTRY.json`. The example is `GET /api/v1/inventory`.

```mermaid
sequenceDiagram
    autonumber
    participant Screen as Collection screen
    participant Repo as data/http/repository.ts
    participant App as server app.ts
    participant Verify as security/principal.ts
    participant Coll as routes/collections.ts
    participant Perm as security/permissions.ts
    participant Tenant as db/tenant.ts
    participant Query as query.ts
    participant DB as PostgreSQL with RLS

    Screen->>Repo: collection list query
    Repo->>App: GET /api/v1/inventory with bearer token
    App->>Verify: verify bearer token
    Verify->>Verify: principalFromClaims, scope derived from role
    Verify-->>App: Principal
    App->>Coll: registered handler for the inventory collection
    Coll->>Perm: requirePermission principal inventory v
    Perm-->>Coll: granted or 403 forbidden
    Coll->>Coll: parseListQuery for q sort filter page
    Coll->>Perm: includeDeleted additionally requires d
    Coll->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope customer_id
    Coll->>Query: listRows tx def query
    Query->>DB: select from parts where deleted_at is null
    DB->>DB: RLS policies narrow by org, branch and self
    DB-->>Query: rows plus count
    Query-->>Coll: rows and page
    loop per row
        Coll->>Coll: presentRow then redact against FIELD_RULES and GLOBAL_REDACTIONS
    end
    Coll-->>App: rows and page
    App-->>Repo: 200 with x-request-id
```

No audit row is written for a read. The registry marks generated read endpoints `audited: true`, which describes the collection's write side rather than this handler — `GET` calls no `writeAudit`.

## An estimate created

```mermaid
sequenceDiagram
    participant Screen as Estimate builder
    participant Est as routes/estimates.ts
    participant Perm as security/permissions.ts
    participant Money as rules/money.ts
    participant Tenant as db/tenant.ts
    participant Audit as audit/audit.ts
    participant DB as PostgreSQL

    Screen->>Est: POST /api/v1/estimates with lines
    Est->>Perm: requirePermission principal estimates c
    Est->>Est: estimateCreate.safeParse, 400 names the failing path
    Est->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Est->>Money: computeInvoiceTotals over qty and unitPriceHalalas
    Money->>Money: roundHalfUp once at subtotal and once at tax
    Money-->>Est: subtotal tax discount total in halalas
    Est->>DB: select count from estimates for nextEstimateCode
    Est->>DB: insert estimates status draft submittedBy principal
    Est->>DB: insert estimate_lines with sort order
    Est->>Audit: writeAudit create on estimate
    Audit->>DB: insert audit_log in the same transaction
    Est->>Est: presentRow then redact
    Est-->>Screen: 201 with the estimate
```

`VAT_RATE_BPS` is stored in basis points so the rate itself is exact, and every figure above is an integer count of halalas. No client-sent total is read anywhere in this path.

## An estimate approved over OTP

Two requests. The first sends the code, the second records the signature. Neither changes the estimate's status.

```mermaid
sequenceDiagram
    autonumber
    participant Advisor as Advisor screen
    participant Otp as routes/estimate-otp.ts
    participant Perm as security/permissions.ts
    participant Tenant as db/tenant.ts
    participant OtpMod as auth/otp.ts
    participant Transport as auth transport
    participant Audit as audit/audit.ts
    participant DB as PostgreSQL

    Advisor->>Otp: POST /api/v1/estimates/:id/request-approval-otp
    Otp->>Perm: requirePermission principal estimates e
    Otp->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Otp->>DB: loadEstimate by id or code under RLS
    Otp->>DB: customerPhone from the customers row
    Note over Otp: the caller cannot supply a number, so this is not an SMS cannon
    Otp->>OtpMod: issueChallenge sms destination
    OtpMod->>DB: insert otp_challenges with the code hashed at rest
    Otp->>Transport: send channel sms destination code
    alt transport not configured
        Transport-->>Otp: TransportUnavailable
        Otp-->>Advisor: 503 external_dependency_unavailable naming what is missing
    end
    Otp->>Audit: writeAudit command on estimate with the phone masked
    Otp-->>Advisor: 202 challengeId expiresAt masked destination

    Advisor->>Otp: POST /api/v1/estimates/:id/verify-approval-otp with code
    Otp->>Perm: requirePermission principal estimates e
    Otp->>Tenant: withTenant principal
    Otp->>OtpMod: verifyChallenge destination code channel
    alt wrong code
        OtpMod-->>Otp: wrong_code with attemptsLeft
        Otp-->>Advisor: 401 verified false
    else expired or consumed
        OtpMod-->>Otp: expired
        Otp-->>Advisor: 410 verified false
    else verified
        OtpMod->>DB: stamp otp_challenges.verified_at
        Otp->>Audit: writeAudit approve on estimate reason customer_otp_signature
        Otp-->>Advisor: 200 verified true
    end
```

The verified challenge row plus that `approve` audit row are the persisted e-signature. `estimates.status` is untouched — the shop's own decision is the separate `/approve` route below.

## An estimate approved internally

```mermaid
sequenceDiagram
    autonumber
    participant Approver as Approval inbox
    participant Est as routes/estimates.ts
    participant Perm as security/permissions.ts
    participant Appr as security/approvals.ts
    participant Rules as rules/workshop.ts and rules/approvals.ts
    participant Tenant as db/tenant.ts
    participant DB as PostgreSQL

    Approver->>Est: POST /api/v1/estimates/:id/approve
    Est->>Perm: requirePermission principal estimates a
    Est->>Est: estimateApproveBody.safeParse
    Est->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Est->>DB: select estimate for update
    Est->>Est: 409 when already approved or rejected
    Est->>Rules: checkEstimateFresh validUntil
    Rules-->>Est: null or 422 rule_violated
    Est->>Perm: requireApproval principal totalHalalas
    Perm->>Appr: approvalDecision role amount module
    Appr->>Appr: granted module a role, then ceilingHalalas from ROLE_META
    alt no approve grant
        Appr-->>Perm: reason authority
        Perm-->>Est: 403 forbidden
    else above ceiling
        Appr-->>Perm: reason ceiling
        Perm-->>Est: approvalRequired, escalate
    end
    Est->>Perm: requireDifferentApprover principal submittedBy
    Perm->>Rules: checkSelfApproval actorUserId submittedByUserId
    Rules-->>Perm: failure when the raiser is the approver
    Est->>DB: update estimates set status approved where version matches
    Est->>DB: writeAudit approve on estimate
    Est-->>Approver: 200 with the approved estimate
```

The order is deliberate. Ceiling first, then segregation of duties, because the two refusals mean different things: one says escalate, the other says find someone else.

## An invoice issued

```mermaid
sequenceDiagram
    autonumber
    participant Screen as Invoice screen
    participant Inv as routes/invoices.ts
    participant Perm as security/permissions.ts
    participant Tenant as db/tenant.ts
    participant Hash as node crypto sha256
    participant Audit as audit/audit.ts
    participant DB as PostgreSQL

    Screen->>Inv: POST /api/v1/invoices/:id/issue
    Inv->>Perm: requirePermission principal invoices e
    Inv->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Inv->>DB: loadInvoice by id or code
    Inv->>Inv: 409 when already issued or cancelled
    Inv->>Perm: requireApproval principal totalHalalas
    Note over Inv,Perm: the same ceiling the inbox applies, so bypassing the inbox does not bypass the ceiling
    Inv->>DB: previousHash reads hash_self of the last issued invoice
    Inv->>Hash: invoiceHash over previous id code customer total tax
    Hash-->>Inv: hashSelf
    Inv->>Inv: zatcaQr builds the phase two TLV payload base64
    Inv->>DB: update invoices set status unpaid issued_at hash_prev hash_self qr_code where version matches
    Inv->>Audit: writeAudit issue on invoice
    Inv-->>Screen: 200 with the issued invoice
```

No journal entry is written here. NOT IMPLEMENTED — nothing in this path touches `journal_entries` or `chart_of_accounts`, so issuing an invoice does not post a receivable.

## A payment recorded

```mermaid
sequenceDiagram
    autonumber
    participant Screen as Payment screen
    participant Inv as routes/invoices.ts
    participant Perm as security/permissions.ts
    participant Idem as http/idempotency.ts
    participant Money as rules/money.ts
    participant Tenant as db/tenant.ts
    participant DB as PostgreSQL

    Screen->>Inv: POST /api/v1/invoices/:id/payments with Idempotency-Key
    Inv->>Perm: requirePermission principal payments c
    Inv->>Inv: paymentCreate.safeParse
    Inv->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Inv->>Idem: findReplay org key endpoint requestHash
    alt stored result exists
        Idem-->>Inv: the original status and body
        Inv-->>Screen: replayed response, nothing written twice
    end
    Inv->>DB: select invoice for update
    Note over Inv,DB: the lock is what makes two simultaneous payments safe
    Inv->>Money: checkPayment amount balance invoiceStatus
    Money-->>Inv: null, or 422 for overpayment or a cancelled invoice
    Inv->>DB: insert payments row
    Inv->>DB: update invoices paid_halalas and status paid or partial
    Inv->>DB: select count from receipts for nextCode RCP
    Inv->>DB: insert receipts row status cleared
    Inv->>DB: writeAudit pay on invoice
    Inv->>Idem: recordResult status 201 body
    Inv-->>Screen: 201 payment plus updated invoice
```

The same key with a different body answers 409; that is a caller bug, not a replay.

## A purchase order approved

```mermaid
sequenceDiagram
    autonumber
    participant Approver as Procurement screen
    participant Proc as routes/procurement.ts
    participant Perm as security/permissions.ts
    participant Appr as security/approvals.ts
    participant Rules as rules/procurement.ts
    participant Tenant as db/tenant.ts
    participant DB as PostgreSQL

    Approver->>Proc: POST /api/v1/procurement/purchase-orders/:id/approve
    Proc->>Perm: requirePermission principal procurement a
    Proc->>Proc: purchaseOrderApproveBody.safeParse
    Proc->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Proc->>DB: loadPurchaseOrder for update
    Proc->>Rules: checkPurchaseOrderApprovable status
    Rules-->>Proc: 409 unless the order is a draft
    Proc->>Perm: requireApproval principal totalHalalas module procurement
    Perm->>Appr: approvalDecision, ceiling from ROLE_META limitSar times 100
    Proc->>Perm: requireDifferentApprover principal submittedBy
    Proc->>DB: updateRow purchase_orders status approved approvedBy approvedAt
    Proc->>DB: writeAudit approve on purchase_order
    Proc-->>Approver: 200 with the approved order
```

The total checked is the server's own `purchaseOrderTotals` figure, never a client-sent one. `requireSodClear` is **not** called here; the `Raise purchase order` and `Approve purchase order` signatures exist in `server/src/security/sod.ts` and only the `submittedBy` column check fires on this route.

## An inventory movement

```mermaid
sequenceDiagram
    autonumber
    participant Store as Parts screen
    participant Invt as routes/inventory.ts
    participant Perm as security/permissions.ts
    participant Idem as http/idempotency.ts
    participant Sod as security/sod.ts
    participant Rules as rules/inventory.ts
    participant Tenant as db/tenant.ts
    participant DB as PostgreSQL

    Store->>Invt: POST /api/v1/inventory/:id/movement with Idempotency-Key
    Invt->>Perm: requirePermission principal inventory e
    Invt->>Invt: movementCreate.safeParse
    Invt->>Invt: 400 when the Idempotency-Key is missing or malformed
    Invt->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Invt->>Idem: findReplay org key endpoint requestHash
    Invt->>DB: lockPart select for update by id or sku
    alt type is out, adjust or adjust_down
        Invt->>Sod: requireSodClear activity entity part entityId
        Sod->>DB: readHistory over audit_log for this part
        Sod->>Sod: sodViolation activity actor history
        alt conflict found
            Sod->>DB: writeAudit reject on part in a separate transaction
            Sod-->>Invt: 403 forbidden naming the counterpart
        end
    end
    Invt->>Rules: checkMovement type qty onHand reserved backorderable fromReservation
    Rules-->>Invt: null, or 422 on field qty
    Invt->>Rules: movementDelta type qty
    alt type is transfer
        Invt->>DB: resolve toBranchId under RLS, refuse same branch
        Invt->>DB: insert two inventory_movements rows sharing a transferId
        Note over Invt,DB: on_hand net change is zero, the org books conserve
    else any other type
        Invt->>DB: update parts on_hand and reserved
        Invt->>DB: insert one inventory_movements row
    end
    Invt->>DB: writeAudit movement on part
    Invt->>Idem: recordResult status 200 body
    Invt-->>Store: 200 with the updated part
```

The SOD refusal is audited in its own transaction on purpose. The caller's transaction is about to roll back, and an audit row written inside it would roll back with it, losing the one event most worth keeping.

## A job card released through QC

The clearest example of the two-layer SOD control: one check on the record, one over the trail.

```mermaid
sequenceDiagram
    autonumber
    participant Qc as QC screen
    participant Work as routes/workshop.ts
    participant Perm as security/permissions.ts
    participant Rules as rules/workshop.ts and rules/approvals.ts
    participant Sod as security/sod.ts
    participant Tenant as db/tenant.ts
    participant DB as PostgreSQL

    Qc->>Work: POST /api/v1/jobs/:id/transition to delivery
    Work->>Perm: hasPermission jobcards e or jobcards a, else 403 before the body is read
    Work->>Work: jobTransitionBody.safeParse
    Work->>Perm: requirePermission jobcards a because the target is delivery
    Work->>Tenant: withTenant principal
    Tenant->>DB: set_config app.org_id branch_id user_id scope
    Work->>DB: loadJob for update
    Work->>Rules: checkStageTransition from to against JOB_STAGE_TRANSITIONS
    Rules-->>Work: 422 on field to when the gate would be skipped
    Work->>DB: assignedTechUserId resolves technicians.user_id
    Work->>Rules: checkQcIndependence actorUserId performedByUserId
    Rules-->>Work: 403 when the assigned technician is the actor
    Work->>Sod: requireSodClear activity Pass quality check entity job_card
    Sod->>DB: readHistory over audit_log for this job card
    Sod->>Sod: did this actor perform the repair, whoever is assigned now
    Sod-->>Work: 403 plus its own audited reject row when it did
    Work->>DB: update job_cards stage delivery status completed qc_passed_by where version matches
    Work->>DB: writeAudit transition on job_card
    Work-->>Qc: 200 with the released job
```

## Surface

`project-control/API_REGISTRY.json` is the authority for the endpoint surface and carries its own counts in `totals`; every route named in this document and in `PROCESS_CATALOG.md` resolves there, generated collection list and create routes included.
