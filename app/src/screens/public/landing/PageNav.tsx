import type { PageKey, T } from './types'

interface PageDef {
  readonly key: PageKey
  readonly label: string
  readonly note: string
}

/** The six pages, their nav label and a real one-line note for each — a
 *  function of `t` rather than a module constant, so every string here is a
 *  literal `t(...)` call site `check-i18n` can see. */
export function pageDefs(t: T): readonly PageDef[] {
  return [
    { key: 'index', label: t('Arrival'), note: t('The pitch, the lifecycle and the proof') },
    { key: 'system', label: t('System'), note: t('Thirteen domains and fourteen roles') },
    { key: 'grid', label: t('Grid'), note: t('Parts, procurement and the three portals') },
    { key: 'access', label: t('Access'), note: t('The real plans, and what each includes') },
    { key: 'origin', label: t('Origin'), note: t('Who builds this, and who is hiring') },
    { key: 'channel', label: t('Channel'), note: t('Book a demo, or ask a question') },
  ]
}

/** In-page tab nav — distinct from PublicShell's site-wide nav, this one
 *  switches between the six pages of this one screen. A real `<nav>` of real
 *  buttons, not a duplicate of the site's own primary navigation. */
export function PageNav({ page, onSelect, t }: { page: PageKey; onSelect: (page: PageKey) => void; t: T }) {
  return (
    <nav className="page-nav" aria-label={t('SALIS AUTO sections')}>
      {pageDefs(t).map((def) => (
        <button
          key={def.key}
          type="button"
          className={def.key === page ? 'on' : undefined}
          aria-current={def.key === page ? 'page' : undefined}
          onClick={() => onSelect(def.key)}
        >
          <b>{def.label}</b>
          <span>{def.note}</span>
        </button>
      ))}
    </nav>
  )
}
