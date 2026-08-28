import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, queryKeys } from '@/data/useCollection'
import { can, canApprove } from '@/data/rbac'
import {
  isLive,
  productReports,
  type InsuranceClaimRow,
  type InsurancePolicyRow,
} from '@/data/repository'
import { lifecycle, claimActionFailureMessage, isSodRefusal } from './api'
import { ConnectApi, ProvenanceNote, StatCard, StatusPill } from './bits'
import { LoansPanel, PoliciesPanel } from './ProductBrowsing'

/** The insurance workspace (`Insurance-Claims`, `/insurance-claims`).
 *
 *  Three surfaces the back-office finance roles work from: the claims list with
 *  its full lifecycle (submit → approve/reject → pay), and the policies and
 *  loan book as read-only context. The collections are gated on the `accounting`
 *  module server-side — there is no `insurance` module in the matrix yet — so
 *  the audience is whoever holds accounting, and the write gates below read that
 *  module. The server is the boundary and re-checks every action, including the
 *  approval ceiling and the segregation-of-duties rule the client cannot see.
 *
 *  Provenance: this is a feature-map screen with a spec and a screenshot but no
 *  pixel design, so the layout follows the design system rather than a
 *  prototype. See `./bits`.
 */

const CLAIM_STATUSES: readonly InsuranceClaimRow['status'][] = [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'paid',
]

type Tab = 'claims' | 'policies' | 'loans'

export function InsuranceClaims() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<Tab>('claims')

  const tabs: readonly [Tab, string, string][] = [
    ['claims', 'Claims', 'ShieldAlert'],
    ['policies', 'Policies', 'ShieldCheck'],
    ['loans', 'Loans', 'Banknote'],
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div>
        <h1 className="font-display text-2xl font-black text-heading">{t('Insurance & Finance')}</h1>
        <p className="mt-1 text-sm text-muted">
          {t('Claims, policies and the auto-loan book')}
        </p>
      </div>
      <ProvenanceNote />

      <ChipGroup label={t('Section')}>
        {tabs.map(([key, label]) => (
          <Chip key={key} label={t(label)} selected={tab === key} onToggle={() => setTab(key)} />
        ))}
      </ChipGroup>

      {tab === 'claims' ? <ClaimsPanel /> : tab === 'policies' ? <PoliciesPanel /> : <LoansPanel />}
    </div>
  )
}

// ── Claims ───────────────────────────────────────────────────────────────────

