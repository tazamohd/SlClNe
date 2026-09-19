import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { TechnicianLeaderboards } from '@/screens/hr/TechnicianLeaderboards'
import { repository } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** Technician Leaderboards (BLK-004) — the screen no longer renders
 *  `MOCK_LEADERBOARD`, ten invented technicians whose `jobsCompleted`,
 *  `avgRating`, `efficiency`, `revenue` and `rank` were all made up. It reads
 *  the real `technicians`, `jobs` and `feedback` collections and derives the
 *  ranking from the job cards actually assigned to each technician.
 *
 *  A test that asserted "a table renders" would pass just as well against
 *  stored numbers, which is the thing being removed — so these cases create
 *  real technicians and real job cards against them through the repository and
 *  assert the ranking *follows the records*: completing a job moves someone up,
 *  an unfinished job does not count, a customer rating on their job becomes
 *  their average, and a technician with nothing completed is not ranked at all.
 *
 *  The fixture repository is session-scoped and mutating, so every case removes
 *  what it added. The money column is absent here on purpose: the invoiced
 *  value is a cross-record total the server computes, and this build has no
 *  server, so it reads "—" rather than being summed in the browser.
 */

type Created = { id: string; delete: () => Promise<void> }

async function addTechnician(name: string): Promise<Created> {
  const created = (await repository.technicians.create({
    name,
    specialty: 'Engine & Diagnostics',
  } as never)) as { _id?: string }
  const id = created._id
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return { id, delete: () => repository.technicians.delete(id) }
}

async function addJob(job: {
  code: string
  status: string
  techId: string
}): Promise<Created> {
  const created = (await repository.jobs.create({
    id: job.code,
    cust: 'Leaderboard Customer',
    veh: 'Toyota Camry 2022',
    svc: 'maintenance',
    st: job.status,
    pr: 'medium',
    assignedTechId: job.techId,
  } as never)) as { _id?: string }
  const id = created._id
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return { id, delete: () => repository.jobs.delete(id) }
}

async function addFeedback(feedback: { rating: number; jobCardId: string }): Promise<Created> {
  const created = (await repository.feedback.create({
    rating: feedback.rating,
    comment: 'Test feedback',
    jobCardId: feedback.jobCardId,
    customer: 'Leaderboard Customer',
  } as never)) as { _id?: string }
  const id = created._id
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return { id, delete: () => repository.feedback.delete(id) }
}

async function cleanUp(created: Created[]): Promise<void> {
  for (const row of created.reverse()) await row.delete()
}

async function rowFor(name: string): Promise<HTMLElement> {
  const cell = await screen.findByText(name)
  const row = cell.closest('tr')
  if (!row) throw new Error(`expected a table row for ${name}`)
  return row
}

/** The row's cells in column order — Rank, Technician, Jobs Completed, Jobs
 *  Assigned, Job Feedback, Invoiced — so a count of 2 in one column is not
 *  satisfied by a 2 in another. */
async function cellsFor(name: string): Promise<string[]> {
  const row = await rowFor(name)
  return [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim() ?? '')
}

