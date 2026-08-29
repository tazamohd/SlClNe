import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Native app-shell showcase: how the port looks wrapped in real platform
 *  chrome (status bar, top/nav bar, gesture affordance). The frames are
 *  drawn — no store badges, screenshots or device renders are fetched — so
 *  the same handful of screen specimens are reused inside an Android
 *  (Material 3) frame here and an iOS (Liquid Glass) frame in `NativeIOS`. */

type TFn = (source: string) => string
type Platform = 'android' | 'ios'

// ── Status-bar glyphs (signal / wifi / battery), drawn not fetched ─────────
function StatusGlyphs() {
  return (
    <span className="flex items-center gap-1 text-heading">
      <svg width="12" height="9" viewBox="0 0 12 9" aria-hidden="true">
        <rect x="0" y="5" width="2.2" height="4" rx="0.5" fill="currentColor" />
        <rect x="3.3" y="3" width="2.2" height="6" rx="0.5" fill="currentColor" />
        <rect x="6.6" y="1" width="2.2" height="8" rx="0.5" fill="currentColor" />
        <rect x="9.9" y="0" width="2.2" height="9" rx="0.5" fill="currentColor" />
      </svg>
      <svg width="11" height="9" viewBox="0 0 11 9" aria-hidden="true">
        <path
          d="M5.5 2.2c1.6 0 3 .7 4 1.7l.9-.9C9.1 1.7 7.4 1 5.5 1S1.9 1.7.6 3l.9.9c1-1 2.4-1.7 4-1.7Z"
          fill="currentColor"
        />
        <circle cx="5.5" cy="7.3" r="1" fill="currentColor" />
      </svg>
      <svg width="17" height="9" viewBox="0 0 17 9" aria-hidden="true">
        <rect x="0.5" y="0.5" width="14" height="8" rx="2" stroke="currentColor" fill="none" opacity=".5" />
        <rect x="2" y="2" width="11" height="5" rx="1" fill="currentColor" />
        <rect x="15" y="3" width="1.4" height="3" rx="0.4" fill="currentColor" opacity=".5" />
      </svg>
    </span>
  )
}

