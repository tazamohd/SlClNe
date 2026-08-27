import { createContext, useContext, useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab* must be used inside <Tabs>')
  return ctx
}

export interface TabsProps {
  defaultTab?: string
  value?: string
  onChange?: (tab: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ defaultTab, value, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultTab ?? '')
  const baseId = useId()
  const activeTab = value ?? internal
  const setActiveTab = (id: string) => {
    if (!value) setInternal(id)
    onChange?.(id)
  }
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabListProps {
  children: ReactNode
  className?: string
  label?: string
}

export function TabList({ children, className, label }: TabListProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      tabIndex={-1}
      className={cn('flex gap-1 border-b border-border', className)}
      onKeyDown={(e) => {
        const tabs = Array.from(
          e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
        )
        const idx = tabs.indexOf(e.target as HTMLButtonElement)
        if (idx < 0) return
        let next = -1
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          next = (idx + 1) % tabs.length
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          next = (idx - 1 + tabs.length) % tabs.length
        } else if (e.key === 'Home') {
          next = 0
        } else if (e.key === 'End') {
          next = tabs.length - 1
        }
        if (next >= 0) {
          e.preventDefault()
          tabs[next].focus()
          tabs[next].click()
        }
      }}
    >
      {children}
    </div>
  )
}

export interface TabProps {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function Tab({ id, children, className, disabled }: TabProps) {
  const { activeTab, setActiveTab, baseId } = useTabsContext()
  const selected = activeTab === id
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${id}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${id}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={cn(
        '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        selected
          ? 'border-salis-blue text-salis-blue'
          : 'border-transparent text-muted hover:border-border hover:text-heading',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}

export interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const { activeTab, baseId } = useTabsContext()
  if (activeTab !== id) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${id}`}
      aria-labelledby={`${baseId}-tab-${id}`}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  )
}
