import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Money, SummaryRow, parseSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, useEntity, type RowOf } from '@/data/useCollection'
import { useQuery } from '@tanstack/react-query'
import { estimateOtp, type RepositoryError } from '@/data/repository'
import {
  fetchEstimateLines,
  isExternalDependency,
  transitionFailureMessage,
  type EstimateLineRow,
} from './api'

type Line = RowOf<'approvalLines'> & { _id?: string }

/** The live estimate row carries the VAT split and the expiry date the
 *  server now exposes (F-029, and `validUntil` wired for this screen); the
 *  fixture row carries only the pre-formatted `amount`, so every added
 *  field is optional and the totals fall back to the grand total alone —
 *  the same degradation `EstimateDetail` uses for the same record. */
type Estimate = RowOf<'estimates'> & {
  _id?: string
  totalHalalas?: number
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  validUntil?: string | null
}

/** The one-time-code step's state. `unavailable` is the honest §40 state: SMS is
 *  an external dependency and `request-approval-otp` refuses with a 503 until a
 *  provider is configured — the screen says so rather than reporting a code as
 *  sent that was not. */
type OtpState =
  | { kind: 'idle' }
  | { kind: 'requesting' }
  | { kind: 'sent'; destination: string }
  | { kind: 'verifying' }
  | { kind: 'verified' }
  | { kind: 'rejected'; reason: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; message: string }

const URGENCY_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  critical: { bg: 'rgba(249,115,22,.13)', fg: 'var(--salis-orange)', label: 'Critical' },
  due: { bg: 'rgba(11,179,255,.13)', fg: 'var(--salis-blue-bright)', label: 'Due now' },
  advisory: { bg: 'rgba(100,116,139,.13)', fg: 'var(--text-muted)', label: 'Advisory' },
}

function Header({ estimate }: { estimate?: Estimate }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-salis-gradient text-white">
        <Icon name="Car" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-extrabold text-heading">SALIS AUTO</p>
        <p className="truncate text-[11px] text-muted">
          {estimate ? `${estimate.cust} · ${estimate.veh}` : `${t('Riyadh Main')} · ${t('Service Advisor')}`}
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tint-blue px-2.5 py-1 font-action text-[11px] font-semibold text-salis-blue">
        <Icon name="ShieldCheck" size={12} />
        {t('Secure link')}
      </span>
    </div>
  )
}

/** Customer approval — the work the customer reviews before authorising it.
 *
 *  Given `?estimate=<id or code>`, this reads the exact estimate an advisor
 *  raised — `GET /estimates/:id` directly (not a search over a paginated
 *  list, which a specific id might not be on), its real line items
 *  (`GET /estimates/:id/lines`) and its real server-computed subtotal/VAT/
 *  total (never re-derived here — §5b). It also reads the expiry
 *  (`validUntil`) and whether it has already been decided, and refuses the
 *  one-time-code step on either rather than taking a signature that would
 *  settle nothing.
 *
 *  The one-time-code e-signature (`POST /estimates/:id/request-approval-otp`
 *  / `/verify-approval-otp`, DF-007) is deliberately **not** gated on the
 *  estimate details having loaded: those endpoints act on the server's own
 *  record by id, and a client that failed to fetch the summary (a stale
 *  cache, a slow network) has not thereby lost the ability to sign — it has
 *  only lost the preview. The estimate panel and the summary degrade to an
 *  honest "could not load the details" note in that case; the signature
 *  step stays live.
 *
 *  Without `?estimate=`, this is the legacy "no estimate on hand" state:
 *  generic `approvalLines` data with a note that no total can be shown,
 *  kept for the coverage that already pins it (`workshop-approval-gaps.
 *  test.tsx`, the golden path `customer-estimate-approval.spec.ts`). */
