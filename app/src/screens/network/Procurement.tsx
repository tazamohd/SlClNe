import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Money } from '@/components/ui/Money'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Field } from '@/components/shell/AuthCard'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { NETWORK_STATUS, PRIORITY_TONE, REQUISITIONS, type Requisition } from '@/data/network'

// ── Send request ────────────────────────────────────────────────────────────
const PRIORITIES = ['urgent', 'normal', 'low'] as const

/** Raise a quotation request to the network.
 *
 *  The design's version had no validation — you could send an empty request to
 *  every supplier on the network. Part name and quantity are required here. */
export function PartsNetworkSendRequest() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()

  const [part, setPart] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [qty, setQty] = useState('1')
  const [priority, setPriority] = useState<string>('normal')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const missingPart = !part.trim()
  const badQty = !(Number(qty) > 0)

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (missingPart || badQty) {
      toast.show({
        title: t('Error'),
        description: t('Enter a part name and a quantity above zero.'),
        error: true,
      })
      return
    }
    toast.show({
      title: t('Request sent'),
      description: t('Suppliers in your network will respond with quotes.'),
    })
    setTimeout(() => navigate('/parts-network/requests'), 700)
  }

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('Send Request')}
        subtitle={t('Ask the network for a price on a part')}
      />

      <form onSubmit={submit} noValidate className="contents">
        <Section title={t('Part Details')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t('Part Name')} htmlFor="part">
              <Input
                id="part"
                inputSize="md"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder={t('Front Brake Pads Set')}
                invalid={submitted && missingPart}
              />
            </Field>
            <Field label={t('Part Number')} htmlFor="part-number">
              <Input
                id="part-number"
                inputSize="md"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="04465-33450"
                dir="ltr"
              />
            </Field>
            <Field label={t('Vehicle')} htmlFor="vehicle">
              <Input
                id="vehicle"
                inputSize="md"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Toyota Camry 2022"
              />
            </Field>
            <Field label={t('Quantity')} htmlFor="qty">
              <Input
                id="qty"
                inputSize="md"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                invalid={submitted && badQty}
                dir="ltr"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-action text-xs font-medium text-heading">{t('Priority')}</span>
            <ChipGroup label={t('Priority')}>
              {PRIORITIES.map((option) => (
                <Chip
                  key={option}
                  label={t(option[0].toUpperCase() + option.slice(1))}
                  selected={priority === option}
                  onToggle={() => setPriority(option)}
                />
              ))}
            </ChipGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="font-action text-xs font-medium text-heading">
              {t('Notes')}
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Condition, brand preference, delivery window...')}
              className="box-border w-full resize-y rounded border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="lg" onClick={() => navigate('/parts-network')}>
            {t('Cancel')}
          </Button>
          <Button type="submit" size="lg">
            <Icon name="Send" size={16} />
            {t('Send Request')}
          </Button>
        </div>
      </form>
    </>
  )
}

// ── Quotations ──────────────────────────────────────────────────────────────
interface Quote {
  supplier: string
  city: string
  unit: number
  qty: number
  lead: string
  rating: number
}

/** Quotes received against a request. Transcribed from
 *  PartsNetwork.Quotations.dc.html. */
const QUOTES: readonly Quote[] = [
  { supplier: 'Al-Faisal Auto Parts', city: 'Riyadh', unit: 250, qty: 4, lead: '2 days', rating: 4.8 },
  { supplier: 'Parts Hub KSA', city: 'Dammam', unit: 265, qty: 4, lead: '1 day', rating: 4.4 },
  { supplier: 'Saudi Parts Company', city: 'Jeddah', unit: 240, qty: 4, lead: '4 days', rating: 4.5 },
]

const SORTS = [
  { id: 'price', label: 'Price', icon: 'ArrowUpDown' },
  { id: 'rating', label: 'Rating', icon: 'Star' },
  { id: 'lead', label: 'Lead Time', icon: 'Clock' },
] as const

