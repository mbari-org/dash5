import React, { useRef } from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faEllipsisV,
  faCheck,
  faTimes,
  faPauseCircle,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { IconButton } from '../Navigation'

export type ScheduleCellStatus =
  | 'pending'
  | 'running'
  | 'cancelled'
  | 'completed'
  | 'paused'
export type ScheduledCommandType = 'command' | 'mission'
export interface ScheduleCellProps {
  className?: string
  style?: React.CSSProperties
  status: ScheduleCellStatus
  scheduleStatus?: 'paused' | 'running'
  label: string
  ariaLabel?: string
  secondary: string
  name: string
  eventId: number
  commandType: ScheduledCommandType
  description: string
  description2?: string
  description3?: string
  onSelect: () => void
  onMoreClick: (
    id: {
      eventId?: number
      commandType: ScheduledCommandType
      status: ScheduleCellStatus
    },
    rect?: DOMRect
  ) => void
}

const styles = {
  container: 'flex font-display items-center text-sm',
  icon: 'flex px-4',
  detailsContainer: 'flex flex-grow flex-col p-4',
  text: 'text-stone-500 opacity-90',
  textLight: 'text-stone-500 opacity-60',
  descriptionContainer: 'flex flex-col pr-10 pl-4',
  open: 'font-semibold',
  closed: 'opacity-60',
}

const icons: { [key: string]: IconProp } = {
  pending: faClock as IconProp,
  running: faSync as IconProp,
  cancelled: faTimes as IconProp,
  completed: faCheck as IconProp,
  paused: faPauseCircle as IconProp,
}

export const ScheduleCellBackgrounds = {
  running: 'bg-violet-50 hover:bg-violet-100',
  paused: 'bg-orange-50 hover:bg-orange-100',
  default: 'bg-white hover:bg-stone-50',
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
  eventId,
  commandType,
  onSelect,
  onMoreClick,
  scheduleStatus,
}) => {
  const moreButtonRef = useRef<HTMLDivElement | null>(null)

  const backgroundColor = (() => {
    if (scheduleStatus === 'running') return ScheduleCellBackgrounds.running
    if (scheduleStatus === 'paused') return ScheduleCellBackgrounds.paused
    return ScheduleCellBackgrounds.default
  })()

  const isOpen = (() => {
    return status === 'pending' || status === 'running' || status === 'paused'
  })()

  const iconColor = (() => {
    if (scheduleStatus === 'running') return 'black'
    if (scheduleStatus === 'paused') return 'text-orange-400'
    return styles.text
  })()

  const labelColor = (() => {
    if (scheduleStatus === 'paused') return 'text-orange-400'
    if (status === 'completed') return 'text-teal-600'
    return 'text-primary-600'
  })()

  const handleMoreClick = () => {
    onMoreClick(
      { eventId, commandType, status },
      moreButtonRef.current?.getBoundingClientRect()
    )
  }

  return (
    <article
      className={clsx(styles.container, className, backgroundColor)}
      aria-label={ariaLabel || ''}
    >
      <button
        className="grid flex-grow grid-cols-9 items-center"
        onClick={swallow(onSelect)}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon
            icon={icons[status]}
            title={status}
            className={clsx(iconColor, 'text-xl')}
          />
        </div>
        <ul className={clsx(styles.detailsContainer, 'col-span-4')}>
          <li
            className={clsx(
              'flex truncate',
              labelColor,
              isOpen ? styles.open : styles.closed
            )}
          >
            {label}
          </li>
          <li
            className={clsx(
              'flex truncate italic',
              isOpen ? styles.text : styles.textLight
            )}
          >
            {secondary}
          </li>
          <li
            className={clsx(
              'flex truncate',
              isOpen ? styles.text : styles.textLight
            )}
          >
            {name}
          </li>
        </ul>
        <ul
          className={clsx(
            styles.descriptionContainer,
            isOpen ? styles.text : styles.textLight,
            'col-span-4'
          )}
        >
          <li className="flex truncate">{description}</li>
          {description2 && <li className="flex truncate">{description2}</li>}
          {description3 && <li className="flex truncate">{description3}</li>}
        </ul>
      </button>
      <div className="flex" ref={moreButtonRef}>
        <IconButton
          icon={faEllipsisV}
          ariaLabel="More options"
          onClick={handleMoreClick}
          className="my-auto"
          size="text-2xl"
        />
      </div>
    </article>
  )
}

ScheduleCell.displayName = 'Components.ScheduleCell'
