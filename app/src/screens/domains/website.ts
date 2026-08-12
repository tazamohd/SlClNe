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
 *  would bounce an anonymous reader to /login. All ten are Tier A,
 *  design-authoritative from `project/PublicPortal.*.dc.html` (§A25 provenance:
 *  the design handoff, with the deviations each screen's header comment
 *  records). */
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
}
