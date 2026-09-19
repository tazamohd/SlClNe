import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrainingLMS } from '@/screens/hr/TrainingLMS'
import { repository, type TrainingEnrolmentRow } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** Training LMS (BLK-004) — the screen no longer renders the hardcoded
 *  `MOCK_COURSES` array in which every `enrolled` head count and every
 *  `completion` percentage was typed into the source and the four KPIs were then
 *  computed from those inventions. It reads `trainingCourses`
 *  (`GET/POST/PATCH /training/courses`) and `trainingEnrolments`
 *  (`GET/POST/PATCH /training/enrolments`), and both numbers are counted from the
 *  enrolments actually on each course.
 *
 *  That derivation is the thing worth proving, so these cases do not merely check
 *  that a percentage appears: they put real enrolments against a course through
 *  the repository and assert that course's numbers follow, that a withdrawal is
 *  in neither the count nor the denominator, and that marking somebody complete
 *  through the screen moves the figure. A stored `completion` column would pass a
 *  "renders a percentage" test and fail every one of these.
 *
 *  The fixture repository is session-scoped and mutating, so each case removes
 *  what it added. It ships the eight seeded courses (`TRAINING_COURSE_FIXTURE`,
 *  which is why Golden Path 14 can assert a course title with no API) and an
 *  empty roster, so a bare render is the honest "nobody is enrolled" case.
 */

type EnrolmentInput = Parameters<typeof repository.trainingEnrolments.create>[0]
type EmployeeInput = Parameters<typeof repository.employees.create>[0]

const idOf = (row: unknown) => (row as { _id?: string })._id

async function addEmployee(name: string, employeeNumber: string): Promise<string> {
  const created = await repository.employees.create({
    name,
    employeeNumber,
    salaryHalalas: 500000,
  } as unknown as EmployeeInput)
  const id = idOf(created)
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return id
}

/** One enrolment row. `employeeName` is passed here because the in-memory demo
 *  repository has no server to read it from the employee — through the API the
 *  writer fills it and refuses to take it from the body. */
async function enrol(
  courseCode: string,
  employeeName: string,
  status: TrainingEnrolmentRow['status'],
  employeeId = '01JTESTEMPLOYEE000000001',
): Promise<string> {
  const created = await repository.trainingEnrolments.create({
    courseCode,
    employeeId,
    employeeName,
    status,
  } as unknown as EnrolmentInput)
  const id = idOf(created)
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return id
}

async function remove(ids: readonly string[]): Promise<void> {
  for (const id of ids) await repository.trainingEnrolments.delete(id)
}

/** The table row whose first cell is this text. A course title also appears in
 *  the enrol picker's `<option>` list, so the match is narrowed to the one inside
 *  a `<tr>` rather than asserted to be unique. */
/** The value shown on the KPI card with this label. Scoped to the card, because
 *  a bare `getByText('5')` would also match any table cell that happens to read
 *  5. */
async function kpi(label: string): Promise<HTMLElement> {
  const card = (await screen.findByText(label)).closest('div.rounded-xl')
  if (!(card instanceof HTMLElement)) throw new Error(`expected a KPI card for ${label}`)
  return card
}

async function rowFor(text: string): Promise<HTMLElement> {
  const matches = await screen.findAllByText(text)
  const row = matches.map((node) => node.closest('tr')).find((node) => node !== null)
  if (!row) throw new Error(`expected a table row for ${text}`)
  return row
}

