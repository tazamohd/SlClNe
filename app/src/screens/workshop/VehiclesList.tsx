import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
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
    { label: t('Total Vehicles'), value: String(rows.length), icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(rows.filter((r) => r.status === 'Active' || !r.status).length), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const columns: Column<Record<string, string>>[] = [
    { header: 'Plate', cell: (r) => r.plate ?? '—', code: true },
    { header: 'Make / Model', cell: (r) => `${r.make} ${r.model}` },
    { header: 'Owner', cell: (r) => r.ownerName ?? r.customer ?? '—' },
    { header: 'Year', cell: (r) => r.year ?? '—', code: true },
    { header: 'Status', cell: (r) => <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge> },
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
          <MobileCardHeader title={`${r.make} ${r.model}`} trailing={<Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge>} />
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
      <div className="flex items-center justify-between">
        <PageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search vehicles...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      {table}
    </div>
  )
}
