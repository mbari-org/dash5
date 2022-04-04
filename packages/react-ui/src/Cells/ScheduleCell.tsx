import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faEllipsisV,
  faCheck,
  faTimes,
} from '@fortawesome/pro-regular-svg-icons'
import { faSync } from '@fortawesome/pro-light-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface ScheduleCellProps {
  className?: string
  style?: React.CSSProperties
  status: 'scheduled' | 'running' | 'ended' | 'executed' | 'paused'
  label: string
  ariaLabel?: string
  secondary: string
  name: string
  description: string
  description2?: string
  description3?: string
  onOption: () => void
}

const styles = {
  container: 'flex font-display',
  icon: 'flex items-center px-4',
  labelContainer: 'flex flex-grow flex-col p-2',
  text: 'text-stone-500, opacity-60',
  textLight: 'text-stone-500, opacity-40',
  descriptionContainer: 'flex flex-col justify-center pr-8 pl-4',
  option: 'flex items-center px-4',
  open: 'font-semibold',
  closed: 'opacity-60',
}

const icons: { [key: string]: IconProp } = {
  scheduled: faClock as IconProp,
  running: faSync as IconProp,
  ended: faTimes as IconProp,
  executed: faCheck as IconProp,
  paused: faClock as IconProp,
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({
  className,
  status,
  label,
  ariaLabel,
  secondary,
  name,
  description,
  description2,
  description3,
  onOption,
  ...props
}) => {
  const backgroundColor = (() => {
    if (status === 'running') return 'bg-indigo-200'
    if (status === 'paused') return 'bg-orange-100'
    return 'bg-white'
  })()

  const isOpen = (() => {
    return status === 'scheduled' || status === 'running' || status === 'paused'
  })()

  const iconColor = (() => {
    if (status === 'running') return 'black'
    if (status === 'paused') return 'text-orange-400'
    return styles.text
  })()

  const labelColor = (() => {
    if (status === 'paused') return 'text-orange-400'
    if (status === 'executed') return 'text-teal-600'
    return 'text-primary-600'
  })()

  return (
    <div
      className={clsx(styles.container, className, backgroundColor)}
      aria-label={ariaLabel || ''}
    >
      <button className={styles.icon}>
        <FontAwesomeIcon
          icon={icons[status]}
          title={status}
          className={clsx(iconColor, 'text-xl')}
        />
      </button>
      <div className={styles.labelContainer}>
        <button
          className={clsx(
            'flex',
            labelColor,
            isOpen ? styles.open : styles.closed
          )}
        >
          {label}
        </button>
        <div className={isOpen ? styles.text : styles.textLight}>
          <div className="italic">{secondary}</div>
          <div>{name}</div>
        </div>
      </div>
      <div
        className={clsx(
          styles.descriptionContainer,
          styles.text,
          isOpen ? styles.text : styles.textLight
        )}
      >
        <div>{description}</div>
        {description2 && <div>{description2}</div>}
        {description3 && <div>{description3}</div>}
      </div>
      <button className={styles.option} onClick={swallow(onOption)}>
        <FontAwesomeIcon icon={faEllipsisV as IconProp} className="text-2xl" />
      </button>
    </div>
  )
}

ScheduleCell.displayName = 'Components.ScheduleCell'
