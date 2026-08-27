import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { isLive } from '@/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'

function getGreeting(t: (s: string) => string): string {
  const hour = new Date().getHours()
  if (hour < 12) return t('Good Morning')
  if (hour < 17) return t('Good Afternoon')
  return t('Good Evening')
}

const QUICK_STATS = [
  { label: "Today's Appointments", value: '5', icon: 'Calendar', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  { label: 'Active Jobs', value: '12', icon: 'Wrench', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  { label: 'Pending Invoices', value: '8', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  { label: 'Notifications', value: '3', icon: 'Bell', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
]

const QUICK_ACTIONS = [
  { label: 'New Appointment', icon: 'CalendarPlus', route: '/appointment-calendar' },
  { label: 'Create Job Card', icon: 'ClipboardPlus', route: '/job-cards' },
  { label: 'New Invoice', icon: 'FilePlus', route: '/invoice-create' },
  { label: 'View Reports', icon: 'BarChart3', route: '/reports' },
]

export function WelcomePage() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const greeting = getGreeting(t)

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Sparkles" title={greeting} subtitle={t('Welcome to Salis Auto')} />
        <div className="grid grid-cols-2 gap-3">
          {QUICK_STATS.map((s) => (
            <Card key={s.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: s.bg, color: s.fg }} aria-hidden><Icon name={s.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{t(s.label)}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{s.value}</h4>
            </Card>
          ))}
        </div>
        <h3 className="text-sm font-bold text-heading">{t('Quick Actions')}</h3>
        {QUICK_ACTIONS.map((a) => (
          <MobileCard key={a.label} onClick={() => navigate(a.route)}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={a.icon} size={14} /></span>
                  <span className={`text-[13px] font-semibold ${isLive ? 'text-heading' : 'text-muted'}`}>{t(a.label)}</span>
                </div>
              }
              trailing={<Icon name="ChevronRight" size={16} className={isLive ? 'text-muted' : 'text-border'} />}
            />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Sparkles" title={greeting} subtitle={t('Welcome to Salis Auto ERP')} />

      <div className="grid grid-cols-4 gap-4">
        {QUICK_STATS.map((s) => (
          <Card key={s.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: s.bg, color: s.fg }} aria-hidden><Icon name={s.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{t(s.label)}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{s.value}</h4>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-heading">{t('Quick Actions')}</h2>
        <div className="grid grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <Card
              key={a.label}
              className={`flex flex-col items-center gap-3 rounded-2xl p-6 shadow-sm transition-shadow ${isLive ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}`}
              onClick={() => navigate(a.route)}
            >
              <span className="flex rounded-xl bg-[rgba(10,94,215,.1)] p-3 text-salis-blue" aria-hidden>
                <Icon name={a.icon} size={24} />
              </span>
              <span className="text-sm font-semibold text-heading">{t(a.label)}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
