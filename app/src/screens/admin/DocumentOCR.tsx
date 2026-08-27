import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface OCRDocument {
  id: string
  fileName: string
  type: 'Invoice' | 'ID Card' | 'Registration' | 'Insurance' | 'Receipt'
  uploadedBy: string
  date: string
  status: 'Processed' | 'Processing' | 'Failed' | 'Queued'
  confidence: number
}

const DOCUMENTS: OCRDocument[] = [
  { id: 'OCR-001', fileName: 'invoice_toyota_aug.pdf', type: 'Invoice', uploadedBy: 'Sara Al-Mutairi', date: 'Aug 18, 2026', status: 'Processed', confidence: 97 },
  { id: 'OCR-002', fileName: 'national_id_ahmed.jpg', type: 'ID Card', uploadedBy: 'Omar Hassan', date: 'Aug 18, 2026', status: 'Processed', confidence: 99 },
  { id: 'OCR-003', fileName: 'vehicle_reg_hyundai.pdf', type: 'Registration', uploadedBy: 'Khalid Mohammed', date: 'Aug 18, 2026', status: 'Processing', confidence: 0 },
  { id: 'OCR-004', fileName: 'insurance_cert_camry.pdf', type: 'Insurance', uploadedBy: 'Yusuf Ibrahim', date: 'Aug 17, 2026', status: 'Processed', confidence: 94 },
  { id: 'OCR-005', fileName: 'parts_receipt_brake.jpg', type: 'Receipt', uploadedBy: 'Tariq Al-Dosari', date: 'Aug 17, 2026', status: 'Failed', confidence: 0 },
  { id: 'OCR-006', fileName: 'insurance_renewal_accord.pdf', type: 'Insurance', uploadedBy: 'Nora Al-Fahad', date: 'Aug 17, 2026', status: 'Queued', confidence: 0 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Processed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Processing: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Failed: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Queued: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function DocumentOCR() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const columns: Column<OCRDocument>[] = [
    { header: 'ID', cell: (doc) => doc.id, code: true },
    {
      header: 'File',
      cell: (doc) => (
        <div className="flex items-center gap-2">
          <Icon name="FileText" size={14} className="text-muted" />
          <span className="font-semibold text-heading">{doc.fileName}</span>
        </div>
      ),
    },
    { header: 'Type', cell: (doc) => <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(doc.type)}</Badge> },
    { header: 'Uploaded By', cell: (doc) => doc.uploadedBy },
    { header: 'Date', cell: (doc) => <span className="text-muted">{doc.date}</span> },
    {
      header: 'Confidence',
      cell: (doc) =>
        doc.confidence > 0 ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-secondary">
              <div className="h-full rounded-full bg-salis-blue" style={{ width: `${doc.confidence}%` }} />
            </div>
            <span className="text-xs text-muted">{doc.confidence}%</span>
          </div>
        ) : (
          <span className="text-xs text-muted">-</span>
        ),
    },
    { header: 'Status', cell: (doc) => <Badge background={STATUS_STYLES[doc.status].bg} color={STATUS_STYLES[doc.status].fg}>{t(doc.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Recent Documents"
      columns={columns}
      rows={DOCUMENTS}
      rowKey={(doc) => doc.id}
      mobileCard={(doc) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                  <Icon name="FileText" size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{doc.fileName}</p>
                  <p className="text-xs text-muted">{doc.id}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[doc.status].bg} color={STATUS_STYLES[doc.status].fg}>{t(doc.status)}</Badge>}
          />
          <MobileCardRow label={t('Type')} value={t(doc.type)} />
          <MobileCardRow label={t('Uploaded By')} value={doc.uploadedBy} />
          {doc.confidence > 0 && <MobileCardRow label={t('Confidence')} value={`${doc.confidence}%`} />}
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScanLine" title={t('Document OCR')} subtitle={t('Optical character recognition')} />
        <Card className="rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="flex rounded-xl p-3" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
              <Icon name="Upload" size={24} />
            </span>
            <p className="text-sm font-semibold text-heading">{t('Upload Document')}</p>
            <p className="text-xs text-muted">{t('PDF, JPG, or PNG up to 10MB')}</p>
          </div>
        </Card>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ScanLine" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Document OCR')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Scan and extract data from documents')}</p>
        </div>
      </div>

      <Card className="rounded-2xl border-2 border-dashed border-border p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span className="flex rounded-2xl p-4" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
            <Icon name="Upload" size={32} />
          </span>
          <p className="text-sm font-semibold text-heading">{t('Drop files here or click to upload')}</p>
          <p className="text-xs text-muted">{t('Supports PDF, JPG, PNG up to 10MB per file')}</p>
        </div>
      </Card>

      {table}
    </div>
  )
}
