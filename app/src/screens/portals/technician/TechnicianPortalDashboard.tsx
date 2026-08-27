import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface Job {
  workOrder: string
  vehicle: string
  service: string
  priority: 'High' | 'Normal' | 'Low'
  status: 'In Progress' | 'Queued' | 'Waiting Parts'
  estimatedHours: number
}

const ASSIGNED_JOBS: Job[] = [
  { workOrder: 'WO-8830', vehicle: '2021 Honda Accord', service: 'Full Brake Service', priority: 'High', status: 'In Progress', estimatedHours: 3 },
  { workOrder: 'WO-8831', vehicle: '2022 Toyota Camry', service: 'Engine Tune-up', priority: 'Normal', status: 'Queued', estimatedHours: 2.5 },
  { workOrder: 'WO-8832', vehicle: '2023 Hyundai Tucson', service: 'AC Recharge', priority: 'Normal', status: 'Queued', estimatedHours: 1 },
  { workOrder: 'WO-8833', vehicle: '2020 Nissan Altima', service: 'Transmission Flush', priority: 'Low', status: 'Waiting Parts', estimatedHours: 2 },
  { workOrder: 'WO-8834', vehicle: '2019 Toyota Hilux', service: 'Suspension Repair', priority: 'High', status: 'Queued', estimatedHours: 4 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Queued: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'Waiting Parts': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Normal: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianPortalDashboard() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Assigned Jobs'), value: '5', icon: 'Clipboard', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Hours Today'), value: '6.5', icon: 'Clock', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Parts Pending'), value: '2', icon: 'Package', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Completed Today'), value: '3', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  ]

  const columns: Column<Job>[] = [
    { header: t('Work Order'), cell: (j) => j.workOrder },
    { header: t('Vehicle'), cell: (j) => j.vehicle },
    { header: t('Service'), cell: (j) => j.service },
    { header: t('Priority'), cell: (j) => <Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge> },
    { header: t('Est. Hours'), cell: (j) => j.estimatedHours },
    { header: t('Status'), cell: (j) => <Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge> },
  ]

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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Technician Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Today\'s work overview')}</p>
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

      <DataTable
        caption="Technician assigned jobs"
        columns={columns}
        rows={ASSIGNED_JOBS}
        rowKey={(j) => j.workOrder}
        mobileCard={(j) => (
          <>
            <MobileCardHeader title={j.service} trailing={<Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>} />
            <MobileCardRow label={t('Vehicle')}>{j.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Work Order')}>{j.workOrder}</MobileCardRow>
            <MobileCardRow label={t('Priority')}><Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
