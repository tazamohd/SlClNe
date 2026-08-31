import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useCollection, type RowOf } from '@/data/useCollection'

/** The interactive 3D parts screen.
 *
 *  The catalogue beside the viewer is the parts collection read through the
 *  repository seam — real inventory in a live build, the design fixtures
 *  otherwise — rather than six part models typed into this file.
 *
 *  What that record does not carry is named rather than invented. A part row is
 *  a name, a SKU, a quantity and a reorder level; it says nothing about a
 *  category, which vehicles a part fits, how often its model has been opened,
 *  or whether a 3D model exists for it at all. Those belong to a parts-catalogue
 *  service that is not connected, so the panel lists them as absent instead of
 *  showing numbers nobody measured. */

type Part = RowOf<'parts'>

/** Stock standing, read from the row rather than asserted: `stock` and
 *  `reorder` are both server figures, and this is the same comparison the
 *  Inventory screen makes for its low-stock list. */
function stockStanding(part: Part): { label: string; bg: string; fg: string } {
  if (part.stock <= 0) {
    return { label: 'Out of Stock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' }
  }
  if (part.stock <= part.reorder) {
    return { label: 'Low Stock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' }
  }
  return { label: 'In Stock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' }
}

function StockBadge({ part }: { part: Part }) {
  const { t } = usePreferences()
  const standing = stockStanding(part)
  return (
    <Badge background={standing.bg} color={standing.fg}>
      {t(standing.label)}
    </Badge>
  )
}

/** The catalogue fields the design showed and the inventory record has no
 *  column for. Named, with the row the catalogue is actually read from, so the
 *  gap is visible instead of being filled in with plausible values. */
function CatalogGapNotice() {
  const { t } = usePreferences()
  const gaps = [
    { icon: 'Tag', label: t('Category') },
    { icon: 'Car', label: t('Fits') },
    { icon: 'Eye', label: t('Views') },
    { icon: 'Boxes', label: t('3D Viewer') },
  ]
  return (
    <div role="note" className="rounded-xl border border-border bg-inset p-3">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-heading">
        <Icon name="Info" size={14} className="flex-shrink-0 text-salis-blue" />
        {t('Not recorded in this dataset')}
      </p>
      <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
        {gaps.map((gap) => (
          <li key={gap.label} className="flex items-center gap-2 text-[12px] text-body">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-card text-muted">
              <Icon name={gap.icon} size={12} />
            </span>
            {gap.label}
            <span className="ms-auto font-action text-[10px] font-semibold text-muted">
              {t('Not connected')}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
        <Icon name="Database" size={12} className="flex-shrink-0" />
        <span dir="ltr" className="font-mono">
          GET /inventory
        </span>
      </p>
    </div>
  )
}

export function Interactive3DParts() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: parts = [], isLoading, isError, error, refetch } = useCollection('parts')

  const empty = <EmptyState icon="Package" title={t('No parts listed')} />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Boxes" title={t('3D Parts Viewer')} subtitle={t('Interactive models')} />
        <MobileCard>
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="flex rounded-2xl p-4 bg-tint-blue text-salis-blue" aria-hidden>
              <Icon name="Boxes" size={32} />
            </span>
            <p className="text-sm font-semibold text-heading">{t('3D Viewer')}</p>
            <p className="text-center text-xs text-muted">{t('Select a part below to view its interactive 3D model')}</p>
          </div>
        </MobileCard>
        <CatalogGapNotice />
        {isLoading ? (
          <MobileCard>
            <Loading label="Loading parts..." />
          </MobileCard>
        ) : isError ? (
          <MobileCard>
            <ErrorState description={error?.message} onRetry={() => void refetch()} />
          </MobileCard>
        ) : parts.length === 0 ? (
          <MobileCard>{empty}</MobileCard>
        ) : (
          parts.map((part) => (
            <MobileCard key={part.sku}>
              <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
              <MobileCardRow label={t('Part No.')} value={part.sku} />
              <MobileCardRow label={t('Stock')} value={part.stock.toLocaleString()} />
              <MobileCardRow label={t('Reorder Level')} value={part.reorder.toLocaleString()} />
            </MobileCard>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Boxes" title={t('Interactive 3D Parts')} subtitle={t('Explore parts with interactive 3D models')} />

      <div className="flex gap-4">
        <Card className="flex flex-1 flex-col items-center justify-center rounded-2xl p-12 shadow-sm">
          <span className="flex rounded-2xl bg-tint-blue p-5 text-salis-blue" aria-hidden>
            <Icon name="Boxes" size={48} />
          </span>
          <p className="mt-4 text-lg font-bold text-heading">{t('3D Part Viewer')}</p>
          <p className="mt-1 text-sm text-muted">{t('Select a part from the catalog to load its 3D model')}</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-secondary px-4 py-2 text-sm text-muted">
            <Icon name="Info" size={14} />
            <span>{t('Rotate, zoom, and inspect parts in real-time')}</span>
          </div>
        </Card>

        <Card className="flex w-80 flex-shrink-0 flex-col gap-3 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-heading">{t('Parts Catalog')}</p>
          {isLoading ? (
            <Loading label="Loading parts..." />
          ) : isError ? (
            <ErrorState description={error?.message} onRetry={() => void refetch()} />
          ) : parts.length === 0 ? (
            empty
          ) : (
            <div className="flex flex-col gap-2">
              {parts.map((part) => (
                <div
                  key={part.sku}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-secondary"
                >
                  <span className="flex flex-shrink-0 rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name="Package" size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{part.name}</p>
                    <p className="truncate font-mono text-xs text-muted" dir="ltr">
                      {part.sku}
                    </p>
                  </div>
                  <StockBadge part={part} />
                </div>
              ))}
            </div>
          )}
          <CatalogGapNotice />
        </Card>
      </div>
    </div>
  )
}
