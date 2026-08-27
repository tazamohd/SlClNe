import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

  const columns: Column<Course>[] = [
    { header: 'Course', cell: (r) => r.title },
    { header: 'Category', cell: (r) => <Badge background={CATEGORY_COLORS[r.category].bg} color={CATEGORY_COLORS[r.category].fg}>{t(r.category)}</Badge> },
    { header: 'Duration', cell: (r) => r.duration },
    { header: 'Enrolled', cell: (r) => r.enrolled, code: true },
    { header: 'Completion', cell: (r) => `${r.completion}%`, code: true },
    { header: 'Status', cell: (r) => <Badge background={STATUS_COLORS[r.status].bg} color={STATUS_COLORS[r.status].fg}>{t(r.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <PageHeader icon="BookOpen" title={t('Training')} subtitle={t('Learning Management')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search courses...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Training courses"
        columns={columns}
        rows={[...filtered]}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.title}
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
            <MobileCardRow label={t('Duration')}>{r.duration}</MobileCardRow>
            <MobileCardRow label={t('Enrolled')}>{String(r.enrolled)}</MobileCardRow>
            <MobileCardRow label={t('Completion')}>{r.completion}%</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
