import { useRef, useState } from 'react'
import { z } from 'zod'
import { useZodForm } from '@/components/ui/Form'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { LeadField } from './sections/LeadField'
import { LEADS_LIVE, LeadOutcome, submitLead, type LeadStatus } from './sections/LeadOutcome'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.RequestDemo — Tier B lead-capture page.
 *
 *  Validates per field on blur and on submit, then posts the lead to
 *  `POST /public/leads` with the workshop count folded into the message. The
 *  outcome is inline, never a toast. On the fixture build there is no server
 *  to accept it, and the panel says so rather than faking a success. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/

const RULES = {
  name: z.string().trim().min(2, 'Please enter your name.'),
  email: z.string().trim().min(1, 'Please enter your email address.').regex(EMAIL_RE, 'Please enter a valid email address.'),
  phone: z.string().trim().regex(PHONE_RE, 'Please enter a valid phone number.').or(z.literal('')),
  company: z.string().trim().min(2, 'Please enter your company name.'),
  workshops: z.string().min(1, 'Please select the number of workshops.'),
  message: z.string().trim(),
}

const schema = z.object(RULES)
type Values = z.input<typeof schema>

const EMPTY: Values = { name: '', email: '', phone: '', company: '', workshops: '', message: '' }

const WORKSHOP_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2-5', label: '2-5' },
  { value: '6-10', label: '6-10' },
  { value: '10+', label: '10+' },
] as const

export function PublicRequestDemo() {
  const t = useT()
  usePageMeta({
    title: t('Request Demo — SALIS AUTO'),
    description: t('Book a personalised demo of the SALIS AUTO workshop management platform'),
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
        message: [`Company: ${values.company}`, `Workshops: ${values.workshops}`, values.message]
          .filter(Boolean)
          .join('\n'),
        source: 'Request Demo',
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
        title="Request a Demo"
        subtitle="See how SALIS AUTO can streamline your workshop operations"
      />
      <form
        noValidate
        onSubmit={form.submit}
        aria-label={t('Request a demo')}
        className="mx-auto flex max-w-[560px] flex-col gap-4 rounded-2xl border border-border bg-card p-6"
      >
        {status === 'sent' ? (
          <LeadOutcome
            status={status}
            errorMessage={errorMessage}
            sentTitle="Demo request submitted"
            sentDescription="Our team will contact you within 24 hours."
            onReset={() => setStatus('idle')}
          />
        ) : (
          <>
            <LeadField form={form} name="name" label="Name" rule={RULES.name} placeholder="Your full name" autoComplete="name" />
            <LeadField form={form} name="email" label="Email" kind="email" rule={RULES.email} placeholder="your@email.com" autoComplete="email" />
            <LeadField form={form} name="phone" label="Phone" kind="tel" rule={RULES.phone} placeholder="+966 5x xxx xxxx" autoComplete="tel" />
            <LeadField form={form} name="company" label="Company Name" rule={RULES.company} placeholder="Your company" autoComplete="organization" />
            <LeadField form={form} name="workshops" label="Workshop Count" kind="select" rule={RULES.workshops} placeholder="Select number of workshops" options={WORKSHOP_OPTIONS} />
            <LeadField form={form} name="message" label="Message" kind="textarea" placeholder="Tell us about your needs" />

            <LeadOutcome
              status={status}
              errorMessage={errorMessage}
              sentTitle="Demo request submitted"
              sentDescription="Our team will contact you within 24 hours."
              onReset={() => setStatus('idle')}
            />

            <button
              type="submit"
              disabled={form.pending}
              className="mt-2 h-12 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {form.pending ? t('Sending…') : t('Submit Request')}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
