import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Money } from '@/components/ui/Money'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
                <Badge background="rgba(245,158,11,.12)" color="#B45309">{t(s.value!)}</Badge>
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Heart" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Zakat Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Zakat configuration')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        <div className="grid gap-4">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{s.label}</span>
              {s.badge ? (
                <Badge background="rgba(245,158,11,.12)" color="#B45309">{t(s.value!)}</Badge>
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
