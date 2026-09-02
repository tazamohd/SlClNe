# Frequently Asked Questions

Organized by audience: General, Workshop Staff, Finance, Admin, Technical, and Customer.

---

## General

### What is SALIS AUTO?

SALIS AUTO is a multi-tenant automotive workshop management platform built for Saudi Arabia. It covers the full lifecycle of vehicle service — from appointment booking through check-in, inspection, estimation, repair, quality control, delivery, invoicing, and payment collection. It supports 14 user roles, 28 RBAC modules, and 191+ screens across 13 domains, with bilingual English/Arabic support, RTL layout, and ZATCA e-invoicing compliance.

### How do I log in?

1. Navigate to `/login`.
2. Enter your email address and password.
3. For demo accounts, the default password is `salis1234` (configurable via the `DEMO_PASSWORD` environment variable).
4. After login, you are redirected to the default route for your role (e.g., `/dashboard` for a Branch Manager).

### How do I switch between English and Arabic?

Click the language toggle at the bottom of the sidebar. It switches between "English" and "عربي". The toggle:
- Changes all interface text using 2,122 Arabic translation keys.
- Switches the layout direction from LTR to RTL.
- Stores the preference in `salis-lang` localStorage key.
- Persists across page reloads.

### How do I switch between dark and light mode?

Click the theme toggle icon in the Topbar (desktop) or MobileHeader (mobile). Dark mode is the default. The preference is stored in the `salis-theme` localStorage key.

### What browsers are supported?

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ (Chromium-based) |

The platform is a Single Page Application (SPA) built with React 18 and requires JavaScript enabled.

### What is the mobile breakpoint?

860px. Below this width, the sidebar becomes an overlay drawer, DataTable switches to mobile card layout, and the Topbar is replaced by MobileHeader.

---

## Workshop Staff

### How do I create a job card?

1. Navigate to **Operations > Job Cards** (`/jobcards`).
2. Click **New Job Card**.
3. Fill in the customer name, vehicle, service type, and priority.
4. Save to create the job card. It starts in the "Check-In" stage with "pending" status.
5. The system assigns a unique code (e.g., `A3F8B2C1`).

### How do I advance a job to the next stage?

Job cards progress through six stages in order:

**Check-In -> Inspection -> Estimate -> Repair -> Quality Check -> Delivery**

Each stage has gate conditions:
1. **Check-In to Inspection**: Submit the check-in form.
2. **Inspection to Estimate**: Complete all checklist items.
3. **Estimate to Repair**: Get the estimate approved by someone other than the submitter.
4. **Repair to QC**: Mark repair as complete.
5. **QC to Delivery**: QC inspector (who is not the repairing technician) passes all checks.

Stages cannot be skipped or reversed.

### Why can't I approve this estimate?

Possible reasons:
1. **Your role lacks the `a` (Approve) action** on the `estimates` module. Check the [RBAC Matrix](./rbac-matrix.md).
2. **The amount exceeds your approval ceiling.** Each role has a SAR ceiling (e.g., Service Advisor: SAR 5,000, Branch Manager: SAR 50,000). Amounts above your ceiling must be escalated.
3. **You submitted the estimate.** The submitter cannot approve their own estimate (segregation of duties). A different user must approve.
4. **The estimate has expired.** Check the `validUntil` date.

### Why can't I pass QC on this job?

The QC inspector must be a different person from the technician who performed the repair. This is the "Perform Repair / Pass Quality Check" segregation of duties rule. The system compares `assigned_tech_id` with the current user's ID.

### How do I assign a technician to a job card?

1. Open the job card detail.
2. Select a technician from the assignment dropdown. The list shows technicians at your branch.
3. Save. The `assigned_tech_id` is set, and the technician sees the job in their `assigned` scope.

---

## Finance

### How is VAT calculated?

Saudi VAT is 15%. The calculation:
- `taxHalalas = subtotalHalalas * 0.15`
- `totalHalalas = subtotalHalalas + taxHalalas - discountHalalas`
- All amounts are stored as integer halalas (1 SAR = 100 halalas).
- Tax is computed at the invoice level, never per line item.

### What is ZATCA compliance?

ZATCA (Zakat, Tax and Customs Authority) requires Phase 2 e-invoicing for Saudi businesses. SALIS AUTO stores the required fields on every invoice:
- `sellerVatNumber` — Your organization's VAT number
- `buyerVatNumber` — The customer's VAT number (for B2B invoices)
- `qrCode` — TLV-encoded QR code containing seller name, VAT number, timestamp, total, and VAT amount
- `hashSelf` — SHA-256 hash of this invoice
- `hashPrev` — SHA-256 hash of the previous invoice (cryptographic chain)

### How do I create an invoice?

1. Navigate to **Finance > Invoices** (`/invoices`).
2. Click **Create Invoice** (requires `invoices:c` permission).
3. Select the customer and optionally link to a job card.
4. Add line items (parts and labor) with quantities and unit prices.
5. The system calculates subtotal, VAT (15%), and total automatically.
6. Set the due date.
7. Save as draft or issue immediately.

### How do I record a payment?

