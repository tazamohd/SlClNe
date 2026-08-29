import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Card } from './Card'
import { Icon } from './Icon'
import type { ReactNode } from 'react'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  label?: string
  icon?: string
  color?: string
  data?: unknown
}

export interface MapViewProps {
  markers?: readonly MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onMarkerClick?: (marker: MapMarker) => void
  selectedId?: string
  sidebar?: ReactNode
  className?: string
}

export function MapView({
  markers = [],
  center,
  height,
  onMarkerClick,
  selectedId,
  sidebar,
  className,
}: MapViewProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const c = center ?? (markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 24.7136, lng: 46.6753 })

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn('flex', isMobile ? 'flex-col' : 'flex-row')}>
        <div
          className={cn(
            'relative flex items-center justify-center bg-salis-navy/5',
            isMobile ? 'w-full' : 'flex-1'
          )}
          style={{ height: height ?? (isMobile ? '240px' : '400px') }}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <Icon name="MapPin" size={40} className="text-salis-blue/30" />
              <p className="text-sm text-muted">{t('Map requires integration')}</p>
              <p className="text-xs text-muted/60">{`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`}</p>
            </div>

            {markers.map((marker) => {
              const selected = marker.id === selectedId
              return (
                <button
                  key={marker.id}
                  type="button"
                  className={cn(
                    'absolute z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-all',
                    selected
                      ? 'bg-salis-blue text-white ring-2 ring-salis-blue/30'
                      : 'bg-white text-heading hover:bg-salis-blue/10 dark:bg-surface dark:text-heading',
                    onMarkerClick ? 'cursor-pointer' : 'pointer-events-none'
                  )}
                  style={{
                    top: `${20 + ((marker.lat - c.lat + 0.05) / 0.1) * 60}%`,
                    insetInlineStart: `${20 + ((marker.lng - c.lng + 0.05) / 0.1) * 60}%`,
                  }}
                  onClick={onMarkerClick ? () => onMarkerClick(marker) : undefined}
                  aria-label={marker.label}
                >
                  <Icon
                    name={marker.icon ?? 'MapPin'}
                    size={12}
                    style={marker.color ? { color: marker.color } : undefined}
                  />
                  {marker.label ? <span className="max-w-[80px] truncate">{marker.label}</span> : null}
                </button>
              )
            })}
          </div>
        </div>

        {sidebar ? (
          <div
            className={cn(
              'border-border',
              isMobile ? 'border-t' : 'w-72 border-s',
              'overflow-y-auto'
            )}
            style={isMobile ? undefined : { maxHeight: height ?? '400px' }}
          >
            {sidebar}
          </div>
        ) : markers.length > 0 ? (
          <div
            className={cn(
              'border-border',
              isMobile ? 'border-t' : 'w-64 border-s',
              'overflow-y-auto'
            )}
            style={isMobile ? undefined : { maxHeight: height ?? '400px' }}
          >
            <div className="divide-y divide-border">
              {markers.map((marker) => {
                const selected = marker.id === selectedId
                return (
                  <button
                    key={marker.id}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-start transition-colors',
                      selected ? 'bg-salis-blue/5' : 'hover:bg-salis-blue/5',
                      onMarkerClick ? 'cursor-pointer' : 'cursor-default'
                    )}
                    onClick={onMarkerClick ? () => onMarkerClick(marker) : undefined}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: (marker.color ?? 'var(--salis-blue)') + '1a' }}
                    >
                      <Icon
                        name={marker.icon ?? 'MapPin'}
                        size={14}
                        style={{ color: marker.color ?? 'var(--salis-blue)' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-heading">{marker.label ?? marker.id}</p>
                      <p className="text-xs text-muted" dir="ltr">
                        {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
