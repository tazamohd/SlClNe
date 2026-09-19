/** Training LMS (BLK-004) — the course catalogue, the enrolment roster, and the
 *  boundary between them.
 *
 *  What is worth proving here is exactly that boundary. `TrainingLMS.tsx`
 *  rendered an invented `enrolled` head count and an invented `completion`
 *  percentage on every course row; the model that replaced it makes both
 *  aggregates over `training_enrolments`. So these cases assert that a course row
 *  *cannot* carry either number, that the numbers a client computes follow the
 *  roster when the roster changes, and that an enrolment can only ever name one
 *  of this tenant's published courses and one of its real employees.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle
let env: Env
let app: FastifyInstance

async function tokenFor(role: RoleId, sub: string): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function req(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, bearer: string, body?: unknown) {
  return app.inject({
    method,
    url: `/api/v1${url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  })
}

const HR = '01JTRAINHROFFICER0000001'
const TECH = '01JTRAINTECHNICIAN000001'

type CourseRow = {
  _id: string
  id: string
  code: string
  title: string
  titleAr: string | null
  category: string
  durationMinutes: number
  status: string
  publishedAt: string | null
  archivedAt: string | null
  notes: string | null
}

type EnrolmentRow = {
  _id: string
  courseCode: string
  employeeId: string
  employeeName: string
  status: string
  completedAt: string | null
  notes: string | null
}

/** The two numbers the screen shows, counted here the way the screen counts
 *  them: a withdrawal is not an enrolment, and a course with nobody on it has no
 *  completion denominator at all — hence `null` rather than a fabricated zero. */
function derive(rows: readonly EnrolmentRow[], courseCode: string) {
  const live = rows.filter((row) => row.courseCode === courseCode && row.status !== 'withdrawn')
  const completed = live.filter((row) => row.status === 'completed')
  return {
    enrolled: live.length,
    completion: live.length > 0 ? Math.round((completed.length / live.length) * 100) : null,
  }
}

async function roster(bearer: string): Promise<EnrolmentRow[]> {
  const response = await req('GET', '/training/enrolments?pageSize=200', bearer)
  expect(response.statusCode, response.body).toBe(200)
  return (response.json() as { rows: EnrolmentRow[] }).rows
}

