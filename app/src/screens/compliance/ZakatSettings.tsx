import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Money } from '@/components/ui/Money'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const CONFIG = {
  zakatRate: '2.5%',
  assessmentYear: '2026',
  zakatBase: 4850000,
  estimatedZakat: 121250,
  filingStatus: 'Pending',
}

export function ZakatSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const settings = [
    { label: t('Zakat Rate'), value: CONFIG.zakatRate },
    { label: t('Assessment Year'), value: CONFIG.assessmentYear },
    { label: t('Zakat Base'), money: CONFIG.zakatBase },
    { label: t('Estimated Zakat'), money: CONFIG.estimatedZakat },
    { label: t('Filing Status'), value: CONFIG.filingStatus, badge: true },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Heart" title={t('Zakat Settings')} subtitle={t('Zakat configuration')} />
        <MobileCard>
          {settings.map((s, i) => (
            <MobileCardRow key={i} label={s.label}>
              {s.badge ? (
                <Badge background="rgba(249,115,22,.12)" color="var(--salis-orange)">{t(s.value!)}</Badge>
              ) : s.money !== undefined ? (
                <Money sar={s.money} className="text-xs" />
              ) : (
                <span className="font-mono text-xs text-heading">{s.value}</span>
              )}
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Heart" title={t('Zakat Settings')} subtitle={t('Zakat configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        <div className="grid gap-4">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{s.label}</span>
              {s.badge ? (
                <Badge background="rgba(249,115,22,.12)" color="var(--salis-orange)">{t(s.value!)}</Badge>
              ) : s.money !== undefined ? (
                <span className="font-mono text-sm font-medium text-heading"><Money sar={s.money} /></span>
              ) : (
                <span className="font-mono text-sm font-medium text-heading">{s.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
