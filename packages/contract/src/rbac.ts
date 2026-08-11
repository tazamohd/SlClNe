/** Authorization data, in the one place both sides read it from.
 *
 *  The frontend copy in `app/src/data/generated/rbac.ts` is generated from the
 *  design bundle; this copy is what the **server** enforces with. They are
 *  asserted identical by `server/tests/rbac-parity.test.ts` — if the design
 *  bundle changes the matrix and this file is not regenerated, that test fails
 *  rather than the API quietly granting more than the sidebar shows.
 *
 *  Frontend RBAC is not a security boundary. It hides and disables; every
 *  request is re-checked here. */
import { z } from 'zod'

/** v=view · c=create · e=edit · x=delete · a=approve */
export const action = z.enum(['v', 'c', 'e', 'x', 'a'])
export type Action = z.infer<typeof action>

export const moduleId = z.enum([
  'dashboard',
  'jobcards',
  'appointments',
  'estimates',
  'customers',
  'vehicles',
  'inventory',
  'procurement',
  'invoices',
  'payments',
  'accounting',
  'hr',
  'technicians',
  'crm',
  'callcenter',
  'reports',
  'approvals',
  'kiosk',
  'execreports',
  'portaltech',
  'portalcustomer',
  'portalsupplier',
  'portalprocure',
  'ai',
  'admin',
  'settings',
  'audit',
  'network',
])
export type ModuleId = z.infer<typeof moduleId>

export const roleId = z.enum([
  'owner',
  'superadmin',
  'manager',
  'advisor',
  'technician',
  'qc',
  'parts',
  'accountant',
  'hr',
  'frontdesk',
  'callcenter',
  'procurement',
  'supplier',
  'customer',
])
export type RoleId = z.infer<typeof roleId>

/** Row visibility. `platform` sees every tenant; `all` sees the whole
 *  organization; `branch`, `own`, `self`, `assigned` and `external` narrow it
 *  further. Enforced by Postgres RLS, not by a WHERE clause. */
export const dataScope = z.enum(['platform', 'all', 'org', 'branch', 'own', 'self', 'assigned', 'external'])
export type DataScope = z.infer<typeof dataScope>

