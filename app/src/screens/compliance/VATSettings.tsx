import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Money } from '@/components/ui/Money'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const CONFIG = {
  vatRate: '15%',
  vatNumber: '311234567890003',
  filingFrequency: 'Quarterly',
  nextFilingDate: '2026-09-30',
  autoCalculate: true,
}

const SUMMARY = {
  totalCollected: 187500,
  totalPaid: 62300,
  netVat: 125200,
}

export function VATSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const settings = [
    { label: t('VAT Rate'), value: CONFIG.vatRate },
    { label: t('VAT Number'), value: CONFIG.vatNumber },
    { label: t('Filing Frequency'), value: CONFIG.filingFrequency },
    { label: t('Next Filing Date'), value: CONFIG.nextFilingDate },
    { label: t('Auto-calculate'), value: CONFIG.autoCalculate ? t('Enabled') : t('Disabled'), badge: true },
  ]

  const summaryRows = [
    { label: t('Total VAT Collected'), amount: SUMMARY.totalCollected, bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'TrendingUp' },
    { label: t('Total VAT Paid'), amount: SUMMARY.totalPaid, bg: 'rgba(249,115,22,.12)', fg: 'var(--salis-orange)', icon: 'TrendingDown' },
    { label: t('Net VAT'), amount: SUMMARY.netVat, bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'DollarSign' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Receipt" title={t('VAT Settings')} subtitle={t('VAT configuration')} />
        <MobileCard>
          {settings.map((s, i) => (
            <MobileCardRow key={i} label={s.label}>
              {s.badge ? (
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{s.value}</Badge>
              ) : (
                <span className="font-mono text-xs text-heading">{s.value}</span>
              )}
            </MobileCardRow>
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader
            leading={<p className="text-[13px] font-semibold text-heading">{t('VAT Summary')}</p>}
          />
          {summaryRows.map((s, i) => (
            <MobileCardRow key={i} label={s.label}>
              <Money sar={s.amount} className="text-xs" />
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Receipt" title={t('VAT Settings')} subtitle={t('VAT configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        <div className="grid gap-4">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{s.label}</span>
              {s.badge ? (
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{s.value}</Badge>
              ) : (
                <span className="font-mono text-sm font-medium text-heading">{s.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {summaryRows.map((s) => (
          <Card key={s.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: s.bg, color: s.fg }} aria-hidden><Icon name={s.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{s.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">
              <Money sar={s.amount} />
            </h4>
          </Card>
        ))}
      </div>
    </div>
  )
}
