import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Integration {
  name: string
  description: string
  icon: string
  category: 'Payment' | 'Accounting' | 'Communication' | 'Government' | 'Cloud'
  status: 'Active' | 'Inactive' | 'Error'
  lastActivity: string
  version: string
}

const INTEGRATIONS: Integration[] = [
  { name: 'ZATCA e-Invoicing', description: 'Saudi tax authority electronic invoicing', icon: 'Receipt', category: 'Government', status: 'Active', lastActivity: '5 min ago', version: 'v3.1' },
  { name: 'Mada Payment Gateway', description: 'Debit card payment processing', icon: 'CreditCard', category: 'Payment', status: 'Active', lastActivity: '2 min ago', version: 'v2.4' },
  { name: 'STC Pay', description: 'Mobile wallet payment integration', icon: 'Wallet', category: 'Payment', status: 'Active', lastActivity: '15 min ago', version: 'v1.8' },
  { name: 'QuickBooks Online', description: 'Accounting and financial sync', icon: 'Calculator', category: 'Accounting', status: 'Active', lastActivity: '1 hour ago', version: 'v4.0' },
  { name: 'WhatsApp Business', description: 'Customer messaging and notifications', icon: 'MessageCircle', category: 'Communication', status: 'Active', lastActivity: '1 min ago', version: 'v2.1' },
  { name: 'Elm Absher', description: 'Vehicle registration verification', icon: 'ShieldCheck', category: 'Government', status: 'Active', lastActivity: '30 min ago', version: 'v1.3' },
  { name: 'AWS S3 Storage', description: 'Cloud file storage and backup', icon: 'Database', category: 'Cloud', status: 'Active', lastActivity: '10 min ago', version: 'v3.0' },
  { name: 'Xero Accounting', description: 'Alternative accounting platform', icon: 'FileSpreadsheet', category: 'Accounting', status: 'Inactive', lastActivity: 'Never', version: 'v2.2' },
  { name: 'Tabby', description: 'Buy now, pay later integration', icon: 'Coins', category: 'Payment', status: 'Error', lastActivity: '2 days ago', version: 'v1.5' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Inactive: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Error: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const CATEGORIES = ['Payment', 'Accounting', 'Communication', 'Government', 'Cloud'] as const

export function SystemIntegrations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="PlugZap" title={t('Integrations')} subtitle={t('System connections')} />
        {INTEGRATIONS.map((integration, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={integration.icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(integration.name)}</p>
                    <p className="text-xs text-muted">{t(integration.category)}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[integration.status].bg} color={STATUS_STYLES[integration.status].fg}>{t(integration.status)}</Badge>}
            />
            <MobileCardRow label={t('Last Activity')} value={integration.lastActivity} />
            <MobileCardRow label={t('Version')} value={integration.version} />
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
            <Icon name="PlugZap" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('System Integrations')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Third-party connections and API integrations')}</p>
        </div>
      </div>

      {CATEGORIES.map((category) => {
        const items = INTEGRATIONS.filter((int) => int.category === category)
        if (items.length === 0) return null
        return (
          <div key={category}>
            <p className="mb-3 text-sm font-bold text-heading">{t(category)}</p>
            <div className="grid grid-cols-2 gap-4">
              {items.map((integration, i) => (
                <Card key={i} className="rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex flex-shrink-0 rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                      <Icon name={integration.icon} size={20} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-heading">{t(integration.name)}</p>
                        <Badge background={STATUS_STYLES[integration.status].bg} color={STATUS_STYLES[integration.status].fg}>{t(integration.status)}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">{t(integration.description)}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                        <span>{integration.version}</span>
                        <span>{t('Last')}: {integration.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
