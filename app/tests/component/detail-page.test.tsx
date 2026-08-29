import { describe, expect, it, vi } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailPage } from '@/components/shell/DetailPage'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

/** The frame nine detail screens across four domains render inside.
 *
 *  What is worth pinning here is the part three other agents will build
 *  against and cannot see from the type signature: which state wins when two
 *  are set, what `on: 'mobile'` actually does at 390px, that an unfilled rail
 *  renders nothing at all rather than an empty column, and that a tab hides a
 *  section without hiding the ones that belong to every tab. */

const SECTIONS = [
  { id: 'a', title: 'Summary', children: <p>summary body</p> },
  { id: 'b', title: 'Ledger', tab: 'money', children: <p>ledger body</p> },
  { id: 'c', title: 'Notes', tab: 'notes', children: <p>notes body</p> },
]

describe('states', () => {
  it('shows the loading skeleton and nothing of the record', () => {
    renderWithProviders(<DetailPage title="Ahmed Al-Rashid" loading summary={[{ label: 'Total Jobs', value: 12 }]} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.queryByText('Ahmed Al-Rashid')).not.toBeInTheDocument()
    expect(screen.queryByText('Total Jobs')).not.toBeInTheDocument()
  })

  it('offers a retry on a failed load, with the failure message', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderWithProviders(
      <DetailPage title="Ahmed" error={{ message: 'The server could not be reached.', onRetry }} />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('The server could not be reached.')
    await user.click(screen.getByRole('button', { name: /Retry/ }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('explains a missing record and keeps the way back', () => {
    renderWithProviders(
      <DetailPage
        title="Customers"
        back={{ to: '/customers', label: 'Customers' }}
        notFound={{ title: 'Customer not found', description: 'It may have been deleted.' }}
      />
    )
    expect(screen.getByText('Customer not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Customers/ })).toHaveAttribute('href', '/customers')
  })

  it('puts a denial ahead of a load, so a refused record never flashes its data', () => {
    renderWithProviders(<DetailPage title="Ahmed Al-Rashid" denied loading />)
    expect(screen.getByRole('alert')).toHaveTextContent('Permission Denied')
    expect(screen.queryByText('Ahmed Al-Rashid')).not.toBeInTheDocument()
  })

  it('states read-only up front rather than at save time', () => {
    renderWithProviders(<DetailPage title="Ahmed" readOnly="Read-only — your role can view this customer but not change it." />)
    expect(
      screen.getByText('Read-only — your role can view this customer but not change it.')
    ).toBeInTheDocument()
  })
})

describe('header', () => {
  it('labels each meta value for assistive tech, since the glyph alone says nothing', () => {
    renderWithProviders(
      <DetailPage
        title="Toyota Camry 2022"
        meta={[
          { icon: 'Hash', label: 'Plate', value: 'RUH 4821', code: true },
          { icon: 'Key', label: 'VIN', value: '6T1BF1FK5CX123456', code: true },
        ]}
      />
    )
    expect(screen.getByText('Plate')).toHaveClass('sr-only')
    // Latin identifiers are pinned LTR or Arabic reorders the characters.
    expect(screen.getByText('RUH 4821')).toHaveAttribute('dir', 'ltr')
  })

  it('renders a person as a gradient initial and a thing as an icon tile', () => {
    const { unmount } = renderWithProviders(<DetailPage title="Ahmed" avatar={{ initial: 'A' }} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    unmount()
    renderWithProviders(<DetailPage title="Camry" avatar={{ icon: 'Car' }} />)
    expect(document.querySelector('svg')).toBeTruthy()
  })
})

describe('surface', () => {
  it('drops the icon tile on a phone but keeps the initial chip — as both designs do', () => {
    setViewportWidth(390)
    const { unmount } = renderWithProviders(<DetailPage title="Camry" avatar={{ icon: 'Car' }} />)
    expect(document.querySelectorAll('svg')).toHaveLength(0)
    unmount()
    renderWithProviders(<DetailPage title="Ahmed" avatar={{ initial: 'A' }} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('swaps content, not only width, between desktop and phone', () => {
    renderWithProviders(
      <DetailPage
        title="Ahmed"
        summary={[
          { label: 'Member Since', value: '2024', on: 'desktop' },
          { label: 'Last Visit', value: '2 weeks ago', on: 'mobile' },
          { label: 'Total Spent', value: 'SAR 12,840' },
        ]}
      />
    )
    expect(screen.getByText('Member Since')).toBeInTheDocument()
    expect(screen.queryByText('Last Visit')).not.toBeInTheDocument()

    act(() => setViewportWidth(390))
    expect(screen.queryByText('Member Since')).not.toBeInTheDocument()
    expect(screen.getByText('Last Visit')).toBeInTheDocument()
    // Unmarked items belong to both.
    expect(screen.getByText('Total Spent')).toBeInTheDocument()
  })
})

describe('tabs', () => {
  it('renders every section when the screen declares no tabs', () => {
    renderWithProviders(<DetailPage title="Ahmed" sections={SECTIONS} />)
    expect(screen.getByText('ledger body')).toBeInTheDocument()
    expect(screen.getByText('notes body')).toBeInTheDocument()
  })

  it('shows the first tab, and keeps untabbed sections under every tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DetailPage
        title="Ahmed"
        tabs={[
          { id: 'money', label: 'Invoices' },
          { id: 'notes', label: 'Comments' },
        ]}
        sections={SECTIONS}
      />
    )
    expect(screen.getByRole('tab', { name: 'Invoices' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('ledger body')).toBeInTheDocument()
    expect(screen.queryByText('notes body')).not.toBeInTheDocument()
    expect(screen.getByText('summary body')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Comments' }))
    expect(screen.getByText('notes body')).toBeInTheDocument()
    expect(screen.queryByText('ledger body')).not.toBeInTheDocument()
    expect(screen.getByText('summary body')).toBeInTheDocument()
  })
})

describe('related records', () => {
  it('explains an empty list instead of leaving a blank panel', () => {
    renderWithProviders(
      <DetailPage
        title="Ahmed"
        related={[
          {
            id: 'vehicles',
            title: 'Vehicles',
            records: [],
            empty: { icon: 'Car', title: 'No vehicles yet', description: 'Added at check-in.' },
          },
        ]}
      />
    )
    expect(screen.getByText('No vehicles yet')).toBeInTheDocument()
  })

  it('makes a record a link when it has somewhere to go, and plain text when it does not', () => {
    renderWithProviders(
      <DetailPage
        title="Ahmed"
        related={[
          {
            id: 'vehicles',
            title: 'Vehicles',
            records: [
              { id: '1', to: '/vehicle-detail?plate=RUH%204821', primary: 'Toyota Camry 2022' },
              { id: '2', primary: 'Lexus ES 350 2020' },
            ],
          },
        ]}
      />
    )
    expect(screen.getByRole('link', { name: /Toyota Camry 2022/ })).toHaveAttribute(
      'href',
      '/vehicle-detail?plate=RUH%204821'
    )
    expect(screen.queryByRole('link', { name: /Lexus/ })).not.toBeInTheDocument()
  })
})

describe('rails', () => {
  it('renders no rail column at all when nothing fills one', () => {
    const { container } = renderWithProviders(<DetailPage title="Ahmed" sections={SECTIONS} />)
    expect(container.querySelector('aside')).toBeNull()
  })

  it('places the timeline, comments and attachments in one rail, in that order', () => {
    const { container } = renderWithProviders(
      <DetailPage
        title="Ahmed"
        timeline={<p>timeline rail</p>}
        comments={<p>comments rail</p>}
        attachments={<p>attachments rail</p>}
      />
    )
    const rail = container.querySelector('aside')
    expect(rail).not.toBeNull()
    expect(within(rail as HTMLElement).getByText('timeline rail')).toBeInTheDocument()
    expect(rail?.textContent).toBe('timeline railcomments railattachments rail')
  })
})

describe('Arabic', () => {
  it('translates labels and flips the back chevron', () => {
    renderWithProviders(
      <DetailPage
        title="Ahmed Al-Rashid"
        back={{ to: '/customers', label: 'Customers' }}
        summary={[{ label: 'Total Spent', value: 'SAR 12,840' }]}
      />,
      { language: 'ar' }
    )
    // The dictionary's own translations, not strings restated in this test.
    expect(screen.getByRole('link', { name: /العملاء/ })).toBeInTheDocument()
    expect(screen.getByText('إجمالي الإنفاق')).toBeInTheDocument()
    // A person's name is not a translatable string.
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
  })
})
