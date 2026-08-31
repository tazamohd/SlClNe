# Common Issues & Solutions

This document covers the top 20 user-reported issues in SALIS AUTO with step-by-step resolution guidance. Each issue includes symptoms, root cause, and fix.

---

## 1. Login Failures — Wrong Credentials

**Symptom:** "Email or password is incorrect" error on the login screen.

**Root Cause:** The server returns `401 invalid_credentials` for both unknown emails and wrong passwords (identical response to prevent account enumeration).

**Resolution:**
1. Verify the email address is correct and matches the account exactly.
2. Check that Caps Lock is not enabled — passwords are case-sensitive.
3. For demo accounts, the default password is the value of the `DEMO_PASSWORD` environment variable (default: `salis1234`).
4. If the user has forgotten their password, navigate to `/forgot-password` to initiate a reset.
5. Confirm the user exists in the organization by asking an admin to check `/admin/users`.

---

## 2. Login Failures — Expired Access Token

**Symptom:** API requests return `401 unauthorized` after approximately 15 minutes of use.

**Root Cause:** The access token has a default TTL of 900 seconds (15 minutes), controlled by `ACCESS_TOKEN_TTL`. When it expires, all subsequent requests fail.

**Resolution:**
1. The application should automatically call `POST /auth/refresh` with the refresh token.
2. If automatic refresh fails, the user is redirected to `/login`.
3. If persistent, clear `salis-token` from localStorage and log in again.
4. Refresh tokens last 14 days by default (`REFRESH_TOKEN_TTL` = 1,209,600 seconds). If the user has been inactive longer than 14 days, they must log in again.

---

## 3. Login Failures — Account Locked or Inactive

**Symptom:** User cannot log in despite correct credentials.

**Root Cause:** The user's `status` field in the `users` table may be set to a value other than `active`.

**Resolution:**
1. An admin (Owner, Super Admin, or HR Manager with `admin` module access) should navigate to `/admin/users`.
2. Search for the affected user.
3. Check the user's status and reactivate if needed.
4. Verify the user's `org_id` and `branch_id` are correct.

---

## 4. Screen Not Visible in Navigation

**Symptom:** A user reports that a menu item or screen is missing from their sidebar.

**Root Cause:** The sidebar is role-filtered. The `SCREEN_MODULE` mapping determines which RBAC module each screen belongs to, and `PERMS` determines which roles have `v` (View) access.

**Resolution:**
1. Identify the screen's RBAC module from the [Screen Catalog](../reference/screen-catalog.md).
2. Check the [RBAC Matrix](../reference/rbac-matrix.md) to confirm the user's role has `v` access to that module.
3. If the role lacks access, an admin must either:
   - Change the user's role to one that has access, or
   - Acknowledge the restriction is intentional.
4. Note: Some screens are `RBAC_UNGATED` (e.g., design reference screens) and are visible to all authenticated users.

---

## 5. Data Not Loading — API Connection Issues

**Symptom:** Screens show empty states, infinite loading spinners, or "Failed to fetch" errors.

**Root Cause:** The frontend cannot reach the API server.

**Resolution:**
1. Verify `VITE_API_BASE_URL` is set correctly in the frontend environment (e.g., `http://localhost:4000`).
2. Check that the server is running on the expected `PORT` (default: 4000).
3. Verify CORS configuration: `CORS_ORIGIN` must include the frontend's origin.
4. If `VITE_API_BASE_URL` is not set, the app may fall back to mock mode (local fixtures from `generated/tables.ts`). This is a valid development mode but will not persist data.
5. Check browser DevTools Network tab for specific error codes.

---

## 6. Data Not Loading — Mock Mode Active

**Symptom:** Data appears but does not persist across page reloads; data seems pre-populated with sample records.

**Root Cause:** The repository seam is using `fixtureRepository` (mock data from `generated/tables.ts`) instead of `httpRepository`.

**Resolution:**
1. Set `VITE_API_BASE_URL` to your server URL (e.g., `http://localhost:4000`).
2. Rebuild the frontend: `npm run build` or restart the dev server.
3. Verify the environment variable is loaded (check browser console for the value).
4. When the variable is set, the repository seam selects `httpRepository`, which makes real API calls.

---

## 7. Approval Stuck — Amount Exceeds Limit

**Symptom:** An estimate, purchase order, or expense cannot be approved; the approve button may be disabled or shows a ceiling warning.

**Root Cause:** The approval amount exceeds the user's SAR ceiling.

