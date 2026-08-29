/** Screens owned by agent 17 — Public Website & Landing.
 *
 *  The public marketing site and landing pages, rendered in PublicShell with no
 *  session at all. Every entry here is `ungated`: these pages must render for a
 *  visitor with no session, so they mount entirely outside `RequireAccess`.
 *
 *  Tier A (10): design-authoritative from `project/PublicPortal.*.dc.html`.
 *  Tier B (16): design-system pages composed from the approved section system.
 *  Tier C (3): content/SEO legal pages. */
import type { ComponentType } from 'react'
import type { DomainScreens, ScreenEntry } from '../registry'
import { PublicShell } from '@/components/shell/PublicShell'

import { PublicLanding } from '../public/Landing'
import { PublicAbout } from '../public/About'
import { PublicAccounting } from '../public/Accounting'
import { PublicAI } from '../public/AI'
import { PublicAutomation } from '../public/Automation'
import { PublicBlog } from '../public/Blog'
import { PublicBookDemo } from '../public/BookDemo'
import { PublicCareers } from '../public/Careers'
import { PublicContact } from '../public/Contact'
import { PublicCookiePolicy } from '../public/CookiePolicy'
import { PublicCRM } from '../public/CRM'
import { PublicCustomerPortal } from '../public/CustomerPortalPage'
import { PublicFaq } from '../public/Faq'
import { PublicFeatures } from '../public/Features'
import { PublicFleet } from '../public/Fleet'
import { PublicIndustries } from '../public/Industries'
import { PublicInsurance } from '../public/Insurance'
import { PublicIntegrations } from '../public/Integrations'
import { PublicLoans } from '../public/Loans'
import { PublicMarketplace } from '../public/Marketplace'
import { PublicMiniERP } from '../public/MiniERP'
import { PublicPricing } from '../public/Pricing'
import { PublicProducts } from '../public/Products'
import { PublicRequestDemo } from '../public/RequestDemo'
import { PublicResources } from '../public/Resources'
import { PublicServices } from '../public/Services'
import { PublicSolutions } from '../public/Solutions'
import { PublicSpareParts } from '../public/SpareParts'
import { PublicSupplierPortal } from '../public/SupplierPortalPage'
import { PublicSupport } from '../public/Support'
import { PublicTechnicianPortal } from '../public/TechnicianPortalPage'
import { PublicWorkshop } from '../public/Workshop'
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
  'PublicPortal.Accounting': pub(PublicAccounting),
  'PublicPortal.AI': pub(PublicAI),
  'PublicPortal.Automation': pub(PublicAutomation),
  'PublicPortal.Blog': pub(PublicBlog),
  'PublicPortal.BookDemo': pub(PublicBookDemo),
  'PublicPortal.Careers': pub(PublicCareers),
  'PublicPortal.Contact': pub(PublicContact),
  'PublicPortal.CRM': pub(PublicCRM),
  'PublicPortal.CustomerPortal': pub(PublicCustomerPortal),
  'PublicPortal.FAQ': pub(PublicFaq),
  'PublicPortal.Features': pub(PublicFeatures),
  'PublicPortal.Fleet': pub(PublicFleet),
  'PublicPortal.Industries': pub(PublicIndustries),
  'PublicPortal.Insurance': pub(PublicInsurance),
  'PublicPortal.Integrations': pub(PublicIntegrations),
  'PublicPortal.Loans': pub(PublicLoans),
  'PublicPortal.Marketplace': pub(PublicMarketplace),
  'PublicPortal.MiniERP': pub(PublicMiniERP),
  'PublicPortal.Pricing': pub(PublicPricing),
  'PublicPortal.Products': pub(PublicProducts),
  'PublicPortal.RequestDemo': pub(PublicRequestDemo),
  'PublicPortal.Resources': pub(PublicResources),
  'PublicPortal.Services': pub(PublicServices),
  'PublicPortal.Solutions': pub(PublicSolutions),
  'PublicPortal.SpareParts': pub(PublicSpareParts),
  'PublicPortal.SupplierPortal': pub(PublicSupplierPortal),
  'PublicPortal.Support': pub(PublicSupport),
  'PublicPortal.TechnicianPortal': pub(PublicTechnicianPortal),
  'PublicPortal.Workshop': pub(PublicWorkshop),
  PrivacyPolicy: pub(PublicPrivacyPolicy),
  TermsConditions: pub(PublicTerms),
  CookiePolicy: pub(PublicCookiePolicy),
}
