import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Reminder {
  id: string
  vehicle: string
  service: string
  dueDate: string
  mileageDue: number
  priority: 'High' | 'Medium' | 'Low'
  status: 'Due Soon' | 'Overdue' | 'Scheduled'
}

const REMINDERS: Reminder[] = [
  { id: 'REM-301', vehicle: '2022 Toyota Camry', service: 'Oil Change', dueDate: '2025-08-25', mileageDue: 40000, priority: 'High', status: 'Due Soon' },
  { id: 'REM-302', vehicle: '2021 Honda Accord', service: 'Tire Replacement', dueDate: '2025-09-01', mileageDue: 55000, priority: 'Medium', status: 'Due Soon' },
  { id: 'REM-303', vehicle: '2023 Hyundai Tucson', service: 'Second Scheduled Service', dueDate: '2025-09-15', mileageDue: 20000, priority: 'Low', status: 'Scheduled' },
  { id: 'REM-304', vehicle: '2020 Nissan Altima', service: 'Brake Inspection', dueDate: '2025-08-10', mileageDue: 70000, priority: 'High', status: 'Overdue' },
  { id: 'REM-305', vehicle: '2022 Toyota Camry', service: 'AC Filter Replacement', dueDate: '2025-10-01', mileageDue: 42000, priority: 'Low', status: 'Scheduled' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'Due Soon': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Overdue: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Scheduled: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Medium: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Low: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function ClientPortalReminders() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Due Soon'), value: '2', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Overdue'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('Scheduled'), value: '2', icon: 'CalendarCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Active'), value: '5', icon: 'Bell', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bell" title={t('Service Reminders')} subtitle={t('Upcoming services')} />
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
        {REMINDERS.map((r) => (
          <MobileCard key={r.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Bell" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.service}</p>
                    <p className="text-xs text-muted">{r.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge>}
            />
            <MobileCardRow label={t('Due Date')} value={r.dueDate} />
            <MobileCardRow label={t('Mileage Due')} value={`${r.mileageDue.toLocaleString()} km`} />
            <MobileCardRow label={t('Priority')}>
              <Badge background={PRIORITY_STYLES[r.priority].bg} color={PRIORITY_STYLES[r.priority].fg}>{t(r.priority)}</Badge>
            </MobileCardRow>
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
            <Icon name="Bell" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Service Reminders')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Upcoming maintenance schedule')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Mileage Due')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Priority')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {REMINDERS.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.service}</td>
                  <td className="py-3 pe-4 text-body">{r.vehicle}</td>
                  <td className="py-3 pe-4 text-body">{r.dueDate}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{r.mileageDue.toLocaleString()} km</td>
                  <td className="py-3 pe-4">
                    <Badge background={PRIORITY_STYLES[r.priority].bg} color={PRIORITY_STYLES[r.priority].fg}>{t(r.priority)}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge>
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