export function PartsNetworkQuotations() {
  const { t } = usePreferences()
  const toast = useToast()
  const [sort, setSort] = useState<string>('price')

  // Sorting is real: the design's buttons only restyled themselves. Comparing
  // quotes is the entire point of the screen.
  const sorted = useMemo(() => {
    const rows = [...QUOTES]
    if (sort === 'price') rows.sort((a, b) => a.unit - b.unit)
    if (sort === 'rating') rows.sort((a, b) => b.rating - a.rating)
    if (sort === 'lead') rows.sort((a, b) => parseInt(a.lead, 10) - parseInt(b.lead, 10))
    return rows
  }, [sort])

  const best = Math.min(...QUOTES.map((q) => q.unit))

  const columns: Column<Quote>[] = [
    {
      header: 'Supplier',
      cell: (q) => (
        <span className="flex items-center gap-2">
          {q.supplier}
          {q.unit === best ? (
            <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
              {t('Best price')}
            </Badge>
          ) : null}
        </span>
      ),
    },
    { header: 'City', cell: (q) => t(q.city) },
    { header: 'Unit Price', cell: (q) => <Money sar={q.unit} /> },
    { header: 'Total', cell: (q) => <Money sar={q.unit * q.qty} className="font-semibold" /> },
    { header: 'Lead Time', cell: (q) => t(q.lead) },
    {
      header: 'Rating',
      cell: (q) => (
        <span className="inline-flex items-center gap-1">
          <Icon name="Star" size={13} className="text-salis-orange" />
          <span className="font-mono text-[13px]" dir="ltr">
            {q.rating}
          </span>
        </span>
      ),
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Quotations')}
        subtitle={t('Compare quotes received for Front Brake Pads Set')}
      />

      <div role="tablist" aria-label={t('Sort by')} className="flex flex-wrap gap-2">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={sort === option.id}
            onClick={() => setSort(option.id)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5',
              'font-action text-[13px] font-medium transition-all duration-150',
              sort === option.id
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            <Icon name={option.icon} size={13} />
            {t(option.label)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(q) => q.supplier}
        mobileCard={(q) => (
          <>
            <MobileCardHeader
              title={q.supplier}
              trailing={
                q.unit === best ? (
                  <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
                    {t('Best price')}
                  </Badge>
                ) : undefined
              }
            />
            <MobileCardRow label={t('Unit Price')}>
              <Money sar={q.unit} className="text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Total')}>
              <Money sar={q.unit * q.qty} className="font-semibold text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Lead Time')}>{t(q.lead)}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileText" title={t('No quotes received yet')} />}
      />

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() =>
            toast.show({ title: t('Order placed'), description: t('The supplier has been notified.') })
          }
        >
          <Icon name="ShoppingCart" size={16} />
          {t('Accept & Order')}
        </Button>
      </div>
    </>
  )
}

// ── Procurement portal ──────────────────────────────────────────────────────
const REQ_TABS = ['pending', 'approved', 'converted', 'rejected', 'all'] as const

export function ProcurementRequisitions() {
  const { t } = usePreferences()
  const { canApprove, roleMeta } = useSession()
  const toast = useToast()
  const [tab, setTab] = useState<string>('pending')

  const rows = useMemo(
    () => (tab === 'all' ? REQUISITIONS : REQUISITIONS.filter((r) => r.status === tab)),
    [tab]
  )

  const columns: Column<Requisition>[] = [
    { header: 'Reference', cell: (r) => r.id, code: true },
    { header: 'Request', cell: (r) => t(r.what) },
    { header: 'From', cell: (r) => t(r.from) },
    { header: 'Age', cell: (r) => t(r.age) },
    { header: 'Amount', cell: (r) => <Money sar={r.amount} className="font-semibold" /> },
    {
      header: 'Priority',
      cell: (r) => {
        const [bg, fg] = PRIORITY_TONE[r.priority] ?? PRIORITY_TONE.medium
        return (
          <Badge background={bg} color={fg}>
            {t(r.priority[0].toUpperCase() + r.priority.slice(1))}
          </Badge>
        )
      },
    },
    {
      header: 'Status',
      cell: (r) => {
        const [bg, fg] = NETWORK_STATUS[r.status] ?? NETWORK_STATUS.pending
        return (
          <Badge background={bg} color={fg}>
            {t(r.status === 'converted' ? 'PO Raised' : r.status[0].toUpperCase() + r.status.slice(1))}
          </Badge>
        )
      },
    },
    {
      header: 'Action',
      cell: (r) => {
        if (r.status !== 'pending') return null
        // Approval is bounded by the role's SAR ceiling. REQ-0517 at 28,000
        // sits above a procurement agent's 20,000 limit, so it escalates.
        const allowed = canApprove(r.amount)
        return (
          <Button
            variant={allowed ? 'primary' : 'outline'}
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              toast.show(
                allowed
                  ? { title: t('Approved'), description: `${r.id} · ${t(r.what)}` }
                  : {
                      title: t('Above your approval limit'),
                      description: `${t('Limit')}: SAR ${roleMeta.limit?.toLocaleString('en-US') ?? '—'}`,
                    }
              )
            }}
          >
            {allowed ? t('Approve') : t('Escalate')}
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="ClipboardList"
        title={t('Requisitions')}
        subtitle={t('Purchase requests awaiting approval and conversion to orders')}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {REQ_TABS.map((option) => {
          const count =
            option === 'all'
              ? REQUISITIONS.length
              : REQUISITIONS.filter((r) => r.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={tab === option}
              onClick={() => setTab(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium transition-all duration-150',
                tab === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'converted' ? 'PO Raised' : option[0].toUpperCase() + option.slice(1))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.id} code />
            <MobileCardRow>{t(r.what)}</MobileCardRow>
            <MobileCardRow label={t('From')}>{t(r.from)}</MobileCardRow>
            <MobileCardRow label={t('Amount')}>
              <Money sar={r.amount} className="font-semibold text-heading" />
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="ClipboardList" title={t('Nothing in this view')} />}
      />
    </>
  )
}

export function ProcurementPortal() {
  const { t } = usePreferences()
  const navigate = useNavigate()

  const pending = REQUISITIONS.filter((r) => r.status === 'pending')
  const pendingValue = pending.reduce((sum, r) => sum + r.amount, 0)

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Procurement Portal')}
        subtitle={t('Requisitions, supplier comparison and purchase orders')}
        actions={
          <Button size="md" onClick={() => navigate('/procurement-portal/requisitions')}>
            <Icon name="ClipboardList" size={16} />
            {t('Requisitions')}
          </Button>
        }
      />

      <StatRow
        stats={[
          {
            label: 'Pending Approval',
            value: pending.length,
            caption: 'Requisitions',
            highlight: true,
          },
          {
            label: 'Pending Value',
            value: `SAR ${pendingValue.toLocaleString('en-US')}`,
            caption: 'Awaiting sign-off',
            tone: 'warning',
          },
          { label: 'Open Orders', value: 3, caption: 'With suppliers', tone: 'info' },
          { label: 'Suppliers', value: 156, caption: 'On the network' },
        ]}
      />

      <Section
        title={t('Approval Queue')}
        subtitle={t('Oldest and highest-value requests first')}
      >
        <div className="flex flex-col gap-2.5">
          {pending.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-inset p-3.5"
            >
              <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2 text-salis-blue">
                <Icon name="Package" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-heading">{t(r.what)}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  <span className="font-mono" dir="ltr">
                    {r.id}
                  </span>{' '}
                  · {t(r.from)} · {t(r.age)}
                </p>
              </div>
              <Money sar={r.amount} className="font-semibold text-heading" />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/** Group-buying and fulfilment view across partner garages. */
export function PartsSupplyNetwork() {
  const { t } = usePreferences()
  const tabs = [
    { id: 'partners', label: 'Network Partners', icon: 'Users' },
    { id: 'fulfillment', label: 'Fulfillment Orders', icon: 'Package' },
    { id: 'shipments', label: 'Shipments', icon: 'Truck' },
    { id: 'warehouses', label: 'Warehouses', icon: 'Warehouse' },
  ]
  const [tab, setTab] = useState(tabs[0].id)

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Supply Network')}
        subtitle={t('Partner warehouses, fulfilment and shipment tracking')}
      />

      <Card className="flex gap-1 overflow-x-auto rounded-lg p-1.5" role="tablist">
        {tabs.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={tab === option.id}
            onClick={() => setTab(option.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded px-4 py-2.5',
              'font-action text-[13px] font-semibold transition-all duration-150',
              tab === option.id
                ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                : 'bg-transparent text-muted hover:bg-[rgba(10,94,215,.06)] hover:text-salis-blue'
            )}
          >
            <Icon name={option.icon} size={15} />
            {t(option.label)}
          </button>
        ))}
      </Card>

      <StatRow
        stats={[
          { label: 'Partners', value: 156, caption: 'Connected', highlight: true },
          { label: 'Open Fulfilments', value: 0, caption: 'In progress', tone: 'info' },
          { label: 'In Transit', value: 0, caption: 'Shipments', tone: 'info' },
          { label: 'Warehouses', value: 0, caption: 'Stocking points' },
        ]}
      />

      <Section title={t(tabs.find((x) => x.id === tab)?.label ?? '')}>
        <EmptyState
          icon="Network"
          title={t('Nothing here yet')}
          description={t('This view populates as network activity begins.')}
        />
      </Section>
    </>
  )
}
