# RBAC — SALIS AUTO

## Actions
- `v` — view · `c` — create · `e` — edit · `x` — delete · `a` — approve
- Empty `""` — hidden from sidebar for that role
- `"x"` alone — visible-but-disabled with tooltip (read-only observer)

Enforce on both sides: the frontend hides / disables, the API layer re-checks every request against the same table.

## Roles (15)

### `owner` — Owner / CEO / المالك / الرئيس التنفيذي
- **Demo email:** `owner@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — sees only their own records
- **Approval ceiling:** no ceiling

### `superadmin` — Super Admin / المشرف العام
- **Demo email:** `admin@salisauto.com` (password `Demo@1234`)
- **Data scope:** `platform` — sees all tenants
- **Approval ceiling:** no ceiling

### `manager` — Branch Manager / مدير الفرع
- **Demo email:** `manager@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `branch` — sees own branch
- **Approval ceiling:** SAR 50,000

### `advisor` — Service Advisor / مستشار الخدمة
- **Demo email:** `advisor@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `branch` — sees own branch
- **Approval ceiling:** SAR 5,000

### `technician` — Technician / فني
- **Demo email:** `tech@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `own` — sees only their own records
- **Approval ceiling:** may not approve

### `qc` — QC Inspector / مفتش الجودة
- **Demo email:** `qc@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `branch` — sees own branch
- **Approval ceiling:** may not approve

### `parts` — Storekeeper / أمين المستودع
- **Demo email:** `parts@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `branch` — sees own branch
- **Approval ceiling:** SAR 10,000

### `accountant` — Accountant / محاسب
- **Demo email:** `finance@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — sees only their own records
- **Approval ceiling:** SAR 25,000

### `hr` — HR Manager / مدير الموارد البشرية
- **Demo email:** `hr@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — sees only their own records
- **Approval ceiling:** SAR 15,000

### `frontdesk` — Receptionist / موظف الاستقبال
- **Demo email:** `frontdesk@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `branch` — sees own branch
- **Approval ceiling:** may not approve

### `callcenter` — Call Center Agent / موظف مركز الاتصال
- **Demo email:** `calls@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — sees only their own records
- **Approval ceiling:** may not approve

