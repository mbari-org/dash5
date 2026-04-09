import React, { useRef } from 'react'
import clsx from 'clsx'
import Tippy from '@tippyjs/react'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEllipsisV,
  faCheck,
  faTimes,
  faPauseCircle,
  faPersonRunning,
  faStarOfLife,
  faPaperPlane,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { IconButton } from '../Navigation'
import { CommandType } from '../types'
export type ScheduleCellStatus =
  | 'pending'
  | 'running'
  | 'cancelled'
  | 'completed'
  | 'paused'
  | 'sent'
  | 'ack'
  | 'timeout'
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
  commandType: CommandType
  description: string
  description2?: string
  description3?: string
  badge?: { text: string; tooltip?: string }
  onSelect: () => void
  onMoreClick: (
    id: {
      eventId?: number
      commandType: CommandType
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
  open: '',
  closed: 'opacity-60',
}

const icons: { [key: string]: IconProp } = {
  pending: faClock as IconProp,
  running: faPersonRunning as IconProp,
  cancelled: faTimes as IconProp,
  completed: faCheck as IconProp,
  paused: faPauseCircle as IconProp,
  sent: faPaperPlane as IconProp,
  ack: faPaperPlane as IconProp,
  timeout: faExclamationTriangle as IconProp,
}

export const ScheduleCellBackgrounds = {
  running: 'bg-blue-50 hover:bg-stone-50',
  paused: 'bg-white hover:bg-stone-50',
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
  badge,
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
    if (status === 'running') return 'text-primary-600'
    return 'text-teal-600'
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
              'flex items-center gap-1 truncate',
              labelColor,
              isOpen ? styles.open : styles.closed
            )}
          >
            <span className="truncate">{label}</span>
            {badge && (
              <Tippy
                content={badge.tooltip ?? badge.text}
                placement="top"
                disabled={!badge.tooltip && !badge.text}
              >
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-300">
                  <FontAwesomeIcon icon={faStarOfLife} className="text-xs" />
                </span>
              </Tippy>
            )}
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