describe('TechnicianLeaderboards (fixture build)', () => {
  it('ranks technicians by the completed jobs actually assigned to them', async () => {
    const busy = await addTechnician('Leader Busy')
    const quiet = await addTechnician('Leader Quiet')
    const created: Created[] = [busy, quiet]
    try {
      created.push(await addJob({ code: 'LB-1', status: 'completed', techId: busy.id }))
      created.push(await addJob({ code: 'LB-2', status: 'delivered', techId: busy.id }))
      created.push(await addJob({ code: 'LB-3', status: 'completed', techId: quiet.id }))
      /* Assigned but not finished: on the assigned count, off the ranking one. */
      created.push(await addJob({ code: 'LB-4', status: 'in_progress', techId: quiet.id }))

      renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })

      const first = await cellsFor('Leader Busy')
      expect(first[0]).toBe('Gold')
      expect(first.slice(2, 4)).toEqual(['2', '2'])

      /* One completed of two assigned — the in-progress job is counted as
       * assigned and not as done. */
      const second = await cellsFor('Leader Quiet')
      expect(second[0]).toBe('Silver')
      expect(second.slice(2, 4)).toEqual(['1', '2'])
    } finally {
      await cleanUp(created)
    }
  })

  it('moves a technician up the board when one more of their jobs is completed', async () => {
    const climber = await addTechnician('Leader Climber')
    const holder = await addTechnician('Leader Holder')
    const created: Created[] = [climber, holder]
    try {
      created.push(await addJob({ code: 'LB-5', status: 'completed', techId: climber.id }))
      created.push(await addJob({ code: 'LB-6', status: 'completed', techId: holder.id }))
      created.push(await addJob({ code: 'LB-7', status: 'completed', techId: holder.id }))

      const before = renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })
      expect(within(await rowFor('Leader Holder')).getByText('Gold')).toBeInTheDocument()
      expect(within(await rowFor('Leader Climber')).getByText('Silver')).toBeInTheDocument()
      before.unmount()

      /* Two more finished jobs, and the order is different — because the order
       * is the records, not a stored rank. */
      created.push(await addJob({ code: 'LB-8', status: 'completed', techId: climber.id }))
      created.push(await addJob({ code: 'LB-9', status: 'delivered', techId: climber.id }))

      renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })
      expect(within(await rowFor('Leader Climber')).getByText('Gold')).toBeInTheDocument()
      expect(within(await rowFor('Leader Holder')).getByText('Silver')).toBeInTheDocument()
    } finally {
      await cleanUp(created)
    }
  })

  it('averages the customer feedback left on their jobs, and shows what it is over', async () => {
    const rated = await addTechnician('Leader Rated')
    const unrated = await addTechnician('Leader Unrated')
    const created: Created[] = [rated, unrated]
    try {
      const jobA = await addJob({ code: 'LB-10', status: 'completed', techId: rated.id })
      const jobB = await addJob({ code: 'LB-11', status: 'completed', techId: rated.id })
      created.push(jobA, jobB)
      created.push(await addJob({ code: 'LB-12', status: 'completed', techId: unrated.id }))
      created.push(await addFeedback({ rating: 5, jobCardId: jobA.id }))
      created.push(await addFeedback({ rating: 4, jobCardId: jobB.id }))

      renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })

      /* The denominator is on the row: an average is only as good as what it
       * averages. */
      expect((await cellsFor('Leader Rated'))[4]).toBe('4.5(2)')

      /* Nobody rated this one's work, so there is no rating — not a 0.0. */
      expect((await cellsFor('Leader Unrated'))[4]).toBe('—no rated jobs')
    } finally {
      await cleanUp(created)
    }
  })

  it('leaves a technician with nothing completed off the board and says so', async () => {
    const idle = await addTechnician('Leader Idle')
    const working = await addTechnician('Leader Working')
    const created: Created[] = [idle, working]
    try {
      created.push(await addJob({ code: 'LB-13', status: 'pending', techId: idle.id }))
      created.push(await addJob({ code: 'LB-14', status: 'completed', techId: working.id }))

      renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })

      expect(await rowFor('Leader Working')).toBeInTheDocument()
      expect(screen.queryByText('Leader Idle')).toBeNull()
      expect(
        screen.getByText(/have no completed job in what was counted and are not ranked/),
      ).toBeInTheDocument()
    } finally {
      await cleanUp(created)
    }
  })

  it('shows the empty state, not a ranking, when no completed job is assigned to anyone', async () => {
    renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })
    expect(await screen.findByText('No completed jobs to rank yet')).toBeInTheDocument()
    expect(screen.queryByText('Gold')).toBeNull()
    /* The invented ten are gone for good. */
    expect(screen.queryByText('Yousef Al-Shehri')).toBeNull()
    expect(screen.queryByText('Fahad Al-Harbi')).toBeNull()
  })

  it('does not present a metric it cannot derive: no efficiency, and money left to the server', async () => {
    const tech = await addTechnician('Leader Columns')
    const created: Created[] = [tech]
    try {
      created.push(await addJob({ code: 'LB-15', status: 'completed', techId: tech.id }))

      renderWithProviders(<TechnicianLeaderboards />, { role: 'owner' })
      await rowFor('Leader Columns')

      expect(screen.queryByRole('columnheader', { name: /Efficiency/ })).toBeNull()
      expect(screen.queryByRole('columnheader', { name: /Avg Rating/ })).toBeNull()
      expect(
        screen.getByText(/Efficiency is not shown/),
      ).toBeInTheDocument()
      /* No API in this build, so the invoiced value is stated as the server's
       * to compute rather than summed from the invoices the browser holds. */
      expect(screen.getByText(/reads “—” until this build has an API behind it/)).toBeInTheDocument()
    } finally {
      await cleanUp(created)
    }
  })
})
