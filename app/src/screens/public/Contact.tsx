import { useId, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { TINT_CHIP, type Tint } from './sections/tints'

/** PublicPortal.Contact — `project/PublicPortal.Contact.dc.html`.
 *
 *  Form on the start side, contact channels on the end side. The form
 *  validates for real; what it cannot do is deliver, because no public lead
 *  endpoint exists anywhere in `server/` or `packages/contract/` yet. So a
 *  valid submission gets an honest failure state naming the working channels
 *  (email and phone, both live links) — never a success toast for a message
 *  that went nowhere. `tests/public-contact-form.test.tsx` carries the `GAP:`
 *  test naming the missing endpoint; when it lands, `submit()` is the one
 *  place to wire it. */
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

const INPUT =
  'rounded-lg border border-border bg-inset px-3 text-sm text-heading outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-salis-blue'

export function PublicContact() {
  const t = useT()
  usePageMeta({
    title: t('Contact — SALIS AUTO'),
    description: t('Get in touch with our team'),
  })

  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [undeliverable, setUndeliverable] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateContact(values)
    setErrors(found)
    // A valid message has nowhere to go: there is no public lead endpoint in
    // the contract yet. Saying so — with the channels that do work — is the
    // only honest outcome. No success state exists in this component at all.
    setUndeliverable(Object.keys(found).length === 0)
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
              <input
                id={nameId}
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                placeholder={t('Your name')}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className={cn('h-11', INPUT, invalid && 'border-salis-orange')}
              />
            ))}
            {field(emailId, 'Email', errors.email, (invalid, describedBy) => (
              <input
                id={emailId}
                type="email"
                dir="ltr"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                placeholder="your@email.com"
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className={cn('h-11', INPUT, invalid && 'border-salis-orange')}
              />
            ))}
            {field(messageId, 'Message', errors.message, (invalid, describedBy) => (
              <textarea
                id={messageId}
                rows={4}
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                placeholder={t('How can we help?')}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className={cn('resize-y py-3 font-ui', INPUT, invalid && 'border-salis-orange')}
              />
            ))}

            {undeliverable ? (
              <div
                role="alert"
                className="rounded-[14px] border border-salis-orange bg-[rgba(249,115,22,.06)] p-4 text-[13px] leading-relaxed text-heading"
              >
                <p className="m-0 font-semibold">{t('We could not send your message.')}</p>
                <p className="mb-0 mt-1">
                  {t('Online messaging has not launched for this site yet. Reach us directly at')}{' '}
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
              className="h-11 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white"
            >
              {t('Send Message')}
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
