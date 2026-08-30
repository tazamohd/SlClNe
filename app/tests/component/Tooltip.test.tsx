import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { Tooltip } from '@/components/ui/Tooltip'
import { renderWithProviders } from '../helpers/render'

/** Tooltips show contextual help on hover/focus. The 200ms delay prevents
 *  flicker when the cursor crosses a row of icon buttons. */

describe('Tooltip', () => {
  it('does not show the tooltip content initially', () => {
    renderWithProviders(
      <Tooltip content="Edit this job card">
        <button type="button">Edit</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip on mouse hover after the delay', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content="Edit this job card">
          <button type="button">Edit</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Edit').closest('span.relative')!
      fireEvent.mouseEnter(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.getByRole('tooltip')).toHaveTextContent('Edit this job card')
    } finally {
      vi.useRealTimers()
    }
  })

  it('hides the tooltip on mouse leave', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content="Remove filter">
          <button type="button">Clear</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Clear').closest('span.relative')!
      fireEvent.mouseEnter(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.mouseLeave(wrapper)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows the tooltip on focus and hides on blur', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content="Submit estimate">
          <button type="button">Submit</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Submit').closest('span.relative')!
      fireEvent.focus(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.getByRole('tooltip')).toHaveTextContent('Submit estimate')

      fireEvent.blur(wrapper)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders with role="tooltip" for accessibility', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content="Approve payment">
          <button type="button">Approve</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Approve').closest('span.relative')!
      fireEvent.mouseEnter(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders ReactNode content, not just strings', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content={<span data-testid="rich">SAR 1,250</span>}>
          <button type="button">Amount</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Amount').closest('span.relative')!
      fireEvent.mouseEnter(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.getByTestId('rich')).toHaveTextContent('SAR 1,250')
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not show the tooltip if unhovered before the delay completes', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      renderWithProviders(
        <Tooltip content="Should not appear">
          <button type="button">Hover</button>
        </Tooltip>,
      )

      const wrapper = screen.getByText('Hover').closest('span.relative')!
      fireEvent.mouseEnter(wrapper)
      act(() => { vi.advanceTimersByTime(100) }) // Only 100ms, not the full 200
      fireEvent.mouseLeave(wrapper)
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
