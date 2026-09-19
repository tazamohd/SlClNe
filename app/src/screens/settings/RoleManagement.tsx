import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { isLive } from '@/data/repository'
import { ROLES, PERMS } from '@/data/rbac'
import { SCOPE_LABELS } from '@/screens/admin/RolesPermissions'
import { actionFailureMessage, listStaff } from '@/screens/admin/api'

interface RoleRow {
  id: string
  label: string
  ar: string
  scope: string
  permissionCount: number
}

/** `permissionCount` is real: every module `PERMS` grants this role any
 *  letter on at all, the same matrix `RolesPermissions.tsx` renders per
 *  module. Previously a hand-picked number per row (48, 38, 22…) with no
 *  relationship to the actual matrix, alongside a `userCount` that was
 *  equally invented and a sixth row, "Viewer", that isn't one of the 15
 *  roles the matrix defines at all. */
function permissionCountFor(roleId: string): number {
  return Object.values(PERMS).filter((grants) => (grants[roleId] ?? '').length > 0).length
}

const ROLE_ROWS: RoleRow[] = ROLES.map((role) => ({
  id: role.id,
  label: role.label,
  ar: role.ar,
  scope: role.scope,
  permissionCount: permissionCountFor(role.id),
}))

export function RoleManagement() {
  const { t, rtl } = usePreferences()

  /* `userCount` needs the real staff list, which only a live build can load
   * — a fixture build has no account table behind it to count. `null` reads
   * as "not available here", not zero. */
  const [staffCounts, setStaffCounts] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(isLive)
  const [loadError, setLoadError] = useState<string | null>(null)

  const reload = useCallback(() => {
    if (!isLive) return
    setLoading(true)
    setLoadError(null)
    listStaff()
      .then((staff) => {
        const counts: Record<string, number> = {}
        for (const person of staff) counts[person.role] = (counts[person.role] ?? 0) + 1
        setStaffCounts(counts)
      })
      .catch((cause) => setLoadError(actionFailureMessage(cause, 'Could not load the staff list.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const userCountLabel = (roleId: string): string => {
    if (!isLive) return '—'
    if (loading) return '…'
    if (loadError) return '—'
    return String(staffCounts?.[roleId] ?? 0)
  }

  const columns: Column<RoleRow>[] = [
    {
      header: 'Role',
      cell: (role) => (
        <div className="flex items-center gap-2">
          <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
          <span className="font-medium text-heading">{rtl ? role.ar : role.label}</span>
        </div>
      ),
    },
    {
      header: 'Scope',
      cell: (role) => {
        const scope = SCOPE_LABELS[role.scope]
        return <Badge background="var(--tint-blue)" color="var(--salis-blue)">{scope ? scope[rtl ? 1 : 0] : role.scope}</Badge>
      },
    },
    { header: 'Users', cell: (role) => <span className="font-mono text-heading">{userCountLabel(role.id)}</span> },
    { header: 'Permissions', cell: (role) => <span className="font-mono text-heading">{role.permissionCount}</span> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Shield" title={t('Role Management')} subtitle={t('Roles and permission configuration')} />

      {loadError ? (
        <p className="text-sm text-salis-orange">{loadError}</p>
      ) : null}

      <DataTable
        caption="Roles"
        columns={columns}
        rows={ROLE_ROWS}
        rowKey={(role) => role.id}
        empty={t('No roles found')}
        mobileCard={(role) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
                  <p className="text-[13px] font-semibold text-heading">{rtl ? role.ar : role.label}</p>
                </div>
              }
              trailing={
                <Badge background="var(--tint-blue)" color="var(--salis-blue)">
                  {SCOPE_LABELS[role.scope] ? SCOPE_LABELS[role.scope][rtl ? 1 : 0] : role.scope}
                </Badge>
              }
            />
            <MobileCardRow label={t('Users')} value={userCountLabel(role.id)} />
            <MobileCardRow label={t('Permissions')} value={String(role.permissionCount)} />
          </>
        )}
      />
    </div>
  )
}
