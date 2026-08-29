import { useRef, type FormEvent } from 'react'
import { useT } from '@/providers/PreferencesProvider'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.RequestDemo — Tier B lead-capture page.
 *
 *  A simple demo-request form. On valid submission it shows a toast and resets.
 *  No backend endpoint exists yet — the form captures intent; delivery is a
 *  follow-up task. */
const INPUT =
  'w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm text-body ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-salis-blue'

const WORKSHOP_OPTIONS = ['1', '2-5', '6-10', '10+'] as const

export function PublicRequestDemo() {
  const t = useT()
  const toast = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  usePageMeta({
    title: t('Request Demo — SALIS AUTO'),
    description: t('Book a personalised demo of the SALIS AUTO workshop management platform'),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    toast.show({
      title: t('Demo request submitted'),
      description: t('Our team will contact you within 24 hours.'),
    })
    formRef.current?.reset()
  }

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Request a Demo"
        subtitle="See how SALIS AUTO can streamline your workshop operations"
      />
      <form
        ref={formRef}
        onSubmit={submit}
        className="mx-auto flex max-w-[560px] flex-col gap-4 rounded-2xl border border-default bg-card p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-name" className="text-xs font-medium text-heading">{t('Name')}</label>
          <Input id="demo-name" required placeholder={t('Your full name')} inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-email" className="text-xs font-medium text-heading">{t('Email')}</label>
          <Input id="demo-email" required type="email" dir="ltr" placeholder="your@email.com" inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-phone" className="text-xs font-medium text-heading">{t('Phone')}</label>
          <Input id="demo-phone" type="tel" dir="ltr" placeholder="+966 5x xxx xxxx" inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-company" className="text-xs font-medium text-heading">{t('Company Name')}</label>
          <Input id="demo-company" required placeholder={t('Your company')} inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-workshops" className="text-xs font-medium text-heading">{t('Workshop Count')}</label>
          <Select id="demo-workshops" required className={INPUT} defaultValue="">
            <option value="" disabled>
              {t('Select number of workshops')}
            </option>
            {WORKSHOP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="demo-message" className="text-xs font-medium text-heading">{t('Message')}</label>
          <Textarea id="demo-message" rows={4} placeholder={t('Tell us about your needs')} />
        </div>
        <button
          type="submit"
          className="mt-2 h-11 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {t('Submit Request')}
        </button>
      </form>
    </div>
  )
}
