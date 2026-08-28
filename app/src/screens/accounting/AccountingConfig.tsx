import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface ConfigItem {
  label: string
  value: string
  description: string
  icon: string
}

const MOCK_CONFIG: readonly ConfigItem[] = [
  { label: 'Fiscal Year Start', value: 'January 1', description: 'Start of the financial year for reporting', icon: 'Calendar' },
  { label: 'Chart of Accounts Template', value: 'Saudi Standard (SOCPA)', description: 'Template used for the chart of accounts structure', icon: 'BookOpen' },
  { label: 'Default Currency', value: 'SAR – Saudi Riyal', description: 'Primary currency for all transactions', icon: 'Banknote' },
  { label: 'Depreciation Method', value: 'Straight Line', description: 'Method used to calculate asset depreciation', icon: 'TrendingUp' },
  { label: 'Auto-Reconciliation', value: 'Enabled', description: 'Automatically reconcile bank transactions when matched', icon: 'ShieldCheck' },
  { label: 'Rounding Precision', value: '2 Decimals', description: 'Number of decimal places for monetary amounts', icon: 'Settings' },
]

export function AccountingConfig() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Settings"
          title={t('Accounting Settings')}
          subtitle={t('Accounting')}
        />
        <div className="flex flex-col gap-3">
          {MOCK_CONFIG.map((item) => (
            <MobileCard key={item.label}>
              <div className="flex items-center gap-2">
                <span
                  className="flex rounded-lg p-1.5"
                  style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }}
                  aria-hidden
                >
                  <Icon name={item.icon} size={14} />
                </span>
                <span className="text-[13px] font-semibold text-heading">{t(item.label)}</span>
              </div>
              <MobileCardRow label={t('Value')}>
                <span className="font-medium text-heading">{t(item.value)}</span>
              </MobileCardRow>
              <p className="text-[12px] text-muted">{t(item.description)}</p>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Settings"
        title={t('Accounting Settings')}
        subtitle={t('Configure accounting defaults and preferences')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_CONFIG.map((item) => (
          <Card key={item.label} className="flex flex-col gap-3 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className="flex rounded-lg p-2"
                style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }}
                aria-hidden
              >
                <Icon name={item.icon} size={18} />
              </span>
              <span className="text-sm font-bold text-heading">{t(item.label)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-inset px-3 py-2.5">
              <span className="text-[13px] font-semibold text-heading">{t(item.value)}</span>
            </div>
            <p className="text-[12px] leading-relaxed text-muted">{t(item.description)}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
