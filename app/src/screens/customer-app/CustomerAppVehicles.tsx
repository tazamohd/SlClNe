import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { VehicleStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'

/** The customer app's garage, read through the repository seam.
 *
 *  Scope is the server's: the customer surface reads `vehicles` the way
 *  `CustomerPortal` does and never trims a list by identity in the browser — the
 *  rows a portal principal may see are decided by the API before they are sent.
 *
 *  ### What the collection does and does not carry
 *
 *  `plate`, `make` (the API's `make_model`, one string), `mileage`, `last` and
 *  `status` come from every build. Colour, the next service date and the
 *  insurance policy are **not columns of `vehicles` in any build** — not in the
 *  schema, not in the projection — so each renders the em dash `derived()` uses
 *  for "this record does not know" rather than a value made up to fill the card.
 *  If the API grows any of them the cell fills itself.
 *
 *  "Total Mileage" is a cross-record sum no endpoint computes; adding up the
 *  page the browser happens to hold would report one page as the garage, so it
 *  shows the em dash and the note names what would supply it. The vehicle count
 *  is the server's own `page.total`.
 */
type Vehicle = RowOf<'vehicles'> & {
  _id?: string
  /** Not projected by any build today — see the note above. */
  color?: string | null
  nextService?: string | null
  insurance?: string | null
}

function AggregateNote() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      {t('Server aggregate:')}{' '}
      <span dir="ltr" className="font-mono text-body">GET /vehicles/summary</span>
    </p>
  )
}

export function CustomerAppVehicles() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('vehicles')
  const rows = (data?.rows ?? []) as readonly Vehicle[]
  const total = data?.page.total

  const countOf = (status: string) => rows.filter((v) => v.status === status).length

  const kpis = [
    { label: t('My Vehicles'), value: total === undefined ? UNKNOWN : String(total), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Service'), value: String(countOf('service')), icon: 'Wrench', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Active'), value: String(countOf('active')), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Mileage'), value: UNKNOWN, icon: 'Gauge', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const empty = (
    <Card className="p-5">
      <EmptyState
        icon="Car"
        title={t('No vehicles on file')}
        description={t('Vehicles registered to you appear here.')}
      />
    </Card>
  )

  const failed = <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('My Vehicles')} subtitle={t('Vehicle management')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        <AggregateNote />
        {isLoading ? (
          <Loading label="Loading vehicles..." />
        ) : isError ? (
          failed
        ) : rows.length === 0 ? (
          empty
        ) : (
          rows.map((v, index) => (
            <MobileCard key={v._id ?? `${v.plate}-${index}`}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Car" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{derived(v.make)}</p>
                      <p className="text-xs text-muted" dir="ltr">{v.plate}</p>
                    </div>
                  </div>
                }
                trailing={<VehicleStatusBadge value={v.status} />}
              />
              <MobileCardRow label={t('Color')} value={derived(v.color)} />
              <MobileCardRow label={t('Mileage')} value={derived(v.mileage)} />
              <MobileCardRow label={t('Last Service')} value={derived(v.last && t(v.last))} />
              <MobileCardRow label={t('Next Service')} value={derived(v.nextService)} />
              <MobileCardRow label={t('Insurance')} value={derived(v.insurance)} />
            </MobileCard>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Car" title={t('My Vehicles')} subtitle={t('View and manage your registered vehicles')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <AggregateNote />

      {isLoading ? (
        <Loading label="Loading vehicles..." />
      ) : isError ? (
        failed
      ) : rows.length === 0 ? (
        empty
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((v, index) => (
            <Card key={v._id ?? `${v.plate}-${index}`} className="flex flex-col gap-4 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex rounded-xl bg-tint-blue p-2.5 text-salis-blue" aria-hidden><Icon name="Car" size={22} /></span>
                  <div>
                    <h2 className="font-display text-base font-bold text-heading">{derived(v.make)}</h2>
                    <p className="font-mono text-xs text-muted" dir="ltr">{v.plate}</p>
                  </div>
                </div>
                <VehicleStatusBadge value={v.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[13px]">
                <div>
                  <p className="text-xs text-muted">{t('Color')}</p>
                  <p className="mt-0.5 font-medium text-heading">{derived(v.color)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t('Mileage')}</p>
                  <p className="mt-0.5 font-mono font-medium text-heading" dir="ltr">{derived(v.mileage)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t('Last Service')}</p>
                  <p className="mt-0.5 text-body">{derived(v.last && t(v.last))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t('Next Service')}</p>
                  <p className="mt-0.5 text-body">{derived(v.nextService)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted">{t('Insurance')}</p>
                  <p className="mt-0.5 text-body">{derived(v.insurance)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
