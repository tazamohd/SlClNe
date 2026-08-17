import { useMemo, useState } from 'react'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Badge, PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** UI pattern-library screens (design project/UI.*.dc.html) — reference
 *  galleries for how a list/table/card view should look, wired into
 *  `APP_SCREENS` under /ui/list-view, /ui/table-view and /ui/card-view.
 *
 *  These render inside `AppShell` like any other screen, so no chrome of
 *  their own — just the pattern, built from the real design-system pieces
 *  (`DataTable`, `Card`, `Badge`) rather than a bespoke re-implementation,
 *  since the whole point of a pattern page is showing the actual components.
 *  None of the three designs shipped a `.Mobile.dc.html` variant. */

/** Local status→tone lookup, same shape as `Crm.tsx`'s `Tone` helper — for
 *  states the generated badge palettes (`ST_BADGE` etc.) don't cover. */
function Tone({
  value,
  palette,
  label,
}: {
  value: string
  palette: Record<string, readonly [string, string]>
  label?: string
}) {
  const { t } = usePreferences()
  const [bg, fg] = palette[value] ?? ['rgba(100,116,139,.1)', '#64748B']
  const text = label ?? value.replace(/_/g, ' ')
  return (
    <Badge background={bg} color={fg}>
      {t(text[0].toUpperCase() + text.slice(1))}
    </Badge>
  )
}

// ── List View ───────────────────────────────────────────────────────────────
type Invoice = RowOf<'invoices'>

const INVOICE_TONE: Record<string, readonly [string, string]> = {
  paid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  unpaid: ['rgba(100,116,139,.1)', '#64748B'],
  overdue: ['rgba(249,115,22,.1)', '#F97316'],
}

/** Icon row list — the design's compact alternative to a table, used where a
 *  single line of title + meta + status + value says enough. */
export function UIListView() {
  const { t, rtl } = usePreferences()
  const { data: invoices = [], isLoading } = useCollection('invoices')

  return (
    <>
      <ListPageHeader title={t('List View')} subtitle={t('UI Patterns')} />
      <Card className="max-w-3xl overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted">{t('Loading...')}</p>
        ) : invoices.length === 0 ? (
          <div className="p-6">
            <EmptyState icon="Receipt" title={t('No records yet')} />
          </div>
        ) : (
          invoices.map((invoice: Invoice) => (
            <div
              key={invoice.id}
              className="flex items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors duration-150 hover:bg-[rgba(10,94,215,.03)]"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                <Icon name="Receipt" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-heading">{invoice.cust}</p>
                  <Tone value={invoice.status} palette={INVOICE_TONE} />
                </span>
                <p className="mt-0.5 truncate text-xs text-muted">
                  <span dir="ltr">{invoice.id}</span> · {t('Due')} {invoice.due}
                </p>
              </div>
              <Money sar={parseSar(invoice.amount)} className="flex-shrink-0 text-[13px] font-semibold text-heading" />
              <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={15} className="flex-shrink-0 text-muted" />
            </div>
          ))
        )}
      </Card>
    </>
  )
}

// ── Table View ──────────────────────────────────────────────────────────────
type Job = RowOf<'jobs'>

/** Bordered, sortable-looking data table — the design's dense grid for rows
 *  with several comparable fields, backed by the real `DataTable`. */
export function UITableView() {
  const { t } = usePreferences()
  const { data: jobs = [], isLoading } = useCollection('jobs')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return jobs
    return jobs.filter((job) =>
      [job.id, job.cust, job.veh].some((field) => field.toLowerCase().includes(needle))
    )
  }, [jobs, query])

  const columns: Column<Job>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh },
    { header: 'Service', cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} /> },
    { header: 'Priority', cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} /> },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Table View')}
        subtitle={t('UI Patterns')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search records...') }}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(job) => job.id}
        loading={isLoading}
        mobileCard={(job) => (
          <>
            <MobileCardHeader
              title={job.id}
              code
              trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
            />
            <MobileCardRow>{job.cust}</MobileCardRow>
            <MobileCardRow>{job.veh}</MobileCardRow>
            <div className="flex items-center gap-2">
              <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />
              <PriorityBadge value={job.pr} label={t(job.pr)} />
            </div>
          </>
        )}
        empty={<EmptyState icon="Table" title={t('No matching records')} />}
      />
    </>
  )
}

// ── Card View ───────────────────────────────────────────────────────────────
type Part = RowOf<'parts'>

const STOCK_TONE: Record<string, readonly [string, string]> = {
  in_stock: ['rgba(10,94,215,.1)', '#0A5ED7'],
  low_stock: ['rgba(249,115,22,.1)', '#F97316'],
}

/** Grid of tappable summary cards — the design's alternative to a table when
 *  browsing benefits more from a glance than from column comparison. */
export function UICardView() {
  const { t } = usePreferences()
  const { data: parts = [], isLoading } = useCollection('parts')

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  return (
    <>
      <ListPageHeader title={t('Card View')} subtitle={t('UI Patterns')} />
      {parts.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="Package" title={t('No parts yet')} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {parts.map((part: Part) => {
            const low = part.stock <= part.reorder
            return (
              <Card
                key={part.sku}
                className="flex cursor-pointer flex-col gap-3 p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(10,94,215,.3)] hover:shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                    <Icon name="Package" size={16} />
                  </span>
                  <span className="flex-1" />
                  <Tone value={low ? 'low_stock' : 'in_stock'} palette={STOCK_TONE} label={low ? 'Low Stock' : 'In Stock'} />
                </div>
                <div>
                  <h3 className="truncate font-display text-[15px] font-bold text-heading">{part.name}</h3>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted" dir="ltr">
                    {part.sku}
                  </p>
                </div>
                <div className="flex items-center gap-2 border-t border-border pt-2.5">
                  <span className="flex-1 text-[11px] text-muted">
                    {part.stock} {t('in stock')}
                  </span>
                  <Money sar={parseSar(part.price)} className="flex-shrink-0 text-[13px] font-semibold text-salis-blue" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
