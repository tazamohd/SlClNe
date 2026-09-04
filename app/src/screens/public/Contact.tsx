import { useRef, useState } from 'react'
import { z } from 'zod'
import { Icon } from '@/components/ui/Icon'
import { useZodForm } from '@/components/ui/Form'
import { API_URL } from '@/data/repository'
import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'
import { usePageMeta } from './usePageMeta'
import { LeadField } from './sections/LeadField'
import { SectionIntro } from './sections/SectionIntro'
import { TINT_CHIP, type Tint } from './sections/tints'

/** PublicPortal.Contact — `project/PublicPortal.Contact.dc.html`.
 *
 *  Form on the start side, contact channels on the end side. The form validates
 *  for real — on blur per field, then on submit — and posts to
 *  `POST /public/leads`, the one public write in the product (F-025):
 *  unauthenticated, rate-limited, landing in a single server-configured org.
 *  It is called directly with `fetch` and no token, mirroring the auth screens'
 *  transport but without the Authorization header, because this is the only
 *  surface a signed-out visitor writes from.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** One rule per field, shared by blur validation and the submit schema. The
 *  messages are the English source strings the test suite reads. */
export const CONTACT_RULES = {
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .regex(EMAIL_RE, 'Please enter a valid email address.'),
  message: z.string().trim().min(1, 'Please enter a message.'),
}

const contactSchema = z.object(CONTACT_RULES)

type ContactValues = z.input<typeof contactSchema>

interface FieldErrors {
  name?: string
  email?: string
  message?: string
}

const EMPTY: ContactValues = { name: '', email: '', message: '' }

export function validateContact(values: ContactValues): FieldErrors {
  const parsed = contactSchema.safeParse(values)
  if (parsed.success) return {}
  const errors: FieldErrors = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof FieldErrors | undefined
    if (key && !errors[key]) errors[key] = issue.message
  }
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

  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // The form clears itself after a real acceptance; the ref breaks the cycle
  // between the form and the handler that resets it.
  const clearForm = useRef<() => void>(() => {})
  const form = useZodForm({
    schema: contactSchema,
    initial: EMPTY,
    onSubmit: async (values) => {
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
            name: values.name,
            email: values.email,
            message: values.message,
            source: 'Website',
          }),
        })

        // 202 Accepted `{status:'accepted'}` — a bare acknowledgement, nothing to
        // read back. Clear the form so a second submit is a deliberate act.
        if (response.status === 202) {
          clearForm.current()
          setStatus('sent')
          return
        }

        if (response.status === 429) {
          // The rate-limit plugin answers with its own envelope, not the API's,
          // so map the status rather than trusting a `error.message` shape here.
          setErrorMessage(t('Too many messages from this address. Please wait a minute and try again.'))
        } else {
          const body = (await response.json().catch(() => null)) as {
            error?: { message?: string }
          } | null
          setErrorMessage(body?.error?.message ?? t('We could not send your message. Please try again.'))
        }
        setStatus('error')
      } catch {
        setErrorMessage(t('We could not reach the server. Please try again, or contact us directly.'))
        setStatus('error')
      }
    },
  })
  clearForm.current = () => form.reset(EMPTY)

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro title="Contact Us" subtitle="Get in touch with our team" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form
          noValidate
          onSubmit={form.submit}
          aria-label={t('Contact form')}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-4">
            <LeadField
              form={form}
              name="name"
              label="Name"
              rule={CONTACT_RULES.name}
              placeholder="Your name"
              autoComplete="name"
            />
            <LeadField
              form={form}
              name="email"
              label="Email"
              kind="email"
              rule={CONTACT_RULES.email}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <LeadField
              form={form}
              name="message"
              label="Message"
              kind="textarea"
              rule={CONTACT_RULES.message}
              placeholder="How can we help?"
            />

            {status === 'sent' ? (
              <div
                role="status"
                className="rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-4 text-[13px] leading-relaxed text-heading"
              >
                <p className="m-0 flex items-center gap-2 font-semibold">
                  <Icon name="CheckCircle" size={16} className="flex-shrink-0 text-salis-blue" />
                  {t('Message sent.')}
                </p>
                <p className="mb-0 mt-1">
                  {t('Thank you — we have received your message and a member of our team will be in touch shortly.')}
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
              disabled={status === 'sending' || form.pending}
              className="h-12 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {status === 'sending' ? t('Sending…') : t('Send Message')}
            </button>
          </div>
        </form>

        <address className="flex flex-col gap-5 not-italic">
          {CHANNELS.map((channel) => {
            const value = channel.href ? (
              <a
                href={channel.href}
                dir={channel.ltr ? 'ltr' : undefined}
                className="inline-flex min-h-[44px] items-center text-[13px]"
              >
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
