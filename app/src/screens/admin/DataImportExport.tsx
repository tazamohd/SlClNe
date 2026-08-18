import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Failed: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Processing: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function DataImportExport() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Imports'), value: '142', icon: 'Download', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Exports'), value: '98', icon: 'Upload', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Last Import'), value: 'Aug 18', icon: 'ArrowDownCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Last Export'), value: 'Aug 17', icon: 'ArrowUpCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

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
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {OPERATIONS.map((op, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden>
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
            <Icon name="ArrowUpDown" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Data Import / Export')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Import and export data operations')}</p>
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
        <h3 className="mb-4 text-base font-bold text-heading">{t('Recent Operations')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Entity')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Format')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Records')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-start font-medium">{t('Date')}</th>
              </tr>
            </thead>
            <tbody>
              {OPERATIONS.map((op, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={op.type === 'Import' ? 'Download' : 'Upload'} size={14} className="text-salis-blue" />
                      <span className="font-medium text-heading">{t(op.type)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{t(op.entity)}</td>
                  <td className="py-3 pe-4">
                    <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{op.format}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{op.recordCount.toLocaleString()}</td>
                  <td className="py-3 pe-4">
                    <Badge background={STATUS_STYLES[op.status].bg} color={STATUS_STYLES[op.status].fg}>{t(op.status)}</Badge>
                  </td>
                  <td className="py-3 text-muted">{op.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
