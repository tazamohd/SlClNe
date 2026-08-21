import { useState } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from './Card'
import { Button } from './Button'
import { Icon } from './Icon'

export type ExportFormat = 'csv' | 'xlsx' | 'pdf'

export interface ExportColumn {
  key: string
  label: string
  included?: boolean
}

export interface ExportCenterProps {
  title?: string
  description?: string
  formats?: readonly ExportFormat[]
  columns?: readonly ExportColumn[]
  totalRows?: number
  onExport?: (format: ExportFormat, columnKeys: string[]) => Promise<void>
  className?: string
}

const FORMAT_META: Record<ExportFormat, { icon: string; label: string }> = {
  csv: { icon: 'FileText', label: 'CSV' },
  xlsx: { icon: 'FileSpreadsheet', label: 'Excel' },
  pdf: { icon: 'FileText', label: 'PDF' },
}

export function ExportCenter({
  title,
  description,
  formats = ['csv', 'xlsx', 'pdf'],
  columns,
  totalRows,
  onExport,
  className,
}: ExportCenterProps) {
  const { t } = usePreferences()
  const [format, setFormat] = useState<ExportFormat>(formats[0] ?? 'csv')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(columns?.filter((c) => c.included !== false).map((c) => c.key) ?? [])
  )
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAll = () => {
    if (!columns) return
    if (selected.size === columns.length) setSelected(new Set())
    else setSelected(new Set(columns.map((c) => c.key)))
  }

  const handleExport = async () => {
    if (!onExport) return
    setExporting(true)
    setError(null)
    setDone(false)
    try {
      await onExport(format, [...selected])
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Export failed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      {title ? <h3 className="mb-1 text-sm font-bold text-heading">{t(title)}</h3> : null}
      {description ? <p className="mb-4 text-[13px] text-muted">{t(description)}</p> : null}

      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {t('Format')}
          </h4>
          <div className="flex gap-2">
            {formats.map((f) => {
              const meta = FORMAT_META[f]
              return (
                <button
                  key={f}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                    format === f
                      ? 'border-salis-blue bg-salis-blue/5 text-salis-blue'
                      : 'border-border text-body hover:border-salis-blue/40'
                  )}
                  onClick={() => setFormat(f)}
                >
                  <Icon name={meta.icon} size={16} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {columns && columns.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t('Columns')}
              </h4>
              <button
                type="button"
                className="text-xs font-medium text-salis-blue hover:underline"
                onClick={toggleAll}
              >
                {selected.size === columns.length ? t('Deselect all') : t('Select all')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    selected.has(col.key)
                      ? 'border-salis-blue/30 bg-salis-blue/5 text-heading'
                      : 'border-border text-muted'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(col.key)}
                    onChange={() => toggle(col.key)}
                    className="accent-salis-blue"
                  />
                  {t(col.label)}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {totalRows != null ? (
          <p className="text-xs text-muted">
            {totalRows.toLocaleString()} {t('rows will be exported')}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button onClick={handleExport} disabled={exporting || (columns != null && selected.size === 0)}>
            {exporting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('Exporting')}…
              </>
            ) : (
              <>
                <Icon name="Download" size={14} />
                {t('Export')} {FORMAT_META[format].label}
              </>
            )}
          </Button>

          {done ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Icon name="CheckCircle" size={14} />
              {t('Export complete')}
            </span>
          ) : null}

          {error ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <Icon name="AlertCircle" size={14} />
              {error}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
