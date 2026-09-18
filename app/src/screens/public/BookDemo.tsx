import { useId, useState, type FormEvent } from 'react'
import { useT } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { API_URL } from '@/data/repository'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.BookDemo — Tier C lead-capture page.
 *
 *  Previously fired a fake "Demo booked successfully" toast and reset the
 *  form without ever calling a backend — its own comment admitted "No
 *  backend endpoint exists yet." Its siblings Contact.tsx and RequestDemo.tsx
 *  already submit to the real, tested `POST /public/leads` endpoint (F-025);
 *  this screen now does the same, folding the date/time slot this page
 *  collects (which the lead contract doesn't model) into the bounded
 *  `message` field, exactly as RequestDemo.tsx folds its own extra
 *  qualification fields. Same two honest non-success outcomes: fixture
 *  build says messaging hasn't launched yet, a live error shows the mapped
 *  server message. */
const LIVE = API_URL !== ''

type Status = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error'

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening'] as const

interface Values {
  name: string
  email: string
  phone: string
  company: string
  date: string
  time: string
  message: string
}

const INITIAL_VALUES: Values = {
  name: '',
  email: '',
  phone: '',
  company: '',
  date: '',
  time: '',
  message: '',
}

interface FieldErrors {
  name?: string
  email?: string
  company?: string
  date?: string
  time?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateBookDemo(values: Pick<Values, 'name' | 'email' | 'company' | 'date' | 'time'>): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your full name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!values.company.trim()) errors.company = 'Please enter your company name.'
  if (!values.date.trim()) errors.date = 'Please choose a preferred date.'
  if (!values.time.trim()) errors.time = 'Please choose a preferred time.'
  return errors
}

function composeMessage(values: Values): string {
  const lines: string[] = []
  if (values.date.trim()) lines.push(`Preferred date: ${values.date.trim()}`)
  if (values.time) lines.push(`Preferred time: ${values.time}`)
  const details = lines.join('\n')
  const message = values.message.trim()
  const composed = [details, message].filter(Boolean).join('\n\n')
  return composed.slice(0, 2000)
}

export function PublicBookDemo() {
  const t = useT()
  usePageMeta({
    title: t('Book a Demo — SALIS AUTO'),
    description: t('Schedule a personalised demo of SALIS AUTO at a time that suits you'),
  })

  const ids = {
    name: useId(),
    email: useId(),
    phone: useId(),
    company: useId(),
    date: useId(),
    time: useId(),
    message: useId(),
  } as const

  const [values, setValues] = useState<Values>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateBookDemo(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus('idle')
      return
    }

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
          phone: values.phone.trim() || undefined,
          company: values.company.trim(),
          message: composeMessage(values) || undefined,
          source: 'Website — Book a Demo',
        }),
      })

      if (response.status === 202) {
        setValues(INITIAL_VALUES)
        setStatus('sent')
        return
      }

      if (response.status === 429) {
        setErrorMessage(t('Too many requests from this address. Please wait a minute and try again.'))
      } else {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        setErrorMessage(body?.error?.message ?? t('We could not send your request. Please try again.'))
      }
      setStatus('error')
    } catch {
      setErrorMessage(t('We could not reach the server. Please try again, or contact us directly.'))
      setStatus('error')
    }
  }

  const field = (
    id: string,
    label: string,
    required: boolean,
    error: string | undefined,
    control: (invalid: boolean, describedBy: string | undefined) => JSX.Element
  ) => {
    const errorId = `${id}-error`
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-medium text-heading">
          {t(label)}
          {required ? <span aria-hidden="true"> *</span> : null}
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
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Book a Demo"
        subtitle="Pick a date and time and we will walk you through the platform live"
      />
      <form
        noValidate
        onSubmit={submit}
        aria-label={t('Book a demo form')}
        className="mx-auto flex max-w-[560px] flex-col gap-4 rounded-2xl border border-default bg-card p-6"
      >
        {Object.keys(errors).length > 0 ? (
          <div
            role="alert"
            className="rounded-[14px] border border-salis-orange bg-salis-orange/[.06] p-4 text-[13px] text-heading"
          >
            <p className="m-0 font-semibold">{t('Please fix the following before submitting:')}</p>
            <ul className="mb-0 mt-1.5 ps-5">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{t(message ?? '')}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {field(ids.name, 'Name', true, errors.name, (invalid, describedBy) => (
          <Input
            id={ids.name}
            required
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={t('Your full name')}
            invalid={invalid}
            aria-describedby={describedBy}
            inputSize="sm"
          />
        ))}
        {field(ids.email, 'Email', true, errors.email, (invalid, describedBy) => (
          <Input
            id={ids.email}
            required
            type="email"
            dir="ltr"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="your@email.com"
            invalid={invalid}
            aria-describedby={describedBy}
            inputSize="sm"
          />
        ))}
        {field(ids.phone, 'Phone', false, undefined, () => (
          <Input
            id={ids.phone}
            type="tel"
            dir="ltr"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+966 5x xxx xxxx"
            inputSize="sm"
          />
        ))}
        {field(ids.company, 'Company Name', true, errors.company, (invalid, describedBy) => (
          <Input
            id={ids.company}
            required
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder={t('Your company')}
            invalid={invalid}
            aria-describedby={describedBy}
            inputSize="sm"
          />
        ))}
        {field(ids.date, 'Preferred Date', true, errors.date, (invalid, describedBy) => (
          <Input
            id={ids.date}
            required
            type="date"
            value={values.date}
            onChange={(e) => set('date', e.target.value)}
            invalid={invalid}
            aria-describedby={describedBy}
            inputSize="sm"
          />
        ))}
        {field(ids.time, 'Preferred Time', true, errors.time, (invalid, describedBy) => (
          <Select
            id={ids.time}
            required
            value={values.time}
            onChange={(e) => set('time', e.target.value)}
            className="h-10 w-full text-[13px]"
            aria-invalid={invalid}
            aria-describedby={describedBy}
          >
            <option value="" disabled>
              {t('Select a time slot')}
            </option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </Select>
        ))}
        {field(ids.message, 'Message', false, undefined, () => (
          <Textarea
            id={ids.message}
            rows={4}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder={t('Anything specific you would like to see?')}
          />
        ))}

        {status === 'sent' ? (
          <div
            role="status"
            className="rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-4 text-[13px] leading-relaxed text-heading"
          >
            <p className="m-0 font-semibold">{t('Demo request submitted.')}</p>
            <p className="mb-0 mt-1">
              {t('Thank you — a member of our sales team will confirm your demo time shortly.')}
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
                ? t('We could not send your request.')
                : t('Your request did not go through.')}
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
        ) : null}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-2 h-11 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {status === 'sending' ? t('Sending…') : t('Book Demo')}
        </button>
      </form>
    </div>
  )
}
