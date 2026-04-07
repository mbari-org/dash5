import React from 'react'
import clsx from 'clsx'
import { swallow, formatCompactDuration } from '@mbari/utils'
import { DateTime } from 'luxon'
import { PluggedInIcon } from '../Icons/PluggedInIcon'
import { SurfacedIcon } from '../Icons/SurfacedIcon'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'

export interface VehicleInfoCellProps {
  className?: string
  style?: React.CSSProperties
  isPluggedIn?: boolean
  isReachable?: boolean
  lastSatCommsTime?: DateTime | null
  lastCellCommsTime?: DateTime | null
  nextCommsTime?: DateTime | null
  lastPluggedInTime?: DateTime | null
  onSelect?: () => void
}

const styles = {
  container:
    'rounded-md border-2 border-solid border-stone-300 bg-white font-display drop-shadow-lg p-4',
  content: 'opacity-60 text-sm',
  button: 'w-full pl-2 text-left',
  subtitle: 'font-sans text-xs font-light text-left',
  topHalf: 'flex items-center p-2',
}

export const VehicleInfoCell: React.FC<VehicleInfoCellProps> = ({
  className,
  style,
  isPluggedIn,
  isReachable,
  lastSatCommsTime,
  lastCellCommsTime,
  nextCommsTime,
  lastPluggedInTime,
  onSelect,
}) => {
  // Compute icon based on plugged in state or reachability
  const icon = isPluggedIn ? (
    <PluggedInIcon />
  ) : isReachable ? (
    <SurfacedIcon />
  ) : (
    <UnderwaterIcon />
  )

  // Compute headline based on state
  const headline = isPluggedIn
    ? 'Vehicle is docked'
    : isReachable
    ? 'Likely surfaced'
    : 'Likely underwater'

  // Determine most recent comms type
  const mostRecentCommsType: 'sat' | 'cell' | null = (() => {
    if (lastSatCommsTime && lastCellCommsTime) {
      return lastSatCommsTime.toMillis() >= lastCellCommsTime.toMillis()
        ? 'sat'
        : 'cell'
    }
    if (lastSatCommsTime) return 'sat'
    if (lastCellCommsTime) return 'cell'
    return null
  })()

  const subtitle = isPluggedIn
    ? 'Plugged in'
    : mostRecentCommsType === 'cell'
    ? 'Last comms over cell'
    : 'Last comms over satellite'

  const lastSatFormatted =
    isPluggedIn || !lastSatCommsTime
      ? undefined
      : `${
          lastSatCommsTime.day === DateTime.now().day
            ? 'Today'
            : lastSatCommsTime.toFormat('MMM d')
        } at ${lastSatCommsTime.toFormat('hh:mm:ss')} (${formatCompactDuration(
          lastSatCommsTime,
          DateTime.now(),
          { maxDays: 6 }
        )})`

  const lastCellFormatted =
    isPluggedIn || !lastCellCommsTime
      ? undefined
      : `${
          lastCellCommsTime.day === DateTime.now().day
            ? 'Today'
            : lastCellCommsTime.toFormat('MMM d')
        } at ${lastCellCommsTime.toFormat('hh:mm:ss')} (${formatCompactDuration(
          lastCellCommsTime,
          DateTime.now(),
          { maxDays: 6 }
        )})`

  // Format estimate if available and not plugged in
  const isFutureEstimate = nextCommsTime
    ? nextCommsTime.toMillis() > DateTime.now().toMillis()
    : false
  const estimateDuration = nextCommsTime
    ? formatCompactDuration(nextCommsTime, DateTime.now(), { maxDays: 6 })
    : ''
  const estimate =
    isPluggedIn || !nextCommsTime
      ? undefined
      : `Est. to surface ${isFutureEstimate ? 'in ' : ''}${estimateDuration}${
          isFutureEstimate ? '' : ' ago'
        } at ~${nextCommsTime.toFormat('hh:mm')}`

  // Format last plugged in time if available and plugged in
  const lastPluggedIn =
    !isPluggedIn || !lastPluggedInTime
      ? undefined
      : `${
          lastPluggedInTime.day === DateTime.now().day
            ? 'Today'
            : lastPluggedInTime.toFormat('MMM d')
        } at ${lastPluggedInTime.toFormat('hh:mm:ss')} (${formatCompactDuration(
          lastPluggedInTime,
          DateTime.now(),
          { maxDays: 6 }
        )})`

  return (
    <article className={clsx(styles.container, className)} style={style}>
      <button className={styles.button} onClick={swallow(onSelect)}>
        <section className={styles.topHalf}>
          <span className="pr-6">{icon}</span>
          <ul>
            <li>{headline}</li>
            {subtitle && (
              <li className={clsx(styles.content, styles.subtitle)}>
                {subtitle}
              </li>
            )}
          </ul>
        </section>
        <section>
          <ul className={clsx(styles.content)}>
            {lastSatFormatted && (
              <li className="pb-1">
                <span className="mr-1">Last comms over sat:</span>
                {lastSatFormatted}
              </li>
            )}
            {lastCellFormatted && (
              <li className="pb-1">
                <span className="mr-1">Last comms over cell:</span>
                {lastCellFormatted}
              </li>
            )}

            {lastPluggedIn && (
              <li className="pb-1">
                <span className="mr-1">Last plugged in:</span>
                {lastPluggedIn}
              </li>
            )}

            {estimate && <li aria-label={'time estimate'}>{estimate}</li>}
          </ul>
        </section>
      </button>
    </article>
  )
}

VehicleInfoCell.displayName = 'Cells.VehicleInfoCell'
