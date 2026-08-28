import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Document {
  name: string
  type: 'Invoice' | 'Contract' | 'Report' | 'Manual' | 'Certificate'
  size: string
  uploadedBy: string
  uploadDate: string
  status: 'Active' | 'Archived' | 'Draft'
}

const DOCUMENTS: Document[] = [
  { name: 'Q2 Financial Report', type: 'Report', size: '2.4 MB', uploadedBy: 'Ahmed Al-Rashid', uploadDate: 'Aug 15, 2026', status: 'Active' },
  { name: 'Service Agreement - Fleet Co.', type: 'Contract', size: '1.1 MB', uploadedBy: 'Sara Al-Mutairi', uploadDate: 'Aug 12, 2026', status: 'Active' },
  { name: 'Invoice Template v3', type: 'Invoice', size: '340 KB', uploadedBy: 'Khalid Mohammed', uploadDate: 'Aug 10, 2026', status: 'Active' },
  { name: 'Toyota Service Manual 2024', type: 'Manual', size: '18.6 MB', uploadedBy: 'Yusuf Ibrahim', uploadDate: 'Jul 28, 2026', status: 'Active' },
  { name: 'Safety Compliance Certificate', type: 'Certificate', size: '890 KB', uploadedBy: 'Omar Hassan', uploadDate: 'Jul 20, 2026', status: 'Active' },
  { name: 'Q1 Financial Report', type: 'Report', size: '2.1 MB', uploadedBy: 'Ahmed Al-Rashid', uploadDate: 'Apr 15, 2026', status: 'Archived' },
  { name: 'BMW Diagnostics Guide', type: 'Manual', size: '12.3 MB', uploadedBy: 'Yusuf Ibrahim', uploadDate: 'Jun 05, 2026', status: 'Active' },
  { name: 'Supplier Agreement Draft', type: 'Contract', size: '780 KB', uploadedBy: 'Sara Al-Mutairi', uploadDate: 'Aug 17, 2026', status: 'Draft' },
]

const TYPE_ICONS: Record<string, string> = {
  Invoice: 'FileText',
  Contract: 'FileSignature',
  Report: 'BarChart3',
  Manual: 'BookOpen',
  Certificate: 'Award',
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Archived: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Draft: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
}

export function DocumentManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return DOCUMENTS
    const q = search.toLowerCase()
    return DOCUMENTS.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        doc.uploadedBy.toLowerCase().includes(q),
    )
  }, [search])

  const kpis = [
    { label: t('Total Documents'), value: String(DOCUMENTS.length), icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('This Month'), value: '4', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Storage Used'), value: '38.5 MB', icon: 'HardDrive', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Categories'), value: '5', icon: 'FolderOpen', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const columns: Column<Document>[] = [
    {
      header: 'Document',
      cell: (doc) => (
        <div className="flex items-center gap-2">
          <Icon name={TYPE_ICONS[doc.type] ?? 'FileText'} size={14} className="text-salis-blue" />
          <span className="font-medium text-heading">{doc.name}</span>
        </div>
      ),
    },
    { header: 'Type', cell: (doc) => t(doc.type) },
    { header: 'Size', cell: (doc) => <span className="font-mono text-xs text-muted">{doc.size}</span> },
    { header: 'Uploaded by', cell: (doc) => doc.uploadedBy },
    { header: 'Date', cell: (doc) => <span className="text-muted">{doc.uploadDate}</span> },
    { header: 'Status', cell: (doc) => <Badge background={STATUS_STYLES[doc.status].bg} color={STATUS_STYLES[doc.status].fg}>{t(doc.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Document library"
      columns={columns}
      rows={filtered}
      rowKey={(doc) => doc.name}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No documents found')}</p>}
      mobileCard={(doc) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden>
                  <Icon name={TYPE_ICONS[doc.type] ?? 'FileText'} size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{doc.name}</p>
                  <p className="text-xs text-muted">{t(doc.type)}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[doc.status].bg} color={STATUS_STYLES[doc.status].fg}>{t(doc.status)}</Badge>}
          />
          <MobileCardRow label={t('Size')} value={doc.size} />
          <MobileCardRow label={t('Uploaded by')} value={doc.uploadedBy} />
          <MobileCardRow label={t('Date')} value={doc.uploadDate} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileText" title={t('Documents')} subtitle={t('Document management')} />
        <Input inputSize="sm" placeholder={t('Search documents...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="FileText" title={t('Document Management')} subtitle={t('Files, contracts, and records')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search documents...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
