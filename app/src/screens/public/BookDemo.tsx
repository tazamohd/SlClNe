import { useRef, type FormEvent } from 'react'
import { useT } from '@/providers/PreferencesProvider'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.BookDemo — Tier C lead-capture page.
 *
 *  Similar to RequestDemo but focused on scheduling a specific time slot.
 *  On valid submission it shows a toast and resets. No backend endpoint exists
 *  yet — the form captures intent; delivery is a follow-up task. */
const INPUT =
  'w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm text-body ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-salis-blue'

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening'] as const

export function PublicBookDemo() {
  const t = useT()
  const toast = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  usePageMeta({
    title: t('Book a Demo — SALIS AUTO'),
    description: t('Schedule a personalised demo of SALIS AUTO at a time that suits you'),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    toast.show({
      title: t('Demo booked successfully'),
      description: t('We will confirm your demo time shortly.'),
    })
    formRef.current?.reset()
  }

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Book a Demo"
        subtitle="Pick a date and time and we will walk you through the platform live"
      />
      <form
        ref={formRef}
        onSubmit={submit}
        className="mx-auto flex max-w-[560px] flex-col gap-4 rounded-2xl border border-default bg-card p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-name" className="text-xs font-medium text-heading">{t('Name')}</label>
          <Input id="book-name" required placeholder={t('Your full name')} inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-email" className="text-xs font-medium text-heading">{t('Email')}</label>
          <Input id="book-email" required type="email" dir="ltr" placeholder="your@email.com" inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-phone" className="text-xs font-medium text-heading">{t('Phone')}</label>
          <Input id="book-phone" type="tel" dir="ltr" placeholder="+966 5x xxx xxxx" inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-company" className="text-xs font-medium text-heading">{t('Company Name')}</label>
          <Input id="book-company" required placeholder={t('Your company')} inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-date" className="text-xs font-medium text-heading">{t('Preferred Date')}</label>
          <Input id="book-date" required type="date" inputSize="sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-time" className="text-xs font-medium text-heading">{t('Preferred Time')}</label>
          <Select id="book-time" required className={INPUT} defaultValue="">
            <option value="" disabled>
              {t('Select a time slot')}
            </option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-message" className="text-xs font-medium text-heading">{t('Message')}</label>
          <textarea id="book-message" rows={4} placeholder={t('Anything specific you would like to see?')} className={INPUT} />
        </div>
        <button
          type="submit"
          className="mt-2 h-11 cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white"
        >
          {t('Book Demo')}
        </button>
      </form>
    </div>
  )
}
