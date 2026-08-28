import { useId, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { API_URL } from '@/data/repository'
import { useT } from '@/providers/PreferencesProvider'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/cn'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { TINT_CHIP, type Tint } from './sections/tints'

/** PublicPortal.Contact — `project/PublicPortal.Contact.dc.html`.
 *
 *  Form on the start side, contact channels on the end side. The form validates
 *  for real, then submits to `POST /public/leads` — the one public write in the
 *  product (F-025): unauthenticated, rate-limited, landing in a single
 *  server-configured org. It is called directly with `fetch` and no token,
 *  mirroring the auth screens' transport but without the Authorization header,
 *  because this is the only surface a signed-out visitor writes from.
 *
 *  Two honest outcomes flank the success path:
 *  - **Fixture build** (`VITE_API_URL` unset): there is no server to accept the
 *    lead, so a valid submission says so and hands over the channels that do
 *    work (email and phone, both live links). No success is faked for a message
 *    that went nowhere.
 *  - **Live error** (429 rate-limit, 400 validation, unreachable server): the
 *    mapped message from the server, or a transport fallback, with the same
 *    working channels.
 *
 *  `tests/public-contact-form.test.tsx` covers the fixture + validation paths;
 *  `tests/public-contact-live.test.tsx` mocks the endpoint and asserts the real
 *  202 success and the 429/400 mappings. */

/** The fixture build ships no backend; a set `VITE_API_URL` is the live API. */
const LIVE = API_URL !== ''

type Status = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error'
interface Channel {
  icon: string
  tint: Tint
  label: string
  value: string
  /** Live destination — `tel:`/`mailto:` — when the channel is actionable. */
  href?: string
  /** Pin Latin runs (the phone number) LTR under Arabic. */
  ltr?: boolean
}

const CHANNELS: readonly Channel[] = [
  { icon: 'MapPin', tint: 'blue', label: 'Address', value: 'Al-Olaya District, Riyadh, KSA' },
  {
    icon: 'Phone',
    tint: 'bright',
    label: 'Phone',
    value: '+966 11 234 5678',
    href: 'tel:+966112345678',
    ltr: true,
  },
  {
    icon: 'Mail',
    tint: 'orange',
    label: 'Email',
    value: 'info@salisauto.sa',
    href: 'mailto:info@salisauto.sa',
    ltr: true,
  },
  { icon: 'Clock', tint: 'navy', label: 'Hours', value: 'Sat–Thu 8AM–8PM' },
]

interface FieldErrors {
  name?: string
  email?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(values: {
  name: string
  email: string
  message: string
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!values.message.trim()) errors.message = 'Please enter a message.'
  return errors
}


export function PublicContact() {
  const t = useT()
  usePageMeta({
    title: t('Contact — SALIS AUTO'),
    description: t('Get in touch with our team'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: 'SALIS AUTO',
      url: 'https://salisauto.sa',
      telephone: '+966112345678',
      email: 'info@salisauto.sa',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Al-Olaya District',
        addressLocality: 'Riyadh',
        addressCountry: 'SA',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '08:00',
        closes: '20:00',
      },
    },
  })

  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateContact(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus('idle')
      return
    }

    // No backend in the fixture build: a valid message has nowhere to go, and
    // the only honest outcome is to say so and name the channels that work.
    if (!LIVE) {
      setStatus('unavailable')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          source: 'Website',
        }),
      })

      // 202 Accepted `{status:'accepted'}` — a bare acknowledgement, nothing to
      // read back. Clear the form so a second submit is a deliberate act.
      if (response.status === 202) {
        setValues({ name: '', email: '', message: '' })
        setStatus('sent')
        return
      }

      if (response.status === 429) {
        // The rate-limit plugin answers with its own envelope, not the API's,
        // so map the status rather than trusting a `error.message` shape here.
        setErrorMessage(
          t('Too many messages from this address. Please wait a minute and try again.')
        )
      } else {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        setErrorMessage(
          body?.error?.message ?? t('We could not send your message. Please try again.')
        )
      }
      setStatus('error')
    } catch {
      setErrorMessage(
        t('We could not reach the server. Please try again, or contact us directly.')
      )
      setStatus('error')
    }
  }

  const field = (
    id: string,
    label: string,
    error: string | undefined,
    control: (invalid: boolean, describedBy: string | undefined) => JSX.Element
  ) => {
    const errorId = `${id}-error`
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-medium text-heading">
          {t(label)}
        </label>
        {control(!!error, error ? errorId : undefined)}
        {error ? (
          <p id={errorId} className="m-0 text-xs text-salis-orange">
            {t(error)}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro title="Contact Us" subtitle="Get in touch with our team" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <form
          noValidate
          onSubmit={submit}
          aria-label={t('Contact form')}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-4">
            {field(nameId, 'Name', errors.name, (invalid, describedBy) => (
              <Input
                id={nameId}
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                placeholder={t('Your name')}
                invalid={invalid}
                aria-describedby={describedBy}
                inputSize="md"
              />
            ))}
            {field(emailId, 'Email', errors.email, (invalid, describedBy) => (
              <Input
                id={emailId}
                type="email"
                dir="ltr"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                placeholder="your@email.com"
                invalid={invalid}
                aria-describedby={describedBy}
                inputSize="md"
              />
            ))}
            {field(messageId, 'Message', errors.message, (invalid, describedBy) => (
              <Textarea
                id={messageId}
                rows={4}
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                placeholder={t('How can we help?')}
                invalid={invalid}
                aria-describedby={describedBy}
              />
            ))}

            {status === 'sent' ? (
              <div
                role="status"
                className="rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-4 text-[13px] leading-relaxed text-heading"
              >
                <p className="m-0 font-semibold">{t('Message sent.')}</p>
                <p className="mb-0 mt-1">
                  {t(
                    'Thank you — we have received your message and a member of our team will be in touch shortly.'
                  )}
                </p>
              </div>
            ) : null}

            {status === 'unavailable' || status === 'error' ? (
              <div
                role="alert"
                className="rounded-[14px] border border-salis-orange bg-salis-orange/[.06] p-4 text-[13px] leading-relaxed text-heading"
              >
                <p className="m-0 font-semibold">
                  {status === 'unavailable'
                    ? t('We could not send your message.')
                    : t('Your message did not go through.')}
                </p>
                <p className="mb-0 mt-1">
                  {status === 'unavailable'
                    ? t('Online messaging has not launched for this site yet. Reach us directly at')
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
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="h-11 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {status === 'sending' ? t('Sending…') : t('Send Message')}
            </button>
          </div>
        </form>

        <address className="flex flex-col gap-5 not-italic">
          {CHANNELS.map((channel) => {
            const value = channel.href ? (
              <a href={channel.href} dir={channel.ltr ? 'ltr' : undefined} className="text-[13px]">
                {channel.value}
              </a>
            ) : (
              <p className="m-0 text-[13px] text-muted">{t(channel.value)}</p>
            )
            return (
              <div key={channel.label} className="flex items-center gap-3">
                <span className={cn('flex rounded-xl p-2.5', TINT_CHIP[channel.tint])}>
                  <Icon name={channel.icon} size={20} />
                </span>
                <div>
                  <p className="m-0 text-sm font-semibold text-heading">{t(channel.label)}</p>
                  <div className="mt-0.5">{value}</div>
                </div>
              </div>
            )
          })}
        </address>
      </div>
    </div>
  )
}
