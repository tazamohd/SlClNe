import { useEffect } from 'react'

/** Per-page `<title>` and meta description for the public marketing pages.
 *
 *  There is no head-manager dependency in this repository and the orchestrator
 *  serialises package.json, so this is the no-dependency version: a small
 *  effect that owns exactly two head tags. It is deliberately minimal — Open
 *  Graph, canonical URLs and structured data need a configured public origin
 *  (none exists yet) and belong to the same later pass as registry-generated
 *  sitemaps.
 *
 *  The description tag is created on first use and reused after; the app's
 *  index.html does not ship one, so nothing is fought over. */
export interface PageMeta {
  title: string
  description: string
}

export function usePageMeta({ title, description }: PageMeta): void {
  useEffect(() => {
    document.title = title

    let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }, [title, description])
}
