import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow, TabBar, SearchField } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, TableFooter, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

const STATUS_TONE: Record<string, readonly [string, string]> = {
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  present: ['rgba(10,94,215,.1)', '#0A5ED7'],
  on_leave: ['rgba(11,179,255,.1)', '#0BB3FF'],
  approved: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  rejected: ['rgba(100,116,139,.1)', '#64748B'],
  completed: ['rgba(11,31,59,.1)', '#0B1F3B'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  scheduled: ['rgba(11,179,255,.1)', '#0BB3FF'],
  overdue: ['rgba(249,115,22,.1)', '#F97316'],
  draft: ['rgba(100,116,139,.1)', '#64748B'],
  clocked_in: ['rgba(10,94,215,.1)', '#0A5ED7'],
  clocked_out: ['rgba(100,116,139,.1)', '#64748B'],
  processed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  paid: ['rgba(11,31,59,.1)', '#0B1F3B'],
  enrolled: ['rgba(11,179,255,.1)', '#0BB3FF'],
  morning: ['rgba(11,179,255,.1)', '#0BB3FF'],
  evening: ['rgba(10,94,215,.1)', '#0A5ED7'],
  night: ['rgba(11,31,59,.1)', '#0B1F3B'],
  off: ['rgba(100,116,139,.1)', '#64748B'],
}

function Tone({ value, label }: { value: string; label?: string }) {
  const { t } = usePreferences()
  const [bg, fg] = STATUS_TONE[value] ?? ['rgba(100,116,139,.1)', '#64748B']
  const text = label ?? value.replace(/_/g, ' ')
  return (
    <Badge background={bg} color={fg}>
      {t(text[0].toUpperCase() + text.slice(1))}
    </Badge>
  )
}

// ── Shared employee data ────────────────────────────────────────────────────

interface Employee {
  id: string
  name: string
  initial: string
  phone: string
  email: string
  dept: string
  position: string
  status: 'active' | 'on_leave'
  salary: number
  startDate: string
  manager: string
}

const EMPLOYEES: readonly Employee[] = [
  { id: 'E001', name: 'Yousef Al-Otaibi', initial: 'Y', phone: '+966 55 440 1122', email: 'yousef@salis.sa', dept: 'Workshop', position: 'Senior Technician', status: 'active', salary: 6500, startDate: '2023-02-15', manager: 'Khalid Al-Amri' },
  { id: 'E002', name: 'Bandar Al-Qahtani', initial: 'B', phone: '+966 50 331 2244', email: 'bandar@salis.sa', dept: 'Workshop', position: 'Technician', status: 'active', salary: 6200, startDate: '2023-06-01', manager: 'Khalid Al-Amri' },
  { id: 'E003', name: 'Faisal Al-Harbi', initial: 'F', phone: '+966 54 220 5533', email: 'faisal@salis.sa', dept: 'Workshop', position: 'Technician', status: 'on_leave', salary: 5800, startDate: '2024-01-10', manager: 'Khalid Al-Amri' },
  { id: 'E004', name: 'Nasser Al-Dosari', initial: 'N', phone: '+966 56 110 7788', email: 'nasser@salis.sa', dept: 'Workshop', position: 'Junior Technician', status: 'active', salary: 5500, startDate: '2024-08-20', manager: 'Yousef Al-Otaibi' },
  { id: 'E005', name: 'Khalid Al-Amri', initial: 'K', phone: '+966 55 123 4567', email: 'khalid@salis.sa', dept: 'Administration', position: 'Operations Manager', status: 'active', salary: 12000, startDate: '2021-09-01', manager: '—' },
  { id: 'E006', name: 'Layla Al-Sulaiman', initial: 'L', phone: '+966 50 998 3344', email: 'layla@salis.sa', dept: 'Accounting', position: 'Senior Accountant', status: 'on_leave', salary: 7500, startDate: '2022-03-15', manager: 'Khalid Al-Amri' },
  { id: 'E007', name: 'Omar Al-Rashid', initial: 'O', phone: '+966 55 776 8899', email: 'omar@salis.sa', dept: 'Sales', position: 'Service Advisor', status: 'active', salary: 7000, startDate: '2023-11-01', manager: 'Khalid Al-Amri' },
  { id: 'E008', name: 'Sara Al-Mutairi', initial: 'S', phone: '+966 50 445 6677', email: 'sara@salis.sa', dept: 'Administration', position: 'HR Coordinator', status: 'active', salary: 6800, startDate: '2024-02-01', manager: 'Khalid Al-Amri' },
]

const DEPTS = ['Workshop', 'Administration', 'Accounting', 'Sales'] as const

function EmployeeAvatar({ initial, name }: { initial: string; name: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[11px] font-bold text-white">
        {initial}
      </span>
      <span className="text-[13px] font-semibold text-heading">{name}</span>
    </span>
  )
}

// ── 1. HR Management ────────────────────────────────────────────────────────

const HR_TABS = [
  { id: 'roster', label: 'Employee Roster', icon: 'Users' },
  { id: 'departments', label: 'Departments', icon: 'Building2' },
  { id: 'org', label: 'Org Chart', icon: 'Network' },
] as const

type HRTab = (typeof HR_TABS)[number]['id']

export function HRManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [tab, setTab] = useState<HRTab>('roster')
  const [query, setQuery] = useState('')

  const present = EMPLOYEES.filter((e) => e.status === 'active').length
  const onLeave = EMPLOYEES.filter((e) => e.status === 'on_leave').length

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return EMPLOYEES
    return EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.dept.toLowerCase().includes(needle) ||
        e.position.toLowerCase().includes(needle)
    )
  }, [query])

  const deptSummary = useMemo(
    () =>
      DEPTS.map((dept) => {
        const members = EMPLOYEES.filter((e) => e.dept === dept)
        return { dept, count: members.length, active: members.filter((e) => e.status === 'active').length }
      }),
    []
  )

  const columns: Column<Employee>[] = [
    { header: 'Employee', cell: (e) => <EmployeeAvatar initial={e.initial} name={e.name} /> },
    { header: 'ID', cell: (e) => <span className="font-mono text-xs text-muted">{e.id}</span> },
    { header: 'Department', cell: (e) => t(e.dept) },
    { header: 'Position', cell: (e) => t(e.position) },
    { header: 'Started', cell: (e) => e.startDate },
    { header: 'Manager', cell: (e) => e.manager },
    { header: 'Status', cell: (e) => <Tone value={e.status} label={e.status === 'active' ? 'Active' : 'On Leave'} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Users"
        title={t('HR Management')}
        subtitle={t('Employee records and workforce administration')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="UserPlus" size={16} />
              {t('Add Employee')}
            </Button>
          ) : null
        }
      />
      <TabBar tabs={HR_TABS} value={tab} onChange={(id) => setTab(id as HRTab)} />
      <StatRow
        stats={[
          { label: 'Employees', value: EMPLOYEES.length, caption: 'On the books', highlight: true },
          { label: 'Present', value: present, caption: 'On shift today', tone: 'info' },
          { label: 'On Leave', value: onLeave, caption: 'Away today', tone: 'warning' },
          { label: 'Departments', value: DEPTS.length, caption: 'Active units' },
        ]}
      />

      {tab === 'roster' && (
        <Section
          title={t('Employee Roster')}
          toolbar={
            <SearchField value={query} onChange={setQuery} placeholder="Search employees..." />
          }
        >
          <DataTable
            className="border-0 shadow-none"
            columns={columns}
            rows={[...filtered]}
            rowKey={(e) => e.id}
            mobileCard={(e) => (
              <>
                <MobileCardHeader title={e.name} trailing={<Tone value={e.status} label={e.status === 'active' ? 'Active' : 'On Leave'} />} />
                <MobileCardRow label={t('Department')}>{t(e.dept)}</MobileCardRow>
                <MobileCardRow label={t('Position')}>{t(e.position)}</MobileCardRow>
                <MobileCardRow label={t('Started')}>{e.startDate}</MobileCardRow>
              </>
            )}
            empty={<EmptyState icon="Users" title={t('No employees found')} />}
          />
        </Section>
      )}

      {tab === 'departments' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {deptSummary.map((d) => (
            <Card key={d.dept} className="flex flex-col gap-3 rounded-lg p-5">
              <div className="flex items-center gap-3">
                <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2.5 text-salis-blue">
                  <Icon name="Building2" size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-heading">{t(d.dept)}</h3>
                  <p className="text-xs text-muted">
                    {d.count} {t('members')} · {d.active} {t('active')}
                  </p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full bg-salis-gradient-r"
                  style={{ width: `${(d.active / Math.max(d.count, 1)) * 100}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'org' && (
        <Section title={t('Organization Chart')}>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-salis-gradient text-lg font-bold text-white">K</span>
              <span className="text-sm font-semibold text-heading">Khalid Al-Amri</span>
              <span className="text-xs text-muted">{t('Operations Manager')}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {EMPLOYEES.filter((e) => e.manager === 'Khalid Al-Amri' && e.name !== 'Khalid Al-Amri').map((e) => (
                <div key={e.id} className="flex flex-col items-center gap-1.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-sm font-bold text-salis-blue">
                    {e.initial}
                  </span>
                  <span className="text-center text-[13px] font-semibold text-heading">{e.name}</span>
                  <span className="text-center text-[11px] text-muted">{t(e.position)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  )
}

// ── 2. Staff Directory ──────────────────────────────────────────────────────

export function StaffDirectory() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = [...EMPLOYEES]
    if (deptFilter !== 'all') list = list.filter((e) => e.dept === deptFilter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((e) => e.name.toLowerCase().includes(needle) || e.email.toLowerCase().includes(needle))
    return list
  }, [query, deptFilter])

  const columns: Column<Employee>[] = [
    { header: 'Name', cell: (e) => <EmployeeAvatar initial={e.initial} name={e.name} /> },
    { header: 'Position', cell: (e) => t(e.position) },
    { header: 'Department', cell: (e) => t(e.dept) },
    {
      header: 'Phone',
      cell: (e) => (
        <span className="font-mono text-[13px] text-muted" dir="ltr">
          {e.phone}
        </span>
      ),
    },
    {
      header: 'Email',
      cell: (e) => (
        <span className="text-[13px] text-salis-blue">{e.email}</span>
      ),
    },
    { header: 'Status', cell: (e) => <Tone value={e.status} label={e.status === 'active' ? 'Active' : 'On Leave'} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Contact"
        title={t('Staff Directory')}
        subtitle={t('Contact details and roles across the team')}
      />
      <StatRow
        stats={[
          { label: 'Staff', value: EMPLOYEES.length, caption: 'Listed', highlight: true },
          { label: 'Departments', value: DEPTS.length, caption: 'Across the business', tone: 'info' },
          { label: 'On Shift', value: EMPLOYEES.filter((e) => e.status === 'active').length, caption: 'Working now' },
          { label: 'On Leave', value: EMPLOYEES.filter((e) => e.status === 'on_leave').length, caption: 'Away', tone: 'warning' },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label={t('Department')} className="flex flex-wrap gap-2">
          {(['all', ...DEPTS] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={deptFilter === d}
              onClick={() => setDeptFilter(d)}
              className={cn(
                'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium transition-all duration-150',
                deptFilter === d
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(d === 'all' ? 'All' : d)}
            </button>
          ))}
        </div>
        <SearchField value={query} onChange={setQuery} placeholder="Search by name or email..." />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        mobileCard={(e) => (
          <>
            <MobileCardHeader title={e.name} trailing={<Tone value={e.status} label={e.status === 'active' ? 'Active' : 'On Leave'} />} />
            <MobileCardRow label={t('Position')}>{t(e.position)}</MobileCardRow>
            <MobileCardRow label={t('Phone')}>
              <span className="font-mono" dir="ltr">{e.phone}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Email')}>
              <span className="text-salis-blue">{e.email}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Contact" title={t('No staff found')} />}
      />
    </>
  )
}

// ── 3. Staff Scheduling ─────────────────────────────────────────────────────

interface Shift {
  id: string
  employee: string
  date: string
  shift: 'morning' | 'evening' | 'night' | 'off'
  role: string
  status: 'scheduled' | 'completed' | 'in_progress'
}

const SHIFTS: readonly Shift[] = [
  { id: 'SH001', employee: 'Yousef Al-Otaibi', date: '2026-08-28', shift: 'morning', role: 'Senior Technician', status: 'in_progress' },
  { id: 'SH002', employee: 'Bandar Al-Qahtani', date: '2026-08-28', shift: 'morning', role: 'Technician', status: 'in_progress' },
  { id: 'SH003', employee: 'Nasser Al-Dosari', date: '2026-08-28', shift: 'evening', role: 'Junior Technician', status: 'scheduled' },
  { id: 'SH004', employee: 'Omar Al-Rashid', date: '2026-08-28', shift: 'morning', role: 'Service Advisor', status: 'in_progress' },
  { id: 'SH005', employee: 'Sara Al-Mutairi', date: '2026-08-28', shift: 'morning', role: 'HR Coordinator', status: 'in_progress' },
  { id: 'SH006', employee: 'Khalid Al-Amri', date: '2026-08-28', shift: 'morning', role: 'Operations Manager', status: 'in_progress' },
  { id: 'SH007', employee: 'Yousef Al-Otaibi', date: '2026-08-29', shift: 'morning', role: 'Senior Technician', status: 'scheduled' },
  { id: 'SH008', employee: 'Bandar Al-Qahtani', date: '2026-08-29', shift: 'evening', role: 'Technician', status: 'scheduled' },
  { id: 'SH009', employee: 'Nasser Al-Dosari', date: '2026-08-29', shift: 'morning', role: 'Junior Technician', status: 'scheduled' },
  { id: 'SH010', employee: 'Omar Al-Rashid', date: '2026-08-29', shift: 'off', role: 'Service Advisor', status: 'scheduled' },
]

const SHIFT_LABELS: Record<string, string> = { morning: '6AM – 2PM', evening: '2PM – 10PM', night: '10PM – 6AM', off: 'Day Off' }

export function StaffScheduling() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [shiftFilter, setShiftFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (shiftFilter === 'all' ? SHIFTS : SHIFTS.filter((s) => s.shift === shiftFilter)),
    [shiftFilter]
  )

  const onShift = SHIFTS.filter((s) => s.status === 'in_progress').length
  const openShifts = SHIFTS.filter((s) => s.shift === 'off').length
  const coverage = Math.round(((SHIFTS.length - openShifts) / Math.max(SHIFTS.length, 1)) * 100)

  const columns: Column<Shift>[] = [
    { header: 'Employee', cell: (s) => <span className="text-[13px] font-semibold text-heading">{s.employee}</span> },
    { header: 'Date', cell: (s) => s.date },
    {
      header: 'Shift',
      cell: (s) => (
        <span className="flex items-center gap-2">
          <Tone value={s.shift} />
          <span className="font-mono text-[11px] text-muted" dir="ltr">{SHIFT_LABELS[s.shift]}</span>
        </span>
      ),
    },
    { header: 'Role', cell: (s) => t(s.role) },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="CalendarDays"
        title={t('Staff Scheduling')}
        subtitle={t('Shift rota and roster planning')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('New Shift')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Shifts This Week', value: SHIFTS.length, caption: 'Scheduled', highlight: true },
          { label: 'Open Shifts', value: openShifts, caption: 'Unassigned', tone: 'warning' },
          { label: 'On Shift Now', value: onShift, caption: 'Working', tone: 'info' },
          { label: 'Coverage', value: `${coverage}%`, caption: 'Against demand' },
        ]}
      />

      <div role="tablist" aria-label={t('Shift type')} className="flex flex-wrap gap-2">
        {(['all', 'morning', 'evening', 'night', 'off'] as const).map((option) => {
          const count = option === 'all' ? SHIFTS.length : SHIFTS.filter((s) => s.shift === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={shiftFilter === option}
              onClick={() => setShiftFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                shiftFilter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option)}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.employee} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Date')}>{s.date}</MobileCardRow>
            <MobileCardRow label={t('Shift')}>
              <span className="flex items-center gap-2">
                <Tone value={s.shift} />
                <span className="font-mono text-[11px]" dir="ltr">{SHIFT_LABELS[s.shift]}</span>
              </span>
            </MobileCardRow>
            <MobileCardRow label={t('Role')}>{t(s.role)}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="CalendarDays" title={t('No shifts scheduled')} />}
      />
    </>
  )
}

// ── 4. Staff Performance Review ─────────────────────────────────────────────

interface Review {
  id: string
  employee: string
  reviewer: string
  due: string
  score: number | null
  status: 'completed' | 'pending' | 'overdue' | 'in_progress'
  goals: number
  goalsCompleted: number
}

const REVIEWS: readonly Review[] = [
  { id: 'PR001', employee: 'Yousef Al-Otaibi', reviewer: 'Khalid Al-Amri', due: '2026-09-15', score: null, status: 'pending', goals: 4, goalsCompleted: 2 },
  { id: 'PR002', employee: 'Bandar Al-Qahtani', reviewer: 'Khalid Al-Amri', due: '2026-09-15', score: null, status: 'pending', goals: 3, goalsCompleted: 1 },
  { id: 'PR003', employee: 'Faisal Al-Harbi', reviewer: 'Khalid Al-Amri', due: '2026-08-01', score: 4.2, status: 'completed', goals: 3, goalsCompleted: 3 },
  { id: 'PR004', employee: 'Nasser Al-Dosari', reviewer: 'Yousef Al-Otaibi', due: '2026-08-15', score: null, status: 'overdue', goals: 4, goalsCompleted: 0 },
  { id: 'PR005', employee: 'Omar Al-Rashid', reviewer: 'Khalid Al-Amri', due: '2026-09-30', score: null, status: 'in_progress', goals: 5, goalsCompleted: 3 },
  { id: 'PR006', employee: 'Sara Al-Mutairi', reviewer: 'Khalid Al-Amri', due: '2026-07-30', score: 4.5, status: 'completed', goals: 4, goalsCompleted: 4 },
  { id: 'PR007', employee: 'Layla Al-Sulaiman', reviewer: 'Khalid Al-Amri', due: '2026-08-30', score: null, status: 'in_progress', goals: 3, goalsCompleted: 1 },
]

export function StaffPerformanceReview() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? REVIEWS : REVIEWS.filter((r) => r.status === statusFilter)),
    [statusFilter]
  )

  const reviewsDue = REVIEWS.filter((r) => r.status === 'pending' || r.status === 'in_progress').length
  const completed = REVIEWS.filter((r) => r.status === 'completed').length
  const overdue = REVIEWS.filter((r) => r.status === 'overdue').length
  const avgScore = useMemo(() => {
    const scored = REVIEWS.filter((r) => r.score !== null)
    return scored.length ? (scored.reduce((sum, r) => sum + r.score!, 0) / scored.length).toFixed(1) : '—'
  }, [])

  const columns: Column<Review>[] = [
    { header: 'Employee', cell: (r) => <span className="text-[13px] font-semibold text-heading">{r.employee}</span> },
    { header: 'Reviewer', cell: (r) => r.reviewer },
    { header: 'Due', cell: (r) => r.due },
    {
      header: 'Score',
      cell: (r) =>
        r.score !== null ? (
          <span className="flex items-center gap-1 font-mono text-[13px] font-semibold text-heading" dir="ltr">
            <Icon name="Star" size={13} className="text-salis-blue" />
            {r.score.toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
    {
      header: 'Goals',
      cell: (r) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {r.goalsCompleted}/{r.goals}
        </span>
      ),
    },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Star"
        title={t('Performance Reviews')}
        subtitle={t('Appraisals and development tracking')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('New Review')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Reviews Due', value: reviewsDue, caption: 'This quarter', highlight: true },
          { label: 'Completed', value: completed, caption: 'This quarter', tone: 'info' },
          { label: 'Overdue', value: overdue, caption: 'Past due', tone: 'warning' },
          { label: 'Avg Score', value: avgScore, caption: 'Out of 5' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map((option) => {
          const count = option === 'all' ? REVIEWS.length : REVIEWS.filter((r) => r.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={statusFilter === option}
              onClick={() => setStatusFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                statusFilter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.employee} trailing={<Tone value={r.status} />} />
            <MobileCardRow label={t('Reviewer')}>{r.reviewer}</MobileCardRow>
            <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            <MobileCardRow label={t('Score')}>
              {r.score !== null ? (
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Icon name="Star" size={13} className="text-salis-blue" />
                  {r.score.toFixed(1)}
                </span>
              ) : '—'}
            </MobileCardRow>
            <MobileCardRow label={t('Goals')}>{r.goalsCompleted}/{r.goals}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Star" title={t('No reviews found')} />}
      />
    </>
  )
}

// ── 5. Timesheet Management ─────────────────────────────────────────────────

interface Timesheet {
  id: string
  employee: string
  period: string
  hours: number
  overtime: number
  status: 'approved' | 'pending' | 'rejected' | 'draft'
}

const TIMESHEETS: readonly Timesheet[] = [
  { id: 'TS001', employee: 'Yousef Al-Otaibi', period: 'Aug 18 – 24', hours: 44, overtime: 4, status: 'approved' },
  { id: 'TS002', employee: 'Bandar Al-Qahtani', period: 'Aug 18 – 24', hours: 40, overtime: 0, status: 'approved' },
  { id: 'TS003', employee: 'Nasser Al-Dosari', period: 'Aug 18 – 24', hours: 38, overtime: 0, status: 'pending' },
  { id: 'TS004', employee: 'Omar Al-Rashid', period: 'Aug 18 – 24', hours: 42, overtime: 2, status: 'pending' },
  { id: 'TS005', employee: 'Khalid Al-Amri', period: 'Aug 18 – 24', hours: 45, overtime: 5, status: 'approved' },
  { id: 'TS006', employee: 'Sara Al-Mutairi', period: 'Aug 18 – 24', hours: 40, overtime: 0, status: 'approved' },
  { id: 'TS007', employee: 'Yousef Al-Otaibi', period: 'Aug 25 – 31', hours: 40, overtime: 0, status: 'draft' },
  { id: 'TS008', employee: 'Bandar Al-Qahtani', period: 'Aug 25 – 31', hours: 36, overtime: 0, status: 'pending' },
]

export function TimesheetManagement() {
  const { t } = usePreferences()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? TIMESHEETS : TIMESHEETS.filter((ts) => ts.status === statusFilter)),
    [statusFilter]
  )

  const awaiting = TIMESHEETS.filter((ts) => ts.status === 'pending').length
  const approvedThisWeek = TIMESHEETS.filter((ts) => ts.status === 'approved').length
  const totalHours = TIMESHEETS.reduce((sum, ts) => sum + ts.hours, 0)
  const totalOT = TIMESHEETS.reduce((sum, ts) => sum + ts.overtime, 0)

  const columns: Column<Timesheet>[] = [
    { header: 'Employee', cell: (ts) => <span className="text-[13px] font-semibold text-heading">{ts.employee}</span> },
    { header: 'Period', cell: (ts) => ts.period },
    { header: 'Hours', cell: (ts) => <span className="font-mono text-[13px]" dir="ltr">{ts.hours}h</span> },
    {
      header: 'Overtime',
      cell: (ts) =>
        ts.overtime > 0 ? (
          <span className="font-mono text-[13px] text-salis-orange" dir="ltr">+{ts.overtime}h</span>
        ) : (
          <span className="font-mono text-[13px] text-muted" dir="ltr">0h</span>
        ),
    },
    { header: 'Status', cell: (ts) => <Tone value={ts.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Clock"
        title={t('Timesheet Management')}
        subtitle={t('Recorded hours and approvals')}
      />
      <StatRow
        stats={[
          { label: 'Awaiting Approval', value: awaiting, caption: 'Submitted', highlight: true, tone: 'warning' },
          { label: 'Approved', value: approvedThisWeek, caption: 'Signed off', tone: 'info' },
          { label: 'Total Hours', value: `${totalHours}h`, caption: 'This period' },
          { label: 'Overtime', value: `${totalOT}h`, caption: 'Extra hours', tone: 'warning' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'draft', 'pending', 'approved', 'rejected'] as const).map((option) => {
          const count = option === 'all' ? TIMESHEETS.length : TIMESHEETS.filter((ts) => ts.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={statusFilter === option}
              onClick={() => setStatusFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                statusFilter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option)}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(ts) => ts.id}
        mobileCard={(ts) => (
          <>
            <MobileCardHeader title={ts.employee} trailing={<Tone value={ts.status} />} />
            <MobileCardRow label={t('Period')}>{ts.period}</MobileCardRow>
            <MobileCardRow label={t('Hours')}>
              <span className="font-mono" dir="ltr">{ts.hours}h</span>
            </MobileCardRow>
            <MobileCardRow label={t('Overtime')}>
              <span className="font-mono" dir="ltr">{ts.overtime > 0 ? `+${ts.overtime}h` : '0h'}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Clock" title={t('No timesheets found')} />}
      />
    </>
  )
}

// ── 6. Timeclock Payroll ────────────────────────────────────────────────────

interface ClockRecord {
  id: string
  employee: string
  date: string
  clockIn: string
  clockOut: string
  regular: number
  overtime: number
  status: 'clocked_in' | 'clocked_out' | 'approved' | 'pending'
}

const CLOCK_RECORDS: readonly ClockRecord[] = [
  { id: 'CK001', employee: 'Yousef Al-Otaibi', date: '2026-08-28', clockIn: '06:02', clockOut: '14:35', regular: 8, overtime: 0.5, status: 'clocked_out' },
  { id: 'CK002', employee: 'Bandar Al-Qahtani', date: '2026-08-28', clockIn: '05:58', clockOut: '14:05', regular: 8, overtime: 0, status: 'clocked_out' },
  { id: 'CK003', employee: 'Nasser Al-Dosari', date: '2026-08-28', clockIn: '13:55', clockOut: '—', regular: 0, overtime: 0, status: 'clocked_in' },
  { id: 'CK004', employee: 'Omar Al-Rashid', date: '2026-08-28', clockIn: '06:10', clockOut: '14:10', regular: 8, overtime: 0, status: 'approved' },
  { id: 'CK005', employee: 'Khalid Al-Amri', date: '2026-08-28', clockIn: '07:00', clockOut: '16:30', regular: 8, overtime: 1.5, status: 'approved' },
  { id: 'CK006', employee: 'Sara Al-Mutairi', date: '2026-08-28', clockIn: '07:05', clockOut: '15:05', regular: 8, overtime: 0, status: 'clocked_out' },
  { id: 'CK007', employee: 'Yousef Al-Otaibi', date: '2026-08-27', clockIn: '06:00', clockOut: '15:00', regular: 8, overtime: 1, status: 'approved' },
  { id: 'CK008', employee: 'Bandar Al-Qahtani', date: '2026-08-27', clockIn: '06:05', clockOut: '14:00', regular: 8, overtime: 0, status: 'pending' },
]

export function TimeclockPayroll() {
  const { t } = usePreferences()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? CLOCK_RECORDS : CLOCK_RECORDS.filter((r) => r.status === statusFilter)),
    [statusFilter]
  )

  const totalRegular = CLOCK_RECORDS.reduce((sum, r) => sum + r.regular, 0)
  const totalOT = CLOCK_RECORDS.reduce((sum, r) => sum + r.overtime, 0)
  const exceptions = CLOCK_RECORDS.filter((r) => r.status === 'pending').length
  const readyForPayroll = CLOCK_RECORDS.filter((r) => r.status === 'approved').length

  const columns: Column<ClockRecord>[] = [
    { header: 'Employee', cell: (r) => <span className="text-[13px] font-semibold text-heading">{r.employee}</span> },
    { header: 'Date', cell: (r) => r.date },
    {
      header: 'Clock In',
      cell: (r) => <span className="font-mono text-[13px] text-salis-blue" dir="ltr">{r.clockIn}</span>,
    },
    {
      header: 'Clock Out',
      cell: (r) => (
        <span className={cn('font-mono text-[13px]', r.clockOut === '—' ? 'text-muted' : 'text-heading')} dir="ltr">
          {r.clockOut}
        </span>
      ),
    },
    { header: 'Regular', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.regular}h</span> },
    {
      header: 'Overtime',
      cell: (r) =>
        r.overtime > 0 ? (
          <span className="font-mono text-[13px] text-salis-orange" dir="ltr">+{r.overtime}h</span>
        ) : (
          <span className="font-mono text-[13px] text-muted" dir="ltr">0h</span>
        ),
    },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Timer"
        title={t('Timeclock & Payroll')}
        subtitle={t('Bridge clocked hours into payroll')}
      />
      <StatRow
        stats={[
          { label: 'Regular Hours', value: `${totalRegular}h`, caption: 'This period', highlight: true },
          { label: 'Overtime', value: `${totalOT}h`, caption: 'Hours' },
          { label: 'Exceptions', value: exceptions, caption: 'Need review', tone: 'warning' },
          { label: 'Ready For Payroll', value: readyForPayroll, caption: 'Approved', tone: 'info' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'clocked_in', 'clocked_out', 'approved', 'pending'] as const).map((option) => {
          const count = option === 'all' ? CLOCK_RECORDS.length : CLOCK_RECORDS.filter((r) => r.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={statusFilter === option}
              onClick={() => setStatusFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                statusFilter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.employee} trailing={<Tone value={r.status} />} />
            <MobileCardRow label={t('Date')}>{r.date}</MobileCardRow>
            <MobileCardRow label={t('Clock In')}>
              <span className="font-mono text-salis-blue" dir="ltr">{r.clockIn}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Clock Out')}>
              <span className="font-mono" dir="ltr">{r.clockOut}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Hours')}>
              <span className="font-mono" dir="ltr">{r.regular}h + {r.overtime}h OT</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Timer" title={t('No clock records this period')} />}
      />
    </>
  )
}

// ── 7. Payroll Management ───────────────────────────────────────────────────

const ALLOWANCE_RATE = 0.15
const DEDUCTION_RATE = 0.09

interface PayrollEntry {
  id: string
  employee: string
  base: number
  allowance: number
  deduction: number
  net: number
  status: 'paid' | 'processed' | 'pending'
}

const PAYROLL_ENTRIES: readonly PayrollEntry[] = EMPLOYEES.map((e, i) => {
  const allowance = Math.round(e.salary * ALLOWANCE_RATE)
  const deduction = Math.round(e.salary * DEDUCTION_RATE)
  return {
    id: `PAY${String(i + 1).padStart(3, '0')}`,
    employee: e.name,
    base: e.salary,
    allowance,
    deduction,
    net: e.salary + allowance - deduction,
    status: i < 4 ? 'paid' as const : i < 6 ? 'processed' as const : 'pending' as const,
  }
})

export function PayrollManagement() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const hideSalary = fieldHidden('Employee salary')

  const totalGross = useMemo(() => PAYROLL_ENTRIES.reduce((sum, p) => sum + p.base, 0), [])
  const totalNet = useMemo(() => PAYROLL_ENTRIES.reduce((sum, p) => sum + p.net, 0), [])
  const totalDeductions = useMemo(() => PAYROLL_ENTRIES.reduce((sum, p) => sum + p.deduction, 0), [])
  const paidCount = PAYROLL_ENTRIES.filter((p) => p.status === 'paid').length
  const pendingCount = PAYROLL_ENTRIES.filter((p) => p.status === 'pending').length

  if (hideSalary) {
    return (
      <>
        <FeatureHeader
          icon="Banknote"
          title={t('Payroll Management')}
          subtitle={t('Salaries, deductions and payslips')}
        />
        <EmptyState icon="Lock" title={t('Salary details are restricted for your role')} />
      </>
    )
  }

  const columns: Column<PayrollEntry>[] = [
    { header: 'Employee', cell: (p) => <span className="text-[13px] font-semibold text-heading">{p.employee}</span> },
    { header: 'Base Salary', cell: (p) => <Money sar={p.base} /> },
    {
      header: 'Allowances',
      cell: (p) => (
        <span className="font-mono text-[13px] text-salis-blue" dir="ltr">+{formatSar(p.allowance)}</span>
      ),
    },
    {
      header: 'Deductions',
      cell: (p) => (
        <span className="font-mono text-[13px] text-salis-orange" dir="ltr">-{formatSar(p.deduction)}</span>
      ),
    },
    { header: 'Net Pay', cell: (p) => <Money sar={p.net} className="font-bold" /> },
    { header: 'Status', cell: (p) => <Tone value={p.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Banknote"
        title={t('Payroll Management')}
        subtitle={t('Salaries, deductions and payslips')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Play" size={16} />
              {t('Run Payroll')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Payroll This Month', value: formatSar(totalGross), caption: 'Gross', highlight: true },
          { label: 'Employees Paid', value: paidCount, caption: 'This run', tone: 'info' },
          { label: 'Pending', value: pendingCount, caption: 'Not yet run', tone: 'warning' },
          { label: 'Deductions', value: formatSar(totalDeductions), caption: 'This month' },
        ]}
      />

      <DataTable
        columns={columns}
        rows={[...PAYROLL_ENTRIES]}
        rowKey={(p) => p.id}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.employee} trailing={<Tone value={p.status} />} />
            <MobileCardRow label={t('Base Salary')}>
              <Money sar={p.base} className="text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Allowances')}>
              <span className="font-mono text-salis-blue" dir="ltr">+{formatSar(p.allowance)}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Deductions')}>
              <span className="font-mono text-salis-orange" dir="ltr">-{formatSar(p.deduction)}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Net Pay')}>
              <Money sar={p.net} className="font-bold text-heading" />
            </MobileCardRow>
          </>
        )}
        footer={
          <TableFooter
            summary={
              <span className="font-semibold text-heading">
                {t('Total Net Payroll')}: <Money sar={totalNet} className="font-bold" />
              </span>
            }
          />
        }
        empty={<EmptyState icon="Banknote" title={t('No payroll runs yet')} />}
      />
    </>
  )
}

// ── 8. Leave Requests ───────────────────────────────────────────────────────

interface LeaveRequest {
  id: string
  employee: string
  type: 'annual' | 'sick' | 'personal' | 'emergency'
  from: string
  to: string
  days: number
  status: 'approved' | 'pending' | 'rejected'
  reason: string
}

const LEAVE_TYPE_TONE: Record<string, readonly [string, string]> = {
  annual: ['rgba(10,94,215,.1)', '#0A5ED7'],
  sick: ['rgba(249,115,22,.1)', '#F97316'],
  personal: ['rgba(11,179,255,.1)', '#0BB3FF'],
  emergency: ['rgba(11,31,59,.1)', '#0B1F3B'],
}

const LEAVE_REQUESTS: readonly LeaveRequest[] = [
  { id: 'LR001', employee: 'Faisal Al-Harbi', type: 'annual', from: '2026-08-20', to: '2026-08-27', days: 5, status: 'approved', reason: 'Family vacation' },
  { id: 'LR002', employee: 'Layla Al-Sulaiman', type: 'sick', from: '2026-08-26', to: '2026-08-28', days: 3, status: 'approved', reason: 'Medical appointment' },
  { id: 'LR003', employee: 'Omar Al-Rashid', type: 'personal', from: '2026-09-01', to: '2026-09-02', days: 2, status: 'pending', reason: 'Personal matters' },
  { id: 'LR004', employee: 'Nasser Al-Dosari', type: 'annual', from: '2026-09-10', to: '2026-09-14', days: 5, status: 'pending', reason: 'Eid holiday' },
  { id: 'LR005', employee: 'Yousef Al-Otaibi', type: 'emergency', from: '2026-08-15', to: '2026-08-15', days: 1, status: 'approved', reason: 'Family emergency' },
  { id: 'LR006', employee: 'Sara Al-Mutairi', type: 'annual', from: '2026-09-20', to: '2026-09-25', days: 4, status: 'pending', reason: 'Travel' },
  { id: 'LR007', employee: 'Bandar Al-Qahtani', type: 'sick', from: '2026-08-10', to: '2026-08-11', days: 2, status: 'approved', reason: 'Unwell' },
]

export function LeaveRequests() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? LEAVE_REQUESTS : LEAVE_REQUESTS.filter((lr) => lr.status === statusFilter)),
    [statusFilter]
  )

  const pendingCount = LEAVE_REQUESTS.filter((lr) => lr.status === 'pending').length
  const approvedCount = LEAVE_REQUESTS.filter((lr) => lr.status === 'approved').length
  const onLeaveToday = LEAVE_REQUESTS.filter(
    (lr) => lr.status === 'approved' && lr.from <= '2026-08-28' && lr.to >= '2026-08-28'
  ).length
  const upcoming = LEAVE_REQUESTS.filter((lr) => lr.from > '2026-08-28').length

  const columns: Column<LeaveRequest>[] = [
    { header: 'Employee', cell: (lr) => <span className="text-[13px] font-semibold text-heading">{lr.employee}</span> },
    {
      header: 'Type',
      cell: (lr) => {
        const [bg, fg] = LEAVE_TYPE_TONE[lr.type] ?? ['rgba(100,116,139,.1)', '#64748B']
        return (
          <Badge background={bg} color={fg}>
            {t(lr.type[0].toUpperCase() + lr.type.slice(1))}
          </Badge>
        )
      },
    },
    { header: 'From', cell: (lr) => lr.from },
    { header: 'To', cell: (lr) => lr.to },
    { header: 'Days', cell: (lr) => <span className="font-mono text-[13px]" dir="ltr">{lr.days}</span> },
    { header: 'Status', cell: (lr) => <Tone value={lr.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="CalendarX"
        title={t('Leave Requests')}
        subtitle={t('Time-off requests and approvals')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Request Leave')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Pending', value: pendingCount, caption: 'Awaiting approval', highlight: true, tone: 'warning' },
          { label: 'Approved', value: approvedCount, caption: 'This month', tone: 'info' },
          { label: 'On Leave Today', value: onLeaveToday, caption: 'Away' },
          { label: 'Upcoming', value: upcoming, caption: 'Next 30 days' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((option) => {
          const count = option === 'all' ? LEAVE_REQUESTS.length : LEAVE_REQUESTS.filter((lr) => lr.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={statusFilter === option}
              onClick={() => setStatusFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                statusFilter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option)}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(lr) => lr.id}
        mobileCard={(lr) => (
          <>
            <MobileCardHeader title={lr.employee} trailing={<Tone value={lr.status} />} />
            <MobileCardRow label={t('Type')}>
              {t(lr.type[0].toUpperCase() + lr.type.slice(1))}
            </MobileCardRow>
            <MobileCardRow label={t('Period')}>
              {lr.from} → {lr.to} ({lr.days}d)
            </MobileCardRow>
            <MobileCardRow label={t('Reason')}>{lr.reason}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="CalendarX" title={t('No leave requests')} />}
      />
    </>
  )
}

// ── 9. Training LMS ────────────────────────────────────────────────────────

interface Course {
  id: string
  name: string
  category: string
  enrolled: number
  completed: number
  duration: string
  status: 'active' | 'draft' | 'completed'
  certExpiry: string | null
}

const COURSES: readonly Course[] = [
  { id: 'CRS001', name: 'Automotive Electrical Systems', category: 'Technical', enrolled: 6, completed: 4, duration: '16h', status: 'active', certExpiry: '2027-03-15' },
  { id: 'CRS002', name: 'Workplace Safety', category: 'Safety', enrolled: 8, completed: 8, duration: '4h', status: 'completed', certExpiry: '2026-12-01' },
  { id: 'CRS003', name: 'Customer Service Excellence', category: 'Soft Skills', enrolled: 5, completed: 2, duration: '8h', status: 'active', certExpiry: null },
  { id: 'CRS004', name: 'Advanced Diagnostics – OBD-II', category: 'Technical', enrolled: 4, completed: 0, duration: '24h', status: 'active', certExpiry: '2027-06-01' },
  { id: 'CRS005', name: 'First Aid & CPR', category: 'Safety', enrolled: 8, completed: 6, duration: '6h', status: 'active', certExpiry: '2026-11-15' },
  { id: 'CRS006', name: 'Hybrid & EV Systems', category: 'Technical', enrolled: 3, completed: 0, duration: '32h', status: 'draft', certExpiry: null },
  { id: 'CRS007', name: 'Financial Literacy for Staff', category: 'Soft Skills', enrolled: 0, completed: 0, duration: '4h', status: 'draft', certExpiry: null },
]

const CATEGORY_ICON: Record<string, string> = {
  Technical: 'Wrench',
  Safety: 'ShieldCheck',
  'Soft Skills': 'MessageCircle',
}

export function TrainingLMS() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [catFilter, setCatFilter] = useState<string>('all')

  const categories = useMemo(() => ['all', ...new Set(COURSES.map((c) => c.category))], [])

  const filtered = useMemo(
    () => (catFilter === 'all' ? COURSES : COURSES.filter((c) => c.category === catFilter)),
    [catFilter]
  )

  const activeCourses = COURSES.filter((c) => c.status === 'active').length
  const inProgress = COURSES.reduce((sum, c) => sum + (c.enrolled - c.completed), 0)
  const certExpiring = COURSES.filter(
    (c) => c.certExpiry && c.certExpiry <= '2026-11-30'
  ).length
  const totalEnrolled = COURSES.reduce((sum, c) => sum + c.enrolled, 0)
  const totalCompleted = COURSES.reduce((sum, c) => sum + c.completed, 0)
  const completionRate = totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0

  const columns: Column<Course>[] = [
    {
      header: 'Course',
      cell: (c) => (
        <span className="flex items-center gap-2">
          <Icon name={CATEGORY_ICON[c.category] ?? 'BookOpen'} size={15} className="text-salis-blue" />
          <span className="text-[13px] font-semibold text-heading">{t(c.name)}</span>
        </span>
      ),
    },
    { header: 'Category', cell: (c) => t(c.category) },
    { header: 'Duration', cell: (c) => <span className="font-mono text-[13px]" dir="ltr">{c.duration}</span> },
    { header: 'Enrolled', cell: (c) => c.enrolled },
    {
      header: 'Completion',
      cell: (c) => (
        <span className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full bg-salis-gradient-r"
              style={{ width: `${c.enrolled ? (c.completed / c.enrolled) * 100 : 0}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-muted" dir="ltr">
            {c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0}%
          </span>
        </span>
      ),
    },
    { header: 'Status', cell: (c) => <Tone value={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Library"
        title={t('Training & LMS')}
        subtitle={t('Courses, certifications and learning progress')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Course')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Courses', value: activeCourses, caption: 'Available', highlight: true },
          { label: 'In Progress', value: inProgress, caption: 'Enrolments', tone: 'info' },
          { label: 'Certs Expiring', value: certExpiring, caption: 'Within 90 days', tone: 'warning' },
          { label: 'Completion Rate', value: `${completionRate}%`, caption: 'Assigned courses' },
        ]}
      />

      <div role="tablist" aria-label={t('Category')} className="flex flex-wrap gap-2">
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={catFilter === option}
            onClick={() => setCatFilter(option)}
            className={cn(
              'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium transition-all duration-150',
              catFilter === option
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            {t(option === 'all' ? 'All' : option)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(c) => c.id}
        mobileCard={(c) => (
          <>
            <MobileCardHeader title={t(c.name)} trailing={<Tone value={c.status} />} />
            <MobileCardRow label={t('Category')}>{t(c.category)}</MobileCardRow>
            <MobileCardRow label={t('Duration')}>
              <span className="font-mono" dir="ltr">{c.duration}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Enrolled')}>{c.enrolled}</MobileCardRow>
            <MobileCardRow label={t('Completion')}>
              {c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0}%
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Library" title={t('No courses available yet')} />}
      />
    </>
  )
}
