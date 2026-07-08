import React, { useRef } from 'react'
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
}) => {
  const container = useRef(null)
  const { size } = useResizeObserver({ element: container })

  // React-Plotly.js doesn't support the 'modebar' property in it's typedefs, so we need to
  // pass this in anonymously as any.
  const modebarConfig: any = {
    modebar: {
      orientation: 'v',
    },
  }

  const handleHover: PlotParams['onHover'] = (e) => {
    handleHoverFromParent?.(e.xvals[0] as number)
  }

  const resetHover = () => {
    handleHoverFromParent?.(null)
  }

  return (
    <div
      className={clsx('', className)}
      style={style}
      ref={container}
      onMouseOut={resetHover}
    >
      {/* @ts-ignore */}
      <Plot
        data={[
          {
            x: data.map(({ timestamp }) =>
              DateTime.fromMillis(timestamp ?? 0).toISO()
            ),
            y: data.map(({ value }) => value),
            type: 'scatter',
            mode: 'lines',
            name,
            line: { color },
          },
        ]}
        layout={{
          // Only set uirevision when the caller opts in. Without it Plotly
          // uses its default behavior (zoom resets on every re-render).
          // When provided and stable, Plotly preserves zoom/pan; when it
          // changes (e.g. time-window switch) Plotly resets the axes.
          ...(uirevision !== undefined && { uirevision }),
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
        onHover={handleHover}
      />
    </div>
  )
}

LineChart.displayName = 'Charts.LineChart'

export default LineChart