describe('TrainingLMS (fixture build)', () => {
  it('shows a course with no enrolments as a real zero and no completion figure', async () => {
    renderWithProviders(<TrainingLMS />, { role: 'hr' })

    /* The title Golden Path 14 asserts, from the catalogue rather than from a
     * constant in the screen. */
    const safety = await rowFor('Workplace Safety Essentials')
    /* `240` recorded minutes, formatted — not the mock's `'4 hrs'` prose. */
    expect(within(safety).getByText('4 hrs')).toBeInTheDocument()
    expect(within(safety).getByText('0')).toBeInTheDocument()
    /* No denominator, so no percentage is invented for it. */
    expect(within(safety).getByText('—')).toBeInTheDocument()

    expect(within(await kpi('Total Courses')).getByText('8')).toBeInTheDocument()
    /* No roster at all, so no average to show — and a dash rather than 0%. */
    expect(within(await kpi('Avg Completion')).getByText('—')).toBeInTheDocument()
    expect(screen.getByText('No enrolments yet')).toBeInTheDocument()
  })

  it('derives a course head count and completion from the enrolments on it', async () => {
    const ids = [
      await enrol('TRN-0001', 'Ahmed Al-Rashid', 'completed'),
      await enrol('TRN-0001', 'Fatima Al-Zahrani', 'completed'),
      await enrol('TRN-0001', 'Nasser Al-Dosari', 'in_progress'),
      await enrol('TRN-0001', 'Omar Al-Ghamdi', 'enrolled'),
      /* A different course, so a figure cannot be a screen-wide constant. */
      await enrol('TRN-0002', 'Saeed Al-Zahrani', 'completed'),
    ]
    try {
      renderWithProviders(<TrainingLMS />, { role: 'hr' })

      /* Two of four finished: 50%, and nothing anywhere stores it. */
      const safety = await rowFor('Workplace Safety Essentials')
      expect(within(safety).getByText('4')).toBeInTheDocument()
      expect(within(safety).getByText('50%')).toBeInTheDocument()

      /* The other course has its own numbers: one of one. */
      const diagnostics = await rowFor('Advanced Engine Diagnostics')
      expect(within(diagnostics).getByText('1')).toBeInTheDocument()
      expect(within(diagnostics).getByText('100%')).toBeInTheDocument()

      /* The KPIs are the real totals over each other — three of five, 60% — not
       * an average of the per-course percentages (which would be 75%). */
      expect(within(await kpi('Total Enrolled')).getByText('5')).toBeInTheDocument()
      expect(within(await kpi('Avg Completion')).getByText('60%')).toBeInTheDocument()
    } finally {
      await remove(ids)
    }
  })

  it('leaves a withdrawal out of both the head count and the denominator', async () => {
    const ids = [
      await enrol('TRN-0003', 'Fatima Al-Zahrani', 'completed'),
      await enrol('TRN-0003', 'Omar Al-Ghamdi', 'enrolled'),
      await enrol('TRN-0003', 'Nasser Al-Dosari', 'withdrawn'),
    ]
    try {
      renderWithProviders(<TrainingLMS />, { role: 'hr' })
      const course = await rowFor('Customer Communication Skills')
      /* Two enrolled, not three, and 50% rather than the 33% a denominator
       * padded by somebody who left would have given. */
      expect(within(course).getByText('2')).toBeInTheDocument()
      expect(within(course).getByText('50%')).toBeInTheDocument()
    } finally {
      await remove(ids)
    }
  })

  it('moves the course figure when an enrolment is marked complete on the screen', async () => {
    const ids = [
      await enrol('TRN-0004', 'Ahmed Al-Rashid', 'enrolled'),
      await enrol('TRN-0004', 'Fatima Al-Zahrani', 'enrolled'),
    ]
    try {
      const user = userEvent.setup()
      renderWithProviders(<TrainingLMS />, { role: 'hr' })

      const course = await rowFor('Regulatory Compliance 2026')
      expect(within(course).getByText('0%')).toBeInTheDocument()

      const roster = await rowFor('Ahmed Al-Rashid')
      await user.click(within(roster).getByRole('button', { name: /Mark Completed/ }))

      /* One of two now: the percentage followed a real status write on a real
       * enrolment row, which is the only way it can move. */
      await waitFor(async () => {
        expect(
          within(await rowFor('Regulatory Compliance 2026')).getByText('50%'),
        ).toBeInTheDocument()
      })
    } finally {
      await remove(ids)
    }
  })

  it('raises the head count when an employee is enrolled through the screen', async () => {
    const employeeId = await addEmployee('Layla Al-Harbi', 'EMP-9001')
    let enrolmentId: string | undefined
    try {
      const user = userEvent.setup()
      renderWithProviders(<TrainingLMS />, { role: 'hr' })

      const before = await rowFor('Electrical Systems Overview')
      expect(within(before).getByText('0')).toBeInTheDocument()

      await user.selectOptions(
        screen.getByRole('combobox', { name: /Course/ }),
        'Electrical Systems Overview',
      )
      await user.selectOptions(screen.getByRole('combobox', { name: /Employee/ }), employeeId)
      await user.click(screen.getByRole('button', { name: /Enrol/ }))

      await waitFor(async () => {
        expect(
          within(await rowFor('Electrical Systems Overview')).getByText('1'),
        ).toBeInTheDocument()
      })
      /* The roster names the employee the enrolment points at rather than
       * leaving the cell blank. */
      expect(await screen.findAllByText('Layla Al-Harbi')).not.toHaveLength(0)

      const rows = await repository.trainingEnrolments.list({ pageSize: 50 })
      enrolmentId = rows.rows.map((row) => idOf(row)).find((id) => Boolean(id))
    } finally {
      if (enrolmentId) await repository.trainingEnrolments.delete(enrolmentId)
      await repository.employees.delete(employeeId)
    }
  })

  it('hides every write control from a role with no hr grant', async () => {
    renderWithProviders(<TrainingLMS />, { role: 'technician' })
    expect(await screen.findByText('Workplace Safety Essentials')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Publish/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Archive/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Enrol/ })).toBeNull()
  })
})
