import React, { useRef } from 'react'
import clsx from 'clsx'
import Plot from 'react-plotly.js'
import { DateTime } from 'luxon'
import { useResizeObserver } from '@mbari/utils'

export interface TimeSeriesDataPoint {
  value: number
  timestamp: number
}

export interface DepthChartProps {
  className?: string
  style?: React.CSSProperties
  data?: TimeSeriesDataPoint[]
  name: string
  title: string
  color?: string
  xAxisLabel?: string
  yAxisLabel?: string
}

const DepthChart: React.FC<DepthChartProps> = ({
  className,
  style,
  data = [],
  name,
  title,
  color = '#17BECF',
  xAxisLabel = 'Time',
  yAxisLabel = 'Depth (m)',
}) => {
  const container = useRef(null)
  const { size } = useResizeObserver({ element: container })
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
          title,
          xaxis: { title: xAxisLabel },
          yaxis: { title: yAxisLabel, autorange: 'reversed' },
          width: size.width,
          height: size.height,
          margin: {
            t: 0,
          },
        }}
      />
    </div>
  )
}

DepthChart.displayName = 'Charts.DepthChart'

export default DepthChart
