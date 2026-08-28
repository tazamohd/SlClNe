import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface InspectionRow {
  id: string
  vehicle: string
  plate: string
  date: string
  inspector: string
  result: string
  nextDue: string
}

function useRows(t: (s: string) => string): InspectionRow[] {
  return useMemo(
    () => [
      { id: 'INS-001', vehicle: t('Toyota Camry'), plate: 'ABC 1234', date: '2026-08-10', inspector: t('Ahmad Al-Harbi'), result: t('Pass'), nextDue: '2027-08-10' },
      { id: 'INS-002', vehicle: t('Honda Accord'), plate: 'XYZ 5678', date: '2026-08-08', inspector: t('Mohammed Saeed'), result: t('Pass'), nextDue: '2027-08-08' },
      { id: 'INS-003', vehicle: t('Hyundai Sonata'), plate: 'DEF 9012', date: '2026-08-05', inspector: t('Khalid Omar'), result: t('Fail'), nextDue: '2026-08-19' },
      { id: 'INS-004', vehicle: t('Nissan Altima'), plate: 'GHI 3456', date: '2026-07-28', inspector: t('Ahmad Al-Harbi'), result: t('Pass'), nextDue: '2027-07-28' },
      { id: 'INS-005', vehicle: t('Kia Optima'), plate: 'JKL 7890', date: '2026-07-20', inspector: t('Mohammed Saeed'), result: t('Conditional'), nextDue: '2026-10-20' },
    ],
    [t],
  )
}

export function VehicleInspections() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const rows = useRows(t)

  const passed = rows.filter((r) => r.result === t('Pass')).length
  const failed = rows.filter((r) => r.result === t('Fail')).length

  const kpis = [
    { label: t('Total Inspections'), value: String(rows.length), icon: 'ClipboardCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Passed'), value: String(passed), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Failed'), value: String(failed), icon: 'XCircle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  ]

  function resultBadge(result: string) {
    if (result === t('Pass')) return <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{result}</Badge>
    if (result === t('Fail')) return <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{result}</Badge>
    return <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{result}</Badge>
  }

  const columns: Column<InspectionRow>[] = [
    { header: 'ID', cell: (r) => r.id, code: true },
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Plate', cell: (r) => r.plate, code: true },
    { header: 'Date', cell: (r) => r.date, code: true },
    { header: 'Inspector', cell: (r) => r.inspector },
    { header: 'Result', cell: (r) => resultBadge(r.result) },
    { header: 'Next Due', cell: (r) => r.nextDue, code: true },
  ]

  const table = (
    <DataTable
      caption="Vehicle inspection records"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      mobileCard={(r) => (
        <>
          <MobileCardHeader title={r.vehicle} trailing={resultBadge(r.result)} />
          <MobileCardRow label={t('Plate')}>{r.plate}</MobileCardRow>
          <MobileCardRow label={t('Date')}>{r.date}</MobileCardRow>
          <MobileCardRow label={t('Inspector')}>{r.inspector}</MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ClipboardCheck" title={t('Vehicle Inspections')} subtitle={t('Workshop')} />
        <div className="grid grid-cols-3 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1 text-[11px] text-muted">{k.label}</p>
              <p className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ClipboardCheck" title={t('Vehicle Inspections')} subtitle={t('Workshop')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
