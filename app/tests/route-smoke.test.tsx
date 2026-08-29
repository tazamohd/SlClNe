// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { SessionProvider } from '@/providers/SessionProvider'
import { RepositoryProvider } from '@/providers/RepositoryProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { AppRoutes } from '@/routes'
import { SCREENS } from '@/data/generated/screens'
import type { ScreenMeta } from '@/data/types'

// ── jsdom polyfills for browser APIs the components expect ────────────

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

  const mockObserver = () => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
  window.IntersectionObserver = vi
    .fn()
    .mockImplementation(mockObserver) as unknown as typeof IntersectionObserver
  window.ResizeObserver = vi
    .fn()
    .mockImplementation(mockObserver) as unknown as typeof ResizeObserver
})

// ── test wrapper ─────────────────────────────────────────────────────

function renderRoute(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SessionProvider>
          <RepositoryProvider>
            <ToastProvider>
              <MemoryRouter initialEntries={[route]}>
                <AppRoutes />
              </MemoryRouter>
            </ToastProvider>
          </RepositoryProvider>
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>,
  )
}

// ── domain classification ────────────────────────────────────────────

function domainOf(name: string): string {
  if (name.startsWith('PublicPortal.')) return 'Public Portal'
  if (name.startsWith('CustomerApp.')) return 'Customer App'
  if (name.startsWith('CustomerPortal')) return 'Portals'
  if (name.startsWith('SupplierPortal')) return 'Portals'
  if (name.startsWith('TechnicianPortal')) return 'Portals'
  if (
    name.startsWith('PartsNetwork') ||
    name === 'PartsSupplyNetwork' ||
    name === 'PurchaseOrder' ||
    name.startsWith('ProcurementPortal')
  )
    return 'Network & Procurement'
  if (name.startsWith('UI.')) return 'UI Patterns'
  if (name.startsWith('Native.')) return 'Meta'
  if (name.startsWith('CallCenter')) return 'Call Center'

  const AUTH = new Set([
    'Splash', 'Welcome', 'Login', 'Register', 'ForgotPassword', 'ResetPassword',
    'OTPVerification', 'TwoFactorVerification', 'CreatePIN', 'BiometricSetup',
    'SocialLogin', 'SSOLogin', 'OrganizationSelection', 'WorkspaceSelection',
    'ProfileCompletion', 'Onboarding', 'InviteAcceptance', 'AccountLocked',
    'LogoutConfirmation', 'SessionExpired', 'Unauthorized', 'Error404',
    'Maintenance', 'PrivacyPolicy', 'TermsConditions', 'RoleSelection',
    'LanguageSelection', 'RegionSelection',
  ])
  if (AUTH.has(name)) return 'Auth & Onboarding'

  const WORKSHOP = new Set([
    'Dashboard', 'JobCards', 'JobDetail', 'JobCardDetail', 'AppointmentCalendar',
    'ApprovalInbox', 'CustomerApproval', 'DiagnosticReport', 'EstimateDetail',
    'OBDDiagnostics', 'TechnicianKB', 'TechnicianSchedule', 'WorkshopCheckIn',
    'WorkshopInspection', 'WorkshopEstimate', 'WorkshopQC', 'WorkshopSignature',
    'WorkshopDelivery', 'WorkshopReports',
  ])
  if (WORKSHOP.has(name)) return 'Workshop'

  const FINANCE = new Set([
    'Invoices', 'InvoiceDetail', 'InvoiceCreate', 'InvoicePreview',
    'Payments', 'Receipts', 'Expenses', 'BankReconciliation',
  ])
  if (FINANCE.has(name)) return 'Finance'

  const REGISTRY = new Set([
    'Customers', 'Vehicles', 'Technicians', 'Estimates', 'FleetManagement',
    'FleetContract', 'Appointments', 'CustomerDetail', 'VehicleDetail',
  ])
  if (REGISTRY.has(name)) return 'Registry'

  const ACCOUNTING = new Set([
    'ChartOfAccounts', 'JournalEntries', 'TaxManagement', 'FinancialReports',
    'FinancialStatements', 'ExecutiveReports', 'OperationalReports', 'BIDashboard',
    'CustomReports', 'InsuranceReports', 'LoanReports', 'Reports',
    'ReportsAnalytics', 'SalesReports', 'InventoryReports', 'Departments',
  ])
  if (ACCOUNTING.has(name)) return 'Accounting & Reports'

  const CRM = new Set([
    'LeadPipeline', 'LeadDetail', 'Opportunities', 'Campaigns', 'EmailMarketing',
    'SMSCampaigns', 'WhatsAppCampaigns', 'CustomerSegments', 'CRMTasks',
    'CRMCalendar', 'CustomerFeedback', 'AgentDashboard', 'AgentRegistry',
    'ConversationHistory', 'Integrations',
  ])
  if (CRM.has(name)) return 'CRM'

  const AI = new Set([
    'AIAnalytics', 'AIAssistant', 'AIAutomation', 'AIChatbot', 'AIChatbotAssistant',
    'AIServiceAdvisor', 'AutomationRules', 'KnowledgeBase', 'ModelSettings',
    'PromptLibrary', 'WorkflowBuilder', 'SmartDamageAssessment', 'MLFraudDetection',
    'NeuralNetworkPrediction', 'VoiceCommands', 'VoiceCommandInterface',
  ])
  if (AI.has(name)) return 'AI'

  const ADMIN = new Set([
    'AdvancedSettings', 'AuditLog', 'Backup', 'Branches', 'GlobalSearch',
    'NotificationCenter', 'OEMIntegrations', 'Organizations', 'Profile',
    'RolesPermissions', 'Settings', 'Subscription', 'SuperAdmin',
    'SystemIntegrations', 'Templates', 'UsersTeams', 'HRPayroll',
  ])
  if (ADMIN.has(name)) return 'Admin'

  if (['FlowSpec', 'RBACSpec', 'Index'].includes(name)) return 'Meta'
  if (name === 'Inventory') return 'Feature'
  if (name === 'KioskCheckIn') return 'Portals'

  return 'Other'
}

// ── group by domain ──────────────────────────────────────────────────

const grouped = new Map<string, ScreenMeta[]>()
for (const screen of SCREENS) {
  const domain = domainOf(screen.name)
  const list = grouped.get(domain) ?? []
  list.push(screen)
  grouped.set(domain, list)
}

// ── tests ────────────────────────────────────────────────────────────

describe('Route smoke tests — 200 registered screens', () => {
  beforeEach(() => {
    localStorage.setItem('salis-role', 'owner')
  })

  afterEach(() => {
    localStorage.clear()
    cleanup()
  })

  it('covers all registered screens', () => {
    const total = [...grouped.values()].reduce((n, arr) => n + arr.length, 0)
    expect(total).toBe(SCREENS.length)
  })

  for (const [domain, screens] of grouped) {
    describe(domain, () => {
      it.each(screens.map((s) => [s.name, s.route]))(
        '%s (%s) renders without crashing',
        async (_name, route) => {
          const { container } = renderRoute(route as string)
          expect(container.innerHTML.length).toBeGreaterThan(0)
        },
      )
    })
  }
})
