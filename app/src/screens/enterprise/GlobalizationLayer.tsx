import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Complete: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'In Progress': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Planned: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function GlobalizationLayer() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Globe" title={t('Globalization')} subtitle={t('Localization settings')} />
        <p className="text-xs font-bold text-heading">{t('Languages')}</p>
        {LOCALES.map((locale, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={locale.language}
              trailing={<Badge background={STATUS_STYLES[locale.status].bg} color={STATUS_STYLES[locale.status].fg}>{t(locale.status)}</Badge>}
            />
            <MobileCardRow label={t('Code')} value={locale.code} />
            <MobileCardRow label={t('Direction')} value={locale.direction} />
            <MobileCardRow label={t('Coverage')} value={`${locale.coverage}%`} />
          </MobileCard>
        ))}
        <p className="mt-2 text-xs font-bold text-heading">{t('Currencies')}</p>
        {CURRENCIES.map((cur, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={`${cur.currency} (${cur.symbol})`}
              trailing={
                <Badge
                  background={cur.active ? 'rgba(10,94,215,.1)' : 'rgba(107,114,128,.1)'}
                  color={cur.active ? 'var(--salis-blue)' : 'rgb(107,114,128)'}
                >
                  {cur.active ? t('Active') : t('Inactive')}
                </Badge>
              }
            />
            <MobileCardRow label={t('Code')} value={cur.code} />
            <MobileCardRow label={t('Region')} value={cur.region} />
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
            <Icon name="Globe" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Globalization Layer')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Language, currency and regional settings')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Languages & Translations')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('Language')}</th>
                <th className="pb-3 font-medium">{t('Code')}</th>
                <th className="pb-3 font-medium">{t('Direction')}</th>
                <th className="pb-3 font-medium">{t('Coverage')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {LOCALES.map((locale, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 font-semibold text-heading">{locale.language}</td>
                  <td className="py-3 font-mono text-xs text-body">{locale.code}</td>
                  <td className="py-3">
                    <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{locale.direction}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-secondary">
                        <div className="h-full rounded-full bg-salis-blue" style={{ width: `${locale.coverage}%` }} />
                      </div>
                      <span className="text-xs text-muted">{locale.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[locale.status].bg} color={STATUS_STYLES[locale.status].fg}>{t(locale.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Supported Currencies')}</p>
        <div className="grid grid-cols-3 gap-4">
          {CURRENCIES.map((cur, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name="Coins" size={20} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">{cur.currency}</p>
                <p className="text-xs text-muted">{cur.code} ({cur.symbol}) - {cur.region}</p>
              </div>
              <Badge
                background={cur.active ? 'rgba(10,94,215,.1)' : 'rgba(107,114,128,.1)'}
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
