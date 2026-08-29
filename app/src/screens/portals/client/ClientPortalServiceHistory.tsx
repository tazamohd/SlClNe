import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'

interface ServiceRecord {
  id: string
  date: string
  vehicle: string
  service: string
  technician: string
  cost: number
  status: 'Completed' | 'Warranty Claim'
}

const SERVICE_HISTORY: ServiceRecord[] = [
  { id: 'WO-8821', date: '2025-08-15', vehicle: '2022 Toyota Camry', service: 'Oil Change + Filter Replacement', technician: 'Ahmed Al-Farsi', cost: 350, status: 'Completed' },
  { id: 'WO-8798', date: '2025-08-12', vehicle: '2021 Honda Accord', service: 'Tire Rotation & Balance', technician: 'Saad Al-Otaibi', cost: 180, status: 'Completed' },
  { id: 'WO-8765', date: '2025-08-08', vehicle: '2022 Toyota Camry', service: 'AC Compressor Service', technician: 'Mohammed Al-Zahrani', cost: 1200, status: 'Completed' },
  { id: 'WO-8730', date: '2025-07-28', vehicle: '2023 Hyundai Tucson', service: 'First Scheduled Service', technician: 'Ahmed Al-Farsi', cost: 450, status: 'Completed' },
  { id: 'WO-8691', date: '2025-07-15', vehicle: '2020 Nissan Altima', service: 'Brake Pad Replacement', technician: 'Saad Al-Otaibi', cost: 890, status: 'Warranty Claim' },
  { id: 'WO-8650', date: '2025-07-01', vehicle: '2021 Honda Accord', service: 'Battery Replacement', technician: 'Mohammed Al-Zahrani', cost: 520, status: 'Completed' },
  { id: 'WO-8612', date: '2025-06-18', vehicle: '2022 Toyota Camry', service: 'Transmission Fluid Change', technician: 'Ahmed Al-Farsi', cost: 680, status: 'Completed' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Warranty Claim': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

export function ClientPortalServiceHistory() {
  const { t } = usePreferences()

  const columns: Column<ServiceRecord>[] = [
    { header: t('Work Order'), cell: (s) => s.id },
    { header: t('Date'), cell: (s) => s.date },
    { header: t('Vehicle'), cell: (s) => s.vehicle },
    { header: t('Service'), cell: (s) => s.service },
    { header: t('Technician'), cell: (s) => s.technician },
    { header: t('Cost'), cell: (s) => <Money sar={s.cost} /> },
    { header: t('Status'), cell: (s) => <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="History" title={t('Service History')} subtitle={t('Complete service timeline')} />

      <DataTable
        caption="Client service history"
        columns={columns}
        rows={SERVICE_HISTORY}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.service} trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>} />
            <MobileCardRow label={t('Date')}>{s.date}</MobileCardRow>
            <MobileCardRow label={t('Vehicle')}>{s.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Cost')}><Money sar={s.cost} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
