import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { securityApi, type SecuritySummary } from '@/data/repository'

const SECURITY_SUMMARY_KEY = ['security-summary'] as const

/** Six hand-picked values used to sit here: a password minimum, a "Require
 *  2FA" toggle, a "Session Timeout" of 30 minutes, a max-login-attempts
 *  figure, an "IP Whitelist Enabled" toggle and an audit-log retention
 *  period — none of it read from anywhere. Three describe features this
 *  system does not have (2FA, IP allow-listing, audit-log retention) and are
 *  dropped rather than re-sourced. The other three are genuinely enforced,
 *  read from `GET /security/summary` — the same figures `checkPasswordPolicy`
 *  and the login throttle actually apply, not a number that merely happened
 *  to coincide with them. `Active Sessions` is the one row this screen could
 *  not have shown before at all: a live count of `user_sessions`, scoped to
 *  whatever the caller's own role can see. */
export function SecuritySettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const summary = useQuery<SecuritySummary>({
    queryKey: SECURITY_SUMMARY_KEY,
    queryFn: () => securityApi!.summary(),
    enabled: securityApi !== null,
  })

  const rows = summary.data
    ? [
        { label: t('Password Minimum Length'), value: t(`${summary.data.passwordMinLength} characters`) },
        { label: t('Failed Attempts Before Lockout'), value: String(summary.data.loginMaxAttempts) },
        { label: t('Lockout Duration'), value: formatSeconds(summary.data.loginLockoutSeconds, t) },
        { label: t('Sign-in Session Length'), value: t(`${summary.data.refreshTokenTtlDays} days`) },
        { label: t('Active Sessions'), value: String(summary.data.activeSessions) },
      ]
    : []

  const Body =
    securityApi === null ? (
      <p className="flex items-start gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        <span>
          {t(
            'The enforced password, lockout and session policy can only be read from the API. This build has none, so nothing is shown in its place.'
          )}
        </span>
      </p>
    ) : summary.isLoading ? (
      <Loading label={t('Reading the enforced security policy…')} />
    ) : summary.error || !summary.data ? (
      <ErrorState
        title={t('Could not read the security policy')}
        description={summary.error?.message}
        onRetry={() => void summary.refetch()}
      />
    ) : isMobile ? (
      <MobileCard>
        {rows.map((s) => (
          <MobileCardRow key={s.label} label={s.label} value={<span dir="ltr">{s.value}</span>} />
        ))}
      </MobileCard>
    ) : (
      <div className="grid gap-4">
        {rows.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-muted">{s.label}</span>
            <span dir="ltr" className="font-mono text-sm font-medium text-heading">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Lock" title={t('Security Settings')} subtitle={t('Enforced security policy')} />
        {securityApi === null ? <div className="rounded-[14px] border border-border bg-card p-4">{Body}</div> : Body}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Lock" title={t('Security Settings')} subtitle={t('Enforced security policy')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
            <Icon name="Shield" size={16} />
          </span>
          <h2 className="text-sm font-semibold text-heading">{t('Security Configuration')}</h2>
        </div>
        {Body}
      </Card>
    </div>
  )
}

function formatSeconds(seconds: number, t: (s: string) => string): string {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60
    return t(minutes === 1 ? '1 minute' : `${minutes} minutes`)
  }
  return t(seconds === 1 ? '1 second' : `${seconds} seconds`)
}