export function CustomerApproval() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()
  const estimateId = params.get('estimate') ?? undefined

  const approvalLines = useCollection('approvalLines')
  const genericRows = (approvalLines.data ?? []) as readonly Line[]

  const estimateQuery = useEntity('estimates', estimateId)
  const estimate = estimateQuery.data as Estimate | undefined
  const ref = estimate?._id ?? estimate?.id

  const lines = useQuery<{ rows: EstimateLineRow[] }, RepositoryError>({
    queryKey: ['estimate-lines', ref],
    queryFn: () => fetchEstimateLines(ref as string),
    enabled: Boolean(ref),
    retry: false,
  })

  const amount = useMemo(() => {
    if (!estimate) return 0
    return estimate.totalHalalas != null ? estimate.totalHalalas / 100 : parseSar(estimate.amount)
  }, [estimate])

  const decided = estimate?.status === 'approved' || estimate?.status === 'rejected'
  const expired = Boolean(
    estimate?.validUntil && new Date(estimate.validUntil).getTime() < Date.now(),
  )

  /* The id to sign against: the estimate's own id once resolved, else the id
   * the link carried — the OTP endpoints take either (ULID or code) and
   * resolve it server-side themselves. */
  const otpTarget = ref ?? estimateId
  const otpReady = Boolean(estimateOtp) && Boolean(otpTarget) && !decided && !expired
  const [otp, setOtp] = useState<OtpState>({ kind: 'idle' })
  const [code, setCode] = useState('')

  async function requestCode() {
    if (!estimateOtp || !otpTarget) return
    setOtp({ kind: 'requesting' })
    try {
      const res = await estimateOtp.request(otpTarget)
      setOtp({ kind: 'sent', destination: res.destination })
    } catch (cause) {
      if (isExternalDependency(cause)) {
        setOtp({ kind: 'unavailable', message: (cause as RepositoryError).message })
      } else {
        setOtp({ kind: 'error', message: transitionFailureMessage(cause, t('Something went wrong.')) })
      }
    }
  }

  async function verifyCode() {
    if (!estimateOtp || !otpTarget) return
    setOtp({ kind: 'verifying' })
    try {
      const res = await estimateOtp.verify(otpTarget, code)
      if (res.verified) {
        setOtp({ kind: 'verified' })
        /* The signature just landed on the estimate row (customerSignedAt);
         * refetch so this screen shows it without a reload. */
        void estimateQuery.refetch()
      } else {
        setOtp({ kind: 'rejected', reason: res.reason ?? t('The code did not match.') })
      }
    } catch (cause) {
      if (isExternalDependency(cause)) {
        setOtp({ kind: 'unavailable', message: (cause as RepositoryError).message })
      } else {
        setOtp({ kind: 'error', message: transitionFailureMessage(cause, t('Something went wrong.')) })
      }
    }
  }

  /* ── no estimate link: the legacy generic-lines state, unchanged ────────── */
  if (!estimateId) {
    if (approvalLines.isError) {
      return (
        <ErrorState
          title={t("Couldn't load this")}
          description={approvalLines.error?.message}
          onRetry={() => void approvalLines.refetch()}
        />
      )
    }
    return (
      <div className="mx-auto flex max-w-[1180px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <Header />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(290px,330px)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="overflow-hidden p-0">
              <div className="border-0 border-b border-solid border-border p-3.5">
                <p className="font-display text-[15px] font-bold text-heading">{t('What we found')}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {t('The work your advisor recommends, with the reason for each.')}
                </p>
              </div>
              {approvalLines.isLoading ? (
                <div className="p-4">
                  <Loading inline label="Loading..." />
                </div>
              ) : genericRows.length === 0 ? (
                <div className="p-4">
                  <EmptyState icon="ClipboardCheck" title={t('Nothing to approve')} />
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {genericRows.map((line, index) => {
                    const urg = URGENCY_TINT[line.urgency] ?? URGENCY_TINT.advisory
                    const note = rtl ? line.ar_note || line.note : line.note
                    return (
                      <li
                        key={line._id ?? String(line.id)}
                        className={
                          'flex items-start gap-3 p-3.5 ' +
                          (index ? 'border-0 border-t border-solid border-border' : '')
                        }
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13.5px] font-semibold text-heading">
                              {rtl ? line.ar || line.item : line.item}
                            </p>
                            <Badge background={urg.bg} color={urg.fg}>
                              {t(urg.label)}
                            </Badge>
                            {line.kind === 'labour' ? (
                              <span className="rounded-full bg-muted/[.14] px-1.5 py-0.5 font-action text-[10px] font-semibold text-muted">
                                {t('Labour')}
                              </span>
                            ) : null}
                          </div>
                          {note ? <p className="mt-1 text-[12px] text-muted">{note}</p> : null}
                        </div>
                        <div className="flex-shrink-0 text-end">
                          <p className="text-[11px] text-muted">
                            {line.qty} × <Money sar={line.unit} bare className="text-muted" />
                          </p>
                          <Money sar={line.unit} className="text-[12px] text-heading" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <Card className="p-4">
              <p className="mb-3 font-display text-sm font-bold text-heading">{t('Summary')}</p>
              <p className="rounded-lg bg-inset p-3 text-[11.5px] leading-relaxed text-muted">
                {t(
                  'The subtotal, VAT and total due are computed by the estimate the server issues — never in the browser. This link has no estimate attached, so no total is shown here.'
                )}
              </p>
            </Card>

            <Card className="p-4">
              <p className="mb-1 font-display text-[13.5px] font-bold text-heading">{t('Authorise the work')}</p>
              <p className="text-[11.5px] leading-relaxed text-muted">
                {t(
                  'Approving requires a one-time code, a captured e-signature and the linked estimate. This link carries no estimate to sign.'
                )}
              </p>
              <ul className="mt-3 flex list-none flex-col gap-2 p-0">
                {[
                  { icon: 'Smartphone', label: t('One-time code verification') },
                  { icon: 'PenTool', label: t('Captured e-signature') },
                  { icon: 'FileCheck', label: t('Linked estimate approval') },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-[12px] text-body">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-inset text-muted">
                      <Icon name={item.icon} size={13} />
                    </span>
                    {item.label}
                    <span className="ms-auto font-action text-[10px] font-semibold text-muted">
                      {t('Not connected')}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  /* ── an estimate link: the real record, wherever it could be resolved ───── */
  const lineRows = lines.data?.rows ?? []

  return (
    <div className="mx-auto flex max-w-[1180px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      {/* A page-level heading was missing entirely — "SALIS AUTO" in `Header`
       * below is the brand mark, not a description of the page, and nothing
       * else named what this screen is. This is the public, customer-facing
       * secure approval link (opened from an SMS/WhatsApp/email link, no
       * account required) — distinct from the advisor-facing internal preview
       * and from the full Customer Portal, which `Header`'s "Secure link"
       * badge exists to say. */}
      <h1 className="sr-only">{t('Estimate Approval')}</h1>
      <Header estimate={estimate} />

      {expired ? (
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-lg border border-salis-orange/[.28] bg-salis-orange/[.07] p-3"
        >
          <Icon name="Clock" size={16} className="mt-0.5 flex-shrink-0 text-salis-orange" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-salis-orange">{t('This estimate has expired')}</p>
            <p className="mt-0.5 text-[12px] text-body">
              {t('It was valid until')}{' '}
              <span dir="ltr">{new Date(estimate!.validUntil as string).toLocaleDateString('en-US')}</span>.{' '}
              {t('Ask your advisor for a current estimate before approving.')}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(290px,330px)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="overflow-hidden p-0">
            <div className="flex items-start justify-between gap-3 border-0 border-b border-solid border-border p-3.5">
              <div>
                <p className="font-display text-[15px] font-bold text-heading">{t('What we found')}</p>
                <p className="mt-0.5 text-[12px] text-muted" dir="ltr">
                  {estimate?.id ?? estimateId}
                </p>
              </div>
              {estimate ? <StatusBadge value={estimate.status} label={t(estimate.status)} /> : null}
            </div>
            {estimateQuery.isLoading ? (
              <div className="p-4">
                <Loading inline label="Loading your estimate..." />
              </div>
            ) : !estimate ? (
              <div className="p-4">
                <EmptyState
                  icon="ReceiptText"
                  title={t('Estimate details are not available here')}
                  description={
                    estimateQuery.error?.message ||
                    t(
                      'The line items and total for this estimate could not be loaded. The one-time code below still verifies against the record on the server.'
                    )
                  }
                />
              </div>
            ) : lines.isLoading ? (
              <div className="p-4">
                <Loading inline label="Loading line items..." />
              </div>
            ) : lineRows.length ? (
              <ul className="m-0 flex list-none flex-col p-0">
                {lineRows.map((line, index) => (
                  <li
                    key={line.id}
                    className={
                      'flex items-start gap-3 p-3.5 ' +
                      (index ? 'border-0 border-t border-solid border-border' : '')
                    }
                  >
                    <span className="mt-0.5 flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
                      <Icon name={line.kind === 'labour' ? 'Clock' : 'Package'} size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-heading">
                        {rtl ? line.descriptionAr || line.description : line.description}
                      </p>
                      {line.partSku ? (
                        <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                          {line.partSku}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex-shrink-0 text-end">
                      <p className="text-[11px] text-muted">
                        {line.qty} × <Money sar={line.unitPriceHalalas / 100} bare className="text-muted" />
                      </p>
                      <Money sar={line.unitPriceHalalas / 100} className="text-[12px] text-heading" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4">
                <EmptyState
                  icon="ReceiptText"
                  title={t('No line items to show')}
                  description={
                    lines.isError
                      ? t('Line items load from the API. Connect a live server to see them.')
                      : t('This estimate has no line items yet.')
                  }
                />
              </div>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Summary — the real total, computed server-side, when it loaded. */}
          <Card className="p-4">
            <p className="mb-3 font-display text-sm font-bold text-heading">{t('Summary')}</p>
            {estimate ? (
              <div className="flex flex-col gap-2">
                {estimate.subtotalHalalas != null ? (
                  <>
                    <SummaryRow label={t('Subtotal')} halalas={estimate.subtotalHalalas} muted />
                    {estimate.discountHalalas ? (
                      <SummaryRow label={t('Discount')} halalas={-estimate.discountHalalas} muted />
                    ) : null}
                    <SummaryRow label={t('VAT')} halalas={estimate.taxHalalas ?? 0} muted />
                  </>
                ) : null}
                <div className="flex items-baseline justify-between border-t border-border pt-2 text-[15px] font-extrabold text-heading first:border-t-0 first:pt-0">
                  <span>{t('Total due')}</span>
                  <Money sar={amount} className="font-extrabold" />
                </div>
                {estimate.validUntil && !expired ? (
                  <p className="mt-1 text-[11px] text-muted">
                    {t('Valid until')}{' '}
                    <span dir="ltr">{new Date(estimate.validUntil).toLocaleDateString('en-US')}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg bg-inset p-3 text-[11.5px] leading-relaxed text-muted">
                {t(
                  "This estimate's details could not be loaded, so no total is shown here. The subtotal, VAT and total due are computed by the estimate the server issues — never in the browser."
                )}
              </p>
            )}
          </Card>

          {/* Approval — the live OTP e-signature against this exact estimate. */}
          <Card className="p-4">
            <p className="mb-1 font-display text-[13.5px] font-bold text-heading">{t('Authorise the work')}</p>

            {decided ? (
              <div
                className={
                  'mt-2 flex items-center gap-2 rounded-lg p-2.5 text-[12px] font-semibold ' +
                  (estimate?.status === 'approved'
                    ? 'bg-salis-blue/[.08] text-salis-blue'
                    : 'bg-salis-orange/[.08] text-salis-orange')
                }
              >
                <Icon name={estimate?.status === 'approved' ? 'CheckCircle' : 'XCircle'} size={14} />
                {estimate?.status === 'approved'
                  ? t('This estimate has already been approved.')
                  : t('This estimate has already been declined.')}
              </div>
            ) : expired ? (
              <p className="text-[11.5px] leading-relaxed text-muted">
                {t('An expired estimate cannot be signed. Ask your advisor for a current one.')}
              </p>
            ) : otpReady ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-[11.5px] leading-relaxed text-muted">
                  {t('Enter the one-time code we send you to sign off this estimate.')}
                </p>

                {otp.kind === 'idle' || otp.kind === 'requesting' || otp.kind === 'unavailable' || otp.kind === 'error' ? (
                  <Button
                    size="sm"
                    onClick={() => void requestCode()}
                    disabled={otp.kind === 'requesting'}
                  >
                    <Icon name="Smartphone" size={13} />
                    {t(otp.kind === 'requesting' ? 'Sending...' : 'Send one-time code')}
                  </Button>
                ) : null}

                {otp.kind === 'sent' || otp.kind === 'verifying' || otp.kind === 'rejected' ? (
                  <>
                    {otp.kind === 'sent' ? (
                      <p className="text-[11.5px] text-muted">
                        {t('Code sent to')} <span dir="ltr">{otp.destination}</span>
                      </p>
                    ) : null}
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      aria-label={t('One-time code')}
                      placeholder={t('One-time code')}
                      inputSize="sm"
                      className="font-mono"
                      dir="ltr"
                    />
                    <Button
                      size="sm"
                      onClick={() => void verifyCode()}
                      disabled={otp.kind === 'verifying' || code.length === 0}
                    >
                      <Icon name="Check" size={13} />
                      {t(otp.kind === 'verifying' ? 'Verifying...' : 'Verify and sign')}
                    </Button>
                    {otp.kind === 'rejected' ? (
                      <p className="text-[11.5px] text-salis-orange">{otp.reason}</p>
                    ) : null}
                  </>
                ) : null}

                {otp.kind === 'verified' ? (
                  <div className="flex items-center gap-2 rounded-lg bg-salis-blue/[.08] p-2.5 text-[12px] font-semibold text-salis-blue">
                    <Icon name="CheckCircle" size={14} />
                    {t('Signed and authorised')}
                  </div>
                ) : null}

                {otp.kind === 'unavailable' ? (
                  <div
                    role="note"
                    className="flex items-start gap-2.5 rounded-lg border border-salis-orange/[.28] bg-salis-orange/[.07] p-2.5"
                  >
                    <Icon name="MessageSquare" size={14} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-salis-orange">{t('SMS not connected')}</p>
                      <p className="mt-0.5 text-[11.5px] text-body">{otp.message}</p>
                    </div>
                  </div>
                ) : null}

                {otp.kind === 'error' ? (
                  <p role="alert" className="text-[11.5px] text-salis-orange">{otp.message}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-muted">
                {t(
                  'Approving requires a one-time code and a captured e-signature. That step is not connected in this build.'
                )}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
