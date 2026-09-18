/** @type {import('tailwindcss').Config} */
// Every value here points at a CSS custom property defined in
// src/styles/tokens/. The tokens are the source of truth; this file only makes
// them reachable from utility classes.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        salis: {
          blue: 'var(--salis-blue)',
          'blue-hover': 'var(--salis-blue-hover)',
          bright: 'var(--salis-blue-bright)',
          'bright-hover': 'var(--salis-blue-bright-hover)',
          navy: 'var(--salis-navy)',
          orange: 'var(--salis-orange)',
          'orange-hover': 'var(--salis-orange-hover)',
        },
        page: 'var(--bg-page)',
        'page-alt': 'var(--bg-page-alt)',
        card: 'var(--surface-card)',
        inset: 'var(--surface-inset)',
        sidebar: 'var(--surface-sidebar)',
        border: 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        tint: {
          blue: 'var(--tint-blue)',
          orange: 'var(--tint-orange)',
          bright: 'var(--tint-bright)',
          navy: 'var(--tint-navy)',
          neutral: 'var(--tint-neutral)',
        },
        // Blue = success/active/progress, orange = warning/critical. Green,
        // red, yellow, purple, pink and teal are forbidden (README §7).
        success: 'var(--success)',
        info: 'var(--info)',
        warning: 'var(--warning)',
        destructive: 'var(--destructive)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
      },
      fontFamily: {
        ui: 'var(--font-ui)',
        action: 'var(--font-action)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--glow-blue)',
        'glow-lg': 'var(--glow-blue-lg)',
        'primary-btn': 'var(--shadow-primary-btn)',
      },
      // Safe-area insets, logical (start/end follow the writing direction).
      // Added to `spacing` so they reach every padding/margin/inset utility:
      // `pb-safe-bottom`, `pt-safe-top`, `ps-safe-start`, `pe-safe-end`.
      spacing: {
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-start': 'var(--safe-start)',
        'safe-end': 'var(--safe-end)',
      },
      height: {
        input: 'var(--h-input)',
        btn: 'var(--h-btn)',
        'btn-sm': 'var(--h-btn-sm)',
        'btn-lg': 'var(--h-btn-lg)',
        topbar: 'var(--h-topbar)',
        // The 56px bar plus whatever the status bar / notch takes above it, so
        // the bar's contents stay 56px tall instead of being squashed by the
        // inset padding.
        'topbar-safe': 'calc(var(--h-topbar) + var(--safe-top))',
        // `100dvh` where supported, `100vh` otherwise — see styles/index.css.
        viewport: 'var(--vh-full)',
      },
      minHeight: { viewport: 'var(--vh-full)' },
      width: { sidebar: 'var(--w-sidebar)' },
      backgroundImage: {
        'salis-gradient': 'var(--salis-gradient)',
        'salis-gradient-hover': 'var(--salis-gradient-hover)',
        'salis-gradient-r': 'var(--salis-gradient-r)',
      },
      transitionTimingFunction: { salis: 'var(--ease)' },
      animation: {
        'fade-up': 'fadeUp 0.3s ease',
        float: 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
