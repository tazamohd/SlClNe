import type { T } from '../types'
import { StatBand, type StatItem } from '../../sections/StatBand'
import { IconCardGrid, type IconCardItem } from '../../sections/IconCardGrid'
import { SectionIntro } from '../../sections/SectionIntro'

/** The homepage's credibility section — real, verifiable structural facts
 *  about the product (not fabricated metrics), the same figures already
 *  used in `SystemPage.tsx`/`About.tsx`: 13 domains, 14 roles × 28
 *  permission modules, 6 server-enforced separation-of-duty pairs, and the
 *  ZATCA Phase 2 pipeline. Built from `StatBand`/`IconCardGrid` — the same
 *  light-palette components already used on `About.tsx`/`Pricing.tsx` —
 *  rather than the HUD's own KPI panels. */
export function ProofBand({ t }: { t: T }) {
  const stats: readonly StatItem[] = [
    { value: '13', label: 'Functional domains, one tenancy' },
    { value: '14 × 28', label: 'Roles and permission modules' },
    { value: '6', label: 'Separation-of-duty pairs, enforced server-side' },
  ]

  const cards: readonly IconCardItem[] = [
    {
      icon: 'GitBranch',
      title: 'One contract, both sides',
      description:
        'A shared package holds the Zod schemas, permission tables and business rules — one definition is the API type, the server guard and the form validator at once.',
      tint: 'blue',
    },
    {
      icon: 'ShieldCheck',
      title: 'The tenant boundary',
      description:
        'PostgreSQL row-level security. Every row carries its organisation and branch, and the database decides who may read it — not a forgotten where clause.',
      tint: 'bright',
    },
    {
      icon: 'FileText',
      title: 'ZATCA Phase 2, end to end',
      description:
        'UBL 2.1, TLV QR, a SHA-256 hash chain and an X.509 signature, cleared through Fatoora rather than filed after the fact.',
      tint: 'orange',
    },
    {
      icon: 'Users',
      title: 'An audit row for every write',
      description:
        'Who changed what, when, from what, to what — for every write, and for every refusal too. Money moves as integer halalas, rounded once, at the total.',
      tint: 'navy',
    },
  ]

  return (
    <section id="home-proof" className="mx-auto max-w-[1180px] px-5 py-14 md:px-10 md:py-20">
      <SectionIntro
        as="h2"
        eyebrow="Built on"
        title="Structure, not a slide"
        subtitle="What holds the platform up — the same facts a technical buyer would ask for, shown rather than asserted."
      />
      <StatBand items={stats} />
      <IconCardGrid items={cards} columns={4} />
      <blockquote className="mx-auto mt-10 max-w-[640px] border-s-4 border-salis-blue ps-5 text-[15px] italic leading-relaxed text-body">
        {t(
          '“The hard part was never the diagnosis. It was that six people wrote the same number into four systems and one of them was wrong by Thursday.”'
        )}
        <footer className="mt-2 text-xs not-italic text-muted">
          {t('Design note — the problem the platform was built to end')}
        </footer>
      </blockquote>
    </section>
  )
}
