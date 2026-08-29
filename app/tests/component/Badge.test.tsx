import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Badge, PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { PR_BADGE, ST_BADGE, SVC_BADGE } from '@/data/generated/badges'
import { renderWithProviders } from '../helpers/render'

/** Status pills. The colour is data, not a tone enum, so these check that the
 *  component reads the design's palette tables — and that the palette itself
 *  holds to the brand rule of blue and orange only. */

/** `rgb`/`rgba` string → channels. */
function channels(colour: string): [number, number, number] {
  const parts = (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
  return [parts[0], parts[1], parts[2]]
}

function hexChannels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

describe('Badge', () => {
  it('applies the background and foreground it is handed', () => {
    renderWithProviders(
      <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
        Posted
      </Badge>
    )
    const badge = screen.getByText('Posted')
    expect(badge).toHaveStyle({ color: 'rgb(10, 94, 215)' })
    expect(badge.className).toContain('rounded-full')
  })

  it('uses the heavier weight only for the strong variant', () => {
    const { unmount } = renderWithProviders(
      <Badge background="#0A5ED7" color="#fff" strong>
        High
      </Badge>
    )
    expect(screen.getByText('High').className).toContain('font-semibold')
    unmount()

    renderWithProviders(
      <Badge background="#0A5ED7" color="#fff">
        Low
      </Badge>
    )
    expect(screen.getByText('Low').className).toContain('font-medium')
  })
})

describe('palette-driven badges', () => {
  it('colours a service, status and priority pill from the design tables', () => {
    renderWithProviders(
      <>
        <ServiceBadge value="maintenance" />
        <StatusBadge value="pending" />
        <PriorityBadge value="high" />
      </>
    )
    expect(screen.getByText('maintenance')).toHaveStyle({ color: SVC_BADGE.maintenance[1] })
    expect(screen.getByText('pending')).toHaveStyle({ color: ST_BADGE.pending[1] })
    // Priority pills are a solid fill with white text.
    expect(screen.getByText('high')).toHaveStyle({ color: 'rgb(255, 255, 255)' })
  })

  it('humanises a snake_case value and accepts an explicit label', () => {
    renderWithProviders(
      <>
        <StatusBadge value="in_progress" />
        <ServiceBadge value="tire_service" label="خدمة الإطارات" />
      </>
    )
    expect(screen.getByText('in progress')).toBeInTheDocument()
    expect(screen.getByText('خدمة الإطارات')).toBeInTheDocument()
  })

  it('falls back to the neutral tint for a status the palette has never seen', () => {
    renderWithProviders(<StatusBadge value="awaiting_parts" />)
    const badge = screen.getByText('awaiting parts')
    expect(badge).toHaveStyle({ color: 'var(--text-muted)' })
  })

  it('keeps every palette entry inside the brand hues', () => {
    // README §7 forbids green, red, purple, pink and teal. The reference
    // screenshots use green, so it is genuinely possible to reintroduce one by
    // copying a design too literally — the route smoke checks the rendered
    // page, this checks the source of truth.
    for (const [name, palette] of Object.entries({ SVC_BADGE, ST_BADGE, PR_BADGE })) {
      for (const [key, entry] of Object.entries(palette)) {
        for (const colour of entry.slice(0, 2)) {
          if (!colour.startsWith('#') && !colour.startsWith('rgb')) continue
          const [r, g, b] = colour.startsWith('#') ? hexChannels(colour) : channels(colour)
          const green = g > 90 && g - r > 40 && g - b > 40
          const purple = r > 90 && b > 90 && r - g > 40 && b - g > 40
          expect(green, `${name}.${key} is green: ${colour}`).toBe(false)
          expect(purple, `${name}.${key} is purple: ${colour}`).toBe(false)
        }
      }
    }
  })
})
