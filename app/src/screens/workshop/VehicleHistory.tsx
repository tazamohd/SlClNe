import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface ServiceRecord {
  date: string
  type: string
  technician: string
  status: string
  cost: number
}

function useRecords(t: (s: string) => string): ServiceRecord[] {
  return useMemo(
    () => [
      { date: '2026-08-10', type: t('Full Service'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 2800 },
      { date: '2026-07-15', type: t('Oil Change'), technician: t('Mohammed Saeed'), status: t('Completed'), cost: 450 },
      { date: '2026-06-20', type: t('Brake Inspection'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 1200 },
      { date: '2026-05-05', type: t('Tire Rotation'), technician: t('Khalid Omar'), status: t('Completed'), cost: 300 },
      { date: '2026-03-12', type: t('AC Service'), technician: t('Mohammed Saeed'), status: t('Completed'), cost: 850 },
      { date: '2026-01-20', type: t('Full Service'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 3200 },
    ],
    [t],
  )
}

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA')}`
}

export function VehicleHistory() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const records = useRecords(t)

  const totalSpent = records.reduce((s, r) => s + r.cost, 0)

  const columns: Column<ServiceRecord>[] = [
    { header: 'Date', cell: (r) => r.date, code: true },
    { header: 'Service Type', cell: (r) => r.type },
    { header: 'Technician', cell: (r) => r.technician },
    { header: 'Cost', cell: (r) => <span className="font-mono font-medium" dir="ltr">{fmtSar(r.cost)}</span> },
    { header: 'Status', cell: (r) => <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Service timeline"
      columns={columns}
      rows={records}
      rowKey={(_, i) => `record-${i}`}
      mobileCard={(r) => (
        <>
          <MobileCardHeader title={r.type} trailing={<Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status}</Badge>} />
          <MobileCardRow label={t('Date')}>{r.date}</MobileCardRow>
          <MobileCardRow label={t('Cost')}><span dir="ltr">{fmtSar(r.cost)}</span></MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="History" title={t('Vehicle History')} subtitle={t('Service Records')} />
        <MobileCard>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t('Total Spent')}</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(totalSpent)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted">{t('Total Services')}</span>
            <span className="font-mono text-sm font-bold text-heading">{records.length}</span>
          </div>
        </MobileCard>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="History" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Vehicle History')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Service Records')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="DollarSign" size={16} /></span>
            <span className="text-xs font-medium text-muted">{t('Total Spent')}</span>
          </div>
          <h4 dir="ltr" className="mt-2 font-mono text-xl font-black text-heading">{fmtSar(totalSpent)}</h4>
        </Card>
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(11,179,255,.1)] text-salis-bright" aria-hidden><Icon name="ClipboardList" size={16} /></span>
            <span className="text-xs font-medium text-muted">{t('Total Services')}</span>
          </div>
          <h4 className="mt-2 font-display text-xl font-black text-heading">{records.length}</h4>
        </Card>
      </div>

      {table}
    </div>
  )
}
