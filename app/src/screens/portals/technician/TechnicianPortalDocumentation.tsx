import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Manual: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  TSB: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Procedure: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Safety: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const FORMAT_ICONS: Record<string, string> = {
  PDF: 'FileText',
  Video: 'Play',
  Interactive: 'Monitor',
}

export function TechnicianPortalDocumentation() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BookOpen" title={t('Documentation')} subtitle={t('Manuals and guides')} />
        {DOCUMENTS.map((d, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={FORMAT_ICONS[d.format]} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{d.title}</p>
                    <p className="text-xs text-muted">{d.make}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={CATEGORY_STYLES[d.category].bg} color={CATEGORY_STYLES[d.category].fg}>{t(d.category)}</Badge>}
            />
            <MobileCardRow label={t('Format')} value={t(d.format)} />
            <MobileCardRow label={t('Updated')} value={d.lastUpdated} />
            {d.pages > 0 && <MobileCardRow label={t('Pages')} value={String(d.pages)} />}
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
            <Icon name="BookOpen" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Documentation')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Service manuals and technical guides')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Title')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Make')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Format')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Pages')}</th>
                <th className="pb-3 text-start font-medium">{t('Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((d, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{d.title}</td>
                  <td className="py-3 pe-4">
                    <Badge background={CATEGORY_STYLES[d.category].bg} color={CATEGORY_STYLES[d.category].fg}>{t(d.category)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">{d.make}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={FORMAT_ICONS[d.format]} size={14} className="text-muted" />
                      <span className="text-body">{t(d.format)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{d.pages > 0 ? d.pages : '--'}</td>
                  <td className="py-3 text-body">{d.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
