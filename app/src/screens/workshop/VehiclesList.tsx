import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

export function VehiclesList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: rawVehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')
  const rows = rawVehicles as readonly Record<string, string>[]
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        (r.plate ?? '').toLowerCase().includes(q) ||
        (r.make ?? '').toLowerCase().includes(q) ||
        (r.model ?? '').toLowerCase().includes(q) ||
        (r.ownerName ?? r.customer ?? '').toLowerCase().includes(q),
    )
  }, [rows, search])

  if (isLoading) return <Loading label={t('Loading vehicles...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const kpis = [
    { label: t('Total Vehicles'), value: String(rows.length), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(rows.filter((r) => r.status === 'Active' || !r.status).length), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Record<string, string>>[] = [
    { header: 'Plate', cell: (r) => r.plate ?? '—', code: true },
    { header: 'Make / Model', cell: (r) => `${r.make} ${r.model}` },
    { header: 'Owner', cell: (r) => r.ownerName ?? r.customer ?? '—' },
    { header: 'Year', cell: (r) => r.year ?? '—', code: true },
    { header: 'Status', cell: (r) => <Badge background="var(--tint-blue)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Registered vehicles"
      columns={columns}
      rows={filtered as Record<string, string>[]}
      rowKey={(_, i) => `vehicle-${i}`}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No vehicles found')}</p>}
      mobileCard={(r) => (
        <>
          <MobileCardHeader title={`${r.make} ${r.model}`} trailing={<Badge background="var(--tint-blue)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge>} />
          <MobileCardRow label={t('Plate')}>{r.plate ?? '—'}</MobileCardRow>
          <MobileCardRow label={t('Owner')}>{r.ownerName ?? r.customer ?? '—'}</MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <Input inputSize="sm" placeholder={t('Search vehicles...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search vehicles...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
