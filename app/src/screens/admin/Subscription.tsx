import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { MobileCard, MobileCardHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface BillingEntry {
  date: string
  amount: string
}

const FIXTURE_HISTORY: BillingEntry[] = [
  { date: 'Jul 20, 2026', amount: 'SAR 499' },
  { date: 'Jun 20, 2026', amount: 'SAR 499' },
  { date: 'May 20, 2026', amount: 'SAR 499' },
]

const USAGE_STATS = [
  { labelKey: 'Users', value: '8 / 15' },
  { labelKey: 'Storage', value: '4.2 / 20 GB' },
  { labelKey: 'Vehicles', value: 'Unlimited' },
]

export function Subscription() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  return (
    <div className="flex max-w-[800px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <h1 className="font-display text-[30px] font-black text-heading">
        {t('Subscription')}
      </h1>

      {/* Current plan hero */}
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-salis-gradient p-7 text-white shadow-[0_12px_24px_rgba(10,94,215,.25)]">
        <div>
          <p className="m-0 text-[13px] opacity-85">{t('Current Plan')}</p>
          <h2 className="m-0 mt-1.5 font-display text-[28px] font-black">PRO</h2>
          <p className="m-0 mt-1.5 text-[13px] opacity-90">
            {t('Next Billing Date')}: Aug 20, 2026
          </p>
        </div>
        <Button
          variant="outline"
          className="border-white/30 bg-white text-salis-blue hover:bg-white/90"
          disabled={!isLive}
          onClick={() => toast.show({ title: t('Manage Plan') })}
        >
          {t('Manage Plan')}
        </Button>
      </div>

      {/* Usage stats */}
      <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-3 gap-5'}>
        {USAGE_STATS.map((stat) => (
          <Card key={stat.labelKey} className="rounded-[14px] p-[18px]">
            <p className="m-0 text-xs text-muted">{t(stat.labelKey)}</p>
            <p className="m-0 mt-1.5 text-[22px] font-bold text-heading">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Billing history */}
      <Card className="flex flex-col gap-3 rounded-2xl p-5">
        <h3 className="text-base font-bold text-heading">{t('Billing History')}</h3>

        {isMobile ? (
          <div className="flex flex-col gap-2.5">
            {FIXTURE_HISTORY.map((h) => (
              <MobileCard key={h.date}>
                <MobileCardHeader
                  leading={<span className="text-[13px] text-body">{h.date}</span>}
                  trailing={
                    <span dir="ltr" className="font-mono text-[13px] text-muted">
                      {h.amount}
                    </span>
                  }
                />
              </MobileCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {FIXTURE_HISTORY.map((h) => (
              <div
                key={h.date}
                className="flex justify-between border-b border-border py-2 text-[13px] last:border-0"
              >
                <span className="text-body">{h.date}</span>
                <span dir="ltr" className="font-mono text-muted">
                  {h.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
