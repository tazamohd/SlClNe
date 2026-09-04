import { useRef, useState } from 'react'
import { z } from 'zod'
import { useZodForm } from '@/components/ui/Form'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { LeadField } from './sections/LeadField'
import { LEADS_LIVE, LeadOutcome, submitLead, type LeadStatus } from './sections/LeadOutcome'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.BookDemo — Tier C lead-capture page.
 *
 *  Like RequestDemo but focused on a time slot. Validates per field on blur
 *  and on submit, then posts the lead to `POST /public/leads` with the slot
 *  folded into the message. The outcome is inline, never a toast: a visitor
 *  who just filled a form needs a message that stays. On the fixture build
 *  there is no server to accept it, and the panel says so. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/

const RULES = {
  name: z.string().trim().min(2, 'Please enter your name.'),
  email: z.string().trim().min(1, 'Please enter your email address.').regex(EMAIL_RE, 'Please enter a valid email address.'),
  phone: z.string().trim().regex(PHONE_RE, 'Please enter a valid phone number.').or(z.literal('')),
  company: z.string().trim().min(2, 'Please enter your company name.'),
  date: z.string().min(1, 'Please pick a date.'),
  time: z.string().min(1, 'Please pick a time slot.'),
  message: z.string().trim(),
}

const schema = z.object(RULES)
type Values = z.input<typeof schema>

const EMPTY: Values = { name: '', email: '', phone: '', company: '', date: '', time: '', message: '' }

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
] as const

export function PublicBookDemo() {
  const t = useT()
  usePageMeta({
    title: t('Book a Demo — SALIS AUTO'),
    description: t('Schedule a personalised demo of SALIS AUTO at a time that suits you'),
  })

  const [status, setStatus] = useState<LeadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const clearForm = useRef<() => void>(() => {})

  const form = useZodForm({
    schema,
    initial: EMPTY,
    onSubmit: async (values) => {
      if (!LEADS_LIVE) {
        setStatus('unavailable')
        return
      }
      setStatus('sending')
      const result = await submitLead({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: [
          `Company: ${values.company}`,
          `Preferred: ${values.date} (${values.time})`,
          values.message,
        ]
          .filter(Boolean)
          .join('\n'),
        source: 'Book a Demo',
      })
      if (result.ok) {
        clearForm.current()
        setStatus('sent')
        return
      }
      setErrorMessage(
        result.transport
          ? t('We could not reach the server. Please try again, or contact us directly.')
          : result.message ?? t('Too many requests from this address. Please wait a minute and try again.')
      )
      setStatus('error')
    },
  })
  clearForm.current = () => form.reset(EMPTY)

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Book a Demo"
        subtitle="Pick a date and time and we will walk you through the platform live"
      />
      <form
        noValidate
        onSubmit={form.submit}
        aria-label={t('Book a demo')}
        className="mx-auto flex max-w-[560px] flex-col gap-4 rounded-2xl border border-border bg-card p-6"
      >
        {status === 'sent' ? (
          <LeadOutcome
            status={status}
            errorMessage={errorMessage}
            sentTitle="Demo booked"
            sentDescription="We will confirm your demo time by email shortly."
            onReset={() => setStatus('idle')}
          />
        ) : (
          <>
            <LeadField form={form} name="name" label="Name" rule={RULES.name} placeholder="Your full name" autoComplete="name" />
            <LeadField form={form} name="email" label="Email" kind="email" rule={RULES.email} placeholder="your@email.com" autoComplete="email" />
            <LeadField form={form} name="phone" label="Phone" kind="tel" rule={RULES.phone} placeholder="+966 5x xxx xxxx" autoComplete="tel" />
            <LeadField form={form} name="company" label="Company Name" rule={RULES.company} placeholder="Your company" autoComplete="organization" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LeadField form={form} name="date" label="Preferred Date" kind="date" rule={RULES.date} />
              <LeadField form={form} name="time" label="Preferred Time" kind="select" rule={RULES.time} placeholder="Select a time slot" options={TIME_OPTIONS} />
            </div>
            <LeadField form={form} name="message" label="Message" kind="textarea" placeholder="Anything specific you would like to see?" />

            <LeadOutcome
              status={status}
              errorMessage={errorMessage}
              sentTitle="Demo booked"
              sentDescription="We will confirm your demo time by email shortly."
              onReset={() => setStatus('idle')}
            />

            <button
              type="submit"
              disabled={form.pending}
              className="mt-2 h-12 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {form.pending ? t('Sending…') : t('Book Demo')}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