### `procurement` — Procurement Agent / وكيل المشتريات
- **Demo email:** `procurement@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — sees only their own records
- **Approval ceiling:** SAR 20,000

### `supplier` — Supplier / مورّد
- **Demo email:** `supplier@aljazira.sa` (password `Demo@1234`)
- **Data scope:** `external` — sees only their own records
- **Approval ceiling:** may not approve

### `customer` — Customer / عميل
- **Demo email:** `ahmed@example.sa` (password `Demo@1234`). Not `khalid@example.sa`:
  Khalid matched no row in the `customers` table, so the portal had nothing of
  his to show. The demo login is the one fixture customer carrying a vehicle, a
  job card, an appointment, an estimate and an invoice — and the one
  `CustomerPortal.dc.html` greets by name.
- **Data scope:** `self` — sees only their own records
- **Approval ceiling:** may not approve
- **Grant:** `v` on `vehicles`, `invoices`, `jobcards` and `estimates`, `vc` on
  `appointments`, and `vx` on `portalcustomer`. Those five operational modules
  are what `CustomerPortal` and `CustomerPortal.Booking` read; the `c` is
  booking. The role previously held `portalcustomer` alone, so every one of
  those reads answered 403 and the portal rendered error alerts to its only
  audience.
- **Two things bound what that grant means**, and neither is the matrix:
  - `drizzle/0014_customer_id_link.sql` gives `self` something to narrow by.
    `users.customer_id` says which `customers` row an account is, and a
    RESTRICTIVE `r_self` policy on every RLS-enabled table denies the scope by
    default, opening only the tables where a customer link exists. Before it,
    `self` was narrowed by branch and by the technician-assignment columns —
    neither of which is the customer — so a self-scoped read of `vehicles`
    returned the whole branch and a read of `job_cards` returned nothing.
  - `canScreen` confines a `self`-scoped role to the portal surfaces. Holding
    `jobcards: v` is what makes the portal's data load; it is not a licence to
    open the workshop's Job Cards screen.
- **Self-registration:** `POST /public/customers/register` creates the
  `customers` row, the account and `users.customer_id` in one transaction — an
  account without the link is not refused anywhere, it just signs in to an
  empty portal, so the three are written together or not at all. The account is
  `pending` until a code sent to the phone comes back to
  `/public/customers/verify-otp`; `login` already refuses any status but
  `active`, so nothing new gates it. This is the one public endpoint that lets
  an unauthenticated caller name a tenant — `publicCustomerRegister` in the
  contract sets out why that is safe and what bounds it.
- **Assumed, and worth revisiting:** any `active` organization accepts public
  customer registrations. There is no per-garage opt-in, because
  `organizations` carries no column for one. If some workshops should not be
  publicly joinable, that is a flag on the org and a check beside the
  `status = 'active'` one in `service.registerCustomer`.

### `test` — Test User / مستخدم اختبار
- **Demo email:** `test@salisauto.sa` (password `Demo@1234`)
- **Data scope:** `all` — the whole organization, and deliberately **not**
  `platform`: "do everything" stops at the tenant boundary.
- **Approval ceiling:** no ceiling
- **Grant:** `vcedax` on all 28 modules — every garage role's surface plus the
  customer, supplier, technician and procurement portals — and it appears on
  none of the field-redaction lists.
- **Acts as another role:** the only role `POST /auth/switch-role` will switch.
  The acting role is stored on the user row, so every check — including
  row-level security — sees the role it is acting as, and switching *narrows*
  as often as it widens. The account's own role never changes, which is what
  lets it come back out of `customer` or `supplier`.
- **Audited:** every request is written to the audit log under this user id,
  carrying the role it was acting as. The switch itself is audited too.
- It holds both halves of every segregation-of-duties pair, by construction.
  SOD is a control over people (`sodViolation` reads the audit trail); this one
  identity opts out of the role half of it on purpose.

The matrix below predates the test account; the live, generated one — including
its column — is `docs/MASTER_RBAC_MATRIX.md`.

## Permission matrix

> This table is maintained by hand and does not carry the `test` column.
> `docs/MASTER_RBAC_MATRIX.md` is generated from `PERMS` and is the one to
> trust when the two disagree.

| Module | owner | superadmin | manager | advisor | technician | qc | parts | accountant | hr | frontdesk | callcenter | procurement | supplier | customer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **`dashboard`** | `vx` | `vx` | `vx` | `v` | `v` | `v` | `v` | `vx` | `v` | `v` | `v` | `v` | — | — |
| **`jobcards`** | `vcedax` | `v` | `vcedax` | `vcea` | `ve` | `va` | `v` | `vx` | — | `vc` | `v` | — | — | `v` |
| **`appointments`** | `vcedax` | `v` | `vcedax` | `vced` | `v` | — | — | — | — | `vced` | `vced` | — | — | `vc` |
| **`estimates`** | `vcedax` | `v` | `vceax` | `vce` | `v` | — | `v` | `vx` | — | `v` | `v` | — | — | `v` |
| **`customers`** | `vcedax` | `v` | `vcedx` | `vce` | `v` | — | — | `vx` | — | `vce` | `vce` | — | — | — |
| **`vehicles`** | `vcedax` | `v` | `vcedx` | `vce` | `v` | `v` | — | `v` | — | `vce` | `v` | — | — | `v` |
| **`inventory`** | `vcedax` | `v` | `vcedax` | `v` | `v` | — | `vcedax` | `vx` | — | — | — | `vcex` | — | — |
| **`procurement`** | `vcedax` | `v` | `vcax` | — | — | — | `vc` | `vax` | — | — | — | `vcedax` | `v` | — |
| **`invoices`** | `vcedax` | `v` | `vceax` | `vc` | — | — | — | `vcedax` | — | `vc` | `v` | — | — | `v` |
| **`payments`** | `vcedax` | `v` | `vcax` | `vc` | — | — | — | `vcedax` | — | `vc` | — | — | — | — |
| **`accounting`** | `vax` | `v` | `vx` | — | — | — | — | `vcedax` | — | — | — | — | — | — |
| **`hr`** | `vcedax` | `v` | `vx` | — | — | — | — | `vx` | `vcedax` | — | — | — | — | — |
| **`technicians`** | `vcedax` | `v` | `vcedax` | `v` | `v` | `v` | — | — | `vcedx` | `v` | — | — | — | — |
| **`crm`** | `vcedax` | `v` | `vcedx` | `vce` | — | — | — | — | — | — | `vced` | — | — | — |
| **`callcenter`** | `vx` | `v` | `vx` | `v` | — | — | — | — | — | `v` | `vcedx` | — | — | — |
| **`reports`** | `vx` | `vx` | `vx` | `v` | — | `v` | `vx` | `vx` | `vx` | — | — | `vx` | — | — |
| **`approvals`** | `vax` | `vx` | `vax` | `va` | — | — | `va` | `vax` | `va` | — | — | `vax` | — | — |
| **`kiosk`** | `v` | `v` | `v` | `v` | — | — | — | — | — | `vcex` | `v` | — | — | — |
| **`execreports`** | `vx` | `vx` | `vx` | — | — | — | — | `vx` | — | — | — | — | — | — |
| **`portaltech`** | `v` | `v` | `v` | `v` | `vx` | `vx` | — | — | — | — | — | — | — | — |
| **`portalcustomer`** | `v` | `v` | `v` | `v` | — | — | — | — | — | `v` | `v` | — | — | `vx` |
| **`portalsupplier`** | `v` | `v` | `v` | — | — | — | `v` | — | — | — | — | `v` | `vx` | — |
| **`portalprocure`** | `v` | `v` | `v` | — | — | — | `v` | `v` | — | — | — | `vx` | — | — |
| **`ai`** | `vcedax` | `vcedax` | `vce` | `v` | — | — | — | `v` | — | — | — | — | — | — |
| **`admin`** | `vcedax` | `vcedax` | `v` | — | — | — | — | — | — | — | — | — | — | — |
| **`settings`** | `vcedax` | `vcedax` | `ve` | — | — | — | — | — | — | — | — | — | — | — |
| **`audit`** | `vx` | `vx` | `vx` | — | — | — | — | `vx` | — | — | — | — | — | — |
| **`network`** | `vcedax` | `v` | `vcedx` | — | — | — | `vced` | — | — | — | — | `vcedax` | `vce` | — |

## Notes

- `approvals` is auto-derived: any role with `limit !== 0` implicitly has `approvals: "va"`. Do not store it separately — compute in the seeder.
- `execreports` was split out of `reports` so a storekeeper doesn't see Executive/Sales/Insurance/Loan reports.
- Portal modules (`portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`) gate the external-facing portals. Do not collapse into a single "portal" permission.
- `kiosk` is front-desk / call-centre only — a technician should not be able to open the reception kiosk.

## Data scope enforcement (PostgreSQL RLS example)

```sql
-- Every tenant-owned table:
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON job_cards
  USING (org_id = current_setting('app.current_org_id')::uuid);

-- Additional `branch` scope for branch-scoped roles:
CREATE POLICY branch_scope ON job_cards
  USING (
    current_setting('app.current_scope') <> 'branch'
    OR branch_id = current_setting('app.current_branch_id')::uuid
  );

-- `self` / `assigned` scope for technicians:
CREATE POLICY assigned_only ON job_cards
  USING (
    current_setting('app.current_scope') <> 'assigned'
    OR assigned_tech_id = current_setting('app.current_user_id')::uuid
  );
```

Set the GUCs from your API middleware after JWT verification: `SET LOCAL app.current_org_id = ...` etc.
