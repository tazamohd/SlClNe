import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useCollection, type RowOf } from '@/data/useCollection'
import { derived, rowId } from '@/screens/registry/writes'

/** The purchase agent's supplier directory.
 *
 *  Read through the repository seam from `suppliers` — the same vendor
 *  directory a purchase order references by id, so the agent browses the rows
 *  the order will actually be raised against rather than eight vendors typed
 *  into this file. A build with no API configured has no suppliers on file, and
 *  the screen says that plainly instead of showing a directory that is not
 *  there.
 *
 *  The design's Category, City, Rating, Orders and Avg Delivery columns have no
 *  column behind them: a supplier row is a code, a name, a contact and an
 *  active flag. A rating in particular is an aggregate over order history that
 *  no endpoint computes. They are listed as absent below rather than filled in
 *  with numbers nobody measured, and the counts above are counts of the rows on
 *  screen — not a claim about the whole directory. */

type Supplier = RowOf<'suppliers'>

/** The columns the design showed that `GET /procurement/suppliers` does not
 *  carry. */
function DirectoryGapNotice() {
  const { t } = usePreferences()
  const gaps = [
    { icon: 'Tag', label: t('Category') },
    { icon: 'MapPin', label: t('City') },
    { icon: 'Star', label: t('Rating') },
    { icon: 'ShoppingCart', label: t('Orders') },
    { icon: 'Truck', label: t('Avg Delivery') },
  ]
  return (
    <Card role="note" className="rounded-xl p-4 shadow-sm">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-heading">
        <Icon name="Info" size={15} className="flex-shrink-0 text-salis-blue" />
        {t('Not recorded in this dataset')}
      </p>
      <ul className="mt-2.5 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {gaps.map((gap) => (
          <li key={gap.label} className="flex items-center gap-2 text-[12px] text-body">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-inset text-muted">
              <Icon name={gap.icon} size={13} />
            </span>
            {gap.label}
            <span className="ms-auto font-action text-[10px] font-semibold text-muted">
              {t('Not connected')}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted">
        <Icon name="Database" size={12} className="flex-shrink-0" />
        <span dir="ltr" className="font-mono">
          GET /procurement/suppliers
        </span>
      </p>
    </Card>
  )
}

function StatusBadge({ supplier }: { supplier: Supplier }) {
  const { t } = usePreferences()
  const active = supplier.status === 'active'
  return (
    <Badge
      background={active ? 'var(--tint-blue)' : 'var(--tint-orange)'}
      color={active ? 'var(--salis-blue)' : 'var(--salis-orange)'}
    >
      {active ? t('Active') : t('Inactive')}
    </Badge>
  )
}

export function PurchaseAgentSuppliers() {
  const { t, rtl } = usePreferences()
  const { data: suppliers = [], isLoading, isError, error, refetch } = useCollection('suppliers')

  const active = suppliers.filter((s) => s.status === 'active').length

  const kpis = [
    {
      label: t('Total Suppliers'),
      value: String(suppliers.length),
      icon: 'Building2',
      bg: 'var(--tint-blue)',
      fg: 'var(--salis-blue)',
    },
    {
      label: t('Active Suppliers'),
      value: String(active),
      icon: 'CheckCircle',
      bg: 'var(--tint-bright)',
      fg: 'var(--salis-blue-bright)',
    },
    {
      label: t('Inactive'),
      value: String(suppliers.length - active),
      icon: 'XCircle',
      bg: 'var(--tint-orange)',
      fg: 'var(--salis-orange)',
    },
  ]

  const name = (s: Supplier) => (rtl && s.nameAr ? s.nameAr : s.name)

  const columns: Column<Supplier>[] = [
    { header: 'Supplier', cell: (s) => name(s) },
    { header: 'Code', cell: (s) => s.code, code: true },
    { header: 'Contact', cell: (s) => derived(s.contact) },
    { header: 'Phone', cell: (s) => derived(s.contactPhone), code: true },
    { header: 'Email', cell: (s) => derived(s.contactEmail) },
    { header: 'Status', cell: (s) => <StatusBadge supplier={s} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Building2" title={t('Supplier Directory')} subtitle={t('Browse and manage approved suppliers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DirectoryGapNotice />

      {isError ? (
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <DataTable
          caption="Supplier directory"
          columns={columns}
          rows={suppliers}
          rowKey={(s) => rowId(s) ?? s.code}
          loading={isLoading}
          empty={<EmptyState icon="Building2" title={t('No suppliers on file yet')} />}
          mobileCard={(s) => (
            <>
              <MobileCardHeader title={name(s)} trailing={<StatusBadge supplier={s} />} />
              <MobileCardRow label={t('Code')}>
                <span className="font-mono" dir="ltr">
                  {s.code}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Contact')}>{derived(s.contact)}</MobileCardRow>
              <MobileCardRow label={t('Phone')}>
                <span className="font-mono" dir="ltr">
                  {derived(s.contactPhone)}
                </span>
              </MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
