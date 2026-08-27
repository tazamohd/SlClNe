import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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

  const kpis = [
    { label: t('My Vehicles'), value: '3', icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Appointments'), value: '2', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Open Invoices'), value: '1', icon: 'FileText', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Messages'), value: '5', icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Activity>[] = [
    { header: t('Activity'), cell: (a) => a.description },
    { header: t('Type'), cell: (a) => (
      <div className="flex items-center gap-1.5">
        <Icon name={TYPE_ICONS[a.type]} size={14} className="text-muted" />
        <span className="text-body">{t(a.type)}</span>
      </div>
    ) },
    { header: t('Date'), cell: (a) => a.date },
    { header: t('Status'), cell: (a) => <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutDashboard" title={t('My Dashboard')} subtitle={t('Welcome back')} />

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

      <DataTable
        caption="Recent client activity"
        columns={columns}
        rows={RECENT_ACTIVITY}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={a.description} trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>} />
            <MobileCardRow label={t('Type')}>{t(a.type)}</MobileCardRow>
            <MobileCardRow label={t('Date')}>{a.date}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
