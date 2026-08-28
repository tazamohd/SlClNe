import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
          {rows.map((r) => (
            <MobileCardRow
              key={r.label}
              label={r.label}
            >
              {r.badge ? (
                <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t(r.value)}</Badge>
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
      <PageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        <div className="grid gap-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{r.label}</span>
              {r.badge ? (
                <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t(r.value)}</Badge>
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
