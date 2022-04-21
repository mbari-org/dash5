import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { swallow } from '@mbari/utils'
import { AcknowledgeIcon } from '../Icons/AcknowledgeIcon'

export interface CommsCellProps {
  className?: string
  style?: React.CSSProperties
  command: string
  entry: string
  name?: string
  description?: string
  day: string
  time: string
  isUpload: boolean
  isScheduled: boolean
  onSelect: () => void
}

const styles = {
  container: 'flex items-center bg-white p-4 font-display',
  detailsContainer: 'flex flex-grow flex-col pl-1',
  command: 'whitespace-pre-line font-mono',
  icon: 'px-6 text-2xl opacity-60',
  description: 'flex flex-grow flex-col p-2 opacity-60',
  buttonWrapper: 'flex w-full items-center text-left',
}

export const CommsCell: React.FC<CommsCellProps> = ({
  className,
  style,
  command,
  entry,
  name,
  description,
  day,
  time,
  isUpload,
  isScheduled,
  onSelect,
}) => {
  const regFontEntry = entry.slice(0, -3)
  const boldFontEntry = entry.slice(-3)
  return (
    <article
      style={style}
      className={clsx(styles.container, className)}
      onClick={swallow(onSelect)}
    >
      <button className={styles.buttonWrapper}>
        <ul className={styles.detailsContainer}>
          <li
            className={clsx(
              styles.command,
              isScheduled ? 'text-indigo-600' : 'text-green-600'
            )}
            aria-label="command text"
          >
            {command}
          </li>
          <li aria-label="entry name and number">
            {regFontEntry}
            <strong>{boldFontEntry}</strong>
          </li>
          <li className="opacity-60" aria-label="owner name">
            {name}
          </li>
        </ul>
        <div className={styles.icon}>
          {isUpload ? (
            <FontAwesomeIcon
              icon={faBuilding as IconProp}
              aria-label="transmitting icon"
            />
          ) : (
            <AcknowledgeIcon />
          )}
        </div>

        <ul className={styles.description}>
          <li aria-label="action description">{description}</li>
          <li>
            <span aria-label="day">{day}</span>{' '}
            <span aria-label="time">{time}</span>
          </li>
        </ul>
      </button>
    </article>
  )
}

CommsCell.displayName = 'Components.CommsCell'
