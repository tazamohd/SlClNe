/** Lightweight loading indicator for route-level Suspense boundaries.
 *
 *  Unlike `Loading` from `ui/States`, this has zero provider dependencies — it
 *  can render before the preference context or i18n layer mounts, which matters
 *  for the outermost Suspense that gates lazy route chunks. The spinner uses
 *  the design tokens directly through CSS variables so it stays in sync with
 *  light/dark mode without importing anything. */
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
        minHeight: '60vh',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid var(--salis-blue, #0A5ED7)',
          borderTopColor: 'var(--salis-navy, #0B1F3B)',
          animation: 'route-loader-spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          fontSize: 13,
          color: 'var(--text-muted, #64748B)',
        }}
      >
        Loading...
      </span>
      <style>{`@keyframes route-loader-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){[role="status"] div{animation:none}}`}</style>
    </div>
  )
}
