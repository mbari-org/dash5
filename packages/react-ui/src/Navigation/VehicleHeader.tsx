import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronLeft,
} from '@fortawesome/pro-regular-svg-icons'
import { DateTime } from 'luxon'

export interface VehicleHeaderProps {
  className?: string
  style?: React.CSSProperties
  name: string
  deployment: string
  color: string
  onToggle: () => void
  open?: boolean
  deployedAt?: number
}

const styles = {
  button: 'flex p-2 w-full text-left items-center',
  container: 'bg-white flex w-full',
  label: 'text-gray-700 text-md underline truncate',
  secondary: 'text-gray-500 text-sm italic mx-2 flex-shrink truncate',
  color: 'rounded-full h-6 w-6 my-auto mr-2 flex-shrink-0',
  icon: 'ml-auto my-auto flex-grow-0 mr-2 flex-shrink-0',
}

export const VehicleHeader: React.FC<VehicleHeaderProps> = ({
  className,
  style,
  name,
  color,
  deployment,
  onToggle,
  open,
  deployedAt,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <button
        className={styles.button}
        style={open ? { borderBottom: 0 } : undefined}
        onClick={onToggle}
        data-testid="vehicleHeaderButton"
      >
        <span
          className={styles.color}
          style={{ backgroundColor: color }}
          data-testid="color"
        />
        <span className={styles.label}>
          {name}: {deployment}
        </span>
        {deployedAt ? (
          <span className={styles.secondary}>
            began {DateTime.fromSeconds(deployedAt).toRelative()}
          </span>
        ) : null}
        <FontAwesomeIcon
          icon={open ? faChevronDown : faChevronLeft}
          className={styles.icon}
        />
      </button>
    </div>
  )
}

VehicleHeader.displayName = 'Navigation.VehicleHeader'
