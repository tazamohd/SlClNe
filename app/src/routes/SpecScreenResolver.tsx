import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'
import { FeatureScreenView } from '@/screens/feature/FeatureScreenView'
import { PendingScreen } from '@/screens/PendingScreen'
import { RequireAccess } from './RequireAccess'

const specByRoute = new Map(
  SPEC_SCREENS.filter((s) => !s.designScreen).map((s) => [s.route, s]),
)

export default function SpecScreenResolver() {
  const { pathname } = useLocation()
  const spec = useMemo(() => specByRoute.get(pathname), [pathname])

  if (!spec) return <Navigate to="/error404" replace />

  const def = FEATURE_DEF_BY_ROUTE.get(spec.route)
  return (
    <RequireAccess screen={spec.name}>
      {def ? (
        <FeatureScreenView def={def} />
      ) : (
        <PendingScreen
          screen={{
            name: spec.title,
            route: spec.route,
            hasMobile: false,
            purpose: spec.purpose,
          }}
          specId={spec.id}
        />
      )}
    </RequireAccess>
  )
}
