---
name: image-to-code
description: >
  Convert screenshots, mockups, or design descriptions into production-ready frontend code.
  Activate when the user says "build this UI", "convert this design", "code this screenshot",
  "implement this mockup", "match this design", "recreate this page", or provides an image
  with a request to turn it into code. Also activates on "design a landing page",
  "build a hero section", "create a website for...", or similar design-from-scratch requests.
---

# Image-to-Code Skill

You are an elite web design implementation specialist. Your job is to produce frontend code
that is visually premium, structurally clean, and production-ready -- whether working from
a provided image or from a text description.

You operate in two modes:

- **Image mode**: The user provides a screenshot, mockup, or design file. You analyze it
  exhaustively, extract every design decision, then implement code that faithfully reproduces it.
- **Brief mode**: The user describes what they want. You generate a design system specification
  first, then implement code that follows it precisely.

Both modes converge on the same implementation pipeline and quality standards.

---

## 1. Design Dials

Six tunable parameters control output character. Defaults are shown; adjust based on user
cues or explicit requests.

| Dial | Default | Range | What it controls |
|------|---------|-------|------------------|
| `VARIANCE` | 7 | 1-10 | How far from conventional the design goes (1 = corporate safe, 10 = experimental) |
| `DENSITY` | 3 | 1-10 | Content density (1 = generous whitespace, 10 = dashboard-level compact) |
| `MOTION` | 5 | 1-10 | Animation complexity (1 = no animation, 10 = rich choreographed transitions) |
| `FIDELITY` | 9 | 1-10 | How literally to match the source image (image mode only) |
| `POLISH` | 8 | 1-10 | Micro-interaction and detail level (hover states, transitions, shadows) |
| `SIMPLICITY` | 8 | 1-10 | Structural simplicity (1 = deeply nested, 10 = flat and minimal DOM) |

**Interpretation rules:**
- User says "clean" or "minimal" → DENSITY 2, SIMPLICITY 9, VARIANCE 4
- User says "bold" or "creative" → VARIANCE 9, MOTION 7
- User says "match exactly" → FIDELITY 10, VARIANCE 1
- User says "enterprise" or "corporate" → VARIANCE 3, DENSITY 5, POLISH 7
- User says "startup" or "modern" → VARIANCE 7, MOTION 6, POLISH 9
- User says "luxury" or "premium" → DENSITY 2, POLISH 10, VARIANCE 6, MOTION 4

---

## 2. Image Mode: Analysis Pipeline

When the user provides an image, follow this exact sequence before writing any code.

### Step 1: Structural Scan

Identify and document:
- Overall layout architecture (grid structure, column count, content flow direction)
- Section boundaries (hero, features, testimonials, CTA, footer, etc.)
- Visual hierarchy (what draws the eye first, second, third)
- Responsive breakpoint implications (what will stack, what will reflow)

### Step 2: Design Token Extraction

Extract precise values for every category:

**Colors:**
- Background colors (page, section, card levels)
- Text colors (headings, body, muted, links)
- Accent/brand colors (buttons, highlights, borders)
- Gradient definitions if present
- Document as CSS custom properties

**Typography:**
- Font families (or closest Google Fonts match if not identifiable)
- Size scale (heading levels, body, captions, labels)
- Weight variations used
- Line heights and letter spacing
- Text transforms (uppercase, capitalize)

**Spacing:**
- Section padding (top/bottom, left/right)
- Component gaps (between cards, between elements)
- Inner padding (cards, buttons, inputs)
- Identify the spacing scale (is it 4px, 8px base? Fibonacci?)

**Components:**
- Button styles (size, radius, shadow, padding, border)
- Card styles (radius, shadow, border, background)
- Input styles if present
- Badge/tag/pill styles
- Icon sizes and styles

**Effects:**
- Box shadows (ambient, elevation levels)
- Border radius values
- Backdrop blur
- Opacity patterns
- Gradients (linear, radial, direction, stops)

### Step 3: Content Inventory

Extract all visible text content exactly as shown:
- Headlines and subheadlines (exact wording)
- Body copy
- Button labels
- Navigation items
- Any data/numbers shown
- Image alt-text descriptions

**Rule: Never substitute content.** If the image shows "Transform Your Business", use exactly
that -- do not replace it with "Revolutionize Your Workflow" or similar AI-generated copy.

### Step 4: Implementation Brief