async function employeeIdFor(bearer: string, name: string): Promise<string> {
  const response = await req('GET', '/employees?pageSize=50', bearer)
  expect(response.statusCode, response.body).toBe(200)
  const { rows } = response.json() as { rows: { _id: string; name: string }[] }
  const employee = rows.find((row) => row.name === name)
  if (!employee) throw new Error(`expected the seeded employee ${name}`)
  return employee._id
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('the seeded course catalogue', () => {
  it('serves the eight courses, keyed by their catalogue code', async () => {
    const hr = await tokenFor('hr', HR)
    const response = await req('GET', '/training/courses?pageSize=50', hr)
    expect(response.statusCode, response.body).toBe(200)
    const { rows } = response.json() as { rows: CourseRow[] }
    expect(rows.map((course) => course.code)).toEqual([
      'TRN-0001',
      'TRN-0002',
      'TRN-0003',
      'TRN-0004',
      'TRN-0005',
      'TRN-0006',
      'TRN-0007',
      'TRN-0008',
    ])
    /* Golden Path 14 asserts this title is in the catalogue, so it is a real row
     * rather than a label in static copy. */
    const safety = rows.find((course) => course.code === 'TRN-0001')
    expect(safety?.title).toBe('Workplace Safety Essentials')
    expect(safety?.category).toBe('safety')
    expect(safety?.durationMinutes).toBe(240)
    expect(safety?.status).toBe('active')
  })

  it('records a duration and a lifecycle, and no head count or completion at all', async () => {
    const hr = await tokenFor('hr', HR)
    const response = await req('GET', '/training/courses/TRN-0001', hr)
    expect(response.statusCode, response.body).toBe(200)
    const course = response.json() as CourseRow & Record<string, unknown>
    expect(course.durationMinutes).toBe(240)
    /* The whole point of the change: a course row cannot carry a head count or a
     * completion rate, so nothing can present a typed-in number as a computed
     * one. */
    expect(course.enrolled).toBeUndefined()
    expect(course.completion).toBeUndefined()
    expect(course.enrolledCount).toBeUndefined()
    expect(course.completionRate).toBeUndefined()
  })
})

describe('the head count and completion are counted from the roster', () => {
  it('spreads the seeded enrolments so each course has its own real figures', async () => {
    const hr = await tokenFor('hr', HR)
    const rows = await roster(hr)
    expect(rows).toHaveLength(18)

    /* Four of the five staff have finished the safety course; the fifth is part
     * way through. Nothing stores 80% — it is 4 of 5. */
    expect(derive(rows, 'TRN-0001')).toEqual({ enrolled: 5, completion: 80 })
    expect(derive(rows, 'TRN-0002')).toEqual({ enrolled: 3, completion: 33 })
    expect(derive(rows, 'TRN-0003')).toEqual({ enrolled: 2, completion: 100 })
    expect(derive(rows, 'TRN-0004')).toEqual({ enrolled: 4, completion: 50 })
    /* Two rows, one of them withdrawn: one enrolled, and 0% rather than a
     * denominator padded by somebody who left. */
    expect(derive(rows, 'TRN-0005')).toEqual({ enrolled: 1, completion: 0 })
    /* Nobody at all. A real zero and *no* completion figure — there is no
     * denominator to compute one from. */
    expect(derive(rows, 'TRN-0006')).toEqual({ enrolled: 0, completion: null })
    expect(derive(rows, 'TRN-0008')).toEqual({ enrolled: 2, completion: 50 })
  })

  it('serves a course roster on its own, so a screen need not read all of them', async () => {
    const hr = await tokenFor('hr', HR)
    const response = await req('GET', '/training/enrolments?filter[courseCode]=TRN-0003', hr)
    expect(response.statusCode, response.body).toBe(200)
    const { rows } = response.json() as { rows: EnrolmentRow[] }
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.courseCode === 'TRN-0003')).toBe(true)
    expect(rows.every((row) => row.status === 'completed')).toBe(true)
    expect(rows.map((row) => row.employeeName).sort()).toEqual([
      'Fatima Al-Zahrani',
      'Omar Al-Ghamdi',
    ])
  })

  it('follows the roster: enrolling somebody is what raises the head count', async () => {
    const hr = await tokenFor('hr', HR)
    const before = derive(await roster(hr), 'TRN-0003')
    expect(before.enrolled).toBe(2)

    const employeeId = await employeeIdFor(hr, 'Saeed Al-Zahrani')
    const created = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0003',
      employeeId,
    })
    expect(created.statusCode, created.body).toBe(201)
    const enrolment = created.json() as EnrolmentRow
    expect(enrolment.status).toBe('enrolled')
    expect(enrolment.completedAt).toBeNull()

    /* Three on the course now, two of them finished: 67%, and nobody typed it. */
    expect(derive(await roster(hr), 'TRN-0003')).toEqual({ enrolled: 3, completion: 67 })

    const completed = await req('PATCH', `/training/enrolments/${enrolment._id}`, hr, {
      status: 'completed',
    })
    expect(completed.statusCode, completed.body).toBe(200)
    expect((completed.json() as EnrolmentRow).completedAt).not.toBeNull()
    expect(derive(await roster(hr), 'TRN-0003')).toEqual({ enrolled: 3, completion: 100 })

    /* Withdrawing takes the row out of both the count and the denominator, and
     * clears the completion date that no longer describes anything. */
    const withdrawn = await req('PATCH', `/training/enrolments/${enrolment._id}`, hr, {
      status: 'withdrawn',
    })
    expect(withdrawn.statusCode, withdrawn.body).toBe(200)
    expect((withdrawn.json() as EnrolmentRow).completedAt).toBeNull()
    expect(derive(await roster(hr), 'TRN-0003')).toEqual({ enrolled: 2, completion: 100 })

    await req('DELETE', `/training/enrolments/${enrolment._id}`, hr)
    expect(derive(await roster(hr), 'TRN-0003')).toEqual(before)
  })

  it('reads the learner name from the employee rather than taking it from the body', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Omar Al-Ghamdi')
    const created = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0002',
      employeeId,
      employeeName: 'Somebody Who Does Not Work Here',
      completedAt: '2001-01-01T00:00:00.000Z',
    })
    expect(created.statusCode, created.body).toBe(201)
    const enrolment = created.json() as EnrolmentRow
    expect(enrolment.employeeName).toBe('Omar Al-Ghamdi')
    /* A completion date is a date something happened, not an input. */
    expect(enrolment.completedAt).toBeNull()
    await req('DELETE', `/training/enrolments/${enrolment._id}`, hr)
  })
})

