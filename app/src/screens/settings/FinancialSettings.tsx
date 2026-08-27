import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const SETTINGS = [
  { label: 'Default Currency', value: 'SAR' },
  { label: 'Fiscal Year Start', value: 'January 1' },
  { label: 'Invoice Prefix', value: 'INV-' },
  { label: 'Invoice Numbering', value: 'Sequential' },
  { label: 'Payment Terms', value: 'Net 30' },
  { label: 'Tax Rate', value: '15%' },
  { label: 'Rounding', value: '2 decimal places' },
]

export function FinancialSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Landmark" title={t('Financial Settings')} subtitle={t('Financial configuration')} />
        <MobileCard>
          {SETTINGS.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)} value={s.value} />
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Landmark" title={t('Financial Settings')} subtitle={t('Financial configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Landmark" size={16} /></span>
          <h2 className="text-sm font-semibold text-heading">{t('Configuration')}</h2>
        </div>
        <div className="grid gap-4">
          {SETTINGS.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{t(s.label)}</span>
              <span className="font-mono text-sm font-medium text-heading">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
