import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface SoftwareTool {
  name: string
  version: string
  category: 'Diagnostics' | 'Programming' | 'Calibration' | 'Reporting'
  makes: string
  licenseExpiry: string
  status: 'Active' | 'Update Available' | 'Expired'
}

const SOFTWARE_TOOLS: SoftwareTool[] = [
  { name: 'Toyota Techstream', version: '17.30.011', category: 'Diagnostics', makes: 'Toyota, Lexus', licenseExpiry: '2026-03-15', status: 'Active' },
  { name: 'Honda HDS', version: '3.105.028', category: 'Diagnostics', makes: 'Honda, Acura', licenseExpiry: '2026-01-31', status: 'Active' },
  { name: 'Hyundai GDS', version: '2.42', category: 'Diagnostics', makes: 'Hyundai, Kia', licenseExpiry: '2025-12-31', status: 'Update Available' },
  { name: 'Autel MaxiSys', version: '2.90', category: 'Diagnostics', makes: 'Multi-brand', licenseExpiry: '2026-06-30', status: 'Active' },
  { name: 'ADAS Calibration Suite', version: '4.1.2', category: 'Calibration', makes: 'Multi-brand', licenseExpiry: '2025-11-30', status: 'Active' },
  { name: 'Nissan CONSULT', version: '4.31.10', category: 'Programming', makes: 'Nissan, Infiniti', licenseExpiry: '2025-08-01', status: 'Expired' },
  { name: 'Workshop Reporter', version: '1.8.0', category: 'Reporting', makes: 'N/A', licenseExpiry: '2026-12-31', status: 'Active' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Update Available': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Expired: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

const CATEGORY_ICONS: Record<string, string> = {
  Diagnostics: 'Search',
  Programming: 'Code',
  Calibration: 'Target',
  Reporting: 'BarChart',
}

export function TechnicianPortalSoftware() {
  const { t } = usePreferences()

  const columns: Column<SoftwareTool>[] = [
    { header: t('Software'), cell: (s) => s.name },
    { header: t('Version'), cell: (s) => `v${s.version}` },
    { header: t('Category'), cell: (s) => (
      <div className="flex items-center gap-1.5">
        <Icon name={CATEGORY_ICONS[s.category]} size={14} className="text-muted" />
        <span>{t(s.category)}</span>
      </div>
    ) },
    { header: t('Makes'), cell: (s) => s.makes },
    { header: t('License Expiry'), cell: (s) => s.licenseExpiry },
    { header: t('Status'), cell: (s) => <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Diagnostic Software')} subtitle={t('Software tools and license management')} />

      <DataTable
        caption="Diagnostic software tools"
        columns={columns}
        rows={SOFTWARE_TOOLS}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.name} trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>} />
            <MobileCardRow label={t('Version')}>v{s.version}</MobileCardRow>
            <MobileCardRow label={t('Category')}>{t(s.category)}</MobileCardRow>
            <MobileCardRow label={t('License Expiry')}>{s.licenseExpiry}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
