import { type ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Reusable print-optimized wrapper for document views (invoices, estimates,
 *  job cards). Provides the company header, document title/number/date,
 *  print-ready CSS, and a footer with page numbering.
 *
 *  The "Print" button calls `window.print()` and is hidden in print output.
 *  RTL is handled via the document `dir` attribute set by PreferencesProvider. */

export interface PrintLayoutProps {
  /** Document type label, e.g. "TAX INVOICE", "ESTIMATE". */
  documentTitle: string
  /** Document number, e.g. "INV-2026-0142". */
  documentNumber: string
  /** Document date string. */
  date?: string
  /** Optional status badge rendered beside the title. */
  status?: ReactNode
  /** Customer information block. */
  customerInfo?: ReactNode
  /** Vehicle information block. */
  vehicleInfo?: ReactNode
  /** Main body content — line items, totals, etc. */
  children: ReactNode
  /** Footer content — terms, signature lines, etc. */
  footer?: ReactNode
  /** QR code placeholder content. */
  qrCode?: ReactNode
  /** Additional header content (e.g. validity period). */
  headerExtra?: ReactNode
  /** Optional notice above the footer. */
  notice?: ReactNode
}

export function PrintLayout({
  documentTitle,
  documentNumber,
  date,
  status,
  customerInfo,
  vehicleInfo,
  children,
  footer,
  qrCode,
  headerExtra,
  notice,
}: PrintLayoutProps) {
  const { t, rtl } = usePreferences()

  return (
    <div className="print-layout mx-auto max-w-[850px] bg-white p-6 text-heading print:max-w-none print:p-0">
      {/* Print button — hidden when printing */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="md" onClick={() => window.history.back()}>
          <Icon name="ArrowLeft" size={15} className={rtl ? 'rotate-180' : ''} />
          {t('Back')}
        </Button>
        <Button size="md" onClick={() => window.print()}>
          <Icon name="Printer" size={15} />
          {t('Print')}
        </Button>
      </div>

      {/* Document container */}
      <div className="rounded-xl border border-border bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        {/* Company Header */}
        <div className="border-b-2 border-salis-navy px-8 py-6 print:px-10 print:py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo placeholder */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-salis-navy">
                <span className="font-display text-lg font-black text-white">SA</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-black text-salis-navy">SALIS AUTO</h1>
                <p className="mt-0.5 text-xs text-body">
                  {t('Automotive Workshop Management')}
                </p>
              </div>
            </div>
            <div className={`text-xs text-body ${rtl ? 'text-start' : 'text-end'}`}>
              <p>{t('Riyadh, Kingdom of Saudi Arabia')}</p>
              <p>{t('CR No.')}: 1010XXXXXX</p>
              <p>{t('VAT No.')}: 3XXXXXXXXXXXXXXX</p>
              <p>info@salisauto.com</p>
            </div>
          </div>
        </div>

        {/* Document Title Band */}
        <div className="bg-salis-navy px-8 py-3 print:px-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-white">
              {documentTitle}
            </h2>
            <div className="flex items-center gap-4">
              {status}
              <span className="font-mono text-sm font-semibold text-white" dir="ltr">
                {documentNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Date and meta row */}
        {(date || headerExtra) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-8 py-3 print:px-10">
            {date && (
              <p className="text-sm text-body">
                <span className="font-semibold text-heading">{t('Date')}:</span>{' '}
                <span dir="ltr" className="font-mono">{date}</span>
              </p>
            )}
            {headerExtra}
          </div>
        )}

        {/* Customer & Vehicle Info */}
        {(customerInfo || vehicleInfo) && (
          <div className="grid grid-cols-1 gap-4 border-b border-border px-8 py-5 sm:grid-cols-2 print:px-10">
            {customerInfo && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
                  {t('Customer Information')}
                </h3>
                {customerInfo}
              </div>
            )}
            {vehicleInfo && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
                  {t('Vehicle Information')}
                </h3>
                {vehicleInfo}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="px-8 py-5 print:px-10">
          {children}
        </div>

        {/* Notice */}
        {notice && (
          <div className="mx-8 mb-4 rounded border border-salis-blue/20 bg-salis-blue/[.04] px-4 py-2.5 text-xs text-heading print:mx-10">
            {notice}
          </div>
        )}

        {/* QR Code */}
        {qrCode && (
          <div className="border-t border-border px-8 py-4 print:px-10">
            {qrCode}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-8 py-5 print:px-10">
            {footer}
          </div>
        )}

        {/* Page footer — company info */}
        <div className="border-t-2 border-salis-navy bg-inset px-8 py-3 text-center text-[10px] text-muted print:px-10">
          <p>SALIS AUTO &middot; {t('Riyadh, Kingdom of Saudi Arabia')} &middot; info@salisauto.com</p>
          <p className="mt-0.5">{t('This document was generated by SALIS AUTO ERP')}</p>
        </div>
      </div>
    </div>
  )
}

/** A labeled info row for the customer/vehicle blocks. */
export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm text-heading">
      <span className="text-muted">{label}:</span>{' '}
      <span className="font-medium">{value}</span>
    </p>
  )
}

/** Signature line with a label underneath. */
export function SignatureLine({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-px w-48 border-b border-dashed border-faint" />
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}
