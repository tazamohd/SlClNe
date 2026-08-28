import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from './Card'
import { Button } from './Button'
import { Icon } from './Icon'

export interface ImportField {
  name: string
  required?: boolean
  example?: string
}

export interface ImportResult {
  total: number
  imported: number
  skipped: number
  errors: readonly { row: number; message: string }[]
}

export interface ImportCenterProps {
  title?: string
  description?: string
  fields?: readonly ImportField[]
  accept?: string
  maxSizeMb?: number
  onImport?: (file: File) => Promise<ImportResult>
  onDownloadTemplate?: () => void
  className?: string
}

type Phase = 'idle' | 'selected' | 'importing' | 'done'

export function ImportCenter({
  title,
  description,
  fields,
  accept = '.csv,.xlsx',
  maxSizeMb = 10,
  onImport,
  onDownloadTemplate,
  className,
}: ImportCenterProps) {
  const { t } = usePreferences()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (f: File) => {
    if (f.size > maxSizeMb * 1024 * 1024) {
      setError(t('File exceeds maximum size of') + ` ${maxSizeMb} MB`)
      return
    }
    setFile(f)
    setPhase('selected')
    setError(null)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file || !onImport) return
    setPhase('importing')
    setError(null)
    try {
      const r = await onImport(file)
      setResult(r)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Import failed'))
      setPhase('selected')
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setPhase('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Card className={cn('p-6', className)}>
      {title ? <h2 className="mb-1 text-sm font-bold text-heading">{t(title)}</h2> : null}
      {description ? <p className="mb-4 text-[13px] text-muted">{t(description)}</p> : null}

      {phase === 'idle' || phase === 'selected' ? (
        <>
          <div
            className={cn(
              'flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors',
              'hover:border-salis-blue/40'
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-salis-blue/10">
              <Icon name="Upload" size={20} className="text-salis-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading">{t('Drag and drop your file here')}</p>
              <p className="mt-1 text-xs text-muted">
                {accept.replace(/\./g, '').toUpperCase()} · {t('up to')} {maxSizeMb} MB
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Icon name="File" size={14} />
              {t('Browse files')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              aria-label={t('Browse files')}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </div>

          {file ? (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon name="FileText" size={18} className="text-muted" />
                <div>
                  <p className="text-sm font-medium text-heading">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={reset}>
                  <Icon name="X" size={14} />
                </Button>
                <Button size="sm" onClick={handleImport} disabled={!onImport}>
                  <Icon name="Upload" size={14} />
                  {t('Import')}
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === 'importing' ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-8 w-8 animate-spin motion-reduce:animate-none rounded-full border-2 border-salis-blue border-t-transparent" />
          <p className="text-sm text-muted">{t('Importing')}…</p>
        </div>
      ) : null}

      {phase === 'done' && result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
            <Icon name="CheckCircle" size={20} className="text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-heading">{t('Import complete')}</p>
              <p className="text-xs text-muted">
                {result.imported} {t('imported')} · {result.skipped} {t('skipped')}
                {result.errors.length > 0 ? ` · ${result.errors.length} ${t('errors')}` : ''}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="ms-auto" onClick={reset}>
              {t('Import another')}
            </Button>
          </div>
          {result.errors.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-3 py-2 text-start font-semibold text-muted">{t('Row')}</th>
                    <th className="px-3 py-2 text-start font-semibold text-muted">{t('Error')}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err) => (
                    <tr key={err.row} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 font-mono text-heading">{err.row}</td>
                      <td className="px-3 py-1.5 text-body">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <Icon name="AlertCircle" size={14} />
          {error}
        </div>
      ) : null}

      {fields && fields.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {t('Expected columns')}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-3 py-2 text-start font-semibold text-muted">{t('Column')}</th>
                  <th className="px-3 py-2 text-start font-semibold text-muted">{t('Required')}</th>
                  <th className="px-3 py-2 text-start font-semibold text-muted">{t('Example')}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.name} className="border-b border-border last:border-0">
                    <td className="px-3 py-1.5 font-medium text-heading">{t(f.name)}</td>
                    <td className="px-3 py-1.5 text-muted">{f.required ? t('Yes') : t('No')}</td>
                    <td className="px-3 py-1.5 font-mono text-body" dir="ltr">{f.example ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {onDownloadTemplate ? (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
            <Icon name="Download" size={14} />
            {t('Download template')}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
