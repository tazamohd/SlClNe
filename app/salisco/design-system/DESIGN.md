# SALISCO Design System

## Brand Identity

**Brand:** SALISCO — Integrated digital platform for automotive services and business management  
**Tagline:** The Automotive World, All in One Platform  
**Tone:** Clear, trustworthy, modern, practical, approachable

## Color Strategy

| Token | Value | Purpose |
|-------|-------|---------|
| Primary (Blue) | `#0B63E5` | Technology, reliability, trust |
| Secondary (Silver) | `#8993A4` | Quality, professionalism |
| Accent (Orange) | `#F26522` | Energy, visual distinction, CTAs |

Blue dominates interactive elements (buttons, links, focus states). Orange is used sparingly for emphasis (hero label, secondary CTAs). Silver anchors muted/secondary text.

Dark sections (How It Works, Footer) use `#0F172A` background with `#F1F5F9` text.

## Typography

| Role | EN Font | AR Font | Weight |
|------|---------|---------|--------|
| Headings | Plus Jakarta Sans | Cairo | 600–800 |
| Body | DM Sans | Tajawal | 400–500 |

Fluid sizing via `clamp()` for hero title (2.25rem → 3.5rem) and section headings (1.75rem → 2.75rem). Body copy at 16px minimum.

## Layout Architecture

- **Hero:** Asymmetric split — content left, dashboard card visual right
- **Value Proposition:** Centered header + 4-column card grid
- **Solutions:** 3+2 card layout (top row 3, bottom row 2 wider cards)
- **How It Works:** 5-step horizontal timeline with connecting line
- **Why SALISCO:** Split layout — checklist left, badge grid right
- **Main CTA:** Full-width gradient (blue → deep blue)
- **Newsletter:** Inline flex — content left, form right
- **Footer:** 5-column grid (brand wider, 4 link columns)

## Spacing

8px base scale. Section vertical padding: 80px–96px desktop. Component gaps: 24px standard, 32px between major elements.

## RTL Support

CSS logical properties throughout (`margin-inline`, `padding-inline`, `inset-inline-start/end`, `border-block`). Arabic fonts activated via `[dir="rtl"]` selectors. No duplicated layout rules — the same stylesheet serves both directions.

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| ≤1023px | Hero stacks (visual on top), grids collapse to 2-col or 1-col, footer 2-col |
| ≤767px | Hamburger nav, single-column everything, full-width buttons, stacked newsletter form |

## Accessibility

- Skip link to main content
- `aria-label` on icon-only buttons and logo links
- `aria-expanded` on mobile nav toggle
- `:focus-visible` outlines on all interactive elements
- `prefers-reduced-motion: reduce` disables all animation
- Semantic HTML: `header`, `main`, `section`, `footer`, `nav`
- Heading hierarchy: h1 (hero) → h2 (sections) → h3 (cards)
- WCAG AA contrast on all text/background combinations
