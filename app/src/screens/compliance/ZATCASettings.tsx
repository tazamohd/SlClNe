import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const SETTINGS = {
  organizationTin: '300075588700003',
  vatNumber: '311234567890003',
  integrationStatus: 'Connected',
  phase: 'Phase 2',
  lastSync: '2026-08-17 14:32',
}

export function ZATCASettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const rows = [
    { label: t('Organization TIN'), value: SETTINGS.organizationTin },
    { label: t('VAT Number'), value: SETTINGS.vatNumber },
    { label: t('Integration Status'), value: SETTINGS.integrationStatus, badge: true },
    { label: t('Phase'), value: SETTINGS.phase },
    { label: t('Last Sync'), value: SETTINGS.lastSync },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />
        <MobileCard>
          {rows.map((r, i) => (
            <MobileCardRow
              key={i}
              label={r.label}
            >
              {r.badge ? (
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t(r.value)}</Badge>
              ) : (
                <span className="font-mono text-xs text-heading">{r.value}</span>
              )}
            </MobileCardRow>
          ))}
        </MobileCard>
        <button
          type="button"
          disabled={!isLive}
          className="rounded-xl bg-salis-blue px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {t('Test Connection')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="FileCheck" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('ZATCA Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('E-invoicing configuration')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        <div className="grid gap-4">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{r.label}</span>
              {r.badge ? (
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t(r.value)}</Badge>
              ) : (
                <span className="font-mono text-sm font-medium text-heading">{r.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!isLive}
          className="rounded-xl bg-salis-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {t('Test Connection')}
        </button>
      </div>
    </div>
  )
}
