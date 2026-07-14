import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import Plot, { PlotParams } from 'react-plotly.js'
import { DateTime } from 'luxon'
import { useResizeObserver } from '@mbari/utils'

export interface TimeSeriesDataPoint {
  value: number
  timestamp: number
}

export interface LineChartProps {
  className?: string
  style?: React.CSSProperties
  data?: TimeSeriesDataPoint[]
  name: string
  title?: string
  color?: string
  xAxisLabel?: string
  yAxisLabel?: string
  inverted?: boolean
  /** When provided, locks the x-axis to this [start, end] range (ms since epoch) */
  xAxisRange?: [number, number]
  onHover?: (millis?: number | null) => void
  /**
   * Opt-in Plotly uirevision key. When provided and unchanged across renders,
   * Plotly preserves user zoom/pan state. When it changes, Plotly resets zoom.
   * When omitted, Plotly's default behavior applies (zoom resets on every
   * data/layout update).
   */
  uirevision?: string
  /**
   * When provided, draws a vertical dashed cursor at this timestamp (ms since
   * epoch) so an external scrubber or map indicator can be reflected on the chart.
   */
  indicatorTime?: number | null
}

const LineChart: React.FC<LineChartProps> = ({
  className,
  style,
  data = [],
  name,
  title,
  color = '#17BECF',
  yAxisLabel,
  inverted,
  xAxisRange,
  onHover: handleHoverFromParent,
  uirevision,
  indicatorTime,
}) => {
  const container = useRef(null)
  const { size } = useResizeObserver({ element: container })
  // Parse the unit from yAxisLabel (e.g. "Depth (m)" → "m") so the tooltip
  // is correct for any variable, not just depth.
  const unitMatch = yAxisLabel?.match(/\(([^)]+)\)$/)
  const unit = unitMatch ? unitMatch[1] : ''
  // Track whether the user is actively hovering the chart so we suppress the
  // external indicator shape while the spike line is already tracking the cursor.
  const [chartHovered, setChartHovered] = useState(false)
  // Ref to the underlying Plotly graph div, captured via onInitialized.
  const graphDivRef = useRef<any>(null)

  // Memoize the O(n) trace arrays so they only recompute when data changes,
  // not on every indicatorTime update (which can fire at mouse-move frequency).
  const traceX = useMemo(
    () =>
      data.map(({ timestamp }) => DateTime.fromMillis(timestamp ?? 0).toISO()),
    [data]
  )
  const traceY = useMemo(() => data.map(({ value }) => value), [data])
  // Pre-compute UTC time per point for the tooltip. Done here (not inline) so
  // scrubber-driven indicatorTime changes don't redo O(n) Luxon conversions.
  const traceCustomData = useMemo(
    () =>
      data.map(({ timestamp }) =>
        DateTime.fromMillis(timestamp ?? 0)
          .toUTC()
          .toFormat('HH:mm')
      ),
    [data]
  )

  // When the scrubber/map drives indicatorTime, programmatically show the
  // Plotly tooltip at the nearest data point so the user sees the depth value
  // without having to hover the chart directly.
  useEffect(() => {
    const gd = graphDivRef.current
    if (!gd) return
    // When the user is hovering the chart, Plotly manages its own tooltip —
    // do not interfere.
    if (chartHovered) return
    if (indicatorTime == null || data.length === 0) {
      // Lazy-load Plotly inside the effect so its browser-global side-effects
      // don't run at module scope (SSR / Jest safe). The module is already in
      // the bundle via react-plotly.js, so this import resolves synchronously
      // from the module cache in practice.
      void import('plotly.js').then(({ default: PlotlyLib }) => {
        const PlotlyFx = (PlotlyLib as unknown as Record<string, any>).Fx
        try {
          PlotlyFx.unhover(gd)
        } catch {
          // ignore
        }
      })
      return
    }
    // Binary search for the data point whose timestamp is closest to indicatorTime.
    let lo = 0
    let hi = data.length - 1
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (data[mid].timestamp < indicatorTime) lo = mid + 1
      else hi = mid
    }
    if (
      lo > 0 &&
      Math.abs(data[lo - 1].timestamp - indicatorTime) <
        Math.abs(data[lo].timestamp - indicatorTime)
    ) {
      lo -= 1
    }
    void import('plotly.js').then(({ default: PlotlyLib }) => {
      const PlotlyFx = (PlotlyLib as unknown as Record<string, any>).Fx
      try {
        PlotlyFx.hover(gd, [{ curveNumber: 0, pointNumber: lo }])
      } catch {
        // Plotly may not be fully initialised yet — silently ignore.
      }
    })
  }, [indicatorTime, chartHovered, data])

  // React-Plotly.js doesn't support the 'modebar' property in it's typedefs, so we need to
  // pass this in anonymously as any.
  const modebarConfig: any = {
    modebar: {
      orientation: 'v',
    },
  }

  const handleHover: PlotParams['onHover'] = (e) => {
    setChartHovered(true)
    // Use the hovered point's original timestamp (UTC ms) rather than xvals[0],
    // which Plotly shifts by the local timezone offset when ISO strings include it.
    // pointNumber is the index within the trace data array (correct for non-transform traces).
    const pointNumber = e.points?.[0]?.pointNumber
    const originalTimestamp =
      pointNumber != null ? data[pointNumber]?.timestamp : undefined
    handleHoverFromParent?.(originalTimestamp ?? (e.xvals[0] as number))
  }

  const resetHover = () => {
    setChartHovered(false)
    handleHoverFromParent?.(null)
  }

  return (
    <div
      className={clsx('', className)}
      style={style}
      ref={container}
      onMouseLeave={resetHover}
    >
      {/* @ts-ignore */}
      <Plot
        data={[
          {
            x: traceX,
            y: traceY,
            type: 'scatter',
            mode: 'lines',
            name,
            line: { color },
            customdata: traceCustomData,
            hovertemplate: `<b>%{y:.1f}${
              unit ? ` ${unit}` : ''
            }</b>  %{x|%H:%M} local (%{customdata} UTC)<extra></extra>`,
          },
        ]}
        layout={{
          // Only set uirevision when the caller opts in. Without it Plotly
          // uses its default behavior (zoom resets on every re-render).
          // When provided and stable, Plotly preserves zoom/pan; when it
          // changes (e.g. time-window switch) Plotly resets the axes.
          ...(uirevision !== undefined && { uirevision }),
          hovermode: 'x',
          // Always show hover and spike — no distance threshold.
          hoverdistance: -1,
          spikedistance: -1,
          title: {
            text: title ? `<b>${title}</b>` : undefined,
            font: {
              family: 'Inter, sans-serif',
              size: 14,
              color: 'rgb(29, 78, 216)',
            },
            x: 0,
          },
          xaxis: {
            tickangle: 0,
            // Spike line tracks the cursor in real-time directly in Plotly
            // (no React render cycle lag). Used for the chart-hover direction.
            showspikes: true,
            spikemode: 'across',
            spikecolor: '#EF4444',
            spikethickness: 2,
            spikedash: 'dot',
            spikesnap: 'cursor',
            ...(xAxisRange && {
              range: [
                DateTime.fromMillis(xAxisRange[0]).toISO(),
                DateTime.fromMillis(xAxisRange[1]).toISO(),
              ],
              autorange: false,
            }),
          },
          yaxis: {
            title: yAxisLabel,
            autorange: inverted ? 'reversed' : undefined,
          },
          // Only show the external indicator shape when the user is NOT
          // hovering the chart — the spike line handles in-chart hover precisely.
          shapes:
            indicatorTime != null && !chartHovered
              ? [
                  {
                    type: 'line' as const,
                    xref: 'x' as const,
                    yref: 'paper' as const,
                    x0: DateTime.fromMillis(indicatorTime).toISO(),
                    x1: DateTime.fromMillis(indicatorTime).toISO(),
                    y0: 0,
                    y1: 1,
                    line: { color: '#EF4444', dash: 'dot', width: 2 },
                  },
                ]
              : [],
          annotations:
            indicatorTime != null && !chartHovered
              ? [
                  {
                    xref: 'x' as const,
                    yref: 'paper' as const,
                    x: DateTime.fromMillis(indicatorTime).toISO(),
                    y: 1,
                    text: DateTime.fromMillis(indicatorTime).toFormat('HH:mm'),
                    showarrow: false,
                    font: { color: '#EF4444', size: 10 },
                    xanchor: 'left' as const,
                    yanchor: 'bottom' as const,
                  },
                ]
              : [],
          width: size.width || undefined,
          height: size.height || undefined,
          margin: {
            t: title ? 28 : 0,
            b: 40,
            l: 50,
            r: 30,
          },
          showlegend: false,
          ...modebarConfig,
        }}
        config={{
          displaylogo: false,
        }}
        onInitialized={(_, gd) => {
          graphDivRef.current = gd
        }}
        onUpdate={(_, gd) => {
          graphDivRef.current = gd
        }}
        onHover={handleHover}
        onUnhover={resetHover}
      />
    </div>
  )
}

LineChart.displayName = 'Charts.LineChart'

export default LineChart
