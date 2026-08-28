import { useRef, type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from './Card'
import { Icon } from './Icon'
import { Button } from './Button'

export interface AttachmentFile {
  id: string
  name: string
  size: string
  type: string
  icon?: string
}

export interface AttachmentsProps {
  files: readonly AttachmentFile[]
  title?: string
  onUpload?: (files: FileList) => void
  onDownload?: (file: AttachmentFile) => void
  onRemove?: (file: AttachmentFile) => void
  accept?: string
  maxSizeMb?: number
  className?: string
}

const FILE_ICON: Record<string, { icon: string; color: string }> = {
  PDF: { icon: 'FileText', color: 'var(--salis-blue)' },
  Image: { icon: 'Image', color: 'var(--salis-orange)' },
  Spreadsheet: { icon: 'FileSpreadsheet', color: 'var(--text-muted)' },
  Document: { icon: 'FileText', color: 'var(--salis-blue)' },
}

export function Attachments({
  files,
  title,
  onUpload,
  onDownload,
  onRemove,
  accept,
  maxSizeMb = 10,
  className,
}: AttachmentsProps) {
  const { t } = usePreferences()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length && onUpload) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <Card className={cn('flex flex-col gap-3.5 p-5', className)}>
      {title ? (
        <div className="flex items-center gap-2">
          <Icon name="Paperclip" size={16} className="text-salis-blue" />
          <h2 className="text-sm font-bold text-heading">{t(title)}</h2>
          <span className="ms-auto text-xs text-muted">{files.length}</span>
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="flex flex-col gap-2">
          {files.map((f) => {
            const look = FILE_ICON[f.type] ?? { icon: f.icon ?? 'File', color: 'var(--text-muted)' }
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${look.color}15` }}
                >
                  <Icon name={look.icon} size={20} style={{ color: look.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{f.name}</p>
                  <p className="text-xs text-muted">
                    {t(f.type)} &middot; {f.size}
                  </p>
                </div>
                {onDownload ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(f)}
                    aria-label={t('Download')}
                  >
                    <Icon name="Download" size={14} />
                  </Button>
                ) : null}
                {onRemove ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(f)}
                    aria-label={t('Remove')}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {onUpload ? (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleChange}
            className="hidden"
            aria-label={t('Upload files')}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-transparent py-8 transition-colors hover:border-salis-blue"
          >
            <Icon name="Upload" size={28} className="text-muted" />
            <p className="text-sm font-medium text-heading">
              {t('Drag files here or click to upload')}
            </p>
            <p className="text-xs text-muted">
              {t('PDF, JPG, PNG up to')} {maxSizeMb}MB
            </p>
          </button>
        </>
      ) : null}
    </Card>
  )
}
