import { TintBadge, type Tint } from '../registry/badges'

/** Status pills for the CRM detail surfaces — lead pipeline stages and the CRM
 *  task types the calendar legends by.
 *
 *  Blue carries an advancing deal, Bright Blue a qualified-but-early one, slate
 *  the inert ends (new, lost). No green and no red (README §7); the whole scale
 *  is the blue family the pipeline kanban already uses in `Crm.tsx`. */

const STAGE_TINT: Record<string, Tint> = {
  new: 'slate',
  qualified: 'bright',
  proposal: 'blue',
  negotiation: 'blue',
  won: 'blue',
  lost: 'slate',
}

const STAGE_LABEL: Record<string, string> = {
  new: 'New',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
}

export function LeadStageBadge({ value }: { value: string }) {
  const key = value.toLowerCase()
  return <TintBadge tint={STAGE_TINT[key] ?? 'slate'} label={STAGE_LABEL[key] ?? value} />
}

/** The four task kinds the calendar colours its events by. Kept to the blue
 *  family plus orange for the one that is a deadline pressure — a due document
 *  or a follow-up call reads as attention, matching the design's amber. */
export const TASK_TINT: Record<string, Tint> = {
  call: 'blue',
  meeting: 'bright',
  document: 'orange',
  email: 'blue',
  followup: 'blue',
}

export function TaskTypeBadge({ value }: { value: string }) {
  const key = value.toLowerCase()
  return <TintBadge tint={TASK_TINT[key] ?? 'slate'} label={key ? titleCase(value) : 'Task'} />
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
