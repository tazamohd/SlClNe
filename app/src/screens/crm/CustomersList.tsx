import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'

export function CustomersList() {
  const { t } = usePreferences()
  const { data: rawCustomers = [], isLoading, isError, error, refetch } = useCollection('customers')
  const rows = rawCustomers as unknown as readonly Record<string, string>[]
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.phone ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q),
    )
  }, [rows, search])

  if (isLoading) return <Loading label={t('Loading customers...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const kpis = [
    { label: t('Total Customers'), value: String(rows.length), icon: 'Users', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(rows.filter((r) => r.status === 'Active' || !r.status).length), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Record<string, string>>[] = [
    { header: 'Name', cell: (r) => <span className="font-medium text-heading">{r.name ?? '—'}</span> },
    { header: 'Phone', cell: (r) => r.phone ?? '—', code: true },
    { header: 'Email', cell: (r) => r.email ?? '—', code: true },
    { header: 'Vehicles', cell: (r) => r.vehicleCount ?? '—', code: true },
    {
      header: 'Status',
      cell: (r) => (
        <Badge background="var(--tint-blue)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge>
      ),
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Users" title={t('Customers')} subtitle={t('Registry')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search customers...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Customers"
        columns={columns}
        rows={[...filtered]}
        rowKey={(r, i) => r.name ?? String(i)}
        empty={t('No customers found')}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[var(--tint-blue)] text-salis-blue" aria-hidden><Icon name="User" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.name ?? '—'}</p>
                    <p className="text-xs text-muted" dir="ltr">{r.phone ?? '—'}</p>
                  </div>
                </div>
              }
            />
            <MobileCardRow label={t('Email')} value={r.email ?? '—'} />
            <MobileCardRow label={t('Vehicles')} value={r.vehicleCount ?? '—'} />
            <MobileCardRow label={t('Status')} value={<Badge background="var(--tint-blue)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge>} />
          </>
        )}
      />
    </div>
  )
}
