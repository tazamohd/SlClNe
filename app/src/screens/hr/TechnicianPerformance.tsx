import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface TechPerformance {
  name: string
  completionRate: number
  qualityScore: number
  customerRating: number
  jobsThisMonth: number
}

const MOCK_PERFORMANCE: readonly TechPerformance[] = [
  { name: 'Yousef Al-Shehri', completionRate: 98, qualityScore: 9.4, customerRating: 4.9, jobsThisMonth: 38 },
  { name: 'Fahad Al-Harbi', completionRate: 95, qualityScore: 9.1, customerRating: 4.8, jobsThisMonth: 35 },
  { name: 'Ahmed Al-Ghamdi', completionRate: 93, qualityScore: 8.8, customerRating: 4.7, jobsThisMonth: 32 },
  { name: 'Nasser Al-Otaibi', completionRate: 91, qualityScore: 8.5, customerRating: 4.6, jobsThisMonth: 29 },
  { name: 'Omar Al-Qahtani', completionRate: 89, qualityScore: 8.3, customerRating: 4.5, jobsThisMonth: 27 },
  { name: 'Tariq Al-Zahrani', completionRate: 87, qualityScore: 8.0, customerRating: 4.4, jobsThisMonth: 25 },
]

const SUMMARY = {
  avgCompletionTime: '2.4 hrs',
  avgQualityScore: '8.7',
  avgCustomerRating: '4.65',
  totalJobsThisMonth: '186',
}

export function TechnicianPerformance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_PERFORMANCE
    const q = search.toLowerCase()
    return MOCK_PERFORMANCE.filter((r) => r.name.toLowerCase().includes(q))
  }, [search])

  const kpis = [
    { label: t('Avg Completion Time'), value: SUMMARY.avgCompletionTime, icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Quality Score'), value: SUMMARY.avgQualityScore, icon: 'Target', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Customer Rating'), value: SUMMARY.avgCustomerRating, icon: 'Star', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Jobs This Month'), value: SUMMARY.totalJobsThisMonth, icon: 'Briefcase', bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
  ]

  function ratingBadge(rate: number) {
    if (rate >= 92) return { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' }
    if (rate >= 85) return { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' }
    return { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' }
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BarChart3" title={t('Performance')} subtitle={t('Technician Performance')} />
        <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="flex rounded-lg p-1" style={{ background: k.bg, color: k.fg }} aria-hidden>
                  <Icon name={k.icon} size={14} />
                </span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1 font-display text-lg font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {filtered.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden>
                    <Icon name="User" size={14} />
                  </span>
                  <p className="text-[13px] font-semibold text-heading">{r.name}</p>
                </div>
              }
              trailing={
                <Badge background={ratingBadge(r.completionRate).bg} color={ratingBadge(r.completionRate).fg}>
                  {r.completionRate}%
                </Badge>
              }
            />
            <MobileCardRow label={t('Quality Score')} value={`${r.qualityScore}/10`} />
            <MobileCardRow label={t('Customer Rating')} value={`${r.customerRating}/5`} />
            <MobileCardRow label={t('Jobs This Month')} value={String(r.jobsThisMonth)} />
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
              <Icon name="BarChart3" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Performance')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Technician Performance')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Technician')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Completion Rate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Quality Score')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Customer Rating')}</th>
                <th className="pb-3 text-start font-medium">{t('Jobs This Month')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.name}</td>
                  <td className="py-3 pe-4">
                    <Badge background={ratingBadge(r.completionRate).bg} color={ratingBadge(r.completionRate).fg}>
                      {r.completionRate}%
                    </Badge>
                  </td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.qualityScore}/10</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.customerRating}/5</td>
                  <td className="py-3 font-mono text-heading" dir="ltr">{r.jobsThisMonth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
