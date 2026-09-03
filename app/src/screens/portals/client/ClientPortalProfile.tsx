import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useNavigate } from 'react-router-dom'
import { UNKNOWN } from '@/screens/registry/writes'

/** The signed-in customer, from the session rather than a constant.
 *
 *  The design's "Abdullah Al-Qahtani" with a Gold tier and fourteen visits was
 *  a fixture; the session knows the name, email and role, and a live session
 *  knows the branch. Everything else — loyalty tier, visit count, national id —
 *  has no field behind it and shows the em dash instead of an invented value. */
export function ClientPortalProfile() {
  const { t, theme, toggleTheme, rtl, toggleLanguage } = usePreferences()
  const { user, userName, roleLabel } = useSession()
  const navigate = useNavigate()

  const personal = [
    { label: 'Full Name', value: userName, icon: 'User' },
    { label: 'Email', value: user?.email || UNKNOWN, icon: 'Mail', code: true },
    { label: 'Phone', value: UNKNOWN, icon: 'Phone', code: true },
    { label: 'National ID', value: UNKNOWN, icon: 'CreditCard', code: true },
  ]

  const membership = [
    { label: 'Role', value: roleLabel },
    { label: 'Branch', value: user?.branchId ?? UNKNOWN },
    { label: 'Member Since', value: UNKNOWN },
    { label: 'Total Visits', value: UNKNOWN },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader
        icon="User"
        title="My Profile"
        subtitle={t('Account details and preferences')}
        actions={
          <Button variant="destructive" size="lg" icon="LogOut" onClick={() => navigate('/logout-confirmation')}>
            {t('Logout')}
          </Button>
        }
      />

      <Card className="flex items-center gap-4 rounded-2xl p-5 shadow-sm">
        <Avatar name={userName} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-heading">{userName}</p>
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">
            {roleLabel}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
              <Icon name="User" size={16} />
            </span>
            <h2 className="text-sm font-semibold text-heading">{t('Personal Information')}</h2>
          </div>
          <dl className="grid gap-4">
            {personal.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <Icon name={field.icon} size={14} className="text-muted" />
                  {t(field.label)}
                </dt>
                <dd
                  dir={field.code && field.value !== UNKNOWN ? 'ltr' : undefined}
                  className={field.code ? 'font-mono text-sm font-medium text-heading' : 'text-sm font-medium text-heading'}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
              <Icon name="Award" size={16} />
            </span>
            <h2 className="text-sm font-semibold text-heading">{t('Membership')}</h2>
          </div>
          <dl className="grid gap-4">
            {membership.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-sm text-muted">{t(field.label)}</dt>
                <dd className="text-sm font-medium text-heading">{field.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Preferences')}</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" icon="Globe" onClick={toggleLanguage}>
            {rtl ? 'English' : 'عربي'}
          </Button>
          <Button variant="outline" size="lg" icon={theme === 'dark' ? 'Sun' : 'Moon'} onClick={toggleTheme}>
            {theme === 'dark' ? t('Light mode') : t('Dark mode')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
