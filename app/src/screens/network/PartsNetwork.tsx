import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureHeader, Section, StatRow, TabBar, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState, ReadOnlyNotice } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { RepositoryError, useCollection, useDelete, useUpdate } from '@/data/useCollection'
import { partsNetwork } from '@/data/repository'
import { rowId } from '../registry/writes'
import {
  MemberFormModal,
  MemberRating,
  NetworkBadge,
  QuotationFormModal,
  RequestFields,
  useRequestForm,
  type Member,
  type NetworkOrder,
  type NetworkRequest,
  type Quotation,
} from './parts-network/bits'

/** The parts-network screens (BLK-004) — a garage-to-garage / garage-to-dealer
 *  parts supply network: who this workshop trades with, what it asked the
 *  network for, what came back, and what an accepted quotation became.
 *
 *  Every view here used to be an honest "no data source yet" shell, because
 *  none of it existed as a collection. All seven now read real data through
 *  `partsNetworkMembers`, `partsNetworkRequests`, `partsNetworkQuotations` and
 *  `partsNetworkOrders`. A view with nothing in it shows an `EmptyState` — a
 *  true statement about the network — rather than a gap card.
 *
 *  **The tenant boundary.** Nothing in this domain crosses it. A member is a
 *  directory entry this workshop keeps about a counterparty, not a window into
 *  another organization's data, and `direction` distinguishes what went out
 *  from what came in. `server/drizzle/0024_parts_network.sql` sets out why
 *  genuine cross-org sharing is deliberately out of scope rather than faked.
 *
 *  **Permissions.** Everything rides the `network` module, which already
 *  expressed parts-network authority: `v` to read, `c` to send a request or
 *  submit a quotation, `e` for the lifecycle moves, `d` to remove, and `a` —
 *  approval authority — to accept a quotation, because that commits money.
 *  `technician` holds nothing on `network`, so none of this is reachable for
 *  one. No grant was widened for this feature.
 */

/** Accepting a quotation is a server transaction (it rejects the siblings,
 *  orders the request and raises the order), so it is live-only. On the
 *  fixtures the screen says so instead of offering a button that cannot work —
 *  the same line `Procurement.tsx` draws for an approval. */
const CAN_ACCEPT_LIVE = partsNetwork !== null

