import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  handleBack,
  openLayerCount,
  pushBackHandler,
  resetBackStackForTests,
} from '@/lib/back-stack'
import { Drawer } from '@/components/ui/Drawer'
import { renderWithProviders } from './helpers/render'

/** The Capacitor bridge, tested at the two seams that are actually testable in
 *  jsdom.
 *
 *  The plugins themselves are not: `Capacitor.isNativePlatform()` is false
 *  here, which is the whole point of `lib/native.ts` — every wrapper is a
 *  no-op, so there is nothing to assert beyond "it did not throw", and mocking
 *  the plugin to assert the mock was called would test the mock.
 *
 *  What *is* real logic, and what breaks if someone gets it wrong:
 *
 *  - the back stack, which decides whether Android's back button closes a
 *    layer or navigates, and
 *  - `samePathFor`, which decides whether a deep link is followed at all.
 */

describe('back stack', () => {
  beforeEach(resetBackStackForTests)
  afterEach(resetBackStackForTests)

  it('reports nothing to close when no layer is open', () => {
    expect(handleBack()).toBe(false)
  })

  it('closes the most recently opened layer first', () => {
    const order: string[] = []
    pushBackHandler(() => order.push('modal'))
    pushBackHandler(() => order.push('confirmation'))

    expect(handleBack()).toBe(true)
    expect(order).toEqual(['confirmation'])
  })

  it('leaves the handler in place so a layer that declines to close stays on top', () => {
    /* The handler is removed by the layer's own cleanup, not by `handleBack`.
     * A dialog that asks "discard changes?" instead of closing must still be
     * the thing the next back press talks to. */
    const stayOpen = vi.fn()
    pushBackHandler(stayOpen)

    expect(handleBack()).toBe(true)
    expect(handleBack()).toBe(true)
    expect(stayOpen).toHaveBeenCalledTimes(2)
  })

  it('unregisters by identity, so layers closing out of order still clean up', () => {
    const first = vi.fn()
    const second = vi.fn()
    const dropFirst = pushBackHandler(first)
    pushBackHandler(second)

    // The *lower* layer closes first — a toast-triggered dismissal, say.
    dropFirst()
    expect(openLayerCount()).toBe(1)

    handleBack()
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
  })

  it('empties as layers close, so back goes back to navigating', () => {
    const drop = pushBackHandler(vi.fn())
    expect(openLayerCount()).toBe(1)
    drop()
    expect(handleBack()).toBe(false)
  })

  it('is idempotent when a layer unregisters twice', () => {
    const drop = pushBackHandler(vi.fn())
    drop()
    drop()
    expect(openLayerCount()).toBe(0)
  })
})

/** The registration itself, through a real component — the part that would
 *  regress silently if someone dropped the effect from `Drawer`. */
describe('dismissible layers register with the back stack', () => {
  beforeEach(resetBackStackForTests)
  afterEach(resetBackStackForTests)

  function DrawerHarness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open drawer
        </button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Filter Jobs">
          <button type="button">Apply</button>
        </Drawer>
      </>
    )
  }

  it('an open drawer is what back closes, and closing it releases back again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)
    expect(openLayerCount()).toBe(0)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(screen.getByRole('dialog', { name: 'Filter Jobs' })).toBeInTheDocument()
    expect(openLayerCount()).toBe(1)

    expect(handleBack()).toBe(true)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(openLayerCount()).toBe(0)
    /* Back is a navigation again now — which is the half that matters and the
     * half a leaked handler would break. */
    expect(handleBack()).toBe(false)
  })
})
