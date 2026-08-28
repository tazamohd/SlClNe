import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Role {
  name: string
  userCount: number
  permissionCount: number
  description: string
  isSystem: boolean
}

const ROLES: Role[] = [
  { name: 'Owner', userCount: 1, permissionCount: 48, description: 'Full system access with all permissions', isSystem: true },
  { name: 'Manager', userCount: 3, permissionCount: 38, description: 'Manage operations, staff, and reports', isSystem: true },
  { name: 'Accountant', userCount: 2, permissionCount: 22, description: 'Financial operations, invoicing, and reports', isSystem: true },
  { name: 'Technician', userCount: 8, permissionCount: 12, description: 'Job cards, inspections, and work orders', isSystem: true },
  { name: 'Receptionist', userCount: 4, permissionCount: 18, description: 'Appointments, customer intake, and scheduling', isSystem: true },
  { name: 'Viewer', userCount: 2, permissionCount: 6, description: 'Read-only access to dashboards and reports', isSystem: false },
]

export function RoleManagement() {
  const { t } = usePreferences()

  const columns: Column<Role>[] = [
    {
      header: 'Role',
      cell: (role) => (
        <div className="flex items-center gap-2">
          <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
          <span className="font-medium text-heading">{t(role.name)}</span>
        </div>
      ),
    },
    { header: 'Description', cell: (role) => role.description },
    { header: 'Users', cell: (role) => <span className="font-mono text-heading">{role.userCount}</span> },
    { header: 'Permissions', cell: (role) => <span className="font-mono text-heading">{role.permissionCount}</span> },
    {
      header: 'Type',
      cell: (role) =>
        role.isSystem
          ? <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('System')}</Badge>
          : <Badge background="var(--tint-neutral)" color="var(--text-muted)">{t('Custom')}</Badge>,
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Shield" title={t('Role Management')} subtitle={t('Roles and permission configuration')} />

      <DataTable
        caption="Roles"
        columns={columns}
        rows={ROLES}
        rowKey={(role) => role.name}
        empty={t('No roles found')}
        mobileCard={(role) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(role.name)}</p>
                    <p className="text-xs text-muted">{role.description}</p>
                  </div>
                </div>
              }
              trailing={
                role.isSystem
                  ? <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('System')}</Badge>
                  : <Badge background="var(--tint-neutral)" color="var(--text-muted)">{t('Custom')}</Badge>
              }
            />
            <MobileCardRow label={t('Users')} value={String(role.userCount)} />
            <MobileCardRow label={t('Permissions')} value={String(role.permissionCount)} />
          </>
        )}
      />
    </div>
  )
}
