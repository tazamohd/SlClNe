import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'
import { TINT_CHIP, type Tint } from './tints'

/** The icon-chip card grid that three designs share:
 *
 *  - Landing "features"   — 3 columns, start-aligned text
 *  - Services             — 4 columns, centred text
 *  - Support channels     — 3 columns, centred text, each card a real link
 *
 *  A card with a `to`/`href`/`tel`/`mailto` destination renders as a link and
 *  keeps the design's hover lift; a card without one renders as a plain
 *  `<article>` with no pointer cursor. The Services and Landing designs paint
 *  `cursor:pointer` on cards that lead nowhere — reproducing that would be a
 *  dead CTA, so informational cards are deliberately non-interactive here. */
export interface IconCardItem {
  icon: string
  title: string
  description: string
  tint: Tint
  /** Internal route — renders the card as a router Link. */
  to?: string
  /** External/protocol destination (`tel:`, `mailto:`) — renders an `<a>`. */
  href?: string
}

export interface IconCardGridProps {
  items: readonly IconCardItem[]
  columns?: 3 | 4
  centered?: boolean
  iconSize?: number
  /** Accessible name for the grid when it is a set of navigation cards. */
  ariaLabel?: string
}

const CARD =
  'block rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 ' +
  'no-underline hover:no-underline'
const CARD_HOVER = 'hover:border-salis-blue/[.3] hover:shadow-lg hover:-translate-y-1'

function CardBody({
  item,
  centered,
  iconSize,
  t,
}: {
  item: IconCardItem
  centered: boolean
  iconSize: number
  t: (s: string) => string
}) {
  return (
    <>
      <span className={cn('inline-flex rounded-[14px] p-3', TINT_CHIP[item.tint])}>
        <Icon name={item.icon} size={iconSize} />
      </span>
      {/* h2, not the design's h3: each card sits directly under the page h1,
          and a skipped heading level fails the hierarchy check. Visuals are
          class-driven, so the tag change costs nothing. */}
      <h2
        className={cn(
          'mb-1.5 mt-3.5 text-[15px] font-bold text-heading md:text-[17px]',
          centered && 'text-center'
        )}
      >
        {t(item.title)}
      </h2>
      <p className={cn('m-0 text-[13px] leading-normal text-muted', centered && 'text-center')}>
        {t(item.description)}
      </p>
    </>
  )
}

export function IconCardGrid({
  items,
  columns = 3,
  centered = false,
  iconSize = 22,
  ariaLabel,
}: IconCardGridProps) {
  const t = useT()
  // 1 column on a phone, 2 from `md`, the full count from `lg` — the tablet
  // tier is out of scope, so the middle step exists only so the desktop
  // breakpoint has something to widen from.
  const grid = cn(
    'grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6',
    columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
  )

  const card = (item: IconCardItem): ReactNode => {
    const body = <CardBody item={item} centered={centered} iconSize={iconSize} t={t} />
    const className = cn(CARD, centered && 'text-center', (item.to || item.href) && CARD_HOVER)
    if (item.to) {
      return (
        <Link key={item.title} to={item.to} className={className}>
          {body}
        </Link>
      )
    }
    if (item.href) {
      return (
        <a key={item.title} href={item.href} className={className}>
          {body}
        </a>
      )
    }
    return (
      <article key={item.title} className={className}>
        {body}
      </article>
    )
  }

  return ariaLabel ? (
    <nav aria-label={t(ariaLabel)} className={grid}>
      {items.map(card)}
    </nav>
  ) : (
    <div className={grid}>{items.map(card)}</div>
  )
}
