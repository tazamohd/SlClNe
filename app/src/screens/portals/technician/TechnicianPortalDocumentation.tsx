import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Document {
  title: string
  category: 'Manual' | 'TSB' | 'Procedure' | 'Safety'
  make: string
  lastUpdated: string
  pages: number
  format: 'PDF' | 'Video' | 'Interactive'
}

const DOCUMENTS: Document[] = [
  { title: 'Toyota Engine Diagnostics Guide', category: 'Manual', make: 'Toyota', lastUpdated: '2025-07-01', pages: 245, format: 'PDF' },
  { title: 'Honda Hybrid Battery Service', category: 'TSB', make: 'Honda', lastUpdated: '2025-08-10', pages: 18, format: 'PDF' },
  { title: 'Brake System Overhaul Procedure', category: 'Procedure', make: 'General', lastUpdated: '2025-06-15', pages: 32, format: 'Interactive' },
  { title: 'Hyundai SmartSense Calibration', category: 'TSB', make: 'Hyundai', lastUpdated: '2025-08-05', pages: 12, format: 'PDF' },
  { title: 'Workshop Safety Guidelines', category: 'Safety', make: 'General', lastUpdated: '2025-01-01', pages: 28, format: 'PDF' },
  { title: 'AC System Diagnostics Training', category: 'Procedure', make: 'General', lastUpdated: '2025-05-20', pages: 0, format: 'Video' },
  { title: 'Nissan CVT Transmission Service', category: 'Manual', make: 'Nissan', lastUpdated: '2025-04-12', pages: 156, format: 'PDF' },
]

const CATEGORY_STYLES: Record<string, { bg: string; fg: string }> = {
  Manual: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  TSB: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Procedure: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  Safety: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

const FORMAT_ICONS: Record<string, string> = {
  PDF: 'FileText',
  Video: 'Play',
  Interactive: 'Monitor',
}

export function TechnicianPortalDocumentation() {
  const { t } = usePreferences()

  const columns: Column<Document>[] = [
    { header: t('Title'), cell: (d) => d.title },
    { header: t('Category'), cell: (d) => <Badge background={CATEGORY_STYLES[d.category].bg} color={CATEGORY_STYLES[d.category].fg}>{t(d.category)}</Badge> },
    { header: t('Make'), cell: (d) => d.make },
    { header: t('Format'), cell: (d) => (
      <div className="flex items-center gap-1.5">
        <Icon name={FORMAT_ICONS[d.format]} size={14} className="text-muted" />
        <span>{t(d.format)}</span>
      </div>
    ) },
    { header: t('Pages'), cell: (d) => d.pages > 0 ? d.pages : '--' },
    { header: t('Updated'), cell: (d) => d.lastUpdated },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BookOpen" title={t('Documentation')} subtitle={t('Service manuals and technical guides')} />

      <DataTable
        caption="Service documentation"
        columns={columns}
        rows={DOCUMENTS}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={d.title} trailing={<Badge background={CATEGORY_STYLES[d.category].bg} color={CATEGORY_STYLES[d.category].fg}>{t(d.category)}</Badge>} />
            <MobileCardRow label={t('Make')}>{d.make}</MobileCardRow>
            <MobileCardRow label={t('Format')}>{t(d.format)}</MobileCardRow>
            <MobileCardRow label={t('Updated')}>{d.lastUpdated}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