// ── Device frame: the mockup itself is the content ─────────────────────────
function DeviceFrame({ platform, label, children }: { platform: Platform; label: string; children: ReactNode }) {
  const isAndroid = platform === 'android'
  const size = isAndroid ? { w: 232, h: 502 } : { w: 222, h: 482 }

  return (
    <div
      className="relative flex flex-shrink-0 flex-col overflow-hidden bg-page"
      style={{
        width: size.w,
        height: size.h,
        borderRadius: isAndroid ? 26 : 42,
        boxShadow: isAndroid
          ? '0 20px 40px rgba(0,0,0,.35), 0 0 0 7px #33394a'
          : '0 20px 40px rgba(0,0,0,.35), 0 0 0 7px #1b1d22',
      }}
    >
      {isAndroid ? (
        <>
          <div className="flex flex-shrink-0 items-center justify-between px-3" style={{ height: 24 }}>
            <span className="font-mono text-[9px] text-heading" dir="ltr">
              9:30
            </span>
            <span
              className="absolute bg-page-alt"
              style={{
                insetInlineStart: '50%',
                top: 6,
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: 999,
              }}
            />
            <StatusGlyphs />
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-border px-2.5 py-2">
            <Icon name="ChevronLeft" size={14} className="text-muted" />
            <span className="flex-1 truncate text-[11px] font-semibold text-heading">{label}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
          <div className="flex flex-shrink-0 items-center justify-center" style={{ height: 18 }}>
            <span style={{ width: 60, height: 4, borderRadius: 999, background: 'var(--text-heading)', opacity: 0.35 }} />
          </div>
        </>
      ) : (
        <>
          <span
            className="absolute z-10 bg-page-alt"
            style={{
              insetInlineStart: '50%',
              top: 7,
              transform: 'translateX(-50%)',
              width: 66,
              height: 18,
              borderRadius: 999,
            }}
          />
          <div className="flex flex-shrink-0 items-center justify-between px-4" style={{ paddingTop: 11, height: 28 }}>
            <span className="font-mono text-[9px] font-semibold text-heading" dir="ltr">
              9:41
            </span>
            <StatusGlyphs />
          </div>
          <div className="flex flex-shrink-0 flex-col gap-1 border-b border-border px-4 pb-2 pt-1">
            <Icon name="ChevronLeft" size={13} className="text-salis-blue" />
            <span className="truncate font-display text-[15px] font-bold text-heading">{label}</span>
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
          <div className="flex flex-shrink-0 items-center justify-center" style={{ height: 16 }}>
            <span style={{ width: 84, height: 4, borderRadius: 999, background: 'var(--text-heading)', opacity: 0.35 }} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Screen specimens (shared content, framed differently per platform) ─────
function LoginSpecimen({ t }: { t: TFn }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white">
        <Icon name="Wrench" size={19} />
      </span>
      <div className="text-center">
        <p className="font-display text-[13px] font-bold text-heading">{t('Sign In')}</p>
        <p className="mt-1 text-[10px] text-muted">{t('Enter your workshop credentials')}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-2 rounded-lg border border-border bg-inset px-2.5 py-2 text-[10px] text-muted">
          <Icon name="Mail" size={12} />
          your@email.com
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-border bg-inset px-2.5 py-2 text-[10px] text-muted">
          <Icon name="Lock" size={12} />
          ••••••••
        </span>
        <span className="mt-1 flex h-8 items-center justify-center rounded-lg bg-salis-gradient text-[11px] font-semibold text-white">
          {t('Sign In')}
        </span>
      </div>
    </div>
  )
}

const DASHBOARD_JOBS = [
  { id: 'JC-3391', status: 'In Progress', customer: 'Ahmed Al-Rashid' },
  { id: 'JC-3388', status: 'Ready', customer: 'Fatima Al-Zahrani' },
] as const

function DashboardSpecimen({ t }: { t: TFn }) {
  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card p-2">
          <p className="text-[9px] text-muted">{t('Jobs Today')}</p>
          <p className="font-display text-[15px] font-black text-heading" dir="ltr">
            12
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-2">
          <p className="text-[9px] text-muted">{t('Revenue')}</p>
          <p className="font-display text-[15px] font-black text-salis-blue" dir="ltr">
            SAR 8.4k
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {DASHBOARD_JOBS.map((job) => (
          <div key={job.id} className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-heading" dir="ltr">
                {job.id}
              </span>
              <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
                {t(job.status)}
              </Badge>
            </div>
            <p className="mt-1 truncate text-[10px] text-body">{job.customer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const JOB_ROWS = [
  { id: 'JC-3391', status: 'In Progress', vehicle: 'Toyota Camry' },
  { id: 'JC-3388', status: 'Ready', vehicle: 'Hyundai Sonata' },
  { id: 'JC-3382', status: 'Pending', vehicle: 'Ford Explorer' },
] as const

const JOB_TONE: Record<string, readonly [string, string]> = {
  'In Progress': ['rgba(11,179,255,.12)', '#0BB3FF'],
  Ready: ['rgba(10,94,215,.12)', '#0A5ED7'],
  Pending: ['rgba(249,115,22,.12)', '#F97316'],
}

function JobCardsSpecimen({ t }: { t: TFn }) {
  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      {JOB_ROWS.map((job) => {
        const [bg, fg] = JOB_TONE[job.status]
        return (
          <div key={job.id} className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-heading" dir="ltr">
                {job.id}
              </span>
              <Badge background={bg} color={fg}>
                {t(job.status)}
              </Badge>
            </div>
            <p className="mt-1 text-[10px] text-body">{job.vehicle}</p>
          </div>
        )
      })}
    </div>
  )
}

const OB_SERVICES = [
  { icon: 'Wrench', label: 'Maintenance' },
  { icon: 'Disc', label: 'Brakes' },
  { icon: 'Zap', label: 'Electrical' },
  { icon: 'Wind', label: 'AC & Climate' },
  { icon: 'SearchCheck', label: 'Diagnostics' },
  { icon: 'Droplets', label: 'Oil Change' },
] as const

function OnboardingSpecimen({ t }: { t: TFn }) {
  return (
    <div className="flex h-full flex-col gap-2.5 px-3 py-3">
      <p className="text-[10px] text-muted">{t('Which services does your workshop offer?')}</p>
      <div className="grid grid-cols-3 gap-2">
        {OB_SERVICES.map((service, index) => (
          <span
            key={service.label}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border p-2 text-center',
              index === 0
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-body'
            )}
          >
            <Icon name={service.icon} size={14} />
            <span className="text-[9px] font-medium leading-tight">{t(service.label)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function CheckInSpecimen({ t }: { t: TFn }) {
  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[10px] font-bold text-white">
          A
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-heading">Ahmed Al-Rashid</p>
          <p className="text-[9px] text-muted" dir="ltr">
            Toyota Camry · RUH 4821
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card p-2">
          <p className="text-[9px] text-muted">{t('Odometer')}</p>
          <p className="mt-0.5 font-mono text-[11px] font-bold text-heading" dir="ltr">
            42,180 km
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-2">
          <p className="text-[9px] text-muted">{t('Fuel Level')}</p>
          <p className="mt-0.5 text-[11px] font-bold text-salis-blue">3/4</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-inset text-muted">
        <Icon name="Camera" size={13} />
        <span className="text-[10px]">{t('Add Photos')}</span>
      </div>
      <span className="flex h-8 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-salis-gradient text-[11px] font-semibold text-white">
        <Icon name="Check" size={12} />
        {t('Complete Check-In')}
      </span>
    </div>
  )
}

const SPECIMENS: readonly {
  key: string
  icon: string
  title: string
  Content: (props: { t: TFn }) => ReactNode
}[] = [
  { key: 'login', icon: 'LogIn', title: 'Sign In', Content: LoginSpecimen },
  { key: 'dashboard', icon: 'LayoutDashboard', title: 'Dashboard', Content: DashboardSpecimen },
  { key: 'job-cards', icon: 'Wrench', title: 'Job Cards', Content: JobCardsSpecimen },
  { key: 'onboarding', icon: 'ListChecks', title: 'Service Onboarding', Content: OnboardingSpecimen },
  { key: 'check-in', icon: 'ClipboardCheck', title: 'Workshop Check-In', Content: CheckInSpecimen },
]

function DeviceGrid({ platform }: { platform: Platform }) {
  const { t } = usePreferences()
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {SPECIMENS.map((specimen) => (
        <Card key={specimen.key} className="flex flex-col items-center gap-3 rounded-lg p-5">
          <div className="flex items-center gap-2 self-start">
            <Icon name={specimen.icon} size={13} className="text-salis-blue" />
            <span className="text-[11px] font-semibold text-muted">{t(specimen.title)}</span>
          </div>
          <DeviceFrame platform={platform} label={t(specimen.title)}>
            <specimen.Content t={t} />
          </DeviceFrame>
        </Card>
      ))}
    </div>
  )
}

// ── Platform spec strip ─────────────────────────────────────────────────────
const ANDROID_SPECS = [
  { label: 'OS Version', value: 'Android 15' },
  { label: 'API Level', value: '35' },
  { label: 'Design System', value: 'Material 3' },
  { label: 'Navigation', value: 'Gesture pill' },
] as const

const IOS_SPECS = [
  { label: 'OS Version', value: 'iOS 26' },
  { label: 'Chrome Style', value: 'Liquid Glass' },
  { label: 'Home Control', value: 'Swipe indicator' },
  { label: 'Navigation', value: 'Large title' },
] as const

function SpecStrip({ specs }: { specs: readonly { label: string; value: string }[] }) {
  const { t } = usePreferences()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {specs.map((spec) => (
        <Card key={spec.label} className="rounded-lg p-3.5">
          <p className="text-[11px] text-muted">{t(spec.label)}</p>
          <p className="mt-1 font-mono text-[13px] font-semibold text-heading" dir="ltr">
            {spec.value}
          </p>
        </Card>
      ))}
    </div>
  )
}

// ── Screens ──────────────────────────────────────────────────────────────────
export function NativeAndroid() {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader
        icon="Smartphone"
        title={t('Android Native Shell')}
        subtitle={t('Material You status bar, gesture navigation and adaptive app bar chrome')}
      />
      <SpecStrip specs={ANDROID_SPECS} />
      <DeviceGrid platform="android" />
    </>
  )
}

export function NativeIOS() {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader
        icon="Apple"
        title={t('iOS Native Shell')}
        subtitle={t('Dynamic Island, glass navigation bars and the iOS home indicator')}
      />
      <SpecStrip specs={IOS_SPECS} />
      <DeviceGrid platform="ios" />
    </>
  )
}
