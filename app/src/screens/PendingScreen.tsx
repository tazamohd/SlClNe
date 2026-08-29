import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/shell/AppShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { ScreenMeta } from '@/data/types'

/** Stands in for a designed screen that hasn't been rebuilt yet.
 *
 *  The rebuild runs in batches, and a nav link that 404s would read as a bug in
 *  the routing rather than as work still queued. This says plainly which screen
 *  is missing and which `.dc.html` file holds its design, so the route table
 *  stays honest and complete at every point in the port. */
export function PendingScreen({
  screen,
  specId,
}: {
  screen: ScreenMeta
  /** Set for feature-map screens that have a reference screenshot but no
   *  `.dc.html` design — points at what to build from. */
  specId?: string
}) {
  const { t } = usePreferences()

  return (
    <>
      <PageHeader icon="Hammer" title={screen.name} subtitle={screen.purpose ?? undefined} />
      <Card className="flex max-w-2xl flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="flex rounded-lg bg-tint-orange p-2.5 text-salis-orange">
            <Icon name="Construction" size={20} />
          </span>
          <div>
            <p className="font-action text-sm font-semibold text-heading">
              {t('Designed, not yet rebuilt')}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {t('This screen exists in the design bundle and is queued for implementation.')}
            </p>
          </div>
        </div>

        <dl className="flex flex-col gap-2 border-t border-border pt-4 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t('Route')}</dt>
            <dd className="font-mono text-heading" dir="ltr">
              {screen.route}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t('Design file')}</dt>
            <dd className="font-mono text-heading" dir="ltr">
              {specId ? `spec/${specId}-*.README.md` : `${screen.name}.dc.html`}
            </dd>
          </div>
          {specId ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t('Reference')}</dt>
              <dd className="font-mono text-heading" dir="ltr">
                spec-shots/{specId}-*.png
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t('Mobile variant')}</dt>
            <dd className="font-mono text-heading" dir="ltr">
              {screen.hasMobile ? `${screen.name}.Mobile.dc.html` : '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </>
  )
}