function useNetworkErrors(...queries: readonly { isError: boolean; error?: unknown }[]) {
  const failed = queries.find((q) => q.isError)
  return failed ? ((failed.error as Error | undefined)?.message ?? undefined) : null
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export function PartsNetworkDashboard() {
  const { t } = usePreferences()
  const members = useCollection('partsNetworkMembers')
  const requests = useCollection('partsNetworkRequests')
  const quotations = useCollection('partsNetworkQuotations')
  const orders = useCollection('partsNetworkOrders')

  const memberRows = members.data ?? []
  const requestRows = requests.data ?? []
  const quotationRows = quotations.data ?? []
  const orderRows = orders.data ?? []
  const failure = useNetworkErrors(members, requests, quotations, orders)

  const stats: Stat[] = useMemo(
    () => [
      {
        label: 'Network Members',
        value: memberRows.filter((m) => m.status === 'active').length,
        caption: 'Active partners',
        highlight: true,
      },
      {
        label: 'Open Requests',
        value: requestRows.filter((r) => r.direction === 'outgoing' && r.status === 'open').length,
        caption: 'Awaiting quotes',
        tone: 'info',
      },
      {
        label: 'Pending Quotations',
        value: quotationRows.filter((q) => q.status === 'pending').length,
        caption: 'To compare',
        tone: quotationRows.some((q) => q.status === 'pending') ? 'warning' : 'info',
      },
      {
        label: 'Orders In Transit',
        value: orderRows.filter((o) => o.status === 'shipped').length,
        caption: 'Shipped, not received',
        tone: 'info',
      },
    ],
    [memberRows, requestRows, quotationRows, orderRows],
  )

  const incomingCount = requestRows.filter((r) => r.direction === 'incoming' && r.status === 'open').length

  const actions = [
    {
      title: 'Request Quotation',
      desc: 'Send a new part price request to the network',
      cta: 'Send Request',
      to: '/parts-network/send-request',
      icon: 'Send',
    },
    {
      title: 'View Incoming Requests',
      desc: 'Respond to quotation requests from other garages',
      cta: 'View Requests',
      to: '/parts-network/incoming',
      icon: 'Inbox',
    },
  ]

  if (failure) return <ErrorState description={failure} onRetry={() => void requests.refetch()} />

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Network')}
        subtitle={t('Source parts from garages, dealers and suppliers across the network')}
      />

      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {actions.map((action) => (
          <Card key={action.title} className="flex items-start gap-4 rounded-lg p-5">
            <span className="flex flex-shrink-0 rounded-[10px] bg-salis-blue/[.09] p-2.5 text-salis-blue">
              <Icon name={action.icon} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-heading">{t(action.title)}</h2>
              <p className="mt-1 text-[13px] text-muted">{t(action.desc)}</p>
              {action.to === '/parts-network/incoming' && incomingCount > 0 ? (
                <p className="mt-1 text-[13px] font-semibold text-heading">
                  {incomingCount} {t('awaiting a reply')}
                </p>
              ) : null}
              <Link
                to={action.to}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
              >
                {t(action.cta)}
                <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Section title={t('Latest Requests')}>
        <DataTable
          caption="Latest network requests"
          columns={[
            { header: 'Request', cell: (r: NetworkRequest) => <span dir="ltr">{r.code}</span> },
            { header: 'Part', cell: (r: NetworkRequest) => r.partName },
            { header: 'Qty', cell: (r: NetworkRequest) => r.qty },
            { header: 'Urgency', cell: (r: NetworkRequest) => <NetworkBadge dictionary="urgency" value={r.urgency} /> },
            { header: 'Status', cell: (r: NetworkRequest) => <NetworkBadge dictionary="requestStatus" value={r.status} /> },
            { header: 'Quotes', cell: (r: NetworkRequest) => r.quotationCount },
          ]}
          rows={requestRows.slice(0, 5)}
          rowKey={(r) => rowId(r) ?? r.code}
          loading={requests.isLoading}
          mobileCard={(r) => (
            <>
              <MobileCardHeader
                title={r.partName}
                trailing={<NetworkBadge dictionary="requestStatus" value={r.status} />}
              />
              <MobileCardRow label={t('Request')}>{r.code}</MobileCardRow>
              <MobileCardRow label={t('Quantity')}>{r.qty}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Network"
              title={t('No network activity yet')}
              description={t('Send a part request to the network and quotations will appear here.')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── My requests ─────────────────────────────────────────────────────────────
export function PartsNetworkRequests() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const { confirm } = useModal()
  const update = useUpdate('partsNetworkRequests')
  const remove = useDelete('partsNetworkRequests')
  const requests = useCollection('partsNetworkRequests')
  const members = useCollection('partsNetworkMembers')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const mayEdit = can('network', 'e')
  const mayDelete = can('network', 'd')
  const mayCreate = can('network', 'c')

  const rows = useMemo(() => {
    const outgoing = (requests.data ?? []).filter((r) => r.direction === 'outgoing')
    const needle = query.trim().toLowerCase()
    if (!needle) return outgoing
    return outgoing.filter(
      (r) =>
        r.partName.toLowerCase().includes(needle) ||
        r.code.toLowerCase().includes(needle) ||
        (r.partNumber ?? '').toLowerCase().includes(needle),
    )
  }, [requests.data, query])

  const move = async (request: NetworkRequest, status: NetworkRequest['status'], message: string) => {
    const id = rowId(request)
    if (!id) return
    setBusyId(id)
    try {
      await update.mutateAsync({ id, patch: { status } as Partial<NetworkRequest> })
      toast.show({ title: t(message), description: request.partName })
    } catch (cause) {
      toast.show({
        title: t('Could not update request'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (request: NetworkRequest) => {
    const id = rowId(request)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Request?'),
      description: `${request.code} — ${request.partName}`,
      icon: 'Trash2',
      confirmLabel: t('Delete'),
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    setBusyId(id)
    try {
      await remove.mutateAsync({ id })
      toast.show({ title: t('Request deleted'), description: request.code })
    } catch (cause) {
      toast.show({
        title: t('Could not delete request'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const columns: Column<NetworkRequest>[] = [
    { header: 'Request', cell: (r) => <span dir="ltr">{r.code}</span> },
    {
      header: 'Part',
      cell: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-heading">{r.partName}</span>
          {r.partNumber ? (
            <span className="text-[12px] text-muted" dir="ltr">
              {r.partNumber}
            </span>
          ) : null}
        </div>
      ),
    },
    { header: 'Qty', cell: (r) => r.qty },
    { header: 'Sent To', cell: (r) => r.memberName ?? t('Whole network') },
    { header: 'Urgency', cell: (r) => <NetworkBadge dictionary="urgency" value={r.urgency} /> },
    { header: 'Status', cell: (r) => <NetworkBadge dictionary="requestStatus" value={r.status} /> },
    { header: 'Quotes', cell: (r) => r.quotationCount },
    { header: 'Needed By', cell: (r) => r.neededBy ?? '—' },
    ...(mayEdit || mayDelete
      ? [
          {
            header: 'Actions',
            cell: (r: NetworkRequest) => (
              <div className="flex items-center gap-2">
                {mayEdit && (r.status === 'open' || r.status === 'quoted') ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void move(r, 'cancelled', 'Request cancelled')}
                    disabled={busyId === rowId(r)}
                  >
                    <Icon name="X" size={13} />
                    {t('Cancel')}
                  </Button>
                ) : null}
                {mayEdit && r.status === 'ordered' ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void move(r, 'closed', 'Request closed')}
                    disabled={busyId === rowId(r)}
                  >
                    <Icon name="Check" size={13} />
                    {t('Close')}
                  </Button>
                ) : null}
                {mayDelete ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void handleDelete(r)}
                    disabled={busyId === rowId(r)}
                  >
                    <Icon name="Trash2" size={13} />
                    {t('Delete')}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ]

  if (requests.isError) {
    return <ErrorState description={requests.error?.message} onRetry={() => void requests.refetch()} />
  }

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('My Requests')}
        subtitle={t('Quotation requests you have sent to the network')}
        actions={
          mayCreate ? (
            <Button size="md" onClick={() => navigate('/parts-network/send-request')}>
              <Icon name="Plus" size={16} />
              {t('Send Request')}
            </Button>
          ) : null
        }
      />

      {mayCreate ? null : <ReadOnlyNotice message={t('You may view network requests but not send one.')} />}

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Part name or request code')}
          aria-label={t('Search requests')}
          inputSize="sm"
        />
      </label>

      <DataTable
        caption="Network requests sent"
        columns={columns}
        rows={rows}
        rowKey={(r) => rowId(r) ?? r.code}
        loading={requests.isLoading || members.isLoading}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.partName}
              trailing={<NetworkBadge dictionary="requestStatus" value={r.status} />}
            />
            <MobileCardRow label={t('Request')}>{r.code}</MobileCardRow>
            <MobileCardRow label={t('Quantity')}>{r.qty}</MobileCardRow>
            <MobileCardRow label={t('Quotes')}>{r.quotationCount}</MobileCardRow>
          </>
        )}
        empty={
          <EmptyState
            icon="Send"
            title={t(
              (requests.data ?? []).some((r) => r.direction === 'outgoing')
                ? 'No requests match the search'
                : 'No requests sent yet',
            )}
            description={t('Send a part request and the network’s replies will arrive under Quotations.')}
          />
        }
      />
    </>
  )
}

// ── Send a request ──────────────────────────────────────────────────────────
export function PartsNetworkSendRequest() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  /* Read through the seam in this screen's own body: the member picker needs the
   * directory, and it is also what makes this screen data-backed rather than a
   * form floating above nothing. */
  const members = useCollection('partsNetworkMembers')
  const mayCreate = can('network', 'c')

  const { form } = useRequestForm({
    onDone: (partName) => {
      toast.show({ title: t('Request sent to the network'), description: partName })
      navigate('/parts-network/requests')
    },
  })

  if (members.isError) {
    return <ErrorState description={members.error?.message} onRetry={() => void members.refetch()} />
  }

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('Send Request')}
        subtitle={t('Ask the network for a price on a part')}
      />

      <Section title={t('Part Details')}>
        {mayCreate ? (
          <Form form={form}>
            <RequestFields members={members.data ?? []} />
            <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
              {t('Send Request')}
            </button>
          </Form>
        ) : (
          <ReadOnlyNotice message={t('You may view network requests but not send one.')} />
        )}
      </Section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" size="lg" onClick={() => navigate('/parts-network')}>
          {t('Back')}
        </Button>
        {mayCreate ? (
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            <Icon name="Send" size={16} />
            {form.pending ? t('Sending...') : t('Send Request')}
          </Button>
        ) : null}
      </div>
    </>
  )
}

// ── Incoming requests ───────────────────────────────────────────────────────
export function PartsNetworkIncoming() {
  const { t } = usePreferences()
  const { can } = useSession()
  const requests = useCollection('partsNetworkRequests')
  const members = useCollection('partsNetworkMembers')
  const [quoting, setQuoting] = useState<NetworkRequest | null>(null)

  const mayQuote = can('network', 'c')

  /* The Incoming view is a filtered read over the one requests collection, not a
   * table of its own: `direction` already carries the only fact that
   * distinguishes them, so a second table would duplicate rather than add. */
  const rows = useMemo(
    () => (requests.data ?? []).filter((r) => r.direction === 'incoming'),
    [requests.data],
  )

  const columns: Column<NetworkRequest>[] = [
    { header: 'Request', cell: (r) => <span dir="ltr">{r.code}</span> },
    { header: 'From', cell: (r) => r.memberName ?? t('Unknown member') },
    { header: 'Part', cell: (r) => r.partName },
    { header: 'Qty', cell: (r) => r.qty },
    { header: 'Urgency', cell: (r) => <NetworkBadge dictionary="urgency" value={r.urgency} /> },
    { header: 'Status', cell: (r) => <NetworkBadge dictionary="requestStatus" value={r.status} /> },
    { header: 'Needed By', cell: (r) => r.neededBy ?? '—' },
    ...(mayQuote
      ? [
          {
            header: 'Actions',
            cell: (r: NetworkRequest) =>
              r.status === 'open' || r.status === 'quoted' ? (
                <Button size="sm" variant="subtle" onClick={() => setQuoting(r)}>
                  <Icon name="FileText" size={13} />
                  {t('Submit Quotation')}
                </Button>
              ) : null,
          },
        ]
      : []),
  ]

  if (requests.isError) {
    return <ErrorState description={requests.error?.message} onRetry={() => void requests.refetch()} />
  }

  return (
    <>
      <FeatureHeader
        icon="Inbox"
        title={t('Incoming Requests')}
        subtitle={t('Quotation requests other garages have sent you')}
      />

      {mayQuote ? null : (
        <ReadOnlyNotice message={t('You may view incoming requests but not quote on them.')} />
      )}

      <DataTable
        caption="Incoming network requests"
        columns={columns}
        rows={rows}
        rowKey={(r) => rowId(r) ?? r.code}
        loading={requests.isLoading}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.partName}
              trailing={<NetworkBadge dictionary="requestStatus" value={r.status} />}
            />
            <MobileCardRow label={t('From')}>{r.memberName ?? t('Unknown member')}</MobileCardRow>
            <MobileCardRow label={t('Quantity')}>{r.qty}</MobileCardRow>
          </>
        )}
        empty={
          <EmptyState
            icon="Inbox"
            title={t('No incoming requests')}
            description={t('Requests other network members send you appear here.')}
          />
        }
      />

      {quoting ? (
        <QuotationFormModal
          open
          onClose={() => setQuoting(null)}
          request={quoting}
          members={members.data ?? []}
        />
      ) : null}
    </>
  )
}

// ── Quotations ──────────────────────────────────────────────────────────────
export function PartsNetworkQuotations() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const { confirm } = useModal()
  const update = useUpdate('partsNetworkQuotations')
  const quotations = useCollection('partsNetworkQuotations')
  const requests = useCollection('partsNetworkRequests')
  const [busyId, setBusyId] = useState<string | null>(null)

  const mayEdit = can('network', 'e')
  /* Accepting commits money, so it takes approval authority on the module —
   * `a`, not `e`. Under the enforced matrix that is owner, procurement and
   * test: a Branch Manager or a Parts Manager may compare quotes and reject
   * one, but not place the order. */
  const mayAccept = can('network', 'a')

  const requestByRef = useMemo(() => {
    const map = new Map<string, NetworkRequest>()
    for (const r of requests.data ?? []) {
      const id = rowId(r)
      if (id) map.set(id, r)
    }
    return map
  }, [requests.data])

  const rows = quotations.data ?? []
  const failure = useNetworkErrors(quotations, requests)

  const handleAccept = async (quotation: Quotation) => {
    const id = rowId(quotation)
    if (!id || !partsNetwork) return
    const agreed = await confirm({
      title: t('Accept Quotation?'),
      description: t(
        'Accepting places the order with this member and rejects every other quotation on the request.',
      ),
      icon: 'Check',
      confirmLabel: t('Accept & Order'),
      variant: 'lifecycle',
    })
    if (!agreed) return
    setBusyId(id)
    try {
      const result = await partsNetwork.acceptQuotation(id)
      await quotations.refetch()
      await requests.refetch()
      toast.show({
        title: t('Order placed'),
        description: `${result.order.code} — ${quotation.memberName}`,
      })
    } catch (cause) {
      toast.show({
        title: t('Could not accept quotation'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (quotation: Quotation) => {
    const id = rowId(quotation)
    if (!id) return
    setBusyId(id)
    try {
      await update.mutateAsync({ id, patch: { status: 'rejected' } as Partial<Quotation> })
      toast.show({ title: t('Quotation rejected'), description: quotation.memberName })
    } catch (cause) {
      toast.show({
        title: t('Could not update quotation'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const columns: Column<Quotation>[] = [
    { header: 'Quotation', cell: (q) => <span dir="ltr">{q.code}</span> },
    {
      header: 'Request',
      cell: (q) => {
        const request = requestByRef.get(q.requestId)
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-heading">{request?.partName ?? t('Unknown request')}</span>
            {request ? (
              <span className="text-[12px] text-muted" dir="ltr">
                {request.code}
              </span>
            ) : null}
          </div>
        )
      },
    },
    { header: 'Member', cell: (q) => q.memberName },
    { header: 'Unit Price', cell: (q) => <span dir="ltr">{q.unitPrice}</span> },
    { header: 'Available', cell: (q) => q.qtyAvailable },
    { header: 'Lead Time', cell: (q) => (q.leadTimeDays == null ? '—' : `${q.leadTimeDays} ${t('days')}`) },
    { header: 'Condition', cell: (q) => <NetworkBadge dictionary="condition" value={q.condition} /> },
    { header: 'Status', cell: (q) => <NetworkBadge dictionary="quotationStatus" value={q.status} /> },
    ...(mayAccept || mayEdit
      ? [
          {
            header: 'Actions',
            cell: (q: Quotation) =>
              q.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  {mayAccept && CAN_ACCEPT_LIVE ? (
                    <Button
                      size="sm"
                      onClick={() => void handleAccept(q)}
                      disabled={busyId === rowId(q)}
                    >
                      <Icon name="Check" size={13} />
                      {t('Accept & Order')}
                    </Button>
                  ) : null}
                  {mayEdit ? (
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => void handleReject(q)}
                      disabled={busyId === rowId(q)}
                    >
                      <Icon name="X" size={13} />
                      {t('Reject')}
                    </Button>
                  ) : null}
                </div>
              ) : null,
          },
        ]
      : []),
  ]

  if (failure) return <ErrorState description={failure} onRetry={() => void quotations.refetch()} />

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Quotations')}
        subtitle={t('Compare quotes received from the network')}
      />

      {mayAccept && !CAN_ACCEPT_LIVE ? (
        <ReadOnlyNotice
          message={t(
            'Accepting a quotation places the order and rejects the others in one server transaction, so it needs a live connection.',
          )}
        />
      ) : null}
      {mayAccept ? null : (
        <ReadOnlyNotice message={t('Placing an order against a quotation needs approval authority on the network.')} />
      )}

      <Section title={t('Quotations')}>
        <DataTable
          caption="Network quotations"
          columns={columns}
          rows={rows}
          rowKey={(q) => rowId(q) ?? q.code}
          loading={quotations.isLoading || requests.isLoading}
          mobileCard={(q) => (
            <>
              <MobileCardHeader
                title={q.memberName}
                trailing={<NetworkBadge dictionary="quotationStatus" value={q.status} />}
              />
              <MobileCardRow label={t('Unit Price')}>{q.unitPrice}</MobileCardRow>
              <MobileCardRow label={t('Available')}>{q.qtyAvailable}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileText"
              title={t('No quotations yet')}
              description={t('Quotes appear here once a member answers one of your requests.')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── Orders ──────────────────────────────────────────────────────────────────
export function PartsNetworkOrders() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const update = useUpdate('partsNetworkOrders')
  const orders = useCollection('partsNetworkOrders')
  const [busyId, setBusyId] = useState<string | null>(null)

  const mayEdit = can('network', 'e')
  const rows = orders.data ?? []

  const stats: Stat[] = [
    { label: 'Orders', value: rows.length, caption: 'All records', highlight: true },
    {
      label: 'In Transit',
      value: rows.filter((o) => o.status === 'shipped').length,
      caption: 'Shipped, not received',
      tone: 'info',
    },
    {
      label: 'Awaiting Dispatch',
      value: rows.filter((o) => o.status === 'placed').length,
      caption: 'Placed',
      tone: rows.some((o) => o.status === 'placed') ? 'warning' : 'info',
    },
    {
      label: 'Received',
      value: rows.filter((o) => o.status === 'received').length,
      caption: 'Completed',
    },
  ]

  const move = async (order: NetworkOrder, status: NetworkOrder['status'], message: string) => {
    const id = rowId(order)
    if (!id) return
    setBusyId(id)
    try {
      await update.mutateAsync({ id, patch: { status } as Partial<NetworkOrder> })
      toast.show({ title: t(message), description: order.code })
    } catch (cause) {
      toast.show({
        title: t('Could not update order'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const columns: Column<NetworkOrder>[] = [
    { header: 'Order', cell: (o) => <span dir="ltr">{o.code}</span> },
    { header: 'Member', cell: (o) => o.memberName },
    { header: 'Part', cell: (o) => o.partName },
    { header: 'Qty', cell: (o) => o.qty },
    { header: 'Total', cell: (o) => <span dir="ltr">{o.total}</span> },
    {
      header: 'Direction',
      cell: (o) => (
        <span className="text-[13px] text-body">
          {t(o.direction === 'outbound' ? 'We buy' : 'We fulfil')}
        </span>
      ),
    },
    { header: 'Status', cell: (o) => <NetworkBadge dictionary="orderStatus" value={o.status} /> },
    { header: 'Expected', cell: (o) => o.expectedAt ?? '—' },
    {
      header: 'Tracking',
      cell: (o) =>
        o.trackingRef ? (
          <span dir="ltr" className="font-mono text-[12px] text-body">
            {o.trackingRef}
          </span>
        ) : (
          '—'
        ),
    },
    ...(mayEdit
      ? [
          {
            header: 'Actions',
            cell: (o: NetworkOrder) => (
              <div className="flex items-center gap-2">
                {o.status === 'placed' ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void move(o, 'shipped', 'Order marked as shipped')}
                    disabled={busyId === rowId(o)}
                  >
                    <Icon name="Truck" size={13} />
                    {t('Mark Shipped')}
                  </Button>
                ) : null}
                {o.status === 'shipped' ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void move(o, 'received', 'Order marked as received')}
                    disabled={busyId === rowId(o)}
                  >
                    <Icon name="Check" size={13} />
                    {t('Mark Received')}
                  </Button>
                ) : null}
                {o.status === 'placed' || o.status === 'shipped' ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void move(o, 'cancelled', 'Order cancelled')}
                    disabled={busyId === rowId(o)}
                  >
                    <Icon name="X" size={13} />
                    {t('Cancel')}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ]

  if (orders.isError) {
    return <ErrorState description={orders.error?.message} onRetry={() => void orders.refetch()} />
  }

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Orders')}
        subtitle={t('Parts ordered through the network')}
      />

      <StatRow stats={stats} />

      {mayEdit ? null : <ReadOnlyNotice message={t('You may view network orders but not update them.')} />}

      <DataTable
        caption="Network orders"
        columns={columns}
        rows={rows}
        rowKey={(o) => rowId(o) ?? o.code}
        loading={orders.isLoading}
        mobileCard={(o) => (
          <>
            <MobileCardHeader
              title={o.partName}
              trailing={<NetworkBadge dictionary="orderStatus" value={o.status} />}
            />
            <MobileCardRow label={t('Member')}>{o.memberName}</MobileCardRow>
            <MobileCardRow label={t('Total')}>{o.total}</MobileCardRow>
          </>
        )}
        empty={
          <EmptyState
            icon="ShoppingCart"
            title={t('No network orders yet')}
            description={t('Accepting a quotation places an order, and it appears here.')}
          />
        }
      />
    </>
  )
}

// ── Members ─────────────────────────────────────────────────────────────────
export function PartsNetworkMembers() {
  const { t } = usePreferences()
  const { can } = useSession()
  const members = useCollection('partsNetworkMembers')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Member | null>(null)
  const [creating, setCreating] = useState(false)

  const mayCreate = can('network', 'c')
  const mayEdit = can('network', 'e')

  const rows = useMemo(() => {
    const all = members.data ?? []
    const needle = query.trim().toLowerCase()
    if (!needle) return all
    return all.filter(
      (m) =>
        m.name.toLowerCase().includes(needle) ||
        (m.city ?? '').toLowerCase().includes(needle) ||
        (m.contactName ?? '').toLowerCase().includes(needle),
    )
  }, [members.data, query])

  const columns: Column<Member>[] = [
    { header: 'Code', cell: (m) => <span dir="ltr">{m.code}</span> },
    {
      header: 'Member',
      cell: (m) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-heading">{m.name}</span>
          {m.city ? <span className="text-[12px] text-muted">{m.city}</span> : null}
        </div>
      ),
    },
    { header: 'Type', cell: (m) => <NetworkBadge dictionary="memberKind" value={m.kind} /> },
    {
      header: 'Contact',
      cell: (m) => (
        <div className="flex flex-col gap-0.5">
          <span>{m.contactName ?? '—'}</span>
          {m.contactPhone ? (
            <span className="text-[12px] text-muted" dir="ltr">
              {m.contactPhone}
            </span>
          ) : null}
        </div>
      ),
    },
    { header: 'Rating', cell: (m) => <MemberRating rating={m.rating} /> },
    { header: 'Status', cell: (m) => <NetworkBadge dictionary="memberStatus" value={m.status} /> },
    {
      /* Whether this member is also a vendor of record, which is the whole point
       * of the `suppliers` link: the same company, related rather than
       * duplicated. */
      header: 'Vendor',
      cell: (m) =>
        m.supplierId ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-body">
            <Icon name="Link" size={13} className="text-salis-blue" />
            {t('Linked')}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    ...(mayEdit
      ? [
          {
            header: 'Actions',
            cell: (m: Member) => (
              <Button size="sm" variant="subtle" onClick={() => setEditing(m)}>
                <Icon name="Pencil" size={13} />
                {t('Edit')}
              </Button>
            ),
          },
        ]
      : []),
  ]

  if (members.isError) {
    return <ErrorState description={members.error?.message} onRetry={() => void members.refetch()} />
  }

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Network Members')}
        subtitle={t('Garages, dealers, stores and suppliers you can trade with')}
        actions={
          mayCreate ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Member')}
            </Button>
          ) : null
        }
      />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Member, city or contact')}
          aria-label={t('Search network members')}
          inputSize="sm"
        />
      </label>

      <DataTable
        caption="Network members"
        columns={columns}
        rows={rows}
        rowKey={(m) => rowId(m) ?? m.code}
        loading={members.isLoading}
        mobileCard={(m) => (
          <>
            <MobileCardHeader
              title={m.name}
              trailing={<NetworkBadge dictionary="memberStatus" value={m.status} />}
            />
            <MobileCardRow label={t('Type')}>
              <NetworkBadge dictionary="memberKind" value={m.kind} />
            </MobileCardRow>
            <MobileCardRow label={t('City')}>{m.city ?? '—'}</MobileCardRow>
          </>
        )}
        empty={
          <EmptyState
            icon="Building2"
            title={t(
              (members.data ?? []).length === 0 ? 'No network members yet' : 'No members match the search',
            )}
            description={t('Add the garages, dealers and suppliers you source parts from.')}
          />
        }
      />

      {creating ? <MemberFormModal open onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <MemberFormModal open onClose={() => setEditing(null)} existingRecord={editing} />
      ) : null}
    </>
  )
}

// ── Parts supply network (partners, fulfilment, shipments) ───────────────────
/** The group-buying and fulfilment view over the same four collections. The
 *  design's fourth tab was partner *warehouse stock*, which would need to read
 *  another organization's inventory — exactly the cross-tenant read this
 *  architecture does not support and this change refused to fake — so it is
 *  gone rather than rendered empty for ever. The three tabs that remain are all
 *  real. */
export function PartsSupplyNetwork() {
  const { t } = usePreferences()
  const members = useCollection('partsNetworkMembers')
  const orders = useCollection('partsNetworkOrders')
  const [tab, setTab] = useState('partners')

  const tabs = [
    { id: 'partners', label: 'Network Partners', icon: 'Users' },
    { id: 'fulfillment', label: 'Fulfillment Orders', icon: 'Package' },
    { id: 'shipments', label: 'Shipments', icon: 'Truck' },
  ]

  const memberRows = members.data ?? []
  const orderRows = orders.data ?? []
  /* Fulfilment is what this workshop supplies to the network — the `inbound`
   * direction — and shipments are whatever is on the road in either. */
  const fulfilment = orderRows.filter((o) => o.direction === 'inbound')
  const shipments = orderRows.filter((o) => o.status === 'shipped')
  const failure = useNetworkErrors(members, orders)

  const orderColumns: Column<NetworkOrder>[] = [
    { header: 'Order', cell: (o) => <span dir="ltr">{o.code}</span> },
    { header: 'Member', cell: (o) => o.memberName },
    { header: 'Part', cell: (o) => o.partName },
    { header: 'Qty', cell: (o) => o.qty },
    { header: 'Total', cell: (o) => <span dir="ltr">{o.total}</span> },
    { header: 'Status', cell: (o) => <NetworkBadge dictionary="orderStatus" value={o.status} /> },
    { header: 'Expected', cell: (o) => o.expectedAt ?? '—' },
  ]

  const orderTable = (rows: readonly NetworkOrder[], caption: string, emptyTitle: string, icon: string) => (
    <DataTable
      caption={caption}
      columns={orderColumns}
      rows={rows}
      rowKey={(o) => rowId(o) ?? o.code}
      loading={orders.isLoading}
      mobileCard={(o) => (
        <>
          <MobileCardHeader
            title={o.partName}
            trailing={<NetworkBadge dictionary="orderStatus" value={o.status} />}
          />
          <MobileCardRow label={t('Member')}>{o.memberName}</MobileCardRow>
          <MobileCardRow label={t('Total')}>{o.total}</MobileCardRow>
        </>
      )}
      empty={<EmptyState icon={icon} title={t(emptyTitle)} />}
    />
  )

  if (failure) return <ErrorState description={failure} onRetry={() => void orders.refetch()} />

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Supply Network')}
        subtitle={t('Network partners, fulfilment and shipment tracking')}
      />

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      <StatRow
        stats={[
          {
            label: 'Partners',
            value: memberRows.filter((m) => m.status === 'active').length,
            caption: 'Connected',
            highlight: true,
          },
          {
            label: 'Open Fulfilments',
            value: fulfilment.filter((o) => o.status !== 'received' && o.status !== 'cancelled').length,
            caption: 'In progress',
            tone: 'info',
          },
          { label: 'In Transit', value: shipments.length, caption: 'Shipments', tone: 'info' },
          {
            label: 'Suppliers Linked',
            value: memberRows.filter((m) => m.supplierId !== null).length,
            caption: 'Also vendors of record',
          },
        ]}
      />

      {tab === 'partners' && (
        <Section title={t('Network Partners')}>
          <DataTable
            caption="Network partners"
            columns={[
              { header: 'Code', cell: (m: Member) => <span dir="ltr">{m.code}</span> },
              { header: 'Partner', cell: (m: Member) => m.name },
              { header: 'Type', cell: (m: Member) => <NetworkBadge dictionary="memberKind" value={m.kind} /> },
              { header: 'City', cell: (m: Member) => m.city ?? '—' },
              { header: 'Rating', cell: (m: Member) => <MemberRating rating={m.rating} /> },
              { header: 'Status', cell: (m: Member) => <NetworkBadge dictionary="memberStatus" value={m.status} /> },
            ]}
            rows={memberRows}
            rowKey={(m) => rowId(m) ?? m.code}
            loading={members.isLoading}
            mobileCard={(m) => (
              <>
                <MobileCardHeader
                  title={m.name}
                  trailing={<NetworkBadge dictionary="memberStatus" value={m.status} />}
                />
                <MobileCardRow label={t('City')}>{m.city ?? '—'}</MobileCardRow>
              </>
            )}
            empty={<EmptyState icon="Users" title={t('No network partners')} />}
          />
        </Section>
      )}
      {tab === 'fulfillment' && (
        <Section
          title={t('Fulfillment Orders')}
          subtitle={t('Orders this workshop is supplying to other members')}
        >
          {orderTable(fulfilment, 'Fulfilment orders', 'No fulfillment orders', 'Package')}
        </Section>
      )}
      {tab === 'shipments' && (
        <Section title={t('Shipments')}>
          {orderTable(shipments, 'Network shipments', 'No shipments in transit', 'Truck')}
        </Section>
      )}
    </>
  )
}
