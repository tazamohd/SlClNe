import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Search } from '@/components/ui/Search'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** The workshop's own supplier directory (BLK-004): read through the
 *  repository seam from `suppliers` — `GET /procurement/suppliers`, the same
 *  vendor directory `Procurement.tsx` raises purchase orders against — rather
 *  than the eight fictional suppliers (with an invented Category, Rating and
 *  Orders count) this screen carried before.
 *
 *  A supplier row is a code, a name, a contact and an active flag; there is
 *  no rating, category or order-count column behind it anywhere in the
 *  schema, so this screen no longer claims one. */

type Supplier = RowOf<'suppliers'>

function statusColor(status: string) {
  if (status === 'inactive') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
}

export function SuppliersList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const { data: suppliers = [], isLoading, isError, error, refetch } = useCollection('suppliers')

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.contact ?? '').toLowerCase().includes(q),
    )
  }, [suppliers, search])

  const activeCount = suppliers.filter((s) => s.status === 'active').length

  const kpis = [
    { label: t('Total Suppliers'), value: String(suppliers.length), icon: 'Building2', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(activeCount), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Supplier>[] = [
    { header: 'Code', cell: (s) => s.code, code: true },
    { header: 'Name', cell: (s) => <span className="font-medium text-heading">{s.name}</span> },
    { header: 'Contact', cell: (s) => s.contact ?? '—' },
    { header: 'Phone', cell: (s) => <span className="font-mono text-xs text-muted" dir="ltr">{s.contactPhone ?? '—'}</span> },
    { header: 'Status', cell: (s) => <Badge {...statusColor(s.status)}>{t(s.status === 'active' ? 'Active' : 'Inactive')}</Badge> },
  ]

  if (isLoading) return <Loading label={t('Loading suppliers...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const table = (
    <DataTable
      caption="Suppliers directory"
      columns={columns}
      rows={filtered}
      rowKey={(s) => s.id}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No suppliers found')}</p>}
      mobileCard={(s) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Building2" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{s.name}</p>
                  <p className="text-xs text-muted" dir="ltr">{s.code}</p>
                </div>
              </div>
            }
            trailing={<Badge {...statusColor(s.status)}>{t(s.status === 'active' ? 'Active' : 'Inactive')}</Badge>}
          />
          <MobileCardRow label={t('Contact')} value={s.contact ?? '—'} />
          <MobileCardRow label={t('Phone')} value={<span dir="ltr">{s.contactPhone ?? '—'}</span>} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Suppliers')} subtitle={t('Directory')} />
        <Input inputSize="sm" placeholder={t('Search suppliers...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Building2" title={t('Suppliers')} subtitle={t('Supplier directory')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search suppliers...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