**Resolution:**
1. Check the user's role and its approval ceiling:
   - Owner/CEO: Unlimited
   - Branch Manager: SAR 50,000
   - Accountant: SAR 25,000
   - Procurement Agent: SAR 20,000
   - HR Manager: SAR 15,000
   - Storekeeper: SAR 10,000
   - Service Advisor: SAR 5,000
   - All others: SAR 0 (cannot approve)
2. If the amount exceeds the ceiling, the approval must escalate to a user with a higher ceiling.
3. The `canApprove()` function checks this. The screen displays the ceiling in advance.

---

## 8. Approval Stuck — No Approver Configured

**Symptom:** An item sits in "pending approval" status with no one able to act on it.

**Root Cause:** No user in the organization has a role with both the `a` (Approve) action on the relevant module and a ceiling high enough for the amount.

**Resolution:**
1. Check the RBAC matrix for which roles have `a` on the module (e.g., `estimates`, `procurement`, `approvals`).
2. Ensure at least one user holds such a role.
3. If needed, assign the Owner/CEO role (unlimited ceiling) to an appropriate user.

---

## 9. Mobile Layout Issues

**Symptom:** Tables overflow, text is cut off, or layout appears broken on mobile devices.

**Root Cause:** The screen may be missing a `mobileCard` renderer, or the breakpoint (860px) is not triggering correctly.

**Resolution:**
1. The mobile breakpoint is 860px. Below this, `DataTable` switches to `MobileList` if a `mobileCard` prop is provided.
2. If a `mobileCard` renderer is not defined for a table, the desktop `<table>` renders on mobile, which can overflow.
3. Check that the viewport meta tag is set: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
4. Verify CSS logical properties are used for RTL compatibility (`ps-`, `pe-`, `start-`, `end-`).

---

## 10. Language/RTL Not Switching

**Symptom:** Clicking the language toggle (English/Arabic) does not change the interface direction or language.

**Root Cause:** The `salis-lang` localStorage key may be stuck, or the `PreferencesProvider` may not be re-rendering.

**Resolution:**
1. Clear `salis-lang` from localStorage and reload the page.
2. Verify the language toggle is calling `toggleLanguage()` from `usePreferences()`.
3. The toggle should set `dir="rtl"` on `<html>` for Arabic and `dir="ltr"` for English.
4. Check that CSS uses logical properties (not physical `left`/`right`/`margin-left`).
5. The Arabic translations are sourced from `generated/ar.ts` (2,122 keys).

---

## 11. Dark Mode Problems

**Symptom:** Colors appear wrong, elements are invisible, or the theme does not toggle.

**Root Cause:** Dark mode is the default theme. The toggle adds/removes the `dark` class on `<html>`.

**Resolution:**
1. Check `salis-theme` in localStorage (values: `dark` or `light`).
2. Clear it and reload to reset to default (dark).
3. Verify the `toggleTheme()` function from `usePreferences()` is being called.
4. Ensure Tailwind `dark:` variants are used for all color values in components.

---

## 12. Search Not Finding Results

**Symptom:** Using the search bar returns no results even though the data exists.

**Root Cause:** Search uses `ILIKE %q%` on designated searchable columns only, not all columns.

**Resolution:**
1. Check which columns are searchable for the collection. For example:
   - `/jobs`: searchable on id, customer name, vehicle label
   - `/customers`: searchable on name, phone
   - `/inventory`: searchable on name, SKU
2. Ensure the search term matches content in a searchable column.
3. The `q` parameter is limited to 200 characters.
4. Search is case-insensitive but must match a substring.

---

## 13. Pagination Issues

**Symptom:** Clicking next/previous page does not work, or page numbers seem wrong.

**Root Cause:** Pagination parameters may be misconfigured.

**Resolution:**
1. Verify `page` starts at 1 (not 0).
2. `pageSize` must be between 1 and 200 (default: 50).
3. The `TableFooter` component manages pagination state. Ensure it receives the correct total count.
4. Check that the API response length matches expectations.

---

## 14. Permission Denied Errors

**Symptom:** `403 Forbidden` error when accessing a screen or performing an action.

**Root Cause:** The user's role lacks the required permission action on the relevant module.

**Resolution:**
1. Identify the module and action from the error context (e.g., attempting to edit an invoice requires `invoices:e`).
2. Check the [RBAC Matrix](../reference/rbac-matrix.md) for the user's role.
3. Contact an admin to adjust the user's role if the access is needed.
4. Note: Data scope also matters — a branch-scoped user cannot access another branch's data.

