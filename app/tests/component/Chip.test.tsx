import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { renderWithProviders } from '../helpers/render'

/** Selectable pills: single-choice for fuel level, multi-select for the
 *  belongings list. The prototypes used bare buttons, so assistive tech saw no
 *  group and no selected state. */

const FUEL = ['Empty', '1/4', '1/2', '3/4', 'Full']

function SingleChoice() {
  const [selected, setSelected] = useState('1/2')
  return (
    <ChipGroup label="Fuel Level">
      {FUEL.map((level) => (
        <Chip
          key={level}
          label={level}
          selected={selected === level}
          onToggle={() => setSelected(level)}
        />
      ))}
    </ChipGroup>
  )
}

function MultiChoice({ onToggle }: { onToggle?: (item: string) => void }) {
  const items = ['Documents', 'Spare Tyre', 'Toolkit']
  const [selected, setSelected] = useState<string[]>([])
  return (
    <ChipGroup label="Personal Belongings" multi>
      {items.map((item) => (
        <Chip
          key={item}
          multi
          label={item}
          selected={selected.includes(item)}
          onToggle={() => {
            onToggle?.(item)
            setSelected((current) =>
              current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
            )
          }}
        />
      ))}
    </ChipGroup>
  )
}

describe('Chip — single choice', () => {
  it('announces a radio group with exactly one selection', () => {
    renderWithProviders(<SingleChoice />)
    const group = screen.getByRole('radiogroup', { name: 'Fuel Level' })
    const chips = within(group).getAllByRole('radio')
    expect(chips).toHaveLength(FUEL.length)
    expect(chips.filter((chip) => chip.getAttribute('aria-checked') === 'true')).toHaveLength(1)
    expect(screen.getByRole('radio', { name: '1/2' })).toHaveAttribute('aria-checked', 'true')
  })

  it('moves the selection rather than adding to it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SingleChoice />)
    await user.click(screen.getByRole('radio', { name: 'Full' }))

    expect(screen.getByRole('radio', { name: 'Full' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '1/2' })).toHaveAttribute('aria-checked', 'false')
    expect(
      screen.getAllByRole('radio').filter((chip) => chip.getAttribute('aria-checked') === 'true')
    ).toHaveLength(1)
  })

  it('is a real button, so the keyboard reaches it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SingleChoice />)
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Empty' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('radio', { name: 'Empty' })).toHaveAttribute('aria-checked', 'true')
  })

  it('never submits the form it sits in', () => {
    renderWithProviders(<SingleChoice />)
    for (const chip of screen.getAllByRole('radio')) {
      expect(chip).toHaveAttribute('type', 'button')
    }
  })
})

describe('Chip — multi select', () => {
  it('announces a group of checkboxes and accumulates selections', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProviders(<MultiChoice onToggle={onToggle} />)

    const group = screen.getByRole('group', { name: 'Personal Belongings' })
    expect(within(group).getAllByRole('checkbox')).toHaveLength(3)

    await user.click(screen.getByRole('checkbox', { name: 'Documents' }))
    await user.click(screen.getByRole('checkbox', { name: 'Toolkit' }))
    expect(onToggle).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('checkbox', { name: 'Documents' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('checkbox', { name: 'Toolkit' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Spare Tyre' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('clears a selection on a second press', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MultiChoice />)
    const chip = screen.getByRole('checkbox', { name: 'Spare Tyre' })
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-checked', 'true')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-checked', 'false')
  })

  it('marks the selected chip visually as well as semantically', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MultiChoice />)
    const chip = screen.getByRole('checkbox', { name: 'Documents' })
    expect(chip.className).toContain('border-border')
    await user.click(chip)
    expect(chip.className).toContain('border-salis-blue')
  })
})
