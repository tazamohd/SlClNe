import { Icon } from '@/components/ui/Icon'
import { API_URL } from '@/data/repository'
import { useT } from '@/providers/PreferencesProvider'

/** What happens after a public lead form is submitted, shared by the demo
 *  forms (Contact keeps its own, older copy that two test files pin).
 *
 *  Three outcomes, none of them a toast — the visitor has just left a form and
 *  needs a message that stays put:
 *  - `sent`: the server accepted the lead (202). Inline, blue, with a "send
 *    another" action that resets the form.
 *  - `unavailable`: the fixture build has no server to accept it. The panel
 *    says so and hands over the channels that work. No success is faked.
 *  - `error`: the server refused (rate limit, validation) or could not be
 *    reached, with the mapped message and the same channels. */
export type LeadStatus = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error'

/** The fixture build ships no backend; a set `VITE_API_URL` is the live API. */
export const LEADS_LIVE = API_URL !== ''

export interface LeadPayload {
  name: string
  email: string
  phone?: string
  message: string
  /** Which form it came from — "Book a Demo", "Request Demo". */
  source: string
}

export type LeadResult = { ok: true } | { ok: false; message: string | null; transport?: boolean }

/** `POST /public/leads` — the one public write (F-025). No token. */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/public/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.status === 202) return { ok: true }
    if (response.status === 429) return { ok: false, message: null }
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null
    return { ok: false, message: body?.error?.message ?? null }
  } catch {
    return { ok: false, message: null, transport: true }
  }
}

export function LeadOutcome({
  status,
  errorMessage,
  sentTitle,
  sentDescription,
  onReset,
}: {
  status: LeadStatus
  errorMessage: string
  /** English source strings. */
  sentTitle: string
  sentDescription: string
  onReset: () => void
}) {
  const t = useT()

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="flex flex-col gap-3 rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-5 text-[13px] leading-relaxed text-heading"
      >
        <p className="m-0 flex items-center gap-2 text-[15px] font-semibold">
          <Icon name="CheckCircle" size={18} className="flex-shrink-0 text-salis-blue" />
          {t(sentTitle)}
        </p>
        <p className="m-0">{t(sentDescription)}</p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[44px] w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-salis-blue bg-transparent px-4 font-action text-[13px] font-semibold text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          {t('Send another request')}
        </button>
      </div>
    )
  }

  if (status === 'unavailable' || status === 'error') {
    return (
      <div
        role="alert"
        className="rounded-[14px] border border-salis-orange bg-salis-orange/[.06] p-4 text-[13px] leading-relaxed text-heading"
      >
        <p className="m-0 font-semibold">
          {status === 'unavailable' ? t('We could not send your request.') : t('Your request did not go through.')}
        </p>
        <p className="mb-0 mt-1">
          {status === 'unavailable'
            ? t('Online requests have not launched for this site yet. Reach us directly at')
            : `${errorMessage} ${t('You can also reach us directly at')}`}{' '}
          <a href="mailto:info@salisauto.sa" dir="ltr">
            info@salisauto.sa
          </a>{' '}
          {t('or')}{' '}
          <a href="tel:+966112345678" dir="ltr">
            +966 11 234 5678
          </a>
          {' — '}
          {t('we answer both.')}
        </p>
      </div>
    )
  }

  return null
}
