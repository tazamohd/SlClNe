import { useEffect } from 'react'

/** Per-page `<title>`, meta description, and optional JSON-LD structured data
 *  for the public marketing pages.
 *
 *  There is no head-manager dependency in this repository and the orchestrator
 *  serialises package.json, so this is the no-dependency version: a small
 *  effect that owns exactly two head tags plus an optional ld+json script.
 *
 *  The description tag is created on first use and reused after; the app's
 *  index.html does not ship one, so nothing is fought over. */
export interface PageMeta {
  title: string
  description: string
  structuredData?: Record<string, unknown>
}

const LD_ID = 'salis-ld-json'

export function usePageMeta({ title, description, structuredData }: PageMeta): void {
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

  useEffect(() => {
    let script = document.getElementById(LD_ID) as HTMLScriptElement | null
    if (structuredData) {
      if (!script) {
        script = document.createElement('script')
        script.id = LD_ID
        script.setAttribute('type', 'application/ld+json')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(structuredData)
    } else if (script) {
      script.remove()
    }
    return () => {
      document.getElementById(LD_ID)?.remove()
    }
  }, [structuredData])
}
