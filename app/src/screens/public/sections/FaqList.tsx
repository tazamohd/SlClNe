import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'

/** The FAQ as an accordion. Every question is a ≥44px button with
 *  `aria-expanded`; more than one can be open at once, and the first opens by
 *  default so the section never reads as an empty list of headings. */
export interface FaqItem {
  question: string
  answer: string
}

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  const t = useT()
  return (
    <Accordion multiple defaultOpen={items.length ? ['faq-0'] : []} className="rounded-2xl bg-card">
      {items.map((faq, index) => (
        <AccordionItem
          key={faq.question}
          id={`faq-${index}`}
          title={
            <span className="flex min-h-[28px] items-center gap-2 text-[15px] font-semibold">
              <Icon name="HelpCircle" size={16} className="flex-shrink-0 text-salis-blue" />
              {t(faq.question)}
            </span>
          }
        >
          <p className="m-0 ps-6 text-[14px] leading-[1.6] text-muted">{t(faq.answer)}</p>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
