import type { DomainScreens } from '../registry'
import { Register } from '../auth/Register'
import { SSOLogin } from '../auth/SSOLogin'
import { SocialLogin } from '../auth/SocialLogin'
import { RoleSelection } from '../auth/RoleSelection'
import { WorkspaceSelection } from '../auth/WorkspaceSelection'
import { OrganizationSelection } from '../auth/OrganizationSelection'
import { ProfileCompletion } from '../auth/ProfileCompletion'
import { InviteAcceptance } from '../auth/InviteAcceptance'
import { Onboarding } from '../auth/Onboarding'

export const SCREENS: DomainScreens = {
  Register: { component: Register, ungated: true },
  SSOLogin: { component: SSOLogin, ungated: true },
  SocialLogin: { component: SocialLogin, ungated: true },
  RoleSelection,
  WorkspaceSelection,
  OrganizationSelection,
  ProfileCompletion,
  InviteAcceptance,
  Onboarding: { component: Onboarding, ungated: true },
}
