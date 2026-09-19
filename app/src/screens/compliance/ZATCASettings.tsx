import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading, ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive, organizationInfo } from '@/data/repository'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

/** Shown only on a build with no server to call — see the module docstring
 *  below. A live build never falls back to this; it shows the real
 *  `organizations` row or an honest loading/error state instead. */
const DEMO_SETTINGS = {
  vatNumber: '311234567890003',
  crNumber: '1010123456',
}

interface Row {
  label: string
  value: string
  badge?: boolean
  configured?: boolean
}

/** Reads the caller's own tenant row (`GET /organization`) rather than the
 *  literal VAT/CR numbers this screen used to hardcode. `VAT Registration`
 *  is a real, derived signal — whether the org has a VAT number on file,
 *  exactly what `routes/invoices.ts` itself checks before it will issue an
 *  invoice — not a fabricated "Connected". The e-invoicing phase is a fact
 *  about this deployment (`invoices.ts`'s `zatcaQr` already emits the
 *  Phase-2 TLV/QR payload on every issued invoice), so it stays a static
 *  label rather than something read from a nonexistent live-sync process.
 *  There is no real ZATCA sandbox connectivity to test, so the screen no
 *  longer offers a "Test Connection" button that did nothing, and no "Last
 *  Sync" timestamp, which no real sync ever produced. */
export function ZATCASettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const query = useQuery({
    queryKey: ['organization-info'],
    queryFn: () => organizationInfo!.get(),
    enabled: isLive,
  })

  const vatNumber = isLive ? query.data?.vatNumber : DEMO_SETTINGS.vatNumber
  const crNumber = isLive ? query.data?.crNumber : DEMO_SETTINGS.crNumber
  const configured = Boolean(vatNumber)

  const rows: Row[] = [
    { label: t('VAT Number'), value: vatNumber ?? t('Not on file') },
    { label: t('CR No.'), value: crNumber ?? t('Not on file') },
    {
      label: t('VAT Registration'),
      value: configured ? t('Configured') : t('Not configured'),
      badge: true,
      configured,
    },
    { label: t('E-Invoicing Phase'), value: t('Phase 2') },
  ]

  const loading = isLive && query.isLoading
  const failed = isLive && query.isError

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />
        {loading ? (
          <Card className="p-4">
            <Loading label={t('Loading organization details...')} />
          </Card>
        ) : failed ? (
          <Card className="p-4">
            <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
          </Card>
        ) : (
          <MobileCard>
            {rows.map((r) => (
              <MobileCardRow key={r.label} label={r.label}>
                {r.badge ? (
                  <Badge
                    background={r.configured ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                    color={r.configured ? 'var(--salis-blue)' : 'var(--text-muted)'}
                  >
                    {r.value}
                  </Badge>
                ) : (
                  <span className="font-mono text-xs text-heading">{r.value}</span>
                )}
              </MobileCardRow>
            ))}
          </MobileCard>
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Configuration')}</h2>
        {loading ? (
          <Loading label={t('Loading organization details...')} />
        ) : failed ? (
          <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
        ) : (
          <div className="grid gap-4">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-muted">{r.label}</span>
                {r.badge ? (
                  <Badge
                    background={r.configured ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                    color={r.configured ? 'var(--salis-blue)' : 'var(--text-muted)'}
                  >
                    {r.value}
                  </Badge>
                ) : (
                  <span className="font-mono text-sm font-medium text-heading">{r.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
