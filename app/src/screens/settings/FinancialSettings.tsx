import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { SettingsShell } from '@/screens/admin/SettingsShell'

/** Financial configuration — currency, numbering, terms, tax. Read-only here:
 *  a rate or a numbering change is a configuration change applied server-side
 *  to new documents (§A37), and no endpoint exposes it yet. */
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
  const { live } = useSession()

  return (
    <SettingsShell
      title="Financial Settings"
      icon="Landmark"
      subtitle="Financial configuration"
      readOnly={
        live
          ? 'Financial configuration is applied server-side to new documents.'
          : 'Platform defaults — a financial configuration endpoint is not connected yet.'
      }
    >
      <Card className="rounded-2xl p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
            <Icon name="Landmark" size={16} />
          </span>
          <h2 className="text-sm font-semibold text-heading">{t('Configuration')}</h2>
        </div>
        <dl className="m-0 grid gap-4">
          {SETTINGS.map((s) => (
            <div
              key={s.label}
              className="flex min-h-[44px] items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted">{t(s.label)}</dt>
              <dd dir="ltr" className="m-0 font-mono text-sm font-medium text-heading">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </SettingsShell>
  )
}
