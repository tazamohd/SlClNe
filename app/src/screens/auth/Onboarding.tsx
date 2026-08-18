import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Post-signup workshop setup — a 3-step wizard (Workshop Details → Services →
 *  Invite Team) that ends on the Dashboard. Public and full-page like the rest
 *  of the auth chain: it can run before a role/session exists, so it carries
 *  no app shell and no role check. Every field is local `useState`; nothing
 *  here is persisted, matching the reference prototype's demo data. */

// [short, full] — the short form matches the Mobile reference's tighter step rail.
const STEP_LABELS = [
  ['Details', 'Workshop Details'],
  ['Services', 'Services'],
  ['Team', 'Invite Team'],
] as const
const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah'] as const
const ROLES = ['Technician', 'Service Advisor', 'Manager'] as const
const SERVICES: [string, string][] = [
  ['Wrench', 'Maintenance'],
  ['Cog', 'Repair'],
  ['SearchCheck', 'Diagnostics'],
  ['ClipboardCheck', 'Inspection'],
  ['CircleDot', 'Tire Service'],
  ['Car', 'Body & Paint'],
  ['Wind', 'AC Service'],
  ['Droplets', 'Oil Change'],
]

interface Invite {
  email: string
  role: (typeof ROLES)[number]
}

export function Onboarding() {
  const { t, rtl } = usePreferences()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [wsName, setWsName] = useState('')
  const [city, setCity] = useState<(typeof CITIES)[number]>('Riyadh')
  const [phone, setPhone] = useState('')
  const [vat, setVat] = useState('')
  const [selected, setSelected] = useState<string[]>(['Maintenance', 'Repair'])
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState<(typeof ROLES)[number]>('Technician')
  const [invites, setInvites] = useState<Invite[]>([])

  const lastStep = STEP_LABELS.length - 1
  const canBack = step > 0

  function toggleService(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  function addInvite() {
    const email = invEmail.trim()
    if (!email) return
    setInvites((prev) => [...prev, { email, role: invRole }])
    setInvEmail('')
  }

  function removeInvite(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index))
  }

  function goNext() {
    if (step < lastStep) setStep(step + 1)
    else navigate('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-4 py-8 font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.1),transparent_65%)] blur-[64px]" />
        <div className="absolute bottom-0 start-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.1),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex w-full max-w-[720px] animate-fade-up flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" className="h-auto w-[120px]" />
          <div>
            <h1 className="bg-salis-gradient-r bg-clip-text font-display text-[28px] font-black text-transparent">
              {t('Workshop Setup')}
            </h1>
            <p className="mt-1.5 font-action text-sm text-muted">
              {t('Set up your workshop in a few steps')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
          <div className="h-1 bg-[rgba(10,94,215,.1)]">
            <div
              className="h-full rounded-full bg-salis-gradient-r transition-[width] duration-300 ease-salis"
              style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-0 px-4 pt-6 sm:px-8">
            {STEP_LABELS.map(([shortLabel, fullLabel], i) => {
              const done = i < step
              const active = i === step
              return (
                <div
                  key={shortLabel}
                  className={cn('flex min-w-0 items-center', i < lastStep ? 'flex-1' : 'flex-none')}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-action text-[13px] font-semibold transition-all duration-200 sm:h-9 sm:w-9 sm:text-sm',
                        done || active
                          ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.3)]'
                          : 'border-[1.5px] border-border-strong bg-inset text-muted'
                      )}
                    >
                      {done ? <Icon name="Check" size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'whitespace-nowrap font-action text-[10px] font-medium tracking-[.02em] sm:text-[11px]',
                        active ? 'text-salis-blue' : 'text-muted'
                      )}
                    >
                      <span className="sm:hidden">{t(shortLabel)}</span>
                      <span className="hidden sm:inline">{t(fullLabel)}</span>
                    </span>
                  </div>
                  {i < lastStep ? (
                    <div
                      className={cn(
                        'mx-2 mb-[18px] h-0.5 flex-1 rounded-full sm:mx-3 sm:mb-5',
                        done ? 'bg-salis-gradient-r' : 'bg-border'
                      )}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="flex min-h-[320px] flex-col gap-6 px-4 pb-0 pt-7 sm:px-8">
            {step === 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label
                    htmlFor="wsName"
                    className="font-action text-xs font-medium tracking-[.025em] text-heading"
                  >
                    {t('Workshop Name')}
                  </label>
                  <span className="relative flex items-center">
                    <Icon
                      name="Warehouse"
                      size={18}
                      className="pointer-events-none absolute z-[1] text-muted start-3"
                    />
                    <input
                      id="wsName"
                      placeholder={t('Al-Amri Auto Center')}
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      className="h-11 w-full rounded border border-border bg-inset px-3.5 font-action text-sm text-heading outline-none transition-all duration-200 ease-salis ps-10 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                    />
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="city"
                    className="font-action text-xs font-medium tracking-[.025em] text-heading"
                  >
                    {t('City')}
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value as (typeof CITIES)[number])}
                    className="h-11 w-full cursor-pointer rounded border border-border bg-inset px-3 font-action text-sm text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {t(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="phone"
                    className="font-action text-xs font-medium tracking-[.025em] text-heading"
                  >
                    {t('Phone')}
                  </label>
                  <span className="relative flex items-center">
                    <Icon
                      name="Phone"
                      size={18}
                      className="pointer-events-none absolute z-[1] text-muted start-3"
                    />
                    <input
                      id="phone"
                      dir="ltr"
                      placeholder="+966 5X XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded border border-border bg-inset px-3.5 font-mono text-[13px] text-heading outline-none transition-all duration-200 ease-salis ps-10 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                    />
                  </span>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label
                    htmlFor="vat"
                    className="font-action text-xs font-medium tracking-[.025em] text-heading"
                  >
                    {t('VAT Number')}
                  </label>
                  <span className="relative flex items-center">
                    <Icon
                      name="Receipt"
                      size={18}
                      className="pointer-events-none absolute z-[1] text-muted start-3"
                    />
                    <input
                      id="vat"
                      dir="ltr"
                      placeholder="3XXXXXXXXXXXXX3"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      className="h-11 w-full rounded border border-border bg-inset px-3.5 font-mono text-[13px] text-heading outline-none transition-all duration-200 ease-salis ps-10 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                    />
                  </span>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <>
                <p className="m-0 font-action text-sm text-muted">
                  {t('Select the services you offer')}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {SERVICES.map(([icon, label]) => {
                    const on = selected.includes(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleService(label)}
                        className={cn(
                          'flex cursor-pointer flex-col items-center gap-2.5 rounded-xl px-2 py-4 font-action transition-all duration-200',
                          on
                            ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue shadow-[0_0_0_1px_rgba(10,94,215,.15)]'
                            : 'border border-border bg-card text-body'
                        )}
                      >
                        <span
                          className={cn(
                            'flex rounded-xl p-2.5',
                            on ? 'bg-salis-gradient text-white' : 'bg-[rgba(10,94,215,.08)] text-salis-blue'
                          )}
                        >
                          <Icon name={icon} size={20} />
                        </span>
                        <span className="text-center text-xs font-medium">{t(label)}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div>
                  <h3 className="m-0 text-[17px] font-medium text-heading">
                    {t('Invite your team')}
                  </h3>
                  <p className="mt-1 font-action text-[13px] text-muted">
                    {t('You can also do this later from Settings')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <span className="relative flex flex-1 items-center">
                    <Icon
                      name="Mail"
                      size={18}
                      className="pointer-events-none absolute z-[1] text-muted start-3"
                    />
                    <input
                      placeholder={t('Email address')}
                      value={invEmail}
                      onChange={(e) => setInvEmail(e.target.value)}
                      dir="ltr"
                      className="h-11 w-full rounded border border-border bg-inset px-3.5 font-action text-sm text-heading outline-none transition-all duration-200 ease-salis ps-10 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                    />
                  </span>
                  <div className="flex gap-3">
                    <select
                      value={invRole}
                      onChange={(e) => setInvRole(e.target.value as (typeof ROLES)[number])}
                      className="h-11 flex-1 cursor-pointer rounded border border-border bg-inset px-3 font-action text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)] sm:flex-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t(r)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addInvite}
                      className="inline-flex h-11 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded border-none bg-salis-gradient px-[18px] font-action text-[13px] font-semibold text-white transition-all duration-200"
                    >
                      <Icon name="Plus" size={14} />
                      {t('Add')}
                    </button>
                  </div>
                </div>
                {invites.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {invites.map((inv, i) => (
                      <div
                        key={`${inv.email}-${i}`}
                        className="flex items-center gap-3 rounded-[10px] border border-border bg-inset px-3 py-2.5"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
                          {inv.email[0]?.toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-ui text-[13px] text-body" dir="ltr">
                          {inv.email}
                        </span>
                        <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-0.5 text-xs font-medium text-salis-blue">
                          {t(inv.role)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInvite(i)}
                          aria-label={t('Remove')}
                          className="flex flex-shrink-0 cursor-pointer border-none bg-transparent p-1 text-muted hover:text-salis-orange"
                        >
                          <X size={14} aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-3 border-t border-border px-4 py-5 sm:px-8">
            {canBack ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded border-[1.5px] border-border-strong bg-transparent px-5 font-action text-sm font-medium text-body transition-all duration-200 hover:border-salis-blue hover:text-salis-blue"
              >
                <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={16} />
                {t('Back')}
              </button>
            ) : null}
            <span className="flex-1" />
            <Link to="/dashboard" className="font-action text-[13px] text-muted">
              {t('Skip for now')}
            </Link>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded border-none bg-salis-gradient px-6 font-action text-sm font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-all duration-200 hover:shadow-[0_8px_20px_rgba(10,94,215,.35)]"
            >
              {step < lastStep ? t('Continue') : t('Finish Setup')}
              <Icon name={step < lastStep ? (rtl ? 'ChevronLeft' : 'ChevronRight') : 'Check'} size={16} />
            </button>
          </div>
        </div>

        <p className="m-0 text-center font-action text-xs text-faint">
          {t('Step')} {step + 1} {t('of')} {STEP_LABELS.length}
        </p>
      </div>
    </div>
  )
}
