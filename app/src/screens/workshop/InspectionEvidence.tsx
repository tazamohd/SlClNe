import { useRef, useState, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Loading } from '@/components/ui/States'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { queryKeys, useUpdate, type RowOf } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import type { InspectionAnnotation } from '@/data/repository'
import { useAuthenticatedMediaUrl } from '@/data/useAuthenticatedMedia'
import { transitionFailureMessage } from './api'
import { uploadInspectionMedia } from './inspection-api'
import { ANNOTATION_COLOR } from './annotation-colors'

type MediaRow = RowOf<'inspectionMedia'>

type Tool = 'point' | 'arrow' | 'text'

/** The photo/video evidence attached to one DVHC finding: a thumbnail strip,
 *  an "Add photo/video" control, and — for a photo — a click-to-annotate
 *  editor over the media's own 0–1 fractional coordinates, so an overlay
 *  survives being displayed at any size (`packages/contract/src/entities/inspection.ts`). */
export function InspectionEvidence({
  findingId,
  media,
  disabled,
}: {
  findingId: string
  media: readonly MediaRow[]
  disabled?: boolean
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [openMediaId, setOpenMediaId] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadInspectionMedia(findingId, file)
      await client.invalidateQueries({ queryKey: queryKeys.all('inspectionMedia') })
    } catch (cause) {
      toast.show({
        title: t('Upload failed'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setUploading(false)
    }
  }

  const openMedia = media.find((m) => m._id === openMediaId)

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1.5">
      {media.map((item) => (
        <EvidenceThumb key={item._id} item={item} onClick={() => setOpenMediaId(item._id ?? null)} />
      ))}

      <input
        ref={inputRef}
        type="file"
        aria-label={t('Add evidence photo or video')}
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading || !isLive}
        onClick={() => inputRef.current?.click()}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted transition-colors hover:border-salis-blue hover:text-salis-blue disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('Add evidence photo or video')}
        title={isLive ? t('Add evidence photo or video') : t('Set VITE_API_URL to run against the API')}
      >
        {uploading ? <Loading inline /> : <Icon name="Camera" size={18} />}
      </button>

      {openMedia ? (
        <EvidenceAnnotator media={openMedia} onClose={() => setOpenMediaId(null)} />
      ) : null}
    </div>
  )
}

function EvidenceThumb({ item, onClick }: { item: MediaRow; onClick: () => void }) {
  const { t } = usePreferences()
  const { src, error } = useAuthenticatedMediaUrl(item.url)

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-inset"
      aria-label={`${t(item.kind === 'photo' ? 'Photo' : 'Video')} — ${t(item.stage === 'before' ? 'Before' : 'After')}`}
    >
      {item.kind === 'photo' && src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : item.kind === 'video' ? (
        <span className="flex h-full w-full items-center justify-center text-muted">
          <Icon name="Play" size={16} />
        </span>
      ) : error ? (
        <span className="flex h-full w-full items-center justify-center text-muted">
          <Icon name="Image" size={16} />
        </span>
      ) : (
        <Loading inline />
      )}
      {item.annotations.length > 0 ? (
        <span className="absolute bottom-0.5 end-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-salis-orange text-[8px] font-bold text-white">
          {item.annotations.length}
        </span>
      ) : null}
    </button>
  )
}

/** Click-to-annotate over the media's natural size, converting every click to
 *  the 0–1 fraction the server stores. Three tools, chosen explicitly rather
 *  than inferred from click timing — a technician marking up a brake pad photo
 *  should never have a fast double-click misread as an arrow. */