function ClaimsPanel() {
  const { t } = usePreferences()
  const { role } = useSession()
  const claims = useCollection('insuranceClaims')
  const [filter, setFilter] = useState<'all' | InsuranceClaimRow['status']>('all')
  const [selected, setSelected] = useState<InsuranceClaimRow | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const summary = useQuery({
    queryKey: ['insurance', 'claims', 'summary'],
    queryFn: () => productReports!.insuranceClaimsSummary(),
    enabled: Boolean(productReports),
    retry: false,
  })

  const rows = (claims.data ?? []) as readonly InsuranceClaimRow[]
  const shown = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  )

  const canCreate = can('accounting', 'c', role)

  if (!isLive) {
    return (
      <div className="flex flex-col gap-4">
        <ConnectApi
          icon="ShieldAlert"
          title="No claims to show"
          description="Insurance claims and their lifecycle live on the server. The fixture build has none, and a claim decision cannot be faked — connect a live API to file and settle claims."
          collection="insuranceClaims"
        />
      </div>
    )
  }

  if (claims.isLoading) return <Loading label="Loading claims..." />
  if (claims.isError) {
    return <ErrorState description={claims.error?.message} onRetry={() => void claims.refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      {productReports && summary.data ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard icon="FileText" value={String(summary.data.count)} label="Claims" />
          <StatCard
            icon="ShieldAlert"
            value={<Money sar={summary.data.claimedHalalas / 100} bare className="text-lg" />}
            label="Claimed"
          />
          <StatCard
            icon="CheckCircle"
            value={<Money sar={summary.data.approvedHalalas / 100} bare className="text-lg" />}
            label="Approved"
          />
          <StatCard
            icon="Banknote"
            value={<Money sar={summary.data.paidHalalas / 100} bare className="text-lg" />}
            label="Paid"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChipGroup label={t('Filter by status')}>
          {(['all', ...CLAIM_STATUSES] as const).map((key) => (
            <Chip key={key} label={key === 'all' ? t('All') : t(key.replace(/_/g, ' '))} selected={filter === key} onToggle={() => setFilter(key)} />
          ))}
        </ChipGroup>
        <Button
          size="sm"
          onClick={() => setSubmitting(true)}
          disabled={!canCreate}
          title={canCreate ? undefined : t('Your role cannot file claims')}
        >
          <Icon name="Plus" size={14} />
          {t('New claim')}
        </Button>
      </div>

      {shown.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="ShieldCheck"
            title={t('No claims here')}
            description={
              filter === 'all'
                ? t('No claims have been filed yet. File one to start the lifecycle.')
                : t('No claims match this status.')
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="m-0 flex list-none flex-col p-0">
            {shown.map((claim, index) => (
              <li
                key={claim._id ?? `${claim.claimNumber}-${index}`}
                className={
                  'flex flex-wrap items-start gap-3 p-3.5 sm:flex-nowrap ' +
                  (index ? 'border-0 border-t border-solid border-border' : '')
                }
              >
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-tint-blue text-salis-blue">
                  <Icon name="ShieldAlert" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
                      {claim.claimNumber}
                    </span>
                    <StatusPill value={claim.status} />
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-heading">
                    <span dir="ltr">{claim.vehicleLabel}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {t('Policy')}{' '}
                    <span className="font-mono" dir="ltr">
                      {claim.policyNumber}
                    </span>
                  </p>
                </div>
                <div className="min-w-[120px] flex-shrink-0 text-end">
                  <Money sar={claim.amountClaimedHalalas / 100} className="text-sm font-extrabold text-heading" />
                  <p className="mt-0.5 text-[11px] text-muted">
                    {claim.amountApprovedHalalas != null
                      ? `${t('Approved')} ${formatSar(claim.amountApprovedHalalas / 100)}`
                      : t('Claimed')}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <Button variant="outline" size="sm" onClick={() => setSelected(claim)}>
                    {t('Open')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {selected ? (
        <ClaimDetail claim={selected} onClose={() => setSelected(null)} />
      ) : null}
      {submitting ? <SubmitClaim onClose={() => setSubmitting(false)} /> : null}
    </div>
  )
}

// ── Claim detail + lifecycle ─────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
        {t(label)}
      </span>
      <span className="min-w-0 text-end text-[13px] text-heading">{children}</span>
    </div>
  )
}

function ClaimDetail({ claim, onClose }: { claim: InsuranceClaimRow; onClose: () => void }) {
  const { t } = usePreferences()
  const { role, userName } = useSession()
  const toast = useToast()
  const client = useQueryClient()

  const claimedSar = claim.amountClaimedHalalas / 100
  const [approvedInput, setApprovedInput] = useState(formatSar(claimedSar, { bare: true }))
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<null | 'approve' | 'reject' | 'pay'>(null)

  const isOpenForDecision = claim.status === 'submitted' || claim.status === 'under_review'
  const isApproved = claim.status === 'approved'
  const iSubmitted = Boolean(claim.submittedBy) && claim.submittedBy === userName

  // UX gates — the server re-checks all three. `accounting` is the gating module
  // (there is no `insurance` one yet): create/decide read it, and the approval
  // ceiling is folded into `canApprove` so an over-ceiling signer sees the
  // reason rather than a button that 403s.
  const mayApprove = canApprove(role, claimedSar, 'accounting')
  const mayDecide = can('accounting', 'a', role)
  const mayPay = can('accounting', 'e', role)

  const approvedHalalas = Math.round(parseSar(approvedInput) * 100)
  const approvedValid = approvedHalalas > 0 && approvedHalalas <= claim.amountClaimedHalalas

  function done(row: InsuranceClaimRow, title: string) {
    void client.invalidateQueries({ queryKey: queryKeys.all('insuranceClaims') })
    void client.invalidateQueries({ queryKey: ['insurance', 'claims', 'summary'] })
    toast.show({ title: t(title), description: `${row.claimNumber}` })
    onClose()
  }

  function fail(cause: unknown, title: string) {
    toast.show({
      title: isSodRefusal(cause) ? t('Segregation of duties') : t(title),
      description: claimActionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
      error: true,
    })
  }

  async function approve() {
    if (!approvedValid) return
    setBusy('approve')
    try {
      const row = await lifecycle.approve(claim._id ?? claim.claimNumber, approvedHalalas)
      done(row, 'Claim approved')
    } catch (cause) {
      fail(cause, 'Approval failed')
    } finally {
      setBusy(null)
    }
  }

  async function reject() {
    if (!reason.trim()) return
    setBusy('reject')
    try {
      const row = await lifecycle.reject(claim._id ?? claim.claimNumber, reason.trim())
      done(row, 'Claim rejected')
    } catch (cause) {
      fail(cause, 'Rejection failed')
    } finally {
      setBusy(null)
    }
  }

  async function pay() {
    setBusy('pay')
    try {
      const row = await lifecycle.pay(claim._id ?? claim.claimNumber)
      done(row, 'Claim paid')
    } catch (cause) {
      fail(cause, 'Payment failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="lifecycle"
      icon="ShieldAlert"
      title={claim.claimNumber}
      meta={<StatusPill value={claim.status} />}
      dismissible={busy === null}
    >
      <div className="flex flex-col divide-y divide-border">
        <div className="pb-1">
          <Row label="Policy">
            <span className="font-mono" dir="ltr">
              {claim.policyNumber}
            </span>
          </Row>
          <Row label="Vehicle">
            <span dir="ltr">{claim.vehicleLabel}</span>
          </Row>
          <Row label="Incident">
            <span dir="ltr">{claim.incidentDate}</span>
          </Row>
          <Row label="Claimed">
            <Money sar={claimedSar} className="font-bold" />
          </Row>
          {claim.amountApprovedHalalas != null ? (
            <Row label="Approved">
              <Money sar={claim.amountApprovedHalalas / 100} className="font-bold" />
            </Row>
          ) : null}
          {claim.submittedBy ? <Row label="Submitted by">{claim.submittedBy}</Row> : null}
          {claim.approvedBy ? <Row label="Approved by">{claim.approvedBy}</Row> : null}
        </div>

        {claim.description ? (
          <p className="py-2.5 text-[13px] leading-relaxed text-body">{claim.description}</p>
        ) : null}

        {isOpenForDecision ? (
          <div className="flex flex-col gap-3 pt-3">
            {iSubmitted ? (
              <p
                role="note"
                className="flex items-start gap-2 rounded-lg border border-salis-orange/[.28] bg-salis-orange/[.07] p-2.5 text-[12px] leading-relaxed text-body"
              >
                <Icon name="AlertTriangle" size={14} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                {t(
                  'You submitted this claim, so it needs a different approver. The server refuses an approval by the submitter.',
                )}
              </p>
            ) : (
              <p className="text-[11px] text-muted">
                {t(
                  'Approval is checked against your ceiling and the submitter, server-side. An approved amount cannot exceed the claim.',
                )}
              </p>
            )}

            {mayApprove ? (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="approved-amount"
                  className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted"
                >
                  {t('Approved amount (SAR)')}
                </label>
                <Input
                  id="approved-amount"
                  inputSize="md"
                  inputMode="decimal"
                  dir="ltr"
                  value={approvedInput}
                  invalid={!approvedValid}
                  disabled={busy !== null}
                  onChange={(e) => setApprovedInput(e.target.value)}
                />
                {!approvedValid ? (
                  <span className="text-[11px] text-salis-orange">
                    {t('Enter an amount between 0 and the claimed figure.')}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reject-reason"
                className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted"
              >
                {t('Rejection reason')}
              </label>
              <Textarea
                id="reject-reason"
                rows={2}
                value={reason}
                disabled={busy !== null}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('Required to reject')}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-salis-orange/[.4] text-salis-orange hover:bg-salis-orange/[.07]"
                onClick={() => void reject()}
                disabled={busy !== null || !mayDecide || !reason.trim()}
                title={mayDecide ? undefined : t('Your role cannot decide claims')}
              >
                {t(busy === 'reject' ? 'Saving...' : 'Reject')}
              </Button>
              <Button
                size="sm"
                onClick={() => void approve()}
                disabled={busy !== null || !mayApprove || !approvedValid}
                title={mayApprove ? undefined : t('Above your approval ceiling, or your role cannot approve')}
              >
                <Icon name="Check" size={13} />
                {t(busy === 'approve' ? 'Saving...' : 'Approve')}
              </Button>
            </div>
          </div>
        ) : isApproved ? (
          <div className="flex flex-col gap-3 pt-3">
            <p className="text-[11px] text-muted">
              {t('Approved and awaiting settlement. Paying releases the approved amount.')}
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => void pay()}
                disabled={busy !== null || !mayPay}
                title={mayPay ? undefined : t('Your role cannot settle claims')}
              >
                <Icon name="Banknote" size={13} />
                {t(busy === 'pay' ? 'Saving...' : 'Pay claim')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="pt-3 text-[12px] text-muted">
            {claim.status === 'paid'
              ? t('This claim has been paid. The lifecycle is complete.')
              : t('This claim was rejected. The lifecycle is complete.')}
          </p>
        )}
      </div>
    </Modal>
  )
}

// ── Submit a claim ───────────────────────────────────────────────────────────

function SubmitClaim({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const policies = useCollection('insurancePolicies')

  const [policyId, setPolicyId] = useState('')
  const [amount, setAmount] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const policyRows = (policies.data ?? []) as readonly InsurancePolicyRow[]
  const amountHalalas = Math.round(parseSar(amount) * 100)
  const valid = Boolean(policyId) && amountHalalas > 0 && Boolean(incidentDate) && description.trim().length > 0

  const chosen = policyRows.find((p) => (p._id ?? p.policyNumber) === policyId)

  async function submit() {
    if (!valid) return
    setBusy(true)
    try {
      const row = await lifecycle.submit({
        policyId,
        vehicleId: chosen?.vehicleId ?? undefined,
        vehicleLabel: chosen?.vehicleLabel,
        amountClaimedHalalas: amountHalalas,
        incidentDate,
        description: description.trim(),
      })
      void client.invalidateQueries({ queryKey: queryKeys.all('insuranceClaims') })
      void client.invalidateQueries({ queryKey: ['insurance', 'claims', 'summary'] })
      toast.show({ title: t('Claim filed'), description: `${row.claimNumber}` })
      onClose()
    } catch (cause) {
      toast.show({
        title: t('Could not file the claim'),
        description: claimActionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="crud"
      icon="FilePlus"
      title="File a claim"
      dismissible={!busy}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => void submit()} disabled={!valid || busy}>
            {t(busy ? 'Filing...' : 'File claim')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="claim-policy" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Policy')}
        </label>
        <Select
          id="claim-policy"
          value={policyId}
          disabled={busy || policyRows.length === 0}
          onChange={(e) => setPolicyId(e.target.value)}
          aria-label={t('Policy')}
          className="h-11 w-full bg-inset px-3.5 font-action text-sm transition-all duration-200 focus:bg-card disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{t('Select a policy')}</option>
          {policyRows.map((p) => (
            <option key={p._id ?? p.policyNumber} value={p._id ?? p.policyNumber}>
              {p.policyNumber} — {p.holder} ({p.vehicleLabel})
            </option>
          ))}
        </Select>
        {policyRows.length === 0 ? (
          <span className="text-[11px] text-muted">
            {t('No policies are loaded to file against.')}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="claim-amount" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Amount claimed (SAR)')}
        </label>
        <Input
          id="claim-amount"
          inputSize="md"
          inputMode="decimal"
          dir="ltr"
          value={amount}
          disabled={busy}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="claim-incident" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Incident date')}
        </label>
        <Input
          id="claim-incident"
          type="date"
          inputSize="md"
          dir="ltr"
          value={incidentDate}
          disabled={busy}
          onChange={(e) => setIncidentDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="claim-desc" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Description')}
        </label>
        <Textarea
          id="claim-desc"
          rows={3}
          value={description}
          disabled={busy}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('What happened')}
        />
      </div>
    </Modal>
  )
}