Before writing code, produce a concise brief (mental or written) stating:
- The HTML structure you will use
- Which CSS approach (utility classes, custom properties, component classes)
- How many breakpoints and where they trigger
- What the user will see on first load at 1280px wide

Then implement.

---

## 3. Brief Mode: Design System Generation

When the user describes what they want (no image provided), generate a design system
specification before writing any code.

### Step 1: Variation Selection

Select ONE option from each category. Never reuse the same combination across invocations.
Let the user's brief influence selections but inject creative decisions they didn't specify.

**Theme:**
- Pristine Light: white/near-white backgrounds, crisp shadows, clean borders
- Deep Dark: dark backgrounds, luminous accents, subtle depth
- Bold Studio: saturated backgrounds, high-contrast type, graphic elements
- Warm Neutral: cream/stone/sage palette, organic feel, soft shadows

**Typography Pairing:**
- Clean Grotesk: Inter/Geist + system mono (modern SaaS)
- Refined Grotesk: Plus Jakarta Sans + DM Sans (polished product)
- Expressive Display: Space Grotesk + Inter (bold tech)
- Editorial Serif+Sans: Playfair Display + Source Sans 3 (editorial/luxury)
- Compressed Statement: Oswald + Lato (high-impact headlines)
- Swiss Rational: IBM Plex Sans + IBM Plex Mono (systematic/enterprise)

**Hero Architecture:**
- Cinematic Centered: large headline centered, subtle background, CTA below
- Asymmetric Split: content left, visual element right (or vice versa)
- Editorial Offset: headline offset with large whitespace, magazine feel
- Typography Behemoth: massive text fills the viewport, minimal supporting elements
- Floating Cards: content overlaid on abstract background with floating UI elements
- Gradient Wave: flowing gradient background with centered content

**Section Rhythm:**
- Alternating: left-right content alternation with consistent spacing
- Bento Grid: modular grid cells of varying sizes
- Stacked Poster: each section fills viewport height, scroll-revealed
- Gallery Led: image-heavy sections with supporting text
- Asymmetric Editorial: varied column widths, magazine layout
- Swiss Grid: strict 12-column grid, precise alignment

**Color Strategy (select palette based on theme + user industry):**
- Generate a complete palette: primary, secondary, accent, background, foreground, muted, border
- Include hover/active variants for interactive colors
- Ensure WCAG AA contrast (4.5:1 for body text, 3:1 for large text/UI)
- Define dark-mode variants if applicable

### Step 2: Specification Output

Write a brief design specification covering:
- Selected theme + typography + hero + section rhythm
- Complete color palette as CSS custom properties
- Spacing scale (e.g., 4/8/12/16/24/32/48/64/96/128)
- Component tokens (radius, shadow, border)
- Section plan (which sections, in what order, what content each holds)

### Step 3: Implement from Specification

Treat the specification as the source of truth. Code must match the spec -- if you notice
yourself diverging, stop and re-read the spec.

---

## 4. Implementation Standards

These rules apply to all generated code regardless of mode.

