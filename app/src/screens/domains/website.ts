/** Screens owned by agent 17 — Public Website & Landing.
 *
 *  The public marketing site and landing pages, rendered in PublicShell with no session at all.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  Every entry here is `ungated`: these pages must render for a visitor with
 *  no session, so they mount entirely outside `RequireAccess` — the guard
 *  would bounce an anonymous reader to /login.
 *
 *  The ten `PublicPortal.*` pages are Tier A, design-authoritative from
 *  `project/PublicPortal.*.dc.html` (§A25 provenance: the design handoff, with
 *  the deviations each screen's header comment records).
 *
 *  `PrivacyPolicy` and `TermsConditions` are Tier C content pages with **no**
 *  `.dc.html` in the handoff — design-system pages composed from the approved
 *  public section system, never presented as design-authoritative. The registry
 *  classifies them under the `auth` surface (they predate this barrel and once
 *  rendered a gated placeholder); declaring them here makes them real, ungated
 *  public pages and takes them off the placeholder ledger. */
import type { ComponentType } from 'react'
import type { DomainScreens, ScreenEntry } from '../registry'
import { PublicShell } from '@/components/shell/PublicShell'
import { PublicLanding } from '../public/Landing'
import { PublicAbout } from '../public/About'
import { PublicServices } from '../public/Services'
import { PublicMarketplace } from '../public/Marketplace'
import { PublicInsurance } from '../public/Insurance'
import { PublicLoans } from '../public/Loans'
import { PublicBlog } from '../public/Blog'
import { PublicFaq } from '../public/Faq'
import { PublicContact } from '../public/Contact'
import { PublicSupport } from '../public/Support'
import { PublicPrivacyPolicy } from '../public/PrivacyPolicy'
import { PublicTerms } from '../public/Terms'

const pub = (component: ComponentType): ScreenEntry => ({
  component,
  shell: PublicShell,
  ungated: true,
})

export const SCREENS: DomainScreens = {
  'PublicPortal.Landing': pub(PublicLanding),
  'PublicPortal.About': pub(PublicAbout),
  'PublicPortal.Services': pub(PublicServices),
  'PublicPortal.Marketplace': pub(PublicMarketplace),
  'PublicPortal.Insurance': pub(PublicInsurance),
  'PublicPortal.Loans': pub(PublicLoans),
  'PublicPortal.Blog': pub(PublicBlog),
  'PublicPortal.FAQ': pub(PublicFaq),
  'PublicPortal.Contact': pub(PublicContact),
  'PublicPortal.Support': pub(PublicSupport),
  PrivacyPolicy: pub(PublicPrivacyPolicy),
  TermsConditions: pub(PublicTerms),
}
