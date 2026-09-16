import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { API_URL } from '@/data/repository'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.RequestDemo — Tier B lead-capture page, rewritten for the
 *  truth-and-conversion overhaul (2026-09).
 *
 *  Submits to the same real, tested endpoint Contact.tsx uses,
 *  `POST /public/leads` (F-025) — a public, rate-limited, `.strict()`-
 *  validated write with no fake success state. The endpoint's contract
 *  (`packages/contract/src/entities/public.ts`) only models
 *  name/email/phone/company/message/source, so the extra qualification
 *  fields this page collects (job role, business type, city, branch count,
 *  monthly job cards, areas of interest, preferred contact method) are
 *  folded into one labelled block prepended to `message` — sent to the same
 *  bounded field, not a new unverified server capability.
 *
 *  Two honest outcomes flank the success path, identical to Contact.tsx:
 *  fixture build (`VITE_API_URL` unset) says messaging has not launched yet
 *  and hands over the channels that work; a live error shows the mapped
 *  server message. Consent is never pre-selected. */
const LIVE = API_URL !== ''

type Status = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error'

const BRANCH_OPTIONS = ['1', '2-5', '6-10', '10+'] as const
const JOB_ROLE_OPTIONS = [
  'Owner / General Manager',
  'Operations Manager',
  'IT / Systems',
  'Finance',
  'Procurement',
  'Other',
] as const
const BUSINESS_TYPE_OPTIONS = [
  'Independent workshop',
  'Multi-branch service center',
  'Dealership',
  'Fleet operator',
  'Parts retailer or distributor',
  'Other',
] as const
const CONTACT_METHOD_OPTIONS = ['Email', 'Phone', 'WhatsApp'] as const
const INTEREST_OPTIONS = [
  'Workshop operations',
  'Inventory & parts',
  'Finance & invoicing',
  'Fleet management',
  'Multi-branch rollout',
  'Integrations & API',
] as const

interface Values {
  name: string
  email: string
  phone: string
  company: string
  jobRole: string
  businessType: string
  city: string
  branches: string
  monthlyJobCards: string
  interests: string[]
  preferredContact: string
  message: string
  consent: boolean
}

const INITIAL_VALUES: Values = {
  name: '',
  email: '',
  phone: '',
  company: '',
  jobRole: '',
  businessType: '',
  city: '',
  branches: '',
  monthlyJobCards: '',
  interests: [],
  preferredContact: '',
  message: '',
  consent: false,
}

interface FieldErrors {
  name?: string
  email?: string
  company?: string
  consent?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRequestDemo(values: Pick<Values, 'name' | 'email' | 'company' | 'consent'>): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your full name.'
  if (!values.email.trim()) errors.email = 'Please enter your work email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!values.company.trim()) errors.company = 'Please enter your company name.'
  if (!values.consent) errors.consent = 'Please confirm you agree to be contacted about this request.'
  return errors
}

/** Folds the qualification fields the backend doesn't model into one bounded
 *  block, so a sales rep reading the lead has full context without the
 *  server accepting fields it never validates. */
function composeMessage(values: Values): string {
  const lines: string[] = []
  if (values.jobRole) lines.push(`Job role: ${values.jobRole}`)
  if (values.businessType) lines.push(`Business type: ${values.businessType}`)
  if (values.city.trim()) lines.push(`City: ${values.city.trim()}`)
  if (values.branches) lines.push(`Branches: ${values.branches}`)
  if (values.monthlyJobCards.trim()) lines.push(`Monthly job cards: ${values.monthlyJobCards.trim()}`)
  if (values.interests.length) lines.push(`Areas of interest: ${values.interests.join(', ')}`)
  if (values.preferredContact) lines.push(`Preferred contact method: ${values.preferredContact}`)
  const details = lines.join('\n')
  const message = values.message.trim()
  const composed = [details, message].filter(Boolean).join('\n\n')
  return composed.slice(0, 2000)
}

