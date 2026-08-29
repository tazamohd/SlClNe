import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeInput } from '@/components/ui/CodeInput'
import { renderWithProviders } from '../helpers/render'

/** The prototypes rendered six loose inputs with no focus management: you had
 *  to click each box, and pasting a code — which is how codes actually arrive —
 *  did nothing. Each test here is one of those failures. */

function Harness({ length }: { length?: number }) {
  const [value, setValue] = useState('')
  return (
    <>
      <CodeInput value={value} onChange={setValue} length={length} />
      <output data-testid="value">{value}</output>
    </>
  )
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[]
const current = () => screen.getByTestId('value').textContent

describe('CodeInput', () => {
  it('renders one labelled box per digit, pinned LTR', () => {
    const { container } = renderWithProviders(<Harness />, { language: 'ar' })
    expect(boxes()).toHaveLength(6)
    expect(screen.getByLabelText('Digit 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Digit 6')).toBeInTheDocument()
    // A verification code is Latin digits: RTL would present them reversed.
    expect(container.querySelector('[dir="ltr"]')).toBeInTheDocument()
  })

  it('advances focus as digits are typed, without a click between them', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('482913')

    expect(current()).toBe('482913')
    expect(boxes().map((box) => box.value)).toEqual(['4', '8', '2', '9', '1', '3'])
    // Focus stops at the last box rather than wrapping round.
    expect(boxes()[5]).toHaveFocus()
  })

  it('refuses anything that is not a digit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('a-b')
    expect(current()).toBe('')
    await user.keyboard('7')
    expect(current()).toBe('7')
  })

  it('distributes a pasted code across the boxes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.paste('482913')

    expect(current()).toBe('482913')
    expect(boxes().map((box) => box.value)).toEqual(['4', '8', '2', '9', '1', '3'])
    expect(boxes()[5]).toHaveFocus()
  })

  it('strips the punctuation an SMS or an authenticator app pastes in', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.paste('482 913')
    expect(current()).toBe('482913')
  })

  it('ignores the overflow when the pasted code is too long', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.paste('4829137777')
    expect(current()).toBe('482913')
  })

  it('leaves a paste with no digits in it alone', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('4')
    await user.click(boxes()[1])
    await user.paste('your code is')
    expect(current()).toBe('4')
  })

  it('walks between boxes with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[2])

    await user.keyboard('{ArrowLeft}')
    expect(boxes()[1]).toHaveFocus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(boxes()[3]).toHaveFocus()

    // The ends hold rather than wrapping.
    await user.click(boxes()[0])
    await user.keyboard('{ArrowLeft}')
    expect(boxes()[0]).toHaveFocus()
    await user.click(boxes()[5])
    await user.keyboard('{ArrowRight}')
    expect(boxes()[5]).toHaveFocus()
  })

  it('steps back and clears on Backspace in an empty box', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('4829')
    expect(boxes()[4]).toHaveFocus()

    // The caret sits in the empty fifth box; Backspace deletes the digit before
    // it and moves there, the way a single field would behave.
    await user.keyboard('{Backspace}')
    expect(current()).toBe('482')
    expect(boxes()[3]).toHaveFocus()
  })

  it('clears the digit under the caret without moving when the box is filled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('482913')

    await user.click(boxes()[2])
    await user.keyboard('{Backspace}')
    expect(boxes()[2]).toHaveValue('')
    expect(boxes()[5]).toHaveValue('3')
    expect(boxes()[2]).toHaveFocus()
  })

  it('supports a code length other than six', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness length={4} />)
    expect(boxes()).toHaveLength(4)
    await user.click(boxes()[0])
    await user.paste('123456')
    expect(current()).toBe('1234')
  })

  it('offers the one-time-code autofill hint on the first box only', () => {
    renderWithProviders(<Harness />)
    expect(boxes()[0]).toHaveAttribute('autocomplete', 'one-time-code')
    expect(boxes()[1]).toHaveAttribute('autocomplete', 'off')
  })
})
