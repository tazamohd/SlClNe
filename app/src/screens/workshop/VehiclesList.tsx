import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

export function VehiclesList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const vehicles = useCollection('vehicles')
  const rows = (vehicles.data ?? []) as readonly Record<string, string>[]
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

  const kpis = [
    { label: t('Total Vehicles'), value: String(rows.length), icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(rows.filter((r) => r.status === 'Active' || !r.status).length), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <Input inputSize="sm" placeholder={t('Search vehicles...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        {filtered.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Car" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.make} {r.model}</p>
                    <p className="font-mono text-xs text-muted" dir="ltr">{r.plate ?? r.vin ?? '—'}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1 text-xs text-muted">{r.ownerName ?? r.customer ?? '—'}</div>
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No vehicles found')}</p>}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Car" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Vehicles')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Registry')}</p>
          </div>
        </div>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Make / Model')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Owner')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Year')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-heading" dir="ltr">{r.plate ?? '—'}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{r.make} {r.model}</td>
                  <td className="py-3 pe-4 text-body">{r.ownerName ?? r.customer ?? '—'}</td>
                  <td className="py-3 pe-4 text-muted" dir="ltr">{r.year ?? '—'}</td>
                  <td className="py-3">
                    <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status ?? t('Active')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
