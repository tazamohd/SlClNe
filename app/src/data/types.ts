/** Domain types for the SALIS AUTO data layer.
 *  Hand-written — the generated files under `generated/` are checked against
 *  these, so a change in the design bundle that breaks a shape fails typecheck
 *  instead of failing silently at runtime. */

export type RoleId =
  | 'owner'
  | 'superadmin'
  | 'manager'
  | 'advisor'
  | 'technician'
  | 'qc'
  | 'parts'
  | 'accountant'
  | 'hr'
  | 'frontdesk'
  | 'callcenter'
  | 'procurement'
  | 'supplier'
  | 'customer'

/** Row-level visibility. Enforced by the DB (Postgres RLS) in production; the
 *  frontend only uses it to explain scope in the UI. */
export type DataScope = 'platform' | 'all' | 'org' | 'branch' | 'own' | 'self' | 'assigned' | 'external'

/** The 28 permission modules. A module is the unit RBAC grants against. */
export type ModuleId =
  | 'dashboard' | 'jobcards' | 'appointments' | 'estimates' | 'customers'
  | 'vehicles' | 'inventory' | 'procurement' | 'invoices' | 'payments'
  | 'accounting' | 'hr' | 'technicians' | 'crm' | 'callcenter' | 'reports'
  | 'approvals' | 'kiosk' | 'execreports' | 'portaltech' | 'portalcustomer'
  | 'portalsupplier' | 'portalprocure' | 'ai' | 'admin' | 'settings'
  | 'audit' | 'network'

/** v=view, c=create, e=edit, x=delete, a=approve. */
export type Action = 'v' | 'c' | 'e' | 'x' | 'a'

export interface Role {
  id: string
  label: string
  /** Arabic label. */
  ar: string
  /** lucide icon name. */
  icon: string
  demo: { name: string; ar: string; email: string }
  scope: string
  /** Approval ceiling in SAR. `null` = unlimited, `0` = cannot approve. */
  limit: number | null
  color: string
}

/** module → role → granted actions as a string, e.g. `"vcex"`.
 *  An absent role, or `""`, means the module is hidden from that role's nav. */
export type PermissionMatrix = Record<string, Record<string, string>>

export interface FieldRule {
  field: string
  ar: string
  /** Roles that may NOT see this field. */
  hidden: readonly string[]
}

/** Segregation of duties — two responsibilities that must not share a holder. */
export interface SodRule {
  a: string
  b: string
  ar: readonly string[]
  risk: string
}

export interface NavItem {
  label: string
  /** Stable slug from the design (`r` in gms-data). */
  key: string | null
  /** Screen name, used for the RBAC lookup. */
  screen: string | null
  /** Router path, or null when the design had no destination. */
  route: string | null
}

export interface NavGroup {
  label: string
  /** lucide icon name for the group. */
  icon: string
  items: readonly NavItem[]
}

export interface ScreenMeta {
  name: string
  route: string
  hasMobile: boolean
  purpose: string | null
}

export type Language = 'en' | 'ar'
export type Theme = 'light' | 'dark'

/** A screen from the product feature map (`project/spec/`). Superset of the
 *  designed screens — most have a screenshot but no `.dc.html`. */
export interface SpecScreen {
  /** Zero-padded number from the spec filename, e.g. "036". */
  id: string
  name: string
  title: string
  route: string
  purpose: string | null
  roles: string | null
  /** Top-level nav group from the spec's Navigation Path, when it had one. */
  group: string | null
  /** Matching `.dc.html` design, when one exists. */
  designScreen: string | null
  /** Reference screenshot path, relative to `project/`. */
  screenshot: string
}
