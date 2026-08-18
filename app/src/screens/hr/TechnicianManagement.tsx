import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'On Leave': { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Training: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
}

export function TechnicianManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
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
    { label: t('Total Technicians'), value: String(MOCK_TECHNICIANS.length), icon: 'Wrench', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(active), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Rating'), value: avgRating, icon: 'Star', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Certified'), value: String(totalCerts), icon: 'Award', bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Wrench" title={t('Technicians')} subtitle={t('Technician Management')} />
        <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        {filtered.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden>
                    <Icon name="User" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.name}</p>
                    <p className="text-xs text-muted">{t(r.specialization)}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>
                  {t(r.status)}
                </Badge>
              }
            />
            <MobileCardRow label={t('Certifications')} value={String(r.certCount)} />
            <MobileCardRow label={t('Rating')} value={r.rating.toFixed(1)} />
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No technicians found')}</p>}
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
              <Icon name="Wrench" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Technicians')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Technician Management')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden>
                <Icon name={k.icon} size={16} />
              </span>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Specialization')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Certifications')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Rating')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.name}</td>
                  <td className="py-3 pe-4 text-body">{t(r.specialization)}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.certCount}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.rating.toFixed(1)}</td>
                  <td className="py-3">
                    <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>
                      {t(r.status)}
                    </Badge>
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