---

## 15. Invoice ZATCA Validation Failures

**Symptom:** Invoice cannot be issued or shows ZATCA compliance errors.

**Root Cause:** Missing required ZATCA Phase 2 fields.

**Resolution:**
1. Verify the organization has a `vatNumber` configured.
2. Check that `sellerVatNumber` is populated on the invoice.
3. For B2B invoices, ensure `buyerVatNumber` is provided.
4. Verify the hash chain: `hashPrev` must reference the previous invoice's `hashSelf`.
5. The QR code is generated from ZATCA-compliant fields. Missing fields prevent generation.
6. See [Integration Issues](./integration-issues.md) for detailed ZATCA troubleshooting.

---

## 16. Parts Out of Stock

**Symptom:** A part shows zero or negative `on_hand` quantity; orders cannot be fulfilled.

**Root Cause:** Stock has been depleted below the reorder level without a restock.

**Resolution:**
1. Navigate to `/inventory` and search for the part by name or SKU.
2. Check `on_hand` vs `reorder_level` — if `on_hand` is at or below `reorder_level`, a reorder alert should trigger.
3. If the part is `backorderable`, the job card can still proceed; otherwise, stock must be received first.
4. Create a purchase requisition at the appropriate route to initiate restock.
5. Check `inventory_movements` for the part to trace where stock was consumed.

---

## 17. Job Card Stuck in Stage

**Symptom:** A job card cannot be advanced to the next workflow stage.

**Root Cause:** Stage transitions follow a strict linear flow: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery. Gates cannot be skipped.

**Resolution:**
1. Identify the current stage of the job card.
2. Verify all prerequisites for the current stage are complete:
   - **Inspection**: All checklist items must be completed before submitting.
   - **Estimate**: Must be approved before repair can begin.
   - **Quality Check**: Repair must be marked complete. The QC inspector cannot be the same technician who performed the repair (segregation of duties).
   - **Delivery**: QC must pass before delivery.
3. Check if an approval is pending (amount may exceed ceiling).
4. Review the `WorkflowStepper` component to see which stage is current.

---

## 18. Estimate Approval Timeout

**Symptom:** An estimate has been pending approval for an extended period.

**Root Cause:** No user with a sufficient approval ceiling has reviewed the estimate, or the `validUntil` date has passed.

**Resolution:**
1. Check the estimate's `status` — it should be in a submitted state.
2. Verify `submittedBy` is set and differs from the expected approver (segregation of duties: submitter cannot approve).
3. Check `validUntil` — if expired, the estimate may need to be resubmitted.
4. Ensure at least one user with `estimates:a` and adequate ceiling is available.

---

## 19. Report Not Generating

**Symptom:** A report screen shows no data or fails to render charts.

**Root Cause:** The user may lack `reports:v` access, or the date range/filter combination returns no matching records.

**Resolution:**
1. Verify the user's role has `v` on the `reports` module (only certain roles do).
2. For executive reports (`execreports`), only Owner, Super Admin, Branch Manager, and Accountant have access.
3. Broaden the date range filter.
4. Check that data exists in the relevant tables for the selected branch.
5. For CSV export, note the 50,000-row limit.

---

## 20. Slow Performance

**Symptom:** Pages take a long time to load, interactions feel sluggish.

**Root Cause:** Multiple potential causes including large datasets, unoptimized queries, or excessive client-side rendering.

**Resolution:**
1. Check the Network tab in DevTools for slow API responses (target: under 200ms).
2. Verify database indexes exist on `org_id` and commonly filtered columns.
3. Reduce `pageSize` if loading large lists (default 50; try 20).
4. Enable code splitting and lazy routes for the frontend bundle.
5. Check React Query's `staleTime` configuration — overly short values cause excessive re-fetching.
6. For mobile, ensure `mobileCard` renderers are used to reduce DOM node count.
7. See [Performance Issues](./performance-issues.md) for detailed performance tuning guidance.

---

## Quick Reference: Common Error Codes

| Error | HTTP Status | Likely Cause |
|-------|-------------|--------------|
| `invalid_credentials` | 401 | Wrong email or password |
| `unauthorized` | 401 | Missing or expired token |
| `forbidden` | 403 | Role lacks permission |
| `not_found` | 404 | Record deleted or wrong ID |
| `bad_request` | 400 | Malformed request body |
| `validation_error` | 422 | Field value fails Zod schema |

See [Error Codes Reference](./error-codes.md) for the complete error catalog.
