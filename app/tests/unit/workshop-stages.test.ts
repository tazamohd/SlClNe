import { describe, expect, it } from 'vitest'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { JOB_STAGES, isJobStage, railIndexFor, railLabelFor } from '@/screens/workshop/stages'

/** The client's mirror of the contract's stage vocabulary.
 *
 *  The point of these is not that the mapping is clever — it is that eight API
 *  stages fold onto a six-step rail without a screen inventing a seventh step
 *  or crashing on a row that carries no stage at all. Every fixture row is that
 *  last case, so it is the common path rather than an edge. */
describe('job stages', () => {
  it('carries the eight stages the API defines, in workflow order', () => {
    expect(JOB_STAGES).toEqual([
      'checkin',
      'inspection',
      'estimate',
      'repair',
      'qc',
      'delivery',
      'invoiced',
      'closed',
    ])
  })

  it('maps each stage onto a step the design actually draws', () => {
    for (const stage of JOB_STAGES) {
      expect(WORKSHOP_STAGES).toContain(railLabelFor(stage))
    }
    expect(railLabelFor('checkin')).toBe('Check-In')
    expect(railLabelFor('qc')).toBe('Quality Check')
    expect(railLabelFor('delivery')).toBe('Delivery')
  })

  it('keeps the rail full past delivery rather than inventing a seventh step', () => {
    const last = WORKSHOP_STAGES.length - 1
    expect(railIndexFor('delivery')).toBe(last)
    expect(railIndexFor('invoiced')).toBe(last)
    expect(railIndexFor('closed')).toBe(last)
  })

  it('reads a row with no stage as one that has not moved past check-in', () => {
    // Every design fixture row is this case: the bundle predates the stage
    // column, so a screen must not render `undefined` or skip the rail.
    expect(railIndexFor(undefined)).toBe(0)
    expect(railLabelFor(undefined)).toBe('Check-In')
    expect(railIndexFor('not-a-stage')).toBe(0)
  })

  it('recognises only the stages the contract declares', () => {
    expect(isJobStage('repair')).toBe(true)
    expect(isJobStage('REPAIR')).toBe(false)
    expect(isJobStage(undefined)).toBe(false)
    expect(isJobStage(4)).toBe(false)
  })
})
