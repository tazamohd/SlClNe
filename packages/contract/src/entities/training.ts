/** Training (BLK-004) — the course catalogue and the enrolments against it.
 *
 *  `app/src/screens/hr/TrainingLMS.tsx` rendered a hardcoded `MOCK_COURSES`
 *  array of eight courses, each carrying an `enrolled` head count and a
 *  `completion` percentage, and then computed its four KPIs from those two
 *  invented numbers. These two collections are what it reads instead.
 *
 *  ─── Recorded vs derived, decided here rather than left implicit ─────────
 *
 *  `enrolled` and `completion` are **aggregates over enrolments**, not
 *  properties of a course, so neither exists as a field anywhere below.
 *  `trainingCourseRow` has no `enrolled` and no `completion`, and
 *  `trainingEnrolmentCreate` cannot post either. A course's head count is the
 *  enrolments that name it, counted; its completion is how many of those
 *  enrolments actually reached `completed`. Both are computed from the roster,
 *  so neither can drift from it — they *are* the roster.
 *
 *  What a course row records is genuinely a property of the course: its title,
 *  what subject it belongs to, how long it takes to sit, and where it is in its
 *  own publish/archive lifecycle. What an enrolment records is genuinely a
 *  property of one (employee, course) pair: who, which course, how far they
 *  have got, and when they finished.
 *
 *  Server-derived, never accepted as input: `publishedAt`/`archivedAt` on a
 *  course and `completedAt` on an enrolment all come from the status
 *  transition in `server/src/writers.ts` — the discipline
 *  `equipment_warranties.claimed_at` and `warehouse_zones.maintenance_since`
 *  use — as does `employeeName` on an enrolment, which is read from the
 *  referenced employee rather than posted alongside the id.
 */
import { z } from 'zod'
import { nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

/* ------------------------------------------------------------- enumerations */

/** The subject a course belongs to. The four the catalogue has always shown,
 *  as stored values rather than the display strings the mock carried. */
export const trainingCategory = z.enum(['safety', 'technical', 'customer_service', 'compliance'])
export type TrainingCategory = z.infer<typeof trainingCategory>

/** The course's own lifecycle: a draft nobody can be sent on yet, a published
 *  course, and one retired from the catalogue. Deliberately *not* anything
 *  about how full or how complete it is — that is derived from enrolments. */
export const trainingCourseStatus = z.enum(['draft', 'active', 'archived'])
export type TrainingCourseStatus = z.infer<typeof trainingCourseStatus>

/** Where one employee has got to on one course.
 *
 *  `withdrawn` is a real state rather than a deletion, because someone who
 *  started and stopped is a fact about the course. It is excluded from the head
 *  count and from the completion denominator: a withdrawn enrolment is not an
 *  enrolment any more, and counting it would quietly depress every percentage.
 */
export const trainingEnrolmentStatus = z.enum([
  'enrolled',
  'in_progress',
  'completed',
  'withdrawn',
])
export type TrainingEnrolmentStatus = z.infer<typeof trainingEnrolmentStatus>

/* ----------------------------------------------------------------- courses */

export const trainingCourseCreate = z.object({
  /** `TRN-0001`. Server-assigned, counted within the tenant, when a caller
   *  supplies none. */
  code: z.string().max(16).optional(),
  title: nonEmpty.max(200),
  titleAr: z.string().max(200).optional(),
  category: trainingCategory.optional(),
  /** How long the course takes to sit, in minutes — recorded, because it is a
   *  property of the course and nothing could derive it. Stored as minutes
   *  rather than the mock's `'1.5 hrs'` string so the screen formats it and no
   *  fractional hour is parsed out of prose. Zero means "not stated", and the
   *  screen shows a dash rather than `0 hrs`. */
  durationMinutes: z.number().int().min(0).max(100_000).optional(),
  status: trainingCourseStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type TrainingCourseCreate = z.infer<typeof trainingCourseCreate>

/** `code` is omitted: every enrolment references the course by its code
 *  (`training_enrolments.course_code`), so it is not renamed by a PATCH. */
export const trainingCourseUpdate = trainingCourseCreate.partial().omit({ code: true })
export type TrainingCourseUpdate = z.infer<typeof trainingCourseUpdate>

/** Note what is absent, because it is the point of the change: no `enrolled`
 *  and no `completion`. A head count and a completion rate are facts about the
 *  enrolments, and a client that wants them counts the roster. */
export const trainingCourseRow = appRow({
  /** The course code — the business identifier, which is also the `id` the
   *  detail route accepts. */
  id: z.string(),
  code: z.string(),
  title: z.string(),
  titleAr: z.string().nullable(),
  category: trainingCategory,
  durationMinutes: z.number().int().min(0),
  status: trainingCourseStatus,
  /** Derived from the transition into `active`, never posted. */
  publishedAt: z.string().nullable(),
  /** Derived from the transition into `archived`, never posted. */
  archivedAt: z.string().nullable(),
  notes: z.string().nullable(),
})
export type TrainingCourseRow = z.infer<typeof trainingCourseRow>

/* -------------------------------------------------------------- enrolments */

export const trainingEnrolmentCreate = z.object({
  /** The course's code, which must name one of *this* tenant's courses — a
   *  composite `(org_id, course_code)` foreign key, so the reference is
   *  same-tenant by construction. */
  courseCode: nonEmpty.max(16),
  /** The employee taking it: a real `employees` row, again through a composite
   *  `(org_id, employee_id)` foreign key. There is no free-text learner —
   *  a head count over typed-in names would be the mock's defect with extra
   *  steps. */
  employeeId: ulid,
  status: trainingEnrolmentStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type TrainingEnrolmentCreate = z.infer<typeof trainingEnrolmentCreate>

/** Only the state moves. Who is enrolled on what is not edited — an enrolment
 *  on the wrong course is withdrawn and a new one created, so the roster keeps
 *  its history instead of rewriting it. */
export const trainingEnrolmentUpdate = z.object({
  status: trainingEnrolmentStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type TrainingEnrolmentUpdate = z.infer<typeof trainingEnrolmentUpdate>

export const trainingEnrolmentRow = appRow({
  courseCode: z.string(),
  /** There is deliberately no course *title* here: a screen showing a roster
   *  holds the catalogue it groups by, and copying the title onto every
   *  enrolment would create a second owner of the text. */
  employeeId: ulid,
  /** Read from the employee at enrolment, never posted — the same denormalised
   *  shape `timesheets`/`leave_requests` carry. */
  employeeName: z.string(),
  status: trainingEnrolmentStatus,
  /** When the employee actually finished. Derived from the transition into
   *  `completed` and cleared if the enrolment moves back out of it, so a
   *  completion date is always a date something happened. */
  completedAt: z.string().nullable(),
  notes: z.string().nullable(),
})
export type TrainingEnrolmentRow = z.infer<typeof trainingEnrolmentRow>
