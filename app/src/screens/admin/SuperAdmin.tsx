import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

interface Tenant {
  id: string
  name: string
  plan: string
  branches: number
  users: number
  status: string
  region: string
}

function useTenants(t: (s: string) => string): Tenant[] {
  return useMemo(
    () => [
      { id: 'ORG-001', name: t('SALIS Auto Workshop'), plan: t('Enterprise'), branches: 4, users: 28, status: t('Active'), region: t('Riyadh') },
      { id: 'ORG-002', name: t('Gulf Motors'), plan: t('Professional'), branches: 2, users: 12, status: t('Active'), region: t('Jeddah') },
      { id: 'ORG-003', name: t('Al-Jazeera Auto'), plan: t('Starter'), branches: 1, users: 5, status: t('Active'), region: t('Dammam') },
      { id: 'ORG-004', name: t('Desert Star Garage'), plan: t('Professional'), branches: 2, users: 9, status: t('Suspended'), region: t('Riyadh') },
      { id: 'ORG-005', name: t('Platinum Auto Care'), plan: t('Enterprise'), branches: 3, users: 18, status: t('Active'), region: t('Jeddah') },
    ],
    [t],
  )
}

export function SuperAdmin() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const tenants = useTenants(t)

  const activeTenants = tenants.filter((o) => o.status === t('Active')).length
  const totalBranches = tenants.reduce((s, o) => s + o.branches, 0)
  const totalUsers = tenants.reduce((s, o) => s + o.users, 0)

  const kpis = [
    { label: t('Organizations'), value: String(tenants.length), icon: 'Building2', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(activeTenants), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Total Branches'), value: String(totalBranches), icon: 'MapPin', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Users'), value: String(totalUsers), icon: 'Users', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  function statusBadge(status: string) {
    if (status === t('Active')) return <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{status}</Badge>
    if (status === t('Suspended')) return <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{status}</Badge>
    return <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{status}</Badge>
  }

  function planBadge(plan: string) {
    if (plan === t('Enterprise')) return <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{plan}</Badge>
    if (plan === t('Professional')) return <Badge background="rgba(11,179,255,.1)" color="var(--salis-blue-bright, #0BB3FF)">{plan}</Badge>
    return <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{plan}</Badge>
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Shield" title={t('Super Admin')} subtitle={t('Platform Control')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {tenants.map((o) => (
          <MobileCard key={o.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Building2" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{o.name}</p>
                    <p className="text-xs text-muted">{o.region} · {o.branches} {t('branches')} · {o.users} {t('users')}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              {planBadge(o.plan)}
              {statusBadge(o.status)}
            </div>
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Super Admin')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Platform Control')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Organizations')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Organization')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Region')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Plan')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Branches')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Users')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((o) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{o.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{o.name}</td>
                  <td className="py-3 pe-4 text-body">{o.region}</td>
                  <td className="py-3 pe-4">{planBadge(o.plan)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{o.branches}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{o.users}</td>
                  <td className="py-3">{statusBadge(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
