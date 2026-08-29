import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { WORKSHOP_STAGES, WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { renderWithProviders } from '../helpers/render'

/** The six workshop stages. Every stage screen shows the same rail with its own
 *  position marked; in the design each screen carried its own copy of the list,
 *  which is how they drift apart. */

describe('WorkflowStepper', () => {
  it('renders the six stages in order, as an ordered list', () => {
    const { container } = renderWithProviders(<WorkflowStepper current="Estimate" />)
    const items = container.querySelectorAll('ol > li')
    expect(items).toHaveLength(6)
    expect([...items].map((item) => item.textContent?.replace(/^\d/, '').trim())).toEqual([
      ...WORKSHOP_STAGES,
    ])
  })

  it('marks the current stage for assistive tech, and only that one', () => {
    const { container } = renderWithProviders(<WorkflowStepper current="Quality Check" />)
    const current = container.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toContain('Quality Check')
  })

  it('numbers the stages still to come and ticks the ones already done', () => {
    const { container } = renderWithProviders(<WorkflowStepper current="Estimate" />)
    const items = [...container.querySelectorAll('ol > li')]

    // Check-In and Inspection are behind: their numerals are replaced by a tick.
    expect(items[0].textContent).toBe('Check-In')
    expect(items[1].textContent).toBe('Inspection')
    // The current stage and everything after it keep their position number.
    expect(items[2].textContent).toBe('3Estimate')
    expect(items[5].textContent).toBe('6Delivery')
  })

  it('walks the whole rail as the job progresses', () => {
    for (const [index, stage] of WORKSHOP_STAGES.entries()) {
      const { container, unmount } = renderWithProviders(<WorkflowStepper current={stage} />)
      const items = [...container.querySelectorAll('ol > li')]
      const done = items.filter((item) => !/^\d/.test(item.textContent ?? ''))
      // Everything before the current stage reads as complete, nothing after.
      expect(done).toHaveLength(index)
      expect(container.querySelector('[aria-current="step"]')?.textContent).toContain(stage)
      unmount()
    }
  })

  it('marks nothing current for a stage outside the rail', () => {
    // A screen that passes an unknown stage should not silently light up the
    // first step as though the job had just started.
    const { container } = renderWithProviders(<WorkflowStepper current="Invoiced" />)
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(0)
    expect(container.querySelectorAll('ol > li')).toHaveLength(6)
  })

  it('accepts a different set of stages for a different flow', () => {
    const stages = ['Requested', 'Quoted', 'Ordered']
    const { container } = renderWithProviders(
      <WorkflowStepper current="Quoted" stages={stages} />
    )
    expect(container.querySelectorAll('ol > li')).toHaveLength(3)
    expect(screen.getByText('Ordered')).toBeInTheDocument()
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain('Quoted')
  })
})
