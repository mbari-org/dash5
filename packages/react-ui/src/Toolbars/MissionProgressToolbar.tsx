import React from 'react'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { relative } from 'path'

export interface MissionProgressToolbarProps {
  className?: string
  style?: React.CSSProperties
  height: number
  width: number
  startTime: string
  endTime: string
  ticks: number
  ariaLabel: string
}

export const TickMark: React.FC<{ x: number; y: number; height: number }> = ({
  x,
  y,
  height,
}) => (
  <line
    x1={x}
    y1={y}
    x2={x}
    y2={y + height}
    stroke="black"
    stroke-width="2"
    stroke-linecap="round"
  />
)

export const Progress: React.FC<{
  x: number
  y: number
  width: number
  percent: number
}> = ({ x, y, width, percent }) => (
  <>
    <line
      x1={x}
      y1={y}
      x2={x + width * percent}
      y2={y}
      stroke="#111827"
      stroke-width="2"
    />
    <line
      x1={x + width * percent}
      y1={y}
      x2={x + width}
      y2={y}
      stroke="#111827"
      stroke-width="2"
      stroke-dasharray="4 4"
    />
  </>
)

export const MissionProgressEnd: React.FC<{
  x: number
  y: number
  height: number
  width: number
}> = ({ x, y, height, width }) => (
  <path
    x={x}
    y={y}
    d={`M${x} ${y} L${x + width} ${y + height / 2} L${x} ${y + height}`}
    stroke="#111827"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
)

export const Point: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <circle cx={x} cy={y} r="4" fill="black" stroke="black" stroke-width="2" />
)

export const MissionProgressToolbar: React.FC<MissionProgressToolbarProps> = ({
  className,
  height,
  width,
  ticks,
  ariaLabel,
  startTime,
  endTime,
}) => {
  const start = DateTime.fromISO(startTime)
  const end = DateTime.fromISO(endTime)
  const duration = end.diff(start, 'seconds').seconds
  const progress = end.diffNow('seconds').seconds / duration
  const tickHeight = height / 2
  const totalSegments = ticks + 1 // +1 for start and end which are not rendered
  return (
    <div className={clsx('', className)} aria-label={ariaLabel}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Point x={5} y={height / 2} />
        {[...Array(totalSegments)].map((_, i) => {
          if (i < 1 || i === totalSegments) return null
          const x = (width / totalSegments) * i
          const label = start
            .plus({ seconds: (duration * x) / width })
            .toRelative()
          console.log('relative', label)
          return (
            <TickMark
              key={`${ariaLabel}-tick-${i}`}
              x={x}
              y={height / 2 - tickHeight / 2}
              height={tickHeight}
            />
          )
        })}
        <Point x={width * 0.5} y={height / 2} />
        <Progress x={0} y={height / 2} width={width} percent={progress} />
        <MissionProgressEnd
          x={width - 7}
          y={height / 2 - 6}
          height={12}
          width={6}
        />
      </svg>
    </div>
  )
}

MissionProgressToolbar.displayName = 'Components.MissionProgressToolbar'
