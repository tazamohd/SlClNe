import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Accept (or decline) an invitation to join a workspace. */
export function InviteAcceptance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  /** In a real flow the invite token would carry the org name; this is a
   *  placeholder that matches the design prototype. */
  const orgName = 'Al-Amri Auto Center'

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <div className={`rounded-2xl border border-border bg-card text-center shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Inviter avatar */}
        <span className={`mx-auto mb-3.5 flex items-center justify-center rounded-full bg-salis-gradient font-bold text-white ${isMobile ? 'h-12 w-12 text-lg' : 'h-14 w-14 text-xl'}`}>
          <Icon name="UserPlus" size={isMobile ? 18 : 22} />
        </span>

        <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-base' : 'text-lg'}`}>
          {t('Invitation')}
        </h2>
        <p className="mt-2 mb-5 font-action text-sm text-muted">
          {t("You've been invited to join")}{' '}
          <span className="font-semibold text-heading">{orgName}</span>
        </p>

        <div className="flex gap-2.5">
          <Link
            to="/login"
            className="inline-flex h-11 flex-1 items-center justify-center rounded border border-border bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
          >
            {t('Decline')}
          </Link>
          <Button size="md" className="flex-1" disabled={!isLive}>
            {t('Accept Invite')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
