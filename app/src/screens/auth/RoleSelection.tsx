import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

interface RoleOption {
  id: string
  icon: string
  label: string
  labelAr: string
  description: string
  descriptionAr: string
  users: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'owner',
    icon: 'Crown',
    label: 'Workshop Owner',
    labelAr: 'مالك الورشة',
    description: 'Full workshop & team management',
    descriptionAr: 'إدارة كاملة للورشة والفريق',
    users: '248',
  },
  {
    id: 'advisor',
    icon: 'ClipboardList',
    label: 'Service Advisor',
    labelAr: 'مستشار الخدمة',
    description: 'Customer intake & service orders',
    descriptionAr: 'استقبال العملاء وإدارة الطلبات',
    users: '1.2K',
  },
  {
    id: 'technician',
    icon: 'Wrench',
    label: 'Technician',
    labelAr: 'فني',
    description: 'Execute jobs & update status',
    descriptionAr: 'تنفيذ الأعمال وتحديث الحالة',
    users: '3.4K',
  },
  {
    id: 'manager',
    icon: 'Users',
    label: 'Manager',
    labelAr: 'مدير',
    description: 'Reports, oversight & permissions',
    descriptionAr: 'التقارير والإشراف والصلاحيات',
    users: '680',
  },
]

/** Role selection — pick your role after signup. */
export function RoleSelection() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const [picked, setPicked] = useState<string>('owner')

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[560px]'}>
      <div className={`flex flex-col ${isMobile ? 'gap-4' : 'gap-6'}`}>
        {/* Header */}
        <div className="text-center">
          <BrandMark width={isMobile ? 70 : 90} />
          <h1 className={`mt-3 font-display font-black text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
            {t('Select Your Role')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t('Choose your role in the system')}
          </p>
        </div>

        {/* Role grid */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {ROLE_OPTIONS.map((role) => {
            const selected = picked === role.id
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPicked(role.id)}
                className={cn(
                  'flex w-full cursor-pointer flex-col gap-2.5 rounded-[14px] p-4 text-start',
                  'transition-all duration-200 ease-salis',
                  selected
                    ? 'border-[1.5px] border-salis-blue bg-salis-blue/[.06] text-salis-blue shadow-[0_8px_24px_rgba(10,94,215,.12)]'
                    : 'border border-border bg-card text-body hover:border-salis-blue/[.3]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex flex-shrink-0 items-center justify-center rounded-xl p-2.5',
                      selected
                        ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                        : 'bg-salis-blue/[.08] text-salis-blue'
                    )}
                  >
                    <Icon name={role.icon} size={20} />
                  </span>
                  <span className="font-action text-sm font-bold">
                    {rtl ? role.labelAr : t(role.label)}
                  </span>
                </div>
                <p className="text-xs leading-[1.4] opacity-75">
                  {rtl ? role.descriptionAr : t(role.description)}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] opacity-60">
                  <Icon name="Users" size={12} />
                  <span>
                    {role.users} {t('Users')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <Button size="lg" className="w-full" disabled={!isLive}>
          {t('Continue')}
        </Button>
      </div>
    </AuthLayout>
  )
}
