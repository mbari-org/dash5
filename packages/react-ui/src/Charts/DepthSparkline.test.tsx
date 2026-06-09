import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DepthSparkline, { DepthSparklineProps } from './DepthSparkline'

// Fixed "now" so time-sensitive rendering is deterministic.
const NOW_MS = 1_700_000_000_000 // 2023-11-14T22:13:20Z
const NOW_MIN = Math.floor(NOW_MS / 60000)
const WINDOW_MIN = 480 // 8 hours

const baseProps: DepthSparklineProps = {
  depthTimes: [],
  depthValues: [],
  celTimes: [],
  satTimes: [],
  gpsTimes: [],
  argoTimes: [],
}

// Times (minutes since epoch) within the 8-hour window
const recentTimes = [
  NOW_MIN - 400,
  NOW_MIN - 300,
  NOW_MIN - 200,
  NOW_MIN - 100,
  NOW_MIN - 10,
]
const recentValues = [50, 80, 120, 60, 20]

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(NOW_MS)
})
afterAll(() => {
  jest.useRealTimers()
})

describe('DepthSparkline', () => {
  it('returns null when no depth data is provided', () => {
    const { container } = render(<DepthSparkline {...baseProps} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders an SVG with role="img" when depth data is present', () => {
    render(
      <DepthSparkline
        {...baseProps}
        depthTimes={recentTimes}
        depthValues={recentValues}
        windowMinutes={WINDOW_MIN}
      />
    )
    const svg = screen.getByRole('img')
    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute(
      'aria-label',
      'depth and comms history sparkline'
    )
  })

  it('renders the border rect as the last element (on top of grid/polygons)', () => {
    const { container } = render(
      <DepthSparkline
        {...baseProps}
        depthTimes={recentTimes}
        depthValues={recentValues}
        windowMinutes={WINDOW_MIN}
      />
    )
    const svg = container.querySelector('svg')!
    const rects = Array.from(svg.querySelectorAll('rect'))
    // The border rect has fill="none"; it must be the last rect rendered.
    const lastRect = rects[rects.length - 1]
    expect(lastRect.getAttribute('fill')).toBe('none')
    expect(lastRect.getAttribute('stroke')).toBe('#9ca3af')
  })

  it('renders the legend labels: argo, gps, sat, cell', () => {
    const { container } = render(
      <DepthSparkline
        {...baseProps}
        depthTimes={recentTimes}
        depthValues={recentValues}
        windowMinutes={WINDOW_MIN}
      />
    )
    const text = container.textContent ?? ''
    expect(text).toMatch(/argo/)
    expect(text).toMatch(/gps/)
    expect(text).toMatch(/sat/)
    expect(text).toMatch(/cell/)
  })

  it('renders a padded polygon (gray) when padded=true and data is fresh', () => {
    // 3 pad points appended (lastT, lastT+2, nowMin)
    const lastT = NOW_MIN - 6
    const paddedTimes = [...recentTimes, lastT, lastT + 2, NOW_MIN]
    const paddedValues = [...recentValues, 1, 10, 10]

    const { container } = render(
      <DepthSparkline
        {...baseProps}
        depthTimes={paddedTimes}
        depthValues={paddedValues}
        padded
        windowMinutes={WINDOW_MIN}
      />
    )
    // Two polygons: real-data (blue) + padded (gray, fill-opacity 0.85)
    const polygons = container.querySelectorAll('polygon')
    expect(polygons.length).toBeGreaterThanOrEqual(2)
    const fills = Array.from(polygons).map((p) => p.getAttribute('fill'))
    expect(fills).toContain('#60a5fa') // real-data blue
    expect(fills).toContain('#9ca3af') // fresh padded gray
  })

  it('renders the padded polygon orange when dive is stale (>1.25h)', () => {
    // Last real data point is >1.25h (75 min) ago — stale dive
    const staleLastT = NOW_MIN - 80
    const staleTimes = [
      NOW_MIN - 400,
      NOW_MIN - 300,
      staleLastT,
      staleLastT,
      staleLastT + 2,
      NOW_MIN,
    ]
    const staleValues = [50, 80, 60, 1, 10, 10]

    const { container } = render(
      <DepthSparkline
        {...baseProps}
        depthTimes={staleTimes}
        depthValues={staleValues}
        padded
        windowMinutes={WINDOW_MIN}
      />
    )
    const polygons = container.querySelectorAll('polygon')
    const fills = Array.from(polygons).map((p) => p.getAttribute('fill'))
    expect(fills).toContain('#f97316') // stale padded orange
  })

  it('renders the 8h axis label', () => {
    const { container } = render(
      <DepthSparkline
        {...baseProps}
        depthTimes={recentTimes}
        depthValues={recentValues}
        windowMinutes={WINDOW_MIN}
      />
    )
    expect(container.textContent).toMatch(/8h/)
  })

  it('handles mismatched depthTimes/depthValues lengths without throwing', () => {
    expect(() =>
      render(
        <DepthSparkline
          {...baseProps}
          depthTimes={[NOW_MIN - 100, NOW_MIN - 50]}
          depthValues={[40]} // shorter — should be clamped, not crash
          windowMinutes={WINDOW_MIN}
        />
      )
    ).not.toThrow()
  })
})
