import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="LayoutDashboard" title={t('Portal Dashboard')} subtitle={t('Overview & quick actions')} />
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

        <p className="text-[13px] font-bold text-heading">{t('Quick Actions')}</p>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Card key={link.label} className="flex items-center gap-2.5 rounded-xl p-3 shadow-sm">
              <span className="flex rounded-lg p-1.5" style={{ background: link.bg, color: link.fg }} aria-hidden><Icon name={link.icon} size={14} /></span>
              <span className="text-[12px] font-semibold text-heading">{link.label}</span>
            </Card>
          ))}
        </div>

        <p className="text-[13px] font-bold text-heading">{t('Recent Activity')}</p>
        {ACTIVITIES.map((a, i) => (
          <MobileCard key={`${a.entity}-${i}`}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: TYPE_ICONS[a.type].bg, color: TYPE_ICONS[a.type].fg }} aria-hidden>
                    <Icon name={TYPE_ICONS[a.type].icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(a.action)}</p>
                    <p className="text-xs text-muted">{a.entity}</p>
                  </div>
                </div>
              }
              trailing={<span className="text-[10px] text-muted">{t(a.time)}</span>}
            />
            <MobileCardRow label={t('User')} value={a.user} />
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Portal Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Overview of portal activity and quick actions')}</p>
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

      <div className="grid grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.label} className="flex items-center gap-3 rounded-xl p-4 shadow-sm">
            <span className="flex rounded-lg p-2" style={{ background: link.bg, color: link.fg }} aria-hidden><Icon name={link.icon} size={18} /></span>
            <span className="text-sm font-semibold text-heading">{link.label}</span>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Recent Activity')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Action')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Details')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('User')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 text-start font-medium">{t('Time')}</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITIES.map((a, i) => (
                <tr key={`${a.entity}-${i}`} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{t(a.action)}</td>
                  <td className="py-3 pe-4 text-body">{a.entity}</td>
                  <td className="py-3 pe-4 text-body">{a.user}</td>
                  <td className="py-3 pe-4">
                    <Badge background={TYPE_ICONS[a.type].bg} color={TYPE_ICONS[a.type].fg}>{t(a.type)}</Badge>
                  </td>
                  <td className="py-3 text-muted">{t(a.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
