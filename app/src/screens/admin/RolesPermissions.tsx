import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ROLES, PERMS, FIELD_RULES } from '@/data/rbac'
import type { Action } from '@/data/types'

const MODULES: readonly [string, string][] = [
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
]

const ACTIONS: readonly [Action, string][] = [
  ['v', 'View'],
  ['c', 'Create'],
  ['e', 'Edit'],
  ['d', 'Delete'],
  ['a', 'Approve'],
  ['x', 'Export'],
]

const SCOPE_LABELS: Record<string, [string, string]> = {
  all: ['All branches', 'كل الفروع'],
  branch: ['Own branch', 'فرعه'],
  own: ['Own jobs', 'أعماله'],
  self: ['Own records', 'سجلاته'],
  external: ['External only', 'خارجي فقط'],
  platform: ['Platform', 'المنصة'],
}

export function RolesPermissions() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const [selectedRoleId, setSelectedRoleId] = useState<string>('advisor')

  const selectedRole = useMemo(
    () => ROLES.find((r) => r.id === selectedRoleId) ?? ROLES[0],
    [selectedRoleId],
  )

  const grantOf = (mod: string) => (PERMS[mod]?.[selectedRoleId] ?? '')

  const visibleCount = MODULES.filter(([mod]) => grantOf(mod).includes('v')).length

  const hiddenFields = useMemo(
    () =>
      FIELD_RULES.filter((f) => f.hidden.includes(selectedRoleId)).map((f) =>
        rtl ? f.ar : f.field,
      ),
    [selectedRoleId, rtl],
  )

  const scopeLabel = SCOPE_LABELS[selectedRole.scope]
  const stats = [
    {
      label: t('Role'),
      value: rtl ? selectedRole.ar : selectedRole.label,
      color: 'var(--text-heading)',
    },
    {
      label: t('Data scope'),
      value: scopeLabel ? (rtl ? scopeLabel[1] : scopeLabel[0]) : '—',
      color: 'var(--salis-blue)',
    },
    {
      label: t('Approval limit'),
      value:
        selectedRole.limit === null
          ? t('Unlimited')
          : selectedRole.limit === 0
            ? t('No approval rights')
            : `SAR ${selectedRole.limit.toLocaleString('en-US')}`,
      color: selectedRole.limit === 0 ? 'var(--text-muted)' : 'var(--salis-blue-bright)',
    },
    {
      label: t('Modules visible'),
      value: `${visibleCount} / ${MODULES.length}`,
      color: 'var(--text-heading)',
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <span className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ShieldCheck" size={28} />
            </span>
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading md:text-[30px]">
              {t('Roles & Permissions')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-action text-[11px] font-bold uppercase tracking-[.05em] text-muted">
          {t('Select a role')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => {
            const active = role.id === selectedRoleId
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={
                  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 font-action text-xs font-semibold transition-all ' +
                  (active
                    ? 'border-none bg-salis-gradient text-white'
                    : 'border border-border bg-card text-body')
                }
              >
                <Icon name={role.icon} size={13} />
                {rtl ? role.ar : role.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl p-3.5">
            <p className="font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
              {s.label}
            </p>
            <p
              className="mt-1 font-display text-[17px] font-extrabold tabular-nums"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-0 border-b border-solid border-border p-4">
          <div>
            <p className="font-display text-[15px] font-bold text-heading">
              {t('Permission Matrix')}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {rtl ? selectedRole.ar : selectedRole.label} &middot; {visibleCount}{' '}
              {t('of')} {MODULES.length} {t('modules')}
            </p>
          </div>
        </div>

        {isMobile ? (
          <div className="divide-y divide-border">
            {MODULES.map(([mod, label]) => {
              const grants = grantOf(mod)
              return (
                <div key={mod} className="px-4 py-3">
                  <MobileCardHeader
                    leading={
                      <span className="text-[13px] font-semibold text-heading">
                        {t(label)}
                      </span>
                    }
                    trailing={
                      grants.length > 0 ? (
                        <span className="font-mono text-xs font-bold text-salis-blue">
                          {grants.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">{t('None')}</span>
                      )
                    }
                  />
                  <MobileCardRow
                    label={t('Permissions')}
                    value={
                      <div className="flex flex-wrap gap-1">
                        {ACTIONS.map(([action]) => {
                          const on = grants.includes(action)
                          return (
                            <span
                              key={action}
                              className={
                                'inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ' +
                                (on
                                  ? 'bg-salis-gradient text-white'
                                  : 'border border-border bg-inset text-transparent')
                              }
                            >
                              {on ? action.toUpperCase() : '·'}
                            </span>
                          )
                        })}
                      </div>
                    }
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr className="bg-inset">
                  <th className="px-4 py-2.5 text-start font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted">
                    {t('Module')}
                  </th>
                  {ACTIONS.map(([, label]) => (
                    <th
                      key={label}
                      className="whitespace-nowrap px-1.5 py-2.5 text-center font-action text-[10.5px] font-bold uppercase tracking-[.03em] text-muted"
                    >
                      {t(label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(([mod, label]) => {
                  const grants = grantOf(mod)
                  return (
                    <tr
                      key={mod}
                      className="border-0 border-t border-solid border-border"
                    >
                      <td className="whitespace-nowrap px-4 py-2 text-[12.5px] font-semibold text-heading">
                        {t(label)}
                      </td>
                      {ACTIONS.map(([action]) => {
                        const on = grants.includes(action)
                        return (
                          <td key={action} className="px-1.5 py-1.5 text-center">
                            <span
                              className={
                                'inline-flex h-6 w-6 items-center justify-center rounded-md transition-all ' +
                                (on
                                  ? 'bg-salis-gradient text-white'
                                  : 'border border-border bg-inset text-transparent')
                              }
                            >
                              {on && <Icon name="Check" size={11} strokeWidth={3} />}
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
        )}
      </Card>

      <Card className="rounded-xl p-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex rounded-lg bg-salis-orange/[.12] p-1.5 text-salis-orange">
            <Icon name="EyeOff" size={14} />
          </span>
          <p className="font-display text-sm font-bold text-heading">
            {t('Fields hidden from this role')}
          </p>
        </div>
        {hiddenFields.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {hiddenFields.map((field) => (
              <Badge
                key={field}
                background="var(--tint-orange)"
                color="var(--salis-orange)"
              >
                {field}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-muted">
            {t('This role can see every field.')}
          </p>
        )}
      </Card>
    </div>
  )
}
