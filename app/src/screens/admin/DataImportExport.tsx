import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Operation {
  type: 'Import' | 'Export'
  entity: string
  format: 'CSV' | 'Excel'
  recordCount: number
  status: 'Completed' | 'Failed' | 'Processing'
  date: string
}

const OPERATIONS: Operation[] = [
  { type: 'Import', entity: 'Customers', format: 'CSV', recordCount: 245, status: 'Completed', date: 'Aug 18, 2026' },
  { type: 'Export', entity: 'Invoices', format: 'Excel', recordCount: 1820, status: 'Completed', date: 'Aug 17, 2026' },
  { type: 'Import', entity: 'Parts', format: 'CSV', recordCount: 530, status: 'Failed', date: 'Aug 16, 2026' },
  { type: 'Export', entity: 'Vehicles', format: 'CSV', recordCount: 890, status: 'Completed', date: 'Aug 15, 2026' },
  { type: 'Import', entity: 'Vehicles', format: 'Excel', recordCount: 120, status: 'Processing', date: 'Aug 18, 2026' },
  { type: 'Export', entity: 'Customers', format: 'Excel', recordCount: 2100, status: 'Completed', date: 'Aug 14, 2026' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Failed: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Processing: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

export function DataImportExport() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Imports'), value: '142', icon: 'Download', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Exports'), value: '98', icon: 'Upload', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Last Import'), value: 'Aug 18', icon: 'ArrowDownCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Last Export'), value: 'Aug 17', icon: 'ArrowUpCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Operation>[] = [
    {
      header: 'Type',
      cell: (op) => (
        <div className="flex items-center gap-1.5">
          <Icon name={op.type === 'Import' ? 'Download' : 'Upload'} size={14} className="text-salis-blue" />
          <span className="font-medium text-heading">{t(op.type)}</span>
        </div>
      ),
    },
    { header: 'Entity', cell: (op) => t(op.entity) },
    { header: 'Format', cell: (op) => <Badge background="var(--tint-neutral)" color="var(--text-muted)">{op.format}</Badge> },
    { header: 'Records', cell: (op) => <span className="font-mono text-heading">{op.recordCount.toLocaleString()}</span> },
    { header: 'Status', cell: (op) => <Badge background={STATUS_STYLES[op.status].bg} color={STATUS_STYLES[op.status].fg}>{t(op.status)}</Badge> },
    { header: 'Date', cell: (op) => <span className="text-muted">{op.date}</span> },
  ]

  const table = (
    <DataTable
      caption="Recent Operations"
      columns={columns}
      rows={OPERATIONS}
      rowKey={(_, i) => `op-${i}`}
      mobileCard={(op) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden>
                  <Icon name={op.type === 'Import' ? 'Download' : 'Upload'} size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{t(op.type)} - {t(op.entity)}</p>
                  <p className="text-xs text-muted">{op.date}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[op.status].bg} color={STATUS_STYLES[op.status].fg}>{t(op.status)}</Badge>}
          />
          <MobileCardRow label={t('Format')} value={op.format} />
          <MobileCardRow label={t('Records')} value={op.recordCount.toLocaleString()} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ArrowUpDown" title={t('Import / Export')} subtitle={t('Data operations')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ArrowUpDown" title={t('Data Import / Export')} subtitle={t('Import and export data operations')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
