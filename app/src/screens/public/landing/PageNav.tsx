import type { PageKey, T } from './types'

interface PageDef {
  readonly key: PageKey
  readonly label: string
  readonly note: string
}

/** The six pages, their nav label and their one-line note — the `PAGES` array
 *  from the "SALIS AUTO 2030" artifact, verbatim. A function of `t` rather
 *  than a module constant, so every string here is a literal `t(...)` call
 *  site `check-i18n` can see. */
export function pageDefs(t: T): readonly PageDef[] {
  return [
    { key: 'index', label: t('Arrival'), note: t('The workshop floor, and what the system does on it') },
    { key: 'system', label: t('System'), note: t('Thirteen domains, fourteen roles, one contract') },
    { key: 'grid', label: t('Grid'), note: t('Parts, purchasing, suppliers and the portals') },
    { key: 'access', label: t('Access'), note: t('What a month costs and what comes with it') },
    { key: 'origin', label: t('Origin'), note: t('Who builds this, what it holds to, who it is for') },
    { key: 'channel', label: t('Channel'), note: t('Book a demo, ask a question, start a pilot') },
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
