import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Active: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'Update Available': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Expired: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const CATEGORY_ICONS: Record<string, string> = {
  Diagnostics: 'Search',
  Programming: 'Code',
  Calibration: 'Target',
  Reporting: 'BarChart',
}

export function TechnicianPortalSoftware() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Cpu" title={t('Diagnostic Software')} subtitle={t('Tools and licenses')} />
        {SOFTWARE_TOOLS.map((s, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={CATEGORY_ICONS[s.category]} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{s.name}</p>
                    <p className="text-xs text-muted">v{s.version}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(s.category)} />
            <MobileCardRow label={t('Makes')} value={s.makes} />
            <MobileCardRow label={t('License Expiry')} value={s.licenseExpiry} />
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
            <Icon name="Cpu" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Diagnostic Software')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Software tools and license management')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Software')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Version')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Makes')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('License Expiry')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {SOFTWARE_TOOLS.map((s, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{s.name}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">v{s.version}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={CATEGORY_ICONS[s.category]} size={14} className="text-muted" />
                      <span className="text-body">{t(s.category)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{s.makes}</td>
                  <td className="py-3 pe-4 text-body">{s.licenseExpiry}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>
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
