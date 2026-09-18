import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { CAPABILITIES, DISTRIBUTION, GAPS, type PlatformBuild } from './native-build'

/** The shared body of `/native/android` and `/native/i-os`.
 *
 *  The two screens differ only in the platform's own build facts, so they share
 *  everything else: one description of what the app does, one list of what it
 *  does not, one answer to "where do I get it". Two copies drifted apart before
 *  — the Android page advertised NFC and digital signatures, the iOS page
 *  advertised barcode scanning and push, and neither had any of it.
 *
 *  Every claim comes from `native-build.ts`, which `scripts/check-native-claims.mjs`
 *  verifies against the native projects and the installed plugin list.
 */
export function NativeAppPage({
  icon,
  title,
  subtitle,
  platformLabel,
  build,
}: {
  icon: string
  title: string
  subtitle: string
  /** "For Android" / "For iPhone and iPad" — passed as a literal by each page
   *  rather than built here, so the string exists to be translated. */
  platformLabel: string
  build: PlatformBuild
}) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const facts: { label: string; value: string }[] = [
    { label: 'Version', value: `${build.version} (${t('build')} ${build.build})` },
    { label: 'Identifier', value: build.appId },
    { label: 'Requires', value: t(build.minimum) },
    { label: 'Devices', value: t(build.devices) },
    { label: 'Languages', value: t('Arabic, English') },
  ]

  /* The one thing a reader most needs to know, and the thing the old pages
   * actively concealed by rendering a star rating for a listing that does not
   * exist. */
  const availability = (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-tint-orange p-4">
      <span className="flex flex-shrink-0 text-salis-orange" aria-hidden>
        <Icon name="Info" size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-heading">{t(DISTRIBUTION.status)}</p>
        <p className="mt-0.5 text-xs text-muted">{t(DISTRIBUTION.build)}</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon={icon} title={t(title)} subtitle={t(subtitle)} />
        {availability}

        <p className="text-xs font-bold text-heading">{t('Build')}</p>
        <MobileCard>
          {facts.map((fact) => (
            <MobileCardRow key={fact.label} label={t(fact.label)} value={fact.value} />
          ))}
        </MobileCard>

        <p className="text-xs font-bold text-heading">{t('What the app does')}</p>
        {CAPABILITIES.map((capability) => (
          <MobileCard key={capability.title}>
            <div className="flex items-start gap-2">
              <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
                <Icon name={capability.icon} size={14} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-heading">{t(capability.title)}</p>
                <p className="text-xs text-muted">{t(capability.description)}</p>
              </div>
            </div>
          </MobileCard>
        ))}

        <p className="text-xs font-bold text-heading">{t('Not in the app yet')}</p>
        {GAPS.map((gap) => (
          <MobileCard key={gap.title}>
            <div className="flex items-start gap-2">
              <span className="flex flex-shrink-0 rounded-lg bg-inset p-1.5 text-muted" aria-hidden>
                <Icon name={gap.icon} size={14} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-heading">{t(gap.title)}</p>
                <p className="text-xs text-muted">
                  {t('Needs')} {t(gap.needs)}.
                </p>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon={icon} title={t(title)} subtitle={t(subtitle)} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex w-full flex-shrink-0 flex-col items-center rounded-2xl p-8 shadow-sm lg:w-72">
          <span className="flex rounded-3xl bg-salis-gradient p-5 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name={icon} size={40} />
          </span>
          <p className="mt-4 text-lg font-bold text-heading">{t('SALIS AUTO')}</p>
          <p className="mt-1 text-xs text-muted">{t(platformLabel)}</p>
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">
            {t('Version')} {build.version}
          </Badge>
          <div className="mt-6 w-full">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"
              >
                <span className="flex-shrink-0 text-muted">{t(fact.label)}</span>
                <span dir="ltr" className="truncate font-medium text-heading">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {availability}

          <Card className="rounded-2xl p-6 shadow-sm">
            <p className="mb-4 text-sm font-bold text-heading">{t('What the app does')}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CAPABILITIES.map((capability) => (
                <div key={capability.title} className="flex items-start gap-3 rounded-xl bg-inset p-4">
                  <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden>
                    <Icon name={capability.icon} size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">{t(capability.title)}</p>
                    <p className="mt-0.5 text-xs text-muted">{t(capability.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-bold text-heading">{t('Not in the app yet')}</p>
            {/* Named rather than omitted: four of these were advertised as
                working, so the useful thing is to say what is missing and what
                each one would take. */}
            <p className="mb-4 mt-0.5 text-xs text-muted">
              {t('Each of these needs a plugin this build does not ship.')}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {GAPS.map((gap) => (
                <div key={gap.title} className="flex items-start gap-3 rounded-xl bg-inset p-4">
                  <span className="flex flex-shrink-0 rounded-lg bg-card p-2 text-muted" aria-hidden>
                    <Icon name={gap.icon} size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">{t(gap.title)}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {t('Needs')} {t(gap.needs)}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
