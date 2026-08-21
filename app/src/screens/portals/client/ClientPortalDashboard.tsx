import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

interface Activity {
  description: string
  date: string
  type: 'service' | 'invoice' | 'appointment' | 'message'
  status: 'Completed' | 'Pending' | 'Upcoming'
}

const RECENT_ACTIVITY: Activity[] = [
  { description: 'Oil Change - Toyota Camry 2022', date: '2025-08-15', type: 'service', status: 'Completed' },
  { description: 'Invoice #INV-4821 Payment Due', date: '2025-08-18', type: 'invoice', status: 'Pending' },
  { description: 'Brake Inspection Scheduled', date: '2025-08-22', type: 'appointment', status: 'Upcoming' },
  { description: 'Service Advisor Response', date: '2025-08-14', type: 'message', status: 'Completed' },
  { description: 'Tire Rotation - Honda Accord 2021', date: '2025-08-12', type: 'service', status: 'Completed' },
  { description: 'Appointment Confirmation', date: '2025-08-20', type: 'appointment', status: 'Upcoming' },
]

const TYPE_ICONS: Record<string, string> = {
  service: 'Wrench',
  invoice: 'FileText',
  appointment: 'Calendar',
  message: 'MessageSquare',
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Upcoming: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function ClientPortalDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('My Vehicles'), value: '3', icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Appointments'), value: '2', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Open Invoices'), value: '1', icon: 'FileText', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Messages'), value: '5', icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="LayoutDashboard" title={t('My Dashboard')} subtitle={t('Welcome back')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {RECENT_ACTIVITY.map((a, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={TYPE_ICONS[a.type]} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{a.description}</p>
                    <p className="text-xs text-muted">{a.date}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>}
            />
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
            <Icon name="LayoutDashboard" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('My Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Welcome back')}</p>
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
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Recent Activity')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Activity')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((a, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{a.description}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={TYPE_ICONS[a.type]} size={14} className="text-muted" />
                      <span className="text-body">{t(a.type)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{a.date}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>
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
