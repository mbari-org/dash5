import React from 'react'
import clsx from 'clsx'
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
  secondary: string
  name: string
  description: string
  description2?: string
  description3?: string
}

const styles = {
  container: 'flex font-display',
  icon: 'flex items-center px-4',
  labelContainer: 'flex flex-grow flex-col p-2',
  label: 'flex text-blue-700', // needs updated colors
  infoText: 'text-stone-500 opacity-60',
  descriptionContainer: 'flex flex-col justify-center pr-8 pl-4',
  options: 'flex items-center px-4',
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
  secondary,
  name,
  description,
  description2,
  description3,
  ...props
}) => {
  const backgroundColor = (() => {
    if (status === 'running') return 'bg-indigo-400' // needs updated colors
    if (status === 'paused') return 'bg-red-600' // needs updated colors
    return 'bg-white'
  })()

  const isOpen = (() => {
    return status === 'scheduled' || status === 'running' || status === 'paused'
  })()

  const iconColor = (() => {
    if (status === 'running') return 'black'
    if (status === 'paused') return styles.label
    return styles.infoText
  })()

  return (
    <div className={clsx(styles.container, className, backgroundColor)}>
      <button className={styles.icon}>
        <FontAwesomeIcon
          icon={icons[status]}
          title="clock icon"
          className={clsx(iconColor, 'text-2xl')}
        />
      </button>
      <div className={styles.labelContainer}>
        <button
          className={clsx(styles.label, isOpen ? styles.open : styles.closed)}
        >
          {label}
        </button>
        <div className={clsx(styles.infoText, 'italic')}>{secondary}</div>
        <div className={styles.infoText}>{name}</div>
      </div>
      <div className={styles.descriptionContainer}>
        <div className={styles.infoText}>{description}</div>
        {description2 && <div className={styles.infoText}>{description2}</div>}
        {description3 && <div className={styles.infoText}>{description3}</div>}
      </div>
      <button className={styles.options}>
        <FontAwesomeIcon icon={faEllipsisV as IconProp} className="text-2xl" />
      </button>
    </div>
  )
}

ScheduleCell.displayName = 'Components.ScheduleCell'
