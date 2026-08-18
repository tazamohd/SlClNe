import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Shield" title={t('Roles')} subtitle={t('Permission management')} />
        {ROLES.map((role) => (
          <MobileCard key={role.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(role.name)}</p>
                    <p className="text-xs text-muted">{role.description}</p>
                  </div>
                </div>
              }
              trailing={
                role.isSystem
                  ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('System')}</Badge>
                  : <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{t('Custom')}</Badge>
              }
            />
            <MobileCardRow label={t('Users')} value={String(role.userCount)} />
            <MobileCardRow label={t('Permissions')} value={String(role.permissionCount)} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Shield" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Role Management')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Roles and permission configuration')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Role')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Description')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Users')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Permissions')}</th>
                <th className="pb-3 text-start font-medium">{t('Type')}</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role.name} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-2">
                      <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Shield" size={14} /></span>
                      <span className="font-medium text-heading">{t(role.name)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{role.description}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{role.userCount}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{role.permissionCount}</td>
                  <td className="py-3">
                    {role.isSystem
                      ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('System')}</Badge>
                      : <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{t('Custom')}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
