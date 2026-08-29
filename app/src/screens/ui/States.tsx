import { useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'

/** UI pattern-library screens (design project/UI.EmptyStates.dc.html,
 *  UI.LoadingStates.dc.html, UI.FormValidation.dc.html) — reference galleries
 *  for /ui/empty-states, /ui/loading-states, /ui/form-validation.
 *
 *  Page content only, no chrome of their own — render inside `AppShell` like
 *  any other screen. Built from the real pieces (`EmptyState`, `DataTable`'s
 *  own loading skeleton, `Input`) rather than a bespoke reimplementation,
 *  since the point of a pattern page is showing the actual component in its
 *  actual states. None of the three designs shipped a `.Mobile.dc.html`
 *  variant. Icons come from the shared registry, with lucide-react imported
 *  directly for the few names the registry doesn't ship. */

// Tone palette shared by all three galleries — blue = success/valid, orange =
// warning/error, slate = neutral. Never green/red/yellow/purple/pink/teal.
const TONE = {
  blue: ['rgba(10,94,215,.1)', '#0A5ED7'],
  orange: ['rgba(249,115,22,.1)', '#F97316'],
  slate: ['rgba(100,116,139,.1)', '#64748B'],
} as const satisfies Record<string, readonly [string, string]>

function Tag({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  const [bg, fg] = TONE[tone]
  return <Badge background={bg} color={fg}>{children}</Badge>
}

/** Below-field feedback line. Blue = success/focus, orange = error, muted =
 *  neutral hint — never green or red (README §7). */
function Hint({ tone, icon, children }: { tone: 'blue' | 'orange' | 'muted'; icon: ReactNode; children: ReactNode }) {
  const cls = tone === 'blue' ? 'text-salis-blue' : tone === 'orange' ? 'text-salis-orange' : 'text-muted'
  return <span className={cn('flex items-start gap-1.5 text-[11px] leading-[1.5]', cls)}>{icon}{children}</span>
}

// ── Empty States ─────────────────────────────────────────────────────────────

interface EmptyCase { key: string; tone: keyof typeof TONE; tag: string; when: string; icon: string; title: string; body: string; primary?: string; primaryIcon?: string; secondary?: string }

const EMPTY_CASES: readonly EmptyCase[] = [
  { key: 'first-run-jobs', tone: 'blue', tag: 'First run', when: 'Workshop has no job cards yet', icon: 'ClipboardList', title: 'No job cards yet', body: 'Job cards appear here once a vehicle is checked in. Start with a walk-in or convert an approved estimate.', primary: 'New Job Card', primaryIcon: 'Plus', secondary: 'Import from CSV' },
  { key: 'no-results', tone: 'slate', tag: 'No results', when: 'Search or filter returned nothing', icon: 'SearchX', title: 'No matches found', body: 'No records match your search and filters. Try a shorter term, or clear the filters to see everything.', primary: 'Clear Filters', primaryIcon: 'FilterX' },
  { key: 'first-run-customers', tone: 'blue', tag: 'First run', when: 'No customers registered', icon: 'Users', title: 'No customers yet', body: 'Add your first customer to start booking appointments and issuing invoices. You can also import an existing list.', primary: 'Add Customer', primaryIcon: 'UserPlus', secondary: 'Import from CSV' },
  { key: 'cleared', tone: 'blue', tag: 'Cleared', when: 'Everything is handled', icon: 'CheckCheck', title: 'All caught up', body: 'No pending approvals or overdue items. New requests will show up here as they arrive.', secondary: 'View History' },
  { key: 'blocked', tone: 'orange', tag: 'Blocked', when: 'Integration not connected', icon: 'PlugZap', title: 'Connect ZATCA to continue', body: 'E-invoices cannot be issued until the ZATCA integration is connected and your VAT number is verified.', primary: 'Connect', primaryIcon: 'Plug', secondary: 'Learn More' },
  { key: 'error', tone: 'orange', tag: 'Error', when: 'Data could not be loaded', icon: 'CloudOff', title: "Couldn't load reports", body: 'The request timed out. Your data is safe — retry, or check the service status if this keeps happening.', primary: 'Retry', primaryIcon: 'RefreshCw', secondary: 'Service Status' },
]

/** Six states every list and detail screen needs, built from the app's real
 *  `EmptyState` (from `DataTable`) rather than a one-off reimplementation. */
export function UIEmptyStates() {
  const { t } = usePreferences()
  return (
    <>
      <ListPageHeader title={t('Empty States')} subtitle={t('UI Patterns')} />
      <p className="max-w-2xl text-sm text-muted">
        {t('Six states every list and detail screen needs: first run, no search results, all-clear, blocked by setup, and load failure. Each pairs one clear sentence with the action that resolves it.')}
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {EMPTY_CASES.map((c) => (
          <Card key={c.key} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
              <Tag tone={c.tone}>{t(c.tag)}</Tag>
              <span className="text-xs text-muted">{t(c.when)}</span>
            </div>
            <div className="px-6 pb-6">
              <EmptyState
                icon={c.icon}
                title={t(c.title)}
                description={t(c.body)}
                action={
                  c.primary || c.secondary ? (
                    <div className="mt-1 flex flex-wrap justify-center gap-2">
                      {c.secondary ? <Button variant="outline" size="sm">{t(c.secondary)}</Button> : null}
                      {c.primary ? <Button size="sm">{c.primaryIcon ? <Icon name={c.primaryIcon} size={14} /> : null}{t(c.primary)}</Button> : null}
                    </div>
                  ) : null
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Loading States ───────────────────────────────────────────────────────────

/** Same skeleton treatment `DataTable`'s own loading rows use — a pulsing
 *  inset block, never a spinner (the brand rule the banner below states). */
function Sk({ className }: { className: string }) {
  return <span className={cn('block animate-pulse motion-reduce:animate-none rounded bg-inset', className)} />
}

interface SkeletonRow { id: string }
const SKELETON_COLUMNS: readonly Column<SkeletonRow>[] = [
  { header: 'Job Card', cell: () => null },
  { header: 'Customer', cell: () => null },
  { header: 'Vehicle', cell: () => null },
  { header: 'Status', cell: () => null },
]

const PROGRESS_BARS = [
  { label: 'Importing customers', pct: 72 },
  { label: 'Syncing ZATCA invoices', pct: 45 },
  { label: 'Generating report', pct: 88 },
] as const

/** Indeterminate bar matching the design (gradient sliding across a tinted
 *  track), via a keyframe scoped to this file rather than a new global one. */
function IndeterminateBar({ className }: { className?: string }) {
  return (
    <div className={cn('h-[3px] overflow-hidden rounded-full bg-[rgba(10,94,215,.1)]', className)}>
      <div className="h-full w-1/3 rounded-full bg-salis-gradient" style={{ animation: 'uiIndeterminate 1.5s ease-in-out infinite' }} />
    </div>
  )
}

/** Skeletons mirror the shape of the content they replace; progress is linear
 *  and determinate wherever the percentage is known. The CSS animations here
 *  loop harmlessly forever — nothing blocks the headings from rendering
 *  immediately. */
export function UILoadingStates() {
  const { t } = usePreferences()
  return (
    <>
      <style>{'@keyframes uiIndeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(340%)}}'}</style>
      <ListPageHeader title={t('Loading States')} subtitle={t('UI Patterns')} />
      <p className="max-w-2xl text-sm text-muted">
        {t('Skeletons mirror the shape of the content they replace, so layout never jumps when data lands. Progress is linear and determinate wherever the percentage is known.')}
      </p>
      <div className="flex items-center gap-2.5 rounded-lg border border-[rgba(10,94,215,.2)] bg-[rgba(10,94,215,.05)] px-4 py-3">
        <Icon name="Info" size={15} className="flex-shrink-0 text-salis-blue" />
        <span className="text-[13px] text-body">{t('Brand rule: loading is always a linear bar or a pulse skeleton — never a spinner.')}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-[18px] py-3">
            <h3 className="font-display text-[15px] font-bold text-heading">{t('Page load')}</h3>
          </div>
          <IndeterminateBar />
          <div className="flex flex-col gap-3.5 p-[18px]">
            <div className="flex items-center gap-3">
              <Sk className="h-11 w-11 rounded-xl" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Sk className="h-3.5 w-[46%]" />
                <Sk className="h-2.5 w-[28%]" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-[11px] border border-border p-3">
                  <Sk className="h-2.5 w-[62%]" />
                  <Sk className="h-5 w-[44%]" />
                </div>
              ))}
            </div>
            <Sk className="h-[132px] w-full rounded-[11px]" />
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-[15px] font-bold text-heading">{t('Table load')}</h3>
          <DataTable columns={SKELETON_COLUMNS} rows={[]} rowKey={(row) => row.id} loading />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5">
          <h3 className="font-display text-[15px] font-bold text-heading">{t('Determinate progress')}</h3>
          {PROGRESS_BARS.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-body">{t(bar.label)}</span>
                <span className="font-mono font-semibold text-salis-blue">{bar.pct}%</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-[rgba(10,94,215,.09)]">
                <div className="h-full rounded-full bg-salis-gradient" style={{ width: `${bar.pct}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-3.5 p-5">
          <h3 className="font-display text-[15px] font-bold text-heading">{t('Inline busy states')}</h3>
          <Button disabled className="w-full justify-center gap-2">
            <span className="h-[15px] w-[15px] animate-pulse motion-reduce:animate-none rounded-[3px] bg-white/35" />
            {t('Saving…')}
          </Button>
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-inset p-3">
            <span className="h-[22px] w-[22px] flex-shrink-0 animate-pulse motion-reduce:animate-none rounded-md bg-[rgba(10,94,215,.14)]" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Sk className="h-2.5 w-[58%]" />
              <Sk className="h-2 w-[34%]" />
            </div>
          </div>
          <IndeterminateBar className="w-full" />
        </Card>

        <Card className="flex flex-col gap-3.5 p-5">
          <h3 className="font-display text-[15px] font-bold text-heading">{t('List load')}</h3>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-[11px] border border-border p-3">
              <Sk className="h-8 w-8 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Sk className="h-2.5 w-[54%]" />
                <Sk className="h-2 w-[32%]" />
              </div>
              <Sk className="h-2.5 w-[52px]" />
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

// ── Form Validation ──────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { key: 'len', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'num', label: 'One number', test: (v: string) => /\d/.test(v) },
  { key: 'special', label: 'One special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

interface FieldSpec { key: string; label: string; tag: string; tone: keyof typeof TONE; value: string; mono?: boolean; invalid?: boolean; disabled?: boolean; focused?: boolean; hint?: string; hintTone?: 'blue' | 'orange' | 'muted'; hintIcon: 'Info' | 'Check' | 'Lock' | 'AlertCircle' }

const FIELD_STATES: readonly FieldSpec[] = [
  { key: 'default', label: 'Default', tag: 'rest', tone: 'slate', value: '', hintIcon: 'Info' },
  { key: 'focused', label: 'Focused', tag: 'focus', tone: 'blue', value: 'Toyota Camry 2022', focused: true, hint: 'Helper text sits below the field and explains the expected format.', hintTone: 'muted', hintIcon: 'Info' },
  { key: 'valid', label: 'Valid', tag: 'valid', tone: 'blue', value: '+966 55 210 4471', mono: true, hint: 'Verified with the customer record.', hintTone: 'blue', hintIcon: 'Check' },
  { key: 'error', label: 'Error', tag: 'invalid', tone: 'orange', value: '3104', mono: true, invalid: true, hint: 'VAT number must be 15 digits and start with 3.', hintTone: 'orange', hintIcon: 'AlertCircle' },
  { key: 'readonly', label: 'Read-only', tag: 'locked', tone: 'slate', value: 'JC-A3F8B2C1', mono: true, disabled: true, hint: 'Generated automatically and cannot be edited.', hintTone: 'muted', hintIcon: 'Lock' },
]

/** Renders a hint's leading glyph — `AlertCircle` isn't in the shared icon
 *  registry, so it goes through the lucide-react escape hatch; the rest use
 *  the registry via `Icon`. */
function HintGlyph({ name }: { name: FieldSpec['hintIcon'] }) {
  return name === 'AlertCircle' ? (
    <AlertCircle size={12} className="mt-px flex-shrink-0" aria-hidden />
  ) : (
    <Icon name={name} size={12} className="mt-px flex-shrink-0" />
  )
}

/** Blue-check / orange-alert feedback for a live-validated field. */
function FieldFeedback({ ok, okText, errText }: { ok: boolean; okText: string; errText: string }) {
  return ok ? (
    <Hint tone="blue" icon={<Icon name="Check" size={12} className="mt-px flex-shrink-0" />}>{okText}</Hint>
  ) : (
    <Hint tone="orange" icon={<AlertCircle size={12} className="mt-px flex-shrink-0" aria-hidden />}>{errText}</Hint>
  )
}

/** One result-toast specimen, inline rather than fixed-position — a
 *  catalogue of what the real `Toast` looks like, not the toast itself. */
function ToastPreview({ tone, icon, title, body }: { tone: keyof typeof TONE; icon: ReactNode; title: string; body: string }) {
  const [bg, fg] = TONE[tone]
  const boxStyle = tone === 'slate' ? { background: 'var(--surface-inset)', borderColor: 'var(--border-default)' } : { background: bg, borderColor: fg + '33' }
  return (
    <div className="flex gap-2.5 rounded-[10px] border px-3.5 py-3" style={boxStyle}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-heading">{title}</p>
        <p className="mt-0.5 text-xs leading-[1.5] text-muted">{body}</p>
      </div>
      <X size={12} className="mt-0.5 flex-shrink-0 text-muted" aria-hidden />
    </div>
  )
}

/** Field states, inline rules, a summary banner and result toasts — errors use
 *  Action Orange, success and focus use blue, never green or red. The "Add
 *  Customer" example and the password checklist are wired to real
 *  `useState`, so typing actually flips a field between its error and valid
 *  look, visual-only like the rest of the gallery. */
export function UIFormValidation() {
  const { t } = usePreferences()
  const [fullName, setFullName] = useState('Layla Al-Sulaiman')
  const [phone, setPhone] = useState('05 5210')
  const [email, setEmail] = useState('layla@')
  const [notes, setNotes] = useState('')
  const [password, setPassword] = useState('')

  const nameOk = fullName.trim().length > 1
  const phoneOk = /^(\+?966|0)?5\d{8}$/.test(phone.replace(/[\s-]/g, ''))
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const errorCount = [nameOk, phoneOk, emailOk].filter((ok) => !ok).length
  const canSave = errorCount === 0

  return (
    <>
      <ListPageHeader title={t('Form Validation')} subtitle={t('UI Patterns')} />
      <p className="max-w-2xl text-sm text-muted">
        {t('Field states, inline rules, a summary banner and result toasts. Errors use Action Orange, success and focus use blue — never green or red.')}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="flex flex-col gap-4 p-5">
          <h3 className="font-display text-[15px] font-bold text-heading">{t('Field States')}</h3>
          {FIELD_STATES.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-action text-xs font-medium text-heading">{t(f.label)}</span>
                <span className="flex-1" />
                <Tag tone={f.tone}>{t(f.tag)}</Tag>
              </div>
              <Input
                defaultValue={f.value || undefined}
                placeholder={f.value ? undefined : t('Enter a value')}
                readOnly
                disabled={f.disabled}
                invalid={f.invalid}
                dir={f.mono ? 'ltr' : undefined}
                className={cn(f.mono && 'font-mono', f.focused && 'border-salis-blue shadow-[0_0_0_3px_rgba(10,94,215,.12)]')}
                trailing={f.hint && f.key !== 'focused' ? <HintGlyph name={f.hintIcon} /> : undefined}
              />
              {f.hint ? <Hint tone={f.hintTone ?? 'muted'} icon={<HintGlyph name={f.hintIcon} />}>{t(f.hint)}</Hint> : null}
            </div>
          ))}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-[22px] py-4">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue"><Icon name="UserPlus" size={15} /></span>
              <h3 className="font-display text-[15px] font-bold text-heading">{t('Add Customer')}</h3>
              <span className="flex-1" />
              <Tag tone={canSave ? 'blue' : 'orange'}>{canSave ? t('Ready to save') : `${errorCount} ${t(errorCount === 1 ? 'error' : 'errors')}`}</Tag>
            </div>

            {!canSave ? (
              <div className="px-[22px] pt-4">
                <div className="flex gap-2.5 rounded-[10px] border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.06)] px-3.5 py-3">
                  <AlertTriangle size={15} className="mt-px flex-shrink-0 text-salis-orange" aria-hidden />
                  <div>
                    <p className="text-[13px] font-semibold text-salis-orange">{t('Check the highlighted fields')}</p>
                    <p className="mt-0.5 text-xs leading-[1.55] text-body">{t('Some fields are not in a valid format. Fix them to continue.')}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 p-[22px] sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-action text-xs font-medium text-heading">{t('Full Name')} <span className="text-salis-orange">*</span></label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} invalid={!nameOk} />
                <FieldFeedback ok={nameOk} okText={t('Looks good.')} errText={t('Full name is required.')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-action text-xs font-medium text-heading">{t('Phone')} <span className="text-salis-orange">*</span></label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="font-mono" invalid={!phoneOk} />
                <FieldFeedback ok={phoneOk} okText={t('Verified with the customer record.')} errText={t('Enter a Saudi mobile number, e.g. +966 5X XXX XXXX.')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-action text-xs font-medium text-heading">{t('Email')}</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} invalid={!emailOk} dir="ltr" />
                <FieldFeedback ok={emailOk} okText={t('Looks good.')} errText={t('Enter a complete email address.')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-action text-xs font-medium text-heading">{t('VAT Registration #')}</label>
                <Input defaultValue="3104567890" readOnly dir="ltr" className="font-mono" />
                <Hint tone="muted" icon={<Icon name="Info" size={12} className="mt-px flex-shrink-0" />}>{t('Optional. Required only for VAT-registered business customers.')}</Hint>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="customer-notes" className="font-action text-xs font-medium text-heading">{t('Notes')}</label>
                <textarea
                  id="customer-notes"
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('Anything the workshop should know about this customer')}
                  className="box-border w-full resize-y rounded-[9px] border border-border bg-inset px-3.5 py-2.5 font-ui text-sm text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.12)]"
                />
                <span className="text-end font-mono text-[11px] text-muted">{notes.length} / 500</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-t border-border px-[22px] py-3.5">
              <span className="text-xs text-muted">{t('* Required fields')}</span>
              <span className="flex-1" />
              <Button variant="outline" size="sm">{t('Cancel')}</Button>
              <Button size="sm" disabled={!canSave}>{t('Save Customer')}</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-3.5 p-5">
              <h3 className="font-display text-[15px] font-bold text-heading">{t('Live Rule Checklist')}</h3>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('Type a password to check the rules')} dir="ltr" />
              <div className="flex flex-col gap-2">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password)
                  return (
                    <div key={rule.key} className="flex items-center gap-2">
                      <span className={cn('flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-[5px]', ok ? 'bg-[rgba(10,94,215,.12)] text-salis-blue' : 'bg-[rgba(249,115,22,.12)] text-salis-orange')}>
                        {ok ? <Icon name="Check" size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} aria-hidden />}
                      </span>
                      <span className={cn('text-xs', ok ? 'text-body' : 'text-muted')}>{t(rule.label)}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="flex flex-col gap-2.5 p-5">
              <h3 className="mb-1 font-display text-[15px] font-bold text-heading">{t('Result Toasts')}</h3>
              <ToastPreview tone="blue" icon={<CheckCircle size={15} className="mt-px flex-shrink-0 text-salis-blue" aria-hidden />} title={t('Customer saved')} body={t('Layla Al-Sulaiman was added and can now be booked.')} />
              <ToastPreview tone="orange" icon={<AlertTriangle size={15} className="mt-px flex-shrink-0 text-salis-orange" aria-hidden />} title={t('Check the highlighted fields')} body={t('Two fields need attention before this form can be saved.')} />
              <ToastPreview tone="slate" icon={<Icon name="Save" size={15} className="mt-px flex-shrink-0 text-muted" />} title={t('Draft saved automatically')} body={t('Your changes are kept for 7 days if you leave this page.')} />
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