export function PublicRequestDemo() {
  const t = useT()
  usePageMeta({
    title: t('Request Demo — SALIS AUTO'),
    description: t('Book a personalised demo of the SALIS AUTO workshop management platform'),
  })

  const ids = {
    name: useId(),
    email: useId(),
    phone: useId(),
    company: useId(),
    jobRole: useId(),
    businessType: useId(),
    city: useId(),
    branches: useId(),
    monthlyJobCards: useId(),
    preferredContact: useId(),
    message: useId(),
    consent: useId(),
  } as const

  const [values, setValues] = useState<Values>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const toggleInterest = (interest: string) => {
    setValues((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateRequestDemo(values)
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
          source: 'Website — Request a Demo',
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
        title="Request a Demo"
        subtitle="See how SALIS AUTO can streamline your workshop operations"
      />
      <form
        noValidate
        onSubmit={submit}
        aria-label={t('Request a demo form')}
        className="mx-auto flex max-w-[640px] flex-col gap-4 rounded-2xl border border-default bg-card p-6"
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

        {field(ids.name, 'Full name', true, errors.name, (invalid, describedBy) => (
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
        {field(ids.email, 'Work email', true, errors.email, (invalid, describedBy) => (
          <Input
            id={ids.email}
            required
            type="email"
            dir="ltr"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@company.com"
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
        {field(ids.company, 'Company name', true, errors.company, (invalid, describedBy) => (
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
        {field(ids.jobRole, 'Job role', false, undefined, () => (
          <Select
            id={ids.jobRole}
            value={values.jobRole}
            onChange={(e) => set('jobRole', e.target.value)}
            className="h-10 w-full text-[13px]"
          >
            <option value="">{t('Select your role')}</option>
            {JOB_ROLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </Select>
        ))}
        {field(ids.businessType, 'Business type', false, undefined, () => (
          <Select
            id={ids.businessType}
            value={values.businessType}
            onChange={(e) => set('businessType', e.target.value)}
            className="h-10 w-full text-[13px]"
          >
            <option value="">{t('Select your business type')}</option>
            {BUSINESS_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </Select>
        ))}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field(ids.city, 'City', false, undefined, () => (
            <Input
              id={ids.city}
              autoComplete="address-level2"
              value={values.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder={t('e.g. Riyadh')}
              inputSize="sm"
            />
          ))}
          {field(ids.branches, 'Number of branches', false, undefined, () => (
            <Select
              id={ids.branches}
              value={values.branches}
              onChange={(e) => set('branches', e.target.value)}
              className="h-10 w-full text-[13px]"
            >
              <option value="">{t('Select')}</option>
              {BRANCH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          ))}
        </div>
        {field(ids.monthlyJobCards, 'Approximate monthly job cards', false, undefined, () => (
          <Input
            id={ids.monthlyJobCards}
            dir="ltr"
            inputMode="numeric"
            value={values.monthlyJobCards}
            onChange={(e) => set('monthlyJobCards', e.target.value)}
            placeholder={t('e.g. 150')}
            inputSize="sm"
          />
        ))}

        <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
          <legend className="mb-1 p-0 text-xs font-medium text-heading">
            {t('Areas of interest')}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INTEREST_OPTIONS.map((interest) => {
              const interestId = `${ids.name}-interest-${interest}`
              return (
                <label
                  key={interest}
                  htmlFor={interestId}
                  className="flex items-center gap-2 text-[13px] text-body"
                >
                  <input
                    id={interestId}
                    type="checkbox"
                    checked={values.interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="h-4 w-4 accent-salis-blue"
                  />
                  {t(interest)}
                </label>
              )
            })}
          </div>
        </fieldset>

        {field(ids.preferredContact, 'Preferred contact method', false, undefined, () => (
          <Select
            id={ids.preferredContact}
            value={values.preferredContact}
            onChange={(e) => set('preferredContact', e.target.value)}
            className="h-10 w-full text-[13px]"
          >
            <option value="">{t('Select')}</option>
            {CONTACT_METHOD_OPTIONS.map((opt) => (
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
            placeholder={t('Tell us about your workshop and what you need')}
          />
        ))}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.consent} className="flex items-start gap-2 text-[13px] text-body">
            <input
              id={ids.consent}
              type="checkbox"
              required
              checked={values.consent}
              onChange={(e) => set('consent', e.target.checked)}
              aria-describedby={errors.consent ? `${ids.consent}-error` : undefined}
              aria-invalid={!!errors.consent}
              className="mt-0.5 h-4 w-4 accent-salis-blue"
            />
            <span>
              {t('I agree to be contacted about this request, in line with the')}{' '}
              <Link to="/privacy-policy" className="text-salis-blue underline">
                {t('Privacy Policy')}
              </Link>
              .
            </span>
          </label>
          {errors.consent ? (
            <p id={`${ids.consent}-error`} className="m-0 text-xs text-salis-orange">
              {t(errors.consent)}
            </p>
          ) : null}
        </div>

        {status === 'sent' ? (
          <div
            role="status"
            className="rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-4 text-[13px] leading-relaxed text-heading"
          >
            <p className="m-0 font-semibold">{t('Demo request submitted.')}</p>
            <p className="mb-0 mt-1">
              {t('Thank you — a member of our sales team will contact you shortly.')}
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
          {status === 'sending' ? t('Sending…') : t('Submit Request')}
        </button>
      </form>
    </div>
  )
}
