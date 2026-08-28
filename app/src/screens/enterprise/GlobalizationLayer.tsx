import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'

interface LocaleConfig {
  language: string
  code: string
  direction: 'LTR' | 'RTL'
  coverage: number
  status: 'Complete' | 'In Progress' | 'Planned'
}

const LOCALES: LocaleConfig[] = [
  { language: 'Arabic', code: 'ar-SA', direction: 'RTL', coverage: 100, status: 'Complete' },
  { language: 'English', code: 'en-US', direction: 'LTR', coverage: 100, status: 'Complete' },
  { language: 'French', code: 'fr-FR', direction: 'LTR', coverage: 85, status: 'In Progress' },
  { language: 'Urdu', code: 'ur-PK', direction: 'RTL', coverage: 72, status: 'In Progress' },
  { language: 'Hindi', code: 'hi-IN', direction: 'LTR', coverage: 45, status: 'In Progress' },
  { language: 'Turkish', code: 'tr-TR', direction: 'LTR', coverage: 0, status: 'Planned' },
]

interface CurrencyConfig {
  currency: string
  code: string
  symbol: string
  region: string
  active: boolean
}

const CURRENCIES: CurrencyConfig[] = [
  { currency: 'Saudi Riyal', code: 'SAR', symbol: 'SR', region: 'Saudi Arabia', active: true },
  { currency: 'UAE Dirham', code: 'AED', symbol: 'AED', region: 'UAE', active: true },
  { currency: 'Kuwaiti Dinar', code: 'KWD', symbol: 'KD', region: 'Kuwait', active: true },
  { currency: 'Bahraini Dinar', code: 'BHD', symbol: 'BD', region: 'Bahrain', active: false },
  { currency: 'Omani Rial', code: 'OMR', symbol: 'OMR', region: 'Oman', active: false },
  { currency: 'Qatari Riyal', code: 'QAR', symbol: 'QR', region: 'Qatar', active: true },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Complete: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'In Progress': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Planned: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
}

export function GlobalizationLayer() {
  const { t } = usePreferences()

  const localeColumns: Column<LocaleConfig>[] = [
    { header: 'Language', cell: (locale) => <span className="font-semibold text-heading">{locale.language}</span> },
    { header: 'Code', cell: (locale) => locale.code, code: true },
    {
      header: 'Direction',
      cell: (locale) => (
        <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{locale.direction}</Badge>
      ),
    },
    {
      header: 'Coverage',
      cell: (locale) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-secondary">
            <div className="h-full rounded-full bg-salis-blue" style={{ width: `${locale.coverage}%` }} />
          </div>
          <span className="text-xs text-muted">{locale.coverage}%</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (locale) => (
        <Badge background={STATUS_STYLES[locale.status].bg} color={STATUS_STYLES[locale.status].fg}>{t(locale.status)}</Badge>
      ),
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Globe" title={t('Globalization Layer')} subtitle={t('Language, currency and regional settings')} />

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Languages & Translations')}</p>
        <DataTable
          caption="Languages and translations"
          columns={localeColumns}
          rows={LOCALES}
          rowKey={(locale) => locale.code}
          empty={t('No languages configured')}
          mobileCard={(locale) => (
            <>
              <MobileCardHeader
                title={locale.language}
                trailing={<Badge background={STATUS_STYLES[locale.status].bg} color={STATUS_STYLES[locale.status].fg}>{t(locale.status)}</Badge>}
              />
              <MobileCardRow label={t('Code')} value={locale.code} />
              <MobileCardRow label={t('Direction')} value={locale.direction} />
              <MobileCardRow label={t('Coverage')} value={`${locale.coverage}%`} />
            </>
          )}
        />
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Supported Currencies')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CURRENCIES.map((cur, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <span className="flex rounded-xl p-2.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name="Coins" size={20} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">{cur.currency}</p>
                <p className="text-xs text-muted">{cur.code} ({cur.symbol}) - {cur.region}</p>
              </div>
              <Badge
                background={cur.active ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                color={cur.active ? 'var(--salis-blue)' : 'rgb(107,114,128)'}
              >
                {cur.active ? t('Active') : t('Inactive')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
