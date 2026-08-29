import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Search } from '@/components/ui/Search'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Technician {
  name: string
  specialization: string
  certCount: number
  status: 'Active' | 'On Leave' | 'Training'
  rating: number
}

const MOCK_TECHNICIANS: readonly Technician[] = [
  { name: 'Fahad Al-Harbi', specialization: 'Engine', certCount: 5, status: 'Active', rating: 4.8 },
  { name: 'Omar Al-Qahtani', specialization: 'Electrical', certCount: 3, status: 'Active', rating: 4.5 },
  { name: 'Khalid Al-Dosari', specialization: 'Body', certCount: 4, status: 'On Leave', rating: 4.3 },
  { name: 'Yousef Al-Shehri', specialization: 'AC', certCount: 6, status: 'Active', rating: 4.9 },
  { name: 'Saad Al-Mutairi', specialization: 'Brakes', certCount: 3, status: 'Training', rating: 4.2 },
  { name: 'Ahmed Al-Ghamdi', specialization: 'Transmission', certCount: 5, status: 'Active', rating: 4.7 },
  { name: 'Nasser Al-Otaibi', specialization: 'Engine', certCount: 4, status: 'Active', rating: 4.6 },
  { name: 'Tariq Al-Zahrani', specialization: 'Electrical', certCount: 2, status: 'Active', rating: 4.4 },
]

const STATUS_COLORS: Record<Technician['status'], { bg: string; fg: string }> = {
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'On Leave': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Training: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
}

export function TechnicianManagement() {
  const { t } = usePreferences()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_TECHNICIANS
    const q = search.toLowerCase()
    return MOCK_TECHNICIANS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.specialization.toLowerCase().includes(q),
    )
  }, [search])

  const active = MOCK_TECHNICIANS.filter((r) => r.status === 'Active').length
  const avgRating = (MOCK_TECHNICIANS.reduce((sum, r) => sum + r.rating, 0) / MOCK_TECHNICIANS.length).toFixed(1)
  const totalCerts = MOCK_TECHNICIANS.reduce((sum, r) => sum + r.certCount, 0)

  const kpis = [
    { label: t('Total Technicians'), value: String(MOCK_TECHNICIANS.length), icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(active), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Avg Rating'), value: avgRating, icon: 'Star', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Certified'), value: String(totalCerts), icon: 'Award', bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
  ]

  const columns: Column<Technician>[] = [
    { header: 'Name', cell: (r) => r.name },
    { header: 'Specialization', cell: (r) => t(r.specialization) },
    { header: 'Certifications', cell: (r) => r.certCount, code: true },
    { header: 'Rating', cell: (r) => r.rating.toFixed(1), code: true },
    { header: 'Status', cell: (r) => <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>{t(r.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Wrench" title={t('Technicians')} subtitle={t('Technician Management')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search technicians...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Technician management"
        columns={columns}
        rows={[...filtered]}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.name}
              trailing={
                <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>
                  {t(r.status)}
                </Badge>
              }
            />
            <MobileCardRow label={t('Specialization')}>{t(r.specialization)}</MobileCardRow>
            <MobileCardRow label={t('Certifications')}>{String(r.certCount)}</MobileCardRow>
            <MobileCardRow label={t('Rating')}>{r.rating.toFixed(1)}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
