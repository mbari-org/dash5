import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { DateTime } from 'luxon'
import { PluggedInIcon } from '../Icons/PluggedInIcon'
import { SurfacedIcon } from '../Icons/SurfacedIcon'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'

export interface VehicleInfoCellProps {
  className?: string
  style?: React.CSSProperties
  isPluggedIn?: boolean
  isReachable?: boolean
  lastCommsTime?: DateTime | null
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
  lastCommsTime,
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

  // Compute subtitle based on state
  const subtitle = isPluggedIn ? 'Plugged in' : 'Last comms over satellite'

  // Format last comms time if available and not plugged in
  const lastCommsOverSat =
    isPluggedIn || !lastCommsTime
      ? undefined
      : `${
          lastCommsTime.day === DateTime.now().day
            ? 'Today'
            : lastCommsTime.toFormat('MMM d')
        } at ${lastCommsTime.toFormat(
          'hh:mm:ss'
        )} (${lastCommsTime.toRelative()})`

  // Format estimate if available and not plugged in
  const estimate =
    isPluggedIn || !nextCommsTime
      ? undefined
      : `Est. to surface in ${nextCommsTime.toRelative()} at ~${nextCommsTime.toFormat(
          'hh:mm'
        )}`

  // Format last plugged in time if available and plugged in
  const lastPluggedIn =
    !isPluggedIn || !lastPluggedInTime
      ? undefined
      : `${
          lastPluggedInTime.day === DateTime.now().day
            ? 'Today'
            : lastPluggedInTime.toFormat('MMM d')
        } at ${lastPluggedInTime.toFormat(
          'hh:mm:ss'
        )} (${lastPluggedInTime.toRelative()})`

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
            {lastCommsOverSat && (
              <li className="pb-1">
                <span className="mr-1">Last comms over sat:</span>
                {lastCommsOverSat}
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
