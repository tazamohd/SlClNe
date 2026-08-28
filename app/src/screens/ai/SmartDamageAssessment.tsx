import { useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface DamageReport {
  id: string
  vehicle: string
  plate: string
  date: string
  status: 'completed' | 'processing' | 'pending-review'
  areas: string[]
  severity: 'minor' | 'moderate' | 'severe'
  estimatedCost: string
  confidence: number
  images: number
}

const REPORTS: DamageReport[] = [
  {
    id: 'da-1',
    vehicle: '2023 BMW X5',
    plate: 'RYD 4521',
    date: 'Today, 11:20 AM',
    status: 'completed',
    areas: ['Front bumper', 'Left headlight'],
    severity: 'moderate',
    estimatedCost: 'SAR 3,200',
    confidence: 92,
    images: 6,
  },
  {
    id: 'da-2',
    vehicle: '2022 Mercedes C-Class',
    plate: 'JED 8834',
    date: 'Today, 9:45 AM',
    status: 'completed',
    areas: ['Rear quarter panel'],
    severity: 'minor',
    estimatedCost: 'SAR 1,100',
    confidence: 96,
    images: 4,
  },
  {
    id: 'da-3',
    vehicle: '2021 Toyota Land Cruiser',
    plate: 'DMM 2219',
    date: 'Yesterday, 3:30 PM',
    status: 'pending-review',
    areas: ['Front fender', 'Hood', 'Windshield'],
    severity: 'severe',
    estimatedCost: 'SAR 8,500',
    confidence: 78,
    images: 12,
  },
  {
    id: 'da-4',
    vehicle: '2023 Kia Sportage',
    plate: 'MKH 6677',
    date: 'Yesterday, 1:15 PM',
    status: 'processing',
    areas: ['Right door'],
    severity: 'minor',
    estimatedCost: '—',
    confidence: 0,
    images: 3,
  },
]

const SEVERITY_TONES: Record<string, { bg: string; fg: string }> = {
  minor: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  moderate: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  severe: { bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
}

const STATUS_TONES: Record<string, { bg: string; fg: string; label: string }> = {
  completed: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', label: 'Completed' },
  processing: { bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', label: 'Processing' },
  'pending-review': { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Pending Review' },
}

const TABS = [
  { id: 'assessments', label: 'Assessments', icon: 'Camera' },
  { id: 'upload', label: 'New Assessment', icon: 'Upload' },
] as const

export function SmartDamageAssessment() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('assessments')

  return (
    <>
      <FeatureHeader
        icon="Camera"
        title={t('Smart Damage Assessment')}
        subtitle={t('AI-powered damage detection & estimation')}
      />

      <StatRow
        stats={[
          { label: 'Total Assessments', value: REPORTS.length, highlight: true, icon: 'Camera' },
          { label: 'Avg Accuracy', value: '89%', tone: 'info', icon: 'Target' },
          { label: 'Pending Review', value: REPORTS.filter((r) => r.status === 'pending-review').length, tone: 'warning', icon: 'Clock' },
          { label: 'Total Estimated', value: 'SAR 12.8K', icon: 'Calculator' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'assessments' && (
        <div className="flex flex-col gap-4">
          {REPORTS.map((report) => {
            const sev = SEVERITY_TONES[report.severity]
            const st = STATUS_TONES[report.status]
            return (
              <Card key={report.id} className="flex flex-col gap-4 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2.5"
                    style={{ background: sev.bg, color: sev.fg }}
                  >
                    <Icon name="Camera" size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-heading">{report.vehicle}</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {report.plate} &middot; {report.date}
                    </p>
                  </div>
                  <Badge background={st.bg} color={st.fg}>
                    {t(st.label)}
                  </Badge>
                </div>

                <div className="rounded-[10px] border border-border bg-inset p-3">
                  <div className="mb-2 text-[13px]">
                    <span className="font-semibold text-salis-blue">{t('Damage Areas')}: </span>
                    {report.areas.map((area, i) => (
                      <span key={i} className="text-body">
                        {i > 0 && ', '}
                        {t(area)}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[13px]">
                    <span>
                      <span className="font-semibold text-muted">{t('Severity')}: </span>
                      <span className="font-medium" style={{ color: sev.fg }}>
                        {t(report.severity.charAt(0).toUpperCase() + report.severity.slice(1))}
                      </span>
                    </span>
                    <span>
                      <span className="font-semibold text-muted">{t('Estimate')}: </span>
                      <span className="font-medium text-heading">{report.estimatedCost}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Image" size={12} className="text-muted" />
                      {report.images} {t('photos')}
                    </span>
                  </div>
                </div>

                {report.confidence > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{t('AI Confidence')}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${report.confidence}%`,
                          background: report.confidence >= 90 ? '#0A5ED7' : report.confidence >= 80 ? '#0BB3FF' : '#F97316',
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-muted">{report.confidence}%</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'upload' && (
        <Section title={t('Upload Vehicle Images')}>
          <div className="flex flex-col items-center gap-4 py-12">
            <div
              className={cn(
                'flex h-40 w-full max-w-md cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border transition-colors hover:border-salis-blue hover:bg-[rgba(10,94,215,.03)]'
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
                <Icon name="Upload" size={24} />
              </span>
              <p className="text-sm text-muted">{t('Drop images here or click to upload')}</p>
              <p className="text-xs text-muted">{t('Supports JPG, PNG — up to 10 images')}</p>
            </div>
            <p className="max-w-md text-center text-xs text-muted">
              {t(
                'The AI damage assessment service will analyze uploaded photos to detect damage areas, severity, and provide cost estimates. Service not connected — results will be available once the vision API is configured.'
              )}
            </p>
          </div>
        </Section>
      )}
    </>
  )
}