describe('an enrolment can only name a real published course and a real employee', () => {
  it('refuses a course this tenant does not have', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Ahmed Al-Rashid')
    const response = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-9999',
      employeeId,
    })
    expect(response.statusCode).toBe(404)
  })

  it('refuses a draft course — nobody can be sent on a course still being written', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Ahmed Al-Rashid')
    const response = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0006',
      employeeId,
    })
    expect(response.statusCode, response.body).toBe(422)
  })

  it('refuses an archived course, whose existing roster still stands', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Nasser Al-Dosari')
    const response = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0008',
      employeeId,
    })
    expect(response.statusCode, response.body).toBe(422)
    /* The two rows already on it are untouched: who has done a course is not
     * undone by the course being retired. */
    expect(derive(await roster(hr), 'TRN-0008')).toEqual({ enrolled: 2, completion: 50 })
  })

  it('refuses an employee who does not exist', async () => {
    const hr = await tokenFor('hr', HR)
    const response = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0002',
      employeeId: '01JNOSUCHEMPLOYEE0000001',
    })
    expect(response.statusCode).toBe(400)
  })

  it('refuses the same employee twice on one course, so a count is a head count', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Ahmed Al-Rashid')
    const response = await req('POST', '/training/enrolments', hr, {
      courseCode: 'TRN-0001',
      employeeId,
    })
    expect(response.statusCode, response.body).toBe(409)
  })

  it('refuses a role with no hr grant at all', async () => {
    const hr = await tokenFor('hr', HR)
    const employeeId = await employeeIdFor(hr, 'Ahmed Al-Rashid')
    const tech = await tokenFor('technician', TECH)
    const response = await req('POST', '/training/enrolments', tech, {
      courseCode: 'TRN-0002',
      employeeId,
    })
    expect(response.statusCode).toBe(403)
  })
})

