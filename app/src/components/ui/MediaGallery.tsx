import { useState } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Card } from './Card'
import { Icon } from './Icon'

export interface MediaItem {
  id: string
  src: string
  thumbnail?: string
  alt?: string
  type?: 'image' | 'video'
  caption?: string
}

export interface MediaGalleryProps {
  items: readonly MediaItem[]
  title?: string
  columns?: 2 | 3 | 4
  onItemClick?: (item: MediaItem) => void
  onDelete?: (item: MediaItem) => void
  className?: string
}

export function MediaGallery({
  items,
  title,
  columns = 3,
  onItemClick,
  onDelete,
  className,
}: MediaGalleryProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)

  const cols = isMobile ? 2 : columns

  const openLightbox = (item: MediaItem) => {
    if (onItemClick) {
      onItemClick(item)
      return
    }
    setLightbox(item)
  }

  return (
    <>
      <Card className={cn('p-4', className)}>
        {title ? <h2 className="mb-3 text-sm font-bold text-heading">{t(title)}</h2> : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon name="Image" size={32} className="text-muted/40" />
            <p className="text-sm text-muted">{t('No media')}</p>
          </div>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
                  onClick={() => openLightbox(item)}
                >
                  <div className="relative aspect-square">
                    {item.type === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center bg-salis-navy/5">
                        <Icon name="Play" size={32} className="text-muted/60" />
                      </div>
                    ) : (
                      <img
                        src={item.thumbnail ?? item.src}
                        alt={item.alt ?? ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                </button>
                {item.caption ? (
                  <p className="mt-1 truncate text-xs text-muted">{item.caption}</p>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(item)
                    }}
                    aria-label={t('Remove')}
                  >
                    <Icon name="X" size={12} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt ?? t('Media preview')}
        >
          <button
            type="button"
            className="absolute inset-0 border-none bg-transparent"
            onClick={() => setLightbox(null)}
            aria-label={t('Close')}
            tabIndex={-1}
          />
          <button
            type="button"
            className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label={t('Close')}
          >
            <Icon name="X" size={20} />
          </button>

          <div className="relative z-10 max-h-[90vh] max-w-[90vw]">
            {lightbox.type === 'video' ? (
              <div className="flex h-64 w-96 items-center justify-center rounded-lg bg-salis-navy/20 text-white">
                <Icon name="Play" size={48} />
              </div>
            ) : (
              <img
                src={lightbox.src}
                alt={lightbox.alt ?? ''}
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            )}
            {lightbox.caption ? (
              <p className="mt-3 text-center text-sm text-white/80">{lightbox.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