1. Navigate to **Finance > Payments** (`/payments`).
2. Click **Record Payment**.
3. Select the invoice, payment method (card, cash, transfer), amount, and date.
4. The payment updates `invoices.paidHalalas` (server-maintained, never client-supplied).

### Why are amounts displayed differently than stored?

All money is stored as integer halalas in the database. The `Money` component divides by 100 for display. For example, `150000` halalas displays as `SAR 1,500.00`. This prevents floating-point rounding errors in financial calculations.

---

## Administration

### How do I add a new user?

1. Navigate to **Administration > Users & Teams** (`/admin/users`).
2. Click **Add User**.
3. Enter name, email, password, role (from 14 options), and branch (for branch-scoped roles).
4. Save. The user can immediately log in.

See [Manage Users & Roles](../how-to/manage-users-roles.md) for detailed steps.

### How do I configure permissions?

Permissions are role-based, not individually assigned. To change a user's permissions:
1. Change their role to one that has the desired permissions.
2. Refer to the [RBAC Matrix](./rbac-matrix.md) for what each role can do.
3. Custom role creation with per-module permission assignment is available at `/admin/roles`.

### How do I add a branch?

1. Navigate to **Administration > Branches** (`/admin/branches`).
2. Click **Add Branch**.
3. Enter the branch name (English and Arabic), city, and whether it is the main branch.
4. Save.

See [Configure Branches](../how-to/configure-branches.md) for detailed steps.

### How do I view the audit log?

1. Navigate to **Administration > Audit Log** (`/admin/audit`).
2. The audit log shows all data changes with: who (actor), what (entity and action), when (timestamp), and the before/after state.
3. The audit log is append-only — database triggers prevent UPDATE and DELETE on `audit_log`.

### How do I export data?

1. Navigate to any list screen (jobs, invoices, customers, etc.).
2. Click the **Export** button.
3. Data downloads as CSV.
4. Limit: 50,000 rows per export. Use filters to narrow the scope for larger datasets.

---

## Technical

### What is PGlite?

PGlite is a lightweight, in-process PostgreSQL-compatible database. When the `DATABASE_URL` environment variable is not set, SALIS AUTO uses PGlite for zero-setup local development. Data stored in PGlite does not persist across server restarts in this configuration.

### How does mock vs HTTP mode work?

The application has a "repository seam" that abstracts data access:

| Mode | Condition | Data Source | Persistence |
|------|-----------|-------------|-------------|
| Mock | `VITE_API_BASE_URL` not set | `fixtureRepository` (generated/tables.ts) | No |
| HTTP | `VITE_API_BASE_URL` set | `httpRepository` (real API) | Yes |

Both implementations satisfy the same `Collection<T>` interface, so screens work identically in both modes. Mock mode is useful for UI development without a running server.

### How do I run database migrations?

Migrations are managed by Drizzle ORM:

```bash
# Generate a migration from schema changes
npx drizzle-kit generate

# Apply pending migrations
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push
```

### What is a ULID?

A Universally Unique Lexicographically Sortable Identifier. It is a 26-character string that serves as the primary key (`id`) for all records. ULIDs are:
- Globally unique (no collisions)
- Time-ordered (lexicographic sort = chronological sort)
- URL-safe (only alphanumeric characters)
- Stored as `varchar(26)`, not `char(26)` (to avoid blank-padding comparison issues)

### How does the RBAC engine work?

Authorization follows this chain:
1. `RequireAccess` component wraps protected routes.
2. It calls `SessionProvider.canScreen(screenId)` which looks up the screen's module via `SCREEN_MODULE`.
3. It then checks `PERMS[role][module]` for the required action.
4. The `can(module, action)` function performs the actual permission check.
5. `canApprove(module, amountSar)` additionally checks the role's approval ceiling.

This is a client-side convenience. The server independently enforces permissions via `requireAuth` and `requireModule` middleware.

---

## Customer

### How do I track my service?

1. Open the SALIS AUTO Customer App.
2. Navigate to the **Tracking** tab (radio icon).
3. Your active service shows the current stage with a progress indicator.
4. Stages visible: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery.

### How do I approve an estimate?

1. You will receive a notification (SMS, WhatsApp, or in-app) when an estimate is ready.
2. Open the estimate link or navigate to the Customer App.
3. Review the line items and total.
4. Tap **Approve** to authorize the repair work, or **Decline** with a reason.

### How do I book an appointment?

1. Open the Customer App.
2. Navigate to the **Bookings** tab (calendar icon).
3. Select a date, time, and service type.
4. Confirm the booking.
5. You will receive a confirmation and reminder before your appointment.

### How do I view my vehicles?

1. Open the Customer App.
2. Navigate to the **Garage** tab (car icon).
3. All your registered vehicles are listed with plate number, make/model, mileage, and service history.

### How do I update my profile?

1. Open the Customer App.
2. Navigate to the **Profile** tab (user icon).
3. Update your name, phone number, or email.
4. Save changes.

---

## See Also

- [Common Issues](../troubleshooting/common-issues.md) — Troubleshooting guide
- [Error Codes](../troubleshooting/error-codes.md) — API error reference
- [Glossary](./glossary.md) — Term definitions
- [RBAC Matrix](./rbac-matrix.md) — Permission reference
- [API Cookbook](./api-cookbook.md) — API usage patterns
