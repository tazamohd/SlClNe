import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { Search } from '@/components/ui/Search'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  MAX_PAGE_SIZE,
  RepositoryError,
  useCollection,
  useCreate,
  usePagedCollection,
  useUpdate,
  type RowOf,
} from '@/data/useCollection'
import { rowId } from '../registry/writes'

/** Training LMS (BLK-004) — the staff course catalogue and the roster behind it.
 *
 *  This screen used to render a hardcoded `MOCK_COURSES` array of eight courses,
 *  each carrying an `enrolled` head count and a `completion` percentage that were
 *  simply typed into the source, and then computed its four KPIs *from* those two
 *  invented numbers. It now reads `trainingCourses`
 *  (`GET/POST/PATCH /training/courses`) and `trainingEnrolments`
 *  (`GET/POST/PATCH /training/enrolments`).
 *
 *  ─── What is derived and what is recorded ────────────────────────────────
 *
 *  **Derived, from the roster:** every head count and every percentage on this
 *  screen. A course's enrolment count is the enrolments naming it, counted here;
 *  its completion is how many of those reached `completed` over how many there
 *  are. Nothing records either number, so nothing can disagree with the roster —
 *  they *are* the roster. A withdrawn enrolment is left out of both: somebody who
 *  started and stopped is not enrolled, and counting them would quietly depress
 *  the percentage.
 *
 *  **Recorded, on the course row:** its title, category, `durationMinutes` and
 *  lifecycle status. That is right — how long a course takes to sit is a property
 *  of the course, and no roster knows it.
 *
 *  A course nobody is enrolled on shows a real `0` and **no** completion figure,
 *  because there is no denominator to compute one from; it is never hidden, and
 *  it is never given a number. The line under the table says which column is
 *  which rather than leaving a reader to guess.
 */

type Course = RowOf<'trainingCourses'>
type Enrolment = RowOf<'trainingEnrolments'>
type Employee = RowOf<'employees'>

/** A course with the roster facts counted from `trainingEnrolments`. */
type CourseProgress = Course & {
  /** Enrolments on this course that have not been withdrawn. */
  enrolled: number
  completed: number
  /** Null when nobody is enrolled — rendered as a dash rather than a
   *  fabricated 0%, because there is no denominator. */
  completion: number | null
}