describe('the course catalogue through the generic router', () => {
  it('creates a course as a draft, assigning a counted code when none is supplied', async () => {
    const hr = await tokenFor('hr', HR)
    const created = await req('POST', '/training/courses', hr, {
      title: 'Wheel Alignment Fundamentals',
      category: 'technical',
      durationMinutes: 210,
    })
    expect(created.statusCode, created.body).toBe(201)
    const course = created.json() as CourseRow
    expect(course.code).toMatch(/^TRN-\d{4}$/)
    expect(course.id).toBe(course.code)
    /* A course is born unpublished: nobody can be enrolled on it yet, and no
     * publication date is invented for it. */
    expect(course.status).toBe('draft')
    expect(course.publishedAt).toBeNull()
    expect(course.archivedAt).toBeNull()
  })

  it('derives publishedAt and archivedAt from the lifecycle move, and clears them', async () => {
    const hr = await tokenFor('hr', HR)
    const created = await req('POST', '/training/courses', hr, {
      code: 'TRN-8001',
      title: 'Hydraulic Lift Safety',
      category: 'safety',
      durationMinutes: 60,
    })
    const id = (created.json() as CourseRow)._id

    const published = await req('PATCH', `/training/courses/${id}`, hr, { status: 'active' })
    expect(published.statusCode, published.body).toBe(200)
    const publishedRow = published.json() as CourseRow
    expect(publishedRow.status).toBe('active')
    expect(publishedRow.publishedAt).not.toBeNull()

    /* Publishing again does not restamp the date: it records when the course
     * first entered the catalogue. */
    const archived = await req('PATCH', `/training/courses/${id}`, hr, { status: 'archived' })
    const archivedRow = archived.json() as CourseRow
    expect(archivedRow.archivedAt).not.toBeNull()
    expect(archivedRow.publishedAt).toBe(publishedRow.publishedAt)

    const backToDraft = await req('PATCH', `/training/courses/${id}`, hr, { status: 'draft' })
    const draftRow = backToDraft.json() as CourseRow
    expect(draftRow.status).toBe('draft')
    expect(draftRow.publishedAt).toBeNull()
    expect(draftRow.archivedAt).toBeNull()
  })

  it('ignores a posted publishedAt: only the transition writes it', async () => {
    const hr = await tokenFor('hr', HR)
    const created = await req('POST', '/training/courses', hr, {
      code: 'TRN-8002',
      title: 'Paint Booth Handling',
      durationMinutes: 45,
      publishedAt: '2001-01-01T00:00:00.000Z',
    })
    /* An unknown key is stripped by the schema rather than honoured; what must
     * not happen is the posted timestamp landing on the row. */
    if (created.statusCode === 201) {
      expect((created.json() as CourseRow).publishedAt).toBeNull()
    } else {
      expect(created.statusCode).toBe(400)
    }
  })

  it('refuses a course whose head count somebody tries to set', async () => {
    const hr = await tokenFor('hr', HR)
    const created = await req('POST', '/training/courses', hr, {
      code: 'TRN-8003',
      title: 'Counted Course',
      durationMinutes: 30,
      enrolled: 99,
      completion: 100,
    })
    /* There is no such column and no such field in the contract, so the two
     * numbers cannot reach the row however they are posted. */
    if (created.statusCode === 201) {
      const course = created.json() as CourseRow & Record<string, unknown>
      expect(course.enrolled).toBeUndefined()
      expect(course.completion).toBeUndefined()
    } else {
      expect(created.statusCode).toBe(400)
    }
  })

  it('refuses a negative duration and an unknown category', async () => {
    const hr = await tokenFor('hr', HR)
    expect(
      (await req('POST', '/training/courses', hr, { title: 'Impossible', durationMinutes: -1 }))
        .statusCode,
    ).toBe(400)
    expect(
      (await req('POST', '/training/courses', hr, { title: 'Unknown Subject', category: 'vibes' }))
        .statusCode,
    ).toBe(400)
  })

  it('refuses a second course on a code the tenant already uses', async () => {
    const hr = await tokenFor('hr', HR)
    const response = await req('POST', '/training/courses', hr, {
      code: 'TRN-0001',
      title: 'Duplicate Safety Course',
    })
    expect(response.statusCode).toBe(409)
  })

  it('is reachable by its catalogue code as well as its id', async () => {
    const hr = await tokenFor('hr', HR)
    const byCode = await req('GET', '/training/courses/TRN-0003', hr)
    expect(byCode.statusCode, byCode.body).toBe(200)
    expect((byCode.json() as CourseRow).title).toBe('Customer Communication Skills')
  })
})

describe('tenant and scope boundaries', () => {
  it('shows a customer on the portal neither the catalogue nor the roster', async () => {
    const customer = await tokenFor('customer', '01JTRAINCUSTOMER00000001')
    /* The `hr` module grants a customer nothing, so the RBAC gate refuses before
     * the `r_self` policy is reached; either answer is a refusal, and neither is
     * a row. */
    for (const path of ['/training/courses', '/training/enrolments']) {
      const response = await req('GET', path, customer)
      expect([401, 403]).toContain(response.statusCode)
    }
  })

  it('shows a technician nothing either — a training record is personnel data', async () => {
    const tech = await tokenFor('technician', TECH)
    const response = await req('GET', '/training/enrolments', tech)
    expect([401, 403]).toContain(response.statusCode)
  })
})
