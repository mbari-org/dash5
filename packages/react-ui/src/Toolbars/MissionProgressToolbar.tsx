import React, { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { useResizeObserver } from '@mbari/utils'
import { Tick } from './MissionProgress/Tick'
import { Progress } from './MissionProgress/Progress'
import { End } from './MissionProgress/End'
import { Point } from './MissionProgress/Point'

const styles = {
  container: 'flex py-2',
  toolbar: 'flex-grow mx-4 my-auto h-9 overflow-hidden cursor-pointer',
  title: 'flex-shrink-0 text-md font-display my-auto mx-4',
}

export interface MissionProgressToolbarProps {
  className?: string
  style?: React.CSSProperties
  startTime: string
  endTime: string
  ticks: number
  ariaLabel: string
}

export const MissionProgressToolbar: React.FC<MissionProgressToolbarProps> = ({
  className,
  ticks,
  ariaLabel,
  startTime,
  endTime,
}) => {
  const container = useRef(null as HTMLDivElement | null)
  const {
    size: { height: containerHeight, width: containerWidth },
  } = useResizeObserver({ element: container, wait: 100 })
  const start = DateTime.fromISO(startTime)
  const end = DateTime.fromISO(endTime)
  const duration = end.diff(start, 'seconds').seconds
  const progress = Math.max(0, -start.diffNow('seconds').seconds / duration)
  const tickHeight = 9
  const totalSegments = ticks + 1 // +1 for start and end which are not rendered
  const height = containerHeight || 20
  const width = containerWidth || 100
  const missionInProgress = progress > 0 && progress < 1

  const [hoverProgress, setHoverProgress] = useState(null as null | number)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const x =
        e.clientX - (container?.current?.getBoundingClientRect?.().left ?? 0)
      setHoverProgress(x / containerWidth)
    },
    [container, setHoverProgress, containerWidth]
  )

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleMouseOver = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
  }, [timeout])
  const handleMouseOut = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    timeout.current = setTimeout(() => setHoverProgress(null), 250)
  }, [timeout])

  return (
    <div className={clsx(styles.container, className)} aria-label={ariaLabel}>
      <h3 className={styles.title}>Timeline</h3>
      <div
        ref={container}
        className={styles.toolbar}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {height > 0 && width > 0 && (
          <svg
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseMove={handleMouseMove}
          >
            <Point x={5} y={height / 2} label="Launch" />
            {[...Array(totalSegments)].map((_, i) => {
              if (i < 1 || i === totalSegments) return null
              const x = (width / totalSegments) * i
              const diff = start
                .plus({ seconds: (duration * x) / width })
                .diffNow(['hours', 'days', 'minutes'])
              const days = Math.abs(diff.days + Math.round(diff.hours / 24))
              const hours = Math.abs(Math.round(diff.hours))
              const label = days >= 1 ? `${days}d` : `${hours}h`
              const tickId = `${ariaLabel}-tick-${i}-${label}`

              return (
                <Tick
                  key={tickId}
                  ariaLabel={tickId}
                  x={x}
                  y={height / 2 - tickHeight / 2}
                  height={tickHeight}
                  label={label as string}
                />
              )
            })}
            {missionInProgress && (
              <Point x={width * progress} y={height / 2} label="Projected" />
            )}
            {hoverProgress && (
              <Point
                x={width * hoverProgress}
                y={height / 2}
                label={start
                  .plus({ seconds: hoverProgress * duration })
                  .toFormat('MMM d, h:mm a')}
                highlight
              />
            )}
            <Progress x={0} y={height / 2} width={width} percent={progress} />
            <End x={width - 7} y={height / 2 - 6} height={12} width={6} />
          </svg>
        )}
      </div>
    </div>
  )
}

MissionProgressToolbar.displayName = 'Components.MissionProgressToolbar'
