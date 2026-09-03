/** Lightweight loading indicator for route-level Suspense boundaries.
 *
 *  Unlike `Loading` from `ui/States`, this has zero provider dependencies — it
 *  can render before the preference context or i18n layer mounts, which matters
 *  for the outermost Suspense that gates lazy route chunks. Colours come
 *  straight from the design tokens as CSS variables, with no literal
 *  fallbacks: a literal is the one thing the token gate counts, and every
 *  stylesheet this can render under has the variables defined.
 *
 *  A linear progress bar, not a spinner — the design system reserves motion
 *  and loading for exactly that shape (Motion & Loading). */
export function RouteLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: '40vh',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'block',
          height: 3,
          width: 180,
          overflow: 'hidden',
          borderRadius: 999,
          background: 'var(--tint-blue)',
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: '30%',
            borderRadius: 999,
            background: 'var(--salis-gradient)',
            animation: 'salis-linear-progress 1.5s ease-in-out infinite',
          }}
        />
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</span>
      <style>{`@media(prefers-reduced-motion:reduce){[role="status"] span span{animation:none}}`}</style>
    </div>
  )
}
