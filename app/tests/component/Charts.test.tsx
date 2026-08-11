import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { BarList, CHART_COLORS, Donut } from '@/components/ui/Charts'
import { renderWithProviders } from '../helpers/render'

/** The two chart shapes the design draws inline. A chart that does not encode
 *  its numbers is a picture, so these check the geometry against the data. */

const ROWS = [
  { label: 'Revenue', value: 1_284_500 },
  { label: 'Expense', value: 957_600 },
  { label: 'Net Profit', value: 326_900 },
]

function widths(container: HTMLElement): number[] {
  return [...container.querySelectorAll<HTMLElement>('[style*="width"]')].map((bar) =>
    Number.parseFloat(bar.style.width)
  )
}

describe('BarList', () => {
  it('scales every bar against the largest value', () => {
    const { container } = renderWithProviders(<BarList rows={ROWS} />)
    const bars = widths(container)
    expect(bars).toHaveLength(ROWS.length)
    expect(bars[0]).toBeCloseTo(100, 1)
    expect(bars[1]).toBeCloseTo((ROWS[1].value / ROWS[0].value) * 100, 1)
    expect(bars[2]).toBeLessThan(bars[1])
  })

  it('scales against a caller-supplied total when the whole matters', () => {
    // Sharing one denominator is what lets two charts be compared side by side.
    const total = ROWS.reduce((sum, row) => sum + row.value, 0)
    const { container } = renderWithProviders(<BarList rows={ROWS} total={total} />)
    expect(widths(container)[0]).toBeCloseTo((ROWS[0].value / total) * 100, 1)
  })

  it('never draws a bar past the track, whatever the data says', () => {
    const { container } = renderWithProviders(
      <BarList rows={[{ label: 'Over', value: 500 }]} total={100} />
    )
    expect(widths(container)[0]).toBe(100)
  })

  it('survives an all-zero series without dividing by zero', () => {
    const { container } = renderWithProviders(
      <BarList rows={[{ label: 'Revenue', value: 0 }, { label: 'Expense', value: 0 }]} />
    )
    expect(widths(container)).toEqual([0, 0])
  })

  it('labels each bar with its formatted SAR amount, pinned LTR', () => {
    renderWithProviders(<BarList rows={ROWS} />, { language: 'ar' })
    const amount = screen.getByText('SAR 1,284,500.00')
    expect(amount).toHaveAttribute('dir', 'ltr')
  })

  it('takes its colours from the brand chart palette', () => {
    const { container } = renderWithProviders(<BarList rows={ROWS} />)
    const backgrounds = [...container.querySelectorAll<HTMLElement>('[style*="background"]')].map(
      (bar) => bar.style.background
    )
    expect(backgrounds.length).toBeGreaterThan(0)
    // jsdom normalises a hex colour to rgb(), so compare on channels.
    const palette = CHART_COLORS.map((hex) => {
      const value = Number.parseInt(hex.slice(1), 16)
      return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
    })
    for (const background of backgrounds) {
      expect(palette).toContain(background)
    }
  })
})

describe('Donut', () => {
  const SEGMENTS = [
    { label: 'Assets', value: 2_683_500 },
    { label: 'Liabilities', value: 140_550 },
    { label: 'Equity', value: 2_800_000 },
  ]

  it('cuts the ring in proportion to each segment', () => {
    const { container } = renderWithProviders(
      <Donut segments={SEGMENTS} centerValue="2,683,500.00" centerLabel="Assets" />
    )
    const ring = container.querySelector<HTMLElement>('[style*="conic-gradient"]') as HTMLElement
    const stops = [...ring.style.background.matchAll(/([\d.]+)% ([\d.]+)%/g)].map((match) => [
      Number(match[1]),
      Number(match[2]),
    ])

    expect(stops).toHaveLength(SEGMENTS.length)
    expect(stops[0][0]).toBe(0)
    expect(stops[stops.length - 1][1]).toBeCloseTo(100, 6)

    const total = SEGMENTS.reduce((sum, segment) => sum + segment.value, 0)
    for (const [index, segment] of SEGMENTS.entries()) {
      expect(stops[index][1] - stops[index][0]).toBeCloseTo((segment.value / total) * 100, 6)
    }
  })

  it('leaves no gap between segments', () => {
    const { container } = renderWithProviders(
      <Donut segments={SEGMENTS} centerValue="0" centerLabel="Assets" />
    )
    const ring = container.querySelector<HTMLElement>('[style*="conic-gradient"]') as HTMLElement
    const stops = [...ring.style.background.matchAll(/([\d.]+)% ([\d.]+)%/g)].map((match) => [
      Number(match[1]),
      Number(match[2]),
    ])
    for (let index = 1; index < stops.length; index += 1) {
      expect(stops[index][0]).toBeCloseTo(stops[index - 1][1], 6)
    }
  })

  it('lists every segment with its amount, so the ring is readable without colour', () => {
    renderWithProviders(
      <Donut segments={SEGMENTS} centerValue="2,683,500.00" centerLabel="Assets" />
    )
    for (const segment of SEGMENTS) {
      expect(screen.getAllByText(segment.label).length).toBeGreaterThan(0)
    }
    expect(screen.getByText('SAR 140,550.00')).toBeInTheDocument()
    expect(screen.getByText('2,683,500.00')).toBeInTheDocument()
  })

  it('renders an empty series without a division by zero', () => {
    const { container } = renderWithProviders(
      <Donut segments={[]} centerValue="0.00" centerLabel="Assets" />
    )
    const ring = container.querySelector<HTMLElement>('.rounded-full') as HTMLElement
    expect(ring).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })
})
