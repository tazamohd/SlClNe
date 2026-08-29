import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'

/** The FAQ page's question cards. The design shows every answer expanded —
 *  a static list, not an accordion — so this stays non-interactive: nothing to
 *  focus, nothing to mis-toggle, and the whole page is readable by find-in-page
 *  and screen readers alike.
 *
 *  Layout is logical throughout: the design itself uses
 *  `padding-inline-start` for the answer indent, kept here as `ps-6`. */
export interface FaqItem {
  question: string
  answer: string
}

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  const t = useT()
  return (
    <div className="flex flex-col gap-3">
      {items.map((faq) => (
        <div
          key={faq.question}
          className="rounded-[14px] border border-border bg-card p-[18px]"
        >
          {/* h2 (design draws h3): questions sit directly under the page h1. */}
          <h2 className="mb-2 mt-0 flex items-center gap-2 text-[15px] font-semibold text-heading">
            <Icon name="HelpCircle" size={16} className="flex-shrink-0 text-salis-blue" />
            {t(faq.question)}
          </h2>
          <p className="m-0 ps-6 text-[13px] leading-[1.6] text-muted">{t(faq.answer)}</p>
        </div>
      ))}
    </div>
  )
}
