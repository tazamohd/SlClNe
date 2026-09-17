import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicRequestDemo, validateRequestDemo } from '@/screens/public/RequestDemo'

function renderForm() {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={['/public-portal/request-demo']}>
        <PublicRequestDemo />
      </MemoryRouter>
    </PreferencesProvider>
  )
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name *'), 'Ahmed Al-Rashid')
  await user.type(screen.getByLabelText('Work email *'), 'ahmed@example.sa')
  await user.type(screen.getByLabelText('Company name *'), 'Al-Rashid Motors')
  await user.click(screen.getByRole('checkbox', { name: /agree to be contacted/i }))
}

describe('Request a Demo form validation', () => {
  it('rejects an empty submission with an accessible error summary and per-field errors', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Submit Request' }))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveTextContent('Please fix the following before submitting')
    expect(within(summary).getByText('Please enter your full name.')).toBeInTheDocument()
    expect(within(summary).getByText('Please enter your work email address.')).toBeInTheDocument()
    expect(within(summary).getByText('Please enter your company name.')).toBeInTheDocument()
    expect(
      within(summary).getByText('Please confirm you agree to be contacted about this request.')
    ).toBeInTheDocument()
  })

  it('never pre-selects the consent checkbox', () => {
    renderForm()
    expect(screen.getByRole('checkbox', { name: /agree to be contacted/i })).not.toBeChecked()
  })

  it('rejects a malformed email and ties the error to the field', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Full name *'), 'Ahmed')
    await user.type(screen.getByLabelText('Work email *'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit Request' }))
    const email = screen.getByLabelText('Work email *')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.')
  })

  it('requires consent even when every other field is valid', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Full name *'), 'Ahmed')
    await user.type(screen.getByLabelText('Work email *'), 'ahmed@example.sa')
    await user.type(screen.getByLabelText('Company name *'), 'Al-Rashid Motors')
    await user.click(screen.getByRole('button', { name: 'Submit Request' }))
    expect(
      screen.getAllByText('Please confirm you agree to be contacted about this request.').length
    ).toBeGreaterThan(0)
  })

  it('validateRequestDemo accepts a complete, well-formed submission', () => {
    expect(
      validateRequestDemo({ name: 'A', email: 'a@b.co', company: 'Acme', consent: true })
    ).toEqual({})
  })
})

describe('Request a Demo form delivery — fixture build (no VITE_API_URL)', () => {
  // Same honest pattern as Contact.tsx: this test build ships no backend, so
  // the real 202/429/400 paths against POST /public/leads are covered
  // elsewhere for the shared endpoint; here we only assert no success is
  // faked when there is nowhere for the request to go.
  it('a valid submission states requests are not live in this build, with working fallback channels', async () => {
    const user = userEvent.setup()
    renderForm()
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: 'Submit Request' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('We could not send your request.')
    expect(alert).toHaveTextContent('Online requests have not launched for this site yet.')
    expect(alert.querySelector('a[href="mailto:info@salisauto.sa"]')).toBeTruthy()
    expect(alert.querySelector('a[href="tel:+966112345678"]')).toBeTruthy()
  })

  it('never fakes a success state on the fixture build', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: 'Submit Request' }))
    expect(container.textContent).not.toMatch(/demo request submitted|thank you/i)
  })
})

describe('Request a Demo form accessibility', () => {
  it('every visible field label is programmatically associated with its control', () => {
    renderForm()
    for (const label of [
      'Full name *',
      'Work email *',
      'Phone',
      'Company name *',
      'Job role',
      'Business type',
      'City',
      'Number of branches',
      'Approximate monthly job cards',
      'Preferred contact method',
      'Message',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('carries autocomplete hints for the common identity fields', () => {
    renderForm()
    expect(screen.getByLabelText('Full name *')).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText('Work email *')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Phone')).toHaveAttribute('autocomplete', 'tel')
    expect(screen.getByLabelText('Company name *')).toHaveAttribute('autocomplete', 'organization')
  })

  it('links consent to the Privacy Policy', () => {
    renderForm()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy-policy'
    )
  })
})