const CATEGORY_LABEL: Record<string, string> = {
  safety: 'Safety',
  technical: 'Technical',
  customer_service: 'Customer Service',
  compliance: 'Compliance',
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  safety: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  technical: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  customer_service: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  compliance: { bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
}

const COURSE_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

const COURSE_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  draft: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  archived: { bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
}

const ENROLMENT_STATUS_LABEL: Record<string, string> = {
  enrolled: 'Enrolled',
  in_progress: 'In Progress',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
}

const ENROLMENT_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  enrolled: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  in_progress: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  completed: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  withdrawn: { bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
}

/** `240` → `4 hrs`, `90` → `1.5 hrs`. The mock stored `'1.5 hrs'` as prose; the
 *  minutes are recorded and the label is formatted from them, so no fractional
 *  hour has to be parsed back out of a string. Zero minutes is "not stated", and
 *  reads as a dash rather than `0 hrs`. */
function durationLabel(minutes: number): string | null {
  if (minutes <= 0) return null
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`
}

function dayLabel(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

export function TrainingLMS() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [enrolCourse, setEnrolCourse] = useState('')
  const [enrolEmployee, setEnrolEmployee] = useState('')

  const mayEditCourse = can('hr', 'e')
  const mayEnrol = can('hr', 'c')

  const courses = useCollection('trainingCourses')
  /* The whole roster in one read, because every course's figures are a group
   * over it. `MAX_PAGE_SIZE` is the ceiling the API enforces, so a tenant with
   * more enrolments than that would be counted from a partial list — which the
   * screen says out loud below rather than presenting as a total. */
  const enrolments = usePagedCollection('trainingEnrolments', { pageSize: MAX_PAGE_SIZE })
  /* Only for the enrol picker: a roster shows the name it recorded, so the
   * employee directory is not needed to read this screen. */
  const employees = useCollection('employees', mayEnrol ? undefined : { pageSize: 1 })

  const updateCourse = useUpdate('trainingCourses')
  const updateEnrolment = useUpdate('trainingEnrolments')
  const createEnrolment = useCreate('trainingEnrolments')

  const enrolmentRows: readonly Enrolment[] = enrolments.data?.rows ?? []
  const enrolmentTotal = enrolments.data?.page.total ?? enrolmentRows.length
  const enrolmentsTruncated = enrolmentTotal > enrolmentRows.length
  const employeeRows: readonly Employee[] = employees.data ?? []

  const courseTitle = (course: Course) => (rtl && course.titleAr ? course.titleAr : course.title)

  const rows = useMemo<CourseProgress[]>(
    () =>
      (courses.data ?? []).map((course) => {
        /* Withdrawn rows are excluded from both the count and the denominator:
         * they are history, not enrolment. */
        const live = enrolmentRows.filter(
          (row) => row.courseCode === course.code && row.status !== 'withdrawn',
        )
        const completed = live.filter((row) => row.status === 'completed').length
        return {
          ...course,
          enrolled: live.length,
          completed,
          completion: live.length > 0 ? Math.round((completed / live.length) * 100) : null,
        }
      }),
    [courses.data, enrolmentRows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        (course.titleAr ?? '').toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        (CATEGORY_LABEL[course.category] ?? course.category).toLowerCase().includes(q),
    )
  }, [rows, search])

  const totals = useMemo(() => {
    const live = rows.reduce((sum, course) => sum + course.enrolled, 0)
    const completed = rows.reduce((sum, course) => sum + course.completed, 0)
    return {
      courses: rows.length,
      active: rows.filter((course) => course.status === 'active').length,
      enrolled: live,
      /* The real totals over each other, not an average of the per-course
       * percentages — and null rather than 0% when nobody is enrolled at all. */
      completion: live > 0 ? Math.round((completed / live) * 100) : null,
    }
  }, [rows])

  const publishableCourses = useMemo(
    () => (courses.data ?? []).filter((course) => course.status === 'active'),
    [courses.data],
  )

  const moveCourse = async (course: CourseProgress, status: Course['status']) => {
    const id = rowId(course)
    if (!id) return
    setBusyId(id)
    try {
      await updateCourse.mutateAsync({ id, patch: { status } as Partial<Course> })
      toast.show({
        title: status === 'active' ? t('Course published') : t('Course archived'),
        description: courseTitle(course),
      })
    } catch (cause) {
      toast.show({
        title: t('Could not update course'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const moveEnrolment = async (enrolment: Enrolment, status: Enrolment['status']) => {
    const id = rowId(enrolment)
    if (!id) return
    setBusyId(id)
    try {
      await updateEnrolment.mutateAsync({ id, patch: { status } as Partial<Enrolment> })
      toast.show({
        title: status === 'completed' ? t('Marked as completed') : t('Enrolment withdrawn'),
        description: enrolment.employeeName,
      })
    } catch (cause) {
      toast.show({
        title: t('Could not update enrolment'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const enrol = async () => {
    if (!enrolCourse || !enrolEmployee) return
    setBusyId('enrol')
    try {
      await createEnrolment.mutateAsync({
        input: { courseCode: enrolCourse, employeeId: enrolEmployee } as Partial<Enrolment> as never,
      })
      toast.show({ title: t('Employee enrolled') })
      setEnrolEmployee('')
    } catch (cause) {
      toast.show({
        title: t('Could not enrol employee'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const kpis = [
    { label: t('Total Courses'), value: String(totals.courses), icon: 'BookOpen', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(totals.active), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Avg Completion'), value: totals.completion === null ? '—' : `${totals.completion}%`, icon: 'TrendingUp', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Total Enrolled'), value: String(totals.enrolled), icon: 'Users', bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
  ]

  const courseActionCell = (course: CourseProgress) => {
    const id = rowId(course)
    const busy = busyId === id
    if (course.status === 'active') {
      return (
        <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveCourse(course, 'archived')}>
          <Icon name="Archive" size={13} />
          {busy ? t('Updating...') : t('Archive')}
        </Button>
      )
    }
    return (
      <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveCourse(course, 'active')}>
        <Icon name="CheckCircle" size={13} />
        {busy ? t('Updating...') : t('Publish')}
      </Button>
    )
  }

  const courseColumns: Column<CourseProgress>[] = [
    { header: 'Course', cell: (course) => <span className="font-medium text-heading">{courseTitle(course)}</span> },
    {
      header: 'Category',
      cell: (course) => (
        <Badge
          background={(CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS.safety).bg}
          color={(CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS.safety).fg}
        >
          {t(CATEGORY_LABEL[course.category] ?? course.category)}
        </Badge>
      ),
    },
    {
      header: 'Duration',
      cell: (course) => (
        <span className="text-muted" dir="ltr">{durationLabel(course.durationMinutes) ?? '—'}</span>
      ),
    },
    { header: 'Enrolled', cell: (course) => <span className="font-mono text-heading" dir="ltr">{course.enrolled}</span> },
    {
      header: 'Completion',
      cell: (course) => (
        <span className="font-mono text-heading" dir="ltr">
          {course.completion === null ? '—' : `${course.completion}%`}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (course) => (
        <Badge
          background={(COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.draft).bg}
          color={(COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.draft).fg}
        >
          {t(COURSE_STATUS_LABEL[course.status] ?? course.status)}
        </Badge>
      ),
    },
    ...(mayEditCourse ? [{ header: 'Actions', cell: courseActionCell }] : []),
  ]

  const enrolmentActionCell = (enrolment: Enrolment) => {
    const id = rowId(enrolment)
    const busy = busyId === id
    if (enrolment.status === 'withdrawn') return <span className="text-xs text-muted">—</span>
    return (
      <div className="flex flex-wrap gap-2">
        {enrolment.status === 'completed' ? null : (
          <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveEnrolment(enrolment, 'completed')}>
            <Icon name="CheckCircle" size={13} />
            {busy ? t('Updating...') : t('Mark Completed')}
          </Button>
        )}
        <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveEnrolment(enrolment, 'withdrawn')}>
          <Icon name="UserMinus" size={13} />
          {t('Withdraw')}
        </Button>
      </div>
    )
  }

  const courseByCode = useMemo(
    () => new Map((courses.data ?? []).map((course) => [course.code, course])),
    [courses.data],
  )
  const titleForCode = (code: string) => {
    const course = courseByCode.get(code)
    return course ? courseTitle(course) : code
  }

  /** The roster records the name it read from the employee at enrolment, so this
   *  is normally just that. The fallback is for a row written by the in-memory
   *  demo repository, which has no server to denormalise the name: look the
   *  employee up rather than render an empty cell, and say "unknown" rather than
   *  invent somebody if neither is available. */
  const employeeNameFor = (row: Enrolment) => {
    if (row.employeeName) return row.employeeName
    const employee = employeeRows.find((candidate) => rowId(candidate) === row.employeeId)
    return employee?.name ?? t('Unknown employee')
  }

  const enrolmentColumns: Column<Enrolment>[] = [
    { header: 'Employee', cell: (row) => <span className="font-medium text-heading">{employeeNameFor(row)}</span> },
    { header: 'Course', cell: (row) => <span className="text-body">{titleForCode(row.courseCode)}</span> },
    {
      header: 'Status',
      cell: (row) => (
        <Badge
          background={(ENROLMENT_STATUS_COLORS[row.status] ?? ENROLMENT_STATUS_COLORS.enrolled).bg}
          color={(ENROLMENT_STATUS_COLORS[row.status] ?? ENROLMENT_STATUS_COLORS.enrolled).fg}
        >
          {t(ENROLMENT_STATUS_LABEL[row.status] ?? row.status)}
        </Badge>
      ),
    },
    {
      header: 'Completed',
      cell: (row) => <span className="font-mono text-muted" dir="ltr">{dayLabel(row.completedAt) ?? '—'}</span>,
    },
    ...(mayEditCourse ? [{ header: 'Actions', cell: enrolmentActionCell }] : []),
  ]

  if (courses.isError) {
    return <ErrorState description={courses.error?.message} onRetry={() => void courses.refetch()} />
  }
  if (enrolments.isError) {
    return (
      <ErrorState description={enrolments.error?.message} onRetry={() => void enrolments.refetch()} />
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="BookOpen" title={t('Training')} subtitle={t('Learning Management')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search courses...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Training courses"
        columns={courseColumns}
        rows={filtered}
        rowKey={(course) => course.code}
        loading={courses.isLoading || enrolments.isLoading}
        empty={<EmptyState icon="BookOpen" title={t('No courses in the catalogue yet')} />}
        mobileCard={(course) => (
          <>
            <MobileCardHeader
              title={courseTitle(course)}
              trailing={
                <Badge
                  background={(COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.draft).bg}
                  color={(COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.draft).fg}
                >
                  {t(COURSE_STATUS_LABEL[course.status] ?? course.status)}
                </Badge>
              }
            />
            <MobileCardRow label={t('Category')}>
              <Badge
                background={(CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS.safety).bg}
                color={(CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS.safety).fg}
              >
                {t(CATEGORY_LABEL[course.category] ?? course.category)}
              </Badge>
            </MobileCardRow>
            <MobileCardRow label={t('Duration')} value={durationLabel(course.durationMinutes) ?? '—'} />
            <MobileCardRow label={t('Enrolled')} value={String(course.enrolled)} />
            <MobileCardRow
              label={t('Completion')}
              value={course.completion === null ? '—' : `${course.completion}%`}
            />
            {mayEditCourse ? <div className="pt-2">{courseActionCell(course)}</div> : null}
          </>
        )}
      />

      <p className="text-xs text-muted">
        {t('Enrolled counts and completion are counted from the enrolments below; the title, category, duration and status are recorded on the course. A course nobody is enrolled on shows no completion figure rather than a nil one.')}
      </p>
      {enrolmentsTruncated ? (
        <p className="text-xs text-muted">
          {`${t('Counted from the first')} ${enrolmentRows.length} ${t('of')} ${enrolmentTotal} ${t('enrolments')}`}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader icon="Users" title={t('Enrolments')} subtitle={t('Who is on which course')} />
          {mayEnrol ? (
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t('Course')}
                <Select value={enrolCourse} onChange={(event) => setEnrolCourse(event.target.value)}>
                  <option value="">{t('Select a course')}</option>
                  {publishableCourses.map((course) => (
                    <option key={course.code} value={course.code}>
                      {courseTitle(course)}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t('Employee')}
                <Select
                  value={enrolEmployee}
                  onChange={(event) => setEnrolEmployee(event.target.value)}
                >
                  <option value="">{t('Select an employee')}</option>
                  {employeeRows.map((employee) => (
                    <option key={rowId(employee) ?? employee.employeeNumber} value={rowId(employee) ?? ''}>
                      {employee.name}
                    </option>
                  ))}
                </Select>
              </label>
              <Button
                size="sm"
                disabled={!enrolCourse || !enrolEmployee || busyId === 'enrol'}
                onClick={() => void enrol()}
              >
                <Icon name="UserPlus" size={13} />
                {busyId === 'enrol' ? t('Enrolling...') : t('Enrol')}
              </Button>
            </div>
          ) : null}
        </div>

        <DataTable
          caption="Training enrolments"
          columns={enrolmentColumns}
          rows={enrolmentRows}
          rowKey={(row, index) => rowId(row) ?? `enrolment-${index}`}
          loading={enrolments.isLoading}
          empty={
            <EmptyState
              icon="Users"
              title={t('No enrolments yet')}
              description={t('Enrolments are what the head counts and completion figures above are counted from.')}
            />
          }
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                title={employeeNameFor(row)}
                trailing={
                  <Badge
                    background={(ENROLMENT_STATUS_COLORS[row.status] ?? ENROLMENT_STATUS_COLORS.enrolled).bg}
                    color={(ENROLMENT_STATUS_COLORS[row.status] ?? ENROLMENT_STATUS_COLORS.enrolled).fg}
                  >
                    {t(ENROLMENT_STATUS_LABEL[row.status] ?? row.status)}
                  </Badge>
                }
              />
              <MobileCardRow label={t('Course')} value={titleForCode(row.courseCode)} />
              <MobileCardRow label={t('Completed')} value={dayLabel(row.completedAt) ?? '—'} />
              {mayEditCourse ? <div className="pt-2">{enrolmentActionCell(row)}</div> : null}
            </>
          )}
        />
      </div>
    </div>
  )
}
