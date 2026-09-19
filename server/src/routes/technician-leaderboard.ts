/** Server-computed technician performance — GET /reports/technician-leaderboard
 *  (BLK-004, Technician Leaderboards).
 *
 *  The screen this feeds used to render ten invented technicians with invented
 *  job counts, ratings, "efficiency" percentages and revenue. Every one of those
 *  is an aggregate, so the only honest version of the screen is one where each
 *  figure is computed from records the workshop actually holds — and the money
 *  figure has to be computed here, in SQL over the whole tenant scope, because
 *  §5b forbids a client-side cross-record total and a browser summing the page
 *  of invoices it happens to hold would report one page's revenue as the year's.
 *
 *  What is computed, and from what:
 *   - `jobsAssigned` / `jobsCompleted` — `job_cards` grouped by
 *     `assigned_tech_id`. "Completed" is `status in ('completed','delivered')`:
 *     those are the two terminal working states of `jobStatus`
 *     (pending → in_progress → completed → delivered), and a car handed back to
 *     its owner is not an uncompleted job. The statuses counted are named in the
 *     response rather than left implicit.
 *   - `invoicedHalalas` — the invoices raised against those completed jobs
 *     (`invoices.job_card_id`), excluding `draft` and `cancelled`: a draft is
 *     not money anyone owes. This is the invoiced value of the work, not the
 *     technician's earnings or margin, and the screen says so.
 *   - `ratedJobs` / `avgRatingTenths` — `customer_feedback` joined to the
 *     technician's jobs through `job_card_id`. Tenths (a 4.6 average is 46), the
 *     `parts_network_members.rating_tenths` discipline: integer arithmetic, no
 *     float drift. Null when nobody has rated one of their jobs — an average
 *     over no ratings is undefined, not 0.0.
 *
 *  What is deliberately absent:
 *   - **Efficiency.** It would need estimated-versus-actual labour hours per
 *     job. `job_cards` records neither, and `diag_labour.hours` belongs to the
 *     flat diagnostic fixtures with no job reference. There is nothing to divide,
 *     so no number is produced.
 *   - **A technician rating.** `technicians.rating` is a stored number nothing
 *     computes, and this endpoint does not read it. The rating here is the
 *     customer's rating of the *visit*, attributed to the technician the job was
 *     assigned to, with the count of rated jobs beside it so the reader can see
 *     what it is an average of.
 *   - **`rank`.** Rank is an ordering over these figures, so it is derived where
 *     the ordering is; nothing here or in the database stores one.
 *
 *  Gated on `hr:v`. This is a named-staff performance ranking, which is a
 *  narrower audience than the `technicians` roster: `technicians:v` is held by
 *  advisor, technician, qc and frontdesk, none of whom have a reason to see
 *  their colleagues ranked by revenue. `hr` already grants exactly the audience
 *  that does — owner, manager, accountant, hr (and the all-access `test`
 *  account) — so no cell in the matrix moves.
 */
import { sql, type SQL } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { customerFeedback, invoices, jobCards, technicians } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { RouteDeps } from './collections'

/** The job statuses that count as work the technician finished. Named in the
 *  response so the screen states the rule rather than implying one. */
const COMPLETED_STATUSES = ['completed', 'delivered'] as const

/** Invoice statuses that are not money owed: a draft has not been issued and a
 *  cancelled invoice has been withdrawn. Everything else counts. */
const EXCLUDED_INVOICE_STATUSES = ['draft', 'cancelled'] as const

async function rows<T>(tx: Tx, query: SQL): Promise<T[]> {
  return (await tx.execute(query)) as unknown as T[]
}

/** The driver returns bigint/numeric sums as strings and counts as numbers. */
function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

export function registerTechnicianLeaderboardRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.get('/reports/technician-leaderboard', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'hr', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const roster = await rows<{ id: string; name: string; specialty: string | null }>(
        tx,
        sql`select ${technicians.id} as id, ${technicians.name} as name, ${technicians.specialty} as specialty
            from ${technicians}
            where ${technicians.deletedAt} is null
            order by ${technicians.name}`,
      )

      /* Job counts per technician. `filter` rather than a second query so the
       * assigned and completed counts are over exactly the same rows. */
      const jobs = await rows<{ technician_id: string; assigned: number; completed: number }>(
        tx,
        sql`
          select
            ${jobCards.assignedTechId}                                   as technician_id,
            count(*)::int                                                as assigned,
            count(*) filter (where ${jobCards.status} in ('completed', 'delivered'))::int as completed
          from ${jobCards}
          where ${jobCards.deletedAt} is null and ${jobCards.assignedTechId} is not null
          group by ${jobCards.assignedTechId}
        `,
      )

      /* Invoiced value of the completed jobs. Joined invoice → job card, so an
       * invoice with no job behind it (a parts sale, a fee) belongs to nobody
       * here and is not spread over the roster. */
      const money = await rows<{ technician_id: string; invoices: number; total: number }>(
        tx,
        sql`
          select
            ${jobCards.assignedTechId}                                   as technician_id,
            count(*)::int                                                as invoices,
            coalesce(sum(${invoices.totalHalalas}), 0)::bigint           as total
          from ${invoices}
          join ${jobCards}
            on ${jobCards.id} = ${invoices.jobCardId} and ${jobCards.orgId} = ${invoices.orgId}
          where ${invoices.deletedAt} is null
            and ${jobCards.deletedAt} is null
            and ${jobCards.assignedTechId} is not null
            and ${jobCards.status} in ('completed', 'delivered')
            and ${invoices.status} not in ('draft', 'cancelled')
          group by ${jobCards.assignedTechId}
        `,
      )

      /* Customer feedback on their jobs. Summed as integers and divided into
       * tenths below — never averaged in floating point. */
      const ratings = await rows<{ technician_id: string; rated: number; rating_sum: number }>(
        tx,
        sql`
          select
            ${jobCards.assignedTechId}                                   as technician_id,
            count(*)::int                                                as rated,
            coalesce(sum(${customerFeedback.rating}), 0)::bigint         as rating_sum
          from ${customerFeedback}
          join ${jobCards}
            on ${jobCards.id} = ${customerFeedback.jobCardId} and ${jobCards.orgId} = ${customerFeedback.orgId}
          where ${customerFeedback.deletedAt} is null
            and ${jobCards.deletedAt} is null
            and ${jobCards.assignedTechId} is not null
          group by ${jobCards.assignedTechId}
        `,
      )

      const jobsBy = new Map(jobs.map((r) => [r.technician_id, r]))
      const moneyBy = new Map(money.map((r) => [r.technician_id, r]))
      const ratingsBy = new Map(ratings.map((r) => [r.technician_id, r]))

      const leaderboard = roster.map((tech) => {
        const job = jobsBy.get(tech.id)
        const invoiced = moneyBy.get(tech.id)
        const rating = ratingsBy.get(tech.id)
        const rated = num(rating?.rated)
        return {
          technicianId: tech.id,
          name: tech.name,
          specialty: tech.specialty,
          jobsAssigned: num(job?.assigned),
          jobsCompleted: num(job?.completed),
          invoiceCount: num(invoiced?.invoices),
          invoicedHalalas: num(invoiced?.total),
          ratedJobs: rated,
          /* Null, not zero: nobody has rated one of these jobs. */
          avgRatingTenths: rated === 0 ? null : Math.round((num(rating?.rating_sum) * 10) / rated),
        }
      })

      /* Ordered by the one metric the leaderboard ranks on, then by name so the
       * order is total and stable. Not by the invoiced value as a tie-break:
       * money is absent in a build with no API, and a ranking that reorders
       * itself depending on connectivity is two different rankings. The rank
       * itself is not in the payload — it *is* this ordering, and the reader
       * derives it. */
      leaderboard.sort(
        (a, b) => b.jobsCompleted - a.jobsCompleted || a.name.localeCompare(b.name),
      )

      const [totals] = await rows<{ job_cards: number; assigned: number; completed: number }>(
        tx,
        sql`
          select
            count(*)::int                                                as job_cards,
            count(*) filter (where ${jobCards.assignedTechId} is not null)::int as assigned,
            count(*) filter (where ${jobCards.status} in ('completed', 'delivered'))::int as completed
          from ${jobCards}
          where ${jobCards.deletedAt} is null
        `,
      )

      return {
        /* What the ordering above is by, stated rather than implied. */
        rankedBy: 'jobsCompleted',
        completedStatuses: [...COMPLETED_STATUSES],
        excludedInvoiceStatuses: [...EXCLUDED_INVOICE_STATUSES],
        /* How much was counted, so a figure is never read as covering more
         * than it does. */
        counted: {
          technicians: roster.length,
          jobCards: num(totals?.job_cards),
          assignedJobCards: num(totals?.assigned),
          completedJobCards: num(totals?.completed),
          ratedJobCards: ratings.reduce((sum, r) => sum + num(r.rated), 0),
          invoices: money.reduce((sum, r) => sum + num(r.invoices), 0),
        },
        rows: leaderboard,
      }
    })
  })
}
