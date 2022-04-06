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
import { IconButton } from '../Navigation'

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
  onSelect: () => void
  onSelectMore: () => void
}

const styles = {
  container: 'flex font-display items-center',
  icon: 'flex px-4',
  detailsContainer: 'flex flex-grow flex-col p-4',
  text: 'text-stone-500 opacity-90',
  textLight: 'text-stone-500 opacity-60',
  descriptionContainer: 'flex flex-col pr-10 pl-4',
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
  onSelect,
  onSelectMore,
}) => {
  const backgroundColor = (() => {
    if (status === 'running') return 'bg-violet-100'
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
    <article
      className={clsx(styles.container, className, backgroundColor)}
      aria-label={ariaLabel || ''}
      onClick={swallow(onSelect)}
    >
      <button
        className="flex flex-grow items-center"
        onClick={swallow(onSelect)}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon
            icon={icons[status]}
            title={status}
            className={clsx(iconColor, 'text-xl')}
          />
        </div>
        <ul className={styles.detailsContainer}>
          <li
            className={clsx(
              'flex',
              labelColor,
              isOpen ? styles.open : styles.closed
            )}
          >
            {label}
          </li>
          <li
            className={clsx(
              'flex italic',
              isOpen ? styles.text : styles.textLight
            )}
          >
            {secondary}
          </li>
          <li className={clsx('flex', isOpen ? styles.text : styles.textLight)}>
            {name}
          </li>
        </ul>
        <ul
          className={clsx(
            styles.descriptionContainer,
            isOpen ? styles.text : styles.textLight
          )}
        >
          <li className="flex">{description}</li>
          {description2 && <li className="flex">{description2}</li>}
          {description3 && <li className="flex">{description3}</li>}
        </ul>
      </button>
      <IconButton
        icon={faEllipsisV}
        ariaLabel={'More options'}
        onClick={onSelectMore}
        className={'my-auto pl-4'}
        size={'text-2xl'}
      />
    </article>
  )
}

ScheduleCell.displayName = 'Components.ScheduleCell'
