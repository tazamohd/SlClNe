import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { renderWithProviders } from '../helpers/render'

/** The QC and delivery gates. The prototypes drew these with `<button>` and a
 *  styled `<span>`, which announced nothing — on a screen whose entire purpose
 *  is recording that a person verified each line. */

const ITEMS: ChecklistItem[] = [
  { label: 'Repair Verified' },
  { label: 'Fluids Topped', icon: 'Wrench' },
  { label: 'Test Drive' },
]

function Harness({ onToggle }: { onToggle?: (label: string) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <Checklist
        items={ITEMS}
        checked={checked}
        onToggle={(label) => {
          onToggle?.(label)
          setChecked((current) => ({ ...current, [label]: !current[label] }))
        }}
      />
      <output data-testid="count">{countChecked(ITEMS, checked)}</output>
    </>
  )
}

describe('Checklist', () => {
  it('exposes each line as a labelled checkbox', () => {
    renderWithProviders(<Harness />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(ITEMS.length)
    for (const item of ITEMS) {
      expect(screen.getByRole('checkbox', { name: item.label })).not.toBeChecked()
    }
  })

  it('records a tick and reports it back to the screen', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProviders(<Harness onToggle={onToggle} />)

    await user.click(screen.getByRole('checkbox', { name: 'Test Drive' }))
    expect(onToggle).toHaveBeenCalledWith('Test Drive')
    expect(screen.getByRole('checkbox', { name: 'Test Drive' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Repair Verified' })).not.toBeChecked()
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('unticks a line that was ticked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    const box = screen.getByRole('checkbox', { name: 'Repair Verified' })
    await user.click(box)
    expect(box).toBeChecked()
    await user.click(box)
    expect(box).not.toBeChecked()
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('can be worked entirely from the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Repair Verified' })).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Repair Verified' })).toBeChecked()
  })

  it('translates its labels on an Arabic page', () => {
    renderWithProviders(<Harness />, { language: 'ar' })
    // The English source is the key; a missing translation falls back to it
    // rather than rendering an empty row.
    expect(screen.getAllByRole('checkbox')).toHaveLength(ITEMS.length)
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.closest('label')?.textContent?.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('countChecked', () => {
  it('counts only the items it was given, whatever else is in the map', () => {
    expect(countChecked(ITEMS, {})).toBe(0)
    expect(countChecked(ITEMS, { 'Test Drive': true })).toBe(1)
    expect(
      countChecked(ITEMS, { 'Test Drive': true, 'Repair Verified': true, Cleaned: true })
    ).toBe(2)
    expect(countChecked(ITEMS, { 'Test Drive': false })).toBe(0)
  })

  it('reaches the full count only when every line is ticked — the QC gate', () => {
    const all = Object.fromEntries(ITEMS.map((item) => [item.label, true]))
    expect(countChecked(ITEMS, all)).toBe(ITEMS.length)
  })
})
