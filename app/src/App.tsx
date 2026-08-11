import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { SessionProvider } from '@/providers/SessionProvider'
import { ModalProvider } from '@/components/ui/Modal'
import { ToastProvider } from '@/components/ui/Toast'
import { AppRoutes } from '@/routes'

// Mock data never goes stale, and won't once it's real either — the screens
// here are dashboards and registries, not tickers.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SessionProvider>
          <ToastProvider>
            {/* Inside ToastProvider so a toast raised from a dialog still
                paints over it — the toast layer sits above the dialog layer. */}
            <ModalProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ModalProvider>
          </ToastProvider>
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  )
}
