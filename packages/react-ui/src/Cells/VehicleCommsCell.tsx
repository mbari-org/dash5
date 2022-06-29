import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'

export interface VehicleCommsCellProps {
  className?: string
  style?: React.CSSProperties
  icon: JSX.Element
  headline: string
  host?: string
  lastPing?: string
  nextComms?: string
  onSelect?: () => void
}

const styles = {
  container:
    'bg-white font-display rounded-md drop-shadow-lg border-2 border-solid border-stone-300 pb-2',
  info: 'pl-2 pb-1 opacity-60 text-sm',
  button: 'w-full text-left',
}

export const VehicleCommsCell: React.FC<VehicleCommsCellProps> = ({
  className,
  style,
  icon,
  headline,
  host,
  lastPing,
  nextComms,
  onSelect,
}) => {
  return (
    <article className={clsx(styles.container, className)} style={style}>
      <button className={styles.button} onClick={swallow(onSelect)}>
        <ul className="p-4">
          <li className="flex p-2">
            <span className="mr-2">{icon}</span>
            <span>{headline}</span>
          </li>
          {host && (
            <li className={styles.info}>
              <span className="mr-1">Host:</span>
              <span>{host}</span>
            </li>
          )}
          {lastPing && (
            <li className={styles.info}>
              <span className="mr-1">Last ping:</span>
              <span>{lastPing}</span>
            </li>
          )}
          {nextComms && (
            <li className={styles.info}>
              <span className="mr-1">Next Comms:</span>
              <span>{nextComms}</span>
            </li>
          )}
        </ul>
      </button>
    </article>
  )
}

VehicleCommsCell.displayName = 'Cells.VehicleCommsCell'
