import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Appointment {
  id: string
  vehicle: string
  service: string
  date: string
  time: string
  advisor: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
}

const APPOINTMENTS: Appointment[] = [
  { id: 'APT-1001', vehicle: '2022 Toyota Camry', service: 'Brake Inspection', date: '2025-08-22', time: '09:00 AM', advisor: 'Khalid Al-Rashid', status: 'Confirmed' },
  { id: 'APT-1002', vehicle: '2023 Hyundai Tucson', service: 'Oil Change', date: '2025-08-25', time: '10:30 AM', advisor: 'Faisal Al-Dosari', status: 'Pending' },
  { id: 'APT-0998', vehicle: '2021 Honda Accord', service: 'Tire Rotation', date: '2025-08-12', time: '02:00 PM', advisor: 'Khalid Al-Rashid', status: 'Completed' },
  { id: 'APT-0995', vehicle: '2022 Toyota Camry', service: 'AC Service', date: '2025-08-08', time: '11:00 AM', advisor: 'Omar Al-Hamdan', status: 'Completed' },
  { id: 'APT-0990', vehicle: '2020 Nissan Altima', service: 'Engine Diagnostic', date: '2025-08-05', time: '09:30 AM', advisor: 'Faisal Al-Dosari', status: 'Cancelled' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Confirmed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function ClientPortalAppointments() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Upcoming'), value: '2', icon: 'CalendarCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Completed'), value: '8', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Cancelled'), value: '1', icon: 'XCircle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('This Month'), value: '3', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Calendar" title={t('Appointments')} subtitle={t('Upcoming and past')} />
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
        {APPOINTMENTS.map((a) => (
          <MobileCard key={a.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Calendar" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{a.service}</p>
                    <p className="text-xs text-muted">{a.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>}
            />
            <MobileCardRow label={t('Date')} value={`${a.date} ${a.time}`} />
            <MobileCardRow label={t('Advisor')} value={a.advisor} />
            <MobileCardRow label={t('Ref')} value={a.id} />
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
            <Icon name="Calendar" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Appointments')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Upcoming and past appointments')}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Ref')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date & Time')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Advisor')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {APPOINTMENTS.map((a) => (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted">{a.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{a.vehicle}</td>
                  <td className="py-3 pe-4 text-body">{a.service}</td>
                  <td className="py-3 pe-4 text-body">{a.date} {a.time}</td>
                  <td className="py-3 pe-4 text-body">{a.advisor}</td>
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
