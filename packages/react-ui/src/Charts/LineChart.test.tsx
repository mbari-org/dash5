import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LineChart, { LineChartProps } from './LineChart'
import { DateTime } from 'luxon'

// Mock plotly.js so the dynamic import() in the Fx.hover effect resolves
// without browser globals and without touching real Plotly internals.
jest.mock('plotly.js', () => ({
  __esModule: true,
  default: {
    Fx: {
      hover: jest.fn(),
      unhover: jest.fn(),
    },
  },
}))

// Capture layout and trace data from each render so tests can assert on them.
// onInitialized is called with the rendered div so LineChart's graphDivRef is
// populated — this lets the indicatorTime Fx.hover/Fx.unhover effect run in tests.
// Child effects fire before parent effects in React, so the ref is set before
// LineChart's own useEffect reads it.
jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: function MockPlot({
    layout,
    data: traces,
    onInitialized,
  }: {
    layout: Record<string, unknown>
    data: any[]
    onInitialized?: (figure: unknown, graphDiv: HTMLDivElement) => void
  }) {
    const ref = React.useRef<HTMLDivElement>(null)
    const onInitRef = React.useRef(onInitialized)
    onInitRef.current = onInitialized
    React.useEffect(() => {
      if (ref.current) onInitRef.current?.({}, ref.current)
    }, [])
    return (
      <div
        ref={ref}
        data-testid="plot"
        data-uirevision={
          'uirevision' in layout ? String(layout.uirevision) : '__unset__'
        }
        data-shapes={JSON.stringify(layout.shapes ?? [])}
        data-annotations={JSON.stringify(layout.annotations ?? [])}
        data-hovertemplate={traces?.[0]?.hovertemplate ?? ''}
        data-has-customdata={traces?.[0]?.customdata != null ? 'true' : 'false'}
      />
    )
  },
}))

const makeData = (n = 60) =>
  new Array(n).fill('').map((_, i) => ({
    value: i * 2,
    timestamp: DateTime.now()
      .minus({ hours: n - i })
      .toMillis(),
  }))

const props: LineChartProps = {
  data: makeData(),
  name: 'Depth',
  title: 'Depth Chart',
  style: { width: '100%', height: 400 },
}

// ---------------------------------------------------------------------------
// Render / basic
// ---------------------------------------------------------------------------

test('should render the component', () => {
  expect(() => render(<LineChart {...props} />)).not.toThrow()
})

// ---------------------------------------------------------------------------
// uirevision wiring
// ---------------------------------------------------------------------------

test('does not set uirevision on the Plotly layout when the prop is omitted', () => {
  render(<LineChart {...props} />)
  expect(screen.getByTestId('plot')).toHaveAttribute(
    'data-uirevision',
    '__unset__'
  )
})

test('passes uirevision to the Plotly layout when the prop is provided', () => {
  render(<LineChart {...props} uirevision="depth-latest-logset42" />)
  expect(screen.getByTestId('plot')).toHaveAttribute(
    'data-uirevision',
    'depth-latest-logset42'
  )
})

// ---------------------------------------------------------------------------
// hovertemplate / customdata
// ---------------------------------------------------------------------------

test('hovertemplate includes the unit extracted from yAxisLabel', () => {
  render(<LineChart {...props} yAxisLabel="Depth (m)" />)
  expect(
    screen.getByTestId('plot').getAttribute('data-hovertemplate')
  ).toContain(' m')
})

test('hovertemplate has no unit when yAxisLabel has no parenthetical', () => {
  render(<LineChart {...props} yAxisLabel="Depth" />)
  // The value block should not contain " m" or similar unit text.
  const tmpl =
    screen.getByTestId('plot').getAttribute('data-hovertemplate') ?? ''
  expect(tmpl).toMatch(/%\{y:\.1f\}<\/b>/)
})

test('hovertemplate shows local and UTC time placeholders', () => {
  render(<LineChart {...props} />)
  const tmpl =
    screen.getByTestId('plot').getAttribute('data-hovertemplate') ?? ''
  expect(tmpl).toContain('local')
  expect(tmpl).toContain('UTC')
})

