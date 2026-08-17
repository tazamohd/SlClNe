import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { estimateOtp, type RepositoryError } from '@/data/repository'
import { isExternalDependency, transitionFailureMessage } from './api'

type Line = RowOf<'approvalLines'> & { _id?: string }

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

/** Customer approval — the work the customer reviews before authorising it.
 *
 *  The line items are real `approvalLines` data: item, quantity, unit price,
 *  urgency and the advisor's note. The customer sees exactly what was found.
 *
 *  What the design also shows depends on capabilities the server does not
 *  expose, so this screen renders them as honest gaps rather than a theatre of
 *  working controls:
 *   - the running total and VAT — Part 5b forbids computing money client-side,
 *     and `approvalLines` are not linked to an estimate that carries the total;
 *   - the OTP step — there is no approval-OTP endpoint;
 *   - the e-signature capture and the per-line "defer" — no endpoint persists
 *     either, and the estimate approve action takes neither a signature nor a
 *     line selection.
 *  Recorded in `workshop-approval-gaps.test.ts`. A dead "Approve" button that
 *  silently does nothing would be worse than saying so. */
export function CustomerApproval() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()
  const lines = useCollection('approvalLines')

  const rows = (lines.data ?? []) as readonly Line[]

  /* The OTP e-signature can only run when the SMS accessor is live AND the work
   * is linked to an estimate to sign — the `approvalLines→estimate` FK is still
   * absent (F-029, deferred), so the id comes from the route for now. Without
   * both, the honest "Not connected" gap below stays. */
  const estimateId = params.get('estimate')
  const otpReady = Boolean(estimateOtp) && Boolean(estimateId)
  const [otp, setOtp] = useState<OtpState>({ kind: 'idle' })
  const [code, setCode] = useState('')

  async function requestCode() {
    if (!estimateOtp || !estimateId) return
    setOtp({ kind: 'requesting' })
    try {
      const res = await estimateOtp.request(estimateId)
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
    if (!estimateOtp || !estimateId) return
    setOtp({ kind: 'verifying' })
    try {
      const res = await estimateOtp.verify(estimateId, code)
      setOtp(
        res.verified
          ? { kind: 'verified' }
          : { kind: 'rejected', reason: res.reason ?? t('The code did not match.') }
      )
    } catch (cause) {
      if (isExternalDependency(cause)) {
        setOtp({ kind: 'unavailable', message: (cause as RepositoryError).message })
      } else {
        setOtp({ kind: 'error', message: transitionFailureMessage(cause, t('Something went wrong.')) })
      }
    }
  }

  if (lines.isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={lines.error?.message}
        onRetry={() => void lines.refetch()}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-[1180px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-salis-gradient text-white">
          <Icon name="Car" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-extrabold text-heading">SALIS AUTO</p>
          <p className="truncate text-[11px] text-muted">
            {t('Riyadh Main')} · {t('Service Advisor')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-1 font-action text-[11px] font-semibold text-salis-blue">
          <Icon name="ShieldCheck" size={12} />
          {t('Secure link')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(290px,330px)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="overflow-hidden p-0">
            <div className="border-0 border-b border-solid border-border p-3.5">
              <p className="font-display text-[15px] font-bold text-heading">{t('What we found')}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {t('The work your advisor recommends, with the reason for each.')}
              </p>
            </div>
            {lines.isLoading ? (
              <div className="p-4">
                <Loading inline label="Loading..." />
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4">
                <EmptyState icon="ClipboardCheck" title={t('Nothing to approve')} />
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {rows.map((line, index) => {
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
                            <span className="rounded-full bg-[rgba(100,116,139,.14)] px-1.5 py-0.5 font-action text-[10px] font-semibold text-muted">
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
          {/* Summary — the total is a server figure this screen cannot build. */}
          <Card className="p-4">
            <p className="mb-3 font-display text-sm font-bold text-heading">{t('Summary')}</p>
            <p className="rounded-lg bg-inset p-3 text-[11.5px] leading-relaxed text-muted">
              {t(
                'The subtotal, VAT and total due are computed by the estimate the server issues — never in the browser. These approval lines are not yet linked to that estimate, so no total is shown here.'
              )}
            </p>
          </Card>

          {/* Approval — the live OTP e-signature when the SMS accessor and an
              estimate link are both present, else the honest gap. */}
          <Card className="p-4">
            <p className="mb-1 font-display text-[13.5px] font-bold text-heading">{t('Authorise the work')}</p>
            {otpReady ? (
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
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      aria-label={t('One-time code')}
                      placeholder={t('One-time code')}
                      className="h-9 rounded-lg border border-border bg-card px-3 font-mono text-[13px] text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
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
                  <div className="flex items-center gap-2 rounded-lg bg-[rgba(10,94,215,.08)] p-2.5 text-[12px] font-semibold text-salis-blue">
                    <Icon name="CheckCircle" size={14} />
                    {t('Signed and authorised')}
                  </div>
                ) : null}

                {otp.kind === 'unavailable' ? (
                  <div
                    role="note"
                    className="flex items-start gap-2.5 rounded-lg border border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.07)] p-2.5"
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
              <>
                <p className="text-[11.5px] leading-relaxed text-muted">
                  {t(
                    'Approving requires a one-time code, a captured e-signature and the linked estimate. None of those endpoints are connected yet, so approval happens on the estimate itself for now.'
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
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
