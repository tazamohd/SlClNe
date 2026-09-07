# Image-to-Code Skill Research

> Research into existing AI agent skills for image-to-code conversion, design systems, and UI/UX code generation.
> Compiled: 2026-09-07

## Repositories Analyzed

| # | Repository | Focus | Stars |
|---|-----------|-------|-------|
| 1 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Image-first web design workflow | 85k+ |
| 2 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Web interface guidelines auditing | Vercel official |
| 3 | [arvindrk/extract-design-system](https://github.com/arvindrk/extract-design-system) | Design token extraction from live sites | Community |
| 4 | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Design system generation from CSV databases | Community |

---

## 1. taste-skill / image-to-code-skill

**What it does:** Enforces an image-first workflow for website design. Instead of letting an AI jump straight to writing HTML/CSS, it mandates a three-step pipeline:

1. Generate design reference images first (one per website section)
2. Deeply analyze those images -- extracting typography, spacing, colors, buttons, layout structure
3. Implement the frontend code to faithfully match the generated images

**Problem it solves:** Standard AI-generated websites produce generic, repetitive "slop" output -- nested card layouts, weak typography, compressed designs, fake enterprise jargon, bland color schemes. This skill forces the AI to act as an "elite web design art director."

### Structure

Single file: `skills/image-to-code-skill/SKILL.md` (1,228 lines, 38 sections). Self-contained with no supporting files.

### Key Techniques

**Combinatorial Variation Engine (Section 12):** Structured randomization system that forces the agent to select from predefined aesthetic categories, preventing collapse into default patterns while maintaining coherence:

- Theme Paradigm (4 options: Pristine Light, Deep Dark, Bold Studio, Quiet Premium)
- Background Character (4 options: grid, solid gradient, cinematic imagery, textured surface)
- Typography Character (6 options: clean grotesk, refined grotesk, expressive display, etc.)
- Hero Architecture (6 options: cinematic centered, asymmetric split, floating polaroid, etc.)
- Section System (6 options: modular bento, alternating editorial, poster-like stacked, etc.)
- Signature Component Set (choose 4 from 11 options)
- Motion-Implied Language (choose 2 from 6 options)

**9 Tunable Parameters (1-10 scales):**
- DESIGN_VARIANCE (8), VISUAL_DENSITY (3), ART_DIRECTION (8)
- IMPLEMENTATION_CLARITY (9), IMAGE_USAGE_PRIORITY (9), SPACING_GENEROSITY (9)
- ANALYSIS_PRECISION (10), IMAGE_GENERATION_EAGERNESS (10), UI_SIMPLICITY_DISCIPLINE (9)

**Anti-AI-Slop Rules:** Explicit negative-space definitions covering:
- Layout slop (cards-inside-cards-inside-cards)
- Visual slop (micro-UI clutter, fake pills, badges)
- Content slop (banned words: "unleash", "elevate", "revolutionize"; banned fake brands: "Acme", "Nexus", "Quantumly")
- Typography slop (weak hierarchy, overcrowded heroes)

**Anti-Cropping Rule:** Never crop regions from a larger image; always regenerate fresh per section to preserve spacing, typography scale, and layout proportions.

**21-Point Pre-Flight Checklist:** Self-verification system the agent runs before finalizing output.

### Strengths
- Very opinionated and thorough about preventing common AI design failures
- Image-first workflow produces more visually distinct results
- Combinatorial engine creates structured diversity
- Extensive anti-pattern catalog is arguably more effective than positive instructions alone

### Limitations
- Requires image generation capability (Codex/DALL-E environment)
- Single monolithic file (1,228 lines) -- hard to maintain or extend
- No code-level tooling -- purely prompt engineering
- No persistence across sessions

---

## 2. vercel-labs/agent-skills / web-design-guidelines

**What it does:** A UI code auditor that fetches the latest web interface guidelines at runtime and checks files against them. Outputs findings in terse, VS Code-clickable `file:line` format.

### Structure

Two-layer architecture:
- **Layer 1 -- SKILL.md:** Lightweight dispatcher (minimal file). Tells the agent to fetch rules and apply them.
- **Layer 2 -- command.md (fetched at runtime):** The actual guidelines from `vercel-labs/web-interface-guidelines`. Always up to date.

### Guidelines Coverage (15 Categories)

| Category | Key Rules |
|----------|-----------|
| Accessibility | `aria-label` on icon buttons, semantic HTML before ARIA, hierarchical headings, `aria-live` for async updates |
| Focus States | `:focus-visible` (never `:focus` alone), never `outline: none` without replacement |
| Forms | Correct `autocomplete`/`type`/`inputmode`, never block paste, inline errors, unsaved-changes warning |
| Animation | Honor `prefers-reduced-motion`, only animate `transform`/`opacity`, never `transition: all` |
| Typography | Proper ellipsis character, curly quotes, `tabular-nums` for number columns, `text-wrap: balance` |
| Content | Overflow handling, empty states, `min-w-0` for flex truncation |
| Images | Explicit `width`/`height`, `loading="lazy"` below fold, `fetchpriority="high"` above |
| Performance | Virtualize lists >50 items, no layout reads in render, preconnect CDN domains |
| Navigation | URL reflects app state, `<a>`/`<Link>` not `<div onClick>`, deep-link all stateful UI |
| Touch | `touch-action: manipulation`, hit targets >= 44px mobile, keyboard alternatives for gestures |
| Dark Mode | `color-scheme: dark`, `<meta name="theme-color">`, explicit colors on `<select>` |
| i18n | `Intl.DateTimeFormat`, `translate="no"` on brand names |

### Anti-Patterns Detected
- `user-scalable=no` / `maximum-scale=1`
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without `:focus-visible` replacement
- `<div>` with click handlers instead of `<button>`
- Images without dimensions
- Large arrays `.map()` without virtualization
- Form inputs without labels

### Strengths
- Extremely practical and actionable rules
- Always fetches latest guidelines (never stale)
- Output format designed for IDE integration (`file:line`)
- Backed by Vercel's production experience
- Focused on real-world compliance, not aesthetics

### Limitations
- Review-only -- does not generate or implement code
- No design system generation capability
- Requires network access to fetch guidelines at runtime
- No persistence or project-level customization

---

## 3. arvindrk/extract-design-system

**What it does:** Reverse-engineers design tokens from any public website using a headless browser and produces normalized token files for local projects.

### Extracted Token Categories
- **Colors:** brand palette, primary/secondary/accent, backgrounds, foreground, CSS custom properties
- **Typography:** heading, body, and monospace font families
- **Spacing:** padding/margin scale values
- **Border Radius:** button, card, pill radii
- **Shadows:** box-shadow values at different elevations

### Three Distribution Surfaces

| Surface | Interface | Use Case |
|---------|-----------|----------|
| AI Agent Skill | `SKILL.md` + `npx skills add` | Claude, Cursor, Codex agents |
| Standalone CLI | `npx extract-design-system <url>` | Direct developer use |
| MCP Server | `extract-design-system-mcp` (stdio) | Cursor, Claude Desktop, any MCP client |

### Audit Feature
Scans existing source files for hardcoded design values (hex colors, pixel spacing, etc.) and suggests which extracted token to replace them with. Supports CSS, SCSS, LESS, TS/TSX, JS/JSX, Vue, Svelte, HTML.

### Key Technical Details

**Normalized Schema:**
```
source: { url, extractedAt, extractor }
colors: { primary?, secondary?, accent?, background?, foreground?, palette[], cssVariables{} }
typography: { headingFont?, bodyFont?, monoFont? }
spacing: { scale[] }
radius: { scale[] }
shadows: { scale[] }
```

**Output Files:**
- `.extract-design-system/raw.json` -- raw browser extraction
- `.extract-design-system/normalized.json` -- stable internal representation
- `design-system/tokens.json` -- project-ready tokens
- `design-system/tokens.css` -- CSS custom properties (`:root` block)

**Color Matching:** RGB-distance Euclidean matching with configurable threshold (default 15) for near-match detection during audits.

### Strengths
- Grounds design decisions in real production websites
- Three distribution surfaces (skill, CLI, MCP) for maximum flexibility
- Audit feature bridges extraction to adoption
- Skills-first architecture -- CLI is the implementation detail
- High test coverage (95% line/function/statement)

### Limitations
- Requires headless browser (Playwright/Chromium)
- Extraction quality depends on the target site's CSS architecture
- No layout/component extraction -- tokens only
- Cannot extract interaction patterns or animations

---

## 4. nextlevelbuilder/ui-ux-pro-max-skill

**What it does:** A comprehensive design intelligence toolkit that generates tailored design systems by searching local CSV databases of styles, palettes, fonts, and UX guidelines -- without relying on LLM hallucination.

### Database Scale
| Domain | Count |
|--------|-------|
| UI Styles | 79 (50 active) |
| Color Palettes | 192 |
| Font Pairings | 74 |
| UX Guidelines | 119 |
| Curated Icons | 105 |
| GSAP Animation Presets | 17 |
| Chart Types | 25 |
| Tech Stacks | 22 |
| Industry Reasoning Rules | 192 |

### Key Technical Approaches

**BM25 + Regex Hybrid Search:** Proper information retrieval engine (BM25 probabilistic ranking) against local CSV databases. All recommendations grounded in verified data, not LLM hallucination.

**Reasoning Contract Pattern:** Closed, non-executable grammar for decision rules:
- 36 condition signals (e.g., `if_luxury` matches "luxury", "premium", "high-end")
- 4 action prefixes: `constraint`, `style`, `pattern`, `mode`
- Deterministic mutations with audit trail
- Data-driven decisions that never execute arbitrary code

**Design Dials (3 orthogonal sliders):**
- `--variance` (1-10): minimal to bold style selection
- `--motion` (1-10): subtle to complex GSAP animations
- `--density` (1-10): spacious to dashboard-level spacing

**Color Mode Resolution (multi-signal):**
1. Check query for explicit dark requests
2. Check the style's preferred mode
3. Check palette backgrounds via WCAG relative luminance
4. Derive accessible dark palettes from light ones using contrast ratios

**Master + Overrides Persistence:**
- `design-system/<slug>/MASTER.md` at project level
- `pages/<page>.md` for page-specific overrides
- Hierarchical retrieval across sessions

**Zero-Result Protocol:** Explicit handling when searches return nothing: retry once with narrower terms, then state "no database match found" and label any fallback as defaults.

### Strengths
- Grounded in curated data (no hallucination risk for design recommendations)
- Industry-specific reasoning rules (192 categories)
- Built-in WCAG contrast calculations
- Cross-session persistence
- Supports 20+ AI platforms via template system
- Design dials allow fine-tuning without changing queries

### Limitations
- Requires Python runtime for search engine
- CSV databases need manual curation and updates
- Complex setup (sync scripts, multiple distribution surfaces)
- Search quality depends on CSV data quality and coverage

---

## Comparative Analysis

### Architecture Patterns

| Approach | taste-skill | web-design-guidelines | extract-design-system | ui-ux-pro-max |
|----------|-------------|----------------------|----------------------|---------------|
| Skill type | Prompt-only | Fetch + review | Tool-backed (CLI/MCP) | Tool-backed (Python) |
| Data source | LLM knowledge + images | Fetched rules | Live websites | Local CSV databases |
| Generates code | Yes (HTML/CSS) | No (audit only) | No (tokens only) | No (design system specs) |
| Generates images | Yes (mandatory) | No | No | No |
| Persistence | None | None | Token files | Master + page overrides |
| Anti-hallucination | Image grounding | Rule compliance | Browser extraction | BM25 search + reasoning contract |

### Complementary Capabilities

These four skills address different stages of the design-to-code pipeline:

```
[Reference Site] --> extract-design-system --> [Design Tokens]
                                                     |
[User Brief] --> ui-ux-pro-max --> [Design System] --+--> taste-skill/image-to-code --> [Generated Code]
                                                     |
                                            web-design-guidelines --> [Quality Audit]
```

1. **extract-design-system**: Captures existing design language from reference sites
2. **ui-ux-pro-max**: Generates new design systems from industry knowledge
3. **taste-skill/image-to-code**: Converts design intent into actual frontend code via image generation
4. **web-design-guidelines**: Audits the resulting code for best-practice compliance

### Key Takeaways

1. **Image-first workflow is the standout differentiator** of taste-skill. By generating visual references before code, it produces significantly more distinct and polished results than direct code generation.

2. **Grounding in data prevents hallucination.** Both extract-design-system (browser extraction) and ui-ux-pro-max (CSV databases with BM25 search) avoid the common problem of LLMs fabricating design recommendations.

3. **Anti-pattern catalogs are highly effective.** Both taste-skill and web-design-guidelines invest heavily in defining what NOT to do. Negative-space instruction appears more effective than positive-only guidance.

4. **Tunable parameters are a shared pattern.** Both taste-skill (9 parameters) and ui-ux-pro-max (3 dials) use numeric scales to allow users to adjust output without rewriting prompts. This is a proven UX pattern for AI skills.

5. **Persistence matters for real projects.** Only ui-ux-pro-max addresses cross-session design consistency with its Master + Overrides pattern. This is a gap in the other skills.

6. **Distribution flexibility increases adoption.** extract-design-system's three surfaces (skill, CLI, MCP server) and ui-ux-pro-max's 20-platform template system show that the same core logic should be accessible through multiple interfaces.

7. **Runtime rule fetching keeps skills current.** web-design-guidelines' approach of fetching rules at invocation time means the skill never goes stale -- a lightweight but effective architecture.

### Synthesis: What a Best-in-Class Image-to-Code Skill Would Include

Drawing from all four repositories, an ideal skill would combine:

- **Image-first workflow** (from taste-skill) -- generate visual references before code
- **Combinatorial variation engine** (from taste-skill) -- structured randomness to prevent repetitive output
- **Design token extraction** (from extract-design-system) -- ground design in real reference sites
- **Industry-specific reasoning** (from ui-ux-pro-max) -- curated databases over LLM hallucination
- **Tunable design dials** (from taste-skill + ui-ux-pro-max) -- user-adjustable parameters
- **Anti-slop rules** (from taste-skill) -- explicit anti-pattern catalog
- **Best-practice compliance** (from web-design-guidelines) -- audit output against accessibility/UX rules
- **Cross-session persistence** (from ui-ux-pro-max) -- Master + Overrides for project consistency
- **Multi-surface distribution** (from extract-design-system) -- skill, CLI, and MCP server