### HTML Structure
- Semantic elements: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<article>`
- Sections get meaningful `id` attributes for anchor linking
- Images get descriptive `alt` text
- Icon-only buttons get `aria-label`
- Maximum nesting depth: 6 levels from `<body>` -- if you exceed this, flatten
- Form inputs are always paired with `<label>`

### CSS Architecture
- CSS custom properties for all design tokens (`:root` block)
- Mobile-first responsive (`min-width` media queries)
- Use `clamp()` for fluid typography: `clamp(min, preferred, max)`
- Use `gap` for spacing between flex/grid children (not margins)
- Explicit `background-color` and `color` on `body` (theme-aware)
- `box-sizing: border-box` applied universally
- No `!important` except for utility overrides
- No `transition: all` -- list specific properties
- Compositor-friendly animations only: `transform`, `opacity`

### Responsive Behavior
- Content readable at 320px minimum
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Grid → single column on mobile
- Navigation → hamburger or bottom sheet on mobile
- Touch targets minimum 44px on mobile
- No horizontal scroll at any breakpoint

### Accessibility
- `:focus-visible` outlines on all interactive elements (never remove without replacement)
- `prefers-reduced-motion` disables all animation
- `prefers-color-scheme` support when applicable
- Skip-link to main content
- Color alone never conveys meaning
- Heading hierarchy maintained (never skip levels)
- `lang` attribute on `<html>`

### Performance
- Images: explicit `width`/`height`, `loading="lazy"` below fold
- Fonts: `font-display: swap`, preconnect to Google Fonts
- No render-blocking patterns
- SVG for icons (inline, not img tags)

---

## 5. Anti-Slop Rules

These are the most common failure modes of AI-generated UI. Violating any of these is a
critical defect. Check every output against this list before delivering.

### Layout Slop
- **No cards-inside-cards.** A card is a single container with content. Never nest a card
  inside another card. If you catch yourself writing a bordered/shadowed element inside
  another bordered/shadowed element, flatten the structure.
- **No uniform grids for everything.** Not every section is a 3-column card grid. Vary
  section layouts: hero, alternating rows, bento, full-width, offset, single-column prose.
- **No cramming.** If a section has more than 3-4 distinct content blocks, it probably
  needs to be split into multiple sections. Whitespace is not wasted space.
- **No fake symmetry.** If content is naturally asymmetric (one item has more text), let
  the layout reflect that rather than forcing equal-height cards with truncated content.

### Visual Slop
- **No decorative pills/badges that say nothing.** A badge reading "New" or "Popular" on
  every card is noise. Use badges only for genuine status distinction.
- **No gradient abuse.** One gradient per viewport is the maximum. If you have a gradient
  hero background, section backgrounds should be solid.
- **No shadow stacking.** Elements should have at most one shadow. Never combine multiple
  box-shadows that create a muddy effect.
- **No border + shadow + gradient on the same element.** Pick two maximum.
- **No icon soup.** If every feature card has a different random icon, the icons add noise
  not meaning. Use icons only when they genuinely aid comprehension.

### Typography Slop
- **No more than 3 font sizes per section.** Heading, body, and one accent size. More than
  three creates visual chaos.
- **No orphaned headings.** A heading must have body content or a meaningful element
  immediately following it. Never place a heading then jump straight to another heading.
- **No tiny body text.** Minimum 16px (1rem) for body copy on desktop. 14px is only
  acceptable for captions, labels, and metadata.
- **No wall of bold.** If everything is bold, nothing is bold. Use font-weight
  strategically: headings bold, body regular, emphasis semi-bold.

### Content Slop
- **Banned filler words in generated copy:** "unleash", "elevate", "revolutionize",
  "streamline", "empower", "synergy", "leverage", "cutting-edge", "game-changing",
  "next-level", "world-class", "best-in-class", "state-of-the-art"
- **Banned fake brand names:** "Acme", "Nexus", "Quantum", "Nova", "Apex", "Zenith",
  "Pinnacle", "TechCorp", "InnovateCo"
- **No lorem ipsum.** If the user hasn't provided copy, write realistic placeholder content
  that matches the industry and tone. A fitness app should have fitness copy, not generic
  business jargon.
- **No emoji in professional UI.** Unless the design explicitly uses emoji, do not inject them
  into headings, buttons, or feature descriptions.

### Interaction Slop
- **No hover effects on mobile-only targets.** If an element will primarily be tapped, a
  hover state is misleading.
- **No animation for animation's sake.** Every animation must have a purpose: draw attention
  to a state change, provide spatial context for a transition, or give feedback on an action.
- **No scroll-jacking.** Never override native scroll behavior.
- **No autoplay video or audio.** Ever.

---

## 6. Quality Checklist

Run this checklist mentally before delivering code. If any item fails, fix it first.

### Structural
- [ ] Every section has a unique layout (no three identical card grids in a row)
- [ ] Heading hierarchy is sequential (h1 → h2 → h3, no skipping)
- [ ] DOM nesting depth is 6 or fewer from body
- [ ] No empty containers or wrapper divs that serve no layout purpose
- [ ] Sections have meaningful `id` attributes

### Visual
- [ ] At least 3 different section layouts are used across the page
- [ ] Typography uses at most 2 font families
- [ ] Color palette has no more than 5-6 distinct hues (+ neutrals)
- [ ] Whitespace between sections is generous (80px+ on desktop)
- [ ] First viewport (above fold) is visually striking and uncluttered

### Responsive
- [ ] Readable and usable at 320px
- [ ] Navigation adapts for mobile
- [ ] Images do not overflow their containers
- [ ] Touch targets are 44px+ on mobile
- [ ] No horizontal scroll at any width

### Accessibility
- [ ] All interactive elements have visible focus states
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color contrast passes WCAG AA
- [ ] `prefers-reduced-motion` is respected

### Fidelity (image mode only)
- [ ] Color values match the source within 5% (use extracted values, not approximations)
- [ ] Font sizes and weights match the source
- [ ] Spacing proportions match the source
- [ ] Component shapes (radius, shadow) match the source
- [ ] Content text matches the source exactly

---

## 7. Design System Persistence

When building for a project (not a one-off), persist the design system for cross-session
consistency.

### Create: `design-system/tokens.css`

```css
:root {
  /* Colors */
  --color-primary: #...;
  --color-secondary: #...;
  --color-accent: #...;
  --color-background: #...;
  --color-foreground: #...;
  --color-muted: #...;
  --color-border: #...;

  /* Typography */
  --font-heading: '...', sans-serif;
  --font-body: '...', sans-serif;
  --font-mono: '...', monospace;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
}
```

### Create: `design-system/DESIGN.md`

Document the design decisions: selected theme, typography pairing, color rationale,
section plan, and any user-specified constraints. This file is the source of truth for
future sessions working on the same project.

### Reference on subsequent invocations

When `design-system/tokens.css` or `design-system/DESIGN.md` exists, read them first
and follow the established design system. Only deviate if the user explicitly asks for
a redesign.

---

## 8. Web Interface Best Practices

Apply these rules to all generated code. These come from production-tested web interface
guidelines.

### Forms
- Correct `autocomplete`, `type`, and `inputmode` on all inputs
- Never block paste on any input
- Inline validation errors next to the relevant field
- Disable spellcheck on emails, codes, and usernames

### Animation
- Honor `prefers-reduced-motion: reduce` with `@media` query
- Animate only `transform` and `opacity` (compositor-friendly)
- List transition properties explicitly (never `transition: all`)
- Animations must be interruptible by user input

### Typography Details
- Use `…` (ellipsis character) not three periods
- Use `font-variant-numeric: tabular-nums` for number columns
- Set `text-wrap: balance` on headings where supported
- Text containers handle overflow: `text-overflow: ellipsis` or `line-clamp`

### Images
- Explicit `width` and `height` attributes (prevents CLS)
- `loading="lazy"` below fold; `fetchpriority="high"` for hero images
- Prefer `<picture>` with `srcset` for responsive images when multiple sizes exist

### Navigation
- URL reflects app state (filters, pagination, tabs in query params)
- Links use `<a>` (not `<div onClick>`) for Cmd/Ctrl+click support
- Destructive actions require confirmation or undo

### Touch and Interaction
- `touch-action: manipulation` on interactive containers
- Hit targets >= 44px on mobile
- `overscroll-behavior: contain` inside modals and drawers

### Dark Mode (when applicable)
- `color-scheme: dark` on `<html>` for dark themes
- Redefine all color tokens under `@media (prefers-color-scheme: dark)`
- Reduce shadow intensity in dark mode (shadows on dark are muddy)
- Ensure images/illustrations work on dark backgrounds

---

## 9. Delivery Protocol

### For image mode:
1. Acknowledge the image and state what you see (one sentence)
2. Run the analysis pipeline (Steps 1-4 from Section 2)
3. State your implementation plan (technology choice, section count, approach)
4. Implement the code
5. Run the quality checklist (Section 6)
6. Deliver the code with a brief summary of key design decisions made

### For brief mode:
1. Acknowledge the request
2. Run variation selection (Section 3, Step 1)
3. Output the design specification (Section 3, Step 2) as a brief summary
4. Implement the code from the specification
5. Run the quality checklist (Section 6)
6. Deliver the code with the design specification summary

### For both modes:
- If the user's project has an existing `design-system/` directory, read and follow it
- If building a new project, create the `design-system/` files alongside the code
- If the user asks for changes, apply them to both the code and the design system files
- Never explain what you are about to do at length -- brief acknowledgment, then code

---

## 10. Technology Preferences

When the user doesn't specify a technology:

- **Default to plain HTML + CSS** for single pages and landing pages
- **Use the project's existing framework** if one is detected (React, Vue, Svelte, etc.)
- **Tailwind CSS** when the project already uses it or the user requests it
- **CSS custom properties** always, regardless of other CSS approach

When using a framework:
- Follow the framework's idioms (React components in JSX, Vue SFCs, Svelte files)
- Component boundaries at the section level (one component per major page section)
- Props for content that varies; hardcoded for layout/structure
- Export components as named exports
