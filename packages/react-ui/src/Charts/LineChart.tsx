import React, { useRef } from 'react'
import clsx from 'clsx'
import Plot from 'react-plotly.js'
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

  return (
    <div className={clsx('', className)} style={style} ref={container}>
      <Plot
        data={[
          {
            x: data.map(({ timestamp }) =>
              DateTime.fromMillis(timestamp).toISO()
            ),
            y: data.map(({ value }) => value),
            type: 'scatter',
            mode: 'lines',
            name,
            line: { color },
          },
        ]}
        layout={{
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
          },
          yaxis: {
            title: yAxisLabel,
            autorange: inverted ? 'reversed' : undefined,
          },
          width: size.width,
          height: size.height,
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
      />
    </div>
  )
}

LineChart.displayName = 'Charts.LineChart'

export default LineChart