test('hovertemplate includes series name in extra tag so callers without yAxisLabel retain trace context', () => {
  render(<LineChart {...props} />)
  const tmpl =
    screen.getByTestId('plot').getAttribute('data-hovertemplate') ?? ''
  expect(tmpl).toContain('<extra>%{fullData.name}</extra>')
})

test('customdata is pre-computed for every data point', () => {
  render(<LineChart {...props} />)
  expect(screen.getByTestId('plot')).toHaveAttribute(
    'data-has-customdata',
    'true'
  )
})

// ---------------------------------------------------------------------------
// indicator shapes / annotations
// ---------------------------------------------------------------------------

test('sets layout.shapes when indicatorTime is provided', () => {
  const indicatorTime = DateTime.now().minus({ hours: 5 }).toMillis()
  render(<LineChart {...props} indicatorTime={indicatorTime} />)
  const shapes = JSON.parse(
    screen.getByTestId('plot').getAttribute('data-shapes') ?? '[]'
  )
  expect(shapes).toHaveLength(1)
  expect(shapes[0].type).toBe('line')
})

test('clears layout.shapes when indicatorTime is null', () => {
  render(<LineChart {...props} indicatorTime={null} />)
  const shapes = JSON.parse(
    screen.getByTestId('plot').getAttribute('data-shapes') ?? '[]'
  )
  expect(shapes).toHaveLength(0)
})

test('clears layout.shapes when indicatorTime is not provided', () => {
  render(<LineChart {...props} />)
  const shapes = JSON.parse(
    screen.getByTestId('plot').getAttribute('data-shapes') ?? '[]'
  )
  expect(shapes).toHaveLength(0)
})

test('sets layout.annotations when indicatorTime is provided', () => {
  const indicatorTime = DateTime.now().minus({ hours: 5 }).toMillis()
  render(<LineChart {...props} indicatorTime={indicatorTime} />)
  const annotations = JSON.parse(
    screen.getByTestId('plot').getAttribute('data-annotations') ?? '[]'
  )
  expect(annotations).toHaveLength(1)
})

test('clears layout.annotations when indicatorTime is null', () => {
  render(<LineChart {...props} indicatorTime={null} />)
  const annotations = JSON.parse(
    screen.getByTestId('plot').getAttribute('data-annotations') ?? '[]'
  )
  expect(annotations).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// Programmatic Plotly hover (Fx.hover / Fx.unhover)
// ---------------------------------------------------------------------------

// Helper: access the mocked Plotly.Fx functions
const getPlotlyFxMocks = async () => {
  const { default: PlotlyLib } = await import('plotly.js')
  return {
    hover: (PlotlyLib as any).Fx.hover as jest.Mock,
    unhover: (PlotlyLib as any).Fx.unhover as jest.Mock,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('calls Fx.hover with the nearest point index when indicatorTime is set', async () => {
  const { hover } = await getPlotlyFxMocks()
  const data = makeData(10)
  const targetIdx = 5
  // Use the exact timestamp of data[5] so binary search lands on index 5.
  const indicatorTime = data[targetIdx].timestamp

  render(<LineChart data={data} name="Depth" indicatorTime={indicatorTime} />)

  await waitFor(() => {
    expect(hover).toHaveBeenCalledWith(expect.anything(), [
      { curveNumber: 0, pointNumber: targetIdx },
    ])
  })
})

test('calls Fx.unhover when indicatorTime is null', async () => {
  const { unhover } = await getPlotlyFxMocks()

  render(<LineChart {...props} indicatorTime={null} />)

  await waitFor(() => {
    expect(unhover).toHaveBeenCalled()
  })
})

test('does not call Fx.hover or Fx.unhover when indicatorTime is undefined', async () => {
  const { hover, unhover } = await getPlotlyFxMocks()

  render(<LineChart {...props} />)

  // Flush any pending microtasks (e.g. the lazy import promise chain).
  await act(async () => {})

  expect(hover).not.toHaveBeenCalled()
  expect(unhover).not.toHaveBeenCalled()
})
