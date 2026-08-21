import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { FaqList, type FaqItem } from './sections/FaqList'

/** PublicPortal.FAQ — `project/PublicPortal.FAQ.dc.html`. */
const FAQS: readonly FaqItem[] = [
  {
    question: 'How do I book an appointment?',
    answer: 'You can book through our app, website, or by calling any branch. Walk-ins are also welcome.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept cash, Mada, Visa/Mastercard, Apple Pay, and SALIS Wallet.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use enterprise-grade encryption and comply with Saudi data protection regulations.',
  },
  {
    question: 'Do you offer warranty on repairs?',
    answer: 'All repairs come with a 6-month or 10,000km warranty, whichever comes first.',
  },
  {
    question: "Can I track my vehicle's service status?",
    answer: 'Yes, real-time tracking is available through the customer portal and mobile app.',
  },
  {
    question: 'Do you service all car brands?',
    answer: 'We service all major brands including Toyota, Nissan, Hyundai, Lexus, Ford, GMC, and more.',
  },
]

export function PublicFaq() {
  const t = useT()
  usePageMeta({
    title: t('FAQ — SALIS AUTO'),
    description: t('Frequently asked questions'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  })

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro centered title="FAQ" subtitle="Frequently asked questions" />
      <FaqList items={FAQS} />
    </div>
  )
}
