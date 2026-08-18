import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ROLES, PERMS, FIELD_RULES, roleMeta } from '@/data/rbac'
import type { ModuleId, RoleId } from '@/data/types'

/** Roles & Permissions (`RolesPermissions.dc.html`) — the RBAC engine made
 *  visible: pick a role, see the same 28-module × 6-action grant matrix and
 *  field-redaction list that `can()` and `fieldHidden()` enforce everywhere
 *  else in the app.
 *
 *  The matrix is a mirror, not an editor. The prototype let every visitor
 *  toggle cells and "Grant all" in local state that vanished on reload — a
 *  convincing simulation of an authorization change that never happened. This
 *  screen shows the real grants and says so; changing what a role can do is a
 *  backend operation this port doesn't have. The design also matrixed only 21
 *  of the 28 modules the engine actually defines (missing Approvals, Kiosk,
 *  Executive & Commercial Reports and the four portal modules) — all 28 render
 *  here, labelled from `RBACSpec.dc.html`, so this screen never disagrees with
 *  `PERMS`. */

/** All 28 permission modules, in `RBACSpec.dc.html`'s matrix order — the
 *  design's own RolesPermissions screen only covers the first 21. */
const MODULES: readonly [ModuleId, string][] = [
  ['dashboard', 'Dashboard'],
  ['jobcards', 'Job Cards'],
  ['appointments', 'Appointments'],
  ['estimates', 'Estimates'],
  ['customers', 'Customers'],
  ['vehicles', 'Vehicles'],
  ['inventory', 'Inventory'],
  ['procurement', 'Procurement'],
  ['invoices', 'Invoices'],
  ['payments', 'Payments'],
  ['accounting', 'Accounting'],
  ['hr', 'HR & Payroll'],
  ['technicians', 'Technicians'],
  ['crm', 'CRM'],
  ['callcenter', 'Call Center'],
  ['reports', 'Reports'],
  ['ai', 'AI Platform'],
  ['admin', 'Administration'],
  ['settings', 'Settings'],
  ['audit', 'Audit Log'],
  ['network', 'Parts Network'],
  ['execreports', 'Executive & Commercial Reports'],
  ['portaltech', 'Technician Portal'],
  ['portalcustomer', 'Customer Portal'],
  ['portalsupplier', 'Supplier Portal'],
  ['portalprocure', 'Procurement Portal'],
  ['approvals', 'Approvals'],
  ['kiosk', 'Kiosk'],
]

/** The six grant letters `PERMS` strings are built from. Indexed directly off
 *  the grant string rather than typed as `Action` — the hand-written `Action`
 *  union (`v c e x a`) is missing `d`, which every "vcedax" string in
 *  `generated/rbac.ts` carries. That's a real gap between `types.ts` and the
 *  ported data, called out rather than silently patched over here. */
const ACTIONS: readonly [string, string][] = [
  ['v', 'View'],
  ['c', 'Create'],
  ['e', 'Edit'],
  ['d', 'Delete'],
  ['a', 'Approve'],
  ['x', 'Export'],
]

const SCOPE_LABEL: Record<string, string> = {
  platform: 'Platform',
  all: 'All branches',
  org: 'Organization',
  branch: 'Own branch',
  own: 'Own jobs',
  self: 'Own records',
  assigned: 'Assigned only',
  external: 'External only',
}

