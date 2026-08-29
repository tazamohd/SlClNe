import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import {
  Field,
  Form,
  FormActions,
  FormErrorSummary,
  ServerValidationError,
  SubmitButton,
  useZodForm,
} from '@/components/ui/Form'
import { AR } from '@/data/generated/ar'
import { renderWithProviders } from '../helpers/render'

/** Form behaviour, against the same zod schema that will guard the endpoint.
 *  The design showed these states statically; here they have to be produced by
 *  actually using the form. */

const schema = z.object({
  name: z.string().min(1, 'Enter the customer name'),
  email: z.string().email('Enter a valid email address'),
  vat: z.string().optional(),
})

function CustomerForm({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (values: z.infer<typeof schema>) => void | Promise<void>
}) {
  const form = useZodForm({
    schema,
    initial: { name: '', email: '', vat: '' },
    onSubmit,
  })
  return (
    <Form form={form}>
      <FormErrorSummary />
      <Field name="name" label="Customer Name" required />
      <Field name="email" label="Email" kind="email" hint="We send the invoice here." />
      <Field name="vat" label="VAT Registration" hint="Optional." />
      <FormActions note>
        <SubmitButton label="Save Customer" />
      </FormActions>
      <output data-testid="dirty">{form.dirty ? 'dirty' : 'clean'}</output>
    </Form>
  )
}

describe('validation', () => {
  it('holds an error back until the field has been left, or a submit refused', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm />)

    await user.type(screen.getByLabelText(/Customer Name/), 'A')
    await user.clear(screen.getByLabelText(/Customer Name/))
    // Still focused: shouting at someone mid-typing is noise.
    expect(screen.queryByText('Enter the customer name')).not.toBeInTheDocument()

    await user.tab()
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))
    expect(await screen.findByText('Enter the customer name')).toBeInTheDocument()
  })

  it('refuses the submit, names every bad field and summarises the count', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('Check the highlighted fields')
    expect(screen.getByRole('alert')).toHaveTextContent('2')
    expect(screen.getByText('Enter the customer name')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('marks the offending control invalid and wires its message up for a screen reader', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm />)
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    const name = await screen.findByLabelText(/Customer Name/)
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Enter the customer name')
  })

  it('moves focus to the first field it refused', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm />)
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))
    await waitFor(() => expect(screen.getByLabelText(/Customer Name/)).toHaveFocus())
  })

  it('clears a message as soon as the field is fixed, not at the next submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm />)
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))
    expect(await screen.findByText('Enter the customer name')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    await waitFor(() =>
      expect(screen.queryByText('Enter the customer name')).not.toBeInTheDocument()
    )
  })

  it('shows the hint while the field is happy', () => {
    renderWithProviders(<CustomerForm />)
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'We send the invoice here.'
    )
  })

  it('passes parsed values through once every rule is satisfied', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    await user.type(screen.getByLabelText('Email'), 'ahmed@example.com')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ahmed Al-Rashid',
        email: 'ahmed@example.com',
        vat: '',
      })
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('server rejections', () => {
  it('attaches a server error to the field that caused it', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CustomerForm
        onSubmit={async () => {
          throw new ServerValidationError({ email: 'That email is already registered.' })
        }}
      />
    )

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    await user.type(screen.getByLabelText('Email'), 'ahmed@example.com')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    expect(await screen.findByText('That email is already registered.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('surfaces a rejection that belongs to no field at all', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CustomerForm
        onSubmit={async () => {
          throw new Error('The branch is closed for month-end.')
        }}
      />
    )

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    await user.type(screen.getByLabelText('Email'), 'ahmed@example.com')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The branch is closed for month-end.'
    )
  })

  it('disables the submit while the save is in flight, so it cannot be fired twice', async () => {
    const user = userEvent.setup()
    let release = () => {}
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    await user.type(screen.getByLabelText('Email'), 'ahmed@example.com')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))

    const button = await screen.findByRole('button', { name: 'Saving...' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    release()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Customer' })).toBeEnabled())
  })
})

describe('dirty tracking', () => {
  it('goes dirty on the first edit and clean again once the save lands', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm onSubmit={async () => {}} />)
    expect(screen.getByTestId('dirty')).toHaveTextContent('clean')

    await user.type(screen.getByLabelText(/Customer Name/), 'Ahmed Al-Rashid')
    expect(screen.getByTestId('dirty')).toHaveTextContent('dirty')

    await user.type(screen.getByLabelText('Email'), 'ahmed@example.com')
    await user.click(screen.getByRole('button', { name: 'Save Customer' }))
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('clean'))
  })

  it('is clean again when an edit is typed away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerForm />)
    await user.type(screen.getByLabelText('VAT Registration'), '3104')
    expect(screen.getByTestId('dirty')).toHaveTextContent('dirty')
    await user.clear(screen.getByLabelText('VAT Registration'))
    expect(screen.getByTestId('dirty')).toHaveTextContent('clean')
  })
})

describe('field kinds', () => {
  function KindsForm() {
    const form = useZodForm({
      schema: z.object({
        amount: z.string(),
        due: z.string(),
        phone: z.string(),
        branch: z.string(),
        services: z.array(z.string()),
      }),
      initial: { amount: '', due: '', phone: '', branch: '', services: [] as string[] },
      onSubmit: () => {},
    })
    return (
      <Form form={form}>
        <Field name="amount" label="Amount" kind="currency" />
        <Field name="due" label="Due Date" kind="date" />
        <Field name="phone" label="Phone" kind="phone" />
        <Field
          name="branch"
          label="Branch"
          kind="select"
          options={[
            { value: 'riyadh', label: 'Riyadh' },
            { value: 'jeddah', label: 'Jeddah' },
          ]}
        />
        <Field
          name="services"
          label="Services"
          kind="multiselect"
          options={[
            { value: 'oil', label: 'Oil Change' },
            { value: 'brakes', label: 'Brakes' },
          ]}
        />
      </Form>
    )
  }

  it('pins Latin runs LTR so Arabic cannot reorder a phone number or a date', () => {
    // Labels are translated, so ask for them the way an Arabic user sees them.
    const ar = (source: string) => AR[source] ?? source
    renderWithProviders(<KindsForm />, { language: 'ar' })
    expect(screen.getByLabelText(ar('Phone'))).toHaveAttribute('dir', 'ltr')
    expect(screen.getByLabelText(ar('Due Date'))).toHaveAttribute('dir', 'ltr')
    expect(screen.getByLabelText(ar('Amount'))).toHaveAttribute('dir', 'ltr')
  })

  it('echoes what a typed amount will actually be stored as', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KindsForm />)
    await user.type(screen.getByLabelText('Amount'), '1234.5')
    expect(await screen.findByText('SAR 1,234.50')).toBeInTheDocument()
  })

  it('offers a placeholder option so a select cannot look pre-answered', () => {
    renderWithProviders(<KindsForm />)
    const select = screen.getByLabelText('Branch') as HTMLSelectElement
    expect(select.value).toBe('')
    expect(screen.getByRole('option', { name: 'Select' })).toBeInTheDocument()
  })

  it('accumulates a multiselect as chips with checkbox semantics', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KindsForm />)
    const group = screen.getByRole('group', { name: 'Services' })
    expect(group).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Oil Change' }))
    expect(screen.getByRole('checkbox', { name: 'Oil Change' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('checkbox', { name: 'Brakes' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })
})
