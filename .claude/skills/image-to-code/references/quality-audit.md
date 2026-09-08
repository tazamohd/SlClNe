# Quality Audit Reference

Run this audit against generated code before delivering. Each rule has a severity level.

## Critical (must fix before delivery)

### Accessibility
- [ ] `<html>` has `lang` attribute
- [ ] All `<img>` have `alt` text (decorative images: `alt=""` + `aria-hidden="true"`)
- [ ] All `<button>` have visible text or `aria-label`
- [ ] All `<input>` have associated `<label>` (or `aria-label`)
- [ ] Heading hierarchy is sequential (h1 → h2 → h3, never skipping)
- [ ] Focus states visible on all interactive elements via `:focus-visible`
- [ ] Color contrast >= 4.5:1 for normal text, >= 3:1 for large text
- [ ] No information conveyed by color alone

### Structure
- [ ] Uses semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- [ ] No `<div>` with `onClick` where `<button>` or `<a>` should be used
- [ ] DOM nesting depth <= 6 levels from `<body>`
- [ ] No cards nested inside cards

### Responsive
- [ ] No horizontal scroll at any viewport width (320px to 2560px)
- [ ] Touch targets >= 44px on mobile viewports
- [ ] Content readable at 320px width

## High (should fix)

### Performance
- [ ] Images have explicit `width` and `height`
- [ ] Below-fold images have `loading="lazy"`
- [ ] Hero/above-fold images have `fetchpriority="high"`
- [ ] No `transition: all` -- properties listed explicitly
- [ ] Animations use only `transform` and `opacity`
- [ ] `font-display: swap` on custom fonts
- [ ] `<link rel="preconnect">` for font CDN domains

### Dark Mode & Theming
- [ ] All colors use CSS custom properties (no hardcoded hex in component styles)
- [ ] `body` has explicit `background-color` and `color`
- [ ] If dark mode: `color-scheme: dark` on `<html>`
- [ ] If dark mode: shadows reduced (dark-on-dark shadows are muddy)
- [ ] `@media (prefers-color-scheme: dark)` block if dark mode supported

### Motion
- [ ] `@media (prefers-reduced-motion: reduce)` disables all animation
- [ ] No scroll-jacking
- [ ] No autoplay video or audio
- [ ] Animations are interruptible by user interaction

## Medium (nice to have)

### Typography
- [ ] Body text >= 16px (1rem) on desktop
- [ ] `font-variant-numeric: tabular-nums` on number columns/tables
- [ ] `text-wrap: balance` on headings
- [ ] Proper ellipsis character (`…`) not three dots
- [ ] Text containers handle overflow (`text-overflow: ellipsis` or `line-clamp`)
- [ ] At most 2 font families used
- [ ] At most 3 font sizes per section

### Layout
- [ ] Whitespace between sections >= 80px on desktop
- [ ] At least 3 different section layouts across the page
- [ ] `gap` used for spacing between flex/grid children (not margins)
- [ ] Fluid typography with `clamp()` for at least headings
- [ ] `max-width` on text content containers (65-75ch for readability)

### Forms (when present)
- [ ] Correct `autocomplete` attributes
- [ ] Correct `type` and `inputmode` on inputs
- [ ] Paste not blocked on any input
- [ ] Spellcheck disabled on emails, codes, usernames

### Navigation (when present)
- [ ] Links use `<a>` or `<Link>` (not `<div onClick>`)
- [ ] Navigation adapts for mobile (hamburger, bottom sheet, or collapse)
- [ ] Skip link to main content present

## Anti-Slop Check

- [ ] No cards inside cards
- [ ] No three identical grid sections in a row
- [ ] No decorative-only badges/pills on every card
- [ ] No gradient on more than one section per viewport
- [ ] No banned filler words in generated copy
- [ ] No banned fake brand names
- [ ] No lorem ipsum
- [ ] No emoji in professional UI (unless design specifies)
- [ ] No icon soup (random icons on every card)
- [ ] No more than one box-shadow per element
- [ ] No border + shadow + gradient on the same element
