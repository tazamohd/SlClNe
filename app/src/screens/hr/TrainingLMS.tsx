import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Course {
  title: string
  category: 'Safety' | 'Technical' | 'Customer Service' | 'Compliance'
  duration: string
  enrolled: number
  completion: number
  status: 'Active' | 'Draft' | 'Archived'
}

const MOCK_COURSES: readonly Course[] = [
  { title: 'Workplace Safety Essentials', category: 'Safety', duration: '4 hrs', enrolled: 32, completion: 88, status: 'Active' },
  { title: 'Advanced Engine Diagnostics', category: 'Technical', duration: '8 hrs', enrolled: 18, completion: 72, status: 'Active' },
  { title: 'Customer Communication Skills', category: 'Customer Service', duration: '3 hrs', enrolled: 25, completion: 91, status: 'Active' },
  { title: 'Regulatory Compliance 2024', category: 'Compliance', duration: '2 hrs', enrolled: 40, completion: 95, status: 'Active' },
  { title: 'Electrical Systems Overview', category: 'Technical', duration: '6 hrs', enrolled: 15, completion: 65, status: 'Active' },
  { title: 'Fire Safety Procedures', category: 'Safety', duration: '1.5 hrs', enrolled: 38, completion: 82, status: 'Draft' },
  { title: 'Hybrid Vehicle Maintenance', category: 'Technical', duration: '10 hrs', enrolled: 8, completion: 45, status: 'Draft' },
  { title: 'Service Desk Best Practices', category: 'Customer Service', duration: '2.5 hrs', enrolled: 12, completion: 78, status: 'Archived' },
]

const STATUS_COLORS: Record<Course['status'], { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Draft: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Archived: { bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
}

const CATEGORY_COLORS: Record<Course['category'], { bg: string; fg: string }> = {
  Safety: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Technical: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Customer Service': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Compliance: { bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
}

export function TrainingLMS() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_COURSES
    const q = search.toLowerCase()
    return MOCK_COURSES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    )
  }, [search])

  const activeCourses = MOCK_COURSES.filter((r) => r.status === 'Active').length
  const avgCompletion = Math.round(MOCK_COURSES.reduce((sum, r) => sum + r.completion, 0) / MOCK_COURSES.length)
  const totalEnrolled = MOCK_COURSES.reduce((sum, r) => sum + r.enrolled, 0)

  const kpis = [
    { label: t('Total Courses'), value: String(MOCK_COURSES.length), icon: 'BookOpen', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(activeCourses), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Completion'), value: `${avgCompletion}%`, icon: 'TrendingUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Enrolled'), value: String(totalEnrolled), icon: 'Users', bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BookOpen" title={t('Training')} subtitle={t('Learning Management')} />
        <Input inputSize="sm" placeholder={t('Search courses...')} value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <Icon name="BookOpen" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.title}</p>
                    <p className="text-xs text-muted">{r.duration}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>
                  {t(r.status)}
                </Badge>
              }
            />
            <MobileCardRow label={t('Category')}>
              <Badge background={CATEGORY_COLORS[r.category].bg} color={CATEGORY_COLORS[r.category].fg}>
                {t(r.category)}
              </Badge>
            </MobileCardRow>
            <MobileCardRow label={t('Enrolled')} value={String(r.enrolled)} />
            <MobileCardRow label={t('Completion')} value={`${r.completion}%`} />
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No courses found')}</p>}
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
              <Icon name="BookOpen" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Training')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Learning Management')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search courses...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Course')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Duration')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Enrolled')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Completion')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.title}</td>
                  <td className="py-3 pe-4">
                    <Badge background={CATEGORY_COLORS[r.category].bg} color={CATEGORY_COLORS[r.category].fg}>
                      {t(r.category)}
                    </Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">{r.duration}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.enrolled}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.completion}%</td>
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
