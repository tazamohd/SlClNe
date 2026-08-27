import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface RecentActivity {
  action: string
  entity: string
  user: string
  time: string
  type: 'Appointment' | 'Invoice' | 'Vehicle' | 'Message'
}

const ACTIVITIES: RecentActivity[] = [
  { action: 'Appointment Booked', entity: 'Oil Change - Toyota Camry', user: 'Ahmed Al-Rashid', time: '10 min ago', type: 'Appointment' },
  { action: 'Invoice Paid', entity: 'INV-2026-1284', user: 'Khalid Mohammed', time: '25 min ago', type: 'Invoice' },
  { action: 'Vehicle Added', entity: 'Hyundai Sonata 2024', user: 'Fatima Al-Saud', time: '1 hour ago', type: 'Vehicle' },
  { action: 'Message Received', entity: 'Parts delivery update', user: 'Gulf Motor Supply', time: '2 hours ago', type: 'Message' },
  { action: 'Appointment Completed', entity: 'Brake Inspection - GMC Sierra', user: 'Omar Hassan', time: '3 hours ago', type: 'Appointment' },
  { action: 'Invoice Created', entity: 'INV-2026-1285', user: 'Nora Al-Fahd', time: '4 hours ago', type: 'Invoice' },
  { action: 'Vehicle Checked In', entity: 'Nissan Patrol 2023', user: 'Yusuf Ibrahim', time: '5 hours ago', type: 'Vehicle' },
]

const TYPE_ICONS: Record<string, { icon: string; bg: string; fg: string }> = {
  Appointment: { icon: 'Calendar', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Invoice: { icon: 'FileText', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Vehicle: { icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Message: { icon: 'MessageSquare', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
}

export function PortalDashboard() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Active Users'), value: '128', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Appointments Today'), value: '24', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Open Invoices'), value: '67', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Vehicles in Service'), value: '18', icon: 'Car', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const quickLinks = [
    { label: t('New Appointment'), icon: 'CalendarPlus', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Create Invoice'), icon: 'FilePlus', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Register Vehicle'), icon: 'CarFront', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Send Message'), icon: 'Send', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  const columns: Column<RecentActivity>[] = [
    { header: t('Action'), cell: (a) => t(a.action) },
    { header: t('Details'), cell: (a) => a.entity },
    { header: t('User'), cell: (a) => a.user },
    { header: t('Type'), cell: (a) => <Badge background={TYPE_ICONS[a.type].bg} color={TYPE_ICONS[a.type].fg}>{t(a.type)}</Badge> },
    { header: t('Time'), cell: (a) => t(a.time) },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutDashboard" title={t('Portal Dashboard')} subtitle={t('Overview of portal activity and quick actions')} />

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

      <div className="grid grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.label} className="flex items-center gap-3 rounded-xl p-4 shadow-sm">
            <span className="flex rounded-lg p-2" style={{ background: link.bg, color: link.fg }} aria-hidden><Icon name={link.icon} size={18} /></span>
            <span className="text-sm font-semibold text-heading">{link.label}</span>
          </Card>
        ))}
      </div>

      <DataTable
        caption="Recent portal activity"
        columns={columns}
        rows={ACTIVITIES}
        rowKey={(a, i) => `${a.entity}-${i}`}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={t(a.action)} trailing={<Badge background={TYPE_ICONS[a.type].bg} color={TYPE_ICONS[a.type].fg}>{t(a.type)}</Badge>} />
            <MobileCardRow label={t('Details')}>{a.entity}</MobileCardRow>
            <MobileCardRow label={t('User')}>{a.user}</MobileCardRow>
            <MobileCardRow label={t('Time')}>{t(a.time)}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
