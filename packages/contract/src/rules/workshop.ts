/** Workshop and appointment rules (`MASTER_BUSINESS_RULES.md` §Workshop). */
import { canTransition, type JobStage } from '../entities/jobCard'
import type { RuleFailure } from './money'

/** A stage gate cannot be skipped. */
export function checkStageTransition(from: JobStage, to: JobStage): RuleFailure | null {
  if (from === to) {
    return { code: 'rule_violated', message: `The job is already at ${to}.`, field: 'to' }
  }
  if (!canTransition(from, to)) {
    return {
      code: 'rule_violated',
      message: `A job at ${from} cannot move to ${to}.`,
      field: 'to',
    }
  }
  return null
}

/** A completed job card is required before invoicing. */
export function checkInvoiceable(args: { stage: JobStage; status: string }): RuleFailure | null {
  if (args.stage !== 'delivery' && args.stage !== 'invoiced' && args.stage !== 'closed') {
    return {
      code: 'rule_violated',
      message: 'A job must reach delivery before it can be invoiced.',
    }
  }
  return null
}

/** An expired estimate cannot be approved. */
export function checkEstimateFresh(args: {
  validUntil: string | null
  now?: Date
}): RuleFailure | null {
  if (!args.validUntil) return null
  const now = args.now ?? new Date()
  if (new Date(args.validUntil).getTime() < now.getTime()) {
    return { code: 'rule_violated', message: 'This estimate has expired and cannot be approved.' }
  }
  return null
}

export interface BaySlot {
  bay: string
  scheduledDate: string
  startMinute: number
  durationMins: number
}

/** An appointment cannot double-book a bay. Half-open intervals, so a job
 *  ending at 10:30 and one starting at 10:30 do not collide. */
export function overlaps(a: BaySlot, b: BaySlot): boolean {
  if (a.bay !== b.bay || a.scheduledDate !== b.scheduledDate) return false
  const aEnd = a.startMinute + a.durationMins
  const bEnd = b.startMinute + b.durationMins
  return a.startMinute < bEnd && b.startMinute < aEnd
}

export function checkBayFree(candidate: BaySlot, existing: readonly BaySlot[]): RuleFailure | null {
  if (existing.some((slot) => overlaps(candidate, slot))) {
    return {
      code: 'rule_violated',
      message: `${candidate.bay} is already booked for that time.`,
      field: 'bay',
    }
  }
  return null
}
