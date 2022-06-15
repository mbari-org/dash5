import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons'
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
  button: 'flex items-center border border-stone-200 p-2',
  container: 'bg-white flex w-full',
  label: 'text-gray-700 text-md underline',
  secondary: 'text-gray-500 text-md px-4',
  color: 'rounded-full h-6 w-6 my-auto mr-2',
  icon: 'ml-auto my-auto mr-2',
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
        <FontAwesomeIcon icon={faChevronDown} className={styles.icon} />
      </button>
    </div>
  )
}

VehicleHeader.displayName = 'Navigation.VehicleHeader'