function EvidenceAnnotator({ media, onClose }: { media: MediaRow; onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const { src } = useAuthenticatedMediaUrl(media.url)
  const update = useUpdate('inspectionMedia')
  const imgRef = useRef<HTMLImageElement>(null)

  const [tool, setTool] = useState<Tool>('point')
  const [color, setColor] = useState<InspectionAnnotation['color']>('orange')
  const [draft, setDraft] = useState<InspectionAnnotation[]>(media.annotations)
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null)
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; value: string } | null>(null)

  function fractionOf(e: MouseEvent<HTMLDivElement>): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    }
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (media.kind !== 'photo') return
    const point = fractionOf(e)
    if (tool === 'point') {
      setDraft((prev) => [...prev, { type: 'box', x: point.x, y: point.y, color }])
    } else if (tool === 'text') {
      setTextDraft({ ...point, value: '' })
    } else if (tool === 'arrow') {
      if (!arrowStart) {
        setArrowStart(point)
      } else {
        setDraft((prev) => [...prev, { type: 'arrow', x: arrowStart.x, y: arrowStart.y, x2: point.x, y2: point.y, color }])
        setArrowStart(null)
      }
    }
  }

  function commitText() {
    if (textDraft && textDraft.value.trim()) {
      setDraft((prev) => [...prev, { type: 'text', x: textDraft.x, y: textDraft.y, text: textDraft.value.trim(), color }])
    }
    setTextDraft(null)
  }

  function removeAt(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }

  async function save() {
    try {
      if (!media._id) return
      await update.mutateAsync({ id: media._id, patch: { annotations: draft } as Partial<MediaRow> })
      toast.show({ title: t('Annotations saved'), description: `${draft.length} ${t('marks')}` })
      onClose()
    } catch (cause) {
      toast.show({
        title: t('Could not save annotations'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    }
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(media.annotations)

  return (
    <Modal
      open
      onClose={onClose}
      title="Inspection evidence"
      variant="data"
      icon="Camera"
      footer={
        media.kind === 'photo' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button onClick={() => void save()} disabled={!dirty || update.isPending}>
              {update.isPending ? t('Saving...') : t('Save annotations')}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            {t('Close')}
          </Button>
        )
      }
    >
      {media.kind === 'photo' ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ToolButton icon="Circle" label={t('Point')} active={tool === 'point'} onClick={() => setTool('point')} />
            <ToolButton icon="ArrowUpRight" label={t('Arrow')} active={tool === 'arrow'} onClick={() => setTool('arrow')} />
            <ToolButton icon="Type" label={t('Text')} active={tool === 'text'} onClick={() => setTool('text')} />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ToolButton icon="Palette" label={t('Blue')} active={color === 'blue'} onClick={() => setColor('blue')} dotColor="var(--salis-blue)" />
            <ToolButton icon="Palette" label={t('Orange')} active={color === 'orange'} onClick={() => setColor('orange')} dotColor="var(--salis-orange)" />
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label={t('Click the photo to place a mark.')}
            onClick={handleClick}
            className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-lg border border-border bg-inset"
          >
            {src ? (
              <img ref={imgRef} src={src} alt="" className="h-full w-full object-contain" draggable={false} />
            ) : (
              <Loading inline label={t('Loading evidence...')} />
            )}
            {draft.map((a, i) => (
              <AnnotationMark key={i} annotation={a} onRemove={() => removeAt(i)} />
            ))}
            {arrowStart ? (
              <span
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                style={{ left: `${arrowStart.x * 100}%`, top: `${arrowStart.y * 100}%`, background: ANNOTATION_COLOR[color] }}
              />
            ) : null}
          </div>

          {textDraft ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                aria-label={t('Label this mark...')}
                value={textDraft.value}
                onChange={(e) => setTextDraft({ ...textDraft, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitText()
                  if (e.key === 'Escape') setTextDraft(null)
                }}
                placeholder={t('Label this mark...')}
                className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
              />
              <Button size="sm" onClick={commitText}>
                {t('Add')}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted">
              {tool === 'arrow' && arrowStart
                ? t('Click the arrow head.')
                : t('Click the photo to place a mark.')}
            </p>
          )}
        </div>
      ) : (
        <video src={src ?? undefined} controls className="w-full rounded-lg" />
      )}
    </Modal>
  )
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
  dotColor,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  dotColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
        active ? 'border-salis-blue bg-tint-blue text-salis-blue' : 'border-border text-muted hover:text-body'
      }`}
    >
      {dotColor ? (
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dotColor }} aria-hidden />
      ) : (
        <Icon name={icon} size={14} />
      )}
      {label}
    </button>
  )
}

function AnnotationMark({ annotation, onRemove }: { annotation: InspectionAnnotation; onRemove: () => void }) {
  const color = ANNOTATION_COLOR[annotation.color]
  if (annotation.type === 'text') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white"
        style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%` }}
      >
        {annotation.text}
      </button>
    )
  }
  if (annotation.type === 'arrow' && annotation.x2 !== undefined && annotation.y2 !== undefined) {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <line
          x1={`${annotation.x * 100}%`}
          y1={`${annotation.y * 100}%`}
          x2={`${annotation.x2 * 100}%`}
          y2={`${annotation.y2 * 100}%`}
          stroke={color}
          strokeWidth={2}
          markerEnd="url(#dvhc-arrowhead)"
        />
        <defs>
          <marker id="dvhc-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={color} />
          </marker>
        </defs>
      </svg>
    )
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
      className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
      style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, background: color }}
      aria-label="Remove mark"
    />
  )
}
