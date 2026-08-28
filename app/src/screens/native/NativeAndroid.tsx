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
  { title: 'Job Management', description: 'Full job card lifecycle on your device', icon: 'ClipboardList' },
  { title: 'Vehicle Scanning', description: 'VIN and plate number scanning via camera', icon: 'Camera' },
  { title: 'Digital Signatures', description: 'Capture customer signatures on screen', icon: 'Signature' },
  { title: 'Photo Documentation', description: 'Attach photos to inspections and jobs', icon: 'Image' },
  { title: 'NFC Tag Support', description: 'Read vehicle NFC tags for quick access', icon: 'Smartphone' },
  { title: 'Background Sync', description: 'Data syncs automatically when connected', icon: 'RefreshCw' },
]

interface AppInfo {
  label: string
  value: string
}

const APP_INFO: AppInfo[] = [
  { label: 'Version', value: '3.2.1' },
  { label: 'Size', value: '38.2 MB' },
  { label: 'Requires', value: 'Android 12+' },
  { label: 'Compatibility', value: 'Phone, Tablet' },
  { label: 'Languages', value: 'Arabic, English' },
  { label: 'Last Updated', value: 'Aug 12, 2026' },
]

interface DeviceRequirement {
  label: string
  value: string
  icon: string
}

const DEVICE_REQUIREMENTS: DeviceRequirement[] = [
  { label: 'RAM', value: '4 GB minimum', icon: 'Cpu' },
  { label: 'Storage', value: '100 MB free space', icon: 'Database' },
  { label: 'Screen', value: '5 inch or larger', icon: 'Smartphone' },
  { label: 'Camera', value: 'Required for scanning', icon: 'Camera' },
]

export function NativeAndroid() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Smartphone" title={t('Android App')} subtitle={t('Salis Auto for Android')} />
        <MobileCard>
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="flex rounded-2xl bg-salis-gradient p-4 text-white shadow-[0_12px_20px_-6px_rgba(10,94,215,.3)]">
              <Icon name="Smartphone" size={32} />
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
                  <span className="flex rounded-lg p-1.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
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
      <PageHeader icon="Smartphone" title={t('Android App')} subtitle={t('Salis Auto ERP for Android devices')} />

      <div className="flex gap-6">
        <Card className="flex w-72 flex-shrink-0 flex-col items-center rounded-2xl p-8 shadow-sm">
          <span className="flex rounded-3xl bg-salis-gradient p-5 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Smartphone" size={40} />
          </span>
          <p className="mt-4 text-lg font-bold text-heading">{t('Salis Auto ERP')}</p>
          <p className="mt-1 text-xs text-muted">{t('By Salis Technologies')}</p>
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Version')} 3.2.1</Badge>
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon key={star} name="Star" size={16} style={{ color: star <= 4 ? 'var(--salis-orange)' : 'rgb(107,114,128)' }} />
            ))}
            <span className="ms-1 text-xs text-muted">4.6</span>
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
                  <span className="flex flex-shrink-0 rounded-lg p-2" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
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
            <p className="mb-4 text-sm font-bold text-heading">{t('Device Requirements')}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {DEVICE_REQUIREMENTS.map((req, i) => (
                <div key={i} className="flex flex-col items-center rounded-xl bg-surface-secondary p-4 text-center">
                  <span className="flex rounded-lg p-2" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={req.icon} size={16} />
                  </span>
                  <p className="mt-2 text-xs font-semibold text-heading">{t(req.label)}</p>
                  <p className="text-[11px] text-muted">{t(req.value)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
