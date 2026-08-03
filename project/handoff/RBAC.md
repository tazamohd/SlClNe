# RBAC — SALIS AUTO

## Actions
- `v` — view · `c` — create · `e` — edit · `x` — delete · `a` — approve
- Empty `""` — hidden from sidebar for that role
- `"x"` alone — visible-but-disabled with tooltip (read-only observer)

Enforce on both sides: the frontend hides / disables, the API layer re-checks every request against the same table.

## Roles (14)

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
- **Demo email:** `khalid@example.sa` (password `Demo@1234`)
- **Data scope:** `self` — sees only their own records
- **Approval ceiling:** may not approve

## Permission matrix

| Module | owner | superadmin | manager | advisor | technician | qc | parts | accountant | hr | frontdesk | callcenter | procurement | supplier | customer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **`dashboard`** | `vx` | `vx` | `vx` | `v` | `v` | `v` | `v` | `vx` | `v` | `v` | `v` | `v` | — | — |
| **`jobcards`** | `vcedax` | `v` | `vcedax` | `vcea` | `ve` | `va` | `v` | `vx` | — | `vc` | `v` | — | — | — |
| **`appointments`** | `vcedax` | `v` | `vcedax` | `vced` | `v` | — | — | — | — | `vced` | `vced` | — | — | — |
| **`estimates`** | `vcedax` | `v` | `vceax` | `vce` | `v` | — | `v` | `vx` | — | `v` | `v` | — | — | — |
| **`customers`** | `vcedax` | `v` | `vcedx` | `vce` | `v` | — | — | `vx` | — | `vce` | `vce` | — | — | — |
| **`vehicles`** | `vcedax` | `v` | `vcedx` | `vce` | `v` | `v` | — | `v` | — | `vce` | `v` | — | — | — |
| **`inventory`** | `vcedax` | `v` | `vcedax` | `v` | `v` | — | `vcedax` | `vx` | — | — | — | `vcex` | — | — |
| **`procurement`** | `vcedax` | `v` | `vcax` | — | — | — | `vc` | `vax` | — | — | — | `vcedax` | `v` | — |
| **`invoices`** | `vcedax` | `v` | `vceax` | `vc` | — | — | — | `vcedax` | — | `vc` | `v` | — | — | — |
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
