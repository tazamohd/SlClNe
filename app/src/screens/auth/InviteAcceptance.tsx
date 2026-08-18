import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Standalone invite link — a manager sends a teammate a join link before that
 *  teammate has any account. PUBLIC auth-chain screen: no app shell, no role
 *  check, reachable while signed out.
 *
 *  Accept routes into Register (the invite pre-fills the workshop there in the
 *  real flow); Decline returns to Login. Both are demo actions — there is no
 *  invite token to redeem yet, so the outcome is a toast and a short pause
 *  before the redirect, matching the Sign In confirmation pattern. */
const INVITER_NAME = 'Khalid Al-Amri'
const ORG_NAME = 'Al-Amri Auto Center'

export function InviteAcceptance() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null)

  function decline() {
    setBusy('decline')
    toast.show({
      title: t('Invite declined'),
      description: `${t("You've been invited to join")} ${ORG_NAME}`,
    })
    setTimeout(() => navigate('/login', { replace: true }), 600)
  }

  function accept() {
    setBusy('accept')
    toast.show({
      title: t('Invite accepted'),
      description: `${INVITER_NAME} · ${ORG_NAME}`,
    })
    setTimeout(() => navigate('/register', { replace: true }), 600)
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <div className="rounded-lg border border-border bg-[color-mix(in_srgb,var(--surface-card)_92%,transparent)] p-6 text-center shadow-lg backdrop-blur-[24px]">
        <span className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-salis-gradient font-display text-xl font-bold text-white">
          {INVITER_NAME.charAt(0)}
        </span>

        <h2 className="font-display text-lg font-bold text-heading">{t('Invite Acceptance')}</h2>

        <p className="mx-auto mt-2 max-w-[320px] text-pretty font-action text-sm leading-[1.5] text-muted">
          {t("You've been invited to join")}{' '}
          <span className="font-semibold text-heading">{t(ORG_NAME)}</span>
        </p>

        <div className="mx-auto mt-5 flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-start">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
            <Icon name="UserPlus" size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-heading">{t(INVITER_NAME)}</p>
            <p className="mt-0.5 truncate text-xs text-muted" dir="ltr">
              khalid@alamri-auto.sa
            </p>
          </div>
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[rgba(10,94,215,.1)] px-2 py-1 text-[11px] font-semibold text-salis-blue">
            <Icon name="Building2" size={12} />
            {t('Manager')}
          </span>
        </div>

        <div className="mt-5 flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={busy !== null}
            onClick={decline}
          >
            {t('Decline')}
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={busy !== null}
            onClick={accept}
          >
            {t('Accept Invite')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