export function RolesPermissions() {
  const { t, rtl } = usePreferences()
  const { can, role: sessionRole } = useSession()
  const isMobile = useIsMobile()
  const [selRole, setSelRole] = useState<RoleId>(sessionRole)

  const canCreateRole = can('admin', 'c')
  const selMeta = roleMeta(selRole)

  const grantOf = (moduleId: ModuleId): string => PERMS[moduleId]?.[selRole] ?? ''

  const visibleCount = MODULES.filter(([id]) => grantOf(id).includes('v')).length

  const hiddenFields = FIELD_RULES.filter((rule) => rule.hidden.includes(selRole))

  const scopeLabel = SCOPE_LABEL[selMeta.scope] ?? '—'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-2xl bg-salis-gradient text-white',
                'shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="ShieldCheck" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-3xl'
              )}
            >
              {t('Roles & Permissions')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        {canCreateRole ? (
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Create Role')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-action text-[11px] font-bold uppercase tracking-[.05em] text-muted">
          {t('Select a role')}
        </p>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t('Select a role')}>
          {ROLES.map((r) => {
            const selected = r.id === selRole
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSelRole(r.id as RoleId)}
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3',
                  'font-action text-xs font-semibold transition-all duration-150',
                  selected
                    ? 'border-none bg-salis-gradient text-white'
                    : 'border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue'
                )}
              >
                <Icon
                  name={r.icon}
                  size={13}
                  style={selected ? undefined : { color: r.color }}
                />
                {rtl ? r.ar : r.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[13px] p-3.5">
          <p className="font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
            {t('Role')}
          </p>
          <p className="mt-1.5 font-display text-[17px] font-extrabold text-heading [font-variant-numeric:tabular-nums]">
            {rtl ? selMeta.ar : selMeta.label}
          </p>
        </Card>
        <Card className="rounded-[13px] p-3.5">
          <p className="font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
            {t('Data scope')}
          </p>
          <p className="mt-1.5 font-display text-[17px] font-extrabold text-salis-blue [font-variant-numeric:tabular-nums]">
            {t(scopeLabel)}
          </p>
        </Card>
        <Card className="rounded-[13px] p-3.5">
          <p className="font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
            {t('Approval limit')}
          </p>
          <p
            className={cn(
              'mt-1.5 font-display text-[17px] font-extrabold [font-variant-numeric:tabular-nums]',
              selMeta.limit === 0 ? 'text-muted' : 'text-[#0BB3FF]'
            )}
          >
            {selMeta.limit === null ? (
              t('Unlimited')
            ) : selMeta.limit === 0 ? (
              t('No approval rights')
            ) : (
              <Money sar={selMeta.limit} />
            )}
          </p>
        </Card>
        <Card className="rounded-[13px] p-3.5">
          <p className="font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
            {t('Modules visible')}
          </p>
          <p
            className="mt-1.5 font-display text-[17px] font-extrabold text-heading [font-variant-numeric:tabular-nums]"
            dir="ltr"
          >
            {visibleCount} / {MODULES.length}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-[18px] py-3.5">
          <div>
            <p className="font-display text-[15px] font-bold text-heading">
              {t('Permission Matrix')}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {rtl ? selMeta.ar : selMeta.label} · {visibleCount} {t('of')} {MODULES.length}{' '}
              {t('modules')}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted"
              title={t('This matrix mirrors the RBAC engine — it does not write to it.')}
            >
              <Icon name="Lock" size={11} />
              {t('Read-only')}
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="subtle"
                size="sm"
                disabled
                title={t('This matrix mirrors the RBAC engine — it does not write to it.')}
              >
                {t('Grant all')}
              </Button>
              <Button
                variant="subtle"
                size="sm"
                disabled
                title={t('This matrix mirrors the RBAC engine — it does not write to it.')}
              >
                {t('Revoke all')}
              </Button>
              <Button
                size="sm"
                disabled
                title={t('This matrix mirrors the RBAC engine — it does not write to it.')}
              >
                {t('Reset to default')}
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="bg-inset">
                <th className="px-[18px] py-2.5 text-start font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
                  {t('Module')}
                </th>
                {ACTIONS.map(([key, label]) => (
                  <th
                    key={key}
                    className="whitespace-nowrap px-1.5 py-2.5 text-center font-action text-[10.5px] font-bold uppercase tracking-[.03em] text-muted"
                  >
                    {t(label)} <span className="font-mono lowercase" dir="ltr">({key})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(([moduleId, label]) => {
                const grants = grantOf(moduleId)
                return (
                  <tr key={moduleId} className="border-t border-border">
                    <td className="whitespace-nowrap px-[18px] py-2 text-[12.5px] font-semibold text-heading">
                      {t(label)}
                    </td>
                    {ACTIONS.map(([key, actLabel]) => {
                      const granted = grants.includes(key)
                      return (
                        <td key={key} className="px-1.5 py-1.5 text-center">
                          <span
                            role="img"
                            aria-label={`${t(actLabel)} ${t(label)}: ${
                              granted ? t('Granted') : t('Not granted')
                            }`}
                            className={cn(
                              'inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150',
                              granted
                                ? 'bg-salis-gradient text-white'
                                : 'border border-border bg-inset text-transparent'
                            )}
                          >
                            {granted ? <Icon name="Check" size={11} strokeWidth={3} /> : null}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-[14px] p-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="flex rounded-lg bg-[rgba(249,115,22,.12)] p-1.5 text-salis-orange">
            <Icon name="EyeOff" size={14} />
          </span>
          <p className="font-display text-sm font-bold text-heading">
            {t('Fields hidden from this role')}
          </p>
        </div>
        {hiddenFields.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {hiddenFields.map((rule) => (
              <span
                key={rule.field}
                className="rounded-full bg-[rgba(249,115,22,.1)] px-2.5 py-0.5 font-action text-[11.5px] font-semibold text-salis-orange"
              >
                {rtl ? rule.ar : rule.field}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-muted">{t('This role can see every field.')}</p>
        )}
      </Card>
    </div>
  )
}