/** module → role → granted actions, e.g. `'vcedax'`. `''` means denied. */
export const PERMS: Readonly<Record<ModuleId, Readonly<Record<RoleId, string>>>> = {
  'dashboard': { 'owner': 'vx', 'superadmin': 'vx', 'manager': 'vx', 'advisor': 'v', 'technician': 'v', 'qc': 'v', 'parts': 'v', 'accountant': 'vx', 'hr': 'v', 'frontdesk': 'v', 'callcenter': 'v', 'procurement': 'v', 'supplier': '', 'customer': '' },
  'jobcards': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedax', 'advisor': 'vcea', 'technician': 've', 'qc': 'va', 'parts': 'v', 'accountant': 'vx', 'hr': '', 'frontdesk': 'vc', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': '' },
  'appointments': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedax', 'advisor': 'vced', 'technician': 'v', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': 'vced', 'callcenter': 'vced', 'procurement': '', 'supplier': '', 'customer': '' },
  'estimates': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vceax', 'advisor': 'vce', 'technician': 'v', 'qc': '', 'parts': 'v', 'accountant': 'vx', 'hr': '', 'frontdesk': 'v', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': '' },
  'customers': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedx', 'advisor': 'vce', 'technician': 'v', 'qc': '', 'parts': '', 'accountant': 'vx', 'hr': '', 'frontdesk': 'vce', 'callcenter': 'vce', 'procurement': '', 'supplier': '', 'customer': '' },
  'vehicles': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedx', 'advisor': 'vce', 'technician': 'v', 'qc': 'v', 'parts': '', 'accountant': 'v', 'hr': '', 'frontdesk': 'vce', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': '' },
  'inventory': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedax', 'advisor': 'v', 'technician': 'v', 'qc': '', 'parts': 'vcedax', 'accountant': 'vx', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': 'vcex', 'supplier': '', 'customer': '' },
  'procurement': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcax', 'advisor': '', 'technician': '', 'qc': '', 'parts': 'vc', 'accountant': 'vax', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': 'vcedax', 'supplier': 'v', 'customer': '' },
  'invoices': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vceax', 'advisor': 'vc', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vcedax', 'hr': '', 'frontdesk': 'vc', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': '' },
  'payments': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcax', 'advisor': 'vc', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vcedax', 'hr': '', 'frontdesk': 'vc', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'accounting': { 'owner': 'vax', 'superadmin': 'v', 'manager': 'vx', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vcedax', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'hr': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vx', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vx', 'hr': 'vcedax', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'technicians': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedax', 'advisor': 'v', 'technician': 'v', 'qc': 'v', 'parts': '', 'accountant': '', 'hr': 'vcedx', 'frontdesk': 'v', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'crm': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedx', 'advisor': 'vce', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': 'vced', 'procurement': '', 'supplier': '', 'customer': '' },
  'callcenter': { 'owner': 'vx', 'superadmin': 'v', 'manager': 'vx', 'advisor': 'v', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': 'v', 'callcenter': 'vcedx', 'procurement': '', 'supplier': '', 'customer': '' },
  'reports': { 'owner': 'vx', 'superadmin': 'vx', 'manager': 'vx', 'advisor': 'v', 'technician': '', 'qc': 'v', 'parts': 'vx', 'accountant': 'vx', 'hr': 'vx', 'frontdesk': '', 'callcenter': '', 'procurement': 'vx', 'supplier': '', 'customer': '' },
  'approvals': { 'owner': 'vax', 'superadmin': 'vx', 'manager': 'vax', 'advisor': 'va', 'technician': '', 'qc': '', 'parts': 'va', 'accountant': 'vax', 'hr': 'va', 'frontdesk': '', 'callcenter': '', 'procurement': 'vax', 'supplier': '', 'customer': '' },
  'kiosk': { 'owner': 'v', 'superadmin': 'v', 'manager': 'v', 'advisor': 'v', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': 'vcex', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': '' },
  'execreports': { 'owner': 'vx', 'superadmin': 'vx', 'manager': 'vx', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vx', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'portaltech': { 'owner': 'v', 'superadmin': 'v', 'manager': 'v', 'advisor': 'v', 'technician': 'vx', 'qc': 'vx', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'portalcustomer': { 'owner': 'v', 'superadmin': 'v', 'manager': 'v', 'advisor': 'v', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': 'v', 'callcenter': 'v', 'procurement': '', 'supplier': '', 'customer': 'vx' },
  'portalsupplier': { 'owner': 'v', 'superadmin': 'v', 'manager': 'v', 'advisor': '', 'technician': '', 'qc': '', 'parts': 'v', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': 'v', 'supplier': 'vx', 'customer': '' },
  'portalprocure': { 'owner': 'v', 'superadmin': 'v', 'manager': 'v', 'advisor': '', 'technician': '', 'qc': '', 'parts': 'v', 'accountant': 'v', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': 'vx', 'supplier': '', 'customer': '' },
  'ai': { 'owner': 'vcedax', 'superadmin': 'vcedax', 'manager': 'vce', 'advisor': 'v', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'v', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'admin': { 'owner': 'vcedax', 'superadmin': 'vcedax', 'manager': 'v', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'settings': { 'owner': 'vcedax', 'superadmin': 'vcedax', 'manager': 've', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'audit': { 'owner': 'vx', 'superadmin': 'vx', 'manager': 'vx', 'advisor': '', 'technician': '', 'qc': '', 'parts': '', 'accountant': 'vx', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': '', 'supplier': '', 'customer': '' },
  'network': { 'owner': 'vcedax', 'superadmin': 'v', 'manager': 'vcedx', 'advisor': '', 'technician': '', 'qc': '', 'parts': 'vced', 'accountant': '', 'hr': '', 'frontdesk': '', 'callcenter': '', 'procurement': 'vcedax', 'supplier': 'vce', 'customer': '' },
}

export interface RoleMeta {
  scope: DataScope
  /** Approval ceiling in **SAR**. `null` = unlimited, `0` = may not approve. */
  limitSar: number | null
}

export const ROLE_META: Readonly<Record<RoleId, RoleMeta>> = {
  'owner': { scope: 'all', limitSar: null },
  'superadmin': { scope: 'platform', limitSar: null },
  'manager': { scope: 'branch', limitSar: 50000 },
  'advisor': { scope: 'branch', limitSar: 5000 },
  'technician': { scope: 'own', limitSar: 0 },
  'qc': { scope: 'branch', limitSar: 0 },
  'parts': { scope: 'branch', limitSar: 10000 },
  'accountant': { scope: 'all', limitSar: 25000 },
  'hr': { scope: 'all', limitSar: 15000 },
  'frontdesk': { scope: 'branch', limitSar: 0 },
  'callcenter': { scope: 'all', limitSar: 0 },
  'procurement': { scope: 'all', limitSar: 20000 },
  'supplier': { scope: 'external', limitSar: 0 },
  'customer': { scope: 'self', limitSar: 0 },
}

/** Field-level redaction: named fields hidden from named roles. */
export const FIELD_RULES: readonly { field: string; ar: string; hidden: readonly RoleId[] }[] = [
  { field: 'Part cost / margin', ar: 'تكلفة القطعة / الهامش', hidden: ['advisor', 'technician', 'qc', 'frontdesk', 'callcenter', 'customer', 'supplier'] },
  { field: 'Labour cost rate', ar: 'تكلفة أجر العمل', hidden: ['technician', 'qc', 'frontdesk', 'callcenter', 'customer', 'supplier'] },
  { field: 'Employee salary', ar: 'راتب الموظف', hidden: ['advisor', 'technician', 'qc', 'parts', 'frontdesk', 'callcenter', 'procurement', 'supplier', 'customer'] },
  { field: 'Supplier purchase price', ar: 'سعر الشراء من المورد', hidden: ['advisor', 'technician', 'qc', 'frontdesk', 'callcenter', 'customer'] },
  { field: 'Customer contact details', ar: 'بيانات اتصال العميل', hidden: ['technician', 'qc', 'supplier'] },
  { field: 'Bank account details', ar: 'بيانات الحساب البنكي', hidden: ['advisor', 'technician', 'qc', 'parts', 'frontdesk', 'callcenter', 'hr', 'procurement', 'supplier', 'customer'] },
  { field: 'Branch P&L', ar: 'أرباح وخسائر الفرع', hidden: ['advisor', 'technician', 'qc', 'parts', 'frontdesk', 'callcenter', 'procurement', 'supplier', 'customer'] },
]

/** Segregation of duties — two responsibilities one person must not hold. */
export const SOD: readonly { a: string; b: string; ar: readonly string[]; risk: string }[] = [
  { a: 'Raise purchase order', b: 'Approve purchase order', ar: ['رفع أمر شراء', 'اعتماد أمر شراء'], risk: 'high' },
  { a: 'Create supplier', b: 'Approve supplier payment', ar: ['إنشاء مورد', 'اعتماد دفعة للمورد'], risk: 'high' },
  { a: 'Post journal entry', b: 'Approve journal entry', ar: ['تسجيل قيد', 'اعتماد قيد'], risk: 'high' },
  { a: 'Perform repair', b: 'Pass quality check', ar: ['تنفيذ الإصلاح', 'اعتماد فحص الجودة'], risk: 'high' },
  { a: 'Issue stock', b: 'Adjust stock count', ar: ['صرف مخزون', 'تعديل جرد المخزون'], risk: 'medium' },
  { a: 'Create employee', b: 'Approve payroll run', ar: ['إنشاء موظف', 'اعتماد مسير الرواتب'], risk: 'medium' },
]

export const MODULE_IDS = moduleId.options
export const ROLE_IDS = roleId.options

/** Does `role` hold `act` on `mod`? */
export function can(mod: ModuleId, act: Action, role: RoleId): boolean {
  return (PERMS[mod]?.[role] ?? '').includes(act)
}

export function scopeOf(role: RoleId): DataScope {
  return ROLE_META[role].scope
}

/** Approval ceiling in halalas. `null` = unlimited. */
export function approvalCeilingHalalas(role: RoleId): number | null {
  const sar = ROLE_META[role].limitSar
  return sar === null ? null : sar * 100
}

/** May `role` approve a value of `amountHalalas`?
 *
 *  Derived, never stored: any role with a non-zero ceiling implicitly holds
 *  `approvals: 'va'`, which is why the matrix and the approval inbox cannot
 *  disagree. */
export function canApprove(role: RoleId, amountHalalas?: number): boolean {
  const ceiling = approvalCeilingHalalas(role)
  if (ceiling === 0) return false
  if (ceiling === null) return true
  return amountHalalas === undefined || amountHalalas <= ceiling
}

/** Is this field redacted for this role? */
export function fieldHidden(field: string, role: RoleId): boolean {
  const rule = FIELD_RULES.find((f) => f.field === field)
  return !!rule && rule.hidden.includes(role)
}
