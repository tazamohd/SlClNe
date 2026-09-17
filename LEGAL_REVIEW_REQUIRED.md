# Legal review required — internal checklist

This file tracks legal/compliance items on the public website (`app/src/screens/public/`)
that need input from the business owner and/or qualified Saudi legal counsel before the
site can be considered legally final. It is **internal** — do not surface any of this on
the public pages themselves (Privacy Policy, Terms & Conditions, Cookie Policy).

The public legal pages (`PrivacyPolicy.tsx`, `Terms.tsx`, `CookiePolicy.tsx`, all built on
`sections/LegalDocument.tsx`) were rewritten on 2026-09-16 to:
- drop the public "this is a template, not reviewed by counsel" banner (unacceptable on a
  production site — it undermines trust in every other claim on the page), and
- avoid claiming review has happened (it has not).

Instead, each page shows a plain **effective date** and **version number**, and every open
question below is tracked here instead.

## Open items — owner and/or counsel input required

1. **Operating legal entity.** The site currently refers to "SALIS AUTO" without a
   registered legal entity name, commercial registration (CR) number, or registered
   address. Needed: the exact legal entity name as registered in Saudi Arabia, its CR
   number, and registered address, to be added to Terms & Conditions and Privacy Policy.
2. **Data Protection Officer / privacy contact.** Privacy Policy references "our Contact
   page" for rights requests. Saudi PDPL implementing regulations may require a named DPO
   or privacy contact for entities above a certain size/processing volume — confirm
   whether one is required and, if so, name and contact details to publish.
3. **Hosting region and sub-processors.** The Privacy Policy's "International data
   transfers" clause is written generically because no confirmed hosting region or
   sub-processor list exists in this repository. `vercel.json`/`netlify.toml` show Vercel
   and Netlify as build targets, but neither confirms a specific data-residency region.
   Needed: confirmed hosting region(s) for production data, and the list of
   sub-processors (payment gateways, SMS/WhatsApp provider, email provider, cloud
   storage) so the transfer clause can name them and describe the actual safeguards in
   place (e.g. standard contractual clauses, adequacy).
4. **Verified public contact details.** `Contact.tsx` uses `info@salisauto.sa` and
   `tel:+966112345678` as the site's contact channel. The `salisauto.sa` domain is not
   confirmed as a live, owned, monitored domain anywhere in this repository (see the SEO
   gap noted below) — confirm this email/phone are real, monitored channels before they
   are relied on for legal notices or PDPL rights requests, or replace them.
5. **VAT/ZATCA specifics for the platform's own commercial terms.** Terms & Conditions'
   "Fees and payment" clause states fees are VAT-exclusive "where required by law" as a
   general statement. If/when public pricing or a specific commercial agreement format is
   finalized, confirm the VAT registration number and invoicing details.
6. **Cookie/analytics vendor list.** Cookie Policy describes categories (essential,
   analytics, preference) without naming specific third-party vendors because none exist
   in this codebase yet (no analytics script is wired into the public site). Update this
   page's "Third-party cookies" clause the moment an analytics or other cookie-setting
   vendor is actually integrated — do not let the policy fall behind the real
   implementation.
7. **Formal legal sign-off.** None of the above has been reviewed by qualified counsel.
   Treat all legal-page copy as an operationally-honest draft aligned to PDPL structure,
   not as reviewed legal advice, until counsel confirms it.

## Related: promotions

`DealsOffers.tsx` (`/public-portal/deals-offers`) previously listed six specific
promotions (percentage discounts, a flat referral credit, free inspections) with no
verified start/expiry date, eligibility, participating branches, or terms link behind
them. Per the "no fabricated commercial obligation" rule, these were removed and replaced
with a general description of the *categories* of program that may exist, routing
visitors to Contact/Request Demo. **Before republishing any specific offer**, it needs:
start date, expiry date, eligibility, participating branches, redemption rules,
exclusions, combination rules, and a link to full terms — then it can be restored as a
structured `Offer` with all of those fields, not just a headline and a badge.

## Related: origin domain

`app/public/sitemap.xml` and `robots.txt` reference `https://salisauto.sa` as the
canonical origin. That domain's ownership/DNS is not confirmed anywhere in this
repository. Confirm the production domain before launch — canonical URLs, Open Graph
URLs, and the sitemap all assume it.
