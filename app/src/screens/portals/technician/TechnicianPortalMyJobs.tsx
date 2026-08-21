import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Job {
  workOrder: string
  vehicle: string
  plate: string
  service: string
  priority: 'High' | 'Normal' | 'Low'
  status: 'In Progress' | 'Queued' | 'Waiting Parts' | 'Completed'
  estimatedHours: number
  bay: string
}

const JOBS: Job[] = [
  { workOrder: 'WO-8830', vehicle: '2021 Honda Accord', plate: 'KSA 7193', service: 'Full Brake Service', priority: 'High', status: 'In Progress', estimatedHours: 3, bay: 'Bay 3' },
  { workOrder: 'WO-8831', vehicle: '2022 Toyota Camry', plate: 'RJD 4821', service: 'Engine Tune-up', priority: 'Normal', status: 'Queued', estimatedHours: 2.5, bay: 'Bay 3' },
  { workOrder: 'WO-8832', vehicle: '2023 Hyundai Tucson', plate: 'DMM 2856', service: 'AC Recharge', priority: 'Normal', status: 'Queued', estimatedHours: 1, bay: 'Bay 5' },
  { workOrder: 'WO-8833', vehicle: '2020 Nissan Altima', plate: 'JED 5034', service: 'Transmission Flush', priority: 'Low', status: 'Waiting Parts', estimatedHours: 2, bay: 'Bay 3' },
  { workOrder: 'WO-8834', vehicle: '2019 Toyota Hilux', plate: 'RYD 9012', service: 'Suspension Repair', priority: 'High', status: 'Queued', estimatedHours: 4, bay: 'Bay 7' },
  { workOrder: 'WO-8825', vehicle: '2022 Kia Sportage', plate: 'MKH 3344', service: 'Oil Change', priority: 'Normal', status: 'Completed', estimatedHours: 1, bay: 'Bay 3' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Queued: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'Waiting Parts': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Normal: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianPortalMyJobs() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Clipboard" title={t('My Jobs')} subtitle={t('Assigned work orders')} />
        {JOBS.map((j) => (
          <MobileCard key={j.workOrder}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{j.service}</p>
                    <p className="text-xs text-muted">{j.vehicle} - {j.plate}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>}
            />
            <MobileCardRow label={t('Work Order')} value={j.workOrder} />
            <MobileCardRow label={t('Bay')} value={j.bay} />
            <MobileCardRow label={t('Est. Hours')} value={String(j.estimatedHours)} />
            <MobileCardRow label={t('Priority')}>
              <Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge>
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
            <Icon name="Clipboard" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('My Jobs')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Assigned work orders and status')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Work Order')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Bay')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Priority')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Est. Hours')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((j) => (
                <tr key={j.workOrder} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{j.workOrder}</td>
                  <td className="py-3 pe-4 text-body">{j.vehicle}</td>
                  <td className="py-3 pe-4 font-mono text-body">{j.plate}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{j.service}</td>
                  <td className="py-3 pe-4 text-body">{j.bay}</td>
                  <td className="py-3 pe-4">
                    <Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{j.estimatedHours}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>
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
