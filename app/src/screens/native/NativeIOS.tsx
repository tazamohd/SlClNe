import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface AppFeature {
  title: string
  description: string
  icon: string
}

const APP_FEATURES: AppFeature[] = [
  { title: 'Job Card Management', description: 'Create and manage job cards on the go', icon: 'ClipboardList' },
  { title: 'Appointment Scheduling', description: 'Book and manage service appointments', icon: 'Calendar' },
  { title: 'Vehicle Inspection', description: 'Digital multi-point inspection with photos', icon: 'ScanEye' },
  { title: 'Push Notifications', description: 'Real-time alerts for jobs and appointments', icon: 'Bell' },
  { title: 'Barcode Scanner', description: 'Scan parts barcodes for quick lookup', icon: 'ScanBarcode' },
  { title: 'Offline Mode', description: 'Continue working without internet connection', icon: 'WifiOff' },
]

interface AppInfo {
  label: string
  value: string
}

const APP_INFO: AppInfo[] = [
  { label: 'Version', value: '3.2.1' },
  { label: 'Size', value: '48.6 MB' },
  { label: 'Requires', value: 'iOS 16.0+' },
  { label: 'Compatibility', value: 'iPhone, iPad' },
  { label: 'Languages', value: 'Arabic, English' },
  { label: 'Last Updated', value: 'Aug 10, 2026' },
]

export function NativeIOS() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Apple" title={t('iOS App')} subtitle={t('Salis Auto for iPhone & iPad')} />
        <MobileCard>
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="flex rounded-2xl bg-salis-gradient p-4 text-white shadow-[0_12px_20px_-6px_rgba(10,94,215,.3)]">
              <Icon name="Apple" size={32} />
            </span>
            <p className="text-sm font-bold text-heading">{t('Salis Auto ERP')}</p>
            <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Version')} 3.2.1</Badge>
          </div>
        </MobileCard>
        <p className="text-xs font-bold text-heading">{t('App Details')}</p>
        <MobileCard>
          {APP_INFO.map((info, i) => (
            <MobileCardRow key={i} label={t(info.label)} value={info.value} />
          ))}
        </MobileCard>
        <p className="text-xs font-bold text-heading">{t('Features')}</p>
        {APP_FEATURES.map((feature, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={feature.icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(feature.title)}</p>
                    <p className="text-xs text-muted">{t(feature.description)}</p>
                  </div>
                </div>
              }
            />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Apple" title={t('iOS App')} subtitle={t('Salis Auto ERP for iPhone and iPad')} />

      <div className="flex gap-6">
        <Card className="flex w-72 flex-shrink-0 flex-col items-center rounded-2xl p-8 shadow-sm">
          <span className="flex rounded-3xl bg-salis-gradient p-5 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Apple" size={40} />
          </span>
          <p className="mt-4 text-lg font-bold text-heading">{t('Salis Auto ERP')}</p>
          <p className="mt-1 text-xs text-muted">{t('By Salis Technologies')}</p>
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Version')} 3.2.1</Badge>
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon key={star} name="Star" size={16} className={star <= 4 ? 'text-salis-orange' : 'text-muted'} />
            ))}
            <span className="ms-1 text-xs text-muted">4.8</span>
          </div>
          <div className="mt-6 w-full">
            {APP_INFO.map((info, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
                <span className="text-muted">{t(info.label)}</span>
                <span className="font-medium text-heading">{info.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-1 flex-col gap-4">
          <Card className="rounded-2xl p-6 shadow-sm">
            <p className="mb-4 text-sm font-bold text-heading">{t('Key Features')}</p>
            <div className="grid grid-cols-2 gap-4">
              {APP_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-surface-secondary p-4">
                  <span className="flex flex-shrink-0 rounded-lg p-2 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={feature.icon} size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">{t(feature.title)}</p>
                    <p className="mt-0.5 text-xs text-muted">{t(feature.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-sm">
            <p className="mb-2 text-sm font-bold text-heading">{t('System Requirements')}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Smartphone" size={14} className="text-muted" />
                <span className="text-body">{t('iPhone 12 or later recommended')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Tablet" size={14} className="text-muted" />
                <span className="text-body">{t('iPad Air 4th gen or later')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
