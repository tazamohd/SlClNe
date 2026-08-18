import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Draft: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
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
        {filtered.map((doc) => (
          <MobileCard key={doc.name}>
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
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No documents found')}</p>}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="FileText" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Document Management')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Files, contracts, and records')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search documents...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Document')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Size')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Uploaded by')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.name} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-2">
                      <Icon name={TYPE_ICONS[doc.type] ?? 'FileText'} size={14} className="text-salis-blue" />
                      <span className="font-medium text-heading">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{t(doc.type)}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted">{doc.size}</td>
                  <td className="py-3 pe-4 text-body">{doc.uploadedBy}</td>
                  <td className="py-3 pe-4 text-muted">{doc.uploadDate}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[doc.status].bg} color={STATUS_STYLES[doc.status].fg}>{t(doc.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No documents found')}</p>}
      </Card>
    </div>
  )
}
